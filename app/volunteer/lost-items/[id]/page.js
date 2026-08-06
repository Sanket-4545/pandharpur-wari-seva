"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import Container from '@/components/Container';
import StatusBadge from '@/components/StatusBadge';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import Toast from '@/components/Toast';
import LoadingButton from '@/components/LoadingButton';
import { ArrowLeft, MapPin, Calendar, Package, User, Clock, CheckCircle, Smartphone, Wallet, FileText, Briefcase, Footprints, Gem, HelpCircle, Shirt, Key, Laptop } from 'lucide-react';
import Link from 'next/link';

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

export default function VolunteerLostItemDetailPage({ params }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [markingReturned, setMarkingReturned] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const itemId = params.id;

  useEffect(() => {
    async function fetchItem() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/volunteer/lost-items/${encodeURIComponent(itemId)}`);
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

  const handleMarkReturned = async () => {
    setMarkingReturned(true);
    try {
      const res = await fetch(`/api/volunteer/lost-items/${encodeURIComponent(itemId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Returned' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update status');
      setItem(prev => ({ ...prev, status: 'Returned' }));
      setToast({ message: t('volunteer_lost_items.mark_returned_success'), type: 'success', visible: true });
    } catch (err) {
      setToast({ message: err.message || t('volunteer_lost_items.mark_returned_error'), type: 'error', visible: true });
    } finally {
      setMarkingReturned(false);
    }
  };

  if (loading) return <LoadingState />;

  if (error === 'NOT_FOUND' || !item) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center pb-20">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
            <Package className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-heading text-xl font-extrabold text-charcoal dark:text-white">
            {t('not_found.title') || 'Item Not Found'}
          </h2>
          <p className="text-sm text-charcoal-light dark:text-gray-400 mt-2">
            The lost item you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/volunteer/lost-items"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('volunteer_lost_items.btn_back')}
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
            href="/volunteer/lost-items"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('volunteer_lost_items.btn_back')}
          </Link>
        </div>
      </div>
    );
  }

  const itemType = item.itemType || item.name || 'Unknown';
  const normCat = (item.itemType || item.category || '').toLowerCase();
  const Icon = CATEGORY_ICONS[normCat] || HelpCircle;
  const gradient = CATEGORY_GRADIENTS[item.itemType || item.category] || 'from-slate-500 to-slate-650';

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <section className={`relative min-h-[30vh] md:min-h-[35vh] flex flex-col justify-center py-16 overflow-hidden bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />

        <Container className="relative z-10 text-center">
          {item.photoUrl ? (
            <img src={item.photoUrl} alt={itemType} className="w-20 h-20 mx-auto rounded-full object-cover border-4 border-white/30 mb-4" />
          ) : (
            <div className="w-20 h-20 mx-auto rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-3xl font-heading font-extrabold select-none mb-4">
              <Icon className="w-10 h-10" />
            </div>
          )}
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {itemType}
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="px-3 py-1 rounded-lg bg-white/15 backdrop-blur-sm text-white text-xs font-bold">
              {item.itemId}
            </span>
            <StatusBadge status={item.status} />
          </div>
          <p className="text-white/70 text-sm mt-3 font-semibold">
            {t('volunteer_lost_items.detail_subtitle')}
          </p>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="max-w-3xl mx-auto">
            <Link
              href="/volunteer/lost-items"
              className="inline-flex items-center gap-2 text-xs font-bold text-charcoal-light dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
              {t('volunteer_lost_items.btn_back')}
            </Link>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-premium">
              <div className="p-6 sm:p-8">
                <h2 className="font-heading text-xl font-extrabold text-charcoal dark:text-white mb-6">
                  {t('volunteer_lost_items.detail_title')}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailCard
                    icon={<Package className="w-4 h-4 text-primary" />}
                    label={t('volunteer_lost_items.item_type_label')}
                    value={itemType}
                  />
                  <DetailCard
                    icon={<Gem className="w-4 h-4 text-secondary" />}
                    label={t('volunteer_lost_items.brand_label')}
                    value={item.brand || 'N/A'}
                  />
                  <DetailCard
                    icon={<div className="w-4 h-4 rounded-full border-2 border-primary" style={{ backgroundColor: item.color || '#ccc' }} />}
                    label={t('volunteer_lost_items.color_label')}
                    value={item.color || 'N/A'}
                  />
                  <DetailCard
                    icon={<MapPin className="w-4 h-4 text-primary" />}
                    label={t('volunteer_lost_items.found_location_label')}
                    value={item.foundLocation || item.locationFound || 'N/A'}
                  />
                  <DetailCard
                    icon={<MapPin className="w-4 h-4 text-secondary" />}
                    label={t('volunteer_lost_items.storage_location_label')}
                    value={item.storageLocation || 'N/A'}
                  />
                  <DetailCard
                    icon={<User className="w-4 h-4 text-primary" />}
                    label={t('volunteer_lost_items.volunteer_label')}
                    value={item.volunteerId || 'N/A'}
                  />
                  <DetailCard
                    icon={<Clock className="w-4 h-4 text-secondary" />}
                    label={t('volunteer_lost_items.created_time')}
                    value={formatDateTime(item.createdAt || item.dateReported)}
                  />
                  <DetailCard
                    icon={<StatusBadge status={item.status} />}
                    label={t('volunteer_lost_items.status_label')}
                    value={<StatusBadge status={item.status} />}
                    spanFull
                  />
                </div>

                {item.description && (
                  <div className="mt-6 p-4 bg-slate-50 dark:bg-gray-850 rounded-xl border border-slate-100 dark:border-gray-800">
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                      {t('volunteer_lost_items.description_label')}
                    </span>
                    <p className="text-sm font-semibold text-charcoal dark:text-white mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                )}

                {item.notes && (
                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                    <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Notes
                    </span>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
                      {item.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {item.status === 'Waiting' && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Link
                  href="/volunteer/lost-items"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-bold text-charcoal dark:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('volunteer_lost_items.btn_back')}
                </Link>
                <LoadingButton
                  onClick={() => setShowReturnDialog(true)}
                  loading={markingReturned}
                  variant="primary"
                >
                  <CheckCircle className="w-4 h-4" />
                  {t('volunteer_lost_items.btn_mark_returned')}
                </LoadingButton>
              </div>
            )}

            {item.status === 'Returned' && (
              <div className="flex items-center justify-center mt-8">
                <Link
                  href="/volunteer/lost-items"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-bold text-charcoal dark:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('volunteer_lost_items.btn_back')}
                </Link>
              </div>
            )}
          </div>
        </Container>
      </section>

      <ConfirmationDialog
        isOpen={showReturnDialog}
        onClose={() => setShowReturnDialog(false)}
        onConfirm={handleMarkReturned}
        title={t('volunteer_lost_items.mark_returned_title')}
        message={t('volunteer_lost_items.mark_returned_confirm')}
        confirmLabel={t('volunteer_lost_items.btn_mark_returned')}
        cancelLabel={t('volunteer_lost_items.btn_cancel')}
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
