create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) > 0),
  sort_order integer not null default 0,
  active boolean not null default true
);

create table if not exists public.protocols (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  sort_order integer not null default 0,
  active boolean not null default true,
  unique (department_id, name)
);

alter table public.categories
  add column if not exists protocol_id uuid null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'categories_protocol_id_fkey'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories
      add constraint categories_protocol_id_fkey
      foreign key (protocol_id)
      references public.protocols(id)
      on delete restrict;
  end if;
end $$;

alter table public.shift_approvals
  add column if not exists department_id uuid null;

alter table public.shift_approvals
  add column if not exists protocol_id uuid null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'shift_approvals_department_id_fkey'
      and conrelid = 'public.shift_approvals'::regclass
  ) then
    alter table public.shift_approvals
      add constraint shift_approvals_department_id_fkey
      foreign key (department_id)
      references public.departments(id)
      on delete restrict;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'shift_approvals_protocol_id_fkey'
      and conrelid = 'public.shift_approvals'::regclass
  ) then
    alter table public.shift_approvals
      add constraint shift_approvals_protocol_id_fkey
      foreign key (protocol_id)
      references public.protocols(id)
      on delete restrict;
  end if;
end $$;

create table if not exists public.shift_approval_tasks (
  id bigint generated always as identity primary key,
  approval_id bigint not null references public.shift_approvals(id) on delete cascade,
  task_id uuid null,
  category_id uuid null,
  category_name text not null,
  category_color text not null,
  task_name text not null,
  task_action text null,
  sort_order integer not null default 0,
  completed_by uuid null references public.employees(id) on delete set null,
  completed_by_first_name text null,
  completed_by_last_name text null,
  completed_at timestamptz null
);

create index if not exists categories_protocol_id_idx
  on public.categories(protocol_id);

create index if not exists shift_approvals_department_protocol_approved_at_idx
  on public.shift_approvals(department_id, protocol_id, approved_at desc);

create index if not exists shift_approval_tasks_approval_id_idx
  on public.shift_approval_tasks(approval_id);

alter table public.departments enable row level security;
alter table public.protocols enable row level security;
alter table public.shift_approval_tasks enable row level security;

grant select, insert, update, delete on public.departments to anon, authenticated;
grant select, insert, update, delete on public.protocols to anon, authenticated;
grant select, insert on public.shift_approval_tasks to anon, authenticated;
grant select, update (protocol_id) on public.categories to anon, authenticated;
grant insert (employee_id, department_id, protocol_id, approved_at) on public.shift_approvals to anon, authenticated;
grant select on public.shift_approvals to anon, authenticated;

drop policy if exists "Allow public read departments" on public.departments;
create policy "Allow public read departments"
  on public.departments for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public write departments" on public.departments;
create policy "Allow public write departments"
  on public.departments for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow public read protocols" on public.protocols;
create policy "Allow public read protocols"
  on public.protocols for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public write protocols" on public.protocols;
create policy "Allow public write protocols"
  on public.protocols for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow public read approval history" on public.shift_approvals;
create policy "Allow public read approval history"
  on public.shift_approvals for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public insert shift approvals" on public.shift_approvals;
create policy "Allow public insert shift approvals"
  on public.shift_approvals for insert
  to anon, authenticated
  with check (
    employee_id is not null
    and department_id is not null
    and protocol_id is not null
  );

drop policy if exists "Allow public read approval task snapshots" on public.shift_approval_tasks;
create policy "Allow public read approval task snapshots"
  on public.shift_approval_tasks for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public insert approval task snapshots" on public.shift_approval_tasks;
create policy "Allow public insert approval task snapshots"
  on public.shift_approval_tasks for insert
  to anon, authenticated
  with check (approval_id is not null);

with department_row as (
  insert into public.departments (name, sort_order, active)
  values ('Pasta & More', 1, true)
  on conflict (name) do update
    set sort_order = excluded.sort_order,
        active = excluded.active
  returning id
), protocol_row as (
  insert into public.protocols (department_id, name, sort_order, active)
  select id, 'Shift Teardown', 1, true
  from department_row
  on conflict (department_id, name) do update
    set sort_order = excluded.sort_order,
        active = excluded.active
  returning id, department_id
)
update public.categories
set protocol_id = protocol_row.id
from protocol_row
where public.categories.protocol_id is null;

with selected_protocol as (
  select protocols.id as protocol_id, protocols.department_id
  from public.protocols
  join public.departments on departments.id = protocols.department_id
  where departments.name = 'Pasta & More'
    and protocols.name = 'Shift Teardown'
  limit 1
)
update public.shift_approvals
set department_id = selected_protocol.department_id,
    protocol_id = selected_protocol.protocol_id
from selected_protocol
where public.shift_approvals.department_id is null
   or public.shift_approvals.protocol_id is null;

alter table public.categories
  alter column protocol_id set not null;

alter table public.shift_approvals
  alter column department_id set not null;

alter table public.shift_approvals
  alter column protocol_id set not null;
