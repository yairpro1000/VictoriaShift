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
 response:=public.create_protocol_share('30000000-0000-4000-8000-000000000001',' RECIPIENT@example.com ');
 assert (response->>'ok')::boolean, 'owner could not share';
 perform set_config('test.share_token',response->'data'->>'token',true);
 assert (public.create_protocol_share('30000000-0000-4000-8000-000000000003','recipient@example.com')->'error'->>'code')='not_protocol_manager';
 assert (public.create_protocol_share('invalid-id','invalid-email')->'error'->>'code')='invalid_input';
end $$;
reset role;
select set_config('request.headers',json_build_object('x-protocol-share',current_setting('test.share_token'))::text,true);

-- Bearer link is insufficient, even for public protocols.
select set_config('request.jwt.claims','{}',true);
set local role anon;
do $$ begin
 assert (public.get_protocol_share()->'error'->>'code')='sign_in_required';
 assert (select count(*) from public.protocols)=0;
 assert (select count(*) from public.tasks)=0;
end $$;
reset role;

-- A user-controlled metadata email never satisfies recipient authorization.
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated","email":"recipient@example.com"}',true);
set local role authenticated;
do $$ begin
 assert (public.get_protocol_share()->'error'->>'code')='recipient_email_mismatch';
 assert (select count(*) from public.protocols)=0;
 assert (select count(*) from public.tasks)=0;
end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000004","role":"authenticated"}',true);
set local role authenticated;
do $$ begin
 assert (public.get_protocol_share()->'error'->>'code')='verified_email_required';
end $$;
reset role;

-- Full ordinary task/category editing within exactly one protocol.
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
set local role authenticated;
do $$ declare affected integer; begin
 assert (public.get_protocol_share()->>'ok')::boolean;
 assert (select count(*) from public.departments)=1;
 assert (select count(*) from public.protocols)=1;
 assert (select count(*) from public.categories)=1;
 assert (select count(*) from public.tasks)=1;
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
 assert (public.create_protocol_share('30000000-0000-4000-8000-000000000001','another@example.com')->'error'->>'code')='recipient_cannot_reshare';
end $$;
reset role;

-- Email changes and revocation invalidate access on the next request.
update auth.users set email='changed@example.com' where id='10000000-0000-4000-8000-000000000002';
set local role authenticated;
do $$ begin
 assert (public.get_protocol_share()->'error'->>'code')='recipient_email_mismatch';
 assert (select count(*) from public.tasks)=0;
end $$;
reset role;
update auth.users set email='recipient@example.com' where id='10000000-0000-4000-8000-000000000002';
update private.protocol_shares set revoked_at=now() where protocol_id='30000000-0000-4000-8000-000000000001';
set local role authenticated;
do $$ begin
 assert (public.get_protocol_share()->'error'->>'code')='invalid_or_revoked_link';
 assert (select count(*) from public.tasks)=0;
end $$;
reset role;

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
select 'Protocol sharing policy tests passed' as result;
