import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { Layout, Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const { signin, signup, error: authError, clearError, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
    setLocalError(null);
  }, [isLogin]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!isLogin && password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    try {
      if (isLogin) {
        await signin({ username_or_email: username, password });
      } else {
        await signup({ username, email, password });
      }
    } catch (_) {
      // Handled by global store error
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic abstract decorative background */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-900/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/20 blur-[120px]" />

      <div className="w-full max-w-md bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20 mb-3">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            AI Resume Workspace
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">
            ATS-Optimization & Career Clarity Platform
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 bg-slate-950/50 p-1 rounded-xl mb-6 border border-slate-800">
          <button
            onClick={() => setIsLogin(true)}
            className={`py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              isLogin ? 'bg-primary-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              !isLogin ? 'bg-primary-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {(localError || authError) && (
          <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm text-center">
            {localError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {isLogin ? 'Username or Email' : 'Username'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isLogin ? "enter username or email" : "choose a username"}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm placeholder:text-slate-600 transition-all text-white"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm placeholder:text-slate-600 transition-all text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm placeholder:text-slate-600 transition-all text-white"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm placeholder:text-slate-600 transition-all text-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-primary-950/40 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all text-sm"
          >
            {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Secure Session Management
          </div>
        </div>
      </div>
    </div>
  );
}
