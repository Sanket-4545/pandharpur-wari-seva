"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Toast from "@/components/Toast";

const DEACTIVATION_MESSAGE =
  "Your account has been deactivated. Please contact the administrator.";

export default function VolunteerAuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [toast, setToast] = useState({
    message: "",
    type: "error",
    visible: false,
  });
  const handledRef = useRef(false);
  const originalFetchRef = useRef(null);

  const handleDeactivation = useCallback(async () => {
    if (handledRef.current) return;
    handledRef.current = true;
    try {
      await fetch("/api/auth/volunteer/logout", { method: "POST" });
    } catch {}
    setToast({ message: DEACTIVATION_MESSAGE, type: "error", visible: true });
    setTimeout(() => {
      router.push("/volunteer/login");
    }, 1500);
  }, [router]);

  useEffect(() => {
    const originalFetch = window.fetch;
    originalFetchRef.current = originalFetch;

    window.fetch = async function patchedFetch(...args) {
      const response = await originalFetch.apply(this, args);

      if (response.status === 403 && !handledRef.current) {
        const url = typeof args[0] === "string" ? args[0] : args[0]?.url;
        if (url && url.includes("/api/volunteer/")) {
          try {
            const clone = response.clone();
            const json = await clone.json();
            if (json.code === "VOLUNTEER_DEACTIVATED") {
              handleDeactivation();
            }
          } catch {}
        }
      }

      return response;
    };

    return () => {
      if (originalFetchRef.current) {
        window.fetch = originalFetchRef.current;
      }
    };
  }, [handleDeactivation]);

  useEffect(() => {
    handledRef.current = false;
  }, [pathname]);

  return (
    <>
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
        duration={5000}
      />
    </>
  );
}
