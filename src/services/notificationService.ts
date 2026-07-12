/**
 * Browser Notification Service
 * Handles browser support checks, permissions, and local notification triggering.
 * Prepared for future Push Notification integration.
 */

export const isNotificationSupported = (): boolean => {
  return 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    return 'denied';
  }
};

interface NotificationOptions {
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  tag?: string;
  requireInteraction?: boolean;
}

export const showLocalNotification = (title: string, options: NotificationOptions) => {
  if (!isNotificationSupported() || getNotificationPermission() !== 'granted') {
    return;
  }

  // Future-proofing: We can add a fallback to Service Worker registration for Push
  try {
    const notification = new Notification(title, {
      icon: '/pwa-192x192.svg',
      ...options
    });

    notification.onclick = function (event) {
      event.preventDefault();
      // Basic navigation support setup - future phases will parse `data.url`
      window.focus();
      notification.close();
    };
  } catch (err) {
    // Silently ignore notification display errors in production
  }
};
