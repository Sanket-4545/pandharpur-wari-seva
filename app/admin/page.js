"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { dashboardStats, recentActivities } from '@/data/dashboard';
import { volunteerRegistrationsData, dailyActivityTrends } from '@/data/analytics';
import DashboardCard from '@/components/DashboardCard';
import ChartCard from '@/components/ChartCard';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import { ArrowRight, Bell, Calendar, Flame, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const [activities, setActivities] = useState(recentActivities);

  // Return helper for activity icon/color configurations
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
    // Return nice simulation strings
    const diffMins = Math.floor((new Date() - new Date(timestamp)) / 60000);
    if (isNaN(diffMins)) return "10 mins ago";
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="space-y-7">
      
      {/* Dynamic Welcome Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-secondary to-blue-800 dark:from-gray-900 dark:to-slate-800 text-white p-6 sm:p-8 shadow-premium relative overflow-hidden">
        {/* Abstract background shape overlays */}
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
            <span>17th July 2026</span>
          </div>
        </div>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {dashboardStats.map((stat) => (
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

      {/* Analytics Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          titleKey="admin.analytics.registrations" 
          type="line" 
          data={volunteerRegistrationsData} 
        />
        <ChartCard 
          titleKey="admin.analytics.daily_activities" 
          type="bar" 
          data={dailyActivityTrends} 
        />
      </div>

      {/* Recent activity log & quick notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Activity Log Timeline (spans 2 cols) */}
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

            {/* Timeline */}
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity) => {
                // Formatting title by replacing parameters manually to prevent runtime exceptions
                let title = t(activity.titleKey);
                if (activity.titleArgs) {
                  Object.entries(activity.titleArgs).forEach(([k, v]) => {
                    title = title.replace(`{${k}}`, v);
                  });
                }

                return (
                  <div key={activity.id} className="flex gap-4 items-start relative group">
                    {/* Circle icon marker */}
                    <div className={`w-8.5 h-8.5 rounded-xl border flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm ${getActivityStyles(activity.type)}`}>
                      {activity.type.charAt(0).toUpperCase()}
                    </div>
                    {/* Text content details */}
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

        {/* Right Column: Active alerts reminders */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-850 pb-4 mb-4">
              <h3 className="font-heading text-sm font-bold text-charcoal dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4.5 h-4.5 text-primary" />
                Administrative Notices
              </h3>
            </div>

            <div className="space-y-3.5">
              <div className="p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] bg-red-100 dark:bg-red-950 text-red-650 dark:text-red-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    High Priority
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-gray-500 font-semibold">14:00</span>
                </div>
                <h5 className="mt-1.5 text-xs font-extrabold text-charcoal dark:text-white leading-tight">
                  {t("admin.announcements.heavy_rain_title")}
                </h5>
                <p className="mt-1 text-[10px] text-charcoal-light dark:text-gray-400 leading-normal">
                  Coordinators at Sector 4 to initiate dynamic shelter transfers.
                </p>
              </div>

              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-650 dark:text-amber-450 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    Medium Priority
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-gray-500 font-semibold">10:30</span>
                </div>
                <h5 className="mt-1.5 text-xs font-extrabold text-charcoal dark:text-white leading-tight">
                  {t("admin.announcements.palkhi_route_title")}
                </h5>
                <p className="mt-1 text-[10px] text-charcoal-light dark:text-gray-400 leading-normal">
                  Mud on route delay. Group leaders to update shifts timing schedules.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-gray-850 mt-5 pt-4">
            <Link
              href="/admin/announcements"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-primary-light hover:text-primary-dark hover:underline focus:outline-none"
            >
              Manage Announcements
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
