"use client";

import React from 'react';

/**
 * LoadingSkeleton - Reusable animated skeleton loader for the admin dashboard.
 * Renders pulsing placeholder blocks matching common admin UI layouts.
 * 
 * Props:
 *  - type: 'card' | 'table' | 'stat' | 'text' | 'chart'  (default: 'card')
 *  - count: how many skeleton blocks to render           (default: 1)
 */
export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  const shimmer = "animate-pulse bg-slate-200 dark:bg-gray-800 rounded-xl";

  const renderStatSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-grow">
          <div className={`h-3 w-24 ${shimmer}`} />
          <div className={`h-7 w-16 ${shimmer}`} />
        </div>
        <div className={`w-11 h-11 rounded-2xl ${shimmer}`} />
      </div>
      <div className={`mt-4 h-5 w-20 ${shimmer}`} />
    </div>
  );

  const renderCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium space-y-4">
      <div className={`h-4 w-3/4 ${shimmer}`} />
      <div className={`h-3 w-full ${shimmer}`} />
      <div className={`h-3 w-5/6 ${shimmer}`} />
      <div className={`h-3 w-2/3 ${shimmer}`} />
      <div className={`h-9 w-32 mt-4 rounded-2xl ${shimmer}`} />
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium space-y-4">
      {/* Table toolbar */}
      <div className="flex gap-3">
        <div className={`h-9 flex-grow max-w-xs rounded-2xl ${shimmer}`} />
        <div className={`h-9 w-32 rounded-2xl ${shimmer}`} />
        <div className={`h-9 w-24 rounded-2xl ${shimmer}`} />
      </div>
      {/* Table header */}
      <div className={`h-10 w-full rounded-xl ${shimmer}`} />
      {/* Table rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className={`w-4 h-4 rounded ${shimmer}`} />
          <div className={`h-4 flex-grow rounded-lg ${shimmer}`} />
          <div className={`h-4 w-20 rounded-lg ${shimmer}`} />
          <div className={`h-4 w-16 rounded-lg ${shimmer}`} />
          <div className={`h-6 w-16 rounded-lg ${shimmer}`} />
          <div className={`h-6 w-6 rounded-lg ${shimmer}`} />
        </div>
      ))}
      {/* Pagination */}
      <div className={`h-8 w-48 ml-auto rounded-xl ${shimmer}`} />
    </div>
  );

  const renderChartSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium space-y-4">
      <div className={`h-4 w-40 ${shimmer}`} />
      <div className={`h-44 w-full rounded-2xl ${shimmer}`} />
      <div className="flex gap-2 justify-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`h-3 w-12 ${shimmer}`} />
        ))}
      </div>
    </div>
  );

  const renderTextSkeleton = () => (
    <div className="space-y-2">
      <div className={`h-4 w-full ${shimmer}`} />
      <div className={`h-4 w-5/6 ${shimmer}`} />
      <div className={`h-4 w-4/6 ${shimmer}`} />
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'stat':    return renderStatSkeleton();
      case 'table':   return renderTableSkeleton();
      case 'chart':   return renderChartSkeleton();
      case 'text':    return renderTextSkeleton();
      case 'card':
      default:        return renderCardSkeleton();
    }
  };

  if (count === 1) return renderSkeleton();

  return (
    <div className={`grid gap-5 ${
      type === 'stat' 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
        : 'grid-cols-1'
    }`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}
