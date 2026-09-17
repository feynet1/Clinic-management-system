import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  getPatients, 
  getQueueTickets, 
  getLabOrders, 
  getInvoices, 
  updateQueueStatus 
} from '../services/dataService';
import { 
  Users, 
  Clock, 
  Stethoscope, 
  FlaskConical, 
  Receipt, 
  ArrowRight, 
  PlusCircle, 
  HeartHandshake,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { Patient, QueueTicket, LabOrder, Invoice } from '../types';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { t, currentRole, currentUser } = useApp();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [queue, setQueue] = useState<QueueTicket[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [pts, q, labs, invs] = await Promise.all([
        getPatients(),
        getQueueTickets(),
        getLabOrders(),
        getInvoices(),
      ]);
      setPatients(pts);
      setQueue(q);
      setLabOrders(labs);
      setInvoices(invs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const waitingTickets = queue.filter(
    (item) => item.status === 'registered' || item.status === 'triaged' || item.status === 'waiting_doctor'
  );
  const activeConsultations = queue.filter((item) => item.status === 'in_consultation');
  const pendingLabs = labOrders.filter((item) => item.status !== 'completed');
  const todayTotalRevenue = invoices
    .filter((inv) => inv.paymentStatus === 'paid')
    .reduce((acc, curr) => acc + curr.netAmount, 0);

  const stats = [
    {
      title: 'Active Waiting Queue',
      value: waitingTickets.length,
      subtitle: `${activeConsultations.length} in consultation`,
      icon: <Clock className="w-6 h-6 text-brand-600" />,
      bg: 'bg-brand-50 border-brand-100',
    },
    {
      title: 'Registered Patients',
      value: patients.length,
      subtitle: 'Total electronic profiles',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-100',
    },
    {
      title: 'Pending Lab Orders',
      value: pendingLabs.length,
      subtitle: `${labOrders.filter((l) => l.status === 'completed').length} completed today`,
      icon: <FlaskConical className="w-6 h-6 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-100',
    },
    {
      title: "Today's Revenue",
      value: `${todayTotalRevenue.toLocaleString()} ETB`,
      subtitle: `${invoices.filter((i) => i.paymentStatus === 'pending').length} pending bills`,
      icon: <Receipt className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-800 to-sky-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/20">
              {currentUser.role.toUpperCase()} WORKBENCH
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-2">
            Welcome, {currentUser.fullName}
          </h1>
          <p className="text-slate-200 text-sm mt-1">
            ClinicCare Outpatient Platform • All clinical and financial workflows operational.
          </p>
        </div>

        {/* Quick Role Actions */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {(currentRole === 'receptionist' || currentRole === 'admin') && (
            <button
              onClick={() => onNavigate('patients')}
              className="px-4 py-2 bg-white text-brand-900 hover:bg-brand-50 rounded-xl text-xs font-bold shadow flex items-center space-x-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.patient.registerPatient}</span>
            </button>
          )}

          {(currentRole === 'nurse' || currentRole === 'admin') && (
            <button
              onClick={() => onNavigate('triage')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow flex items-center space-x-2 transition-all cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>{t.triage.title}</span>
            </button>
          )}

          {(currentRole === 'doctor' || currentRole === 'admin') && (
            <button
              onClick={() => onNavigate('doctor')}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-xs font-bold shadow flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>{t.doctor.title}</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('queue-tv')}
            className="px-4 py-2 bg-sky-600/60 hover:bg-sky-600 text-white rounded-xl text-xs font-bold border border-white/20 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <span>{t.queue.waitingRoomMonitor}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${stat.bg} shadow-sm transition-all hover:shadow`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{stat.title}</span>
              <div className="p-2 bg-white rounded-xl shadow-xs">{stat.icon}</div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-3">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Two-Column Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Queue Overview (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-brand-600" />
              <h2 className="font-bold text-base text-slate-900">Live Outpatient Queue</h2>
            </div>
            <button
              onClick={() => onNavigate('queue-tv')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>Full Screen TV View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto flex-1">
            {queue.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No queue tickets today.</div>
            ) : (
              queue.slice(0, 6).map((ticket) => {
                const isUrgent = ticket.priority === 'urgent' || ticket.priority === 'emergency';
                const isCalling = ticket.status === 'in_consultation';
                return (
                  <div
                    key={ticket.id}
                    className={`p-4 flex items-center justify-between transition-colors ${
                      isCalling ? 'bg-emerald-50/60 border-l-4 border-emerald-500' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-sm shadow-xs ${
                          isCalling
                            ? 'bg-emerald-600 text-white'
                            : isUrgent
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80">TICKET</span>
                        <span>{ticket.ticketNumber}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-900">{ticket.patientName}</span>
                          <span className="font-mono text-xs text-slate-400">({ticket.patientMrn})</span>
                          {isUrgent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                              {ticket.priority.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {ticket.department} {ticket.roomNumber ? `• ${ticket.roomNumber}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          ticket.status === 'in_consultation'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ticket.status === 'triaged'
                            ? 'bg-blue-100 text-blue-800'
                            : ticket.status === 'waiting_doctor'
                            ? 'bg-amber-100 text-amber-800'
                            : ticket.status === 'completed'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ticket.status.replace('_', ' ')}
                      </span>

                      {/* Doctor Call Next Action */}
                      {(currentRole === 'doctor' || currentRole === 'admin') &&
                        ticket.status !== 'in_consultation' &&
                        ticket.status !== 'completed' && (
                          <button
                            onClick={async () => {
                              await updateQueueStatus(ticket.id, 'in_consultation', {
                                doctorId: currentUser.id,
                                doctorName: currentUser.fullName,
                                roomNumber: 'Room 201',
                              });
                              loadData();
                            }}
                            className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Call
                          </button>
                        )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Module Navigation & Offline Summary (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Clinical Modules</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onNavigate('patients')}
                className="p-3 bg-slate-50 hover:bg-brand-50 hover:border-brand-200 border border-slate-200 rounded-xl text-left transition-all group cursor-pointer"
              >
                <Users className="w-5 h-5 text-brand-600 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-slate-800">{t.nav.patients}</p>
                <p className="text-[10px] text-slate-400">MRN Onboarding</p>
              </button>

              <button
                onClick={() => onNavigate('triage')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl text-left transition-all group cursor-pointer"
              >
                <HeartHandshake className="w-5 h-5 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-slate-800">{t.nav.triage}</p>
                <p className="text-[10px] text-slate-400">Vitals & BMI</p>
              </button>

              <button
                onClick={() => onNavigate('doctor')}
                className="p-3 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 border border-slate-200 rounded-xl text-left transition-all group cursor-pointer"
              >
                <Stethoscope className="w-5 h-5 text-sky-600 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-slate-800">{t.nav.doctorDesk}</p>
                <p className="text-[10px] text-slate-400">SOAP & ICD-10</p>
              </button>

              <button
                onClick={() => onNavigate('lab')}
                className="p-3 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-200 rounded-xl text-left transition-all group cursor-pointer"
              >
                <FlaskConical className="w-5 h-5 text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-slate-800">{t.nav.labPortal}</p>
                <p className="text-[10px] text-slate-400">Tests & Reports</p>
              </button>

              <button
                onClick={() => onNavigate('billing')}
                className="p-3 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 rounded-xl text-left transition-all group cursor-pointer"
              >
                <Receipt className="w-5 h-5 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-slate-800">{t.nav.billing}</p>
                <p className="text-[10px] text-slate-400">Telebirr & Receipts</p>
              </button>

              <button
                onClick={() => onNavigate('queue-tv')}
                className="p-3 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 border border-slate-200 rounded-xl text-left transition-all group cursor-pointer"
              >
                <Clock className="w-5 h-5 text-rose-600 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-slate-800">{t.nav.queueMonitor}</p>
                <p className="text-[10px] text-slate-400">Waiting TV Mode</p>
              </button>
            </div>
          </div>

          {/* System Compliance & Offline Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Offline-First Engine</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If clinic internet disconnects, clinical notes, vitals, and registrations continue locally via IndexedDB. Auto-sync resumes immediately when reconnected.
            </p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-700 flex justify-between">
              <span>Database: IndexedDB / Supabase</span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
