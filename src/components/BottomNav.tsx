import React from 'react';
import { Home, BookOpen, TrendingUp, BarChart3, User, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const BottomNav = function BottomNav({ activePage, setActivePage }: BottomNavProps) {
  const tabs = [
    { key: 'dashboard', label: 'Home', icon: Home },
    { key: 'subjects', label: 'Subjects', icon: BookOpen },
    { key: 'predictor', label: 'Predictor', icon: TrendingUp },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-around h-16 px-2 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.2)]"
      id="mobile-bottom-navigation-bar"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activePage === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => setActivePage(tab.key)}
            className="flex flex-col items-center justify-center flex-1 h-full relative py-1 cursor-pointer"
            id={`bottom-nav-${tab.key}`}
          >
            {/* Active Bubble Background Indicator */}
            {isActive && (
              <motion.div
                layoutId="active-mobile-bubble"
                className="absolute inset-x-2 top-1.5 bottom-1.5 bg-indigo-50 dark:bg-indigo-950/45 rounded-xl -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}

            <Icon 
              className={`w-5 h-5 transition-colors duration-200 ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`} 
            />
            <span 
              className={`text-[9px] font-bold tracking-tight mt-1 transition-colors duration-200 ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
export default React.memo(BottomNav);
