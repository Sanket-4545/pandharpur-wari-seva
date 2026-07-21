"use client";

import React from 'react';
import Container from '@/components/Container';
import HeroBanner from '@/components/HeroBanner';
import EmergencyCard from '@/components/EmergencyCard';
import { 
  Shield, 
  HeartPulse, 
  Flame, 
  UserCheck, 
  ShieldAlert, 
  Phone,
  Users
} from 'lucide-react';

export default function EmergencyContactsPage() {
  const contacts = [
    {
      icon: Shield,
      titleKey: 'emergency_page.contacts.police.title',
      descKey: 'emergency_page.contacts.police.desc',
      phoneNumber: '112 / 100',
      colorClass: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300'
    },
    {
      icon: HeartPulse,
      titleKey: 'emergency_page.contacts.ambulance.title',
      descKey: 'emergency_page.contacts.ambulance.desc',
      phoneNumber: '108 / 102',
      colorClass: 'bg-red-50 text-red-600 border-red-100 hover:border-red-300'
    },
    {
      icon: HeartPulse,
      titleKey: 'emergency_page.contacts.medical.title',
      descKey: 'emergency_page.contacts.medical.desc',
      phoneNumber: '+91 98765 43210',
      colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300'
    },
    {
      icon: Flame,
      titleKey: 'emergency_page.contacts.fire.title',
      descKey: 'emergency_page.contacts.fire.desc',
      phoneNumber: '101',
      colorClass: 'bg-orange-50 text-orange-600 border-orange-100 hover:border-orange-300'
    },
    {
      icon: UserCheck,
      titleKey: 'emergency_page.contacts.nss.title',
      descKey: 'emergency_page.contacts.nss.desc',
      phoneNumber: '+91 22 2202 4444',
      colorClass: 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300'
    },
    {
      icon: ShieldAlert,
      titleKey: 'emergency_page.contacts.women.title',
      descKey: 'emergency_page.contacts.women.desc',
      phoneNumber: '1091',
      colorClass: 'bg-pink-50 text-pink-600 border-pink-100 hover:border-pink-300'
    },
    {
      icon: Users,
      titleKey: 'emergency_page.contacts.child.title',
      descKey: 'emergency_page.contacts.child.desc',
      phoneNumber: '1098',
      colorClass: 'bg-teal-50 text-teal-600 border-teal-100 hover:border-teal-300'
    },
    {
      icon: Phone,
      titleKey: 'emergency_page.contacts.control.title',
      descKey: 'emergency_page.contacts.control.desc',
      phoneNumber: '02186-223132',
      colorClass: 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-350'
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <HeroBanner 
        titleKey="emergency_page.title" 
        subtitleKey="emergency_page.subtitle"
        bgImage="/images/wari_pilgrimage_hero.png"
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contacts.map((contact, index) => (
              <EmergencyCard 
                key={index}
                icon={contact.icon}
                titleKey={contact.titleKey}
                descKey={contact.descKey}
                phoneNumber={contact.phoneNumber}
                colorClass={contact.colorClass}
              />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
