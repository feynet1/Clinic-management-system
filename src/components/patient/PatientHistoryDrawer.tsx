import React, { useState, useEffect } from 'react';
import { 
  getPatientCompleteRecord, 
  type PatientCompleteRecord,
  createQueueTicket 
} from '../../services/dataService';
import { 
  X, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Heart, 
  Stethoscope, 
  Activity, 
  Pill, 
  FlaskConical, 
  Receipt, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Printer, 
  Ticket, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import type { Patient } from '../../types';

interface PatientHistoryDrawerProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onTicketIssued?: (ticketNumber: string) => void;
}

export const PatientHistoryDrawer: React.FC<PatientHistoryDrawerProps> = ({
  patient,
  isOpen,
  onClose,
  onTicketIssued,
}) => {
  const [record, setRecord] = useState<PatientCompleteRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'consultations' | 'vitals' | 'prescriptions' | 'labs' | 'billing'>('consultations');
  const [issuingTicket, setIssuingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (patient && isOpen) {
      setLoading(true);
      setTicketSuccess(null);
      getPatientCompleteRecord(patient.id).then((data) => {
        setRecord(data);
        setLoading(false);
      });
    } else {
      setRecord(null);
    }
  }, [patient, isOpen]);

  if (!isOpen || !patient) return null;

  const handleIssueTicket = async () => {
    setIssuingTicket(true);
    try {
      const ticket = await createQueueTicket(patient.id, patient.fullName, patient.mrn, 'normal');
      setTicketSuccess(`Issued ticket ${ticket.ticketNumber} for ${patient.fullName}`);
      if (onTicketIssued) onTicketIssued(ticket.ticketNumber);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIssuingTicket(false);
    }
  };

  const handlePrintPassport = () => {
    window.print();
  };

  const hasAllergies = Boolean(patient.allergies && patient.allergies.toLowerCase() !== 'none' && patient.allergies.trim() !== '');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Top Action Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base leading-tight">Patient Longitudinal Medical Record</h2>
              <p className="text-[11px] text-slate-500">Haramaya University Hiwot Fana Comprehensive Specialized Hospital</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintPassport}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Print Medical Record Summary"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleIssueTicket}
              disabled={issuingTicket}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>{issuingTicket ? 'Issuing...' : 'Issue Ticket'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ticket Issued Success Alert */}
        {ticketSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{ticketSuccess}</span>
            </div>
            <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded font-mono font-bold">Active in Queue</span>
          </div>
        )}

        {/* Patient Identity Card */}
        <div className="p-6 bg-white border-b border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-slate-900">{patient.fullName}</h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg">
                  {patient.mrn}
                </span>
                {patient.bloodType && (
                  <span className="text-xs font-bold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                    {patient.bloodType}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center space-x-3">
                <span>{patient.age} yrs • {patient.gender}</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{patient.phone}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{patient.address || 'Harar'}{patient.kebele ? `, Kebele ${patient.kebele}` : ''}</span>
                </span>
              </p>
            </div>

            {patient.emergencyContactName && (
              <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-600">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Emergency Contact</span>
                <span className="font-semibold text-slate-800">{patient.emergencyContactName}</span>
                <span className="text-[11px] text-slate-500 block">{patient.emergencyContactPhone} ({patient.emergencyContactRelation || 'Relative'})</span>
              </div>
            )}
          </div>

          {/* High Visibility Allergy Banner */}
          {hasAllergies && (
            <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl flex items-start space-x-2 text-xs text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wide">High-Risk Drug Allergies: </span>
                <span className="font-extrabold underline">{patient.allergies}</span>
                <p className="text-[11px] text-rose-700 mt-0.5">Cross-check active prescriptions and pharmacy dispensations for adverse interactions.</p>
              </div>
            </div>
          )}

          {/* Chronic Conditions */}
          {patient.chronicConditions && patient.chronicConditions.toLowerCase() !== 'none' && (
            <div className="text-xs text-slate-600 flex items-center space-x-2">
              <span className="font-semibold text-slate-700">Chronic Conditions:</span>
              <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-medium">
                {patient.chronicConditions}
              </span>
            </div>
          )}

          {/* Longitudinal KPI Summary Tabs */}
          <div className="flex border-b border-slate-200 pt-2 gap-2 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('consultations')}
              className={`pb-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'consultations'
                  ? 'border-brand-600 text-brand-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Consultations ({record?.consultations.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('vitals')}
              className={`pb-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'vitals'
                  ? 'border-brand-600 text-brand-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Vitals & Triage ({record?.vitals.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`pb-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'prescriptions'
                  ? 'border-brand-600 text-brand-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Prescriptions ({record?.prescriptions.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('labs')}
              className={`pb-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'labs'
                  ? 'border-brand-600 text-brand-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Laboratory ({record?.labOrders.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('billing')}
              className={`pb-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'billing'
                  ? 'border-brand-600 text-brand-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Invoices ({record?.invoices.length || 0})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-8 h-8 animate-spin mx-auto text-brand-500 mb-2" />
              <p className="text-xs">Loading complete patient medical record...</p>
            </div>
          ) : !record ? (
            <p className="text-xs text-slate-400 text-center py-8">No clinical history records found for this patient.</p>
          ) : (
            <>
              {/* TAB 1: CONSULTATIONS & SOAP NOTES */}
              {activeTab === 'consultations' && (
                <div className="space-y-4">
                  {record.consultations.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                      No doctor consultations recorded yet.
                    </div>
                  ) : (
                    record.consultations.map((c) => (
                      <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
                        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                          <div>
                            <span className="font-bold text-sm text-slate-900 block">
                              {c.icd10Description || 'General Consultation'}
                            </span>
                            <span className="font-mono text-[10px] text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded border border-brand-200 inline-block mt-0.5">
                              ICD-10: {c.icd10Code || 'Unspecified'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-semibold text-slate-700 block">{c.doctorName || 'Attending Physician'}</span>
                            <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>

                        {/* SOAP Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="font-bold text-[10px] uppercase text-brand-700 block mb-1">Subjective (S)</span>
                            <p className="text-slate-800">{c.chiefComplaint}</p>
                            {c.historyOfPresentIllness && (
                              <p className="text-slate-500 text-[11px] mt-1">{c.historyOfPresentIllness}</p>
                            )}
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="font-bold text-[10px] uppercase text-brand-700 block mb-1">Objective (O)</span>
                            <p className="text-slate-800">{c.physicalExamination || 'Physical exam normal.'}</p>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl sm:col-span-2">
                            <span className="font-bold text-[10px] uppercase text-brand-700 block mb-1">Plan & Treatment (P)</span>
                            <p className="text-slate-800 font-medium">{c.treatmentPlan}</p>
                            {c.followUpDate && (
                              <span className="text-[10px] text-slate-500 block mt-1">
                                Follow-up scheduled for: <strong>{c.followUpDate}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: VITALS & TRIAGE */}
              {activeTab === 'vitals' && (
                <div className="space-y-4">
                  {record.vitals.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                      No triage vital sign encounters recorded yet.
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Date</th>
                            <th className="p-3">BP (mmHg)</th>
                            <th className="p-3">Pulse</th>
                            <th className="p-3">Temp</th>
                            <th className="p-3">SpO2</th>
                            <th className="p-3">BMI & Category</th>
                            <th className="p-3">Priority</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {record.vitals.map((v) => (
                            <tr key={v.id} className="hover:bg-slate-50">
                              <td className="p-3 font-semibold text-slate-900">
                                {new Date(v.createdAt).toLocaleDateString('en-GB')}
                                <span className="block text-[10px] text-slate-400">{new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </td>
                              <td className="p-3 font-mono font-bold text-slate-800">
                                {v.systolicBp}/{v.diastolicBp}
                              </td>
                              <td className="p-3">{v.pulseRate} bpm</td>
                              <td className="p-3">
                                <span className={v.temperature >= 38 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                                  {v.temperature}°C
                                </span>
                              </td>
                              <td className="p-3">{v.spo2}%</td>
                              <td className="p-3">
                                <span className="font-bold text-slate-800 mr-1">{v.bmi}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  {v.bmiCategory}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  v.priorityLevel === 'emergency'
                                    ? 'bg-red-100 text-red-800'
                                    : v.priorityLevel === 'urgent'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {v.priorityLevel}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PRESCRIPTIONS */}
              {activeTab === 'prescriptions' && (
                <div className="space-y-4">
                  {record.prescriptions.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                      No prescription orders recorded yet.
                    </div>
                  ) : (
                    record.prescriptions.map((p) => (
                      <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
                        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                          <div>
                            <span className="font-bold text-sm text-slate-900 block">
                              Prescription Order ({p.items.length} item{p.items.length > 1 ? 's' : ''})
                            </span>
                            <span className="text-[11px] text-slate-500">Ref: {p.doctorName || 'Dr. Henok Bekele'}</span>
                          </div>
                          <div className="text-right">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              p.status === 'dispensed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {p.status}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-1">{new Date(p.createdAt).toLocaleDateString('en-GB')}</span>
                          </div>
                        </div>

                        {/* Prescribed Items Table */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                              <tr>
                                <th className="p-2.5">Medication</th>
                                <th className="p-2.5">Dose / Route</th>
                                <th className="p-2.5">Frequency</th>
                                <th className="p-2.5">Duration</th>
                                <th className="p-2.5 text-right">Qty</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {p.items.map((it, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="p-2.5 font-bold text-slate-900">{it.drugName}</td>
                                  <td className="p-2.5 text-slate-600">{it.dosage} • {it.route}</td>
                                  <td className="p-2.5 text-slate-600">{it.frequency}</td>
                                  <td className="p-2.5 text-slate-600">{it.duration}</td>
                                  <td className="p-2.5 text-right font-bold text-slate-900">{it.quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Dispensation Metadata */}
                        {p.status === 'dispensed' && (
                          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] space-y-1">
                            <p>
                              <strong>Dispensed By:</strong> {p.dispensedBy || 'Pharm. Meron Haile'} • <strong>Batch:</strong> <span className="font-mono font-bold">{p.batchNumberUsed || 'N/A'}</span>
                            </p>
                            {p.pharmacistNotes && (
                              <p><strong>Counseling Notes:</strong> {p.pharmacistNotes}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: LABORATORY */}
              {activeTab === 'labs' && (
                <div className="space-y-4">
                  {record.labOrders.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                      No diagnostic laboratory investigations recorded yet.
                    </div>
                  ) : (
                    record.labOrders.map((lab) => (
                      <div key={lab.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
                        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                          <div>
                            <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mr-2">
                              {lab.testCode}
                            </span>
                            <span className="font-bold text-sm text-slate-900">{lab.testName}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            lab.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {lab.status.replace('_', ' ')}
                          </span>
                        </div>

                        {lab.results && lab.results.length > 0 && (
                          <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                                <tr>
                                  <th className="p-2.5">Parameter</th>
                                  <th className="p-2.5">Result</th>
                                  <th className="p-2.5">Reference Range</th>
                                  <th className="p-2.5 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {lab.results.map((r, idx) => (
                                  <tr key={idx} className={r.isAbnormal ? 'bg-rose-50/60 font-semibold' : 'hover:bg-slate-50'}>
                                    <td className="p-2.5">{r.parameterName}</td>
                                    <td className="p-2.5 font-bold font-mono text-slate-900">{r.resultValue} {r.unit}</td>
                                    <td className="p-2.5 text-slate-500">{r.referenceRange}</td>
                                    <td className="p-2.5 text-center">
                                      {r.isAbnormal ? (
                                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-bold rounded">ABNORMAL</span>
                                      ) : (
                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">NORMAL</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {lab.remarks && (
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <strong>Technologist Impression:</strong> {lab.remarks}
                          </p>
                        )}

                        {lab.reportFileUrl && (
                          <div className="flex items-center space-x-2 text-xs text-amber-800">
                            <span>📎 Diagnostic Scan Attached:</span>
                            <a
                              href={lab.reportFileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold underline flex items-center space-x-1"
                            >
                              <span>View Document</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: BILLING & INVOICES */}
              {activeTab === 'billing' && (
                <div className="space-y-4">
                  {record.invoices.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                      No invoices or billing records found.
                    </div>
                  ) : (
                    record.invoices.map((inv) => (
                      <div key={inv.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
                        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                          <div>
                            <span className="font-mono font-bold text-sm text-slate-900">{inv.invoiceNumber}</span>
                            <span className="text-[11px] text-slate-500 block">Issued: {new Date(inv.createdAt).toLocaleDateString('en-GB')}</span>
                          </div>
                          <div className="text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              inv.paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {inv.paymentStatus}
                            </span>
                            <span className="font-bold text-sm text-slate-900 block mt-1">{inv.netAmount.toFixed(2)} ETB</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          {inv.items.map((it) => (
                            <div key={it.id} className="flex justify-between text-slate-600 text-[11px]">
                              <span>{it.description} (x{it.quantity})</span>
                              <span className="font-semibold text-slate-900">{it.totalPrice.toFixed(2)} ETB</span>
                            </div>
                          ))}
                        </div>

                        {inv.paymentStatus === 'paid' && (
                          <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
                            <span>Method: <strong className="capitalize">{inv.paymentMethod ? inv.paymentMethod.replace('_', ' ') : 'Cash'}</strong></span>
                            {inv.paymentReference && <span>Ref: <strong className="font-mono">{inv.paymentReference}</strong></span>}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
