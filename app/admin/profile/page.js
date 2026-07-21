"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { User, Mail, Phone, Shield, Edit3, Key, Clock, Save } from 'lucide-react';

export default function AdminProfilePage() {
  const { t } = useLanguage();
  const [toastMessage, setToastMessage] = useState("");

  // Simulated Profile values
  const [name, setName] = useState("Pradeep Joshi");
  const [email, setEmail] = useState("p.joshi@wariportal.gov.in");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [about, setAbout] = useState("Senior NSS Liaison coordinator managing volunteer camps and dynamic transit routes since 2021. Overseeing a deployment pool of 1,200 student volunteers.");

  // Password fields
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const triggerToast = (msgKey) => {
    setToastMessage(msgKey);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleUpdateInfo = (e) => {
    e.preventDefault();
    triggerToast("admin.profile.toast_profile");
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setOldPass("");
    setNewPass("");
    triggerToast("admin.profile.toast_pwd");
  };

  return (
    <div className="space-y-6">
      
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>{t(toastMessage)}</span>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
          {t("admin.sidebar.profile")} Account Details
        </h1>
        <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
          Manage your personal information coordinates, passwords, and track recent admin events.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Summary of profile details */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5.5 shadow-premium space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Visual Header */}
            <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100 dark:border-gray-850">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white font-heading text-3xl font-extrabold shadow-lg select-none">
                {name.charAt(0)}
              </div>
              <h3 className="mt-3.5 font-heading text-base font-extrabold text-charcoal dark:text-white">
                {name}
              </h3>
              <span className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                <Shield className="w-3 h-3 fill-current" />
                {t("admin.profile.role")}
              </span>
            </div>

            {/* Profile Info Items */}
            <div className="space-y-3.5 text-xs font-semibold text-charcoal-light dark:text-gray-400">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="border-t border-slate-100 dark:border-gray-850 pt-3.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-gray-500 block mb-1">
                  {t("admin.profile.about")}
                </span>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-gray-300">
                  {about}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Timeline logs */}
          <div className="border-t border-slate-100 dark:border-gray-850 pt-4 mt-4 space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-gray-505 block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {t("admin.profile.activity_log")}
            </span>
            
            <div className="space-y-2 text-[10px] font-bold text-slate-500 dark:text-gray-400">
              <div className="flex items-center justify-between gap-4">
                <span>Profile updated</span>
                <span className="text-slate-400 dark:text-gray-550">10 mins ago</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Logged in via Camp IP</span>
                <span className="text-slate-400 dark:text-gray-550">3 hours ago</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Cards: Change Password Form and Edit Details Form (spans 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit Info Form */}
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
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">Email Address Coordinates</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">Short Description (About)</label>
                  <textarea
                    rows={3}
                    required
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-gray-850">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-saffron-glow focus:outline-none"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save profile Info
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
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
                    placeholder="••••••••"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-gray-850">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-saffron-glow focus:outline-none"
                >
                  <Save className="w-3.5 h-3.5" />
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
