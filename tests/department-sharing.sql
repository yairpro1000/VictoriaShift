\set ON_ERROR_STOP on
set client_min_messages=log;
begin;
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
('10000000-0000-4000-8000-000000000001','owner@example.com',now(),'{}'),
('10000000-0000-4000-8000-000000000002','recipient@example.com',now(),'{}'),
('10000000-0000-4000-8000-000000000003','wrong@example.com',now(),'{"email":"recipient@example.com"}'),
('10000000-0000-4000-8000-000000000004','unverified@example.com',null,'{}');
insert into public.departments(id,name,user_id) values
('20000000-0000-4000-8000-000000000001','Owner','10000000-0000-4000-8000-000000000001'),
('20000000-0000-4000-8000-000000000002','Public',null);
insert into public.protocols(id,department_id,name) values
('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Shared'),
('30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','Sibling'),
('30000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000002','Public protocol');
insert into public.categories(id,protocol_id,name,color,sort_order) values
('40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','Shared category','#ffffff',1),
('40000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002','Sibling category','#ffffff',1);
insert into public.tasks(id,category_id,name,sort_order) values
('50000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','Shared task',1),
('50000000-0000-4000-8000-000000000002','40000000-0000-4000-8000-000000000002','Sibling task',1);

insert into public.protocols(id,department_id,name) values
('30000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000001','Hidden');
insert into public.categories(id,protocol_id,name) values('40000000-0000-4000-8000-000000000004','30000000-0000-4000-8000-000000000004','Hidden category');
insert into public.tasks(id,category_id,name) values('50000000-0000-4000-8000-000000000004','40000000-0000-4000-8000-000000000004','Hidden task');
select set_config('test.permissions','[
 {"protocol_id":"30000000-0000-4000-8000-000000000001","can_view":true,"can_edit":true},
 {"protocol_id":"30000000-0000-4000-8000-000000000002","can_view":true,"can_edit":false},
 {"protocol_id":"30000000-0000-4000-8000-000000000004","can_view":false,"can_edit":false}]',true);
