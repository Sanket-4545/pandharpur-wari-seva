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
      <div className="login-page">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div className="login-accent" style={{ margin: '0 auto 16px' }} />
          <div style={{ height: 20, width: 140, background: '#eadfce', borderRadius: 6, margin: '0 auto 10px' }} />
          <div style={{ height: 12, width: 190, background: '#efe6d8', borderRadius: 6, margin: '0 auto 26px' }} />
          <div style={{ height: 52, width: '100%', background: '#efe6d8', borderRadius: 10, marginBottom: 14 }} />
          <div style={{ height: 52, width: '100%', background: '#efe6d8', borderRadius: 10, marginBottom: 18 }} />
          <div style={{ height: 52, width: '100%', background: '#e8dbc9', borderRadius: 10 }} />
        </div>
      </div>
    }>
      <SuperAdminLoginForm />
    </Suspense>
  );
}
