import { useState, useEffect, useCallback } from 'react';
import { getResults, getStats } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Route, MapPin, Clock, TrendingUp, AlertTriangle,
  CheckCircle2, RefreshCw, Navigation, ChevronRight,
  ArrowRight, Zap, Car,
} from 'lucide-react';

/* ── mock route data derived from real backend stats ─────────────────── */
function buildRoutes(results, stats) {
  const densityMap = { Low: 20, Medium: 55, High: 80 };
  const sample = results.slice(0, 6);

  const corridors = [
    { id: 1, name: 'North–South Corridor',  from: 'Junction 01', to: 'Junction 05', lanes: 4 },
    { id: 2, name: 'East–West Highway',     from: 'Junction 02', to: 'Junction 08', lanes: 6 },
    { id: 3, name: 'Ring Road Inner',       from: 'Junction 03', to: 'Junction 07', lanes: 3 },
    { id: 4, name: 'City Centre Bypass',    from: 'Junction 04', to: 'Junction 06', lanes: 2 },
  ];

  return corridors.map((c, i) => {
    const r = sample[i];
    const density = r ? densityMap[r.density_level] ?? 40 : 30 + i * 15;
    const congestion = density >= 70 ? 'High' : density >= 40 ? 'Moderate' : 'Low';
    const travelMin = Math.round(8 + density * 0.3);
    const altMin    = Math.round(travelMin * 0.75);
    return {
      ...c,
      density,
      congestion,
      travelMin,
      altMin,
      vehicles: r?.total_vehicles ?? Math.floor(density * 1.8),
      filename: r?.filename ?? null,
      congestionPoints: density >= 70 ? [`${c.from} intersection`] : density >= 40 ? [`Near ${c.to}`] : [],
    };
  });
}

