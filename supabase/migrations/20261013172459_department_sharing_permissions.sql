begin;
alter table private.protocol_shares alter column protocol_id drop not null;
alter table private.protocol_shares add column department_id uuid references public.departments(id) on delete cascade,
  add column is_manager boolean not null default true;
update private.protocol_shares s set department_id=p.department_id from public.protocols p where p.id=s.protocol_id;
alter table private.protocol_shares alter column department_id set not null;
create index protocol_shares_department_idx on private.protocol_shares(department_id);
create table private.share_protocol_permissions (
  share_id uuid not null references private.protocol_shares(id) on delete cascade,
  protocol_id uuid not null references public.protocols(id) on delete cascade,
  can_view boolean not null,
  can_edit boolean not null,
  primary key(share_id,protocol_id),
  check(not can_edit or can_view)
);
alter table private.share_protocol_permissions enable row level security;
revoke all on private.share_protocol_permissions from public,anon,authenticated;
insert into private.share_protocol_permissions select id,protocol_id,true,true from private.protocol_shares;

-- Keep existing links and the previous frontend working during rollout.
create function private.prepare_legacy_share() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.protocol_id is not null then
    select department_id into new.department_id from public.protocols where id=new.protocol_id;
  end if;
  return new;
end $$;

create function private.create_department_share(department text,email text,password text,permissions jsonb,is_manager boolean default false) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  dept uuid;
  owner uuid;
  recipient text := lower(trim(email));
  entry jsonb;
  protocol uuid;
  share uuid;
  token text;
  replaced integer;
