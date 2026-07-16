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
    // VAPID key is required to receive push messages
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    
    if (!vapidKey) {
      console.warn("VITE_FIREBASE_VAPID_KEY is missing from environment variables.");
    }

    // Wait for the active Service Worker
    const registration = await navigator.serviceWorker.ready;
    console.log("Service Worker Ready");

    const currentToken = await getToken(messaging, { 
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    
    if (currentToken) {
      console.log("Token Generated");
      return currentToken;
    } else {
      console.log("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (err) {
    console.error("Firebase Exception: An error occurred while retrieving token: ", err);
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
