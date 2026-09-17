-- =============================================================================
-- MIGRATION: New Clinical Modules & Cloud Sync
-- 1. Appointments & Doctor Schedules
-- 2. Pharmacy Dispensing Portal & Drug Inventory
-- 3. Diagnostic Lab Attachments
-- 4. Pharmacist Staff Auth User & Profile (Pharm. Meron Haile)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── 1. CONVERT PROFILES.ROLE TO TEXT (PREVENTS POSTGRES 55P04 ENUM ERROR) ─────
-- Changing profiles.role to TEXT allows new roles ('pharmacist', etc.) to be
-- inserted immediately without PostgreSQL transaction lock issues.
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE public.profiles ALTER COLUMN role TYPE TEXT;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'receptionist';


-- ── 2. EXPAND EXISTING TABLES WITH NEW CLINICAL FIELDS ─────────────────────────

-- Prescriptions: Pharmacy dispensing tracking & pharmacist counseling
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS dispensed_at TIMESTAMPTZ;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS dispensed_by TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS pharmacist_notes TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS batch_number_used TEXT;

-- Lab Orders: Diagnostic file attachments (scans, X-rays, PDFs)
ALTER TABLE lab_orders ADD COLUMN IF NOT EXISTS report_file_url TEXT;

-- Doctor Schedules: Slot duration & capacity
ALTER TABLE doctor_schedules ADD COLUMN IF NOT EXISTS slot_duration_minutes INT DEFAULT 15;
ALTER TABLE doctor_schedules ADD COLUMN IF NOT EXISTS max_patients_per_slot INT DEFAULT 1;
ALTER TABLE doctor_schedules ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;


-- ── 3. APPOINTMENTS TABLE (PDF PAGE 3) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_number TEXT NOT NULL UNIQUE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  ticket_id UUID REFERENCES queue_tickets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments (doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);


