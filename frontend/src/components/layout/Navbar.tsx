import React from 'react';
import { Link } from 'react-router-dom';
import { Coins, Sprout, Leaf, LogIn, LogOut, Camera, Sparkles } from 'lucide-react';
import { useGarden } from '../../context/GardenContext';
import { useAuth } from '../../context/AuthContext';
import { calculateXpForNextLevel } from '../../services/economyService';

export const Navbar: React.FC = () => {
  const { profile, openScanner } = useGarden();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

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

        {/* PRIMARY CENTERPIECE: Glowing AI Scan Trigger */}
        <div className="flex items-center justify-center">
          <button
            onClick={openScanner}
            className="group relative flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs sm:text-sm shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.5)] border-2 border-emerald-400/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer animate-subtle-pulse"
            title="Scan any real-world leaf, flower, or plant to unlock rare seeds & earn Flora Coins!"
          >
            <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-white/20 group-hover:scale-110 transition-transform">
              <Camera className="w-3.5 h-3.5 text-emerald-100" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <span className="tracking-wide font-black">Scan Plant</span>
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] bg-emerald-950/40 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30 font-bold">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" /> +50 🪙
            </span>
          </button>
        </div>

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
