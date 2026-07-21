"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Sun, Moon, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationDropdown from './NotificationDropdown';
import Breadcrumb from './Breadcrumb';

export default function AdminTopbar({ toggleMobileOpen, isDarkMode, toggleDarkMode }) {
  const { t } = useLanguage();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    alert("Simulating Logout action. Redirecting to home page...");
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-20 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-slate-200/60 dark:border-gray-800 py-3.5 px-4.5 sm:px-6 flex items-center justify-between shadow-premium transition-all duration-300">
      
      {/* Left controls: mobile menu button, Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileOpen}
          className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-gray-800 text-charcoal hover:text-primary dark:text-gray-300 hover:border-primary/50 dark:hover:border-primary-light/50 focus:outline-none transition-all duration-200"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <Breadcrumb />
        </div>
      </div>

      {/* Right controls: Theme toggle, Notifications, Language, Profile dropdown */}
      <div className="flex items-center gap-3.5">
        
        {/* Dark mode button UI */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-gray-800 text-charcoal-light dark:text-gray-400 hover:text-primary dark:hover:text-primary-light hover:border-primary/20 dark:hover:border-primary-light/20 bg-white dark:bg-transparent transition-all focus:outline-none shadow-sm"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Language Switcher */}
        <LanguageSwitcher className="scale-90" />

        {/* User profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 py-1 px-2.5 rounded-2xl border border-slate-200 dark:border-gray-800 hover:border-primary/30 dark:hover:border-primary-light/30 transition-all focus:outline-none bg-white dark:bg-transparent"
            aria-label="Profile menu"
          >
            {/* Avatar placeholder */}
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white font-extrabold text-xs tracking-tight shadow-md select-none">
              A
            </div>
            <span className="hidden lg:block text-xs font-bold text-slate-700 dark:text-gray-300">
              Admin
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/70 dark:border-gray-800 shadow-2xl z-50 py-2.5 animate-in fade-in slide-in-from-top-3 duration-250">
              {/* Profile Card Header Info */}
              <div className="px-4 py-2 border-b border-slate-100 dark:border-gray-850 mb-2">
                <p className="text-xs font-extrabold text-charcoal dark:text-white leading-tight">
                  NSS Coordinator
                </p>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-gray-500 leading-tight mt-0.5">
                  admin@wariportal.gov.in
                </p>
              </div>

              <Link
                href="/admin/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-850 hover:text-primary dark:hover:text-primary-light transition-all"
              >
                <User className="w-4 h-4" />
                {t("admin.sidebar.profile")}
              </Link>

              <Link
                href="/admin/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-850 hover:text-primary dark:hover:text-primary-light transition-all"
              >
                <Settings className="w-4 h-4" />
                {t("admin.sidebar.settings")}
              </Link>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-bold text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border-t border-slate-100 dark:border-gray-850 mt-1.5 pt-2"
              >
                <LogOut className="w-4 h-4" />
                {t("admin.sidebar.logout")}
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
