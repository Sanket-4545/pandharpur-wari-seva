"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { User, Mail, Phone, Shield, Edit3, Key, Clock, Save, Loader2, AlertCircle } from 'lucide-react';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
}

export default function AdminProfilePage() {
  const { t } = useLanguage();
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("");

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [submittingInfo, setSubmittingInfo] = useState(false);
  const [submittingPwd, setSubmittingPwd] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admins/me');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load profile');
      const data = json.data;
      setProfile(data);
      setName(data.name || '');
      setPhone(data.phone || '');
      setAbout(data.about || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setSubmittingInfo(true);
    try {
      const res = await fetch('/api/admins/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, about }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Update failed');
      setProfile(json.data);
      triggerToast('admin.profile.toast_profile');
    } catch (err) {
      triggerToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSubmittingInfo(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPass.length < 8) {
      triggerToast('Password must be at least 8 characters', 'error');
      return;
    }
    setSubmittingPwd(true);
    try {
      const res = await fetch('/api/admins/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: oldPass, newPassword: newPass }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Password change failed');
      setOldPass('');
      setNewPass('');
      triggerToast('admin.profile.toast_pwd');
    } catch (err) {
      triggerToast(err.message || 'Failed to change password', 'error');
    } finally {
      setSubmittingPwd(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <p className="text-sm font-semibold text-red-600">{error}</p>
        <button onClick={fetchProfile} className="text-xs px-4 py-2 bg-primary text-white rounded-xl">
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertCircle className="w-10 h-10 text-slate-400" />
        <p className="text-sm font-semibold text-slate-500">{t('common.no_data')}</p>
        <button onClick={fetchProfile} className="text-xs px-4 py-2 bg-primary text-white rounded-xl">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {toastMessage && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 ${toastType === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}>
          <span>{toastType === 'error' ? toastMessage : t(toastMessage)}</span>
        </div>
      )}

      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
          {t("admin.sidebar.profile")} Account Details
        </h1>
        <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
          Manage your personal information coordinates, passwords, and track recent admin events.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5.5 shadow-premium space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100 dark:border-gray-850">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white font-heading text-3xl font-extrabold shadow-lg select-none">
                {(profile.name || 'A').charAt(0)}
              </div>
              <h3 className="mt-3.5 font-heading text-base font-extrabold text-charcoal dark:text-white">
                {profile.name}
              </h3>
              <span className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                <Shield className="w-3 h-3 fill-current" />
                {profile.role === 'super_admin' ? t("admin.profile.role") : profile.role}
              </span>
            </div>

            <div className="space-y-3.5 text-xs font-semibold text-charcoal-light dark:text-gray-400">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>{profile.phone || '—'}</span>
              </div>
              <div className="border-t border-slate-100 dark:border-gray-850 pt-3.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-gray-500 block mb-1">
                  {t("admin.profile.about")}
                </span>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-gray-300">
                  {profile.about || '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-gray-850 pt-4 mt-4 space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-gray-505 block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {t("admin.profile.activity_log")}
            </span>

            <div className="space-y-2 text-[10px] font-bold text-slate-500 dark:text-gray-400">
              <div className="flex items-center justify-between gap-4">
                <span>Last login</span>
                <span className="text-slate-400 dark:text-gray-550">{timeAgo(profile.lastLoginAt) || '—'}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Profile updated</span>
                <span className="text-slate-400 dark:text-gray-550">{timeAgo(profile.updatedAt) || '—'}</span>
              </div>
            </div>
          </div>

        </div>

        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
            <h3 className="font-heading text-sm font-bold text-charcoal dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-gray-850 mb-5 flex items-center gap-2">
              <Edit3 className="w-4.5 h-4.5 text-primary" />
              {t("admin.profile.edit_profile")}
            </h3>

            <form onSubmit={handleUpdateInfo} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">Full Admin Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">Contact Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">Email Address Coordinates</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full bg-slate-100 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-slate-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">Short Description (About)</label>
                  <textarea
                    rows={3}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-gray-850">
                <button
                  type="submit"
                  disabled={submittingInfo}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-xl shadow-saffron-glow focus:outline-none"
                >
                  {submittingInfo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save profile Info
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
            <h3 className="font-heading text-sm font-bold text-charcoal dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-gray-850 mb-5 flex items-center gap-2">
              <Key className="w-4.5 h-4.5 text-primary" />
              {t("admin.profile.change_pwd")}
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={oldPass}
                    onChange={(e) => setOldPass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="•••••••• (min 8 chars)"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-gray-850">
                <button
                  type="submit"
                  disabled={submittingPwd}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-xl shadow-saffron-glow focus:outline-none"
                >
                  {submittingPwd ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Update Password
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
