import React from 'react';
import { Printer, X } from 'lucide-react';
import type { Invoice } from '../../types';

interface ThermalReceiptProps {
  invoice: Invoice;
  onClose: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ invoice, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Action Header (Hidden during actual print) */}
        <div className="no-print flex items-center justify-between p-4 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-sm text-slate-800">80mm Thermal POS Receipt</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 80mm ESC/POS Thermal Receipt Layout */}
        <div className="print-container thermal-receipt-print overflow-y-auto p-4 font-mono text-xs text-slate-900 bg-white">
          <div className="text-center space-y-1 mb-3">
            <p className="font-bold text-base tracking-tight uppercase">CLINICCARE SPECIALTY CLINIC</p>
            <p className="text-[10px] text-slate-600">Bole Subcity, Addis Ababa, Ethiopia</p>
            <p className="text-[10px] text-slate-600">Tel: +251 116 123 456 • TIN: 0048921473</p>
            <div className="border-b-2 border-dashed border-slate-800 my-2"></div>
            <p className="font-bold text-xs">OFFICIAL CASH SALES RECEIPT</p>
          </div>

          <div className="space-y-1 text-[11px] mb-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Receipt No:</span>
              <span className="font-bold">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Date/Time:</span>
              <span>{new Date(invoice.createdAt).toLocaleString('en-GB')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Patient:</span>
              <span className="font-semibold">{invoice.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">MRN:</span>
              <span className="font-mono">{invoice.patientMrn}</span>
            </div>
            {invoice.cashierName && (
              <div className="flex justify-between">
                <span className="text-slate-600">Cashier:</span>
                <span>{invoice.cashierName}</span>
              </div>
            )}
          </div>

          <div className="border-b border-dashed border-slate-700 my-2"></div>

          {/* Itemized Table */}
          <div className="space-y-1.5 mb-3">
            <div className="flex justify-between font-bold text-[10px] border-b border-slate-400 pb-1">
              <span className="w-1/2">DESCRIPTION</span>
              <span className="w-1/6 text-center">QTY</span>
              <span className="w-1/3 text-right">AMT (ETB)</span>
            </div>
            {invoice.items.map((item) => (
              <div key={item.id} className="flex justify-between text-[11px] leading-tight">
                <span className="w-1/2 truncate">{item.description}</span>
                <span className="w-1/6 text-center">{item.quantity}</span>
                <span className="w-1/3 text-right font-medium">{item.totalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-b-2 border-dashed border-slate-800 my-2"></div>

          {/* Financial Totals */}
          <div className="space-y-1 text-[11px] font-bold">
            <div className="flex justify-between">
              <span>SUBTOTAL:</span>
              <span>{invoice.totalAmount.toFixed(2)} ETB</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>DISCOUNT:</span>
                <span>-{invoice.discountAmount.toFixed(2)} ETB</span>
              </div>
            )}
            <div className="flex justify-between text-sm pt-1 border-t border-slate-800">
              <span>TOTAL PAYABLE:</span>
              <span className="text-brand-900">{invoice.netAmount.toFixed(2)} ETB</span>
            </div>
            <div className="flex justify-between">
              <span>AMOUNT TENDERED:</span>
              <span>{invoice.amountPaid.toFixed(2)} ETB</span>
            </div>
            <div className="flex justify-between">
              <span>PAYMENT METHOD:</span>
              <span className="uppercase">{invoice.paymentMethod || 'CASH'}</span>
            </div>
            {invoice.paymentReference && (
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-600">TXN REF:</span>
                <span className="font-mono">{invoice.paymentReference}</span>
              </div>
            )}
          </div>

          <div className="border-b border-dashed border-slate-700 my-3"></div>

          {/* Footer Note */}
          <div className="text-center space-y-1 text-[10px] text-slate-600">
            <p className="font-semibold text-slate-900">መልካም ጤንነት እንመኛለን!</p>
            <p>Thank you for choosing ClinicCare.</p>
            <p>Non-refundable after 24 hours.</p>
            <p className="font-mono text-[9px] text-slate-400 mt-2">** Powered by ClinicCare PWA **</p>
          </div>
        </div>
      </div>
    </div>
  );
};
