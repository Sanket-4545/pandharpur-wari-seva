"use client";

import React, { useState } from 'react';
import { missingPersons as initialPersons } from '@/data/missingPersons';
import { useLanguage } from '@/context/LanguageContext';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { AlertCircle, Plus, Eye, Trash2, Calendar, Phone, MapPin } from 'lucide-react';

export default function MissingPersonsAdmin() {
  const { t } = useLanguage();
  const [persons, setPersons] = useState(initialPersons);
  
  // Dialog/Modal states
  const [viewingRow, setViewingRow] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Table Columns config
  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name", sortable: true },
    { 
      key: "category", 
      label: "Category / Age",
      render: (row) => `${row.category} (${row.age} yrs)` 
    },
    { 
      key: "lastSeenKey", 
      label: "Last Seen Location",
      render: (row) => t(row.lastSeenKey)
    },
    { key: "date", label: "Reported Date", sortable: true },
    { key: "status", label: "Status" }
  ];

  // Actions
  const handleView = (row) => {
    setViewingRow(row);
  };

  const handleDeleteTrigger = (id) => {
    setDeletingId(id);
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
      setPersons(persons.filter(p => p.id !== deletingId));
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t("admin.sidebar.missing_persons")} Management
          </h1>
          <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
            Reunite walking warkaris. Update resolution tags once they are found and verified.
          </p>
        </div>
        
        <button
          onClick={() => alert("Creating a new missing person record is a simulation. Integrates with back-end APIs in Phase 5.")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-bold transition-all shadow-saffron-glow focus:outline-none self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Missing Case
        </button>
      </div>

      {/* Main Table */}
      <DataTable 
        columns={columns}
        data={persons}
        searchPlaceholderKey="admin.common.search"
        onViewRow={handleView}
        onDeleteRow={handleDeleteTrigger}
        exportFilename="missing-persons-report.csv"
      />

      {/* View Case Details Modal */}
      {viewingRow && (
        <Modal 
          isOpen={!!viewingRow} 
          onClose={() => setViewingRow(null)}
          title={`Case Details: ${viewingRow.name}`}
        >
          <div className="space-y-4">
            
            {/* Visual avatar badge placeholder */}
            <div className={`w-full h-32 rounded-2xl bg-gradient-to-tr ${viewingRow.bgGradient || 'from-primary to-orange-500'} flex items-center justify-center text-white relative shadow-sm`}>
              <div className="flex flex-col items-center">
                <span className="font-heading text-2xl font-extrabold select-none">
                  {viewingRow.name.charAt(0)}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-white/25 border border-white/10 px-2 py-0.5 rounded-lg mt-1">
                  {viewingRow.category}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Age & Gender</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">
                  {viewingRow.age} Years, {viewingRow.gender}
                </span>
              </div>
              
              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Status</span>
                <span className="mt-1 block">
                  <span className={`inline-flex px-2 py-0.5 rounded-md font-bold text-[10px] border shadow-sm ${
                    viewingRow.status.toLowerCase() === 'missing' 
                      ? 'bg-red-50 text-red-650 border-red-200' 
                      : 'bg-emerald-50 text-emerald-650 border-emerald-250'
                  }`}>
                    {viewingRow.status}
                  </span>
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Last Seen Location</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {t(viewingRow.lastSeenKey)} (at {viewingRow.time})
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Clothing Description</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block leading-relaxed">
                  {viewingRow.clothing || "No details provided."}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Emergency Notice Notes</span>
                <span className="font-bold text-red-650 dark:text-red-400 mt-1 block flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{viewingRow.emergencyNotice || "N/A"}</span>
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Contact Family</span>
                  <span className="font-bold text-charcoal dark:text-white mt-0.5 block flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    {viewingRow.contact}
                  </span>
                </div>
                <button
                  onClick={() => alert(`Simulating dialing contact: ${viewingRow.contact}`)}
                  className="px-3.5 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 dark:border-primary-light/20 rounded-xl font-bold transition-all text-[11px]"
                >
                  Call Now
                </button>
              </div>

            </div>

          </div>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Case Entry"
        messageKey="admin.common.confirm"
      />

    </div>
  );
}