begin
  raise log '%',json_build_object('event','department_share_create_attempt','share_scope',private.share_token() is not null,'is_manager',is_manager,'permissions_type',jsonb_typeof(permissions));
  if private.share_token() is not null then
    raise log '%',json_build_object('event','department_share_create_denied','reason','recipient_cannot_reshare');
    return private.share_failure('recipient_cannot_reshare','Only the department owner can create share links.',403);
  end if;
  if department is null or department !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    or recipient is null or length(recipient)>254 or recipient !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or password is null or length(password)<8 or octet_length(password)>72 or is_manager is null
    or jsonb_typeof(permissions) is distinct from 'array' then
    raise log '%',json_build_object('event','department_share_create_denied','reason','invalid_input');
    return private.share_failure('invalid_input','Choose a department, valid email, password of at least 8 characters (up to 72 bytes), and protocol permissions.',422);
  end if;
  dept := department::uuid;
  select d.user_id into owner from public.departments d where d.id=dept for update;
  if not found or owner is distinct from auth.uid() then
    raise log '%',json_build_object('event','department_share_create_denied','reason','department_missing_or_not_owner');
    return private.share_failure('not_department_owner','This department is unavailable or belongs to another user.',403);
  end if;
  raise log '%',json_build_object('event','department_share_create_authorized','branch',case when owner is null then 'existing_public_manager' else 'owner' end,'department_id',dept);
  for entry in select value from jsonb_array_elements(permissions) loop
    if jsonb_typeof(entry) is distinct from 'object' or (entry->>'protocol_id') is null
      or (entry->>'protocol_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or jsonb_typeof(entry->'can_view') is distinct from 'boolean' or jsonb_typeof(entry->'can_edit') is distinct from 'boolean' then
      raise log '%',json_build_object('event','department_share_create_denied','reason','invalid_permission_shape');
      return private.share_failure('invalid_permissions','Each protocol needs valid View and Edit choices.',422);
    end if;
    protocol := (entry->>'protocol_id')::uuid;
    raise log '%',json_build_object('event','share_permission_validation_attempt','protocol_id',protocol,'can_view',entry->'can_view','can_edit',entry->'can_edit');
    if not exists(select 1 from public.protocols p where p.id=protocol and p.department_id=dept)
      or ((entry->>'can_edit')::boolean and not (entry->>'can_view')::boolean) then
      raise log '%',json_build_object('event','department_share_create_denied','reason','foreign_protocol_or_edit_without_view','protocol_id',protocol);
      return private.share_failure('invalid_permissions','Choose protocols from this department. Edit access also requires View access.',422);
    end if;
    raise log '%',json_build_object('event','share_permission_validation_result','branch','valid','protocol_id',protocol);
  end loop;
  if jsonb_array_length(permissions)=0 or jsonb_array_length(permissions)<>(select count(distinct (value->>'protocol_id')::uuid) from jsonb_array_elements(permissions))
    or not exists(select 1 from jsonb_array_elements(permissions) where (value->>'can_view')::boolean) then
    raise log '%',json_build_object('event','department_share_create_denied','reason','empty_or_duplicate_permissions');
    return private.share_failure('invalid_permissions','Select View for at least one protocol, without duplicate protocols.',422);
  end if;
  update private.protocol_shares set revoked_at=now() where department_id=dept and recipient_email=recipient and revoked_at is null;
  get diagnostics replaced=row_count;
  token := encode(extensions.gen_random_bytes(32),'hex');
  insert into private.protocol_shares(department_id,recipient_email,token_hash,created_by,password_hash,is_manager)
    values(dept,recipient,encode(extensions.digest(token,'sha256'),'hex'),auth.uid(),extensions.crypt(password,extensions.gen_salt('bf',10)),is_manager)
    returning id into share;
  insert into private.share_protocol_permissions
    select share,(value->>'protocol_id')::uuid,(value->>'can_view')::boolean,(value->>'can_edit')::boolean from jsonb_array_elements(permissions);
  raise log '%',json_build_object('event','department_share_create_succeeded','department_id',dept,'protocol_count',jsonb_array_length(permissions),'is_manager',is_manager,'replaced_links',replaced);
  return jsonb_build_object('ok',true,'data',jsonb_build_object('token',token,'department_id',dept),'error',null);
exception when others then
  raise log '%',json_build_object('event','department_share_create_failed','reason','database_error','sqlstate',sqlstate);
  return private.share_failure('share_create_failed','The department share could not be created. Please try again.',500);
end $$;

create function public.create_department_share(department text,email text,password text,permissions jsonb,is_manager boolean default false) returns jsonb
language sql security invoker set search_path='' as $$ select private.create_department_share(department,email,password,permissions,is_manager) $$;
create function private.populate_legacy_share() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.protocol_id is not null then
    insert into private.share_protocol_permissions values(new.id,new.protocol_id,true,true);
    raise log '%',json_build_object('event','share_permissions_migrated','branch','legacy_single_protocol','is_manager',new.is_manager);
  end if;
  return new;
end $$;
create trigger prepare_legacy_share before insert on private.protocol_shares for each row execute function private.prepare_legacy_share();
create trigger populate_legacy_share after insert on private.protocol_shares for each row execute function private.populate_legacy_share();

-- Only internal definers call this helper; it is not an exposed access endpoint.
create function private.share_access_data(share uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('department_id',s.department_id,'protocol_id',s.protocol_id,'is_manager',s.is_manager,
   'protocols',coalesce((select jsonb_agg(jsonb_build_object('protocol_id',p.id,'can_view',g.can_view,'can_edit',g.can_edit) order by p.sort_order,p.id)
     from private.share_protocol_permissions g join public.protocols p on p.id=g.protocol_id
     where g.share_id=s.id and g.can_view and p.department_id=s.department_id),'[]'::jsonb))
 from private.protocol_shares s where s.id=share
$$;
create or replace function private.check_protocol_share() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare
  token text := private.share_token();
  session_token text := nullif(current_setting('request.headers',true),'')::jsonb->>'x-protocol-session';
  invitation private.protocol_shares%rowtype;
  reason text;
  manager_route boolean := coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-protocol-manager','false')='true';
begin
  raise log '%',json_build_object('event','share_access_attempt','method','share_password_session','share_header_present',token is not null,'session_present',session_token is not null,'manager_route',manager_route);
  if token is null or token !~ '^[0-9a-f]{64}$' then reason := 'invalid_link';
  else
    select * into invitation from private.protocol_shares
      where token_hash=encode(extensions.digest(token,'sha256'),'hex') and revoked_at is null and password_hash is not null;
    if not found then reason := 'invalid_or_revoked_link';
    elsif session_token is null or session_token !~ '^[0-9a-f]{64}$' then reason := 'share_password_required';
    elsif not exists(select 1 from private.protocol_share_sessions s where s.share_id=invitation.id
      and s.token_hash=encode(extensions.digest(session_token,'sha256'),'hex') and s.expires_at>now())
      then reason := 'share_session_expired';
    elsif manager_route and not invitation.is_manager then reason := 'manager_access_required';
    end if;
  end if;
  raise log '%',json_build_object('event','share_access_result','branch',case when reason is null then 'password_session_allowed' else 'denied' end,'reason',reason,'is_manager',invitation.is_manager);
  if reason is not null then
    return jsonb_build_object('ok',false,'data',null,'error',jsonb_build_object('code',reason,'message',
      case when reason='manager_access_required' then 'This link does not allow access to the department manager page.'
      when reason='share_password_required' then 'Enter the authorized email and share password.'
      when reason='share_session_expired' then 'Your shared session has expired. Enter the email and password again.'
      else 'This share link is invalid or has been replaced. Ask the manager for a new link.' end));
  end if;
  return jsonb_build_object('ok',true,'data',private.share_access_data(invitation.id),'error',null);
end $$;

create or replace function private.unlock_protocol_share(email text,password text) returns jsonb
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
  return jsonb_build_object('ok',true,'data',private.share_access_data(invitation.id)||jsonb_build_object('session_token',session_token),'error',null);
exception when others then
  raise log '%',json_build_object('event','share_unlock_failed','reason','database_error','sqlstate',sqlstate);
  return private.share_failure('share_unlock_failed','Shared access could not be checked. Please try again.',500);
end $$;

create function private.shared_protocol_permission(protocol uuid,permission text) returns boolean
language plpgsql stable security invoker set search_path='' as $$
declare access jsonb; allowed boolean; reason text;
begin
  raise log '%',json_build_object('event','shared_protocol_permission_attempt','protocol_id',protocol,'permission',permission,'share_scope',private.share_token() is not null);
  access := private.check_protocol_share();
  allowed := coalesce((access->>'ok')::boolean,false) and permission in ('view','edit') and exists(
    select 1 from jsonb_array_elements(access->'data'->'protocols') p
    where (p->>'protocol_id')::uuid=protocol and (p->>'can_view')::boolean and (permission='view' or (p->>'can_edit')::boolean));
  reason := case when allowed then null when not (access->>'ok')::boolean then access->'error'->>'code' else 'protocol_permission_missing' end;
  raise log '%',json_build_object('event','shared_protocol_permission_result','protocol_id',protocol,'permission',permission,'allowed',allowed,'reason',reason);
  return allowed;
end $$;

drop policy protocol_scope on public.protocols;
create policy protocol_view on public.protocols for select to anon,authenticated using(
 (private.share_token() is null and exists(select 1 from public.departments d where d.id=department_id))
 or (department_id=(select private.shared_department_id()) and private.shared_protocol_permission(id,'view')));
create policy protocol_create on public.protocols for insert to anon,authenticated with check(
 private.share_token() is null and exists(select 1 from public.departments d where d.id=department_id));
create policy protocol_edit on public.protocols for update to anon,authenticated using(
 (private.share_token() is null and exists(select 1 from public.departments d where d.id=department_id)) or private.shared_protocol_permission(id,'edit'))
 with check((private.share_token() is null and exists(select 1 from public.departments d where d.id=department_id))
 or (department_id=(select private.shared_department_id()) and private.shared_protocol_permission(id,'edit')));
create policy protocol_delete on public.protocols for delete to anon,authenticated using(
 (private.share_token() is null and exists(select 1 from public.departments d where d.id=department_id)) or private.shared_protocol_permission(id,'edit'));

drop policy category_scope on public.categories;
create policy category_view on public.categories for select to anon,authenticated using(exists(select 1 from public.protocols p where p.id=protocol_id));
create policy category_create on public.categories for insert to anon,authenticated with check(
 exists(select 1 from public.protocols p where p.id=protocol_id) and (private.share_token() is null or private.shared_protocol_permission(protocol_id,'edit')));
create policy category_edit on public.categories for update to anon,authenticated using(
 exists(select 1 from public.protocols p where p.id=protocol_id) and (private.share_token() is null or private.shared_protocol_permission(protocol_id,'edit')))
 with check(exists(select 1 from public.protocols p where p.id=protocol_id) and (private.share_token() is null or private.shared_protocol_permission(protocol_id,'edit')));
create policy category_delete on public.categories for delete to anon,authenticated using(
 exists(select 1 from public.protocols p where p.id=protocol_id) and (private.share_token() is null or private.shared_protocol_permission(protocol_id,'edit')));

drop policy task_scope on public.tasks;
create policy task_view on public.tasks for select to anon,authenticated using(exists(select 1 from public.categories c where c.id=category_id));
create policy task_create on public.tasks for insert to anon,authenticated with check(exists(select 1 from public.categories c where c.id=category_id
 and (private.share_token() is null or private.shared_protocol_permission(c.protocol_id,'edit'))));
create policy task_edit on public.tasks for update to anon,authenticated using(exists(select 1 from public.categories c where c.id=category_id
 and (private.share_token() is null or private.shared_protocol_permission(c.protocol_id,'edit'))))
 with check(exists(select 1 from public.categories c where c.id=category_id
 and (private.share_token() is null or private.shared_protocol_permission(c.protocol_id,'edit'))));
create policy task_delete on public.tasks for delete to anon,authenticated using(exists(select 1 from public.categories c where c.id=category_id
 and (private.share_token() is null or private.shared_protocol_permission(c.protocol_id,'edit'))));

revoke all on function private.prepare_legacy_share(),private.populate_legacy_share(),private.share_access_data(uuid),
 private.shared_protocol_permission(uuid,text),private.create_department_share(text,text,text,jsonb,boolean),
 public.create_department_share(text,text,text,jsonb,boolean) from public;
grant execute on function private.shared_protocol_permission(uuid,text),private.create_department_share(text,text,text,jsonb,boolean),
 public.create_department_share(text,text,text,jsonb,boolean) to anon,authenticated;
notify pgrst,'reload schema';
commit;
