"use client";

import React, { useState } from 'react';
import { adminReports } from '@/data/reports';
import { useLanguage } from '@/context/LanguageContext';
import { FileText, Download, Printer, Share2, Calendar, User, Database } from 'lucide-react';

export default function ReportsAdmin() {
  const { t } = useLanguage();
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (key) => {
    setToastMessage(key);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const getReportIconStyles = (type) => {
    const styles = {
      daily: "bg-orange-50 border-orange-100 text-primary dark:bg-orange-950/20 dark:border-primary-dark/20 dark:text-primary-light",
      volunteer: "bg-blue-50 border-blue-100 text-secondary-light dark:bg-blue-950/20 dark:border-blue-900/20 dark:text-secondary-light",
      emergency: "bg-rose-50 border-rose-100 text-red-650 dark:bg-rose-950/20 dark:border-red-900/20 dark:text-red-400",
      audit: "bg-emerald-50 border-emerald-100 text-emerald-650 dark:bg-emerald-950/20 dark:border-emerald-900/20 dark:text-emerald-400",
      weekly: "bg-purple-50 border-purple-100 text-purple-650 dark:bg-purple-950/20 dark:border-purple-900/20 dark:text-purple-400",
    };
    return styles[type] || styles.daily;
  };

  return (
    <div className="space-y-6">
      
      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>{t(toastMessage)}</span>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
          {t("admin.reports.title")}
        </h1>
        <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
          Export logs and audit registries. Print summaries for camp office briefing logs and administrative check-ins.
        </p>
      </div>

      {/* Reports grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminReports.map((report) => {
          // Format report title manually to avoid runtime exceptions
          let title = t(report.titleKey);
          if (report.titleArgs) {
            Object.entries(report.titleArgs).forEach(([k, v]) => {
              title = title.replace(`{${k}}`, v);
            });
          }

          return (
            <div key={report.id} className="group bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5.5 shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
              
              <div>
                {/* Header: Icon, Type & File Size */}
                <div className="flex justify-between items-start gap-4">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${getReportIconStyles(report.type)}`}>
                    <FileText className="w-5.5 h-5.5" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-450">
                    <Database className="w-3 h-3 text-primary" />
                    <span>{report.size}</span>
                    <span>•</span>
                    <span>{report.downloads} dl</span>
                  </div>
                </div>

                {/* Title & Desc */}
                <h4 className="mt-4 font-heading text-sm font-extrabold text-charcoal dark:text-white leading-snug group-hover:text-primary transition-colors">
                  {title}
                </h4>
                <p className="mt-2 text-xs text-charcoal-light dark:text-gray-400 leading-relaxed">
                  {t(report.descriptionKey)}
                </p>

                {/* Metadata */}
                <div className="mt-5.5 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-400 dark:text-gray-500 font-bold border-t border-slate-100 dark:border-gray-850 pt-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary" />
                    {new Date(report.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-primary" />
                    {report.author}
                  </span>
                </div>
              </div>

              {/* Actions row */}
              <div className="mt-6.5 flex gap-2">
                <button
                  onClick={() => triggerToast("admin.reports.toast_pdf")}
                  className="flex-grow inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-[11px] font-bold transition-all shadow-saffron-glow focus:outline-none"
                >
                  <Download className="w-3.5 h-3.5" />
                  {t("admin.reports.btn_pdf")}
                </button>
                
                <button
                  onClick={() => triggerToast("admin.reports.toast_print")}
                  className="p-2 border border-slate-200 dark:border-gray-800 text-charcoal dark:text-gray-300 hover:text-primary dark:hover:text-primary-light hover:bg-slate-55 dark:hover:bg-gray-850 rounded-xl transition-all focus:outline-none"
                  aria-label="Print report"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  onClick={() => triggerToast("admin.reports.toast_share")}
                  className="p-2 border border-slate-200 dark:border-gray-800 text-charcoal dark:text-gray-300 hover:text-primary dark:hover:text-primary-light hover:bg-slate-55 dark:hover:bg-gray-850 rounded-xl transition-all focus:outline-none"
                  aria-label="Share report link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
