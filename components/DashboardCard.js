"use client";

import React from 'react';
import { 
  Users, 
  UserX, 
  UserCheck, 
  Package, 
  Inbox, 
  ShieldAlert, 
  Eye, 
  Megaphone, 
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const iconMap = {
  Users,
  UserX,
  UserCheck,
  Package,
  Inbox,
  ShieldAlert,
  Eye,
  Megaphone,
  FileText
};

export default function DashboardCard({ labelKey, value, change, isPositive, colorClass, iconName }) {
  const { t } = useLanguage();
  const IconComponent = iconMap[iconName] || Users;

  return (
    <div className="group bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold text-charcoal-light dark:text-gray-400 tracking-wide uppercase">
            {t(labelKey)}
          </span>
          <h4 className="mt-1 text-2xl font-extrabold text-charcoal dark:text-white font-heading tracking-tight">
            {value}
          </h4>
        </div>

        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-sm transition-all duration-350 group-hover:scale-105 group-hover:rotate-3 ${colorClass}`}>
          <IconComponent className="w-5.5 h-5.5" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs">
        {isPositive ? (
          <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
            <TrendingUp className="w-3 h-3" />
            {change}
          </span>
        ) : (
          <span className="inline-flex items-center gap-0.5 font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-lg border border-red-100 dark:border-red-900/30">
            <TrendingDown className="w-3 h-3" />
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
