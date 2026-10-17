"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Eye, EyeOff, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AdminLoginForm({ purpose, titleKey, subtitleKey, footerLinks }) {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError(t('login.error_email_required'));
      return;
    }
    if (!password) {
      setError(t('login.error_password_required'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, purpose }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || t('login.error_invalid'));
        setLoading(false);
        return;
      }
      const redirect = searchParams.get('redirect') || '/admin';
      const safeRedirect = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/admin';
      router.push(safeRedirect);
    } catch {
      setError(t('login.error_network'));
      setLoading(false);
    }
  };

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
          <h1 id="admin-login-title">{t(titleKey)}</h1>
          <p className="login-intro">{t(subtitleKey)}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="login-error-banner" role="alert">
              {error}
            </div>
          )}

          <label htmlFor={`email-${purpose}`} className="login-label">
            {t('login.email')}
          </label>
          <input
            id={`email-${purpose}`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('login.email_placeholder')}
            autoComplete="email"
            autoFocus
            className="login-input"
            style={{ marginTop: 6 }}
            required
          />

          <div className="login-label-row">
            <label htmlFor={`password-${purpose}`} className="login-label">
              {t('login.password')}
            </label>
          </div>
          <div className="login-password-wrap">
            <input
              id={`password-${purpose}`}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.password_placeholder')}
              autoComplete="current-password"
              className="login-input"
              style={{ paddingRight: 48, marginTop: 6 }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="login-password-toggle"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="login-submit-btn">
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('login.submitting')}
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {t('login.submit')}
                <span className="arrow" aria-hidden="true">
                  <ArrowUpRight size={18} />
                </span>
              </span>
            )}
          </button>
        </form>

        {footerLinks && footerLinks.length > 0 && (
          <div className="login-footer-link">
            {footerLinks.map((link, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <Link href={link.href}>
                  {link.icon && <link.icon size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />}
                  {t(link.labelKey)}
                </Link>
              </div>
            ))}
          </div>
        )}

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
