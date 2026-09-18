"use client";

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Eye, EyeOff, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

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

      <section className="login-form-panel" aria-labelledby="volunteer-login-title">
        <div className="login-form-wrap">
          <div className="login-form-heading">
            <p className="login-eyebrow">{t('portal.welcome_back') || 'Welcome back'}</p>
            <h1 id="volunteer-login-title">
              {t('volunteer_login.title') || 'Volunteer Login'}<br />
              <em>{t('portal.continue') || 'continue.'}</em>
            </h1>
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
            <div style={{ position: 'relative' }}>
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
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: 8,
                  color: '#b8a99b',
                  cursor: 'pointer',
                  minWidth: 44,
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
              style={{ width: '100%', marginTop: 16 }}
            >
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

          <div className="login-footer-link">
            <Link
              href="/login"
              style={{ color: '#a35e2d', textDecoration: 'none', borderBottom: '1px solid rgba(163,94,45,.35)', fontSize: 12, fontWeight: 600 }}
            >
              {t('login.portal_link')}
            </Link>
          </div>

          <p className="login-legal">
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

export default function VolunteerLoginPage() {
  return (
    <Suspense fallback={
      <div className="login-shell">
        <div className="login-image-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="login-image-wash" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: 40, height: 40, border: '3px solid #e7af6a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        </div>
        <div className="login-form-panel">
          <div className="login-form-wrap">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ height: 14, width: 120, background: '#e5ddd3', borderRadius: 3 }} />
              <div style={{ height: 40, width: '80%', background: '#e5ddd3', borderRadius: 3 }} />
              <div style={{ height: 14, width: 200, background: '#e5ddd3', borderRadius: 3 }} />
            </div>
            <div style={{ marginTop: 35, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ height: 12, width: 80, background: '#e5ddd3', borderRadius: 3 }} />
              <div style={{ height: 52, width: '100%', background: '#e5ddd3', borderRadius: 3 }} />
              <div style={{ height: 12, width: 80, background: '#e5ddd3', borderRadius: 3 }} />
              <div style={{ height: 52, width: '100%', background: '#e5ddd3', borderRadius: 3 }} />
              <div style={{ height: 53, width: '100%', background: '#e5ddd3', borderRadius: 3, marginTop: 8 }} />
            </div>
          </div>
        </div>
      </div>
    }>
      <VolunteerLoginForm />
    </Suspense>
  );
}
