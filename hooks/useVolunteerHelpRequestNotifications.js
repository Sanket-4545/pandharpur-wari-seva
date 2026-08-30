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

export function VolunteerNotificationProvider({ children }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [newRequestIds, setNewRequestIds] = useState([]);
  const [hasNewRequests, setHasNewRequests] = useState(false);
  const seenIdsRef = useRef(new Set());
  const dismissedRef = useRef(new Set());
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);
  const browserNotificationGrantedRef = useRef(false);

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

  const requestBrowserPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "unavailable";
    if (Notification.permission === "granted") {
      browserNotificationGrantedRef.current = true;
      return "granted";
    }
    if (Notification.permission === "denied") return "denied";
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        browserNotificationGrantedRef.current = true;
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
