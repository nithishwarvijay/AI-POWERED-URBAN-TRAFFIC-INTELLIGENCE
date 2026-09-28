import { useState, useEffect, useCallback } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, PointElement, LineElement, Tooltip, Legend, Filler,
} from 'chart.js';
import {
  BarChart3, Download, RefreshCw, TrendingUp, Car,
  Clock, AlertTriangle, Filter, ChevronDown,
} from 'lucide-react';
import { getStats, getResults } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Tooltip, Legend, Filler);

const TICK = '#94a3b8';
const GRID = 'rgba(148,163,184,0.1)';
const FONT = { family: 'Inter, system-ui, sans-serif', size: 11 };

const baseOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { bodyFont: FONT, titleFont: FONT } },
  scales: {
    x: { grid: { display: false }, ticks: { color: TICK, font: FONT } },
    y: { grid: { color: GRID },    ticks: { color: TICK, font: FONT } },
  },
};

const DATE_FILTERS = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Custom Range'];

/* ── helpers ──────────────────────────────────────────────────────────── */
function SCard({ title, sub, children, action }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 overflow-hidden">
      <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#E2E8F0] dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">{title}</h3>
          {sub && <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${color}`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs mt-0.5 opacity-80">{label}</p>
    </div>
  );
}

export default function TrafficAnalyticsPage() {
  const [stats,   setStats]   = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Last 7 Days');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, rRes] = await Promise.all([
        getStats().catch(() => ({ data: null })),
        getResults(0, 50).catch(() => ({ data: [] })),
      ]);
      setStats(sRes.data);
      setResults(rRes.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── derived data ───────────────────────────────────────────────────── */
  const vt = stats?.vehicle_type_totals ?? {};
  const dd = stats?.density_distribution ?? { Low: 0, Medium: 0, High: 0 };

  // Build lane density from latest result that has lane_counts
  const latestWithLanes = results.find(r => r.lane_counts);
  const laneCounts = latestWithLanes?.lane_counts ?? { lane1: 0, lane2: 0, lane3: 0, lane4: 0 };

  /* ── chart datasets ──────────────────────────────────────────────────── */
  const vehicleDist = {
    labels: Object.keys(vt).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    datasets: [{ data: Object.values(vt), backgroundColor: ['#2563EB','#06B6D4','#F59E0B','#DC2626','#16A34A'], borderWidth: 0, hoverOffset: 6 }],
  };

  const densityDist = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [{ label: 'Analyses', data: [dd.Low, dd.Medium, dd.High], backgroundColor: ['#16A34A','#F59E0B','#DC2626'], borderRadius: 6, borderSkipped: false }],
  };

  const laneData = {
    labels: ['Lane 1 (North)', 'Lane 2 (East)', 'Lane 3 (South)', 'Lane 4 (West)'],
    datasets: [{ label: 'Vehicles', data: Object.values(laneCounts), backgroundColor: ['#2563EB','#06B6D4','#16A34A','#F59E0B'], borderRadius: 6, borderSkipped: false }],
  };

  const volumeTrend = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Traffic Volume',
      data: [320, 480, 390, 620, 540, 410, 290],
      borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,0.08)',
      tension: 0.4, fill: true, pointRadius: 3, pointBackgroundColor: '#2563EB', borderWidth: 2,
    }],
  };

  const congestionTrend = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Density %',
      data: [42, 67, 71, 58, 80, 55, 38],
      borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.08)',
      tension: 0.4, fill: true, pointRadius: 3, pointBackgroundColor: '#F59E0B', borderWidth: 2,
    }],
  };

  const waitTimeTrend = {
    labels: ['6am','8am','10am','12pm','2pm','4pm','6pm','8pm'],
    datasets: [{
      label: 'Wait Time (s)',
      data: [12, 48, 38, 55, 42, 70, 58, 25],
      borderColor: '#06B6D4', backgroundColor: 'rgba(6,182,212,0.08)',
      tension: 0.4, fill: true, pointRadius: 3, pointBackgroundColor: '#06B6D4', borderWidth: 2,
    }],
  };

  const hourly = {
    labels: ['6am','8am','10am','12pm','2pm','4pm','6pm','8pm'],
    datasets: [{ label: 'Vehicles/hr', data: [110, 370, 280, 440, 310, 510, 400, 175], backgroundColor: '#2563EB', borderRadius: 6, borderSkipped: false }],
  };

  /* ── export handler ──────────────────────────────────────────────────── */
  const handleExport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Vehicles', stats?.total_vehicles_detected ?? 0],
      ['Total Analyses', stats?.total_analyses ?? 0],
      ['Total Violations', stats?.total_violations ?? 0],
      ['Emergency Events', stats?.emergency_events ?? 0],
      ['High Traffic Events', stats?.high_traffic_events ?? 0],
      ['Low Density Sessions', dd.Low],
      ['Medium Density Sessions', dd.Medium],
      ['High Density Sessions', dd.High],
      ...Object.entries(vt).map(([k, v]) => [`Vehicles: ${k}`, v]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `Traffic_Analyzer_Traffic_Analytics_Report_${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const breadcrumbs = [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Traffic Analytics' }];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Traffic Analytics</h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">Comprehensive traffic intelligence and trend analysis</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Date filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(v => !v)}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Filter className="w-4 h-4 text-[#64748B]" />
                {activeFilter}
                <ChevronDown className="w-4 h-4 text-[#64748B]" />
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl shadow-xl py-1 z-30 animate-fade-in">
                  {DATE_FILTERS.map(f => (
                    <button key={f} onClick={() => { setActiveFilter(f); setShowFilterMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${activeFilter === f ? 'text-[#2563EB] font-semibold bg-blue-50 dark:bg-blue-900/20' : 'text-[#0F172A] dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => load()} className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button onClick={handleExport} className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors shadow-sm">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Summary pills */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatPill label="Total Vehicles" value={(stats?.total_vehicles_detected ?? 0).toLocaleString()}
            color="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10 text-[#2563EB]" />
          <StatPill label="Total Analyses" value={(stats?.total_analyses ?? 0).toLocaleString()}
            color="border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-900/10 text-[#06B6D4]" />
          <StatPill label="Violations" value={(stats?.total_violations ?? 0).toLocaleString()}
            color="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10 text-[#DC2626]" />
          <StatPill label="Emergency Events" value={(stats?.emergency_events ?? 0).toLocaleString()}
            color="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/10 text-[#F59E0B]" />
          <StatPill label="High Traffic" value={(stats?.high_traffic_events ?? 0).toLocaleString()}
            color="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/10 text-purple-600" />
        </div>

        {/* Row 1: Volume trend + Hourly */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SCard title="Traffic Volume Trend" sub={`${activeFilter} — vehicles detected`}>
            <div className="h-56"><Line data={volumeTrend} options={baseOpts} /></div>
          </SCard>
          <SCard title="Hourly Traffic Volume" sub="Vehicle counts by hour (demo)">
            <div className="h-56"><Bar data={hourly} options={baseOpts} /></div>
          </SCard>
        </div>

        {/* Row 2: Vehicle dist + Density dist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SCard title="Vehicle Type Distribution" sub="Breakdown of detected vehicle categories">
            {loading ? <Spinner /> : Object.keys(vt).length > 0 ? (
              <div className="h-64">
                <Doughnut data={vehicleDist} options={{
                  responsive: true, maintainAspectRatio: false, cutout: '68%',
                  plugins: { legend: { position: 'bottom', labels: { padding: 12, font: FONT, color: TICK, boxWidth: 10, usePointStyle: true } }, tooltip: { bodyFont: FONT } },
                }} />
              </div>
            ) : <EmptyMsg label="No vehicle data yet — run an analysis first." />}
          </SCard>

          <SCard title="Congestion Level Distribution" sub="Analyses classified by density level">
            <div className="h-64"><Bar data={densityDist} options={baseOpts} /></div>
          </SCard>
        </div>

        {/* Row 3: Lane density + Congestion trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SCard title="Lane-wise Vehicle Density" sub={latestWithLanes ? `From: ${latestWithLanes.filename}` : 'Latest analysis with lane data'}>
            {loading ? <Spinner /> : latestWithLanes ? (
              <div className="h-56"><Bar data={laneData} options={baseOpts} /></div>
            ) : <EmptyMsg label="No lane data available yet. Run a traffic analysis to see per-lane density." />}
          </SCard>

          <SCard title="Congestion Trend" sub="Average density % over time (demo)">
            <div className="h-56"><Line data={congestionTrend} options={baseOpts} /></div>
          </SCard>
        </div>

        {/* Row 4: Wait time */}
        <SCard title="Average Waiting Time" sub="Signal wait time trend across the day (demo data)">
          <div className="h-52"><Line data={waitTimeTrend} options={baseOpts} /></div>
        </SCard>

        {/* Recent analyses table */}
        <SCard title="Recent Analysis Records" sub="Last 50 traffic analyses">
          {loading ? <Spinner /> : results.length === 0 ? (
            <EmptyMsg label="No analyses found. Upload traffic footage to begin." />
          ) : (
            <div className="overflow-x-auto -mx-6 -mb-6">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-[#E2E8F0] dark:border-slate-800">
                    {['#','File','Type','Vehicles','Density','Violations','Date'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider bg-[#F8FAFC] dark:bg-slate-800/50">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
                  {results.map((r, i) => (
                    <tr key={r.id} className="hover:bg-[#F8FAFC] dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-3 text-[#64748B] dark:text-slate-400">{i + 1}</td>
                      <td className="px-6 py-3 text-[#0F172A] dark:text-white font-medium max-w-[200px] truncate">{r.filename}</td>
                      <td className="px-6 py-3 capitalize text-[#64748B] dark:text-slate-400">{r.media_type}</td>
                      <td className="px-6 py-3 font-semibold text-[#0F172A] dark:text-white">{r.total_vehicles}</td>
                      <td className="px-6 py-3">
                        <DensityPill level={r.density_level} />
                      </td>
                      <td className="px-6 py-3 text-[#64748B] dark:text-slate-400">{r.violation_count ?? 0}</td>
                      <td className="px-6 py-3 text-[#64748B] dark:text-slate-400 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SCard>

      </div>
    </DashboardLayout>
  );
}

function DensityPill({ level }) {
  const m = { Low: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400', Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400', High: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${m[level] || m.Low}`}>{level || 'Low'}</span>;
}
function Spinner() {
  return <div className="h-40 flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 dark:border-slate-700 border-t-[#2563EB] rounded-full animate-spin" /></div>;
}
function EmptyMsg({ label }) {
  return <div className="h-40 flex items-center justify-center"><p className="text-sm text-[#64748B] dark:text-slate-400 text-center">{label}</p></div>;
}
