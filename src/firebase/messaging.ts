import { getMessaging, getToken, deleteToken } from "firebase/messaging";
import { app } from "./firebase";

export const isNotificationSupported = (): boolean => {
  return "Notification" in window && 
         "serviceWorker" in navigator && 
         "PushManager" in window;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    return "denied";
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "denied";
  }
};

export const getFCMToken = async (): Promise<string | null> => {
  console.log("[FCM-3] getFCMToken started");
  if (!app) {
    console.warn("Firebase not configured properly.");
    return null;
  }
  
  if (!isNotificationSupported()) {
    console.warn("Notifications not supported in this browser.");
    return null;
  }

  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted.");
    return null;
  }

  try {
    const messaging = getMessaging(app);
    console.log("[FCM-4] Firebase messaging initialized");
    
    // VAPID key is required to receive push messages
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    
    if (!vapidKey) {
      console.warn("VITE_FIREBASE_VAPID_KEY is missing from environment variables.");
    } else {
      console.log("[FCM-5] VAPID key present");
    }

    // Wait for the active Service Worker before requesting the token
    const registration = await navigator.serviceWorker.ready;
    console.log("[FCM-6] Service Worker ready:", registration);

    console.log("[FCM-7] Firebase getToken started");
    const currentToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    
    console.log("[FCM-8] Firebase token generated:", currentToken ? "Yes" : "No");
    
    if (currentToken) {
      return currentToken;
    } else {
      console.warn("No FCM registration token available. Request permission to generate one.");
      return null;
    }
  } catch (err: any) {
    console.error("Firebase Exception: An error occurred while retrieving token: ", err);
    console.error("COMPLETE error object with stack trace:", err, err?.stack);
    throw err; // Never silently return null
  }
};

export const removeFCMToken = async (): Promise<boolean> => {
  if (!app || !isNotificationSupported()) return false;
  
  try {
    const messaging = getMessaging(app);
    const success = await deleteToken(messaging);
    return success;
  } catch (err) {
    console.error("Error deleting FCM token", err);
    return false;
  }
};

const recentNotificationIds = new Set<string>();

export const setupForegroundListener = () => {
  if (!app || !isNotificationSupported()) return null;

  import("firebase/messaging").then(({ getMessaging, onMessage }) => {
    const messaging = getMessaging(app);
    
    onMessage(messaging, async (payload) => {
      
      const notificationId = payload.data?.notificationId;
      if (notificationId) {
        if (recentNotificationIds.has(notificationId)) {
          return; // deduplicated
        }
        recentNotificationIds.add(notificationId);
        // Clean up old IDs to prevent memory leak
        if (recentNotificationIds.size > 50) {
          const firstItem = recentNotificationIds.values().next().value;
          if (firstItem) recentNotificationIds.delete(firstItem);
        }
      }

      if (Notification.permission === 'granted') {
        try {
          const registration = await navigator.serviceWorker.ready;
          const dataPayload = payload.data || {};
          const title = payload.notification?.title || dataPayload.title || 'Track75 Alert';
          
          registration.showNotification(title, {
            body: payload.notification?.body || dataPayload.body || 'You have a new message.',
            icon: payload.notification?.icon || '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: notificationId || 'default-tag',
            data: {
              click_action: dataPayload.click_action || '/',
              notificationId: notificationId
            }
          });
        } catch (e) {
          console.error("Error showing foreground notification:", e);
        }
      }
    });
  }).catch(err => {
    console.error("Failed to setup foreground listener", err);
  });
};
