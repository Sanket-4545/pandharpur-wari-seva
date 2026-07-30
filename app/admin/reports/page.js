"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  FileText, Download, Printer, Share2, Calendar, User,
  Plus, X, Save, Filter, Trash2
} from 'lucide-react';
import Toast from '@/components/Toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import LoadingButton from '@/components/LoadingButton';

const REPORT_TYPES = ["daily", "weekly", "volunteer", "emergency", "audit"];

export default function ReportsAdmin() {
  const { t } = useLanguage();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });
  const [typeFilter, setTypeFilter] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', type: 'daily', author: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, visible: true });
  }, []);

  const fetchReports = useCallback(async (type = '') => {
    try {
      setLoading(true);
      setError(null);
      const url = `/api/reports?limit=100${type ? `&type=${type}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(t("admin.common.load_error"));
      const json = await res.json();
      if (json.success && json.data?.items) {
        setReports(json.data.items);
      } else {
        setReports([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchReports(typeFilter);
  }, [fetchReports, typeFilter]);

  const handleCreate = async () => {
    if (!createForm.title || !createForm.description || !createForm.author) {
      showToast(t("admin.reports.toast_validation_error"), 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...createForm, date: new Date().toISOString() }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || t("admin.reports.toast_create_error"));
      }
      await fetchReports(typeFilter);
      setShowCreateForm(false);
      setCreateForm({ title: '', description: '', type: 'daily', author: '' });
      showToast(t("admin.reports.toast_created"));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/reports/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || t("admin.reports.toast_delete_error"));
      }
      setReports(prev => prev.filter(r => r.reportId !== deletingId));
      showToast(t("admin.reports.toast_deleted"));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePrint = (report) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html><html><head><title>${report.title} - ${report.reportId}</title>
<style>body{font-family:sans-serif;padding:40px;max-width:800px;margin:auto;color:#222}
h1{font-size:24px;margin-bottom:4px}
.meta{color:#666;font-size:14px;margin-bottom:20px}
.badge{display:inline-block;background:#f59e0b;color:#fff;padding:4px 12px;border-radius:12px;font-size:12px;text-transform:uppercase}
p{line-height:1.6;color:#444}
hr{margin:24px 0;border:none;border-top:1px solid #eee}
.footer{text-align:center;color:#999;font-size:11px;margin-top:40px}</style></head><body>
<h1>${report.title}</h1>
<div class="meta"><strong>ID:</strong> ${report.reportId}<br>
<strong>Date:</strong> ${new Date(report.date || report.createdAt).toLocaleDateString()}<br>
<strong>Author:</strong> ${report.author || 'N/A'}</div>
<span class="badge">${report.type}</span>
<hr><p>${report.description}</p>
<hr><p class="footer">Generated from NSS Seva Portal | Pandharpur Wari</p>
</body></html>`);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
    showToast(t("admin.reports.toast_print_opened"));
  };

  const handleShare = async (report) => {
    const shareUrl = `${window.location.origin}/admin/reports?report=${report.reportId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: report.title, text: report.description, url: shareUrl });
        showToast(t("admin.reports.toast_shared"));
      } catch (err) {
        if (err.name !== 'AbortError') showToast(t("admin.reports.toast_share_error"), 'error');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast(t("admin.reports.toast_link_copied"));
      } catch {
        showToast(t("admin.reports.toast_share_error"), 'error');
      }
    }
  };

  const handleDownload = () => {
    showToast(t("admin.reports.toast_download_unavailable"), 'warning');
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-64 mb-2" />
        <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5.5 shadow-premium">
              <div className="flex justify-between items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-gray-700 animate-pulse" />
                <div className="w-20 h-3 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="mt-4 h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
              <div className="mt-2 space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
              </div>
              <div className="mt-5.5 border-t border-slate-100 dark:border-gray-850 pt-3">
                <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
              </div>
              <div className="mt-6.5 flex gap-2">
                <div className="flex-grow h-9 bg-slate-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                <div className="w-9 h-9 bg-slate-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                <div className="w-9 h-9 bg-slate-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">{t("admin.reports.title")}</h1>
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button onClick={() => fetchReports(typeFilter)} className="mt-4 text-primary underline text-sm">{t("admin.common.retry")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">{t("admin.reports.title")}</h1>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-saffron-glow shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t("admin.reports.new_report_btn")}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <button
          onClick={() => setTypeFilter('')}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${typeFilter === '' ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-gray-850 text-charcoal-light dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-800'}`}
        >
          {t("admin.reports.filter_all")}
        </button>
        {REPORT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all capitalize ${typeFilter === type ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-gray-850 text-charcoal-light dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-800'}`}
          >
            {t(`admin.reports.type_${type}`)}
          </button>
        ))}
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-slate-200 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-gray-800 flex items-center justify-center text-slate-400 dark:text-gray-500 mb-5">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="font-heading text-lg font-bold text-charcoal dark:text-white">{t("admin.reports.empty_title")}</h3>
          <p className="mt-2 text-sm text-charcoal-light dark:text-gray-400 text-center max-w-sm">{t("admin.reports.empty_desc")}</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-saffron-glow"
          >
            <Plus className="w-4 h-4" />
            {t("admin.reports.new_report_btn")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <div key={report.reportId || report._id} className="group bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5.5 shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${getReportIconStyles(report.type)}`}>
                    <FileText className="w-5.5 h-5.5" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-450">
                    <span className="bg-slate-100 dark:bg-gray-850 px-1.5 py-0.5 rounded uppercase">{t(`admin.reports.type_${report.type}`)}</span>
                    <span>•</span>
                    <span>{report.downloadCount || 0} {t("admin.reports.downloads")}</span>
                  </div>
                </div>

                <h4 className="mt-4 font-heading text-sm font-extrabold text-charcoal dark:text-white leading-snug group-hover:text-primary transition-colors">
                  {report.title}
                </h4>
                <p className="mt-2 text-xs text-charcoal-light dark:text-gray-400 leading-relaxed line-clamp-3">
                  {report.description}
                </p>

                <div className="mt-5.5 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-400 dark:text-gray-500 font-bold border-t border-slate-100 dark:border-gray-850 pt-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary" />
                    {new Date(report.date || report.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-primary" />
                    {report.author || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-6.5 flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex-grow inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-[11px] font-bold transition-all shadow-saffron-glow focus:outline-none"
                >
                  <Download className="w-3.5 h-3.5" />
                  {t("admin.reports.btn_download")}
                </button>
                <button
                  onClick={() => handlePrint(report)}
                  className="p-2 border border-slate-200 dark:border-gray-800 text-charcoal dark:text-gray-300 hover:text-primary dark:hover:text-primary-light hover:bg-slate-55 dark:hover:bg-gray-850 rounded-xl transition-all focus:outline-none"
                  aria-label={t("admin.reports.btn_print")}
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare(report)}
                  className="p-2 border border-slate-200 dark:border-gray-800 text-charcoal dark:text-gray-300 hover:text-primary dark:hover:text-primary-light hover:bg-slate-55 dark:hover:bg-gray-850 rounded-xl transition-all focus:outline-none"
                  aria-label={t("admin.reports.btn_share")}
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingId(report.reportId)}
                  className="p-2 border border-slate-200 dark:border-gray-800 text-charcoal dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all focus:outline-none"
                  aria-label={t("admin.common.delete")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowCreateForm(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/60 dark:border-gray-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-extrabold text-charcoal dark:text-white">{t("admin.reports.create_title")}</h2>
              <button onClick={() => setShowCreateForm(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.reports.title_label")} *</label>
                <input type="text" required value={createForm.title} onChange={e => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                  placeholder={t("admin.reports.placeholder_title")} />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.reports.desc_label")} *</label>
                <textarea rows={3} required value={createForm.description} onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white resize-none"
                  placeholder={t("admin.reports.placeholder_desc")} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.reports.type_label")} *</label>
                  <select value={createForm.type} onChange={e => setCreateForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white">
                    {REPORT_TYPES.map(type => (
                      <option key={type} value={type}>{t(`admin.reports.type_${type}`)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal dark:text-white mb-1.5">{t("admin.reports.author_label")} *</label>
                  <input type="text" required value={createForm.author} onChange={e => setCreateForm(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 dark:text-white"
                    placeholder={t("admin.reports.placeholder_author")} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-gray-800">
              <button onClick={() => setShowCreateForm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-charcoal dark:text-white hover:bg-slate-50 dark:hover:bg-gray-800 transition-all">
                {t("admin.reports.btn_cancel")}
              </button>
              <LoadingButton onClick={handleCreate} loading={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-saffron-glow">
                <Save className="w-4 h-4 mr-1" />
                {t("admin.reports.btn_create")}
              </LoadingButton>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title={t("admin.reports.delete_title")}
        messageKey="admin.common.confirm"
      />
    </div>
  );
}
