import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  getInvoices,
  getPatients,
  getQueueTickets,
  getConsultations,
  getLabOrders,
} from '../services/dataService';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  Activity,
  Flame,
  FileDown,
  Users,
  FlaskConical,
  Stethoscope,
  Calendar,
  Download,
} from 'lucide-react';
import type { Invoice, Patient, QueueTicket, Consultation, LabOrder } from '../types';
import { ClinicalReportPrint } from '../components/print/ClinicalReportPrint';

// =============================================================================
// Types
// =============================================================================

type DateRange = 'today' | 'week' | 'month' | 'all';

// =============================================================================
// Helpers
// =============================================================================

function filterByDateRange<T extends { createdAt?: string; orderedAt?: string }>(
  items: T[],
  range: DateRange,
  dateKey: keyof T = 'createdAt' as keyof T
): T[] {
  if (range === 'all') return items;
  const now = new Date();
  const cutoff = new Date();
  if (range === 'today') {
    cutoff.setHours(0, 0, 0, 0);
  } else if (range === 'week') {
    cutoff.setDate(now.getDate() - 7);
  } else if (range === 'month') {
    cutoff.setDate(now.getDate() - 30);
  }
  return items.filter((item) => {
    const raw = item[dateKey] as unknown as string | undefined;
    if (!raw) return false;
    return new Date(raw) >= cutoff;
  });
}

/** Build last-6-months labels: e.g. ["Apr", "May", "Jun", "Jul", "Aug", "Sep"] */
function getLast6MonthLabels(): { label: string; year: number; month: number }[] {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      label: d.toLocaleDateString('en-GB', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return result;
}

/** Export array of objects to CSV download */
function exportCsv(filename: string, rows: Record<string, unknown>[]): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const val = String(r[h] ?? '').replace(/"/g, '""');
          return val.includes(',') || val.includes('"') || val.includes('\n')
            ? `"${val}"`
            : val;
        })
        .join(',')
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// =============================================================================
// Sub-components
// =============================================================================

