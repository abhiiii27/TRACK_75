import React, { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  TrendingUp, 
  BarChart3, 
  User, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X,
  GraduationCap,
  Plus
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onAddSubject: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

const Sidebar = function Sidebar({ 
  activePage, 
  setActivePage, 
  onAddSubject, 
  isOpenMobile, 
  setIsOpenMobile 
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profileName, setProfileName] = useState('Abhishek');
  const [profileInitials, setProfileInitials] = useState('AB');

  React.useEffect(() => {
    const updateName = () => {
      const authUserStr = localStorage.getItem('auth_user');
      let name = '';
      if (authUserStr) {
        try {
          const authUser = JSON.parse(authUserStr);
          name = authUser.fullName || '';
        } catch (e) {}
      }
      if (!name) {
        name = localStorage.getItem('profile_name') || 'Abhishek Buran';
      }
      
      const firstWord = name.split(' ')[0] || 'Abhishek';
      setProfileName(firstWord);
      
      const initials = name
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'AB';
      setProfileInitials(initials);
    };
    updateName();
    
    // Also listen to storage events
    window.addEventListener('storage', updateName);
    return () => {
      window.removeEventListener('storage', updateName);
    };
  }, [activePage]);

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Home },
    { key: 'subjects', label: 'Subjects', icon: BookOpen },
    { key: 'predictor', label: 'Predictor', icon: TrendingUp },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handlePageSelect = (key: string) => {
    setActivePage(key);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-45"
          id="mobile-overlay"
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 md:sticky md:z-30 flex flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out h-screen
          ${isOpenMobile ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
        id="app-sidebar-container"
      >
        {/* Sidebar Brand Header */}
        <div className="px-6 py-6 flex items-center justify-between shrink-0" id="sidebar-header-brand">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            {(!isCollapsed || isOpenMobile) && (
              <div className="flex flex-col animate-fade-in whitespace-nowrap">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight leading-none mb-1">Attendance</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Planner Pro</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-800/60"
            id="btn-sidebar-collapse"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Close button for mobile */}
          {isOpenMobile && (
            <button
              onClick={() => setIsOpenMobile(false)}
              className="md:hidden flex items-center justify-center p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              id="btn-mobile-close"
              title="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Scrollable menu center */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar py-2" id="sidebar-inner-scroll">
          {/* Navigation Menu Categories */}
          <nav className="px-4 space-y-1" id="sidebar-nav-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handlePageSelect(item.key)}
                  className={`
                    w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-bold tracking-wide transition-all cursor-pointer group relative
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                    }
                  `}
                  id={`sidebar-item-${item.key}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                  {(!isCollapsed || isOpenMobile) && (
                    <span className="animate-fade-in truncate">{item.label}</span>
                  )}
                  {/* Tooltip for Collapsed view */}
                  {isCollapsed && !isOpenMobile && (
                    <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-950 text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Settings Section */}
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 shrink-0" id="sidebar-profile-section">
          {(!isCollapsed || isOpenMobile) ? (
            <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-200" id="profile-card-container">
              {/* Profile Clickable Area */}
              <button
                onClick={() => handlePageSelect('profile')}
                className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer group"
                id="profile-card-trigger"
              >
                <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-extrabold text-xs border border-indigo-100/60 dark:border-indigo-900/30 shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                  {profileInitials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                    {profileName}
                  </span>
                </div>
              </button>

              {/* Settings Icon */}
              <button
                onClick={() => handlePageSelect('settings')}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200 cursor-pointer group"
                id="sidebar-profile-settings-btn"
                title="Settings"
              >
                <Settings className="w-4.5 h-4.5 transition-transform duration-300 group-hover:rotate-45" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-2" id="profile-card-collapsed-container">
              {/* Collapsed Profile Avatar */}
              <button
                onClick={() => handlePageSelect('profile')}
                className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-extrabold text-xs border border-indigo-100/60 dark:border-indigo-900/30 cursor-pointer hover:scale-105 transition-all duration-200 group relative"
                id="profile-card-collapsed-trigger"
              >
                {profileInitials}
                <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-950 text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
                  Profile ({profileName})
                </div>
              </button>

              {/* Collapsed Settings Icon */}
              <button
                onClick={() => handlePageSelect('settings')}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200 cursor-pointer group relative"
                id="sidebar-collapsed-settings-btn"
              >
                <Settings className="w-4.5 h-4.5 transition-transform duration-300 group-hover:rotate-45" />
                <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-950 text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
                  Settings
                </div>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
export default React.memo(Sidebar);
