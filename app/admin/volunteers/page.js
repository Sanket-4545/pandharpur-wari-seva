"use client";

import React, { useState } from 'react';
import { volunteersList as initialVolunteers, shifts, skills as allSkills, languages as allLanguages } from '@/data/volunteers';
import { useLanguage } from '@/context/LanguageContext';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { AlertCircle, Plus, Eye, Trash2, Calendar, Phone, CheckCircle, XCircle } from 'lucide-react';

export default function VolunteersAdmin() {
  const { t } = useLanguage();
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  
  // Dialog/Modal states
  const [viewingRow, setViewingRow] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Table Columns config
  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name", sortable: true },
    { key: "college", label: "College", sortable: true },
    { key: "nssUnit", label: "NSS Unit" },
    { 
      key: "shift", 
      label: "Shift",
      render: (row) => {
        const shiftObj = shifts.find(s => s.value === row.shift);
        return shiftObj ? t(shiftObj.labelKey).split(' ')[0] : row.shift;
      }
    },
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
      setVolunteers(volunteers.filter(v => v.id !== deletingId));
      setDeletingId(null);
    }
  };

  const updateStatus = (id, newStatus) => {
    setVolunteers(volunteers.map(v => v.id === id ? { ...v, status: newStatus } : v));
    if (viewingRow && viewingRow.id === id) {
      setViewingRow({ ...viewingRow, status: newStatus });
    }
    alert(`Volunteer status marked as ${newStatus.toUpperCase()} locally.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white">
            {t("admin.sidebar.volunteers")} Cohort
          </h1>
          <p className="text-xs text-charcoal-light dark:text-gray-450 mt-1">
            Review registration requests. Approve and allocate volunteers to camps and shift durations.
          </p>
        </div>
        
        <button
          onClick={() => alert("Creating a new volunteer record is a simulation. Use the registration portal to register.")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-bold transition-all shadow-saffron-glow focus:outline-none self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Volunteer
        </button>
      </div>

      {/* Main Table */}
      <DataTable 
        columns={columns}
        data={volunteers}
        searchPlaceholderKey="admin.common.search"
        onViewRow={handleView}
        onDeleteRow={handleDeleteTrigger}
        exportFilename="volunteers-list.csv"
      />

      {/* View Volunteer Details Modal */}
      {viewingRow && (
        <Modal 
          isOpen={!!viewingRow} 
          onClose={() => setViewingRow(null)}
          title={`Volunteer Application: ${viewingRow.name}`}
        >
          <div className="space-y-4">
            
            {/* Visual avatar badge placeholder */}
            <div className="w-full h-24 rounded-2xl bg-gradient-to-tr from-secondary to-blue-800 flex items-center justify-between px-6 text-white relative shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-heading text-lg font-bold">
                  {viewingRow.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-sm">{viewingRow.name}</h4>
                  <p className="text-[10px] text-blue-100">{viewingRow.email}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${
                viewingRow.status === 'approved' 
                  ? 'bg-emerald-50 text-emerald-650 border-emerald-200' 
                  : viewingRow.status === 'pending'
                  ? 'bg-amber-50 text-amber-650 border-amber-200'
                  : 'bg-red-50 text-red-650 border-red-200'
              }`}>
                {viewingRow.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">College Name</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block leading-normal">
                  {viewingRow.college}
                </span>
              </div>
              
              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">Contact Details</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">
                  Ph: {viewingRow.phone} <br />
                  Age: {viewingRow.age} yrs, {viewingRow.gender}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl col-span-2">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">Skills & Competences</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {viewingRow.skills.map(sk => {
                    const skObj = allSkills.find(s => s.value === sk);
                    return (
                      <span key={sk} className="bg-slate-200 dark:bg-gray-700 text-charcoal dark:text-gray-300 px-2 py-0.5 rounded text-[10px] font-bold">
                        {skObj ? t(skObj.labelKey) : sk}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">Shift & Location</span>
                <span className="font-bold text-charcoal dark:text-white mt-1 block">
                  Shift: {viewingRow.shift.toUpperCase()} <br />
                  Blood Group: {viewingRow.bloodGroup}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-gray-850 rounded-xl">
                <span className="text-slate-400 dark:text-gray-500 font-bold block text-[10px] uppercase">Emergency Contact</span>
                <span className="font-bold text-red-650 dark:text-red-400 mt-1 block flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {viewingRow.emergencyPhone}
                </span>
              </div>

              {/* Status Update CTA buttons */}
              {viewingRow.status === 'pending' && (
                <div className="col-span-2 border-t border-slate-100 dark:border-gray-800 pt-4 mt-2 flex justify-end gap-3">
                  <button
                    onClick={() => updateStatus(viewingRow.id, "rejected")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => updateStatus(viewingRow.id, "approved")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              )}

            </div>

          </div>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Volunteer"
        messageKey="admin.common.confirm"
      />

    </div>
  );
}
