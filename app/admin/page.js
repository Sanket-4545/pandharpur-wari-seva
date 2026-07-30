"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import DashboardCard from '@/components/DashboardCard';
import ChartCard from '@/components/ChartCard';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import Link from 'next/link';
import { ArrowRight, Bell, Calendar, Flame, Activity, AlertTriangle, Inbox } from 'lucide-react';

export default function AdminDashboardPage() {
  const { t, locale } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/dashboard?range=week', { credentials: 'same-origin' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load dashboard data');
      }
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const getActivityStyles = (type) => {
    const configs = {
      volunteer: "bg-orange-50 text-primary border-orange-100 dark:bg-orange-950/20 dark:text-primary-light dark:border-primary-dark/20",
      missing: "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/20",
      lost_found: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/20",
      emergency: "bg-rose-50 text-rose-650 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/20",
      gallery: "bg-emerald-50 text-emerald-650 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/20",
      announcement: "bg-purple-50 text-purple-650 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/20",
    };
    return configs[type] || "bg-slate-50 text-slate-600 border-slate-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
  };

  const getRelativeTime = (timestamp) => {
    const diffMins = Math.floor((new Date() - new Date(timestamp)) / 60000);
    if (isNaN(diffMins)) return "";
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString(locale === 'mr' ? 'mr-IN' : 'en-IN');
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      high: { text: 'High Priority', color: 'bg-red-100 dark:bg-red-950 text-red-650 dark:text-red-400' },
      medium: { text: 'Medium Priority', color: 'bg-amber-100 dark:bg-amber-950 text-amber-650 dark:text-amber-450' },
      low: { text: 'Low Priority', color: 'bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400' },
    };
    return labels[priority] || labels.low;
  };

  const getTodayDate = () => {
    const d = new Date();
    return d.toLocaleDateString(locale === 'mr' ? 'mr-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex items-center justify-center mb-5">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="font-heading text-xl font-extrabold text-charcoal dark:text-white mb-2">
          {t("admin.common.load_error") || "Failed to load dashboard"}
        </h2>
        <p className="text-sm text-charcoal-light dark:text-gray-400 max-w-md mb-6">
          {error}
        </p>
        <button
          onClick={fetchDashboard}
          className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-saffron-glow"
        >
          {t("admin.common.retry") || "Retry"}
        </button>
      </div>
    );
  }

  const { stats = [], recentActivities = [], alerts = [], analytics } = data || {};
  const statsRow = stats.slice(0, 9);

  return (
    <div className="space-y-7">

      <div className="rounded-3xl bg-gradient-to-r from-secondary to-blue-800 dark:from-gray-900 dark:to-slate-800 text-white p-6 sm:p-8 shadow-premium relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-44 h-44 bg-primary/10 rounded-full blur-xl -mb-10 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-primary-light font-bold text-xs uppercase tracking-widest mb-1.5">
              <Flame className="w-4 h-4 fill-current animate-pulse" />
              NSS Command Center
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pandharpur Seva Dashboard
            </h1>
            <p className="mt-1.5 text-xs text-blue-100 dark:text-gray-300 max-w-xl font-semibold leading-relaxed">
              Selfless volunteering logistics desk. Manage missing pilgrims, recover lost property inventories, dispatch medical squads, and broadcast urgent advisories.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-4.5 py-2.5 rounded-2xl text-xs font-bold font-heading self-start sm:self-auto">
            <Calendar className="w-4.5 h-4.5" />
            <span suppressHydrationWarning>{getTodayDate()}</span>
          </div>
        </div>
      </div>

      {statsRow.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {statsRow.map((stat) => (
            <DashboardCard
              key={stat.id}
              labelKey={stat.labelKey}
              value={stat.value}
              change={stat.change}
              isPositive={stat.isPositive}
              colorClass={stat.colorClass}
              iconName={stat.iconName}
            />
          ))}
        </div>
      )}

      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            titleKey="admin.analytics.registrations"
            type="line"
            data={analytics.volunteerRegistrations}
          />
          <ChartCard
            titleKey="admin.analytics.daily_activities"
            type="bar"
            data={analytics.dailyActivityTrends}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-850 pb-4 mb-4">
              <h3 className="font-heading text-sm font-bold text-charcoal dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-primary" />
                {t("admin.dashboard.recent_activities")}
              </h3>
              <span className="text-[10px] bg-slate-100 dark:bg-gray-850 text-slate-500 dark:text-gray-400 font-bold px-2 py-1 rounded-lg">
                Real-time
              </span>
            </div>

            {recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Inbox className="w-10 h-10 text-slate-300 dark:text-gray-600 mb-3" />
                <p className="text-xs text-charcoal-light dark:text-gray-400 font-semibold">
                  {t("admin.common.no_activities") || "No recent activities"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  let title = t(activity.titleKey);
                  if (activity.titleArgs) {
                    Object.entries(activity.titleArgs).forEach(([k, v]) => {
                      title = title.replace(`{${k}}`, v);
                    });
                  }

                  return (
                    <div key={activity.id} className="flex gap-4 items-start relative group">
                      <div className={`w-8.5 h-8.5 rounded-xl border flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm ${getActivityStyles(activity.type)}`}>
                        {activity.type.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-2.5">
                          <p className="text-xs font-bold text-charcoal dark:text-gray-200 truncate">
                            {title}
                          </p>
                          <span className="text-[9px] text-slate-400 dark:text-gray-500 font-bold shrink-0">
                            {getRelativeTime(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-[11px] text-charcoal-light dark:text-gray-400 mt-0.5 truncate leading-relaxed">
                          {activity.details}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-gray-850 mt-5 pt-4">
            <Link
              href="/admin/volunteers"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-primary-light hover:text-primary-dark hover:underline focus:outline-none"
            >
              {t("admin.dashboard.view_all")}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-850 pb-4 mb-4">
              <h3 className="font-heading text-sm font-bold text-charcoal dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4.5 h-4.5 text-primary" />
                {t("admin.dashboard.alerts") || "Alerts & Notices"}
              </h3>
            </div>

            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="w-10 h-10 text-slate-300 dark:text-gray-600 mb-3" />
                <p className="text-xs text-charcoal-light dark:text-gray-400 font-semibold">
                  {t("admin.common.no_alerts") || "No active alerts"}
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {alerts.slice(0, 3).map((alert) => {
                  const priorityInfo = getPriorityLabel(alert.priority);
                  const timeStr = alert.timestamp
                    ? new Date(alert.timestamp).toLocaleTimeString(locale === 'mr' ? 'mr-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' })
                    : '';
                  return (
                    <div key={alert.id} className={`p-3 rounded-2xl border ${alert.priority === 'high' ? 'bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-900/20' : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/20'}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${priorityInfo.color}`}>
                          {priorityInfo.text}
                        </span>
                        {timeStr && (
                          <span className="text-[9px] text-slate-400 dark:text-gray-500 font-semibold">{timeStr}</span>
                        )}
                      </div>
                      <h5 className="mt-1.5 text-xs font-extrabold text-charcoal dark:text-white leading-tight">
                        {alert.title}
                      </h5>
                      {alert.description && (
                        <p className="mt-1 text-[10px] text-charcoal-light dark:text-gray-400 leading-normal line-clamp-2">
                          {alert.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-gray-850 mt-5 pt-4">
            <Link
              href="/admin/announcements"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-primary-light hover:text-primary-dark hover:underline focus:outline-none"
            >
              {t("admin.dashboard.manage_announcements") || "Manage Announcements"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
