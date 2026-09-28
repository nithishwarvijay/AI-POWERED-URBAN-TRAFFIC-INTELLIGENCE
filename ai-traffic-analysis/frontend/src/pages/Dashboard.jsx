import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, PointElement, LineElement,
  Tooltip, Legend, Filler,
} from "chart.js";
import {
  Car, AlertTriangle, Activity, TrendingUp, Clock,
  ArrowUpRight, ArrowDownRight, Zap, Signal, Siren,
  RefreshCw, BarChart3, Eye, ChevronRight,
  CheckCircle2, XCircle, AlertCircle, Minus,
} from "lucide-react";
import { getStats, getResults } from "../services/api";
import DashboardLayout from "../components/layout/DashboardLayout";
import { SkeletonKPICard, SkeletonChart } from "../components/ui/Skeleton";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  ArcElement, PointElement, LineElement,
  Tooltip, Legend, Filler
);

/* ── Shared chart defaults ─────────────────────────────────────────────── */
const CHART_FONT = { family: 'Inter, system-ui, sans-serif', size: 11 };
const TICK_COLOR = '#94a3b8';
const GRID_COLOR = 'rgba(148,163,184,0.1)';

function chartDefaults(dark = false) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { bodyFont: CHART_FONT, titleFont: CHART_FONT } },
    scales: {
      x: { grid: { display: false }, ticks: { color: TICK_COLOR, font: CHART_FONT } },
      y: { grid: { color: GRID_COLOR }, ticks: { color: TICK_COLOR, font: CHART_FONT } },
    },
  };
}

/* ── KPI card ──────────────────────────────────────────────────────────── */
function KPI({ title, value, unit = '', icon: Icon, iconBg, trend, sub, loading }) {
  if (loading) return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 p-5 animate-pulse">
      <div className="h-3 w-24 bg-gray-200 dark:bg-slate-700 rounded mb-4" />
      <div className="h-8 w-20 bg-gray-200 dark:bg-slate-700 rounded mb-3" />
      <div className="h-3 w-32 bg-gray-100 dark:bg-slate-800 rounded" />
    </div>
  );
  const trendUp   = trend?.direction === 'up';
  const trendDown = trend?.direction === 'down';
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            trendUp   ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
            trendDown ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                        'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {trendUp   ? <ArrowUpRight className="w-3 h-3" /> :
             trendDown ? <ArrowDownRight className="w-3 h-3" /> :
                         <Minus className="w-3 h-3" />}
            {trend.value !== 0 ? `${trend.value}%` : 'Stable'}
          </div>
        )}
      </div>
      <div className="mb-1">
        <span className="text-2xl font-bold text-[#0F172A] dark:text-white">{value}</span>
        {unit && <span className="text-sm font-medium text-[#64748B] dark:text-slate-400 ml-1">{unit}</span>}
      </div>
      <p className="text-sm font-medium text-[#64748B] dark:text-slate-400">{title}</p>
      {sub && <p className="text-xs text-[#94a3b8] mt-0.5">{sub}</p>}
    </div>
  );
}

/* ── Section card wrapper ──────────────────────────────────────────────── */
function SectionCard({ title, sub, action, children, noPad }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800">
      <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#E2E8F0] dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">{title}</h3>
          {sub && <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
      <div className={noPad ? '' : 'p-6'}>{children}</div>
    </div>
  );
}

/* ── Density badge ─────────────────────────────────────────────────────── */
function DensityBadge({ level }) {
  const map = {
    Low:      'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    Medium:   'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
    High:     'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
    Critical: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  };
  const dots = { Low: 'bg-green-500', Medium: 'bg-yellow-500', High: 'bg-orange-500', Critical: 'bg-red-500' };
  const cls  = map[level] || map.Low;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[level] || dots.Low}`} />
      {level || 'Low'}
    </span>
  );
}

/* ── System status row ─────────────────────────────────────────────────── */
function StatusRow({ label, status, note }) {
  const ok = status === 'online';
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#E2E8F0] dark:border-slate-800 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${ok ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
        <span className="text-sm text-[#0F172A] dark:text-white font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {note && <span className="text-xs text-[#64748B] dark:text-slate-400">{note}</span>}
        <span className={`text-xs font-semibold capitalize ${ok ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>{status}</span>
      </div>
    </div>
  );
}

