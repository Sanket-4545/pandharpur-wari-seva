"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, Flame } from 'lucide-react';
import Link from 'next/link';
import Container from './Container';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { navLinks } from '@/data/dummyData';

export default function Navbar() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-premium py-2.5 border-slate-200/50' 
        : 'bg-white/70 backdrop-blur-sm py-4 border-transparent'
    }`}>
      <Container>
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none" aria-label="NSS Seva Portal Home">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white shadow-saffron-glow transition-all duration-350 group-hover:scale-105 group-hover:rotate-3">
              <Flame className="w-5.5 h-5.5 fill-current animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg md:text-xl font-extrabold text-secondary tracking-tight leading-tight">
                {t('nav.title')}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary leading-none mt-0.5">
                Pandharpur Seva
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links & Switcher */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-heading text-[15px] font-semibold text-charcoal hover:text-primary transition-colors duration-250 relative py-1.5 group"
                >
                  {t(link.labelKey)}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>
            <LanguageSwitcher />
          </div>

          {/* Mobile Actions: Switcher & Hamburger Toggle */}
          <div className="flex items-center gap-3.5 lg:hidden">
            <LanguageSwitcher className="scale-95" />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-md text-charcoal hover:text-primary hover:border-primary/50 focus:outline-none transition-all duration-200 active:scale-95"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`lg:hidden overflow-hidden transition-all duration-350 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 mt-4 border-t border-slate-200/50 pt-4' : 'max-h-0 opacity-0 pointer-events-none'
        }`}>
          <div className="flex flex-col gap-3.5 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="font-heading text-base font-semibold text-charcoal hover:text-primary transition-colors px-3 py-2 rounded-xl hover:bg-slate-50"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </nav>
  );
}
