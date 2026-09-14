"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useLanguage } from '@/context/LanguageContext';
import Toast from '@/components/Toast';
import Modal from '@/components/Modal';
import {
  Users, Eye, EyeOff, Shield, ShieldCheck, ShieldOff,
  Save, Loader2, Key, Search, CheckCircle, XCircle, X,
  User, Mail, Phone, Info
} from 'lucide-react';

export default function AdminManagePage() {
  const { t } = useLanguage();
  const { role } = useAdminAuth();
  const router = useRouter();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });
  const [searchTerm, setSearchTerm] = useState('');

  const [viewingAdmin, setViewingAdmin] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', about: '' });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordAdmin, setPasswordAdmin] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (role !== null && role !== 'super_admin') {
      setIsRedirecting(true);
      router.push('/admin');
    }
  }, [role, router]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, visible: true });
  }, []);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admins?limit=100');
      if (!res.ok) throw new Error('Failed to load admins');
      const json = await res.json();
      if (json.success && json.data?.items) {
        setAdmins(json.data.items);
      } else {
        setAdmins([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === 'super_admin') {
      fetchAdmins();
    }
  }, [role, fetchAdmins]);

  const filteredAdmins = admins.filter(admin => {
    const term = searchTerm.toLowerCase();
    return term === '' ||
      [admin.name, admin.email, admin.role]
        .some(val => val && val.toString().toLowerCase().includes(term));
  });

  const handleToggleActive = async (admin) => {
    try {
      const res = await fetch(`/api/admins/${admin._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !admin.isActive }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to update status');
      }
      setAdmins(prev => prev.map(a =>
        a._id === admin._id ? { ...a, isActive: !a.isActive } : a
      ));
      setViewingAdmin(prev => {
        if (prev && prev._id === admin._id) {
          return { ...prev, isActive: !prev.isActive };
        }
        return prev;
      });
      showToast(admin.isActive ? 'Admin deactivated' : 'Admin activated');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setEditForm({
      name: admin.name || '',
      phone: admin.phone || '',
      about: admin.about || '',
    });
  };

  const handleEditSave = async () => {
    if (!editForm.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/admins/${editingAdmin._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          phone: editForm.phone.trim() || null,
          about: editForm.about.trim() || null,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to update admin');
      }
      const json = await res.json();
      if (json.success && json.data) {
        setAdmins(prev => prev.map(a =>
          a._id === editingAdmin._id ? { ...a, ...json.data } : a
        ));
        setViewingAdmin(prev => {
          if (prev && prev._id === editingAdmin._id) {
            return { ...prev, ...json.data };
          }
          return prev;
        });
      }
      showToast('Admin updated successfully');
      setEditingAdmin(null);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openPasswordModal = (admin) => {
    setPasswordAdmin(admin);
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setPasswordError('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async () => {
    setPasswordError('');
    if (!newPassword) {
      setPasswordError('Password is required');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (newPassword.length > 64) {
      setPasswordError('Password must be at most 64 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsPasswordSubmitting(true);
    try {
      const res = await fetch(`/api/admins/${passwordAdmin._id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to reset password');
      }
      showToast('Password reset successfully');
      setShowPasswordModal(false);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'super_admin') {
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/30';
    }
    if (role === 'admin') {
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30';
    }
    return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
  };

  if (role === null || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-48" />
        <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
          Admin Management
        </h1>
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button onClick={fetchAdmins} className="mt-4 text-primary underline text-sm">
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            Admin Management
          </h1>
          <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
            Manage admin accounts, passwords, and access status
          </p>
        </div>
      </div>

      {/* Admin Table */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-gray-850 pl-10.5 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-gray-800 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all dark:text-white"
            />
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-gray-400">
            {filteredAdmins.length} admin(s) found
          </div>
        </div>

        {filteredAdmins.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-charcoal-light dark:text-gray-400 text-sm">No admins found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-gray-850">
              <thead className="bg-slate-50/70 dark:bg-gray-950/20">
                <tr>
                  <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-charcoal-light dark:text-gray-400 tracking-wider uppercase">
                    Name
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-charcoal-light dark:text-gray-400 tracking-wider uppercase hidden sm:table-cell">
                    Email
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-charcoal-light dark:text-gray-400 tracking-wider uppercase">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-charcoal-light dark:text-gray-400 tracking-wider uppercase">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-extrabold text-charcoal-light dark:text-gray-400 tracking-wider uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-850 bg-white dark:bg-gray-900">
                {filteredAdmins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-slate-50/45 dark:hover:bg-gray-850/40 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                          {(admin.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-gray-300">{admin.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-700 dark:text-gray-300 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {admin.email}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getRoleBadge(admin.role)}`}>
                        {admin.role === 'super_admin' && <Shield className="w-3 h-3" />}
                        {admin.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                        {admin.role === 'coordinator' && <User className="w-3 h-3" />}
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        admin.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30'
                          : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30'
                      }`}>
                        {admin.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingAdmin(admin)}
                          className="p-1.5 rounded-lg text-slate-450 hover:bg-slate-100 hover:text-charcoal hover:dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {admin.role !== 'super_admin' && (
                          <>
                            <button
                              onClick={() => openEditModal(admin)}
                              className="p-1.5 rounded-lg text-slate-450 hover:bg-blue-50 hover:text-blue-600 hover:dark:bg-blue-950/20 dark:text-gray-400 dark:hover:text-blue-400 transition-all"
                              title="Edit Admin"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openPasswordModal(admin)}
                              className="p-1.5 rounded-lg text-slate-450 hover:bg-amber-50 hover:text-amber-600 hover:dark:bg-amber-950/20 dark:text-gray-400 dark:hover:text-amber-400 transition-all"
                              title="Reset Password"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleActive(admin)}
                              className={`p-1.5 rounded-lg text-slate-450 transition-all ${
                                admin.isActive
                                  ? 'hover:bg-red-50 hover:text-red-600 hover:dark:bg-red-950/20 dark:hover:text-red-400'
                                  : 'hover:bg-emerald-50 hover:text-emerald-600 hover:dark:bg-emerald-950/20 dark:hover:text-emerald-400'
                              } dark:text-gray-400`}
                              title={admin.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {admin.isActive ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
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
        )}
      </div>

      {/* View Admin Details Modal */}
      {viewingAdmin && (
        <Modal
          isOpen={!!viewingAdmin}
          onClose={() => setViewingAdmin(null)}
          title={`Admin: ${viewingAdmin.name}`}
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="w-full h-20 rounded-2xl bg-gradient-to-tr from-secondary to-blue-800 flex items-center px-6 text-white relative shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-heading text-lg font-bold">
                  {(viewingAdmin.name || '?').charAt(0)}
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-sm">{viewingAdmin.name}</h4>
                  <p className="text-[10px] text-blue-100">{viewingAdmin.email}</p>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">Email (Login ID)</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">{viewingAdmin.email}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">Role</span>
                <span className={`mt-1 block`}>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getRoleBadge(viewingAdmin.role)}`}>
                    {viewingAdmin.role}
                  </span>
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">Status</span>
                <span className="mt-1 block">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    viewingAdmin.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30'
                      : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30'
                  }`}>
                    {viewingAdmin.isActive ? 'Active' : 'Inactive'}
                  </span>
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">Phone</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">{viewingAdmin.phone || '-'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">Created</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">
                  {viewingAdmin.createdAt ? new Date(viewingAdmin.createdAt).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">Last Login</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">
                  {viewingAdmin.lastLoginAt ? new Date(viewingAdmin.lastLoginAt).toLocaleString() : 'Never'}
                </span>
              </div>
              {viewingAdmin.about && (
                <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                  <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">About</span>
                  <span className="font-bold text-charcoal dark:text-white mt-1 block">{viewingAdmin.about}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {viewingAdmin.role !== 'super_admin' && (
              <div className="border-t border-slate-100 dark:border-gray-800 pt-4 mt-2">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      const a = viewingAdmin;
                      setViewingAdmin(null);
                      openEditModal(a);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-gray-800 text-charcoal-light dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-850 rounded-xl transition-all text-xs font-bold"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      const a = viewingAdmin;
                      setViewingAdmin(null);
                      openPasswordModal(a);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-amber-200 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-xl transition-all text-xs font-bold"
                  >
                    <Key className="w-4 h-4" />
                    Reset Password
                  </button>
                  <button
                    onClick={() => {
                      handleToggleActive(viewingAdmin);
                    }}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all text-xs font-bold ${
                      viewingAdmin.isActive
                        ? 'border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {viewingAdmin.isActive ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    {viewingAdmin.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <Modal
          isOpen={!!editingAdmin}
          onClose={() => setEditingAdmin(null)}
          title={`Edit Admin: ${editingAdmin.name}`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Display Name *</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Phone</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">About</label>
              <textarea
                value={editForm.about}
                onChange={(e) => setEditForm(prev => ({ ...prev, about: e.target.value }))}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingAdmin(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-charcoal dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && passwordAdmin && (
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title={`Reset Password: ${passwordAdmin.name}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-xl">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                  This will reset the password for <strong>{passwordAdmin.email}</strong>. The old password will no longer work.
                </p>
              </div>
            </div>

            {passwordError && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-xl px-4 py-3">
                {passwordError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">New Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-charcoal dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">Confirm Password *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-charcoal dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                disabled={isPasswordSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                {isPasswordSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Key className="w-4 h-4" />
                )}
                Reset Password
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
