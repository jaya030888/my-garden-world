import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Sprout, Award, Compass, Settings } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/discover', label: 'Discover', icon: Sparkles },
    { path: '/grow', label: 'Grow', icon: Sprout },
    { path: '/garden', label: 'Garden', icon: Award },
    { path: '/play', label: 'Quests', icon: Compass },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-forest-100 py-1.5 px-3 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive ? 'text-forest-700 font-semibold scale-105' : 'text-stone-500 hover:text-forest-600'
              }`}
            >
              <div className={`p-1 rounded-xl ${isActive ? 'bg-forest-100 text-forest-800' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
