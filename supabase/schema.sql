-- =============================================================================
-- Clinic Management System (PWA) - Supabase PostgreSQL Schema
-- Supports Outpatient Clinics in Ethiopia with Offline-First Capability & Realtime
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles & RBAC
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'nurse', 'receptionist', 'lab_tech', 'cashier');

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE, -- References auth.users(id) in Supabase Auth
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'receptionist',
  department TEXT,
  license_number TEXT,
  digital_signature_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Patients & Medical Records
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mrn TEXT UNIQUE NOT NULL, -- Format: MRN-YYYY-XXXXX
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  dob DATE,
  age INT,
  phone TEXT NOT NULL,
  address TEXT,
  kebele TEXT,
  woreda TEXT,
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  allergies TEXT, -- Comma-separated or detailed notes
  chronic_conditions TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients (mrn);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients (phone);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients USING gin (to_tsvector('simple', full_name));

-- 3. Triage & Vital Signs
CREATE TABLE IF NOT EXISTS triage_vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  nurse_id UUID REFERENCES profiles(id),
  systolic_bp INT, -- mmHg
  diastolic_bp INT, -- mmHg
  temperature NUMERIC(4,1), -- Celsius
  pulse_rate INT, -- bpm
  respiratory_rate INT, -- breaths/min
  spo2 INT, -- oxygen saturation %
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,1),
  bmi NUMERIC(4,1),
  bmi_category TEXT,
  pain_score INT CHECK (pain_score BETWEEN 0 AND 10),
  priority_level TEXT DEFAULT 'normal' CHECK (priority_level IN ('normal', 'urgent', 'emergency')),
  chief_complaint_short TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_triage_patient_id ON triage_vitals (patient_id);

-- 4. Doctor Schedules & Availability
CREATE TABLE IF NOT EXISTS doctor_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number TEXT,
  consultation_duration_mins INT DEFAULT 15,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Realtime Queue Tickets
CREATE TYPE queue_status AS ENUM (
  'registered',
  'triaged',
  'waiting_doctor',
  'in_consultation',
  'pending_lab',
  'pending_payment',
  'completed',
  'cancelled'
);

CREATE TABLE IF NOT EXISTS queue_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT NOT NULL, -- e.g. Q-101
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id),
  department TEXT DEFAULT 'General Outpatient',
  room_number TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent', 'emergency')),
  status queue_status NOT NULL DEFAULT 'registered',
  called_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_queue_status ON queue_tickets (status);
CREATE INDEX IF NOT EXISTS idx_queue_created_at ON queue_tickets (created_at);

-- 6. Consultations & SOAP Electronic Health Records (EHR)
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES queue_tickets(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id),
  -- Subjective
  chief_complaint TEXT NOT NULL,
  history_of_present_illness TEXT,
  review_of_systems TEXT,
  -- Objective
  physical_examination TEXT,
  vitals_snapshot JSONB,
  -- Assessment
  icd10_code TEXT,
  icd10_description TEXT,
  diagnosis_notes TEXT,
  -- Plan
  treatment_plan TEXT NOT NULL,
  follow_up_date DATE,
  doctor_signature_data TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('draft', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations (patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor ON consultations (doctor_id);

-- 7. Digital E-Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT DEFAULT 'prescribed' CHECK (status IN ('prescribed', 'sent_to_pharmacy', 'dispensed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prescription_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  drug_name TEXT NOT NULL,
  dosage TEXT NOT NULL, -- e.g. 500mg
  route TEXT DEFAULT 'Oral', -- Oral, IV, IM, Topical, Inhalation
  frequency TEXT NOT NULL, -- OD, BID, TID, QID, PRN
  duration TEXT NOT NULL, -- e.g. 5 days, 1 week
  instructions TEXT, -- e.g. Take after meals
  quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Diagnostic Lab Orders & Results
CREATE TABLE IF NOT EXISTS lab_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id),
  test_name TEXT NOT NULL,
  test_code TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent', 'stat')),
  status TEXT DEFAULT 'ordered' CHECK (status IN ('ordered', 'sample_collected', 'analyzing', 'completed', 'cancelled')),
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  collected_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS lab_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lab_order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES profiles(id),
  parameter_name TEXT NOT NULL,
  result_value TEXT NOT NULL,
  unit TEXT,
  reference_range TEXT,
  is_abnormal BOOLEAN DEFAULT FALSE,
  remarks TEXT,
  report_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Cashier Desk & Itemized Invoicing
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL, -- INV-2026-XXXXX
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES consultations(id),
  cashier_id UUID REFERENCES profiles(id),
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- in ETB (Ethiopian Birr)
  discount_amount NUMERIC(10,2) DEFAULT 0.00,
  net_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'telebirr', 'cbe_birr', 'insurance')),
  payment_reference TEXT, -- Telebirr / CBE Birr transaction ID
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('consultation', 'lab_test', 'medication', 'procedure', 'supply')),
  description TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  total_price NUMERIC(10,2) NOT NULL
);

-- 10. Audit Logging (Security & HIPAA / Health Compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime Setup: Publish queue_tickets and lab_orders to Supabase Realtime channel
-- (Execute in Supabase SQL editor):
-- ALTER PUBLICATION supabase_realtime ADD TABLE queue_tickets;
-- ALTER PUBLICATION supabase_realtime ADD TABLE lab_orders;
-- ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
