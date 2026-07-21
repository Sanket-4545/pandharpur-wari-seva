import Link from 'next/link';
import { Flame } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white shadow-saffron-glow mb-6">
        <Flame className="w-10 h-10 fill-current" />
      </div>
      <h1 className="font-heading text-5xl md:text-7xl font-extrabold text-secondary dark:text-white tracking-tight">
        404
      </h1>
      <p className="mt-3 text-lg font-semibold text-charcoal-light dark:text-gray-400">
        Page not found
      </p>
      <p className="mt-1 text-sm text-charcoal-light/70 dark:text-gray-500 max-w-md text-center">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all shadow-saffron-glow focus:outline-none"
      >
        Back to Home
      </Link>
    </div>
  );
}
