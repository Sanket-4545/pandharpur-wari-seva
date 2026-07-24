"use client";

import React, { useState, useEffect } from 'react';
import Container from '@/components/Container';
import HeroBanner from '@/components/HeroBanner';
import EmergencyCard from '@/components/EmergencyCard';

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-6.5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-gray-700 animate-pulse mb-5" />
          <div className="h-5 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mb-3" />
          <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-full" />
        </div>
      ))}
    </div>
  );
}

export default function EmergencyContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch('/api/emergency-contacts');
        if (!res.ok) throw new Error('Failed to load emergency contacts');
        const json = await res.json();
        if (json.success && json.data?.items) {
          setContacts(json.data.items);
        } else {
          setContacts([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <HeroBanner 
        titleKey="emergency_page.title" 
        subtitleKey="emergency_page.subtitle"
        bgImage="/images/wari_pilgrimage_hero.png"
      />

      <section className="py-16 md:py-24">
        <Container>
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <p className="text-sm text-charcoal-light dark:text-gray-400 mt-2">Please try refreshing the page.</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-charcoal-light dark:text-gray-400">No emergency contacts available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {contacts.map((contact) => (
                <EmergencyCard
                  key={contact.contactId}
                  iconName={contact.iconName}
                  titleKey={contact.titleKey}
                  descKey={contact.descKey}
                  phoneNumber={contact.phoneNumber}
                  colorClass={contact.colorClass}
                />
              ))}
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
