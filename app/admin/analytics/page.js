"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import ChartCard from '@/components/ChartCard';
import { Calendar, Filter, AlertTriangle, BarChart3 } from 'lucide-react';

const CAMP_LABEL_KEYS = [
  "admin.analytics.camps.medical",
  "admin.analytics.camps.volunteers",
  "admin.analytics.camps.food",
  "admin.analytics.camps.sanitation",
];

export default function AnalyticsAdmin() {
  const { t, locale } = useLanguage();
  const [timeFilter, setTimeFilter] = useState("week");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchAnalytics(range) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/dashboard?range=${range}`, { credentials: 'same-origin' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load analytics data');
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
    fetchAnalytics(timeFilter);
  }, [timeFilter]);

  const handleFilterChange = (filter) => {
    setTimeFilter(filter);
  };

  const getStatusColor = (status) => {
    const colors = {
      optimal: "bg-emerald-650 text-emerald-650",
      warning: "bg-amber-500 text-amber-500",
      critical: "bg-red-650 text-red-650",
    };
    return colors[status] || colors.optimal;
  };

  const getProgressBarColor = (status) => {
    if (status === "optimal") return "bg-emerald-650";
    if (status === "warning") return "bg-amber-500";
    return "bg-red-650";
  };

  const formatAnalyticsDate = () => {
    const d = new Date();
    return d.toLocaleDateString(locale === 'mr' ? 'mr-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t("admin.analytics.title")}
          </h1>
          <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
            {t("admin.analytics.subtitle") || "Real-time logistical performance metrics."}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 p-1 rounded-2xl shadow-sm self-start sm:self-auto select-none">
          {["today", "week", "month", "year"].map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all ${
                timeFilter === filter
                  ? "bg-primary text-white shadow-saffron-glow"
                  : "text-slate-500 dark:text-gray-400 hover:text-charcoal dark:hover:text-white"
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {t(`admin.analytics.filter_${filter}`)}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
                  <div className="h-4 w-40 bg-slate-200 dark:bg-gray-800 rounded animate-pulse mb-5" />
                  <div className="h-44 w-full bg-slate-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5.5 shadow-premium">
              <div className="h-4 w-44 bg-slate-200 dark:bg-gray-800 rounded animate-pulse mb-5" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="mb-5">
                  <div className="h-3 w-32 bg-slate-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
                  <div className="h-2 w-full bg-slate-200 dark:bg-gray-800 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex items-center justify-center mb-5">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-heading text-xl font-extrabold text-charcoal dark:text-white mb-2">
            {t("admin.common.load_error") || "Failed to load analytics"}
          </h2>
          <p className="text-sm text-charcoal-light dark:text-gray-400 max-w-md mb-6">
            {error}
          </p>
          <button
            onClick={() => fetchAnalytics(timeFilter)}
            className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-saffron-glow"
          >
            {t("admin.common.retry") || "Retry"}
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">
            {data.analytics?.volunteerRegistrations ? (
              <ChartCard
                titleKey="admin.analytics.registrations"
                type="line"
                data={data.analytics.volunteerRegistrations}
              />
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium flex items-center justify-center h-48">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 text-slate-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-charcoal-light dark:text-gray-400 font-semibold">
                    {t("admin.common.no_data") || "No data available"}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {data.analytics?.lostItemCategories ? (
                <ChartCard
                  titleKey="admin.analytics.item_distribution"
                  type="donut"
                  data={data.analytics.lostItemCategories}
                />
              ) : (
                <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium flex items-center justify-center h-48">
                  <div className="text-center">
                    <BarChart3 className="w-8 h-8 text-slate-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-charcoal-light dark:text-gray-400 font-semibold">{t("admin.common.no_data") || "No data"}</p>
                  </div>
                </div>
              )}
              {data.analytics?.dailyActivityTrends ? (
                <ChartCard
                  titleKey="admin.analytics.daily_activities"
                  type="bar"
                  data={data.analytics.dailyActivityTrends}
                />
              ) : (
                <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium flex items-center justify-center h-48">
                  <div className="text-center">
                    <BarChart3 className="w-8 h-8 text-slate-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-charcoal-light dark:text-gray-400 font-semibold">{t("admin.common.no_data") || "No data"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5.5 shadow-premium flex flex-col justify-between">
            <div>
              <h3 className="font-heading text-sm font-bold text-charcoal dark:text-white uppercase tracking-wider pb-4 mb-5 border-b border-slate-100 dark:border-gray-850">
                {t("admin.analytics.progress_overview")}
              </h3>

              <div className="space-y-6.5 text-xs font-semibold">
                {(data.analytics?.campOperationsStatus || []).length > 0 ? (
                  data.analytics.campOperationsStatus.map((camp) => (
                    <div key={camp.nameKey} className="space-y-2">
                      <div className="flex justify-between items-center text-slate-700 dark:text-gray-300">
                        <span className="truncate pr-4">{t(camp.nameKey)}</span>
                        <span className="font-extrabold font-heading text-charcoal dark:text-white shrink-0">
                          {camp.current}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-gray-850 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(camp.status)}`}
                          style={{ width: `${camp.current}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 dark:text-gray-505">
                        <span className="uppercase">{camp.status} Status</span>
                        <span>Target: {camp.target}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-xs text-charcoal-light dark:text-gray-400 font-semibold">
                      {t("admin.common.no_data") || "No operational data"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-gray-850 mt-6 pt-4.5 flex justify-between items-center text-[10px] text-slate-400 dark:text-gray-500 font-bold">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {formatAnalyticsDate()}
              </span>
              <span>Live data</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
