import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Coins, Award, Compass, Sprout, Footprints, LogIn, LogOut, CloudCheck, CloudOff, User } from 'lucide-react';
import { useGarden } from '../../context/GardenContext';
import { useAuth } from '../../context/AuthContext';
import { calculateXpForNextLevel } from '../../services/economyService';

export const Navbar: React.FC = () => {
  const { profile, startOutsideMode, serverConnected, isServerSyncing } = useGarden();
  const { user, isAuthenticated, isGuest, openAuthModal, logout } = useAuth();
  const location = useLocation();

  const currentLevel = user?.level || profile?.level || 1;
  const currentXp = user?.xp || profile?.xp || 0;
  const currentCoins = user?.coins !== undefined ? user.coins : (profile?.floraCoins ?? 0);

  const xpNeeded = calculateXpForNextLevel(currentLevel);
  const xpPercentage = Math.min(100, Math.round((currentXp / xpNeeded) * 100));

  const navLinks = [
    { path: '/', label: 'Home', icon: Sprout },
    { path: '/discover', label: 'Discover', icon: Sparkles },
    { path: '/grow', label: 'My Plants', icon: Sprout },
    { path: '/garden', label: 'Virtual Garden', icon: Award },
    { path: '/play', label: 'Quests', icon: Compass },
    { path: '/settings', label: 'Settings', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface-card/90 backdrop-blur-md border-b border-border shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-text-primary leading-tight block">My Garden World</span>
            <span className="text-[10px] font-medium tracking-wider text-emerald-400 uppercase block -mt-0.5">Hacktoberfest 2026</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-surface-input p-1.5 rounded-2xl border border-border">
          {navLinks.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User Stats & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Cloud Sync Status Indicator */}
          <div
            className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border"
            title={
              isAuthenticated
                ? serverConnected
                  ? 'Connected to PostgreSQL Backend (Live Sync)'
                  : 'Backend temporarily unreachable (Operating on Local Cache)'
                : 'Guest Mode: Operating on Local IndexedDB'
            }
          >
            {isAuthenticated ? (
              serverConnected ? (
                <span className="flex items-center gap-1 text-emerald-400 border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <CloudCheck className={`w-3 h-3 ${isServerSyncing ? 'animate-pulse text-amber-400' : ''}`} />
                  <span>Cloud Synced</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  <CloudOff className="w-3 h-3" />
                  <span>Local Cache</span>
                </span>
              )
            ) : (
              <span className="flex items-center gap-1 text-text-muted border-border bg-surface-input px-1.5 py-0.5 rounded">
                <CloudOff className="w-3 h-3" />
                <span>Guest Mode</span>
              </span>
            )}
          </div>

          {/* Go Outside Button */}
          <button
            onClick={startOutsideMode}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all group"
            title="Step outside and record real-world nature observations"
          >
            <Footprints className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Go Outside</span>
          </button>

          {/* Flora Coins Badge */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl shadow-xs">
            <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-amber-300">{currentCoins}</span>
          </div>

          {/* Level & XP Pill */}
          <Link
            to="/play"
            className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl shadow-xs hover:bg-emerald-500/20 transition-colors"
          >
            <div className="w-5 h-5 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center text-[11px] font-extrabold">
              {currentLevel}
            </div>
            <div className="w-10 h-1.5 bg-emerald-950 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-emerald-300 hidden sm:inline">{currentXp} XP</span>
          </Link>

          {/* Auth Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={logout}
                className="p-2 text-text-muted hover:text-rose-400 hover:bg-surface-hover rounded-xl transition-colors"
                title={`Logged in as ${user?.username}. Click to log out.`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-input hover:bg-surface-hover border border-border text-emerald-400 hover:text-emerald-300 rounded-xl text-xs font-semibold transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
