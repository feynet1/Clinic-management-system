import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  getPrescriptions,
  updatePrescriptionStatus,
  getMedicationInventory,
  deductMedicationStock,
  addMedicationStock,
} from '../services/dataService';
import { PrescriptionPrint } from '../components/print/PrescriptionPrint';
import type { Prescription, MedicationInventoryItem } from '../types';
import {
  Pill,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Package,
  Boxes,
  ShieldAlert,
  ArrowRight,
  Building2,
  Calendar,
  User,
  X,
  PlusCircle,
  Download,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

export const PharmacyPage: React.FC = () => {
  const { t, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'dispensary' | 'inventory'>('dispensary');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [inventory, setInventory] = useState<MedicationInventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'dispensed'>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Dispensing Modal State
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [dispenseBatch, setDispenseBatch] = useState<string>('');
  const [pharmacistNotes, setPharmacistNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dispenseSuccess, setDispenseSuccess] = useState<boolean>(false);

  // Print Modal State
  const [printRx, setPrintRx] = useState<Prescription | null>(null);

  // Restock Modal State
  const [restockItem, setRestockItem] = useState<MedicationInventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<string>('');
  const [restockBatch, setRestockBatch] = useState<string>('');
  const [restockExpiry, setRestockExpiry] = useState<string>('');
  const [restockSupplier, setRestockSupplier] = useState<string>('');
  const [isRestocking, setIsRestocking] = useState<boolean>(false);
  const [restockSuccess, setRestockSuccess] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rxList, invList] = await Promise.all([
        getPrescriptions(),
        getMedicationInventory(),
      ]);
      setPrescriptions(rxList);
      setInventory(invList);
    } catch (err) {
      console.error('Failed to load pharmacy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Prescriptions
  const filteredPrescriptions = prescriptions.filter((rx) => {
    const isPending = rx.status === 'prescribed' || rx.status === 'sent_to_pharmacy';
    if (statusFilter === 'pending' && !isPending) return false;
    if (statusFilter === 'dispensed' && rx.status !== 'dispensed') return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesPatient = rx.patientName?.toLowerCase().includes(q) || rx.patientMrn?.toLowerCase().includes(q);
    const matchesDoctor = rx.doctorName?.toLowerCase().includes(q);
    const matchesDrug = rx.items?.some((item) => item.drugName.toLowerCase().includes(q));

    return matchesPatient || matchesDoctor || matchesDrug;
  });

  // Filter Inventory
  const categories = Array.from(new Set(inventory.map((item) => item.category)));
  const filteredInventory = inventory.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.genericName.toLowerCase().includes(q) ||
      item.batchNumber.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q)
    );
  });

  // Stats calculation
  const pendingCount = prescriptions.filter((rx) => rx.status !== 'dispensed').length;
  const dispensedCount = prescriptions.filter((rx) => rx.status === 'dispensed').length;
  const lowStockCount = inventory.filter((item) => item.stockQuantity <= item.reorderLevel).length;

  const handleOpenDispenseModal = (rx: Prescription) => {
    setSelectedRx(rx);
    if (rx.items && rx.items.length > 0) {
      const firstDrug = rx.items[0].drugName.toLowerCase();
      const matchedItem = inventory.find(
        (inv) => firstDrug.includes(inv.name.toLowerCase()) || firstDrug.includes(inv.genericName.toLowerCase())
      );
      setDispenseBatch(matchedItem ? matchedItem.batchNumber : 'HF-PHARM-2026-01');
    } else {
      setDispenseBatch('HF-PHARM-2026-01');
    }
    setPharmacistNotes('Counselled patient on complete dosage compliance and taking after food with clean water.');
    setDispenseSuccess(false);
  };

  const handleConfirmDispense = async () => {
    if (!selectedRx) return;
    setIsSubmitting(true);
    try {
      await updatePrescriptionStatus(selectedRx.id, 'dispensed', {
        dispensedBy: currentUser.fullName || 'Pharm. Meron Haile',
        pharmacistNotes,
        batchNumberUsed: dispenseBatch,
      });

      for (const item of selectedRx.items) {
        const matched = inventory.find(
          (inv) =>
            item.drugName.toLowerCase().includes(inv.name.toLowerCase()) ||
            item.drugName.toLowerCase().includes(inv.genericName.toLowerCase())
        );
        if (matched) {
          await deductMedicationStock(matched.id, item.quantity || 1);
        }
      }

      setDispenseSuccess(true);
      setTimeout(async () => {
        setIsSubmitting(false);
        setSelectedRx(null);
        await loadData();
      }, 1200);
    } catch (err) {
      console.error('Dispensation error:', err);
      setIsSubmitting(false);
    }
  };

  // --- Restock handlers ---
  const handleOpenRestock = (item: MedicationInventoryItem) => {
    setRestockItem(item);
    setRestockQty('');
    setRestockBatch(item.batchNumber);
    setRestockExpiry(item.expiryDate.split('T')[0]);
    setRestockSupplier(item.manufacturer);
    setRestockSuccess(false);
  };

  const handleConfirmRestock = async () => {
    if (!restockItem || !restockQty || Number(restockQty) <= 0) return;
    setIsRestocking(true);
    try {
      await addMedicationStock(
        restockItem.id,
        Number(restockQty),
        restockBatch || undefined,
        restockExpiry || undefined,
        restockSupplier || undefined
      );
      setRestockSuccess(true);
      setTimeout(async () => {
        setIsRestocking(false);
        setRestockItem(null);
        await loadData();
      }, 1200);
    } catch (err) {
      console.error('Restock error:', err);
      setIsRestocking(false);
    }
  };

  // --- CSV Export ---
  const exportInventoryCSV = () => {
    const headers = [
      'Code', 'Drug Name', 'Generic Name', 'Category', 'Dosage Form',
      'Strength', 'Unit Price (ETB)', 'Stock Qty', 'Reorder Level',
      'Batch Number', 'Expiry Date', 'Manufacturer',
    ];
    const rows = inventory.map((item) => [
      item.code,
      item.name,
      item.genericName,
      item.category,
      item.dosageForm,
      item.strength,
      item.unitPriceEtb.toFixed(2),
      item.stockQuantity,
      item.reorderLevel,
      item.batchNumber,
      new Date(item.expiryDate).toLocaleDateString('en-GB'),
      item.manufacturer,
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `HF_Pharmacy_Inventory_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (

    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-700 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span>Haramaya University • Hiwot Fana Comprehensive Hospital</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Pill className="w-7 h-7 text-brand-600" />
            <span>{t.pharmacy?.title || 'Hospital Central Pharmacy & Dispensary'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            E-prescription fulfillment, batch registry, patient counseling verification & stock deduction.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl px-4 py-2.5 text-center">
            <span className="text-[11px] font-semibold text-amber-800 uppercase block">Pending</span>
            <span className="text-xl font-black text-amber-700">{pendingCount}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl px-4 py-2.5 text-center">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase block">Dispensed</span>
            <span className="text-xl font-black text-emerald-700">{dispensedCount}</span>
          </div>
          <div className="bg-rose-50 border border-rose-200/80 rounded-xl px-4 py-2.5 text-center">
            <span className="text-[11px] font-semibold text-rose-800 uppercase block">Low Stock</span>
            <span className="text-xl font-black text-rose-700">{lowStockCount}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('dispensary')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'dispensary'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>{t.pharmacy?.pendingPrescriptions || 'Prescription Dispensing Desk'}</span>
            {pendingCount > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t.pharmacy?.medicationInventory || 'Drug Inventory & Batches'}</span>
            {lowStockCount > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                {lowStockCount} low
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: PRESCRIPTION DISPENSING QUEUE */}
      {activeTab === 'dispensary' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, MRN, drug, or doctor..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center space-x-1.5 w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({prescriptions.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('dispensed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'dispensed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Dispensed ({dispensedCount})
              </button>
            </div>
          </div>

          {/* Prescriptions List */}
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading prescriptions...</div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              <Boxes className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-sm">No prescriptions found</p>
              <p className="text-xs text-slate-400 mt-1">
                {statusFilter === 'pending'
                  ? 'All prescribed medications have been dispensed.'
                  : 'Try adjusting your search query or filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPrescriptions.map((rx) => {
                const isPending = rx.status === 'prescribed' || rx.status === 'sent_to_pharmacy';
                const hasAllergy = Boolean(rx.patientAllergies && rx.patientAllergies.trim());

                return (
                  <div
                    key={rx.id}
                    className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-5"
                  >
                    {/* Left: Patient & Doctor Context */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {rx.patientMrn || 'MRN-PENDING'}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base">{rx.patientName}</h3>
                        {isPending ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1">
                            <Clock className="w-3 h-3 inline" />
                            <span>Pending Dispensation</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 inline" />
                            <span>Dispensed</span>
                          </span>
                        )}
                      </div>

                      {/* Drug Allergy Banner if recorded */}
                      {hasAllergy && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-2 text-xs text-rose-800 font-medium">
                          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>
                            <strong>Known Allergies:</strong> {rx.patientAllergies}
                          </span>
                        </div>
                      )}

                      {/* Clinical Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center space-x-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Prescribed by: {rx.doctorName || 'Attending Physician'}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(rx.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </span>
                      </div>

                      {/* Prescribed Drugs Cards */}
                      <div className="pt-2">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Prescribed Medication ({rx.items.length})
                        </p>
                        <div className="space-y-1.5">
                          {rx.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div>
                                <span className="font-bold text-slate-900">{item.drugName}</span>
                                <span className="text-slate-500 ml-2">
                                  ({item.dosage} • {item.route})
                                </span>
                                {item.instructions && (
                                  <p className="text-[11px] text-slate-600 italic mt-0.5">
                                    "{item.instructions}"
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-3 shrink-0 text-slate-700">
                                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                                  {item.frequency}
                                </span>
                                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                                  {item.duration}
                                </span>
                                <span className="font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                                  Qty: {item.quantity}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dispensed Details if already completed */}
                      {rx.status === 'dispensed' && (
                        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-lg p-3 text-xs text-emerald-900 mt-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">
                              Dispensed By: {rx.dispensedBy || 'Central Pharmacy Staff'}
                            </span>
                            <span className="text-emerald-700">
                              Batch #{rx.batchNumberUsed || 'N/A'}
                            </span>
                          </div>
                          {rx.pharmacistNotes && (
                            <p className="text-[11px] text-emerald-800 italic">
                              Counseling: {rx.pharmacistNotes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-row md:flex-col justify-end items-end gap-2 shrink-0">
                      {isPending ? (
                        <button
                          onClick={() => handleOpenDispenseModal(rx)}
                          className="w-full sm:w-auto px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <Pill className="w-4 h-4" />
                          <span>Dispense Drugs</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center space-x-1 text-emerald-700 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Fulfilled</span>
                        </div>
                      )}

                      <button
                        onClick={() => setPrintRx(rx)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Rx Slip</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PHARMACEUTICAL DRUG INVENTORY & BATCH REGISTRY */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Inventory Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search drug name, generic, batch #, or code..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <span className="text-xs text-slate-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All Categories ({inventory.length})</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Export CSV Button */}
              <button
                onClick={exportInventoryCSV}
                className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Drug Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Dosage Form</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-center">Stock Balance</th>
                    <th className="py-3 px-4">Batch #</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Manufacturer</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => {
                    const isLowStock = item.stockQuantity <= item.reorderLevel;
                    const isExpiringSoon =
                      new Date(item.expiryDate) <
                      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/70 transition-colors ${isLowStock ? 'bg-rose-50/30' : ''}`}>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-500 italic">
                            Generic: {item.genericName} • {item.code}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-700">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {item.dosageForm} ({item.strength})
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {item.unitPriceEtb.toFixed(2)} ETB
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span
                              className={`font-black text-sm ${
                                isLowStock ? 'text-rose-700' : 'text-slate-900'
                              }`}
                            >
                              {item.stockQuantity}
                            </span>
                            {isLowStock && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 rounded border border-rose-200 flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                REORDER &lt; {item.reorderLevel}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                          {item.batchNumber}
                        </td>
                        <td className={`py-3 px-4 ${isExpiringSoon ? 'text-amber-700 font-semibold' : 'text-slate-600'}`}>
                          {isExpiringSoon && <AlertTriangle className="w-3 h-3 inline mr-1 text-amber-500" />}
                          {new Date(item.expiryDate).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">
                          {item.manufacturer}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleOpenRestock(item)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>Restock</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DISPENSING INTERACTIVE MODAL */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 bg-brand-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Pill className="w-5 h-5 text-brand-200" />
                <div>
                  <h3 className="font-bold text-sm">Dispense & Counsel Medication</h3>
                  <p className="text-[11px] text-brand-200">
                    Patient: {selectedRx.patientName} ({selectedRx.patientMrn})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRx(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Allergy Warning if applicable */}
              {selectedRx.patientAllergies && selectedRx.patientAllergies.trim() && (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl flex items-start space-x-2 text-xs text-rose-800">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold uppercase tracking-wider text-rose-900">
                      Patient Drug Allergy Alert
                    </strong>
                    <span>Allergic to: {selectedRx.patientAllergies}</span>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      Verify that prescribed drugs do not cross-react with recorded allergies.
                    </p>
                  </div>
                </div>
              )}

              {/* Drug Items Checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Medications to Dispense
                </label>
                <div className="space-y-2">
                  {selectedRx.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{item.drugName}</span>
                        <span className="text-brand-700">Dispense Qty: {item.quantity}</span>
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        Dosage: {item.dosage} • {item.route} • {item.frequency} for {item.duration}
                      </div>
                      {item.instructions && (
                        <div className="text-slate-500 italic text-[11px]">
                          Doctor Instructions: "{item.instructions}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Batch Number & Pharmacist Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dispensed Batch Number
                  </label>
                  <input
                    type="text"
                    value={dispenseBatch}
                    onChange={(e) => setDispenseBatch(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    placeholder="e.g. ETH-AMX-2025-08"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dispensing Pharmacist
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.fullName || 'Pharm. Meron Haile'}
                    className="w-full text-xs p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Counseling Notes & Patient Instructions
                </label>
                <textarea
                  rows={2}
                  value={pharmacistNotes}
                  onChange={(e) => setPharmacistNotes(e.target.value)}
                  placeholder="e.g. Counselled on compliance, taking after food, and completing full antibiotic course."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {dispenseSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t.pharmacy?.dispensedSuccess || 'Medication successfully dispensed and stock deducted!'}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSelectedRx(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting || dispenseSuccess}
                onClick={handleConfirmDispense}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Dispensing...' : 'Confirm Dispense & Deduct Stock'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT PRESCRIPTION MODAL */}
      {printRx && (
        <PrescriptionPrint
          prescription={printRx}
          onClose={() => setPrintRx(null)}
        />
      )}

      {/* RESTOCK / ADD NEW BATCH MODAL */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="font-bold text-sm">Restock Medication</h3>
                  <p className="text-[11px] text-emerald-200">
                    {restockItem.name} ({restockItem.genericName}) • Current stock: {restockItem.stockQuantity} units
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRestockItem(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Low stock alert if applicable */}
              {restockItem.stockQuantity <= restockItem.reorderLevel && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Low Stock Alert:</strong> Current level ({restockItem.stockQuantity}) is at or below the reorder level ({restockItem.reorderLevel}).
                  </span>
                </div>
              )}

              {/* Quantity to Add */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quantity to Add <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full text-sm p-3 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl focus:outline-none font-bold text-slate-900"
                  autoFocus
                />
                {restockQty && Number(restockQty) > 0 && (
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                    New stock level will be: <strong>{restockItem.stockQuantity + Number(restockQty)} units</strong>
                  </p>
                )}
              </div>

              {/* Batch Number & Expiry */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Batch Number</label>
                  <input
                    type="text"
                    value={restockBatch}
                    onChange={(e) => setRestockBatch(e.target.value)}
                    placeholder="e.g. ETH-AMX-2026-09"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Expiry Date</label>
                  <input
                    type="date"
                    value={restockExpiry}
                    onChange={(e) => setRestockExpiry(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Supplier / Manufacturer */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier / Manufacturer</label>
                <input
                  type="text"
                  value={restockSupplier}
                  onChange={(e) => setRestockSupplier(e.target.value)}
                  placeholder="e.g. Ethiopian Pharmaceuticals Supply Agency"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {restockSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Stock updated successfully! Inventory refreshed.</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setRestockItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRestocking || restockSuccess || !restockQty || Number(restockQty) <= 0}
                onClick={handleConfirmRestock}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isRestocking ? 'Updating Stock...' : `Add ${restockQty || 0} Units to Stock`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
