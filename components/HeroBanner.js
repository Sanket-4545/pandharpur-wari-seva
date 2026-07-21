"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Container from './Container';

export default function HeroBanner({ titleKey, subtitleKey, bgImage }) {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[40vh] md:min-h-[45vh] flex flex-col justify-center py-16 overflow-hidden bg-slate-950">
      {/* Background Image Overlay */}
      {bgImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-overlay"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      )}
      
      {/* Fallback pattern overlay if no image, or alongside image */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" />
      
      {/* Glowing Accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <Container className="relative z-10 text-center flex flex-col items-center">
        {/* Breadcrumb / Category indicator */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-800 bg-slate-900/50 backdrop-blur-md text-slate-400 text-xs font-semibold mb-6">
          <a href="/" className="hover:text-primary transition-colors">{t('nav.home')}</a>
          <span>/</span>
          <span className="text-primary font-bold">{t(titleKey)}</span>
        </div>

        {/* Title */}
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
          {t(titleKey)}
        </h1>

        {/* Subtitle */}
        {subtitleKey && (
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
            {t(subtitleKey)}
          </p>
        )}
      </Container>
    </section>
  );
}
