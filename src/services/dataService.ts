import { offlineDb, type PendingMutation } from '../lib/offlineDb';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { soundService } from './soundService';
import type {
  Patient,
  TriageVitals,
  QueueTicket,
  Consultation,
  Prescription,
  LabOrder,
  Invoice,
  PaymentMethod,
  QueueStatus,
  TriagePriority,
  LabOrderStatus,
  Appointment,
  AppointmentStatus,
  DoctorSchedule,
  MedicationInventoryItem,
} from '../types';
import { COMMON_MEDICATION_INVENTORY } from '../data/clinicalCatalog';

// =============================================================================
// Helper: UUID v4 Generator (Compliant with PostgreSQL UUID type)
// =============================================================================

export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// =============================================================================
// Entity Mappers: TypeScript camelCase <--> PostgreSQL snake_case
// =============================================================================

export function patientToDb(p: Patient) {
  return {
    id: p.id,
    mrn: p.mrn,
    full_name: p.fullName,
    gender: p.gender,
    age: p.age,
    phone: p.phone,
    address: p.address || null,
    kebele: p.kebele || null,
    woreda: p.woreda || null,
    blood_type: p.bloodType || null,
    allergies: p.allergies || null,
    chronic_conditions: p.chronicConditions || null,
    emergency_contact_name: p.emergencyContactName || null,
    emergency_contact_phone: p.emergencyContactPhone || null,
    emergency_contact_relation: p.emergencyContactRelation || null,
    created_at: p.createdAt,
    updated_at: p.createdAt,
  };
}