select set_config('request.headers','{}',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
set local role authenticated;
do $$ declare r jsonb; begin
 r:=public.create_department_share('20000000-0000-4000-8000-000000000001','recipient@example.com','department-password',current_setting('test.permissions')::jsonb,false);
 assert (r->>'ok')::boolean, r::text;
 perform set_config('test.department_token',r->'data'->>'token',true);
 assert public.create_department_share('20000000-0000-4000-8000-000000000002','recipient@example.com','department-password',current_setting('test.permissions')::jsonb,false)->'error'->>'code'='not_department_owner';
 assert public.create_department_share('invalid','recipient@example.com','department-password','[]',false)->'error'->>'code'='invalid_input';
 assert public.create_department_share('20000000-0000-4000-8000-000000000001','recipient@example.com','department-password','{}',false)->'error'->>'code'='invalid_input';
 assert public.create_department_share('20000000-0000-4000-8000-000000000001','recipient@example.com','department-password','[{}]',false)->'error'->>'code'='invalid_permissions';
 assert public.create_department_share('20000000-0000-4000-8000-000000000001','recipient@example.com','department-password','[]',false)->'error'->>'code'='invalid_permissions';
 assert public.create_department_share('20000000-0000-4000-8000-000000000001','recipient@example.com','department-password','[{"protocol_id":"30000000-0000-4000-8000-000000000003","can_view":true,"can_edit":true}]',false)->'error'->>'code'='invalid_permissions';
 assert public.create_department_share('20000000-0000-4000-8000-000000000001','recipient@example.com','department-password','[{"protocol_id":"30000000-0000-4000-8000-000000000001","can_view":false,"can_edit":true}]',false)->'error'->>'code'='invalid_permissions';
 assert public.create_department_share('20000000-0000-4000-8000-000000000001','recipient@example.com','department-password','[{"protocol_id":"30000000-0000-4000-8000-000000000001","can_view":false,"can_edit":false}]',false)->'error'->>'code'='invalid_permissions';
 assert public.create_department_share('20000000-0000-4000-8000-000000000001','recipient@example.com','department-password',current_setting('test.permissions')::jsonb||current_setting('test.permissions')::jsonb,false)->'error'->>'code'='invalid_permissions';
end $$;
reset role;
select set_config('request.jwt.claims','{}',true);
select set_config('request.headers',json_build_object('x-protocol-share',current_setting('test.department_token'))::text,true);
set local role anon;
do $$ declare r jsonb; changed integer; begin
 assert (select count(*) from public.protocols)=0;
 r:=public.unlock_protocol_share('recipient@example.com','department-password');
 assert (r->>'ok')::boolean;
 assert (r->'data'->>'is_manager')::boolean=false;
 assert jsonb_array_length(r->'data'->'protocols')=2;
 perform set_config('test.department_session',r->'data'->>'session_token',true);
 perform set_config('request.headers',json_build_object('x-protocol-share',current_setting('test.department_token'),'x-protocol-session',current_setting('test.department_session'))::text,true);
 assert (select count(*) from public.departments)=1;
 assert (select count(*) from public.protocols)=2;
 assert (select count(*) from public.categories)=2;
 assert (select count(*) from public.tasks)=2;
 update public.tasks set done=true where id='50000000-0000-4000-8000-000000000001';
 get diagnostics changed=row_count; assert changed=1;
 update public.tasks set done=true where id='50000000-0000-4000-8000-000000000002';
 get diagnostics changed=row_count; assert changed=0,'view-only task update allowed';
 delete from public.tasks where id='50000000-0000-4000-8000-000000000002';
 get diagnostics changed=row_count; assert changed=0,'view-only task delete allowed';
 update public.categories set name='Denied' where protocol_id='30000000-0000-4000-8000-000000000002';
 get diagnostics changed=row_count; assert changed=0;
 delete from public.categories where protocol_id='30000000-0000-4000-8000-000000000002';
 get diagnostics changed=row_count; assert changed=0;
 update public.protocols set name='Denied' where id='30000000-0000-4000-8000-000000000002';
 get diagnostics changed=row_count; assert changed=0;
 delete from public.protocols where id='30000000-0000-4000-8000-000000000002';
 get diagnostics changed=row_count; assert changed=0;
 begin
   insert into public.tasks(category_id,name) values('40000000-0000-4000-8000-000000000002','Denied');
   raise exception 'view-only task creation allowed';
 exception when insufficient_privilege then null; end;
 begin
   insert into public.categories(protocol_id,name) values('30000000-0000-4000-8000-000000000002','Denied');
   raise exception 'view-only category creation allowed';
 exception when insufficient_privilege then null; end;
 begin
   update public.tasks set category_id='40000000-0000-4000-8000-000000000002' where id='50000000-0000-4000-8000-000000000001';
   raise exception 'move into view-only protocol allowed';
 exception when insufficient_privilege then null; end;
 begin
   update public.categories set protocol_id='30000000-0000-4000-8000-000000000002' where id='40000000-0000-4000-8000-000000000001';
   raise exception 'move category into view-only protocol allowed';
 exception when insufficient_privilege then null; end;
 assert public.create_department_share('20000000-0000-4000-8000-000000000001','another@example.com','department-password',current_setting('test.permissions')::jsonb,true)->'error'->>'code'='recipient_cannot_reshare';
 perform set_config('request.headers',json_build_object('x-protocol-share',current_setting('test.department_token'),'x-protocol-session',current_setting('test.department_session'),'x-protocol-manager','true')::text,true);
 assert public.get_protocol_share()->'error'->>'code'='manager_access_required';
 assert (select count(*) from public.protocols)=0;
 assert (select count(*) from public.tasks)=0;
end $$;
reset role;
-- Existing owner JWT must not bypass a shared read-only permission.
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select set_config('request.headers',json_build_object('x-protocol-share',current_setting('test.department_token'),'x-protocol-session',current_setting('test.department_session'))::text,true);
set local role authenticated;
do $$ declare changed integer; begin
 update public.tasks set done=true where id='50000000-0000-4000-8000-000000000002';
 get diagnostics changed=row_count; assert changed=0;
end $$;
reset role;
select set_config('request.headers','{}',true);
insert into public.protocols(id,department_id,name) values('30000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000001','Future protocol');
select set_config('request.headers',json_build_object('x-protocol-share',current_setting('test.department_token'),'x-protocol-session',current_setting('test.department_session'))::text,true);
set local role authenticated;
do $$ begin assert (select count(*) from public.protocols)=2, 'future protocol was shared automatically'; end $$;
reset role;
-- Replacement with manager access does not elevate view-only protocols.
select set_config('request.headers','{}',true);
set local role authenticated;
do $$ declare r jsonb; begin
 r:=public.create_department_share('20000000-0000-4000-8000-000000000001','recipient@example.com','new-department-password',current_setting('test.permissions')::jsonb,true);
 assert (r->>'ok')::boolean;
 perform set_config('test.new_department_token',r->'data'->>'token',true);
end $$;
reset role;
select set_config('request.jwt.claims','{}',true);
select set_config('request.headers',json_build_object('x-protocol-share',current_setting('test.department_token'),'x-protocol-session',current_setting('test.department_session'))::text,true);
set local role anon;
do $$ begin assert public.get_protocol_share()->'error'->>'code'='invalid_or_revoked_link'; end $$;
reset role;
select set_config('request.headers',json_build_object('x-protocol-share',current_setting('test.new_department_token'),'x-protocol-manager','true')::text,true);
set local role anon;
do $$ declare r jsonb; changed integer; begin
 r:=public.unlock_protocol_share('recipient@example.com','new-department-password');
 assert (r->>'ok')::boolean;
 assert (r->'data'->>'is_manager')::boolean;
 perform set_config('request.headers',json_build_object('x-protocol-share',current_setting('test.new_department_token'),'x-protocol-session',r->'data'->>'session_token','x-protocol-manager','true')::text,true);
 assert (public.get_protocol_share()->>'ok')::boolean;
 assert (select count(*) from public.protocols)=2;
 update public.tasks set done=true where id='50000000-0000-4000-8000-000000000002';
 get diagnostics changed=row_count; assert changed=0, 'manager flag bypassed edit permission';
 update public.tasks set name='Allowed edit' where id='50000000-0000-4000-8000-000000000001';
 get diagnostics changed=row_count; assert changed=1;
 update public.departments set name='Denied'; get diagnostics changed=row_count; assert changed=0;
 assert not has_table_privilege('anon','private.share_protocol_permissions','select');
 assert not has_function_privilege('anon','private.share_access_data(uuid)','execute');
end $$;
reset role;
-- A protocol moved out of the shared department loses access immediately.
select set_config('test.current_headers',current_setting('request.headers'),true);
select set_config('request.headers','{}',true);
update public.protocols set department_id='20000000-0000-4000-8000-000000000002' where id='30000000-0000-4000-8000-000000000001';
select set_config('request.headers',current_setting('test.current_headers'),true);
set local role anon;
do $$ begin assert (select count(*) from public.protocols)=1; assert (select count(*) from public.tasks)=1; end $$;
reset role;
select set_config('request.headers','{}',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
create function private.test_department_share_failure() returns trigger language plpgsql as $$ begin raise exception 'Synthetic failure'; end $$;
create trigger test_department_share_failure before insert on private.protocol_shares for each row execute function private.test_department_share_failure();
set local role authenticated;
do $$ declare r jsonb; begin
 r:=public.create_department_share('20000000-0000-4000-8000-000000000001','recipient@example.com','department-password','[{"protocol_id":"30000000-0000-4000-8000-000000000002","can_view":true,"can_edit":false}]',false);
 assert r->'error'->>'code'='share_create_failed'; assert r->'data'='null'::jsonb; assert current_setting('response.status')='500';
end $$;
reset role;
rollback;
select 'Department sharing permission tests passed' as result;
