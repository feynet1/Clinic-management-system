import React, { useEffect, useRef } from 'react';
import type { Invoice, Patient, QueueTicket, Consultation, LabOrder } from '../../types';

// =============================================================================
// Types
// =============================================================================

interface RevenueByCategory {
  Consultation: number;
  Laboratory: number;
  Pharmacy: number;
}

interface RevenueByMethod {
  Cash: number;
  Telebirr: number;
  'CBE Birr': number;
  Insurance: number;
}

interface TopDiagnosis {
  code: string;
  name: string;
  count: number;
  percentage: number;
}

interface HourlySlot {
  label: string;
  total: number;
  isPeak: boolean;
}

interface StaffPerformanceEntry {
  doctorName: string;
  consultations: number;
  completed: number;
}

interface LabMetrics {
  avgTat: number;
  maxTat: number;
  minTat: number;
  byStatus: Record<string, number>;
  completedCount: number;
  total: number;
}

interface ClinicalReportPrintProps {
  invoices: Invoice[];
  patients: Patient[];
  queue: QueueTicket[];
  consultations: Consultation[];
  labOrders: LabOrder[];
  revenueByCategory: RevenueByCategory;
  revenueByMethod: RevenueByMethod;
  topDiagnoses: TopDiagnosis[];
  hourlyData: HourlySlot[];
  totalRevenue: number;
  totalDailyPatients: number;
  staffPerformance: StaffPerformanceEntry[];
  labMetrics: LabMetrics;
  dateRangeLabel: string;
  onClose: () => void;
}

// =============================================================================
// Helpers
// =============================================================================

