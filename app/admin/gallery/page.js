"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Plus, Trash2, Tag, Upload, Image as ImageIcon } from 'lucide-react';
import Toast from '@/components/Toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import LoadingButton from '@/components/LoadingButton';
import Modal from '@/components/Modal';

const FORM_DEFAULTS = {
  imageUrl: '',
  titleKey: '',
  category: 'wari',
};

export default function GalleryAdmin() {
  const { t } = useLanguage();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const [uploadOpen, setUploadOpen] = useState(false);
  const [form, setForm] = useState({ ...FORM_DEFAULTS });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, visible: true });
  }, []);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/gallery-images?limit=100');
      if (!res.ok) throw new Error('Failed to load gallery images');
      const json = await res.json();
      if (json.success && json.data?.items) {
        const mapped = json.data.items.map(item => ({
          ...item,
          id: item.imageId,
          src: item.imageUrl,
        }));
        setImages(mapped);
      } else {
        setImages([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const openUploadModal = () => {
    setForm({ ...FORM_DEFAULTS });
    setUploadOpen(true);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!form.imageUrl || !form.titleKey) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/gallery-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: form.imageUrl,
          titleKey: form.titleKey,
          category: form.category,
          isActive: true,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to upload gallery image');
      }
      const fetchRes = await fetch('/api/gallery-images?limit=100');
      if (fetchRes.ok) {
        const fetchJson = await fetchRes.json();
        if (fetchJson.success && fetchJson.data?.items) {
          const mapped = fetchJson.data.items.map(item => ({
            ...item,
            id: item.imageId,
            src: item.imageUrl,
          }));
          setImages(mapped);
        }
      }
      setUploadOpen(false);
      showToast(t("admin.gallery.create_success"));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrigger = (id) => {
    setDeletingId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/gallery-images/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to delete gallery image');
      }
      setImages(prev => prev.filter(img => img._id !== deletingId && img.imageId !== deletingId));
      showToast(t("admin.gallery.delete_success"));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-64 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl overflow-hidden shadow-premium">
              <div className="w-full h-44 bg-slate-200 dark:bg-gray-700 animate-pulse" />
              <div className="p-4">
                <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t("admin.sidebar.gallery")} Album Desk
          </h1>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button
            onClick={fetchImages}
            className="mt-4 text-primary underline text-sm"
          >
            {t("admin.gallery.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />

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
          onClick={openUploadModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-bold transition-all shadow-saffron-glow focus:outline-none self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          Upload Image
        </button>
      </div>

      {/* Grid of gallery assets */}
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-slate-200 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900 shadow-premium transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-gray-800 flex items-center justify-center text-slate-400 dark:text-gray-500 mb-4.5">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="font-heading text-base font-bold text-charcoal dark:text-white text-center">
            {t("admin.gallery.empty_title")}
          </h3>
          <p className="mt-2 text-sm text-charcoal-light dark:text-gray-400 text-center max-w-xs leading-relaxed">
            {t("admin.gallery.empty_desc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <div key={img._id || img.imageId} className="group bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300">
              {/* Image */}
              <div className="w-full h-44 bg-slate-100 dark:bg-gray-850 flex items-center justify-center relative overflow-hidden">
                {img.imageUrl ? (
                  <img
                    src={img.imageUrl}
                    alt={img.titleKey ? t(img.titleKey) : ''}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full items-center justify-center text-slate-400 dark:text-gray-600 ${img.imageUrl ? 'hidden' : 'flex'}`}>
                  <ImageIcon className="w-10 h-10 group-hover:scale-105 transition-transform" />
                </div>
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 text-charcoal dark:text-gray-300">
                  <Tag className="w-3 h-3 text-primary" />
                  {img.category?.toUpperCase()}
                </div>
              </div>

              <div className="p-4 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-gray-900 border-t border-slate-100 dark:border-gray-850">
                <span className="text-xs font-extrabold text-charcoal dark:text-white truncate">
                  {img.titleKey ? t(img.titleKey) : img.titleText || ''}
                </span>
                <button
                  onClick={() => handleDeleteTrigger(img._id || img.imageId)}
                  className="p-2 border border-slate-200 dark:border-gray-800 text-charcoal-light hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200/35 rounded-xl transition-all focus:outline-none shrink-0"
                  aria-label="Delete image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal Dialog */}
      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title={t("admin.gallery.upload_title")}>
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">
              {t("admin.gallery.title_label")}
            </label>
            <input
              type="text"
              required
              placeholder={t("admin.gallery.title_label")}
              value={form.titleKey}
              onChange={(e) => handleFormChange('titleKey', e.target.value)}
              className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">
              {t("admin.gallery.image_url_label")}
            </label>
            <input
              type="text"
              required
              placeholder={t("admin.gallery.image_url_placeholder")}
              value={form.imageUrl}
              onChange={(e) => handleFormChange('imageUrl', e.target.value)}
              className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 dark:text-gray-500 mb-1.5 uppercase">
              {t("admin.gallery.category_label")}
            </label>
            <select
              value={form.category}
              onChange={(e) => handleFormChange('category', e.target.value)}
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

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setUploadOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-gray-800 text-charcoal-light dark:text-gray-400 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-850 text-xs font-bold"
            >
              {t("admin.gallery.cancel")}
            </button>
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-saffron-glow text-xs font-bold"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              {t("admin.gallery.upload_btn")}
            </LoadingButton>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Gallery Image"
        messageKey="admin.gallery.delete_confirm"
      />

    </div>
  );
}