"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import Container from '@/components/Container';
import Toast from '@/components/Toast';
import LoadingButton from '@/components/LoadingButton';
import { ArrowLeft, Camera, Upload, X, Package } from 'lucide-react';
import Link from 'next/link';

const ITEM_TYPES = ['Mobile', 'Wallet', 'Bag', 'Documents', 'Jewelry', 'Shoes', 'Clothing', 'Electronics', 'Keys', 'Other'];

export default function AddLostItemPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [form, setForm] = useState({
    itemType: '',
    foundLocation: '',
    brand: '',
    color: '',
    description: '',
    storageLocation: '',
    contactNumber: '',
    notes: '',
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'Photo must be less than 5MB', type: 'error', visible: true });
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const validate = () => {
    const newErrors = {};
    if (!form.itemType) newErrors.itemType = 'Item type is required';
    if (!form.foundLocation.trim()) newErrors.foundLocation = 'Found location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let photoUrl = undefined;
      if (photoFile) {
        const reader = new FileReader();
        photoUrl = await new Promise((resolve) => {
          reader.onload = (ev) => resolve(ev.target.result);
          reader.readAsDataURL(photoFile);
        });
      }

      const payload = {
        itemType: form.itemType,
        foundLocation: form.foundLocation.trim(),
        status: 'Waiting',
      };
      if (form.brand) payload.brand = form.brand.trim();
      if (form.color) payload.color = form.color.trim();
      if (form.description) payload.description = form.description.trim();
      if (form.storageLocation) payload.storageLocation = form.storageLocation.trim();
      if (form.contactNumber) payload.contactNumber = form.contactNumber.trim();
      if (form.notes) payload.notes = form.notes.trim();
      if (photoUrl) payload.photoUrl = photoUrl;

      const res = await fetch('/api/volunteer/lost-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create lost item report');

      setToast({ message: t('volunteer_lost_items.toast_created'), type: 'success', visible: true });
      setTimeout(() => router.push('/volunteer/lost-items'), 1500);
    } catch (err) {
      setToast({ message: err.message || t('volunteer_lost_items.toast_error'), type: 'error', visible: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <section className="relative min-h-[25vh] md:min-h-[30vh] flex flex-col justify-center py-12 overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600">
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <Container className="relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white text-xs font-semibold mb-6">
            <Link href="/volunteer/lost-items" className="hover:text-white/80 transition-colors">{t('volunteer_lost_items.title')}</Link>
            <span>/</span>
            <span className="font-bold">{t('volunteer_lost_items.form_title')}</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('volunteer_lost_items.form_title')}
          </h1>
          <p className="mt-3 text-sm text-white/80 max-w-xl mx-auto">
            {t('volunteer_lost_items.form_subtitle')}
          </p>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="max-w-2xl mx-auto">
            <Link
              href="/volunteer/lost-items"
              className="inline-flex items-center gap-2 text-xs font-bold text-charcoal-light dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
              {t('volunteer_lost_items.btn_cancel')}
            </Link>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-premium">
              <div className="p-6 sm:p-8">
                <h2 className="font-heading text-lg font-extrabold text-charcoal dark:text-white mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  {t('volunteer_lost_items.required_fields')}
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
                      {t('volunteer_lost_items.item_type')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="itemType"
                      value={form.itemType}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.itemType ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-sm font-semibold text-charcoal dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all`}
                    >
                      <option value="">{t('volunteer_lost_items.item_type_placeholder')}</option>
                      {ITEM_TYPES.map(type => (
                        <option key={type} value={type}>{t(`volunteer_lost_items.item_types.${type.toLowerCase()}`)}</option>
                      ))}
                    </select>
                    {errors.itemType && <p className="mt-1 text-xs text-red-500">{errors.itemType}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
                      {t('volunteer_lost_items.found_location')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="foundLocation"
                      value={form.foundLocation}
                      onChange={handleChange}
                      placeholder={t('volunteer_lost_items.found_location_placeholder')}
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.foundLocation ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-sm font-semibold text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all`}
                    />
                    {errors.foundLocation && <p className="mt-1 text-xs text-red-500">{errors.foundLocation}</p>}
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="font-heading text-lg font-extrabold text-charcoal dark:text-white mb-6">
                    {t('volunteer_lost_items.optional_fields')}
                  </h2>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
                          {t('volunteer_lost_items.brand')}
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={form.brand}
                          onChange={handleChange}
                          placeholder={t('volunteer_lost_items.brand_placeholder')}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
                          {t('volunteer_lost_items.color')}
                        </label>
                        <input
                          type="text"
                          name="color"
                          value={form.color}
                          onChange={handleChange}
                          placeholder={t('volunteer_lost_items.color_placeholder')}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
                        {t('volunteer_lost_items.description')}
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder={t('volunteer_lost_items.description_placeholder')}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
                        {t('volunteer_lost_items.storage_location')}
                      </label>
                      <input
                        type="text"
                        name="storageLocation"
                        value={form.storageLocation}
                        onChange={handleChange}
                        placeholder={t('volunteer_lost_items.storage_location_placeholder')}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
                        {t('volunteer_lost_items.contact_number')}
                      </label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={form.contactNumber}
                        onChange={handleChange}
                        placeholder={t('volunteer_lost_items.contact_number_placeholder')}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
                        {t('volunteer_lost_items.notes')}
                      </label>
                      <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        placeholder={t('volunteer_lost_items.notes_placeholder')}
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="font-heading text-lg font-extrabold text-charcoal dark:text-white mb-4">
                    {t('volunteer_lost_items.photo')}
                  </h2>

                  {photoPreview ? (
                    <div className="relative inline-block">
                      <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl border border-slate-200 dark:border-gray-700" />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-bold text-charcoal dark:text-white hover:bg-slate-50 dark:hover:bg-gray-800 transition-all"
                      >
                        <Camera className="w-4 h-4" />
                        {t('volunteer_lost_items.take_photo')}
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-xs font-bold text-charcoal dark:text-white hover:bg-slate-50 dark:hover:bg-gray-800 transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        {t('volunteer_lost_items.upload_photo')}
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="px-6 sm:px-8 py-5 bg-slate-50 dark:bg-gray-850 border-t border-slate-200 dark:border-gray-800 flex items-center justify-end gap-3">
                <Link
                  href="/volunteer/lost-items"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-gray-700 text-charcoal-light dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-all"
                >
                  {t('volunteer_lost_items.btn_cancel')}
                </Link>
                <LoadingButton
                  type="submit"
                  loading={loading}
                  variant="primary"
                >
                  {t('volunteer_lost_items.btn_submit')}
                </LoadingButton>
              </div>
            </form>
          </div>
        </Container>
      </section>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
