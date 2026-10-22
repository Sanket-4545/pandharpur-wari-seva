"use client";

import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

const POLL_INTERVAL = 12000;

const NotificationContext = createContext(null);

export function useVolunteerHelpRequestNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      pendingCount: 0,
      newRequestIds: [],
      dismissAlert: () => {},
      dismissAll: () => {},
      hasNewRequests: false,
    };
  }
  return ctx;
}

function getCsrfToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : null;
}

async function registerPushSubscription() {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;

    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey,
    });

    const csrfToken = getCsrfToken();
    const headers = { "Content-Type": "application/json" };
    if (csrfToken) headers["X-CSRF-Token"] = csrfToken;

    await fetch("/api/volunteer/push-subscription", {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.toJSON().keys.p256dh,
          auth: subscription.toJSON().keys.auth,
        },
      }),
    });
  } catch (err) {
    // Gracefully handle browsers without push support or permission issues
    console.warn("[push] Registration failed:", err?.message);
  }
}

export async function unregisterPushSubscription() {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const existingSubscription = await registration.pushManager.getSubscription();

    if (existingSubscription) {
      const endpoint = existingSubscription.endpoint;
      await existingSubscription.unsubscribe();

      const csrfToken = getCsrfToken();
      const headers = { "Content-Type": "application/json" };
      if (csrfToken) headers["X-CSRF-Token"] = csrfToken;

      await fetch("/api/volunteer/push-subscription", {
        method: "DELETE",
        headers,
        credentials: "include",
        body: JSON.stringify({ endpoint }),
      });
    } else {
      const csrfToken = getCsrfToken();
      const headers = { "Content-Type": "application/json" };
      if (csrfToken) headers["X-CSRF-Token"] = csrfToken;

      await fetch("/api/volunteer/push-subscription", {
        method: "DELETE",
        headers,
        credentials: "include",
      });
    }
  } catch (err) {
    console.warn("[push] Unsubscribe failed:", err?.message);
  }
}

async function verifyAndRenewSubscription() {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }
    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      return;
    }

    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;

    const existingSubscription = await registration.pushManager.getSubscription();

    if (!existingSubscription) {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) return;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      });

      const csrfToken = getCsrfToken();
      const headers = { "Content-Type": "application/json" };
      if (csrfToken) headers["X-CSRF-Token"] = csrfToken;

      await fetch("/api/volunteer/push-subscription", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.toJSON().keys.p256dh,
            auth: subscription.toJSON().keys.auth,
          },
        }),
      });
      return;
    }

    try {
      await existingSubscription.update();
    } catch (err) {
      if (err.name === "AbortError" || err.message?.includes("not found") || err.message?.includes("expired")) {
        const endpoint = existingSubscription.endpoint;
        await existingSubscription.unsubscribe().catch(() => {});

        const csrfToken = getCsrfToken();
        const headers = { "Content-Type": "application/json" };
        if (csrfToken) headers["X-CSRF-Token"] = csrfToken;

        await fetch("/api/volunteer/push-subscription", {
          method: "DELETE",
          headers,
          credentials: "include",
          body: JSON.stringify({ endpoint }),
        }).catch(() => {});

        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicKey) return;

        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey,
        });

        const headers2 = { "Content-Type": "application/json" };
        const csrfToken2 = getCsrfToken();
        if (csrfToken2) headers2["X-CSRF-Token"] = csrfToken2;

        await fetch("/api/volunteer/push-subscription", {
          method: "POST",
          headers: headers2,
          credentials: "include",
          body: JSON.stringify({
            endpoint: newSubscription.endpoint,
            keys: {
              p256dh: newSubscription.toJSON().keys.p256dh,
              auth: newSubscription.toJSON().keys.auth,
            },
          }),
        });
      }
    }
  } catch (err) {
    console.warn("[push] Subscription verification failed:", err?.message);
  }
}

