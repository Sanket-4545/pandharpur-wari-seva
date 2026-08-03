"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

export function useAdminAuth() {
  const router = useRouter();
  const intervalRef = useRef(null);
  const redirectedRef = useRef(false);

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

  return { authFetch };
}
