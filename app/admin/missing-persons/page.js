"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import Toast from '@/components/Toast';
import LoadingButton from '@/components/LoadingButton';
import StatusBadge from '@/components/StatusBadge';
import { AlertCircle, Plus, MapPin, Phone, Save, X, CheckCircle, XCircle } from 'lucide-react';

const CATEGORIES = ["Child", "Senior Citizen", "Male", "Female"];

const STATUS_FILTERS = ['all', 'Pending', 'Missing', 'Found', 'Rejected'];

function getStatusBadgeClasses(status) {
  const s = (status || '').toLowerCase();
  if (s === 'found') return 'bg-emerald-50 text-emerald-650 border-emerald-250';
  if (s === 'missing') return 'bg-red-50 text-red-650 border-red-200';
  if (s === 'pending') return 'bg-amber-50 text-amber-650 border-amber-200';
  if (s === 'rejected') return 'bg-rose-50 text-rose-600 border-rose-200';
  return 'bg-blue-50 text-blue-650 border-blue-200';
}

const FORM_DEFAULTS = {
  name: '', age: '', gender: 'Male', category: 'Male',
  lastSeenLocation: '', contactPhone: '',
  height: '', clothing: '', emergencyNotice: '',
};

function getGradientByCategory(category) {
  const map = {
    'Child': 'from-pink-500 to-rose-600',
    'Senior Citizen': 'from-slate-500 to-gray-600',
    'Male': 'from-blue-600 to-indigo-700',
    'Female': 'from-purple-500 to-pink-600',
  };
  return map[category] || 'from-primary to-orange-500';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function MissingPersonsAdmin() {
  const { t } = useLanguage();

  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const [viewingRow, setViewingRow] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [form, setForm] = useState(FORM_DEFAULTS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, visible: true });
  }, []);

  const fetchPersons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/missing-persons?limit=100');
      if (!res.ok) throw new Error('Failed to load missing persons');
      const json = await res.json();
      if (json.success && json.data?.items) {
        const mapped = json.data.items.map(item => ({
          ...item,
          id: item.caseId,
        }));
        setPersons(mapped);
      } else {
        setPersons([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersons();
  }, [fetchPersons]);

  const filteredPersons = useMemo(() => {
    if (statusFilter === 'all') return persons;
    return persons.filter(p => p.status === statusFilter);
  }, [persons, statusFilter]);

  const counts = useMemo(() => ({
    total: persons.length,
    pending: persons.filter(p => p.status === 'Pending').length,
    missing: persons.filter(p => p.status === 'Missing').length,
    found: persons.filter(p => p.status === 'Found').length,
    rejected: persons.filter(p => p.status === 'Rejected').length,
  }), [persons]);

  const columns = [
    { key: "caseId", label: "Case ID" },
    { key: "name", label: "Name", sortable: true },
    {
      key: "category",
      label: "Category / Age",
      render: (row) => `${row.category} (${row.age} yrs)`
    },
    {
      key: "lastSeenLocation",
      label: "Last Seen Location",
      render: (row) => row.lastSeenLocation || '',
    },
    {
      key: "dateReported",
      label: "Reported Date",
      sortable: true,
      render: (row) => formatDate(row.dateReported),
    },
    {
      key: "volunteerId",
      label: "Submitted By",
      render: (row) => row.volunteerId || '—',
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    }
  ];

  const handleView = (row) => {
    setViewingRow(row);
  };

  const handleDeleteTrigger = (id) => {
    setDeletingId(id);
  };

  const handleApproveRow = (row) => {
    handleUpdateStatus(row.caseId, "Missing");
  };

  const handleRejectRow = (row) => {
    handleUpdateStatus(row.caseId, "Rejected");
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/missing-persons/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete case');
      setPersons(prev => prev.filter(p => p.caseId !== deletingId));
      showToast('Case deleted successfully');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateStatus = async (caseId, newStatus) => {
    try {
      const res = await fetch(`/api/missing-persons/${caseId}`, {
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
        setPersons(prev => prev.map(p =>
          p.caseId === caseId ? { ...p, ...json.data, id: json.data.caseId } : p
        ));
        if (viewingRow && viewingRow.caseId === caseId) {
          setViewingRow(prev => ({ ...prev, ...json.data }));
        }
      }
      showToast(`Case marked as ${newStatus}`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openCreateModal = () => {
    setEditingPerson(null);
    setForm({ ...FORM_DEFAULTS });
    setShowFormModal(true);
  };

  const openEditModal = (person) => {
    setEditingPerson(person);
    setForm({
      name: person.name || '',
      age: person.age || '',
      gender: person.gender || 'Male',
      category: person.category || 'Male',
      lastSeenLocation: person.lastSeenLocation || '',
      contactPhone: person.contactPhone || '',
      height: person.height || '',
      clothing: person.clothing || '',
      emergencyNotice: person.emergencyNotice || '',
    });
    setShowFormModal(true);
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.age || !form.lastSeenLocation || !form.contactPhone) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        age: Number(form.age),
      };

      if (editingPerson) {
        const res = await fetch(`/api/missing-persons/${editingPerson.caseId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Failed to update case');
        }
        const json = await res.json();
        if (json.success && json.data) {
          setPersons(prev => prev.map(p =>
            p.caseId === editingPerson.caseId
              ? { ...p, ...json.data, id: json.data.caseId }
              : p
          ));
        }
        showToast('Case updated successfully');
      } else {
        const res = await fetch('/api/missing-persons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Failed to create case');
        }
        await fetchPersons();
        showToast('Case created successfully');
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
            {t("admin.sidebar.missing_persons")} Management
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
            {t("admin.sidebar.missing_persons")} Management
          </h1>
          <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
            Reunite walking warkaris. Update resolution tags once they are found and verified.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-bold transition-all shadow-saffron-glow focus:outline-none self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Missing Case
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs text-charcoal-light dark:text-gray-400">
        <span><strong className="text-charcoal dark:text-white">{counts.total}</strong> total</span>
        <span><strong className="text-amber-650 dark:text-amber-400">{counts.pending}</strong> pending</span>
        <span><strong className="text-red-650 dark:text-red-400">{counts.missing}</strong> missing</span>
        <span><strong className="text-emerald-650 dark:text-emerald-400">{counts.found}</strong> found</span>
        <span><strong className="text-rose-650 dark:text-rose-400">{counts.rejected}</strong> rejected</span>
      </div>

      <div className="flex flex-wrap gap-2">
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
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {filteredPersons.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-charcoal-light dark:text-gray-400">No missing persons found.</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredPersons}
          searchPlaceholderKey="admin.common.search"
          onViewRow={handleView}
          onDeleteRow={handleDeleteTrigger}
          onApproveRow={handleApproveRow}
          onRejectRow={handleRejectRow}
          exportFilename="missing-persons-report.csv"
          mobileHiddenColumns={["category", "lastSeenLocation", "volunteerId"]}
        />
      )}

      {viewingRow && (
        <Modal
          isOpen={!!viewingRow}
          onClose={() => setViewingRow(null)}
          title={`Case Details: ${viewingRow.name}`}
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
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Age & Gender</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">
                  {viewingRow.age} Years, {viewingRow.gender}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Status</span>
                <span className="mt-1 block">
                  <span className={`inline-flex px-2 py-0.5 rounded-md font-bold text-[10px] border shadow-sm ${getStatusBadgeClasses(viewingRow.status)}`}>
                    {viewingRow.status}
                  </span>
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Last Seen Location</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {viewingRow.lastSeenLocation}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Clothing Description</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block leading-relaxed">
                  {viewingRow.clothing || "No details provided."}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Emergency Notice Notes</span>
                <span className="font-bold text-red-650 dark:text-red-400 mt-1 block flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{viewingRow.emergencyNotice || "N/A"}</span>
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Contact Family</span>
                  <span className="font-bold text-charcoal dark:text-white mt-0.5 block flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    {viewingRow.contactPhone}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Submitted By</span>
                <span className="font-bold text-charcoal dark:text-white mt-0.5 block">
                  {viewingRow.volunteerId || 'Admin (direct entry)'}
                </span>
              </div>

              <div className="col-span-2 border-t border-slate-100 dark:border-gray-800 pt-4 mt-2 flex justify-end gap-3">
                <button
                  onClick={() => {
                    const p = viewingRow;
                    setViewingRow(null);
                    openEditModal(p);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-gray-800 text-charcoal-light dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-850 rounded-xl transition-all text-xs font-bold"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              </div>

              {viewingRow.status === 'Pending' && (
                <div className="col-span-2 flex justify-end gap-3 mt-1">
                  <button
                    onClick={() => handleUpdateStatus(viewingRow.caseId, "Rejected")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all text-xs font-bold"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(viewingRow.caseId, "Missing")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl transition-all text-xs font-bold"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              )}
              {viewingRow.status === 'Missing' && (
                <div className="col-span-2 flex justify-end gap-3 mt-1">
                  <button
                    onClick={() => handleUpdateStatus(viewingRow.caseId, "Found")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl transition-all text-xs font-bold"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Mark as Found
                  </button>
                </div>
              )}
              {viewingRow.status === 'Found' && (
                <div className="col-span-2 flex justify-end gap-3 mt-1">
                  <button
                    onClick={() => handleUpdateStatus(viewingRow.caseId, "Missing")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-amber-200 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-xl transition-all text-xs font-bold"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Reopen as Missing
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
                {editingPerson ? 'Edit Missing Person Case' : 'Add New Missing Person Case'}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => handleFormChange('name', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Age *</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={form.age}
                    onChange={e => handleFormChange('age', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                    placeholder="Enter age"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Gender *</label>
                  <select
                    value={form.gender}
                    onChange={e => handleFormChange('gender', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
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
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Last Seen Location *</label>
                <input
                  type="text"
                  value={form.lastSeenLocation}
                  onChange={e => handleFormChange('lastSeenLocation', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  placeholder="e.g. Wakhari Junction, near camp 4"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Contact Phone *</label>
                <input
                  type="text"
                  value={form.contactPhone}
                  onChange={e => handleFormChange('contactPhone', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  placeholder="10-digit phone number"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Height</label>
                  <input
                    type="text"
                    value={form.height}
                    onChange={e => handleFormChange('height', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                    placeholder="e.g. 5ft 6in"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Clothing</label>
                  <input
                    type="text"
                    value={form.clothing}
                    onChange={e => handleFormChange('clothing', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                    placeholder="e.g. White kurta, navy blue pajama"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Emergency Notice</label>
                <textarea
                  value={form.emergencyNotice}
                  onChange={e => handleFormChange('emergencyNotice', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white resize-none"
                  placeholder="Additional instructions for coordinators..."
                  rows={3}
                />
              </div>

              {editingPerson && (
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Status</label>
                  <select
                    value={form.status || editingPerson.status}
                    onChange={e => handleFormChange('status', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Missing">Missing</option>
                    <option value="Found">Found</option>
                    <option value="Rejected">Rejected</option>
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
                {editingPerson ? 'Save Changes' : 'Create Case'}
              </LoadingButton>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Case Entry"
        messageKey="admin.common.confirm"
      />

    </div>
  );
}
