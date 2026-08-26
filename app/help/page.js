"use client";

import React, { useState, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Container from "@/components/Container";
import HeroBanner from "@/components/HeroBanner";
import FormInput from "@/components/FormInput";
import TextArea from "@/components/TextArea";
import LoadingButton from "@/components/LoadingButton";
import ScrollReveal from "@/components/ScrollReveal";
import Toast from "@/components/Toast";
import {
  CheckCircle2,
  MapPin,
  Loader2,
  AlertCircle,
  Stethoscope,
  Droplet,
  UtensilsCrossed,
  Navigation,
  UserSearch,
  Siren,
  HelpCircle,
} from "lucide-react";

const HELP_TYPES = [
  { value: "Medical", icon: Stethoscope, colorClass: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-400" },
  { value: "Water", icon: Droplet, colorClass: "bg-sky-50 text-sky-600 border-sky-200 hover:border-sky-400" },
  { value: "Food", icon: UtensilsCrossed, colorClass: "bg-orange-50 text-orange-600 border-orange-200 hover:border-orange-400" },
  { value: "Direction", icon: Navigation, colorClass: "bg-indigo-50 text-indigo-600 border-indigo-200 hover:border-indigo-400" },
  { value: "Lost/Separated", icon: UserSearch, colorClass: "bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-400" },
  { value: "Emergency", icon: Siren, colorClass: "bg-red-50 text-red-600 border-red-200 hover:border-red-400" },
  { value: "Other", icon: HelpCircle, colorClass: "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400" },
];

const HELP_TYPE_KEYS = {
  Medical: "help_page.help_type_medical",
  Water: "help_page.help_type_water",
  Food: "help_page.help_type_food",
  Direction: "help_page.help_type_direction",
  "Lost/Separated": "help_page.help_type_lost_separated",
  Emergency: "help_page.help_type_emergency",
  Other: "help_page.help_type_other",
};

export default function HelpPage() {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    helpType: "",
    location: null,
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "error", visible: false });

  const showToast = useCallback((message, type = "error") => {
    setToast({ message, type, visible: true });
  }, []);

  const validate = () => {
    const tempErrors = {};
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      tempErrors.fullName = t("help_page.err_name");
    }
    const phoneRegex = /^\d{10}$/;
    if (!formData.contactNumber || !phoneRegex.test(formData.contactNumber)) {
      tempErrors.contactNumber = t("help_page.err_phone");
    }
    if (!formData.helpType) {
      tempErrors.helpType = t("help_page.err_help_type");
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleHelpTypeSelect = (value) => {
    setFormData((prev) => ({ ...prev, helpType: value }));
    if (errors.helpType) {
      setErrors((prev) => ({ ...prev, helpType: "" }));
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t("help_page.location_error_not_supported") + " " + t("help_page.location_optional_hint"));
      return;
    }
    setLocationLoading(true);
    setLocationError("");
    setFormData((prev) => ({ ...prev, location: null }));
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: "" }));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        };
        setFormData((prev) => ({ ...prev, location: loc }));
        setLocationLoading(false);
      },
      (error) => {
        setLocationLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(t("help_page.location_error_permission") + " " + t("help_page.location_optional_hint"));
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError(t("help_page.location_error_unavailable") + " " + t("help_page.location_optional_hint"));
            break;
          case error.TIMEOUT:
            setLocationError(t("help_page.location_error_timeout") + " " + t("help_page.location_optional_hint"));
            break;
          default:
            setLocationError(t("help_page.location_error") + " " + t("help_page.location_optional_hint"));
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/public/help-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || t("help_page.server_error"));
      }
      setSubmittedRequestId(result.data.requestId);
      setShowSuccess(true);
      setFormData({ fullName: "", contactNumber: "", helpType: "", location: null, message: "" });
      setLocationError("");
    } catch (err) {
      showToast(err.message || t("help_page.server_error"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewRequest = () => {
    setShowSuccess(false);
    setSubmittedRequestId("");
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <HeroBanner
        titleKey="help_page.title"
        subtitleKey="help_page.subtitle"
        bgImage="/images/wari_pilgrimage_hero.png"
      />

      <section className="py-16 md:py-24">
        <Container>
          <ScrollReveal>
            <div className="bg-white border border-slate-200/50 p-6 md:p-10 rounded-3xl shadow-premium max-w-2xl mx-auto">
              {showSuccess ? (
                <div className="flex flex-col items-center text-center p-8 bg-emerald-50 border border-emerald-200/50 rounded-2xl">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
                    {t("help_page.success_title")}
                  </h3>
                  <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">
                    {t("help_page.success_desc")}
                  </p>

                  <div className="w-full bg-white rounded-xl border border-slate-200 p-5 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {t("help_page.success_request_id")}
                      </span>
                      <span className="text-sm font-extrabold text-primary">
                        {submittedRequestId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {t("help_page.success_status")}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        {t("help_page.success_pending")}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-6 max-w-xs leading-relaxed">
                    {t("help_page.success_message")}
                  </p>

                  <LoadingButton variant="outline" onClick={handleNewRequest}>
                    {t("help_page.btn_new_request")}
                  </LoadingButton>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="font-heading text-2xl font-extrabold text-charcoal tracking-tight mb-2">
                    {t("help_page.form_title")}
                  </h3>

                  <FormInput
                    label={t("help_page.full_name")}
                    id="fullName"
                    placeholder={t("help_page.full_name_placeholder")}
                    value={formData.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                    required
                  />

                  <FormInput
                    label={t("help_page.contact_number")}
                    id="contactNumber"
                    type="tel"
                    placeholder={t("help_page.contact_number_placeholder")}
                    value={formData.contactNumber}
                    onChange={handleChange}
                    error={errors.contactNumber}
                    required
                  />

                  <div className="flex flex-col gap-2 w-full text-left">
                    <label className="text-sm font-bold text-charcoal dark:text-gray-200">
                      {t("help_page.help_type")} <span className="text-primary">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {HELP_TYPES.map(({ value, icon: Icon, colorClass }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleHelpTypeSelect(value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                            formData.helpType === value
                              ? "bg-primary/5 border-primary shadow-saffron-glow scale-[1.02]"
                              : `${colorClass} hover:shadow-premium`
                          }`}
                          aria-pressed={formData.helpType === value}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-xs font-bold leading-tight text-center">
                            {t(HELP_TYPE_KEYS[value])}
                          </span>
                        </button>
                      ))}
                    </div>
                    {errors.helpType && (
                      <span role="alert" className="text-xs font-semibold text-red-500 mt-1 select-none">
                        {errors.helpType}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 w-full text-left">
                    <label className="text-sm font-bold text-charcoal dark:text-gray-200">
                      {t("help_page.location")}
                    </label>
                    <p className="text-xs text-slate-500">{t("help_page.location_desc")}</p>

                    {!formData.location && !locationLoading && (
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-600 font-semibold text-sm hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <MapPin className="w-5 h-5" />
                        {t("help_page.location_get")}
                      </button>
                    )}

                    {locationLoading && (
                      <div className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-xl border-2 border-primary/30 bg-primary/5 text-primary font-semibold text-sm">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t("help_page.location_getting")}
                      </div>
                    )}

                    {formData.location && !locationLoading && (
                      <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{t("help_page.location_success")}</p>
                          <p className="text-xs text-emerald-600 truncate">
                            {formData.location.lat.toFixed(5)}, {formData.location.lng.toFixed(5)}
                            {formData.location.accuracy && (
                              <span className="ml-2 opacity-70">
                                ~{Math.round(formData.location.accuracy)}m
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleGetLocation}
                          className="text-xs font-bold text-emerald-700 underline hover:text-emerald-900 shrink-0"
                        >
                          Refresh
                        </button>
                      </div>
                    )}

                    {locationError && (
                      <div className="flex items-start gap-2 w-full px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold leading-relaxed">{locationError}</p>
                      </div>
                    )}


                  </div>

                  <TextArea
                    label={t("help_page.message")}
                    id="message"
                    placeholder={t("help_page.message_placeholder")}
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                  />

                  <LoadingButton
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={isSubmitting}
                  >
                    {isSubmitting ? t("help_page.submitting") : t("help_page.submit")}
                  </LoadingButton>
                </form>
              )}
            </div>
          </ScrollReveal>
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