"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Eye, EyeOff, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

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

      <section className="login-form-panel" aria-labelledby="admin-login-title">
        <div className="login-form-wrap">
          <div className="login-form-heading">
            <p className="login-eyebrow">{t('portal.welcome_back') || 'Welcome back'}</p>
            <h1 id="admin-login-title">
              {t('portal.signin_to') || 'Sign in to'}<br />
              <em>{t('portal.continue') || 'continue.'}</em>
            </h1>
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
            <div style={{ position: 'relative' }}>
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
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'center' }}>
              {footerLinks.map((link, i) => (
                <div key={i}>
                  <Link
                    href={link.href}
                    style={{ color: '#a35e2d', textDecoration: 'none', borderBottom: '1px solid rgba(163,94,45,.35)', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    {link.icon && <link.icon size={14} />}
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
      </section>
    </div>
  );
}
