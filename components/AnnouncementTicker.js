"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Megaphone, AlertTriangle, Info, Stethoscope, CalendarDays } from "lucide-react";

const CATEGORY_CONFIG = {
  safety: { icon: AlertTriangle, bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20" },
  schedule: { icon: CalendarDays, bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20" },
  camp: { icon: Stethoscope, bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20" },
  general: { icon: Info, bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20" },
};

const PRIORITY_DOT = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-slate-400",
};

function TickerContent({ announcements, isPaused, t }) {
  const items = announcements.map((a) => {
    const cat = CATEGORY_CONFIG[a.category] || CATEGORY_CONFIG.general;
    const Icon = cat.icon;
    return { ...a, Icon, cat };
  });

  const loopItems = [...items, ...items];

  return (
    <div className="flex items-center">
      {/* Fixed label */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 sm:px-5 py-3.5 sm:py-4 bg-primary text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider z-10 shadow-sm">
        <Megaphone className="w-4 h-4" />
        <span className="hidden sm:inline">{t("announcements.label") || "Announcements"}</span>
      </div>

      {/* Scrolling track */}
      <div className="relative flex-1 overflow-hidden">
        <div
          className={`announcement-track flex items-center gap-8 sm:gap-10 whitespace-nowrap py-3.5 sm:py-4 px-5 sm:px-6 ${isPaused ? "announcement-paused" : ""}`}
        >
          {loopItems.map((item, i) => (
            <div
              key={`${item.announcementId}-${i}`}
              className="inline-flex items-center gap-3 flex-shrink-0"
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[item.priority] || PRIORITY_DOT.medium}`} />
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${item.cat.bg} ${item.cat.text} border ${item.cat.border}`}>
                <item.Icon className="w-3 h-3" />
                {item.category}
              </span>
              <span className="font-heading text-sm sm:text-base md:text-lg font-extrabold text-charcoal dark:text-white">
                {item.title}
              </span>
              {item.description && (
                <span className="text-xs sm:text-[13px] text-charcoal-light dark:text-gray-400 max-w-[200px] sm:max-w-xs truncate">
                  — {item.description}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementTicker() {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/announcements?limit=10");
        if (!res.ok) throw new Error("Failed to load");
        const json = await res.json();
        if (!cancelled && json.success && json.data?.items) {
          setAnnouncements(json.data.items);
        }
      } catch {
        // silently fail — ticker just won't show
      } finally {
        if (!cancelled) setMounted(true);
      }
    }
    fetchAnnouncements();
    return () => { cancelled = true; };
  }, []);

  // Deterministic: server and client both render null until mounted
  if (!mounted || announcements.length === 0) return null;

  return (
    <section
      className="announcement-wrapper relative w-full overflow-hidden z-20 border-b border-slate-200/60 dark:border-gray-800"
      role="marquee"
      aria-label={t("announcements.aria_label") || "Announcements"}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Subtle animated glow */}
      <div className="announcement-glow absolute inset-0 pointer-events-none" aria-hidden="true" />

      <TickerContent announcements={announcements} isPaused={isPaused} t={t} />
    </section>
  );
}
