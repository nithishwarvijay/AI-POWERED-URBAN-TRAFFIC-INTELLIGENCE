import { useState, useEffect, useCallback } from 'react';
import { getResults } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Siren, AlertTriangle, CheckCircle2, Clock,
  MapPin, RefreshCw, Car, ShieldAlert, Zap,
} from 'lucide-react';

const VEHICLE_ICONS = {
  ambulance:   '🚑',
  'fire truck':'🚒',
  fire_truck:  '🚒',
  police:      '🚔',
  emergency:   '🚨',
};

/* ── Emergency event card ────────────────────────────────────────────── */
function EmergencyCard({ result, index }) {
  const emergency = result.emergency_status;
  const alert     = result.traffic_alert;
  const isReal    = emergency?.emergency === true;

  const icon   = VEHICLE_ICONS[emergency?.vehicle_type?.toLowerCase()] || '🚨';
  const lane   = emergency?.lane || 'Unknown';
  const vtype  = emergency?.vehicle_type || 'Emergency vehicle';
  const action = emergency?.action || '';

  return (
    <div className={`rounded-2xl border-2 p-5 transition-all ${
      isReal
        ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
        : 'border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 opacity-70'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
          isReal ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-slate-800'
        }`}>
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`text-sm font-bold capitalize ${isReal ? 'text-red-700 dark:text-red-400' : 'text-[#0F172A] dark:text-white'}`}>
                {vtype}
              </p>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 truncate">{result.filename}</p>
            </div>
            <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
              isReal
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {isReal ? '⚡ ACTIVE' : 'Clear'}
            </span>
          </div>

          {isReal && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                Lane: <span className="font-semibold text-[#0F172A] dark:text-white">{lane}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {action}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {new Date(result.created_at).toLocaleString()}
              </div>
            </div>
          )}

          {!isReal && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              No emergency vehicle detected
            </div>
          )}
        </div>
      </div>

      {/* Alert message */}
      {isReal && alert?.alert && (
        <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">{alert.alert}</p>
          {alert.action && <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">{alert.action}</p>}
        </div>
      )}
    </div>
  );
}

/* ── Priority activation modal-like panel ────────────────────────────── */
function PriorityPanel({ emergencyResult, onClose }) {
  if (!emergencyResult) return null;
  const e = emergencyResult.emergency_status;
  return (
    <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-300 dark:border-red-700 rounded-2xl p-6 animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <Siren className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-base font-bold text-red-700 dark:text-red-400">Emergency Vehicle Detected</p>
            <p className="text-sm text-red-600 dark:text-red-500">{e?.vehicle_type?.toUpperCase()} · Priority Active</p>
          </div>
        </div>
        <button onClick={onClose} className="text-red-400 hover:text-red-600 text-xl leading-none">×</button>
      </div>

      <p className="text-sm text-red-700 dark:text-red-300 mb-4">{e?.message}</p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 text-center">
          <p className="text-xs text-[#64748B] dark:text-slate-400 mb-1">Lane</p>
          <p className="font-bold text-[#0F172A] dark:text-white">{e?.lane || '—'}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 text-center">
          <p className="text-xs text-[#64748B] dark:text-slate-400 mb-1">Priority</p>
          <p className="font-bold text-red-600 dark:text-red-400">MAXIMUM</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 text-center">
          <p className="text-xs text-[#64748B] dark:text-slate-400 mb-1">Status</p>
          <p className="font-bold text-[#0F172A] dark:text-white">Override</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" /> Activate Priority
        </button>
        <button className="flex-1 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white font-semibold py-2.5 rounded-xl text-sm transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4" /> View Route
        </button>
      </div>
    </div>
  );
}

