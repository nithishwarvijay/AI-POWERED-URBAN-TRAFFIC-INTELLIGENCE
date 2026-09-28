import { AlertTriangle, CheckCircle2 } from "lucide-react";

const TYPE_LABELS = {
  overcrowding_two_wheeler: "Overcrowding on Two-Wheeler",
  high_congestion: "High Traffic Congestion",
  red_light_violation: "Red Light Violation",
  wrong_lane: "Wrong Lane Driving",
  no_helmet: "No Helmet Detected",
};

export default function ViolationList({ violations = [] }) {
  if (!violations.length) {
    return (
      <div className="flex items-center gap-2.5 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-medium">
        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
        <span>No traffic violations detected in this analysis.</span>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {violations.map((v, i) => (
        <li key={i} className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-3.5 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-red-800 dark:text-red-300">
                {TYPE_LABELS[v.type] || v.type}
              </p>
              {v.confidence && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 rounded-full border border-red-200 dark:border-red-800">
                  {(v.confidence * 100).toFixed(0)}% conf
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">{v.description}</p>
            {v.frame > 0 && (
              <p className="text-[10px] text-[#94A3B8] mt-1">
                Frame {v.frame}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

