import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Sprout, Compass, Settings, Camera } from 'lucide-react';
import { useGarden } from '../../context/GardenContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { openScanner } = useGarden();

  // Hide on main garden screens to avoid covering the game toolbelt on mobile
  if (location.pathname === '/' || location.pathname === '/garden') {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-lg border-t border-forest-100 dark:border-stone-800 py-1.5 px-3 shadow-lg">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            location.pathname === '/' ? 'text-forest-700 dark:text-emerald-400 font-bold scale-105' : 'text-stone-500 hover:text-forest-600'
          }`}
        >
          <div className={`p-1 rounded-xl ${location.pathname === '/' ? 'bg-forest-100 dark:bg-emerald-950/60 text-forest-800 dark:text-emerald-300' : ''}`}>
            <Home className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5">Garden</span>
        </Link>

        <Link
          to="/grow"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            location.pathname === '/grow' ? 'text-forest-700 dark:text-emerald-400 font-bold scale-105' : 'text-stone-500 hover:text-forest-600'
          }`}
        >
          <div className={`p-1 rounded-xl ${location.pathname === '/grow' ? 'bg-forest-100 dark:bg-emerald-950/60 text-forest-800 dark:text-emerald-300' : ''}`}>
            <Sprout className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5">My Plants</span>
        </Link>

        {/* ELEVATED CENTRAL SCAN BUTTON */}
        <button
          onClick={openScanner}
          className="-mt-5 p-3 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-[0_6px_20px_rgba(16,185,129,0.4)] border-4 border-white dark:border-stone-900 active:scale-95 transition-transform flex flex-col items-center justify-center cursor-pointer"
          title="Scan Plant"
        >
          <Camera className="w-5 h-5 text-white" />
        </button>

        <Link
          to="/play"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            location.pathname === '/play' ? 'text-forest-700 dark:text-emerald-400 font-bold scale-105' : 'text-stone-500 hover:text-forest-600'
          }`}
        >
          <div className={`p-1 rounded-xl ${location.pathname === '/play' ? 'bg-forest-100 dark:bg-emerald-950/60 text-forest-800 dark:text-emerald-300' : ''}`}>
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5">Quests</span>
        </Link>

        <Link
          to="/settings"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            location.pathname === '/settings' ? 'text-forest-700 dark:text-emerald-400 font-bold scale-105' : 'text-stone-500 hover:text-forest-600'
          }`}
        >
          <div className={`p-1 rounded-xl ${location.pathname === '/settings' ? 'bg-forest-100 dark:bg-emerald-950/60 text-forest-800 dark:text-emerald-300' : ''}`}>
            <Settings className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5">Settings</span>
        </Link>
      </div>
    </nav>
  );
};
