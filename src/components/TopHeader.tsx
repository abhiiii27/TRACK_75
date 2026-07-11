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
      case 'dashboard':  return { title: 'Dashboard Workspace', subtitle: 'Academic Standing Overview' };
      case 'subjects':   return { title: 'Tracked Subject Registers', subtitle: 'Detailed Class Log Books' };
      case 'predictor':  return { title: 'AI Attendance Predictor', subtitle: 'Simulate Bunks and Study Quotas' };
      case 'analytics':  return { title: 'Performance Analytics', subtitle: 'Charts, Ratios & Class Trajectory' };
      case 'profile':    return { title: 'Student Profile Settings', subtitle: 'Customize Academic Goal Parameters' };
      case 'settings':   return { title: 'System Settings', subtitle: 'Configure Alerts & Preferences' };
      default:           return { title: 'Attendance Tracker', subtitle: 'Student Workspace' };
    }
  };

  const { title, subtitle } = getPageTitle(activePage);
  const badgeDisplay = unreadCount > 9 ? '9+' : unreadCount;

  return (
    <header
      className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/80 sticky top-0 z-40 h-16 shrink-0 flex items-center px-6 justify-between select-none"
      id="app-navigation-header"
    >
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer flex items-center justify-center border border-slate-100 dark:border-slate-700"
          id="btn-mobile-sidebar-toggle-header"
          title="Toggle Navigation Menu"
        >
          {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand Logo & Page Title */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-900 dark:text-slate-50 tracking-tight leading-none mb-1 flex items-center gap-2">
              {title}
              <span className="hidden lg:inline text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                SaaS v1.5
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold leading-none">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Quick Add */}
        <button
          onClick={onAddSubject}
          className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-2xs border border-indigo-600 hover:border-indigo-700 shrink-0"
          id="header-btn-quick-add"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
          <span>Add Subject</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center relative ${
              showNotifications
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50'
            }`}
            id="btn-notifications-toggle"
            title="Notification Alerts"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white animate-pulse">
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
