"use client";

import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import Modal from './Modal';

export default function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'confirmation',
}) {
  const iconMap = {
    confirmation: { icon: AlertTriangle, className: 'text-amber-500' },
    danger: { icon: AlertTriangle, className: 'text-red-500' },
    success: { icon: CheckCircle, className: 'text-emerald-500' },
    info: { icon: Info, className: 'text-blue-500' },
  };

  const { icon: Icon, className } = iconMap[type] || iconMap.info;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center">
        <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-gray-800 flex items-center justify-center mb-4 ${className}`}>
          <Icon className="w-7 h-7" />
        </div>
        {message && (
          <p className="text-sm text-charcoal-light dark:text-gray-400 leading-relaxed">
            {message}
          </p>
        )}
        <div className="flex gap-3 mt-6 w-full">
          {type !== 'info' && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-bold text-charcoal-light dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-all focus:outline-none"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm || onClose}
            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all focus:outline-none ${
              type === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : type === 'success'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
