"use client";

import React, { Suspense } from 'react';
import { Shield } from 'lucide-react';
import AdminLoginForm from '@/components/AdminLoginForm';

function SubAdminLoginForm() {
  return (
    <AdminLoginForm
      purpose="sub_admin"
      titleKey="login.sub_admin_login_title"
      subtitleKey="login.sub_admin_login_subtitle"
      footerLinks={[
        { href: '/login', labelKey: 'login.portal_link' },
        { href: '/super-admin/login', labelKey: 'login.super_admin_login_title', icon: Shield },
        { href: '/volunteer/login', labelKey: 'login.volunteer_login_link' },
      ]}
    />
  );
}

export default function SubAdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <SubAdminLoginForm />
    </Suspense>
  );
}
