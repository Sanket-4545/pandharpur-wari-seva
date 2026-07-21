"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function ImagePreviewModal({ isOpen, onClose, src, alt = '' }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative z-10 max-w-4xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="self-end mb-2 p-2 rounded-xl bg-slate-900/60 text-white hover:bg-slate-900/80 transition-all focus:outline-none"
          aria-label="Close image preview"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
          <img
            src={src}
            alt={alt}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        </div>
      </div>
    </div>
  );
}
