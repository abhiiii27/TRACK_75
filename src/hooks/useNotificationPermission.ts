import { useState, useEffect } from 'react';
import { getNotificationPermission, isNotificationSupported, requestNotificationPermission } from '../services/notificationService';

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState<boolean>(true);

  useEffect(() => {
    const isSupp = isNotificationSupported();
    setSupported(isSupp);
    if (isSupp) {
      setPermission(getNotificationPermission());
    } else {
      setPermission('denied');
    }
  }, []);

  const requestPermission = async () => {
    if (!supported) return 'denied';
    const newPermission = await requestNotificationPermission();
    setPermission(newPermission);
    return newPermission;
  };

  return {
    permission,
    requestPermission,
    isSupported: supported
  };
}
