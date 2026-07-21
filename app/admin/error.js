"use client";

import { Flame } from 'lucide-react';

export default function AdminError({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white shadow-saffron-glow mb-5">
        <Flame className="w-8 h-8 fill-current" />
      </div>
      <h2 className="font-heading text-xl font-extrabold text-charcoal dark:text-white">
        Dashboard Error
      </h2>
      <p className="mt-2 text-sm text-charcoal-light dark:text-gray-400 text-center max-w-sm">
        An error occurred while loading this section. Please try refreshing.
      </p>
      <button
        onClick={reset}
        className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-dark transition-all shadow-sm focus:outline-none"
      >
        Retry
      </button>
    </div>
  );
}
