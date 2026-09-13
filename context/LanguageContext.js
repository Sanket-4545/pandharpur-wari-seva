"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import en from '@/locales/en.json';
import mr from '@/locales/mr.json';

const LanguageContext = createContext();

const dictionaries = {
  en,
  mr,
};

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLocale = localStorage.getItem('wari_nss_locale');
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'mr')) {
      setLocale(savedLocale);
      document.documentElement.lang = savedLocale;
    } else {
      document.documentElement.lang = 'en';
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
    }
  }, [locale, mounted]);

  const changeLanguage = (newLocale) => {
    if (newLocale === 'en' || newLocale === 'mr') {
      setLocale(newLocale);
      localStorage.setItem('wari_nss_locale', newLocale);
    }
  };

  const t = useCallback((keyPath) => {
    const keys = keyPath.split('.');
    let result = dictionaries[mounted ? locale : 'en'];
    
    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
        let fallback = dictionaries['en'];
        for (const k of keys) {
          fallback = fallback ? fallback[k] : null;
        }
        return fallback || keyPath;
      }
    }
    
    return result;
  }, [mounted, locale]);

  const value = useMemo(() => ({
    locale: mounted ? locale : 'en',
    changeLanguage,
    t,
    isLoaded: mounted,
  }), [mounted, locale, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
