"use client";

import React, { useState } from 'react';
import { emergencyContacts as initialContacts } from '@/data/dummyData';
import { useLanguage } from '@/context/LanguageContext';
import { Plus, Phone, Trash2, ShieldAlert } from 'lucide-react';

export default function EmergencyContactsAdmin() {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState(initialContacts);

  const handleDelete = (index) => {
    if (confirm("Are you sure you want to delete this contact? (Simulation only)")) {
      setContacts(contacts.filter((_, i) => i !== index));
    }
  };

  const handleCreate = () => {
    const label = prompt("Enter contact label (e.g. Camp #5 coordinator):");
    const num = prompt("Enter phone number:");
    if (label && num) {
      setContacts([
        ...contacts,
        {
          labelKey: null,
          labelText: label,
          value: num,
          icon: ShieldAlert
        }
      ]);
      alert("Emergency contact added locally successfully.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t("admin.sidebar.emergency_contacts")} Configuration
          </h1>
          <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
            Helplines and support cell links. These listings are populated directly on the public footer.
          </p>
        </div>
        
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-bold transition-all shadow-saffron-glow focus:outline-none self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Helpline
        </button>
      </div>

      {/* Grid of contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {contacts.map((contact, idx) => {
          const Icon = contact.icon || ShieldAlert;
          return (
            <div key={idx} className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400 flex items-center justify-center border border-red-100 dark:border-red-900/10 shrink-0">
                  <Icon className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider block">
                    {contact.labelKey ? t(contact.labelKey) : contact.labelText}
                  </span>
                  <span className="font-heading text-sm font-extrabold text-charcoal dark:text-white mt-0.5 block flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    {contact.value}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(idx)}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-all focus:outline-none"
                aria-label="Delete contact"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
