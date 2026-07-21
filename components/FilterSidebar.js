"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Filter, RotateCcw } from 'lucide-react';

export default function FilterSidebar({ titleKey, groups, activeFilters, onFilterChange, onReset }) {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-6.5 shadow-premium text-left">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-charcoal dark:text-white font-heading font-extrabold text-base">
          <Filter className="w-4.5 h-4.5 text-primary" />
          <span>{titleKey ? t(titleKey) : t('missing_persons_page.filters')}</span>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 dark:text-gray-500 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Filter Groups */}
      <div className="space-y-6">
        {groups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-3">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 dark:text-gray-500">
              {t(group.titleKey)}
            </h4>
            
            <div className="flex flex-col gap-2">
              {group.options.map((opt) => {
                const isSelected = activeFilters[group.name] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onFilterChange(group.name, opt.value)}
                    className={`px-4 py-2.5 rounded-xl text-left text-sm font-semibold transition-all duration-200 border ${
                      isSelected
                        ? 'bg-primary/5 text-primary border-primary/30 font-bold'
                        : 'bg-white dark:bg-gray-900 text-charcoal-light dark:text-gray-400 border-slate-200/50 dark:border-gray-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {t(opt.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
