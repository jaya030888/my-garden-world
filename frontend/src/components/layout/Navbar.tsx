import React from 'react';
import { Link } from 'react-router-dom';
import { Coins, Sprout, Leaf, LogIn, LogOut } from 'lucide-react';
import { useGarden } from '../../context/GardenContext';
import { useAuth } from '../../context/AuthContext';
import { calculateXpForNextLevel } from '../../services/economyService';

export const Navbar: React.FC = () => {
  const { profile, startOutsideMode } = useGarden();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  const currentLevel = user?.level || profile?.level || 1;
  const currentXp = user?.xp || profile?.xp || 0;
  const currentCoins = user?.coins !== undefined ? user.coins : (profile?.floraCoins ?? 0);

  const xpNeeded = calculateXpForNextLevel(currentLevel);
  const xpPercentage = Math.min(100, Math.round((currentXp / xpNeeded) * 100));

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-stone-900/85 backdrop-blur-xl border-b border-forest-100/80 dark:border-stone-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-forest-800 to-forest-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Sprout className="w-4 h-4 text-emerald-200" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-sm sm:text-base text-forest-950 dark:text-emerald-50 tracking-tight leading-none">
              FloraQuest
            </span>
            <span className="text-[9px] font-bold text-forest-600 dark:text-emerald-400 tracking-wide mt-0.5">
              Cozy Garden World
            </span>
          </div>
        </Link>

        {/* Right Actions & Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Daily Nature Photo Task Tracker */}
          <button
            onClick={startOutsideMode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-950 dark:text-emerald-200 border border-emerald-500/30 rounded-xl text-xs font-extrabold transition-all hover:scale-102 shadow-xs cursor-pointer"
            title="Daily Nature Task: Photograph 3 leaves or birds outside (+50 Coins)"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Daily Nature Task (+50 🪙)</span>
            <span className="sm:hidden">Task</span>
          </button>

          {/* Flora Coins Pill */}
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 px-2.5 py-1 rounded-xl">
            <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="text-xs font-extrabold text-amber-950 dark:text-amber-300">{currentCoins}</span>
          </div>

          {/* Level Badge */}
          <div
            className="flex items-center gap-1.5 bg-forest-50 dark:bg-stone-800 border border-forest-200/80 dark:border-stone-700 px-2 py-1 rounded-xl"
            title={`Level ${currentLevel} • ${currentXp}/${xpNeeded} XP`}
          >
            <div className="w-4 h-4 rounded-md bg-forest-700 text-white flex items-center justify-center text-[9px] font-extrabold">
              {currentLevel}
            </div>
            <div className="w-8 h-1.5 bg-forest-200 dark:bg-stone-700 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-forest-600 dark:bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>

          {/* Auth Button */}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              title={`Signed in as ${user?.username || 'User'}. Click to sign out.`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-300" />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
