import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getInvoices, getPatients, getQueueTickets } from '../services/dataService';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Activity 
} from 'lucide-react';
import type { Invoice, Patient, QueueTicket } from '../types';

export const AnalyticsPage: React.FC = () => {
  const { t } = useApp();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [queue, setQueue] = useState<QueueTicket[]>([]);

  useEffect(() => {
    Promise.all([getInvoices(), getPatients(), getQueueTickets()]).then(([invs, pts, q]) => {
      setInvoices(invs);
      setPatients(pts);
      setQueue(q);
    });
  }, []);

  // Compute Revenue by Service Category
  const revenueByCategory: Record<string, number> = {
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
  const revenueByMethod: Record<string, number> = {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-brand-600" />
          <h1 className="text-xl font-bold text-slate-900">{t.nav.analytics}</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Executive financial summaries, patient flow throughput, and disease distribution.
        </p>
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
    </div>
  );
};
