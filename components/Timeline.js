"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Calendar } from 'lucide-react';

export default function Timeline() {
  const { t } = useLanguage();

  const steps = [
    { key: 'alandi', day: 'Day 1 - 2', color: 'bg-primary border-primary/30 text-white' },
    { key: 'pune', day: 'Day 3 - 4', color: 'bg-secondary border-secondary/30 text-white' },
    { key: 'saswad', day: 'Day 5 - 6', color: 'bg-emerald-600 border-emerald-650/30 text-white' },
    { key: 'jejuri', day: 'Day 7 - 8', color: 'bg-amber-500 border-amber-550/30 text-white' },
    { key: 'lonand', day: 'Day 9 - 12', color: 'bg-orange-600 border-orange-650/30 text-white' },
    { key: 'velapur', day: 'Day 13 - 15', color: 'bg-purple-600 border-purple-650/30 text-white' },
    { key: 'wakhari', day: 'Day 16 - 17', color: 'bg-rose-600 border-rose-650/30 text-white' },
    { key: 'pandharpur', day: 'Day 18 - 21', color: 'bg-primary border-primary/30 text-white' },
  ];

  return (
    <div className="relative max-w-4xl mx-auto px-4 py-8">
      {/* Centered Timeline Line for desktop, left line for mobile */}
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-slate-200 -translate-x-1/2 rounded-full" />

      <div className="space-y-12">
        {steps.map((step, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div 
              key={step.key} 
              className={`relative flex flex-col md:flex-row items-start md:items-center ${
                isEven ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Timeline Marker dot */}
              <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-premium ${step.color}`}>
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Spacer for desktop alignment */}
              <div className="hidden md:block w-1/2" />

              {/* Timeline Card */}
              <div className="w-full md:w-[45%] pl-16 md:pl-0">
                <div className="p-5.5 rounded-2xl bg-white border border-slate-150 shadow-premium hover:shadow-premium-hover transition-shadow duration-300 hover:border-primary/20 group">
                  {/* Day Indicator */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-charcoal-light text-xs font-bold mb-3.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>{step.day}</span>
                  </div>

                  {/* Title */}
                  <h4 className="font-heading text-lg font-bold text-charcoal group-hover:text-primary transition-colors duration-250">
                    {t(`about_page.timeline.${step.key}.title`)}
                  </h4>

                  {/* Description */}
                  <p className="mt-2.5 text-sm text-charcoal-light leading-relaxed">
                    {t(`about_page.timeline.${step.key}.desc`)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
