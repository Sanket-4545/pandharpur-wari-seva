"use client";

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { Users, Calendar, MapPin, Clock } from 'lucide-react';

export default function ActivityCard({ activity }) {
  const { t } = useLanguage();

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString(undefined, { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const activityDate = formatDate(activity.activityDate);
  const startTime = formatTime(activity.startTime);
  const endTime = formatTime(activity.endTime);

  return (
    <article className="group bg-white dark:bg-gray-900 rounded-2xl border border-slate-150 dark:border-gray-800 overflow-hidden shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-350 flex flex-col">
      {/* Poster Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-slate-100 dark:bg-gray-800">
        {activity.posterUrl ? (
          <Image
            src={activity.posterUrl}
            alt={activity.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className={`w-full h-full items-center justify-center text-slate-400 dark:text-gray-600 ${activity.posterUrl ? 'hidden' : 'flex'}`}>
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Date Badge */}
        {activityDate && (
          <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200/50 dark:border-gray-800 rounded-xl px-3 py-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal dark:text-white">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{activityDate}</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow border-t border-slate-50 dark:border-gray-800">
        {/* Title */}
        <h3 className="font-heading text-lg font-extrabold text-charcoal dark:text-white leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
          {activity.title}
        </h3>

        {/* Venue */}
        {activity.venue && (
          <div className="mt-2.5 flex items-start gap-2 text-sm text-charcoal-light dark:text-gray-400 leading-relaxed">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary/80" />
            <span className="line-clamp-2">{activity.venue}</span>
          </div>
        )}

        {/* Time */}
        {(startTime || endTime) && (
          <div className="mt-2 flex items-center gap-2 text-sm text-charcoal-light dark:text-gray-400">
            <Clock className="w-4 h-4 flex-shrink-0 text-primary/80" />
            <span>
              {startTime && endTime ? `${startTime} - ${endTime}` : startTime || endTime}
            </span>
          </div>
        )}

        {/* Description */}
        {activity.description && (
          <p className="mt-3 text-sm text-charcoal-light dark:text-gray-400 leading-relaxed line-clamp-3">
            {activity.description}
          </p>
        )}

        {/* Participants - prominent at bottom */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-sm text-charcoal dark:text-white">
                  {activity.boysCount || 0}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <span className="font-bold text-sm text-charcoal dark:text-white">
                  {activity.girlsCount || 0}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-primary/10 dark:bg-primary-dark/20 border border-primary/20 dark:border-primary-dark/30 rounded-xl px-3 py-1.5">
              <Users className="w-4 h-4 text-primary dark:text-primary-light" />
              <span className="font-heading text-base font-extrabold text-primary dark:text-primary-light">
                {activity.totalParticipants || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}