-- =============================================================================
-- Supabase Row Level Security (RLS) Policies & Realtime Setup
-- Execute this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bxvfhydahvyrtvpoczrw/sql/new
-- =============================================================================

-- 1. Enable RLS on all tables and grant access to anon & authenticated roles
-- (Allows the clinic staff app to read & write across front desk, doctor desk, triage, lab & cashier)

DO $$ 
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'profiles',
    'patients',
    'triage_vitals',
    'doctor_schedules',
    'queue_tickets',
    'consultations',
    'prescriptions',
    'prescription_items',
    'lab_orders',
    'lab_results',
    'invoices',
    'invoice_items',
    'audit_logs'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    
    -- Drop existing wide policy if present to avoid duplicate error
    EXECUTE format('DROP POLICY IF EXISTS "clinic_full_access" ON public.%I;', tbl);
    
    -- Create permissive policy for clinic operations
    EXECUTE format(
      'CREATE POLICY "clinic_full_access" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);',
      tbl
    );
  END LOOP;
END $$;

-- 2. Enable Realtime Broadcasting on essential live tables
ALTER PUBLICATION supabase_realtime ADD TABLE queue_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE lab_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE triage_vitals;

-- 3. Create Public Storage Bucket for medical documents and lab reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-documents', 'clinic-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for clinic-documents
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
FOR ALL TO anon, authenticated
USING (bucket_id = 'clinic-documents')
WITH CHECK (bucket_id = 'clinic-documents');

-- 4. Seed Staff Profiles
INSERT INTO profiles (id, full_name, email, phone, role, department, license_number)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Dr. Selamawit Tadesse', 'admin@clinic.et', '+251-911-234567', 'admin', 'Administration', 'MED-DIR-001'),
  ('22222222-2222-2222-2222-222222222222', 'Dr. Henok Bekele', 'doctor@clinic.et', '+251-912-345678', 'doctor', 'General Outpatient', 'DOC-ET-4891'),
  ('33333333-3333-3333-3333-333333333333', 'Sr. Bethelhem Girma', 'nurse@clinic.et', '+251-913-456789', 'nurse', 'Triage Station', 'NUR-ET-8201'),
  ('44444444-4444-4444-4444-444444444444', 'Dawit Alemu', 'reception@clinic.et', '+251-914-567890', 'receptionist', 'Front Desk', 'REC-01'),
  ('55555555-5555-5555-5555-555555555555', 'Yared Kassahun', 'lab@clinic.et', '+251-915-678901', 'lab_tech', 'Diagnostic Laboratory', 'LAB-TECH-103'),
  ('66666666-6666-6666-6666-666666666666', 'Hanan Mohammed', 'cashier@clinic.et', '+251-916-789012', 'cashier', 'Finance & Billing', 'FIN-02')
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Demo Patients
INSERT INTO patients (id, mrn, full_name, gender, age, phone, address, kebele, woreda, blood_type, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone, emergency_contact_relation)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'MRN-2026-00101', 'Abebe Kebede', 'Male', 38, '+251-911-102030', 'Bole Subcity, Addis Ababa', '03', 'Bole', 'O+', 'Penicillin', 'Mild Hypertension', 'Tigist Kebede', '+251-922-334455', 'Spouse'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'MRN-2026-00102', 'Chaltu Dibaba', 'Female', 27, '+251-933-405060', 'Yeka Subcity, Addis Ababa', '08', 'Yeka', 'A+', 'None', 'None', 'Gemechu Dibaba', '+251-944-556677', 'Brother'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'MRN-2026-00103', 'Mulugeta Tesfaye', 'Male', 54, '+251-912-708090', 'Kirkos Subcity, Addis Ababa', '02', 'Kirkos', 'B+', 'Sulfa drugs', 'Type 2 Diabetes', 'Almaz Worku', '+251-911-889900', 'Wife')
ON CONFLICT (id) DO NOTHING;
