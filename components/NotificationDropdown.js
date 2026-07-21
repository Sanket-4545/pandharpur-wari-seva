"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function NotificationDropdown() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Simulated notification list
  const [notifications, setNotifications] = useState([
    { id: 1, textKey: "admin.activities.volunteer_registered", read: false, time: "2 mins ago" },
    { id: 2, textKey: "admin.activities.missing_person_reported", read: false, time: "15 mins ago" },
    { id: 3, textKey: "admin.activities.lost_item_found", read: true, time: "1 hour ago" },
    { id: 4, textKey: "admin.activities.emergency_received", read: true, time: "2 hours ago" },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl border border-slate-200 dark:border-gray-800 text-charcoal-light dark:text-gray-400 hover:text-primary dark:hover:text-primary-light hover:border-primary/20 dark:hover:border-primary-light/20 bg-white dark:bg-transparent transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 relative active:scale-95 shadow-sm"
        aria-label="Notifications"
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-650 ring-2 ring-white dark:ring-gray-900 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/70 dark:border-gray-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-gray-950/20 border-b border-slate-100 dark:border-gray-800">
            <span className="font-heading text-xs font-extrabold text-charcoal dark:text-white uppercase tracking-wider">
              Notifications ({unreadCount})
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-gray-850">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => toggleRead(n.id)}
                  className={`p-3.5 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-gray-850/50 transition-colors ${
                    !n.read ? 'bg-primary/2 dark:bg-primary-dark/2 font-semibold' : ''
                  }`}
                >
                  <div className="flex-grow">
                    <p className="text-xs text-slate-700 dark:text-gray-300 leading-snug">
                      {t(n.textKey).replace(" Rahul Deshmukh", "").replace(" Vitthal Rao", "").replace(" Black Leather Wallet", "").replace(" Medical Assistance", "")}
                    </p>
                    <span className="mt-1 flex items-center gap-1 text-[9px] text-slate-400 dark:text-gray-500 font-bold">
                      <Clock className="w-2.5 h-2.5" />
                      {n.time}
                    </span>
                  </div>

                  {!n.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRead(n.id);
                      }}
                      className="w-5 h-5 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all shrink-0"
                      aria-label="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-gray-500 font-semibold">
                No new notifications.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
