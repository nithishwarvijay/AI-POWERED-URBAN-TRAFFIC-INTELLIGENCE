import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

const LEVEL_CONFIG = {
  CRITICAL: {
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-800 dark:text-red-300",
    icon: AlertTriangle,
    iconColor: "text-red-600 dark:text-red-400",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300 border-red-300 dark:border-red-800",
  },
  WARNING: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-800 dark:text-amber-300",
    icon: AlertCircle,
    iconColor: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-300 dark:border-amber-800",
  },
  OK: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-800 dark:text-emerald-300",
    icon: CheckCircle,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
  },
};

export default function TrafficAlertCard({ trafficAlert, totalVehicles }) {
  if (!trafficAlert) return null;

  const level = trafficAlert.level || "OK";
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.OK;
  const Icon = cfg.icon;

  return (
    <div className={`flex items-center gap-4 ${cfg.bg} border ${cfg.border} rounded-2xl p-4 shadow-sm transition-all`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/60 dark:bg-slate-900/50`}>
        <Icon size={22} className={cfg.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm ${cfg.text}`}>{trafficAlert.alert}</p>
        <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
          {totalVehicles} total vehicles detected in active camera feed
        </p>
      </div>
      <span
        className={`text-xs font-bold px-3 py-1 rounded-full border ${cfg.badge}`}
      >
        {level}
      </span>
    </div>
  );
}