export function dbToPatient(row: any): Patient {
  return {
    id: row.id,
    mrn: row.mrn,
    fullName: row.full_name || '',
    gender: row.gender || 'Male',
    age: Number(row.age) || 0,
    phone: row.phone || '',
    address: row.address || '',
    kebele: row.kebele || '',
    woreda: row.woreda || '',
    bloodType: row.blood_type || 'O+',
    allergies: row.allergies || 'None',
    chronicConditions: row.chronic_conditions || 'None',
    emergencyContactName: row.emergency_contact_name || '',
    emergencyContactPhone: row.emergency_contact_phone || '',
    emergencyContactRelation: row.emergency_contact_relation || '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function triageToDb(t: TriageVitals) {
  return {
    id: t.id,
    patient_id: t.patientId,
    nurse_id: t.nurseId || null,
    systolic_bp: t.systolicBp,
    diastolic_bp: t.diastolicBp,
    temperature: t.temperature,
    pulse_rate: t.pulseRate,
    respiratory_rate: t.respiratoryRate,
    spo2: t.spo2,
    height_cm: t.heightCm,
    weight_kg: t.weightKg,
    bmi: t.bmi,
    bmi_category: t.bmiCategory,
    pain_score: t.painScore || null,
    priority_level: t.priorityLevel,
    chief_complaint_short: t.chiefComplaintShort || null,
    notes: t.notes || null,
    created_at: t.createdAt,
  };
}

export function queueToDb(q: QueueTicket) {
  return {
    id: q.id,
    ticket_number: q.ticketNumber,
    patient_id: q.patientId,
    doctor_id: q.doctorId || null,
    department: q.department,
    room_number: q.roomNumber || null,
    priority: q.priority,
    status: q.status,
    called_at: q.calledAt || null,
    completed_at: q.completedAt || null,
    created_at: q.createdAt,
    updated_at: q.createdAt,
  };
}

export function dbToQueue(row: any, patientMap?: Map<string, Patient>): QueueTicket {
  const patient = patientMap ? patientMap.get(row.patient_id) : undefined;
  return {
    id: row.id,
    ticketNumber: row.ticket_number,
    patientId: row.patient_id,
    patientName: patient ? patient.fullName : 'Patient',
    patientMrn: patient ? patient.mrn : '',
    doctorId: row.doctor_id || undefined,
    department: row.department || 'General Outpatient',
    roomNumber: row.room_number || undefined,
    priority: row.priority || 'normal',
    status: row.status || 'registered',
    calledAt: row.called_at || undefined,
    completedAt: row.completed_at || undefined,
    createdAt: row.created_at,
  };
}

export function consultationToDb(c: Consultation) {
  return {
    id: c.id,
    ticket_id: c.ticketId || null,
    patient_id: c.patientId,
    doctor_id: c.doctorId,
    chief_complaint: c.chiefComplaint,
    history_of_present_illness: c.historyOfPresentIllness || null,
    physical_examination: c.physicalExamination || null,
    vitals_snapshot: c.vitalsSnapshot || null,
    icd10_code: c.icd10Code || null,
    icd10_description: c.icd10Description || null,
    treatment_plan: c.treatmentPlan,
    doctor_signature_data: c.doctorSignatureData || null,
    status: c.status,
    created_at: c.createdAt,
    updated_at: c.createdAt,
  };
}

export function labOrderToDb(l: LabOrder) {
  return {
    id: l.id,
    patient_id: l.patientId,
    doctor_id: l.doctorId || null,
    test_name: l.testName,
    test_code: l.testCode,
    priority: l.priority,
    status: l.status,
    ordered_at: l.orderedAt,
    collected_at: l.collectedAt || null,
    completed_at: l.completedAt || null,
  };
}

export function invoiceToDb(inv: Invoice) {
  return {
    id: inv.id,
    invoice_number: inv.invoiceNumber,
    patient_id: inv.patientId,
    total_amount: inv.totalAmount,
    discount_amount: inv.discountAmount,
    net_amount: inv.netAmount,
    amount_paid: inv.amountPaid,
    payment_status: inv.paymentStatus,
    payment_method: inv.paymentMethod || null,
    payment_reference: inv.paymentReference || null,
    paid_at: inv.paidAt || null,
    created_at: inv.createdAt,
    updated_at: inv.createdAt,
  };
}

export function appointmentToDb(a: Appointment) {
  return {
    id: a.id,
    appointment_number: a.appointmentNumber,
    patient_id: a.patientId,
    doctor_id: a.doctorId,
    appointment_date: a.appointmentDate,
    start_time: a.startTime,
    end_time: a.endTime,
    reason: a.reasonForVisit,
    status: a.status,
    notes: a.notes || null,
    created_at: a.createdAt,
    updated_at: a.updatedAt || a.createdAt,
  };
}

export function dbToAppointment(row: any): Appointment {
  return {
    id: row.id,
    appointmentNumber: row.appointment_number || `APT-${row.id.slice(0, 8)}`,
    patientId: row.patient_id,
    patientName: row.patient_name || row.patient?.full_name || 'Patient',
    patientMrn: row.patient_mrn || row.patient?.mrn || '',
    patientPhone: row.patient_phone || row.patient?.phone || '',
    doctorId: row.doctor_id,
    doctorName: row.doctor_name || row.doctor?.full_name || 'Doctor',
    department: row.department || 'General Outpatient',
    appointmentDate: row.appointment_date,
    startTime: row.start_time?.slice(0, 5) || '09:00',
    endTime: row.end_time?.slice(0, 5) || '09:30',
    reasonForVisit: row.reason || row.reason_for_visit || 'General Consultation',
    status: row.status || 'scheduled',
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function scheduleToDb(s: DoctorSchedule) {
  return {
    id: s.id,
    doctor_id: s.doctorId,
    day_of_week: s.dayOfWeek,
    start_time: s.startTime,
    end_time: s.endTime,
    slot_duration_minutes: s.slotDurationMinutes,
    max_patients_per_slot: s.maxPatientsPerSlot,
    room_number: s.roomNumber,
    is_active: s.isActive,
  };
}

export function dbToSchedule(row: any): DoctorSchedule {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return {
    id: row.id,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name || row.doctor?.full_name || 'Doctor',
    department: row.department || 'General Outpatient',
    dayOfWeek: row.day_of_week,
    dayName: days[row.day_of_week % 7] || 'Weekday',
    startTime: row.start_time?.slice(0, 5) || '08:00',
    endTime: row.end_time?.slice(0, 5) || '14:00',
    slotDurationMinutes: row.slot_duration_minutes || 20,
    maxPatientsPerSlot: row.max_patients_per_slot || 1,
    roomNumber: row.room_number || 'Room 1',
    isActive: row.is_active ?? true,
  };
}


// =============================================================================
// Seed Initial Data into IndexedDB if empty
// =============================================================================

export async function initializeDatabaseSeed(): Promise<void> {
  const patientCount = await offlineDb.patients.count();
  if (patientCount > 0) return;

  const now = new Date().toISOString();

  // 1. Initial Patients with standard UUIDs
  const p1: Patient = {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    mrn: 'MRN-2026-00101',
    fullName: 'Abebe Kebede',
    gender: 'Male',
    age: 38,
    phone: '+251-911-102030',
    address: 'Bole Subcity, Addis Ababa',
    kebele: '03',
    woreda: 'Bole',
    bloodType: 'O+',
    allergies: 'Penicillin, Amoxicillin',
    chronicConditions: 'Mild Hypertension',
    emergencyContactName: 'Tigist Kebede',
    emergencyContactPhone: '+251-922-334455',
    emergencyContactRelation: 'Spouse',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  };

  const p2: Patient = {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    mrn: 'MRN-2026-00102',
    fullName: 'Chaltu Dibaba',
    gender: 'Female',
    age: 27,
    phone: '+251-933-405060',
    address: 'Yeka Subcity, Addis Ababa',
    kebele: '08',
    woreda: 'Yeka',
    bloodType: 'A+',
    allergies: 'None',
    chronicConditions: 'None',
    emergencyContactName: 'Gemechu Dibaba',
    emergencyContactPhone: '+251-944-556677',
    emergencyContactRelation: 'Brother',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  };

  const p3: Patient = {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    mrn: 'MRN-2026-00103',
    fullName: 'Mulugeta Tesfaye',
    gender: 'Male',
    age: 54,
    phone: '+251-912-708090',
    address: 'Kirkos Subcity, Addis Ababa',
    kebele: '02',
    woreda: 'Kirkos',
    bloodType: 'B+',
    allergies: 'Sulfa drugs',
    chronicConditions: 'Type 2 Diabetes Mellitus',
    emergencyContactName: 'Almaz Worku',
    emergencyContactPhone: '+251-911-889900',
    emergencyContactRelation: 'Wife',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  };

  await offlineDb.patients.bulkAdd([p1, p2, p3]);

  // 2. Initial Triage Vitals
  const t1: TriageVitals = {
    id: 't1111111-1111-1111-1111-111111111111',
    patientId: p1.id,
    nurseId: '33333333-3333-3333-3333-333333333333',
    nurseName: 'Sr. Bethelhem Girma',
    systolicBp: 138,
    diastolicBp: 88,
    temperature: 38.8,
    pulseRate: 92,
    respiratoryRate: 20,
    spo2: 97,
    heightCm: 175,
    weightKg: 74,
    bmi: 24.2,
    bmiCategory: 'Normal weight',
    painScore: 5,
    priorityLevel: 'urgent',
    chiefComplaintShort: 'High grade fever with chills, severe headache, muscle ache',
    notes: 'Febrile, alert, sweating.',
    createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
  };

  const t2: TriageVitals = {
    id: 't2222222-2222-2222-2222-222222222222',
    patientId: p2.id,
    nurseId: '33333333-3333-3333-3333-333333333333',
    nurseName: 'Sr. Bethelhem Girma',
    systolicBp: 114,
    diastolicBp: 74,
    temperature: 36.7,
    pulseRate: 72,
    respiratoryRate: 16,
    spo2: 99,
    heightCm: 162,
    weightKg: 58,
    bmi: 22.1,
    bmiCategory: 'Normal weight',
    painScore: 2,
    priorityLevel: 'normal',
    chiefComplaintShort: 'Persistent non-productive cough for 1 week',
    notes: 'General condition stable.',
    createdAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
  };

  const t3: TriageVitals = {
    id: 't3333333-3333-3333-3333-333333333333',
    patientId: p3.id,
    nurseId: '33333333-3333-3333-3333-333333333333',
    nurseName: 'Sr. Bethelhem Girma',
    systolicBp: 146,
    diastolicBp: 94,
    temperature: 37.1,
    pulseRate: 84,
    respiratoryRate: 18,
    spo2: 96,
    heightCm: 170,
    weightKg: 85,
    bmi: 29.4,
    bmiCategory: 'Overweight',
    painScore: 3,
    priorityLevel: 'normal',
    chiefComplaintShort: 'Diabetes follow-up, blurry vision, occasional dizziness',
    notes: 'Needs fasting glucose check.',
    createdAt: new Date(Date.now() - 3600000 * 0.8).toISOString(),
  };

  await offlineDb.triage.bulkAdd([t1, t2, t3]);

  // 3. Initial Queue Tickets
  const q1: QueueTicket = {
    id: 'q1111111-1111-1111-1111-111111111111',
    ticketNumber: 'Q-101',
    patientId: p1.id,
    patientName: p1.fullName,
    patientMrn: p1.mrn,
    doctorId: '22222222-2222-2222-2222-222222222222',
    doctorName: 'Dr. Henok Bekele',
    department: 'General Outpatient',
    roomNumber: 'Room 201',
    priority: 'urgent',
    status: 'in_consultation',
    calledAt: new Date(Date.now() - 600000).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
  };

  const q2: QueueTicket = {
    id: 'q2222222-2222-2222-2222-222222222222',
    ticketNumber: 'Q-102',
    patientId: p2.id,
    patientName: p2.fullName,
    patientMrn: p2.mrn,
    doctorId: '22222222-2222-2222-2222-222222222222',
    doctorName: 'Dr. Henok Bekele',
    department: 'General Outpatient',
    roomNumber: 'Room 201',
    priority: 'normal',
    status: 'waiting_doctor',
    createdAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
  };

  const q3: QueueTicket = {
    id: 'q3333333-3333-3333-3333-333333333333',
    ticketNumber: 'Q-103',
    patientId: p3.id,
    patientName: p3.fullName,
    patientMrn: p3.mrn,
    department: 'General Outpatient',
    priority: 'normal',
    status: 'triaged',
    createdAt: new Date(Date.now() - 3600000 * 0.8).toISOString(),
  };

  await offlineDb.queue.bulkAdd([q1, q2, q3]);

  // 4. Initial Lab Orders
  const lab1: LabOrder = {
    id: 'l1111111-1111-1111-1111-111111111111',
    patientId: p1.id,
    patientName: p1.fullName,
    patientMrn: p1.mrn,
    doctorId: '22222222-2222-2222-2222-222222222222',
    doctorName: 'Dr. Henok Bekele',
    testName: 'Malaria Rapid Diagnostic Test (RDT)',
    testCode: 'LAB-MAL-RDT',
    priority: 'urgent',
    status: 'sample_collected',
    orderedAt: new Date(Date.now() - 1800000).toISOString(),
    collectedAt: new Date(Date.now() - 900000).toISOString(),
    technicianName: 'Yared Kassahun',
  };

  await offlineDb.labOrders.bulkAdd([lab1]);

  // 5. Initial Invoice
  const inv1: Invoice = {
    id: 'i1111111-1111-1111-1111-111111111111',
    invoiceNumber: 'INV-2026-00101',
    patientId: p1.id,
    patientName: p1.fullName,
    patientMrn: p1.mrn,
    cashierName: 'Hanan Mohammed',
    items: [
      { id: 'it-1', itemType: 'consultation', description: 'General Outpatient Consultation', unitPrice: 300, quantity: 1, totalPrice: 300 },
      { id: 'it-2', itemType: 'lab_test', description: 'Malaria Rapid Diagnostic Test (RDT)', unitPrice: 150, quantity: 1, totalPrice: 150 },
    ],
    totalAmount: 450,
    discountAmount: 0,
    netAmount: 450,
    amountPaid: 0,
    paymentStatus: 'pending',
    createdAt: now,
  };

  await offlineDb.invoices.bulkAdd([inv1]);

  // 6. Initial Doctor Weekly Schedules (PDF Page 3)
  const sched1: DoctorSchedule = {
    id: 's1111111-1111-1111-1111-111111111111',
    doctorId: '22222222-2222-2222-2222-222222222222',
    doctorName: 'Dr. Henok Bekele',
    department: 'General Outpatient & Internal Medicine',
    dayOfWeek: 1, // Monday
    dayName: 'Monday',
    startTime: '08:30',
    endTime: '13:00',
    slotDurationMinutes: 20,
    maxPatientsPerSlot: 1,
    roomNumber: 'Room 2 (OPD)',
    isActive: true,
  };

  const sched2: DoctorSchedule = {
    id: 's2222222-2222-2222-2222-222222222222',
    doctorId: '22222222-2222-2222-2222-222222222222',
    doctorName: 'Dr. Henok Bekele',
    department: 'General Outpatient & Internal Medicine',
    dayOfWeek: 3, // Wednesday
    dayName: 'Wednesday',
    startTime: '08:30',
    endTime: '13:00',
    slotDurationMinutes: 20,
    maxPatientsPerSlot: 1,
    roomNumber: 'Room 2 (OPD)',
    isActive: true,
  };

  const sched3: DoctorSchedule = {
    id: 's3333333-3333-3333-3333-333333333333',
    doctorId: '11111111-1111-1111-1111-111111111111',
    doctorName: 'Dr. Selamawit Tadesse',
    department: 'Clinical Administration & Executive Consultations',
    dayOfWeek: 2, // Tuesday
    dayName: 'Tuesday',
    startTime: '09:00',
    endTime: '14:00',
    slotDurationMinutes: 30,
    maxPatientsPerSlot: 1,
    roomNumber: 'Room 1 (Executive)',
    isActive: true,
  };

  await offlineDb.doctorSchedules.bulkAdd([sched1, sched2, sched3]);

  // 7. Initial Advance Appointments (PDF Page 3)
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const apt1: Appointment = {
    id: 'a1111111-1111-1111-1111-111111111111',
    appointmentNumber: 'APT-2026-00101',
    patientId: p2.id,
    patientName: p2.fullName,
    patientMrn: p2.mrn,
    patientPhone: p2.phone,
    doctorId: '22222222-2222-2222-2222-222222222222',
    doctorName: 'Dr. Henok Bekele',
    department: 'General Outpatient',
    appointmentDate: todayStr,
    startTime: '10:00',
    endTime: '10:20',
    reasonForVisit: 'Follow-up consultation for prenatal check & routine screening',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  };

  const apt2: Appointment = {
    id: 'a2222222-2222-2222-2222-222222222222',
    appointmentNumber: 'APT-2026-00102',
    patientId: p3.id,
    patientName: p3.fullName,
    patientMrn: p3.mrn,
    patientPhone: p3.phone,
    doctorId: '22222222-2222-2222-2222-222222222222',
    doctorName: 'Dr. Henok Bekele',
    department: 'General Outpatient',
    appointmentDate: tomorrow,
    startTime: '11:00',
    endTime: '11:20',
    reasonForVisit: 'Diabetes mellitus routine fasting blood glucose review',
    status: 'scheduled',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  };

  await offlineDb.appointments.bulkAdd([apt1, apt2]);

  // 8. Initial Pharmaceutical Drug Inventory (PDF Page 4)
  const medCount = await offlineDb.medicationInventory.count();
  if (medCount === 0) {
    await offlineDb.medicationInventory.bulkAdd(COMMON_MEDICATION_INVENTORY);
  }

  // 9. Initial Prescriptions for Pharmacy Desk Handoff
  const rxCount = await offlineDb.prescriptions.count();
  if (rxCount === 0) {
    const rx1: Prescription = {
      id: 'r1111111-1111-1111-1111-111111111111',
      patientId: p1.id,
      patientName: p1.fullName,
      patientMrn: p1.mrn,
      patientAllergies: p1.allergies,
      doctorId: '22222222-2222-2222-2222-222222222222',
      doctorName: 'Dr. Henok Bekele',
      status: 'prescribed',
      notes: 'Prescribed following malaria positive RDT confirmation. Complete full course.',
      items: [
        {
          id: 'rx-i1',
          drugName: 'Coartem (Artemether 20mg + Lumefantrine 120mg)',
          dosage: '4 tablets stat, then 4 tablets at 8h, then BID for 2 days',
          route: 'Oral',
          frequency: 'BID (Twice daily)',
          duration: '3 days',
          instructions: 'Take with fatty meal or milk to improve oral bioavailability.',
          quantity: 24,
        },
        {
          id: 'rx-i2',
          drugName: 'Paracetamol 500mg',
          dosage: '1000mg (2 tabs)',
          route: 'Oral',
          frequency: 'TID (3x daily)',
          duration: '3 days',
          instructions: 'Take after meals for fever relief. Max 4000mg/24h.',
          quantity: 18,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    const rx2: Prescription = {
      id: 'r2222222-2222-2222-2222-222222222222',
      patientId: p2.id,
      patientName: p2.fullName,
      patientMrn: p2.mrn,
      patientAllergies: p2.allergies,
      doctorId: '22222222-2222-2222-2222-222222222222',
      doctorName: 'Dr. Henok Bekele',
      status: 'dispensed',
      notes: 'Prenatal care and bacterial prophylaxis.',
      dispensedAt: new Date(Date.now() - 3600000).toISOString(),
      dispensedBy: 'Pharm. Meron Haile',
      pharmacistNotes: 'Counselled on compliance and taking with plenty of water.',
      batchNumberUsed: 'ETH-AMX-2025-08',
      items: [
        {
          id: 'rx-i3',
          drugName: 'Amoxicillin Trihydrate 500mg',
          dosage: '500mg',
          route: 'Oral',
          frequency: 'TID (3x daily)',
          duration: '7 days',
          instructions: 'Complete full 7-day course even if symptoms resolve.',
          quantity: 21,
        },
      ],
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    };

    await offlineDb.prescriptions.bulkAdd([rx1, rx2]);
  }
}


// =============================================================================
// Helper: Record Offline Mutation for Syncing
// =============================================================================

async function recordPendingMutation(
  collection: PendingMutation['collection'],
  action: PendingMutation['action'],
  payload: any
): Promise<void> {
  try {
    await offlineDb.pendingMutations.add({
      collection,
      action,
      payload,
      timestamp: new Date().toISOString(),
      synced: false,
    });
  } catch (err) {
    console.warn('Failed to record pending mutation:', err);
  }
}

// =============================================================================
// Patient Service
// =============================================================================

export async function getPatients(): Promise<Patient[]> {
  await initializeDatabaseSeed();

  // If online, sync from Supabase cloud so all devices see the latest records
  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const cloudPatients = data.map(dbToPatient);
        await offlineDb.patients.bulkPut(cloudPatients);
      }
    } catch (err) {
      console.warn('Could not sync patients from Supabase, using local DB:', err);
    }
  }

  return offlineDb.patients.reverse().sortBy('createdAt');
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  return offlineDb.patients.get(id);
}

export interface PatientCompleteRecord {
  patient: Patient;
  vitals: TriageVitals[];
  consultations: Consultation[];
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  invoices: Invoice[];
  appointments: Appointment[];
}

export async function getPatientCompleteRecord(patientId: string): Promise<PatientCompleteRecord | null> {
  const patient = await offlineDb.patients.get(patientId);
  if (!patient) return null;

  const [vitals, consultations, prescriptions, labOrders, invoices, appointments] = await Promise.all([
    offlineDb.triage.where('patientId').equals(patientId).reverse().sortBy('createdAt'),
    offlineDb.consultations.where('patientId').equals(patientId).reverse().sortBy('createdAt'),
    offlineDb.prescriptions.where('patientId').equals(patientId).reverse().sortBy('createdAt'),
    offlineDb.labOrders.where('patientId').equals(patientId).reverse().sortBy('orderedAt'),
    offlineDb.invoices.where('patientId').equals(patientId).reverse().sortBy('createdAt'),
    offlineDb.appointments.where('patientId').equals(patientId).reverse().sortBy('appointmentDate'),
  ]);

  return {
    patient,
    vitals,
    consultations,
    prescriptions,
    labOrders,
    invoices,
    appointments,
  };
}

export interface RegisterPatientResult {
  patient: Patient;
  syncedToCloud: boolean;
  cloudError?: string;
}

export async function registerPatient(
  patientData: Omit<Patient, 'id' | 'mrn' | 'createdAt'>
): Promise<RegisterPatientResult> {
  const count = await offlineDb.patients.count();
  const year = new Date().getFullYear();
  const mrn = `MRN-${year}-${String(count + 101).padStart(5, '0')}`;
  const id = generateUuid();

  const newPatient: Patient = {
    ...patientData,
    id,
    mrn,
    createdAt: new Date().toISOString(),
  };

  // 1. Immediately save to local IndexedDB (instant responsiveness)
  await offlineDb.patients.add(newPatient);

  // 2. Auto-generate initial queue ticket for walk-in registration
  await createQueueTicket(newPatient.id, newPatient.fullName, newPatient.mrn, 'normal');

  let syncedToCloud = false;
  let cloudError: string | undefined;

  // 3. Attempt to save directly to Supabase
  const dbPayload = patientToDb(newPatient);
  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      const { error } = await supabase.from('patients').insert(dbPayload);
      if (error) {
        console.error('Supabase error inserting patient:', error);
        cloudError = error.message;
        // Queue for background retry
        await recordPendingMutation('patients', 'create', dbPayload);
      } else {
        syncedToCloud = true;
        console.log('Patient successfully saved to Supabase:', newPatient.mrn);
      }
    } catch (err: any) {
      console.warn('Network error pushing patient to Supabase:', err);
      cloudError = err.message || 'Network error';
      await recordPendingMutation('patients', 'create', dbPayload);
    }
  } else {
    // Offline mode: queue for sync when connection restores
    await recordPendingMutation('patients', 'create', dbPayload);
  }

  return { patient: newPatient, syncedToCloud, cloudError };
}

// =============================================================================
// Triage & Vitals Service
// =============================================================================

export async function getTriageHistory(patientId: string): Promise<TriageVitals[]> {
  return offlineDb.triage.where('patientId').equals(patientId).reverse().sortBy('createdAt');
}

export function calculateBmi(heightCm: number, weightKg: number): { bmi: number; category: string } {
  if (!heightCm || !weightKg || heightCm <= 0) return { bmi: 0, category: 'N/A' };
  const heightM = heightCm / 100;
  const bmiVal = Number((weightKg / (heightM * heightM)).toFixed(1));

  let category = 'Normal weight';
  if (bmiVal < 18.5) category = 'Underweight';
  else if (bmiVal >= 25 && bmiVal < 30) category = 'Overweight';
  else if (bmiVal >= 30) category = 'Obese';

  return { bmi: bmiVal, category };
}

export async function saveTriageVitals(
  vitalsData: Omit<TriageVitals, 'id' | 'createdAt' | 'bmi' | 'bmiCategory'>
): Promise<TriageVitals> {
  const { bmi, category } = calculateBmi(vitalsData.heightCm, vitalsData.weightKg);
  const id = generateUuid();

  const vitalsRecord: TriageVitals = {
    ...vitalsData,
    id,
    bmi,
    bmiCategory: category,
    createdAt: new Date().toISOString(),
  };

  await offlineDb.triage.add(vitalsRecord);

  // Update existing queue ticket status for this patient to 'triaged'
  const ticket = await offlineDb.queue
    .where('patientId')
    .equals(vitalsData.patientId)
    .filter((t) => t.status === 'registered')
    .first();

  if (ticket) {
    await offlineDb.queue.update(ticket.id, {
      status: 'triaged',
      priority: vitalsData.priorityLevel,
    });
  }

  // Sync to Supabase
  const dbPayload = triageToDb(vitalsRecord);
  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('triage_vitals').insert(dbPayload);
    } catch (e) {
      await recordPendingMutation('triage', 'create', dbPayload);
    }
  } else {
    await recordPendingMutation('triage', 'create', dbPayload);
  }

  return vitalsRecord;
}

