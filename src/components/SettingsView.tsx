import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Shield, 
  RotateCcw, 
  AlertTriangle, 
  Sparkles, 
  Sun, 
  Moon, 
  Monitor,
  Smartphone,
  ChevronRight,
  ChevronDown,
  Info,
  Sliders,
  LogOut,
  Check,
  FileText
} from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useFCM } from '../hooks/useFCM';

interface SettingsViewProps {
  onResetData: () => Promise<void>;
  onLogout?: () => void;
}

export default function SettingsView({ onResetData, onLogout }: SettingsViewProps) {
  const { theme, setTheme } = useTheme();
  const { permission, requestPermissionAndGetToken, disableNotifications, refreshToken, isSupported, isLoading, token } = useFCM();
  const [threshold, setThreshold] = useState(75);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  
  // Expanded sections state
  const [expandedSection, setExpandedSection] = useState<string | null>('notifications');

  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);

  React.useEffect(() => {
    if (import.meta.env.DEV) {
      const fetchScheduler = async () => {
        try {
          const res = await fetch('/api/dev/scheduler-status');
          if (res.ok) setSchedulerStatus(await res.json());
        } catch (e) {
          console.error("Scheduler fetch failed", e);
        }
      };
      fetchScheduler();
      const interval = setInterval(fetchScheduler, 10000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleNotificationToggle = async () => {
    if (!token) {
      const newToken = await requestPermissionAndGetToken();
      if (newToken) {
        alert("Push notifications enabled securely! 🔔");
      } else {
        alert("Permission denied or failed. Please check your browser settings.");
      }
    } else {
      await disableNotifications();
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all subject attendance logs back to initial values? This action cannot be undone.')) {
      return;
    }

    setIsResetting(true);
    try {
      await onResetData();
      setResetMessage('Registers reset successfully! 🔄');
      setTimeout(() => setResetMessage(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to reset registers.');
    } finally {
      setIsResetting(false);
    }
  };

  const toggleSection = (key: string) => {
    setExpandedSection(prev => (prev === key ? null : key));
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in max-w-2xl mx-auto" id="settings-view-stage">
      
      {/* Header: Screen 9 style */}
      <div className="pt-1 pb-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium mt-0.5">
          Manage notifications, theme, and system preferences
        </p>
      </div>

      {resetMessage && (
        <div className="bg-emerald-50 dark:bg-[#22C55E]/15 border border-emerald-200 dark:border-[#22C55E]/30 text-[#16A34A] dark:text-[#22C55E] rounded-xl p-3 text-xs font-semibold text-center animate-fade-in">
          {resetMessage}
        </div>
      )}

      {/* Main Settings Menu Card (Screen 9) */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#26354A] overflow-hidden divide-y divide-slate-200 dark:divide-[#26354A]/60 shadow-xs">
        
        {/* 1. Notifications */}
        <div>
          <div 
            onClick={() => toggleSection('notifications')}
            className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#26354A]/30 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-[#38BDF8]/10 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] block">Notifications</span>
                <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block">Push alerts, reminders</span>
              </div>
            </div>
            {expandedSection === 'notifications' ? (
              <ChevronDown className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#94A3B8]" />
            )}
          </div>

          {/* Expanded Panel: Push Notifications */}
          {expandedSection === 'notifications' && (
            <div className="px-4 py-3.5 bg-slate-50/70 dark:bg-[#0F172A]/50 border-t border-slate-200 dark:border-[#26354A]/40 space-y-3">
              <div className="flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-900 dark:text-[#F8FAFC] font-bold block">Push Notifications</span>
                  <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block mt-0.5">
                    {isSupported ? 'Receive real-time push alerts on this device.' : 'Not supported on this browser.'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={!!token}
                  disabled={!isSupported || permission === 'denied' || isLoading}
                  onChange={handleNotificationToggle}
                  className="w-9 h-5 bg-slate-200 dark:bg-[#0F172A] checked:bg-[#0284C7] dark:checked:bg-[#38BDF8] rounded-full appearance-none cursor-pointer transition-colors relative before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform disabled:opacity-50 border border-slate-300 dark:border-[#26354A]"
                />
              </div>

              {/* Dev Test Button */}
              {import.meta.env.DEV && (
                <div className="pt-2 border-t border-slate-200 dark:border-[#26354A]/60 flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const authToken = localStorage.getItem('auth_token');
                        const res = await fetch('/api/notifications/test', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${authToken}` }
                        });
                        if (res.ok) {
                          const data = await res.json();
                          if (data.successCount > 0) {
                            alert(`Push notification delivered! Success: ${data.successCount}`);
                          } else {
                            alert(data.message || 'Push test failed. Check FCM config.');
                          }
                        }
                      } catch {
                        alert('Push test error');
                      }
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-[#38BDF8]/15 dark:hover:bg-[#38BDF8]/25 border border-sky-200 dark:border-[#38BDF8]/30 text-[#0284C7] dark:text-[#38BDF8] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Send Test Push</span>
                  </button>
                  <button
                    onClick={refreshToken}
                    disabled={isLoading}
                    className="py-2 px-3 rounded-lg bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-[#26354A] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Appearance */}
        <div>
          <div 
            onClick={() => toggleSection('appearance')}
            className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#26354A]/30 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-[#38BDF8]/10 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] block">Appearance</span>
                <span className="text-[11px] text-[#0284C7] dark:text-[#38BDF8] font-semibold block capitalize">
                  {theme === 'system' ? 'System Theme Active' : `${theme} Mode Active`}
                </span>
              </div>
            </div>
            {expandedSection === 'appearance' ? (
              <ChevronDown className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#94A3B8]" />
            )}
          </div>

          {/* Expanded Panel: Theme Selection */}
          {expandedSection === 'appearance' && (
            <div className="px-4 py-3.5 bg-slate-50/70 dark:bg-[#0F172A]/50 border-t border-slate-200 dark:border-[#26354A]/40">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="theme-btn-light"
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm'
                      : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#26354A] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#26354A]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                  {theme === 'light' && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                <button
                  type="button"
                  id="theme-btn-dark"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[#38BDF8] text-slate-950 border-[#38BDF8] shadow-sm'
                      : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#26354A] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#26354A]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                  {theme === 'dark' && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                <button
                  type="button"
                  id="theme-btn-system"
                  onClick={() => setTheme('system')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    theme === 'system'
                      ? 'bg-slate-800 text-white dark:bg-[#38BDF8] dark:text-slate-950 border-slate-800 dark:border-[#38BDF8] shadow-sm'
                      : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#26354A] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#26354A]'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>System</span>
                  {theme === 'system' && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Privacy & Security */}
        <div>
          <div 
            onClick={() => toggleSection('privacy')}
            className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#26354A]/30 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-[#38BDF8]/10 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] block">Privacy & Security</span>
                <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block">Data protection, backup</span>
              </div>
            </div>
            {expandedSection === 'privacy' ? (
              <ChevronDown className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#94A3B8]" />
            )}
          </div>

          {/* Expanded Panel: Danger Zone */}
          {expandedSection === 'privacy' && (
            <div className="px-4 py-3.5 bg-slate-50/70 dark:bg-[#0F172A]/50 border-t border-slate-200 dark:border-[#26354A]/40 space-y-3">
              <div className="text-xs">
                <span className="text-slate-900 dark:text-[#F8FAFC] font-bold block">Reset Attendance Registers</span>
                <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block mt-0.5">
                  Resets all course attendance records back to initial mock values.
                </span>
              </div>
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-[#EF4444]/15 dark:hover:bg-[#EF4444]/25 text-[#DC2626] dark:text-[#EF4444] border border-rose-200 dark:border-[#EF4444]/30 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isResetting ? 'Resetting...' : 'Reset Attendance Registers'}</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. App Preferences */}
        <div>
          <div 
            onClick={() => toggleSection('preferences')}
            className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#26354A]/30 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-[#38BDF8]/10 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] block">App Preferences</span>
                <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block">Default target, semester</span>
              </div>
            </div>
            {expandedSection === 'preferences' ? (
              <ChevronDown className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#94A3B8]" />
            )}
          </div>

          {/* Expanded Panel: Defaults */}
          {expandedSection === 'preferences' && (
            <div className="px-4 py-3.5 bg-slate-50/70 dark:bg-[#0F172A]/50 border-t border-slate-200 dark:border-[#26354A]/40 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-900 dark:text-[#F8FAFC] font-bold">Default Target Threshold</span>
                <span className="text-[#0284C7] dark:text-[#38BDF8] font-black">{threshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-[#0284C7] dark:accent-[#38BDF8]"
              />
              <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block">Applied automatically when adding any new subject.</span>
            </div>
          )}
        </div>

        {/* 5. Legal */}
        <div>
          <div 
            onClick={() => toggleSection('legal')}
            className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#26354A]/30 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-[#38BDF8]/10 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] block">Legal</span>
                <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block">Privacy policy & terms</span>
              </div>
            </div>
            {expandedSection === 'legal' ? (
              <ChevronDown className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#94A3B8]" />
            )}
          </div>

          {/* Expanded Panel: Legal */}
          {expandedSection === 'legal' && (
            <div className="px-4 py-3.5 bg-slate-50/70 dark:bg-[#0F172A]/50 border-t border-slate-200 dark:border-[#26354A]/40 space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-[#F8FAFC]">Privacy Policy</h4>
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-0.5 leading-relaxed">
                  Track75 processes student attendance logs, target metrics, and course rosters strictly for eligibility calculation and reminder delivery. Registers are stored in your encrypted local profile and synced with your authenticated backend. Data is never shared with third-party brokers.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-[#26354A]/40">
                <h4 className="font-bold text-slate-900 dark:text-[#F8FAFC]">Terms of Service</h4>
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-0.5 leading-relaxed">
                  Track75 is an attendance management and intelligence software tool created to assist students in tracking and maintaining minimum 75% attendance criteria. Predicted safe bunks and consecutive recovery metrics serve as planning aids.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 6. About Track75 */}
        <div>
          <div 
            onClick={() => toggleSection('about')}
            className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#26354A]/30 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-[#38BDF8]/10 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] block">About Track75</span>
                <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block">Version 2.4.0, licenses</span>
              </div>
            </div>
            {expandedSection === 'about' ? (
              <ChevronDown className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#94A3B8]" />
            )}
          </div>

          {/* Expanded Panel: System & Device Info */}
          {expandedSection === 'about' && (
            <div className="px-4 py-3.5 bg-slate-50/70 dark:bg-[#0F172A]/50 border-t border-slate-200 dark:border-[#26354A]/40 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-[#94A3B8]">
                <span>Version:</span>
                <span className="text-slate-900 dark:text-[#F8FAFC] font-bold">2.4.0 (Mobile First)</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-[#94A3B8]">
                <span>PWA Service Worker:</span>
                <span className="text-[#16A34A] dark:text-[#22C55E] font-bold">{'serviceWorker' in navigator ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-[#94A3B8]">
                <span>Background Scheduler:</span>
                <span className="text-[#0284C7] dark:text-[#38BDF8] font-bold">
                  {schedulerStatus?.status ? schedulerStatus.status.toUpperCase() : 'Active (30m)'}
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Sign Out Red Button (Screen 9) */}
      {onLogout && (
        <button
          onClick={onLogout}
          className="w-full py-3 bg-rose-50 hover:bg-rose-100 dark:bg-[#EF4444]/15 dark:hover:bg-[#EF4444]/25 text-[#DC2626] dark:text-[#EF4444] border border-rose-200 dark:border-[#EF4444]/30 font-bold rounded-xl text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
          id="btn-settings-logout"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      )}

    </div>
  );
}
