"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import Toast from '@/components/Toast';
import LoadingButton from '@/components/LoadingButton';
import StatusBadge from '@/components/StatusBadge';
import { AlertCircle, Plus, MapPin, Tag, ShieldCheck, Save, X, Package, Camera, CheckCircle, ArrowRight } from 'lucide-react';

const ITEM_TYPES = ["Mobile", "Wallet", "Bag", "Documents", "Jewelry", "Shoes", "Clothing", "Electronics", "Keys", "Other"];

const ALL_STATUSES = ["Lost", "Found", "Claimed", "Waiting", "Verified", "Returned"];

const FORM_DEFAULTS = {
  itemType: '', brand: '', color: '', foundLocation: '',
  description: '', storageLocation: '', contactNumber: '', notes: '',
};

const STATUS_FILTERS = ["Waiting", "Verified", "Returned"];

function getGradientByItemType(itemType) {
  const map = {
    'Mobile': 'from-blue-500 to-indigo-600',
    'Wallet': 'from-amber-500 to-yellow-600',
    'Bag': 'from-green-500 to-emerald-600',
    'Documents': 'from-rose-500 to-pink-600',
    'Jewelry': 'from-purple-500 to-violet-600',
    'Shoes': 'from-orange-500 to-red-600',
    'Clothing': 'from-purple-500 to-pink-600',
    'Electronics': 'from-cyan-500 to-blue-600',
    'Keys': 'from-yellow-500 to-amber-600',
    'Other': 'from-slate-500 to-gray-600',
  };
  return map[itemType] || 'from-amber-500 to-orange-500';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getDisplayName(item) {
  return item.itemType || item.name || '';
}

function getDisplayLocation(item) {
  return item.foundLocation || item.locationFound || '';
}

function getVolunteerDisplay(item) {
  if (item.volunteerName) return item.volunteerName;
  if (item.volunteerId) return item.volunteerId;
  return null;
}

export default function LostBaggageManagement() {
  const { t } = useLanguage();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const [viewingRow, setViewingRow] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(FORM_DEFAULTS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, visible: true });
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/lost-items?limit=100');
      if (!res.ok) throw new Error('Failed to load lost baggage items');
      const json = await res.json();
      if (json.success && json.data?.items) {
        const mapped = json.data.items.map(item => ({
          ...item,
          id: item.itemId,
          name: item.volunteerName || item.name || '',
          location: item.foundLocation || item.locationFound || '',
          itemName: item.itemType || '',
          category: [item.brand, item.color, item.volunteerId, item.itemType].filter(Boolean).join(' '),
        }));
        setItems(mapped);
      } else {
        setItems([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = searchTerm === '' ||
        [
          item.itemType, item.name, item.brand, item.color,
          item.foundLocation, item.locationFound,
          item.volunteerId, item.volunteerName,
          item.itemId,
        ].some(val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      waiting: items.filter(i => i.status === 'Waiting').length,
      verified: items.filter(i => i.status === 'Verified').length,
      returned: items.filter(i => i.status === 'Returned').length,
    };
  }, [items]);

  const columns = [
    {
      key: "photo",
      label: t("admin.lost_items.column_photo"),
      sortable: false,
      render: (row) => (
        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
          {row.photoUrl ? (
            <img src={row.photoUrl} alt={getDisplayName(row)} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getGradientByItemType(row.itemType || row.category)} flex items-center justify-center`}>
              <Package className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "itemType",
      label: t("admin.lost_items.column_item_type"),
      sortable: true,
      render: (row) => (
        <span className="font-bold text-charcoal dark:text-white">
          {getDisplayName(row) || '—'}
        </span>
      ),
    },
    {
      key: "brand",
      label: t("admin.lost_items.column_brand"),
      sortable: true,
      render: (row) => row.brand || '—',
    },
    {
      key: "foundLocation",
      label: t("admin.lost_items.column_location"),
      render: (row) => (
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" />
          <span className="truncate max-w-[160px]">{getDisplayLocation(row) || '—'}</span>
        </span>
      ),
    },
    {
      key: "volunteerId",
      label: t("admin.lost_items.column_volunteer"),
      render: (row) => {
        const vol = getVolunteerDisplay(row);
        return vol ? (
          <span className="text-charcoal dark:text-white font-semibold">{vol}</span>
        ) : (
          <span className="text-slate-400 dark:text-gray-500">—</span>
        );
      },
    },
    { key: "status", label: t("admin.lost_items.column_status") },
    {
      key: "dateReported",
      label: t("admin.lost_items.column_date"),
      sortable: true,
      render: (row) => formatDate(row.dateReported),
    },
  ];

  const handleView = (row) => {
    setViewingRow(row);
  };

  const handleEdit = (row) => {
    setViewingRow(null);
    openEditModal(row);
  };

  const handleDeleteTrigger = (id) => {
    setDeletingId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/lost-items/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete item');
      setItems(prev => prev.filter(i => i.itemId !== deletingId));
      showToast(t('admin.common.delete') + ' — ' + t('admin.common.confirm'));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusConfirm = async () => {
    if (!confirmAction) return;
    const { itemId, newStatus } = confirmAction;
    try {
      const res = await fetch(`/api/lost-items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to update status');
      }
      const json = await res.json();
      if (json.success && json.data) {
        setItems(prev => prev.map(i =>
          i.itemId === itemId ? { ...i, ...json.data, id: json.data.itemId } : i
        ));
        if (viewingRow && viewingRow.itemId === itemId) {
          setViewingRow(prev => ({ ...prev, ...json.data }));
        }
      }
      const label = newStatus === 'Verified'
        ? t('admin.lost_items.btn_verify')
        : t('admin.lost_items.btn_mark_returned');
      showToast(label + ' — ' + t('admin.common.confirm'));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setConfirmAction(null);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({ ...FORM_DEFAULTS });
    setShowFormModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      itemType: item.itemType || item.name || '',
      brand: item.brand || '',
      color: item.color || '',
      foundLocation: item.foundLocation || item.locationFound || '',
      description: item.description || '',
      storageLocation: item.storageLocation || '',
      contactNumber: item.contactNumber || item.contactInfo || '',
      notes: item.notes || '',
    });
    setShowFormModal(true);
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.itemType || !form.foundLocation) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { ...form };

      if (editingItem) {
        const res = await fetch(`/api/lost-items/${editingItem.itemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Failed to update item');
        }
        const json = await res.json();
        if (json.success && json.data) {
          setItems(prev => prev.map(i =>
            i.itemId === editingItem.itemId
              ? { ...i, ...json.data, id: json.data.itemId }
              : i
          ));
        }
        showToast(t('admin.common.save') + ' — ' + t('admin.common.confirm'));
      } else {
        const res = await fetch('/api/lost-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, status: 'Waiting' }),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Failed to create item');
        }
        await fetchItems();
        showToast(t('admin.common.save') + ' — ' + t('admin.common.confirm'));
      }
      setShowFormModal(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isWorkflowStatus = (status) => {
    return STATUS_FILTERS.includes(status);
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
            {t("admin.lost_items.title")}
          </h1>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-primary underline text-sm"
          >
            {t("admin.common.retry")}
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
            {t("admin.lost_items.title")}
          </h1>
          <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
            {t("admin.lost_items.subtitle")}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-bold transition-all shadow-saffron-glow focus:outline-none self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {t("admin.lost_items.btn_add_new") || t("volunteer_lost_items.btn_add_new")}
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs text-charcoal-light dark:text-gray-400">
        <span><strong className="text-charcoal dark:text-white">{stats.total}</strong> {t("admin.lost_items.stat_total")}</span>
        <span><strong className="text-amber-650 dark:text-amber-400">{stats.waiting}</strong> {t("admin.lost_items.stat_waiting")}</span>
        <span><strong className="text-blue-650 dark:text-blue-400">{stats.verified}</strong> {t("admin.lost_items.stat_verified")}</span>
        <span><strong className="text-emerald-650 dark:text-emerald-400">{stats.returned}</strong> {t("admin.lost_items.stat_returned")}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            statusFilter === 'all'
              ? 'bg-primary text-white shadow-saffron-glow'
              : 'bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-charcoal-light dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800'
          }`}
        >
          {t("admin.lost_items.filter_all")}
        </button>
        {STATUS_FILTERS.map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === status
                ? 'bg-primary text-white shadow-saffron-glow'
                : 'bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-charcoal-light dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800'
            }`}
          >
            {t(`admin.lost_items.filter_${status.toLowerCase()}`)}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-charcoal-light dark:text-gray-400">{t("admin.lost_items.no_results")}</p>
          <p className="text-xs text-charcoal-light dark:text-gray-400 mt-1">{t("admin.lost_items.no_results_desc")}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          searchPlaceholderKey="admin.lost_items.search_placeholder"
          onViewRow={handleView}
          onDeleteRow={handleDeleteTrigger}
          exportFilename="lost-baggage-registry.csv"
        />
      )}

      {viewingRow && (
        <Modal
          isOpen={!!viewingRow}
          onClose={() => setViewingRow(null)}
          title={t("admin.lost_items.detail_title")}
        >
          <div className="space-y-4">

            {viewingRow.photoUrl ? (
              <div className="w-full h-40 rounded-2xl overflow-hidden relative">
                <img src={viewingRow.photoUrl} alt={getDisplayName(viewingRow)} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3">
                  <StatusBadge status={viewingRow.status} />
                </div>
              </div>
            ) : (
              <div className={`w-full h-32 rounded-2xl bg-gradient-to-tr ${getGradientByItemType(viewingRow.itemType || viewingRow.category)} flex items-center justify-center text-white relative shadow-sm`}>
                <div className="flex flex-col items-center">
                  <Package className="w-8 h-8 select-none" />
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-white/25 border border-white/10 px-2 py-0.5 rounded-lg mt-2">
                    {getDisplayName(viewingRow)}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <StatusBadge status={viewingRow.status} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t("admin.lost_items.item_type_label")}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  {getDisplayName(viewingRow) || '—'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t("admin.lost_items.brand_label")}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">
                  {viewingRow.brand || '—'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t("admin.lost_items.color_label")}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">
                  {viewingRow.color || '—'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t("admin.lost_items.status_label")}</span>
                <span className="mt-1 block">
                  <StatusBadge status={viewingRow.status} />
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t("admin.lost_items.found_location_label")}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {getDisplayLocation(viewingRow) || '—'}
                </span>
              </div>

              {viewingRow.storageLocation && (
                <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                  <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t("admin.lost_items.storage_location_label")}</span>
                  <span className="font-bold text-charcoal dark:text-white mt-1 block">
                    {viewingRow.storageLocation}
                  </span>
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t("admin.lost_items.description_label")}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block leading-relaxed font-sans">
                  {viewingRow.description || t("admin.lost_items.no_details")}
                </span>
              </div>

              {viewingRow.notes && (
                <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                  <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t("admin.lost_items.notes_label")}</span>
                  <span className="font-bold text-charcoal dark:text-white mt-1 block leading-relaxed font-sans">
                    {viewingRow.notes}
                  </span>
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t("admin.lost_items.volunteer_name_label")}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">
                  {viewingRow.volunteerName || '—'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t("admin.lost_items.volunteer_id_label")}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">
                  {viewingRow.volunteerId || '—'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t("admin.lost_items.volunteer_phone_label")}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">
                  {viewingRow.contactNumber || '—'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">{t("admin.lost_items.created_label")}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">
                  {formatDate(viewingRow.dateReported) || '—'}
                </span>
              </div>

              <div className="col-span-2 border-t border-slate-100 dark:border-gray-800 pt-4 mt-2 flex justify-end gap-3">
                <button
                  onClick={() => handleEdit(viewingRow)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-gray-800 text-charcoal-light dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-850 rounded-xl transition-all text-xs font-bold"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t("admin.lost_items.btn_edit")}
                </button>
              </div>

              {viewingRow.status === 'Waiting' && (
                <div className="col-span-2 flex justify-end gap-3 mt-1">
                  <button
                    onClick={() => setConfirmAction({ itemId: viewingRow.itemId, newStatus: 'Verified' })}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all text-xs font-bold"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t("admin.lost_items.btn_verify")}
                  </button>
                </div>
              )}
              {viewingRow.status === 'Verified' && (
                <div className="col-span-2 flex justify-end gap-3 mt-1">
                  <button
                    onClick={() => setConfirmAction({ itemId: viewingRow.itemId, newStatus: 'Returned' })}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl transition-all text-xs font-bold"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {t("admin.lost_items.btn_mark_returned")}
                  </button>
                </div>
              )}

            </div>

          </div>
        </Modal>
      )}

      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowFormModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/60 dark:border-gray-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-extrabold text-charcoal dark:text-white">
                {editingItem ? t("admin.lost_items.edit_title") : t("admin.lost_items.detail_title")}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.lost_items.item_type_label")} *</label>
                  <select
                    value={form.itemType}
                    onChange={e => handleFormChange('itemType', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  >
                    <option value="">{t("volunteer_lost_items.item_type_placeholder")}</option>
                    {ITEM_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.lost_items.brand_label")}</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={e => handleFormChange('brand', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                    placeholder={t("volunteer_lost_items.brand_placeholder")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.lost_items.color_label")}</label>
                  <input
                    type="text"
                    value={form.color}
                    onChange={e => handleFormChange('color', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                    placeholder={t("volunteer_lost_items.color_placeholder")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.lost_items.contact_label")}</label>
                  <input
                    type="text"
                    value={form.contactNumber}
                    onChange={e => handleFormChange('contactNumber', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                    placeholder={t("volunteer_lost_items.contact_number_placeholder")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.lost_items.found_location_label")} *</label>
                <input
                  type="text"
                  value={form.foundLocation}
                  onChange={e => handleFormChange('foundLocation', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  placeholder={t("volunteer_lost_items.found_location_placeholder")}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.lost_items.description_label")}</label>
                <textarea
                  value={form.description}
                  onChange={e => handleFormChange('description', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white resize-none"
                  placeholder={t("volunteer_lost_items.description_placeholder")}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.lost_items.storage_location_label")}</label>
                <input
                  type="text"
                  value={form.storageLocation}
                  onChange={e => handleFormChange('storageLocation', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  placeholder={t("volunteer_lost_items.storage_location_placeholder")}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.lost_items.notes_label")}</label>
                <textarea
                  value={form.notes}
                  onChange={e => handleFormChange('notes', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white resize-none"
                  placeholder={t("volunteer_lost_items.notes_placeholder")}
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-gray-800">
              <button
                onClick={() => setShowFormModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-charcoal dark:text-white hover:bg-slate-50 dark:hover:bg-gray-800 transition-all"
              >
                {t("admin.common.cancel")}
              </button>
              <LoadingButton
                onClick={handleSave}
                loading={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-saffron-glow"
              >
                <Save className="w-4 h-4" />
                {editingItem ? t("admin.common.save") : t("admin.common.save")}
              </LoadingButton>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title={t("admin.lost_items.delete_title")}
        message={t("admin.lost_items.delete_confirm")}
      />

      <ConfirmationDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleStatusConfirm}
        title={confirmAction?.newStatus === 'Verified' ? t("admin.lost_items.verify_title") : t("admin.lost_items.return_title")}
        message={confirmAction?.newStatus === 'Verified' ? t("admin.lost_items.verify_confirm") : t("admin.lost_items.return_confirm")}
        variant="success"
      />

    </div>
  );
}
