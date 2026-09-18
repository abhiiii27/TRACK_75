import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell,
  Trash2,
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';
import { Notification } from '../types';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onActionClick?: (action: string, subjectId?: string) => void;
}

// Formats a UTC ISO timestamp into human-readable relative time
function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const TYPE_CONFIG: Record<string, {
  icon: React.ReactNode;
  unreadBg: string;
  border: string;
  badge: string;
  badgeDot: string;
}> = {
  Critical: {
    icon: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    unreadBg: 'bg-rose-50 dark:bg-rose-950/20',
    border: 'border-l-2 border-rose-400 dark:border-rose-500',
    badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    badgeDot: 'bg-rose-500',
  },
  Warning: {
    icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    unreadBg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-l-2 border-amber-400 dark:border-amber-500',
    badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    badgeDot: 'bg-amber-500',
  },
  Success: {
    icon: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
    unreadBg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-l-2 border-emerald-400 dark:border-emerald-500',
    badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    badgeDot: 'bg-emerald-500',
  },
  Info: {
    icon: <Info className="w-5 h-5 text-[#38BDF8] shrink-0" />,
    unreadBg: 'bg-[#38BDF8]/10',
    border: 'border-l-2 border-[#38BDF8]',
    badge: 'bg-[#38BDF8]/20 text-[#38BDF8]',
    badgeDot: 'bg-[#38BDF8]',
  },
};

// Single notification card with delete animation support
interface CardProps {
  notif: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onActionClick?: (action: string, subjectId?: string) => void;
  onClose: () => void;
}

const NotificationCard: React.FC<CardProps> = React.memo(({ notif, onMarkRead, onDelete, onActionClick, onClose }) => {
  const [deleting, setDeleting] = useState(false);
  const [timeLabel, setTimeLabel] = useState(() => formatRelativeTime(notif.created_at));

  // Auto-update relative time every 60s
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLabel(formatRelativeTime(notif.created_at));
    }, 60_000);
    return () => clearInterval(timer);
  }, [notif.created_at]);

  const isUnread = notif.status === 'unread';
  const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.Info;

  const handleDelete = useCallback(() => {
    setDeleting(true);
    // Let CSS transition finish before calling parent
    setTimeout(() => onDelete(notif.id), 300);
  }, [notif.id, onDelete]);

  const handleMarkRead = useCallback(() => {
    if (isUnread) onMarkRead(notif.id);
  }, [isUnread, notif.id, onMarkRead]);

  return (
    <div
      className={`transition-all duration-300 overflow-hidden ${deleting ? 'opacity-0 max-h-0 py-0' : 'opacity-100 max-h-96'}`}
    >
      <div
        className={`
          p-3 sm:p-3.5 flex gap-3 relative
          ${cfg.border}
          ${isUnread ? cfg.unreadBg : 'bg-white dark:bg-[#1E293B]'}
          ${isUnread ? 'cursor-pointer' : ''}
          transition-colors hover:brightness-[1.02] dark:hover:brightness-[1.05]
        `}
        onClick={handleMarkRead}
      >
        {/* Icon */}
        <div className="mt-0.5">{cfg.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* Top row: title + time + delete */}
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h4 className={`text-xs sm:text-sm font-bold leading-snug flex-1 min-w-0 ${
              isUnread ? 'text-slate-900 dark:text-[#F8FAFC]' : 'text-slate-600 dark:text-slate-300'
            }`}>
              {notif.title}
            </h4>

            {/* Time + delete — always visible on mobile */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-[#94A3B8] whitespace-nowrap">
                <Clock className="w-2.5 h-2.5" />
                {timeLabel}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                className="p-1 text-slate-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg cursor-pointer transition-colors"
                title="Delete notification"
                aria-label="Delete notification"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Message */}
          <p className={`text-xs leading-relaxed mb-2 ${
            isUnread ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-[#94A3B8]'
          }`}>
            {notif.message}
          </p>

          {/* Bottom row: badge + action */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${cfg.badge}`}>
              {notif.category}
            </span>

            {notif.action && onActionClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isUnread) onMarkRead(notif.id);
                  onActionClick(notif.action!, notif.related_subject_id);
                  onClose();
                }}
                className="text-xs font-bold text-[#38BDF8] hover:text-[#0284C7] flex items-center gap-1 cursor-pointer transition-colors"
              >
                {notif.action}
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Unread indicator dot */}
        {isUnread && (
          <div className={`absolute top-3 right-2.5 w-2 h-2 rounded-full ${cfg.badgeDot} ring-2 ring-white dark:ring-[#1E293B]`} />
        )}
      </div>
    </div>
  );
});

NotificationCard.displayName = 'NotificationCard';

// Main panel component
const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onActionClick,
}) => {
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-45" onClick={onClose} />

      {/* Panel */}
      <div
        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#26354A] rounded-xl shadow-2xl z-50 animate-fade-in flex flex-col overflow-hidden"
        style={{ maxHeight: 'min(80vh, 560px)' }}
        id="notifications-dropdown-menu"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-[#26354A] flex items-center justify-between bg-white dark:bg-[#1E293B] shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#EF4444]/20 text-[#EF4444] text-[10px] font-bold">
                {unreadCount} unread
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-xs font-semibold text-[#38BDF8] hover:text-[#0284C7] cursor-pointer transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto no-scrollbar flex-1 bg-slate-50/60 dark:bg-[#0F172A]/40">
          {notifications.length === 0 ? (
            <div className="px-4 py-12 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 bg-[#22C55E]/10 rounded-full flex items-center justify-center mb-2.5">
                <CheckCircle className="w-5 h-5 text-[#22C55E]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">You're all caught up!</span>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] max-w-[200px] mt-1">
                No notifications right now.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-[#26354A]/60">
              {notifications.map((notif) => (
                <NotificationCard
                  key={notif.id}
                  notif={notif}
                  onMarkRead={onMarkRead}
                  onDelete={onDelete}
                  onActionClick={onActionClick}
                  onClose={onClose}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-[#26354A] text-[10px] text-slate-500 dark:text-[#94A3B8] font-semibold text-center bg-slate-50 dark:bg-[#1E293B] shrink-0">
          Automated academic attendance alerts
        </div>
      </div>
    </>
  );
};

export default React.memo(NotificationPanel);
