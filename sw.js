const CACHE_NAME = "trimd-shop-v2";
const SHOP_URL = "./shop.html";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  const data = event.data || {};

  if (data.type === "SHOW_BOOKING_NOTIFICATION") {
    event.waitUntil(
      self.registration.showNotification(
        data.title || "TrimD — New Booking Request",
        {
          body: data.body || "A new booking request has arrived.",
          icon: data.icon || "./launchericon-192x192.png",
          badge: data.badge || "./launchericon-72x72.png",
          tag: data.tag || "trimd-booking",
          renotify: true,
          requireInteraction: true,
          vibrate: [300, 150, 300, 150, 500],
          data: {
            url: data.url || SHOP_URL,
            bookingId: data.bookingId || ""
          },
          actions: [
            {
              action: "open",
              title: "Open Booking"
            }
          ]
        }
      )
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url =
    event.notification.data?.url || SHOP_URL;

  event.waitUntil(
    self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((clients) => {

      for (const client of clients) {
        if ("focus" in client) {
          return client.navigate(url)
            .then(() => client.focus());
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
