"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Container from './Container';
import SectionTitle from './SectionTitle';
import ScrollReveal from './ScrollReveal';
import { HeartPulse, Shield, Award } from 'lucide-react';

export default function AboutPreview() {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-20 md:py-28 bg-background-light scroll-mt-12">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <ScrollReveal className="flex flex-col">
            <SectionTitle
              title={t('about.title')}
              align="left"
              className="mb-8"
            />

            <div className="space-y-6 text-charcoal-light text-base md:text-lg leading-relaxed">
              <p>{t('about.desc_1')}</p>
              <p>{t('about.desc_2')}</p>
            </div>

            {/* Core Values / Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10">
              {[
                { icon: HeartPulse, text: "Compassionate Service" },
                { icon: Shield, text: "Safety & Coordination" },
                { icon: Award, text: "NSS Dedication" }
              ].map((value, idx) => {
                const Icon = value.icon;
                return (
                  <div key={idx} className="flex flex-col items-start p-4.5 rounded-2xl bg-white border border-slate-200/50 shadow-sm hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[13px] font-bold text-charcoal">{value.text}</span>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>

          {/* Image & Decorative frame */}
          <ScrollReveal className="relative group" delay={150}>
            {/* Background Glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-[2rem] blur-xl opacity-40 group-hover:opacity-60 transition duration-300" />

            {/* Main Image Box */}
            <div className="relative bg-white p-2 rounded-[2rem] border border-slate-100 shadow-premium overflow-hidden">
              <img
                src="/images/NSS help 2.png"
                alt={t('about.image_alt')}
                className="w-full h-[320px] md:h-[400px] object-cover rounded-[1.75rem] shadow-sm transition-transform duration-500 group-hover:scale-[1.02]"
              />
              {/* Hover Overlay Card */}
              <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-slate-900/75 border border-white/10 p-5 rounded-2xl text-white shadow-xl">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary">NSS Volunteer Motto</span>
                <h4 className="text-sm font-bold mt-1 text-white leading-snug">"Not Me But You" (मला नव्हे, तुला)</h4>
                <p className="text-xs text-slate-300 mt-1.5 font-medium leading-relaxed">Assisting devotees along the route, rendering medical aid, and maintaining cleanliness with complete devotion.</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
