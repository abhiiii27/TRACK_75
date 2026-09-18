import React, { useState, useEffect, useCallback } from 'react';
import {
  Menu,
  Bell,
  Plus,
  GraduationCap,
  X,
} from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import { Notification, NotificationListResponse } from '../types';

interface TopHeaderProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onAddSubject: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  activities: Array<{ id: string; text: string; time: string }>;
  onClearActivities?: () => void;
  /** Increment this from App.tsx after any data mutation to trigger a notifications refresh */
  notificationRefreshTrigger?: number;
}

const TopHeader = function TopHeader({
  activePage,
  setActivePage,
  onAddSubject,
  isOpenMobile,
  setIsOpenMobile,
  notificationRefreshTrigger = 0,
}: TopHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications – called on mount and whenever refreshTrigger changes
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: NotificationListResponse = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // Silently ignore — notifications are non-critical
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, notificationRefreshTrigger]);

  // Mark single notification as read (optimistic UI)
  const handleMarkRead = useCallback(async (id: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'read' as const } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Refetch to sync on error
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // Mark all as read (optimistic UI)
  const handleMarkAllRead = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' as const })));
    setUnreadCount(0);
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // Delete notification (optimistic UI with animation handled by card)
  const handleDeleteNotification = useCallback(async (id: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    // Optimistic: remove from state immediately after animation delay (card handles 300ms)
    setNotifications((prev) => {
      const notif = prev.find((n) => n.id === id);
      if (notif?.status === 'unread') {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      return prev.filter((n) => n.id !== id);
    });
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // Action click routing
  const handleActionClick = useCallback((action: string, relatedId?: string) => {
    if (action === 'Open Subject') setActivePage('subjects');
    else if (action === 'Add Subject') onAddSubject();
    else if (action === 'Open Prediction') setActivePage('predictor');
    else if (action === 'Open Analytics') setActivePage('analytics');
    else if (action === 'Open Recommendation') setActivePage('dashboard');
  }, [setActivePage, onAddSubject]);

  // Map of keys to human-friendly page titles
  const getPageTitle = (key: string) => {
    switch (key) {
      case 'dashboard':  return { title: 'Dashboard', subtitle: 'Overview & today\'s attendance standing' };
      case 'subjects':   return { title: 'Subjects', subtitle: 'Course registers & class records' };
      case 'predictor':  return { title: 'Attendance Predictor', subtitle: 'Simulate future attendance and bunk margins' };
      case 'analytics':  return { title: 'Analytics', subtitle: 'Attendance trends & course ratios' };
      case 'profile':    return { title: 'Profile Settings', subtitle: 'Semester & minimum target configuration' };
      case 'settings':   return { title: 'Settings', subtitle: 'Preferences & device notifications' };
      default:           return { title: 'Track75', subtitle: 'Attendance Tracker' };
    }
  };

  const { title, subtitle } = getPageTitle(activePage);
  const badgeDisplay = unreadCount > 9 ? '9+' : unreadCount;

  return (
    <header
      className="bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#26354A] sticky top-0 z-40 h-14 sm:h-16 shrink-0 flex items-center px-4 sm:px-6 justify-between select-none shadow-xs"
      id="app-navigation-header"
    >
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="md:hidden p-2 text-slate-500 dark:text-[#94A3B8] hover:text-sky-600 dark:hover:text-[#38BDF8] hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer flex items-center justify-center border border-slate-200 dark:border-[#26354A]"
          id="btn-mobile-sidebar-toggle-header"
          title="Toggle Navigation Menu"
        >
          {isOpenMobile ? <X className="w-4 h-4 text-slate-900 dark:text-[#F8FAFC]" /> : <Menu className="w-4 h-4 text-slate-900 dark:text-[#F8FAFC]" />}
        </button>

        {/* Page Title */}
        <div className="flex flex-col">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-normal leading-tight hidden xs:block">{subtitle}</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Quick Add */}
        <button
          onClick={onAddSubject}
          className="flex items-center gap-1.5 bg-[#38BDF8] hover:bg-sky-400 text-slate-950 font-bold py-1.5 px-3 sm:px-3.5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs shrink-0"
          id="header-btn-quick-add"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Subject</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center justify-center relative ${
              showNotifications
                ? 'bg-sky-50 dark:bg-sky-500/15 border-sky-300 dark:border-sky-400 text-sky-600 dark:text-[#38BDF8]'
                : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#26354A] text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#26354A]'
            }`}
            id="btn-notifications-toggle"
            title="Notification Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#EF4444] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#0F172A]">
                {badgeDisplay}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationPanel
              notifications={notifications}
              onClose={() => setShowNotifications(false)}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
              onDelete={handleDeleteNotification}
              onActionClick={handleActionClick}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default React.memo(TopHeader);
