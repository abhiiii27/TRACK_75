import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Clock, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Notification } from '../types';

interface AlertsViewProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onActionClick?: (action: string, subjectId?: string) => void;
}

// Formats a UTC ISO timestamp into human-friendly relative time
function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AlertsView({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onActionClick
}: AlertsViewProps) {
  const [filterTab, setFilterTab] = useState<'all' | 'alerts' | 'reminders'>('all');

  const unreadCount = useMemo(() => {
    return notifications.filter(n => n.status === 'unread').length;
  }, [notifications]);

  const filteredList = useMemo(() => {
    if (filterTab === 'alerts') {
      return notifications.filter(n => n.type === 'Critical' || n.type === 'Warning');
    }
    if (filterTab === 'reminders') {
      return notifications.filter(n => n.type === 'Info' || n.type === 'Success');
    }
    return notifications;
  }, [notifications, filterTab]);

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in max-w-2xl mx-auto" id="alerts-view-stage">
      
      {/* Top Header: Screen 7 style */}
      <div className="flex items-center justify-between gap-3 pt-1 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
            Notifications
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium mt-0.5">
            {unreadCount > 0 ? `You have ${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up and eligible'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#26354A] border border-slate-200 dark:border-[#26354A] text-xs font-semibold text-[#38BDF8] transition-colors cursor-pointer"
            title="Mark all as read"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Mark all read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs: All, Alerts, Reminders */}
      <div className="flex items-center gap-2 p-1 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-[#26354A]">
        <button
          onClick={() => setFilterTab('all')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            filterTab === 'all'
              ? 'bg-[#38BDF8] text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterTab('alerts')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            filterTab === 'alerts'
              ? 'bg-[#38BDF8] text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
          }`}
        >
          Alerts
        </button>
        <button
          onClick={() => setFilterTab('reminders')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            filterTab === 'reminders'
              ? 'bg-[#38BDF8] text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
          }`}
        >
          Reminders
        </button>
      </div>

      {/* Notifications List */}
      {filteredList.length === 0 ? (
        <div className="py-14 text-center bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#26354A] rounded-xl px-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center mx-auto mb-3">
            <Bell className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">No notifications</p>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 max-w-xs mx-auto">
            {filterTab === 'alerts' 
              ? 'No active attendance alerts or danger warnings.' 
              : filterTab === 'reminders' 
              ? 'No upcoming lecture reminders.' 
              : 'You are completely caught up.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5" id="alerts-list-container">
          {filteredList.map((notif) => {
            const isUnread = notif.status === 'unread';
            const timeLabel = formatRelativeTime(notif.created_at);

            // Determine badge/icon styling
            let iconElement = <Info className="w-4 h-4 text-[#38BDF8]" />;
            let iconBg = 'bg-[#38BDF8]/15 border-[#38BDF8]/30';

            if (notif.type === 'Critical') {
              iconElement = <ShieldAlert className="w-4 h-4 text-[#EF4444]" />;
              iconBg = 'bg-[#EF4444]/15 border-[#EF4444]/30';
            } else if (notif.type === 'Warning') {
              iconElement = <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />;
              iconBg = 'bg-[#F59E0B]/15 border-[#F59E0B]/30';
            } else if (notif.type === 'Success') {
              iconElement = <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />;
              iconBg = 'bg-[#22C55E]/15 border-[#22C55E]/30';
            }

            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (isUnread) onMarkRead(notif.id);
                }}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer relative shadow-xs ${
                  isUnread
                    ? 'bg-white dark:bg-[#1E293B] border-sky-300 dark:border-[#38BDF8]/40'
                    : 'bg-slate-50/70 dark:bg-[#1E293B]/70 border-slate-200 dark:border-[#26354A] opacity-90'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Round Icon Container */}
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
                    {iconElement}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={`text-xs sm:text-sm font-bold truncate ${
                        isUnread ? 'text-slate-900 dark:text-[#F8FAFC]' : 'text-slate-600 dark:text-slate-300'
                      }`}>
                        {notif.title}
                      </h3>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-semibold whitespace-nowrap">
                          {timeLabel}
                        </span>
                        {isUnread && (
                          <div className="w-2 h-2 rounded-full bg-[#38BDF8] shrink-0" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(notif.id);
                          }}
                          className="p-1 text-slate-400 dark:text-[#94A3B8] hover:text-[#EF4444] rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed ${
                      isUnread ? 'text-slate-700 dark:text-[#F8FAFC]/90' : 'text-slate-500 dark:text-[#94A3B8]'
                    }`}>
                      {notif.message}
                    </p>

                    {/* Action Button if attached */}
                    {notif.action && onActionClick && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#26354A]/60 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">
                          {notif.category || 'Notification'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isUnread) onMarkRead(notif.id);
                            onActionClick(notif.action!, notif.related_subject_id);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#38BDF8] hover:underline cursor-pointer"
                        >
                          <span>{notif.action}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
