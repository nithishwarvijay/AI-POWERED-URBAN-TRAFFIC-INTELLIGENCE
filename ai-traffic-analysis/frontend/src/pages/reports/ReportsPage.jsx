import { useState, useEffect, useCallback } from 'react';
import { getStats, getResults } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  FileText, Download, RefreshCw, CheckCircle2,
  Calendar, BarChart3, Car, Siren, Signal, Clock,
} from 'lucide-react';

const REPORT_TYPES = [
  { id: 'daily',     label: 'Daily Traffic Report',        icon: Calendar,  desc: 'Vehicle counts, density levels and alerts for today' },
  { id: 'weekly',    label: 'Weekly Traffic Report',       icon: BarChart3, desc: '7-day trend analysis with peak hours and averages' },
  { id: 'density',   label: 'Traffic Density Report',      icon: Car,       desc: 'Per-approach N/E/S/W density breakdown across all analyses' },
  { id: 'signal',    label: 'Signal Optimization Report',  icon: Signal,    desc: 'Q-Learning decisions, phase durations and reward history' },
  { id: 'emergency', label: 'Emergency Vehicle Report',    icon: Siren,     desc: 'All detected emergency events and priority actions taken' },
];

function buildCSV(type, stats, results) {
  const header = ['Generated', new Date().toLocaleString()].join(',');
  const rows = [header, ''];

  if (type === 'daily' || type === 'weekly') {
    rows.push('Metric,Value');
    rows.push(`Total Vehicles,${stats?.total_vehicles_detected ?? 0}`);
    rows.push(`Total Analyses,${stats?.total_analyses ?? 0}`);
    rows.push(`Total Violations,${stats?.total_violations ?? 0}`);
    rows.push(`Emergency Events,${stats?.emergency_events ?? 0}`);
    rows.push('');
    rows.push('Analysis ID,Filename,Vehicles,Density,Date');
    results.forEach(r => rows.push(`${r.id},${r.filename},${r.total_vehicles},${r.density_level},${new Date(r.created_at).toLocaleDateString()}`));
  } else if (type === 'density') {
    rows.push('Analysis ID,Filename,Total Vehicles,Density Level,Violations');
    results.forEach(r => rows.push(`${r.id},${r.filename},${r.total_vehicles},${r.density_level},${r.violation_count ?? 0}`));
  } else if (type === 'emergency') {
    rows.push('Analysis ID,Filename,Emergency,Vehicle Type,Lane,Message');
    results.forEach(r => {
      const e = r.emergency_status ? (typeof r.emergency_status === 'string' ? JSON.parse(r.emergency_status) : r.emergency_status) : null;
      if (e?.emergency) rows.push(`${r.id},${r.filename},YES,${e.vehicle_type || ''},${e.lane || ''},${e.message || ''}`);
    });
  } else if (type === 'signal') {
    rows.push('Analysis ID,Phase,Green Approaches,Green Time,Reason');
    results.forEach(r => {
      const d = r.rl_signal_decision ? (typeof r.rl_signal_decision === 'string' ? JSON.parse(r.rl_signal_decision) : r.rl_signal_decision) : null;
      if (d) rows.push(`${r.id},${d.phase || ''},${(d.green_approaches || []).join(';')},${d.green_time_s || ''},${(d.reason || '').replace(/,/g, ';')}`);
    });
  }
  return rows.join('\n');
}

