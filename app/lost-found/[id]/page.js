"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Container from '@/components/Container';
import StatusBadge from '@/components/StatusBadge';
import { ArrowLeft, MapPin, Calendar, AlertCircle, Tag, FileText, ShieldCheck, Share2 } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_GRADIENTS = {
  'Mobile': 'from-blue-500 to-indigo-600',
  'Wallet': 'from-amber-600 to-orange-700',
  'ID Card': 'from-sky-500 to-blue-600',
  'Bag': 'from-slate-700 to-slate-900',
  'Jewelry': 'from-gray-400 to-slate-500',
  'Documents': 'from-red-500 to-rose-600',
  'Shoes': 'from-amber-700 to-yellow-800',
  'Other': 'from-zinc-500 to-neutral-600',
};

function formatDate(dateInput) {
  if (!dateInput) return 'N/A';
  try {
    return new Date(dateInput).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return dateInput;
  }
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 pb-20">
      <div className="animate-pulse">
        <div className="h-[35vh] bg-slate-200 dark:bg-gray-800" />
        <Container>
          <div className="-mt-20 relative z-10 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-8 max-w-3xl mx-auto space-y-6">
              <div className="h-8 bg-slate-200 dark:bg-gray-700 rounded w-2/3 mx-auto" />
              <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-1/3 mx-auto" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-slate-200 dark:bg-gray-700 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

export default function LostItemDetailPage({ params }) {
  const { t } = useLanguage();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemId = params.id;

  useEffect(() => {
    async function fetchItem() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/lost-items/${encodeURIComponent(itemId)}`);
        if (res.status === 404) {
          setError('NOT_FOUND');
          return;
        }
        if (!res.ok) throw new Error('Failed to load item details');
        const json = await res.json();
        if (json.success && json.data) {
          setItem(json.data);
        } else {
          setError('NOT_FOUND');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchItem();
  }, [itemId]);

  if (loading) return <LoadingState />;

  if (error === 'NOT_FOUND' || !item) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center pb-20">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-heading text-xl font-extrabold text-charcoal dark:text-white">
            {t('not_found.title') || 'Item Not Found'}
          </h2>
          <p className="text-sm text-charcoal-light dark:text-gray-400 mt-2">
            {t('not_found.desc') || 'The item you are looking for does not exist or has been removed.'}
          </p>
          <Link
            href="/lost-found"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('lost_details_page.btn_back')}
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center pb-20">
        <div className="text-center max-w-md mx-auto p-8">
          <p className="text-red-500 dark:text-red-400 font-semibold">{error}</p>
          <Link
            href="/lost-found"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('lost_details_page.btn_back')}
          </Link>
        </div>
      </div>
    );
  }

  const gradient = CATEGORY_GRADIENTS[item.category] || 'from-slate-500 to-slate-650';

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <section className={`relative min-h-[30vh] md:min-h-[35vh] flex flex-col justify-center py-16 overflow-hidden bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />

        <Container className="relative z-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
            <Tag className="w-8 h-8" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-4">
            {item.name}
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="px-3 py-1 rounded-lg bg-white/15 backdrop-blur-sm text-white text-xs font-bold">
              {item.category}
            </span>
            <StatusBadge status={item.status} />
          </div>
          <p className="text-white/70 text-sm mt-3 font-semibold">
            {t('lost_details_page.subtitle')}
          </p>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="max-w-3xl mx-auto">
            <Link
              href="/lost-found"
              className="inline-flex items-center gap-2 text-xs font-bold text-charcoal-light dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
              {t('lost_details_page.btn_back')}
            </Link>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-premium">
              <div className="p-6 sm:p-8">
                <h2 className="font-heading text-xl font-extrabold text-charcoal dark:text-white mb-6">
                  {t('lost_details_page.details_header')}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailCard
                    icon={<Tag className="w-4 h-4 text-primary" />}
                    label={t('lost_found_page.category')}
                    value={item.category || 'N/A'}
                  />
                  <DetailCard
                    icon={<Calendar className="w-4 h-4 text-secondary" />}
                    label={t('lost_details_page.found_date')}
                    value={formatDate(item.dateReported || item.date)}
                  />
                  <DetailCard
                    icon={<MapPin className="w-4 h-4 text-primary" />}
                    label={t('lost_details_page.found_location')}
                    value={item.locationFound || item.locationKey || item.location || 'N/A'}
                    spanFull
                  />
                  <DetailCard
                    icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
                    label={t('lost_details_page.status')}
                    value={<StatusBadge status={item.status} />}
                    spanFull
                  />
                </div>

                {item.description && (
                  <div className="mt-6 p-4 bg-slate-50 dark:bg-gray-850 border border-slate-100 dark:border-gray-800 rounded-xl">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-extrabold text-charcoal-light dark:text-gray-400 uppercase tracking-wider">
                          {t('lost_details_page.description')}
                        </h4>
                        <p className="text-sm font-semibold text-charcoal dark:text-white mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <Link
                href="/lost-found"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-bold text-charcoal dark:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('lost_details_page.btn_back')}
              </Link>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: item.name,
                      text: `${item.name} - ${item.category}`,
                      url: window.location.href,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                      .then(() => alert(t('missing_details_page.copied_link') || 'Link copied to clipboard!'))
                      .catch(() => {});
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all"
              >
                <Share2 className="w-4 h-4" />
                {t('missing_details_page.btn_share')}
              </button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

function DetailCard({ icon, label, value, spanFull }) {
  return (
    <div className={`p-4 bg-slate-50 dark:bg-gray-850 rounded-xl border border-slate-100 dark:border-gray-800 ${spanFull ? 'sm:col-span-2' : ''}`}>
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="font-bold text-sm text-charcoal dark:text-white ml-6">
        {value}
      </div>
    </div>
  );
}
