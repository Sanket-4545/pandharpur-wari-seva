"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { MapPin, Calendar } from "lucide-react";

export default function Timeline() {
  const { t } = useLanguage();
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchStops() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/timeline-stops?limit=100");
      if (!res.ok) throw new Error("Failed to fetch timeline stops");
      const data = await res.json();
      if (data.success && data.data?.items) {
        setStops(data.data.items);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStops();
  }, []);

  if (loading) {
    return (
      <div className="relative max-w-4xl mx-auto px-4 py-8">
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-slate-200 -translate-x-1/2 rounded-full" />
        <div className="space-y-12">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="relative flex flex-col md:flex-row items-start md:items-center">
              <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse border-4 border-white shadow-premium" />
              </div>
              <div className="hidden md:block w-1/2" />
              <div className="w-full md:w-[45%] pl-16 md:pl-0">
                <div className="p-5.5 rounded-2xl bg-white border border-slate-150 shadow-premium animate-pulse">
                  <div className="h-6 bg-slate-200 rounded w-24 mb-3" />
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative max-w-4xl mx-auto px-4 py-8 text-center text-red-600">
        <p>Failed to load timeline: {error}</p>
        <button onClick={fetchStops} className="mt-4 px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (!stops.length) {
    return (
      <div className="relative max-w-4xl mx-auto px-4 py-8 text-center text-charcoal-light">
        <p>No timeline stops found.</p>
      </div>
    );
  }

  return (
    <div className="relative max-w-4xl mx-auto px-4 py-8">
      {/* Centered Timeline Line for desktop, left line for mobile */}
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-slate-200 -translate-x-1/2 rounded-full" />

      <div className="space-y-12">
        {stops.map((stop, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={stop.stopId}
              className={`relative flex flex-col md:flex-row items-start md:items-center ${
                isEven ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Timeline Marker dot */}
              <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-premium ${stop.color}`}>
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Spacer for desktop alignment */}
              <div className="hidden md:block w-1/2" />

              {/* Timeline Card */}
              <div className="w-full md:w-[45%] pl-16 md:pl-0">
                <div className="p-5.5 rounded-2xl bg-white border border-slate-150 shadow-premium hover:shadow-premium-hover transition-shadow duration-300 hover:border-primary/20 group">
                  {/* Day Indicator */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-charcoal-light text-xs font-bold mb-3.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>{stop.dayRange}</span>
                  </div>

                  {/* Title */}
                  <h4 className="font-heading text-lg font-bold text-charcoal group-hover:text-primary transition-colors duration-250">
                    {t(stop.titleKey)}
                  </h4>

                  {/* Description */}
                  <p className="mt-2.5 text-sm text-charcoal-light leading-relaxed">
                    {t(stop.descriptionKey)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
