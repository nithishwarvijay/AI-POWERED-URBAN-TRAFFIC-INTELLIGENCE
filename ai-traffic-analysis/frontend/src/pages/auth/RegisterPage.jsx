import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity, Mail, Lock, Eye, EyeOff, User, AlertCircle,
  CheckCircle2, ShieldCheck, ChevronDown, ArrowRight, ArrowLeft, Crown, BarChart3, Radio, Check, UserPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authRegister } from '../../services/api';

/* ── Roles ──────────────────────────────────────────────────────────────────── */
const ROLES = [
  {
    value: 'administrator',
    label: 'Administrator',
    desc: 'Full access — user management & all modules',
    icon: Crown,
    color: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  },
  {
    value: 'operator',
    label: 'Traffic Operator',
    desc: 'Live traffic, signals & emergency vehicles',
    icon: Radio,
    color: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  },
  {
    value: 'analyst',
    label: 'Traffic Analyst',
    desc: 'Analytics, reports & traffic data',
    icon: BarChart3,
    color: 'bg-violet-500/15 text-violet-400 border border-violet-500/20',
  },
];

/* ── Password strength ──────────────────────────────────────────────────────── */
function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const levels = [
    { min: 0, color: 'bg-red-400', label: 'Weak' },
    { min: 2, color: 'bg-amber-400', label: 'Fair' },
    { min: 3, color: 'bg-yellow-400', label: 'Good' },
    { min: 4, color: 'bg-emerald-500', label: 'Strong' },
  ];
  const current = [...levels].reverse().find(b => score >= b.min) || levels[0];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1 items-center">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${score >= i ? current.color : 'bg-slate-200 dark:bg-slate-700'}`}
          />
        ))}
        <span className="text-[11px] font-semibold text-slate-500 ml-1.5 w-11">{current.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {checks.map(({ label, ok }) => (
          <div key={label} className={`flex items-center gap-1.5 text-[11px] ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
            <span className={`w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold transition-all ${ok ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-600'}`}>
              {ok ? <Check className="w-2 h-2 text-white stroke-[3]" /> : null}
            </span>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Input helper ──────────────────────────────────────────────────────────── */
function inputCls(err) {
  return `w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${err
      ? 'border-red-400 dark:border-red-600 focus:ring-red-400/20 focus:border-red-400 bg-red-50 dark:bg-red-900/10'
      : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-blue-400 bg-slate-50 dark:bg-slate-900/60'
    } text-slate-900 dark:text-white placeholder-slate-400`;
}

function Field({ label, htmlFor, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
      </label>
      <div className="relative">{children}</div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPw, setShowPw] = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirmPassword: '', role: 'operator', terms: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    setErrors(p => ({ ...p, [name]: '' }));
    setError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (!form.terms) errs.terms = 'You must accept the terms.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setError('');
    try {
      const { data } = await authRegister({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      login(data.user, data.access_token);
      setSuccess('Account created! Loading dashboard…');
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const selectedRole = ROLES.find(r => r.value === form.role);

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Left panel ──────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[460px] xl:w-[520px] flex-col justify-between p-12 xl:p-16 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-[#050C1A]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #60a5fa 1px, transparent 0)', backgroundSize: '30px 30px' }}
        />
        <div className="absolute -top-32 -right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-10 w-72 h-72 bg-blue-600/12 rounded-full blur-3xl pointer-events-none" />

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
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider">Join the Platform</span>
            </div>
            <h2 className="text-[2.1rem] font-bold text-white leading-tight">
              Join the smart city<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-cyan-300">
                intelligence platform
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Create your account and start analyzing urban traffic with AI-powered precision.
            </p>
          </div>

          {/* Role preview cards */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-3">Access Roles</p>
            {ROLES.map(({ value, label, desc, icon: Icon, color }) => (
              <div
                key={value}
                className={`flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.025] border border-white/[0.05] transition-colors duration-200 ${form.role === value ? 'bg-white/[0.055] border-white/[0.1]' : 'hover:bg-white/[0.04]'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-snug">{label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security note */}
        <div className="relative z-10 flex items-center gap-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-3.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-[11px] text-slate-400 leading-relaxed">Passwords hashed with bcrypt. No plain-text credentials stored.</p>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F0F4F8] dark:bg-[#08101E] relative overflow-hidden overflow-y-auto">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[440px] space-y-6 py-8 relative z-10">

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
            <div className="h-0.5 bg-gradient-to-r from-blue-600 via-violet-500 to-cyan-500" />

            <div className="p-7 space-y-5">

              {/* Icon box inside card header */}
              <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/50 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>

              {/* Card Header */}
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Create your account</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
              {/* Global alerts */}
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

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                {/* Full Name */}
                <Field label="Full Name" htmlFor="reg-name" error={errors.full_name}>
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="reg-name"
                    type="text" name="full_name" value={form.full_name}
                    onChange={handleChange} required autoComplete="name"
                    placeholder="John Smith"
                    className={inputCls(errors.full_name)}
                  />
                </Field>

                {/* Email */}
                <Field label="Email address" htmlFor="reg-email" error={errors.email}>
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="reg-email"
                    type="email" name="email" value={form.email}
                    onChange={handleChange} required autoComplete="email"
                    placeholder="you@example.com"
                    className={inputCls(errors.email)}
                  />
                </Field>

                {/* Role selector */}
                <div>
                  <label htmlFor="reg-role" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Access Role
                  </label>
                  <div className="relative">
                    {selectedRole && (
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <selectedRole.icon className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <select
                      id="reg-role"
                      name="role" value={form.role} onChange={handleChange}
                      className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                    >
                      {ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  {selectedRole && (
                    <p className="text-[11px] text-slate-500 mt-1">{selectedRole.desc}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="reg-password"
                      type={showPw ? 'text' : 'password'} name="password" value={form.password}
                      onChange={handleChange} required autoComplete="new-password"
                      placeholder="Create a strong password"
                      className={inputCls(errors.password)}
                    />
                    <button
                      type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                  <PasswordStrength password={form.password} />
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="reg-confirm" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="reg-confirm"
                      type={showConfPw ? 'text' : 'password'} name="confirmPassword"
                      value={form.confirmPassword} onChange={handleChange}
                      required autoComplete="new-password"
                      placeholder="Repeat your password"
                      className={inputCls(errors.confirmPassword)}
                    />
                    <button
                      type="button" onClick={() => setShowConfPw(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                  )}
                  {!errors.confirmPassword && form.confirmPassword && form.password === form.confirmPassword && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Passwords match
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox" name="terms" checked={form.terms} onChange={handleChange}
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/30 bg-slate-50 dark:bg-slate-900 flex-shrink-0"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      I agree to the{' '}
                      <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Privacy Policy</a>
                    </span>
                  </label>
                  {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit" disabled={loading}
                  id="register-submit-btn"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/25 hover:shadow-blue-600/35 text-sm disabled:cursor-not-allowed mt-1"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
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
