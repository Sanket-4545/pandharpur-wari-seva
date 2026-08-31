import webPush from "web-push";
import { PushSubscriptions } from "./models/index.js";

let webPushConfigured = false;

function configureWebPush() {
  if (webPushConfigured) return;
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || "mailto:admin@wariportal.org";

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn("[push-notifications] VAPID keys not configured. Push notifications disabled.");
    return;
  }

  webPush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
  webPushConfigured = true;
}

export async function sendPushToAllVolunteers(payload) {
  configureWebPush();
  if (!webPushConfigured) return { sent: 0, failed: 0 };

  const subscriptions = await PushSubscriptions.findActiveVolunteerSubscriptions();
  if (subscriptions.length === 0) return { sent: 0, failed: 0 };

  const message = JSON.stringify({
    title: "New Help Request",
    body: "A new help request is waiting for volunteer action.",
    url: "/volunteer/help-requests",
    ...payload,
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
        },
        message
      ).catch((err) => {
        // 404 or 410 = subscription expired/invalid
        if (err.statusCode === 404 || err.statusCode === 410) {
          return PushSubscriptions.removeByEndpoint(sub.endpoint).then(() => {
            throw err;
          });
        }
        throw err;
      })
    )
  );

  let sent = 0;
  let failed = 0;
  for (const result of results) {
    if (result.status === "fulfilled") {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed, total: subscriptions.length };
}
