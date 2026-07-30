"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { navLinks } from '@/data/dummyData';
import Link from 'next/link';
import Container from './Container';
import LanguageSwitcher from './LanguageSwitcher';
import { Flame, Phone, ShieldAlert, HeartPulse, Mail } from 'lucide-react';

const ICON_MAP = {
  Phone,
  ShieldAlert,
  HeartPulse,
  Mail,
};

const FALLBACK_CONTACTS = [
  { labelKey: "footer.police", value: "100 / 112", icon: ShieldAlert },
  { labelKey: "footer.medical", value: "108 / 102", icon: HeartPulse },
  { labelKey: "footer.nss_office", value: "+91 22 2202 4444", icon: Phone },
  { labelKey: "footer.email", value: "nss-seva@wariportal.org", icon: Mail },
];

export default function Footer() {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState(FALLBACK_CONTACTS);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch('/api/emergency-contacts?limit=4');
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        if (json.success && json.data?.items && json.data.items.length > 0) {
          const mapped = json.data.items.map(c => ({
            labelKey: c.titleKey || "footer.nss_office",
            value: c.phoneNumber || c.value || "N/A",
            icon: ICON_MAP[c.iconName] || Phone,
          }));
          setContacts(mapped);
        }
      } catch {
        // keep fallback
      }
    }
    fetchContacts();
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800/80 pt-16 pb-8">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 group focus:outline-none">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white shadow-saffron-glow">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <span className="font-heading text-lg font-extrabold text-white tracking-tight">
                {t('nav.title')}
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('footer.desc')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-sm uppercase tracking-wider font-extrabold text-white mb-5">
              {t('footer.quick_links')}
            </h3>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-primary transition-colors duration-200">
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency & Support Contacts */}
          <div className="lg:col-span-2">
            <h3 className="font-heading text-sm uppercase tracking-wider font-extrabold text-white mb-5">
              {t('footer.emergency_contacts')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contacts.map((contact, index) => {
                const IconComponent = contact.icon;
                return (
                  <div key={index} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-800/30 border border-slate-800 hover:border-slate-700/80 transition-colors duration-300">
                    <div className="p-2.5 rounded-xl bg-slate-800 text-primary">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {t(contact.labelKey)}
                      </span>
                      <span className="text-sm font-semibold text-white mt-0.5 select-all">
                        {contact.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-850 pt-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            {t('footer.copyright')}
          </p>
          <LanguageSwitcher variant="dark" />
        </div>
      </Container>
    </footer>
  );
}
