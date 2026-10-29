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

// The marquee always travels exactly one copy of the list per loop, so a long
// notice makes the strip wider. Instead of racing through it at a fixed 35s,
// we keep the on-screen speed constant (~125px/s) so full descriptions stay
// legible while scrolling. Short lists keep the original 35s duration.
const TICKER_SPEED_PX_PER_SEC = 125;
const MIN_TICKER_DURATION_SEC = 35;
const TICKER_ITEM_BASE_WIDTH_PX = 240; // dot + badge + gaps + padding
const TICKER_ITEM_CHAR_WIDTH_PX = 7.5; // approximate char width at ticker sizes
const TICKER_ITEM_GAP_PX = 40; // gap-10 between items

function decorateAnnouncements(announcements) {
  return announcements.map((a) => {
    const cat = CATEGORY_CONFIG[a.category] || CATEGORY_CONFIG.general;
    const Icon = cat.icon;
    return { ...a, Icon, cat };
  });
}

function estimateTickerItemWidth(item) {
  const text = [item.title, item.description, item.category].filter(Boolean).join(" ");
  return TICKER_ITEM_BASE_WIDTH_PX + text.length * TICKER_ITEM_CHAR_WIDTH_PX;
}

function CategoryBadge({ item }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${item.cat.bg} ${item.cat.text} border ${item.cat.border}`}
    >
      <item.Icon className="w-3 h-3" aria-hidden="true" />
      {item.category}
    </span>
  );
}

function PriorityDot({ item }) {
  return (
    <span
      className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[item.priority] || PRIORITY_DOT.medium}`}
      aria-hidden="true"
    />
  );
}

/**
 * Mobile / tablet view (below lg): a static, fully readable notice list.
 * Nothing is truncated, clamped, or animated here, so the complete
 * description of every announcement can be read and long words wrap
 * instead of pushing the page sideways.
 */
function StaticNotices({ announcements, t }) {
  const items = decorateAnnouncements(announcements);

  return (
    <div className="lg:hidden">
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3 bg-primary text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-sm">
        <Megaphone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span>{t("announcements.label") || "Announcements"}</span>
      </div>

      <ul className="px-4 sm:px-5 py-1">
        {items.map((item) => (
          <li
            key={item.announcementId}
            className="py-3 border-b border-slate-200/60 dark:border-gray-800 last:border-b-0"
          >
            <div className="flex items-center gap-2.5 flex-wrap">
              <PriorityDot item={item} />
              <CategoryBadge item={item} />
            </div>
            <p className="mt-1.5 font-heading text-sm sm:text-base font-extrabold text-charcoal dark:text-white leading-snug break-words">
              {item.title}
            </p>
            {item.description && (
              <p className="mt-1 text-xs sm:text-[13px] leading-relaxed text-charcoal-light dark:text-gray-400 break-words whitespace-normal">
                {item.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Desktop view (lg and up): the original horizontal ticker design.
 * Descriptions are no longer truncated — the full text scrolls by and the
 * strip pauses on hover, keyboard focus, or press-and-hold on touch.
 */
function TickerContent({ announcements, isPaused, t }) {
  const items = decorateAnnouncements(announcements);
  const loopItems = [...items, ...items];

  const oneLoopWidth =
    items.reduce((sum, item) => sum + estimateTickerItemWidth(item), 0) +
    items.length * TICKER_ITEM_GAP_PX;
  const durationSec = Math.max(
    MIN_TICKER_DURATION_SEC,
    Math.round(oneLoopWidth / TICKER_SPEED_PX_PER_SEC)
  );

  return (
    <div className="hidden lg:flex items-center">
      {/* Fixed label */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 sm:px-5 py-3.5 sm:py-4 bg-primary text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider z-10 shadow-sm">
        <Megaphone className="w-4 h-4" aria-hidden="true" />
        <span>{t("announcements.label") || "Announcements"}</span>
      </div>

      {/* Scrolling track */}
      <div
        className="announcement-viewport relative flex-1 overflow-hidden"
        role="marquee"
        aria-label={t("announcements.aria_label") || "Announcements"}
        tabIndex={0}
      >
        <div
          className={`announcement-track flex items-center gap-8 sm:gap-10 whitespace-nowrap py-3.5 sm:py-4 px-5 sm:px-6 ${isPaused ? "announcement-paused" : ""}`}
          style={{ animationDuration: `${durationSec}s` }}
        >
          {loopItems.map((item, i) => (
            <div
              key={`${item.announcementId}-${i}`}
              className="inline-flex items-center gap-3 flex-shrink-0"
            >
              <PriorityDot item={item} />
              <CategoryBadge item={item} />
              <span className="font-heading text-sm sm:text-base md:text-lg font-extrabold text-charcoal dark:text-white">
                {item.title}
              </span>
              {item.description && (
                <span className="text-xs sm:text-[13px] text-charcoal-light dark:text-gray-400">
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
      aria-label={t("announcements.aria_label") || "Announcements"}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      // Touch users have no hover: pressing and holding the strip freezes it
      // so a long notice can be read without chasing the animation.
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse") setIsPaused(true);
      }}
      onPointerUp={() => setIsPaused(false)}
      onPointerCancel={() => setIsPaused(false)}
      onPointerLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Subtle animated glow */}
      <div className="announcement-glow absolute inset-0 pointer-events-none" aria-hidden="true" />

      <StaticNotices announcements={announcements} t={t} />
      <TickerContent announcements={announcements} isPaused={isPaused} t={t} />
    </section>
  );
}
