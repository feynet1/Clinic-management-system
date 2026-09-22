import React, { useEffect, useRef } from 'react';
import type { Invoice, Patient, QueueTicket } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface ClinicalReportPrintProps {
  invoices: Invoice[];
  patients: Patient[];
  queue: QueueTicket[];
  revenueByCategory: RevenueByCategory;
  revenueByMethod: RevenueByMethod;
  topDiagnoses: TopDiagnosis[];
  hourlyData: HourlySlot[];
  totalRevenue: number;
  totalDailyPatients: number;
  onClose: () => void;
}

// ─── Report Date Helpers ──────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export const ClinicalReportPrint: React.FC<ClinicalReportPrintProps> = ({
  invoices,
  patients,
  queue,
  revenueByCategory,
  revenueByMethod,
  topDiagnoses,
  hourlyData,
  totalRevenue,
  totalDailyPatients,
  onClose,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const paidInvoices = invoices.filter((inv) => inv.paymentStatus === 'paid');
  const pendingInvoices = invoices.filter((inv) => inv.paymentStatus !== 'paid');
  const collectionRate =
    invoices.length > 0 ? Math.round((paidInvoices.length / invoices.length) * 100) : 0;
  const peakHours = hourlyData.filter((h) => h.isPeak).map((h) => h.label);

  const handlePrint = () => {
    window.print();
  };

  // Auto-open print dialog when component mounts
  useEffect(() => {
    // Small delay to let browser render the report first
    const timer = setTimeout(() => {
      window.print();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* ── Screen-only overlay with print button ─────────────────────────── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm print:hidden">
        <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-4">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto bg-brand-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6M4 20h16M4 4h16v8a4 4 0 01-4 4H8a4 4 0 01-4-4V4z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900">Monthly Clinical Report</h2>
            <p className="text-xs text-slate-500 mt-1">
              Executive summary for <strong>{getReportMonth()}</strong> — ready to print or save as PDF.
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
              <span>Total Invoices</span>
              <span className="font-bold">{invoices.length} ({collectionRate}% collected)</span>
            </div>
            <div className="flex justify-between">
              <span>Daily Patient Throughput</span>
              <span className="font-bold">~{totalDailyPatients} patients</span>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── Print Document (hidden on screen, visible when printing) ─────── */}
      <div
        ref={reportRef}
        className="hidden print:block"
        style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#1e293b', lineHeight: 1.5 }}
      >
        {/* ─── Page 1: Header + KPIs + Revenue ────────────────────────────── */}
        <div style={{ padding: '20mm 18mm', pageBreakAfter: 'always' }}>
          {/* Hospital Letterhead */}
          <div style={{ borderBottom: '3px solid #1d4ed8', paddingBottom: '12px', marginBottom: '16px' }}>
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
                <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px' }}>Generated: {getGeneratedAt()}</div>
                <div style={{ fontSize: '8px', color: '#94a3b8' }}>HFCS-CMS-PWA v1.0</div>
              </div>
            </div>
          </div>

          {/* Executive Summary Banner */}
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', marginBottom: '18px' }}>
            <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', color: '#1d4ed8', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Executive Summary
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[
                { label: 'Gross Revenue', value: `${totalRevenue.toLocaleString()} ETB`, sub: 'All services combined' },
                { label: 'Patients Registered', value: `${patients.length} MRNs`, sub: '100% digital records' },
                { label: 'Total Invoices', value: `${invoices.length}`, sub: `${collectionRate}% collection rate` },
                { label: 'Daily Throughput', value: `~${totalDailyPatients} pts`, sub: 'Per operating day' },
              ].map((kpi) => (
                <div key={kpi.label} style={{ textAlign: 'center', backgroundColor: 'white', borderRadius: '6px', padding: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '8px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{kpi.label}</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>{kpi.value}</div>
                  <div style={{ fontSize: '8px', color: '#94a3b8' }}>{kpi.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Service */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '10px' }}>
              1. Revenue Breakdown by Clinical Service Stream
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 700, color: '#374151', border: '1px solid #e2e8f0' }}>Service Category</th>
                  <th style={{ textAlign: 'right', padding: '6px 10px', fontWeight: 700, color: '#374151', border: '1px solid #e2e8f0' }}>Revenue (ETB)</th>
                  <th style={{ textAlign: 'right', padding: '6px 10px', fontWeight: 700, color: '#374151', border: '1px solid #e2e8f0' }}>Share (%)</th>
                  <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 700, color: '#374151', border: '1px solid #e2e8f0' }}>Distribution Bar</th>
                </tr>
              </thead>
              <tbody>
                {(Object.entries(revenueByCategory) as [string, number][]).map(([cat, amount]) => {
                  const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
                  const barColors: Record<string, string> = {
                    Consultation: '#1d4ed8',
                    Laboratory: '#f59e0b',
                    Pharmacy: '#10b981',
                  };
                  return (
                    <tr key={cat} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '7px 10px', fontWeight: 600, border: '1px solid #e2e8f0' }}>{cat}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, border: '1px solid #e2e8f0' }}>{amount.toLocaleString()}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, border: '1px solid #e2e8f0' }}>{pct}%</td>
                      <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ backgroundColor: '#f1f5f9', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                          <div style={{ backgroundColor: barColors[cat] || '#64748b', width: `${pct}%`, height: '100%', borderRadius: '4px' }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700 }}>
                  <td style={{ padding: '8px 10px', fontWeight: 800, border: '1px solid #e2e8f0' }}>TOTAL</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, border: '1px solid #e2e8f0', color: '#1d4ed8' }}>{totalRevenue.toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, border: '1px solid #e2e8f0' }}>100%</td>
                  <td style={{ border: '1px solid #e2e8f0' }} />
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Channels */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '10px' }}>
              2. Payment Channel Distribution
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 700, border: '1px solid #e2e8f0' }}>Payment Method</th>
                  <th style={{ textAlign: 'right', padding: '6px 10px', fontWeight: 700, border: '1px solid #e2e8f0' }}>Amount Collected (ETB)</th>
                  <th style={{ textAlign: 'right', padding: '6px 10px', fontWeight: 700, border: '1px solid #e2e8f0' }}>Share (%)</th>
                </tr>
              </thead>
              <tbody>
                {(Object.entries(revenueByMethod) as [string, number][]).map(([method, amt]) => {
                  const totalPaid = Object.values(revenueByMethod).reduce((a, b) => a + b, 0);
                  const pct = totalPaid > 0 ? Math.round((amt / totalPaid) * 100) : 0;
                  return (
                    <tr key={method}>
                      <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>{method}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', border: '1px solid #e2e8f0', fontWeight: 700 }}>{amt.toLocaleString()}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', border: '1px solid #e2e8f0' }}>{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Invoice Summary */}
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '10px' }}>
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

        {/* ─── Page 2: Diagnoses + Patient Flow ───────────────────────────── */}
        <div style={{ padding: '20mm 18mm' }}>
          {/* Running header */}
          <div style={{ fontSize: '8px', color: '#94a3b8', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Haramaya University Hiwot Fana Comprehensive Specialized Hospital</span>
            <span>Monthly Clinical Report — {getReportMonth()}</span>
          </div>

          {/* Top Diagnoses */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '10px' }}>
              4. Top Clinical Diagnoses — ICD-10 Disease Incidence
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 700, border: '1px solid #e2e8f0', width: '80px' }}>ICD-10</th>
                  <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 700, border: '1px solid #e2e8f0' }}>Diagnosis</th>
                  <th style={{ textAlign: 'right', padding: '6px 10px', fontWeight: 700, border: '1px solid #e2e8f0' }}>Cases</th>
                  <th style={{ textAlign: 'right', padding: '6px 10px', fontWeight: 700, border: '1px solid #e2e8f0' }}>% Share</th>
                  <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 700, border: '1px solid #e2e8f0', width: '140px' }}>Incidence Bar</th>
                </tr>
              </thead>
              <tbody>
                {topDiagnoses.map((diag, idx) => (
                  <tr key={diag.code} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '7px 10px', fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8', border: '1px solid #e2e8f0' }}>{diag.code}</td>
                    <td style={{ padding: '7px 10px', fontWeight: 600, border: '1px solid #e2e8f0' }}>{diag.name}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, border: '1px solid #e2e8f0' }}>{diag.count}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', border: '1px solid #e2e8f0' }}>{diag.percentage}%</td>
                    <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ backgroundColor: '#fecaca', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                        <div style={{ backgroundColor: '#ef4444', width: `${diag.percentage}%`, height: '100%', borderRadius: '4px' }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hourly Patient Flow */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '10px' }}>
              5. Hourly Patient Flow & Peak Clinic Hours Analysis
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 700, border: '1px solid #e2e8f0' }}>Time Slot</th>
                  <th style={{ textAlign: 'right', padding: '6px 10px', fontWeight: 700, border: '1px solid #e2e8f0' }}>Patients</th>
                  <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 700, border: '1px solid #e2e8f0' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 700, border: '1px solid #e2e8f0', width: '160px' }}>Volume Bar</th>
                </tr>
              </thead>
              <tbody>
                {hourlyData.map((slot, idx) => {
                  const maxVol = Math.max(...hourlyData.map((d) => d.total), 1);
                  const widthPct = Math.round((slot.total / maxVol) * 100);
                  return (
                    <tr key={slot.label} style={{ backgroundColor: slot.isPeak ? '#fffbeb' : idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '7px 10px', fontWeight: 600, border: '1px solid #e2e8f0' }}>{slot.label}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 800, border: '1px solid #e2e8f0', color: slot.isPeak ? '#d97706' : '#1e293b' }}>{slot.total}</td>
                      <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0' }}>
                        {slot.isPeak
                          ? <span style={{ backgroundColor: '#fde68a', color: '#92400e', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', fontSize: '9px' }}>🔥 RUSH HOUR</span>
                          : <span style={{ color: '#64748b', fontSize: '9px' }}>Normal</span>}
                      </td>
                      <td style={{ padding: '7px 10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ backgroundColor: '#e2e8f0', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                          <div style={{ backgroundColor: slot.isPeak ? '#f59e0b' : '#1d4ed8', width: `${widthPct}%`, height: '100%', borderRadius: '4px' }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Peak hour insight box */}
            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '10px 14px', marginTop: '10px', fontSize: '9px' }}>
              <strong>Peak Operating Hours Identified:</strong>{' '}
              {peakHours.length > 0 ? peakHours.join(', ') : 'No significant peak hours recorded this period'}.
              {' '}Total daily patient capacity: <strong>~{totalDailyPatients} patients per operating day</strong>.
            </div>
          </div>

          {/* Recommendations */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '10px' }}>
              6. Operational Recommendations
            </div>
            <div style={{ fontSize: '9.5px', lineHeight: 1.7, color: '#374151' }}>
              <p style={{ marginBottom: '6px' }}>
                <strong>1. Staffing Optimization:</strong> Deploy additional triage nurses and reception clerks during identified rush hours (
                {peakHours.length > 0 ? peakHours.join(', ') : 'morning surge'}) to reduce average consultation wait time below 10 minutes.
              </p>
              <p style={{ marginBottom: '6px' }}>
                <strong>2. Revenue Collection:</strong> {pendingInvoices.length > 0
                  ? `${pendingInvoices.length} invoice(s) remain unpaid. Activate follow-up for outstanding community-based health insurance (CBHI) reimbursements.`
                  : 'Billing collection is at 100%. Maintain current cashier desk efficiency protocols.'}
              </p>
              <p style={{ marginBottom: '6px' }}>
                <strong>3. Disease Surveillance:</strong> Unspecified Malaria (B54) accounts for the highest proportion of OPD diagnoses.
                Coordinate with Harari Regional Health Bureau for targeted malaria prevention and RDT supply chain reinforcement.
              </p>
              <p>
                <strong>4. Digital Health Records:</strong> All {patients.length} registered patient electronic MRNs are paperless and cloud-synced
                via ClinicCare PWA. Continue migration of legacy paper charts to HFCS-CMS-PWA for 100% EHR compliance.
              </p>
            </div>
          </div>

          {/* Signature Section */}
          <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <div style={{ fontSize: '8px', color: '#64748b', marginBottom: '16px', textAlign: 'center' }}>
              This report is system-generated by Haramaya University Hiwot Fana Comprehensive Specialized Hospital Clinical Management System (HFCS-CMS-PWA v1.0).
              Certified as accurate to the best of the hospital's operational records for {getReportMonth()}.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '9px' }}>
              {[
                { role: 'Medical Director', name: '________________________________' },
                { role: 'Hospital Administrator', name: '________________________________' },
                { role: 'Chief Financial Officer', name: '________________________________' },
              ].map((sig) => (
                <div key={sig.role} style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '6px', marginTop: '24px' }}>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{sig.role}</div>
                    <div style={{ color: '#64748b', marginTop: '2px', fontSize: '8px' }}>Signature & Official Stamp</div>
                    <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px' }}>Date: ___________________</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Page Footer */}
          <div style={{ marginTop: '14px', fontSize: '7px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
            <span>CONFIDENTIAL — For Internal & Regulatory Use Only</span>
            <span>Haramaya University Hiwot Fana CSH • Facility ET-HR-0412 • {getReportMonth()}</span>
            <span>Page 2 of 2</span>
          </div>
        </div>
      </div>

      {/* Print-specific global styles */}
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
