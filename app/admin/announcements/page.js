"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useRole } from '@/context/AdminAuthContext';
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

function createEmptyForm() {
  return {
    ...FORM_DEFAULTS,
    publishDate: new Date().toISOString().slice(0, 16),
  };
}

async function getApiErrorMessage(response, fallback) {
  try {
    const json = await response.json();
    return json?.error || `${fallback} (HTTP ${response.status})`;
  } catch {
    return `${fallback} (HTTP ${response.status})`;
  }
}

export default function AnnouncementsAdmin() {
  const { t } = useLanguage();
  const role = useRole();
  const canManage = role === 'super_admin' || role === 'admin';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const [createForm, setCreateForm] = useState(createEmptyForm);
  const [editForm, setEditForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [archivingId, setArchivingId] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState('draft');
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  const deletingAnnouncement = announcements.find(a => a.announcementId === deletingId);
  const archivingAnnouncement = announcements.find(a => a.announcementId === archivingId);
  const restoringAnnouncement = announcements.find(a => a.announcementId === restoringId);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, visible: true });
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/announcements?limit=100');
      if (!res.ok) throw new Error(await getApiErrorMessage(res, 'Failed to load announcements'));
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

  const handleCreateChange = (field, value) => {
    setCreateForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const closeEditModal = () => {
    setShowFormModal(false);
    setEditingId(null);
    setEditForm(createEmptyForm());
  };

  const openEditModal = (announcement) => {
    const announcementId = announcement.announcementId;
    if (!announcementId) {
      showToast('Cannot edit this announcement because its announcement ID is missing. Repair the record first.', 'error');
      return;
    }
    setEditingId(announcementId);
    setEditForm({
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

  const handleCreate = async () => {
    if (!createForm.title || !createForm.description) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setIsCreating(true);
    try {
      const payload = {
        ...createForm,
        publishDate: new Date(createForm.publishDate).toISOString(),
      };

      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, 'Failed to create announcement'));
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
      setCreateForm(createEmptyForm());
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) {
      showToast('Cannot update this announcement because its announcement ID is missing. Repair the record first.', 'error');
      return;
    }
    if (!editForm.title || !editForm.description) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setIsUpdating(true);
    try {
      const payload = {
        ...editForm,
        publishDate: new Date(editForm.publishDate).toISOString(),
      };

      const res = await fetch(`/api/announcements/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, 'Failed to update announcement'));
      }
      const json = await res.json();
      if (json.success && json.data) {
        // Refetch the full list so that automatic demotions (e.g. when
        // publishing this announcement, the previously published one is
        // demoted to draft in the same transaction) are reflected in the UI.
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
      }
      showToast('Announcement updated successfully');
      closeEditModal();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTrigger = (id) => {
    if (!id) {
      showToast('Cannot delete this announcement because its announcement ID is missing. Repair the record first.', 'error');
      return;
    }
    setDeletingId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/announcements/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await getApiErrorMessage(res, 'Failed to delete announcement'));
      setAnnouncements(prev => prev.filter(a => a.announcementId !== deletingId));
      showToast('Announcement deleted successfully');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
      setIsDeleting(false);
    }
  };

  const handleArchiveTrigger = (id) => {
    if (!id) {
      showToast('Cannot archive this announcement because its announcement ID is missing. Repair the record first.', 'error');
      return;
    }
    setArchivingId(id);
  };

  const handleArchiveConfirm = async () => {
    if (!archivingId) return;
    setIsArchiving(true);
    try {
      const res = await fetch(`/api/announcements/${archivingId}/archive`, { method: 'POST' });
      if (!res.ok) throw new Error(await getApiErrorMessage(res, t('admin.announcements.toast_archive_error')));
      await fetchAnnouncements();
      showToast(t('admin.announcements.toast_archived'));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setArchivingId(null);
      setIsArchiving(false);
    }
  };

  const handleRestoreTrigger = (id, status) => {
    if (!id) {
      showToast('Cannot restore this announcement because its announcement ID is missing. Repair the record first.', 'error');
      return;
    }
    setRestoringId(id);
    setRestoreStatus(status);
    setShowRestoreDialog(true);
  };

  const handleRestoreConfirm = async () => {
    if (!restoringId) return;
    setIsRestoring(true);
    try {
      const res = await fetch(`/api/announcements/${restoringId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: restoreStatus }),
      });
      if (!res.ok) throw new Error(await getApiErrorMessage(res, t('admin.announcements.toast_restore_error')));
      await fetchAnnouncements();
      showToast(t('admin.announcements.toast_restored'));
      setShowRestoreDialog(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setRestoringId(null);
      setIsRestoring(false);
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

            <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-4 text-xs font-semibold">
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
                    value={createForm.title}
                    onChange={(e) => handleCreateChange('title', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-slate-400 dark:text-gray-505 mb-1.5 uppercase">
                    {t("admin.announcements.category_label")}
                  </label>
                  <select
                    value={createForm.category}
                    onChange={(e) => handleCreateChange('category', e.target.value)}
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
                    value={createForm.priority}
                    onChange={(e) => handleCreateChange('priority', e.target.value)}
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
                    value={createForm.status}
                    onChange={(e) => handleCreateChange('status', e.target.value)}
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
                    value={createForm.publishDate}
                    onChange={(e) => handleCreateChange('publishDate', e.target.value)}
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
                    value={createForm.description}
                    onChange={(e) => handleCreateChange('description', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-gray-850">
                <LoadingButton
                  onClick={handleCreate}
                  loading={isCreating}
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
              {announcements.map((ann) => {
                const hasAnnouncementId = Boolean(ann.announcementId);
                return (
                  <div key={ann.announcementId || ann._id} className="p-3 border border-slate-150 dark:border-gray-800 rounded-2xl relative group hover:border-primary/20 transition-all">
                    <div className="flex justify-between items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded border text-[8px] font-bold uppercase tracking-wider ${getPriorityStyle(ann.priority)}`}>
                        {ann.priority}
                      </span>

                      {canManage && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(ann)}
                            disabled={!hasAnnouncementId}
                            title={hasAnnouncementId ? 'Edit announcement' : 'Announcement ID is missing; editing is disabled'}
                            className="p-1 rounded text-slate-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Edit announcement"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {ann.status === 'archived' ? (
                            <>
                              <button
                                onClick={() => handleRestoreTrigger(ann.announcementId, 'draft')}
                                disabled={!hasAnnouncementId || isRestoring}
                                title={
                                  !hasAnnouncementId
                                    ? 'Announcement ID is missing; restore is disabled'
                                    : 'Restore as draft'
                                }
                                className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-955/20 transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Restore as draft"
                              >
                                <span className="text-[8px] font-bold uppercase">Draft</span>
                              </button>
                              <button
                                onClick={() => handleRestoreTrigger(ann.announcementId, 'published')}
                                disabled={!hasAnnouncementId || isRestoring}
                                title={
                                  !hasAnnouncementId
                                    ? 'Announcement ID is missing; restore is disabled'
                                    : 'Restore and publish'
                                }
                                className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-955/20 transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Restore and publish"
                              >
                                <span className="text-[8px] font-bold uppercase">Publish</span>
                              </button>
                            </>
                          ) : (
                            <>
                              {(ann.status === 'published' || ann.status === 'scheduled') && (
                                <button
                                  onClick={() => handleArchiveTrigger(ann.announcementId)}
                                  disabled={!hasAnnouncementId || isArchiving}
                                  title={
                                    !hasAnnouncementId
                                      ? 'Announcement ID is missing; archiving is disabled'
                                      : 'Archive announcement'
                                  }
                                  className="p-1 rounded text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-955/20 transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                                  aria-label="Archive announcement"
                                >
                                  <span className="text-[8px] font-bold uppercase">Archive</span>
                                </button>
                              )}
                            </>
                          )}

                          <button
                            onClick={() => handleDeleteTrigger(ann.announcementId)}
                            disabled={!hasAnnouncementId}
                            title={hasAnnouncementId ? 'Delete announcement' : 'Announcement ID is missing; deletion is disabled'}
                            className="p-1 rounded text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-955/20 transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Delete announcement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h5 className="mt-2 font-heading text-xs font-extrabold text-charcoal dark:text-white leading-tight truncate pr-4">
                      {ann.title}
                    </h5>
                    <p className="mt-1 text-[10px] text-charcoal-light dark:text-gray-400 leading-normal line-clamp-2 pr-2">
                      {ann.description}
                    </p>

                    {!hasAnnouncementId && (
                      <p className="mt-2 text-[10px] font-semibold text-amber-600 dark:text-amber-400 leading-normal">
                        This record is missing its announcement ID, so it cannot be edited or deleted until the data is repaired.
                      </p>
                    )}

                    <div className="mt-3.5 flex items-center justify-between text-[8px] font-bold text-slate-400 dark:text-gray-500">
                      <span className="bg-slate-100 dark:bg-gray-850 px-1.5 py-0.5 rounded uppercase">
                        {ann.category}
                      </span>
                      <span>
                        {(() => {
                          const d = new Date(ann.publishDate);
                          return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
                        })()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeEditModal} />
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/60 dark:border-gray-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-extrabold text-charcoal dark:text-white">
                Edit Announcement
              </h2>
              <button onClick={closeEditModal} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.announcements.title_label")} *</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={e => handleEditChange('title', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  placeholder={t("admin.announcements.placeholder_title")}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.announcements.desc_label")} *</label>
                <textarea
                  rows={3}
                  required
                  value={editForm.description}
                  onChange={e => handleEditChange('description', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white resize-none"
                  placeholder={t("admin.announcements.placeholder_desc")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.announcements.category_label")}</label>
                  <select
                    value={editForm.category}
                    onChange={e => handleEditChange('category', e.target.value)}
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
                    value={editForm.priority}
                    onChange={e => handleEditChange('priority', e.target.value)}
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
                    value={editForm.status}
                    onChange={e => handleEditChange('status', e.target.value)}
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
                    value={editForm.publishDate}
                    onChange={e => handleEditChange('publishDate', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-gray-800">
              <button
                onClick={closeEditModal}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-charcoal dark:text-white hover:bg-slate-50 dark:hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <LoadingButton
                onClick={handleUpdate}
                loading={isUpdating}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-saffron-glow"
              >
                <Save className="w-4 h-4 mr-1" />
                Save Changes
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
        message={
          deletingAnnouncement
            ? `Delete "${deletingAnnouncement.title}"? This will permanently remove it.`
            : 'This will permanently remove the announcement.'
        }
        confirmLabel={t('admin.common.delete')}
      />

      <ConfirmationDialog
        isOpen={!!archivingId}
        onClose={() => setArchivingId(null)}
        onConfirm={handleArchiveConfirm}
        title={t('admin.announcements.confirm_archive_title')}
        message={
          archivingAnnouncement
            ? t('admin.announcements.confirm_archive_message')
            : 'This will archive the announcement.'
        }
        confirmLabel={t('admin.announcements.btn_archive')}
      />

      <ConfirmationDialog
        isOpen={showRestoreDialog}
        onClose={() => setShowRestoreDialog(false)}
        onConfirm={handleRestoreConfirm}
        title={t('admin.announcements.confirm_restore_title')}
        message={t('admin.announcements.confirm_restore_message')}
        confirmLabel={
          restoreStatus === 'published'
            ? t('admin.announcements.confirm_restore_published')
            : t('admin.announcements.confirm_restore_draft')
        }
      />

    </div>
  );
}