// =============================================================================
// Queue Tickets Service (with Realtime & Melodic Chime Callout)
// =============================================================================

export async function getQueueTickets(): Promise<QueueTicket[]> {
  await initializeDatabaseSeed();

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('queue_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const patients = await offlineDb.patients.toArray();
        const patientMap = new Map(patients.map((p) => [p.id, p]));
        const cloudTickets = data.map((d) => dbToQueue(d, patientMap));
        await offlineDb.queue.bulkPut(cloudTickets);
      }
    } catch (err) {
      console.warn('Could not sync queue from Supabase:', err);
    }
  }

  return offlineDb.queue.reverse().sortBy('createdAt');
}

export async function createQueueTicket(
  patientId: string,
  patientName: string,
  patientMrn: string,
  priority: TriagePriority = 'normal',
  department = 'General Outpatient'
): Promise<QueueTicket> {
  const count = await offlineDb.queue.count();
  const ticketNumber = `Q-${100 + ((count % 900) + 1)}`;
  const id = generateUuid();

  const ticket: QueueTicket = {
    id,
    ticketNumber,
    patientId,
    patientName,
    patientMrn,
    department,
    priority,
    status: 'registered',
    createdAt: new Date().toISOString(),
  };

  await offlineDb.queue.add(ticket);

  const dbPayload = queueToDb(ticket);
  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('queue_tickets').insert(dbPayload);
    } catch (e) {
      await recordPendingMutation('queue', 'create', dbPayload);
    }
  } else {
    await recordPendingMutation('queue', 'create', dbPayload);
  }

  return ticket;
}

