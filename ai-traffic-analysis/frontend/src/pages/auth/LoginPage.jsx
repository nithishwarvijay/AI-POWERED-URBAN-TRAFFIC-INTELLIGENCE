import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity, Mail, Lock, Eye, EyeOff, AlertCircle,
  CheckCircle2, ArrowRight, ArrowLeft, Zap, Shield, BarChart3, Siren, Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authLogin, authDemoLogin } from '../../services/api';

/* ── Feature list shown on the left panel ─────────────────────────────────── */
const FEATURES = [
  {
    icon: Zap,
    label: 'AI Vehicle Detection',
    sub: 'YOLOv11 real-time classification',
    color: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  },
  {
    icon: BarChart3,
    label: 'Adaptive Signal Control',
    sub: 'Q-Learning reinforcement learning',
    color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  },
  {
    icon: Siren,
    label: 'Emergency Priority',
    sub: 'Automatic clearance routing',
    color: 'bg-red-500/15 text-red-400 border border-red-500/20',
  },
  {
    icon: Shield,
    label: 'Secure Role-Based Access',
    sub: 'Admin · Operator · Analyst',
    color: 'bg-violet-500/15 text-violet-400 border border-violet-500/20',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await authLogin(form.email, form.password);
      login(data.user, data.access_token);
      setSuccess('Authenticated. Loading dashboard…');
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      setError(err.response?.data?.detail || 'Incorrect email or password.');
    } finally { setLoading(false); }
  };

  const handleDemo = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await authDemoLogin();
      login(data.user, data.access_token);
      setSuccess('Demo access granted. Loading dashboard…');
      setTimeout(() => navigate('/dashboard'), 600);
    } catch {
      setError('Demo login unavailable. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[520px] xl:w-[580px] flex-col justify-between p-12 xl:p-16 relative overflow-hidden flex-shrink-0">
        {/* Deep dark background */}
        <div className="absolute inset-0 bg-[#050C1A]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #60a5fa 1px, transparent 0)', backgroundSize: '30px 30px' }}
        />
        {/* Glow orbs */}
        <div className="absolute -top-40 -left-20 w-[420px] h-[420px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-56 h-56 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-10">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-200">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[15px] font-bold text-white leading-tight block">Urban Traffic Intelligence</span>
              <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-[0.15em] leading-none">AI Platform</span>
            </div>
          </Link>

          {/* Headline */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">Smart City Intelligence</span>
            </div>
            <h2 className="text-[2.2rem] font-bold text-white leading-tight">
              Welcome back to the<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-cyan-300">
                future of traffic
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Monitor, analyze, and optimize urban traffic flow with AI-powered intelligence built for smart city operations.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-2.5">
            {FEATURES.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 p-3.5 rounded-xl bg-white/[0.028] border border-white/[0.055] hover:bg-white/[0.05] transition-colors duration-200"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <item.icon className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-snug">{item.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-3.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-emerald-400">All Systems Operational</p>
              <p className="text-[11px] text-slate-500 mt-0.5">24 active signals · Real-time AI monitoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F0F4F8] dark:bg-[#08101E] relative overflow-hidden">
        {/* Subtle bg glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/4 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[420px] space-y-6 relative z-10">

          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Card */}
          <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-lg shadow-slate-200/60 dark:shadow-none overflow-hidden animate-slide-up">

            {/* Top accent line */}
            <div className="h-0.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600" />

            <div className="p-7 space-y-5">

              {/* Icon box inside card header */}
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>

              {/* Card Header */}
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Sign in to your account</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Create one free
                  </Link>
                </p>
              </div>
              {/* Alerts */}
              {error && (
                <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-700/50 rounded-xl text-sm text-red-700 dark:text-red-400 animate-slide-up">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-700/50 rounded-xl text-sm text-emerald-700 dark:text-emerald-400 animate-slide-up">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="login-email"
                      type="email" name="email" value={form.email}
                      onChange={handleChange} required autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPw ? 'text' : 'password'} name="password" value={form.password}
                      onChange={handleChange} required autoComplete="current-password"
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                    />
                    <button
                      type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/30 bg-slate-50 dark:bg-slate-900"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Keep me signed in for 30 days</span>
                </label>

                {/* Submit */}
                <button
                  type="submit" disabled={loading}
                  id="login-submit-btn"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/25 hover:shadow-blue-600/35 text-sm disabled:cursor-not-allowed mt-1"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-xs text-slate-400 font-medium">or</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Demo login */}
              <button
                type="button" onClick={handleDemo} disabled={loading}
                id="demo-login-btn"
                className="w-full flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-semibold py-2.5 rounded-xl text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Continue as Demo User
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400">
            © 2026 Urban Traffic Intelligence · AI-Powered Smart City Platform
          </p>
        </div>
      </div>
    </div>
  );
}