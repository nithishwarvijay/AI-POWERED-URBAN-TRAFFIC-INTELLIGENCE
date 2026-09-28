import { useState, useEffect, useCallback, useRef } from 'react';
import { getSignalDecisions, getResults } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Zap, RefreshCw, TrendingUp, Clock, BarChart3, Activity, CheckCircle2, AlertCircle } from 'lucide-react';

const APPROACHES = ['N', 'E', 'S', 'W'];
const APPROACH_LABELS = { N: 'North', E: 'East', S: 'South', W: 'West' };

/* ── Signal light component ──────────────────────────────────────────── */
function SignalLight({ approach, isGreen, time, reason, isEmergency }) {
  return (
    <div className={`rounded-2xl border-2 p-5 flex flex-col items-center gap-3 transition-all ${
      isEmergency ? 'border-red-400 bg-red-50 dark:bg-red-900/10' :
      isGreen      ? 'border-green-400 bg-green-50 dark:bg-green-900/10' :
                     'border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900'
    }`}>
      {/* Signal housing */}
      <div className="w-12 h-20 bg-slate-800 rounded-full flex flex-col items-center justify-around py-2 border border-slate-600 shadow-inner">
        <div className={`w-6 h-6 rounded-full border transition-all ${
          !isGreen ? 'bg-red-500 shadow-red-500/60 shadow-md' : 'bg-slate-600 border-slate-500'
        }`} />
        <div className={`w-6 h-6 rounded-full border ${
          isEmergency ? 'bg-amber-400 shadow-amber-400/60 shadow-md animate-pulse' : 'bg-slate-600 border-slate-500'
        }`} />
        <div className={`w-6 h-6 rounded-full border transition-all ${
          isGreen && !isEmergency ? 'bg-green-500 shadow-green-500/60 shadow-md' : 'bg-slate-600 border-slate-500'
        }`} />
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="text-lg font-bold text-[#0F172A] dark:text-white">{APPROACH_LABELS[approach]}</p>
        <p className={`text-xs font-semibold mt-0.5 ${
          isGreen ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
        }`}>
          {isGreen ? '🟢 GREEN' : '🔴 RED'}
        </p>
        {time > 0 && (
          <div className="mt-1 flex items-center gap-1 justify-center text-xs text-[#64748B] dark:text-slate-400">
            <Clock className="w-3 h-3" />
            {time}s
          </div>
        )}
      </div>

      {/* Reason */}
      {reason && (
        <p className="text-[10px] text-[#64748B] dark:text-slate-400 text-center leading-tight max-w-[100px]">{reason}</p>
      )}
    </div>
  );
}

/* ── Q-value bar ─────────────────────────────────────────────────────── */
function QBar({ phase, value, isSelected }) {
  const max = 1;
  const pct = Math.min(100, Math.abs(value) * 100 / max);
  return (
    <div className={`p-3 rounded-xl border ${isSelected ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-900/10' : 'border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800'}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-[#0F172A] dark:text-white">{phase.replace('_', ' ')}</span>
        <span className={`text-xs font-bold ${isSelected ? 'text-[#2563EB]' : 'text-[#64748B] dark:text-slate-400'}`}>{value.toFixed(4)}</span>
      </div>
      <div className="w-full bg-[#E2E8F0] dark:bg-slate-700 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full transition-all ${isSelected ? 'bg-[#2563EB]' : 'bg-[#94a3b8]'}`} style={{ width: `${pct}%` }} />
      </div>
      {isSelected && <p className="text-[10px] text-[#2563EB] mt-1 font-semibold">Selected phase</p>}
    </div>
  );
}

