self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "New Help Request", body: "A new help request is waiting for volunteer action.", url: "/volunteer/help-requests" };

  if (event.data) {
    try {
      const payload = event.data.json();
      if (payload.title) data.title = payload.title;
      if (payload.body) data.body = payload.body;
      if (payload.url) data.url = payload.url;
    } catch {
      // event.data is text, not JSON
    }
  }

  const options = {
    body: data.body,
    icon: "/images/logo.jpg",
    badge: "/images/logo-192.png",
    tag: "wari-help-request",
    renotify: true,
    requireInteraction: false,
    data: { url: data.url },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/volunteer/help-requests";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/volunteer") && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
