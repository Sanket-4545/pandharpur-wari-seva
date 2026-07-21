"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ChevronDown } from 'lucide-react';

export default function FAQAccordion({ items }) {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div 
            key={index} 
            className={`border rounded-2xl transition-all duration-300 ${
              isOpen 
                ? 'bg-slate-50/50 dark:bg-gray-800/50 border-primary/30 shadow-sm' 
                : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 hover:border-slate-300'
            }`}
          >
            {/* Header Trigger */}
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 rounded-2xl"
              aria-expanded={isOpen}
              aria-controls={`faq-content-${index}`}
              id={`faq-title-${index}`}
            >
              <span className="font-heading font-bold text-base sm:text-lg text-charcoal dark:text-white group-hover:text-primary transition-colors duration-200">
                {t(item.questionKey)}
              </span>
              <div className={`p-1.5 rounded-lg transition-all duration-300 bg-slate-100 dark:bg-gray-800 text-charcoal-light dark:text-gray-400 flex-shrink-0 ${
                isOpen ? 'bg-primary/10 dark:bg-primary/20 text-primary rotate-180' : ''
              }`}>
                <ChevronDown className="w-4.5 h-4.5" />
              </div>
            </button>

            {/* Answer Content */}
            <div
              id={`faq-content-${index}`}
              aria-labelledby={`faq-title-${index}`}
              role="region"
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-80 border-t border-slate-200/50 dark:border-gray-800 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              <div className="px-6 py-5 text-sm sm:text-base text-charcoal-light dark:text-gray-400 leading-relaxed">
                {t(item.answerKey)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
