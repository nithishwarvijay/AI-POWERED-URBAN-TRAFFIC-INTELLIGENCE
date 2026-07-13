import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

const LEVEL_CONFIG = {
  CRITICAL: {
    bg: "bg-red-950",
    border: "border-red-700",
    text: "text-red-300",
    icon: AlertTriangle,
    iconColor: "text-red-400",
  },
  WARNING: {
    bg: "bg-yellow-950",
    border: "border-yellow-700",
    text: "text-yellow-300",
    icon: AlertCircle,
    iconColor: "text-yellow-400",
  },
  OK: {
    bg: "bg-green-950",
    border: "border-green-800",
    text: "text-green-300",
    icon: CheckCircle,
    iconColor: "text-green-400",
  },
};

export default function TrafficAlertCard({ trafficAlert, totalVehicles }) {
  if (!trafficAlert) return null;

  const level = trafficAlert.level || "OK";
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.OK;
  const Icon = cfg.icon;

  return (
    <div className={`flex items-center gap-3 ${cfg.bg} border ${cfg.border} rounded-xl px-4 py-3`}>
      <Icon size={20} className={`${cfg.iconColor} shrink-0`} />
      <div className="flex-1">
        <p className={`font-bold text-sm ${cfg.text}`}>{trafficAlert.alert}</p>
        <p className="text-gray-400 text-xs mt-0.5">
          {totalVehicles} total vehicles detected
        </p>
      </div>
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.border} ${cfg.text}`}
      >
        {level}
      </span>
    </div>
  );
}
