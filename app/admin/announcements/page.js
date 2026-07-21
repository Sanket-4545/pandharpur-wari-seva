"use client";

import React, { useState } from 'react';
import { announcementsData as initialAnnouncements } from '@/data/announcements';
import { useLanguage } from '@/context/LanguageContext';
import { Plus, Megaphone, Calendar, Tag, Trash2, LayoutGrid, Eye } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

export default function AnnouncementsAdmin() {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState(initialAnnouncements);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("safety");
  const [priority, setPriority] = useState("high");
  const [status, setStatus] = useState("published");
  const [publishDate, setPublishDate] = useState("2026-07-17T18:00");

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this announcement? (Simulation only)")) {
      setAnnouncements(announcements.filter(ann => ann.id !== id));
    }
  };

  const handlePublish = (e) => {
    e.preventDefault();
    if (!title || !description) return;

    setAnnouncements([
      {
        id: `ANN-${Date.now().toString().slice(-3)}`,
        titleText: title,
        descriptionText: description,
        category,
        priority,
        publishDate: new Date(publishDate).toISOString(),
        status
      },
      ...announcements
    ]);

    // Reset Form
    setTitle("");
    setDescription("");
    alert("New announcement published and added locally.");
  };

  const getPriorityStyle = (p) => {
    const styles = {
      high: "bg-red-50 text-red-650 border-red-200/50",
      medium: "bg-amber-50 text-amber-650 border-amber-200/50",
      low: "bg-slate-55 text-slate-600 border-slate-200/50",
    };
    return styles[p.toLowerCase()] || styles.low;
  };

  return (
    <div className="space-y-7">
      
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
          {t("admin.sidebar.announcements")} Desk
        </h1>
        <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
          Broadcast warnings, dynamic halting delays, and medical desk availability updates to the public news stream.
        </p>
      </div>

      {/* Main Grid: Form / Live Preview (left 2 cols) & List Directory (right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Create Form & Live Preview */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Create Form Card */}
          <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
            <h3 className="font-heading text-sm font-bold text-charcoal dark:text-white uppercase tracking-wider mb-5">
              {t("admin.announcements.create_title")}
            </h3>

            <form onSubmit={handlePublish} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 dark:text-gray-505 mb-1.5 uppercase">
                    {t("admin.announcements.title_label")}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t("admin.announcements.placeholder_title")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-slate-400 dark:text-gray-505 mb-1.5 uppercase">
                    {t("admin.announcements.category_label")}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none cursor-pointer dark:text-white"
                  >
                    <option value="safety">Safety Alerts</option>
                    <option value="schedule">Schedule & Routes</option>
                    <option value="camp">Medical Camp Halts</option>
                    <option value="general">General Advisories</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-slate-400 dark:text-gray-505 mb-1.5 uppercase">
                    {t("admin.announcements.priority_label")}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none cursor-pointer dark:text-white"
                  >
                    <option value="high">High Importance</option>
                    <option value="medium">Medium Importance</option>
                    <option value="low">Low Importance</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-slate-400 dark:text-gray-505 mb-1.5 uppercase">
                    {t("admin.announcements.status_label")}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none cursor-pointer dark:text-white"
                  >
                    <option value="published">Publish Now</option>
                    <option value="draft">Save Draft</option>
                    <option value="scheduled">Schedule Later</option>
                  </select>
                </div>

                {/* Publish Date */}
                <div>
                  <label className="block text-slate-400 dark:text-gray-505 mb-1.5 uppercase">
                    {t("admin.announcements.publish_date")}
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none dark:text-white"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 dark:text-gray-550 mb-1.5 uppercase">
                    {t("admin.announcements.desc_label")}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={t("admin.announcements.placeholder_desc")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-2xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary dark:text-white"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-gray-850">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-2xl shadow-saffron-glow transition-all focus:outline-none"
                >
                  {t("admin.announcements.btn_publish")}
                </button>
              </div>
            </form>
          </div>

          {/* Live Card Preview Box */}
          <div className="bg-slate-100/50 dark:bg-gray-950/20 border border-dashed border-slate-250 dark:border-gray-800 rounded-3xl p-5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest block mb-4">
              {t("admin.announcements.preview")}
            </span>
            
            <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-850 rounded-2xl p-5 shadow-premium">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <span className={`inline-flex px-2 py-0.5 rounded-lg border text-[9px] font-extrabold uppercase tracking-wide ${getPriorityStyle(priority)}`}>
                  {priority} Priority
                </span>
                <div className="flex gap-2">
                  <span className="bg-slate-100 dark:bg-gray-850 text-slate-500 dark:text-gray-400 border border-slate-200/50 dark:border-gray-800 rounded px-2 py-0.5 text-[9px] font-bold">
                    {category.toUpperCase()}
                  </span>
                  <span className="bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/10 rounded px-2 py-0.5 text-[9px] font-bold">
                    {status.toUpperCase()}
                  </span>
                </div>
              </div>

              <h4 className="mt-3.5 font-heading text-sm font-extrabold text-charcoal dark:text-white">
                {title || "Live Card Title Preview"}
              </h4>
              <p className="mt-2 text-xs text-charcoal-light dark:text-gray-400 leading-relaxed">
                {description || "Case descriptions, camp office directions, weather reports, and halt details will appear live here in real-time as you type..."}
              </p>
              
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-gray-850 flex items-center gap-1 text-[9px] text-slate-400 dark:text-gray-500 font-bold">
                <Calendar className="w-3 h-3 text-primary" />
                <span>Scheduled: {new Date(publishDate).toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Directory list of announcements */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
          <h3 className="font-heading text-sm font-bold text-charcoal dark:text-white uppercase tracking-wider pb-4 mb-4 border-b border-slate-100 dark:border-gray-850">
            {t("admin.announcements.create_title").split(" ")[1]} Directory
          </h3>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-3 border border-slate-150 dark:border-gray-800 rounded-2xl relative group hover:border-primary/20 transition-all">
                <div className="flex justify-between items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded border text-[8px] font-bold uppercase tracking-wider ${getPriorityStyle(ann.priority)}`}>
                    {ann.priority}
                  </span>
                  
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-955/20 transition-all focus:outline-none"
                    aria-label="Delete announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h5 className="mt-2 font-heading text-xs font-extrabold text-charcoal dark:text-white leading-tight truncate pr-4">
                  {ann.titleKey ? t(ann.titleKey) : ann.titleText}
                </h5>
                <p className="mt-1 text-[10px] text-charcoal-light dark:text-gray-400 leading-normal line-clamp-2 pr-2">
                  {ann.descriptionKey ? t(ann.descriptionKey) : ann.descriptionText}
                </p>

                <div className="mt-3.5 flex items-center justify-between text-[8px] font-bold text-slate-400 dark:text-gray-500">
                  <span className="bg-slate-100 dark:bg-gray-850 px-1.5 py-0.5 rounded uppercase">
                    {ann.category}
                  </span>
                  <span>
                    {new Date(ann.publishDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
