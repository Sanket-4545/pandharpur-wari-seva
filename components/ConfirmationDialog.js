"use client";

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import { useLanguage } from '@/context/LanguageContext';

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
}) {
  const { t } = useLanguage();

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  };

  const iconBgStyles = {
    danger: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400',
    warning: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    success: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || t('admin.common.confirm')}>
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBgStyles[variant]}`}>
          <AlertTriangle className="w-5.5 h-5.5" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-charcoal dark:text-gray-200 font-semibold leading-relaxed">
            {message || t('admin.common.confirm')}
          </p>
          <p className="mt-1.5 text-xs text-charcoal-light dark:text-gray-400">
            This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-gray-800 text-charcoal-light dark:text-gray-400 bg-white hover:bg-slate-50 dark:bg-transparent dark:hover:bg-gray-800 transition-colors focus:outline-none"
            >
              {cancelLabel || t('admin.common.cancel')}
            </button>
            <button
              onClick={async () => {
                await onConfirm();
                onClose();
              }}
              className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-colors focus:outline-none ${variantStyles[variant]}`}
            >
              {confirmLabel || t('admin.common.confirm')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
