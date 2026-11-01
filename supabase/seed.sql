-- Local development and test data only. Both users sign in with the password "password123".
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
    'authenticated', 'authenticated', 'owner-a@example.com',
    extensions.crypt('password123', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
    'authenticated', 'authenticated', 'owner-b@example.com',
    extensions.crypt('password123', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now()
  );

-- The signup trigger has already created one business per user.
update public.businesses set name = 'Cafe A' where user_id = '11111111-1111-1111-1111-111111111111';
update public.businesses set name = 'Cafe B' where user_id = '22222222-2222-2222-2222-222222222222';

insert into public.locations (business_id, user_id, branch_name, address)
select id, user_id, 'Downtown', '12 Main St' from public.businesses where name = 'Cafe A'
union all
select id, user_id, 'Riverside', '4 River Rd' from public.businesses where name = 'Cafe A'
union all
select id, user_id, 'Airport', 'Terminal 2' from public.businesses where name = 'Cafe B'
union all
select id, user_id, 'Old Town', '9 Castle Ln' from public.businesses where name = 'Cafe B';
