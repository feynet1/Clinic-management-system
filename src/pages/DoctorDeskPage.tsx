import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  getQueueTickets, 
  getPatients, 
  getTriageHistory, 
  saveConsultation, 
  savePrescription, 
  createLabOrder, 
  createInvoice, 
  updateQueueStatus 
} from '../services/dataService';
import { COMMON_LAB_CATALOG } from '../data/clinicalCatalog';
import { ICD10Lookup } from '../components/common/ICD10Lookup';
import { PrescriptionPrint } from '../components/print/PrescriptionPrint';
import { 
  Stethoscope, 
  Clock, 
  User, 
  ShieldAlert, 
  Activity, 
  FileText, 
  Pill, 
  FlaskConical, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Printer, 
  Volume2 
} from 'lucide-react';
import type { 
  QueueTicket, 
  Patient, 
  TriageVitals, 
  PrescriptionItem, 
  ICD10Code, 
  Prescription 
} from '../types';

export const DoctorDeskPage: React.FC = () => {
  const { t, currentUser } = useApp();
  const [queue, setQueue] = useState<QueueTicket[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeTicket, setActiveTicket] = useState<QueueTicket | null>(null);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [latestVitals, setLatestVitals] = useState<TriageVitals | null>(null);

  // SOAP State
  const [subjective, setSubjective] = useState('');
  const [historyIllness, setHistoryIllness] = useState('');
  const [physicalExam, setPhysicalExam] = useState('');
  const [selectedIcd, setSelectedIcd] = useState<ICD10Code | null>(null);
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // E-Prescriptions State
  const [prescriptionsList, setPrescriptionsList] = useState<PrescriptionItem[]>([
    {
      id: 'rx-1',
      drugName: 'Paracetamol',
      dosage: '500mg',
      route: 'Oral',
      frequency: 'TID (3x daily)',
      duration: '3 days',
      instructions: 'Take after meals for pain/fever',
      quantity: 10,
    },
  ]);

  // Lab Orders to place during visit
  const [selectedLabCodes, setSelectedLabCodes] = useState<string[]>([]);

  // Print Prescription Modal
  const [printRxData, setPrintRxData] = useState<Prescription | null>(null);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  const loadData = async () => {
    const [q, pts] = await Promise.all([getQueueTickets(), getPatients()]);
    setQueue(q);
    setPatients(pts);

    // Pick active ticket in consultation or first waiting
    const inConsult = q.find((t: QueueTicket) => t.status === 'in_consultation');
    if (inConsult) {
      setActiveTicket(inConsult);
      const pt = pts.find((p: Patient) => p.id === inConsult.patientId);
      if (pt) setActivePatient(pt);
    } else {
      const nextWaiting = q.find((t: QueueTicket) => t.status === 'triaged' || t.status === 'waiting_doctor');
      if (nextWaiting && !activeTicket) {
        setActiveTicket(nextWaiting);
        const pt = pts.find((p: Patient) => p.id === nextWaiting.patientId);
        if (pt) setActivePatient(pt);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activePatient) {
      getTriageHistory(activePatient.id).then((history: TriageVitals[]) => {
        if (history.length > 0) {
          setLatestVitals(history[0]);
          if (!subjective) setSubjective(history[0].chiefComplaintShort);
        } else {
          setLatestVitals(null);
        }
      });
    }
  }, [activePatient]);

  const handleCallPatient = async (ticket: QueueTicket) => {
    await updateQueueStatus(ticket.id, 'in_consultation', {
      doctorId: currentUser.id,
      doctorName: currentUser.fullName,
      roomNumber: 'Room 201',
    });
    setActiveTicket({ ...ticket, status: 'in_consultation' });
    const pt = patients.find((p: Patient) => p.id === ticket.patientId);
    if (pt) setActivePatient(pt);
    loadData();
  };

  const handleAddMedication = () => {
    const newItem: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      drugName: '',
      dosage: '500mg',
      route: 'Oral',
      frequency: 'TID (3x daily)',
      duration: '5 days',
      instructions: 'Take with food',
      quantity: 1,
    };
    setPrescriptionsList([...prescriptionsList, newItem]);
  };

  const handleRemoveMedication = (id: string) => {
    setPrescriptionsList(prescriptionsList.filter((m) => m.id !== id));
  };

  const handleUpdateMedication = (id: string, field: keyof PrescriptionItem, val: any) => {
    setPrescriptionsList(
      prescriptionsList.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  const toggleLabOrder = (code: string) => {
    if (selectedLabCodes.includes(code)) {
      setSelectedLabCodes(selectedLabCodes.filter((c) => c !== code));
    } else {
      setSelectedLabCodes([...selectedLabCodes, code]);
    }
  };

  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;

    // 1. Save Consultation record
    const consultation = await saveConsultation({
      ticketId: activeTicket?.id,
      patientId: activePatient.id,
      patientName: activePatient.fullName,
      patientMrn: activePatient.mrn,
      doctorId: currentUser.id,
      doctorName: currentUser.fullName,
      chiefComplaint: subjective || 'Routine consultation',
      historyOfPresentIllness: historyIllness,
      physicalExamination: physicalExam,
      icd10Code: selectedIcd?.code || 'Z00.00',
      icd10Description: selectedIcd?.description || 'General medical examination',
      diagnosisNotes,
      treatmentPlan: treatmentPlan || 'Clinical advice given.',
      followUpDate,
      doctorSignatureData: `Signed electronically by ${currentUser.fullName}, License DOC-ET-4891`,
      status: 'completed',
    });

    // 2. Save Prescriptions if any
    let rxRecord: Prescription | null = null;
    const validItems = prescriptionsList.filter((item) => item.drugName.trim().length > 0);
    if (validItems.length > 0) {
      rxRecord = await savePrescription({
        consultationId: consultation.id,
        patientId: activePatient.id,
        patientName: activePatient.fullName,
        patientMrn: activePatient.mrn,
        patientAllergies: activePatient.allergies,
        doctorId: currentUser.id,
        doctorName: currentUser.fullName,
        items: validItems,
        status: 'prescribed',
      });
    }

    // 3. Dispatch Lab Orders if selected
    for (const code of selectedLabCodes) {
      const catalogItem = COMMON_LAB_CATALOG.find((c: any) => c.code === code);
      if (catalogItem) {
        await createLabOrder({
          consultationId: consultation.id,
          patientId: activePatient.id,
          patientName: activePatient.fullName,
          patientMrn: activePatient.mrn,
          doctorId: currentUser.id,
          doctorName: currentUser.fullName,
          testName: catalogItem.name,
          testCode: catalogItem.code,
          priority: 'normal',
        });
      }
    }

    // 4. Generate combined Billing Invoice for Cashier
    const invoiceItems: any[] = [
      { id: 'inv-1', itemType: 'consultation', description: 'Specialist Doctor Consultation Fee', unitPrice: 300, quantity: 1, totalPrice: 300 },
    ];

    selectedLabCodes.forEach((code, idx) => {
      const catalogItem = COMMON_LAB_CATALOG.find((c: any) => c.code === code);
      if (catalogItem) {
        invoiceItems.push({
          id: `lab-inv-${idx}`,
          itemType: 'lab_test',
          description: `Laboratory: ${catalogItem.name}`,
          unitPrice: catalogItem.priceEtb,
          quantity: 1,
          totalPrice: catalogItem.priceEtb,
        });
      }
    });

    validItems.forEach((rx, idx) => {
      invoiceItems.push({
        id: `rx-inv-${idx}`,
        itemType: 'medication',
        description: `Pharmacy: ${rx.drugName} (${rx.dosage})`,
        unitPrice: 120,
        quantity: 1,
        totalPrice: 120,
      });
    });

    const totalAmt = invoiceItems.reduce((acc, curr) => acc + curr.totalPrice, 0);

    await createInvoice({
      patientId: activePatient.id,
      patientName: activePatient.fullName,
      patientMrn: activePatient.mrn,
      consultationId: consultation.id,
      items: invoiceItems,
      totalAmount: totalAmt,
      discountAmount: 0,
      netAmount: totalAmt,
      amountPaid: 0,
      paymentStatus: 'pending',
    });

    // Advance queue status
    if (activeTicket) {
      await updateQueueStatus(activeTicket.id, 'pending_payment');
    }

    setCompletedSuccess(true);
    if (rxRecord) {
      setPrintRxData(rxRecord);
    }

    setTimeout(() => {
      setCompletedSuccess(false);
      loadData();
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-6 h-6 text-brand-600" />
            <h1 className="text-xl font-bold text-slate-900">{t.doctor.title}</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Attending: {currentUser.fullName} • OPD Room 201
          </p>
        </div>

        {/* Action button to call next patient */}
        {queue.some((tkt) => tkt.status === 'triaged' || tkt.status === 'waiting_doctor') && (
          <button
            onClick={() => {
              const next = queue.find((tkt) => tkt.status === 'triaged' || tkt.status === 'waiting_doctor');
              if (next) handleCallPatient(next);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4 animate-bounce" />
            <span>{t.doctor.callNext}</span>
          </button>
        )}
      </div>

      {completedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Consultation finalized! SOAP notes archived, lab orders dispatched, and cashier invoice generated.</span>
        </div>
      )}

      {/* Main Grid: Active Consultation Workspace + Queue / Vitals Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Consultation Desk (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {activePatient ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              {/* Patient Banner */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {activePatient.mrn}
                    </span>
                    {activeTicket && (
                      <span className="font-bold text-xs bg-slate-800 text-white px-2 py-0.5 rounded">
                        {activeTicket.ticketNumber}
                      </span>
                    )}
                  </div>
                  <h2 className="font-bold text-base text-slate-900 mt-1">{activePatient.fullName}</h2>
                  <p className="text-xs text-slate-500">
                    {activePatient.gender} • {activePatient.age} yrs • Blood Group: {activePatient.bloodType || 'N/A'}
                  </p>
                </div>

                {/* Critical Allergy Warning */}
                {activePatient.allergies && activePatient.allergies.toLowerCase() !== 'none' && (
                  <div className="px-3 py-2 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs font-bold flex items-center space-x-2 shadow-xs">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <span>ALLERGY ALERT</span>
                      <p className="text-[11px] font-normal">{activePatient.allergies}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* SOAP Documentation Form */}
              <form onSubmit={handleCompleteConsultation} className="space-y-6 text-xs">
                {/* 1. Subjective (S) */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px]">S</span>
                    <span>Subjective (Chief Complaints & History)</span>
                  </div>
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Chief Complaints</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. High fever, headache, body chills for 3 days"
                      value={subjective}
                      onChange={(e) => setSubjective(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">History of Present Illness (HPI)</label>
                    <textarea
                      rows={2}
                      placeholder="Onset, severity, aggravating/relieving factors, previous self-medications..."
                      value={historyIllness}
                      onChange={(e) => setHistoryIllness(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. Objective (O) */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">O</span>
                    <span>Objective (Physical Exam & Findings)</span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="General appearance, chest auscultation, abdominal tenderness, ENT, neurological signs..."
                    value={physicalExam}
                    onChange={(e) => setPhysicalExam(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                {/* 3. Assessment (A) with Searchable ICD-10 */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">A</span>
                    <span>Assessment (ICD-10 Diagnostic Code)</span>
                  </div>
                  <ICD10Lookup
                    selectedCode={selectedIcd?.code}
                    onSelect={(code: ICD10Code) => setSelectedIcd(code)}
                  />
                  {selectedIcd && (
                    <div className="p-2.5 bg-white border border-brand-200 rounded-lg flex items-center justify-between">
                      <span className="font-semibold text-brand-900">
                        {selectedIcd.code} - {selectedIcd.description}
                      </span>
                      <span className="text-[10px] text-slate-400">{selectedIcd.category}</span>
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Clinical differential assessment / staging notes..."
                    value={diagnosisNotes}
                    onChange={(e) => setDiagnosisNotes(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                {/* 4. Plan (P) */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">P</span>
                    <span>Plan (Treatment & Advice)</span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Treatment regimen, diet & hydration advice, follow-up indications..."
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Follow-up Date</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                {/* 5. Diagnostic Laboratory Order Module */}
                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                    <FlaskConical className="w-4 h-4 text-amber-600" />
                    <span>Order Diagnostic Lab Investigations</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COMMON_LAB_CATALOG.map((test) => {
                      const isSelected = selectedLabCodes.includes(test.code);
                      return (
                        <button
                          key={test.code}
                          type="button"
                          onClick={() => toggleLabOrder(test.code)}
                          className={`p-2.5 text-left rounded-xl border transition-all text-xs cursor-pointer ${
                            isSelected
                              ? 'bg-amber-100 border-amber-400 font-bold text-amber-900 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold truncate">{test.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {test.priceEtb} ETB • {test.category}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. E-Prescription Medication Writer */}
                <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sky-900 font-bold text-xs uppercase tracking-wider">
                      <Pill className="w-4 h-4 text-sky-600" />
                      <span>Digital E-Prescription Items</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMedication}
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Drug</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {prescriptionsList.map((item) => (
                      <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Drug Name (e.g. Amoxicillin)"
                            value={item.drugName}
                            onChange={(e) => handleUpdateMedication(item.id, 'drugName', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Dosage (500mg)"
                            value={item.dosage}
                            onChange={(e) => handleUpdateMedication(item.id, 'dosage', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <select
                            value={item.frequency}
                            onChange={(e) => handleUpdateMedication(item.id, 'frequency', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                          >
                            <option value="OD (Once daily)">OD (Once daily)</option>
                            <option value="BID (Twice daily)">BID (Twice daily)</option>
                            <option value="TID (3x daily)">TID (3x daily)</option>
                            <option value="QID (4x daily)">QID (4x daily)</option>
                            <option value="PRN (As needed)">PRN (As needed)</option>
                          </select>
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Duration (5 days)"
                            value={item.duration}
                            onChange={(e) => handleUpdateMedication(item.id, 'duration', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedication(item.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Submission Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>{t.doctor.completeConsultation}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 space-y-2">
              <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">No Patient Currently in Consultation</p>
              <p className="text-xs">Select or call a waiting patient from the queue to open their medical chart.</p>
            </div>
          )}
        </div>

        {/* Sidebar: Current Patient Triage Vitals & Live Queue (1 col) */}
        <div className="space-y-6">
          {/* Latest Vitals Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">{t.doctor.pastVitals}</h3>
            </div>

            {latestVitals ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Blood Pressure:</span>
                  <span className="font-bold text-slate-900">{latestVitals.systolicBp}/{latestVitals.diastolicBp} mmHg</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Temperature:</span>
                  <span className="font-bold text-slate-900">{latestVitals.temperature} °C</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Pulse Rate:</span>
                  <span className="font-bold text-slate-900">{latestVitals.pulseRate} bpm</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500">BMI:</span>
                  <span className="font-bold text-slate-900">{latestVitals.bmi} ({latestVitals.bmiCategory})</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Triage Priority:</span>
                  <span className="font-bold uppercase text-brand-700">{latestVitals.priorityLevel}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">No triage vitals recorded for this visit.</p>
            )}
          </div>

          {/* Outpatient Waiting Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">Waiting Patients</h3>
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {queue.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">Queue is empty.</p>
              ) : (
                queue.map((tkt) => (
                  <div key={tkt.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-900">{tkt.ticketNumber} • {tkt.patientName}</span>
                      <span className="text-[10px] text-slate-400 block">{tkt.status}</span>
                    </div>
                    {tkt.status !== 'in_consultation' && tkt.status !== 'completed' && (
                      <button
                        onClick={() => handleCallPatient(tkt)}
                        className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      >
                        Call
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Print Modal */}
      {printRxData && (
        <PrescriptionPrint
          prescription={printRxData}
          onClose={() => setPrintRxData(null)}
        />
      )}
    </div>
  );
};
