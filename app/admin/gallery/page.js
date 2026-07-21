"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Plus, Trash2, Tag, Upload, Image as ImageIcon } from 'lucide-react';
import Modal from '@/components/Modal';

export default function GalleryAdmin() {
  const { t } = useLanguage();
  const [images, setImages] = useState([
    { id: 1, category: 'wari', src: '/images/gallery_wari.png', titleKey: 'about.image_alt' },
    { id: 2, category: 'nss', src: '/images/nss_volunteers_seva.png', titleKey: 'about.role' },
    { id: 3, category: 'medical', src: '/images/wari_pilgrimage_hero.png', titleKey: 'services.medical_assistance' },
    { id: 4, category: 'volunteers', src: '/images/nss_volunteers_seva.png', titleKey: 'stats.volunteers' },
    { id: 5, category: 'pilgrims', src: '/images/gallery_wari.png', titleKey: 'stats.assisted' },
    { id: 6, category: 'events', src: '/images/wari_pilgrimage_hero.png', titleKey: 'about_page.timeline.velapur.title' }
  ]);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("wari");

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this photo? (Simulation only)")) {
      setImages(images.filter(img => img.id !== id));
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!newTitle) return;

    setImages([
      ...images,
      {
        id: Date.now(),
        category: newCategory,
        src: '/images/gallery_wari.png',
        titleKey: null,
        titleText: newTitle
      }
    ]);
    setNewTitle("");
    setUploadOpen(false);
    alert("New photo added to the gallery index locally.");
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t("admin.sidebar.gallery")} Album Desk
          </h1>
          <p className="text-xs text-charcoal-light dark:text-gray-455 mt-1">
            Display visual highlights of cleanliness drives, help centers, and warkari smiles.
          </p>
        </div>
        
        <button
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-bold transition-all shadow-saffron-glow focus:outline-none self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          Upload Image
        </button>
      </div>

      {/* Grid of gallery assets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img) => (
          <div key={img.id} className="group bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300">
            {/* Visual preview placeholder */}
            <div className="w-full h-44 bg-slate-100 dark:bg-gray-850 flex items-center justify-center text-slate-400 dark:text-gray-600 relative">
              <ImageIcon className="w-10 h-10 group-hover:scale-105 transition-transform" />
              <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 text-charcoal dark:text-gray-300">
                <Tag className="w-3 h-3 text-primary" />
                {img.category.toUpperCase()}
              </div>
            </div>
            
            <div className="p-4 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-gray-900 border-t border-slate-100 dark:border-gray-850">
              <span className="text-xs font-extrabold text-charcoal dark:text-white truncate">
                {img.titleKey ? t(img.titleKey) : img.titleText}
              </span>
              <button
                onClick={() => handleDelete(img.id)}
                className="p-2 border border-slate-200 dark:border-gray-800 text-charcoal-light hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200/35 rounded-xl transition-all focus:outline-none shrink-0"
                aria-label="Delete image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal Dialog */}
      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Gallery Photo">
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">Photo Title / Caption</label>
            <input
              type="text"
              required
              placeholder="e.g. Swachhta Seva camp #3 boundary cleaner team"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">Category Tag</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-xs focus:outline-none cursor-pointer dark:text-white"
            >
              <option value="wari">Wari Pilgrimage</option>
              <option value="nss">NSS Support</option>
              <option value="medical">Medical Camps</option>
              <option value="volunteers">Volunteers Deployment</option>
              <option value="pilgrims">Pilgrims Assistance</option>
              <option value="events">Cultural Events</option>
            </select>
          </div>

          <div className="border-2 border-dashed border-slate-250 dark:border-gray-800 rounded-2xl py-6 flex flex-col items-center justify-center text-slate-400">
            <Upload className="w-8 h-8 mb-2 text-slate-300" />
            <span className="text-[10px] text-slate-450">Drag & Drop or Click to select local file (Simulation)</span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setUploadOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-gray-800 text-charcoal-light dark:text-gray-400 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-850"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-saffron-glow"
            >
              Upload Asset
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
