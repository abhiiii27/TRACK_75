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
          fixed inset-y-0 left-0 z-50 md:sticky md:z-30 flex flex-col bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] border-r border-slate-200 dark:border-[#26354A] transition-all duration-300 ease-in-out h-screen
          ${isOpenMobile ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
        id="app-sidebar-container"
      >
        {/* Sidebar Brand Header */}
        <div className="px-5 py-5 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-[#26354A]" id="sidebar-header-brand">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-[#38BDF8] text-slate-950 rounded-xl shrink-0 shadow-xs">
              <GraduationCap className="w-5 h-5 stroke-[2.5]" />
            </div>
            {(!isCollapsed || isOpenMobile) && (
              <div className="flex flex-col animate-fade-in whitespace-nowrap">
                <span className="font-black text-slate-900 dark:text-[#F8FAFC] text-base tracking-tight leading-none mb-1">Track75</span>
                <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-bold uppercase tracking-wider">Attendance Intelligence</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center p-1.5 text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#26354A] rounded-lg transition-all cursor-pointer border border-slate-200 dark:border-[#26354A]"
            id="btn-sidebar-collapse"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Close button for mobile */}
          {isOpenMobile && (
            <button
              onClick={() => setIsOpenMobile(false)}
              className="md:hidden flex items-center justify-center p-1.5 text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#26354A] rounded-lg transition-all cursor-pointer border border-slate-200 dark:border-[#26354A]"
              id="btn-mobile-close"
              title="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Scrollable menu center */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar py-3" id="sidebar-inner-scroll">
          {/* Navigation Menu Categories */}
          <nav className="px-3 space-y-1" id="sidebar-nav-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handlePageSelect(item.key)}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-normal transition-all cursor-pointer group relative
                    ${isActive 
                      ? 'bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-[#38BDF8] border border-sky-200 dark:border-sky-500/30 font-bold' 
                      : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#1E293B]'
                    }
                  `}
                  id={`sidebar-item-${item.key}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-sky-600 dark:text-[#38BDF8]' : 'text-slate-500 dark:text-[#94A3B8] group-hover:text-slate-900 dark:group-hover:text-[#F8FAFC]'}`} />
                  {(!isCollapsed || isOpenMobile) && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {/* Tooltip for Collapsed view */}
                  {isCollapsed && !isOpenMobile && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-[#F8FAFC] text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md border border-slate-200 dark:border-[#26354A] z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Settings Section */}
        <div className="px-3 py-3 border-t border-slate-200 dark:border-[#26354A] bg-white dark:bg-[#0F172A] shrink-0" id="sidebar-profile-section">
          {(!isCollapsed || isOpenMobile) ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-[#172033] border border-slate-200 dark:border-[#26354A]" id="profile-card-container">
              {/* Profile Clickable Area */}
              <button
                onClick={() => handlePageSelect('profile')}
                className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer group"
                id="profile-card-trigger"
              >
                <div className="w-8 h-8 bg-sky-500/15 text-sky-600 dark:text-[#38BDF8] rounded-full flex items-center justify-center font-bold text-xs border border-sky-500/30 shrink-0">
                  {profileInitials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] truncate group-hover:text-sky-600 dark:group-hover:text-[#38BDF8] transition-colors">
                    {profileName}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] truncate">
                    Student Account
                  </span>
                </div>
              </button>

              {/* Settings Icon */}
              <button
                onClick={() => handlePageSelect('settings')}
                className="p-1.5 text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] hover:bg-slate-200 dark:hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer"
                id="sidebar-profile-settings-btn"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5 py-1" id="profile-card-collapsed-container">
              {/* Collapsed Profile Avatar */}
              <button
                onClick={() => handlePageSelect('profile')}
                className="w-8 h-8 bg-sky-500/15 text-sky-600 dark:text-[#38BDF8] rounded-full flex items-center justify-center font-bold text-xs border border-sky-500/30 cursor-pointer hover:bg-sky-500/25 transition-colors group relative"
                id="profile-card-collapsed-trigger"
              >
                {profileInitials}
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-[#F8FAFC] text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md border border-slate-200 dark:border-[#26354A] z-50">
                  Profile ({profileName})
                </div>
              </button>

              {/* Collapsed Settings Icon */}
              <button
                onClick={() => handlePageSelect('settings')}
                className="p-1.5 text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] hover:bg-slate-200 dark:hover:bg-[#1E293B] rounded-lg transition-colors cursor-pointer group relative"
                id="sidebar-collapsed-settings-btn"
              >
                <Settings className="w-4 h-4" />
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-[#F8FAFC] text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md border border-slate-200 dark:border-[#26354A] z-50">
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
