import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Coins, Award, Compass, Sprout, Footprints, LogIn, LogOut, Settings } from 'lucide-react';
import { useGarden } from '../../context/GardenContext';
import { useAuth } from '../../context/AuthContext';
import { calculateXpForNextLevel } from '../../services/economyService';

export const Navbar: React.FC = () => {
  const { profile, startOutsideMode } = useGarden();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const location = useLocation();

  const currentLevel = user?.level || profile?.level || 1;
  const currentXp = user?.xp || profile?.xp || 0;
  const currentCoins = user?.coins !== undefined ? user.coins : (profile?.floraCoins ?? 0);

  const xpNeeded = calculateXpForNextLevel(currentLevel);
  const xpPercentage = Math.min(100, Math.round((currentXp / xpNeeded) * 100));

  const navLinks = [
    { path: '/', label: 'Overview', icon: Sprout },
    { path: '/discover', label: 'Scan & Discover', icon: Sparkles },
    { path: '/grow', label: 'My Plants', icon: Sprout },
    { path: '/garden', label: 'Virtual Garden', icon: Award },
    { path: '/play', label: 'Quests', icon: Compass },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-forest-100/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-forest-800 to-forest-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Sprout className="w-4 h-4 text-emerald-200" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-base text-forest-950 tracking-tight leading-none">FloraQuest</span>
            <span className="text-[10px] font-semibold text-forest-600 tracking-wide mt-0.5">My Garden World</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-forest-50/70 p-1 rounded-2xl border border-forest-100/80">
          {navLinks.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-forest-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-forest-900 hover:bg-forest-100/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-forest-600'}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions & Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Go Outside Quick Action */}
          <button
            onClick={startOutsideMode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/20 rounded-xl text-xs font-bold transition-all hover:scale-102"
            title="Step outside for mindfulness & nature observation"
          >
            <Footprints className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Go Outside</span>
          </button>

          {/* Flora Coins Badge */}
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl">
            <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="text-xs font-extrabold text-amber-950">{currentCoins}</span>
          </div>

          {/* Level Badge */}
          <Link
            to="/play"
            className="flex items-center gap-1.5 bg-forest-50 border border-forest-200/80 px-2.5 py-1 rounded-xl hover:bg-forest-100/80 transition-colors"
            title={`Level ${currentLevel} • ${currentXp}/${xpNeeded} XP`}
          >
            <div className="w-4.5 h-4.5 rounded-md bg-forest-700 text-white flex items-center justify-center text-[10px] font-extrabold">
              {currentLevel}
            </div>
            <div className="w-10 h-1.5 bg-forest-200/80 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-forest-600 rounded-full transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </Link>

          {/* Auth Button */}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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
