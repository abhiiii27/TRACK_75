import { useState, useEffect, useCallback } from 'react';
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

  // ── Helpers (defined first so all useEffects can safely reference them) ──

  const registerDeviceWithBackend = useCallback(async (token: string) => {
    try {
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        console.error('[useFCM] registerDeviceWithBackend: No auth_token in localStorage. Skipping.');
        return;
      }

      const ua = navigator.userAgent;
      let browserName = 'Unknown';
      if (ua.includes('Firefox'))           browserName = 'Firefox';
      else if (ua.includes('SamsungBrowser')) browserName = 'Samsung Internet';
      else if (ua.includes('Opera') || ua.includes('OPR')) browserName = 'Opera';
      else if (ua.includes('Edge'))         browserName = 'Edge';
      else if (ua.includes('Chrome'))       browserName = 'Chrome';
      else if (ua.includes('Safari'))       browserName = 'Safari';

      let osName = 'Unknown';
      if (ua.includes('Win'))               osName = 'Windows';
      else if (ua.includes('Mac'))          osName = 'MacOS';
      else if (ua.includes('X11'))          osName = 'UNIX';
      else if (ua.includes('Linux'))        osName = 'Linux';
      if (ua.includes('Android'))           osName = 'Android';
      if (ua.includes('iPhone') || ua.includes('iPad')) osName = 'iOS';

      const payload = {
        device_token: token,
        platform: osName,
        browser: browserName,
        user_agent: ua,
        device_name: `${browserName} on ${osName}`
      };


      const response = await fetch('/api/device/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      if (response.ok) {
        // registered successfully
      } else {
        console.error('[useFCM] Backend Registration FAILED. Status:', response.status, 'Body:', responseText);
      }
    } catch (err) {
      console.error('[useFCM] Failed to register device token with backend:', err);
    }
  }, []);

  const removeDeviceFromBackend = useCallback(async (token: string) => {
    try {
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) return;
      await fetch(`/api/device/remove?token=${encodeURIComponent(token)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
    } catch (err) {
      console.error('[useFCM] Failed to remove device token from backend:', err);
    }
  }, []);

  // ── Effects ──

  // Sync browser permission on mount
  useEffect(() => {
    if (state.isSupported) {
      setState(s => ({ ...s, permission: Notification.permission }));
    }
  }, [state.isSupported]);

  // Auto-fetch + register on mount if permission already granted (e.g. page reload)
  useEffect(() => {
    if (state.isSupported && state.permission === 'granted' && !state.token) {
      getFCMToken()
        .then(async token => {
          if (token) {
            setState(s => ({ ...s, token }));
            await registerDeviceWithBackend(token); // register with backend every page load
          } else {
            console.warn('[useFCM] Auto-fetch returned null token');
          }
        })
        .catch(err => console.error('[useFCM] Auto-fetch error:', err));
    }
  }, [state.permission, state.isSupported, registerDeviceWithBackend]);

  // Setup foreground listener automatically if we have permission
  useEffect(() => {
    let initialized = false;
    if (state.isSupported && state.permission === 'granted' && !initialized) {
      import('../firebase/messaging').then(({ setupForegroundListener }) => {
        setupForegroundListener();
        initialized = true;
      });
    }
  }, [state.permission, state.isSupported]);

  // ── Public API ──

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
      console.error('[useFCM] Error disabling notifications:', err);
    } finally {
      setState(s => ({ ...s, isLoading: false }));
    }
  };

  const refreshToken = async () => {
    if (!state.isSupported || Notification.permission !== 'granted') return;
    setState(s => ({ ...s, isLoading: true }));
    try {
      const token = await getFCMToken();
      if (token) {
        setState(s => ({ ...s, token, error: null }));
        await registerDeviceWithBackend(token);
      } else {
        console.warn('[useFCM] Refresh returned null token');
        setState(s => ({ ...s, error: 'Token refresh returned null.' }));
      }
    } catch (err) {
      console.error('[useFCM] Refresh error:', err);
    } finally {
      setState(s => ({ ...s, isLoading: false }));
    }
  };

  return {
    ...state,
    requestPermissionAndGetToken,
    disableNotifications,
    refreshToken
  };
};
