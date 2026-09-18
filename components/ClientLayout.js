"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NavigationProgress from '@/components/NavigationProgress';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isLoginPage = pathname === '/login' || pathname === '/volunteer/login' || pathname === '/sub-admin/login' || pathname === '/super-admin/login';

  return (
    <>
      <NavigationProgress />
      {!isAdmin && !isLoginPage && <Navbar />}
      <main className={isLoginPage ? '' : 'flex-grow'}>{children}</main>
      {!isAdmin && !isLoginPage && <Footer />}
    </>
  );
}
