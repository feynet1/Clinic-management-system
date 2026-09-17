-- =============================================================================
-- DEFINITIVE FIX FOR GOTRUE 500:
-- "Database error querying schema" & "Database error checking email"
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── 1. CLEAN UP ALL BROKEN ACCOUNTS FIRST ─────────────────────────────────────
-- Remove identities and users created with NULL token values
DELETE FROM auth.identities 
WHERE identity_data->>'email' LIKE '%@clinic%' 
   OR provider_id LIKE '%@clinic%';

DELETE FROM auth.users 
WHERE email LIKE '%@clinic%';

-- ── 2. FIX ANY REMAINING NULL TOKENS IN auth.users ────────────────────────────
-- This prevents GoTrue's "converting NULL to string is unsupported" crash
UPDATE auth.users SET
  confirmation_token          = COALESCE(confirmation_token, ''),
  recovery_token              = COALESCE(recovery_token, ''),
  email_change_token_new      = COALESCE(email_change_token_new, ''),
  email_change                = COALESCE(email_change, ''),
  phone_change                = COALESCE(phone_change, ''),
  phone_change_token          = COALESCE(phone_change_token, ''),
  email_change_token_current  = COALESCE(email_change_token_current, ''),
  reauthentication_token      = COALESCE(reauthentication_token, '')
WHERE confirmation_token IS NULL
   OR recovery_token IS NULL
   OR email_change_token_new IS NULL
   OR email_change IS NULL;

-- ── 3. INSERT THE 6 STAFF ACCOUNTS WITH PROPER EMPTY STRINGS (NOT NULL) ──────

-- 1. ADMIN
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, recovery_token,
  email_change_token_new, email_change, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'admin@cliniccare.com',
  crypt('Clinic@2026', gen_salt('bf')),
  NOW(), '', '', '', '', '', '', '', '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dr. Selamawit Tadesse","role":"admin"}'::jsonb,
  false, NOW(), NOW()
);

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'admin@cliniccare.com',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@cliniccare.com"}'::jsonb,
  'email', NOW(), NOW(), NOW()
);

-- 2. DOCTOR
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, recovery_token,
  email_change_token_new, email_change, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated',
  'doctor@cliniccare.com',
  crypt('Clinic@2026', gen_salt('bf')),
  NOW(), '', '', '', '', '', '', '', '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dr. Henok Bekele","role":"doctor"}'::jsonb,
  false, NOW(), NOW()
);

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222',
  'doctor@cliniccare.com',
  '{"sub":"22222222-2222-2222-2222-222222222222","email":"doctor@cliniccare.com"}'::jsonb,
  'email', NOW(), NOW(), NOW()
);

-- 3. NURSE
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, recovery_token,
  email_change_token_new, email_change, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333333',
  'authenticated', 'authenticated',
  'nurse@cliniccare.com',
  crypt('Clinic@2026', gen_salt('bf')),
  NOW(), '', '', '', '', '', '', '', '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Sr. Bethelhem Girma","role":"nurse"}'::jsonb,
  false, NOW(), NOW()
);

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '33333333-3333-3333-3333-333333333333',
  'nurse@cliniccare.com',
  '{"sub":"33333333-3333-3333-3333-333333333333","email":"nurse@cliniccare.com"}'::jsonb,
  'email', NOW(), NOW(), NOW()
);

-- 4. RECEPTIONIST
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, recovery_token,
  email_change_token_new, email_change, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '44444444-4444-4444-4444-444444444444',
  'authenticated', 'authenticated',
  'reception@cliniccare.com',
  crypt('Clinic@2026', gen_salt('bf')),
  NOW(), '', '', '', '', '', '', '', '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dawit Alemu","role":"receptionist"}'::jsonb,
  false, NOW(), NOW()
);

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '44444444-4444-4444-4444-444444444444',
  'reception@cliniccare.com',
  '{"sub":"44444444-4444-4444-4444-444444444444","email":"reception@cliniccare.com"}'::jsonb,
  'email', NOW(), NOW(), NOW()
);

-- 5. LAB TECHNICIAN
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, recovery_token,
  email_change_token_new, email_change, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '55555555-5555-5555-5555-555555555555',
  'authenticated', 'authenticated',
  'lab@cliniccare.com',
  crypt('Clinic@2026', gen_salt('bf')),
  NOW(), '', '', '', '', '', '', '', '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Yared Kassahun","role":"lab_tech"}'::jsonb,
  false, NOW(), NOW()
);

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '55555555-5555-5555-5555-555555555555',
  'lab@cliniccare.com',
  '{"sub":"55555555-5555-5555-5555-555555555555","email":"lab@cliniccare.com"}'::jsonb,
  'email', NOW(), NOW(), NOW()
);

-- 6. CASHIER
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, recovery_token,
  email_change_token_new, email_change, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '66666666-6666-6666-6666-666666666666',
  'authenticated', 'authenticated',
  'cashier@cliniccare.com',
  crypt('Clinic@2026', gen_salt('bf')),
  NOW(), '', '', '', '', '', '', '', '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Hanan Mohammed","role":"cashier"}'::jsonb,
  false, NOW(), NOW()
);

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '66666666-6666-6666-6666-666666666666',
  'cashier@cliniccare.com',
  '{"sub":"66666666-6666-6666-6666-666666666666","email":"cashier@cliniccare.com"}'::jsonb,
  'email', NOW(), NOW(), NOW()
);

-- ── 4. LINK ALL TO public.profiles ───────────────────────────────────────────
INSERT INTO public.profiles (id, user_id, full_name, email, phone, role, department, license_number, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Dr. Selamawit Tadesse', 'admin@cliniccare.com', '+251-911-000000', 'admin', 'Administration', 'MED-DIR-001', true),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Dr. Henok Bekele', 'doctor@cliniccare.com', '+251-912-000000', 'doctor', 'General Outpatient', 'DOC-ET-4891', true),
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Sr. Bethelhem Girma', 'nurse@cliniccare.com', '+251-913-000000', 'nurse', 'Triage Station', 'NUR-ET-8201', true),
  ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Dawit Alemu', 'reception@cliniccare.com', '+251-914-000000', 'receptionist', 'Front Desk', 'REC-01', true),
  ('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Yared Kassahun', 'lab@cliniccare.com', '+251-915-000000', 'lab_tech', 'Diagnostic Laboratory', 'LAB-TECH-103', true),
  ('66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 'Hanan Mohammed', 'cashier@cliniccare.com', '+251-916-000000', 'cashier', 'Finance & Billing', 'FIN-02', true)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  license_number = EXCLUDED.license_number,
  is_active = true;

-- ── 5. VERIFY: ALL 6 USERS READY WITH CONFIRMED STATUS ───────────────────────
SELECT 
  u.email, 
  u.email_confirmed_at IS NOT NULL AS confirmed,
  p.role,
  p.full_name
FROM auth.users u
JOIN public.profiles p ON p.user_id = u.id
WHERE u.email LIKE '%@cliniccare.com'
ORDER BY p.role;
