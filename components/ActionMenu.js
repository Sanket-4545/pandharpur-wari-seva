"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Eye, Edit3, Trash2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ActionMenu({ onView, onEdit, onDelete }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-slate-450 hover:bg-slate-55 hover:text-charcoal hover:dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white transition-all focus:outline-none focus:ring-1 focus:ring-primary/40"
        aria-label="Actions menu"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 shadow-premium z-40 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {onView && (
            <button
              onClick={() => {
                onView();
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-primary-light transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              {t("admin.common.view")}
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 hover:text-secondary-light dark:hover:text-secondary-light transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {t("admin.common.edit")}
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all border-t border-slate-100 dark:border-gray-850 mt-1 pt-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t("admin.common.delete")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
