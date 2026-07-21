"use client";

import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label="Search"
        className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-charcoal dark:text-white shadow-premium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium placeholder-slate-400 dark:placeholder-gray-500"
      />
    </div>
  );
}
