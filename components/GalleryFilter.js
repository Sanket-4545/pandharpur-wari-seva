"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function GalleryFilter({ categories, activeCategory, onSelect }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mb-10 max-w-4xl mx-auto px-4">
      {categories.map((category) => {
        const isActive = activeCategory === category.key;
        return (
          <button
            key={category.key}
            onClick={() => onSelect(category.key)}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-heading text-xs sm:text-sm font-bold transition-all duration-300 transform active:scale-95 ${
              isActive 
                ? 'bg-primary text-white shadow-saffron-glow' 
                : 'bg-slate-100 hover:bg-slate-200 text-charcoal-light border border-transparent dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400'
            }`}
          >
            {t(category.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
