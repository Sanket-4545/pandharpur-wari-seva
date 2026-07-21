"use client";

import React from 'react';
import Container from '@/components/Container';
import HeroBanner from '@/components/HeroBanner';
import ServiceCard from '@/components/ServiceCard';
import { services } from '@/data/dummyData';

export default function ServicesPage() {
  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <HeroBanner 
        titleKey="services_page.title" 
        subtitleKey="services_page.subtitle"
        bgImage="/images/wari_pilgrimage_hero.png"
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {services.map((service) => (
              <ServiceCard 
                key={service.id}
                icon={service.icon}
                titleKey={service.titleKey}
                descKey={service.descKey}
                colorClass={service.colorClass}
              />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
