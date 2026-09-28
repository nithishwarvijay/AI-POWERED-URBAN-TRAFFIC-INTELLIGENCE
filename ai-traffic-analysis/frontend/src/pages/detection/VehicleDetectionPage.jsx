import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Link } from 'react-router-dom';
import {
  Upload, Car, Eye, AlertTriangle, CheckCircle2,
  X, FileImage, Video, RefreshCw, ChevronRight,
  Siren, BarChart3, Zap,
} from 'lucide-react';
import { analyzeTraffic } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

const VEHICLE_COLORS = {
  car:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-[#2563EB]',   border: 'border-blue-200 dark:border-blue-800' },
  bike:  { bg: 'bg-cyan-50 dark:bg-cyan-900/20',   text: 'text-[#06B6D4]',   border: 'border-cyan-200 dark:border-cyan-800' },
  bus:   { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-[#F59E0B]',   border: 'border-amber-200 dark:border-amber-800' },
  truck: { bg: 'bg-purple-50 dark:bg-purple-900/20',text:'text-purple-600',  border: 'border-purple-200 dark:border-purple-800' },
};

const DENSITY_STYLE = {
  Low:      { bar: 'bg-green-500',  badge: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
  Medium:   { bar: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' },
  High:     { bar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' },
  Critical: { bar: 'bg-red-500',    badge: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
};

/* ── vehicle count card ───────────────────────────────────────────────── */
function VehicleCard({ type, count, total }) {
  const c = VEHICLE_COLORS[type] || VEHICLE_COLORS.car;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const icon = { car: '🚗', bike: '🏍️', bus: '🚌', truck: '🚛' }[type] || '🚙';
  return (
    <div className={`rounded-xl border p-4 ${c.bg} ${c.border}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
        <span className={`text-lg font-bold ${c.text}`}>{count}</span>
      </div>
      <p className={`text-xs font-semibold capitalize ${c.text} mb-2`}>{type}s</p>
      <div className="w-full bg-white/60 dark:bg-white/10 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${DENSITY_STYLE.Low.bar} opacity-70`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">{pct}% of total</p>
    </div>
  );
}

/* ── approach density bar ─────────────────────────────────────────────── */
function ApproachBar({ label, data }) {
  if (!data) return null;
  const pct   = data.density_score ?? 0;
  const level = data.congestion_level ?? 'Low';
  const style = DENSITY_STYLE[level] || DENSITY_STYLE.Low;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-[#0F172A] dark:text-white">
          {label} ({data.count} vehicles)
        </span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>{level}</span>
      </div>
      <div className="w-full bg-[#E2E8F0] dark:bg-slate-700 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${style.bar}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Density score: {pct.toFixed(1)}</p>
    </div>
  );
}

export default function VehicleDetectionPage() {
  const [file,       setFile]       = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [error,      setError]      = useState('');

  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setResult(null); setError('');
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setPreview({ type: 'image', src: e.target.result });
      reader.readAsDataURL(f);
    } else {
      setPreview({ type: 'video', src: URL.createObjectURL(f) });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg','.jpeg','.png'], 'video/*': ['.mp4'] }, maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true); setProgress(0); setError('');
    try {
      const { data } = await analyzeTraffic(file, setProgress);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(''); setProgress(0); };

  const totalVehicles = result ? Object.values(result.vehicle_counts || {}).reduce((a,b) => a+b, 0) : 0;
  const approachDensities = result?.approach_densities;
  const rlDecision = result?.rl_signal_decision;
  const emergency  = result?.emergency_status;
  const alert      = result?.traffic_alert;

  const breadcrumbs = [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Vehicle Detection' }];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">AI Vehicle Detection</h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">Upload traffic images or video for YOLOv11-powered detection and analysis</p>
        </div>

        {/* Emergency alert banner */}
        {emergency?.emergency && (
          <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-2xl animate-slide-up">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
              <Siren className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-800 dark:text-red-300">Emergency Vehicle Detected</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">{emergency.message}</p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-1">{emergency.action}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Upload panel ─────────────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800">
            <div className="px-6 pt-5 pb-4 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Upload Traffic Data</h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">JPG, PNG, or MP4 — max 100 MB</p>
              </div>
              {file && (
                <button onClick={reset} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-[#64748B] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="p-6 space-y-4">
              {/* Dropzone */}
              {!file ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-900/10'
                      : 'border-[#E2E8F0] dark:border-slate-700 hover:border-[#2563EB] hover:bg-blue-50/50 dark:hover:bg-blue-900/5'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-7 h-7 text-[#2563EB]" />
                  </div>
                  <p className="text-sm font-semibold text-[#0F172A] dark:text-white mb-1">
                    {isDragActive ? 'Drop to upload' : 'Drop file here or click to browse'}
                  </p>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">Supports JPG, PNG, MP4</p>
                </div>
              ) : (
                /* Preview */
                <div className="rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-slate-700 bg-black">
                  {preview?.type === 'image'
                    ? <img src={preview.src} alt="preview" className="w-full max-h-64 object-contain" />
                    : <video src={preview?.src} controls className="w-full max-h-64" />
                  }
                </div>
              )}

              {/* File info */}
              {file && (
                <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] dark:bg-slate-800 rounded-xl border border-[#E2E8F0] dark:border-slate-700">
                  {file.type.startsWith('image/') ? <FileImage className="w-5 h-5 text-[#2563EB] flex-shrink-0" /> : <Video className="w-5 h-5 text-[#06B6D4] flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F172A] dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-[#64748B] dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              )}

              {/* Progress */}
              {loading && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">Analyzing with YOLOv11…</span>
                    <span className="text-xs font-semibold text-[#2563EB]">{progress}%</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] dark:bg-slate-700 rounded-full h-2">
                    <div className="h-2 bg-[#2563EB] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={!file || loading}
                  className="flex-1 bg-[#2563EB] hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing…</>
                  ) : (
                    <><Eye className="w-4 h-4" />Run AI Detection</>
                  )}
                </button>
                {result && (
                  <button onClick={reset} className="px-4 py-2.5 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-sm font-medium text-[#64748B] dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />New
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Output panel ─────────────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 flex flex-col justify-between">
            <div className="px-6 pt-5 pb-4 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#2563EB]" /> AI Detection Output
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">YOLOv11 bounding boxes & vehicle classification</p>
              </div>
              {result && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Analyzed
                </span>
              )}
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              {!result ? (
                <div className="rounded-xl border-2 border-dashed border-[#E2E8F0] dark:border-slate-700 h-64 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6 text-[#94a3b8]" />
                  </div>
                  <p className="text-sm text-[#64748B] dark:text-slate-400">Output will appear here after analysis</p>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-slate-700 bg-black relative group">
                  <img
                    src={`/api${result.processed_url.startsWith('/api') ? result.processed_url.slice(4) : result.processed_url}`}
                    alt="Detection output"
                    className="w-full max-h-64 object-contain"
                    onError={e => { e.target.alt = 'Could not load processed image'; }}
                  />
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white border border-white/10">
                    YOLOv11 Active
                  </div>
                </div>
              )}

              {/* Quick stats row */}
              {result && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#F8FAFC] dark:bg-slate-800/80 rounded-xl p-3 text-center border border-[#E2E8F0] dark:border-slate-700/80">
                    <p className="text-2xl font-black text-[#2563EB]">{result.total_vehicles}</p>
                    <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400">Vehicles</p>
                  </div>
                  <div className="bg-[#F8FAFC] dark:bg-slate-800/80 rounded-xl p-3 text-center border border-[#E2E8F0] dark:border-slate-700/80">
                    <p className={`text-2xl font-black ${DENSITY_STYLE[result.density_level]?.badge.split(' ').filter(c => c.startsWith('text-'))[0] || 'text-[#0F172A]'}`}>{result.density_level}</p>
                    <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400">Density</p>
                  </div>
                  <div className="bg-[#F8FAFC] dark:bg-slate-800/80 rounded-xl p-3 text-center border border-[#E2E8F0] dark:border-slate-700/80">
                    <p className="text-2xl font-black text-red-600 dark:text-red-400">{result.violations?.length ?? 0}</p>
                    <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400">Violations</p>
                  </div>
                </div>
              )}

              {/* Alert */}
              {alert && (
                <div className={`p-3.5 rounded-xl border text-sm font-medium ${
                  alert.level === 'EMERGENCY' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400' :
                  alert.level === 'CRITICAL'  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-400' :
                  alert.level === 'WARNING'   ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400' :
                                                'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400'
                }`}>
                  {alert.alert}
                </div>
              )}

              {/* View full result call-to-action button */}
              {result?.id && (
                <div className="pt-2">
                  <Link
                    to={`/results/${result.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
                    View Full Analysis Report <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Vehicle breakdown ─────────────────────────────────────── */}
        {result && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Vehicle Type Breakdown</h3>
              </div>
              <span className="text-xs font-bold text-[#64748B] dark:text-slate-400">
                Total: <strong className="text-[#0F172A] dark:text-white">{totalVehicles}</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(result.vehicle_counts || {}).map(([type, count]) => (
                <VehicleCard key={type} type={type} count={count} total={totalVehicles} />
              ))}
            </div>
            {Object.keys(result.vehicle_counts || {}).length === 0 && (
              <p className="text-sm text-[#64748B] dark:text-slate-400 text-center py-6">No vehicles detected in this image.</p>
            )}
          </div>
        )}

        {/* ── Approach densities ────────────────────────────────────── */}
        {approachDensities && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-5 pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#06B6D4]" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Per-Approach Density (N / E / S / W)</h3>
              </div>
              {approachDensities._summary?.most_congested && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  Most Congested: <strong>{approachDensities._summary.most_congested}</strong>
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {['N','E','S','W'].map(dir => (
                <ApproachBar key={dir}
                  label={`${dir === 'N' ? 'North' : dir === 'E' ? 'East' : dir === 'S' ? 'South' : 'West'} (${dir})`}
                  data={approachDensities[dir]}
                />
              ))}
            </div>
            {approachDensities._summary && (
              <div className="mt-4 pt-4 border-t border-[#E2E8F0] dark:border-slate-800 flex flex-wrap gap-4 text-xs text-[#64748B] dark:text-slate-400">
                <span>Flagged Approaches: <strong className="text-[#0F172A] dark:text-white">{approachDensities._summary.flagged_approaches?.join(', ') || 'None'}</strong></span>
                <span>Threshold: <strong className="text-[#0F172A] dark:text-white">{approachDensities._summary.threshold_used}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* ── RL signal decision ────────────────────────────────────── */}
        {rlDecision && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-5 pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">RL Signal Decision (Algorithm 3)</h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Active Phase: <strong>{rlDecision.phase?.replace('_', ' ')}</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/60 p-4 text-center">
                <p className="text-xs text-[#64748B] dark:text-slate-400 mb-1">Phase</p>
                <p className="text-sm font-bold text-[#0F172A] dark:text-white">{rlDecision.phase?.replace('_', ' ')}</p>
              </div>
              <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/60 p-4 text-center">
                <p className="text-xs text-[#64748B] dark:text-slate-400 mb-1">Green Time</p>
                <p className="text-base font-extrabold text-green-600 dark:text-green-400">{rlDecision.green_time_s}s Hold</p>
              </div>
              <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/60 p-4 text-center">
                <p className="text-xs text-[#64748B] dark:text-slate-400 mb-1">Green Approaches</p>
                <p className="text-sm font-bold text-[#0F172A] dark:text-white">{rlDecision.green_approaches?.join(', ')}</p>
              </div>
              <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800/60 p-4 text-center">
                <p className="text-xs text-[#64748B] dark:text-slate-400 mb-1">Exploration (ε)</p>
                <p className="text-sm font-bold text-[#0F172A] dark:text-white">{rlDecision.epsilon?.toFixed(3)}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-[#334155] dark:text-slate-300 bg-blue-50/60 dark:bg-slate-800/40 border border-blue-100 dark:border-slate-700 p-3.5 rounded-xl">
              <strong className="text-[#0F172A] dark:text-white font-semibold">AI Decision Rationale:</strong> {rlDecision.reason}
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
