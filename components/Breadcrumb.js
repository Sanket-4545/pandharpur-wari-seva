"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Breadcrumb() {
  const pathname = usePathname();
  const { t } = useLanguage();

  if (!pathname) return null;

  const pathParts = pathname.split('/').filter(Boolean);

  const routeLabelMap = {
    admin: "admin.sidebar.dashboard",
    "missing-persons": "admin.sidebar.missing_persons",
    "lost-found": "admin.sidebar.lost_found",
    volunteers: "admin.sidebar.volunteers",
    "emergency-contacts": "admin.sidebar.emergency_contacts",
    gallery: "admin.sidebar.gallery",
    announcements: "admin.sidebar.announcements",
    reports: "admin.sidebar.reports",
    analytics: "admin.sidebar.analytics",
    settings: "admin.sidebar.settings",
    profile: "admin.sidebar.profile",
  };

  return (
    <nav className="flex items-center space-x-2 text-xs font-semibold text-charcoal-light dark:text-gray-400 py-1 select-none">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-primary dark:hover:text-primary-light transition-colors"
        aria-label="Home"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {pathParts.map((part, index) => {
        const isLast = index === pathParts.length - 1;
        const routePath = `/${pathParts.slice(0, index + 1).join('/')}`;
        const labelKey = routeLabelMap[part] || part;
        const labelText = t(labelKey);

        return (
          <div key={part} className="flex items-center space-x-2">
            <ChevronRight className="w-3.5 h-3.5 text-slate-350 dark:text-gray-600" />
            {isLast ? (
              <span className="text-charcoal dark:text-white font-bold tracking-tight">
                {labelText}
              </span>
            ) : (
              <Link
                href={routePath}
                className="hover:text-primary dark:hover:text-primary-light transition-colors"
              >
                {labelText}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
