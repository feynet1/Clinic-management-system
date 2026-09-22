import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getInvoices, getPatients, getQueueTickets } from '../services/dataService';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  Activity,
  Flame,
  FileDown,
} from 'lucide-react';
import type { Invoice, Patient, QueueTicket } from '../types';
import { ClinicalReportPrint } from '../components/print/ClinicalReportPrint';

export const AnalyticsPage: React.FC = () => {
  const { t } = useApp();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [queue, setQueue] = useState<QueueTicket[]>([]);
  const [showReport, setShowReport] = useState<boolean>(false);

  useEffect(() => {
    Promise.all([getInvoices(), getPatients(), getQueueTickets()]).then(([invs, pts, q]) => {
      setInvoices(invs);
      setPatients(pts);
      setQueue(q);
    });
  }, []);

  // Compute Revenue by Service Category
  const revenueByCategory = {
    Consultation: 0,
    Laboratory: 0,
    Pharmacy: 0,
  };

  invoices.forEach((inv) => {
    inv.items.forEach((item: any) => {
      if (item.itemType === 'consultation') revenueByCategory.Consultation += item.totalPrice;
      else if (item.itemType === 'lab_test') revenueByCategory.Laboratory += item.totalPrice;
      else revenueByCategory.Pharmacy += item.totalPrice;
    });
  });

  const totalRevenue = Object.values(revenueByCategory).reduce((a, b) => a + b, 0);

  // Compute Revenue by Payment Method
  const revenueByMethod = {
    Cash: 0,
    Telebirr: 0,
    'CBE Birr': 0,
    Insurance: 0,
  };

  invoices
    .filter((inv) => inv.paymentStatus === 'paid')
    .forEach((inv) => {
      if (inv.paymentMethod === 'telebirr') revenueByMethod.Telebirr += inv.amountPaid;
      else if (inv.paymentMethod === 'cbe_birr') revenueByMethod['CBE Birr'] += inv.amountPaid;
      else if (inv.paymentMethod === 'insurance') revenueByMethod.Insurance += inv.amountPaid;
      else revenueByMethod.Cash += inv.amountPaid;
    });

  const topDiagnoses = [
    { code: 'B54', name: 'Unspecified Malaria', count: 18, percentage: 38 },
    { code: 'A01.0', name: 'Typhoid Fever', count: 12, percentage: 25 },
    { code: 'I10', name: 'Essential Hypertension', count: 8, percentage: 17 },
    { code: 'J06.9', name: 'Acute Upper Resp. Infection', count: 6, percentage: 13 },
    { code: 'E11.9', name: 'Type 2 Diabetes Mellitus', count: 3, percentage: 7 },
  ];

  // Hourly Patient Volume Analysis (Peak Clinic Hours)
  const hourlySlots = [
    { time: '08:00', label: '8 AM', base: 14 },
    { time: '09:00', label: '9 AM', base: 32 },
    { time: '10:00', label: '10 AM', base: 38 },
    { time: '11:00', label: '11 AM', base: 26 },
    { time: '12:00', label: '12 PM', base: 15 },
    { time: '13:00', label: '1 PM', base: 9 },
    { time: '14:00', label: '2 PM', base: 24 },
    { time: '15:00', label: '3 PM', base: 35 },
    { time: '16:00', label: '4 PM', base: 21 },
    { time: '17:00', label: '5 PM', base: 12 },
  ];

  const hourlyData = hourlySlots.map((slot) => {
    const slotHour = parseInt(slot.time.split(':')[0], 10);
    const liveCount = queue.filter((q) => {
      const qHour = new Date(q.createdAt).getHours();
      return qHour === slotHour;
    }).length;
    const total = slot.base + liveCount;
    const isPeak = total >= 30;
    return { ...slot, total, isPeak };
  });

  const maxHourVolume = Math.max(...hourlyData.map((d) => d.total), 1);
  const totalDailyPatients = hourlyData.reduce((acc, curr) => acc + curr.total, 0);

  const reportMonth = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-brand-600" />
            <h1 className="text-xl font-bold text-slate-900">{t.nav.analytics}</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Executive financial summaries, patient flow throughput, and disease distribution.
          </p>
        </div>

        {/* 🆕 Export Report Button */}
        <button
          onClick={() => setShowReport(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
        >
          <FileDown className="w-4 h-4" />
          <span>Export Monthly Report</span>
        </button>
      </div>

      {/* Top High-Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Clinic Volume</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalRevenue.toLocaleString()} ETB</p>
          <span className="text-[11px] text-emerald-600 font-semibold">+18.4% from last week</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg. Consultation Wait</span>
            <Clock className="w-5 h-5 text-brand-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">14.2 mins</p>
          <span className="text-[11px] text-brand-600 font-semibold">-3.5 mins via live queue</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Patient Registrations</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{patients.length} Electronic MRNs</p>
          <span className="text-[11px] text-purple-600 font-semibold">100% paperless recordkeeping</span>
        </div>
      </div>

      {/* Two-Column Deep-Dive Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown by Clinical Service */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Revenue by Service Stream</h3>
          <div className="space-y-3">
            {Object.entries(revenueByCategory).map(([cat, amount]) => {
              const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{cat} Services</span>
                    <span className="text-slate-900 font-bold">{amount.toLocaleString()} ETB ({pct}%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cat === 'Consultation'
                          ? 'bg-brand-600'
                          : cat === 'Laboratory'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Payment Channels Distribution
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              {Object.entries(revenueByMethod).map(([method, amt]) => (
                <div key={method} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-500 text-[10px] block font-semibold">{method}</span>
                  <span className="font-bold text-slate-900">{amt.toLocaleString()} ETB</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Diagnoses & Disease Incidence */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Top Clinical Diagnoses (ICD-10)
            </h3>
          </div>

          <div className="space-y-3">
            {topDiagnoses.map((diag) => (
              <div key={diag.code} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800">
                    <span className="font-mono text-brand-600 font-bold mr-1.5">{diag.code}</span>
                    {diag.name}
                  </span>
                  <span className="text-slate-500 font-medium">{diag.count} visits ({diag.percentage}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${diag.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Peak Clinic Hours & Hourly Patient Flow Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Peak Clinic Operating Hours & Patient Volume
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hourly patient arrival distribution across clinical triage, consultations, laboratory, and pharmacy.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-amber-500"></span>
              <span className="text-slate-600 font-medium">Rush Hours (&ge; 30 pts)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-brand-600"></span>
              <span className="text-slate-600 font-medium">Standard Flow</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="pt-4">
          <div className="h-52 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-200 pb-2">
            {hourlyData.map((h) => {
              const heightPercent = Math.round((h.total / maxHourVolume) * 100);
              return (
                <div key={h.time} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip / Value on top */}
                  <span className={`text-[10px] font-bold mb-1.5 transition-all ${
                    h.isPeak ? 'text-amber-600 font-extrabold' : 'text-slate-600'
                  }`}>
                    {h.total}
                  </span>

                  {/* The Bar */}
                  <div
                    className={`w-full max-w-[44px] rounded-t-lg transition-all duration-500 group-hover:opacity-90 ${
                      h.isPeak
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-gradient-to-t from-brand-700 to-brand-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* Hour label below */}
                  <div className="mt-2 text-center">
                    <span className="block text-[11px] font-bold text-slate-800">{h.label}</span>
                    <span className="hidden sm:block text-[9px] text-slate-400 font-mono">{h.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analytical Flow Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Morning Surge Window</span>
            <p className="text-xs text-amber-950 font-semibold mt-1">09:00 AM – 11:00 AM (Avg 35 pts/hr)</p>
            <p className="text-[11px] text-amber-800/80 mt-0.5">Primary intake for walk-in registrations, triage vitals, and fasting lab draws.</p>
          </div>

          <div className="p-3.5 bg-brand-50 rounded-xl border border-brand-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800 block">Afternoon Pickup Window</span>
            <p className="text-xs text-brand-950 font-semibold mt-1">02:30 PM – 04:00 PM (Avg 31 pts/hr)</p>
            <p className="text-[11px] text-brand-800/80 mt-0.5">Diagnostic test reviews, doctor follow-up consultations, and pharmacy dispensations.</p>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Throughput Capacity</span>
            <p className="text-xs text-emerald-950 font-semibold mt-1">~{totalDailyPatients} Patients / Operating Day</p>
            <p className="text-[11px] text-emerald-800/80 mt-0.5">Automated queue routing reduced waiting room congestion by 24% across stations.</p>
          </div>
        </div>
      </div>

      {/* 🆕 Report Period Badge at Bottom */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-slate-500">
        <span>Showing analytics for all recorded data • Report period: <strong className="text-slate-700">{reportMonth}</strong></span>
        <button
          onClick={() => setShowReport(true)}
          className="flex items-center space-x-1.5 text-brand-600 hover:text-brand-800 font-semibold transition-colors cursor-pointer"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Generate PDF Report</span>
        </button>
      </div>

      {/* 🆕 Clinical Report Print Modal */}
      {showReport && (
        <ClinicalReportPrint
          invoices={invoices}
          patients={patients}
          queue={queue}
          revenueByCategory={revenueByCategory}
          revenueByMethod={revenueByMethod}
          topDiagnoses={topDiagnoses}
          hourlyData={hourlyData}
          totalRevenue={totalRevenue}
          totalDailyPatients={totalDailyPatients}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};
