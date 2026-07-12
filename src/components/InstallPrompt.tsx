import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if app is already installed or if user dismissed recently
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    const dismissedAt = localStorage.getItem('track75_install_dismissed');
    
    if (isInstalled) return;

    if (dismissedAt) {
      const dismissTime = parseInt(dismissedAt, 10);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissTime < sevenDays) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('track75_install_dismissed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-indigo-500/10 dark:shadow-black/40 border border-slate-100 dark:border-slate-700 p-4 z-50 animate-slide-up flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
          <Download className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Install Track75</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track attendance offline and get alerts.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstall}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