-- ── 4. MEDICATION INVENTORY TABLE (PDF PAGE 4) ────────────────────────────────
CREATE TABLE IF NOT EXISTS medication_inventory (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  generic_name TEXT NOT NULL,
  category TEXT NOT NULL,
  dosage_form TEXT NOT NULL,
  strength TEXT NOT NULL,
  unit_price_etb NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  stock_quantity INT NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 20,
  batch_number TEXT,
  expiry_date DATE,
  manufacturer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_med_inventory_code ON medication_inventory (code);
CREATE INDEX IF NOT EXISTS idx_med_inventory_category ON medication_inventory (category);


-- ── 5. SEED ESSENTIAL ETHIOPIAN DRUG INVENTORY ─────────────────────────────────
INSERT INTO medication_inventory (
  id, code, name, generic_name, category, dosage_form, strength,
  unit_price_etb, stock_quantity, reorder_level, batch_number, expiry_date, manufacturer
) VALUES
  (
    'med-001', 'MED-AMX-500', 'Amoxicillin Trihydrate 500mg', 'Amoxicillin',
    'Antibacterial / Penicillin', 'Capsule', '500mg', 12.50, 480, 100,
    'ETH-AMX-2025-08', '2027-08-31', 'Ethiopian Pharmaceuticals Manufacturing Sh.Co. (EPHARM)'
  ),
  (
    'med-002', 'MED-CRT-AL', 'Artemether + Lumefantrine (Coartem 20/120)', 'Artemether + Lumefantrine',
    'Antimalarial (ACT)', 'Tablet', '20mg/120mg', 45.00, 210, 50,
    'NOVO-CRT-2025-11', '2027-11-30', 'Novartis Pharma / MOH Ethiopia'
  ),
  (
    'med-003', 'MED-PAR-500', 'Paracetamol 500mg BP', 'Acetaminophen / Paracetamol',
    'Analgesic & Antipyretic', 'Tablet', '500mg', 4.00, 1200, 200,
    'SINO-PAR-2025-02', '2028-02-28', 'Sino-Ethiopian Associates'
  ),
  (
    'med-004', 'MED-CIP-500', 'Ciprofloxacin HCl 500mg', 'Ciprofloxacin',
    'Fluoroquinolone Antibiotic', 'Film-coated Tablet', '500mg', 15.00, 320, 80,
    'CIP-EPH-2025-05', '2027-05-31', 'EPHARM'
  ),
  (
    'med-005', 'MED-OMP-20', 'Omeprazole Delayed-Release 20mg', 'Omeprazole',
    'Proton Pump Inhibitor (PPI)', 'Capsule', '20mg', 8.00, 45, 60,
    'OMP-EPH-2025-09', '2026-09-30', 'Cadila Pharmaceuticals Ethiopia'
  ),
  (
    'med-006', 'MED-MET-500', 'Metformin Hydrochloride 500mg', 'Metformin',
    'Antidiabetic (Oral)', 'Tablet', '500mg', 8.50, 540, 100,
    'MET-EPH-2025-06', '2027-06-30', 'EPHARM'
  ),
  (
    'med-007', 'MED-AML-5', 'Amlodipine Besylate 5mg', 'Amlodipine',
    'Antihypertensive (CCB)', 'Tablet', '5mg', 10.00, 390, 80,
    'AML-CAD-2025-04', '2027-04-30', 'Cadila Ethiopia'
  ),
  (
    'med-008', 'MED-ORS-SFT', 'Oral Rehydration Salts (ORS) Low Osmolarity', 'Electrolyte Replacement Powder',
    'Electrolytes & Fluid Replacement', 'Sachet for 1 Litre', 'Standard WHO formulation', 18.00, 600, 150,
    'ORS-UNICEF-2025-03', '2028-03-31', 'UNICEF / Ethiopian MOH Supply'
  )
ON CONFLICT (id) DO UPDATE SET
  stock_quantity = EXCLUDED.stock_quantity,
  unit_price_etb = EXCLUDED.unit_price_etb;


-- ── 6. ROW-LEVEL SECURITY & POLICIES ───────────────────────────────────────────
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated users on appointments" ON appointments;
CREATE POLICY "Allow all for authenticated users on appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for authenticated users on doctor_schedules" ON doctor_schedules;
CREATE POLICY "Allow all for authenticated users on doctor_schedules" ON doctor_schedules FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for authenticated users on medication_inventory" ON medication_inventory;
CREATE POLICY "Allow all for authenticated users on medication_inventory" ON medication_inventory FOR ALL USING (true) WITH CHECK (true);


-- ── 7. ENABLE REALTIME BROADCASTING ────────────────────────────────────────────
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE medication_inventory;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;


-- ── 8. PHARMACIST AUTH ACCOUNT & PROFILE SETUP ─────────────────────────────────
-- Creates Pharm. Meron Haile (pharmacy@cliniccare.com)
-- Safe from GoTrue "converting NULL to string is unsupported" 500 error!

DELETE FROM auth.identities WHERE identity_data->>'email' IN ('pharmacy@cliniccare.com', 'pharmacy@clinic.et');
DELETE FROM auth.users WHERE email IN ('pharmacy@cliniccare.com', 'pharmacy@clinic.et');

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, recovery_token,
  email_change_token_new, email_change, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '77777777-7777-7777-7777-777777777777',
  'authenticated', 'authenticated',
  'pharmacy@cliniccare.com',
  crypt('Clinic@2026', gen_salt('bf')),
  NOW(), '', '', '', '', '', '', '', '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Pharm. Meron Haile","role":"pharmacist"}'::jsonb,
  false, NOW(), NOW()
);

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '77777777-7777-7777-7777-777777777777',
  'pharmacy@cliniccare.com',
  '{"sub":"77777777-7777-7777-7777-777777777777","email":"pharmacy@cliniccare.com"}'::jsonb,
  'email', NOW(), NOW(), NOW()
);

-- Insert or update public.profiles
INSERT INTO public.profiles (
  id, user_id, full_name, email, phone, role,
  department, license_number, is_active
) VALUES (
  '77777777-7777-7777-7777-777777777777',
  '77777777-7777-7777-7777-777777777777',
  'Pharm. Meron Haile',
  'pharmacy@cliniccare.com',
  '+251 915 046 933',
  'pharmacist',
  'Central Pharmacy & Dispensary Unit',
  'PHA-ET-3302',
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'pharmacist',
  department = 'Central Pharmacy & Dispensary Unit',
  full_name = 'Pharm. Meron Haile';

-- Verification output
SELECT 'MIGRATION COMPLETE! Tables created and Pharm. Meron Haile activated.' AS status;
