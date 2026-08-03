
"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

const CATEGORY_GRADIENTS = {
  'Senior Citizen': 'from-amber-500 to-orange-650',
  'Child': 'from-pink-500 to-rose-600',
  'Female': 'from-emerald-500 to-teal-600',
  'Male': 'from-sky-500 to-blue-600',
};

function formatDate(dateInput) {
  if (!dateInput) return '';
  try {
    return new Date(dateInput).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return dateInput;
  }
}

function resolveLocation(person) {
  if (person.lastSeenLocation) return person.lastSeenLocation;
  if (person.lastSeenKey) return person.lastSeenKey;
  return person.lastSeen || '';
}

function resolveGradient(person) {
  if (person.bgGradient) return person.bgGradient;
  return CATEGORY_GRADIENTS[person.category] || 'from-slate-400 to-slate-650';
}

export default function PersonCard({ person }) {
  const { t } = useLanguage();
  const displayId = person.caseId || person.id;
  const location = resolveLocation(person);
  const date = formatDate(person.dateReported || person.date);
  const gradient = resolveGradient(person);

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-slate-150 dark:border-gray-800 overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-350 hover:-translate-y-1 flex flex-col justify-between">
      <div>
        <div className={`relative h-44 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <div className="absolute top-4 right-4 z-10">
            <StatusBadge status={person.status} />
          </div>

          <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xl font-heading font-extrabold select-none">
            {person.name ? person.name.split(' ').map(n => n[0]).join('') : '?'}
          </div>

          <div className="absolute bottom-4 left-4 text-white">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-black/35 rounded-md backdrop-blur-sm">
              ID: {displayId}
            </span>
          </div>
        </div>

        <div className="p-5.5 text-left">
          <h3 className="font-heading text-lg font-extrabold text-charcoal dark:text-white tracking-tight group-hover:text-primary transition-colors duration-250">
            {person.name || 'Unknown'}
          </h3>

          <div className="flex gap-4.5 mt-2.5 text-xs font-bold text-slate-400 dark:text-gray-500">
            {person.age != null && <span>{person.age} {t('missing_persons_page.age_years')}</span>}
            {person.age != null && person.gender && <span>&bull;</span>}
            <span>{person.gender ? t(`missing_persons_page.filter_${person.gender.toLowerCase()}`) : ''}</span>
          </div>

          <div className="mt-5 space-y-2.5 border-t border-slate-50 dark:border-gray-800 pt-4 text-xs font-semibold text-charcoal-light dark:text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary/70 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-secondary/70 flex-shrink-0" />
              <span>{date}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5.5 pb-5.5">
        <Link
          href={`/missing-persons/${encodeURIComponent(displayId)}`}
          className="w-full inline-flex items-center justify-center gap-2 px-4.5 py-3 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-bold text-charcoal dark:text-white hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 transform active:scale-95 group/btn focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <span>{t('missing_persons_page.btn_view_details')}</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-250 group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
