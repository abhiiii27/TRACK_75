import React from 'react';
import { Home, CheckSquare, BarChart2, Bell, User } from 'lucide-react';

interface BottomNavProps {
  activePage: string;
  setActivePage: (page: string) => void;
  unreadAlertsCount?: number;
}

const BottomNav = function BottomNav({ activePage, setActivePage, unreadAlertsCount = 0 }: BottomNavProps) {
  const tabs = [
    { key: 'dashboard', label: 'Home', icon: Home },
    { key: 'subjects', label: 'Attendance', icon: CheckSquare },
    { key: 'analytics', label: 'Analytics', icon: BarChart2 },
    { key: 'alerts', label: 'Alerts', icon: Bell, hasBadge: unreadAlertsCount > 0 },
    { key: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#0F172A] border-t border-slate-200 dark:border-[#26354A] flex items-center justify-around h-16 px-1 pb-safe"
      id="mobile-bottom-navigation-bar"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = 
          activePage === tab.key || 
          (tab.key === 'subjects' && activePage === 'subject-details') ||
          (tab.key === 'profile' && activePage === 'settings');

        return (
          <button
            key={tab.key}
            onClick={() => setActivePage(tab.key)}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors cursor-pointer relative"
            id={`bottom-nav-${tab.key}`}
          >
            <div className="relative">
              <Icon 
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-sky-600 dark:text-[#38BDF8]' : 'text-slate-500 dark:text-[#94A3B8]'
                }`} 
                strokeWidth={isActive ? 2.3 : 1.8}
              />
              {tab.key === 'alerts' && unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-2.5 min-w-[15px] h-3.5 px-1 rounded-full bg-[#EF4444] text-white text-[9px] font-black flex items-center justify-center border border-white dark:border-[#0F172A] leading-none">
                  {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] tracking-tight mt-1 font-medium transition-colors ${
              isActive ? 'text-sky-600 dark:text-[#38BDF8] font-semibold' : 'text-slate-500 dark:text-[#94A3B8]'
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default React.memo(BottomNav);

