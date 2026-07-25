"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Container from './Container';
import SectionTitle from './SectionTitle';
import ServiceCard from './ServiceCard';
import ScrollReveal from './ScrollReveal';

export default function ServicesPreview() {
  const { t } = useLanguage();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/services?limit=10');
        if (!res.ok) throw new Error('Failed to load services');
        const json = await res.json();
        if (json.success && json.data?.items) {
          setServices(json.data.items);
        } else {
          setServices([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  return (
    <section id="services" className="py-20 md:py-28 bg-white scroll-mt-12">
      <Container>
        <ScrollReveal>
          <SectionTitle 
            title={t('services.title')}
            subtitle="Quick access to medical support, missing person reports, lost belongings desks, and route updates during the pilgrimage."
          />
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6.5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="w-13 h-13 rounded-2xl bg-slate-200 dark:bg-gray-700 animate-pulse mb-5.5" />
                <div className="h-5 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mb-3" />
                <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <p className="text-sm text-charcoal-light dark:text-gray-400 mt-2">Please try refreshing the page.</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-charcoal-light dark:text-gray-400">No services available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {services.map((service, index) => (
              <ScrollReveal key={service.serviceId || service._id || index} delay={index * 80}>
                <ServiceCard
                  iconName={service.iconName}
                  titleKey={service.titleKey}
                  descKey={service.descriptionKey}
                  colorClass={service.colorClass}
                />
              </ScrollReveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