export async function updateQueueStatus(
  ticketId: string,
  status: QueueStatus,
  updates?: {
    doctorId?: string;
    doctorName?: string;
    roomNumber?: string;
  }
): Promise<void> {
  const ticket = await offlineDb.queue.get(ticketId);
  if (!ticket) return;

  const patch: Partial<QueueTicket> = {
    status,
    ...updates,
  };

  if (status === 'in_consultation') {
    patch.calledAt = new Date().toISOString();
    // Play the audible chime when calling a patient into consultation
    soundService.playCallChime();
  } else if (status === 'completed') {
    patch.completedAt = new Date().toISOString();
  }

  await offlineDb.queue.update(ticketId, patch);

  const dbUpdate: any = {
    status,
    called_at: patch.calledAt || null,
    completed_at: patch.completedAt || null,
  };
  if (updates?.doctorId) dbUpdate.doctor_id = updates.doctorId;
  if (updates?.roomNumber) dbUpdate.room_number = updates.roomNumber;

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('queue_tickets').update(dbUpdate).eq('id', ticketId);
    } catch (err) {
      await recordPendingMutation('queue', 'update', { id: ticketId, ...dbUpdate });
    }
  } else {
    await recordPendingMutation('queue', 'update', { id: ticketId, ...dbUpdate });
  }
}

