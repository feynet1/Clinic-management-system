-- =============================================================================
-- FIX GOTRUE 500 ERROR ("Database error checking email" / "querying schema")
-- Paste and Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bxvfhydahvyrtvpoczrw/sql/new
-- =============================================================================

-- 1. Check what users exist in auth.users right now
SELECT id, email, created_at FROM auth.users;

-- 2. Fix NULL string values that cause GoTrue (Supabase Auth) to crash with:
-- "Scan error: converting NULL to string is unsupported"
UPDATE auth.users
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  phone = COALESCE(phone, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token = COALESCE(reauthentication_token, '');

-- 3. If there are any broken test accounts, remove them completely
DELETE FROM auth.identities WHERE identity_data->>'email' LIKE '%@clinic%';
DELETE FROM auth.users WHERE email LIKE '%@clinic%';

-- 4. Verify auth.users is clean
SELECT count(*) AS total_users_remaining FROM auth.users;
