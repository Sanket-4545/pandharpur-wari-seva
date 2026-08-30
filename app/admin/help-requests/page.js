"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import Toast from '@/components/Toast';
import StatusBadge from '@/components/StatusBadge';
import { AlertCircle, HeartHandshake, MapPin, Phone, Navigation, Clock, RefreshCw, User } from 'lucide-react';

const STATUS_FILTERS = ['all', 'Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'];

const HELP_TYPE_ICONS = {
  Medical: "\u{1F3E5}",
  Water: "\u{1F4A7}",
  Food: "\u{1F37D}\u{FE0F}",
  Direction: "\u{1F9ED}",
  "Lost/Separated": "\u{1F50D}",
  Emergency: "\u{1F6A8}",
  Other: "\u{2753}",
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminHelpRequestsPage() {
  const { t } = useLanguage();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const [viewingRow, setViewingRow] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [bulkDeletingIds, setBulkDeletingIds] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, visible: true });
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/help-requests?limit=200');
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError(t('admin.help_requests.error_auth'));
          return;
        }
        throw new Error(t('admin.help_requests.error_load'));
      }
      const json = await res.json();
      if (json.success && json.data?.items) {
        setItems(json.data.items.map(item => ({
          ...item,
          id: item.requestId,
          name: item.fullName || '',
          location: item.location ? 'Available' : 'Not provided',
          category: [item.helpType, item.volunteerId, item.contactNumber].filter(Boolean).join(' '),
        })));
      } else {
        setItems([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = useMemo(() => {
    if (statusFilter === 'all') return items;
    return items.filter(item => item.status === statusFilter);
  }, [items, statusFilter]);

  const stats = useMemo(() => ({
    total: items.length,
    pending: items.filter(i => i.status === 'Pending').length,
    accepted: items.filter(i => i.status === 'Accepted').length,
    inProgress: items.filter(i => i.status === 'In Progress').length,
    completed: items.filter(i => i.status === 'Completed').length,
    cancelled: items.filter(i => i.status === 'Cancelled').length,
    active: items.filter(i => i.status === 'Accepted' || i.status === 'In Progress').length,
  }), [items]);

  const columns = [
    {
      key: 'requestId',
      label: t('admin.help_requests.column_request_id'),
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-charcoal dark:text-white text-[11px]">{row.requestId}</span>
      ),
    },
    {
      key: 'fullName',
      label: t('admin.help_requests.column_full_name'),
      sortable: true,
      render: (row) => (
        <span className="font-bold text-charcoal dark:text-white">{row.fullName || '—'}</span>
      ),
    },
    {
      key: 'contactNumber',
      label: t('admin.help_requests.column_contact'),
      render: (row) => (
        <span className="text-charcoal dark:text-white">{row.contactNumber || '—'}</span>
      ),
    },
    {
      key: 'helpType',
      label: t('admin.help_requests.column_help_type'),
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 font-bold text-charcoal dark:text-white">
          <span>{HELP_TYPE_ICONS[row.helpType] || "\u{2753}"}</span>
          {row.helpType || '—'}
        </span>
      ),
    },
    {
      key: 'message',
      label: t('admin.help_requests.column_message'),
      render: (row) => (
        <span className="truncate max-w-[140px] block text-charcoal-light dark:text-gray-400">
          {row.message || '—'}
        </span>
      ),
    },
    {
      key: 'location',
      label: t('admin.help_requests.column_location'),
      render: (row) => (
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" />
          <span className={row.location === 'Available' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400 dark:text-gray-500'}>
            {row.location === 'Available' ? t('admin.help_requests.location_available') : t('admin.help_requests.location_not_provided')}
          </span>
        </span>
      ),
    },
    {
      key: 'volunteerId',
      label: t('admin.help_requests.column_volunteer'),
      render: (row) => (
        row.volunteerId ? (
          <span className="text-charcoal dark:text-white font-semibold">{row.volunteerId}</span>
        ) : (
          <span className="text-slate-400 dark:text-gray-500">{t('admin.help_requests.not_assigned')}</span>
        )
      ),
    },
    { key: 'status', label: t('admin.help_requests.column_status') },
    {
      key: 'createdAt',
      label: t('admin.help_requests.column_created'),
      sortable: true,
      render: (row) => (
        <span className="text-charcoal-light dark:text-gray-400">{formatDate(row.createdAt)}</span>
      ),
    },
  ];

  const handleView = (row) => {
    setViewingRow(row);
  };

  const handleDeleteTrigger = (id) => {
    setDeletingId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/help-requests/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(t('admin.help_requests.error_delete'));
      setItems(prev => prev.filter(i => i.requestId !== deletingId));
      if (viewingRow && viewingRow.requestId === deletingId) setViewingRow(null);
      showToast(t('admin.help_requests.toast_deleted'));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDeleteTrigger = (ids, clearSelection) => {
    setBulkDeletingIds({ ids, clearSelection });
  };

  const handleBulkDeleteConfirm = async () => {
    if (!bulkDeletingIds) return;
    const { ids, clearSelection } = bulkDeletingIds;
    try {
      const res = await fetch('/api/help-requests/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error(t('admin.help_requests.error_delete'));
      const result = await res.json();
      const deletedCount = result.data?.deleted || 0;
      setItems(prev => prev.filter(i => !ids.includes(i.requestId)));
      if (viewingRow && ids.includes(viewingRow.requestId)) setViewingRow(null);
      if (clearSelection) clearSelection();
      showToast(t('admin.help_requests.toast_deleted') + ` (${deletedCount})`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBulkDeletingIds(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-7 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-64" />
          <div className="h-10 bg-slate-200 dark:bg-gray-700 rounded-2xl animate-pulse w-32" />
        </div>
        <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-8 w-8 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-full mb-2" />
                  <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t('admin.help_requests.title')}
          </h1>
        </div>
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-500 dark:text-red-400 font-semibold">{error}</p>
          <button
            onClick={() => fetchItems()}
            className="mt-4 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all"
          >
            {t('admin.common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t('admin.help_requests.title')}
          </h1>
          <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
            {t('admin.help_requests.subtitle')}
          </p>
        </div>

        <button
          onClick={() => fetchItems()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-850 text-charcoal dark:text-white rounded-2xl text-xs font-bold transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          {t('admin.help_requests.refresh')}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-light dark:text-gray-400">
        <span><strong className="text-charcoal dark:text-white">{stats.total}</strong> {t('admin.help_requests.stat_total')}</span>
        <span><strong className="text-amber-650 dark:text-amber-400">{stats.pending}</strong> {t('admin.help_requests.stat_pending')}</span>
        <span><strong className="text-blue-650 dark:text-blue-400">{stats.accepted}</strong> {t('admin.help_requests.stat_accepted')}</span>
        <span><strong className="text-indigo-650 dark:text-indigo-400">{stats.inProgress}</strong> {t('admin.help_requests.stat_in_progress')}</span>
        <span><strong className="text-emerald-650 dark:text-emerald-400">{stats.completed}</strong> {t('admin.help_requests.stat_completed')}</span>
        <span><strong className="text-slate-650 dark:text-gray-400">{stats.cancelled}</strong> {t('admin.help_requests.stat_cancelled')}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(status => {
          const isActive = statusFilter === status;
          const label = status === 'all' ? t('admin.help_requests.filter_all')
            : status === 'Pending' ? t('admin.help_requests.filter_pending')
            : status === 'Accepted' ? t('admin.help_requests.filter_accepted')
            : status === 'In Progress' ? t('admin.help_requests.filter_in_progress')
            : status === 'Completed' ? t('admin.help_requests.filter_completed')
            : t('admin.help_requests.filter_cancelled');
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-saffron-glow'
                  : 'bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-charcoal-light dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl">
          <HeartHandshake className="w-12 h-12 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-lg font-heading font-extrabold text-charcoal dark:text-white">{t('admin.help_requests.empty_title')}</p>
          <p className="text-sm text-charcoal-light dark:text-gray-400 mt-2">{t('admin.help_requests.empty_desc')}</p>
          <button
            onClick={() => fetchItems()}
            className="mt-6 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all"
          >
            {t('admin.help_requests.refresh')}
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          searchPlaceholderKey="admin.help_requests.search_placeholder"
          onViewRow={handleView}
          onDeleteRow={handleDeleteTrigger}
          onBulkDelete={handleBulkDeleteTrigger}
          exportFilename="help-requests.csv"
        />
      )}

      {viewingRow && (
        <Modal
          isOpen={!!viewingRow}
          onClose={() => setViewingRow(null)}
          title={t('admin.help_requests.detail_title')}
        >
          <div className="space-y-4">
            <div className="w-full h-28 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white relative shadow-sm">
              <div className="flex flex-col items-center">
                <span className="text-3xl select-none">{HELP_TYPE_ICONS[viewingRow.helpType] || "\u{2753}"}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-white/25 border border-white/10 px-2 py-0.5 rounded-lg mt-2">
                  {viewingRow.helpType}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <StatusBadge status={viewingRow.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t('admin.help_requests.detail_request_id')}</span>
                <span className="font-mono font-bold text-charcoal dark:text-white mt-1 block">{viewingRow.requestId}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t('admin.help_requests.detail_full_name')}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">{viewingRow.fullName || '—'}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t('admin.help_requests.detail_contact')}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  {viewingRow.contactNumber || '—'}
                  {viewingRow.contactNumber && (
                    <a href={`tel:${viewingRow.contactNumber}`} className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition-colors">
                      <Phone className="w-3 h-3" />
                      {t('admin.help_requests.call')}
                    </a>
                  )}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t('admin.help_requests.detail_help_type')}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">
                  {HELP_TYPE_ICONS[viewingRow.helpType]} {viewingRow.helpType}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t('admin.help_requests.detail_status')}</span>
                <span className="mt-1 block">
                  <StatusBadge status={viewingRow.status} />
                </span>
              </div>

              {viewingRow.message && (
                <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                  <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t('admin.help_requests.detail_message')}</span>
                  <span className="font-bold text-charcoal dark:text-white mt-1 block leading-relaxed italic">&ldquo;{viewingRow.message}&rdquo;</span>
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t('admin.help_requests.detail_location')}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {viewingRow.location && typeof viewingRow.location === 'object' && viewingRow.location.lat ? (
                    <span className="flex items-center gap-2">
                      <span>{viewingRow.location.lat.toFixed(5)}, {viewingRow.location.lng.toFixed(5)}</span>
                      <a
                        href={`https://www.google.com/maps?q=${viewingRow.location.lat},${viewingRow.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition-colors"
                      >
                        <Navigation className="w-3 h-3" />
                        {t('admin.help_requests.open_location')}
                      </a>
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-gray-500">{t('admin.help_requests.location_not_provided')}</span>
                  )}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t('admin.help_requests.detail_volunteer')}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  {viewingRow.volunteerId || <span className="text-slate-400 dark:text-gray-500">{t('admin.help_requests.not_assigned')}</span>}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t('admin.help_requests.detail_created')}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  {formatDate(viewingRow.createdAt) || '—'}
                </span>
              </div>

              {viewingRow.acceptedAt && (
                <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                  <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t('admin.help_requests.detail_accepted')}</span>
                  <span className="font-bold text-charcoal dark:text-white mt-1 block">{formatDate(viewingRow.acceptedAt)}</span>
                </div>
              )}

              {viewingRow.startedAt && (
                <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                  <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t('admin.help_requests.detail_started')}</span>
                  <span className="font-bold text-charcoal dark:text-white mt-1 block">{formatDate(viewingRow.startedAt)}</span>
                </div>
              )}

              {viewingRow.completedAt && (
                <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                  <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t('admin.help_requests.detail_completed')}</span>
                  <span className="font-bold text-charcoal dark:text-white mt-1 block">{formatDate(viewingRow.completedAt)}</span>
                </div>
              )}

              {viewingRow.cancelledAt && (
                <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                  <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t('admin.help_requests.detail_cancelled')}</span>
                  <span className="font-bold text-charcoal dark:text-white mt-1 block">{formatDate(viewingRow.cancelledAt)}</span>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      <ConfirmationDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title={t('admin.help_requests.delete_title')}
        message={t('admin.help_requests.delete_confirm')}
      />

      <ConfirmationDialog
        isOpen={!!bulkDeletingIds}
        onClose={() => setBulkDeletingIds(null)}
        onConfirm={handleBulkDeleteConfirm}
        title={t('admin.help_requests.delete_title')}
        message={bulkDeletingIds ? `Delete ${bulkDeletingIds.ids.length} selected request(s)?` : ''}
      />
    </div>
  );
}
