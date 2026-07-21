"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  ArrowRight,
  Smartphone,
  Wallet,
  FileText,
  Briefcase,
  Footprints,
  Gem,
  HelpCircle
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function LostItemCard({ item }) {
  const { t } = useLanguage();

  const categoryIcons = {
    mobile: Smartphone,
    wallet: Wallet,
    "id card": FileText,
    bag: Briefcase,
    shoes: Footprints,
    jewelry: Gem,
    documents: FileText,
    other: HelpCircle
  };

  const normCat = item.category.toLowerCase();
  const Icon = categoryIcons[normCat] || HelpCircle;

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-slate-150 dark:border-gray-800 overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-350 hover:-translate-y-1 flex flex-col justify-between">
      <div>
        {/* Visual Header / Background */}
        <div className={`relative h-40 bg-gradient-to-br ${item.bgGradient || 'from-slate-500 to-slate-650'} flex items-center justify-center`}>
          <div className="absolute top-4 right-4 z-10">
            <StatusBadge status={item.status} />
          </div>
          
          <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
            <Icon className="w-7 h-7" />
          </div>

          <div className="absolute bottom-4 left-4 text-white">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-black/35 rounded-md backdrop-blur-sm">
              ID: {item.id}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5.5 text-left">
          <h3 className="font-heading text-lg font-extrabold text-charcoal dark:text-white tracking-tight group-hover:text-primary transition-colors duration-250">
            {item.name}
          </h3>
          
          <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-gray-800 text-charcoal-light dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">
            <span>{t(`lost_found_page.category`)}: {item.category}</span>
          </div>

          <div className="mt-5 space-y-2.5 border-t border-slate-50 dark:border-gray-800 pt-4 text-xs font-semibold text-charcoal-light dark:text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary/70 flex-shrink-0" />
              <span className="truncate">{t(item.locationKey) || item.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-secondary/70 flex-shrink-0" />
              <span>{item.date}</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Details Action */}
      <div className="px-5.5 pb-5.5">
        <Link 
          href={`/lost-found/${item.id}`}
          className="w-full inline-flex items-center justify-center gap-2 px-4.5 py-3 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-bold text-charcoal dark:text-white hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 transform active:scale-95 group/btn focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <span>{t('lost_found_page.btn_view')}</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-250 group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
