"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { bloodGroups, shifts, skills as allSkills, languages as allLanguages } from '@/data/volunteers';
import { useLanguage } from '@/context/LanguageContext';
import Modal from '@/components/Modal';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import Toast from '@/components/Toast';
import LoadingButton from '@/components/LoadingButton';
import StatusBadge from '@/components/StatusBadge';
import {
  AlertCircle, Plus, Eye, Trash2, Calendar, Phone, CheckCircle, XCircle, Save, X,
  Key, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ShieldCheck, ShieldOff, UserCheck, UserX, Copy, RefreshCw,
  ArrowRight, ClipboardCheck, Settings, LogIn
} from 'lucide-react';

const FORM_DEFAULTS = {
  name: '', email: '', phone: '', gender: 'Male', age: '',
  city: '', college: '', nssUnit: '', bloodGroup: 'O+',
  emergencyPhone: '', skills: [], languages: [], shift: 'morning', status: 'pending',
};

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected', 'inactive'];

function generateStrongPassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const symbols = '!@#$%^&*';
  const all = upper + lower + digits + symbols;
  let password = '';
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  for (let i = password.length; i < 14; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export default function VolunteersAdmin() {
  const { t } = useLanguage();

  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [viewingRow, setViewingRow] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [deactivatingId, setDeactivatingId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [form, setForm] = useState(FORM_DEFAULTS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordVolunteer, setPasswordVolunteer] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, visible: true });
  }, []);

  useEffect(() => {
    async function fetchVolunteers() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/volunteers?limit=200');
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

  const filteredData = useMemo(() => {
    return volunteers.filter(item => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = term === '' ||
        [item.volunteerId, item.name, item.email, item.phone]
          .some(val => val && val.toString().toLowerCase().includes(term));
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [volunteers, searchTerm, statusFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const totalPages = Math.max(Math.ceil(filteredData.length / rowsPerPage), 1);

  const counts = useMemo(() => ({
    total: volunteers.length,
    approved: volunteers.filter(v => v.status === 'approved').length,
    pending: volunteers.filter(v => v.status === 'pending').length,
    rejected: volunteers.filter(v => v.status === 'rejected').length,
    inactive: volunteers.filter(v => v.status === 'inactive').length,
  }), [volunteers]);

  const handleView = (row) => setViewingRow(row);

  const handleDeleteTrigger = (id) => setDeletingId(id);

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    const id = deletingId;
    try {
      const res = await fetch(`/api/volunteers/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to delete volunteer');
      }
      setVolunteers(prev => prev.filter(v => v.volunteerId !== id));
      showToast(t('admin.volunteers.toast_deleted'));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateStatus = async (volunteerId, newStatus) => {
    if (!volunteerId) {
      showToast('Volunteer ID is missing', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/volunteers/${volunteerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to update status');
      }
      const json = await res.json();
      if (json.success && json.data) {
        setVolunteers(prev => prev.map(v =>
          v.volunteerId === volunteerId ? { ...v, ...json.data } : v
        ));
        setViewingRow(prev => {
          if (prev && prev.volunteerId === volunteerId) {
            return { ...prev, ...json.data };
          }
          return prev;
        });
      }
      if (newStatus === 'approved') {
        showToast(t('admin.volunteers.toast_approved'));
      } else if (newStatus === 'rejected') {
        showToast(t('admin.volunteers.toast_rejected'));
      } else if (newStatus === 'inactive') {
        showToast(t('admin.volunteers.toast_deactivated'));
      } else {
        showToast(t('admin.volunteers.toast_status_updated'));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openCreateModal = () => {
    setEditingVolunteer(null);
    setForm({ ...FORM_DEFAULTS });
    setShowFormModal(true);
  };

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

  const handleSave = async () => {
    if (!form.name || !form.email || !form.phone || !form.city || !form.college || !form.nssUnit || !form.emergencyPhone) {
      showToast(t('admin.common.required'), 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        age: form.age === '' || form.age == null ? undefined : Number(form.age),
      };

      if (editingVolunteer) {
        const res = await fetch(`/api/volunteers/${editingVolunteer.volunteerId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || 'Failed to update volunteer');
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
        const res = await fetch('/api/volunteers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Failed to create volunteer');
        }
        const fetchRes = await fetch('/api/volunteers?limit=200');
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

  const openPasswordModal = (volunteer) => {
    setPasswordVolunteer(volunteer);
    setPasswordForm({ password: '', confirmPassword: '' });
    setPasswordErrors({});
    setShowPasswordModal(true);
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.password) {
      errors.password = t('admin.volunteers.password_label') + ' is required';
    } else if (passwordForm.password.length < 8) {
      errors.password = t('admin.volunteers.password_min_length');
    } else if (passwordForm.password.length > 64) {
      errors.password = t('admin.volunteers.password_max_length');
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      errors.confirmPassword = t('admin.volunteers.password_mismatch');
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async () => {
    if (!validatePassword()) return;
    if (!passwordVolunteer?.volunteerId) {
      showToast('Volunteer ID is missing', 'error');
      return;
    }
    setIsPasswordSubmitting(true);
    try {
      const res = await fetch(`/api/volunteers/${passwordVolunteer.volunteerId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordForm.password }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to update password');
      }
      showToast(t('admin.volunteers.toast_password_updated'));
      setShowPasswordModal(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const handleGeneratePassword = () => {
    const pw = generateStrongPassword();
    setPasswordForm({ password: pw, confirmPassword: pw });
    setPasswordErrors({});
    showToast(t('admin.volunteers.toast_password_generated'));
  };

  const handleCopyPassword = () => {
    if (passwordForm.password) {
      navigator.clipboard.writeText(passwordForm.password);
    }
  };

  const statusColorMap = {
    all: '',
    pending: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
    rejected: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30',
    inactive: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  };

  const statusActiveColor = 'bg-charcoal text-white dark:bg-white dark:text-charcoal';

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
            {t('admin.volunteers.title')}
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

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      {/* ===== FEATURE 11: Visual Volunteer Flow ===== */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-2xl px-5 py-4 shadow-premium overflow-x-auto">
        <div className="flex items-center gap-2 sm:gap-3 min-w-max">
          {[
            { icon: ClipboardCheck, label: t('admin.volunteers.flow_registration'), color: 'bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-400' },
            { icon: null, label: t('admin.volunteers.flow_pending'), color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' },
            { icon: CheckCircle, label: t('admin.volunteers.flow_approved'), color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' },
            { icon: Key, label: t('admin.volunteers.flow_set_password'), color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' },
            { icon: LogIn, label: t('admin.volunteers.flow_ready'), color: 'bg-primary/10 text-primary dark:bg-primary/20' },
          ].map((step, idx) => (
            <React.Fragment key={idx}>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${step.color}`}>
                {step.icon && <step.icon className="w-3.5 h-3.5" />}
                {step.label}
              </div>
              {idx < 4 && (
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-gray-600 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t('admin.volunteers.title')}
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

      {/* ===== FEATURE 1: Table with Search, Filters, Pagination ===== */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">

        {/* ===== FEATURE 2: Search + FEATURE 3: Status Filters ===== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          {/* Search */}
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('admin.volunteers.search_by_id_name_email_phone')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-gray-850 pl-10.5 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-gray-800 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all dark:text-white"
            />
          </div>

          {/* Status Filter Buttons with Counts */}
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((filter) => {
              const count = filter === 'all' ? counts.total : counts[filter] || 0;
              const label = filter === 'all' ? t('admin.volunteers.filter_all') : filter.charAt(0).toUpperCase() + filter.slice(1);
              return (
                <button
                  key={filter}
                  onClick={() => {
                    setStatusFilter(filter);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    statusFilter === filter
                      ? `${statusActiveColor} border-charcoal dark:border-white`
                      : `${statusColorMap[filter]} border-current/10`
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== FEATURE 1: Data Table ===== */}
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-charcoal-light dark:text-gray-400">{t('admin.volunteers.no_volunteers')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-5">
              <div className="inline-block min-w-full align-middle px-5">
                <div className="overflow-hidden border border-slate-100 dark:border-gray-800 rounded-2xl">
                  <table className="min-w-full divide-y divide-slate-100 dark:divide-gray-850">
                    <thead className="bg-slate-50/70 dark:bg-gray-950/20 sticky top-0 z-10">
                      <tr>
                        <th scope="col" className="px-4 py-3.5 w-12">
                          <span className="sr-only">{t('admin.volunteers.select_row')}</span>
                        </th>
                        <th scope="col" className="px-4 sm:px-5 py-3.5 text-left text-[11px] font-extrabold text-charcoal-light dark:text-gray-400 tracking-wider uppercase">
                          {t('admin.volunteers.column_id')}
                        </th>
                        <th scope="col" className="px-4 sm:px-5 py-3.5 text-left text-[11px] font-extrabold text-charcoal-light dark:text-gray-400 tracking-wider uppercase">
                          {t('admin.volunteers.column_name')}
                        </th>
                        <th scope="col" className="px-4 sm:px-5 py-3.5 text-left text-[11px] font-extrabold text-charcoal-light dark:text-gray-400 tracking-wider uppercase">
                          {t('admin.volunteers.column_phone')}
                        </th>
                        <th scope="col" className="px-4 sm:px-5 py-3.5 text-left text-[11px] font-extrabold text-charcoal-light dark:text-gray-400 tracking-wider uppercase">
                          {t('admin.volunteers.column_registration_date')}
                        </th>
                        <th scope="col" className="px-4 sm:px-5 py-3.5 text-left text-[11px] font-extrabold text-charcoal-light dark:text-gray-400 tracking-wider uppercase">
                          {t('admin.volunteers.column_status')}
                        </th>
                        <th scope="col" className="px-4 sm:px-5 py-3.5 text-right text-[11px] font-extrabold text-charcoal-light dark:text-gray-400 tracking-wider uppercase min-w-[180px]">
                          {t('admin.volunteers.column_actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-gray-850 bg-white dark:bg-gray-900">
                      {paginatedData.map((row) => (
                        <tr
                          key={row.volunteerId}
                          className="hover:bg-slate-50/45 dark:hover:bg-gray-850/40 transition-colors"
                        >
                          {/* Checkbox */}
                          <td className="px-4 py-3.5 w-12">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                              aria-label={t('admin.volunteers.select_row')}
                            />
                          </td>

                          {/* Volunteer ID */}
                          <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-xs font-bold text-primary">
                            {row.volunteerId}
                          </td>

                          {/* Name */}
                          <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                                {(row.name || '?').charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-semibold text-slate-700 dark:text-gray-300">{row.name}</span>
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-700 dark:text-gray-300">
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {row.phone}
                            </div>
                          </td>

                          {/* Registration Date */}
                          <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-700 dark:text-gray-300">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                            <StatusBadge status={row.status} />
                          </td>

                          {/* ===== FEATURE 5 & 6 & 7: Status-based Actions ===== */}
                          <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-right text-xs">
                            <div className="flex items-center justify-end gap-1.5">
                              {row.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(row.volunteerId, 'approved')}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50 transition-all text-[11px] font-bold"
                                    title={t('admin.volunteers.btn_approve')}
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span className="hidden lg:inline">{t('admin.volunteers.btn_approve')}</span>
                                  </button>
                                  <button
                                    onClick={() => setRejectingId(row.volunteerId)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 transition-all text-[11px] font-bold"
                                    title={t('admin.volunteers.btn_reject')}
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span className="hidden lg:inline">{t('admin.volunteers.btn_reject')}</span>
                                  </button>
                                  <button
                                    onClick={() => handleView(row)}
                                    className="p-1.5 rounded-lg text-slate-450 hover:bg-slate-100 hover:text-charcoal hover:dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white transition-all"
                                    title="View"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {row.status === 'approved' && (
                                <>
                                  <button
                                    onClick={() => handleView(row)}
                                    className="p-1.5 rounded-lg text-slate-450 hover:bg-slate-100 hover:text-charcoal hover:dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white transition-all"
                                    title="View"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openPasswordModal(row)}
                                    className="p-1.5 rounded-lg text-slate-450 hover:bg-amber-50 hover:text-amber-600 hover:dark:bg-amber-950/20 dark:text-gray-400 dark:hover:text-amber-400 transition-all"
                                    title={t('admin.volunteers.btn_set_password')}
                                  >
                                    <Key className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeactivatingId(row.volunteerId)}
                                    className="p-1.5 rounded-lg text-slate-450 hover:bg-red-50 hover:text-red-600 hover:dark:bg-red-950/20 dark:text-gray-400 dark:hover:text-red-400 transition-all"
                                    title={t('admin.volunteers.btn_deactivate')}
                                  >
                                    <ShieldOff className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {row.status === 'rejected' && (
                                <>
                                  <button
                                    onClick={() => handleView(row)}
                                    className="p-1.5 rounded-lg text-slate-450 hover:bg-slate-100 hover:text-charcoal hover:dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white transition-all"
                                    title="View"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(row.volunteerId, 'approved')}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50 transition-all text-[11px] font-bold"
                                    title={t('admin.volunteers.btn_approve')}
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span className="hidden lg:inline">{t('admin.volunteers.btn_approve')}</span>
                                  </button>
                                </>
                              )}

                              {row.status === 'inactive' && (
                                <>
                                  <button
                                    onClick={() => handleView(row)}
                                    className="p-1.5 rounded-lg text-slate-450 hover:bg-slate-100 hover:text-charcoal hover:dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white transition-all"
                                    title="View"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(row.volunteerId, 'approved')}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50 transition-all text-[11px] font-bold"
                                    title={t('admin.volunteers.btn_activate')}
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span className="hidden lg:inline">{t('admin.volunteers.btn_activate')}</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pagination */}
            {filteredData.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-gray-850 mt-5 pt-4 text-xs font-semibold text-slate-500 dark:text-gray-400">
                <div className="hidden sm:block">
                  Showing <span className="font-extrabold text-charcoal dark:text-white">{(currentPage - 1) * rowsPerPage + 1}</span> to{' '}
                  <span className="font-extrabold text-charcoal dark:text-white">
                    {Math.min(currentPage * rowsPerPage, filteredData.length)}
                  </span>{' '}
                  of <span className="font-extrabold text-charcoal dark:text-white">{filteredData.length}</span> entries
                </div>

                <div className="flex items-center gap-4 justify-between w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <span>Show</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-lg px-2.5 py-1 font-bold text-charcoal dark:text-white"
                    >
                      {[5, 10, 25, 50].map(sz => (
                        <option key={sz} value={sz}>{sz}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-slate-200 dark:border-gray-800 rounded-xl bg-white hover:bg-slate-50 dark:bg-transparent dark:hover:bg-gray-850 text-charcoal dark:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1 font-bold">
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pg = idx + 1;
                        if (totalPages > 7) {
                          if (pg === 1 || pg === totalPages || (pg >= currentPage - 1 && pg <= currentPage + 1)) {
                            return (
                              <button
                                key={pg}
                                onClick={() => setCurrentPage(pg)}
                                className={`px-3 py-1.5 rounded-xl transition-all ${
                                  currentPage === pg
                                    ? 'bg-primary text-white'
                                    : 'hover:bg-slate-100 dark:hover:bg-gray-800 text-charcoal dark:text-white'
                                }`}
                              >
                                {pg}
                              </button>
                            );
                          }
                          if (pg === currentPage - 2 || pg === currentPage + 2) {
                            return <span key={pg} className="px-1 text-slate-400">...</span>;
                          }
                          return null;
                        }
                        return (
                          <button
                            key={pg}
                            onClick={() => setCurrentPage(pg)}
                            className={`px-3 py-1.5 rounded-xl transition-all ${
                              currentPage === pg
                                ? 'bg-primary text-white'
                                : 'hover:bg-slate-100 dark:hover:bg-gray-800 text-charcoal dark:text-white'
                            }`}
                          >
                            {pg}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-slate-200 dark:border-gray-800 rounded-xl bg-white hover:bg-slate-50 dark:bg-transparent dark:hover:bg-gray-850 text-charcoal dark:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== FEATURE 8: View Volunteer Details Modal ===== */}
      {viewingRow && (
        <Modal
          isOpen={!!viewingRow}
          onClose={() => setViewingRow(null)}
          title={t('admin.volunteers.view_title').replace('{name}', viewingRow.name)}
        >
          <div className="space-y-4">

            {/* Header Banner */}
            <div className="w-full h-24 rounded-2xl bg-gradient-to-tr from-secondary to-blue-800 flex items-center justify-between px-6 text-white relative shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-heading text-lg font-bold">
                  {(viewingRow.name || '?').charAt(0)}
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-sm">{viewingRow.name}</h4>
                  <p className="text-[10px] text-blue-100">{viewingRow.email}</p>
                </div>
              </div>
              <StatusBadge status={viewingRow.status} />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">{t('admin.volunteers.label_volunteer_id')}</span>
                <span className="font-bold text-primary mt-1 block">{viewingRow.volunteerId}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">{t('admin.volunteers.college_name')}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block leading-normal">{viewingRow.college}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">{t('admin.volunteers.contact_details')}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">
                  {t('admin.volunteers.ph')} {viewingRow.phone} <br />
                  {viewingRow.age} {t('admin.volunteers.yrs')}, {viewingRow.gender}
                </span>
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

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">{t('admin.volunteers.column_registration_date')}</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {viewingRow.createdAt ? new Date(viewingRow.createdAt).toLocaleDateString() : '-'}
                </span>
              </div>

              {/* Skills */}
              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">{t('admin.volunteers.skills_competences')}</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(viewingRow.skills || []).length > 0 ? (viewingRow.skills || []).map(sk => {
                    const skObj = allSkills.find(s => s.value === sk);
                    return (
                      <span key={sk} className="bg-slate-200 dark:bg-gray-700 text-charcoal dark:text-gray-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {skObj ? t(skObj.labelKey) : sk}
                      </span>
                    );
                  }) : <span className="text-slate-400 text-[10px]">-</span>}
                </div>
              </div>

              {/* Languages */}
              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">{t('admin.volunteers.label_languages')}</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(viewingRow.languages || []).length > 0 ? (viewingRow.languages || []).map(lang => {
                    const langObj = allLanguages.find(l => l.value === lang);
                    return (
                      <span key={lang} className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {langObj ? t(langObj.labelKey) : lang}
                      </span>
                    );
                  }) : <span className="text-slate-400 text-[10px]">-</span>}
                </div>
              </div>

              {/* ===== FEATURE 8: View Modal Actions ===== */}
              <div className="col-span-2 border-t border-slate-100 dark:border-gray-800 pt-4 mt-2">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {viewingRow.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleUpdateStatus(viewingRow.volunteerId, 'approved');
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all text-xs font-bold"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {t('admin.volunteers.btn_approve')}
                      </button>
                      <button
                        onClick={() => {
                          setViewingRow(null);
                          setRejectingId(viewingRow.volunteerId);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all text-xs font-bold"
                      >
                        <XCircle className="w-4 h-4" />
                        {t('admin.volunteers.btn_reject')}
                      </button>
                    </>
                  )}

                  {(viewingRow.status === 'approved' || viewingRow.status === 'pending') && (
                    <button
                      onClick={() => {
                        const v = viewingRow;
                        setViewingRow(null);
                        openPasswordModal(v);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-amber-200 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-xl transition-all text-xs font-bold"
                    >
                      <Key className="w-4 h-4" />
                      {viewingRow.passwordHash ? t('admin.volunteers.btn_reset_password') : t('admin.volunteers.btn_set_password')}
                    </button>
                  )}

                  {viewingRow.status === 'rejected' && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(viewingRow.volunteerId, 'approved');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all text-xs font-bold"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t('admin.volunteers.btn_approve')}
                    </button>
                  )}

                  {viewingRow.status === 'inactive' && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(viewingRow.volunteerId, 'approved');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all text-xs font-bold"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {t('admin.volunteers.btn_activate')}
                    </button>
                  )}

                  {viewingRow.status === 'approved' && (
                    <button
                      onClick={() => {
                        setViewingRow(null);
                        setDeactivatingId(viewingRow.volunteerId);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all text-xs font-bold"
                    >
                      <ShieldOff className="w-4 h-4" />
                      {t('admin.volunteers.btn_deactivate')}
                    </button>
                  )}

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
                    {t('admin.volunteers.btn_edit')}
                  </button>
                </div>
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_full_name')} *</label>
                  <input type="text" value={form.name} onChange={e => handleFormChange('name', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_email')} *</label>
                  <input type="email" value={form.email} onChange={e => handleFormChange('email', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_phone')} *</label>
                  <input type="text" value={form.phone} onChange={e => handleFormChange('phone', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_gender')}</label>
                  <select value={form.gender} onChange={e => handleFormChange('gender', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white">
                    <option value="Male">{t('admin.volunteers.gender_male')}</option>
                    <option value="Female">{t('admin.volunteers.gender_female')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_age')}</label>
                  <input type="number" min={16} max={80} value={form.age} onChange={e => handleFormChange('age', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_blood_group')}</label>
                  <select value={form.bloodGroup} onChange={e => handleFormChange('bloodGroup', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white">
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_city')} *</label>
                  <input type="text" value={form.city} onChange={e => handleFormChange('city', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_college')} *</label>
                  <input type="text" value={form.college} onChange={e => handleFormChange('college', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_nss_unit')} *</label>
                  <input type="text" value={form.nssUnit} onChange={e => handleFormChange('nssUnit', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_shift')}</label>
                  <select value={form.shift} onChange={e => handleFormChange('shift', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white">
                    {shifts.map(s => (
                      <option key={s.value} value={s.value}>{t(s.labelKey)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_emergency_phone')} *</label>
                <input type="text" value={form.emergencyPhone} onChange={e => handleFormChange('emergencyPhone', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white" />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_skills')}</label>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map(sk => (
                    <label key={sk.value} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={(form.skills || []).includes(sk.value)}
                        onChange={() => handleToggleArrayField('skills', sk.value)}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30" />
                      <span className="text-xs text-charcoal-light dark:text-gray-400">{t(sk.labelKey)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_languages')}</label>
                <div className="flex flex-wrap gap-2">
                  {allLanguages.map(lang => (
                    <label key={lang.value} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={(form.languages || []).includes(lang.value)}
                        onChange={() => handleToggleArrayField('languages', lang.value)}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30" />
                      <span className="text-xs text-charcoal-light dark:text-gray-400">{t(lang.labelKey)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {editingVolunteer && (
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t('admin.volunteers.form_status')}</label>
                  <select value={form.status} onChange={e => handleFormChange('status', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white">
                    <option value="pending">{t('admin.volunteers.filter_pending')}</option>
                    <option value="approved">{t('admin.volunteers.filter_approved')}</option>
                    <option value="rejected">{t('admin.volunteers.filter_rejected')}</option>
                    <option value="inactive">{t('admin.volunteers.filter_inactive')}</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-gray-800">
              <button
                onClick={() => setShowFormModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-charcoal dark:text-white hover:bg-slate-50 dark:hover:bg-gray-800 transition-all"
              >
                {t('admin.volunteers.btn_cancel')}
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

      {/* ===== FEATURE 9: Password Modal ===== */}
      {showPasswordModal && passwordVolunteer && (
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title={passwordVolunteer.passwordHash ? t('admin.volunteers.reset_password_title') : t('admin.volunteers.set_password_title')}
        >
          <div className="space-y-4">
            {/* Volunteer Info */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {(passwordVolunteer.name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase block">{t('admin.volunteers.label_volunteer_id')}</span>
                <span className="font-bold text-primary text-xs block">{passwordVolunteer.volunteerId}</span>
              </div>
              <StatusBadge status={passwordVolunteer.status} />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase block">{t('admin.volunteers.label_volunteer_name')}</span>
              <span className="font-bold text-charcoal dark:text-white text-xs block">{passwordVolunteer.name}</span>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">
                {t('admin.volunteers.password_label')} *
              </label>
              <input
                type="text"
                value={passwordForm.password}
                onChange={e => setPasswordForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder={t('admin.volunteers.password_placeholder')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
              />
              {passwordErrors.password && (
                <p className="text-red-500 text-[10px] mt-1 font-bold">{passwordErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">
                {t('admin.volunteers.confirm_password_label')} *
              </label>
              <input
                type="text"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder={t('admin.volunteers.password_placeholder')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-red-500 text-[10px] mt-1 font-bold">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            {/* Generate & Copy Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-primary/30 text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-xl transition-all text-xs font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('admin.volunteers.btn_generate_password')}
              </button>
              <button
                type="button"
                onClick={handleCopyPassword}
                disabled={!passwordForm.password}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-gray-800 text-charcoal-light dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-850 rounded-xl transition-all text-xs font-bold disabled:opacity-40"
              >
                <Copy className="w-3.5 h-3.5" />
                {t('admin.volunteers.btn_copy_password')}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-gray-800">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-charcoal dark:text-white hover:bg-slate-50 dark:hover:bg-gray-800 transition-all"
              >
                {t('admin.volunteers.btn_cancel')}
              </button>
              <LoadingButton
                onClick={handlePasswordSubmit}
                loading={isPasswordSubmitting}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-saffron-glow"
              >
                <Key className="w-4 h-4" />
                {passwordVolunteer.passwordHash ? t('admin.volunteers.btn_reset_password') : t('admin.volunteers.btn_set_password')}
              </LoadingButton>
            </div>
          </div>
        </Modal>
      )}

      {/* ===== FEATURE 10: Confirmation Dialogs ===== */}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={async () => {
          await handleDeleteConfirm();
        }}
        title={t('admin.volunteers.delete_title')}
        message={t('admin.volunteers.confirm_delete')}
        confirmLabel={t('admin.common.delete')}
        variant="danger"
      />

      {/* Reject Confirmation */}
      <ConfirmationDialog
        isOpen={!!rejectingId}
        onClose={() => setRejectingId(null)}
        onConfirm={async () => {
          const id = rejectingId;
          setRejectingId(null);
          if (id) await handleUpdateStatus(id, 'rejected');
        }}
        title={t('admin.volunteers.reject_title')}
        message={t('admin.volunteers.reject_confirm')}
        confirmLabel={t('admin.volunteers.btn_reject')}
        variant="warning"
      />

      {/* Deactivate Confirmation */}
      <ConfirmationDialog
        isOpen={!!deactivatingId}
        onClose={() => setDeactivatingId(null)}
        onConfirm={async () => {
          const id = deactivatingId;
          setDeactivatingId(null);
          if (id) await handleUpdateStatus(id, 'inactive');
        }}
        title={t('admin.volunteers.deactivate_title')}
        message={t('admin.volunteers.deactivate_confirm')}
        confirmLabel={t('admin.volunteers.btn_deactivate')}
        variant="danger"
      />

    </div>
  );
}
