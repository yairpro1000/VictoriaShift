-- Execute as database owner. All fixtures and writes are rolled back.
begin;
insert into public.departments(id,name,user_id) values
('aaaaaaaa-0000-4000-8000-000000000001','__private_access_test__',(select id from auth.users where email='yair@users.victoriashift.invalid'));
insert into public.protocols(id,department_id,name) values
('aaaaaaaa-0000-4000-8000-000000000002','aaaaaaaa-0000-4000-8000-000000000001','Test');
insert into public.categories(id,protocol_id,name,color,sort_order) values
('aaaaaaaa-0000-4000-8000-000000000003','aaaaaaaa-0000-4000-8000-000000000002','Test','#ffffff',0);
insert into public.tasks(id,category_id,name,sort_order) values
('aaaaaaaa-0000-4000-8000-000000000004','aaaaaaaa-0000-4000-8000-000000000003','Test',0);

set local role anon;
do $$ begin
  assert not exists(select 1 from public.departments where user_id is not null), 'anonymous private departments leak';
  assert not exists(select 1 from public.tasks where id='aaaaaaaa-0000-4000-8000-000000000004'), 'anonymous private tasks leak';
  assert exists(select 1 from public.departments where user_id is null), 'public departments missing';
end $$;
reset role;
select set_config('request.jwt.claims',json_build_object('sub',(select id from auth.users where email='yair@users.victoriashift.invalid'),'role','authenticated')::text,true);
set local role authenticated;
do $$ begin
  assert not exists(select 1 from public.departments where user_id is null), 'public departments leak into private account';
  assert not exists(select 1 from public.employees), 'employee data visible to private account';
  assert exists(select 1 from public.tasks where id='aaaaaaaa-0000-4000-8000-000000000004'), 'owner task missing';
  update public.tasks set done=true,completed_by=null,completed_at=now() where id='aaaaaaaa-0000-4000-8000-000000000004';
  assert exists(select 1 from public.tasks where id='aaaaaaaa-0000-4000-8000-000000000004' and done), 'private completion failed';
  begin
    insert into public.departments(name,user_id) values('__denied__',null);
    raise exception 'private user wrote public department';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"bbbbbbbb-0000-4000-8000-000000000001","role":"authenticated"}',true);
set local role authenticated;
do $$ declare changed integer; begin
  assert not exists(select 1 from public.tasks where id='aaaaaaaa-0000-4000-8000-000000000004'), 'other user task leak';
  update public.tasks set name='intrusion' where id='aaaaaaaa-0000-4000-8000-000000000004';
  get diagnostics changed = row_count;
  assert changed=0, 'other user changed task';
end $$;
rollback;
