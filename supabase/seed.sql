-- =============================================================================
-- Clinic Management System (PWA) - Supabase Seed Data
-- =============================================================================

-- 1. Demo Staff Profiles
INSERT INTO profiles (id, full_name, email, phone, role, department, license_number)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Dr. Selamawit Tadesse', 'admin@clinic.et', '+251-911-234567', 'admin', 'Administration', 'MED-DIR-001'),
  ('22222222-2222-2222-2222-222222222222', 'Dr. Henok Bekele', 'doctor@clinic.et', '+251-912-345678', 'doctor', 'General Outpatient', 'DOC-ET-4891'),
  ('33333333-3333-3333-3333-333333333333', 'Sr. Bethelhem Girma', 'nurse@clinic.et', '+251-913-456789', 'nurse', 'Triage Station', 'NUR-ET-8201'),
  ('44444444-4444-4444-4444-444444444444', 'Dawit Alemu', 'reception@clinic.et', '+251-914-567890', 'receptionist', 'Front Desk', 'REC-01'),
  ('55555555-5555-5555-5555-555555555555', 'Yared Kassahun', 'lab@clinic.et', '+251-915-678901', 'lab_tech', 'Diagnostic Laboratory', 'LAB-TECH-103'),
  ('66666666-6666-6666-6666-666666666666', 'Hanan Mohammed', 'cashier@clinic.et', '+251-916-789012', 'cashier', 'Finance & Billing', 'FIN-02')
ON CONFLICT (id) DO NOTHING;

-- 2. Doctor Schedules
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, room_number, consultation_duration_mins)
VALUES
  ('22222222-2222-2222-2222-222222222222', 1, '08:30:00', '17:00:00', 'Room 201', 15),
  ('22222222-2222-2222-2222-222222222222', 2, '08:30:00', '17:00:00', 'Room 201', 15),
  ('22222222-2222-2222-2222-222222222222', 3, '08:30:00', '17:00:00', 'Room 201', 15),
  ('22222222-2222-2222-2222-222222222222', 4, '08:30:00', '17:00:00', 'Room 201', 15),
  ('22222222-2222-2222-2222-222222222222', 5, '08:30:00', '17:00:00', 'Room 201', 15);

-- 3. Initial Demo Patients
INSERT INTO patients (id, mrn, full_name, gender, age, phone, address, kebele, woreda, blood_type, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone, emergency_contact_relation)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'MRN-2026-00101', 'Abebe Kebede', 'Male', 38, '+251-911-102030', 'Bole Subcity, Addis Ababa', '03', 'Bole', 'O+', 'Penicillin', 'Mild Hypertension', 'Tigist Kebede', '+251-922-334455', 'Spouse'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'MRN-2026-00102', 'Chaltu Dibaba', 'Female', 27, '+251-933-405060', 'Yeka Subcity, Addis Ababa', '08', 'Yeka', 'A+', 'None', 'None', 'Gemechu Dibaba', '+251-944-556677', 'Brother'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'MRN-2026-00103', 'Mulugeta Tesfaye', 'Male', 54, '+251-912-708090', 'Kirkos Subcity, Addis Ababa', '02', 'Kirkos', 'B+', 'Sulfa drugs', 'Type 2 Diabetes', 'Almaz Worku', '+251-911-889900', 'Wife')
ON CONFLICT (id) DO NOTHING;

-- 4. Initial Triage Vitals
INSERT INTO triage_vitals (id, patient_id, nurse_id, systolic_bp, diastolic_bp, temperature, pulse_rate, respiratory_rate, spo2, height_cm, weight_kg, bmi, bmi_category, pain_score, priority_level, chief_complaint_short)
VALUES
  ('t1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 135, 88, 38.6, 88, 18, 97, 175.0, 74.0, 24.2, 'Normal weight', 4, 'urgent', 'High fever, severe headache, and joint pain for 3 days'),
  ('t2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 115, 75, 36.8, 72, 16, 99, 162.0, 58.0, 22.1, 'Normal weight', 2, 'normal', 'Routine checkup and persistent dry cough'),
  ('t3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 145, 95, 37.1, 80, 18, 96, 170.0, 85.0, 29.4, 'Overweight', 3, 'normal', 'Diabetes follow-up, blurred vision and dizziness')
ON CONFLICT (id) DO NOTHING;

-- 5. Queue Tickets
INSERT INTO queue_tickets (id, ticket_number, patient_id, doctor_id, department, room_number, priority, status, called_at)
VALUES
  ('q1111111-1111-1111-1111-111111111111', 'Q-101', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'General Outpatient', 'Room 201', 'urgent', 'in_consultation', NOW()),
  ('q2222222-2222-2222-2222-222222222222', 'Q-102', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'General Outpatient', 'Room 201', 'normal', 'waiting_doctor', NULL),
  ('q3333333-3333-3333-3333-333333333333', 'Q-103', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'General Outpatient', 'Room 201', 'normal', 'triaged', NULL)
ON CONFLICT (id) DO NOTHING;
