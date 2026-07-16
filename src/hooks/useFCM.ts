import { useState, useEffect } from 'react';
import { 
  isNotificationSupported, 
  requestNotificationPermission, 
  getFCMToken, 
  removeFCMToken 
} from '../firebase/messaging';

interface FCMState {
  isSupported: boolean;
  permission: NotificationPermission | 'unknown';
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useFCM = () => {
  const [state, setState] = useState<FCMState>({
    isSupported: isNotificationSupported(),
    permission: 'unknown',
    token: null,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    if (state.isSupported) {
      setState(s => ({ ...s, permission: Notification.permission }));
    }
  }, [state.isSupported]);

  const registerDeviceWithBackend = async (token: string) => {
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) return;

      const ua = navigator.userAgent;
      let browserName = "Unknown";
      if (ua.includes("Firefox")) browserName = "Firefox";
      else if (ua.includes("SamsungBrowser")) browserName = "Samsung Internet";
      else if (ua.includes("Opera") || ua.includes("OPR")) browserName = "Opera";
      else if (ua.includes("Edge")) browserName = "Edge";
      else if (ua.includes("Chrome")) browserName = "Chrome";
      else if (ua.includes("Safari")) browserName = "Safari";

      let osName = "Unknown";
      if (ua.includes("Win")) osName = "Windows";
      else if (ua.includes("Mac")) osName = "MacOS";
      else if (ua.includes("X11")) osName = "UNIX";
      else if (ua.includes("Linux")) osName = "Linux";
      if (ua.includes("Android")) osName = "Android";
      if (ua.includes("iPhone") || ua.includes("iPad")) osName = "iOS";

      console.log("Token Registration Started");
      const response = await fetch('/api/device/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          device_token: token,
          platform: osName,
          browser: browserName,
          user_agent: ua,
          device_name: `${browserName} on ${osName}`
        })
      });

      if (response.ok) {
        console.log("Backend Registration Success");
      } else {
        console.error("Backend Registration Failed", await response.text());
      }
    } catch (err) {
      console.error("Failed to register device token with backend", err);
    }
  };

  const removeDeviceFromBackend = async (token: string) => {
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) return;

      await fetch(`/api/device/remove?token=${encodeURIComponent(token)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (err) {
      console.error("Failed to remove device token from backend", err);
    }
  };

  const requestPermissionAndGetToken = async () => {
    if (!state.isSupported) {
      setState(s => ({ ...s, error: 'Push notifications are not supported by this browser.' }));
      return null;
    }

    setState(s => ({ ...s, isLoading: true, error: null }));

    try {
      const permission = await requestNotificationPermission();
      setState(s => ({ ...s, permission }));

      if (permission === 'granted') {
        const token = await getFCMToken();
        if (token) {
          setState(s => ({ ...s, token }));
          await registerDeviceWithBackend(token);
          return token;
        } else {
          setState(s => ({ ...s, error: 'Failed to generate push notification token.' }));
          return null;
        }
      } else {
        setState(s => ({ ...s, error: 'Notification permission was denied.' }));
        return null;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setState(s => ({ ...s, error: `Error setting up notifications: ${msg}` }));
      return null;
    } finally {
      setState(s => ({ ...s, isLoading: false }));
    }
  };

  const disableNotifications = async () => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      if (state.token) {
        await removeDeviceFromBackend(state.token);
        await removeFCMToken();
      }
      setState(s => ({ ...s, token: null, error: null }));
    } catch (err) {
      console.error("Error disabling notifications", err);
    } finally {
      setState(s => ({ ...s, isLoading: false }));
    }
  };

  return {
    ...state,
    requestPermissionAndGetToken,
    disableNotifications
  };
};
