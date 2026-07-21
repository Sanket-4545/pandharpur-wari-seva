"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Eye } from 'lucide-react';

export default function GalleryCard({ image, onClick }) {
  const { t } = useLanguage();

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl border border-slate-150 dark:border-gray-800 overflow-hidden shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-350"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-video bg-slate-100 dark:bg-gray-800">
        <img 
          src={image.src} 
          alt={t('gallery_page.caption')}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Eye className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Category Badge */}
        <span className="absolute top-4 left-4 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white bg-primary rounded-lg shadow-sm">
          {t(`gallery_page.filter_${image.category}`)}
        </span>
      </div>

      {/* Description / Caption */}
      <div className="p-4.5 border-t border-slate-50 dark:border-gray-800">
        <p className="text-sm font-semibold text-charcoal dark:text-white leading-snug group-hover:text-primary transition-colors duration-200">
          {t(image.titleKey)}
        </p>
      </div>
    </div>
  );
}
