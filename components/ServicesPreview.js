"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Container from './Container';
import SectionTitle from './SectionTitle';
import ServiceCard from './ServiceCard';
import ScrollReveal from './ScrollReveal';
import { services } from '@/data/dummyData';

export default function ServicesPreview() {
  const { t } = useLanguage();

  return (
    <section id="services" className="py-20 md:py-28 bg-white scroll-mt-12">
      <Container>
        <ScrollReveal>
          <SectionTitle 
            title={t('services.title')}
            subtitle="Quick access to medical support, missing person reports, lost belongings desks, and route updates during the pilgrimage."
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service) => (
            <ScrollReveal key={service.id} delay={service.id * 80}>
              <ServiceCard 
                icon={service.icon}
                titleKey={service.titleKey}
                descKey={service.descKey}
                colorClass={service.colorClass}
              />
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
