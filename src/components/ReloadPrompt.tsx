import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export default function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // SW Registered
    },
    onRegisterError(error) {
      // SW Registration error
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#26354A] rounded-2xl shadow-2xl p-5 z-50 animate-slide-up flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="bg-sky-50 dark:bg-[#38BDF8]/15 p-2 rounded-xl text-[#0284C7] dark:text-[#38BDF8]">
          <RefreshCw className="w-6 h-6 animate-spin-slow" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-slate-900 dark:text-[#F8FAFC]">New version available</h4>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
            Track75 has been updated. Update now to get the latest features.
          </p>
        </div>
        <button
          onClick={close}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-[#F8FAFC] transition-colors"
          aria-label="Later"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => updateServiceWorker(true)}
          className="flex-1 bg-[#0284C7] hover:bg-[#0369A1] dark:bg-[#38BDF8] dark:hover:bg-[#0284C7] text-white dark:text-slate-950 text-sm font-semibold py-2.5 rounded-xl transition-colors text-center"
        >
          Update Now
        </button>
        <button
          onClick={close}
          className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-[#26354A] dark:hover:bg-[#334155] text-slate-700 dark:text-[#F8FAFC] text-sm font-semibold py-2.5 rounded-xl transition-colors text-center"
        >
          Later
        </button>
      </div>
    </div>
  );
}
