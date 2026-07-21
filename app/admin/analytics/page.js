"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  volunteerRegistrationsData, 
  lostItemReportsData, 
  campOperationsStatus, 
  dailyActivityTrends 
} from '@/data/analytics';
import ChartCard from '@/components/ChartCard';
import { Calendar, Filter, Users, ShieldAlert, HeartPulse, Activity } from 'lucide-react';

export default function AnalyticsAdmin() {
  const { t } = useLanguage();
  const [timeFilter, setTimeFilter] = useState("week");

  // Dynamic values based on selected time filter (Simulated offset scaling)
  const getScaleFactor = () => {
    if (timeFilter === 'today') return 0.15;
    if (timeFilter === 'week') return 1.0;
    if (timeFilter === 'month') return 4.2;
    return 52.0; // year
  };

  const scaleData = (original, factor) => {
    if (!original) return null;
    return {
      ...original,
      values: original.values ? original.values.map(v => Math.round(v * factor)) : [],
      total: Math.round((original.total || 0) * factor)
    };
  };

  const currentVolunteersData = scaleData(volunteerRegistrationsData, getScaleFactor());

  // Operations Status Color mappings
  const getStatusColor = (status) => {
    const colors = {
      optimal: "bg-emerald-650 text-emerald-650",
      warning: "bg-amber-500 text-amber-500",
      critical: "bg-red-650 text-red-650",
    };
    return colors[status] || colors.optimal;
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header & Filter controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t("admin.analytics.title")}
          </h1>
          <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
            Real-time logistical performance metrics. Analyze volunteers, report rates, and camp supply capacity graphs.
          </p>
        </div>

        {/* Date Filters row */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 p-1 rounded-2xl shadow-sm self-start sm:self-auto select-none">
          {["today", "week", "month", "year"].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all ${
                timeFilter === filter
                  ? "bg-primary text-white shadow-saffron-glow"
                  : "text-slate-500 dark:text-gray-400 hover:text-charcoal dark:hover:text-white"
              }`}
            >
              {t(`admin.analytics.filter_${filter}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Main grids: Charts & operational status progress bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Charts (spans 2) */}
        <div className="lg:col-span-2 space-y-6">
          <ChartCard 
            titleKey="admin.analytics.registrations" 
            type="line" 
            data={currentVolunteersData} 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ChartCard 
              titleKey="admin.analytics.item_distribution" 
              type="donut" 
              data={lostItemReportsData} 
            />
            <ChartCard 
              titleKey="admin.analytics.daily_activities" 
              type="bar" 
              data={dailyActivityTrends} 
            />
          </div>
        </div>

        {/* Right Column: Operational Progress Bars */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5.5 shadow-premium flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-sm font-bold text-charcoal dark:text-white uppercase tracking-wider pb-4 mb-5 border-b border-slate-100 dark:border-gray-850">
              {t("admin.analytics.progress_overview")}
            </h3>

            <div className="space-y-6.5 text-xs font-semibold">
              {campOperationsStatus.map((camp) => (
                <div key={camp.nameKey} className="space-y-2">
                  <div className="flex justify-between items-center text-slate-700 dark:text-gray-300">
                    <span className="truncate pr-4">{t(camp.nameKey)}</span>
                    <span className="font-extrabold font-heading text-charcoal dark:text-white shrink-0">
                      {camp.current}%
                    </span>
                  </div>
                  
                  {/* Progress bar tracks */}
                  <div className="w-full bg-slate-100 dark:bg-gray-850 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        camp.status === 'optimal' 
                          ? 'bg-emerald-650' 
                          : camp.status === 'warning' 
                          ? 'bg-amber-500' 
                          : 'bg-red-650'
                      }`}
                      style={{ width: `${camp.current}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 dark:text-gray-505">
                    <span className="uppercase">{camp.status} Status</span>
                    <span>Target: {camp.target}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-gray-850 mt-6 pt-4.5 flex justify-between items-center text-[10px] text-slate-400 dark:text-gray-500 font-bold">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Auto-updating
            </span>
            <span>Refresh rate: 5s</span>
          </div>

        </div>

      </div>

    </div>
  );
}
