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
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 bg-indigo-900 text-white rounded-2xl shadow-2xl p-5 z-50 animate-slide-up flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="bg-indigo-800 p-2 rounded-xl text-indigo-300">
          <RefreshCw className="w-6 h-6 animate-spin-slow" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">New version available</h4>
          <p className="text-xs text-indigo-200 mt-1">
            Track75 has been updated. Update now to get the latest features.
          </p>
        </div>
        <button
          onClick={close}
          className="text-indigo-400 hover:text-white transition-colors"
          aria-label="Later"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => updateServiceWorker(true)}
          className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors text-center"
        >
          Update Now
        </button>
        <button
          onClick={close}
          className="flex-1 bg-indigo-800 hover:bg-indigo-700 text-indigo-100 text-sm font-semibold py-2.5 rounded-xl transition-colors text-center"
        >
          Later
        </button>
      </div>
    </div>
  );
}