// =============================================================================
// Doctor EHR Consultation & SOAP Notes Service
// =============================================================================

export async function getConsultations(): Promise<Consultation[]> {
  return offlineDb.consultations.reverse().sortBy('createdAt');
}

export async function getConsultationsByPatient(patientId: string): Promise<Consultation[]> {
  return offlineDb.consultations.where('patientId').equals(patientId).reverse().sortBy('createdAt');
}

export async function saveConsultation(
  consultationData: Omit<Consultation, 'id' | 'createdAt'>
): Promise<Consultation> {
  const id = generateUuid();
  const record: Consultation = {
    ...consultationData,
    id,
    createdAt: new Date().toISOString(),
  };

  await offlineDb.consultations.add(record);

  // If ticketId is attached, advance queue status
  if (record.ticketId) {
    await updateQueueStatus(record.ticketId, 'pending_payment');
  }

  const dbPayload = consultationToDb(record);
  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('consultations').insert(dbPayload);
    } catch (e) {
      await recordPendingMutation('consultations', 'create', dbPayload);
    }
  } else {
    await recordPendingMutation('consultations', 'create', dbPayload);
  }

  return record;
}

// =============================================================================
// E-Prescriptions Service
// =============================================================================

export async function getPrescriptions(): Promise<Prescription[]> {
  return offlineDb.prescriptions.reverse().sortBy('createdAt');
}

