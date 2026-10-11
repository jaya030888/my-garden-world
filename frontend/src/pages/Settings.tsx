import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Trash2,
  Cpu,
  Wifi,
  WifiOff,
  CheckCircle2,
  RefreshCw,
  FileJson,
  User,
  LogIn,
  LogOut,
  Database,
  Activity,
  Coins,
  Sun,
  Moon
} from 'lucide-react';
import { db } from '../db';
import { useGarden } from '../context/GardenContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { refreshData } = useGarden();
  const { isDark, setTheme } = useTheme();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isClearing, setIsClearing] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [backendHealth, setBackendHealth] = useState<{ status: string; database?: string; timestamp?: string } | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await api.getHealth();
      if (res.success && res.data?.status === 'healthy') {
        setBackendHealth({
          status: 'healthy',
          database: res.data?.database || 'connected',
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        setBackendHealth({
          status: 'unreachable',
          database: 'disconnected',
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    } catch {
      setBackendHealth({
        status: 'unreachable',
        database: 'offline',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleExportData = async () => {
    try {
      if (isAuthenticated) {
        const res = await api.exportData();
        if (res.data) {
          const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `my-garden-world-cloud-backup-${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(url);
          setStatusNotice('Cloud data exported successfully as JSON!');
          setTimeout(() => setStatusNotice(null), 4000);
          return;
        }
      }

      // Local DB export fallback
      const [profile, plants, quests, discoveries, observations, gardenLayout, transactions, achievements] =
        await Promise.all([
          db.profile.toArray(),
          db.plants.toArray(),
          db.quests.toArray(),
          db.discoveries.toArray(),
          db.observations.toArray(),
          db.gardenLayout.toArray(),
          db.transactions.toArray(),
          db.achievements.toArray()
        ]);

      const backup = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        profile,
        plants,
        quests,
        discoveries,
        observations,
        gardenLayout,
        transactions,
        achievements
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-garden-world-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setStatusNotice('Garden data exported successfully as JSON!');
      setTimeout(() => setStatusNotice(null), 4000);
    } catch (err: any) {
      console.error(err);
      setStatusNotice('Failed to export data: ' + err.message);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      if (isAuthenticated) {
        const res = await api.importData(json);
        if (res.success) {
          await refreshData();
          setStatusNotice('Backup imported and synced to PostgreSQL cloud account!');
          setTimeout(() => setStatusNotice(null), 4000);
          return;
        }
      }

      // Local import
      if (json.plants && Array.isArray(json.plants)) {
        await db.plants.bulkPut(json.plants);
        await refreshData();
        setStatusNotice('Local backup restored successfully!');
        setTimeout(() => setStatusNotice(null), 4000);
      } else {
        setStatusNotice('Invalid backup JSON structure.');
      }
    } catch (err: any) {
      setStatusNotice('Error importing backup: ' + err.message);
    } finally {
      e.target.value = '';
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to reset all local garden data and start fresh? This cannot be undone.')) {
      return;
    }
    setIsClearing(true);
    try {
      await db.delete();
      await db.open();
      await refreshData();
      setStatusNotice('All local data has been reset to initial state.');
      setTimeout(() => setStatusNotice(null), 4000);
    } catch (err: any) {
      console.error(err);
      setStatusNotice('Error clearing database: ' + err.message);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      
      {/* Spacious Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100/80 border border-forest-200 text-forest-800 text-xs font-semibold">
          <SettingsIcon className="w-3.5 h-3.5 text-forest-600" />
          <span>System & Account Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-forest-950">
          Settings & Data Management
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm">
          Manage your cloud botanist account, verify backend connectivity, and export complete JSON snapshots.
        </p>
      </div>

      {statusNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Cloud Account Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-forest-100/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-forest-100/80 text-forest-800 flex items-center justify-center shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-forest-950 text-base">
                {isAuthenticated ? `@${user?.username}` : 'Guest Botanist'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {isAuthenticated
                  ? `${user?.email} • Level ${user?.level} • ${user?.coins} Coins`
                  : 'Operating locally. Sign in to sync across devices.'}
              </p>
            </div>
          </div>

          <div>
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-xs transition-all"
              >
                <LogIn className="w-4 h-4 text-emerald-300" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Appearance & Color Theme (Light / Dark Mode) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-forest-100/80 dark:border-stone-800 shadow-xs space-y-4">
        <div className="space-y-0.5">
          <h3 className="font-bold text-base text-forest-950 dark:text-emerald-50 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Appearance & Theme Mode</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Switch between Light Botanical and Dark Obsidian mode across the entire application.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm pt-1">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              !isDark
                ? 'bg-forest-900 text-white border-forest-800 shadow-xs'
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-400'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Light Mode</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? 'bg-emerald-500 text-forest-950 border-emerald-400 shadow-xs'
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-400'
            }`}
          >
            <Moon className="w-4 h-4 text-forest-950" />
            <span>Dark Mode</span>
          </button>
        </div>
      </div>

      {/* Backend & Database Health Monitor */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-forest-100/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-forest-950 flex items-center gap-2">
            <Database className="w-4 h-4 text-forest-600" />
            Backend & Database Health
          </h3>
          <button
            onClick={checkHealth}
            disabled={isCheckingHealth}
            className="flex items-center gap-1 text-xs text-forest-700 hover:text-forest-900 font-semibold p-1 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
            <span>Check Health</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-forest-50/70 border border-forest-100/80">
            <span className="text-stone-500 block text-[10px] uppercase font-bold">API Status</span>
            <span className={`font-bold flex items-center gap-1.5 mt-1 ${backendHealth?.status === 'healthy' ? 'text-emerald-700' : 'text-amber-700'}`}>
              <Activity className="w-3.5 h-3.5" />
              {backendHealth?.status === 'healthy' ? 'Operational' : 'Offline / Standalone'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-forest-50/70 border border-forest-100/80">
            <span className="text-stone-500 block text-[10px] uppercase font-bold">PostgreSQL Database</span>
            <span className={`font-bold flex items-center gap-1.5 mt-1 ${backendHealth?.database === 'connected' ? 'text-emerald-700' : 'text-stone-600'}`}>
              <Database className="w-3.5 h-3.5" />
              {backendHealth?.database === 'connected' ? 'Connected (Cloud)' : 'Local IndexedDB'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-forest-50/70 border border-forest-100/80">
            <span className="text-stone-500 block text-[10px] uppercase font-bold">Network Connection</span>
            <span className={`font-bold flex items-center gap-1.5 mt-1 ${isOnline ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Data Backup & Reset Controls */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-forest-100/80 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-forest-950 flex items-center gap-2">
          <FileJson className="w-4 h-4 text-forest-600" />
          Data Backup & Snapshot Controls
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-emerald-300" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-forest-50 hover:bg-forest-100 border border-forest-200/80 text-forest-900 font-bold text-xs cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-forest-600" />
            <span>Restore Backup (JSON)</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={handleClearData}
            disabled={isClearing}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isClearing ? 'Resetting...' : 'Reset Local DB'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
