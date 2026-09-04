create table if not exists public.shift_approvals (
  id bigint generated always as identity primary key,
  name text not null check (char_length(trim(name)) > 0),
  approved_at timestamptz not null default timezone('utc', now())
);

alter table public.shift_approvals enable row level security;

drop policy if exists "Allow public insert shift approvals" on public.shift_approvals;
create policy "Allow public insert shift approvals"
on public.shift_approvals
for insert
to anon, authenticated
with check (char_length(trim(name)) > 0);
