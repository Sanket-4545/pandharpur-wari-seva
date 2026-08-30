"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, Eye, Edit3, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ActionMenu({ onView, onEdit, onDelete, onApprove, onReject }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        position: 'fixed',
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
        zIndex: 9999,
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const inButton = buttonRef.current && buttonRef.current.contains(event.target);
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);
      if (!inButton && !inDropdown) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  const toggleMenu = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  const menuContent = isOpen && menuPos && (
    <div ref={dropdownRef} style={menuPos} className="w-36 rounded-xl bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 shadow-premium py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
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

      {onApprove && (
        <button
          onClick={() => {
            onApprove();
            setIsOpen(false);
          }}
          className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Approve
        </button>
      )}

      {onReject && (
        <button
          onClick={() => {
            onReject();
            setIsOpen(false);
          }}
          className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
        >
          <XCircle className="w-3.5 h-3.5" />
          Reject
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
  );

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-55 hover:text-charcoal hover:dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white transition-all focus:outline-none focus:ring-1 focus:ring-primary/40"
        aria-label="Actions menu"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {typeof document !== 'undefined' && createPortal(menuContent, document.body)}
    </div>
  );
}
