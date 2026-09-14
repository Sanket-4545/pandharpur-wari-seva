"use client";

import React, { useEffect, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

function getCsrfToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : null;
}

export function useAdminAuth() {
  const router = useRouter();
  const intervalRef = useRef(null);
  const redirectedRef = useRef(false);
  const [role, setRole] = useState(null);
  const [adminName, setAdminName] = useState(null);
  const [adminEmail, setAdminEmail] = useState(null);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async function patchedFetch(...args) {
      const [url, init] = args;
      const method = (init?.method || "GET").toUpperCase();
      const patchedInit = { ...init };

      if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
          const headers = new Headers(patchedInit.headers);
          if (!headers.has("X-CSRF-Token")) {
            headers.set("X-CSRF-Token", csrfToken);
          }
          patchedInit.headers = headers;
        }
      }

      return originalFetch(url, patchedInit);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const handleAuthError = useCallback(() => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    router.push("/login");
  }, [router]);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/admins/me", {
        credentials: "same-origin",
      });
      if (res.status === 401) {
        handleAuthError();
      } else if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.role) {
          setRole((prev) => (prev !== json.data.role ? json.data.role : prev));
          setAdminName((prev) => (prev !== json.data.name ? json.data.name : prev));
          setAdminEmail((prev) => (prev !== json.data.email ? json.data.email : prev));
        }
      }
    } catch {
      handleAuthError();
    }
  }, [handleAuthError]);

  useEffect(() => {
    let cancelled = false;

    async function initialCheck() {
      if (!cancelled) {
        await checkAuth();
      }
    }

    initialCheck();

    intervalRef.current = setInterval(() => {
      if (!cancelled) {
        checkAuth();
      }
    }, SESSION_CHECK_INTERVAL);

    function handleVisibilityChange() {
      if (!cancelled && document.visibilityState === "visible") {
        checkAuth();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkAuth]);

  const authFetch = useCallback(
    async (url, options = {}) => {
      const res = await fetch(url, {
        ...options,
        credentials: options.credentials ?? "same-origin",
      });

      if (res.status === 401) {
        handleAuthError();
        throw new Error("Session expired");
      }

      return res;
    },
    [handleAuthError]
  );

  return { authFetch, role, adminName, adminEmail };
}