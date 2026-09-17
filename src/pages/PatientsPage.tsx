import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getPatients, registerPatient, createQueueTicket } from '../services/dataService';
import { 
  Users, 
  Search, 
  Plus, 
  UserPlus, 
  ShieldAlert, 
  Phone, 
  MapPin, 
  Heart, 
  Ticket, 
  Check, 
  X 
} from 'lucide-react';
import type { Patient } from '../types';

interface PatientsPageProps {
  onNavigateToTriage?: (patientId: string) => void;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({ onNavigateToTriage }) => {
  const { t } = useApp();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [ticketIssuedSuccess, setTicketIssuedSuccess] = useState<string | null>(null);
  const [cloudSyncWarning, setCloudSyncWarning] = useState<string | null>(null);

  // Form State for new registration
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    age: 30,
    phone: '+251-9',
    address: 'Addis Ababa',
    kebele: '',
    woreda: '',
    bloodType: 'O+' as any,
    allergies: 'None',
    chronicConditions: 'None',
    emergencyContactName: '',
    emergencyContactPhone: '+251-9',
    emergencyContactRelation: '',
  });

  const loadPatients = async () => {
    const list = await getPatients();
    setPatients(list);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;

    const res = await registerPatient(formData);
    await loadPatients();
    setIsModalOpen(false);

    if (res.syncedToCloud) {
      setTicketIssuedSuccess(`Patient ${res.patient.fullName} (${res.patient.mrn}) registered & synced to Supabase Cloud!`);
      setCloudSyncWarning(null);
    } else if (res.cloudError) {
      setTicketIssuedSuccess(`Patient ${res.patient.fullName} (${res.patient.mrn}) registered in local database.`);
      setCloudSyncWarning(res.cloudError);
    } else {
      setTicketIssuedSuccess(`Patient ${res.patient.fullName} (${res.patient.mrn}) registered in offline mode.`);
    }

    setTimeout(() => setTicketIssuedSuccess(null), 6000);

    // Reset form
    setFormData({
      fullName: '',
      gender: 'Male',
      age: 30,
      phone: '+251-9',
      address: 'Addis Ababa',
      kebele: '',
      woreda: '',
      bloodType: 'O+',
      allergies: 'None',
      chronicConditions: 'None',
      emergencyContactName: '',
      emergencyContactPhone: '+251-9',
      emergencyContactRelation: '',
    });
  };

  const handleIssueQueueTicket = async (patient: Patient) => {
    const ticket = await createQueueTicket(patient.id, patient.fullName, patient.mrn, 'normal');
    setTicketIssuedSuccess(`Ticket ${ticket.ticketNumber} issued for ${patient.fullName}!`);
    setTimeout(() => setTicketIssuedSuccess(null), 4000);
  };

  const filteredPatients = patients.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(term) ||
      p.mrn.toLowerCase().includes(term) ||
      p.phone.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-brand-600" />
            <h1 className="text-xl font-bold text-slate-900">{t.nav.patients}</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search, onboard, and manage electronic medical record numbers (MRN).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center space-x-2 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t.patient.registerPatient}</span>
        </button>
      </div>

      {ticketIssuedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{ticketIssuedSuccess}</span>
          </div>
          <button onClick={() => setTicketIssuedSuccess(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {cloudSyncWarning && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start justify-between">
          <div className="flex items-start space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Supabase Row-Level Security Notice:</p>
              <p className="mt-0.5 text-amber-800">
                {cloudSyncWarning} — Patient is safely stored in local IndexedDB and queued. To enable direct cloud storage, run <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">FIX_SUPABASE_PERMISSIONS.sql</code> in your Supabase SQL Editor.
              </p>
            </div>
          </div>
          <button onClick={() => setCloudSyncWarning(null)} className="text-amber-700 hover:text-amber-900 ml-3">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={t.patient.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
        />
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-sm">
            {t.patient.noPatientsFound}
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const hasAllergies = patient.allergies && patient.allergies.toLowerCase() !== 'none';
            return (
              <div
                key={patient.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                        {patient.mrn}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 mt-2">{patient.fullName}</h3>
                      <p className="text-xs text-slate-500">
                        {patient.gender} • {patient.age} yrs • Blood Group: <span className="font-semibold text-rose-600">{patient.bloodType || 'N/A'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{patient.phone}</span>
                    </div>
                    {patient.address && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{patient.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Allergy Banner */}
                  {hasAllergies ? (
                    <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center space-x-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="truncate font-medium">Allergy: {patient.allergies}</span>
                    </div>
                  ) : (
                    <div className="mt-3 text-[11px] text-slate-400">No known drug allergies</div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center space-x-2">
                  <button
                    onClick={() => handleIssueQueueTicket(patient)}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5 text-slate-600" />
                    <span>Issue Ticket</span>
                  </button>

                  {onNavigateToTriage && (
                    <button
                      onClick={() => onNavigateToTriage(patient.id)}
                      className="py-2 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Triage
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Patient Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-base text-slate-900">{t.patient.registerPatient}</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">{t.patient.fullName} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Almaz Bekele"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t.patient.gender} *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t.patient.age} *</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t.patient.phone} *</label>
                  <input
                    type="text"
                    required
                    placeholder="+251-9..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t.patient.bloodType}</label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">{t.patient.address}</label>
                  <input
                    type="text"
                    placeholder="Bole Subcity, Woreda 03, House 412"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-rose-700 block mb-1">{t.patient.allergies}</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Aspirin, Sulfa drugs (or 'None')"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="w-full p-2.5 border border-rose-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-rose-50/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">{t.patient.chronicConditions}</label>
                  <input
                    type="text"
                    placeholder="e.g. Hypertension, Diabetes, Asthma"
                    value={formData.chronicConditions}
                    onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Emergency Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+251-9..."
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-md shadow-brand-600/20 cursor-pointer"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
