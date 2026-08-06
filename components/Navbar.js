"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Container from './Container';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { navLinks } from '@/data/dummyData';

export default function Navbar() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authState, setAuthState] = useState('loading');
  const [volunteerData, setVolunteerData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const volRes = await fetch('/api/volunteer/me');
        if (volRes.ok) {
          const volJson = await volRes.json();
          if (volJson.success && volJson.data) {
            setVolunteerData(volJson.data);
            setAuthState('volunteer');
            return;
          }
        }
      } catch {}

      try {
        const adminRes = await fetch('/api/admins/me');
        if (adminRes.ok) {
          const adminJson = await adminRes.json();
          if (adminJson.success) {
            setAuthState('admin');
            return;
          }
        }
      } catch {}

      setAuthState('unauthenticated');
    }
    checkAuth();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVolunteerLogout = async () => {
    try {
      await fetch('/api/auth/volunteer/logout', { method: 'POST' });
    } catch {}
    setAuthState('unauthenticated');
    setVolunteerData(null);
    setDropdownOpen(false);
    router.push('/');
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setAuthState('unauthenticated');
    setDropdownOpen(false);
    router.push('/');
  };

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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white shadow-saffron-glow transition-all duration-350 group-hover:scale-105 group-hover:rotate-3 relative overflow-hidden">
              <Image src="/images/logo.jpg" alt="NSS Seva Portal logo" fill sizes="40px" className="object-cover" priority />
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

            {/* Auth Dropdown */}
            <div className="relative" ref={dropdownRef}>
              {authState === 'loading' ? (
                <div className="w-24 h-9 bg-slate-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              ) : authState === 'volunteer' ? (
                <>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-[100px] truncate">{volunteerData?.volunteerId || 'Volunteer'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-premium-hover overflow-hidden z-50">
                      <div className="p-3 border-b border-slate-100 dark:border-gray-800">
                        <p className="text-xs text-charcoal-light dark:text-gray-400">Signed in as</p>
                        <p className="text-sm font-bold text-charcoal dark:text-white truncate">{volunteerData?.name || volunteerData?.volunteerId}</p>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href="/volunteer/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-charcoal dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-charcoal-light dark:text-gray-500" />
                          Dashboard
                        </Link>
                        <Link
                          href="/volunteer/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-charcoal dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4 text-charcoal-light dark:text-gray-500" />
                          Profile
                        </Link>
                      </div>
                      <div className="p-1.5 border-t border-slate-100 dark:border-gray-800">
                        <button
                          onClick={handleVolunteerLogout}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : authState === 'admin' ? (
                <>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-premium-hover overflow-hidden z-50">
                      <div className="p-1.5">
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-charcoal dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-charcoal-light dark:text-gray-500" />
                          Admin Dashboard
                        </Link>
                      </div>
                      <div className="p-1.5 border-t border-slate-100 dark:border-gray-800">
                        <button
                          onClick={handleAdminLogout}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all shadow-saffron-glow"
                  >
                    Login
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-premium-hover overflow-hidden z-50">
                      <div className="p-1.5">
                        <Link
                          href="/volunteer/login"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-charcoal dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4 text-charcoal-light dark:text-gray-500" />
                          Volunteer Login
                        </Link>
                        <Link
                          href="/login"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-charcoal dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          <Shield className="w-4 h-4 text-charcoal-light dark:text-gray-500" />
                          Admin Login
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
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
          isOpen ? 'max-h-[500px] opacity-100 mt-4 border-t border-slate-200/50 pt-4' : 'max-h-0 opacity-0 pointer-events-none'
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

            <div className="border-t border-slate-200/50 pt-3 mt-1">
              {authState === 'volunteer' ? (
                <>
                  <Link
                    href="/volunteer/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 font-heading text-base font-semibold text-charcoal hover:text-primary transition-colors px-3 py-2 rounded-xl hover:bg-slate-50"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { handleVolunteerLogout(); setIsOpen(false); }}
                    className="flex items-center gap-2 font-heading text-base font-semibold text-red-600 hover:text-red-700 transition-colors px-3 py-2 rounded-xl hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : authState === 'admin' ? (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 font-heading text-base font-semibold text-charcoal hover:text-primary transition-colors px-3 py-2 rounded-xl hover:bg-slate-50"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                  <button
                    onClick={() => { handleAdminLogout(); setIsOpen(false); }}
                    className="flex items-center gap-2 font-heading text-base font-semibold text-red-600 hover:text-red-700 transition-colors px-3 py-2 rounded-xl hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/volunteer/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 font-heading text-base font-semibold text-charcoal hover:text-primary transition-colors px-3 py-2 rounded-xl hover:bg-slate-50"
                  >
                    <User className="w-4 h-4" />
                    Volunteer Login
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 font-heading text-base font-semibold text-charcoal hover:text-primary transition-colors px-3 py-2 rounded-xl hover:bg-slate-50"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </nav>
  );
}
