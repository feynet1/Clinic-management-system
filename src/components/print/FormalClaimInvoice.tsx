import React from 'react';
import type { Invoice } from '../../types';

interface FormalClaimInvoiceProps {
  invoice: Invoice;
  onClose: () => void;
}

export const FormalClaimInvoice: React.FC<FormalClaimInvoiceProps> = ({ invoice, onClose }) => {
  const handlePrint = () => window.print();

  const cbhiDiscount = invoice.insuranceCoPayPercentage
    ? invoice.totalAmount * ((100 - invoice.insuranceCoPayPercentage) / 100)
    : invoice.discountAmount;
  const patientShare = invoice.netAmount;
  const insurerShare = cbhiDiscount;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Modal Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-purple-600"></span>
            <h2 className="font-bold text-slate-900 text-base">Formal A4 Medical Claim Invoice & Insurance Billing</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
            >
              🖨 Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* A4 Invoice Body */}
        <div id="formal-claim" className="p-10 space-y-6 text-[12px] text-slate-800 font-sans print:p-8">
          {/* Hospital Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-700">Federal Democratic Republic of Ethiopia</p>
              <p className="text-[9px] text-slate-500 tracking-wider">Ministry of Health — Healthcare Financing & Clinical Services</p>
              <h1 className="text-xl font-extrabold text-slate-900 mt-1 leading-tight">
                Haramaya University<br />
                <span className="text-purple-900">Hiwot Fana Comprehensive Specialized Hospital</span>
              </h1>
              <p className="text-[10px] text-slate-600 mt-0.5">Harar, Harari Regional State, Ethiopia</p>
              <p className="text-[10px] text-slate-500">Emergency Hotline: (025) 666-0368 · Email: hiwotfana@haramaya.edu.et</p>
              <p className="text-[10px] text-slate-500">Facility Code: ET-HR-0412 · TIN: 0041211034</p>
            </div>
            <div className="text-right space-y-1">
              <div className="inline-block bg-slate-900 text-white px-4 py-1.5 rounded-lg">
                <p className="text-[8px] font-bold tracking-wider uppercase text-slate-300">Official Claim Invoice</p>
                <p className="text-base font-extrabold font-mono tracking-wide">{invoice.invoiceNumber}</p>
              </div>
              <p className="text-[10px] text-slate-600 block pt-1">
                Date: {new Date(invoice.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-[10px] text-slate-600">
                Payment Status:{' '}
                <span className={invoice.paymentStatus === 'paid' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                  {invoice.paymentStatus.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          {/* Patient & Insurer Meta */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Beneficiary Patient Details</p>
              <p><span className="font-semibold text-slate-700">Patient Name:</span> <span className="font-bold text-slate-900">{invoice.patientName}</span></p>
              <p><span className="font-semibold text-slate-700">Medical Record No. (MRN):</span> <span className="font-mono font-bold text-slate-900">{invoice.patientMrn}</span></p>
              <p><span className="font-semibold text-slate-700">Encounter Date:</span> {new Date(invoice.createdAt).toLocaleDateString('en-GB')}</p>
              {invoice.cashierName && <p><span className="font-semibold text-slate-700">Issuing Cashier:</span> {invoice.cashierName}</p>}
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Payer & Policy Coverage</p>
              <p><span className="font-semibold text-slate-700">Payer / Insurance Scheme:</span> {invoice.insuranceProvider || 'Community-Based Health Insurance (CBHI)'}</p>
              <p><span className="font-semibold text-slate-700">Policy / Member ID:</span> <span className="font-mono">{invoice.insurancePolicyNumber || 'CBHI-HR-2026-0819'}</span></p>
              <p><span className="font-semibold text-slate-700">Settlement Method:</span> <span className="capitalize">{invoice.paymentMethod ? invoice.paymentMethod.replace('_', ' ') : 'Insurance / CBHI'}</span></p>
              {invoice.paymentReference && <p><span className="font-semibold text-slate-700">Transaction Ref:</span> <span className="font-mono">{invoice.paymentReference}</span></p>}
            </div>
          </div>

          {/* Itemized Services Table */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-2">Itemized Diagnostic & Clinical Services Breakdown</p>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-300 p-2 text-left w-10">#</th>
                  <th className="border border-slate-300 p-2 text-left">Clinical Service / Item Description</th>
                  <th className="border border-slate-300 p-2 text-left">Classification</th>
                  <th className="border border-slate-300 p-2 text-center w-14">Qty</th>
                  <th className="border border-slate-300 p-2 text-right w-24">Rate (ETB)</th>
                  <th className="border border-slate-300 p-2 text-right w-28">Amount (ETB)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="border border-slate-200 p-2 text-slate-500 text-center">{idx + 1}</td>
                    <td className="border border-slate-200 p-2 font-semibold text-slate-900">{item.description}</td>
                    <td className="border border-slate-200 p-2 text-slate-600 capitalize">{item.itemType.replace('_', ' ')}</td>
                    <td className="border border-slate-200 p-2 text-center text-slate-700">{item.quantity}</td>
                    <td className="border border-slate-200 p-2 text-right text-slate-700">{item.unitPrice.toFixed(2)}</td>
                    <td className="border border-slate-200 p-2 text-right font-bold text-slate-900">{item.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Box */}
          <div className="flex justify-end pt-2">
            <div className="w-80 space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-600">Gross Tariff Total:</span>
                <span className="font-semibold text-slate-900">{invoice.totalAmount.toFixed(2)} ETB</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Insurer / CBHI Subsidy ({invoice.insuranceCoPayPercentage ? 100 - invoice.insuranceCoPayPercentage : 0}%):</span>
                <span className="font-semibold">- {insurerShare.toFixed(2)} ETB</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Patient Co-Payment ({invoice.insuranceCoPayPercentage || 0}%):</span>
                <span className="font-semibold">{patientShare.toFixed(2)} ETB</span>
              </div>
              <div className="flex justify-between text-[13px] font-extrabold border-t border-slate-300 pt-2 text-slate-900">
                <span>NET PATIENT PAYABLE:</span>
                <span className="text-purple-900">{patientShare.toFixed(2)} ETB</span>
              </div>
              {invoice.paymentStatus === 'paid' && (
                <div className="flex justify-between text-[11px] text-emerald-700 font-bold pt-1">
                  <span>TOTAL SETTLED:</span>
                  <span>{invoice.amountPaid.toFixed(2)} ETB</span>
                </div>
              )}
            </div>
          </div>

          {/* Legal Signatures */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200">
            <div className="space-y-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Attending Medical Doctor</p>
              <div className="border-b border-slate-400 h-8"></div>
              <p className="text-[10px] text-slate-500">Signature & Official Stamp</p>
            </div>
            <div className="space-y-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Hospital Billing Officer</p>
              <div className="border-b border-slate-400 h-8 flex items-end pb-1">
                <span className="text-[10px] font-semibold text-slate-700">{invoice.cashierName || 'Amina Kedir'}</span>
              </div>
              <p className="text-[10px] text-slate-500">Signature & Verification</p>
            </div>
            <div className="space-y-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Patient / Claim Beneficiary</p>
              <div className="border-b border-slate-400 h-8"></div>
              <p className="text-[10px] text-slate-500">Recipient Signature / Thumbprint</p>
            </div>
          </div>

          {/* Disclaimer & Accreditation */}
          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-[9px] text-slate-400">
              Official Medical Claim Invoice compliant with Ethiopian Health Insurance Service (EHIS) and Harari Regional Health Bureau billing directives.
            </p>
            <p className="text-[9px] text-slate-400 mt-0.5">
              Haramaya University Hiwot Fana Comprehensive Specialized Hospital • Generated on {new Date().toLocaleString('en-GB')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