function getReportMonth(): string {
  return new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function getGeneratedAt(): string {
  return new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// =============================================================================
// Component
// =============================================================================

export const ClinicalReportPrint: React.FC<ClinicalReportPrintProps> = ({
  invoices,
  patients,
  queue,
  consultations,
  labOrders,
  revenueByCategory,
  revenueByMethod,
  topDiagnoses,
  hourlyData,
  totalRevenue,
  totalDailyPatients,
  staffPerformance,
  labMetrics,
  dateRangeLabel,
  onClose,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const paidInvoices = invoices.filter((inv) => inv.paymentStatus === 'paid');
  const pendingInvoices = invoices.filter((inv) => inv.paymentStatus !== 'paid');
  const collectionRate =
    invoices.length > 0 ? Math.round((paidInvoices.length / invoices.length) * 100) : 0;
  const peakHours = hourlyData.filter((h) => h.isPeak).map((h) => h.label);

  const handlePrint = () => window.print();

  // Auto-open print dialog on mount
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 400);
    return () => clearTimeout(timer);
  }, []);

  // Shared cell style
  const cell = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: '6px 10px',
    border: '1px solid #e2e8f0',
    ...extra,
  });

  return (
    <>
      {/* ── Screen-only confirmation overlay ───────────────────────────────── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm print:hidden">
        <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-4">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto bg-brand-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6M4 20h16M4 4h16v8a4 4 0 01-4 4H8a4 4 0 01-4-4V4z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900">Monthly Clinical Report</h2>
            <p className="text-xs text-slate-500 mt-1">
              Executive summary for <strong>{getReportMonth()}</strong> ({dateRangeLabel}) — ready to print or save as PDF.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-xs space-y-2 text-slate-700">
            <div className="flex justify-between">
              <span>Total Revenue</span>
              <span className="font-bold text-emerald-700">{totalRevenue.toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between">
              <span>Registered Patients</span>
              <span className="font-bold">{patients.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Consultations</span>
              <span className="font-bold">{consultations.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Lab Orders</span>
              <span className="font-bold">{labOrders.length} (Avg TAT: {labMetrics.avgTat} min)</span>
            </div>
            <div className="flex justify-between">
              <span>Total Invoices</span>
              <span className="font-bold">{invoices.length} ({collectionRate}% collected)</span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── Print document (hidden on screen, shown when printing) ─────────── */}
      <div
        ref={reportRef}
        className="hidden print:block"
        style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#1e293b', lineHeight: 1.5 }}
      >
        {/* ═══════════════════════════════════════════════════════════════════
            PAGE 1 — Header, KPIs, Revenue Breakdown, Payment Channels
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={{ padding: '18mm 18mm', pageBreakAfter: 'always' }}>
          {/* Letterhead */}
          <div style={{ borderBottom: '3px solid #1d4ed8', paddingBottom: '10px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '7px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
                  Harari Regional Health Bureau • EHIS Accredited
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                  Haramaya University
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                  Hiwot Fana Comprehensive Specialized Hospital
                </div>
                <div style={{ fontSize: '8px', color: '#64748b', marginTop: '2px' }}>
                  Harar, Harari Regional State • Facility Code: ET-HR-0412 • TIN: 0041211034
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1d4ed8' }}>MONTHLY CLINICAL REPORT</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{getReportMonth()}</div>
                <div style={{ fontSize: '8px', color: '#64748b', marginTop: '2px' }}>Filter: {dateRangeLabel}</div>
                <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px' }}>Generated: {getGeneratedAt()}</div>
                <div style={{ fontSize: '8px', color: '#94a3b8' }}>HFCS-CMS-PWA v1.0</div>
              </div>
            </div>
          </div>

          {/* Executive KPIs */}
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', color: '#1d4ed8', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Executive Summary
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
              {[
                { label: 'Gross Revenue', value: `${totalRevenue.toLocaleString()} ETB`, sub: 'All services' },
                { label: 'Patients', value: `${patients.length}`, sub: 'Electronic MRNs' },
                { label: 'Consultations', value: `${consultations.length}`, sub: dateRangeLabel },
                { label: 'Lab Orders', value: `${labOrders.length}`, sub: `TAT: ${labMetrics.avgTat} min avg` },
                { label: 'Invoices', value: `${invoices.length}`, sub: `${collectionRate}% collected` },
              ].map((kpi) => (
                <div key={kpi.label} style={{ textAlign: 'center', backgroundColor: 'white', borderRadius: '6px', padding: '7px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '7px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{kpi.label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>{kpi.value}</div>
                  <div style={{ fontSize: '7px', color: '#94a3b8' }}>{kpi.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 1. Revenue by Service */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px' }}>
              1. Revenue Breakdown by Clinical Service Stream
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={cell({ textAlign: 'left', fontWeight: 700 })}>Service Category</th>
                  <th style={cell({ textAlign: 'right', fontWeight: 700 })}>Revenue (ETB)</th>
                  <th style={cell({ textAlign: 'right', fontWeight: 700 })}>Share (%)</th>
                  <th style={cell({ textAlign: 'left', fontWeight: 700, width: '140px' })}>Distribution</th>
                </tr>
              </thead>
              <tbody>
                {(Object.entries(revenueByCategory) as [string, number][]).map(([cat, amount]) => {
                  const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
                  const barColor: Record<string, string> = { Consultation: '#1d4ed8', Laboratory: '#f59e0b', Pharmacy: '#10b981' };
                  return (
                    <tr key={cat}>
                      <td style={cell({ fontWeight: 600 })}>{cat}</td>
                      <td style={cell({ textAlign: 'right', fontWeight: 700 })}>{amount.toLocaleString()}</td>
                      <td style={cell({ textAlign: 'right', fontWeight: 700 })}>{pct}%</td>
                      <td style={cell({})}>
                        <div style={{ backgroundColor: '#f1f5f9', borderRadius: '4px', height: '9px', overflow: 'hidden' }}>
                          <div style={{ backgroundColor: barColor[cat] || '#64748b', width: `${pct}%`, height: '100%' }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <td style={cell({ fontWeight: 800 })}>TOTAL</td>
                  <td style={cell({ textAlign: 'right', fontWeight: 800, color: '#1d4ed8' })}>{totalRevenue.toLocaleString()}</td>
                  <td style={cell({ textAlign: 'right', fontWeight: 800 })}>100%</td>
                  <td style={cell({})} />
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. Payment Channels */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px' }}>
              2. Payment Channel Distribution
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={cell({ textAlign: 'left', fontWeight: 700 })}>Payment Method</th>
                  <th style={cell({ textAlign: 'right', fontWeight: 700 })}>Amount Collected (ETB)</th>
                  <th style={cell({ textAlign: 'right', fontWeight: 700 })}>Share (%)</th>
                </tr>
              </thead>
              <tbody>
                {(Object.entries(revenueByMethod) as [string, number][]).map(([method, amt]) => {
                  const totalPaid = Object.values(revenueByMethod).reduce((a, b) => a + b, 0);
                  const pct = totalPaid > 0 ? Math.round((amt / totalPaid) * 100) : 0;
                  return (
                    <tr key={method}>
                      <td style={cell({ fontWeight: 600 })}>{method}</td>
                      <td style={cell({ textAlign: 'right', fontWeight: 700 })}>{amt.toLocaleString()}</td>
                      <td style={cell({ textAlign: 'right' })}>{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 3. Billing Summary */}
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px' }}>
              3. Billing & Collections Summary
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { label: 'Total Invoices Issued', value: invoices.length, color: '#1d4ed8' },
                { label: 'Fully Paid', value: paidInvoices.length, color: '#10b981' },
                { label: 'Outstanding / Partial', value: pendingInvoices.length, color: '#ef4444' },
              ].map((item) => (
                <div key={item.label} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '8px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            PAGE 2 — ICD-10 Diagnoses, Patient Flow, Staff Performance
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={{ padding: '18mm 18mm', pageBreakAfter: 'always' }}>
          {/* Running header */}
          <div style={{ fontSize: '8px', color: '#94a3b8', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Haramaya University Hiwot Fana Comprehensive Specialized Hospital</span>
            <span>Monthly Clinical Report — {getReportMonth()} · {dateRangeLabel}</span>
          </div>

          {/* 4. Top Diagnoses */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px' }}>
              4. Top Clinical Diagnoses — ICD-10 Disease Incidence
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={cell({ fontWeight: 700, width: '72px' })}>ICD-10</th>
                  <th style={cell({ fontWeight: 700, textAlign: 'left' })}>Diagnosis</th>
                  <th style={cell({ fontWeight: 700, textAlign: 'right' })}>Cases</th>
                  <th style={cell({ fontWeight: 700, textAlign: 'right' })}>% Share</th>
                  <th style={cell({ fontWeight: 700, width: '120px' })}>Incidence</th>
                </tr>
              </thead>
              <tbody>
                {topDiagnoses.map((diag, idx) => (
                  <tr key={diag.code} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={cell({ fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8' })}>{diag.code}</td>
                    <td style={cell({ fontWeight: 600 })}>{diag.name}</td>
                    <td style={cell({ textAlign: 'right', fontWeight: 700 })}>{diag.count}</td>
                    <td style={cell({ textAlign: 'right' })}>{diag.percentage}%</td>
                    <td style={cell({})}>
                      <div style={{ backgroundColor: '#fecaca', borderRadius: '3px', height: '9px', overflow: 'hidden' }}>
                        <div style={{ backgroundColor: '#ef4444', width: `${diag.percentage}%`, height: '100%' }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. Hourly Patient Flow */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px' }}>
              5. Hourly Patient Flow & Peak Clinic Hours Analysis
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={cell({ fontWeight: 700, textAlign: 'left' })}>Time Slot</th>
                  <th style={cell({ fontWeight: 700, textAlign: 'right' })}>Patients</th>
                  <th style={cell({ fontWeight: 700 })}>Status</th>
                  <th style={cell({ fontWeight: 700, width: '150px' })}>Volume</th>
                </tr>
              </thead>
              <tbody>
                {hourlyData.map((slot, idx) => {
                  const maxVol = Math.max(...hourlyData.map((d) => d.total), 1);
                  const wPct = Math.round((slot.total / maxVol) * 100);
                  return (
                    <tr key={slot.label} style={{ backgroundColor: slot.isPeak ? '#fffbeb' : idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td style={cell({ fontWeight: 600 })}>{slot.label}</td>
                      <td style={cell({ textAlign: 'right', fontWeight: 800, color: slot.isPeak ? '#d97706' : '#1e293b' })}>{slot.total}</td>
                      <td style={cell({})}>
                        {slot.isPeak
                          ? <span style={{ backgroundColor: '#fde68a', color: '#92400e', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', fontSize: '8px' }}>🔥 RUSH HOUR</span>
                          : <span style={{ color: '#64748b', fontSize: '9px' }}>Normal</span>}
                      </td>
                      <td style={cell({})}>
                        <div style={{ backgroundColor: '#e2e8f0', borderRadius: '3px', height: '9px', overflow: 'hidden' }}>
                          <div style={{ backgroundColor: slot.isPeak ? '#f59e0b' : '#1d4ed8', width: `${wPct}%`, height: '100%' }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '8px 12px', marginTop: '8px', fontSize: '9px' }}>
              <strong>Peak Hours:</strong>{' '}
              {peakHours.length > 0 ? peakHours.join(', ') : 'None recorded'}.{' '}
              Daily capacity: <strong>~{totalDailyPatients} patients/operating day</strong>.
            </div>
          </div>

          {/* 6. Doctor Performance */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px' }}>
              6. Doctor Performance — Consultations ({dateRangeLabel})
            </div>
            {staffPerformance.length === 0 ? (
              <p style={{ fontSize: '9px', color: '#94a3b8', fontStyle: 'italic' }}>No consultation records in this period.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={cell({ fontWeight: 700, textAlign: 'left' })}>#</th>
                    <th style={cell({ fontWeight: 700, textAlign: 'left' })}>Doctor</th>
                    <th style={cell({ fontWeight: 700, textAlign: 'right' })}>Consultations</th>
                    <th style={cell({ fontWeight: 700, textAlign: 'right' })}>Completed</th>
                    <th style={cell({ fontWeight: 700, textAlign: 'right' })}>Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {staffPerformance.map((s, idx) => {
                    const rate = s.consultations > 0 ? Math.round((s.completed / s.consultations) * 100) : 0;
                    return (
                      <tr key={s.doctorName} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={cell({ color: '#94a3b8', fontWeight: 700 })}>{idx + 1}</td>
                        <td style={cell({ fontWeight: 600 })}>{s.doctorName}</td>
                        <td style={cell({ textAlign: 'right', fontWeight: 700 })}>{s.consultations}</td>
                        <td style={cell({ textAlign: 'right', fontWeight: 700, color: '#10b981' })}>{s.completed}</td>
                        <td style={cell({ textAlign: 'right', fontWeight: 700, color: rate >= 80 ? '#10b981' : '#f59e0b' })}>{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            PAGE 3 — Lab TAT, Operational Recommendations, Signatures
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={{ padding: '18mm 18mm' }}>
          {/* Running header */}
          <div style={{ fontSize: '8px', color: '#94a3b8', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Haramaya University Hiwot Fana Comprehensive Specialized Hospital</span>
            <span>Monthly Clinical Report — {getReportMonth()} · {dateRangeLabel}</span>
          </div>

          {/* 7. Lab Turnaround Time */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px' }}>
              7. Diagnostic Laboratory — Turnaround Time & Order Status
            </div>

            {/* TAT summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
              {[
                { label: 'Average TAT', value: labMetrics.avgTat > 0 ? `${labMetrics.avgTat} min` : 'N/A', color: '#d97706' },
                { label: 'Fastest TAT', value: labMetrics.minTat > 0 ? `${labMetrics.minTat} min` : 'N/A', color: '#10b981' },
                { label: 'Slowest TAT', value: labMetrics.maxTat > 0 ? `${labMetrics.maxTat} min` : 'N/A', color: '#ef4444' },
                { label: 'Completed / Total', value: `${labMetrics.completedCount}/${labMetrics.total}`, color: '#1d4ed8' },
              ].map((item) => (
                <div key={item.label} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '7px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '3px' }}>{item.label}</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Status breakdown table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={cell({ fontWeight: 700, textAlign: 'left' })}>Order Status</th>
                  <th style={cell({ fontWeight: 700, textAlign: 'right' })}>Count</th>
                  <th style={cell({ fontWeight: 700, textAlign: 'right' })}>Share (%)</th>
                  <th style={cell({ fontWeight: 700, width: '160px' })}>Distribution</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(labMetrics.byStatus).map(([status, count], idx) => {
                  const total = labMetrics.total || 1;
                  const pct = Math.round((count / total) * 100);
                  const barColor: Record<string, string> = {
                    ordered: '#94a3b8',
                    sample_collected: '#2563eb',
                    analyzing: '#f59e0b',
                    completed: '#10b981',
                    cancelled: '#ef4444',
                  };
                  const labels: Record<string, string> = {
                    ordered: 'Ordered',
                    sample_collected: 'Sample Collected',
                    analyzing: 'Analyzing',
                    completed: 'Completed',
                    cancelled: 'Cancelled',
                  };
                  return (
                    <tr key={status} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td style={cell({ fontWeight: 600 })}>{labels[status] || status}</td>
                      <td style={cell({ textAlign: 'right', fontWeight: 700 })}>{count}</td>
                      <td style={cell({ textAlign: 'right' })}>{pct}%</td>
                      <td style={cell({})}>
                        <div style={{ backgroundColor: '#e2e8f0', borderRadius: '3px', height: '9px', overflow: 'hidden' }}>
                          <div style={{ backgroundColor: barColor[status] || '#64748b', width: `${pct}%`, height: '100%' }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 8. Operational Recommendations */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px' }}>
              8. Operational Recommendations
            </div>
            <div style={{ fontSize: '9.5px', lineHeight: 1.7, color: '#374151' }}>
              <p style={{ marginBottom: '6px' }}>
                <strong>1. Staffing Optimization:</strong> Deploy additional triage nurses during identified rush hours (
                {peakHours.length > 0 ? peakHours.join(', ') : 'morning surge'}) to reduce consultation wait times below 10 minutes.
              </p>
              <p style={{ marginBottom: '6px' }}>
                <strong>2. Revenue Collection:</strong>{' '}
                {pendingInvoices.length > 0
                  ? `${pendingInvoices.length} invoice(s) remain unpaid. Activate follow-up for outstanding CBHI reimbursements.`
                  : 'Billing collection is at 100%. Maintain current cashier protocols.'}
              </p>
              <p style={{ marginBottom: '6px' }}>
                <strong>3. Lab Turnaround Improvement:</strong>{' '}
                {labMetrics.avgTat > 60
                  ? `Average TAT of ${labMetrics.avgTat} minutes exceeds the 60-minute target. Review sample processing and result entry workflows.`
                  : `Average TAT of ${labMetrics.avgTat > 0 ? labMetrics.avgTat : 'N/A'} minutes is within acceptable range. Maintain current protocols.`}
              </p>
              <p style={{ marginBottom: '6px' }}>
                <strong>4. Disease Surveillance:</strong>{' '}
                {topDiagnoses[0]
                  ? `${topDiagnoses[0].name} (${topDiagnoses[0].code}) accounts for the highest proportion of OPD diagnoses (${topDiagnoses[0].percentage}%). Coordinate with Harari Regional Health Bureau for targeted prevention and supply reinforcement.`
                  : 'No diagnosis data recorded. Ensure all consultations include ICD-10 coding for epidemiological tracking.'}
              </p>
              <p>
                <strong>5. Digital Health Records:</strong> All {patients.length} registered patient electronic MRNs are paperless and cloud-synced via ClinicCare PWA. Continue migration of legacy paper charts for 100% EHR compliance.
              </p>
            </div>
          </div>

          {/* Signature Section */}
          <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
            <div style={{ fontSize: '8px', color: '#64748b', marginBottom: '14px', textAlign: 'center' }}>
              This report is system-generated by Haramaya University Hiwot Fana Comprehensive Specialized Hospital Clinical Management System (HFCS-CMS-PWA v1.0).
              Certified as accurate for {getReportMonth()} (Filter: {dateRangeLabel}).
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '9px' }}>
              {[
                'Medical Director',
                'Hospital Administrator',
                'Chief Financial Officer',
              ].map((role) => (
                <div key={role} style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '6px', marginTop: '24px' }}>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{role}</div>
                    <div style={{ color: '#64748b', marginTop: '2px', fontSize: '8px' }}>Signature & Official Stamp</div>
                    <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px' }}>Date: ___________________</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Page Footer */}
          <div style={{ marginTop: '12px', fontSize: '7px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
            <span>CONFIDENTIAL — For Internal &amp; Regulatory Use Only</span>
            <span>Haramaya University Hiwot Fana CSH • ET-HR-0412 • {getReportMonth()}</span>
            <span>Page 3 of 3</span>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body > *:not([data-print-report]) { display: none !important; }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </>
  );
};