export function VolunteerNotificationProvider({ children }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [newRequestIds, setNewRequestIds] = useState([]);
  const [hasNewRequests, setHasNewRequests] = useState(false);
  const seenIdsRef = useRef(new Set());
  const dismissedRef = useRef(new Set());
  const pollTimeoutRef = useRef(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const retryCountRef = useRef(0);
  const generationRef = useRef(0); // Tracks which poll generation is current
  const browserNotificationGrantedRef = useRef(false);
  const pushRegisteredRef = useRef(false);

  const pollOnce = useCallback(async () => {
    // Clear any pending timeout (safety for rapid calls)
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);

    // Increment generation to mark this as the current poll
    const currentGeneration = ++generationRef.current;

    // Abort any in-flight request from previous generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    // Track if timeout fires for this specific request
    let timeoutFired = false;
    const timeoutId = setTimeout(() => {
      // Only abort if this is still the current generation
      if (generationRef.current === currentGeneration) {
        controller.abort();
      }
    }, 10000);

    try {
      const res = await fetch("/api/volunteer/help-requests?status=Pending&limit=50", { signal });
      clearTimeout(timeoutId);

      // If this generation is no longer current, discard the response
      if (generationRef.current !== currentGeneration) return;
      if (!mountedRef.current) return;

      // Handle HTTP errors - don't retry permanent client errors
      if (!res.ok) {
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          // Permanent client errors - don't retry, don't increment backoff
          console.warn(`[poll] HTTP ${res.status}: stopping polling`);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();

      // If this generation is no longer current, discard the response
      if (generationRef.current !== currentGeneration) return;
      if (!mountedRef.current) return;

      // SUCCESS: reset backoff
      retryCountRef.current = 0;

      // === EXISTING NOTIFICATION LOGIC (UNCHANGED) ===
      const items = json.data?.items || [];
      const currentIds = items.map((r) => r.requestId || r._id).filter(Boolean);
      setPendingCount(currentIds.length);

      const trulyNew = currentIds.filter((id) => {
        if (seenIdsRef.current.has(id)) return false;
        if (dismissedRef.current.has(id)) return false;
        return true;
      });

      if (trulyNew.length > 0) {
        seenIdsRef.current = new Set([...seenIdsRef.current, ...trulyNew]);
        setNewRequestIds((prev) => [...new Set([...prev, ...trulyNew])]);
        setHasNewRequests(true);

        if (browserNotificationGrantedRef.current) {
          try {
            const title = "New WariSeva Help Request";
            const body = trulyNew.length === 1
              ? "A Varkari needs assistance."
              : `${trulyNew.length} Varkaris need assistance.`;
            const notification = new Notification(title, {
              body,
              icon: "/images/logo.jpg",
              tag: "wari-help-request",
              renotify: true,
            });
            notification.onclick = () => {
              window.focus();
              window.location.href = "/volunteer/help-requests";
            };
          } catch {}
        }
      }
    } catch (err) {
      // If this generation is no longer current, ignore the error
      if (generationRef.current !== currentGeneration) return;

      clearTimeout(timeoutId);
      if (!mountedRef.current) return;

      // Ignore intentional aborts (superseded by newer poll, visibility hidden, unmount)
      // Only treat timeout (which we detect via AbortError with no response) as a network failure
      if (err.name === 'AbortError') {
        // If we got an abort but it's not from our timeout, it's an intentional cancel
        // We can't distinguish timeout from other aborts perfectly, but since we only
        // set abort on timeout, any other abort is intentional
        // Actually, the controller could be aborted by: timeout, visibility change, unmount, or superseded
        // All of these are intentional - we only want to retry on genuine network errors
        return;
      }

      // NETWORK/TIMEOUT ERROR or 5xx: exponential backoff
      retryCountRef.current = Math.min(retryCountRef.current + 1, 5);
    }

    // Schedule next poll (recursive) - only if this generation is still current
    if (mountedRef.current && generationRef.current === currentGeneration) {
      // Correct exponential backoff: 12s → 24s → 48s → 96s → 192s → 384s
      // retryCount 0 = 12s (base), 1 = 24s, 2 = 48s, 3 = 96s, 4 = 192s, 5 = 384s
      const delay = retryCountRef.current === 0
        ? POLL_INTERVAL
        : POLL_INTERVAL * Math.pow(2, retryCountRef.current);
      pollTimeoutRef.current = setTimeout(pollOnce, delay);
    }
  }, []); // Stable: only refs + constants

  const dismissAlert = useCallback(() => {
    setHasNewRequests(false);
  }, []);

  const dismissAll = useCallback(() => {
    setHasNewRequests(false);
    setNewRequestIds([]);
    dismissedRef.current = new Set([...seenIdsRef.current]);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    retryCountRef.current = 0;
    generationRef.current = 0;
    pollOnce(); // immediate first fetch
    return () => {
      mountedRef.current = false;
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [pollOnce]);

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      browserNotificationGrantedRef.current = true;
    }
  }, []);

  // Register push subscription once notification permission is granted
  useEffect(() => {
    if (pushRegisteredRef.current) return;
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      pushRegisteredRef.current = true;
      registerPushSubscription();
    }
  }, []);

  // Periodically verify subscription health on tab focus / visibility change
  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && typeof Notification !== "undefined" && Notification.permission === "granted") {
        verifyAndRenewSubscription();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Polling pause/resume on visibility change (separate from push renewal)
  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      } else {
        // Tab became visible - reset backoff and start fresh poll
        retryCountRef.current = 0;
        // Increment generation to cancel any in-flight request from before hidden
        generationRef.current++;
        pollOnce(); // immediate refresh, schedules own next
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pollOnce]);

  const requestBrowserPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "unavailable";
    if (Notification.permission === "granted") {
      browserNotificationGrantedRef.current = true;
      if (!pushRegisteredRef.current) {
        pushRegisteredRef.current = true;
        registerPushSubscription();
      }
      return "granted";
    }
    if (Notification.permission === "denied") return "denied";
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        browserNotificationGrantedRef.current = true;
        if (!pushRegisteredRef.current) {
          pushRegisteredRef.current = true;
          registerPushSubscription();
        }
      }
      return result;
    } catch {
      return "denied";
    }
  }, []);

  const value = {
    pendingCount,
    newRequestIds,
    hasNewRequests,
    dismissAlert,
    dismissAll,
    requestBrowserPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}