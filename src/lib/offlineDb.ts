import Dexie, { type Table } from 'dexie';
import type {
  Patient,
  TriageVitals,
  QueueTicket,
  Consultation,
  Prescription,
  LabOrder,
  Invoice,
} from '../types';

export interface PendingMutation {
  id?: number;
  collection: 'patients' | 'triage' | 'queue' | 'consultations' | 'prescriptions' | 'lab_orders' | 'invoices';
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
  pendingMutations!: Table<PendingMutation, number>;

  constructor() {
    super('ClinicManagementOfflineDB');
    this.version(1).stores({
      patients: 'id, mrn, fullName, phone, createdAt',
      triage: 'id, patientId, priorityLevel, createdAt',
      queue: 'id, ticketNumber, patientId, doctorId, status, priority, createdAt',
      consultations: 'id, patientId, doctorId, icd10Code, createdAt',
      prescriptions: 'id, consultationId, patientId, doctorId, status, createdAt',
      labOrders: 'id, consultationId, patientId, testCode, status, priority, orderedAt',
      invoices: 'id, invoiceNumber, patientId, paymentStatus, createdAt',
      pendingMutations: '++id, collection, action, timestamp, synced',
    });
  }
}

export const offlineDb = new ClinicOfflineDatabase();
