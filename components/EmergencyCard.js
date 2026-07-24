"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Phone, Copy, Check, Shield, HeartPulse, Flame, UserCheck, ShieldAlert, Users } from 'lucide-react';
import Button from './Button';

const ICON_MAP = {
  Shield,
  HeartPulse,
  Flame,
  UserCheck,
  ShieldAlert,
  Users,
  Phone,
};

export default function EmergencyCard({ icon: Icon, iconName, titleKey, descKey, phoneNumber, colorClass }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const ResolvedIcon = Icon || (iconName && ICON_MAP[iconName]) || Phone;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-800 p-6.5 shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:border-primary/20">
      <div>
        {/* Header section with Icon & Title */}
        <div className="flex items-center gap-4.5 mb-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:rotate-2 ${colorClass}`}>
            <ResolvedIcon className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-heading text-lg font-bold text-charcoal dark:text-white tracking-tight group-hover:text-primary transition-colors duration-200">
              {t(titleKey)}
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
              Helpline
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-charcoal-light dark:text-gray-400 leading-relaxed mb-6">
          {t(descKey)}
        </p>

        {/* Number Box */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-200/50 dark:border-gray-700 mb-6 font-mono font-bold text-charcoal dark:text-white text-base md:text-lg select-all">
          <span>{phoneNumber}</span>
          <button 
            onClick={copyToClipboard}
            className="p-1.5 rounded-lg hover:bg-slate-250 text-slate-400 hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary/30"
            title={t('emergency_page.copy')}
            aria-label={t('emergency_page.copy')}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <Button 
          variant="primary" 
          size="sm"
          className="flex-grow gap-2"
          onClick={() => alert(`Calling ${phoneNumber} (Simulation only)`)}
        >
          <Phone className="w-3.5 h-3.5 fill-current" />
          {t('emergency_page.call')}
        </Button>
      </div>
    </div>
  );
}
