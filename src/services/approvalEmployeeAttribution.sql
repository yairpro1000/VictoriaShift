alter table public.shift_approvals
  add column if not exists employee_id uuid null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'shift_approvals_employee_id_fkey'
      and conrelid = 'public.shift_approvals'::regclass
  ) then
    alter table public.shift_approvals
      add constraint shift_approvals_employee_id_fkey
      foreign key (employee_id)
      references public.employees(id)
      on delete set null;
  end if;
end $$;

create index if not exists shift_approvals_employee_id_idx
  on public.shift_approvals(employee_id);

grant select, insert on public.shift_approvals to anon, authenticated;
grant insert (employee_id, approved_at) on public.shift_approvals to anon, authenticated;

drop policy if exists "Allow public insert shift approvals" on public.shift_approvals;
create policy "Allow public insert shift approvals"
  on public.shift_approvals
  for insert
  to anon, authenticated
  with check (employee_id is not null);
