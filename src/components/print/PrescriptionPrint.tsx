import React from 'react';
import { Printer, X, ShieldAlert } from 'lucide-react';
import type { Prescription } from '../../types';

interface PrescriptionPrintProps {
  prescription: Prescription;
  onClose: () => void;
}

export const PrescriptionPrint: React.FC<PrescriptionPrintProps> = ({ prescription, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Action Header */}
        <div className="no-print flex items-center justify-between p-4 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <span className="font-serif italic font-bold text-lg text-brand-700">℞</span>
            <h3 className="font-bold text-sm text-slate-800">Printable Official E-Prescription</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Prescription</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prescription A4/Letterhead Layout */}
        <div className="print-container overflow-y-auto p-8 bg-white text-slate-900 font-sans space-y-6">
          {/* Clinic Header */}
          <div className="border-b-2 border-brand-700 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-brand-900">HARAMAYA UNIVERSITY REFERRAL HOSPITAL</h1>
              <p className="text-xs font-semibold text-brand-700">Hiwot Fana Comprehensive Specialized Hospital • Central Pharmacy</p>
              <p className="text-xs text-slate-500">Harar, Ethiopia • Emergency: (025) 666-0368 • Pharmacy Hotline: +251 915 046 933</p>
            </div>
            <div className="text-right text-xs">
              <span className="inline-block px-2.5 py-1 bg-brand-50 border border-brand-200 text-brand-700 font-bold rounded">
                OFFICIAL PRESCRIPTION
              </span>
              <p className="text-slate-500 mt-1">Date: {new Date(prescription.createdAt).toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          {/* Patient Details & Allergy Alert */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-500 block">Patient Name:</span>
              <span className="font-bold text-slate-900">{prescription.patientName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">MRN:</span>
              <span className="font-mono font-bold text-slate-900">{prescription.patientMrn}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Prescribing Doctor:</span>
              <span className="font-semibold text-slate-900">{prescription.doctorName || 'Attending Physician'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Status:</span>
              <span className="uppercase font-bold text-brand-700">{prescription.status}</span>
            </div>
          </div>

          {/* Allergy Warning if applicable */}
          {prescription.patientAllergies && prescription.patientAllergies !== 'None' && (
            <div className="flex items-center space-x-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-medium">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>RECORDED DRUG ALLERGIES: <strong>{prescription.patientAllergies}</strong></span>
            </div>
          )}

          {/* Rx Medication List */}
          <div>
            <div className="flex items-center space-x-2 text-brand-800 font-bold text-2xl font-serif mb-3">
              <span>℞</span>
              <span className="text-xs uppercase font-sans font-bold tracking-wider text-slate-500">Prescribed Regimen</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Medication & Strength</th>
                    <th className="p-3">Route</th>
                    <th className="p-3">Frequency</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {prescription.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 text-sm block">{item.drugName}</span>
                        <span className="text-slate-500">{item.dosage}</span>
                      </td>
                      <td className="p-3">{item.route}</td>
                      <td className="p-3 font-medium text-brand-800">{item.frequency}</td>
                      <td className="p-3">{item.duration}</td>
                      <td className="p-3 text-slate-600 italic">{item.instructions || 'As instructed'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor Signature & Clinic Stamp */}
          <div className="pt-8 flex justify-between items-end border-t border-slate-200">
            <div className="text-[11px] text-slate-500 space-y-1">
              <p>• Valid for 7 days from date of issuance.</p>
              <p>• Deliver to licensed internal or retail pharmacy.</p>
              <p className="font-mono text-[10px] text-slate-400">Ref: {prescription.id}</p>
            </div>
            <div className="text-center w-52 space-y-2">
              <div className="h-14 border-b border-slate-400 flex items-center justify-center">
                <span className="font-serif italic text-base text-brand-900 font-semibold">Dr. Henok Bekele, MD</span>
              </div>
              <p className="text-xs font-bold text-slate-800">{prescription.doctorName || 'Dr. Henok Bekele'}</p>
              <p className="text-[10px] text-slate-500">Lic. No: DOC-ET-4891 • General Practitioner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
