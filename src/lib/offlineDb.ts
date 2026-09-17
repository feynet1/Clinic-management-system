import Dexie, { type Table } from 'dexie';
import type {
  Patient,
  TriageVitals,
  QueueTicket,
  Consultation,
  Prescription,
  LabOrder,
  Invoice,
  Appointment,
  DoctorSchedule,
  MedicationInventoryItem,
} from '../types';

export interface PendingMutation {
  id?: number;
  collection: 'patients' | 'triage' | 'queue' | 'consultations' | 'prescriptions' | 'lab_orders' | 'invoices' | 'appointments' | 'doctor_schedules' | 'medication_inventory';
  action: 'create' | 'update' | 'delete';
  payload: any;
  timestamp: string;
  synced: boolean;
}

export class ClinicOfflineDatabase extends Dexie {
  patients!: Table<Patient, string>;
  triage!: Table<TriageVitals, string>;
  queue!: Table<QueueTicket, string>;
  consultations!: Table<Consultation, string>;
  prescriptions!: Table<Prescription, string>;
  labOrders!: Table<LabOrder, string>;
  invoices!: Table<Invoice, string>;
  appointments!: Table<Appointment, string>;
  doctorSchedules!: Table<DoctorSchedule, string>;
  medicationInventory!: Table<MedicationInventoryItem, string>;
  pendingMutations!: Table<PendingMutation, number>;

  constructor() {
    super('ClinicManagementOfflineDB');
    this.version(3).stores({
      patients: 'id, mrn, fullName, phone, createdAt',
      triage: 'id, patientId, priorityLevel, createdAt',
      queue: 'id, ticketNumber, patientId, doctorId, status, priority, createdAt',
      consultations: 'id, patientId, doctorId, icd10Code, createdAt',
      prescriptions: 'id, consultationId, patientId, doctorId, status, createdAt',
      labOrders: 'id, consultationId, patientId, testCode, status, priority, orderedAt',
      invoices: 'id, invoiceNumber, patientId, paymentStatus, createdAt',
      appointments: 'id, appointmentNumber, patientId, doctorId, appointmentDate, status, createdAt',
      doctorSchedules: 'id, doctorId, dayOfWeek, isActive',
      medicationInventory: 'id, code, name, genericName, category, batchNumber',
      pendingMutations: '++id, collection, action, timestamp, synced',
    });
  }
}


export const offlineDb = new ClinicOfflineDatabase();
