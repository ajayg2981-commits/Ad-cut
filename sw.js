const CACHE_NAME = "trimd-v3";

const APP_SHELL = [
  "./",
  "./shop.html",
  "./manifest.json",
  "./launcher-icon-192x192.png",
  "./launcher-icon-72x72.png"
];

self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL).catch(() => {});
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});


/* =========================
   MESSAGE FROM SHOP PAGE
========================= */

self.addEventListener("message", event => {

  if (!event.data) return;

  if (event.data.type === "TRIMD_BOOKING") {

    const booking = event.data.booking || {};

    event.waitUntil(
      showBookingNotification(booking)
    );
  }

});


/* =========================
   PUSH NOTIFICATION
========================= */

self.addEventListener("push", event => {

  let data = {};

  try {

    data = event.data
      ? event.data.json()
      : {};

  } catch (error) {

    data = {
      body: event.data
        ? event.data.text()
        : "New booking request"
    };

  }

  const booking = data.booking || data;

  event.waitUntil(
    showBookingNotification(booking)
  );

});


/* =========================
   SHOW BOOKING NOTIFICATION
========================= */

async function showBookingNotification(booking) {

  const customer =
    booking.customer_name ||
    "Customer";

  const service =
    booking.service_name ||
    (booking.trimd_services &&
     booking.trimd_services.name) ||
    "Service";

  const time =
    booking.appointment_time ||
    "New booking";

  const bookingId =
    booking.id ||
    Date.now();

  const title =
    "TrimD — New Booking Request";

  const body =
    `${customer} • ${service} • ${time}`;

  return self.registration.showNotification(
    title,
    {

      body: body,

      icon:
        "./launcher-icon-192x192.png",

      badge:
        "./launcher-icon-72x72.png",

      tag:
        "trimd-booking-" + bookingId,

      renotify: true,

      requireInteraction: true,

      vibrate: [
        300,
        150,
        300,
        150,
        500
      ],

      data: {

        url:
          self.location.origin +
          self.location.pathname
            .replace(/sw\.js$/, "shop.html"),

        booking_id:
          bookingId

      }

    }
  );
}


/* =========================
   NOTIFICATION CLICK
========================= */

self.addEventListener(
  "notificationclick",
  event => {

    event.notification.close();

    const url =
      (
        event.notification.data &&
        event.notification.data.url
      ) ||
      self.location.origin + "/";

    event.waitUntil(

      clients.matchAll({
        type: "window",
        includeUncontrolled: true
      }).then(clientList => {

        for (const client of clientList) {

          if ("focus" in client) {

            client.navigate(url);

            return client.focus();

          }

        }

        return clients.openWindow(url);

      })

    );

  }
);


/* =========================
   NOTIFICATION CLOSE
========================= */

self.addEventListener(
  "notificationclose",
  () => {}
);
