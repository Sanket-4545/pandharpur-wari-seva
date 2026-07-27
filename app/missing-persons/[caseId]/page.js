"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Container from '@/components/Container';
import StatusBadge from '@/components/StatusBadge';
import { ArrowLeft, MapPin, Calendar, Phone, AlertCircle, Ruler, Shirt, Share2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_GRADIENTS = {
  'Senior Citizen': 'from-amber-500 to-orange-650',
  'Child': 'from-pink-500 to-rose-600',
  'Female': 'from-emerald-500 to-teal-600',
  'Male': 'from-sky-500 to-blue-600',
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
        <div className="h-[40vh] bg-slate-200 dark:bg-gray-800" />
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

export default function MissingPersonDetailPage({ params }) {
  const { t } = useLanguage();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const caseId = params.caseId;

  useEffect(() => {
    async function fetchCase() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/missing-persons/${encodeURIComponent(caseId)}`);
        if (res.status === 404) {
          setError('NOT_FOUND');
          return;
        }
        if (!res.ok) throw new Error('Failed to load case details');
        const json = await res.json();
        if (json.success && json.data) {
          setPerson(json.data);
        } else {
          setError('NOT_FOUND');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCase();
  }, [caseId]);

  if (loading) return <LoadingState />;

  if (error === 'NOT_FOUND' || !person) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center pb-20">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-heading text-xl font-extrabold text-charcoal dark:text-white">
            {t('not_found.title') || 'Case Not Found'}
          </h2>
          <p className="text-sm text-charcoal-light dark:text-gray-400 mt-2">
            {t('not_found.desc') || 'The missing person case you are looking for does not exist or has been removed.'}
          </p>
          <Link
            href="/missing-persons"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('missing_details_page.btn_back')}
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
            href="/missing-persons"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('missing_details_page.btn_back')}
          </Link>
        </div>
      </div>
    );
  }

  const gradient = CATEGORY_GRADIENTS[person.category] || 'from-slate-400 to-slate-650';

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <section className={`relative min-h-[30vh] md:min-h-[35vh] flex flex-col justify-center py-16 overflow-hidden bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />

        <Container className="relative z-10 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-3xl font-heading font-extrabold select-none mb-4">
            {person.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {person.name}
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="px-3 py-1 rounded-lg bg-white/15 backdrop-blur-sm text-white text-xs font-bold">
              {person.category}
            </span>
            <StatusBadge status={person.status} />
          </div>
          <p className="text-white/70 text-sm mt-3 font-semibold">
            {t('missing_details_page.subtitle')}
          </p>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="max-w-3xl mx-auto">
            <Link
              href="/missing-persons"
              className="inline-flex items-center gap-2 text-xs font-bold text-charcoal-light dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
              {t('missing_details_page.btn_back')}
            </Link>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-premium">
              <div className="p-6 sm:p-8">
                <h2 className="font-heading text-xl font-extrabold text-charcoal dark:text-white mb-6">
                  {t('missing_details_page.details_header')}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailCard
                    icon={<Ruler className="w-4 h-4 text-primary" />}
                    label={t('missing_details_page.height')}
                    value={person.height || 'N/A'}
                  />
                  <DetailCard
                    icon={<Shirt className="w-4 h-4 text-secondary" />}
                    label={t('missing_details_page.clothing')}
                    value={person.clothing || 'N/A'}
                  />
                  <DetailCard
                    icon={<Calendar className="w-4 h-4 text-primary" />}
                    label={t('missing_details_page.last_seen_date')}
                    value={formatDate(person.dateReported)}
                  />
                  <DetailCard
                    icon={<MapPin className="w-4 h-4 text-secondary" />}
                    label={t('missing_persons_page.location_label')}
                    value={person.lastSeenLocation || 'N/A'}
                  />
                  <DetailCard
                    icon={<AlertCircle className="w-4 h-4 text-red-500" />}
                    label={t('missing_details_page.status')}
                    value={<StatusBadge status={person.status} />}
                    spanFull
                  />
                </div>

                {person.emergencyNotice && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-extrabold text-red-700 dark:text-red-400 uppercase tracking-wider">
                          {t('missing_details_page.emergency_notice')}
                        </h4>
                        <p className="text-sm font-semibold text-red-600 dark:text-red-300 mt-1 leading-relaxed">
                          {person.emergencyNotice}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-gray-800 p-6 sm:p-8 bg-slate-50/50 dark:bg-gray-900/50">
                <h3 className="font-heading text-lg font-extrabold text-charcoal dark:text-white mb-4">
                  {t('missing_details_page.contact_info_title')}
                </h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                        {t('missing_details_page.contact_info_title')}
                      </p>
                      <p className="font-bold text-charcoal dark:text-white text-sm">
                        {person.contactPhone || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="sm:ml-auto">
                    <a
                      href={`tel:${person.contactPhone}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      {t('missing_persons_page.btn_view_details') || 'Call'}
                    </a>
                  </div>
                </div>
                <p className="text-xs text-slate-400 dark:text-gray-500 mt-4 leading-relaxed">
                  {t('missing_details_page.notice_desc')}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <Link
                href="/missing-persons"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-bold text-charcoal dark:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('missing_details_page.btn_back')}
              </Link>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: person.name,
                      text: `${person.name} - ${person.category}`,
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