export async function savePrescription(
  data: Omit<Prescription, 'id' | 'createdAt'>
): Promise<Prescription> {
  const id = generateUuid();
  const record: Prescription = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };

  await offlineDb.prescriptions.add(record);
  await recordPendingMutation('prescriptions', 'create', record);

  return record;
}

export async function updatePrescriptionStatus(
  prescriptionId: string,
  status: 'prescribed' | 'sent_to_pharmacy' | 'dispensed',
  details?: {
    dispensedBy?: string;
    pharmacistNotes?: string;
    batchNumberUsed?: string;
  }
): Promise<void> {
  const patch: Partial<Prescription> = {
    status,
    ...details,
  };
  if (status === 'dispensed') {
    patch.dispensedAt = new Date().toISOString();
  }

  await offlineDb.prescriptions.update(prescriptionId, patch);
  await recordPendingMutation('prescriptions', 'update', { id: prescriptionId, ...patch });
}

export async function getMedicationInventory(): Promise<MedicationInventoryItem[]> {
  await initializeDatabaseSeed();
  return offlineDb.medicationInventory.toArray();
}

export async function deductMedicationStock(medicationId: string, quantityToDeduct: number): Promise<void> {
  const item = await offlineDb.medicationInventory.get(medicationId);
  if (item) {
    const updatedQty = Math.max(0, item.stockQuantity - quantityToDeduct);
    await offlineDb.medicationInventory.update(medicationId, { stockQuantity: updatedQty });
    const dbUpdate = { stock_quantity: updatedQty };
    if (isSupabaseConfigured && supabase && navigator.onLine) {
      try {
        await supabase.from('medication_inventory').update(dbUpdate).eq('id', medicationId);
      } catch {
        await recordPendingMutation('medication_inventory', 'update', { id: medicationId, ...dbUpdate });
      }
    } else {
      await recordPendingMutation('medication_inventory', 'update', { id: medicationId, ...dbUpdate });
    }
  }
}

