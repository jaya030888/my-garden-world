import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, Lock, User, AlertCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalMode, closeAuthModal, openAuthModal, login, register, continueAsGuest } = useAuth();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const isLogin = authModalMode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(email || username, password);
        if (!res.success) {
          setError(res.message || 'Login failed.');
        }
      } else {
        if (!email.includes('@')) {
          setError('Please enter a valid email address.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const res = await register(email, username, password);
        if (!res.success) {
          setError(res.message || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md p-6 overflow-hidden rounded-3xl bg-surface-card/95 backdrop-blur-xl border border-border shadow-2xl"
        >
          {/* Top Banner */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  {isLogin ? 'Welcome Back, Botanist' : 'Join My Garden World'}
                </h3>
                <p className="text-xs text-text-secondary">
                  {isLogin ? 'Sync your plants & sanctuary across devices' : 'Create your cloud botanical account'}
                </p>
              </div>
            </div>
            <button
              onClick={closeAuthModal}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-xl transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="botanist@nature.org"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-surface-input border border-border focus:border-emerald-500 focus:outline-none text-text-primary placeholder:text-text-muted"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                {isLogin ? 'Email or Username' : 'Botanist Username'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  required
                  value={isLogin ? email || username : username}
                  onChange={(e) => {
                    if (isLogin) {
                      setEmail(e.target.value);
                      setUsername(e.target.value);
                    } else {
                      setUsername(e.target.value);
                    }
                  }}
                  placeholder={isLogin ? 'Username or Email' : 'FloraExplorer'}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-surface-input border border-border focus:border-emerald-500 focus:outline-none text-text-primary placeholder:text-text-muted"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-surface-input border border-border focus:border-emerald-500 focus:outline-none text-text-primary placeholder:text-text-muted"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 font-semibold text-sm rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Botanist Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switch & Guest Mode */}
          <div className="mt-5 pt-4 border-t border-border space-y-3 text-center">
            <p className="text-xs text-text-secondary">
              {isLogin ? "Don't have a cloud account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  openAuthModal(isLogin ? 'register' : 'login');
                }}
                className="font-bold text-emerald-400 hover:underline"
              >
                {isLogin ? 'Register now (+100 Coins)' : 'Sign In'}
              </button>
            </p>

            <button
              type="button"
              onClick={continueAsGuest}
              className="w-full py-2 px-3 text-xs font-medium text-text-muted hover:text-text-primary rounded-xl hover:bg-surface-hover transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Continue in Guest / Local Offline Mode</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
