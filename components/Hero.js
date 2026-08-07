"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Container from './Container';
import Button from './Button';
import StatisticCard from './StatisticCard';
import { ChevronDown, Users, HeartPulse, UserCheck, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

const FALLBACK_STATS = [
  { icon: Users, count: "500+", labelKey: "stats.volunteers", color: "text-primary" },
  { icon: HeartPulse, count: "50+", labelKey: "stats.camps", color: "text-red-600" },
  { icon: UserCheck, count: "10,000+", labelKey: "stats.assisted", color: "text-emerald-600" },
  { icon: ShieldAlert, count: "24/7", labelKey: "stats.support", color: "text-secondary" },
];

const STAT_ICONS = {
  volunteers: Users,
  camps: HeartPulse,
  assisted: UserCheck,
  support: ShieldAlert,
};

const STAT_COLORS = {
  volunteers: "text-primary",
  camps: "text-red-600",
  assisted: "text-emerald-600",
  support: "text-secondary",
};

export default function Hero() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/public-stats');
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          const liveStats = [
            { icon: Users, count: formatCount(d.volunteers), labelKey: "stats.volunteers", color: "text-primary" },
            { icon: HeartPulse, count: "50+", labelKey: "stats.camps", color: "text-red-600" },
            { icon: UserCheck, count: "10,000+", labelKey: "stats.assisted", color: "text-emerald-600" },
            { icon: ShieldAlert, count: "24/7", labelKey: "stats.support", color: "text-secondary" },
          ];
          if (d.volunteers > 0) {
            liveStats[0] = { icon: Users, count: formatCount(d.volunteers), labelKey: "stats.volunteers", color: "text-primary" };
          }
          setStats(liveStats);
        }
      } catch {
        setStatsError(true);
      }
    }
    fetchStats();
  }, []);

  return (
    <section id="home" className="relative min-h-[92vh] flex flex-col justify-between pt-16 pb-8 overflow-hidden bg-slate-950">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 mix-blend-overlay"
        style={{ backgroundImage: "url('/images/wari_pilgrimage_hero.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/75 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <Container className="relative z-10 flex-grow flex flex-col justify-center items-center text-center mt-12 md:mt-20">
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6 animate-pulse transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          NSS Seva Portal 2026
        </div>

        <h1 className={`font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl px-2 transition-all duration-700 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {t('hero.title').split(' ').map((word, i) => {
            const isSeva = word.toLowerCase().includes('seva') || word.includes('सेवा') || word.toLowerCase().includes('warkaris') || word.includes('वारकऱ्यांची');
            return (
              <span key={i} className={isSeva ? "text-primary" : "text-white"}>
                {word}{' '}
              </span>
            );
          })}
        </h1>

        <p className={`mt-6 text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 max-w-2xl leading-relaxed px-4 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {t('hero.subtitle')}
        </p>

        <div className={`mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-sm sm:max-w-none px-4 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Button href="/register" variant="primary" size="lg" className="w-full sm:w-auto shadow-saffron-glow">
            {t('hero.cta_volunteer')}
          </Button>
          <Button href="/about" variant="glass" size="lg" className="w-full sm:w-auto">
            {t('hero.cta_more')}
          </Button>
        </div>
      </Container>

      <div className="relative z-10 w-full mt-16 md:mt-24 mb-6">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${(index + 1) * 150}ms` }}>
                <StatisticCard
                  icon={stat.icon}
                  count={stat.count}
                  labelKey={stat.labelKey}
                  color={stat.color}
                />
              </div>
            ))}
          </div>
        </Container>
      </div>

      <div className="hidden md:flex justify-center items-center mt-4 animate-bounce text-slate-500 hover:text-primary transition-colors duration-200">
        <Link href="/about" aria-label="Scroll down to details">
          <ChevronDown className="w-6 h-6" />
        </Link>
      </div>
    </section>
  );
}

function formatCount(num) {
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
  return num + '+';
}
