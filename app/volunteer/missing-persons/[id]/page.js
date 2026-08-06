"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import Container from '@/components/Container';
import StatusBadge from '@/components/StatusBadge';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import Toast from '@/components/Toast';
import LoadingButton from '@/components/LoadingButton';
import { ArrowLeft, MapPin, Calendar, UserX, User, Clock, CheckCircle, Phone, Ruler, Shirt } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_GRADIENTS = {
  'Child': 'from-pink-500 to-rose-600',
  'Senior Citizen': 'from-slate-500 to-gray-600',
  'Male': 'from-blue-600 to-indigo-700',
  'Female': 'from-purple-500 to-pink-600',
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

function formatDateTime(dateInput) {
  if (!dateInput) return 'N/A';
  try {
    return new Date(dateInput).toLocaleString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateInput;
  }
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

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 pb-20">
      <div className="animate-pulse">
        <div className="h-[30vh] bg-slate-200 dark:bg-gray-800" />
        <Container>
          <div className="-mt-16 relative z-10 space-y-6">
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

export default function VolunteerMissingPersonDetailPage({ params }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFoundDialog, setShowFoundDialog] = useState(false);
  const [markingFound, setMarkingFound] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const caseId = params.id;

  useEffect(() => {
    async function fetchPerson() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/volunteer/missing-persons/${encodeURIComponent(caseId)}`);
        if (res.status === 404) {
          setError('NOT_FOUND');
          return;
        }
        if (!res.ok) throw new Error('Failed to load person details');
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
    fetchPerson();
  }, [caseId]);

  const handleMarkFound = async () => {
    setMarkingFound(true);
    try {
      const res = await fetch(`/api/volunteer/missing-persons/${encodeURIComponent(caseId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Found' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update status');
      setPerson(prev => ({ ...prev, status: 'Found' }));
      setToast({ message: t('volunteer_missing_persons.mark_found_success'), type: 'success', visible: true });
    } catch (err) {
      setToast({ message: err.message || t('volunteer_missing_persons.mark_found_error'), type: 'error', visible: true });
    } finally {
      setMarkingFound(false);
    }
  };

  if (loading) return <LoadingState />;

  if (error === 'NOT_FOUND' || !person) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center pb-20">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
            <UserX className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-heading text-xl font-extrabold text-charcoal dark:text-white">
            {t('not_found.title') || 'Person Not Found'}
          </h2>
          <p className="text-sm text-charcoal-light dark:text-gray-400 mt-2">
            The missing person you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/volunteer/missing-persons"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('volunteer_missing_persons.btn_back')}
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
            href="/volunteer/missing-persons"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('volunteer_missing_persons.btn_back')}
          </Link>
        </div>
      </div>
    );
  }

  const name = person.name || 'Unknown';
  const normCat = (person.category || '').toLowerCase().replace(/\s+/g, '_');
  const gradient = CATEGORY_GRADIENTS[person.category] || 'from-red-500 to-rose-600';

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <section className={`relative min-h-[30vh] md:min-h-[35vh] flex flex-col justify-center py-16 overflow-hidden bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />

        <Container className="relative z-10 text-center">
          {person.photoUrl ? (
            <img src={person.photoUrl} alt={name} className="w-20 h-20 mx-auto rounded-full object-cover border-4 border-white/30 mb-4" />
          ) : (
            <div className="w-20 h-20 mx-auto rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-3xl font-heading font-extrabold select-none mb-4">
              <UserX className="w-10 h-10" />
            </div>
          )}
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {name}
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="px-3 py-1 rounded-lg bg-white/15 backdrop-blur-sm text-white text-xs font-bold">
              {person.caseId}
            </span>
            <StatusBadge status={person.status} />
          </div>
          <p className="text-white/70 text-sm mt-3 font-semibold">
            {t('volunteer_missing_persons.detail_subtitle')}
          </p>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="max-w-3xl mx-auto">
            <Link
              href="/volunteer/missing-persons"
              className="inline-flex items-center gap-2 text-xs font-bold text-charcoal-light dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
              {t('volunteer_missing_persons.btn_back')}
            </Link>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-premium">
              <div className="p-6 sm:p-8">
                <h2 className="font-heading text-xl font-extrabold text-charcoal dark:text-white mb-6">
                  {t('volunteer_missing_persons.detail_title')}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailCard
                    icon={<User className="w-4 h-4 text-primary" />}
                    label={t('volunteer_missing_persons.name_label')}
                    value={person.name || 'N/A'}
                  />
                  <DetailCard
                    icon={<Clock className="w-4 h-4 text-secondary" />}
                    label={t('volunteer_missing_persons.age_label')}
                    value={person.age ? `${person.age} years` : 'N/A'}
                  />
                  <DetailCard
                    icon={<UserX className="w-4 h-4 text-primary" />}
                    label={t('volunteer_missing_persons.gender_label')}
                    value={person.gender || 'N/A'}
                  />
                  <DetailCard
                    icon={<User className="w-4 h-4 text-secondary" />}
                    label={t('volunteer_missing_persons.category_label')}
                    value={person.category || 'N/A'}
                  />
                  <DetailCard
                    icon={<MapPin className="w-4 h-4 text-primary" />}
                    label={t('volunteer_missing_persons.last_seen_location_label')}
                    value={person.lastSeenLocation || 'N/A'}
                    spanFull
                  />
                  <DetailCard
                    icon={<Phone className="w-4 h-4 text-secondary" />}
                    label={t('volunteer_missing_persons.contact_phone_label')}
                    value={person.contactPhone || 'N/A'}
                  />
                  {person.height && (
                    <DetailCard
                      icon={<Ruler className="w-4 h-4 text-primary" />}
                      label={t('volunteer_missing_persons.height_label')}
                      value={person.height}
                    />
                  )}
                  {person.clothing && (
                    <DetailCard
                      icon={<Shirt className="w-4 h-4 text-secondary" />}
                      label={t('volunteer_missing_persons.clothing_label')}
                      value={person.clothing}
                    />
                  )}
                  <DetailCard
                    icon={<Clock className="w-4 h-4 text-secondary" />}
                    label={t('volunteer_missing_persons.created_time')}
                    value={formatDateTime(person.createdAt || person.dateReported)}
                  />
                  <DetailCard
                    icon={<StatusBadge status={person.status} />}
                    label={t('volunteer_missing_persons.status_label')}
                    value={<StatusBadge status={person.status} />}
                    spanFull
                  />
                </div>

                {person.description && (
                  <div className="mt-6 p-4 bg-slate-50 dark:bg-gray-850 rounded-xl border border-slate-100 dark:border-gray-800">
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                      {t('volunteer_missing_persons.description_label')}
                    </span>
                    <p className="text-sm font-semibold text-charcoal dark:text-white mt-1 leading-relaxed">
                      {person.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {person.status === 'Missing' && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Link
                  href="/volunteer/missing-persons"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-bold text-charcoal dark:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('volunteer_missing_persons.btn_back')}
                </Link>
                <LoadingButton
                  onClick={() => setShowFoundDialog(true)}
                  loading={markingFound}
                  variant="primary"
                >
                  <CheckCircle className="w-4 h-4" />
                  {t('volunteer_missing_persons.btn_mark_found')}
                </LoadingButton>
              </div>
            )}

            {person.status === 'Found' && (
              <div className="flex items-center justify-center mt-8">
                <Link
                  href="/volunteer/missing-persons"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-bold text-charcoal dark:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('volunteer_missing_persons.btn_back')}
                </Link>
              </div>
            )}
          </div>
        </Container>
      </section>

      <ConfirmationDialog
        isOpen={showFoundDialog}
        onClose={() => setShowFoundDialog(false)}
        onConfirm={handleMarkFound}
        title={t('volunteer_missing_persons.mark_found_title')}
        message={t('volunteer_missing_persons.mark_found_confirm')}
        confirmLabel={t('volunteer_missing_persons.btn_mark_found')}
        cancelLabel={t('volunteer_missing_persons.btn_cancel')}
        variant="success"
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
