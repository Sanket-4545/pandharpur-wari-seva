"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Container from '@/components/Container';
import HeroBanner from '@/components/HeroBanner';
import FormInput from '@/components/FormInput';
import TextArea from '@/components/TextArea';
import LoadingButton from '@/components/LoadingButton';
import Button from '@/components/Button';
import ScrollReveal from '@/components/ScrollReveal';
import Toast from '@/components/Toast';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const SHIFT_OPTIONS = [
  { value: 'morning', key: 'register_page.shift_morning' },
  { value: 'afternoon', key: 'register_page.shift_afternoon' },
  { value: 'evening', key: 'register_page.shift_evening' },
  { value: 'night', key: 'register_page.shift_night' },
];

const SKILL_OPTIONS = [
  { value: 'first_aid', key: 'register_page.skill_first_aid' },
  { value: 'crowd_mgmt', key: 'register_page.skill_crowd_mgmt' },
  { value: 'translation', key: 'register_page.skill_translation' },
  { value: 'logistics', key: 'register_page.skill_logistics' },
  { value: 'it_support', key: 'register_page.skill_it_support' },
];

const LANG_OPTIONS = [
  { value: 'marathi', key: 'register_page.lang_marathi' },
  { value: 'hindi', key: 'register_page.lang_hindi' },
  { value: 'english', key: 'register_page.lang_english' },
  { value: 'kannada', key: 'register_page.lang_kannada' },
  { value: 'telugu', key: 'register_page.lang_telugu' },
];

