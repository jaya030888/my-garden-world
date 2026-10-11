import React from 'react';
import { Download, X, Smartphone, WifiOff } from 'lucide-react';
import { usePWA } from '../../context/PWAContext';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isOnline, showInstallBanner, promptInstall, dismissInstallBanner } = usePWA();

  const handleInstallClick = async () => {
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      dismissInstallBanner();
    }
  };

  return (
    <>
      {/* 1. Offline Mode Alert Ribbon */}
      {!isOnline && (
        <div className="bg-amber-600 dark:bg-amber-700 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-sm animate-fadeIn">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>Offline Mode Active — Your saved plants, journal, and virtual garden sanctuary are running locally via IndexedDB.</span>
        </div>
      )}

      {/* 2. Floating PWA Install Card / Banner */}
      {!isInstalled && isInstallable && showInstallBanner && (
        <aside 
          aria-label="Install My Garden World application"
          className="fixed bottom-16 md:bottom-6 right-3 sm:right-6 z-40 max-w-sm w-[calc(100vw-1.5rem)] bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-3.5 shadow-2xl transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-800 dark:bg-emerald-950 flex items-center justify-center text-emerald-300 shrink-0 border border-emerald-600/30">
              <img src="/icons/icon-192.png" alt="App Icon" className="w-8 h-8 rounded-lg" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="font-bold text-xs sm:text-sm text-forest-950 dark:text-emerald-50 truncate">
                  Install Garden World
                </h4>
                <button
                  onClick={dismissInstallBanner}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-0.5 rounded-md transition-colors"
                  title="Dismiss banner"
                  aria-label="Dismiss install banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                Add to your home screen for instant camera access and offline botanical care.
              </p>

              <div className="flex items-center gap-2 mt-2.5">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
                <button
                  onClick={dismissInstallBanner}
                  className="px-2.5 py-1.5 rounded-xl text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
};
