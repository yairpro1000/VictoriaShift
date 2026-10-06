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

select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select set_config('request.headers','{}',true);
set local role authenticated;
do $$ declare response jsonb; begin
 assert (select count(*) from public.protocols)=2, 'owner flow changed';
 response:=public.create_protocol_share('30000000-0000-4000-8000-000000000001',' RECIPIENT@example.com ','test-share-password');
 assert (response->>'ok')::boolean, 'owner could not share';
 perform set_config('test.share_token',response->'data'->>'token',true);
 assert (public.create_protocol_share('30000000-0000-4000-8000-000000000003','recipient@example.com','test-share-password')->'error'->>'code')='not_protocol_manager';
 assert (public.create_protocol_share('invalid-id','invalid-email','test-share-password')->'error'->>'code')='invalid_input';
end $$;
reset role;
select set_config('request.headers',json_build_object('x-protocol-share',current_setting('test.share_token'))::text,true);

-- Bearer link is insufficient, even for public protocols.
select set_config('request.jwt.claims','{}',true);
set local role anon;
do $$ begin
 assert (public.get_protocol_share()->'error'->>'code')='share_password_required';
 assert (select count(*) from public.protocols)=0;
 assert (select count(*) from public.tasks)=0;
end $$;
reset role;

-- Email alone, password alone, or an existing owner/recipient JWT cannot bypass the exchange.
set local role anon;
do $$ declare response jsonb; begin
 response:=public.unlock_protocol_share('wrong@example.com','test-share-password');
 assert response->'error'->>'code'='invalid_share_credentials';
 assert response->'data'='null'::jsonb;
 assert current_setting('response.status')='403';
 assert (public.unlock_protocol_share('recipient@example.com','wrong-password')->'error'->>'code')='invalid_share_credentials';
 assert (select count(*) from public.protocols)=0;
 response:=public.unlock_protocol_share(' RECIPIENT@example.com ','test-share-password');
 assert (response->>'ok')::boolean;
 perform set_config('test.share_session',response->'data'->>'session_token',true);
end $$;
reset role;
-- A real recipient account is still insufficient without the new session.
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
set local role authenticated;
do $$ begin assert (public.get_protocol_share()->'error'->>'code')='share_password_required'; end $$;
reset role;
select set_config('request.jwt.claims','{}',true);
select set_config('request.headers',json_build_object('x-protocol-share',current_setting('test.share_token'),'x-protocol-session',current_setting('test.share_session'))::text,true);

-- Full ordinary task/category editing within exactly one protocol.
set local role anon;
do $$ declare affected integer; begin
 assert (public.get_protocol_share()->>'ok')::boolean;
 assert (select count(*) from public.departments)=1;
 assert (select count(*) from public.protocols)=1;
 assert (select count(*) from public.categories)=1;
 assert (select count(*) from public.tasks)=1;
 assert (select count(*) from public.employees)=0;
 update public.tasks set done=true, name='Edited by recipient' where id='50000000-0000-4000-8000-000000000001';
 get diagnostics affected=row_count; assert affected=1;
 update public.tasks set name='Illegal sibling edit' where id='50000000-0000-4000-8000-000000000002';
 get diagnostics affected=row_count; assert affected=0;
 update public.departments set name='Illegal department edit';
 get diagnostics affected=row_count; assert affected=0;
 update public.protocols set name='Edited protocol' where id='30000000-0000-4000-8000-000000000001';
 get diagnostics affected=row_count; assert affected=1;
 insert into public.categories(id,protocol_id,name,color,sort_order) values('40000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001','New category','#ffffff',1);
 insert into public.tasks(id,category_id,name,sort_order) values('50000000-0000-4000-8000-000000000003','40000000-0000-4000-8000-000000000003','New task',1);
 update public.tasks set category_id='40000000-0000-4000-8000-000000000001' where id='50000000-0000-4000-8000-000000000003';
 delete from public.tasks where id='50000000-0000-4000-8000-000000000003';
 delete from public.categories where id='40000000-0000-4000-8000-000000000003';
 begin
   update public.tasks set category_id='40000000-0000-4000-8000-000000000002' where id='50000000-0000-4000-8000-000000000001';
   raise exception 'cross-protocol task movement allowed';
 exception when insufficient_privilege then null; end;
 begin
   update public.categories set protocol_id='30000000-0000-4000-8000-000000000002' where id='40000000-0000-4000-8000-000000000001';
   raise exception 'cross-protocol category movement allowed';
 exception when insufficient_privilege then null; end;
 begin
   update public.protocols set department_id='20000000-0000-4000-8000-000000000002' where id='30000000-0000-4000-8000-000000000001';
   raise exception 'cross-department protocol movement allowed';
 exception when insufficient_privilege then null; end;
 begin
   insert into public.protocols(department_id,name) values('20000000-0000-4000-8000-000000000001','Illegal sibling');
   raise exception 'recipient created sibling';
 exception when insufficient_privilege then null; end;
 assert (public.create_protocol_share('30000000-0000-4000-8000-000000000001','another@example.com','test-share-password')->'error'->>'code')='recipient_cannot_reshare';
end $$;
reset role;

-- Expired sessions and forged sessions fail closed, including direct table reads.
update private.protocol_share_sessions set expires_at=now()-interval '1 second';
set local role anon;
do $$ begin
 assert (public.get_protocol_share()->'error'->>'code')='share_session_expired';
 assert (select count(*) from public.tasks)=0;
