"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Settings, Save, Upload, HelpCircle, Phone, Globe, Info } from 'lucide-react';

export default function SettingsAdmin() {
  const { t } = useLanguage();
  const [toastVisible, setToastVisible] = useState(false);

  // Forms states
  const [webName, setWebName] = useState("Pandharpur Wari NSS Seva Portal");
  const [emailSupport, setEmailSupport] = useState("nss-seva@wariportal.org");
  const [campOfficePhone, setCampOfficePhone] = useState("+91 22 2202 4444");
  const [footerText, setFooterText] = useState("© 2026 Pandharpur Wari NSS Seva Portal. All rights reserved.");

  const handleSave = (e) => {
    e.preventDefault();
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast alert popup */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-250">
          <span>{t("admin.settings.toast_success")}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t("admin.sidebar.settings")} Config
          </h1>
          <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
            Global system coordinates. Adjust configurations for branding, helplines, and footer text logs.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Parameters columns (spans 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Branding Section */}
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
                <div className="border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-2xl p-6.5 flex flex-col items-center justify-center text-slate-450 hover:bg-slate-50/50 dark:hover:bg-gray-850/10 cursor-pointer transition-colors">
                  <Upload className="w-8 h-8 text-slate-350 dark:text-gray-600 mb-2" />
                  <span className="text-[10px] font-bold text-charcoal dark:text-gray-300">Choose custom logo image file</span>
                  <span className="text-[9px] text-slate-400 dark:text-gray-505 mt-1">{t("admin.settings.logo_desc")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details & Social Links */}
          <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium space-y-4">
            <h3 className="font-heading text-sm font-bold text-charcoal dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-gray-855 flex items-center gap-2">
              <Phone className="w-4.5 h-4.5 text-primary" />
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

        {/* Right Side: Informative Card & Save Button */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
            <h3 className="font-heading text-sm font-bold text-charcoal dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-gray-850 flex items-center gap-2 mb-4">
              <Info className="w-4.5 h-4.5 text-primary" />
              Information
            </h3>
            
            <p className="text-xs text-charcoal-light dark:text-gray-400 leading-relaxed font-semibold">
              Modifying these fields is simulated. The inputs will update the state locally during this session. In Phase 5, these adjustments will write directly to Mongo configuration structures.
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-4.5 bg-primary hover:bg-primary-dark text-white rounded-3xl font-heading text-xs font-bold transition-all shadow-saffron-glow focus:outline-none hover:-translate-y-0.5 active:scale-95"
          >
            <Save className="w-4.5 h-4.5" />
            {t("admin.settings.save_btn")}
          </button>
        </div>

      </form>

    </div>
  );
}
