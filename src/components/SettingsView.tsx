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
  Smartphone
} from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useFCM } from '../hooks/useFCM';

interface SettingsViewProps {
  onResetData: () => Promise<void>;
}

export default function SettingsView({ onResetData }: SettingsViewProps) {
  const { theme, setTheme } = useTheme();
  const { permission, requestPermissionAndGetToken, disableNotifications, isSupported, isLoading } = useFCM();
  const [emailAlerts, setEmailAlerts] = useState(false); // Coming soon
  const [dailyReminders, setDailyReminders] = useState(false); // Coming soon
  const [threshold, setThreshold] = useState(75);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleNotificationToggle = async () => {
    if (permission !== 'granted') {
      const token = await requestPermissionAndGetToken();
      if (token) {
        alert("Push notifications enabled securely! 🔔");
      } else {
        alert("Permission denied or failed. Please check your browser settings.");
      }
    } else {
      await disableNotifications();
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all subject attendance logs back to the default initial values? This action cannot be undone.')) {
      return;
    }

    setIsResetting(true);
    try {
      await onResetData();
      setResetMessage('Database and local registers reset successfully! 🔄');
      setTimeout(() => setResetMessage(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to reset registers.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="settings-view-stage">
      
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" />
          System Preferences & Settings
        </h2>
        <p className="text-xs text-slate-400 dark:text-[#CBD5E1] font-medium font-sans">Configure thresholds, appearance, notifications, and database registers</p>
      </div>

      <div className="max-w-3xl space-y-6" id="settings-content-wrapper">
        
        {/* Appearance Preference Card */}
        <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs space-y-5">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
            Appearance Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center gap-2.5 p-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'bg-white dark:bg-[#1F2937] border-slate-100 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#1E293B]/60'
              }`}
              id="theme-select-light"
            >
              <Sun className="w-4.5 h-4.5" />
              🌞 Light Mode
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center gap-2.5 p-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'bg-white dark:bg-[#1F2937] border-slate-100 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#1E293B]/60'
              }`}
              id="theme-select-dark"
            >
              <Moon className="w-4.5 h-4.5" />
              🌙 Dark Mode
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`flex items-center justify-center gap-2.5 p-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                theme === 'system'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'bg-white dark:bg-[#1F2937] border-slate-100 dark:border-[#334155] text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#1E293B]/60'
              }`}
              id="theme-select-system"
            >
              <Monitor className="w-4.5 h-4.5" />
              💻 System Default
            </button>
          </div>
        </div>

        {/* Card 1: Notification & Alert Triggers */}
        <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs space-y-5">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-indigo-500" />
            Notifications
          </h3>

          <div className="space-y-4 pt-1">
            {/* Row 1: Browser Notifications (Functional) */}
            <div className="flex items-center justify-between gap-4 text-xs font-semibold">
              <div>
                <span className="text-slate-800 dark:text-[#F8FAFC] block">Browser Notifications</span>
                <span className="text-[10px] text-slate-400 dark:text-[#CBD5E1] font-medium block mt-0.5">
                  {isSupported ? 'Receive real-time push alerts on this device.' : 'Not supported on this browser.'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={permission === 'granted'}
                disabled={!isSupported || permission === 'denied' || isLoading}
                onChange={handleNotificationToggle}
                className="w-9 h-5 bg-slate-200 dark:bg-slate-700 checked:bg-indigo-600 rounded-full appearance-none cursor-pointer transition-colors relative before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform disabled:opacity-50"
              />
            </div>

            {/* Row 2: Attendance Alerts (Coming Soon) */}
            <div className="flex items-center justify-between gap-4 text-xs font-semibold border-t border-slate-50 dark:border-[#334155] pt-4 opacity-50">
              <div>
                <span className="text-slate-800 dark:text-[#F8FAFC] block">Attendance Alerts (Coming Soon)</span>
                <span className="text-[10px] text-slate-400 dark:text-[#CBD5E1] font-medium block mt-0.5">Critical low attendance warnings.</span>
              </div>
              <input type="checkbox" disabled className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none" />
            </div>

            {/* Row 3: AI Recommendations (Coming Soon) */}
            <div className="flex items-center justify-between gap-4 text-xs font-semibold border-t border-slate-50 dark:border-[#334155] pt-4 opacity-50">
              <div>
                <span className="text-slate-800 dark:text-[#F8FAFC] block">AI Recommendations (Coming Soon)</span>
                <span className="text-[10px] text-slate-400 dark:text-[#CBD5E1] font-medium block mt-0.5">Daily actionable tasks.</span>
              </div>
              <input type="checkbox" disabled className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none" />
            </div>

            {/* Row 4: Weekly Summary (Coming Soon) */}
            <div className="flex items-center justify-between gap-4 text-xs font-semibold border-t border-slate-50 dark:border-[#334155] pt-4 opacity-50">
              <div>
                <span className="text-slate-800 dark:text-[#F8FAFC] block">Weekly Summary (Coming Soon)</span>
                <span className="text-[10px] text-slate-400 dark:text-[#CBD5E1] font-medium block mt-0.5">Recap of your week's performance.</span>
              </div>
              <input type="checkbox" disabled className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none" />
            </div>

            {/* Row 5: System Updates (Coming Soon) */}
            <div className="flex items-center justify-between gap-4 text-xs font-semibold border-t border-slate-50 dark:border-[#334155] pt-4 opacity-50">
              <div>
                <span className="text-slate-800 dark:text-[#F8FAFC] block">System Updates (Coming Soon)</span>
                <span className="text-[10px] text-slate-400 dark:text-[#CBD5E1] font-medium block mt-0.5">New features and improvements.</span>
              </div>
              <input type="checkbox" disabled className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none" />
            </div>
          </div>
        </div>

        {/* PWA Status */}
        <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs space-y-5">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Smartphone className="w-4.5 h-4.5 text-indigo-500" />
            PWA Status
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block mb-1">Service Worker</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {'serviceWorker' in navigator ? 'Active' : 'Unsupported'}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block mb-1">Installation</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {window.matchMedia('(display-mode: standalone)').matches ? 'Installed' : 'Browser Mode'}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block mb-1">Network</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {navigator.onLine ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block mb-1">Permissions</span>
              <span className="font-semibold text-slate-900 dark:text-white capitalize">
                {permission}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Initial Defaults */}
        <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-slate-100 dark:border-[#334155] shadow-xs space-y-5">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Shield className="w-4.5 h-4.5 text-indigo-500" />
            New Subject Defaults
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col text-xs font-semibold">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-800 dark:text-[#F8FAFC]">Initial Target Percentage</span>
                <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">{threshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-[10px] text-slate-400 dark:text-[#CBD5E1] font-medium mt-1">Default target automatically suggested when creating new course cards.</span>
            </div>
          </div>
        </div>

        {/* Card 3: Danger Zone */}
        <div className="bg-rose-50/40 dark:bg-rose-950/10 rounded-3xl p-6 border border-rose-100/50 dark:border-rose-900/40 space-y-5" id="settings-danger-zone">
          <h3 className="text-sm font-extrabold text-rose-800 dark:text-rose-400 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" />
            Danger Zone
          </h3>

          {resetMessage && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 rounded-2xl p-4 text-xs font-semibold animate-fade-in">
              {resetMessage}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-semibold">
            <div>
              <span className="text-rose-950 dark:text-rose-250 block">Reset Attendance Registers</span>
              <span className="text-[10px] text-rose-700/70 dark:text-rose-400/70 font-medium block mt-0.5">Resets all attendance values and added subjects to the initial sandbox registers.</span>
            </div>

            <button
              onClick={handleReset}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0 disabled:opacity-60"
              id="btn-factory-reset"
            >
              <RotateCcw className="w-4 h-4" />
              {isResetting ? 'Resetting...' : 'Reset Registers'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
