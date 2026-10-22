"use client";

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
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
  const [confirming, setConfirming] = useState(false);

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white',
  };

  const iconBgStyles = {
    danger: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400',
    warning: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    success: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
  };

  const iconMap = {
    danger: AlertTriangle,
    warning: AlertTriangle,
    success: CheckCircle,
  };

  const IconComponent = iconMap[variant] || AlertTriangle;

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Error is handled by the caller (onConfirm typically shows a toast)
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={confirming ? undefined : onClose} title={title || t('admin.common.confirm')}>
      <div className="flex flex-col gap-4 text-center sm:text-left min-w-0">
        {/* Icon */}
        <div className="flex justify-center sm:justify-start">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconBgStyles[variant]}`}>
            <IconComponent className="w-6 h-6" />
          </div>
        </div>

        {/* Message */}
        <div className="flex-1 w-full max-w-xs mx-auto sm:mx-0 sm:max-w-none min-w-0">
          <p className="text-base text-charcoal dark:text-gray-200 font-medium leading-relaxed break-words overflow-wrap-anywhere">
            {message || t('admin.common.confirm')}
          </p>
          {variant !== 'success' && (
            <p className="mt-2 text-sm text-charcoal-light dark:text-gray-400 leading-relaxed break-words overflow-wrap-anywhere">
              {t('admin.common.cannot_undo')}
            </p>
          )}
        </div>

        {/* Action Buttons - stacked on mobile, side-by-side on larger screens */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
          {/* Cancel button - full width on mobile, auto on larger */}
          <button
            onClick={onClose}
            disabled={confirming}
            className="flex-1 sm:flex-none w-full sm:w-auto max-w-full min-w-0 flex px-5 py-3.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-gray-700 text-charcoal dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] items-center justify-center"
          >
            {cancelLabel || t('admin.common.cancel')}
          </button>

          {/* Confirm button - full width on mobile, auto on larger */}
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className={`flex-1 sm:flex-none w-full sm:w-auto max-w-full min-w-0 flex px-5 py-3.5 rounded-xl text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] items-center justify-center ${variantStyles[variant]}`}
          >
            {confirming ? t('admin.common.processing') : (confirmLabel || t('admin.common.confirm'))}
          </button>
        </div>
      </div>
    </Modal>
  );
}