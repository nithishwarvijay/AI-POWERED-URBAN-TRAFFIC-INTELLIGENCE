import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Sun, Moon, Bell, Settings, Shield, RefreshCw,
  CheckCircle2, Monitor,
} from 'lucide-react';

/* ── toggle switch ────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, label, sub, disabled }) {
  return (
    <div className={`flex items-center justify-between py-3 ${disabled ? 'opacity-50' : ''}`}>
      <div>
        <p className="text-sm font-medium text-[#0F172A] dark:text-white">{label}</p>
        {sub && <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <button
        role="switch" aria-checked={checked} disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${checked ? 'bg-[#2563EB]' : 'bg-[#E2E8F0] dark:bg-slate-700'} ${!disabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      >
        <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

/* ── section card ─────────────────────────────────────────────────────── */
function SCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800">
      <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#2563EB]" />
        </div>
        <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">{title}</h3>
      </div>
      <div className="px-6 py-2 divide-y divide-[#E2E8F0] dark:divide-slate-800">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState({
    trafficAlerts:   true,
    emergencyAlerts: true,
    systemNotifs:    true,
    emailNotifs:     false,
  });

  const [system, setSystem] = useState({
    refreshInterval: '30',
    autoAnalysis:    false,
    dataRetention:   '90',
    compactView:     false,
  });

  const [saved, setSaved] = useState(false);

  const toggle = (key) => setNotifications(p => ({ ...p, [key]: !p[key] }));
  const sysBool = (key) => setSystem(p => ({ ...p, [key]: !p[key] }));

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const breadcrumbs = [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6 max-w-2xl">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Settings</h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">Manage appearance, notifications and system preferences</p>
          </div>
          <button
            onClick={save}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-sm'
            }`}
          >
            {saved ? <><CheckCircle2 className="w-4 h-4" />Saved!</> : <><Settings className="w-4 h-4" />Save Settings</>}
          </button>
        </div>

        {/* ── Appearance ────────────────────────────────────────────── */}
        <SCard title="Appearance" icon={Monitor}>
          <div className="py-4">
            <p className="text-sm font-medium text-[#0F172A] dark:text-white mb-3">Color Theme</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Light mode */}
              <button
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  theme === 'light'
                    ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-900/10'
                    : 'border-[#E2E8F0] dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700'
                }`}
              >
                <div className="w-10 h-10 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                  <Sun className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <span className="text-sm font-semibold text-[#0F172A] dark:text-white">Light Mode</span>
                <span className="text-xs text-[#64748B] dark:text-slate-400">Default</span>
                {theme === 'light' && <span className="text-xs font-semibold text-[#2563EB]">● Active</span>}
              </button>

              {/* Dark mode */}
              <button
                onClick={() => theme === 'light' && toggleTheme()}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-900/10'
                    : 'border-[#E2E8F0] dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700'
                }`}
              >
                <div className="w-10 h-10 bg-slate-900 border-2 border-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                  <Moon className="w-5 h-5 text-[#06B6D4]" />
                </div>
                <span className="text-sm font-semibold text-[#0F172A] dark:text-white">Dark Mode</span>
                <span className="text-xs text-[#64748B] dark:text-slate-400">Deep navy</span>
                {theme === 'dark' && <span className="text-xs font-semibold text-[#2563EB]">● Active</span>}
              </button>
            </div>
          </div>
        </SCard>

        {/* ── Notifications ─────────────────────────────────────────── */}
        <SCard title="Notifications" icon={Bell}>
          <Toggle label="Traffic Alerts" sub="Congestion warnings and density threshold alerts"
            checked={notifications.trafficAlerts} onChange={() => toggle('trafficAlerts')} />
          <Toggle label="Emergency Alerts" sub="Immediate notification when an emergency vehicle is detected"
            checked={notifications.emergencyAlerts} onChange={() => toggle('emergencyAlerts')} />
          <Toggle label="System Notifications" sub="Signal optimization updates, analysis completions"
            checked={notifications.systemNotifs} onChange={() => toggle('systemNotifs')} />
          <Toggle label="Email Notifications" sub="Receive reports and critical alerts via email (coming soon)"
            checked={notifications.emailNotifs} onChange={() => toggle('emailNotifs')} disabled />
        </SCard>

        {/* ── System ────────────────────────────────────────────────── */}
        <SCard title="System" icon={RefreshCw}>
          {/* Refresh interval */}
          <div className="py-3">
            <p className="text-sm font-medium text-[#0F172A] dark:text-white mb-1">Dashboard Refresh Interval</p>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mb-2">How often KPI metrics automatically refresh</p>
            <select
              value={system.refreshInterval}
              onChange={e => setSystem(p => ({ ...p, refreshInterval: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
            >
              <option value="15">Every 15 seconds</option>
              <option value="30">Every 30 seconds</option>
              <option value="60">Every minute</option>
              <option value="300">Every 5 minutes</option>
              <option value="0">Manual only</option>
            </select>
          </div>

          <Toggle label="Compact View" sub="Reduce card padding for denser information display"
            checked={system.compactView} onChange={() => sysBool('compactView')} />
          <Toggle label="Auto-Analysis Mode" sub="Automatically run detection when files are uploaded"
            checked={system.autoAnalysis} onChange={() => sysBool('autoAnalysis')} />

          {/* Data retention */}
          <div className="py-3">
            <p className="text-sm font-medium text-[#0F172A] dark:text-white mb-1">Data Retention Period</p>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mb-2">How long to keep analysis records</p>
            <select
              value={system.dataRetention}
              onChange={e => setSystem(p => ({ ...p, dataRetention: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
            >
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="365">1 year</option>
              <option value="0">Keep forever</option>
            </select>
          </div>
        </SCard>

        {/* ── Security info ─────────────────────────────────────────── */}
        <SCard title="Security" icon={Shield}>
          <div className="py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748B] dark:text-slate-400">Authentication</span>
              <span className="text-sm font-semibold text-[#0F172A] dark:text-white">JWT (HS256)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748B] dark:text-slate-400">Password hashing</span>
              <span className="text-sm font-semibold text-[#0F172A] dark:text-white">bcrypt</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748B] dark:text-slate-400">Token expiry</span>
              <span className="text-sm font-semibold text-[#0F172A] dark:text-white">24 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748B] dark:text-slate-400">Role-based access</span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" /> Active
              </span>
            </div>
          </div>
          <div className="py-3">
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-3.5">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <strong>Production note:</strong> Change the SECRET_KEY environment variable from the default before deploying to production.
              </p>
            </div>
          </div>
        </SCard>

      </div>
    </DashboardLayout>
  );
}
