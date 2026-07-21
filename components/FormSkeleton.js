"use client";

import React from 'react';

export default function FormSkeleton({ fields = 4 }) {
  const shimmer = "animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl";

  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-premium space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className={`h-3 w-24 ${shimmer}`} />
          <div className={`h-11 w-full ${shimmer}`} />
        </div>
      ))}
      <div className={`h-11 w-40 ${shimmer}`} />
    </div>
  );
}
