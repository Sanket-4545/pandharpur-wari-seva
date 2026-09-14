"use client";

import React, { createContext, useContext } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const { authFetch, role, adminName, adminEmail } = useAdminAuth();

  return (
    <AdminAuthContext.Provider value={{ authFetch, role, isSuperAdmin: role === "super_admin", adminName, adminEmail }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAuthFetch() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAuthFetch must be used within AdminAuthProvider");
  }
  return context.authFetch;
}

export function useRole() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useRole must be used within AdminAuthProvider");
  }
  return context.role;
}

export function useAdminIdentity() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminIdentity must be used within AdminAuthProvider");
  }
  return { name: context.adminName, email: context.adminEmail, role: context.role };
}