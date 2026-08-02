importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB83FCh95XUGQua_oP-ioma-CYwYGUxKPg",
  authDomain: "track75-ai-abhii.firebaseapp.com",
  projectId: "track75-ai-abhii",
  storageBucket: "track75-ai-abhii.firebasestorage.app",
  messagingSenderId: "54330267103",
  appId: "1:54330267103:web:74acc5aa2d1159e120206a"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-cloud-messaging-sw.js] Received background message ', payload);
  
  const dataPayload = payload.data || {};
  const notificationTitle = payload.notification?.title || dataPayload.title || 'Track75 Alert';
  const notificationOptions = {
    body: payload.notification?.body || dataPayload.body || 'You have a new message.',
    icon: payload.notification?.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: dataPayload.notificationId || 'default-tag',
    data: {
      click_action: dataPayload.click_action || '/',
      notificationId: dataPayload.notificationId
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const clickAction = event.notification.data?.click_action || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(clickAction);
      }
    })
  );
});
