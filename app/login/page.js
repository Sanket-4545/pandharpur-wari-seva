"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { UserCheck, Users, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function LoginPage() {
  const { t } = useLanguage();

  const loginOptions = [
    {
      href: '/volunteer/login',
      icon: UserCheck,
      titleKey: 'portal.volunteer_title',
      descKey: 'portal.volunteer_desc',
      borderColor: '#10b981',
      iconBg: 'rgba(16,185,129,0.1)',
      iconColor: '#059669',
    },
    {
      href: '/sub-admin/login',
      icon: Users,
      titleKey: 'nav.login_admin',
      descKey: 'portal.sub_admin_desc',
      borderColor: '#f59e0b',
      iconBg: 'rgba(245,158,11,0.1)',
      iconColor: '#d97706',
    },
    {
      href: '/super-admin/login',
      icon: Shield,
      titleKey: 'portal.super_admin_title',
      descKey: 'portal.super_admin_desc',
      borderColor: '#c1661f',
      iconBg: 'rgba(193,102,31,0.1)',
      iconColor: '#a95f2b',
    },
  ];

  return (
    <div className="login-page">
      <div className="login-lang">
        <LanguageSwitcher />
      </div>

      <div className="login-card">
        <div className="login-accent">
          <Image
            src="/images/login-vitthal.jpg"
            alt=""
            aria-hidden="true"
            width={84}
            height={84}
            className="login-accent-img"
            priority
          />
        </div>

        <div className="login-brand">
          <p className="login-brand-name">{t('portal.brand') || 'WariSeva'}</p>
          <p className="login-brand-tag">{t('portal.eyebrow') || 'NSS Wari Seva Portal'}</p>
        </div>

        <div className="login-heading">
          <h1 id="portal-login-title">{t('portal.title')}</h1>
          <p className="login-intro">{t('portal.subtitle')}</p>
        </div>

        <div className="login-options">
          {loginOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Link
                key={option.href}
                href={option.href}
                className="login-option"
                style={{ '--option-color': option.borderColor }}
              >
                <div className="login-option-icon" style={{ background: option.iconBg }}>
                  <Icon size={21} color={option.iconColor} />
                </div>
                <div className="login-option-body">
                  <h2 className="login-option-title">{t(option.titleKey)}</h2>
                  <p className="login-option-desc">{t(option.descKey)}</p>
                </div>
                <ChevronRight size={18} color="#c4b5a5" style={{ flexShrink: 0 }} />
              </Link>
            );
          })}
        </div>

        <p className="login-register">
          {t('portal.register_prompt') || 'New volunteer?'}{' '}
          <Link href="/register">{t('nav.register')}</Link>
        </p>

        <p className="login-legal">
          {t('portal.by_continuing') || 'By continuing, you agree to our'}{' '}
          <a href="#" className="login-link-subtle">{t('portal.terms') || 'Terms'}</a>
          {' '}{t('portal.and') || 'and'}{' '}
          <a href="#" className="login-link-subtle">{t('portal.privacy') || 'Privacy Policy'}</a>.
        </p>
      </div>
    </div>
  );
}
