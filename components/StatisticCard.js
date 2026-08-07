"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function StatisticCard({ icon: Icon, count, labelKey, color = 'text-primary' }) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-100/80 dark:border-gray-800 shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:-translate-y-1">
      <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/50 dark:bg-gray-800 flex items-center justify-center shrink-0">
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-heading text-lg sm:text-2xl lg:text-3xl font-extrabold text-charcoal dark:text-white leading-tight break-words">
          {count}
        </span>
        <span className="text-[11px] sm:text-xs lg:text-sm font-semibold text-charcoal-light dark:text-gray-400 mt-0.5 leading-snug">
          {t(labelKey)}
        </span>
      </div>
    </div>
  );
}
