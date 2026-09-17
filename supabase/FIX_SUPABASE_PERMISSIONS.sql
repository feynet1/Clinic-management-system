-- =============================================================================
-- ONE-CLICK FIX FOR SUPABASE PERMISSIONS (RLS)
-- Paste and Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bxvfhydahvyrtvpoczrw/sql/new
-- =============================================================================

-- 1. Disable Row Level Security (RLS) on all clinic tables
-- This immediately allows your clinic web app to read and insert patients, vitals, tickets, labs, etc.
ALTER TABLE IF EXISTS public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.triage_vitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.doctor_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.queue_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.consultations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prescription_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lab_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lab_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoice_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs DISABLE ROW LEVEL SECURITY;

-- 2. Grant full table permissions to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Enable Realtime Broadcasting on essential live tables
ALTER PUBLICATION supabase_realtime ADD TABLE queue_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE lab_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE triage_vitals;
ALTER PUBLICATION supabase_realtime ADD TABLE patients;

-- 4. Create Public Storage Bucket for medical documents and lab reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-documents', 'clinic-documents', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
FOR ALL TO anon, authenticated
USING (bucket_id = 'clinic-documents')
WITH CHECK (bucket_id = 'clinic-documents');
