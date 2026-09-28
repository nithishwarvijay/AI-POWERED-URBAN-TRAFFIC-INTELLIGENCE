import { Siren, ShieldAlert } from "lucide-react";

export default function EmergencyAlertBanner({ emergencyStatus }) {
  if (!emergencyStatus?.emergency) return null;

  const lane = emergencyStatus.lane;
  const vehicleType = emergencyStatus.vehicle_type || "Emergency Vehicle";

  return (
    <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-500 rounded-2xl p-5 space-y-3 shadow-md animate-slide-up">
      {/* Title row */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
          <Siren size={22} className="text-red-600 dark:text-red-400 animate-pulse" />
        </div>
        <div>
          <p className="text-red-800 dark:text-red-300 font-bold text-base uppercase tracking-wide flex items-center gap-2">
            🚨 Emergency Vehicle Detected
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Priority signal override triggered automatically</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div className="bg-white/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-xl px-3.5 py-2.5">
          <p className="text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Vehicle Type</p>
          <p className="text-[#0F172A] dark:text-white font-bold capitalize">{vehicleType}</p>
        </div>
        <div className="bg-white/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-xl px-3.5 py-2.5">
          <p className="text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Corridor Corridor</p>
          <p className="text-[#0F172A] dark:text-white font-bold capitalize">{lane ? lane.replace("lane", "Lane ") : "Unknown Lane"}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 rounded-xl px-3.5 py-2.5">
          <p className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Automated Action</p>
          <p className="text-emerald-800 dark:text-emerald-300 font-semibold text-xs">{emergencyStatus.action}</p>
        </div>
      </div>

      {/* Confidence */}
      {emergencyStatus.confidence > 0 && (
        <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 text-xs font-semibold pt-1">
          <ShieldAlert size={14} />
          Detection confidence: {(emergencyStatus.confidence * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
}

