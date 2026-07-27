"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Container from '@/components/Container';
import HeroBanner from '@/components/HeroBanner';
import PersonCard from '@/components/PersonCard';
import { Search, X } from 'lucide-react';

const FILTERS = [
  { key: 'all', labelKey: 'missing_persons_page.filter_all' },
  { key: 'Male', labelKey: 'missing_persons_page.filter_male' },
  { key: 'Female', labelKey: 'missing_persons_page.filter_female' },
  { key: 'Child', labelKey: 'missing_persons_page.filter_child' },
  { key: 'Senior Citizen', labelKey: 'missing_persons_page.filter_senior' },
];

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden">
          <div className="h-44 bg-slate-200 dark:bg-gray-700 animate-pulse" />
          <div className="p-5.5 space-y-3">
            <div className="h-5 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
            <div className="border-t border-slate-50 dark:border-gray-800 pt-4 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-full" />
              <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MissingPersonsPage() {
  const { t } = useLanguage();
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPersons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set('limit', '50');
      if (activeFilter !== 'all') {
        if (activeFilter === 'Child' || activeFilter === 'Senior Citizen') {
          params.set('category', activeFilter);
        } else {
          params.set('category', activeFilter);
        }
      }
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`/api/missing-persons?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load missing persons cases');
      const json = await res.json();
      if (json.success && json.data?.items) {
        setPersons(json.data.items);
      } else {
        setPersons([]);
      }
    } catch (err) {
      setError(err.message);
      setPersons([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, debouncedSearch]);

  useEffect(() => {
    fetchPersons();
  }, [fetchPersons]);

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <HeroBanner
        titleKey="missing_persons_page.title"
        subtitleKey="missing_persons_page.subtitle"
        bgImage="/images/wari_pilgrimage_hero.png"
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-10">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => { setActiveFilter(f.key); setSearch(''); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    activeFilter === f.key
                      ? 'bg-primary text-white shadow-saffron-glow'
                      : 'bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-charcoal-light dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {t(f.labelKey)}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('missing_persons_page.search_placeholder')}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-semibold text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-charcoal dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800">
              <p className="text-red-500 dark:text-red-400 font-semibold">{error}</p>
              <p className="text-sm text-charcoal-light dark:text-gray-400 mt-2">
                {t('common.try_refresh') || 'Please try refreshing the page.'}
              </p>
              <button
                onClick={fetchPersons}
                className="mt-4 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all"
              >
                {t('common.retry') || 'Retry'}
              </button>
            </div>
          ) : persons.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                <Search className="w-7 h-7 text-slate-400 dark:text-gray-500" />
              </div>
              <p className="text-lg font-heading font-extrabold text-charcoal dark:text-white">
                {t('missing_persons_page.no_results')}
              </p>
              <p className="text-sm text-charcoal-light dark:text-gray-400 mt-2">
                {t('missing_persons_page.no_results_desc')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {persons.map((person) => (
                <PersonCard key={person.caseId || person._id} person={person} />
              ))}
            </div>
          )}

          {!loading && !error && persons.length > 0 && (
            <p className="text-center text-xs text-slate-400 dark:text-gray-500 mt-10 font-semibold">
              Showing {persons.length} case{persons.length !== 1 ? 's' : ''}
            </p>
          )}
        </Container>
      </section>
    </div>
  );
}
