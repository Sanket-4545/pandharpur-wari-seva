"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Container from '@/components/Container';
import HeroBanner from '@/components/HeroBanner';
import ActivityCard from '@/components/ActivityCard';
import EmptyState from '@/components/EmptyState';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden">
          <div className="aspect-[4/3] bg-slate-200 dark:bg-gray-700 animate-pulse" />
          <div className="p-4.5 border-t border-slate-50 dark:border-gray-800 space-y-3">
            <div className="h-6 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
            <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-full" />
            <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
            <div className="pt-4 border-t border-slate-50 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-24" />
                <div className="h-8 bg-primary/10 dark:bg-primary-dark/20 rounded-xl animate-pulse w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NssActivitiesPage() {
  const { t } = useLanguage();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/nss-activities?page=${currentPage}&limit=${itemsPerPage}`);
      if (!res.ok) throw new Error('Failed to load activities');
      const json = await res.json();
      if (json.success && json.data?.items) {
        const mappedItems = json.data.items.map((item) => ({
          ...item,
          id: item.activityId,
        }));
        setActivities(mappedItems);
        setTotalPages(json.data?.pagination?.totalPages || 1);
      } else {
        setActivities([]);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.message);
      setActivities([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const candidates = [1, currentPage - 1, currentPage, currentPage + 1, totalPages]
      .filter((p) => p >= 1 && p <= totalPages)
      .filter((p, i, arr) => arr.indexOf(p) === i)
      .sort((a, b) => a - b);
    const result = [];
    candidates.forEach((p, i) => {
      if (i > 0 && p - candidates[i - 1] > 1) result.push('...');
      result.push(p);
    });
    return result;
  };

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <HeroBanner 
        titleKey="public.activities.title" 
        subtitleKey="public.activities.subtitle"
        bgImage="/images/nss_volunteers_seva.png"
      />

      <section className="py-12 md:py-16">
        <Container>
          {/* Grid Layout */}
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <p className="text-sm text-charcoal-light dark:text-gray-400 mt-2">
                {t("public.activities.error_retry_desc")}
              </p>
              <button
                onClick={fetchActivities}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold transition-all shadow-saffron-glow focus:outline-none"
              >
                <RefreshCw className="w-4 h-4" />
                {t("public.activities.retry")}
              </button>
            </div>
          ) : activities.length === 0 ? (
            <EmptyState
              icon={function CalendarIcon() { return React.createElement('svg', { className: "w-7 h-7", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" })); }}
              titleKey="public.activities.empty_title"
              descKey="public.activities.empty_desc"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-12 select-none">
              {/* Prev Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800 text-charcoal dark:text-gray-300 hover:text-primary transition-all disabled:opacity-50 disabled:pointer-events-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={t('public.activities.prev')}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Number Pages */}
              {getPageNumbers().map((entry, idx) => {
                if (entry === '...') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-11 h-11 flex items-center justify-center text-sm font-bold text-slate-400 dark:text-gray-500 select-none"
                    >
                      ...
                    </span>
                  );
                }
                const isActive = currentPage === entry;
                return (
                  <button
                    key={entry}
                    onClick={() => handlePageChange(entry)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-11 h-11 rounded-xl font-heading font-bold text-sm transition-all duration-300 min-w-[44px] min-h-[44px] ${
                      isActive 
                        ? 'bg-primary text-white shadow-saffron-glow' 
                        : 'bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-charcoal-light dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {entry}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800 text-charcoal dark:text-gray-300 hover:text-primary transition-all disabled:opacity-50 disabled:pointer-events-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={t('public.activities.next')}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}