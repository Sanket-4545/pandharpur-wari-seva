"use client";

import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import StatusBadge from '@/components/StatusBadge';
import ActionMenu from './ActionMenu';
import EmptyState from './EmptyState';

export default function DataTable({ 
  columns = [], 
  data = [], 
  searchPlaceholderKey = "admin.common.search",
  onViewRow, 
  onDeleteRow,
  exportFilename = "export.csv"
}) {
  const { t } = useLanguage();
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Sort State
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Multi Selection State
  const [selectedRows, setSelectedRows] = useState(new Set());
  
  // Toast notice simulator
  const [toastMessage, setToastMessage] = useState("");

  // Extract unique statuses for filter dropdown
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(data.map(item => item.status?.toLowerCase()).filter(Boolean));
    return Array.from(statuses);
  }, [data]);

  // Handle Select All
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredSortedData.map(item => item.id);
      setSelectedRows(new Set(allIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  // Handle Single Checkbox
  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  // Sort handler
  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Reset all filters helper
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // 1. Search text match across name, description, location, id
      const matchesSearch = searchTerm === "" || 
        [item.id, item.name, item.location, item.itemName, item.category]
          .some(val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase()));
          
      // 2. Status match
      const matchesStatus = statusFilter === "all" || 
        (item.status && item.status.toLowerCase() === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  // Sort Logic
  const filteredSortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aVal = a[sortColumn] || "";
      let bVal = b[sortColumn] || "";

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Pagination Logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredSortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredSortedData, currentPage, rowsPerPage]);

  const totalPages = Math.max(Math.ceil(filteredSortedData.length / rowsPerPage), 1);

  // CSV Export Simulator
  const handleExport = () => {
    setToastMessage("csv");
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Bulk Delete Simulator
  const handleBulkDelete = () => {
    if (onDeleteRow) {
      selectedRows.forEach(id => onDeleteRow(id));
      setSelectedRows(new Set());
      setToastMessage("bulk_deleted");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-5 shadow-premium">
      
      {/* Toast simulated block */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-250">
          <span>
            {toastMessage === "csv" 
              ? `${t("admin.reports.toast_pdf").replace("PDF", "CSV")} (${exportFilename})` 
              : "Selected entries deleted locally successfully."}
          </span>
        </div>
      )}

      {/* Control bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t(searchPlaceholderKey)}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 dark:bg-gray-850 pl-10.5 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-gray-800 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all dark:text-white"
          />
        </div>

        {/* Filter & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Dropdown */}
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-gray-900 pl-9 pr-8 py-2.5 rounded-2xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-charcoal dark:text-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">{t("admin.common.all")}</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-gray-850 hover:bg-slate-100 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800 rounded-2xl text-xs font-bold text-charcoal dark:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <Download className="w-3.5 h-3.5" />
            {t("admin.common.export")}
          </button>

          {/* Bulk delete action trigger */}
          {selectedRows.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-650 rounded-2xl text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 dark:bg-red-950/20 dark:hover:bg-red-900/30 dark:border-red-900/30 dark:text-red-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected ({selectedRows.size})
            </button>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto -mx-5">
        <div className="inline-block min-w-full align-middle px-5">
          <div className="overflow-hidden border border-slate-100 dark:border-gray-800 rounded-2xl">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-gray-850">
              <thead className="bg-slate-50/70 dark:bg-gray-950/20">
                <tr>
                  <th scope="col" className="relative px-4 sm:px-6 py-3.5 text-left w-12">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={filteredSortedData.length > 0 && selectedRows.size === filteredSortedData.length}
                      className="rounded border-slate-300 dark:border-gray-700 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                      className={`px-4 sm:px-6 py-3.5 text-left text-xs font-extrabold text-charcoal-light dark:text-gray-400 tracking-wider uppercase ${
                        col.sortable !== false ? 'cursor-pointer select-none hover:text-charcoal dark:hover:text-white' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {col.label}
                        {sortColumn === col.key && (
                          sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </th>
                  ))}
                  <th scope="col" className="relative px-6 py-3.5 text-right w-16">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-850 bg-white dark:bg-gray-900">
                {paginatedData.length > 0 ? (
                  paginatedData.map((row) => {
                    const isSelected = selectedRows.has(row.id);
                    return (
                      <tr
                        key={row.id}
                        className={`hover:bg-slate-50/45 dark:hover:bg-gray-850/40 transition-colors ${
                          isSelected ? 'bg-primary/5 dark:bg-primary-dark/5' : ''
                        }`}
                      >
                        <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(row.id)}
                            className="rounded border-slate-300 dark:border-gray-700 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          />
                        </td>
                        {columns.map((col) => {
                          const val = row[col.key];
                          return (
                            <td 
                              key={col.key} 
                              className="px-4 sm:px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-700 dark:text-gray-300"
                            >
                              {col.key === 'status' ? (
                                <StatusBadge status={val} />
                              ) : col.render ? (
                                col.render(row)
                              ) : (
                                val || '-'
                              )}
                            </td>
                          );
                        })}
                        <td className="px-6 py-3.5 whitespace-nowrap text-right text-xs">
                          <ActionMenu
                            onView={onViewRow ? () => onViewRow(row) : null}
                            onDelete={onDeleteRow ? () => onDeleteRow(row.id) : null}
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={columns.length + 2} className="px-6 py-12">
                      <EmptyState onReset={handleResetFilters} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination controls */}
      {filteredSortedData.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-gray-850 mt-6 pt-4.5 text-xs font-semibold text-slate-500 dark:text-gray-400">
          <div className="hidden sm:block">
            Showing <span className="font-extrabold text-charcoal dark:text-white">{(currentPage - 1) * rowsPerPage + 1}</span> to{' '}
            <span className="font-extrabold text-charcoal dark:text-white">
              {Math.min(currentPage * rowsPerPage, filteredSortedData.length)}
            </span>{' '}
            of <span className="font-extrabold text-charcoal dark:text-white">{filteredSortedData.length}</span> entries
          </div>

          <div className="flex items-center gap-4.5 justify-between w-full sm:w-auto">
            {/* Rows selector */}
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-55 dark:bg-gray-850 border border-slate-200 dark:border-gray-800 rounded-lg px-2.5 py-1 font-bold text-charcoal dark:text-white"
              >
                {[5, 10, 25, 50].map(sz => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 dark:border-gray-800 rounded-xl bg-white hover:bg-slate-50 dark:bg-transparent dark:hover:bg-gray-850 text-charcoal dark:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1 font-bold">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pg = idx + 1;
                  return (
                    <button
                      key={pg}
                      onClick={() => setCurrentPage(pg)}
                      className={`px-3 py-1.5 rounded-xl transition-all ${
                        currentPage === pg
                          ? 'bg-primary text-white'
                          : 'hover:bg-slate-100 dark:hover:bg-gray-800 text-charcoal dark:text-white'
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 dark:border-gray-800 rounded-xl bg-white hover:bg-slate-50 dark:bg-transparent dark:hover:bg-gray-850 text-charcoal dark:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
