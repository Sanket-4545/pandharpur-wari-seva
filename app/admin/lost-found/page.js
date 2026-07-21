"use client";

import React, { useState } from 'react';
import { lostItems as initialItems } from '@/data/lostItems';
import { useLanguage } from '@/context/LanguageContext';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { AlertCircle, Plus, Eye, Trash2, Calendar, ShieldCheck, MapPin, Tag } from 'lucide-react';

export default function LostFoundAdmin() {
  const { t } = useLanguage();
  const [items, setItems] = useState(initialItems);
  
  // Dialog/Modal states
  const [viewingRow, setViewingRow] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Table Columns config
  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Item Name", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { 
      key: "locationKey", 
      label: "Report Location",
      render: (row) => t(row.locationKey)
    },
    { key: "date", label: "Date Reported", sortable: true },
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
      setItems(items.filter(i => i.id !== deletingId));
      setDeletingId(null);
    }
  };

  const handleMarkClaimed = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, status: "Claimed" } : item));
    if (viewingRow && viewingRow.id === id) {
      setViewingRow({ ...viewingRow, status: "Claimed" });
    }
    alert("Item marked as Claimed and verified locally.");
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t("admin.sidebar.lost_found")} Management
          </h1>
          <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
            Track and catalog pilgrim belongings. Validate identity proof files upon claim request handovers.
          </p>
        </div>
        
        <button
          onClick={() => alert("Reporting an item is a simulation. Integrates with API controllers in Phase 5.")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-bold transition-all shadow-saffron-glow focus:outline-none self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Catalog Item
        </button>
      </div>

      {/* Main Table */}
      <DataTable 
        columns={columns}
        data={items}
        searchPlaceholderKey="admin.common.search"
        onViewRow={handleView}
        onDeleteRow={handleDeleteTrigger}
        exportFilename="lost-found-registry.csv"
      />

      {/* View Item Details Modal */}
      {viewingRow && (
        <Modal 
          isOpen={!!viewingRow} 
          onClose={() => setViewingRow(null)}
          title={`Inventory Log: ${viewingRow.name}`}
        >
          <div className="space-y-4">
            
            {/* Visual avatar badge placeholder */}
            <div className={`w-full h-32 rounded-2xl bg-gradient-to-tr ${viewingRow.bgGradient || 'from-amber-500 to-orange-500'} flex items-center justify-center text-white relative shadow-sm`}>
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
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Category Type</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  {viewingRow.category}
                </span>
              </div>
              
              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Current Status</span>
                <span className="mt-1 block">
                  <span className={`inline-flex px-2 py-0.5 rounded-md font-bold text-[10px] border shadow-sm ${
                    viewingRow.status.toLowerCase() === 'found' 
                      ? 'bg-emerald-50 text-emerald-650 border-emerald-250' 
                      : viewingRow.status.toLowerCase() === 'lost'
                      ? 'bg-amber-50 text-amber-650 border-amber-200'
                      : 'bg-blue-50 text-blue-650 border-blue-200'
                  }`}>
                    {viewingRow.status}
                  </span>
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Location Coordinate</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {t(viewingRow.locationKey)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Log Description Details</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block leading-relaxed font-sans">
                  {viewingRow.description || "No details provided."}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase tracking-wide">Claim Support Center Desk</span>
                  <span className="font-bold text-charcoal dark:text-white mt-0.5 block">
                    {viewingRow.contact}
                  </span>
                </div>
                {viewingRow.status.toLowerCase() === 'found' && (
                  <button
                    onClick={() => handleMarkClaimed(viewingRow.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-[11px]"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Mark Claimed
                  </button>
                )}
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
        title="Delete Item Entry"
        messageKey="admin.common.confirm"
      />

    </div>
  );
}
