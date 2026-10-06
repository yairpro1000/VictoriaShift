begin;

alter table private.protocol_shares add column password_hash text,
  add column failed_attempts integer not null default 0,
  add column locked_until timestamptz;
-- Email-only links must be reissued with a password by the manager.
update private.protocol_shares set revoked_at=coalesce(revoked_at,now());
create table private.protocol_share_sessions (
  token_hash text primary key,
  share_id uuid not null references private.protocol_shares(id) on delete cascade,
  expires_at timestamptz not null default (now()+interval '24 hours')
);
create index protocol_share_sessions_share_idx on private.protocol_share_sessions(share_id);
alter table private.protocol_share_sessions enable row level security;
revoke all on private.protocol_share_sessions from public,anon,authenticated;

-- These private definers deliberately support recipients without auth.uid().
-- The link + password exchange is the authentication boundary; every RLS request
-- requires its independently generated session secret, tied to that exact link.
create or replace function private.check_protocol_share() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare
  token text := private.share_token();
  session_token text := nullif(current_setting('request.headers',true),'')::jsonb->>'x-protocol-session';
  invitation private.protocol_shares%rowtype;
  reason text;
begin
  raise log '%',json_build_object('event','share_access_attempt','method','share_password_session','share_header_present',token is not null,'session_present',session_token is not null);
  if token is null or token !~ '^[0-9a-f]{64}$' then reason := 'invalid_link';
  else
    select * into invitation from private.protocol_shares
      where token_hash=encode(extensions.digest(token,'sha256'),'hex') and revoked_at is null and password_hash is not null;
    if not found then reason := 'invalid_or_revoked_link';
    elsif session_token is null or session_token !~ '^[0-9a-f]{64}$' then reason := 'share_password_required';
    elsif not exists(select 1 from private.protocol_share_sessions s where s.share_id=invitation.id
      and s.token_hash=encode(extensions.digest(session_token,'sha256'),'hex') and s.expires_at>now())
      then reason := 'share_session_expired';
    end if;
  end if;
  raise log '%',json_build_object('event','share_access_result','branch',case when reason is null then 'password_session_allowed' else 'denied' end,'reason',reason);
  if reason is not null then
    return jsonb_build_object('ok',false,'data',null,'error',jsonb_build_object('code',reason,'message',
      case when reason='share_password_required' then 'Enter the authorized email and share password.'
      when reason='share_session_expired' then 'Your shared session has expired. Enter the email and password again.'
      else 'This share link is invalid or has been replaced. Ask the manager for a new link.' end));
  end if;
  return jsonb_build_object('ok',true,'data',jsonb_build_object('protocol_id',invitation.protocol_id,
    'department_id',(select department_id from public.protocols where id=invitation.protocol_id)),'error',null);
end $$;

create or replace function private.create_protocol_share(protocol text,email text) returns jsonb
language plpgsql security invoker set search_path='' as $$
begin
  raise log '%',json_build_object('event','share_create_denied','reason','password_required','method','legacy_email_share');
  return private.share_failure('password_required','Reload the app and set a password when creating a share link.',422);
end $$;

