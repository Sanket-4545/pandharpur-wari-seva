"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Plus, Calendar, Tag, Trash2, Megaphone, Save, X, Edit3 } from 'lucide-react';
import Toast from '@/components/Toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import LoadingButton from '@/components/LoadingButton';
import Modal from '@/components/Modal';


const FORM_DEFAULTS = {
  title: '',
  description: '',
  category: 'safety',
  priority: 'high',
  status: 'published',
  publishDate: new Date().toISOString().slice(0, 16),
};

export default function AnnouncementsAdmin() {
  const { t } = useLanguage();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const [form, setForm] = useState({ ...FORM_DEFAULTS });
  const [editingId, setEditingId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, visible: true });
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/announcements?limit=100');
      if (!res.ok) throw new Error('Failed to load announcements');
      const json = await res.json();
      if (json.success && json.data?.items) {
        const mapped = json.data.items.map(item => ({
          ...item,
          id: item.announcementId,
        }));
        setAnnouncements(mapped);
      } else {
        setAnnouncements([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...FORM_DEFAULTS, publishDate: new Date().toISOString().slice(0, 16) });
    setShowFormModal(true);
  };

  const openEditModal = (announcement) => {
    setEditingId(announcement.announcementId);
    setForm({
      title: announcement.title || '',
      description: announcement.description || '',
      category: announcement.category || 'safety',
      priority: announcement.priority || 'medium',
      status: announcement.status || 'draft',
      publishDate: announcement.publishDate
        ? new Date(announcement.publishDate).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    });
    setShowFormModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        publishDate: new Date(form.publishDate).toISOString(),
      };

      if (editingId) {
        const res = await fetch(`/api/announcements/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Failed to update announcement');
        }
        const json = await res.json();
        if (json.success && json.data) {
          setAnnouncements(prev => prev.map(a =>
            a.announcementId === editingId
              ? { ...a, ...json.data, id: json.data.announcementId }
              : a
          ));
        }
        showToast('Announcement updated successfully');
      } else {
        const res = await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Failed to create announcement');
        }
        const fetchRes = await fetch('/api/announcements?limit=100');
        if (fetchRes.ok) {
          const fetchJson = await fetchRes.json();
          if (fetchJson.success && fetchJson.data?.items) {
            const mapped = fetchJson.data.items.map(item => ({
              ...item,
              id: item.announcementId,
            }));
            setAnnouncements(mapped);
          }
        }
        showToast('Announcement created successfully');
      }
      setShowFormModal(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrigger = (id) => {
    setDeletingId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/announcements/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete announcement');
      setAnnouncements(prev => prev.filter(a => a.announcementId !== deletingId));
      showToast('Announcement deleted successfully');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
      setIsDeleting(false);
    }
  };

  const getPriorityStyle = (p) => {
    const styles = {
      high: "bg-red-50 text-red-650 border-red-200/50",
      medium: "bg-amber-50 text-amber-650 border-amber-200/50",
      low: "bg-slate-55 text-slate-600 border-slate-200/50",
    };
    return styles[p?.toLowerCase()] || styles.low;
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-7">
        <div>
          <div className="h-7 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-64 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-7">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t("admin.sidebar.announcements")} Desk
          </h1>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button
            onClick={fetchAnnouncements}
            className="mt-4 text-primary underline text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      {/* Page Header */}
      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
          {t("admin.sidebar.announcements")} Desk
        </h1>
        <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
          Broadcast warnings, dynamic halting delays, and medical desk availability updates to the public news stream.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side: Create Form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Create Form Card */}
          <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
            <h3 className="font-heading text-sm font-bold text-charcoal dark:text-white uppercase tracking-wider mb-5">
              {t("admin.announcements.create_title")}
            </h3>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">

                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 dark:text-gray-505 mb-1.5 uppercase">
                    {t("admin.announcements.title_label")}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t("admin.announcements.placeholder_title")}
                    value={form.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-slate-400 dark:text-gray-505 mb-1.5 uppercase">
                    {t("admin.announcements.category_label")}
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none cursor-pointer dark:text-white"
                  >
                    <option value="safety">Safety Alerts</option>
                    <option value="schedule">Schedule & Routes</option>
                    <option value="camp">Medical Camp Halts</option>
                    <option value="general">General Advisories</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-slate-400 dark:text-gray-505 mb-1.5 uppercase">
                    {t("admin.announcements.priority_label")}
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => handleFormChange('priority', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none cursor-pointer dark:text-white"
                  >
                    <option value="high">High Importance</option>
                    <option value="medium">Medium Importance</option>
                    <option value="low">Low Importance</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-slate-400 dark:text-gray-505 mb-1.5 uppercase">
                    {t("admin.announcements.status_label")}
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none cursor-pointer dark:text-white"
                  >
                    <option value="published">Publish Now</option>
                    <option value="draft">Save Draft</option>
                    <option value="scheduled">Schedule Later</option>
                  </select>
                </div>

                {/* Publish Date */}
                <div>
                  <label className="block text-slate-400 dark:text-gray-505 mb-1.5 uppercase">
                    {t("admin.announcements.publish_date")}
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={form.publishDate}
                    onChange={(e) => handleFormChange('publishDate', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none dark:text-white"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 dark:text-gray-550 mb-1.5 uppercase">
                    {t("admin.announcements.desc_label")}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={t("admin.announcements.placeholder_desc")}
                    value={form.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-gray-850">
                <LoadingButton
                  onClick={handleSave}
                  loading={isSubmitting}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-2xl shadow-saffron-glow transition-all focus:outline-none text-xs font-bold"
                >
                  <Megaphone className="w-4 h-4 mr-1.5" />
                  {t("admin.announcements.btn_publish")}
                </LoadingButton>
              </div>
            </form>
          </div>

        </div>

        {/* Right Side: Directory list */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
          <h3 className="font-heading text-sm font-bold text-charcoal dark:text-white uppercase tracking-wider pb-4 mb-4 border-b border-slate-100 dark:border-gray-850">
            {t("admin.announcements.create_title").split(" ")[1]} Directory
          </h3>

          {announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-slate-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-gray-800 flex items-center justify-center text-slate-400 dark:text-gray-500 mb-4.5">
                <Megaphone className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-base font-bold text-charcoal dark:text-white text-center">
                No announcements yet
              </h3>
              <p className="mt-2 text-sm text-charcoal-light dark:text-gray-400 text-center max-w-xs leading-relaxed">
                Create your first announcement using the form on the left.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.announcementId} className="p-3 border border-slate-150 dark:border-gray-800 rounded-2xl relative group hover:border-primary/20 transition-all">
                  <div className="flex justify-between items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded border text-[8px] font-bold uppercase tracking-wider ${getPriorityStyle(ann.priority)}`}>
                      {ann.priority}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(ann)}
                        className="p-1 rounded text-slate-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all focus:outline-none"
                        aria-label="Edit announcement"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTrigger(ann.announcementId)}
                        className="p-1 rounded text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-955/20 transition-all focus:outline-none"
                        aria-label="Delete announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h5 className="mt-2 font-heading text-xs font-extrabold text-charcoal dark:text-white leading-tight truncate pr-4">
                    {ann.title}
                  </h5>
                  <p className="mt-1 text-[10px] text-charcoal-light dark:text-gray-400 leading-normal line-clamp-2 pr-2">
                    {ann.description}
                  </p>

                  <div className="mt-3.5 flex items-center justify-between text-[8px] font-bold text-slate-400 dark:text-gray-500">
                    <span className="bg-slate-100 dark:bg-gray-850 px-1.5 py-0.5 rounded uppercase">
                      {ann.category}
                    </span>
                    <span>
                      {new Date(ann.publishDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Create/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowFormModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/60 dark:border-gray-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-extrabold text-charcoal dark:text-white">
                {editingId ? 'Edit Announcement' : 'Add New Announcement'}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.announcements.title_label")} *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => handleFormChange('title', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  placeholder={t("admin.announcements.placeholder_title")}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.announcements.desc_label")} *</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={e => handleFormChange('description', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white resize-none"
                  placeholder={t("admin.announcements.placeholder_desc")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.announcements.category_label")}</label>
                  <select
                    value={form.category}
                    onChange={e => handleFormChange('category', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  >
                    <option value="safety">Safety Alerts</option>
                    <option value="schedule">Schedule & Routes</option>
                    <option value="camp">Medical Camp Halts</option>
                    <option value="general">General Advisories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.announcements.priority_label")}</label>
                  <select
                    value={form.priority}
                    onChange={e => handleFormChange('priority', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.announcements.status_label")}</label>
                  <select
                    value={form.status}
                    onChange={e => handleFormChange('status', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.announcements.publish_date")}</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.publishDate}
                    onChange={e => handleFormChange('publishDate', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  />
                </div>
              </div>
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
                <Save className="w-4 h-4 mr-1" />
                {editingId ? 'Save Changes' : 'Create'}
              </LoadingButton>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Announcement"
        messageKey="admin.common.confirm"
      />

    </div>
  );
}