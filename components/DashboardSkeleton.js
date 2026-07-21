"use client";

import React from 'react';

export default function DashboardSkeleton() {
  const shimmer = "animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl";

  return (
    <div className="space-y-7">
      {/* Header banner skeleton */}
      <div className={`h-44 w-full rounded-3xl ${shimmer}`} />

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium space-y-3">
            <div className="flex items-start justify-between">
              <div className={`h-3 w-24 ${shimmer}`} />
              <div className={`w-11 h-11 rounded-2xl ${shimmer}`} />
            </div>
            <div className={`h-7 w-16 ${shimmer}`} />
            <div className={`h-4 w-20 ${shimmer}`} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium space-y-4">
            <div className={`h-4 w-40 ${shimmer}`} />
            <div className={`h-44 w-full rounded-2xl ${shimmer}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
