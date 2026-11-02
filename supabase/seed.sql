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
update public.businesses set name = 'Cafe A', business_type = 'Café', onboarding_step = 'done' where user_id = '11111111-1111-1111-1111-111111111111';
update public.businesses set name = 'Cafe B', business_type = 'Café', onboarding_step = 'done' where user_id = '22222222-2222-2222-2222-222222222222';

insert into public.branches (business_id, user_id, name, google_maps_url)
select id, user_id, 'Downtown', 'https://maps.app.goo.gl/demoDowntownA' from public.businesses where name = 'Cafe A'
union all
select id, user_id, 'Riverside', 'https://maps.app.goo.gl/demoRiversideA' from public.businesses where name = 'Cafe A'
union all
select id, user_id, 'Airport', 'https://maps.app.goo.gl/demoAirportB' from public.businesses where name = 'Cafe B'
union all
select id, user_id, 'Old Town', 'https://maps.app.goo.gl/demoOldTownB' from public.businesses where name = 'Cafe B';
