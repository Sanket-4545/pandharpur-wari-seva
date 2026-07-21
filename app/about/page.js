"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Container from '@/components/Container';
import HeroBanner from '@/components/HeroBanner';
import SectionTitle from '@/components/SectionTitle';
import ScrollReveal from '@/components/ScrollReveal';
import Timeline from '@/components/Timeline';
import { History, Award, Eye, Target, HeartPulse, Shield, Briefcase, PhoneCall } from 'lucide-react';

export default function AboutPage() {
  const { t } = useLanguage();

  const cards = [
    {
      icon: HeartPulse,
      titleKey: 'about_page.medical_help',
      descKey: 'about_page.medical_help_desc',
      color: 'bg-red-50 text-red-600 border-red-100'
    },
    {
      icon: Shield,
      titleKey: 'about_page.crowd_management',
      descKey: 'about_page.crowd_management_desc',
      color: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    {
      icon: Briefcase,
      titleKey: 'about_page.lost_found',
      descKey: 'about_page.lost_found_desc',
      color: 'bg-amber-50 text-amber-600 border-amber-100'
    },
    {
      icon: PhoneCall,
      titleKey: 'about_page.emergency_support',
      descKey: 'about_page.emergency_support_desc',
      color: 'bg-purple-50 text-purple-600 border-purple-100'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen pb-20">
      <HeroBanner 
        titleKey="nav.about" 
        subtitleKey="about_page.subtitle"
        bgImage="/images/wari_pilgrimage_hero.png"
      />

      {/* History & Mission Section */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text Info */}
            <ScrollReveal className="flex flex-col gap-6">
              <div className="flex items-center gap-3 text-primary">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <History className="w-5 h-5" />
                </div>
                <span className="text-xs uppercase font-extrabold tracking-wider">Heritage & Culture</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
                {t('about_page.history_title')}
              </h2>
              <div className="h-1 w-20 bg-primary rounded-full" />
              <div className="space-y-4 text-charcoal-light text-base md:text-lg leading-relaxed mt-2">
                <p>{t('about_page.history_desc_1')}</p>
                <p>{t('about_page.history_desc_2')}</p>
              </div>
            </ScrollReveal>

            {/* Right: Decorative Image */}
            <ScrollReveal className="relative group" delay={150}>
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-75 transition duration-300" />
              <div className="relative bg-white p-2 rounded-[2rem] border border-slate-100 shadow-premium overflow-hidden">
                <img 
                  src="/images/gallery_wari.png" 
                  alt="Pandharpur Wari Pilgrimage history placeholder"
                  className="w-full h-[300px] md:h-[380px] object-cover rounded-[1.75rem]"
                />
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* NSS Mission, Vision & Objectives */}
      <section className="py-16 md:py-24 bg-slate-50">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Mission Card */}
            <ScrollReveal>
            <div className="bg-white p-8 rounded-2xl border border-slate-200/50 shadow-premium hover:shadow-premium-hover transition-all duration-350 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-charcoal tracking-tight mb-4">
                {t('about_page.mission_title')}
              </h3>
              <p className="text-sm text-charcoal-light leading-relaxed">
                {t('about_page.mission_desc')}
              </p>
            </div>
            </ScrollReveal>

            {/* Vision Card */}
            <ScrollReveal delay={100}>
            <div className="bg-white p-8 rounded-2xl border border-slate-200/50 shadow-premium hover:shadow-premium-hover transition-all duration-350 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-6">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-charcoal tracking-tight mb-4">
                {t('about_page.vision_title')}
              </h3>
              <p className="text-sm text-charcoal-light leading-relaxed">
                {t('about_page.vision_desc')}
              </p>
            </div>
            </ScrollReveal>

            {/* Objectives List */}
            <ScrollReveal delay={200}>
            <div className="bg-white p-8 rounded-2xl border border-slate-200/50 shadow-premium hover:shadow-premium-hover transition-all duration-350 hover:-translate-y-1 lg:col-span-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-charcoal tracking-tight mb-4">
                {t('about_page.objectives_title')}
              </h3>
              <ul className="space-y-3">
                {['obj_1', 'obj_2', 'obj_3', 'obj_4'].map((objKey) => (
                  <li key={objKey} className="flex items-start gap-2.5 text-xs sm:text-sm text-charcoal-light">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>{t(`about_page.${objKey}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* Importance of Volunteer Service & Cards */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <SectionTitle 
              title={t('about_page.volunteer_importance_title')}
              subtitle={t('about_page.volunteer_importance_desc')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => {
              const CardIcon = card.icon;
              return (
                <ScrollReveal key={index} delay={index * 100}>
                <div 
                  className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:-translate-y-1 text-center flex flex-col items-center"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5.5 ${card.color}`}>
                    <CardIcon className="w-7 h-7" />
                  </div>
                  <h4 className="font-heading font-bold text-base text-charcoal mb-2.5">
                    {t(card.titleKey)}
                  </h4>
                  <p className="text-xs text-charcoal-light leading-relaxed">
                    {t(card.descKey)}
                  </p>
                </div>
                </ScrollReveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Timeline Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <SectionTitle 
              title={t('about_page.timeline_title')}
              subtitle="Tracing the physical journey of faith across key halting spots along the route."
            />
          </div>
          <Timeline />
        </Container>
      </section>
    </div>
  );
}
