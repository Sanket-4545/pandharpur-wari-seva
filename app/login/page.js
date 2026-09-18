"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { UserCheck, Users, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { t } = useLanguage();

  const loginOptions = [
    {
      href: '/volunteer/login',
      icon: UserCheck,
      titleKey: 'portal.volunteer_title',
      descKey: 'portal.volunteer_desc',
      borderColor: '#10b981',
      iconBg: 'rgba(16,185,129,0.08)',
      iconColor: '#059669',
    },
    {
      href: '/sub-admin/login',
      icon: Users,
      titleKey: 'portal.sub_admin_title',
      descKey: 'portal.sub_admin_desc',
      borderColor: '#f59e0b',
      iconBg: 'rgba(245,158,11,0.08)',
      iconColor: '#d97706',
    },
    {
      href: '/super-admin/login',
      icon: Shield,
      titleKey: 'portal.super_admin_title',
      descKey: 'portal.super_admin_desc',
      borderColor: '#a95f2b',
      iconBg: 'rgba(169,95,43,0.08)',
      iconColor: '#a95f2b',
    },
  ];

  return (
    <div className="login-shell">
      <section className="login-image-panel" aria-label="Background image">
        <div className="login-image-wash" />
        <div className="login-image-content">
          <p className="login-eyebrow">{t('portal.eyebrow') || 'NSS Wari Seva Portal'}</p>
          <p className="login-quote">
            {t('portal.quote_line1') || '"Where devotion'}<br />
            {t('portal.quote_line2') || 'becomes a daily practice."'}
          </p>
          <div className="login-divider" />
          <p className="login-caption">NSS WARI SEWA</p>
        </div>
      </section>

      <section className="login-form-panel" aria-labelledby="portal-login-title">
        <div className="login-form-wrap">
          <div className="login-form-heading">
            <p className="login-eyebrow">{t('portal.welcome_back') || 'Welcome back'}</p>
            <h1 id="portal-login-title">
              {t('portal.title')}<br />
              <em>{t('portal.continue') || 'continue.'}</em>
            </h1>
            <p className="login-intro">{t('portal.subtitle')}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loginOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Link
                  key={option.href}
                  href={option.href}
                  style={{
                    display: 'block',
                    background: '#fffdf8',
                    border: '1px solid #e8dfd4',
                    borderLeft: `3px solid ${option.borderColor}`,
                    borderRadius: 4,
                    padding: '16px 18px',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'box-shadow .2s, transform .15s',
                    minHeight: 44,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = '2px solid #a95f2b';
                    e.currentTarget.style.outlineOffset = '2px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      background: option.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={22} color={option.iconColor} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h2 style={{
                        margin: 0,
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#30251f',
                      }}>
                        {t(option.titleKey)}
                      </h2>
                      <p style={{
                        margin: '2px 0 0',
                        fontSize: 12,
                        color: '#836f5f',
                        lineHeight: 1.4,
                      }}>
                        {t(option.descKey)}
                      </p>
                    </div>
                    <ChevronRight size={18} color="#c4b5a5" style={{ flexShrink: 0 }} />
                  </div>
                </Link>
              );
            })}
          </div>

          <p className="login-legal" style={{ marginTop: 38 }}>
            {t('portal.by_continuing') || 'By continuing, you agree to our'}{' '}
            <a href="#" className="login-link-subtle">{t('portal.terms') || 'Terms'}</a>
            {' '}{t('portal.and') || 'and'}{' '}
            <a href="#" className="login-link-subtle">{t('portal.privacy') || 'Privacy Policy'}</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