/**
 * Restock / Add New Batch:
 * Increases the stock quantity of a medication, updates the batch number,
 * expiry date, and supplier info. Syncs to Supabase if online.
 */
export async function addMedicationStock(
  medicationId: string,
  quantityToAdd: number,
  newBatchNumber?: string,
  newExpiryDate?: string,
  supplierName?: string
): Promise<void> {
  const item = await offlineDb.medicationInventory.get(medicationId);
  if (!item) return;

  const updatedQty = item.stockQuantity + quantityToAdd;
  const patch: Partial<MedicationInventoryItem> = {
    stockQuantity: updatedQty,
    ...(newBatchNumber ? { batchNumber: newBatchNumber } : {}),
    ...(newExpiryDate ? { expiryDate: newExpiryDate } : {}),
    ...(supplierName ? { manufacturer: supplierName } : {}),
  };

  await offlineDb.medicationInventory.update(medicationId, patch);

  const dbUpdate: any = {
    stock_quantity: updatedQty,
    ...(newBatchNumber ? { batch_number: newBatchNumber } : {}),
    ...(newExpiryDate ? { expiry_date: newExpiryDate } : {}),
    ...(supplierName ? { manufacturer: supplierName } : {}),
  };

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('medication_inventory').update(dbUpdate).eq('id', medicationId);
    } catch {
      await recordPendingMutation('medication_inventory', 'update', { id: medicationId, ...dbUpdate });
    }
  } else {
    await recordPendingMutation('medication_inventory', 'update', { id: medicationId, ...dbUpdate });
  }
}

// =============================================================================
// Diagnostic Lab Orders & Results Service
// =============================================================================

export async function getLabOrders(): Promise<LabOrder[]> {
  return offlineDb.labOrders.reverse().sortBy('orderedAt');
}

export async function createLabOrder(
  data: Omit<LabOrder, 'id' | 'orderedAt' | 'status'>
): Promise<LabOrder> {
  const id = generateUuid();
  const record: LabOrder = {
    ...data,
    id,
    status: 'ordered',
    orderedAt: new Date().toISOString(),
  };

  await offlineDb.labOrders.add(record);

  const dbPayload = labOrderToDb(record);
  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('lab_orders').insert(dbPayload);
    } catch (e) {
      await recordPendingMutation('lab_orders', 'create', dbPayload);
    }
  } else {
    await recordPendingMutation('lab_orders', 'create', dbPayload);
  }

  return record;
}

export async function updateLabOrderStatus(
  orderId: string,
  status: LabOrderStatus,
  extra?: Partial<LabOrder>
): Promise<void> {
  const patch: Partial<LabOrder> = { status, ...extra };
  if (status === 'sample_collected') {
    patch.collectedAt = new Date().toISOString();
  } else if (status === 'completed') {
    patch.completedAt = new Date().toISOString();
  }

  await offlineDb.labOrders.update(orderId, patch);

  const dbUpdate: any = {
    status,
    collected_at: patch.collectedAt || null,
    completed_at: patch.completedAt || null,
  };
  if (patch.reportFileUrl) {
    dbUpdate.report_file_url = patch.reportFileUrl;
  }

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('lab_orders').update(dbUpdate).eq('id', orderId);
    } catch (e) {
      await recordPendingMutation('lab_orders', 'update', { id: orderId, ...dbUpdate });
    }
  } else {
    await recordPendingMutation('lab_orders', 'update', { id: orderId, ...dbUpdate });
  }
}

// =============================================================================
// Cashier Desk & Itemized Billing Service
// =============================================================================

export async function getInvoices(): Promise<Invoice[]> {
  return offlineDb.invoices.reverse().sortBy('createdAt');
}

export async function createInvoice(
  invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>
): Promise<Invoice> {
  const count = await offlineDb.invoices.count();
  const year = new Date().getFullYear();
  const invoiceNumber = `INV-${year}-${String(count + 101).padStart(5, '0')}`;
  const id = generateUuid();

  const newInvoice: Invoice = {
    ...invoiceData,
    id,
    invoiceNumber,
    createdAt: new Date().toISOString(),
  };

  await offlineDb.invoices.add(newInvoice);

  const dbPayload = invoiceToDb(newInvoice);
  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('invoices').insert(dbPayload);
    } catch (e) {
      await recordPendingMutation('invoices', 'create', dbPayload);
    }
  } else {
    await recordPendingMutation('invoices', 'create', dbPayload);
  }

  return newInvoice;
}

export async function recordInvoicePayment(
  invoiceId: string,
  amountPaid: number,
  method: PaymentMethod,
  reference?: string,
  cashierName?: string
): Promise<void> {
  const inv = await offlineDb.invoices.get(invoiceId);
  if (!inv) return;

  const totalPaid = inv.amountPaid + amountPaid;
  const isPaidInFull = totalPaid >= inv.netAmount;

  const patch: Partial<Invoice> = {
    amountPaid: totalPaid,
    paymentStatus: isPaidInFull ? 'paid' : 'partial',
    paymentMethod: method,
    paymentReference: reference,
    cashierName: cashierName || inv.cashierName,
    paidAt: new Date().toISOString(),
  };

  await offlineDb.invoices.update(invoiceId, patch);

  const dbUpdate: any = {
    amount_paid: totalPaid,
    payment_status: isPaidInFull ? 'paid' : 'partial',
    payment_method: method,
    payment_reference: reference || null,
    paid_at: patch.paidAt,
  };

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('invoices').update(dbUpdate).eq('id', invoiceId);
    } catch (e) {
      await recordPendingMutation('invoices', 'update', { id: invoiceId, ...dbUpdate });
    }
  } else {
    await recordPendingMutation('invoices', 'update', { id: invoiceId, ...dbUpdate });
  }

  // Complete any corresponding queue ticket for this patient
  const ticket = await offlineDb.queue
    .where('patientId')
    .equals(inv.patientId)
    .filter((t) => t.status === 'pending_payment' || t.status === 'in_consultation')
    .first();

  if (ticket && isPaidInFull) {
    await updateQueueStatus(ticket.id, 'completed');
  }
}

