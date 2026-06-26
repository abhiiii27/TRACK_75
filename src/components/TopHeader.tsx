import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  Plus, 
  GraduationCap, 
  X, 
  Trash2, 
  CheckCircle, 
  Sparkles,
  BookOpen
} from 'lucide-react';

interface TopHeaderProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onAddSubject: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  activities: Array<{ id: string; text: string; time: string }>;
  onClearActivities?: () => void;
}

export default function TopHeader({
  activePage,
  setActivePage,
  onAddSubject,
  isOpenMobile,
  setIsOpenMobile,
  activities,
  onClearActivities
}: TopHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Map of keys to human-friendly page titles
  const getPageTitle = (key: string) => {
    switch (key) {
      case 'dashboard':
        return { title: 'Dashboard Workspace', subtitle: 'Academic Standing Overview' };
      case 'subjects':
        return { title: 'Tracked Subject Registers', subtitle: 'Detailed Class Log Books' };
      case 'predictor':
        return { title: 'AI Attendance Predictor', subtitle: 'Simulate Bunks and Study Quotas' };
      case 'analytics':
        return { title: 'Performance Analytics', subtitle: 'Charts, Ratios & Class Trajectory' };
      case 'profile':
        return { title: 'Student Profile Settings', subtitle: 'Customize Academic Goal Parameters' };
      case 'settings':
        return { title: 'System Settings', subtitle: 'Configure Alerts & Preferences' };
      default:
        return { title: 'Attendance Tracker', subtitle: 'Student Workspace' };
    }
  };

  const { title, subtitle } = getPageTitle(activePage);

  // Active notifications count
  const unreadCount = activities.length;

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

        {/* Brand App Logo & Dynamic Page Title */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-900 dark:text-slate-50 tracking-tight leading-none mb-1 flex items-center gap-2">
              {title}
              <span className="hidden lg:inline text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                SaaS v1.4
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold leading-none">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Right Side Accessories */}
      <div className="flex items-center gap-3">
        
        {/* Quick Add Subject Button */}
        <button
          onClick={onAddSubject}
          className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-2xs border border-indigo-600 hover:border-indigo-700 shrink-0"
          id="header-btn-quick-add"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
          <span>Add Subject</span>
        </button>

        {/* Notifications Popover Controller */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center relative ${
              showNotifications 
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' 
                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
            id="btn-notifications-toggle"
            title="Notification Alerts"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <>
              {/* Overlay to close on tap outside */}
              <div 
                className="fixed inset-0 z-45" 
                onClick={() => setShowNotifications(false)} 
              />
              
              <div 
                className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl z-50 animate-fade-in py-2 overflow-hidden"
                id="notifications-dropdown-menu"
              >
                <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/80">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                    Recent Logs Activity
                  </span>
                  {activities.length > 0 && onClearActivities && (
                    <button
                      onClick={() => {
                        onClearActivities();
                        setShowNotifications(false);
                      }}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                      title="Clear activity log feed"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto no-scrollbar py-1">
                  {activities.length === 0 ? (
                    <div className="px-4 py-8 text-center text-slate-400 flex flex-col items-center justify-center">
                      <BookOpen className="w-6 h-6 text-slate-250 dark:text-slate-650 mb-1.5" />
                      <span className="text-[11px] font-bold">No active notifications</span>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 max-w-[180px] mt-0.5">Logs of direct class edits display here.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                      {activities.map((act) => (
                        <div 
                          key={act.id} 
                          className="px-4 py-3 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors flex gap-2.5 items-start text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                          <div className="flex-1 min-w-0">
                            <p className="leading-snug break-words">{act.text}</p>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block mt-0.5">{act.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-4 py-2 border-t border-slate-50 dark:border-slate-700 text-[10px] text-slate-400 dark:text-slate-500 font-bold text-center bg-slate-50/30 dark:bg-slate-800/30">
                  Logs represent current active browser session
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
