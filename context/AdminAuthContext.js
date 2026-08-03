"use client";

import React, { createContext, useContext } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const { authFetch } = useAdminAuth();

  return (
    <AdminAuthContext.Provider value={{ authFetch }}>
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
