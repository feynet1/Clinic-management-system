import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getInvoices, recordInvoicePayment } from '../services/dataService';
import { ThermalReceipt } from '../components/print/ThermalReceipt';
import { 
  Receipt, 
  Search, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  ShieldCheck, 
  Printer, 
  CheckCircle2, 
  Clock, 
  X 
} from 'lucide-react';
import type { Invoice, PaymentMethod } from '../types';

export const CashierPage: React.FC = () => {
  const { t, currentUser } = useApp();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);

  // Payment dialog state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('telebirr');
  const [amountTendered, setAmountTendered] = useState<number>(0);
  const [paymentRef, setPaymentRef] = useState<string>('');

  const loadInvoices = async () => {
    const list = await getInvoices();
    setInvoices(list);
  };

  useEffect(() => {
    loadInvoices();
    const interval = setInterval(loadInvoices, 5000);
    return () => clearInterval(interval);
  }, []);

  const openPaymentModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setAmountTendered(inv.netAmount);
    setPaymentRef(inv.paymentMethod === 'telebirr' ? 'TB' + Math.floor(1000000 + Math.random() * 9000000) : '');
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    await recordInvoicePayment(
      selectedInvoice.id,
      amountTendered,
      paymentMethod,
      paymentRef,
      currentUser.fullName
    );

    const updatedInv: Invoice = {
      ...selectedInvoice,
      amountPaid: selectedInvoice.amountPaid + amountTendered,
      paymentStatus: 'paid',
      paymentMethod,
      paymentReference: paymentRef,
      cashierName: currentUser.fullName,
      paidAt: new Date().toISOString(),
    };

    setSelectedInvoice(null);
    setPrintInvoice(updatedInv);
    loadInvoices();
  };

  const filteredInvoices = invoices.filter((inv) => {
    const term = search.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(term) ||
      inv.patientName.toLowerCase().includes(term) ||
      inv.patientMrn.toLowerCase().includes(term)
    );
  });

  const totalCollectedToday = invoices
    .filter((i) => i.paymentStatus === 'paid')
    .reduce((acc, curr) => acc + curr.netAmount, 0);

  const totalPendingAmount = invoices
    .filter((i) => i.paymentStatus === 'pending')
    .reduce((acc, curr) => acc + curr.netAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-900">{t.billing.title}</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cashier: {currentUser.fullName} • Ethiopian Payment Channels (Cash, Telebirr, CBE Birr, Insurance)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3.5 py-2 bg-purple-50 rounded-xl border border-purple-200 text-xs">
            <span className="text-slate-500 block">Collected Today</span>
            <span className="font-bold text-sm text-purple-900">{totalCollectedToday.toLocaleString()} ETB</span>
          </div>
          <div className="px-3.5 py-2 bg-amber-50 rounded-xl border border-amber-200 text-xs">
            <span className="text-slate-500 block">Pending Invoices</span>
            <span className="font-bold text-sm text-amber-900">{totalPendingAmount.toLocaleString()} ETB</span>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by Invoice #, Patient Name, or MRN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
        />
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Patient (MRN)</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Itemized Breakdown</th>
                <th className="p-4 text-right">Net Payable</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No matching invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isPaid = inv.paymentStatus === 'paid';
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-purple-900">{inv.invoiceNumber}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block text-sm">{inv.patientName}</span>
                        <span className="font-mono text-slate-400 text-[11px]">{inv.patientMrn}</span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(inv.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="p-4 max-w-xs truncate text-slate-600">
                        {inv.items.map((i: any) => i.description).join(', ')}
                      </td>
                      <td className="p-4 text-right font-bold text-sm text-slate-900">
                        {inv.netAmount.toFixed(2)} ETB
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {!isPaid ? (
                            <button
                              onClick={() => openPaymentModal(inv)}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-xs cursor-pointer transition-colors"
                            >
                              Collect Payment
                            </button>
                          ) : (
                            <button
                              onClick={() => setPrintInvoice(inv)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>{t.billing.thermalReceipt}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Processing Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-slate-900">Settle Clinic Invoice</h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex justify-between items-center">
                <div>
                  <span className="text-slate-500 text-[11px] block">{selectedInvoice.patientName}</span>
                  <span className="font-bold text-purple-900 font-mono">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Total Due</span>
                  <span className="font-bold text-base text-purple-900">{selectedInvoice.netAmount.toFixed(2)} ETB</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="font-semibold text-slate-700 block mb-2">{t.billing.paymentMethod}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('telebirr');
                      setPaymentRef('TB' + Math.floor(1000000 + Math.random() * 9000000));
                    }}
                    className={`p-3 rounded-xl border flex items-center space-x-2.5 transition-all cursor-pointer ${
                      paymentMethod === 'telebirr'
                        ? 'bg-sky-50 border-sky-500 text-sky-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-sky-600 shrink-0" />
                    <div className="text-left">
                      <span className="block">{t.billing.telebirr}</span>
                      <span className="text-[10px] text-slate-400">Ethio Telecom</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('cbe_birr');
                      setPaymentRef('CBE' + Math.floor(1000000 + Math.random() * 9000000));
                    }}
                    className={`p-3 rounded-xl border flex items-center space-x-2.5 transition-all cursor-pointer ${
                      paymentMethod === 'cbe_birr'
                        ? 'bg-purple-50 border-purple-500 text-purple-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-purple-600 shrink-0" />
                    <div className="text-left">
                      <span className="block">{t.billing.cbeBirr}</span>
                      <span className="text-[10px] text-slate-400">Commercial Bank</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('cash');
                      setPaymentRef('');
                    }}
                    className={`p-3 rounded-xl border flex items-center space-x-2.5 transition-all cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="text-left">
                      <span className="block">{t.billing.cash}</span>
                      <span className="text-[10px] text-slate-400">Physical Birr</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('insurance');
                      setPaymentRef('POL-ET-' + Math.floor(10000 + Math.random() * 90000));
                    }}
                    className={`p-3 rounded-xl border flex items-center space-x-2.5 transition-all cursor-pointer ${
                      paymentMethod === 'insurance'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                    <div className="text-left">
                      <span className="block">{t.billing.insurance}</span>
                      <span className="text-[10px] text-slate-400">Medical Scheme</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Tendered Amount */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">{t.billing.amountPaid} *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-bold text-sm bg-white"
                />
              </div>

              {/* Reference ID */}
              {(paymentMethod === 'telebirr' || paymentMethod === 'cbe_birr' || paymentMethod === 'insurance') && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">{t.billing.reference} *</label>
                  <input
                    type="text"
                    required
                    placeholder="Transaction code / Policy ID"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  {t.billing.markAsPaid}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Thermal Receipt Print Modal */}
      {printInvoice && (
        <ThermalReceipt
          invoice={printInvoice}
          onClose={() => setPrintInvoice(null)}
        />
      )}
    </div>
  );
};
