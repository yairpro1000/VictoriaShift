begin;

-- Tokens are generated once and only their SHA-256 digest is retained.
create table private.protocol_shares (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid not null references public.protocols(id) on delete cascade,
  recipient_email text not null check (recipient_email = lower(trim(recipient_email))),
  token_hash text not null unique,
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
alter table private.protocol_shares enable row level security;
revoke all on private.protocol_shares from public, anon, authenticated;
create index protocol_shares_protocol_idx on private.protocol_shares(protocol_id);

create function private.share_token() returns text
language sql stable security invoker set search_path = '' as $$
  select nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-protocol-share'
$$;

-- A definer is necessary only for the invitation secret and canonical Auth email.
-- No caller-supplied email or user_metadata is an authorization source.
create function private.check_protocol_share() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  token text := private.share_token();
  viewer uuid := auth.uid();
  verified_email text;
  invitation private.protocol_shares%rowtype;
  reason text;
begin
  raise log '%', json_build_object('event','share_access_attempt','user_id',viewer,'share_header_present',token is not null);
  if token is null or token !~ '^[0-9a-f]{64}$' then
    reason := 'invalid_link';
  elsif viewer is null then
    reason := 'sign_in_required';
  else
    select lower(u.email) into verified_email from auth.users u
      where u.id=viewer and u.email_confirmed_at is not null
      and u.deleted_at is null and not u.is_anonymous
      and (u.banned_until is null or u.banned_until <= now());
    if verified_email is null then
      reason := 'verified_email_required';
    else
      select * into invitation from private.protocol_shares
        where token_hash=encode(extensions.digest(token,'sha256'),'hex') and revoked_at is null;
      if not found then reason := 'invalid_or_revoked_link';
      elsif invitation.recipient_email <> verified_email then reason := 'recipient_email_mismatch';
      end if;
    end if;
  end if;
  raise log '%', json_build_object('event','share_access_result','user_id',viewer,
    'branch',case when reason is null then 'verified_recipient_allowed' else 'denied' end,
    'reason',reason,'protocol_id',case when reason is null then invitation.protocol_id else null end);
  if reason is not null then
    return jsonb_build_object('ok',false,'data',null,'error',jsonb_build_object('code',reason,'message',
      case when reason='sign_in_required' then 'Sign in with the email this link was shared with.'
      when reason='verified_email_required' then 'Verify your email before opening this link.'
      when reason='recipient_email_mismatch' then 'This link was shared with a different email address.'
      else 'This share link is invalid or no longer available.' end));
  end if;
  return jsonb_build_object('ok',true,'data',jsonb_build_object(
    'protocol_id',invitation.protocol_id,
    'department_id',(select department_id from public.protocols where id=invitation.protocol_id)
  ),'error',null);
end $$;

create function private.shared_protocol_id() returns uuid
language sql stable security invoker set search_path = '' as $$
  select (private.check_protocol_share()->'data'->>'protocol_id')::uuid
$$;
create function private.shared_department_id() returns uuid
language sql stable security invoker set search_path = '' as $$
  select (private.check_protocol_share()->'data'->>'department_id')::uuid
$$;

-- A shared request never falls back to the owner's or public full-dataset branch.
create or replace function private.can_access_department_owner(owner_id uuid)
returns boolean language plpgsql stable security invoker set search_path = '' as $$
declare allowed boolean; scoped boolean := private.share_token() is not null;
begin
  raise log '%',json_build_object('event','department_access_check','viewer_id',auth.uid(),'owner_id',owner_id,'share_scope',scoped);
  allowed := not scoped and owner_id is not distinct from auth.uid();
  raise log '%',json_build_object('event','department_access_result','allowed',allowed,'branch',
    case when scoped then 'shared_request_owner_fallback_denied' when allowed then 'owner_or_public' else 'denied_owner_mismatch' end);
  return allowed;
end $$;

-- Parent department can be read for navigation, but never mutated by an invitee.
create policy shared_department_read on public.departments for select to authenticated
using (id=(select private.shared_department_id()));

drop policy protocol_scope on public.protocols;
create policy protocol_scope on public.protocols for all to anon,authenticated
using (
  (private.share_token() is null and exists(select 1 from public.departments d where d.id=department_id))
  or (id=(select private.shared_protocol_id()) and department_id=(select private.shared_department_id()))
)
with check (
  (private.share_token() is null and exists(select 1 from public.departments d where d.id=department_id))
  or (id=(select private.shared_protocol_id()) and department_id=(select private.shared_department_id()))
);
-- Category/task policies already follow the allowed protocol. No new read-only role.
-- Block copying an invitation to a newly created protocol through a guessed UUID.
create function private.guard_shared_protocol_insert() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare scoped boolean := private.share_token() is not null;
begin
  raise log '%',json_build_object('event','share_protocol_insert_attempt','share_scope',scoped);
  if scoped then
    raise log '%',json_build_object('event','share_protocol_insert_denied','reason','outside_shared_protocol');
    raise insufficient_privilege using message='A shared link cannot create another protocol.';
  end if;
  raise log '%',json_build_object('event','share_protocol_insert_allowed','branch','normal_request_rls_applies');
  return new;
end $$;
create trigger shared_protocol_insert before insert on public.protocols
for each row execute function private.guard_shared_protocol_insert();

-- Stable API envelope, including validation and unexpected database failures.
create function private.share_failure(code text, message text, status integer) returns jsonb
language plpgsql security invoker set search_path = '' as $$
begin
  perform set_config('response.status',status::text,true);
  return jsonb_build_object('ok',false,'data',null,'error',jsonb_build_object('code',code,'message',message),
    'code',code,'message',message,'details',null,'hint',null);
end $$;

create function private.create_protocol_share(protocol text, email text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  protocol_uuid uuid;
  owner uuid;
  token text;
  recipient text := lower(trim(email));
  scoped boolean := private.share_token() is not null;
begin
  raise log '%',json_build_object('event','share_create_attempt','user_id',auth.uid(),'share_scope',scoped,'has_recipient',length(coalesce(recipient,''))>0);
  if scoped then
    raise log '%',json_build_object('event','share_create_denied','reason','recipient_cannot_reshare');
    return private.share_failure('recipient_cannot_reshare','Only the protocol manager can generate share links.',403);
  end if;
  if protocol is null or protocol !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
     or recipient is null or length(recipient)>254 or recipient !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise log '%',json_build_object('event','share_create_denied','reason','invalid_protocol_or_email');
    return private.share_failure('invalid_input','Choose a protocol and enter a valid recipient email.',422);
  end if;
  protocol_uuid := protocol::uuid;
  select d.user_id into owner from public.protocols p join public.departments d on d.id=p.department_id where p.id=protocol_uuid;
  if not found or owner is distinct from auth.uid() then
    raise log '%',json_build_object('event','share_create_denied','reason','protocol_missing_or_not_owner','protocol_id',protocol_uuid);
    return private.share_failure('not_protocol_manager','This protocol is unavailable or belongs to another user.',403);
  end if;
  raise log '%',json_build_object('event','share_create_authorized','protocol_id',protocol_uuid,'branch',case when owner is null then 'existing_public_manager' else 'owner' end);
  token := encode(extensions.gen_random_bytes(32),'hex');
  insert into private.protocol_shares(protocol_id,recipient_email,token_hash,created_by)
    values(protocol_uuid,recipient,encode(extensions.digest(token,'sha256'),'hex'),auth.uid());
  raise log '%',json_build_object('event','share_create_succeeded','protocol_id',protocol_uuid);
  return jsonb_build_object('ok',true,'data',jsonb_build_object('token',token,'protocol_id',protocol_uuid),'error',null);
exception when others then
  raise log '%',json_build_object('event','share_create_failed','reason','database_error','sqlstate',sqlstate);
  return private.share_failure('share_create_failed','The share link could not be created. Please try again.',500);
end $$;

create function public.create_protocol_share(protocol text, email text) returns jsonb
language sql security invoker set search_path = '' as $$
  select private.create_protocol_share(protocol,email)
$$;

create function public.get_protocol_share() returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare result jsonb;
begin
  result := private.check_protocol_share();
  if not (result->>'ok')::boolean then
    return private.share_failure(result->'error'->>'code',result->'error'->>'message',
      case when result->'error'->>'code'='sign_in_required' then 401 else 403 end);
  end if;
  return result;
exception when others then
  raise log '%',json_build_object('event','share_resolve_failed','reason','database_error','sqlstate',sqlstate);
  return private.share_failure('share_resolve_failed','Shared access could not be checked. Please try again.',500);
end $$;

revoke all on function private.share_token(), private.check_protocol_share(), private.shared_protocol_id(),
  private.shared_department_id(), private.guard_shared_protocol_insert(), private.share_failure(text,text,integer),
  private.create_protocol_share(text,text), public.create_protocol_share(text,text), public.get_protocol_share() from public;
grant execute on function private.share_token(), private.check_protocol_share(), private.shared_protocol_id(),
  private.shared_department_id(), private.share_failure(text,text,integer), private.create_protocol_share(text,text),
  public.create_protocol_share(text,text), public.get_protocol_share() to anon,authenticated;
commit;
