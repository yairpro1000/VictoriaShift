create table if not exists public.shift_approvals (
  id bigint generated always as identity primary key,
  employee_id uuid not null references public.employees(id) on delete restrict,
  department_id uuid not null references public.departments(id) on delete restrict,
  protocol_id uuid not null references public.protocols(id) on delete restrict,
  approved_at timestamptz not null default timezone('utc', now())
);

alter table public.shift_approvals enable row level security;

drop policy if exists "Allow public insert shift approvals" on public.shift_approvals;
create policy "Allow public insert shift approvals"
on public.shift_approvals
for insert
to anon, authenticated
with check (
  employee_id is not null
  and department_id is not null
  and protocol_id is not null
);
