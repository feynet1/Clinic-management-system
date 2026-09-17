import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  checkInAppointment,
  getDoctorSchedules,
  saveDoctorSchedule,
  getPatients,
} from '../services/dataService';
import type { Appointment, AppointmentStatus, DoctorSchedule, Patient } from '../types';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Plus,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  UserCheck,
  Building2,
  X,
  Sparkles,
  Ticket
} from 'lucide-react';

export const AppointmentsPage: React.FC = () => {
  const { currentRole, currentUser } = useApp();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Active sub-tab: 'appointments' or 'schedules'
  const [activeTab, setActiveTab] = useState<'appointments' | 'schedules'>('appointments');

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterDoctor, setFilterDoctor] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // New Appointment Form State
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [aptDoctorId, setAptDoctorId] = useState('22222222-2222-2222-2222-222222222222');
  const [aptDoctorName, setAptDoctorName] = useState('Dr. Henok Bekele');
  const [aptDepartment, setAptDepartment] = useState('General Outpatient');
  const [aptDate, setAptDate] = useState(new Date().toISOString().split('T')[0]);
  const [aptStartTime, setAptStartTime] = useState('09:30');
  const [aptReason, setAptReason] = useState('');
  const [aptNotes, setAptNotes] = useState('');

  // New Schedule Form State
  const [schedDoctorId, setSchedDoctorId] = useState('22222222-2222-2222-2222-222222222222');
  const [schedDoctorName, setSchedDoctorName] = useState('Dr. Henok Bekele');
  const [schedDept, setSchedDept] = useState('General Outpatient & Internal Medicine');
  const [schedDay, setSchedDay] = useState(1);
  const [schedStart, setSchedStart] = useState('08:30');
  const [schedEnd, setSchedEnd] = useState('13:30');
  const [schedDuration, setSchedDuration] = useState(20);
  const [schedRoom, setSchedRoom] = useState('Room 2 (OPD)');

  const loadData = async () => {
    setLoading(true);
    const [apts, scheds, pts] = await Promise.all([
      getAppointments(),
      getDoctorSchedules(),
      getPatients(),
    ]);
    setAppointments(apts);
    setSchedules(scheds);
    setPatients(pts);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (filterDoctor !== 'all' && apt.doctorId !== filterDoctor) return false;
    if (filterStatus !== 'all' && apt.status !== filterStatus) return false;
    if (selectedDate && apt.appointmentDate !== selectedDate) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        apt.patientName.toLowerCase().includes(q) ||
        apt.patientMrn.toLowerCase().includes(q) ||
        apt.appointmentNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    // Compute end time: add 20 mins to start time
    const [h, m] = aptStartTime.split(':').map(Number);
    const endMinutes = h * 60 + m + 20;
    const endH = String(Math.floor(endMinutes / 60)).padStart(2, '0');
    const endM = String(endMinutes % 60).padStart(2, '0');
    const computedEnd = `${endH}:${endM}`;

    const newApt = await createAppointment({
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      patientMrn: selectedPatient.mrn,
      patientPhone: selectedPatient.phone,
      doctorId: aptDoctorId,
      doctorName: aptDoctorName,
      department: aptDepartment,
      appointmentDate: aptDate,
      startTime: aptStartTime,
      endTime: computedEnd,
      reasonForVisit: aptReason || 'General Medical Consultation',
      status: 'confirmed',
      notes: aptNotes,
    });

    setIsBookModalOpen(false);
    setSelectedPatient(null);
    setAptReason('');
    setAptNotes('');
    await loadData();
    showNotification(`Advance appointment booked successfully: ${newApt.appointmentNumber}`);
  };

  const handleCheckIn = async (apt: Appointment) => {
    try {
      const ticket = await checkInAppointment(apt.id);
      await loadData();
      showNotification(`Checked-in ${apt.patientName}! Live Queue Ticket Issued: ${ticket.ticketNumber}`);
    } catch (err: any) {
      alert(`Check-in failed: ${err.message}`);
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    await saveDoctorSchedule({
      doctorId: schedDoctorId,
      doctorName: schedDoctorName,
      department: schedDept,
      dayOfWeek: schedDay,
      dayName: days[schedDay % 7],
      startTime: schedStart,
      endTime: schedEnd,
      slotDurationMinutes: schedDuration,
      maxPatientsPerSlot: 1,
      roomNumber: schedRoom,
      isActive: true,
    });

    setIsScheduleModalOpen(false);
    await loadData();
    showNotification(`Doctor weekly shift updated for ${schedDoctorName}`);
  };

  // Patients matching search in booking modal
  const matchingPatients = patients.filter((p) => {
    if (!patientSearch.trim()) return false;
    const q = patientSearch.toLowerCase();
    return p.fullName.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q) || p.phone.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-brand-50 rounded-2xl border border-brand-100 text-brand-700">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Doctor Schedules & Appointments
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage doctor shift availability, advance bookings, and live queue check-in
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Book Advance Appointment</span>
          </button>

          {(currentRole === 'admin' || currentRole === 'doctor') && (
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Define Shift Slots</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'appointments'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Scheduled Appointments ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedules')}
          className={`pb-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'schedules'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Doctor Weekly Availability & Shift Slots ({schedules.length})</span>
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS DESK */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Date Picker */}
              <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 focus:outline-none"
                />
              </div>

              {/* Doctor Filter */}
              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">All Doctors</option>
                <option value="22222222-2222-2222-2222-222222222222">Dr. Henok Bekele (OPD)</option>
                <option value="11111111-1111-1111-1111-111111111111">Dr. Selamawit Tadesse (Executive)</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Clear Date Filter Button */}
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className="text-[11px] text-brand-600 hover:text-brand-800 font-bold px-2 py-1"
                >
                  View All Dates
                </button>
              )}
            </div>

            {/* Patient / MRN Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, MRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {filteredAppointments.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <Calendar className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No appointments found matching filters.</p>
                <p className="text-xs text-slate-400">
                  Click "Book Advance Appointment" to schedule an outpatient consultation.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-4">Time Slot</th>
                      <th className="p-4">Appointment #</th>
                      <th className="p-4">Patient & MRN</th>
                      <th className="p-4">Doctor & Room</th>
                      <th className="p-4">Reason for Visit</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-900">
                          <div className="flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-brand-600" />
                            <span>{apt.startTime} – {apt.endTime}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal">{apt.appointmentDate}</span>
                        </td>

                        <td className="p-4 font-mono font-bold text-brand-700">
                          {apt.appointmentNumber}
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-slate-900">{apt.patientName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {apt.patientMrn} • {apt.patientPhone}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{apt.doctorName}</div>
                          <div className="text-[11px] text-slate-500">{apt.department}</div>
                        </td>

                        <td className="p-4 max-w-xs truncate text-slate-600" title={apt.reasonForVisit}>
                          {apt.reasonForVisit}
                        </td>

                        <td className="p-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              apt.status === 'checked_in'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : apt.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : apt.status === 'completed'
                                ? 'bg-slate-100 text-slate-700'
                                : apt.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {apt.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="p-4 text-right space-x-2">
                          {apt.status !== 'checked_in' && apt.status !== 'completed' && apt.status !== 'cancelled' ? (
                            <button
                              onClick={() => handleCheckIn(apt)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs inline-flex items-center space-x-1 cursor-pointer transition-all"
                              title="Check-in patient & issue live waiting room queue ticket"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                              <span>Check-In</span>
                            </button>
                          ) : apt.status === 'checked_in' ? (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                              In Queue
                            </span>
                          ) : null}

                          {apt.status === 'scheduled' && (
                            <button
                              onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Confirm
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR SHIFT SCHEDULES & AVAILABILITY */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules.map((sched) => (
              <div
                key={sched.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-extrabold text-xs border border-brand-100">
                      {sched.dayName}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {sched.roomNumber}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-1">{sched.doctorName}</h3>
                  <p className="text-xs text-slate-500">{sched.department}</p>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Shift Hours:</span>
                      <strong className="font-mono text-slate-900">{sched.startTime} – {sched.endTime}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Consultation Duration:</span>
                      <strong className="text-slate-900">{sched.slotDurationMinutes} mins / patient</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Shift Status:</span>
                      <span className="font-bold text-emerald-600 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Active</span>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setAptDoctorId(sched.doctorId);
                    setAptDoctorName(sched.doctorName);
                    setAptDepartment(sched.department);
                    setIsBookModalOpen(true);
                  }}
                  className="w-full py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book for this Doctor</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: BOOK ADVANCE APPOINTMENT */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-black text-slate-900">Book Advance Appointment</h3>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
              {/* Patient Lookup */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Registered Patient <span className="text-rose-500">*</span>
                </label>
                {selectedPatient ? (
                  <div className="p-3 bg-brand-50 border border-brand-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-brand-900">{selectedPatient.fullName}</p>
                      <p className="text-[11px] text-brand-700 font-mono">
                        {selectedPatient.mrn} • {selectedPatient.phone}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPatient(null)}
                      className="text-xs text-rose-600 font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search patient name, MRN, phone..."
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    {matchingPatients.length > 0 && (
                      <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white shadow-xs">
                        {matchingPatients.slice(0, 5).map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedPatient(p);
                              setPatientSearch('');
                            }}
                            className="p-2.5 hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                          >
                            <div>
                              <strong className="text-slate-900">{p.fullName}</strong>
                              <span className="text-slate-400 font-mono ml-2">({p.mrn})</span>
                            </div>
                            <span className="text-[11px] text-brand-600 font-bold">Select →</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Doctor Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Doctor & Department</label>
                <select
                  value={aptDoctorId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setAptDoctorId(id);
                    if (id === '22222222-2222-2222-2222-222222222222') {
                      setAptDoctorName('Dr. Henok Bekele');
                      setAptDepartment('General Outpatient & Internal Medicine');
                    } else {
                      setAptDoctorName('Dr. Selamawit Tadesse');
                      setAptDepartment('Executive & Specialty Consultations');
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold cursor-pointer"
                >
                  <option value="22222222-2222-2222-2222-222222222222">Dr. Henok Bekele — General Outpatient</option>
                  <option value="11111111-1111-1111-1111-111111111111">Dr. Selamawit Tadesse — Executive Clinic</option>
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Appointment Date</label>
                  <input
                    type="date"
                    required
                    value={aptDate}
                    onChange={(e) => setAptDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time Slot</label>
                  <input
                    type="time"
                    required
                    value={aptStartTime}
                    onChange={(e) => setAptStartTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>
              </div>

              {/* Reason For Visit */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chief Complaint / Reason for Booking</label>
                <input
                  type="text"
                  placeholder="e.g. Prenatal check, chronic hypertension review..."
                  value={aptReason}
                  onChange={(e) => setAptReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Clinical Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Special instructions or prior lab reviews..."
                  value={aptNotes}
                  onChange={(e) => setAptNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedPatient}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold transition-all shadow-md shadow-brand-600/20"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DEFINE DOCTOR SHIFTS & AVAILABILITY */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-black text-slate-900">Define Doctor Weekly Shift</h3>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctor</label>
                <select
                  value={schedDoctorId}
                  onChange={(e) => {
                    setSchedDoctorId(e.target.value);
                    if (e.target.value === '22222222-2222-2222-2222-222222222222') {
                      setSchedDoctorName('Dr. Henok Bekele');
                      setSchedDept('General Outpatient & Internal Medicine');
                    } else {
                      setSchedDoctorName('Dr. Selamawit Tadesse');
                      setSchedDept('Clinical Administration');
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold cursor-pointer"
                >
                  <option value="22222222-2222-2222-2222-222222222222">Dr. Henok Bekele</option>
                  <option value="11111111-1111-1111-1111-111111111111">Dr. Selamawit Tadesse</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Day of Week</label>
                <select
                  value={schedDay}
                  onChange={(e) => setSchedDay(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold cursor-pointer"
                >
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                  <option value={0}>Sunday</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Shift Start Time</label>
                  <input
                    type="time"
                    value={schedStart}
                    onChange={(e) => setSchedStart(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Shift End Time</label>
                  <input
                    type="time"
                    value={schedEnd}
                    onChange={(e) => setSchedEnd(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slot Duration (Mins)</label>
                  <input
                    type="number"
                    min={10}
                    max={60}
                    step={5}
                    value={schedDuration}
                    onChange={(e) => setSchedDuration(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Room</label>
                  <input
                    type="text"
                    value={schedRoom}
                    onChange={(e) => setSchedRoom(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-md shadow-brand-600/20"
                >
                  Save Shift Availability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
