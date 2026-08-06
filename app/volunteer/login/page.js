"use client";

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Image from 'next/image';

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
      const redirect = searchParams.get('redirect') || '/';
      const safeRedirect = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/';
      router.push(safeRedirect);
    } catch {
      setError(t('volunteer_login.error_network'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white shadow-saffron-glow mx-auto mb-4 relative overflow-hidden">
            <Image src="/images/logo.jpg" alt="NSS Seva Portal logo" fill sizes="64px" className="object-cover" priority />
          </div>
          <h1 className="font-heading text-2xl font-extrabold text-secondary dark:text-white">
            {t('volunteer_login.title')}
          </h1>
          <p className="mt-2 text-sm text-charcoal-light dark:text-gray-400">
            {t('volunteer_login.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-premium p-6 sm:p-8 space-y-5 border border-slate-100 dark:border-gray-800">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="volunteerId" className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-charcoal dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-gray-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
              {t('volunteer_login.password')}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('volunteer_login.password_placeholder')}
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-charcoal dark:text-white text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all pr-10 placeholder:text-slate-400 dark:placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-charcoal dark:hover:text-gray-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary-dark hover:to-amber-600 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('volunteer_login.submitting')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                {t('volunteer_login.submit')}
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VolunteerLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <VolunteerLoginForm />
    </Suspense>
  );
}