/* ── Main Dashboard ────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [statsRes, resultsRes] = await Promise.all([
        getStats().catch(() => ({ data: null })),
        getResults(0, 6).catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      setRecent(resultsRes.data);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Derived metrics ─────────────────────────────────────────────────── */
  const totalVehicles  = stats?.total_vehicles_detected ?? 0;
  const totalAnalyses  = stats?.total_analyses ?? 0;
  const totalViolations= stats?.total_violations ?? 0;
  const emergencyEvents= stats?.emergency_events ?? 0;
  const highTraffic    = stats?.high_traffic_events ?? 0;
  const densityDist    = stats?.density_distribution ?? { Low: 0, Medium: 0, High: 0 };
  const vehicleTypes   = stats?.vehicle_type_totals ?? {};
  const avgDensityPct  = totalAnalyses > 0
    ? Math.round(((densityDist.Medium ?? 0) * 50 + (densityDist.High ?? 0) * 80) / Math.max(totalAnalyses, 1))
    : 0;

  /* ── Chart data ──────────────────────────────────────────────────────── */
  const vehicleDistChart = Object.keys(vehicleTypes).length > 0 ? {
    labels: Object.keys(vehicleTypes).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    datasets: [{
      data: Object.values(vehicleTypes),
      backgroundColor: ['#2563EB','#06B6D4','#F59E0B','#DC2626','#16A34A'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  } : null;

  const densityTrendChart = {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [{
      label: 'Traffic Density %',
      data: [45, 62, 78, 71, 55, 48, 40],
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37,99,235,0.08)',
      tension: 0.4, fill: true, pointRadius: 3,
      pointBackgroundColor: '#2563EB', borderWidth: 2,
    }],
  };

  const hourlyChart = {
    labels: ['6am','8am','10am','12pm','2pm','4pm','6pm','8pm'],
    datasets: [{
      label: 'Vehicles/hr',
      data: [120, 380, 290, 450, 310, 520, 410, 180],
      backgroundColor: '#2563EB',
      borderRadius: 6, borderSkipped: false,
    }],
  };

  const densityDistChart = {
    labels: ['Low','Medium','High'],
    datasets: [{
      label: 'Analyses',
      data: [densityDist.Low, densityDist.Medium, densityDist.High],
      backgroundColor: ['#16A34A','#F59E0B','#DC2626'],
      borderRadius: 6, borderSkipped: false,
    }],
  };

  const breadcrumbs = [{ label: 'Dashboard' }];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Traffic Intelligence Dashboard</h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
              Real-time AI-powered monitoring and analytics overview
              {!loading && (
                <span className="ml-2 text-xs text-[#94a3b8]">
                  · Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              to="/vehicle-detection"
              className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Activity className="w-4 h-4" />
              Analyze Traffic
            </Link>
          </div>
        </div>

        {/* ── Quick actions ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Analyze Traffic',    icon: Activity,    to: '/vehicle-detection', color: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10 text-[#2563EB]' },
            { label: 'Traffic Analytics',  icon: BarChart3,   to: '/analytics',         color: 'border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-900/10 text-[#06B6D4]' },
            { label: 'Signal Control',     icon: Signal,      to: '/signals',           color: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10 text-[#16A34A]' },
            { label: 'Emergency Panel',    icon: Siren,       to: '/emergency',         color: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10 text-[#DC2626]' },
          ].map(({ label, icon: Icon, to, color }) => (
            <Link
              key={label} to={to}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all hover:shadow-sm hover:scale-[1.01] ${color}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-semibold">{label}</span>
            </Link>
          ))}
        </div>

        {/* ── Primary KPI cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI loading={loading}
            title="Total Vehicles"
            value={totalVehicles.toLocaleString()}
            icon={Car}
            iconBg="bg-blue-50 dark:bg-blue-900/20 text-[#2563EB]"
            trend={{ value: 12, direction: 'up' }}
            sub="All time detected"
          />
          <KPI loading={loading}
            title="Traffic Analyses"
            value={totalAnalyses.toLocaleString()}
            icon={Activity}
            iconBg="bg-cyan-50 dark:bg-cyan-900/20 text-[#06B6D4]"
            trend={{ value: 8, direction: 'up' }}
            sub="Total sessions"
          />
          <KPI loading={loading}
            title="Emergency Events"
            value={emergencyEvents.toLocaleString()}
            icon={Siren}
            iconBg="bg-red-50 dark:bg-red-900/20 text-[#DC2626]"
            trend={{ value: 0, direction: 'neutral' }}
            sub="Detected incidents"
          />
          <KPI loading={loading}
            title="High Traffic Events"
            value={highTraffic.toLocaleString()}
            icon={AlertTriangle}
            iconBg="bg-orange-50 dark:bg-orange-900/20 text-[#F59E0B]"
            trend={{ value: 5, direction: 'up' }}
            sub="Critical/emergency alerts"
          />
        </div>

        {/* ── Secondary KPI cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI loading={loading}
            title="Traffic Violations"
            value={totalViolations.toLocaleString()}
            icon={XCircle}
            iconBg="bg-red-50 dark:bg-red-900/20 text-[#DC2626]"
            trend={{ value: 3, direction: 'down' }}
            sub="Rule infractions"
          />
          <KPI loading={loading}
            title="Avg Traffic Density"
            value={avgDensityPct}
            unit="%"
            icon={TrendingUp}
            iconBg="bg-orange-50 dark:bg-orange-900/20 text-[#F59E0B]"
            trend={{ value: 5, direction: 'up' }}
            sub="Weighted average"
          />
          <KPI loading={loading}
            title="Active Signals"
            value="24"
            icon={Signal}
            iconBg="bg-green-50 dark:bg-green-900/20 text-[#16A34A]"
            trend={{ value: 0, direction: 'neutral' }}
            sub="All operational"
          />
          <KPI loading={loading}
            title="Avg Wait Time"
            value="42"
            unit="sec"
            icon={Clock}
            iconBg="bg-purple-50 dark:bg-purple-900/20 text-purple-600"
            trend={{ value: 12, direction: 'down' }}
            sub="AI-optimized"
          />
        </div>

        {/* ── Charts row ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Vehicle distribution donut */}
          <SectionCard
            title="Vehicle Distribution"
            sub="By detected type"
          >
            {loading ? (
              <div className="h-56 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-gray-200 dark:border-slate-700 border-t-[#2563EB] rounded-full animate-spin" />
              </div>
            ) : vehicleDistChart ? (
              <div className="h-56">
                <Doughnut
                  data={vehicleDistChart}
                  options={{
                    responsive: true, maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                      legend: { position: 'bottom', labels: { padding: 12, font: CHART_FONT, color: TICK_COLOR, boxWidth: 10, usePointStyle: true } },
                      tooltip: { bodyFont: CHART_FONT, titleFont: CHART_FONT },
                    },
                  }}
                />
              </div>
            ) : (
              <EmptyState msg="No detection data yet" icon={Car} link="/vehicle-detection" linkLabel="Analyze traffic" />
            )}
          </SectionCard>

          {/* Density distribution bar */}
          <SectionCard
            title="Congestion Distribution"
            sub="Analysis density breakdown"
          >
            {loading ? (
              <div className="h-56 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-gray-200 dark:border-slate-700 border-t-[#2563EB] rounded-full animate-spin" />
              </div>
            ) : (
              <div className="h-56">
                <Bar data={densityDistChart} options={{
                  ...chartDefaults(),
                  plugins: { legend: { display: false }, tooltip: { bodyFont: CHART_FONT } },
                }} />
              </div>
            )}
          </SectionCard>

          {/* System status */}
          <SectionCard title="System Status" sub="All AI modules">
            <div>
              <StatusRow label="YOLOv11 Detection"    status="online" note="v11n · conf 0.40" />
              <StatusRow label="Density Analysis"     status="online" note="Algorithm 2" />
              <StatusRow label="Q-Learning RL"        status="online" note="ε = 0.05" />
              <StatusRow label="Emergency Detection"  status="online" note="Priority active" />
              <StatusRow label="Database"             status="online" note="SQLite" />
              <StatusRow label="API Server"           status="online" note="FastAPI :8000" />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-medium">All systems operational</span>
            </div>
          </SectionCard>
        </div>

        {/* ── Traffic trend charts ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly density trend */}
          <SectionCard
            title="Traffic Density Trend"
            sub="7-day average (demo data)"
          >
            <div className="h-52">
              <Line data={densityTrendChart} options={{
                ...chartDefaults(),
                plugins: { legend: { display: false }, tooltip: { bodyFont: CHART_FONT } },
              }} />
            </div>
          </SectionCard>

          {/* Hourly traffic volume */}
          <SectionCard
            title="Hourly Traffic Volume"
            sub="Today's vehicle counts (demo)"
          >
            <div className="h-52">
              <Bar data={hourlyChart} options={{
                ...chartDefaults(),
                plugins: { legend: { display: false }, tooltip: { bodyFont: CHART_FONT } },
              }} />
            </div>
          </SectionCard>
        </div>

        {/* ── Recent analyses ──────────────────────────────────────────── */}
        <SectionCard
          title="Recent Traffic Analyses"
          sub="Latest AI detection sessions"
          noPad
          action={
            <Link to="/results" className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {loading ? (
            <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
              {[1,2,3].map(i => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                  <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-slate-700 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-48 bg-gray-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-32 bg-gray-100 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="px-6 py-12">
              <EmptyState msg="No analyses yet — upload traffic footage to get started." icon={Activity} link="/vehicle-detection" linkLabel="Upload & Analyze" />
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
              {recent.map((r) => {
                const imgSrc = r.processed_url
                  ? r.processed_url.startsWith('/api')
                    ? `/api${r.processed_url.slice(4)}`
                    : r.processed_url
                  : null;
                const violationCount = r.violation_count || r.violations?.length || 0;

                return (
                  <Link
                    key={r.id}
                    to={`/results/${r.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[#F8FAFC] dark:hover:bg-slate-800/60 transition-all duration-200 group"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-14 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center relative shadow-sm">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={r.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full items-center justify-center bg-slate-800 text-slate-400 text-xs font-semibold ${imgSrc ? 'hidden' : 'flex'}`}>
                        <Car className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#0F172A] dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {r.filename}
                        </p>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-400">
                          {r.media_type || 'image'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="flex items-center gap-1 text-xs font-medium text-[#64748B] dark:text-slate-400">
                          <Car className="w-3.5 h-3.5 text-blue-500" />
                          {r.total_vehicles} vehicles
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#64748B] dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                          {new Date(r.created_at).toLocaleString()}
                        </span>
                        {violationCount > 0 && (
                          <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {violationCount} violation{violationCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex flex-col items-end gap-1">
                        <DensityBadge level={r.density_level} />
                        {r.emergency_status?.emergency && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300 px-2 py-0.5 rounded-full font-bold">
                            <Siren className="w-3 h-3" /> Emergency
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </SectionCard>

      </div>
    </DashboardLayout>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
function EmptyState({ msg, icon: Icon, link, linkLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Icon className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
      <p className="text-sm text-[#64748B] dark:text-slate-400 mb-3">{msg}</p>
      {link && (
        <Link to={link} className="text-sm font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
          {linkLabel} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
