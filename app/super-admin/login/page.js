"use client";

import React, { Suspense } from 'react';
import { Users } from 'lucide-react';
import AdminLoginForm from '@/components/AdminLoginForm';

function SuperAdminLoginForm() {
  return (
    <AdminLoginForm
      purpose="super_admin"
      titleKey="login.super_admin_login_title"
      subtitleKey="login.super_admin_login_subtitle"
      footerLinks={[
        { href: '/login', labelKey: 'login.portal_link' },
        { href: '/sub-admin/login', labelKey: 'login.sub_admin_login_title', icon: Users },
        { href: '/volunteer/login', labelKey: 'login.volunteer_login_link' },
      ]}
    />
  );
}

export default function SuperAdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <SuperAdminLoginForm />
    </Suspense>
  );
}
