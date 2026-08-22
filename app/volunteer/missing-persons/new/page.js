"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import Container from '@/components/Container';
import Toast from '@/components/Toast';
import LoadingButton from '@/components/LoadingButton';
import { ArrowLeft, Camera, Upload, X, UserX } from 'lucide-react';
import Link from 'next/link';

const GENDERS = ['Male', 'Female', 'Other'];
const CATEGORIES = ['Child', 'Senior Citizen', 'Male', 'Female'];

export default function AddMissingPersonPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    category: '',
    lastSeenLocation: '',
    contactPhone: '',
    height: '',
    clothing: '',
    description: '',
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
      setToast({ message: t('volunteer_missing_persons.err_photo_size'), type: 'error', visible: true });
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
    if (!form.name.trim()) newErrors.name = t('volunteer_missing_persons.err_name');
    if (!form.age || isNaN(form.age) || Number(form.age) < 0) newErrors.age = t('volunteer_missing_persons.err_age');
    if (!form.gender) newErrors.gender = t('volunteer_missing_persons.err_gender');
    if (!form.category) newErrors.category = t('volunteer_missing_persons.err_category');
    if (!form.lastSeenLocation.trim()) newErrors.lastSeenLocation = t('volunteer_missing_persons.err_last_seen_location');
    if (!form.contactPhone.trim()) newErrors.contactPhone = t('volunteer_missing_persons.err_contact_phone');
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
        name: form.name.trim(),
        age: Number(form.age),
        gender: form.gender,
        category: form.category,
        lastSeenLocation: form.lastSeenLocation.trim(),
        contactPhone: form.contactPhone.trim(),
        status: 'Pending',
      };
      if (form.height) payload.height = form.height.trim();
      if (form.clothing) payload.clothing = form.clothing.trim();
      if (form.description) payload.description = form.description.trim();
      if (photoUrl) payload.photoUrl = photoUrl;

      const res = await fetch('/api/volunteer/missing-persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create missing person report');

      setToast({ message: t('volunteer_missing_persons.toast_created'), type: 'success', visible: true });
      setTimeout(() => router.push('/volunteer/missing-persons'), 1500);
    } catch (err) {
      setToast({ message: err.message || t('volunteer_missing_persons.toast_error'), type: 'error', visible: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <section className="relative min-h-[25vh] md:min-h-[30vh] flex flex-col justify-center py-12 overflow-hidden bg-gradient-to-br from-red-500 to-rose-600">
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <Container className="relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white text-xs font-semibold mb-6">
            <Link href="/volunteer/missing-persons" className="hover:text-white/80 transition-colors">{t('volunteer_missing_persons.title')}</Link>
            <span>/</span>
            <span className="font-bold">{t('volunteer_missing_persons.form_title')}</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('volunteer_missing_persons.form_title')}
          </h1>
          <p className="mt-3 text-sm text-white/80 max-w-xl mx-auto">
            {t('volunteer_missing_persons.form_subtitle')}
          </p>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="max-w-2xl mx-auto">
            <Link
              href="/volunteer/missing-persons"
              className="inline-flex items-center gap-2 text-xs font-bold text-charcoal-light dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
              {t('volunteer_missing_persons.btn_cancel')}
            </Link>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-premium">
              <div className="p-6 sm:p-8">
                <h2 className="font-heading text-lg font-extrabold text-charcoal dark:text-white mb-6 flex items-center gap-2">
                  <UserX className="w-5 h-5 text-primary" />
                  {t('volunteer_missing_persons.required_fields')}
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
                      {t('volunteer_missing_persons.name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder={t('volunteer_missing_persons.name_placeholder')}
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-sm font-semibold text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all`}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
                        {t('volunteer_missing_persons.age')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={form.age}
                        onChange={handleChange}
                        placeholder={t('volunteer_missing_persons.age_placeholder')}
                        min="0"
                        max="120"
                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.age ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-sm font-semibold text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all`}
                      />
                      {errors.age && <p className="mt-1 text-xs text-red-500">{errors.age}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
                        {t('volunteer_missing_persons.gender')} <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.gender ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-sm font-semibold text-charcoal dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all`}
                      >
                        <option value="">{t('volunteer_missing_persons.gender_placeholder')}</option>
                        {GENDERS.map(g => (
                          <option key={g} value={g}>{t(`volunteer_missing_persons.genders.${g.toLowerCase()}`)}</option>
                        ))}
                      </select>
                      {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
                        {t('volunteer_missing_persons.category')} <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.category ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-sm font-semibold text-charcoal dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all`}
                      >
                        <option value="">{t('volunteer_missing_persons.category_placeholder')}</option>
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{t(`volunteer_missing_persons.categories.${c.toLowerCase().replace(/\s+/g, '_')}`)}</option>
                        ))}
                      </select>
                      {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
                        {t('volunteer_missing_persons.contact_phone')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={form.contactPhone}
                        onChange={handleChange}
                        placeholder={t('volunteer_missing_persons.contact_phone_placeholder')}
                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.contactPhone ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-sm font-semibold text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all`}
                      />
                      {errors.contactPhone && <p className="mt-1 text-xs text-red-500">{errors.contactPhone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
                      {t('volunteer_missing_persons.last_seen_location')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastSeenLocation"
                      value={form.lastSeenLocation}
                      onChange={handleChange}
                      placeholder={t('volunteer_missing_persons.last_seen_location_placeholder')}
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.lastSeenLocation ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-sm font-semibold text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all`}
                    />
                    {errors.lastSeenLocation && <p className="mt-1 text-xs text-red-500">{errors.lastSeenLocation}</p>}
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="font-heading text-lg font-extrabold text-charcoal dark:text-white mb-6">
                    {t('volunteer_missing_persons.optional_fields')}
                  </h2>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
                        {t('volunteer_missing_persons.height_label')}
                      </label>
                      <input
                        type="text"
                        name="height"
                        value={form.height}
                        onChange={handleChange}
                        placeholder={t('volunteer_missing_persons.height_placeholder')}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
                        {t('volunteer_missing_persons.clothing_label')}
                      </label>
                      <input
                        type="text"
                        name="clothing"
                        value={form.clothing}
                        onChange={handleChange}
                        placeholder={t('volunteer_missing_persons.clothing_placeholder')}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-charcoal dark:text-gray-200 mb-1.5">
                        {t('volunteer_missing_persons.description_label')}
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder={t('volunteer_missing_persons.description_placeholder')}
                        rows={3}
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
                  href="/volunteer/missing-persons"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-gray-700 text-charcoal-light dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-all"
                >
                  {t('volunteer_missing_persons.btn_cancel')}
                </Link>
                <LoadingButton
                  type="submit"
                  loading={loading}
                  variant="primary"
                >
                  {t('volunteer_missing_persons.btn_submit')}
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
