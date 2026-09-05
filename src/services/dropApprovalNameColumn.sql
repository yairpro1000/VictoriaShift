alter table public.shift_approvals
  drop column if exists name;

delete from public.shift_approvals
where employee_id is null;

alter table public.shift_approvals
  alter column employee_id set not null;
