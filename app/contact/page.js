"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Container from '@/components/Container';
import HeroBanner from '@/components/HeroBanner';
import FormInput from '@/components/FormInput';
import TextArea from '@/components/TextArea';
import MapPlaceholder from '@/components/MapPlaceholder';
import LoadingButton from '@/components/LoadingButton';
import ScrollReveal from '@/components/ScrollReveal';
import { 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  CheckCircle2
} from 'lucide-react';

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!formData.name || formData.name.trim().length < 3) {
      tempErrors.name = t('contact_page.err_name');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      tempErrors.email = t('contact_page.err_email');
    }
    const phoneRegex = /^\d{10}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      tempErrors.phone = t('contact_page.err_phone');
    }
    if (!formData.message || formData.message.trim().length < 10) {
      tempErrors.message = t('contact_page.err_message');
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear validation error dynamically
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setShowSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      }, 1000);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <HeroBanner 
        titleKey="contact_page.title" 
        subtitleKey="contact_page.subtitle"
        bgImage="/images/wari_pilgrimage_hero.png"
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left: Contact Form Column */}
            <ScrollReveal className="lg:col-span-7">
            <div className="bg-white border border-slate-200/50 p-6 md:p-10 rounded-3xl shadow-premium">
              <h3 className="font-heading text-2xl font-extrabold text-charcoal tracking-tight mb-8">
                {t('contact_page.form_title')}
              </h3>

              {showSuccess ? (
                <div className="flex flex-col items-center text-center p-8 bg-emerald-50 border border-emerald-200/50 rounded-2xl animate-zoom-in">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5 animate-pulse">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h4 className="font-heading text-lg font-bold text-slate-900">
                    {t('contact_page.success_title')}
                  </h4>
                  <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">
                    {t('contact_page.success_desc')}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-6"
                    onClick={() => setShowSuccess(false)}
                  >
                    {t('contact_page.btn_close')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <FormInput
                    label={t('contact_page.name')}
                    id="name"
                    placeholder={t('contact_page.name_placeholder')}
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormInput
                      label={t('contact_page.email')}
                      id="email"
                      type="email"
                      placeholder={t('contact_page.email_placeholder')}
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      required
                    />
                    <FormInput
                      label={t('contact_page.phone')}
                      id="phone"
                      type="tel"
                      placeholder={t('contact_page.phone_placeholder')}
                      value={formData.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      required
                    />
                  </div>

                  <TextArea
                    label={t('contact_page.message')}
                    id="message"
                    placeholder={t('contact_page.message_placeholder')}
                    value={formData.message}
                    onChange={handleChange}
                    error={errors.message}
                    required
                  />

                  <LoadingButton 
                    type="submit" 
                    variant="primary" 
                    className="w-full"
                    loading={isSubmitting}
                  >
                    {isSubmitting ? t('contact_page.submitting') : t('contact_page.submit')}
                  </LoadingButton>
                </form>
              )}
            </div>
            </ScrollReveal>

            {/* Right: Location & Office Information Column */}
            <ScrollReveal className="lg:col-span-5 flex flex-col gap-8" delay={150}>
              
              {/* Office Details Card */}
              <div className="bg-white border border-slate-200/50 p-6 md:p-8 rounded-3xl shadow-premium">
                <h3 className="font-heading text-xl font-bold text-charcoal tracking-tight mb-6">
                  {t('contact_page.info_title')}
                </h3>
                
                <div className="space-y-6">
                  {/* Office Hours */}
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary mt-0.5">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t('contact_page.office_hours')}
                      </span>
                      <span className="text-sm font-semibold text-charcoal mt-1">
                        {t('contact_page.hours_val')}
                      </span>
                    </div>
                  </div>

                  {/* Location Address */}
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary mt-0.5">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t('contact_page.location')}
                      </span>
                      <span className="text-sm font-semibold text-charcoal mt-1 leading-relaxed">
                        {t('contact_page.location_val')}
                      </span>
                    </div>
                  </div>

                  {/* Emergency Helpline */}
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 mt-0.5">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t('footer.emergency_helpline')}
                      </span>
                      <span className="text-sm font-extrabold text-charcoal mt-1 select-all">
                        108 / 112
                      </span>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-3.5">
                    {[
                      { icon: Facebook, label: 'Facebook' },
                      { icon: Twitter, label: 'Twitter' },
                      { icon: Instagram, label: 'Instagram' },
                      { icon: Youtube, label: 'Youtube' }
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <a 
                          key={index} 
                          href="#" 
                          className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:scale-105 transition-all duration-200" 
                          aria-label={item.label}
                        >
                          <Icon className="w-4.5 h-4.5" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <MapPlaceholder />

            </ScrollReveal>

          </div>
        </Container>
      </section>
    </div>
  );
}
