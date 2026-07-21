"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function StatusBadge({ status }) {
  const { t } = useLanguage();

  const statusStyles = {
    // Missing Persons
    missing: "bg-red-50 text-red-650 border-red-200/60 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
    // Lost & Found
    lost: "bg-amber-50 text-amber-650 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
    found: "bg-emerald-50 text-emerald-650 border-emerald-250/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
    claimed: "bg-blue-50 text-blue-650 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
    // Volunteers
    approved: "bg-emerald-50 text-emerald-650 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
    pending: "bg-amber-50 text-amber-650 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
    rejected: "bg-red-50 text-red-650 border-red-200/60 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
  };

  const statusKeyMap = {
    missing:  "missing_persons_page.status_missing",
    lost:     "lost_found_page.status_lost",
    found:    "missing_persons_page.status_found",
    claimed:  "lost_found_page.status_claimed",
    approved: "admin.volunteers.status_approved",
    pending:  "admin.volunteers.status_pending",
    rejected: "admin.volunteers.status_rejected",
  };

  const normStatus = (status || "").toLowerCase();
  const styles = statusStyles[normStatus] || "bg-slate-50 text-slate-600 border-slate-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
  const labelKey = statusKeyMap[normStatus];
  const label = labelKey ? t(labelKey) : (status || "Unknown");

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg border shadow-sm ${styles}`}>
      {label}
    </span>
  );
}
