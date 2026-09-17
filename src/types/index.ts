// =============================================================================
// Clinic Management System PWA - Domain Types & Interfaces
// =============================================================================

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'lab_tech' | 'cashier';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  licenseNumber?: string;
  digitalSignatureUrl?: string;
  isActive: boolean;
}

export interface Patient {
  id: string;
  mrn: string; // e.g. MRN-2026-00101
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  dob?: string;
  phone: string;
  address?: string;
  kebele?: string;
  woreda?: string;
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string;
  chronicConditions?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  createdAt: string;
  updatedAt?: string;
}

export type TriagePriority = 'normal' | 'urgent' | 'emergency';

export interface TriageVitals {
  id: string;
  patientId: string;
  nurseId?: string;
  nurseName?: string;
  systolicBp: number;
  diastolicBp: number;
  temperature: number; // in Celsius
  pulseRate: number; // bpm
  respiratoryRate: number; // breaths per min
  spo2: number; // percentage
  heightCm: number;
  weightKg: number;
  bmi: number;
  bmiCategory: string; // Underweight, Normal, Overweight, Obese
  painScore: number; // 0-10
  priorityLevel: TriagePriority;
  chiefComplaintShort: string;
  notes?: string;
  createdAt: string;
}

export type QueueStatus = 
  | 'registered'
  | 'triaged'
  | 'waiting_doctor'
  | 'in_consultation'
  | 'pending_lab'
  | 'pending_payment'
  | 'completed'
  | 'cancelled';

export interface QueueTicket {
  id: string;
  ticketNumber: string; // e.g. Q-101
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorId?: string;
  doctorName?: string;
  department: string;
  roomNumber?: string;
  priority: TriagePriority;
  status: QueueStatus;
  calledAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Consultation {
  id: string;
  ticketId?: string;
  patientId: string;
  patientName?: string;
  patientMrn?: string;
  doctorId: string;
  doctorName?: string;
  // Subjective
  chiefComplaint: string;
  historyOfPresentIllness: string;
  reviewOfSystems?: string;
  // Objective
  physicalExamination: string;
  vitalsSnapshot?: Partial<TriageVitals>;
  // Assessment
  icd10Code: string;
  icd10Description: string;
  diagnosisNotes?: string;
  // Plan
  treatmentPlan: string;
  followUpDate?: string;
  doctorSignatureData?: string;
  status: 'draft' | 'completed';
  createdAt: string;
}

export interface PrescriptionItem {
  id: string;
  drugName: string;
  dosage: string; // e.g. 500mg
  route: 'Oral' | 'IV' | 'IM' | 'Topical' | 'Inhalation' | 'Ophthalmic';
  frequency: 'OD (Once daily)' | 'BID (Twice daily)' | 'TID (3x daily)' | 'QID (4x daily)' | 'PRN (As needed)';
  duration: string; // e.g. 5 days
  instructions?: string; // e.g. Take with water after meals
  quantity: number;
}

export interface Prescription {
  id: string;
  consultationId?: string;
  patientId: string;
  patientName?: string;
  patientMrn?: string;
  patientAllergies?: string;
  doctorId: string;
  doctorName?: string;
  items: PrescriptionItem[];
  status: 'prescribed' | 'sent_to_pharmacy' | 'dispensed';
  notes?: string;
  createdAt: string;
}

export type LabOrderStatus = 'ordered' | 'sample_collected' | 'analyzing' | 'completed' | 'cancelled';

export interface LabResultItem {
  parameterName: string;
  resultValue: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
}

export interface LabOrder {
  id: string;
  consultationId?: string;
  patientId: string;
  patientName?: string;
  patientMrn?: string;
  doctorId: string;
  doctorName?: string;
  testName: string;
  testCode: string;
  priority: 'normal' | 'urgent' | 'stat';
  status: LabOrderStatus;
  orderedAt: string;
  collectedAt?: string;
  completedAt?: string;
  technicianName?: string;
  results?: LabResultItem[];
  remarks?: string;
  reportFileUrl?: string;
}

export type PaymentMethod = 'cash' | 'telebirr' | 'cbe_birr' | 'insurance';
export type PaymentStatus = 'pending' | 'partial' | 'paid';

export interface InvoiceItem {
  id: string;
  itemType: 'consultation' | 'lab_test' | 'medication' | 'procedure' | 'supply';
  description: string;
  unitPrice: number; // in ETB (Ethiopian Birr)
  quantity: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-00101
  patientId: string;
  patientName: string;
  patientMrn: string;
  consultationId?: string;
  cashierId?: string;
  cashierName?: string;
  items: InvoiceItem[];
  totalAmount: number; // in ETB
  discountAmount: number;
  netAmount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string; // Telebirr / CBE Birr transaction ID
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceCoPayPercentage?: number;
  paidAt?: string;
  createdAt: string;
}

export interface ICD10Code {
  code: string;
  description: string;
  category: string;
}

export interface LabTestCatalogItem {
  code: string;
  name: string;
  category: string;
  priceEtb: number;
  defaultParameters: {
    name: string;
    unit: string;
    referenceRange: string;
  }[];
}
