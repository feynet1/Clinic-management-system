import React from 'react';
import { Printer, X, AlertTriangle } from 'lucide-react';
import type { LabOrder } from '../../types';

interface LabReportPrintProps {
  order: LabOrder;
  onClose: () => void;
}

export const LabReportPrint: React.FC<LabReportPrintProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Action Header */}
        <div className="no-print flex items-center justify-between p-4 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-sm text-slate-800">Diagnostic Laboratory Report</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="print-container overflow-y-auto p-8 bg-white text-slate-900 font-sans space-y-6">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">CLINICCARE DIAGNOSTIC LABORATORY</h1>
              <p className="text-xs text-slate-600">Clinical Pathology & Diagnostic Testing Unit</p>
              <p className="text-xs text-slate-500">Addis Ababa, Ethiopia • ISO 15189 Quality Compliant</p>
            </div>
            <div className="text-right text-xs">
              <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded border border-slate-300">
                LAB REPORT: {order.testCode}
              </span>
              <p className="text-slate-500 mt-1">Date: {new Date(order.completedAt || order.orderedAt).toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          {/* Patient Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-500 block">Patient Name:</span>
              <span className="font-bold text-slate-900">{order.patientName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">MRN:</span>
              <span className="font-mono font-bold text-slate-900">{order.patientMrn}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Referring Doctor:</span>
              <span className="font-semibold text-slate-900">{order.doctorName || 'Dr. Henok Bekele'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Lab Technologist:</span>
              <span className="font-semibold text-slate-900">{order.technicianName || 'Yared Kassahun'}</span>
            </div>
          </div>

          {/* Test Name Header */}
          <div className="bg-brand-50 border-l-4 border-brand-600 p-3 rounded-r-lg">
            <span className="text-xs text-brand-700 font-semibold uppercase tracking-wider block">Ordered Investigation</span>
            <h2 className="text-base font-bold text-brand-900">{order.testName}</h2>
          </div>

          {/* Parameter Results Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Test Parameter</th>
                  <th className="p-3">Result</th>
                  <th className="p-3">Units</th>
                  <th className="p-3">Biological Reference Range</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.results && order.results.length > 0 ? (
                  order.results.map((res, idx) => (
                    <tr key={idx} className={res.isAbnormal ? 'bg-rose-50/50 font-semibold' : 'hover:bg-slate-50'}>
                      <td className="p-3 text-slate-900">{res.parameterName}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {res.resultValue}
                      </td>
                      <td className="p-3 text-slate-600">{res.unit || '-'}</td>
                      <td className="p-3 text-slate-600">{res.referenceRange}</td>
                      <td className="p-3 text-center">
                        {res.isAbnormal ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            ABNORMAL
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                            NORMAL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400 italic">
                      No numeric parameters recorded. Result reported as negative / pending.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {order.remarks && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Technologist Remarks:</span>
              <p className="text-slate-600">{order.remarks}</p>
            </div>
          )}

          {/* Footer & Signature */}
          <div className="pt-8 flex justify-between items-end border-t border-slate-200">
            <div className="text-[10px] text-slate-400">
              Report Generated: {new Date().toLocaleString('en-GB')}
            </div>
            <div className="text-center w-52 space-y-1">
              <div className="h-12 border-b border-slate-400 flex items-center justify-center">
                <span className="font-serif italic text-sm text-slate-800">Yared Kassahun, B.Sc.</span>
              </div>
              <p className="text-xs font-bold text-slate-800">Verified by Medical Lab Tech</p>
              <p className="text-[10px] text-slate-500">License: LAB-TECH-103</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
