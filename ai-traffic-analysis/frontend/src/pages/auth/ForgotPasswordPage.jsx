import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Mail, Lock, Eye, EyeOff,
  ArrowLeft, CheckCircle2, AlertCircle, KeyRound, ShieldCheck, Check,
} from 'lucide-react';

const STEPS = ['email', 'code', 'reset', 'success'];

/* ── Sub-components ─────────────────────────────────────────────────────────── */
function ErrorBanner({ msg }) {
  return (
    <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-700/50 rounded-xl text-sm text-red-700 dark:text-red-400 animate-slide-up">
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>{msg}</span>
    </div>
  );
}

function SubmitBtn({ loading, label }) {
  return (
    <button
      type="submit" disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/25 text-sm disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Processing…
        </>
      ) : label}
    </button>
  );
}

function PwField({ id, label, value, onChange, show, toggle, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id={id}
          type={show ? 'text' : 'password'} value={value} onChange={onChange}
          required placeholder={placeholder}
          className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
        />
        <button
          type="button" onClick={toggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          aria-label="Toggle password visibility"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function ForgotPasswordPage() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pw, setPw] = useState('');
  const [confPw, setConfPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoCode, setDemoCode] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email.'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 900));
    const code6 = String(Math.floor(100000 + Math.random() * 900000));
    setDemoCode(code6);
    setLoading(false);
    setStep('code');
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (code !== demoCode) { setError('Invalid code. Check the demo code shown below.'); return; }
    setStep('reset');
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (pw.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (pw !== confPw) { setError('Passwords do not match.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setStep('success');
  };

  const stepList = [
    { key: 'email', label: 'Enter email address' },
    { key: 'code', label: 'Verify the code' },
    { key: 'reset', label: 'Create new password' },
    { key: 'success', label: 'Password updated' },
  ];

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Left panel ──────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between p-12 xl:p-16 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-[#050C1A]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #60a5fa 1px, transparent 0)', backgroundSize: '30px 30px' }}
        />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-48 h-48 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

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
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">Secure Recovery</span>
            </div>
            <h2 className="text-[2rem] font-bold text-white leading-tight">
              Secure password<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-cyan-300">
                recovery
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Enter your email to receive a verification code and reset your password safely.
            </p>
          </div>

          {/* Progress steps */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-3">Recovery Steps</p>
            {stepList.map(({ key, label }, i) => {
              const idx = STEPS.indexOf(step);
              const thisIdx = STEPS.indexOf(key);
              const done = thisIdx < idx;
              const active = key === step;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-[11px] font-bold transition-all duration-200 ${done ? 'bg-emerald-500 border-emerald-500 text-white' :
                      active ? 'bg-blue-600 border-blue-600 text-white' :
                        'border-white/15 text-slate-600'
                    }`}>
                    {done ? <Check className="w-3.5 h-3.5 text-white stroke-[3]" /> : i + 1}
                  </div>
                  <span className={`text-sm transition-colors ${active ? 'text-white font-semibold' : done ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demo note */}
        <div className="relative z-10 bg-amber-500/8 border border-amber-500/20 rounded-xl p-3.5">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            <span className="text-amber-400 font-semibold">Demo mode:</span> No real email is sent. The verification code appears on screen after step 1.
          </p>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F0F4F8] dark:bg-[#08101E] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[420px] space-y-6 relative z-10">
          {/* Back link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>

          {/* ── Email step ──────────────────────────────────────────────────── */}
          {step === 'email' && (
            <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-lg shadow-slate-200/60 dark:shadow-none overflow-hidden animate-slide-up">
              <div className="h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500" />
              <div className="p-7 space-y-5">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Forgot your password?</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Enter the email address for your account and we'll send you a reset code.
                  </p>
                </div>
                {error && <ErrorBanner msg={error} />}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="fp-email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        id="fp-email"
                        type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                        required placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                      />
                    </div>
                  </div>
                  <SubmitBtn loading={loading} label="Send Reset Code" />
                </form>
              </div>
            </div>
          )}

          {/* ── Code step ───────────────────────────────────────────────────── */}
          {step === 'code' && (
            <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-lg shadow-slate-200/60 dark:shadow-none overflow-hidden animate-slide-up">
              <div className="h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600" />
              <div className="p-7 space-y-5">
                <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/50 rounded-xl flex items-center justify-center">
                  <KeyRound className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Enter verification code</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    We sent a code to <span className="font-semibold text-slate-700 dark:text-white">{email}</span>
                  </p>
                </div>

                {/* Demo hint */}
                <div className="bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/50 rounded-xl p-3.5">
                  <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1">Demo Mode</p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    Your code is:{' '}
                    <span className="font-bold font-mono text-lg tracking-[0.2em]">{demoCode}</span>
                  </p>
                </div>

                {error && <ErrorBanner msg={error} />}
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="fp-code" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      6-digit code
                    </label>
                    <input
                      id="fp-code"
                      type="text" value={code} onChange={e => { setCode(e.target.value); setError(''); }}
                      maxLength={6} placeholder="000000"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-center text-2xl font-bold tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-blue-400 transition-all placeholder-slate-300"
                    />
                  </div>
                  <SubmitBtn loading={loading} label="Verify Code" />
                </form>
                <button
                  onClick={() => setStep('email')}
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mt-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Use a different email
                </button>
              </div>
            </div>
          )}

          {/* ── Reset step ──────────────────────────────────────────────────── */}
          {step === 'reset' && (
            <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-lg shadow-slate-200/60 dark:shadow-none overflow-hidden animate-slide-up">
              <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500" />
              <div className="p-7 space-y-5">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Create new password</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Choose a strong password for your account.</p>
                </div>
                {error && <ErrorBanner msg={error} />}
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <PwField
                    id="fp-pw" label="New password"
                    value={pw} onChange={e => { setPw(e.target.value); setError(''); }}
                    show={showPw} toggle={() => setShowPw(p => !p)} placeholder="New password"
                  />
                  <PwField
                    id="fp-confirm" label="Confirm password"
                    value={confPw} onChange={e => { setConfPw(e.target.value); setError(''); }}
                    show={showPw} toggle={() => setShowPw(p => !p)} placeholder="Repeat password"
                  />
                  <SubmitBtn loading={loading} label="Update Password" />
                </form>
              </div>
            </div>
          )}

          {/* ── Success step ────────────────────────────────────────────────── */}
          {step === 'success' && (
            <div className="bg-white dark:bg-[#0D1829] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-lg shadow-slate-200/60 dark:shadow-none overflow-hidden animate-slide-up">
              <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-blue-600" />
              <div className="p-10 text-center space-y-5">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Password updated!</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Your password has been changed successfully. You can now sign in with your new credentials.
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/25 text-sm"
                >
                  Sign In Now
                </Link>
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-slate-400">
            © 2026 Urban Traffic Intelligence · AI-Powered Smart City Platform
          </p>
        </div>
      </div>
    </div>
  );
}
