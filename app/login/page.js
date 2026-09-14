"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { UserCheck, Users, Shield, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const { t } = useLanguage();

  const loginOptions = [
    {
      href: '/volunteer/login',
      icon: UserCheck,
      titleKey: 'portal.volunteer_title',
      descKey: 'portal.volunteer_desc',
      color: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      href: '/sub-admin/login',
      icon: Users,
      titleKey: 'portal.sub_admin_title',
      descKey: 'portal.sub_admin_desc',
      color: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      href: '/super-admin/login',
      icon: Shield,
      titleKey: 'portal.super_admin_title',
      descKey: 'portal.super_admin_desc',
      color: 'from-primary to-amber-500',
      iconBg: 'bg-primary/10 dark:bg-primary/20',
      iconColor: 'text-primary dark:text-primary-light',
    },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white shadow-saffron-glow mx-auto mb-4 relative overflow-hidden">
            <Image src="/images/logo.jpg" alt="NSS Seva Portal logo" fill sizes="64px" className="object-cover" priority />
          </div>
          <h1 className="font-heading text-2xl font-extrabold text-secondary dark:text-white">
            {t('portal.title')}
          </h1>
          <p className="mt-2 text-sm text-charcoal-light dark:text-gray-400">
            {t('portal.subtitle')}
          </p>
        </div>

        <div className="space-y-3">
          {loginOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Link
                key={option.href}
                href={option.href}
                className="group block bg-white dark:bg-gray-900 rounded-2xl shadow-premium p-4 sm:p-5 border border-slate-100 dark:border-gray-800 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 dark:focus:ring-offset-gray-900 min-h-[44px]"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${option.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${option.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-heading text-base font-bold text-secondary dark:text-white">
                      {t(option.titleKey)}
                    </h2>
                    <p className="text-xs text-charcoal-light dark:text-gray-400 mt-0.5 leading-relaxed">
                      {t(option.descKey)}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-gray-600 group-hover:text-primary dark:group-hover:text-primary-light transition-colors shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