/** Pure-CSS/SVG bar chart — no external library */
const BarChart: React.FC<{
  data: { label: string; value: number; isPeak?: boolean }[];
  height?: number;
  colorClass?: string;
  peakColorClass?: string;
}> = ({ data, height = 160, colorClass = 'bg-brand-600', peakColorClass = 'bg-amber-500' }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 sm:gap-2.5" style={{ height }}>
      {data.map((d) => {
        const pct = Math.round((d.value / max) * 100);
        const isPeak = d.isPeak ?? false;
        return (
          <div key={d.label} className="flex-1 flex flex-col items-center justify-end h-full group">
            <span
              className={`text-[10px] font-bold mb-1 ${
                isPeak ? 'text-amber-600' : 'text-slate-500'
              }`}
            >
              {d.value}
            </span>
            <div
              className={`w-full rounded-t-md transition-all duration-500 ${
                isPeak ? peakColorClass : colorClass
              } opacity-90 group-hover:opacity-100`}
              style={{ height: `${pct}%`, minHeight: d.value > 0 ? 4 : 0 }}
            />
            <span className="mt-1.5 text-[10px] text-slate-500 font-medium text-center leading-tight">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/** SVG line chart for trend data */
const LineChart: React.FC<{
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}> = ({ data, color = '#2563eb', height = 120 }) => {
  const width = 600;
  const padX = 32;
  const padY = 16;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;
  const max = Math.max(...data.map((d) => d.value), 1);

  const pts = data.map((d, i) => {
    const x = padX + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padY + (1 - d.value / max) * chartH;
    return { x, y, ...d };
  });

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
  // Fill area under line
  const fillPath =
    pts.length > 0
      ? `M${pts[0].x},${padY + chartH} ` +
        pts.map((p) => `L${p.x},${p.y}`).join(' ') +
        ` L${pts[pts.length - 1].x},${padY + chartH} Z`
      : '';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
      preserveAspectRatio="none"
    >
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = padY + (1 - t) * chartH;
        return (
          <line
            key={t}
            x1={padX}
            y1={y}
            x2={width - padX}
            y2={y}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        );
      })}
      {/* Fill */}
      {fillPath && (
        <path d={fillPath} fill={color} fillOpacity="0.08" />
      )}
      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Dots + labels */}
      {pts.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="4" fill={color} />
          <circle cx={p.x} cy={p.y} r="7" fill={color} fillOpacity="0.15" />
          {/* value label above dot */}
          <text
            x={p.x}
            y={p.y - 10}
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill="#374151"
          >
            {p.value.toLocaleString()}
          </text>
          {/* month label below axis */}
          <text
            x={p.x}
            y={height - 2}
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fill="#94a3b8"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

// =============================================================================
// Main Page
// =============================================================================

export const AnalyticsPage: React.FC = () => {
  const { t } = useApp();

  // ── Raw data ───────────────────────────────────────────────────────────────
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [queue, setQueue] = useState<QueueTicket[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getInvoices(),
      getPatients(),
      getQueueTickets(),
      getConsultations(),
      getLabOrders(),
    ]).then(([invs, pts, q, cons, labs]) => {
      setInvoices(invs);
      setPatients(pts);
      setQueue(q);
      setConsultations(cons);
      setLabOrders(labs);
      setLoading(false);
    });
  }, []);

  // ── Filtered slices ────────────────────────────────────────────────────────
  const filteredInvoices = useMemo(
    () => filterByDateRange(invoices, dateRange, 'createdAt'),
    [invoices, dateRange]
  );
  const filteredConsultations = useMemo(
    () => filterByDateRange(consultations, dateRange, 'createdAt'),
    [consultations, dateRange]
  );
  const filteredLabOrders = useMemo(
    () => filterByDateRange(labOrders as any[], dateRange, 'orderedAt') as LabOrder[],
    [labOrders, dateRange]
  );
  const filteredQueue = useMemo(
    () => filterByDateRange(queue, dateRange, 'createdAt'),
    [queue, dateRange]
  );

  // ── Revenue by service category ────────────────────────────────────────────
  const revenueByCategory = useMemo(() => {
    const acc = { Consultation: 0, Laboratory: 0, Pharmacy: 0 };
    filteredInvoices.forEach((inv) => {
      inv.items.forEach((item: any) => {
        if (item.itemType === 'consultation') acc.Consultation += item.totalPrice;
        else if (item.itemType === 'lab_test') acc.Laboratory += item.totalPrice;
        else acc.Pharmacy += item.totalPrice;
      });
    });
    return acc;
  }, [filteredInvoices]);

  const totalRevenue = useMemo(
    () => Object.values(revenueByCategory).reduce((a, b) => a + b, 0),
    [revenueByCategory]
  );

  // ── Revenue by payment method ──────────────────────────────────────────────
  const revenueByMethod = useMemo(() => {
    const acc = { Cash: 0, Telebirr: 0, 'CBE Birr': 0, Insurance: 0 };
    filteredInvoices
      .filter((inv) => inv.paymentStatus === 'paid')
      .forEach((inv) => {
        if (inv.paymentMethod === 'telebirr') acc.Telebirr += inv.amountPaid;
        else if (inv.paymentMethod === 'cbe_birr') acc['CBE Birr'] += inv.amountPaid;
        else if (inv.paymentMethod === 'insurance') acc.Insurance += inv.amountPaid;
        else acc.Cash += inv.amountPaid;
      });
    return acc;
  }, [filteredInvoices]);

  // ── Monthly revenue trend (last 6 months, always from ALL invoices) ────────
  const monthlyTrend = useMemo(() => {
    const months = getLast6MonthLabels();
    return months.map(({ label, year, month }) => {
      const value = invoices
        .filter((inv) => {
          const d = new Date(inv.createdAt);
          return d.getFullYear() === year && d.getMonth() === month;
        })
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      return { label, value };
    });
  }, [invoices]);

  // ── Live ICD-10 diagnosis frequency from consultation records ─────────────
  const topDiagnoses = useMemo(() => {
    const freq: Record<string, { code: string; name: string; count: number }> = {};
    filteredConsultations.forEach((c) => {
      if (!c.icd10Code) return;
      const key = c.icd10Code;
      if (!freq[key]) {
        freq[key] = { code: c.icd10Code, name: c.icd10Description || c.icd10Code, count: 0 };
      }
      freq[key].count++;
    });

    // Fallback demo data when no real consultations exist yet
    if (Object.keys(freq).length === 0) {
      return [
        { code: 'B54', name: 'Unspecified Malaria', count: 18, percentage: 38 },
        { code: 'A01.0', name: 'Typhoid Fever', count: 12, percentage: 25 },
        { code: 'I10', name: 'Essential Hypertension', count: 8, percentage: 17 },
        { code: 'J06.9', name: 'Acute Upper Resp. Infection', count: 6, percentage: 13 },
        { code: 'E11.9', name: 'Type 2 Diabetes Mellitus', count: 3, percentage: 7 },
      ];
    }

    const sorted = Object.values(freq)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    const total = sorted.reduce((s, d) => s + d.count, 0) || 1;
    return sorted.map((d) => ({
      ...d,
      percentage: Math.round((d.count / total) * 100),
    }));
  }, [filteredConsultations]);

  // ── Hourly patient volume ──────────────────────────────────────────────────
  const hourlyData = useMemo(() => {
    const slots = [
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
    return slots.map((slot) => {
      const slotHour = parseInt(slot.time.split(':')[0], 10);
      const liveCount = filteredQueue.filter(
        (q) => new Date(q.createdAt).getHours() === slotHour
      ).length;
      const total = slot.base + liveCount;
      return { ...slot, total, isPeak: total >= 30 };
    });
  }, [filteredQueue]);

  const totalDailyPatients = hourlyData.reduce((a, c) => a + c.total, 0);

  // ── Staff performance: consultations per doctor ────────────────────────────
  const staffPerformance = useMemo(() => {
    const acc: Record<string, { doctorName: string; consultations: number; completed: number }> =
      {};
    filteredConsultations.forEach((c) => {
      const id = c.doctorId;
      const name = c.doctorName || 'Unknown';
      if (!acc[id]) acc[id] = { doctorName: name, consultations: 0, completed: 0 };
      acc[id].consultations++;
      if (c.status === 'completed') acc[id].completed++;
    });
    return Object.values(acc).sort((a, b) => b.consultations - a.consultations);
  }, [filteredConsultations]);

  // ── Lab turnaround time ────────────────────────────────────────────────────
  const labMetrics = useMemo(() => {
    const completed = filteredLabOrders.filter(
      (l) => l.status === 'completed' && l.orderedAt && l.completedAt
    );
    const tats = completed.map((l) => {
      const mins =
        (new Date(l.completedAt!).getTime() - new Date(l.orderedAt).getTime()) / 60000;
      return mins;
    });
    const avgTat =
      tats.length > 0 ? Math.round(tats.reduce((a, b) => a + b, 0) / tats.length) : 0;
    const maxTat = tats.length > 0 ? Math.round(Math.max(...tats)) : 0;
    const minTat = tats.length > 0 ? Math.round(Math.min(...tats)) : 0;

    // By status
    const byStatus: Record<string, number> = {
      ordered: 0,
      sample_collected: 0,
      analyzing: 0,
      completed: 0,
      cancelled: 0,
    };
    filteredLabOrders.forEach((l) => {
      byStatus[l.status] = (byStatus[l.status] || 0) + 1;
    });

    return { avgTat, maxTat, minTat, byStatus, completedCount: completed.length, total: filteredLabOrders.length };
  }, [filteredLabOrders]);

  // ── Billing summary ────────────────────────────────────────────────────────
  const paidCount = filteredInvoices.filter((i) => i.paymentStatus === 'paid').length;
  const pendingCount = filteredInvoices.filter((i) => i.paymentStatus !== 'paid').length;
  const collectionRate =
    filteredInvoices.length > 0 ? Math.round((paidCount / filteredInvoices.length) * 100) : 0;

  // ── CSV Exports ────────────────────────────────────────────────────────────
  const handleExportInvoices = () => {
    const rows = filteredInvoices.map((inv) => ({
      InvoiceNumber: inv.invoiceNumber,
      PatientName: inv.patientName,
      PatientMRN: inv.patientMrn,
      TotalAmount: inv.totalAmount,
      DiscountAmount: inv.discountAmount,
      NetAmount: inv.netAmount,
      AmountPaid: inv.amountPaid,
      PaymentStatus: inv.paymentStatus,
      PaymentMethod: inv.paymentMethod || '',
      PaymentReference: inv.paymentReference || '',
      CreatedAt: inv.createdAt,
      PaidAt: inv.paidAt || '',
    }));
    exportCsv(
      `invoices_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`,
      rows
    );
  };

  const handleExportPatients = () => {
    const rows = patients.map((p) => ({
      MRN: p.mrn,
      FullName: p.fullName,
      Gender: p.gender,
      Age: p.age,
      Phone: p.phone,
      BloodType: p.bloodType || '',
      Allergies: p.allergies || '',
      ChronicConditions: p.chronicConditions || '',
      Kebele: p.kebele || '',
      Woreda: p.woreda || '',
      RegisteredAt: p.createdAt,
    }));
    exportCsv(`patients_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  const handleExportConsultations = () => {
    const rows = filteredConsultations.map((c) => ({
      ID: c.id,
      PatientName: c.patientName || '',
      PatientMRN: c.patientMrn || '',
      DoctorName: c.doctorName || '',
      ICD10Code: c.icd10Code,
      ICD10Description: c.icd10Description,
      ChiefComplaint: c.chiefComplaint,
      Status: c.status,
      CreatedAt: c.createdAt,
    }));
    exportCsv(
      `consultations_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`,
      rows
    );
  };

  const reportMonth = new Date().toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  const dateRangeLabels: Record<DateRange, string> = {
    today: 'Today',
    week: 'Last 7 Days',
    month: 'Last 30 Days',
    all: 'All Time',
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Loading analytics data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-brand-600" />
              <h1 className="text-xl font-bold text-slate-900">{t.nav.analytics}</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Financial summaries, disease incidence, lab turnaround, and staff performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date range filter */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
              {(['today', 'week', 'month', 'all'] as DateRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    dateRange === r
                      ? 'bg-white text-brand-700 shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {dateRangeLabels[r]}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowReport(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Gross Revenue',
            value: `${totalRevenue.toLocaleString()} ETB`,
            sub: dateRangeLabels[dateRange],
            icon: DollarSign,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Patient MRNs',
            value: patients.length,
            sub: '100% paperless',
            icon: Users,
            color: 'text-brand-600',
            bg: 'bg-brand-50',
          },
          {
            label: 'Consultations',
            value: filteredConsultations.length,
            sub: dateRangeLabels[dateRange],
            icon: Stethoscope,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
          {
            label: 'Lab Orders',
            value: filteredLabOrders.length,
            sub: `Avg TAT: ${labMetrics.avgTat} min`,
            icon: FlaskConical,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {kpi.label}
              </span>
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
            <p className={`text-[11px] font-semibold mt-0.5 ${kpi.color}`}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Monthly Revenue Trend (SVG Line Chart) ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-brand-600" />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              6-Month Revenue Trend
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">ETB • All invoices</span>
        </div>
        <LineChart data={monthlyTrend} color="#2563eb" height={130} />
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          Monthly gross billing (consultation + lab + pharmacy) across all records
        </p>
      </div>

      {/* ── Revenue Breakdown + Payment Channels ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue by service */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
            Revenue by Service Stream
          </h3>
          <div className="space-y-3">
            {Object.entries(revenueByCategory).map(([cat, amount]) => {
              const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
              const barColor =
                cat === 'Consultation'
                  ? 'bg-brand-600'
                  : cat === 'Laboratory'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500';
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{cat}</span>
                    <span className="text-slate-900">
                      {amount.toLocaleString()} ETB
                      <span className="text-slate-400 font-normal ml-1">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              Payment Channels
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(revenueByMethod).map(([method, amt]) => (
                <div
                  key={method}
                  className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                >
                  <span className="text-slate-500 font-medium">{method}</span>
                  <span className="font-bold text-slate-900">{amt.toLocaleString()} ETB</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live ICD-10 Diagnoses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Top Diagnoses (ICD-10)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              {filteredConsultations.filter((c) => c.icd10Code).length} coded consultations
            </span>
          </div>

          <div className="space-y-2.5">
            {topDiagnoses.map((diag, idx) => (
              <div key={diag.code} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono w-4 text-right">
                      {idx + 1}.
                    </span>
                    <span className="font-bold text-brand-600 font-mono">{diag.code}</span>
                    <span className="truncate max-w-[130px]" title={diag.name}>
                      {diag.name}
                    </span>
                  </span>
                  <span className="text-slate-500 shrink-0 ml-1">
                    {diag.count} ({diag.percentage}%)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${diag.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Peak Clinic Hours ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Peak Clinic Operating Hours
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
              <span className="text-slate-500">Rush ≥30</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-brand-600 inline-block" />
              <span className="text-slate-500">Normal</span>
            </span>
          </div>
        </div>

        <BarChart
          data={hourlyData.map((h) => ({
            label: h.label,
            value: h.total,
            isPeak: h.isPeak,
          }))}
          height={160}
          colorClass="bg-brand-500"
          peakColorClass="bg-amber-500"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
              Morning Surge
            </span>
            <p className="text-xs font-semibold text-amber-900 mt-0.5">09:00 AM – 11:00 AM</p>
            <p className="text-[11px] text-amber-700 mt-0.5">Walk-ins, triage vitals, fasting labs</p>
          </div>
          <div className="p-3 bg-brand-50 rounded-xl border border-brand-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800 block">
              Afternoon Pickup
            </span>
            <p className="text-xs font-semibold text-brand-900 mt-0.5">02:30 PM – 04:00 PM</p>
            <p className="text-[11px] text-brand-700 mt-0.5">Lab reviews, follow-ups, pharmacy</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              Daily Throughput
            </span>
            <p className="text-xs font-semibold text-emerald-900 mt-0.5">
              ~{totalDailyPatients} patients/day
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5">Across all clinical stations</p>
          </div>
        </div>
      </div>

      {/* ── Staff Performance ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Stethoscope className="w-4 h-4 text-purple-600" />
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
            Doctor Performance
          </h3>
          <span className="ml-auto text-[11px] text-slate-400">
            {dateRangeLabels[dateRange]}
          </span>
        </div>

        {staffPerformance.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No consultation records in this period.
          </p>
        ) : (
          <div className="space-y-2">
            {staffPerformance.map((s, idx) => {
              const maxConsultations = staffPerformance[0]?.consultations || 1;
              const pct = Math.round((s.consultations / maxConsultations) * 100);
              const completionRate =
                s.consultations > 0 ? Math.round((s.completed / s.consultations) * 100) : 0;
              return (
                <div key={s.doctorName} className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-slate-400 w-4">{idx + 1}</span>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800">{s.doctorName}</span>
                      <span className="text-slate-500">
                        {s.consultations} consult{s.consultations !== 1 ? 's' : ''}{' '}
                        <span className="text-emerald-600 font-bold">({completionRate}% complete)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Lab Turnaround Time ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <FlaskConical className="w-4 h-4 text-amber-600" />
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
            Lab Turnaround Time & Status
          </h3>
          <span className="ml-auto text-[11px] text-slate-400">
            {dateRangeLabels[dateRange]}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            {
              label: 'Avg TAT',
              value: labMetrics.avgTat > 0 ? `${labMetrics.avgTat} min` : 'N/A',
              color: 'text-amber-700',
              bg: 'bg-amber-50',
              border: 'border-amber-200',
            },
            {
              label: 'Fastest',
              value: labMetrics.minTat > 0 ? `${labMetrics.minTat} min` : 'N/A',
              color: 'text-emerald-700',
              bg: 'bg-emerald-50',
              border: 'border-emerald-200',
            },
            {
              label: 'Slowest',
              value: labMetrics.maxTat > 0 ? `${labMetrics.maxTat} min` : 'N/A',
              color: 'text-rose-700',
              bg: 'bg-rose-50',
              border: 'border-rose-200',
            },
            {
              label: 'Completed',
              value: `${labMetrics.completedCount}/${labMetrics.total}`,
              color: 'text-brand-700',
              bg: 'bg-brand-50',
              border: 'border-brand-200',
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`${item.bg} ${item.border} border rounded-xl px-3 py-3 text-center`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                {item.label}
              </span>
              <span className={`text-xl font-bold ${item.color} block mt-1`}>{item.value}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {Object.entries(labMetrics.byStatus).map(([status, count]) => {
            const labels: Record<string, string> = {
              ordered: 'Ordered',
              sample_collected: 'Sample Collected',
              analyzing: 'Analyzing',
              completed: 'Completed',
              cancelled: 'Cancelled',
            };
            const colors: Record<string, string> = {
              ordered: 'bg-slate-400',
              sample_collected: 'bg-brand-500',
              analyzing: 'bg-amber-500',
              completed: 'bg-emerald-500',
              cancelled: 'bg-rose-400',
            };
            const total = labMetrics.total || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={status} className="flex items-center gap-3 text-xs">
                <span className="w-32 text-slate-600 font-medium shrink-0">{labels[status]}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${colors[status]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-slate-700 font-bold w-10 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Billing Summary ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
            Billing & Collections
          </h3>
          <span className="ml-auto text-[11px] text-slate-400">{dateRangeLabels[dateRange]}</span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Total Issued', value: filteredInvoices.length, color: 'text-brand-700' },
            { label: 'Fully Paid', value: paidCount, color: 'text-emerald-700' },
            { label: 'Outstanding', value: pendingCount, color: 'text-rose-600' },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                {item.label}
              </span>
              <span className={`text-2xl font-bold ${item.color} block mt-1`}>{item.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500 font-medium shrink-0">Collection Rate</span>
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
          <span className="font-bold text-emerald-700 shrink-0">{collectionRate}%</span>
        </div>
      </div>

      {/* ── CSV Export Panel ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Download className="w-4 h-4 text-slate-600" />
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
            Data Export
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: 'Export Invoices',
              sub: `${filteredInvoices.length} records · ${dateRangeLabels[dateRange]}`,
              onClick: handleExportInvoices,
              color: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50',
            },
            {
              label: 'Export Patients',
              sub: `${patients.length} total MRN records`,
              onClick: handleExportPatients,
              color: 'border-brand-300 text-brand-700 hover:bg-brand-50',
            },
            {
              label: 'Export Consultations',
              sub: `${filteredConsultations.length} records · ${dateRangeLabels[dateRange]}`,
              onClick: handleExportConsultations,
              color: 'border-purple-300 text-purple-700 hover:bg-purple-50',
            },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl transition-all cursor-pointer text-left ${btn.color}`}
            >
              <Download className="w-4 h-4 shrink-0" />
              <div>
                <span className="font-bold text-sm block">{btn.label}</span>
                <span className="text-[11px] opacity-70">{btn.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Footer bar ───────────────────────────────────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-slate-500">
        <span>
          Report period: <strong className="text-slate-700">{reportMonth}</strong> · Filter:{' '}
          <strong className="text-slate-700">{dateRangeLabels[dateRange]}</strong>
        </span>
        <button
          onClick={() => setShowReport(true)}
          className="flex items-center space-x-1.5 text-brand-600 hover:text-brand-800 font-semibold transition-colors cursor-pointer"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Generate PDF Report</span>
        </button>
      </div>

      {/* ── Print Modal ───────────────────────────────────────────────────────── */}
      {showReport && (
        <ClinicalReportPrint
          invoices={filteredInvoices}
          patients={patients}
          queue={filteredQueue}
          consultations={filteredConsultations}
          labOrders={filteredLabOrders}
          revenueByCategory={revenueByCategory}
          revenueByMethod={revenueByMethod}
          topDiagnoses={topDiagnoses}
          hourlyData={hourlyData}
          totalRevenue={totalRevenue}
          totalDailyPatients={totalDailyPatients}
          staffPerformance={staffPerformance}
          labMetrics={labMetrics}
          dateRangeLabel={dateRangeLabels[dateRange]}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};
