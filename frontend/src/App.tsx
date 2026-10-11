import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GardenProvider } from './context/GardenContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { AuthModal } from './components/modals/AuthModal';
import { AIScannerModal } from './components/garden/AIScannerModal';
import { useGarden } from './context/GardenContext';
import { DashboardPage } from './pages/Dashboard';
import { DiscoverPage } from './pages/Discover';
import { GrowPage } from './pages/Grow';
import { GardenPage } from './pages/Garden';
import { PlayPage } from './pages/Play';
import { SettingsPage } from './pages/Settings';

import { ThemeProvider } from './context/ThemeContext';
import { PWAProvider } from './context/PWAContext';
import { PWAInstallBanner } from './components/layout/PWAInstallBanner';

const AppContent: React.FC = () => {
  const location = useLocation();
  const { isScannerOpen, closeScanner } = useGarden();
  const isGardenCanvas = location.pathname === '/garden';

  return (
    <div className="min-h-[100dvh] flex flex-col bg-surface-bg text-text-primary selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* PWA Offline / Installation Banner */}
      <PWAInstallBanner />

      {/* Top Sticky Navigation Bar */}
      <Navbar />

      {/* Main Application Router Content */}
      <main className={`flex-1 ${isGardenCanvas ? 'pb-0' : 'pb-24 md:pb-12'}`}>
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

      {/* Global Modals */}
      <AuthModal />
      <AIScannerModal isOpen={isScannerOpen} onClose={closeScanner} />

      {/* Mobile Viewport Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <PWAProvider>
        <AuthProvider>
          <GardenProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </GardenProvider>
        </AuthProvider>
      </PWAProvider>
    </ThemeProvider>
  );
};

export default App;

