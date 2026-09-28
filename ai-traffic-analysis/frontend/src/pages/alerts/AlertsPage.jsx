import { useState, useEffect, useCallback } from 'react';
import { getResults } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Bell, AlertTriangle, AlertCircle, Info, CheckCircle2,
  X, Filter, RefreshCw, Siren, Signal, Car, Clock,
} from 'lucide-react';

/* ── build alerts from real backend results ──────────────────────────── */
function buildAlerts(results) {
  const alerts = [];
  results.forEach((r, i) => {
    const emergency = r.emergency_status
      ? (typeof r.emergency_status === 'string' ? JSON.parse(r.emergency_status) : r.emergency_status)
      : null;
    const alert = r.traffic_alert
      ? (typeof r.traffic_alert === 'string' ? JSON.parse(r.traffic_alert) : r.traffic_alert)
      : null;
    const ts = r.created_at;

    if (emergency?.emergency) {
      alerts.push({
        id: `emrg-${r.id}`,
        category: 'critical',
        icon: Siren,
        title: 'Emergency Vehicle Detected',
        message: emergency.message || `Emergency vehicle in ${emergency.lane}`,
        location: `Analysis #${r.id}`,
        timestamp: ts,
        read: false,
        resultId: r.id,
      });
    }

    if (alert?.level === 'CRITICAL') {
      alerts.push({
        id: `crit-${r.id}`,
        category: 'critical',
        icon: AlertTriangle,
        title: 'Critical Traffic Congestion',
        message: alert.alert || 'Critical congestion detected',
        location: `Analysis #${r.id} — ${r.filename}`,
        timestamp: ts,
        read: i > 1,
        resultId: r.id,
      });
    } else if (alert?.level === 'WARNING') {
      alerts.push({
        id: `warn-${r.id}`,
        category: 'warning',
        icon: AlertCircle,
        title: 'Moderate Traffic Warning',
        message: alert.alert || 'Moderate congestion detected',
        location: `Analysis #${r.id}`,
        timestamp: ts,
        read: i > 0,
        resultId: r.id,
      });
    } else {
      alerts.push({
        id: `info-${r.id}`,
        category: 'info',
        icon: Info,
        title: 'Traffic Analysis Complete',
        message: `${r.total_vehicles} vehicles detected — Density: ${r.density_level}`,
        location: r.filename,
        timestamp: ts,
        read: true,
        resultId: r.id,
      });
    }
  });

  // Add static system alerts
  alerts.push(
    { id: 'sys-1', category: 'info',    icon: Signal,   title: 'Signal Optimization Active',   message: 'Adaptive Q-Learning signal control is running normally.', location: 'System', timestamp: new Date().toISOString(), read: true },
    { id: 'sys-2', category: 'warning', icon: Car,      title: 'High Traffic Period Forecast',  message: 'Peak traffic expected between 5–7 PM based on historical patterns.', location: 'System', timestamp: new Date().toISOString(), read: false },
  );

  return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

const CATEGORIES = ['all', 'critical', 'warning', 'info'];
const CAT_STYLE = {
  critical: { bg: 'bg-red-50 dark:bg-red-900/10',    border: 'border-red-200 dark:border-red-800',    badge: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',    icon: 'text-red-600 dark:text-red-400',    dot: 'bg-red-500'    },
  warning:  { bg: 'bg-amber-50 dark:bg-amber-900/10',border: 'border-amber-200 dark:border-amber-800',badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',icon: 'text-amber-600 dark:text-amber-400',dot: 'bg-amber-500'  },
  info:     { bg: 'bg-blue-50 dark:bg-blue-900/10',  border: 'border-blue-100 dark:border-blue-900',  badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',  icon: 'text-blue-600 dark:text-blue-400',  dot: 'bg-blue-400'   },
};

function AlertRow({ alert, onMarkRead, onDismiss }) {
  const s = CAT_STYLE[alert.category] || CAT_STYLE.info;
  const Icon = alert.icon || Info;
  return (
    <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
      !alert.read ? `${s.bg} ${s.border}` : 'bg-white dark:bg-slate-900 border-[#E2E8F0] dark:border-slate-800 opacity-70'
    }`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${!alert.read ? s.bg : 'bg-[#F8FAFC] dark:bg-slate-800'}`}>
        <Icon className={`w-4 h-4 ${s.icon}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-bold ${!alert.read ? 'text-[#0F172A] dark:text-white' : 'text-[#64748B] dark:text-slate-400'}`}>
              {alert.title}
            </p>
            {!alert.read && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />}
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${s.badge}`}>
            {alert.category}
          </span>
        </div>

        <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">{alert.message}</p>

        <div className="flex flex-wrap items-center gap-4 mt-2">
          <span className="flex items-center gap-1 text-xs text-[#94a3b8]">
            <Clock className="w-3 h-3" />
            {new Date(alert.timestamp).toLocaleString()}
          </span>
          <span className="text-xs text-[#94a3b8]">{alert.location}</span>
        </div>

        <div className="flex items-center gap-3 mt-3">
          {!alert.read && (
            <button
              onClick={() => onMarkRead(alert.id)}
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" /> Mark as read
            </button>
          )}
          <button
            onClick={() => onDismiss(alert.id)}
            className="text-xs text-[#94a3b8] hover:text-[#64748B] transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const [allAlerts,   setAllAlerts]   = useState([]);
  const [filter,      setFilter]      = useState('all');
  const [loading,     setLoading]     = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getResults(0, 30);
      setAllAlerts(buildAlerts(Array.isArray(data) ? data : []));
    } catch { setAllAlerts(buildAlerts([])); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead    = (id) => setAllAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  const dismiss     = (id) => setAllAlerts(prev => prev.filter(a => a.id !== id));
  const markAllRead = ()   => setAllAlerts(prev => prev.map(a => ({ ...a, read: true })));

  const filtered  = filter === 'all' ? allAlerts : allAlerts.filter(a => a.category === filter);
  const unreadCnt = allAlerts.filter(a => !a.read).length;
  const counts    = { all: allAlerts.length, critical: allAlerts.filter(a => a.category === 'critical').length, warning: allAlerts.filter(a => a.category === 'warning').length, info: allAlerts.filter(a => a.category === 'info').length };

  const breadcrumbs = [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Alerts' }];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Alerts & Notifications</h1>
            {unreadCnt > 0 && (
              <span className="w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{unreadCnt}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unreadCnt > 0 && (
              <button onClick={markAllRead} className="text-sm font-semibold text-[#2563EB] hover:underline">
                Mark all read
              </button>
            )}
            <button onClick={load} className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => {
            const active = filter === cat;
            const catStyle = CAT_STYLE[cat];
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                  active
                    ? cat === 'all' ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]' : `${catStyle?.bg} ${catStyle?.border} border ${catStyle?.icon}`
                    : 'bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat === 'critical' && <AlertTriangle className="w-3.5 h-3.5" />}
                {cat === 'warning'  && <AlertCircle   className="w-3.5 h-3.5" />}
                {cat === 'info'     && <Info           className="w-3.5 h-3.5" />}
                {cat === 'all'      && <Bell           className="w-3.5 h-3.5" />}
                {cat}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${active && cat !== 'all' ? 'bg-white/30' : 'bg-gray-100 dark:bg-slate-700 text-[#64748B] dark:text-slate-400'}`}>
                  {counts[cat]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Alert list */}
        <div className="space-y-3">
          {loading ? (
            [1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-[#64748B] dark:text-slate-400">No {filter !== 'all' ? filter : ''} alerts at the moment.</p>
            </div>
          ) : (
            filtered.map(a => (
              <AlertRow key={a.id} alert={a} onMarkRead={markRead} onDismiss={dismiss} />
            ))
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
