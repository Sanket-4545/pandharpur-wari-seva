"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { User, Mail, Phone, Shield, Edit3, Key, Clock, Save, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import LoadingButton from '@/components/LoadingButton';

function timeAgo(dateStr, t, locale) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return t('admin.profile.time_just_now');
  if (mins < 60) return t('admin.profile.time_min_ago').replace('{n}', mins);
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t('admin.profile.time_hours_ago').replace('{n}', hrs);
  const days = Math.floor(hrs / 24);
  if (days < 30) return t('admin.profile.time_days_ago').replace('{n}', days);
  return date.toLocaleDateString();
}

export default function AdminProfilePage() {
  const { t, locale } = useLanguage();
  const { authFetch } = useAdminAuth();
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
  const [confirmPass, setConfirmPass] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submittingInfo, setSubmittingInfo] = useState(false);
  const [submittingPwd, setSubmittingPwd] = useState(false);

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

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
      const res = await authFetch('/api/admins/me', {
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
    setPasswordError("");
    if (newPass !== confirmPass) {
      setPasswordError(t('admin.profile.password_mismatch'));
      return;
    }
    if (newPass.length < 8) {
      setPasswordError(t('admin.profile.password_min_length'));
      return;
    }
    if (newPass === oldPass) {
      setPasswordError(t('admin.profile.same_password'));
      return;
    }
    setSubmittingPwd(true);
    try {
      const res = await authFetch('/api/admins/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: oldPass, newPassword: newPass }),
      });
      const json = await res.json();
      if (!json.success) {
        if (res.status === 429) {
          setPasswordError(t('admin.profile.rate_limit_error'));
        } else {
          setPasswordError(json.error || t('admin.profile.invalid_current_password'));
        }
        return;
      }
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
      setPasswordError('');
      triggerToast('admin.profile.password_updated');
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
          {t("common.retry")}
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
          {t("common.retry")}
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
          {t("admin.profile.account_details")}
        </h1>
        <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
          {t("admin.profile.account_desc")}
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
                {profile.role === 'super_admin' ? t("login.super_admin") : profile.role === 'admin' ? t("login.sub_admin") : t("login.coordinator")}
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
                <span>{t("admin.profile.last_login")}</span>
                <span className="text-slate-400 dark:text-gray-550">{timeAgo(profile.lastLoginAt, t, locale) || '—'}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>{t("admin.profile.profile_updated")}</span>
                <span className="text-slate-400 dark:text-gray-550">{timeAgo(profile.updatedAt, t, locale) || '—'}</span>
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
                  <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">{t("admin.profile.label_full_name")}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">{t("admin.profile.label_contact")}</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">{t("admin.profile.label_email")}</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full bg-slate-100 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-slate-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">{t("admin.profile.label_about")}</label>
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
                  {t("admin.profile.save_profile")}
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
              {passwordError && (
                <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {passwordError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase" htmlFor="current-password">{t("admin.profile.current_password")}</label>
                  <div className="relative">
                    <input
                      id="current-password"
                      type={showCurrentPass ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder={t("admin.profile.current_password_placeholder")}
                      value={oldPass}
                      onChange={(e) => setOldPass(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white pr-10"
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary">
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase" htmlFor="new-password">{t("admin.profile.new_password")}</label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showNewPass ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder={t("admin.profile.new_password_placeholder")}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white pr-10"
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary">
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase" htmlFor="confirm-password">{t("admin.profile.confirm_password")}</label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPass ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder={t("admin.profile.confirm_password_placeholder")}
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white pr-10"
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary">
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-gray-850">
                <LoadingButton
                  type="submit"
                  loading={submittingPwd}
                  disabled={submittingPwd}
                  variant="primary"
                  onClick={handleUpdatePassword}
                >
                  {t("admin.profile.update_password")}
                </LoadingButton>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
