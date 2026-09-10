begin;
alter table public.departments add column user_id uuid references auth.users(id) on delete restrict default auth.uid();
alter table public.departments drop constraint departments_name_key;
create unique index departments_public_name on public.departments(name) where user_id is null;
create unique index departments_user_name on public.departments(user_id,name) where user_id is not null;

create schema if not exists private;
grant usage on schema private to anon, authenticated;
create or replace function private.can_access_department_owner(owner_id uuid)
returns boolean language plpgsql stable security invoker set search_path = '' as $$
declare
  viewer_id uuid := auth.uid();
  allowed boolean;
begin
  raise log '%', json_build_object('event','department_access_check','viewer_id',viewer_id,'owner_id',owner_id);
  allowed := owner_id is not distinct from viewer_id;
  raise log '%', json_build_object('event','department_access_result','allowed',allowed,
    'branch',case when allowed and viewer_id is null then 'public' when allowed then 'owner' else 'denied_owner_mismatch' end);
  return allowed;
end;
$$;
revoke all on function private.can_access_department_owner(uuid) from public;
grant execute on function private.can_access_department_owner(uuid) to anon, authenticated;

-- Replace permissive policies; multiple permissive policies would otherwise bypass ownership.
do $$
declare p record;
begin
  for p in select tablename,policyname from pg_policies where schemaname='public'
    and tablename in ('departments','protocols','categories','tasks','employees','shift_approvals','shift_approval_tasks')
  loop
    execute format('drop policy %I on public.%I',p.policyname,p.tablename);
  end loop;
end $$;

alter table public.departments enable row level security;
alter table public.protocols enable row level security;
alter table public.categories enable row level security;
alter table public.tasks enable row level security;
alter table public.employees enable row level security;
alter table public.shift_approvals enable row level security;
alter table public.shift_approval_tasks enable row level security;

create policy department_scope on public.departments for all to anon,authenticated
using (private.can_access_department_owner(user_id)) with check (private.can_access_department_owner(user_id));
create policy protocol_scope on public.protocols for all to anon,authenticated
using (exists(select 1 from public.departments d where d.id=department_id))
with check (exists(select 1 from public.departments d where d.id=department_id));
create policy category_scope on public.categories for all to anon,authenticated
using (exists(select 1 from public.protocols p where p.id=protocol_id))
with check (exists(select 1 from public.protocols p where p.id=protocol_id));
create policy task_scope on public.tasks for all to anon,authenticated
using (exists(select 1 from public.categories c where c.id=category_id))
with check (exists(select 1 from public.categories c where c.id=category_id));
create policy public_employees on public.employees for all to anon
using (true) with check (true);
create policy approval_read_scope on public.shift_approvals for select to anon,authenticated
using (exists(select 1 from public.protocols p where p.id=protocol_id and p.department_id=shift_approvals.department_id));
create policy approval_insert_scope on public.shift_approvals for insert to anon
with check (exists(select 1 from public.protocols p where p.id=protocol_id and p.department_id=shift_approvals.department_id));
create policy snapshot_read_scope on public.shift_approval_tasks for select to anon,authenticated
using (exists(select 1 from public.shift_approvals a where a.id=approval_id));
create policy snapshot_insert_scope on public.shift_approval_tasks for insert to anon
with check (exists(select 1 from public.shift_approvals a where a.id=approval_id));
commit;
