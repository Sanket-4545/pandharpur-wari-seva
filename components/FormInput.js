"use client";

import React from 'react';

export default function FormInput({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success,
  required = false,
  disabled = false,
}) {
  return (
    <div className="flex flex-col gap-2 w-full text-left">
      <label htmlFor={id} className="text-sm font-bold text-charcoal dark:text-gray-200">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full px-4 py-3.5 rounded-xl border bg-white dark:bg-gray-900 text-charcoal dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 transition-all duration-250 focus:outline-none focus:ring-2 ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-gray-800'
            : error
              ? 'border-red-500 focus:ring-red-500/20'
              : success
                ? 'border-emerald-500 focus:ring-emerald-500/20'
                : 'border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600 focus:border-primary focus:ring-primary/20'
        }`}
      />
      {error && (
        <span id={`${id}-error`} role="alert" className="text-xs font-semibold text-red-500 mt-1 select-none">
          {error}
        </span>
      )}
      {success && !error && (
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 select-none">
          {success}
        </span>
      )}
    </div>
  );
}
