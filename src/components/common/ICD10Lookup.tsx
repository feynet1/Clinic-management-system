import React, { useState } from 'react';
import { COMMON_ICD10_CODES } from '../../data/clinicalCatalog';
import { Search, Check, Sparkles } from 'lucide-react';
import type { ICD10Code } from '../../types';

interface ICD10LookupProps {
  selectedCode?: string;
  onSelect: (code: ICD10Code) => void;
}

export const ICD10Lookup: React.FC<ICD10LookupProps> = ({ selectedCode, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredCodes = COMMON_ICD10_CODES.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.code.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="relative w-full">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ICD-10 Diagnosis (e.g. Malaria, B54, Hypertension, Typhoid)..."
            value={searchTerm}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        {selectedCode && (
          <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-brand-50 text-brand-700 border border-brand-200 shrink-0">
            {selectedCode}
          </span>
        )}
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-20 divide-y divide-slate-100">
            {filteredCodes.length === 0 ? (
              <div className="p-3 text-xs text-slate-400 text-center">
                No matching ICD-10 codes found.
              </div>
            ) : (
              filteredCodes.map((item) => {
                const isSelected = selectedCode === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      setSearchTerm(`${item.code} - ${item.description}`);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-brand-50 flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-brand-50/70 font-semibold text-brand-900' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-brand-600 bg-brand-100/60 px-1.5 py-0.5 rounded text-[11px]">
                          {item.code}
                        </span>
                        <span className="font-medium text-slate-900">{item.description}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{item.category}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};
