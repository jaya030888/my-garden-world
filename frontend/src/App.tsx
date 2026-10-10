import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GardenProvider } from './context/GardenContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { OutsideModeModal } from './components/modals/OutsideModeModal';
import { AuthModal } from './components/modals/AuthModal';
import { DashboardPage } from './pages/Dashboard';
import { DiscoverPage } from './pages/Discover';
import { GrowPage } from './pages/Grow';
import { GardenPage } from './pages/Garden';
import { PlayPage } from './pages/Play';
import { SettingsPage } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <GardenProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-surface-bg text-text-primary selection:bg-emerald-500/30 selection:text-emerald-300">
            
            {/* Top Sticky Navigation Bar */}
            <Navbar />

            {/* Main Application Router Content */}
            <main className="flex-1 pb-20 md:pb-8">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/grow" element={<GrowPage />} />
                <Route path="/garden" element={<GardenPage />} />
                <Route path="/play" element={<PlayPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Modals */}
            <OutsideModeModal />
            <AuthModal />

            {/* Mobile Viewport Bottom Navigation Bar */}
            <BottomNav />

          </div>
        </BrowserRouter>
      </GardenProvider>
    </AuthProvider>
  );
};

export default App;
