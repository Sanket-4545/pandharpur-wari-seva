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
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);
  const browserNotificationGrantedRef = useRef(false);
  const pushRegisteredRef = useRef(false);

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch("/api/volunteer/help-requests?status=Pending&limit=50");
      if (!res.ok) return;
      const json = await res.json();
      const items = json.data?.items || [];
      const currentIds = items.map((r) => r.requestId || r._id).filter(Boolean);

      if (!mountedRef.current) return;

      setPendingCount(currentIds.length);

      const trulyNew = currentIds.filter((id) => {
        if (seenIdsRef.current.has(id)) return false;
        if (dismissedRef.current.has(id)) return false;
        return true;
      });

      if (trulyNew.length > 0) {
        seenIdsRef.current = new Set([...seenIdsRef.current, ...trulyNew]);
        setNewRequestIds((prev) => {
          const merged = [...new Set([...prev, ...trulyNew])];
          return merged;
        });
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
    } catch {}
  }, []);

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
    fetchPending();
    intervalRef.current = setInterval(fetchPending, POLL_INTERVAL);
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchPending]);

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
