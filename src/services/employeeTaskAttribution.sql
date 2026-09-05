create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (length(trim(first_name)) > 0),
  last_name text not null check (length(trim(last_name)) > 0),
  active boolean not null default true
);

alter table public.tasks
  add column if not exists completed_by uuid null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_completed_by_fkey'
      and conrelid = 'public.tasks'::regclass
  ) then
    alter table public.tasks
      add constraint tasks_completed_by_fkey
      foreign key (completed_by)
      references public.employees(id)
      on delete set null;
  end if;
end $$;

create index if not exists tasks_completed_by_idx
  on public.tasks(completed_by);

alter table public.employees enable row level security;

grant select, insert, update, delete on public.employees to anon, authenticated;
grant update (completed_by, completed_at, done) on public.tasks to anon, authenticated;

drop policy if exists "Allow public read employees" on public.employees;
create policy "Allow public read employees"
  on public.employees
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public insert employees" on public.employees;
create policy "Allow public insert employees"
  on public.employees
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow public update employees" on public.employees;
create policy "Allow public update employees"
  on public.employees
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow public delete employees" on public.employees;
create policy "Allow public delete employees"
  on public.employees
  for delete
  to anon, authenticated
  using (true);
