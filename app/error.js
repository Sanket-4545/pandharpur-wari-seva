"use client";

import { Flame } from 'lucide-react';

export default function Error({ error, reset }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white shadow-saffron-glow mb-6">
        <Flame className="w-10 h-10 fill-current" />
      </div>
      <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-secondary dark:text-white tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-3 text-sm text-charcoal-light dark:text-gray-400 max-w-md text-center leading-relaxed">
        An unexpected error occurred. Please try again or contact support if the issue persists.
      </p>
      <div className="flex gap-3 mt-8">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all shadow-saffron-glow focus:outline-none"
        >
          Try Again
        </button>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 dark:border-gray-700 text-charcoal-light dark:text-gray-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-gray-800 transition-all focus:outline-none"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
