import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Car, AlertTriangle, Printer, Download,
  Activity, Clock, Siren, FileText, CheckCircle2,
  RefreshCw, Eye, ChevronRight, BarChart3, Zap, Camera,
  TrendingUp, Shield, MapPin
} from "lucide-react";
import { getResult } from "../services/api";
import DashboardLayout from "../components/layout/DashboardLayout";
import VehicleChart from "../components/VehicleChart";
import ViolationList from "../components/ViolationList";
import DensityBadge from "../components/DensityBadge";
import TrafficSignalPanel from "../components/TrafficSignalPanel";
import LaneDensityChart from "../components/LaneDensityChart";
import EmergencyAlertBanner from "../components/EmergencyAlertBanner";
import TrafficAlertCard from "../components/TrafficAlertCard";
import ApproachDensityPanel from "../components/ApproachDensityPanel";
import RlSignalPanel from "../components/RlSignalPanel";

const DENSITY_GRADIENT = {
  Low:      { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
  Medium:   { text: 'text-amber-600 dark:text-amber-400',    bg: 'bg-amber-50 dark:bg-amber-900/20',    border: 'border-amber-200 dark:border-amber-800' },
  High:     { text: 'text-orange-600 dark:text-orange-400',  bg: 'bg-orange-50 dark:bg-orange-900/20',  border: 'border-orange-200 dark:border-orange-800' },
  Critical: { text: 'text-red-600 dark:text-red-400',        bg: 'bg-red-50 dark:bg-red-900/20',        border: 'border-red-200 dark:border-red-800' },
};

export default function ResultDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getResult(id)
      .then((r) => { setData(r.data); setError(null); })
      .catch(() => setError("Could not load analysis report. Please try again."))
      .finally(() => setLoading(false));
  }, [id]);

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Vehicle Detection", href: "/vehicle-detection" },
    { label: data?.filename ? `Report: ${data.filename}` : "Analysis Report" },
  ];

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ["Metric", "Value"],
      ["Project Name", "Traffic Analyzer"],
      ["Filename", data.filename || "N/A"],
      ["Analyzed At", new Date(data.created_at).toLocaleString()],
      ["Media Type", data.media_type || "N/A"],
      ["Total Vehicles", data.total_vehicles || 0],
      ["Density Level", data.density_level || "Low"],
      ["Violations Count", data.violations?.length || 0],
      ["Emergency Status", data.emergency_status?.emergency ? "YES" : "NO"],
    ];
    if (data.vehicle_counts) {
      Object.entries(data.vehicle_counts).forEach(([k, v]) => {
        rows.push([`Vehicle Count (${k})`, v]);
      });
    }
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    const safeName = data.filename ? data.filename.replace(/[^a-zA-Z0-9]/g, "_") : "Report";
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Traffic_Analyzer_${safeName}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => { window.print(); };

  if (loading) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="flex flex-col items-center justify-center py-28 gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 dark:border-slate-700 border-t-[#2563EB] rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-transparent border-b-cyan-400/40 rounded-full animate-spin" style={{animationDirection:'reverse', animationDuration:'1.5s'}} />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-[#0F172A] dark:text-white">Loading Analysis Report</p>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Fetching AI detection results…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-red-800 dark:text-red-300">Report Not Found</h2>
          <p className="text-sm text-red-600 dark:text-red-400">{error || "The requested analysis report could not be found."}</p>
          <Link
            to="/vehicle-detection"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-2xl text-sm font-semibold transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Vehicle Detection
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const processedSrc = data.processed_url
    ? data.processed_url.startsWith("/api")
      ? `/api${data.processed_url.slice(4)}`
      : data.processed_url
    : null;

  const densityStyle = DENSITY_GRADIENT[data.density_level] || DENSITY_GRADIENT.Low;
  const totalVehicles = data.total_vehicles ?? 0;

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6 pb-12">

        {/* ── Premium Page Header ──────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-3xl p-6 md:p-8 shadow-xl">
          {/* Decorative glows */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage:'radial-gradient(circle at 1px 1px,#94a3b8 1px,transparent 0)', backgroundSize:'24px 24px' }} />

          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 min-w-0">
              {/* Back + breadcrumb */}
              <div className="flex items-center gap-2">
                <Link
                  to="/vehicle-detection"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Vehicle Detection
                </Link>
                <span className="text-slate-600">›</span>
                <span className="text-slate-400 text-xs truncate max-w-[200px]">Report</span>
              </div>

              {/* Title */}
              <div className="flex flex-wrap items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-black text-white truncate">
                    {data.filename || "Traffic Analysis Session"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(data.created_at).toLocaleString()}
                    </span>
                    <span className="capitalize font-semibold text-slate-300">
                      {data.media_type || "image"}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      YOLOv11 Processed
                    </span>
                    <DensityBadge level={data.density_level} />
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                Export CSV
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                Print / PDF
              </button>
              <Link
                to="/vehicle-detection"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] transition-all shadow-lg shadow-blue-500/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                New Analysis
              </Link>
            </div>
          </div>
        </div>

        {/* ── Alert Banners ────────────────────────────────────────────── */}
        <EmergencyAlertBanner emergencyStatus={data.emergency_status} />
        <TrafficAlertCard trafficAlert={data.traffic_alert} totalVehicles={data.total_vehicles} />

        {/* ── KPI Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Vehicles */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-[#E2E8F0] dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform" />
            <div className="relative z-10 flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Car className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">Detected</span>
            </div>
            <p className="text-3xl font-black text-[#0F172A] dark:text-white">{totalVehicles}</p>
            <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400 mt-0.5">Total Vehicles</p>
          </div>

          {/* Congestion */}
          <div className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${densityStyle.border}`}>
            <div className={`absolute top-0 right-0 w-24 h-24 ${densityStyle.bg} rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform`} />
            <div className="relative z-10 flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Activity className="w-5 h-5" />
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${densityStyle.bg} ${densityStyle.text} ${densityStyle.border}`}>Level</span>
            </div>
            <p className={`text-2xl font-black ${densityStyle.text}`}>{data.density_level || "Low"}</p>
            <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400 mt-0.5">Congestion Level</p>
          </div>

          {/* Violations */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-[#E2E8F0] dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform" />
            <div className="relative z-10 flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-500/25">
                <AlertTriangle className="w-5 h-5" />
              </div>
              {(data.violations?.length ?? 0) > 0 && (
                <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-full">
                  Flagged
                </span>
              )}
            </div>
            <p className="text-3xl font-black text-[#0F172A] dark:text-white">{data.violations?.length ?? 0}</p>
            <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400 mt-0.5">Rule Infractions</p>
          </div>

          {/* Emergency */}
          <div className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${
            data.emergency_status?.emergency ? 'border-red-300 dark:border-red-800' : 'border-[#E2E8F0] dark:border-slate-800'
          }`}>
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform ${
              data.emergency_status?.emergency ? 'bg-red-50 dark:bg-red-900/10' : 'bg-emerald-50 dark:bg-emerald-900/10'
            }`} />
            <div className="relative z-10 flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-2xl text-white flex items-center justify-center shadow-lg ${
                data.emergency_status?.emergency
                  ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/25'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/25'
              }`}>
                <Siren className="w-5 h-5" />
              </div>
            </div>
            <p className={`text-base font-black ${
              data.emergency_status?.emergency ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {data.emergency_status?.emergency ? "EMERGENCY" : "Normal Flow"}
            </p>
            <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400 mt-0.5">Priority Corridor</p>
          </div>
        </div>

        {/* ── Annotated Frame + Vehicle Breakdown ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Media Output — wider */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-[#E2E8F0] dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/40">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#2563EB]" /> AI Annotated Frame
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">YOLOv11 bounding boxes & detection tags</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                High Precision
              </span>
            </div>

            <div className="relative bg-black min-h-[300px] flex items-center justify-center">
              {processedSrc ? (
                data.media_type === "video" ? (
                  <video src={processedSrc} controls className="w-full max-h-[420px] object-contain" />
                ) : (
                  <img
                    src={processedSrc}
                    alt={data.filename || "Annotated traffic frame"}
                    className="w-full max-h-[420px] object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/800x450?text=Processed+Image+Preview";
                    }}
                  />
                )
              ) : (
                <div className="text-center p-10 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Processed output media unavailable</p>
                </div>
              )}
              {/* Overlay badge */}
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1 text-[10px] font-bold text-white">
                YOLOv11 Active
              </div>
            </div>
          </div>

          {/* Vehicle Detection Breakdown — narrower */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-[#E2E8F0] dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
            <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/40 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#06B6D4]" /> Vehicle Distribution
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Detected vehicle types</p>
              </div>
              <span className="text-xs font-black text-[#2563EB] bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-2.5 py-1 rounded-full">
                {totalVehicles} total
              </span>
            </div>

            <div className="flex-1 p-5 flex flex-col gap-4">
              {data.vehicle_counts && Object.keys(data.vehicle_counts).length > 0 ? (
                <>
                  {/* Compact chart */}
                  <VehicleChart counts={data.vehicle_counts} />

                  {/* Count bars */}
                  <div className="space-y-2.5">
                    {Object.entries(data.vehicle_counts).map(([type, count]) => {
                      const total = totalVehicles > 0 ? totalVehicles : 1;
                      const pct = Math.round((count / total) * 100);
                      const iconMap = { car: '🚗', bike: '🏍️', bus: '🚌', truck: '🚛' };
                      const colorMap = {
                        car:   'from-blue-500 to-blue-600',
                        bike:  'from-cyan-500 to-cyan-600',
                        bus:   'from-amber-500 to-amber-600',
                        truck: 'from-purple-500 to-purple-600',
                      };
                      return (
                        <div key={type} className="flex items-center gap-3">
                          <span className="text-base flex-shrink-0">{iconMap[type] || '🚙'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-semibold capitalize text-[#0F172A] dark:text-white">{type}s</span>
                              <span className="text-xs font-bold text-[#2563EB]">{count} <span className="text-[#94A3B8] font-normal">({pct}%)</span></span>
                            </div>
                            <div className="h-1.5 bg-[#E2E8F0] dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${colorMap[type] || 'from-blue-500 to-blue-600'} rounded-full transition-all duration-500`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div>
                    <Car className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-[#64748B] dark:text-slate-400">No vehicle counts recorded.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Algorithm 2: Multi-Approach Density ─────────────────────── */}
        <ApproachDensityPanel approachDensities={data.approach_densities} />

        {/* ── Algorithm 3: RL Signal Decision ──────────────────────────── */}
        <RlSignalPanel rlDecision={data.rl_signal_decision} />

        {/* ── Lane Density Chart & Signal Panel ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LaneDensityChart laneCounts={data.lane_counts} />
          <TrafficSignalPanel
            laneCounts={data.lane_counts}
            signalTiming={data.signal_timing}
            emergencyStatus={data.emergency_status}
          />
        </div>

        {/* ── Violation Log ────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E2E8F0] dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 text-white flex items-center justify-center shadow-sm shadow-red-500/25">
                <AlertTriangle size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Traffic Violations Log</h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Automated detection of red lights, wrong lane, overcrowding</p>
              </div>
            </div>
            {(data.violations?.length ?? 0) > 0 ? (
              <span className="bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300 text-xs font-bold px-3 py-1.5 rounded-full border border-red-300 dark:border-red-800">
                {data.violations.length} Infraction{data.violations.length > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Clean
              </span>
            )}
          </div>
          <div className="p-6">
            <ViolationList violations={data.violations} />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
