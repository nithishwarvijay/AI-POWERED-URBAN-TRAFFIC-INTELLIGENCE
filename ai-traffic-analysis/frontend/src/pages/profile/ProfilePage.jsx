import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authUpdateMe, authChangePassword } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  User, Mail, Lock, Eye, EyeOff, CheckCircle2,
  AlertCircle, Edit2, Shield, Calendar, Clock,
} from 'lucide-react';

const ROLE_STYLE = {
  administrator: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200 dark:border-purple-800',
  operator:      'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
  analyst:       'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800',
};

/* ── small section card ──────────────────────────────────────────────── */
function SCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800">
      <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#2563EB]" />
        </div>
        <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ── input field helper ──────────────────────────────────────────────── */
function Field({ label, children, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#0F172A] dark:text-slate-200 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function inputCls(err) {
  return `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white placeholder-[#94a3b8] ${
    err
      ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400'
      : 'border-[#E2E8F0] dark:border-slate-700 focus:ring-[#2563EB]/30 focus:border-[#2563EB]'
  }`;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm]    = useState({ full_name: user?.full_name || '', email: user?.email || '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg,   setProfileMsg]    = useState(null);

  const [pwForm,   setPwForm]   = useState({ current: '', next: '', confirm: '' });
  const [showPw,   setShowPw]   = useState({ current: false, next: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg,    setPwMsg]    = useState(null);

  /* ── profile update ──────────────────────────────────────────────── */
  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true); setProfileMsg(null);
    try {
      const { data } = await authUpdateMe({ full_name: profileForm.full_name, email: profileForm.email });
      updateUser(data);
      setProfileMsg({ ok: true, text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ ok: false, text: err.response?.data?.detail || 'Update failed.' });
    } finally { setProfileSaving(false); }
  };

  /* ── password change ─────────────────────────────────────────────── */
  const savePassword = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { setPwMsg({ ok: false, text: 'Passwords do not match.' }); return; }
    if (pwForm.next.length < 6) { setPwMsg({ ok: false, text: 'Password must be at least 6 characters.' }); return; }
    setPwSaving(true); setPwMsg(null);
    try {
      await authChangePassword(pwForm.current, pwForm.next);
      setPwMsg({ ok: true, text: 'Password changed successfully.' });
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwMsg({ ok: false, text: err.response?.data?.detail || 'Password change failed.' });
    } finally { setPwSaving(false); }
  };

  const initials = user?.full_name?.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() || 'U';

  const breadcrumbs = [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Profile' }];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6 max-w-3xl">

        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">My Profile</h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">Manage your personal information and account security</p>
        </div>

        {/* ── Avatar / Identity card ────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">{initials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">{user?.full_name}</h2>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${ROLE_STYLE[user?.role] || ROLE_STYLE.operator}`}>
                  {user?.role}
                </span>
              </div>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mb-3">{user?.email}</p>
              <div className="flex flex-wrap gap-4 text-xs text-[#64748B] dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Last login: {user?.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-green-500" />
                  Account active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Edit profile ─────────────────────────────────────────── */}
        <SCard title="Edit Profile Information" icon={Edit2}>
          {profileMsg && (
            <div className={`flex items-center gap-3 p-3.5 mb-5 rounded-xl border text-sm ${
              profileMsg.ok
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
            }`}>
              {profileMsg.ok ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {profileMsg.text}
            </div>
          )}
          <form onSubmit={saveProfile} className="space-y-4">
            <Field label="Full Name">
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="text" value={profileForm.full_name}
                  onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))}
                  required className={`pl-10 ${inputCls()}`}
                  placeholder="Your full name"
                />
              </div>
            </Field>
            <Field label="Email Address">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="email" value={profileForm.email}
                  onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                  required className={`pl-10 ${inputCls()}`}
                  placeholder="you@example.com"
                />
              </div>
            </Field>
            <Field label="Role">
              <input
                type="text" value={user?.role || ''} readOnly
                className={`${inputCls()} bg-[#F8FAFC] dark:bg-slate-800 cursor-not-allowed capitalize`}
              />
              <p className="text-xs text-[#94a3b8] mt-1">Role is assigned by an administrator.</p>
            </Field>
            <div className="pt-2">
              <button type="submit" disabled={profileSaving}
                className="bg-[#2563EB] hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm disabled:cursor-not-allowed flex items-center gap-2">
                {profileSaving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : 'Save Changes'}
              </button>
            </div>
          </form>
        </SCard>

        {/* ── Change password ───────────────────────────────────────── */}
        <SCard title="Change Password" icon={Lock}>
          {pwMsg && (
            <div className={`flex items-center gap-3 p-3.5 mb-5 rounded-xl border text-sm ${
              pwMsg.ok
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
            }`}>
              {pwMsg.ok ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {pwMsg.text}
            </div>
          )}
          <form onSubmit={savePassword} className="space-y-4">
            {[
              { key: 'current', label: 'Current Password', ph: 'Enter current password' },
              { key: 'next',    label: 'New Password',     ph: 'Create a new password' },
              { key: 'confirm', label: 'Confirm Password', ph: 'Repeat new password' },
            ].map(({ key, label, ph }) => (
              <Field key={key} label={label}>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type={showPw[key] ? 'text' : 'password'}
                    value={pwForm[key]}
                    onChange={e => { setPwForm(p => ({ ...p, [key]: e.target.value })); setPwMsg(null); }}
                    required placeholder={ph}
                    className={`pl-10 pr-11 ${inputCls()}`}
                  />
                  <button type="button" onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors">
                    {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
            ))}
            <div className="pt-2">
              <button type="submit" disabled={pwSaving}
                className="bg-[#0F172A] dark:bg-white hover:bg-slate-800 dark:hover:bg-gray-100 text-white dark:text-[#0F172A] font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {pwSaving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating…</> : 'Update Password'}
              </button>
            </div>
          </form>
        </SCard>

      </div>
    </DashboardLayout>
  );
}
