"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Container from '@/components/Container';
import StatusBadge from '@/components/StatusBadge';
import { Search, X, Plus, MapPin, Calendar, ArrowRight, Package, Smartphone, Wallet, FileText, Briefcase, Footprints, Gem, HelpCircle, Shirt, Key, Laptop } from 'lucide-react';
import Link from 'next/link';

const FILTERS = [
  { key: 'all', labelKey: 'volunteer_lost_items.filter_all' },
  { key: 'Waiting', labelKey: 'volunteer_lost_items.filter_waiting' },
  { key: 'Returned', labelKey: 'volunteer_lost_items.filter_returned' },
];

const CATEGORY_GRADIENTS = {
  'Mobile': 'from-blue-500 to-indigo-600',
  'Wallet': 'from-amber-600 to-orange-700',
  'Bag': 'from-slate-700 to-slate-900',
  'Documents': 'from-red-500 to-rose-600',
  'Jewelry': 'from-gray-400 to-slate-500',
  'Shoes': 'from-amber-700 to-yellow-800',
  'Clothing': 'from-purple-500 to-violet-600',
  'Electronics': 'from-cyan-500 to-blue-600',
  'Keys': 'from-yellow-500 to-amber-600',
  'Other': 'from-zinc-500 to-neutral-600',
};

const CATEGORY_ICONS = {
  mobile: Smartphone,
  wallet: Wallet,
  bag: Briefcase,
  documents: FileText,
  jewelry: Gem,
  shoes: Footprints,
  clothing: Shirt,
  electronics: Laptop,
  keys: Key,
  other: HelpCircle,
};

function formatDate(dateInput) {
  if (!dateInput) return '';
  try {
    return new Date(dateInput).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return dateInput;
  }
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden">
          <div className="h-40 bg-slate-200 dark:bg-gray-700 animate-pulse" />
          <div className="p-5 space-y-3">
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

function LostItemCard({ item }) {
  const { t } = useLanguage();
  const displayId = item.itemId || item._id;
  const itemType = item.itemType || item.name || 'Unknown';
  const normCat = (item.itemType || item.category || '').toLowerCase();
  const Icon = CATEGORY_ICONS[normCat] || HelpCircle;
  const gradient = CATEGORY_GRADIENTS[item.itemType || item.category] || 'from-slate-500 to-slate-650';
  const location = item.foundLocation || item.locationFound || '';
  const date = formatDate(item.dateReported);

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-350 hover:-translate-y-1 flex flex-col justify-between">
      <div>
        {item.photoUrl ? (
          <div className="relative h-40 overflow-hidden">
            <img src={item.photoUrl} alt={itemType} className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 z-10">
              <StatusBadge status={item.status} />
            </div>
            <div className="absolute bottom-4 left-4 text-white">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-black/35 rounded-md backdrop-blur-sm">
                ID: {displayId}
              </span>
            </div>
          </div>
        ) : (
          <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <div className="absolute top-4 right-4 z-10">
              <StatusBadge status={item.status} />
            </div>
            <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
              <Icon className="w-7 h-7" />
            </div>
            <div className="absolute bottom-4 left-4 text-white">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-black/35 rounded-md backdrop-blur-sm">
                ID: {displayId}
              </span>
            </div>
          </div>
        )}

        <div className="p-5 text-left">
          <h3 className="font-heading text-lg font-extrabold text-charcoal dark:text-white tracking-tight group-hover:text-primary transition-colors duration-250">
            {itemType}
          </h3>

          <div className="flex flex-wrap gap-2 mt-2">
            {item.brand && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-gray-800 text-charcoal-light dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                {item.brand}
              </span>
            )}
            {item.color && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-gray-800 text-charcoal-light dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                {item.color}
              </span>
            )}
          </div>

          <div className="mt-5 space-y-2.5 border-t border-slate-50 dark:border-gray-800 pt-4 text-xs font-semibold text-charcoal-light dark:text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary/70 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-secondary/70 flex-shrink-0" />
              <span>{date}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <Link
          href={`/volunteer/lost-items/${encodeURIComponent(displayId)}`}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-bold text-charcoal dark:text-white hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 transform active:scale-95 group/btn focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <span>{t('volunteer_lost_items.btn_view_details')}</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-250 group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

export default function VolunteerLostItemsPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set('limit', '50');
      if (activeFilter !== 'all') {
        params.set('status', activeFilter);
      }
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`/api/volunteer/lost-items?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load lost items');
      const json = await res.json();
      if (json.success && json.data?.items) {
        setItems(json.data.items);
      } else {
        setItems([]);
      }
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, debouncedSearch]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <section className="relative min-h-[30vh] md:min-h-[35vh] flex flex-col justify-center py-16 overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600">
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
        <Container className="relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white text-xs font-semibold mb-6">
            <Link href="/volunteer/dashboard" className="hover:text-white/80 transition-colors">{t('nav.home')}</Link>
            <span>/</span>
            <span className="font-bold">{t('volunteer_lost_items.title')}</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
            {t('volunteer_lost_items.title')}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/80 max-w-xl leading-relaxed">
            {t('volunteer_lost_items.subtitle')}
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
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

            <div className="flex items-center gap-3">
              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('volunteer_lost_items.search_placeholder')}
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

              <Link
                href="/volunteer/lost-items/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-saffron-glow hover:shadow-lg whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                {t('volunteer_lost_items.btn_add_new')}
              </Link>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800">
              <p className="text-red-500 dark:text-red-400 font-semibold">{error}</p>
              <p className="text-sm text-charcoal-light dark:text-gray-400 mt-2">
                {t('common.try_refresh')}
              </p>
              <button
                onClick={fetchItems}
                className="mt-4 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all"
              >
                {t('common.retry')}
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                <Package className="w-7 h-7 text-slate-400 dark:text-gray-500" />
              </div>
              <p className="text-lg font-heading font-extrabold text-charcoal dark:text-white">
                {t('volunteer_lost_items.no_results')}
              </p>
              <p className="text-sm text-charcoal-light dark:text-gray-400 mt-2">
                {t('volunteer_lost_items.no_results_desc')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {items.map((item) => (
                <LostItemCard key={item.itemId || item._id} item={item} />
              ))}
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <p className="text-center text-xs text-slate-400 dark:text-gray-500 mt-10 font-semibold">
              {t('volunteer_lost_items.items_count', { count: items.length, plural: items.length !== 1 ? 's' : '' })}
            </p>
          )}
        </Container>
      </section>
    </div>
  );
}
