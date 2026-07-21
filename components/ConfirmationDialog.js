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
  messageKey, 
  messageArgs 
}) {
  const { t } = useLanguage();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || t("admin.common.confirm")}>
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
          <AlertTriangle className="w-5.5 h-5.5" />
        </div>
        <div>
          <p className="text-sm text-charcoal dark:text-gray-200 font-semibold leading-relaxed">
            {messageKey ? t(messageKey) : t("admin.common.confirm")}
          </p>
          <p className="mt-1.5 text-xs text-charcoal-light dark:text-gray-400">
            This action cannot be undone. All related record updates will be applied locally.
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-gray-800 text-charcoal-light dark:text-gray-400 bg-white hover:bg-slate-50 dark:bg-transparent dark:hover:bg-gray-800 transition-colors focus:outline-none"
            >
              {t("admin.common.cancel")}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4.5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors focus:outline-none"
            >
              {t("admin.common.delete")}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
