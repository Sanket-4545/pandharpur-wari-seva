"use client";

import React from 'react';
import { Flame } from 'lucide-react';

export default function PageLoader({ text = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white shadow-saffron-glow animate-pulse">
        <Flame className="w-7 h-7 fill-current" />
      </div>
      <div className="mt-5 flex gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <p className="mt-4 text-sm font-bold text-charcoal-light dark:text-gray-400 animate-pulse">{text}</p>
    </div>
  );
}
