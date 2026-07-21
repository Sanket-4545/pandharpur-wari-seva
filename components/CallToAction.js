"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Container from './Container';
import Button from './Button';
import ScrollReveal from './ScrollReveal';

export default function CallToAction() {
  const { t } = useLanguage();

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-secondary">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/3 translate-y-1/3" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />

      <ScrollReveal>
        <Container className="relative z-10 text-center max-w-3xl">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {t('cta.title')}
          </h2>
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('cta.subtitle')}
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-sm sm:max-w-none mx-auto px-4">
            <Button href="#" variant="primary" size="lg" className="w-full sm:w-auto shadow-saffron-glow">
              {t('cta.button_register')}
            </Button>
            <Button href="#" variant="glass" size="lg" className="w-full sm:w-auto">
              {t('cta.button_contact')}
            </Button>
          </div>
        </Container>
      </ScrollReveal>
    </section>
  );
}
