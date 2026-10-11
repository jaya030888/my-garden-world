import React from 'react';
import { Link } from 'react-router-dom';
import { Coins, Sprout, Leaf, LogIn, LogOut, Camera, Sparkles, Sun, Moon } from 'lucide-react';
import { useGarden } from '../../context/GardenContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { calculateXpForNextLevel } from '../../services/economyService';

export const Navbar: React.FC = () => {
  const { profile } = useGarden();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const currentLevel = user?.level || profile?.level || 1;
  const currentXp = user?.xp || profile?.xp || 0;
  const currentCoins = user?.coins !== undefined ? user.coins : (profile?.floraCoins ?? 0);

  const xpNeeded = calculateXpForNextLevel(currentLevel);
  const xpPercentage = Math.min(100, Math.round((currentXp / xpNeeded) * 100));

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border-b border-forest-100/80 dark:border-stone-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-forest-800 to-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Sprout className="w-4 h-4 text-emerald-200" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-sm sm:text-base text-forest-950 dark:text-emerald-50 tracking-tight leading-none">
              My Garden World
            </span>
            <span className="text-[9px] font-bold text-forest-600 dark:text-emerald-400 tracking-wide mt-0.5 hidden xs:inline">
              AI Nature Companion • FloraQuest
            </span>
          </div>
        </Link>

        {/* Navigation Links for Core Pillars */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            to="/discover"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-forest-800 dark:text-emerald-300 hover:bg-forest-50 dark:hover:bg-stone-800 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Plant Discovery</span>
          </Link>

          <Link
            to="/grow"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-forest-800 dark:text-emerald-300 hover:bg-forest-50 dark:hover:bg-stone-800 transition-colors"
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Garden Care</span>
          </Link>

          <Link
            to="/garden"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-forest-800 dark:text-emerald-300 hover:bg-forest-50 dark:hover:bg-stone-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Virtual Garden</span>
          </Link>

          <Link
            to="/play"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-forest-800 dark:text-emerald-300 hover:bg-forest-50 dark:hover:bg-stone-800 transition-colors"
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Quests</span>
          </Link>
        </nav>


        {/* Right Actions & Stats */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Flora Coins Pill */}
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 px-2.5 py-1 rounded-xl shadow-2xs">
            <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="text-xs font-black text-amber-950 dark:text-amber-300">{currentCoins}</span>
          </div>

          {/* Level Badge */}
          <div
            className="flex items-center gap-1.5 bg-forest-50 dark:bg-stone-800 border border-forest-200/80 dark:border-stone-700 px-2.5 py-1 rounded-xl shadow-2xs"
            title={`Level ${currentLevel} • ${currentXp}/${xpNeeded} XP`}
          >
            <div className="w-4 h-4 rounded-md bg-forest-700 text-white flex items-center justify-center text-[9px] font-black">
              {currentLevel}
            </div>
            <div className="w-6 sm:w-8 h-1.5 bg-forest-200 dark:bg-stone-700 rounded-full overflow-hidden hidden xs:block">
              <div
                className="h-full bg-forest-600 dark:bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>

          {/* Theme Mode Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-amber-300 border border-stone-200/80 dark:border-stone-700 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs flex items-center justify-center"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-forest-800" />
            )}
          </button>

          {/* Auth Button */}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
              title={`Signed in as ${user?.username || 'User'}. Click to sign out.`}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <LogIn className="w-3 h-3 text-emerald-300" />
              <span className="hidden xs:inline">Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
