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
  AlertTriangle,
  RefreshCw,
  FileJson,
  User,
  LogIn,
  LogOut,
  Database,
  Activity
} from 'lucide-react';
import { db } from '../db';
import { useGarden } from '../context/GardenContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { refreshData } = useGarden();
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 space-y-8">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
          <SettingsIcon className="w-3.5 h-3.5" />
          Settings & Full-Stack System Control
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-text-primary">
          Preferences & Data Management
        </h1>
        <p className="text-text-secondary text-sm">
          Manage your cloud botanist account, verify backend health & offline sync, and export complete JSON snapshots.
        </p>
      </div>

      {statusNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {statusNotice}
        </div>
      )}

      {/* Cloud Botanist Account Card */}
      <div className="glass-panel p-6 rounded-3xl border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-base">
                {isAuthenticated ? `Botanist Account: @${user?.username}` : 'Guest Botanist (Local Mode)'}
              </h3>
              <p className="text-xs text-text-secondary">
                {isAuthenticated
                  ? `Email: ${user?.email} • Level ${user?.level} • ${user?.coins} Flora Coins`
                  : 'Operating locally on browser IndexedDB. Sign in to sync across devices.'}
              </p>
            </div>
          </div>

          <div>
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Backend & Database Health Monitor */}
      <div className="glass-panel p-6 rounded-3xl border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-text-primary font-display flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            Backend & Database Health
          </h3>
          <button
            onClick={checkHealth}
            disabled={isCheckingHealth}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface-hover transition-colors"
            title="Refresh backend status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Check Health</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-surface-input border border-border">
            <span className="text-text-muted block text-[11px]">API Status</span>
            <span className={`font-bold flex items-center gap-1.5 mt-0.5 ${backendHealth?.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}`}>
              <Activity className="w-3.5 h-3.5" />
              {backendHealth?.status === 'healthy' ? 'Healthy (Node/Express)' : 'Local / Offline'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-surface-input border border-border">
            <span className="text-text-muted block text-[11px]">Database (PostgreSQL)</span>
            <span className={`font-bold flex items-center gap-1.5 mt-0.5 ${backendHealth?.database === 'connected' ? 'text-emerald-400' : 'text-text-secondary'}`}>
              <Database className="w-3.5 h-3.5" />
              {backendHealth?.database === 'connected' ? 'Connected (Prisma/Neon)' : 'IndexedDB Fallback'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-surface-input border border-border">
            <span className="text-text-muted block text-[11px]">Browser Network</span>
            <span className={`font-bold flex items-center gap-1.5 mt-0.5 ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Open AI Model Specs Card */}
      <div className="glass-panel p-6 rounded-3xl border border-border shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-text-primary font-display flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400" />
          On-Device AI Model Specifications
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-surface-input border border-border space-y-1">
            <span className="font-semibold text-text-primary block">Model Architecture</span>
            <span className="text-text-secondary">Vision Transformer (ViT-Base-Patch16-224 Quantized INT8)</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-input border border-border space-y-1">
            <span className="font-semibold text-text-primary block">Official Source & Repository</span>
            <span className="text-text-secondary">Hugging Face (`Xenova/vit-base-patch16-224`)</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-input border border-border space-y-1">
            <span className="font-semibold text-text-primary block">Open License</span>
            <span className="text-text-secondary">Apache License 2.0 (Permissive Open Source)</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-input border border-border space-y-1">
            <span className="font-semibold text-text-primary block">Inference Runtime</span>
            <span className="text-text-secondary">ONNX Runtime WebAssembly (Zero Remote Image Uploads)</span>
          </div>
        </div>
      </div>

      {/* Data Management & Backup Controls */}
      <div className="glass-panel p-6 rounded-3xl border border-border shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-text-primary font-display flex items-center gap-2">
          <FileJson className="w-5 h-5 text-emerald-400" />
          Data Backup, Export & Reset Controls
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Full Backup (JSON)</span>
          </button>

          <label className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-surface-input hover:bg-surface-hover border border-border text-text-primary font-bold text-xs cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-emerald-400" />
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
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 font-bold text-xs transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isClearing ? 'Resetting...' : 'Reset Local DB'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
