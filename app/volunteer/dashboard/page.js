"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Container from '@/components/Container';
import LoadingButton from '@/components/LoadingButton';
import { Package, Plus, ArrowRight, LogOut, User, UserX, HeartHandshake, Bell, BellOff, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useVolunteerHelpRequestNotifications } from '@/hooks/useVolunteerHelpRequestNotifications';

function formatDate(dateInput) {
  if (!dateInput) return '';
  try {
    return new Date(dateInput).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return dateInput;
  }
}

export default function VolunteerDashboardPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [volunteer, setVolunteer] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, waiting: 0, returned: 0 });
  const [recentMissingPersons, setRecentMissingPersons] = useState([]);
  const [missingPersonStats, setMissingPersonStats] = useState({ total: 0, missing: 0, found: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [notifPermission, setNotifPermission] = useState('default');

  const {
    pendingCount,
    hasNewRequests,
    dismissAlert,
    requestBrowserPermission,
  } = useVolunteerHelpRequestNotifications();

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [meRes, itemsRes, mpRes] = await Promise.all([
          fetch('/api/volunteer/me'),
          fetch('/api/volunteer/lost-items?limit=5'),
          fetch('/api/volunteer/missing-persons?limit=5'),
        ]);

        if (meRes.ok) {
          const meJson = await meRes.json();
          if (meJson.success && meJson.data) {
            setVolunteer(meJson.data);
          }
        }

        if (itemsRes.ok) {
          const itemsJson = await itemsRes.json();
          if (itemsJson.success && itemsJson.data?.items) {
            setRecentItems(itemsJson.data.items);
            const total = itemsJson.data.pagination?.total || itemsJson.data.items.length;
            setStats(prev => ({ ...prev, total }));
          }
        }

        if (mpRes.ok) {
          const mpJson = await mpRes.json();
          if (mpJson.success && mpJson.data?.items) {
            setRecentMissingPersons(mpJson.data.items);
            const total = mpJson.data.pagination?.total || mpJson.data.items.length;
            setMissingPersonStats(prev => ({ ...prev, total }));
          }
        }

        const [waitingRes, returnedRes, missingRes, foundRes] = await Promise.all([
          fetch('/api/volunteer/lost-items?status=Waiting&limit=1'),
          fetch('/api/volunteer/lost-items?status=Returned&limit=1'),
          fetch('/api/volunteer/missing-persons?status=Missing&limit=1'),
          fetch('/api/volunteer/missing-persons?status=Found&limit=1'),
        ]);

        if (waitingRes.ok) {
          const wJson = await waitingRes.json();
          if (wJson.success && wJson.data?.pagination) {
            setStats(prev => ({ ...prev, waiting: wJson.data.pagination.total }));
          }
        }
        if (returnedRes.ok) {
          const rJson = await returnedRes.json();
          if (rJson.success && rJson.data?.pagination) {
            setStats(prev => ({ ...prev, returned: rJson.data.pagination.total }));
          }
        }
        if (missingRes.ok) {
          const sJson = await missingRes.json();
          if (sJson.success && sJson.data?.pagination) {
            setMissingPersonStats(prev => ({ ...prev, missing: sJson.data.pagination.total }));
          }
        }
        if (foundRes.ok) {
          const fJson = await foundRes.json();
          if (fJson.success && fJson.data?.pagination) {
            setMissingPersonStats(prev => ({ ...prev, found: fJson.data.pagination.total }));
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/volunteer/logout', { method: 'POST' });
      router.push('/volunteer/login');
    } catch {
      router.push('/volunteer/login');
    }
  };

  const handleEnableNotifications = useCallback(async () => {
    const result = await requestBrowserPermission();
    setNotifPermission(result === 'granted' ? 'granted' : result === 'denied' ? 'denied' : 'default');
  }, [requestBrowserPermission]);

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <section className="relative min-h-[35vh] md:min-h-[40vh] flex flex-col justify-center py-16 overflow-hidden bg-gradient-to-br from-primary to-amber-600">
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/10 rounded-full blur-[100px] pointer-events-none" />

        <Container className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white text-xs font-semibold mb-6">
            <User className="w-4 h-4" />
            <span>{volunteer?.volunteerId || 'Volunteer'}</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {t('volunteer_dashboard.title')}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/80 max-w-xl mx-auto">
            {t('volunteer_dashboard.subtitle')}
          </p>
          {volunteer?.name && (
            <p className="mt-2 text-white/60 text-sm font-semibold">
              Welcome, {volunteer.name}
            </p>
          )}
        </Container>
      </section>

      {hasNewRequests && pendingCount > 0 && (
        <section className="bg-gradient-to-r from-red-500 to-rose-600 py-4">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading text-base font-extrabold text-white">
                      {pendingCount === 1
                        ? t('volunteer_dashboard.new_help_request')
                        : t('volunteer_dashboard.new_help_requests')}
                    </h3>
                    <p className="text-xs text-white/80 mt-0.5">
                      {t('volunteer_dashboard.help_request_notification')
                        .replace('{count}', pendingCount)
                        .replace('{plural}', pendingCount > 1 ? 's' : '')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link
                    href="/volunteer/help-requests"
                    onClick={dismissAlert}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-red-600 rounded-xl text-xs font-bold hover:bg-white/90 transition-all"
                  >
                    {t('volunteer_dashboard.view_help_requests_btn')}
                  </Link>
                  <button
                    onClick={dismissAlert}
                    className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                    aria-label={t('volunteer_dashboard.dismiss')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      <section className="py-12 md:py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-xl font-extrabold text-charcoal dark:text-white mb-8">
              {t('volunteer_dashboard.quick_actions')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <Link
                href="/volunteer/lost-items"
                className="group bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-extrabold text-charcoal dark:text-white">
                  {t('volunteer_dashboard.lost_baggage')}
                </h3>
                <p className="text-sm text-charcoal-light dark:text-gray-400 mt-2 leading-relaxed">
                  {t('volunteer_dashboard.lost_baggage_desc')}
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs font-bold text-primary group-hover:text-primary-dark transition-colors">
                  <span>{t('volunteer_dashboard.view_lost_items')}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <Link
                href="/volunteer/missing-persons"
                className="group bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  <UserX className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-extrabold text-charcoal dark:text-white">
                  {t('volunteer_dashboard.missing_persons')}
                </h3>
                <p className="text-sm text-charcoal-light dark:text-gray-400 mt-2 leading-relaxed">
                  {t('volunteer_dashboard.missing_persons_desc')}
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs font-bold text-primary group-hover:text-primary-dark transition-colors">
                  <span>{t('volunteer_dashboard.view_missing_persons')}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <Link
                href="/volunteer/lost-items/new"
                className="group bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-extrabold text-charcoal dark:text-white">
                  {t('volunteer_dashboard.add_lost_item')}
                </h3>
                <p className="text-sm text-charcoal-light dark:text-gray-400 mt-2 leading-relaxed">
                  {t('volunteer_dashboard.add_lost_item_desc')}
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs font-bold text-primary group-hover:text-primary-dark transition-colors">
                  <span>{t('volunteer_lost_items.btn_add_new')}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <Link
                href="/volunteer/help-requests"
                className="group bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:-translate-y-1 relative"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                {pendingCount > 0 && (
                  <div className="absolute top-3 right-3 min-w-[24px] h-6 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg animate-pulse">
                    {pendingCount}
                  </div>
                )}
                <h3 className="font-heading text-lg font-extrabold text-charcoal dark:text-white">
                  {t('volunteer_dashboard.help_requests')}
                </h3>
                <p className="text-sm text-charcoal-light dark:text-gray-400 mt-2 leading-relaxed">
                  {t('volunteer_dashboard.help_requests_desc')}
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs font-bold text-primary group-hover:text-primary-dark transition-colors">
                  <span>{t('volunteer_dashboard.view_help_requests')}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <LoadingButton
                onClick={handleLogout}
                loading={loggingOut}
                variant="danger"
                className="group bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:-translate-y-1 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  <LogOut className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-extrabold text-charcoal dark:text-white">
                  {t('volunteer_dashboard.logout')}
                </h3>
                <p className="text-sm text-charcoal-light dark:text-gray-400 mt-2 leading-relaxed">
                  {t('volunteer_dashboard.logout_desc')}
                </p>
              </LoadingButton>
            </div>

            {typeof Notification !== 'undefined' && notifPermission === 'default' && (
              <div className="mb-8">
                <button
                  onClick={handleEnableNotifications}
                  className="w-full sm:w-auto inline-flex items-center gap-2.5 px-5 py-3 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-premium hover:shadow-premium-hover transition-all duration-300 text-xs font-bold text-charcoal dark:text-white"
                >
                  <Bell className="w-4 h-4 text-primary" />
                  {t('volunteer_dashboard.enable_notifications')}
                </button>
              </div>
            )}

            {error && (
              <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 mb-8">
                <p className="text-red-500 dark:text-red-400 font-semibold">{error}</p>
                <p className="text-sm text-charcoal-light dark:text-gray-400 mt-2">
                  {t('common.try_refresh')}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all"
                >
                  {t('common.retry')}
                </button>
              </div>
            )}

            <h2 className="font-heading text-xl font-extrabold text-charcoal dark:text-white mb-6">
              {t('volunteer_dashboard.recent_items')}
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-200 dark:bg-gray-700 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-1/3" />
                        <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentItems.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-8 text-center">
                <Package className="w-10 h-10 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-charcoal-light dark:text-gray-400">
                  {t('volunteer_dashboard.no_lost_items')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentItems.map((item) => (
                  <Link
                    key={item.itemId || item._id}
                    href={`/volunteer/lost-items/${encodeURIComponent(item.itemId || item._id)}`}
                    className="group flex items-center gap-4 bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-4 hover:shadow-premium-hover transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white flex-shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm font-extrabold text-charcoal dark:text-white truncate">
                        {item.itemType || item.name || 'Unknown Item'}
                      </p>
                      <p className="text-xs text-charcoal-light dark:text-gray-400 truncate">
                        {item.foundLocation || item.locationFound || ''} - {formatDate(item.dateReported)}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'Returned'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                    }`}>
                      {item.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}

            <h2 className="font-heading text-xl font-extrabold text-charcoal dark:text-white mb-6 mt-12">
              {t('volunteer_dashboard.recent_missing_persons')}
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-200 dark:bg-gray-700 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-1/3" />
                        <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentMissingPersons.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-8 text-center">
                <UserX className="w-10 h-10 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-charcoal-light dark:text-gray-400">
                  {t('volunteer_dashboard.no_missing_persons')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMissingPersons.map((person) => (
                  <Link
                    key={person.caseId || person._id}
                    href={`/volunteer/missing-persons/${encodeURIComponent(person.caseId || person._id)}`}
                    className="group flex items-center gap-4 bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-4 hover:shadow-premium-hover transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white flex-shrink-0">
                      <UserX className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm font-extrabold text-charcoal dark:text-white truncate">
                        {person.name || 'Unknown Person'}
                      </p>
                      <p className="text-xs text-charcoal-light dark:text-gray-400 truncate">
                        {person.lastSeenLocation || ''} - {formatDate(person.dateReported)}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      person.status === 'Found'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                    }`}>
                      {person.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
