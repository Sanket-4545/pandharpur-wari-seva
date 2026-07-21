"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Navigation2 } from 'lucide-react';
import Button from './Button';

export default function MapPlaceholder() {
  const { t } = useLanguage();

  return (
    <div className="relative w-full h-[320px] md:h-[400px] rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-premium group">
      {/* Decorative Grid Pattern for map styling */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1.5px)] [background-size:16px_16px] opacity-60" />
      
      {/* Visual map features: routes, river, green patches */}
      <div className="absolute left-[30%] top-0 bottom-0 w-2.5 bg-blue-100 -rotate-12 blur-[1.5px]" title="Chandrabhaga River Simulation" />
      <div className="absolute right-0 left-0 top-[40%] h-2 bg-slate-200 rotate-6" title="National Highway Simulation" />
      <div className="absolute left-[45%] top-[15%] w-24 h-24 bg-emerald-50 rounded-full filter blur-xl opacity-80" />
      <div className="absolute right-[20%] bottom-[20%] w-32 h-32 bg-emerald-50 rounded-full filter blur-xl opacity-80" />

      {/* Styled Route Lines */}
      <svg className="absolute inset-0 w-full h-full text-slate-350 stroke-current opacity-40" xmlns="http://www.w3.org/2000/svg">
        <path d="M 50 100 Q 200 150 250 350" fill="none" strokeWidth="2.5" strokeDasharray="5,5" />
        <path d="M 150 50 Q 250 250 450 180" fill="none" strokeWidth="2.5" />
        <path d="M 0 280 H 600" fill="none" strokeWidth="1.5" />
      </svg>

      {/* Map Markers */}
      <div className="absolute top-[35%] left-[55%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        {/* Saffron pulse glow */}
        <div className="absolute w-12 h-12 rounded-full bg-primary/25 animate-ping" />
        <div className="relative w-9 h-9 rounded-2xl bg-primary text-white flex items-center justify-center shadow-saffron-glow z-10">
          <MapPin className="w-4.5 h-4.5" />
        </div>
        <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[10px] font-bold shadow-lg whitespace-nowrap z-10 border border-white/10">
          NSS Seva Head Office
        </div>
      </div>

      {/* Secondary Marker */}
      <div className="absolute top-[60%] left-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-75 group-hover:opacity-100 transition-opacity duration-300">
        <div className="relative w-7 h-7 rounded-xl bg-secondary text-white flex items-center justify-center z-10">
          <MapPin className="w-3.5 h-3.5" />
        </div>
        <div className="mt-2 px-2.5 py-1 rounded-lg bg-slate-800 text-white text-[9px] font-bold shadow-md whitespace-nowrap z-10 border border-white/5">
          Camp Site #1 (Pandharpur)
        </div>
      </div>

      {/* Bottom overlay containing navigation actions */}
      <div className="absolute bottom-5 left-5 right-5 backdrop-blur-md bg-white/75 border border-slate-200/50 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-charcoal">Pandharpur Coordination Cell</span>
          <span className="text-[10px] text-charcoal-light font-medium mt-0.5">Government Site, Pandharpur, Maharashtra</span>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          className="gap-2.5 w-full sm:w-auto text-xs py-2 px-4.5"
          onClick={() => window.open('https://maps.google.com/?q=Pandharpur+Vithoba+Temple', '_blank')}
        >
          <Navigation2 className="w-3.5 h-3.5 fill-current" />
          Navigate
        </Button>
      </div>
    </div>
  );
}
