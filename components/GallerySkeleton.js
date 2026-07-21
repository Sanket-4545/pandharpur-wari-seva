"use client";

import React from 'react';

export default function GallerySkeleton({ count = 6 }) {
  const shimmer = "animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl overflow-hidden shadow-premium">
          <div className={`h-48 w-full ${shimmer}`} />
          <div className="p-4 space-y-2">
            <div className={`h-3 w-16 ${shimmer}`} />
            <div className={`h-4 w-3/4 ${shimmer}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
