"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Settings as SettingsIcon, Save, Upload, Globe, Info, Loader2, AlertCircle } from 'lucide-react';
import Toast from '@/components/Toast';
import FormSkeleton from '@/components/FormSkeleton';

const SETTING_KEYS = ['web_name', 'email_support', 'camp_office_phone', 'footer_text'];

const DEFAULT_VALUES = {
  web_name: 'Pandharpur Wari NSS Seva Portal',
  email_support: 'nss-seva@wariportal.org',
  camp_office_phone: '+91 22 2202 4444',
  footer_text: '© 2026 Pandharpur Wari NSS Seva Portal. All rights reserved. Developed by Sanket Dadasaheb Bhojane.',
};

export default function SettingsAdmin() {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const [webName, setWebName] = useState('');
  const [emailSupport, setEmailSupport] = useState('');
  const [campOfficePhone, setCampOfficePhone] = useState('');
  const [footerText, setFooterText] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
  };

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/settings?limit=50');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load settings');
      const items = json.data.items || [];
      const map = {};
      for (const item of items) {
        map[item.key] = item.value;
      }
      setWebName(map.web_name ?? DEFAULT_VALUES.web_name);
      setEmailSupport(map.email_support ?? DEFAULT_VALUES.email_support);
      setCampOfficePhone(map.camp_office_phone ?? DEFAULT_VALUES.camp_office_phone);
      setFooterText(map.footer_text ?? DEFAULT_VALUES.footer_text);
    } catch (err) {
      setFetchError(err.message);
      showToast(t('admin.settings.toast_fetch_error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = [
      { key: 'web_name', value: webName },
      { key: 'email_support', value: emailSupport },
      { key: 'camp_office_phone', value: campOfficePhone },
      { key: 'footer_text', value: footerText },
    ];

    try {
      const results = await Promise.allSettled(
        payload.map((p) =>
          fetch('/api/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(p),
          }).then((r) => r.json())
        )
      );

      const failures = results.filter((r) => r.status === 'rejected' || (r.value && !r.value.success));
      if (failures.length > 0) {
        showToast(t('admin.settings.toast_save_error'), 'error');
      } else {
        showToast(t('admin.settings.toast_success'));
      }
    } catch {
      showToast(t('admin.settings.toast_save_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t("admin.sidebar.settings")} Config
          </h1>
          <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
            {t("admin.settings.title")}
          </p>
        </div>
        <FormSkeleton fields={5} />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <p className="text-sm font-semibold text-red-600">{fetchError}</p>
        <button
          onClick={fetchSettings}
          className="text-xs px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark"
        >
          {t("common.retry")}
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

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t("admin.sidebar.settings")} Config
          </h1>
          <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
            {t("admin.settings.title")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium space-y-4">
            <h3 className="font-heading text-sm font-bold text-charcoal dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-gray-850 flex items-center gap-2">
              <Globe className="w-4.5 h-4.5 text-primary" />
              General Branding
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">
                  {t("admin.settings.web_name")}
                </label>
                <input
                  type="text"
                  required
                  value={webName}
                  onChange={(e) => setWebName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">
                  {t("admin.settings.logo")}
                </label>
                <div className="border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-2xl p-6.5 flex flex-col items-center justify-center text-slate-450">
                  <Upload className="w-8 h-8 text-slate-350 dark:text-gray-600 mb-2" />
                  <span className="text-[10px] font-bold text-charcoal dark:text-gray-300">Choose custom logo image file</span>
                  <span className="text-[9px] text-slate-400 dark:text-gray-505 mt-1">{t("admin.settings.logo_desc")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium space-y-4">
            <h3 className="font-heading text-sm font-bold text-charcoal dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-gray-855 flex items-center gap-2">
              <SettingsIcon className="w-4.5 h-4.5 text-primary" />
              {t("admin.settings.contact")} helplines
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">
                  Camp Office Support Phone
                </label>
                <input
                  type="text"
                  required
                  value={campOfficePhone}
                  onChange={(e) => setCampOfficePhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">
                  Email Support Coordinates
                </label>
                <input
                  type="email"
                  required
                  value={emailSupport}
                  onChange={(e) => setEmailSupport(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">
                  Footer Copyright Copyright Text
                </label>
                <input
                  type="text"
                  required
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                />
              </div>
            </div>
          </div>

        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
            <h3 className="font-heading text-sm font-bold text-charcoal dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-gray-850 flex items-center gap-2 mb-4">
              <Info className="w-4.5 h-4.5 text-primary" />
              Information
            </h3>

            <p className="text-xs text-charcoal-light dark:text-gray-400 leading-relaxed font-semibold">
              {t("admin.settings.info_desc")}
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-4.5 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white rounded-3xl font-heading text-xs font-bold transition-all shadow-saffron-glow focus:outline-none hover:-translate-y-0.5 active:scale-95"
          >
            {saving ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Save className="w-4.5 h-4.5" />}
            {saving ? t("admin.settings.saving") : t("admin.settings.save_btn")}
          </button>
        </div>

      </form>

    </div>
  );
}
