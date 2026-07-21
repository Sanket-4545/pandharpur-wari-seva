"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ className = '', variant = 'light' }) {
  const { locale, changeLanguage } = useLanguage();
  const isDark = variant === 'dark';

  const containerStyles = isDark 
    ? 'border-slate-800 bg-slate-950/50 text-slate-300'
    : 'border-slate-200/80 bg-white/70 text-slate-600';

  const textStyles = (active) => {
    if (active) {
      return 'text-primary font-bold underline decoration-2 underline-offset-4';
    }
    return isDark 
      ? 'text-slate-400 hover:text-white' 
      : 'text-slate-500 hover:text-charcoal';
  };

  return (
    <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-sm ${containerStyles} ${className}`}>
      <Globe className="w-4 h-4 text-slate-400" />
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => changeLanguage('en')}
          className={`text-sm font-semibold transition-all duration-200 hover:scale-105 ${textStyles(locale === 'en')}`}
          aria-label="Switch to English"
        >
          English
        </button>
        <span className="text-slate-400/50 text-xs font-normal">|</span>
        <button
          onClick={() => changeLanguage('mr')}
          className={`text-sm font-semibold transition-all duration-200 hover:scale-105 ${textStyles(locale === 'mr')}`}
          aria-label="मराठीमध्ये बदला"
        >
          मराठी
        </button>
      </div>
    </div>
  );
}
