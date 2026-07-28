"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import Toast from '@/components/Toast';
import LoadingButton from '@/components/LoadingButton';
import { AlertCircle, Plus, MapPin, Tag, ShieldCheck, Save, X } from 'lucide-react';

const CATEGORIES = ["Mobile", "Wallet", "Bag", "Documents", "Jewelry", "Shoes", "Other"];

const FORM_DEFAULTS = {
  name: '', category: 'Other', locationFound: '',
  contactInfo: '', description: '',
};

function getGradientByCategory(category) {
  const map = {
    'Mobile': 'from-blue-500 to-indigo-600',
    'Wallet': 'from-amber-500 to-yellow-600',
    'Bag': 'from-green-500 to-emerald-600',
    'Documents': 'from-rose-500 to-pink-600',
    'Jewelry': 'from-purple-500 to-violet-600',
    'Shoes': 'from-orange-500 to-red-600',
    'Other': 'from-slate-500 to-gray-600',
  };
  return map[category] || 'from-amber-500 to-orange-500';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function LostFoundAdmin() {
  const { t } = useLanguage();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const [viewingRow, setViewingRow] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(FORM_DEFAULTS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, visible: true });
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/lost-items?limit=100');
      if (!res.ok) throw new Error('Failed to load lost & found items');
      const json = await res.json();
      if (json.success && json.data?.items) {
        const mapped = json.data.items.map(item => ({
          ...item,
          id: item.itemId,
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

  const columns = [
    { key: "itemId", label: "Item ID" },
    { key: "name", label: "Item Name", sortable: true },
    { key: "category", label: "Category", sortable: true },
    {
      key: "locationFound",
      label: "Report Location",
      render: (row) => row.locationFound || '',
    },
    {
      key: "dateReported",
      label: "Date Reported",
      sortable: true,
      render: (row) => formatDate(row.dateReported),
    },
    { key: "status", label: "Status" }
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
      const res = await fetch(`/api/lost-items/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete item');
      setItems(prev => prev.filter(i => i.itemId !== deletingId));
      showToast('Item deleted successfully');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateStatus = async (itemId, newStatus) => {
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
      showToast(`Item marked as ${newStatus}`);
    } catch (err) {
      showToast(err.message, 'error');
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
      name: item.name || '',
      category: item.category || 'Other',
      locationFound: item.locationFound || '',
      contactInfo: item.contactInfo || '',
      description: item.description || '',
    });
    setShowFormModal(true);
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.locationFound || !form.contactInfo) {
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
        showToast('Item updated successfully');
      } else {
        const res = await fetch('/api/lost-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Failed to create item');
        }
        await fetchItems();
        showToast('Item created successfully');
      }
      setShowFormModal(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
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
            {t("admin.sidebar.lost_found")} Management
          </h1>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-primary underline text-sm"
          >
            Retry
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
            {t("admin.sidebar.lost_found")} Management
          </h1>
          <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
            Track and catalog pilgrim belongings. Validate identity proof files upon claim request handovers.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-bold transition-all shadow-saffron-glow focus:outline-none self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Catalog Item
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs text-charcoal-light dark:text-gray-400">
        <span><strong className="text-charcoal dark:text-white">{items.length}</strong> total</span>
        <span><strong className="text-amber-650 dark:text-amber-400">{items.filter(i => i.status === 'Lost').length}</strong> lost</span>
        <span><strong className="text-emerald-650 dark:text-emerald-400">{items.filter(i => i.status === 'Found').length}</strong> found</span>
        <span><strong className="text-blue-650 dark:text-blue-400">{items.filter(i => i.status === 'Claimed').length}</strong> claimed</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-charcoal-light dark:text-gray-400">No items found.</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          searchPlaceholderKey="admin.common.search"
          onViewRow={handleView}
          onDeleteRow={handleDeleteTrigger}
          exportFilename="lost-found-registry.csv"
        />
      )}

      {viewingRow && (
        <Modal
          isOpen={!!viewingRow}
          onClose={() => setViewingRow(null)}
          title={`Inventory Log: ${viewingRow.name}`}
        >
          <div className="space-y-4">

            <div className={`w-full h-32 rounded-2xl bg-gradient-to-tr ${getGradientByCategory(viewingRow.category)} flex items-center justify-center text-white relative shadow-sm`}>
              <div className="flex flex-col items-center">
                <span className="font-heading text-2xl font-extrabold select-none">
                  {viewingRow.name.charAt(0)}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-white/25 border border-white/10 px-2 py-0.5 rounded-lg mt-1">
                  {viewingRow.category}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Category Type</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  {viewingRow.category}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Current Status</span>
                <span className="mt-1 block">
                  <span className={`inline-flex px-2 py-0.5 rounded-md font-bold text-[10px] border shadow-sm ${
                    viewingRow.status.toLowerCase() === 'found'
                      ? 'bg-emerald-50 text-emerald-650 border-emerald-250'
                      : viewingRow.status.toLowerCase() === 'lost'
                      ? 'bg-amber-50 text-amber-650 border-amber-200'
                      : 'bg-blue-50 text-blue-650 border-blue-200'
                  }`}>
                    {viewingRow.status}
                  </span>
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Location Coordinate</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {viewingRow.locationFound}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Log Description Details</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block leading-relaxed font-sans">
                  {viewingRow.description || "No details provided."}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Claim Support Center Desk</span>
                  <span className="font-bold text-charcoal dark:text-white mt-0.5 block">
                    {viewingRow.contactInfo}
                  </span>
                </div>
                {viewingRow.status.toLowerCase() === 'found' && (
                  <button
                    onClick={() => handleUpdateStatus(viewingRow.itemId, "Claimed")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-[11px]"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Mark Claimed
                  </button>
                )}
              </div>

              <div className="col-span-2 border-t border-slate-100 dark:border-gray-800 pt-4 mt-2 flex justify-end gap-3">
                <button
                  onClick={() => {
                    const i = viewingRow;
                    setViewingRow(null);
                    openEditModal(i);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-gray-800 text-charcoal-light dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-850 rounded-xl transition-all text-xs font-bold"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              </div>

              {viewingRow.status.toLowerCase() !== 'claimed' && (
                <div className="col-span-2 flex justify-end gap-3 mt-1">
                  {viewingRow.status.toLowerCase() !== 'found' && (
                    <button
                      onClick={() => handleUpdateStatus(viewingRow.itemId, "Found")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl transition-all text-xs font-bold"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Mark Found
                    </button>
                  )}
                  {viewingRow.status.toLowerCase() !== 'lost' && (
                    <button
                      onClick={() => handleUpdateStatus(viewingRow.itemId, "Lost")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-amber-200 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-xl transition-all text-xs font-bold"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Mark Lost
                    </button>
                  )}
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
                {editingItem ? 'Edit Lost & Found Item' : 'Catalog New Item'}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Item Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => handleFormChange('name', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                    placeholder="e.g. Black Leather Wallet"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Category *</label>
                  <select
                    value={form.category}
                    onChange={e => handleFormChange('category', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Location Found *</label>
                <input
                  type="text"
                  value={form.locationFound}
                  onChange={e => handleFormChange('locationFound', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  placeholder="e.g. Camp 3, near water distribution point"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Contact Info *</label>
                <input
                  type="text"
                  value={form.contactInfo}
                  onChange={e => handleFormChange('contactInfo', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  placeholder="Camp office location or phone"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => handleFormChange('description', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white resize-none"
                  placeholder="Describe the item (color, brand, distinguishing features)..."
                  rows={3}
                />
              </div>

              {editingItem && (
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Status</label>
                  <select
                    value={form.status || editingItem.status}
                    onChange={e => handleFormChange('status', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  >
                    <option value="Lost">Lost</option>
                    <option value="Found">Found</option>
                    <option value="Claimed">Claimed</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-gray-800">
              <button
                onClick={() => setShowFormModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-charcoal dark:text-white hover:bg-slate-50 dark:hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <LoadingButton
                onClick={handleSave}
                loading={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-saffron-glow"
              >
                <Save className="w-4 h-4" />
                {editingItem ? 'Save Changes' : 'Create Item'}
              </LoadingButton>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Item Entry"
        messageKey="admin.common.confirm"
      />

    </div>
  );
}
