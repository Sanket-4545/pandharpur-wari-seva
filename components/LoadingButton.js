"use client";

import React from 'react';

export default function LoadingButton({
  children,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
}) {
  const base = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20';
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-saffron-glow',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark',
    outline: 'border border-slate-200 dark:border-gray-700 text-charcoal-light dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${
        loading || disabled ? 'opacity-60 cursor-not-allowed' : ''
      } ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