// =============================================================================
// Doctor Schedules & Appointment Booking Service (PDF Page 3)
// =============================================================================

export async function getAppointments(): Promise<Appointment[]> {
  try {
    const list = await offlineDb.appointments.toArray();
    return list.sort((a, b) => {
      const dateDiff = a.appointmentDate.localeCompare(b.appointmentDate);
      if (dateDiff !== 0) return dateDiff;
      return a.startTime.localeCompare(b.startTime);
    });
  } catch {
    return [];
  }
}

export async function createAppointment(
  data: Omit<Appointment, 'id' | 'appointmentNumber' | 'createdAt'>
): Promise<Appointment> {
  const id = generateUuid();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  const appointmentNumber = `APT-${year}-${randomSuffix}`;

  const record: Appointment = {
    ...data,
    id,
    appointmentNumber,
    createdAt: new Date().toISOString(),
  };

  await offlineDb.appointments.add(record);

  const dbPayload = appointmentToDb(record);
  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('appointments').insert(dbPayload);
    } catch {
      await recordPendingMutation('appointments', 'create', dbPayload);
    }
  } else {
    await recordPendingMutation('appointments', 'create', dbPayload);
  }

  return record;
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  ticketId?: string
): Promise<void> {
  const patch: Partial<Appointment> = {
    status,
    ticketId: ticketId || undefined,
    updatedAt: new Date().toISOString(),
  };

  await offlineDb.appointments.update(id, patch);

  const dbUpdate: any = {
    status,
    updated_at: patch.updatedAt,
  };

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('appointments').update(dbUpdate).eq('id', id);
    } catch {
      await recordPendingMutation('appointments', 'update', { id, ...dbUpdate });
    }
  } else {
    await recordPendingMutation('appointments', 'update', { id, ...dbUpdate });
  }
}

/**
 * Check-In Appointment:
 * Instantly creates a live queue ticket (e.g. Q-350) for the patient,
 * advances the appointment status to 'checked_in', and plays a welcome chime!
 */
export async function checkInAppointment(appointmentId: string): Promise<QueueTicket> {
  const apt = await offlineDb.appointments.get(appointmentId);
  if (!apt) throw new Error('Appointment not found');

  // Issue live queue ticket
  const ticket = await createQueueTicket(
    apt.patientId,
    apt.patientName,
    apt.patientMrn,
    'normal',
    apt.department || 'General Outpatient'
  );

  if (apt.doctorId || apt.doctorName) {
    await offlineDb.queue.update(ticket.id, {
      doctorId: apt.doctorId,
      doctorName: apt.doctorName,
    });
  }

  // Update appointment record
  await updateAppointmentStatus(appointmentId, 'checked_in', ticket.id);

  return ticket;
}

export async function getDoctorSchedules(): Promise<DoctorSchedule[]> {
  try {
    const list = await offlineDb.doctorSchedules.toArray();
    return list.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  } catch {
    return [];
  }
}

export async function saveDoctorSchedule(scheduleData: Omit<DoctorSchedule, 'id'> & { id?: string }): Promise<DoctorSchedule> {
  const id = scheduleData.id || generateUuid();
  const record: DoctorSchedule = {
    ...scheduleData,
    id,
  };

  await offlineDb.doctorSchedules.put(record);

  const dbPayload = scheduleToDb(record);
  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('doctor_schedules').upsert(dbPayload);
    } catch {
      await recordPendingMutation('doctor_schedules', 'create', dbPayload);
    }
  } else {
    await recordPendingMutation('doctor_schedules', 'create', dbPayload);
  }

  return record;
}


// =============================================================================
// Offline Synchronization Manager
// =============================================================================

export async function getPendingSyncCount(): Promise<number> {
  return offlineDb.pendingMutations.where('synced').equals(0).count();
}

export async function syncPendingMutations(): Promise<{ syncedCount: number; errors: number }> {
  if (!isSupabaseConfigured || !supabase || !navigator.onLine) {
    return { syncedCount: 0, errors: 0 };
  }

  const pending = await offlineDb.pendingMutations.where('synced').equals(0).toArray();
  let syncedCount = 0;
  let errors = 0;

  for (const mutation of pending) {
    try {
      const tableMap: Record<string, string> = {
        patients: 'patients',
        triage: 'triage_vitals',
        queue: 'queue_tickets',
        consultations: 'consultations',
        prescriptions: 'prescriptions',
        lab_orders: 'lab_orders',
        invoices: 'invoices',
        appointments: 'appointments',
        doctor_schedules: 'doctor_schedules',
        medication_inventory: 'medication_inventory',
      };

      const table = tableMap[mutation.collection];
      if (table) {
        if (mutation.action === 'create') {
          const { error } = await supabase.from(table).upsert(mutation.payload);
          if (error) throw error;
        } else if (mutation.action === 'update') {
          const { error } = await supabase.from(table).update(mutation.payload).eq('id', mutation.payload.id);
          if (error) throw error;
        }
      }

      if (mutation.id) {
        await offlineDb.pendingMutations.update(mutation.id, { synced: true });
      }
      syncedCount++;
    } catch (err) {
      console.warn(`Sync failed for mutation ${mutation.id}:`, err);
      errors++;
    }
  }

  return { syncedCount, errors };
}
