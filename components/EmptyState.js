"use client";

import React from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function EmptyState({ 
  icon: Icon = Search, 
  titleKey = "admin.common.no_records", 
  descKey, 
  onReset 
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-slate-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-premium transition-all duration-300">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-gray-800 flex items-center justify-center text-slate-400 dark:text-gray-500 mb-4.5">
        <Icon className="w-7 h-7" />
      </div>
      
      <h3 className="font-heading text-base font-bold text-charcoal dark:text-white text-center">
        {t(titleKey)}
      </h3>
      
      {descKey && (
        <p className="mt-2 text-sm text-charcoal-light dark:text-gray-400 text-center max-w-xs leading-relaxed">
          {t(descKey)}
        </p>
      )}

      {onReset && (
        <button
          onClick={onReset}
          className="mt-6 font-heading text-xs font-bold text-primary dark:text-primary-light border border-primary/25 dark:border-primary-light/25 bg-primary/5 dark:bg-primary-light/5 hover:bg-primary dark:hover:bg-primary-light hover:text-white px-4.5 py-2.5 rounded-xl transition-all duration-200 focus:outline-none"
        >
          {t("register_page.btn_reset")}
        </button>
      )}
    </div>
  );
}
