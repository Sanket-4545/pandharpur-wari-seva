import React from 'react';
import Hero from '@/components/Hero';
import AboutPreview from '@/components/AboutPreview';
import ServicesPreview from '@/components/ServicesPreview';
import CallToAction from '@/components/CallToAction';

export const metadata = {
  title: 'Pandharpur Wari NSS Seva Portal',
  description: 'Dedicated Seva to Warkaris at Pandharpur Wari. NSS volunteers supporting pilgrims, healthcare teams, and emergency services throughout the holy pilgrimage route.',
  openGraph: {
    title: 'Pandharpur Wari NSS Seva Portal',
    description: 'Dedicated Seva to Warkaris at Pandharpur Wari. NSS volunteers supporting pilgrims, healthcare teams, and emergency services throughout the holy pilgrimage route.',
    url: '/',
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <AboutPreview />
      <ServicesPreview />
      <CallToAction />
    </>
  );
}
