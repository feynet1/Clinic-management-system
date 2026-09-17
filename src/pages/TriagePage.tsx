import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  getPatients, 
  getQueueTickets, 
  saveTriageVitals, 
  calculateBmi, 
  getTriageHistory 
} from '../services/dataService';
import { 
  HeartHandshake, 
  Activity, 
  Thermometer, 
  Heart, 
  Wind, 
  Scale, 
  AlertTriangle, 
  Check, 
  User, 
  Clock 
} from 'lucide-react';
import type { Patient, QueueTicket, TriagePriority, TriageVitals } from '../types';

export const TriagePage: React.FC = () => {
  const { t, currentUser } = useApp();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [queue, setQueue] = useState<QueueTicket[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [history, setHistory] = useState<TriageVitals[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Vitals form state
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [temp, setTemp] = useState<number>(36.8);
  const [pulse, setPulse] = useState<number>(76);
  const [respRate, setRespRate] = useState<number>(16);
  const [spo2, setSpo2] = useState<number>(98);
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(68);
  const [painScore, setPainScore] = useState<number>(2);
  const [priority, setPriority] = useState<TriagePriority>('normal');
  const [complaint, setComplaint] = useState<string>('');
  const [nurseNotes, setNurseNotes] = useState<string>('');

  const { bmi, category: bmiCategory } = calculateBmi(height, weight);

  const loadData = async () => {
    const [pts, q] = await Promise.all([getPatients(), getQueueTickets()]);
    setPatients(pts);
    setQueue(q);
    if (pts.length > 0 && !selectedPatientId) {
      setSelectedPatientId(pts[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      getTriageHistory(selectedPatientId).then(setHistory);
    }
  }, [selectedPatientId]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  // Quick triage queue tickets needing vitals
  const pendingTriageTickets = queue.filter(
    (item) => item.status === 'registered' || item.status === 'triaged'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    await saveTriageVitals({
      patientId: selectedPatientId,
      nurseId: currentUser.id,
      nurseName: currentUser.fullName,
      systolicBp: systolic,
      diastolicBp: diastolic,
      temperature: temp,
      pulseRate: pulse,
      respiratoryRate: respRate,
      spo2,
      heightCm: height,
      weightKg: weight,
      painScore,
      priorityLevel: priority,
      chiefComplaintShort: complaint || 'General checkup',
      notes: nurseNotes,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);

    // Refresh history
    const h = await getTriageHistory(selectedPatientId);
    setHistory(h);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <HeartHandshake className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">{t.triage.title}</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t.triage.subtitle}</p>
        </div>

        {/* Selected Patient Selector */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-1.5 rounded-xl w-full sm:w-auto">
          <User className="w-4 h-4 text-slate-400 ml-2" />
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none pr-3 cursor-pointer"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.mrn})
              </option>
            ))}
          </select>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Vitals saved and patient prioritized in queue! Works offline and online.</span>
        </div>
      )}

      {/* Main Grid: Form + Pending Queue/History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vitals Recording Form (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          {selectedPatient && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap justify-between items-center gap-3">
              <div>
                <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  {selectedPatient.mrn}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1">{selectedPatient.fullName}</h3>
                <p className="text-xs text-slate-500">
                  {selectedPatient.gender} • {selectedPatient.age} yrs • Blood Group: {selectedPatient.bloodType || 'Unknown'}
                </p>
              </div>

              {selectedPatient.allergies && selectedPatient.allergies.toLowerCase() !== 'none' && (
                <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-medium flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Allergy: {selectedPatient.allergies}</span>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Vitals Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Blood Pressure */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-slate-700 font-semibold">
                  <Activity className="w-4 h-4 text-rose-500" />
                  <span>{t.triage.bp}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Sys"
                    value={systolic}
                    onChange={(e) => setSystolic(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white text-center font-bold text-sm"
                  />
                  <span className="text-slate-400 font-bold">/</span>
                  <input
                    type="number"
                    placeholder="Dia"
                    value={diastolic}
                    onChange={(e) => setDiastolic(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white text-center font-bold text-sm"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block text-center">Standard: 120/80 mmHg</span>
              </div>

              {/* Temperature */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-slate-700 font-semibold">
                  <Thermometer className="w-4 h-4 text-amber-500" />
                  <span>{t.triage.temp}</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-center font-bold text-sm"
                />
                <span className="text-[10px] text-slate-400 block text-center">Normal: 36.5 - 37.5 °C</span>
              </div>

              {/* Pulse Rate */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-slate-700 font-semibold">
                  <Heart className="w-4 h-4 text-rose-600" />
                  <span>{t.triage.pulse}</span>
                </div>
                <input
                  type="number"
                  value={pulse}
                  onChange={(e) => setPulse(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-center font-bold text-sm"
                />
                <span className="text-[10px] text-slate-400 block text-center">Normal: 60 - 100 bpm</span>
              </div>

              {/* Respiratory Rate & SpO2 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-slate-700 font-semibold">
                  <Wind className="w-4 h-4 text-sky-500" />
                  <span>Resp / SpO2 (%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="RR"
                    value={respRate}
                    onChange={(e) => setRespRate(Number(e.target.value))}
                    className="w-1/2 p-2 border border-slate-300 rounded-lg bg-white text-center font-bold text-sm"
                  />
                  <input
                    type="number"
                    placeholder="SpO2"
                    value={spo2}
                    onChange={(e) => setSpo2(Number(e.target.value))}
                    className="w-1/2 p-2 border border-slate-300 rounded-lg bg-white text-center font-bold text-sm"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block text-center">RR: 12-20 • SpO2: 95-100%</span>
              </div>

              {/* Height & Weight with Auto BMI */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-indigo-500" />
                    <span>Height & Weight</span>
                  </div>
                  <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    BMI: {bmi} ({bmiCategory})
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white text-center font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white text-center font-bold text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pain Score Slider & Priority Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>{t.triage.painScore}</span>
                  <span className="font-bold text-brand-600">{painScore} / 10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painScore}
                  onChange={(e) => setPainScore(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 - No Pain</span>
                  <span>5 - Moderate</span>
                  <span>10 - Worst Possible</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-semibold text-slate-700 block">{t.triage.priority}</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority('normal')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      priority === 'normal'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {t.triage.normal}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('urgent')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      priority === 'urgent'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {t.triage.urgent}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('emergency')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      priority === 'emergency'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {t.triage.emergency}
                  </button>
                </div>
              </div>
            </div>

            {/* Chief Complaint & Notes */}
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t.triage.chiefComplaint} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High fever, chills, persistent dry cough, vomiting"
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nurse Triage Notes</label>
                <textarea
                  rows={2}
                  placeholder="Observations, alert tags, or emergency medications administered..."
                  value={nurseNotes}
                  onChange={(e) => setNurseNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-md shadow-brand-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>{t.triage.recordVitals}</span>
            </button>
          </form>
        </div>

        {/* Sidebar: Waiting Patients + Patient Vitals History (1 col) */}
        <div className="space-y-6">
          {/* Waiting Triage Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">Waiting for Triage</h3>
            </div>

            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {pendingTriageTickets.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No patients in triage queue.</p>
              ) : (
                pendingTriageTickets.map((tkt) => (
                  <button
                    key={tkt.id}
                    onClick={() => setSelectedPatientId(tkt.patientId)}
                    className={`w-full text-left py-2.5 px-2 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors cursor-pointer ${
                      selectedPatientId === tkt.patientId ? 'bg-brand-50 font-bold text-brand-900' : ''
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-800">{tkt.ticketNumber} • {tkt.patientName}</span>
                      <span className="text-[10px] text-slate-400 block">{tkt.patientMrn}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {tkt.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Historical Vitals for Selected Patient */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">Past Vitals History</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No prior triage visits recorded.</p>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                      <span>{new Date(item.createdAt).toLocaleDateString('en-GB')}</span>
                      <span className="text-brand-700 uppercase">{item.priorityLevel}</span>
                    </div>
                    <div className="font-semibold text-slate-800">
                      BP: {item.systolicBp}/{item.diastolicBp} mmHg • Temp: {item.temperature}°C • Pulse: {item.pulseRate} bpm
                    </div>
                    <p className="text-[11px] text-slate-600">BMI: {item.bmi} ({item.bmiCategory})</p>
                    <p className="text-[11px] text-slate-500 italic truncate">"{item.chiefComplaintShort}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
