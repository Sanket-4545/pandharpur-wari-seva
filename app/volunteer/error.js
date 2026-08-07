"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function VolunteerError({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white shadow-saffron-glow mb-5 relative overflow-hidden">
        <Image src="/images/logo.jpg" alt="NSS Seva Portal logo" fill sizes="64px" className="object-cover" priority />
      </div>
      <h2 className="font-heading text-xl font-extrabold text-charcoal dark:text-white">
        Something Went Wrong
      </h2>
      <p className="mt-2 text-sm text-charcoal-light dark:text-gray-400 text-center max-w-sm">
        An error occurred while loading this section. Please try refreshing.
      </p>
      <div className="flex gap-3 mt-6">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-dark transition-all shadow-sm focus:outline-none"
        >
          Retry
        </button>
        <Link
          href="/volunteer/dashboard"
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-charcoal-light dark:text-gray-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-gray-800 transition-all focus:outline-none"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
