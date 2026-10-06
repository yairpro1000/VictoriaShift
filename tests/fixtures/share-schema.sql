-- Match the current hosted Supabase auth.uid() contract (container ships a legacy version).
create or replace function auth.uid() returns uuid language sql stable as $$
 select (nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid
$$;
-- Minimal pre-migration schema for an isolated Postgres container. Never run on production.
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
alter table auth.users add column if not exists email_confirmed_at timestamptz;
alter table auth.users add column if not exists deleted_at timestamptz;
alter table auth.users add column if not exists banned_until timestamptz;
alter table auth.users add column if not exists is_anonymous boolean not null default false;
create table public.departments (
 id uuid primary key default gen_random_uuid(), name text not null unique,
 sort_order integer not null default 0, active boolean not null default true
);
create table public.protocols (
 id uuid primary key default gen_random_uuid(), department_id uuid not null references public.departments(id) on delete cascade,
 name text not null, sort_order integer not null default 0, active boolean not null default true
);
create table public.categories (
 id uuid primary key default gen_random_uuid(), protocol_id uuid not null references public.protocols(id) on delete restrict,
 name text not null, color text not null default '#ffffff', sort_order integer not null default 0
);
create table public.employees(id uuid primary key default gen_random_uuid(), first_name text, last_name text, active boolean default true);
create table public.tasks (
 id uuid primary key default gen_random_uuid(), category_id uuid not null references public.categories(id) on delete restrict,
 name text not null, action text, done boolean not null default false, sort_order integer not null default 0,
 completed_at timestamptz, completed_by uuid references public.employees(id)
);
create table public.shift_approvals(id uuid primary key default gen_random_uuid(), department_id uuid references public.departments(id),protocol_id uuid references public.protocols(id));
create table public.shift_approval_tasks(id uuid primary key default gen_random_uuid(), approval_id uuid references public.shift_approvals(id));
grant all on all tables in schema public to anon,authenticated;
