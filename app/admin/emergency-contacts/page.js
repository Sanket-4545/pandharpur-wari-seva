"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Toast from '@/components/Toast';
import { Plus, Phone, ShieldAlert, Shield, HeartPulse, Flame, UserCheck, Users, X, Check, Slash } from 'lucide-react';

const ICON_MAP = {
  Shield,
  HeartPulse,
  Flame,
  UserCheck,
  ShieldAlert,
  Users,
  Phone,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);
const CATEGORY_OPTIONS = ["police", "ambulance", "medical", "fire", "nss", "women", "child", "control_room"];
const COLOR_OPTIONS = [
  "bg-red-50 text-red-600 border-red-100",
  "bg-blue-50 text-blue-600 border-blue-100",
  "bg-emerald-50 text-emerald-600 border-emerald-100",
  "bg-amber-50 text-amber-600 border-amber-100",
  "bg-purple-50 text-purple-600 border-purple-100",
  "bg-rose-50 text-rose-600 border-rose-100",
  "bg-teal-50 text-teal-600 border-teal-100",
  "bg-sky-50 text-sky-600 border-sky-100",
];

export default function EmergencyContactsAdmin() {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [form, setForm] = useState({
    contactId: '', titleKey: '', descKey: '', phoneNumber: '',
    category: 'police', iconName: 'ShieldAlert', colorClass: COLOR_OPTIONS[0], order: 0, isActive: true,
  });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, visible: true });
  }, []);

  useEffect(() => {
    async function fetchContacts() {
      try {
        setLoading(true);
        const res = await fetch('/api/emergency-contacts?all=true&limit=100');
        if (!res.ok) throw new Error('Failed to load contacts');
        const json = await res.json();
        if (json.success && json.data?.items) {
          setContacts(json.data.items);
        } else {
          setContacts([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();
  }, []);

  const openCreateModal = () => {
    setEditingContact(null);
    setForm({
      contactId: '', titleKey: '', descKey: '', phoneNumber: '',
      category: 'police', iconName: 'ShieldAlert', colorClass: COLOR_OPTIONS[0], order: contacts.length + 1, isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (contact) => {
    setEditingContact(contact);
    setForm({
      contactId: contact.contactId,
      titleKey: contact.titleKey || '',
      descKey: contact.descKey || '',
      phoneNumber: contact.phoneNumber || '',
      category: contact.category || 'police',
      iconName: contact.iconName || 'ShieldAlert',
      colorClass: contact.colorClass || COLOR_OPTIONS[0],
      order: contact.order || 0,
      isActive: contact.isActive !== false,
    });
    setShowModal(true);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.contactId || !form.phoneNumber) {
      showToast('contactId and phoneNumber are required', 'error');
      return;
    }

    try {
      if (editingContact) {
        const res = await fetch(`/api/emergency-contacts/${editingContact._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to update');
        setContacts((prev) => prev.map((c) => (c._id === editingContact._id ? { ...c, ...json.data } : c)));
        showToast('Contact updated successfully');
      } else {
        const res = await fetch('/api/emergency-contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Failed to create');
        }
        // Re-fetch to get the full record
        const fetchRes = await fetch('/api/emergency-contacts?all=true&limit=100');
        if (fetchRes.ok) {
          const fetchJson = await fetchRes.json();
          if (fetchJson.success && fetchJson.data?.items) setContacts(fetchJson.data.items);
        }
        showToast('Contact created successfully');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleActive = async (contact) => {
    const nextActive = !(contact.isActive !== false);
    try {
      const res = await fetch(`/api/emergency-contacts/${contact._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contact, isActive: nextActive }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update');
      setContacts((prev) => prev.map((c) => (c._id === contact._id ? { ...c, isActive: nextActive } : c)));
      showToast(nextActive ? 'Contact activated' : 'Contact deactivated');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (contact) => {
    if (!confirm(`Are you sure you want to permanently delete "${contact.contactId}"?`)) return;
    try {
      const res = await fetch(`/api/emergency-contacts/${contact._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setContacts((prev) => prev.filter((c) => c._id !== contact._id));
      showToast('Contact deleted permanently');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-7 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-64" />
          <div className="h-10 bg-slate-200 dark:bg-gray-700 rounded-2xl animate-pulse w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-gray-700 animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-24 mb-2" />
                  <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-primary underline text-sm">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t("admin.sidebar.emergency_contacts")} Configuration
          </h1>
          <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
            Manage emergency helplines displayed on the public page and footer.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-bold transition-all shadow-saffron-glow focus:outline-none self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center gap-4 text-xs text-charcoal-light dark:text-gray-400">
        <span><strong className="text-charcoal dark:text-white">{contacts.filter((c) => c.isActive !== false).length}</strong> active</span>
        <span><strong className="text-charcoal dark:text-white">{contacts.filter((c) => c.isActive === false).length}</strong> inactive</span>
        <span><strong className="text-charcoal dark:text-white">{contacts.length}</strong> total</span>
      </div>

      {/* Grid of contact cards */}
      {contacts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-charcoal-light dark:text-gray-400">No emergency contacts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {contacts.map((contact) => {
            const Icon = ICON_MAP[contact.iconName] || ShieldAlert;
            const isActiveContact = contact.isActive !== false;
            return (
              <div
                key={contact._id}
                className={`bg-white dark:bg-gray-900 border rounded-3xl p-5 shadow-premium flex items-center justify-between group transition-all ${
                  isActiveContact
                    ? 'border-slate-200/60 dark:border-gray-800'
                    : 'border-red-200/40 dark:border-red-900/20 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${
                    contact.colorClass || 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider block truncate">
                      {contact.titleKey ? t(contact.titleKey) : contact.contactId}
                    </span>
                    <span className="font-heading text-sm font-extrabold text-charcoal dark:text-white mt-0.5 block flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{contact.phoneNumber}</span>
                    </span>
                    {!isActiveContact && (
                      <span className="text-[10px] font-bold text-red-500 dark:text-red-400 mt-0.5 block">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(contact)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-800 hover:text-primary transition-all focus:outline-none"
                    aria-label="Edit contact"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleToggleActive(contact)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-600 transition-all focus:outline-none"
                    aria-label={isActiveContact ? 'Deactivate' : 'Activate'}
                    title={isActiveContact ? 'Deactivate' : 'Activate'}
                  >
                    {isActiveContact ? <Slash className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(contact)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-all focus:outline-none"
                    aria-label="Delete contact"
                    title="Delete permanently"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/60 dark:border-gray-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-extrabold text-charcoal dark:text-white">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Contact ID *</label>
                <input
                  type="text"
                  value={form.contactId}
                  onChange={(e) => handleFormChange('contactId', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. police, ambulance, medical"
                  disabled={!!editingContact}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Title Key</label>
                <input
                  type="text"
                  value={form.titleKey}
                  onChange={(e) => handleFormChange('titleKey', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. emergency_page.contacts.police.title"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Description Key</label>
                <input
                  type="text"
                  value={form.descKey}
                  onChange={(e) => handleFormChange('descKey', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. emergency_page.contacts.police.desc"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Phone Number *</label>
                <input
                  type="text"
                  value={form.phoneNumber}
                  onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. 100 / 112"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Icon</label>
                  <select
                    value={form.iconName}
                    onChange={(e) => handleFormChange('iconName', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Color Class</label>
                <select
                  value={form.colorClass}
                  onChange={(e) => handleFormChange('colorClass', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {COLOR_OPTIONS.map((color) => (
                    <option key={color} value={color}>{color.split(' ')[1]}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => handleFormChange('order', parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Status</label>
                  <div className="flex items-center gap-3 h-full pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => handleFormChange('isActive', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                      />
                      <span className="text-xs text-charcoal-light dark:text-gray-400">Active</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-gray-800">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-charcoal dark:text-white hover:bg-slate-50 dark:hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-saffron-glow"
              >
                {editingContact ? 'Save Changes' : 'Create Contact'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}