end $$;
reset role;
update private.protocol_share_sessions set expires_at=now()+interval '24 hours';
select set_config('request.headers',json_build_object('x-protocol-share',current_setting('test.share_token'),'x-protocol-session',repeat('f',64))::text,true);
set local role anon;
do $$ begin assert (select count(*) from public.tasks)=0; end $$;
reset role;

-- Five failures are persisted, lock attempts are denied, and expired locks recover.
set local role anon;
do $$ declare response jsonb; begin
 for n in 1..5 loop
   response:=public.unlock_protocol_share('recipient@example.com','wrong-password');
   assert response->'error'->>'code'='invalid_share_credentials';
 end loop;
 response:=public.unlock_protocol_share('recipient@example.com','test-share-password');
 assert response->'error'->>'code'='share_rate_limited';
 assert current_setting('response.status')='429';
end $$;
reset role;
update private.protocol_shares set locked_until=now()-interval '1 second' where revoked_at is null;
set local role anon;
do $$ begin assert (public.unlock_protocol_share('recipient@example.com','test-share-password')->>'ok')::boolean; end $$;
reset role;

-- Replacement invalidates old links and sessions, and requires the new password.
select set_config('request.headers','{}',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
set local role authenticated;
do $$ declare response jsonb; begin
 response:=public.create_protocol_share('30000000-0000-4000-8000-000000000001','recipient@example.com','replacement-password');
 assert (response->>'ok')::boolean;
 perform set_config('test.replacement_token',response->'data'->>'token',true);
 assert (public.create_protocol_share('30000000-0000-4000-8000-000000000001','recipient@example.com')->'error'->>'code')='password_required';
 assert (public.create_protocol_share('30000000-0000-4000-8000-000000000001','recipient@example.com','short')->'error'->>'code')='invalid_input';
end $$;
reset role;
select set_config('request.jwt.claims','{}',true);
select set_config('request.headers',json_build_object('x-protocol-share',current_setting('test.share_token'),'x-protocol-session',current_setting('test.share_session'))::text,true);
set local role anon;
do $$ begin
 assert (public.get_protocol_share()->'error'->>'code')='invalid_or_revoked_link';
 assert (public.unlock_protocol_share('recipient@example.com','test-share-password')->'error'->>'code')='invalid_or_revoked_link';
 assert (select count(*) from public.tasks)=0;
end $$;
reset role;
select set_config('request.headers',json_build_object('x-protocol-share',current_setting('test.replacement_token'),'x-protocol-session',current_setting('test.share_session'))::text,true);
set local role anon;
do $$ declare response jsonb; begin
 assert (public.get_protocol_share()->'error'->>'code')='share_session_expired';
 assert (public.unlock_protocol_share('recipient@example.com','test-share-password')->'error'->>'code')='invalid_share_credentials';
 response:=public.unlock_protocol_share('recipient@example.com','replacement-password');
 assert (response->>'ok')::boolean;
 perform set_config('request.headers',json_build_object('x-protocol-share',current_setting('test.replacement_token'),'x-protocol-session',response->'data'->>'session_token')::text,true);
 assert (select count(*) from public.tasks)=1;
 begin
   insert into public.employees(first_name) values('Forbidden');
   raise exception 'shared employee writes allowed';
 exception when insufficient_privilege then null; end;
 begin
   insert into public.shift_approvals(protocol_id,department_id) values('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001');
   raise exception 'shared approval writes allowed';
 exception when insufficient_privilege then null; end;
 begin
   perform password_hash from private.protocol_shares;
   raise exception 'password hashes exposed';
 exception when insufficient_privilege then null; end;
end $$;
reset role;

-- Unexpected provider/database failures retain the same envelope and diagnostic path.
select set_config('request.headers','{}',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
create function private.test_share_insert_failure() returns trigger language plpgsql as $$
begin raise exception 'Synthetic failure'; end $$;
create trigger test_share_insert_failure before insert on private.protocol_shares
for each row execute function private.test_share_insert_failure();
set local role authenticated;
do $$ declare response jsonb; begin
 response:=public.create_protocol_share('30000000-0000-4000-8000-000000000001','recipient@example.com','test-password');
 assert response->'error'->>'code'='share_create_failed';
 assert response->'data'='null'::jsonb;
 assert current_setting('response.status')='500';
end $$;
reset role;
drop trigger test_share_insert_failure on private.protocol_shares;
select set_config('request.headers',json_build_object('x-protocol-share',current_setting('test.replacement_token'))::text,true);
create trigger test_share_session_failure before insert on private.protocol_share_sessions
for each row execute function private.test_share_insert_failure();
set local role anon;
do $$ declare response jsonb; begin
 response:=public.unlock_protocol_share('recipient@example.com','replacement-password');
 assert response->'error'->>'code'='share_unlock_failed';
 assert current_setting('response.status')='500';
end $$;
reset role;
drop trigger test_share_session_failure on private.protocol_share_sessions;

-- Normal anonymous app unchanged; token cannot be bypassed by malformed value.
select set_config('request.jwt.claims','{}',true);
select set_config('request.headers','{}',true);
set local role anon;
do $$ begin
 assert (select count(*) from public.protocols where id='30000000-0000-4000-8000-000000000003')=1;
 assert (select name from public.protocols where id='30000000-0000-4000-8000-000000000003')='Public protocol';
end $$;
reset role;
select set_config('request.headers','{"x-protocol-share":"invalid"}',true);
set local role anon;
do $$ begin assert (select count(*) from public.protocols)=0; end $$;
reset role;
rollback;
select 'Password sharing policy tests passed' as result;