export default function EmergencyVehiclesPage() {
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showPanel,setShowPanel]= useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getResults(0, 50);
      setResults(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Derived stats ──────────────────────────────────────────────── */
  const withEmergency = results.filter(r => {
    const e = r.emergency_status;
    if (!e) return false;
    if (typeof e === 'object') return e.emergency === true;
    try { return JSON.parse(e)?.emergency === true; } catch { return false; }
  });

  const parseEmergency = (r) => {
    const e = r.emergency_status;
    if (!e) return null;
    if (typeof e === 'object') return e;
    try { return JSON.parse(e); } catch { return null; }
  };

  const totalEmergency  = withEmergency.length;
  const latestEmergency = withEmergency[0] ? { ...withEmergency[0], emergency_status: parseEmergency(withEmergency[0]) } : null;

  /* enrich results */
  const enriched = results.slice(0, 20).map(r => ({
    ...r,
    emergency_status: parseEmergency(r) || { emergency: false },
    traffic_alert: r.traffic_alert && typeof r.traffic_alert === 'string' ? JSON.parse(r.traffic_alert) : (r.traffic_alert || null),
  }));

  const breadcrumbs = [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Emergency Vehicles' }];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Emergency Vehicle Management</h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">Detection, priority routing and signal override control</p>
          </div>
          <button onClick={load} className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Emergency Events',    value: totalEmergency,           icon: Siren,       color: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10 text-[#DC2626]' },
            { label: 'Total Analyses',      value: results.length,           icon: Car,         color: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10 text-[#2563EB]' },
            { label: 'Priority Overrides',  value: totalEmergency,           icon: ShieldAlert, color: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10 text-[#F59E0B]' },
            { label: 'Clear Sessions',      value: results.length - totalEmergency, icon: CheckCircle2, color: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10 text-[#16A34A]' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`rounded-2xl border p-5 ${color}`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5" />
                <span className="text-2xl font-bold">{loading ? '…' : value}</span>
              </div>
              <p className="text-xs font-semibold">{label}</p>
            </div>
          ))}
        </div>

        {/* Active emergency panel */}
        {!loading && latestEmergency && showPanel && (
          <PriorityPanel emergencyResult={latestEmergency} onClose={() => setShowPanel(false)} />
        )}

        {/* No emergency state */}
        {!loading && totalEmergency === 0 && (
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-700 dark:text-green-400">All clear — No emergency vehicles detected</p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                Normal adaptive signal control is active across all monitored intersections.
              </p>
            </div>
          </div>
        )}

        {/* Detection log */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800">
          <div className="px-6 pt-5 pb-4 border-b border-[#E2E8F0] dark:border-slate-800">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Detection History</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Recent analyses with emergency status</p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
              </div>
            ) : enriched.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center gap-2">
                <AlertTriangle className="w-8 h-8 text-gray-300 dark:text-slate-600" />
                <p className="text-sm text-[#64748B] dark:text-slate-400">No analyses found. Upload traffic data to begin monitoring.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {enriched.map((r, i) => (
                  <EmergencyCard key={r.id} result={r} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Emergency types info panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 p-6">
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-white mb-4">Emergency Vehicle Detection Capabilities</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🚑', label: 'Ambulance',    note: 'Medical emergency priority' },
              { icon: '🚒', label: 'Fire Truck',   note: 'Fire response routing' },
              { icon: '🚔', label: 'Police',       note: 'Law enforcement priority' },
              { icon: '🚨', label: 'Emergency',    note: 'General emergency override' },
            ].map(({ icon, label, note }) => (
              <div key={label} className="text-center p-4 bg-[#F8FAFC] dark:bg-slate-800 rounded-xl border border-[#E2E8F0] dark:border-slate-700">
                <div className="text-3xl mb-2">{icon}</div>
                <p className="text-sm font-semibold text-[#0F172A] dark:text-white">{label}</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">{note}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-3 rounded-xl">
            <strong className="text-amber-700 dark:text-amber-400">Note:</strong> Emergency detection uses keyword heuristics on the YOLOv11 label. Standard COCO-trained models do not have a dedicated ambulance/fire/police class. Detection accuracy improves with fine-tuned models.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}