create function private.create_protocol_share(protocol text,email text,password text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  protocol_uuid uuid;
  owner uuid;
  token text;
  recipient text := lower(trim(email));
  replaced integer;
begin
  raise log '%',json_build_object('event','share_create_attempt','method','password','user_id',auth.uid(),'share_scope',private.share_token() is not null,'password_present',password is not null);
  if private.share_token() is not null then
    raise log '%',json_build_object('event','share_create_denied','reason','recipient_cannot_reshare');
    return private.share_failure('recipient_cannot_reshare','Only the protocol manager can generate share links.',403);
  end if;
  if protocol is null or protocol !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    or recipient is null or length(recipient)>254 or recipient !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or password is null or length(password)<8 or octet_length(password)>72 then
    raise log '%',json_build_object('event','share_create_denied','reason','invalid_protocol_email_or_password');
    return private.share_failure('invalid_input','Choose a protocol, a valid email, and a password of at least 8 characters (up to 72 bytes).',422);
  end if;
  protocol_uuid := protocol::uuid;
  -- Serialize replacements for a protocol, including concurrent first shares.
  select d.user_id into owner from public.protocols p join public.departments d on d.id=p.department_id
    where p.id=protocol_uuid for update of p;
  if not found or owner is distinct from auth.uid() then
    raise log '%',json_build_object('event','share_create_denied','reason','protocol_missing_or_not_owner');
    return private.share_failure('not_protocol_manager','This protocol is unavailable or belongs to another user.',403);
  end if;
  raise log '%',json_build_object('event','share_create_authorized','branch',case when owner is null then 'existing_public_manager' else 'owner' end,'protocol_id',protocol_uuid);
  update private.protocol_shares set revoked_at=now() where protocol_id=protocol_uuid and recipient_email=recipient and revoked_at is null;
  get diagnostics replaced=row_count;
  token := encode(extensions.gen_random_bytes(32),'hex');
  insert into private.protocol_shares(protocol_id,recipient_email,token_hash,created_by,password_hash)
    values(protocol_uuid,recipient,encode(extensions.digest(token,'sha256'),'hex'),auth.uid(),extensions.crypt(password,extensions.gen_salt('bf',10)));
  raise log '%',json_build_object('event','share_create_succeeded','protocol_id',protocol_uuid,'replaced_links',replaced,'password_hash_algorithm','bcrypt','password_hash_cost',10);
  return jsonb_build_object('ok',true,'data',jsonb_build_object('token',token,'protocol_id',protocol_uuid),'error',null);
exception when others then
  raise log '%',json_build_object('event','share_create_failed','reason','database_error','sqlstate',sqlstate);
  return private.share_failure('share_create_failed','The share link could not be created. Please try again.',500);
end $$;

create function private.unlock_protocol_share(email text,password text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  token text := private.share_token();
  invitation private.protocol_shares%rowtype;
  session_token text;
  reason text;
  password_matches boolean;
begin
  raise log '%',json_build_object('event','share_unlock_attempt','method','password','share_header_present',token is not null,'max_attempts',5,'lock_minutes',15,'session_hours',24);
  if token is null or token !~ '^[0-9a-f]{64}$' then reason := 'invalid_link';
  else
    select * into invitation from private.protocol_shares
      where token_hash=encode(extensions.digest(token,'sha256'),'hex') and revoked_at is null and password_hash is not null for update;
    if not found then reason := 'invalid_or_revoked_link'; end if;
  end if;
  if reason is not null then
    raise log '%',json_build_object('event','share_unlock_denied','reason',reason);
    return private.share_failure(reason,'This share link is invalid or has been replaced. Ask the manager for a new link.',404);
  end if;
  if invitation.locked_until>now() then
    raise log '%',json_build_object('event','share_unlock_denied','reason','share_rate_limited','locked_until',invitation.locked_until);
    return private.share_failure('share_rate_limited','Too many incorrect attempts. Wait 15 minutes or ask the manager for a new link.',429);
  end if;
  password_matches := false;
  if password is not null and length(password)>=8 and octet_length(password)<=72 then
    password_matches := extensions.crypt(password,invitation.password_hash)=invitation.password_hash;
  end if;
  if not password_matches or lower(trim(email)) is distinct from invitation.recipient_email then
    update private.protocol_shares set
      failed_attempts=(case when locked_until is not null then 0 else failed_attempts end)+1,
      locked_until=case when (case when locked_until is not null then 0 else failed_attempts end)+1>=5 then now()+interval '15 minutes' else null end
      where id=invitation.id;
    raise log '%',json_build_object('event','share_unlock_denied','reason',case when lower(trim(email)) is distinct from invitation.recipient_email then 'recipient_email_mismatch' else 'password_mismatch' end,'branch','failure_counted');
    return private.share_failure('invalid_share_credentials','The email or password is incorrect.',403);
  end if;
  raise log '%',json_build_object('event','share_unlock_authorized','branch','email_and_password_match');
  update private.protocol_shares set failed_attempts=0,locked_until=null where id=invitation.id;
  delete from private.protocol_share_sessions where share_id=invitation.id and expires_at<=now();
  session_token := encode(extensions.gen_random_bytes(32),'hex');
  insert into private.protocol_share_sessions(token_hash,share_id) values(encode(extensions.digest(session_token,'sha256'),'hex'),invitation.id);
  raise log '%',json_build_object('event','share_unlock_succeeded','branch','session_issued','session_hours',24);
  return jsonb_build_object('ok',true,'data',jsonb_build_object('session_token',session_token,'protocol_id',invitation.protocol_id,
    'department_id',(select department_id from public.protocols where id=invitation.protocol_id)),'error',null);
exception when others then
  raise log '%',json_build_object('event','share_unlock_failed','reason','database_error','sqlstate',sqlstate);
  return private.share_failure('share_unlock_failed','Shared access could not be checked. Please try again.',500);
end $$;

create function public.create_protocol_share(protocol text,email text,password text) returns jsonb
language sql security invoker set search_path='' as $$ select private.create_protocol_share(protocol,email,password) $$;
create function public.unlock_protocol_share(email text,password text) returns jsonb
language sql security invoker set search_path='' as $$ select private.unlock_protocol_share(email,password) $$;

alter policy shared_department_read on public.departments to anon,authenticated;
-- Password recipients use the anon role but must not gain employee/approval writes.
alter policy public_employees on public.employees using(private.share_token() is null) with check(private.share_token() is null);
alter policy approval_insert_scope on public.shift_approvals with check(private.share_token() is null and exists(select 1 from public.protocols p where p.id=protocol_id and p.department_id=shift_approvals.department_id));
alter policy snapshot_insert_scope on public.shift_approval_tasks with check(private.share_token() is null and exists(select 1 from public.shift_approvals a where a.id=approval_id));

revoke all on function private.create_protocol_share(text,text,text),private.unlock_protocol_share(text,text),
  public.create_protocol_share(text,text,text),public.unlock_protocol_share(text,text) from public;
grant execute on function private.create_protocol_share(text,text,text),private.unlock_protocol_share(text,text),
  public.create_protocol_share(text,text,text),public.unlock_protocol_share(text,text) to anon,authenticated;
notify pgrst,'reload schema';
commit;
