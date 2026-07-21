"use client";

import React from 'react';
import Container from '@/components/Container';
import HeroBanner from '@/components/HeroBanner';
import FAQAccordion from '@/components/FAQAccordion';

export default function FAQPage() {
  const faqItems = [
    { questionKey: 'faq_page.q1', answerKey: 'faq_page.a1' },
    { questionKey: 'faq_page.q2', answerKey: 'faq_page.a2' },
    { questionKey: 'faq_page.q3', answerKey: 'faq_page.a3' },
    { questionKey: 'faq_page.q4', answerKey: 'faq_page.a4' },
    { questionKey: 'faq_page.q5', answerKey: 'faq_page.a5' },
    { questionKey: 'faq_page.q6', answerKey: 'faq_page.a6' }
  ];

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <HeroBanner 
        titleKey="faq_page.title" 
        subtitleKey="faq_page.subtitle"
        bgImage="/images/wari_pilgrimage_hero.png"
      />

      <section className="py-16 md:py-24">
        <Container>
          <FAQAccordion items={faqItems} />
        </Container>
      </section>
    </div>
  );
}
