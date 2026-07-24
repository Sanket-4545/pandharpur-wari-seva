"use client";

import React, { useState, useEffect } from 'react';
import Container from '@/components/Container';
import HeroBanner from '@/components/HeroBanner';
import FAQAccordion from '@/components/FAQAccordion';

function LoadingSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="border rounded-2xl bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800">
          <div className="px-6 py-5">
            <div className="h-5 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FAQPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFAQ() {
      try {
        const res = await fetch('/api/faq');
        if (!res.ok) throw new Error('Failed to load FAQs');
        const json = await res.json();
        if (json.success && json.data?.items) {
          setItems(json.data.items);
        } else {
          setItems([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFAQ();
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <HeroBanner 
        titleKey="faq_page.title" 
        subtitleKey="faq_page.subtitle"
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
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-charcoal-light dark:text-gray-400">No FAQs available at the moment.</p>
            </div>
          ) : (
            <FAQAccordion items={items} />
          )}
        </Container>
      </section>
    </div>
  );
}
