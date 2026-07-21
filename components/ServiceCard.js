"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight } from 'lucide-react';

export default function ServiceCard({ icon: Icon, titleKey, descKey, colorClass, onLearnMore }) {
  const { t } = useLanguage();

  return (
    <div className="group p-6.5 rounded-2xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 hover:border-primary/35">
      <div>
        {/* Icon wrapper */}
        <div className={`w-13 h-13 rounded-2xl flex items-center justify-center mb-5.5 transition-all duration-300 group-hover:scale-105 group-hover:rotate-2 ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        {/* Title & Description */}
        <h3 className="font-heading text-lg font-bold text-charcoal dark:text-white tracking-tight group-hover:text-primary transition-colors duration-250">
          {t(titleKey)}
        </h3>
        <p className="mt-3 text-sm text-charcoal-light dark:text-gray-400 leading-relaxed">
          {t(descKey)}
        </p>
      </div>

      {/* Learn More Button / CTA */}
      <div className="mt-7">
        <button
          onClick={onLearnMore || (() => alert(`More info on ${t(titleKey)} (Simulation only)`))}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary hover:text-primary-dark transition-colors duration-200 group-hover:translate-x-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <span>{t('services_page.learn_more') || 'Learn More'}</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-250 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
