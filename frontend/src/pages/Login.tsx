import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Activity, Settings } from 'lucide-react';
import { api } from '../services/api';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(localStorage.getItem('roadmap_backend_url') || '');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.login(email, password);
      onLoginSuccess(data.token, data.user);
      
      if (data.user.hasCompletedAssessment) {
        navigate('/');
      } else {
        navigate('/assessment');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-dark-bg relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="w-full max-w-md glass-panel rounded-2xl shadow-glass p-8 relative z-10 border border-dark-border/40 bg-dark-card/85">
        {/* API Settings Trigger */}
        <button 
          onClick={() => setShowApiSettings(true)}
          className="absolute top-4 right-4 p-2 text-dark-muted hover:text-white rounded-lg hover:bg-dark-border/30 transition-all"
          title="API Server Settings"
          type="button"
        >
          <Settings className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-500/30 mb-4 animate-float">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-sm text-dark-muted mt-2">
            Continue charting your senior-guided career
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase font-bold text-dark-muted tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-muted" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-bg/60 border border-dark-border/40 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-dark-text transition-all"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs uppercase font-bold text-dark-muted tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-muted" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-bg/60 border border-dark-border/40 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-dark-text transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-dark-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-emerald-400 hover:text-emerald-300">
            Create Account
          </Link>
        </div>
      </div>

      {/* API Settings Modal */}
      {showApiSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-dark-card border border-dark-border/40 rounded-2xl p-6 shadow-glass relative text-dark-text">
            <h3 className="text-lg font-bold text-white mb-2">API Connection Settings</h3>
            <p className="text-xs text-dark-muted mb-4">
              Configure the backend API URL. This is helpful if you are testing on mobile or running the server on a different IP.
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] uppercase font-bold text-dark-muted tracking-wider mb-2">
                  Backend API URL
                </label>
                <input
                  type="text"
                  placeholder="http://localhost:5000/api"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-bg/60 border border-dark-border/40 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-dark-text"
                />
              </div>
              <div className="text-[11px] text-dark-muted bg-dark-bg/30 p-2.5 rounded-lg border border-dark-border/20">
                <span className="font-semibold block text-white mb-0.5">Currently Resolving To:</span>
                <code className="text-blue-400 break-all">{localStorage.getItem('roadmap_backend_url') || `http://${window.location.hostname}:5000/api`}</code>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('roadmap_backend_url');
                  setCustomApiUrl('');
                  setShowApiSettings(false);
                  window.location.reload();
                }}
                className="px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              >
                Reset Default
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customApiUrl.trim()) {
                    localStorage.setItem('roadmap_backend_url', customApiUrl.trim());
                  } else {
                    localStorage.removeItem('roadmap_backend_url');
                  }
                  setShowApiSettings(false);
                  window.location.reload();
                }}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all"
              >
                Save & Reload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Login;