function ReportCard({ report, onGenerate, generating, generated }) {
  const Icon = report.icon;
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border-2 p-6 transition-all ${
      generated ? 'border-green-300 dark:border-green-700' : 'border-[#E2E8F0] dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${generated ? 'bg-green-100 dark:bg-green-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
            {generated ? <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" /> : <Icon className="w-5 h-5 text-[#2563EB]" />}
          </div>
          <div>
            <p className="text-sm font-bold text-[#0F172A] dark:text-white">{report.label}</p>
            {generated && <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">Ready to download</p>}
          </div>
        </div>
      </div>
      <p className="text-xs text-[#64748B] dark:text-slate-400 mb-5 leading-relaxed">{report.desc}</p>
      <button
        onClick={() => onGenerate(report.id)}
        disabled={generating === report.id}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
          generated
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-[#2563EB] hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white disabled:cursor-not-allowed'
        }`}
      >
        {generating === report.id ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</>
        ) : generated ? (
          <><Download className="w-4 h-4" />Download CSV</>
        ) : (
          <><FileText className="w-4 h-4" />Generate Report</>
        )}
      </button>
    </div>
  );
}

export default function ReportsPage() {
  const [stats,       setStats]      = useState(null);
  const [results,     setResults]    = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [generating,  setGenerating] = useState(null);
  const [generated,   setGenerated]  = useState({});
  const [csvCache,    setCsvCache]   = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, rRes] = await Promise.all([
        getStats().catch(() => ({ data: null })),
        getResults(0, 100).catch(() => ({ data: [] })),
      ]);
      setStats(sRes.data);
      setResults(Array.isArray(rRes.data) ? rRes.data : []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async (reportId) => {
    if (generated[reportId]) {
      // already generated → download
      const csv = csvCache[reportId];
      const blob = new Blob([csv], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      const reportTitle = reportId.charAt(0).toUpperCase() + reportId.slice(1);
      a.href = url;
      a.download = `Traffic_Analyzer_${reportTitle}_Report_${dateStr}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    setGenerating(reportId);
    await new Promise(r => setTimeout(r, 800)); // simulate build time
    const csv = buildCSV(reportId, stats, results);
    setCsvCache(p => ({ ...p, [reportId]: csv }));
    setGenerated(p => ({ ...p, [reportId]: true }));
    setGenerating(null);
  };

  const breadcrumbs = [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Reports</h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">Generate and export traffic intelligence reports</p>
          </div>
          <button onClick={load} className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Analyses', value: stats?.total_analyses ?? 0, color: 'text-[#2563EB]', bg: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10' },
            { label: 'Total Vehicles', value: stats?.total_vehicles_detected ?? 0, color: 'text-[#06B6D4]', bg: 'border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-900/10' },
            { label: 'Violations',     value: stats?.total_violations ?? 0, color: 'text-[#DC2626]', bg: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10' },
            { label: 'Emergency Events', value: stats?.emergency_events ?? 0, color: 'text-[#F59E0B]', bg: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-2xl border p-5 ${bg}`}>
              <p className={`text-2xl font-bold ${color}`}>{loading ? '…' : value.toLocaleString()}</p>
              <p className={`text-xs font-semibold mt-1 ${color}`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Report cards */}
        <div>
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-white mb-4">Available Reports</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REPORT_TYPES.map(r => (
              <ReportCard
                key={r.id}
                report={r}
                onGenerate={handleGenerate}
                generating={generating}
                generated={!!generated[r.id]}
              />
            ))}
          </div>
        </div>

        {/* Recent analyses for report context */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800">
          <div className="px-6 pt-5 pb-4 border-b border-[#E2E8F0] dark:border-slate-800">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Report Data Source</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Latest {results.length} analyses included in all reports</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-slate-800">
                  {['#','File','Vehicles','Density','Date'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider bg-[#F8FAFC] dark:bg-slate-800/50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
                {loading ? (
                  [1,2,3].map(i => (
                    <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" /></td></tr>
                  ))
                ) : results.slice(0, 10).map((r, i) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFC] dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3 text-[#64748B] dark:text-slate-400">{i + 1}</td>
                    <td className="px-6 py-3 text-[#0F172A] dark:text-white font-medium max-w-[200px] truncate">{r.filename}</td>
                    <td className="px-6 py-3 font-semibold text-[#0F172A] dark:text-white">{r.total_vehicles}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ r.density_level === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' : r.density_level === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' }`}>{r.density_level || 'Low'}</span>
                    </td>
                    <td className="px-6 py-3 text-[#64748B] dark:text-slate-400 whitespace-nowrap text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
