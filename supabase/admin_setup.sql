-- ============================================================
-- MukiSoft Technology — admin authorization setup
-- File: supabase/admin_setup.sql
--
-- Registers the initial administrator in `public.admin_users`.
-- It looks up the user's UUID from `auth.users` by email, so you
-- do NOT have to copy/paste a UUID.
--
-- IMPORTANT: Run this AFTER the user has been created in
-- Supabase Authentication (Dashboard → Authentication → Users).
-- Without a matching auth.users row, the lookup returns no UUID
-- and nothing is inserted.
--
-- Steps:
--   1. In Supabase Auth (Authentication → Users), create a user
--      with email = 'mukituislamnishat@gmail.com' and a strong
--      password. Do not put the password in this SQL file.
--   2. Run the entire file in the Supabase SQL editor. The script
--      finds the user by email and inserts the admin_users row.
--   3. Done — sign in at /mukisoftadmin/login.
-- ============================================================

do $$
declare
  v_user_id uuid;
  v_email   text := 'mukituislamnishat@gmail.com';
begin
  -- Look up the auth user by email (case-insensitive).
  select id
    into v_user_id
    from auth.users
   where lower(email) = lower(v_email)
   limit 1;

  if v_user_id is null then
    raise notice
      'No auth.users row found for email %. Create the user in '
      'Authentication → Users first, then re-run this script.',
      v_email;
    return;
  end if;

  insert into public.admin_users (user_id, email, role, is_active)
  values (v_user_id, v_email, 'admin', true)
  on conflict (user_id) do update
    set role      = excluded.role,
        is_active = excluded.is_active,
        email     = excluded.email;

  raise notice 'Admin user % (%) registered successfully.', v_email, v_user_id;
end
$$;

-- ============================================================
-- Promote an additional admin (template)
-- Replace the email below with the user's email.
-- ============================================================
-- do $$
-- declare
--   v_user_id uuid;
-- begin
--   select id into v_user_id
--     from auth.users
--    where lower(email) = lower('admin@example.com')
--    limit 1;
--   if v_user_id is null then
--     raise notice 'Auth user admin@example.com not found.';
--     return;
--   end if;
--   insert into public.admin_users (user_id, email, role, is_active)
--   values (v_user_id, 'admin@example.com', 'admin', true)
--   on conflict (user_id) do update
--     set role      = excluded.role,
--         is_active = excluded.is_active,
--         email     = excluded.email;
-- end
-- $$;

-- ============================================================
-- Deactivate an admin
-- ============================================================
-- update public.admin_users
--    set is_active = false
--  where email = 'someone@example.com';