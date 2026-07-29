"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { bloodGroups, shifts, skills as allSkills, languages as allLanguages } from '@/data/volunteers';
import { useLanguage } from '@/context/LanguageContext';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import Toast from '@/components/Toast';
import LoadingButton from '@/components/LoadingButton';
import { AlertCircle, Plus, Eye, Trash2, Calendar, Phone, CheckCircle, XCircle, Save, X } from 'lucide-react';

const FORM_DEFAULTS = {
  name: '', email: '', phone: '', gender: 'Male', age: '',
  city: '', college: '', nssUnit: '', bloodGroup: 'O+',
  emergencyPhone: '', skills: [], languages: [], shift: 'morning', status: 'pending',
};

export default function VolunteersAdmin() {
  const { t } = useLanguage();

  // Data state
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  // Dialog/Modal states
  const [viewingRow, setViewingRow] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [form, setForm] = useState(FORM_DEFAULTS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, visible: true });
  }, []);

  // Fetch volunteers from API
  useEffect(() => {
    async function fetchVolunteers() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/volunteers?limit=100');
        if (!res.ok) throw new Error(t('admin.volunteers.error'));
        const json = await res.json();
        if (json.success && json.data?.items) {
          const mapped = json.data.items.map(item => ({
            ...item,
            id: item.volunteerId,
          }));
          setVolunteers(mapped);
        } else {
          setVolunteers([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchVolunteers();
  }, []);

  // Table Columns config
  const columns = [
    { key: "volunteerId", label: t('admin.volunteers.column_id') },
    { key: "name", label: t('admin.volunteers.column_name'), sortable: true },
    { key: "college", label: t('admin.volunteers.column_college'), sortable: true },
    { key: "nssUnit", label: t('admin.volunteers.column_nss_unit') },
    {
      key: "shift",
      label: t('admin.volunteers.column_shift'),
      render: (row) => {
        const shiftObj = shifts.find(s => s.value === row.shift);
        return shiftObj ? t(shiftObj.labelKey).split(' ')[0] : row.shift;
      }
    },
    { key: "status", label: t('admin.volunteers.column_status') }
  ];

  // View row
  const handleView = (row) => {
    setViewingRow(row);
  };

  // Delete flow
  const handleDeleteTrigger = (id) => {
    setDeletingId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/volunteers/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete volunteer');
      setVolunteers(prev => prev.filter(v => v.volunteerId !== deletingId));
      showToast(t('admin.volunteers.toast_deleted'));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Status update
  const handleUpdateStatus = async (volunteerId, newStatus) => {
    try {
      const res = await fetch(`/api/volunteers/${volunteerId}`, {
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
        setVolunteers(prev => prev.map(v =>
          v.volunteerId === volunteerId ? { ...v, ...json.data, id: json.data.volunteerId } : v
        ));
        if (viewingRow && viewingRow.volunteerId === volunteerId) {
          setViewingRow(prev => ({ ...prev, ...json.data }));
        }
      }
      if (newStatus === 'approved') {
        showToast(t('admin.volunteers.toast_approved'));
      } else if (newStatus === 'rejected') {
        showToast(t('admin.volunteers.toast_rejected'));
      } else {
        showToast(t('admin.volunteers.toast_status_updated'));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingVolunteer(null);
    setForm({ ...FORM_DEFAULTS });
    setShowFormModal(true);
  };

  // Open edit modal
  const openEditModal = (volunteer) => {
    setEditingVolunteer(volunteer);
    setForm({
      name: volunteer.name || '',
      email: volunteer.email || '',
      phone: volunteer.phone || '',
      gender: volunteer.gender || 'Male',
      age: volunteer.age || '',
      city: volunteer.city || '',
      college: volunteer.college || '',
      nssUnit: volunteer.nssUnit || '',
      bloodGroup: volunteer.bloodGroup || 'O+',
      emergencyPhone: volunteer.emergencyPhone || '',
      skills: volunteer.skills || [],
      languages: volunteer.languages || [],
      shift: volunteer.shift || 'morning',
      status: volunteer.status || 'pending',
    });
    setShowFormModal(true);
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleArrayField = (field, value) => {
    setForm(prev => {
      const arr = prev[field] || [];
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter(v => v !== value) };
      }
      return { ...prev, [field]: [...arr, value] };
    });
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!form.name || !form.email || !form.phone || !form.city || !form.college || !form.nssUnit || !form.emergencyPhone) {
      showToast(t('admin.common.required'), 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        age: Number(form.age),
      };

      if (editingVolunteer) {
        // Update
        const res = await fetch(`/api/volunteers/${editingVolunteer.volunteerId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || t('admin.volunteers.toast_updated').replace(' successfully', ''));
        }
        const json = await res.json();
        if (json.success && json.data) {
          setVolunteers(prev => prev.map(v =>
            v.volunteerId === editingVolunteer.volunteerId
              ? { ...v, ...json.data, id: json.data.volunteerId }
              : v
          ));
        }
        showToast(t('admin.volunteers.toast_updated'));
      } else {
        // Create
        const res = await fetch('/api/volunteers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || t('admin.volunteers.toast_created').replace(' successfully', ''));
        }
        // Re-fetch to get full list with new record
        const fetchRes = await fetch('/api/volunteers?limit=100');
        if (fetchRes.ok) {
          const fetchJson = await fetchRes.json();
          if (fetchJson.success && fetchJson.data?.items) {
            const mapped = fetchJson.data.items.map(item => ({
              ...item,
              id: item.volunteerId,
            }));
            setVolunteers(mapped);
          }
        }
        showToast(t('admin.volunteers.toast_created'));
      }
      setShowFormModal(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Loading skeleton ----
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

  // ---- Error state ----
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t("admin.volunteers.title")}
          </h1>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-primary underline text-sm"
          >
            {t('admin.volunteers.retry')}
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
            {t("admin.volunteers.title")}
          </h1>
          <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
            {t('admin.volunteers.subtitle')}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-bold transition-all shadow-saffron-glow focus:outline-none self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {t('admin.volunteers.add_button')}
        </button>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 text-xs text-charcoal-light dark:text-gray-400">
        <span><strong className="text-charcoal dark:text-white">{volunteers.length}</strong> {t('admin.volunteers.summary_total')}</span>
        <span><strong className="text-emerald-650 dark:text-emerald-400">{volunteers.filter(v => v.status === 'approved').length}</strong> {t('admin.volunteers.summary_approved')}</span>
        <span><strong className="text-amber-650 dark:text-amber-400">{volunteers.filter(v => v.status === 'pending').length}</strong> {t('admin.volunteers.summary_pending')}</span>
        <span><strong className="text-red-650 dark:text-red-400">{volunteers.filter(v => v.status === 'rejected').length}</strong> {t('admin.volunteers.summary_rejected')}</span>
      </div>

      {/* Main Table */}
      {volunteers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-charcoal-light dark:text-gray-400">{t('admin.volunteers.no_volunteers')}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={volunteers}
          searchPlaceholderKey="admin.common.search"
          onViewRow={handleView}
          onDeleteRow={handleDeleteTrigger}
          exportFilename="volunteers-list.csv"
        />
      )}

      {/* View Volunteer Details Modal */}
      {viewingRow && (
        <Modal
          isOpen={!!viewingRow}
          onClose={() => setViewingRow(null)}
          title={`${t('admin.volunteers.view_title')}: ${viewingRow.name}`}
        >
          <div className="space-y-4">

            {/* Visual avatar badge placeholder */}
            <div className="w-full h-24 rounded-2xl bg-gradient-to-tr from-secondary to-blue-800 flex items-center justify-between px-6 text-white relative shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-heading text-lg font-bold">
                  {viewingRow.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-sm">{viewingRow.name}</h4>
                  <p className="text-[10px] text-blue-100">{viewingRow.email}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${
                viewingRow.status === 'approved'
                  ? 'bg-emerald-50 text-emerald-650 border-emerald-200'
                  : viewingRow.status === 'pending'
                  ? 'bg-amber-50 text-amber-650 border-amber-200'
                  : 'bg-red-50 text-red-650 border-red-200'
              }`}>
                {viewingRow.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">{t('admin.volunteers.college_name')}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block leading-normal">
                  {viewingRow.college}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">{t('admin.volunteers.contact_details')}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">
                  {t('admin.volunteers.ph')} {viewingRow.phone} <br />
                  {t('admin.volunteers.age')} {viewingRow.age} {t('admin.volunteers.yrs')}, {viewingRow.gender}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">{t('admin.volunteers.skills_competences')}</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(viewingRow.skills || []).map(sk => {
                    const skObj = allSkills.find(s => s.value === sk);
                    return (
                      <span key={sk} className="bg-slate-200 dark:bg-gray-700 text-charcoal dark:text-gray-300 px-2 py-0.5 rounded text-[10px] font-bold">
                        {skObj ? t(skObj.labelKey) : sk}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">{t('admin.volunteers.shift_location')}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">
                  {t('admin.volunteers.shift_label')} {(viewingRow.shift || '').toUpperCase()} <br />
                  {t('admin.volunteers.blood_group_label')} {viewingRow.bloodGroup}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">{t('admin.volunteers.emergency_contact')}</span>
                <span className="font-bold text-red-650 dark:text-red-400 mt-1 block flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {viewingRow.emergencyPhone}
                </span>
              </div>

              {/* Edit button */}
              <div className="col-span-2 border-t border-slate-100 dark:border-gray-800 pt-4 mt-2 flex justify-end gap-3">
                <button
                  onClick={() => {
                    const v = viewingRow;
                    setViewingRow(null);
                    openEditModal(v);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-gray-800 text-charcoal-light dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-850 rounded-xl transition-all text-xs font-bold"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t('admin.volunteers.edit_button')}
                </button>
              </div>

              {/* Status Update CTA buttons */}
              {viewingRow.status === 'pending' && (
                <div className="col-span-2 flex justify-end gap-3 mt-1">
                  <button
                    onClick={() => handleUpdateStatus(viewingRow.volunteerId, "rejected")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all text-xs font-bold"
                  >
                    <XCircle className="w-4 h-4" />
                    {t('admin.volunteers.reject_button')}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(viewingRow.volunteerId, "approved")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl transition-all text-xs font-bold"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('admin.volunteers.approve_button')}
                  </button>
                </div>
              )}
              {viewingRow.status !== 'pending' && (
                <div className="col-span-2 flex justify-end gap-3 mt-1">
                  <button
                    onClick={() => handleUpdateStatus(viewingRow.volunteerId, "pending")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-amber-200 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-xl transition-all text-xs font-bold"
                  >
                    <XCircle className="w-4 h-4" />
                    {t('admin.volunteers.move_to_pending')}
                  </button>
                </div>
              )}

            </div>

          </div>
        </Modal>
      )}

      {/* Create/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowFormModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/60 dark:border-gray-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-extrabold text-charcoal dark:text-white">
                {editingVolunteer ? t('admin.volunteers.edit_modal_title') : t('admin.volunteers.add_modal_title')}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Row 1: Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_full_name')} *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => handleFormChange('name', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                    placeholder={t('admin.volunteers.placeholder_full_name')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_email')} *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => handleFormChange('email', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                    placeholder={t('admin.volunteers.placeholder_email')}
                  />
                </div>
              </div>

              {/* Row 2: Phone + Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_phone')} *</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => handleFormChange('phone', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                    placeholder={t('admin.volunteers.placeholder_phone')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_gender')}</label>
                  <select
                    value={form.gender}
                    onChange={e => handleFormChange('gender', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  >
                    <option value="Male">{t('admin.volunteers.gender_male')}</option>
                    <option value="Female">{t('admin.volunteers.gender_female')}</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Age + Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_age')}</label>
                  <input
                    type="number"
                    min={16}
                    max={80}
                    value={form.age}
                    onChange={e => handleFormChange('age', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                    placeholder={t('admin.volunteers.placeholder_age')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_blood_group')}</label>
                  <select
                    value={form.bloodGroup}
                    onChange={e => handleFormChange('bloodGroup', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  >
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: City + College */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_city')} *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => handleFormChange('city', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                    placeholder={t('admin.volunteers.placeholder_city')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_college')} *</label>
                  <input
                    type="text"
                    value={form.college}
                    onChange={e => handleFormChange('college', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                    placeholder={t('admin.volunteers.placeholder_college')}
                  />
                </div>
              </div>

              {/* Row 5: NSS Unit + Shift */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_nss_unit')} *</label>
                  <input
                    type="text"
                    value={form.nssUnit}
                    onChange={e => handleFormChange('nssUnit', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                    placeholder={t('admin.volunteers.placeholder_nss_unit')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_shift')}</label>
                  <select
                    value={form.shift}
                    onChange={e => handleFormChange('shift', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  >
                    {shifts.map(s => (
                      <option key={s.value} value={s.value}>{t(s.labelKey)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 6: Emergency Phone */}
              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_emergency_phone')} *</label>
                <input
                  type="text"
                  value={form.emergencyPhone}
                  onChange={e => handleFormChange('emergencyPhone', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  placeholder={t('admin.volunteers.placeholder_emergency_phone')}
                />
              </div>

              {/* Row 7: Skills */}
              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_skills')}</label>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map(sk => (
                    <label key={sk.value} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(form.skills || []).includes(sk.value)}
                        onChange={() => handleToggleArrayField('skills', sk.value)}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                      />
                      <span className="text-xs text-charcoal-light dark:text-gray-400">{t(sk.labelKey)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Row 8: Languages */}
              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_languages')}</label>
                <div className="flex flex-wrap gap-2">
                  {allLanguages.map(lang => (
                    <label key={lang.value} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(form.languages || []).includes(lang.value)}
                        onChange={() => handleToggleArrayField('languages', lang.value)}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                      />
                      <span className="text-xs text-charcoal-light dark:text-gray-400">{t(lang.labelKey)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Row 9: Status (edit only) */}
              {editingVolunteer && (
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_status')}</label>
                  <select
                    value={form.status}
                    onChange={e => handleFormChange('status', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  >
                    <option value="pending">{t('admin.volunteers.summary_pending')}</option>
                    <option value="approved">{t('admin.volunteers.summary_approved')}</option>
                    <option value="rejected">{t('admin.volunteers.summary_rejected')}</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-gray-800">
              <button
                onClick={() => setShowFormModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-charcoal dark:text-white hover:bg-slate-50 dark:hover:bg-gray-800 transition-all"
              >
                {t('admin.volunteers.cancel')}
              </button>
              <LoadingButton
                onClick={handleSave}
                loading={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-saffron-glow"
              >
                <Save className="w-4 h-4" />
                {editingVolunteer ? t('admin.volunteers.save_changes') : t('admin.volunteers.create_volunteer')}
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
        title={t('admin.volunteers.delete_title')}
        messageKey="admin.common.confirm"
      />

    </div>
  );
}
