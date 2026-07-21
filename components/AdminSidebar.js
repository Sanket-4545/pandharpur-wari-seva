"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  UserX, 
  Package, 
  Users, 
  Phone, 
  Image, 
  Megaphone, 
  FileText, 
  BarChart3, 
  Settings, 
  User, 
  LogOut,
  Flame,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminSidebar({ isCollapsed, toggleCollapse, isMobileOpen, closeMobileDrawer }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const menuItems = [
    { href: "/admin", labelKey: "admin.sidebar.dashboard", icon: LayoutDashboard },
    { href: "/admin/missing-persons", labelKey: "admin.sidebar.missing_persons", icon: UserX },
    { href: "/admin/lost-found", labelKey: "admin.sidebar.lost_found", icon: Package },
    { href: "/admin/volunteers", labelKey: "admin.sidebar.volunteers", icon: Users },
    { href: "/admin/emergency-contacts", labelKey: "admin.sidebar.emergency_contacts", icon: Phone },
    { href: "/admin/gallery", labelKey: "admin.sidebar.gallery", icon: Image },
    { href: "/admin/announcements", labelKey: "admin.sidebar.announcements", icon: Megaphone },
    { href: "/admin/reports", labelKey: "admin.sidebar.reports", icon: FileText },
    { href: "/admin/analytics", labelKey: "admin.sidebar.analytics", icon: BarChart3 },
    { href: "/admin/settings", labelKey: "admin.sidebar.settings", icon: Settings },
    { href: "/admin/profile", labelKey: "admin.sidebar.profile", icon: User },
  ];

  const handleLogout = () => {
    alert("Simulating Logout action. Redirecting to home page...");
    window.location.href = "/";
  };

  const renderNavList = () => (
    <div className="flex flex-col justify-between h-full py-6 px-4">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 mb-8 select-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white shadow-saffron-glow shrink-0 animate-pulse">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in duration-200">
              <span className="font-heading text-sm font-extrabold text-secondary dark:text-white tracking-tight leading-tight">
                {t('nav.title')}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-primary leading-none mt-0.5">
                Admin Console
              </span>
            </div>
          )}
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileDrawer}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all group relative ${
                  isActive
                    ? "bg-primary text-white shadow-saffron-glow"
                    : "text-charcoal-light dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-850 hover:text-primary dark:hover:text-white"
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {!isCollapsed && (
                  <span className="truncate animate-in fade-in duration-250">
                    {t(item.labelKey)}
                  </span>
                )}
                
                {/* Tooltip for collapsed states */}
                {isCollapsed && (
                  <div className="absolute left-14 bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                    {t(item.labelKey)}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout simulation bottom */}
      <div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group relative"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          {!isCollapsed && (
            <span className="truncate animate-in fade-in duration-250">
              {t("admin.sidebar.logout")}
            </span>
          )}
          {isCollapsed && (
            <div className="absolute left-14 bg-red-650 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
              {t("admin.sidebar.logout")}
            </div>
          )}
        </button>

        {/* Collapse Toggle Trigger button - Desktop only */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex items-center justify-center w-full mt-6 py-2 border border-slate-200 dark:border-gray-800 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-850 text-slate-400 dark:text-gray-500 hover:text-charcoal dark:hover:text-white transition-all focus:outline-none"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:block bg-white dark:bg-gray-900 border-r border-slate-200/60 dark:border-gray-800 shrink-0 h-screen sticky top-0 transition-all duration-300 z-30 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {renderNavList()}
      </aside>

      {/* Mobile Drawer Slide-out Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closeMobileDrawer}
          />
          {/* Sidebar content drawer */}
          <aside className="relative bg-white dark:bg-gray-900 w-64 h-full border-r border-slate-200/60 dark:border-gray-800 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-250">
            {renderNavList()}
          </aside>
        </div>
      )}
    </>
  );
}
