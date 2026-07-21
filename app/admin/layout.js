"use client";

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminTopbar from '@/components/AdminTopbar';

export default function AdminLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Mount logic for localStorage theme caching
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin_dark_mode');
    if (savedTheme === 'true') {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem('admin_dark_mode', nextDark.toString());
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-gray-950 font-sans text-charcoal dark:text-gray-100 transition-colors duration-300">
        
        {/* Responsive Sidebar */}
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobileOpen={mobileSidebarOpen}
          closeMobileDrawer={() => setMobileSidebarOpen(false)}
        />

        {/* Outer content container */}
        <div className="flex flex-col flex-grow min-h-screen min-w-0">
          
          {/* Topbar navigation */}
          <AdminTopbar 
            toggleMobileOpen={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
            isDarkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />

          {/* Core Content Area */}
          <main className="flex-grow p-4 sm:p-6.5 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}
