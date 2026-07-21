"use client";

import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Info, AlertCircle, X } from 'lucide-react';

/**
 * Toast - Reusable floating notification component for the admin dashboard.
 * 
 * Props:
 *  - message: string  — The text to display
 *  - type: 'success' | 'error' | 'warning' | 'info'  (default: 'success')
 *  - duration: number — Auto-dismiss time in ms (default: 3000). Pass 0 to disable auto-dismiss.
 *  - onClose: fn — Called when toast is dismissed
 *  - isVisible: bool — Controls visibility
 *
 * Usage example:
 *   const [toastMsg, setToastMsg] = useState('');
 *   <Toast message={toastMsg} isVisible={!!toastMsg} onClose={() => setToastMsg('')} />
 */
export default function Toast({
  message,
  type = 'success',
  duration = 3000,
  onClose,
  isVisible = false,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setVisible(true);
      if (duration > 0) {
        const timer = setTimeout(() => {
          setVisible(false);
          if (onClose) onClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
    }
  }, [isVisible, duration, onClose]);

  if (!visible || !message) return null;

  const styles = {
    success: {
      container: "bg-slate-900 dark:bg-white text-white dark:text-slate-900",
      icon: <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />,
    },
    error: {
      container: "bg-red-600 dark:bg-red-50 text-white dark:text-red-700",
      icon: <AlertTriangle className="w-4 h-4 text-white dark:text-red-500 shrink-0" />,
    },
    warning: {
      container: "bg-amber-600 dark:bg-amber-50 text-white dark:text-amber-700",
      icon: <AlertCircle className="w-4 h-4 text-white dark:text-amber-500 shrink-0" />,
    },
    info: {
      container: "bg-secondary dark:bg-blue-50 text-white dark:text-secondary",
      icon: <Info className="w-4 h-4 text-blue-200 dark:text-secondary shrink-0" />,
    },
  };

  const { container, icon } = styles[type] || styles.success;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold max-w-sm
        animate-in fade-in slide-in-from-bottom-3 duration-250 ${container}`}
    >
      {icon}
      <span className="leading-snug">{message}</span>
      {onClose && (
        <button
          onClick={() => {
            setVisible(false);
            onClose();
          }}
          className="ml-2 opacity-70 hover:opacity-100 transition-opacity focus:outline-none"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
