import { Activity, AlertOctagon, Layers } from "lucide-react";

const APPROACH_NAMES = {
  N: "North Approach",
  E: "East Approach",
  S: "South Approach",
  W: "West Approach",
};

const LEVEL_STYLES = {
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  High: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
  Critical: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800 shadow-sm",
};

export default function ApproachDensityPanel({ approachDensities }) {
  if (!approachDensities) return null;

  const summary = approachDensities._summary || {};
  const approaches = ["N", "E", "S", "W"];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-[#E2E8F0] dark:border-slate-800 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <Activity size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">
              Algorithm 2: Multi-Approach Density Analysis
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              Real-time congestion score & occupancy breakdown across N / E / S / W
            </p>
          </div>
        </div>
        {summary.most_congested && (
          <span className="inline-flex items-center gap-1.5 text-xs bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 px-3 py-1 rounded-full font-medium self-start sm:self-auto">
            <Layers className="w-3.5 h-3.5 text-cyan-500" />
            Peak: <strong className="text-[#0F172A] dark:text-white font-bold">{APPROACH_NAMES[summary.most_congested] || summary.most_congested}</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {approaches.map((appKey) => {
          const info = approachDensities[appKey] || {
            count: 0,
            occupancy_ratio: 0,
            queue_length: 0,
            density_score: 0,
            congestion_level: "Low",
            flagged: false,
          };

          const levelStyle = LEVEL_STYLES[info.congestion_level] || LEVEL_STYLES.Low;

          return (
            <div
              key={appKey}
              className={`bg-[#F8FAFC] dark:bg-slate-800/60 rounded-xl p-4 border transition-all ${
                info.flagged
                  ? "border-red-400 dark:border-red-600/80 ring-2 ring-red-400/20"
                  : "border-[#E2E8F0] dark:border-slate-700/80"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                  {APPROACH_NAMES[appKey]} ({appKey})
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${levelStyle}`}>
                  {info.congestion_level}
                </span>
              </div>

              <div className="flex items-baseline justify-between my-2">
                <span className="text-2xl font-black text-[#0F172A] dark:text-white">{info.density_score}</span>
                <span className="text-xs text-[#64748B] dark:text-slate-400">Score / 100</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#E2E8F0] dark:bg-slate-700 h-2 rounded-full overflow-hidden my-2.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    info.density_score > 70
                      ? "bg-red-500"
                      : info.density_score > 40
                      ? "bg-amber-500"
                      : "bg-cyan-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, info.density_score))}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-1 text-[11px] text-[#64748B] dark:text-slate-400 pt-2.5 border-t border-[#E2E8F0] dark:border-slate-700/60">
                <div>
                  <span className="block text-[10px] text-[#94A3B8]">Vehicles</span>
                  <span className="font-semibold text-[#0F172A] dark:text-white">{info.count}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#94A3B8]">Queue</span>
                  <span className="font-semibold text-[#0F172A] dark:text-white">{info.queue_length}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#94A3B8]">Occupancy</span>
                  <span className="font-semibold text-[#0F172A] dark:text-white">
                    {Math.round((info.occupancy_ratio || 0) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {summary.flagged_approaches && summary.flagged_approaches.length > 0 && (
        <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-3 text-xs text-red-700 dark:text-red-300">
          <AlertOctagon size={16} className="text-red-500 shrink-0" />
          <span>
            Critical congestion flagged on:{" "}
            <strong>{summary.flagged_approaches.map((a) => APPROACH_NAMES[a] || a).join(", ")}</strong>
          </span>
        </div>
      )}
    </div>
  );
}

