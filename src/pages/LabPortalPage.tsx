import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getLabOrders, updateLabOrderStatus } from '../services/dataService';
import { COMMON_LAB_CATALOG } from '../data/clinicalCatalog';
import { LabReportPrint } from '../components/print/LabReportPrint';
import { 
  FlaskConical, 
  Clock, 
  CheckCircle2, 
  Printer, 
  FileText, 
  AlertTriangle, 
  ChevronRight, 
  Save 
} from 'lucide-react';
import type { LabOrder, LabResultItem } from '../types';

export const LabPortalPage: React.FC = () => {
  const { t, currentUser } = useApp();
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [printOrder, setPrintOrder] = useState<LabOrder | null>(null);
  const [resultsForm, setResultsForm] = useState<LabResultItem[]>([]);
  const [remarks, setRemarks] = useState('');

  const loadOrders = async () => {
    const list = await getLabOrders();
    setOrders(list);
    if (list.length > 0 && !selectedOrder) {
      handleSelectOrder(list[0]);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectOrder = (order: LabOrder) => {
    setSelectedOrder(order);
    setRemarks(order.remarks || '');

    // If order already has results, use them; otherwise pull default parameters from catalog
    if (order.results && order.results.length > 0) {
      setResultsForm(order.results);
    } else {
      const catalogItem = COMMON_LAB_CATALOG.find((c: any) => c.code === order.testCode);
      if (catalogItem) {
        const defaults = catalogItem.defaultParameters.map((p: any) => ({
          parameterName: p.name,
          resultValue: '',
          unit: p.unit,
          referenceRange: p.referenceRange,
          isAbnormal: false,
        }));
        setResultsForm(defaults);
      } else {
        setResultsForm([
          {
            parameterName: order.testName,
            resultValue: '',
            unit: 'Result',
            referenceRange: 'Normal / Negative',
            isAbnormal: false,
          },
        ]);
      }
    }
  };

  const handleSampleCollected = async (orderId: string) => {
    await updateLabOrderStatus(orderId, 'sample_collected', {
      technicianName: currentUser.fullName,
    });
    loadOrders();
  };

  const handleSaveResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    await updateLabOrderStatus(selectedOrder.id, 'completed', {
      technicianName: currentUser.fullName,
      results: resultsForm,
      remarks,
    });

    loadOrders();
    // Prompt print report preview
    setPrintOrder({
      ...selectedOrder,
      status: 'completed',
      technicianName: currentUser.fullName,
      results: resultsForm,
      remarks,
      completedAt: new Date().toISOString(),
    });
  };

  const handleResultParamChange = (index: number, field: keyof LabResultItem, value: any) => {
    const updated = [...resultsForm];
    updated[index] = { ...updated[index], [field]: value };
    setResultsForm(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FlaskConical className="w-6 h-6 text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900">{t.lab.title}</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in: {currentUser.fullName} • Diagnostic Pathology & Laboratory Unit
          </p>
        </div>
      </div>

      {/* Main Grid: Orders Queue & Result Entry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Lab Orders Queue (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">Investigation Queue</h3>
            <span className="text-xs font-semibold text-slate-500">{orders.length} total</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {orders.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No active lab orders.</p>
            ) : (
              orders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                const isCompleted = order.status === 'completed';
                return (
                  <div
                    key={order.id}
                    onClick={() => handleSelectOrder(order)}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-50 border border-amber-200 shadow-xs'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{order.testName}</span>
                        <span className="text-[11px] text-slate-600 font-medium">{order.patientName}</span>
                        <span className="font-mono text-[10px] text-slate-400 block">{order.patientMrn}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'sample_collected'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>Ref: {order.doctorName || 'Dr. Henok'}</span>
                      <span>{new Date(order.orderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Parameter Entry & Report Workbench (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {selectedOrder ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              {/* Order Info Banner */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {selectedOrder.testCode}
                  </span>
                  <h2 className="font-bold text-base text-slate-900 mt-1">{selectedOrder.testName}</h2>
                  <p className="text-xs text-slate-600">
                    Patient: <span className="font-semibold">{selectedOrder.patientName}</span> ({selectedOrder.patientMrn})
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedOrder.status === 'ordered' && (
                    <button
                      type="button"
                      onClick={() => handleSampleCollected(selectedOrder.id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      {t.lab.collectSample}
                    </button>
                  )}

                  {selectedOrder.status === 'completed' && (
                    <button
                      type="button"
                      onClick={() => setPrintOrder(selectedOrder)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{t.lab.printReport}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Results Form */}
              <form onSubmit={handleSaveResults} className="space-y-6 text-xs">
                <div>
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
                    Parameter Measurements & Biological Reference Ranges
                  </h3>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Parameter Name</th>
                          <th className="p-3">Measurement Result</th>
                          <th className="p-3">Units</th>
                          <th className="p-3">Reference Range</th>
                          <th className="p-3 text-center">Abnormal?</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {resultsForm.map((param, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-800">{param.parameterName}</td>
                            <td className="p-3">
                              <input
                                type="text"
                                required
                                placeholder="Enter value"
                                value={param.resultValue}
                                onChange={(e) => handleResultParamChange(idx, 'resultValue', e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-3 text-slate-500">{param.unit}</td>
                            <td className="p-3 text-slate-500">{param.referenceRange}</td>
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={param.isAbnormal}
                                onChange={(e) => handleResultParamChange(idx, 'isAbnormal', e.target.checked)}
                                className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Technologist Remarks */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Technologist Clinical Remarks / Impression</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Parasites identified in peripheral blood smear. Sample quality adequate."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Finalize & Sign Diagnostic Report</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 space-y-2">
              <FlaskConical className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">No Test Order Selected</p>
              <p className="text-xs">Pick an ordered diagnostic test from the left queue to enter measurements.</p>
            </div>
          )}
        </div>
      </div>

      {/* Lab Report Print Preview */}
      {printOrder && (
        <LabReportPrint
          order={printOrder}
          onClose={() => setPrintOrder(null)}
        />
      )}
    </div>
  );
};