export default function RegisterPage() {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    age: '',
    address: '',
    city: '',
    college: '',
    nssUnit: '',
    bloodGroup: '',
    emergencyPhone: '',
    skills: [],
    languages: [],
    shift: '',
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [volunteerId, setVolunteerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxGroup = (field, value) => {
    setFormData((prev) => {
      const current = [...prev[field]];
      const idx = current.indexOf(value);
      if (idx === -1) {
        current.push(value);
      } else {
        current.splice(idx, 1);
      }
      return { ...prev, [field]: current };
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const temp = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!formData.name || formData.name.trim().length < 3) {
      temp.name = t('register_page.err_name');
    }
    if (!formData.email || !emailRegex.test(formData.email)) {
      temp.email = t('register_page.err_email');
    }
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      temp.phone = t('register_page.err_phone');
    }
    if (!formData.gender) {
      temp.gender = t('register_page.err_gender');
    }
    const ageNum = parseInt(formData.age, 10);
    if (!formData.age || isNaN(ageNum) || ageNum < 16 || ageNum > 80) {
      temp.age = t('register_page.err_age');
    }
    if (!formData.city || formData.city.trim().length < 2) {
      temp.city = t('register_page.err_city');
    }
    if (!formData.college || formData.college.trim().length < 2) {
      temp.college = t('register_page.err_college');
    }
    if (!formData.nssUnit || formData.nssUnit.trim().length < 2) {
      temp.nssUnit = t('register_page.err_nss_unit');
    }
    if (!formData.bloodGroup) {
      temp.bloodGroup = t('register_page.err_blood');
    }
    if (!formData.emergencyPhone || !phoneRegex.test(formData.emergencyPhone)) {
      temp.emergencyPhone = t('register_page.err_emergency');
    }
    if (!formData.shift) {
      temp.shift = t('register_page.err_shift');
    }
    if (!formData.terms) {
      temp.terms = t('register_page.err_terms');
    }

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const buildPayload = () => ({
    name: formData.name.trim(),
    email: formData.email.trim().toLowerCase(),
    phone: formData.phone.trim(),
    gender: formData.gender,
    age: parseInt(formData.age, 10),
    address: formData.address.trim() || undefined,
    city: formData.city.trim(),
    college: formData.college.trim(),
    nssUnit: formData.nssUnit.trim(),
    bloodGroup: formData.bloodGroup,
    emergencyPhone: formData.emergencyPhone.trim(),
    skills: formData.skills,
    languages: formData.languages,
    shift: formData.shift,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      setToast({ message: t('register_page.toast_validation_error'), type: 'warning', visible: true });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit registration');
      }
      setVolunteerId(result.data?.volunteerId || '');
      setShowSuccess(true);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      gender: '',
      age: '',
      address: '',
      city: '',
      college: '',
      nssUnit: '',
      bloodGroup: '',
      emergencyPhone: '',
      skills: [],
      languages: [],
      shift: '',
      terms: false,
    });
    setErrors({});
    setServerError('');
  };

  if (showSuccess) {
    return (
      <div className="bg-slate-50 min-h-screen pb-20">
        <HeroBanner
          titleKey="register_page.title"
          subtitleKey="register_page.subtitle"
          bgImage="/images/wari_pilgrimage_hero.png"
        />
        <section className="py-16 md:py-24">
          <Container>
            <div className="max-w-2xl mx-auto">
              <ScrollReveal>
                <div className="bg-white border border-slate-200/50 p-8 md:p-12 rounded-3xl shadow-premium text-center">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="font-heading text-2xl font-extrabold text-charcoal mb-2">
                    {t('success_page.thank_you')}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto mb-6">
                    {t('success_page.desc')}
                  </p>
                  {volunteerId && (
                    <div className="inline-flex items-center gap-2 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl mb-8">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {t('success_page.reg_number')}
                      </span>
                      <span className="text-lg font-extrabold text-secondary select-all">
                        {volunteerId}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                      variant="primary"
                      size="lg"
                      href="/"
                    >
                      {t('success_page.btn_home')}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setShowSuccess(false);
                        handleReset();
                      }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t('nav.register')}
                    </Button>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </Container>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <HeroBanner
        titleKey="register_page.title"
        subtitleKey="register_page.subtitle"
        bgImage="/images/wari_pilgrimage_hero.png"
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto">
            <ScrollReveal>
              <div className="bg-white border border-slate-200/50 p-6 md:p-10 rounded-3xl shadow-premium">
                <form onSubmit={handleSubmit} className="space-y-10">

                  {/* Personal Details */}
                  <fieldset>
                    <legend className="font-heading text-xl font-extrabold text-charcoal tracking-tight mb-6 pb-2 border-b border-slate-100 w-full">
                      {t('register_page.personal_details')}
                    </legend>
                    <div className="space-y-6">
                      <FormInput
                        label={t('register_page.name')}
                        id="name"
                        placeholder={t('register_page.name_placeholder')}
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        required
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormInput
                          label={t('register_page.email')}
                          id="email"
                          type="email"
                          placeholder={t('register_page.email_placeholder')}
                          value={formData.email}
                          onChange={handleChange}
                          error={errors.email}
                          required
                        />
                        <FormInput
                          label={t('register_page.phone')}
                          id="phone"
                          type="tel"
                          placeholder={t('register_page.phone_placeholder')}
                          value={formData.phone}
                          onChange={handleChange}
                          error={errors.phone}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2 w-full text-left">
                          <label htmlFor="gender" className="text-sm font-bold text-charcoal dark:text-gray-200">
                            {t('register_page.gender')} <span className="text-primary">*</span>
                          </label>
                          <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className={`w-full px-4 py-3.5 rounded-xl border bg-white dark:bg-gray-900 text-charcoal dark:text-gray-100 transition-all duration-250 focus:outline-none focus:ring-2 min-h-[44px] ${
                              errors.gender
                                ? 'border-red-500 focus:ring-red-500/20'
                                : 'border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600 focus:border-primary focus:ring-primary/20'
                            }`}
                          >
                            <option value="">{t('register_page.gender_placeholder')}</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                          {errors.gender && (
                            <span role="alert" className="text-xs font-semibold text-red-500 mt-1">{errors.gender}</span>
                          )}
                        </div>
                        <FormInput
                          label={t('register_page.age')}
                          id="age"
                          type="number"
                          placeholder={t('register_page.age_placeholder')}
                          value={formData.age}
                          onChange={handleChange}
                          error={errors.age}
                          required
                        />
                        <FormInput
                          label={t('register_page.city')}
                          id="city"
                          placeholder={t('register_page.city_placeholder')}
                          value={formData.city}
                          onChange={handleChange}
                          error={errors.city}
                          required
                        />
                      </div>
                      <TextArea
                        label={t('register_page.address')}
                        id="address"
                        placeholder={t('register_page.address_placeholder')}
                        value={formData.address}
                        onChange={handleChange}
                        error={errors.address}
                        required={false}
                      />
                    </div>
                  </fieldset>

                  {/* Deployment Details */}
                  <fieldset>
                    <legend className="font-heading text-xl font-extrabold text-charcoal tracking-tight mb-6 pb-2 border-b border-slate-100 w-full">
                      {t('register_page.deployment_details')}
                    </legend>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormInput
                          label={t('register_page.college')}
                          id="college"
                          placeholder={t('register_page.college_placeholder')}
                          value={formData.college}
                          onChange={handleChange}
                          error={errors.college}
                          required
                        />
                        <FormInput
                          label={t('register_page.nss_unit')}
                          id="nssUnit"
                          placeholder={t('register_page.nss_unit_placeholder')}
                          value={formData.nssUnit}
                          onChange={handleChange}
                          error={errors.nssUnit}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 w-full text-left">
                          <label htmlFor="bloodGroup" className="text-sm font-bold text-charcoal dark:text-gray-200">
                            {t('register_page.blood')} <span className="text-primary">*</span>
                          </label>
                          <select
                            id="bloodGroup"
                            name="bloodGroup"
                            value={formData.bloodGroup}
                            onChange={handleChange}
                            className={`w-full px-4 py-3.5 rounded-xl border bg-white dark:bg-gray-900 text-charcoal dark:text-gray-100 transition-all duration-250 focus:outline-none focus:ring-2 min-h-[44px] ${
                              errors.bloodGroup
                                ? 'border-red-500 focus:ring-red-500/20'
                                : 'border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600 focus:border-primary focus:ring-primary/20'
                            }`}
                          >
                            <option value="">{t('register_page.blood_placeholder')}</option>
                            {BLOOD_GROUPS.map((bg) => (
                              <option key={bg} value={bg}>{bg}</option>
                            ))}
                          </select>
                          {errors.bloodGroup && (
                            <span role="alert" className="text-xs font-semibold text-red-500 mt-1">{errors.bloodGroup}</span>
                          )}
                        </div>
                        <FormInput
                          label={t('register_page.emergency_phone')}
                          id="emergencyPhone"
                          type="tel"
                          placeholder={t('register_page.emergency_phone_placeholder')}
                          value={formData.emergencyPhone}
                          onChange={handleChange}
                          error={errors.emergencyPhone}
                          required
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* Skills & Languages */}
                  <fieldset>
                    <legend className="font-heading text-xl font-extrabold text-charcoal tracking-tight mb-6 pb-2 border-b border-slate-100 w-full">
                      {t('register_page.skills_languages')}
                    </legend>
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-bold text-charcoal dark:text-gray-200 mb-3">
                          {t('register_page.skills_label')}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {SKILL_OPTIONS.map((skill) => (
                            <label
                              key={skill.value}
                              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border cursor-pointer transition-all min-h-[44px] ${
                                formData.skills.includes(skill.value)
                                  ? 'bg-primary/5 border-primary/30 text-charcoal'
                                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.skills.includes(skill.value)}
                                onChange={() => handleCheckboxGroup('skills', skill.value)}
                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                              />
                              <span className="text-sm font-semibold">{t(skill.key)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-charcoal dark:text-gray-200 mb-3">
                          {t('register_page.languages_label')}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {LANG_OPTIONS.map((lang) => (
                            <label
                              key={lang.value}
                              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border cursor-pointer transition-all min-h-[44px] ${
                                formData.languages.includes(lang.value)
                                  ? 'bg-primary/5 border-primary/30 text-charcoal'
                                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.languages.includes(lang.value)}
                                onChange={() => handleCheckboxGroup('languages', lang.value)}
                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                              />
                              <span className="text-sm font-semibold">{t(lang.key)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  {/* Shift Availability */}
                  <fieldset>
                    <legend className="font-heading text-xl font-extrabold text-charcoal tracking-tight mb-6 pb-2 border-b border-slate-100 w-full">
                      {t('register_page.availability')}
                    </legend>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SHIFT_OPTIONS.map((shift) => (
                          <label
                            key={shift.value}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border cursor-pointer transition-all min-h-[44px] ${
                              formData.shift === shift.value
                                ? 'bg-secondary/5 border-secondary/30 text-charcoal'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                            } ${errors.shift ? 'border-red-500' : ''}`}
                          >
                            <input
                              type="radio"
                              name="shift"
                              value={shift.value}
                              checked={formData.shift === shift.value}
                              onChange={handleChange}
                              className="w-4 h-4 border-slate-300 text-secondary focus:ring-secondary/30"
                            />
                            <span className="text-sm font-semibold">{t(shift.key)}</span>
                          </label>
                        ))}
                      </div>
                    {errors.shift && (
                      <span role="alert" className="text-xs font-semibold text-red-500 mt-2 block">{errors.shift}</span>
                    )}
                  </fieldset>

                  {/* Terms */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        name="terms"
                        checked={formData.terms}
                        onChange={handleChange}
                        className="w-4 h-4 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary/30"
                      />
                      <span className={`text-sm font-semibold leading-relaxed ${errors.terms ? 'text-red-500' : 'text-slate-600'}`}>
                        {t('register_page.terms')}
                      </span>
                    </label>
                    {errors.terms && (
                      <span role="alert" className="text-xs font-semibold text-red-500 mt-1 block">{errors.terms}</span>
                    )}
                  </div>

                  {/* Server Error */}
                  {serverError && (
                    <div className="p-4 bg-red-50 border border-red-200/50 rounded-xl text-sm text-red-700">
                      {serverError}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                    <LoadingButton
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      loading={isSubmitting}
                    >
                      {isSubmitting ? t('contact_page.submitting') : t('register_page.btn_submit')}
                    </LoadingButton>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      disabled={isSubmitting}
                    >
                      {t('register_page.btn_reset')}
                    </Button>
                  </div>
                </form>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
