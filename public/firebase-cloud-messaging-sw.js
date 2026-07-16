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
  
  const notificationTitle = payload.notification?.title || 'Track75 Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message.',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
