"use client";

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Eye, EyeOff, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import LanguageSwitcher from '@/components/LanguageSwitcher';

function VolunteerLoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [volunteerId, setVolunteerId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!volunteerId.trim()) {
      setError(t('volunteer_login.error_volunteer_id_required'));
      return;
    }
    if (!password) {
      setError(t('volunteer_login.error_password_required'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/volunteer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteerId: volunteerId.trim(), password }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 403 && json.error?.includes('pending')) {
          setError(t('volunteer_login.error_pending'));
        } else if (res.status === 403) {
          setError(t('volunteer_login.error_inactive'));
        } else if (res.status === 429) {
          setError(t('volunteer_login.error_rate_limit'));
        } else {
          setError(json.error || t('volunteer_login.error_invalid'));
        }
        setLoading(false);
        return;
      }
      const redirect = searchParams.get('redirect') || '/volunteer/dashboard';
      const safeRedirect = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/volunteer/dashboard';
      router.push(safeRedirect);
    } catch {
      setError(t('volunteer_login.error_network'));
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
          <h1 id="volunteer-login-title">{t('volunteer_login.title') || 'Volunteer Login'}</h1>
          <p className="login-intro">{t('volunteer_login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="login-error-banner" role="alert">
              {error}
            </div>
          )}

          <label htmlFor="volunteerId" className="login-label">
            {t('volunteer_login.volunteer_id')}
          </label>
          <input
            id="volunteerId"
            type="text"
            value={volunteerId}
            onChange={(e) => setVolunteerId(e.target.value)}
            placeholder={t('volunteer_login.volunteer_id_placeholder')}
            autoComplete="username"
            autoFocus
            className="login-input"
            style={{ marginTop: 6 }}
            required
          />

          <div className="login-label-row">
            <label htmlFor="password" className="login-label">
              {t('volunteer_login.password')}
            </label>
          </div>
          <div className="login-password-wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('volunteer_login.password_placeholder')}
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
                {t('volunteer_login.submitting')}
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {t('volunteer_login.submit')}
                <span className="arrow" aria-hidden="true">
                  <ArrowUpRight size={18} />
                </span>
              </span>
            )}
          </button>
        </form>

        <p className="login-register">
          {t('portal.register_prompt') || 'New volunteer?'}{' '}
          <Link href="/register">{t('nav.register')}</Link>
        </p>

        <div className="login-footer-link" style={{ marginTop: 14 }}>
          <Link href="/login">{t('login.portal_link')}</Link>
        </div>

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

function LoginFallback() {
  return (
    <div className="login-page">
      <div className="login-card" style={{ textAlign: 'center' }}>
        <div className="login-accent" style={{ margin: '0 auto 16px' }} />
        <div style={{ height: 20, width: 140, background: '#eadfce', borderRadius: 6, margin: '0 auto 10px' }} />
        <div style={{ height: 12, width: 190, background: '#efe6d8', borderRadius: 6, margin: '0 auto 26px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
          <div style={{ height: 52, width: '100%', background: '#efe6d8', borderRadius: 10 }} />
          <div style={{ height: 52, width: '100%', background: '#efe6d8', borderRadius: 10 }} />
          <div style={{ height: 52, width: '100%', background: '#e8dbc9', borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );
}

export default function VolunteerLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <VolunteerLoginForm />
    </Suspense>
  );
}