const CONGESTION_STYLE = {
  Low:      { bar: 'bg-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400', dot: 'bg-green-500' },
  Moderate: { bar: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400', dot: 'bg-yellow-500' },
  High:     { bar: 'bg-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400', dot: 'bg-red-500' },
};

/* ── Route card ──────────────────────────────────────────────────────── */
function RouteCard({ route, isSelected, onClick }) {
  const style = CONGESTION_STYLE[route.congestion] || CONGESTION_STYLE.Low;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 p-5 transition-all hover:shadow-md ${
        isSelected
          ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-900/10'
          : 'border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-700'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-[#2563EB]' : 'bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700'}`}>
            <Route className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#2563EB]'}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#0F172A] dark:text-white">{route.name}</p>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">{route.from} → {route.to}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${style.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {route.congestion}
        </span>
      </div>

      {/* Density bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[#64748B] dark:text-slate-400">Density</span>
          <span className="text-xs font-semibold text-[#0F172A] dark:text-white">{route.density}%</span>
        </div>
        <div className="w-full bg-[#E2E8F0] dark:bg-slate-700 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full transition-all ${style.bar}`} style={{ width: `${route.density}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{route.travelMin} min</span>
        <span className="flex items-center gap-1"><Car className="w-3 h-3" />{route.vehicles} vehicles</span>
        <span>{route.lanes} lanes</span>
      </div>
    </button>
  );
}

/* ── Route detail panel ──────────────────────────────────────────────── */
function RouteDetail({ route }) {
  if (!route) return null;
  const style = CONGESTION_STYLE[route.congestion] || CONGESTION_STYLE.Low;
  const saving = route.travelMin - route.altMin;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">{route.name}</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400">{route.from} → {route.to}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Metric label="Current Time" value={`${route.travelMin} min`} color="text-[#0F172A] dark:text-white" />
          <Metric label="Congestion" value={route.congestion} color={style.badge.split(' ').filter(c => c.startsWith('text-'))[0]} />
          <Metric label="Vehicles" value={route.vehicles} color="text-[#0F172A] dark:text-white" />
        </div>
      </div>

      {/* Map-style visualization */}
      <div className="bg-slate-900 rounded-2xl p-6 relative overflow-hidden" style={{ minHeight: 220 }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage:'radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)', backgroundSize:'24px 24px' }} />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Route Visualization</p>

          {/* Route line */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#2563EB] shadow-blue-500/60 shadow-md" />
              <div className="w-0.5 h-10 bg-gradient-to-b from-[#2563EB] to-[#06B6D4] opacity-60" />
              <div className="w-3 h-3 rounded-full bg-[#06B6D4] shadow-cyan-400/60 shadow-md" />
              <div className="w-0.5 h-10 bg-gradient-to-b from-[#06B6D4] to-green-400 opacity-60" />
              <div className="w-4 h-4 rounded-full bg-green-400 shadow-green-400/60 shadow-md flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">D</span>
              </div>
            </div>
            <div className="flex flex-col justify-between" style={{ height: 100 }}>
              <div>
                <p className="text-xs font-semibold text-white">{route.from}</p>
                <p className="text-[10px] text-slate-400">Start point</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#06B6D4]">Via Main Corridor</p>
                <p className="text-[10px] text-slate-400">{route.density}% density · {route.lanes} lanes</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-green-400">{route.to}</p>
                <p className="text-[10px] text-slate-400">Destination</p>
              </div>
            </div>
          </div>

          {/* Congestion points */}
          {route.congestionPoints.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-amber-400 font-semibold mb-1">⚠ Congestion points:</p>
              {route.congestionPoints.map((pt, i) => (
                <p key={i} className="text-xs text-slate-300">{pt}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alternative route */}
      <div className={`rounded-2xl border p-5 ${saving > 0 ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' : 'border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900'}`}>
        <div className="flex items-center gap-2 mb-3">
          <Zap className={`w-4 h-4 ${saving > 0 ? 'text-green-600 dark:text-green-400' : 'text-[#64748B]'}`} />
          <h4 className="text-sm font-bold text-[#0F172A] dark:text-white">Suggested Alternative Route</h4>
          {saving > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              Save {saving} min
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-slate-400 mb-2">
          <span>{route.from}</span>
          <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Alternate Bypass</span>
          <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{route.to}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-[#E2E8F0] dark:border-slate-700">
            <p className="text-xs text-[#64748B] dark:text-slate-400">Estimated time</p>
            <p className="font-bold text-green-600 dark:text-green-400">{route.altMin} min</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-[#E2E8F0] dark:border-slate-700">
            <p className="text-xs text-[#64748B] dark:text-slate-400">Expected density</p>
            <p className="font-bold text-[#0F172A] dark:text-white">Low</p>
          </div>
        </div>

        {saving > 0 && (
          <p className="text-xs text-green-700 dark:text-green-400 mt-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            AI recommends this alternate route based on current density data.
          </p>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div className="bg-[#F8FAFC] dark:bg-slate-800 rounded-xl p-3 text-center border border-[#E2E8F0] dark:border-slate-700">
      <p className="text-xs text-[#64748B] dark:text-slate-400 mb-1">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function RouteIntelligencePage() {
  const [results,       setResults]       = useState([]);
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([
        getResults(0, 10).catch(() => ({ data: [] })),
        getStats().catch(() => ({ data: null })),
      ]);
      setResults(r.data);
      setStats(s.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const routes = buildRoutes(results, stats);

  useEffect(() => {
    if (routes.length > 0 && !selectedRoute) setSelectedRoute(routes[0]);
  }, [routes.length]);

  const breadcrumbs = [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Route Intelligence' }];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Route Intelligence</h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">AI-driven route analysis with congestion forecasts and alternative suggestions</p>
          </div>
          <button onClick={load} className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Summary pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Monitored Corridors', value: routes.length, color: 'text-[#2563EB]', bg: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' },
            { label: 'High Congestion', value: routes.filter(r => r.congestion === 'High').length, color: 'text-[#DC2626]', bg: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' },
            { label: 'Moderate Routes', value: routes.filter(r => r.congestion === 'Moderate').length, color: 'text-[#F59E0B]', bg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' },
            { label: 'Clear Routes', value: routes.filter(r => r.congestion === 'Low').length, color: 'text-[#16A34A]', bg: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-2xl border p-4 ${bg}`}>
              <p className={`text-2xl font-bold ${color}`}>{loading ? '…' : value}</p>
              <p className={`text-xs font-semibold mt-1 ${color}`}>{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Route list */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Traffic Corridors</h3>
            {loading ? (
              [1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)
            ) : (
              routes.map(r => (
                <RouteCard key={r.id} route={r} isSelected={selectedRoute?.id === r.id} onClick={() => setSelectedRoute(r)} />
              ))
            )}
          </div>

          {/* Route detail */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white mb-4">Route Analysis</h3>
            {loading ? (
              <div className="space-y-4">
                <div className="h-48 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                <div className="h-36 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
              </div>
            ) : selectedRoute ? (
              <RouteDetail route={selectedRoute} />
            ) : (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-[#E2E8F0] dark:border-slate-700 rounded-2xl">
                <p className="text-sm text-[#64748B] dark:text-slate-400">Select a corridor to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* All corridors table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800">
          <div className="px-6 pt-5 pb-4 border-b border-[#E2E8F0] dark:border-slate-800">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">All Corridor Status</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-slate-800">
                  {['Corridor', 'From → To', 'Vehicles', 'Density', 'Status', 'Est. Time', 'Alt. Route'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider bg-[#F8FAFC] dark:bg-slate-800/50 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
                {routes.map(r => {
                  const style = CONGESTION_STYLE[r.congestion] || CONGESTION_STYLE.Low;
                  return (
                    <tr key={r.id} className="hover:bg-[#F8FAFC] dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-3 font-semibold text-[#0F172A] dark:text-white">{r.name}</td>
                      <td className="px-6 py-3 text-[#64748B] dark:text-slate-400 text-xs">{r.from} → {r.to}</td>
                      <td className="px-6 py-3 text-[#0F172A] dark:text-white">{r.vehicles}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-[#E2E8F0] dark:bg-slate-700 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${style.bar}`} style={{ width: `${r.density}%` }} />
                          </div>
                          <span className="text-xs text-[#64748B] dark:text-slate-400">{r.density}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>{r.congestion}</span>
                      </td>
                      <td className="px-6 py-3 text-[#64748B] dark:text-slate-400">{r.travelMin} min</td>
                      <td className="px-6 py-3">
                        {r.travelMin > r.altMin ? (
                          <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {r.altMin} min alt.
                          </span>
                        ) : (
                          <span className="text-xs text-[#64748B] dark:text-slate-400">Optimal</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