export default function SignalOptimizationPage() {
  const [decisions, setDecisions] = useState([]);
  const [latestResult, setLatestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [sigRes, resRes] = await Promise.all([
        getSignalDecisions(20).catch(() => ({ data: [] })),
        getResults(0, 1).catch(() => ({ data: [] })),
      ]);
      setDecisions(Array.isArray(sigRes.data) ? sigRes.data : []);
      if (resRes.data?.length > 0) setLatestResult(resRes.data[0]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(load, 5000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, load]);

  /* ── Derive current signal state ─────────────────────────────────── */
  const latest = decisions[0] || null;
  const rlDecision = latestResult?.rl_signal_decision || null;
  const displayDecision = rlDecision || (latest ? {
    phase: latest.phase,
    green_approaches: tryParse(latest.green_approaches) || [],
    red_approaches: tryParse(latest.red_approaches) || [],
    green_time_s: latest.green_time_s,
    reason: latest.reason,
    q_values: tryParse(latest.q_values) || {},
    epsilon: null,
    reward_components: null,
  } : null);

  const greenApproaches = displayDecision?.green_approaches || [];
  const isEmergencyMode = displayDecision?.safety_notes?.some(n => n.toLowerCase().includes('emergency')) || false;

  /* ── Signal timing from latest result ───────────────────────────── */
  const signalTiming = latestResult?.signal_timing
    ? tryParse(latestResult.signal_timing) || {}
    : {};

  const laneToDir = { lane1: 'N', lane2: 'E', lane3: 'S', lane4: 'W' };

  const breadcrumbs = [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Signal Optimization' }];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Adaptive Signal Optimization</h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">Q-Learning RL engine · Real-time phase decisions</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setAutoRefresh(v => !v)}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${autoRefresh ? 'bg-[#2563EB]' : 'bg-[#E2E8F0] dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${autoRefresh ? 'translate-x-5' : 'translate-x-1'} shadow`} />
              </div>
              <span className="text-sm text-[#64748B] dark:text-slate-400">Auto-refresh</span>
            </label>
            <button onClick={load} className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* ── Current signal status ─────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#2563EB]" />
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Current Signal Status</h3>
            </div>
            {displayDecision && (
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${isEmergencyMode ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {isEmergencyMode ? 'Emergency Override' : 'Normal Adaptive'}
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-48 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
            </div>
          ) : displayDecision ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {APPROACHES.map(dir => {
                const isGreen = greenApproaches.includes(dir);
                // Try to get time from legacy signal_timing
                const laneKey = Object.entries(laneToDir).find(([, d]) => d === dir)?.[0];
                const laneSignal = laneKey ? signalTiming[laneKey] : null;
                const time = isGreen ? (displayDecision.green_time_s || laneSignal?.time || 0) : 0;
                return (
                  <SignalLight
                    key={dir}
                    approach={dir}
                    isGreen={isGreen}
                    time={time}
                    reason={isGreen ? 'Green phase active' : 'Holding red'}
                    isEmergency={isEmergencyMode && isGreen}
                  />
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-center gap-3">
              <AlertCircle className="w-10 h-10 text-gray-300 dark:text-slate-600" />
              <p className="text-sm text-[#64748B] dark:text-slate-400">No signal decisions yet. Run a traffic analysis to generate RL decisions.</p>
            </div>
          )}
        </div>

        {/* ── AI recommendation ─────────────────────────────────────── */}
        {displayDecision && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommendation card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#2563EB]/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#2563EB]" />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">AI Signal Recommendation</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-[#F8FAFC] dark:bg-slate-800 rounded-xl p-4">
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mb-1">Recommended Phase</p>
                  <p className="text-xl font-bold text-[#2563EB]">{displayDecision.phase?.replace('_', ' ')}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-3">
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-0.5">Green Approaches</p>
                    <p className="font-bold text-[#0F172A] dark:text-white">{displayDecision.green_approaches?.join(', ') || '—'}</p>
                  </div>
                  <div className="bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl p-3">
                    <p className="text-xs text-[#64748B] dark:text-slate-400 font-semibold mb-0.5">Green Duration</p>
                    <p className="font-bold text-[#0F172A] dark:text-white">{displayDecision.green_time_s}s</p>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] dark:bg-slate-800 rounded-xl p-3.5">
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mb-1 font-semibold">Reason</p>
                  <p className="text-sm text-[#0F172A] dark:text-white leading-relaxed">{displayDecision.reason}</p>
                </div>

                {displayDecision.safety_notes?.length > 0 && (
                  <div className="space-y-1">
                    {displayDecision.safety_notes.map((n, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                        <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        {n}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Q-values */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Q-Value Analysis</h3>
              </div>

              {displayDecision.q_values && Object.keys(displayDecision.q_values).length > 0 ? (
                <div className="space-y-3 mb-4">
                  {Object.entries(displayDecision.q_values).map(([phase, val]) => (
                    <QBar key={phase} phase={phase} value={val} isSelected={phase === displayDecision.phase} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#64748B] dark:text-slate-400 mb-4">Q-values available after first RL update.</p>
              )}

              {displayDecision.reward_components && (
                <div className="bg-[#F8FAFC] dark:bg-slate-800 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400 mb-2">Reward Components</p>
                  {Object.entries(displayDecision.reward_components).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-xs">
                      <span className="text-[#64748B] dark:text-slate-400">{k}</span>
                      <span className="font-semibold text-[#0F172A] dark:text-white">{typeof v === 'number' ? v.toFixed(4) : v}</span>
                    </div>
                  ))}
                </div>
              )}

              {displayDecision.epsilon != null && (
                <div className="mt-3 flex items-center justify-between text-xs bg-[#F8FAFC] dark:bg-slate-800 p-3 rounded-xl">
                  <span className="text-[#64748B] dark:text-slate-400">Exploration rate (ε)</span>
                  <span className="font-semibold text-[#0F172A] dark:text-white">{displayDecision.epsilon.toFixed(3)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Decision history ──────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800">
          <div className="px-6 pt-5 pb-4 border-b border-[#E2E8F0] dark:border-slate-800">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Signal Decision History</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Recent Q-Learning phase decisions</p>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
            </div>
          ) : decisions.length === 0 ? (
            <div className="p-10 text-center">
              <TrendingUp className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-[#64748B] dark:text-slate-400">No signal decisions recorded. Run analyses to generate RL data.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-[#E2E8F0] dark:border-slate-800">
                    {['Phase', 'Green Approaches', 'Green Time', 'Reward', 'Intersection', 'Timestamp'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider bg-[#F8FAFC] dark:bg-slate-800/50">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
                  {decisions.map((d, i) => (
                    <tr key={i} className="hover:bg-[#F8FAFC] dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${d.phase === 'NS_GREEN' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                          {d.phase?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-[#0F172A] dark:text-white font-medium">
                        {tryParse(d.green_approaches)?.join(', ') || d.green_approaches || '—'}
                      </td>
                      <td className="px-6 py-3 text-[#64748B] dark:text-slate-400">{d.green_time_s}s</td>
                      <td className="px-6 py-3">
                        <span className={`text-xs font-semibold ${d.reward > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                          {typeof d.reward === 'number' ? d.reward.toFixed(4) : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-[#64748B] dark:text-slate-400">{d.intersection_id || 'main'}</td>
                      <td className="px-6 py-3 text-[#64748B] dark:text-slate-400 whitespace-nowrap text-xs">
                        {d.created_at ? new Date(d.created_at).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}

function tryParse(val) {
  if (!val) return null;
  if (Array.isArray(val) || typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return null; }
}
