"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Plus, Trash2, Calendar, MapPin, Users, Save, X, Edit3, Image as ImageIcon, Eye, Loader2 } from 'lucide-react';
import Toast from '@/components/Toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import LoadingButton from '@/components/LoadingButton';
import Modal from '@/components/Modal';

const FORM_DEFAULTS = {
  title: '',
  description: '',
  venue: '',
  activityDate: new Date().toISOString().slice(0, 10),
  startTime: '',
  endTime: '',
  posterUrl: '',
  boysCount: 0,
  girlsCount: 0,
  status: 'draft',
};

export default function NssActivitiesAdmin() {
  const { t } = useLanguage();

  const [activities, setActivities] = useState([]);
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

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/nss-activities?limit=100');
      if (!res.ok) throw new Error('Failed to load activities');
      const json = await res.json();
      if (json.success && json.data?.items) {
        const mapped = json.data.items.map(item => ({
          ...item,
          id: item.activityId,
        }));
        setActivities(mapped);
      } else {
        setActivities([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleParticipantChange = (field, value) => {
    const numValue = value === '' ? 0 : Math.max(0, parseInt(value, 10) || 0);
    setForm(prev => {
      const updated = { ...prev, [field]: numValue };
      return updated;
    });
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...FORM_DEFAULTS, activityDate: new Date().toISOString().slice(0, 10) });
    setShowFormModal(true);
  };

  const openEditModal = (activity) => {
    setEditingId(activity.activityId);
    setForm({
      title: activity.title || '',
      description: activity.description || '',
      venue: activity.venue || '',
      activityDate: activity.activityDate
        ? new Date(activity.activityDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      startTime: activity.startTime || '',
      endTime: activity.endTime || '',
      posterUrl: activity.posterUrl || '',
      boysCount: activity.boysCount || 0,
      girlsCount: activity.girlsCount || 0,
      status: activity.status || 'draft',
    });
    setShowFormModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.venue) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        activityDate: new Date(form.activityDate).toISOString(),
        boysCount: Number(form.boysCount) || 0,
        girlsCount: Number(form.girlsCount) || 0,
      };

      if (editingId) {
        const res = await fetch(`/api/nss-activities/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Failed to update activity');
        }
        const json = await res.json();
        if (json.success && json.data) {
          setActivities(prev => prev.map(a =>
            a.activityId === editingId
              ? { ...a, ...json.data, id: json.data.activityId }
              : a
          ));
        }
        showToast('Activity updated successfully');
      } else {
        const res = await fetch('/api/nss-activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Failed to create activity');
        }
        const fetchRes = await fetch('/api/nss-activities?limit=100');
        if (fetchRes.ok) {
          const fetchJson = await fetchRes.json();
          if (fetchJson.success && fetchJson.data?.items) {
            const mapped = fetchJson.data.items.map(item => ({
              ...item,
              id: item.activityId,
            }));
            setActivities(mapped);
          }
        }
        showToast('Activity created successfully');
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
      const res = await fetch(`/api/nss-activities/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete activity');
      setActivities(prev => prev.filter(a => a.activityId !== deletingId));
      showToast('Activity deleted successfully');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
      setIsDeleting(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      published: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30",
      draft: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    };
    return styles[status] || styles.draft;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-64 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-96" />
        </div>
        <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t("admin.activities.title")} Desk
          </h1>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button
            onClick={fetchActivities}
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

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t("admin.activities.title")} Desk
          </h1>
          <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
            {t("admin.activities.subtitle")}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-bold transition-all shadow-saffron-glow focus:outline-none self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {t("admin.activities.add_btn")}
        </button>
      </div>

      {/* Activity List - DataTable Style */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-slate-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-gray-800 flex items-center justify-center text-slate-400 dark:text-gray-500 mb-4.5">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="font-heading text-base font-bold text-charcoal dark:text-white text-center">
              {t("admin.activities.empty_title")}
            </h3>
            <p className="mt-2 text-sm text-charcoal-light dark:text-gray-400 text-center max-w-xs leading-relaxed">
              {t("admin.activities.empty_desc")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-gray-850">
              <thead className="bg-slate-50/70 dark:bg-gray-950/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-charcoal-light dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    {t("admin.activities.poster")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-charcoal-light dark:text-gray-400 uppercase tracking-wider">
                    {t("admin.activities.title")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-charcoal-light dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    {t("admin.activities.date")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-charcoal-light dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    {t("admin.activities.venue")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-charcoal-light dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    {t("admin.activities.status")}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-extrabold text-charcoal-light dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    {t("admin.activities.boys")}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-extrabold text-charcoal-light dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    {t("admin.activities.girls")}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-extrabold text-charcoal-light dark:text-gray-400 uppercase tracking-wider">
                    {t("admin.activities.total")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-extrabold text-charcoal-light dark:text-gray-400 uppercase tracking-wider">
                    {t("admin.common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-850 bg-white dark:bg-gray-900">
                {activities.map((act) => (
                  <tr key={act.activityId} className="hover:bg-slate-50/45 dark:hover:bg-gray-850/40 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                      {act.posterUrl ? (
                        <img
                          src={act.posterUrl}
                          alt=""
                          className="w-16 h-10 object-cover rounded-lg border border-slate-200 dark:border-gray-700"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-16 h-10 bg-slate-100 dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-slate-400 dark:text-gray-600" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-heading text-xs font-extrabold text-charcoal dark:text-white truncate max-w-xs sm:max-w-md">
                        {act.title}
                      </div>
                      <div className="text-[10px] text-charcoal-light dark:text-gray-400 truncate max-w-xs sm:max-w-md mt-0.5">
                        {act.description}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell text-xs font-semibold text-charcoal dark:text-white">
                      {formatDate(act.activityDate)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-light dark:text-gray-400 truncate max-w-xs">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        {act.venue}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(act.status)}`}>
                        {t(`admin.activities.status_${act.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center hidden md:table-cell">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{act.boysCount || 0}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center hidden md:table-cell">
                      <span className="text-xs font-bold text-pink-600 dark:text-pink-400">{act.girlsCount || 0}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 dark:bg-primary-dark/20 dark:text-primary-light dark:border-primary-dark/30">
                        <Users className="w-3 h-3 mr-1" />
                        {act.totalParticipants || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(act)}
                          className="p-2 border border-slate-200 dark:border-gray-800 text-charcoal-light hover:text-primary hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl transition-all focus:outline-none"
                          aria-label={t("admin.common.edit")}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrigger(act.activityId)}
                          className="p-2 border border-slate-200 dark:border-gray-800 text-charcoal-light hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all focus:outline-none"
                          aria-label={t("admin.common.delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal Dialog */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowFormModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/60 dark:border-gray-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-extrabold text-charcoal dark:text-white">
                {editingId ? t("admin.activities.edit_title") : t("admin.activities.add_title")}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4 text-xs font-semibold">
              {/* Title */}
              <div>
                <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">
                  {t("admin.activities.title_label")} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("admin.activities.placeholder_title")}
                  value={form.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">
                  {t("admin.activities.desc_label")} *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={t("admin.activities.placeholder_desc")}
                  value={form.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white resize-none"
                />
              </div>

              {/* Venue */}
              <div>
                <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">
                  {t("admin.activities.venue_label")} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("admin.activities.placeholder_venue")}
                  value={form.venue}
                  onChange={(e) => handleFormChange('venue', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">
                    {t("admin.activities.date_label")}
                  </label>
                  <input
                    type="date"
                    required
                    value={form.activityDate}
                    onChange={(e) => handleFormChange('activityDate', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">
                    {t("admin.activities.start_time_label")}
                  </label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => handleFormChange('startTime', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">
                    {t("admin.activities.end_time_label")}
                  </label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => handleFormChange('endTime', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>
              </div>

              {/* Poster URL */}
              <div>
                <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">
                  {t("admin.activities.poster_label")}
                </label>
                <input
                  type="url"
                  placeholder={t("admin.activities.poster_placeholder")}
                  value={form.posterUrl}
                  onChange={(e) => handleFormChange('posterUrl', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                />
                {form.posterUrl && (
                  <div className="mt-2">
                    <img
                      src={form.posterUrl}
                      alt="Poster preview"
                      className="max-w-xs h-auto rounded-lg border border-slate-200 dark:border-gray-700"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              {/* Participants */}
              <div className="bg-slate-50 dark:bg-gray-850 rounded-2xl p-4 border border-slate-200 dark:border-gray-800">
                <h4 className="font-heading text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider mb-3">
                  {t("admin.activities.participants_title")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">
                      {t("admin.activities.boys_label")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.boysCount}
                      onChange={(e) => handleParticipantChange('boysCount', e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary dark:text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">
                      {t("admin.activities.girls_label")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.girlsCount}
                      onChange={(e) => handleParticipantChange('girlsCount', e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary dark:text-white text-center"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase w-full">
                      {t("admin.activities.total_label")}
                    </label>
                    <div className="w-full bg-primary/10 dark:bg-primary-dark/20 border border-primary/20 dark:border-primary-dark/30 rounded-2xl px-4 py-3 text-center">
                      <span className="font-heading text-lg font-extrabold text-primary dark:text-primary-light">
                        {Number(form.boysCount) + Number(form.girlsCount)}
                      </span>
                      <div className="text-[10px] text-primary/80 dark:text-primary-light/80 mt-0.5">
                        {t("admin.activities.total_auto")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">
                  {t("admin.activities.status_label")}
                </label>
                <select
                  value={form.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-xs focus:outline-none cursor-pointer dark:text-white"
                >
                  <option value="draft">{t("admin.activities.status_draft")}</option>
                  <option value="published">{t("admin.activities.status_published")}</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-gray-800 text-charcoal-light dark:text-gray-400 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-850 text-xs font-bold"
                >
                  {t("admin.common.cancel")}
                </button>
                <LoadingButton
                  type="submit"
                  loading={isSubmitting}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-saffron-glow text-xs font-bold"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  {editingId ? t("admin.common.save_changes") : t("admin.activities.add_btn")}
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title={t("admin.activities.delete_title")}
        messageKey="admin.common.confirm"
      />

    </div>
  );
}