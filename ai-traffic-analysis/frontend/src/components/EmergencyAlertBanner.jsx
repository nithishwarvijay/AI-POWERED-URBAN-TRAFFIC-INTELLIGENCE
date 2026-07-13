import { Siren } from "lucide-react";

export default function EmergencyAlertBanner({ emergencyStatus }) {
  if (!emergencyStatus?.emergency) return null;

  const lane = emergencyStatus.lane;
  const vehicleType = emergencyStatus.vehicle_type || "Emergency Vehicle";

  return (
    <div className="bg-red-950 border-2 border-red-500 rounded-xl px-4 py-4 space-y-2">
      {/* Title row */}
      <div className="flex items-center gap-3">
        <Siren size={22} className="text-red-400 shrink-0 animate-pulse" />
        <p className="text-red-300 font-bold text-base uppercase tracking-wide">
          🚨 Emergency Vehicle Detected
        </p>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
        <div className="bg-red-900/50 rounded-lg px-3 py-2">
          <p className="text-red-400 text-xs uppercase tracking-wide mb-0.5">Vehicle Type</p>
          <p className="text-white font-semibold capitalize">{vehicleType}</p>
        </div>
        <div className="bg-red-900/50 rounded-lg px-3 py-2">
          <p className="text-red-400 text-xs uppercase tracking-wide mb-0.5">Detected In</p>
          <p className="text-white font-semibold capitalize">{lane ? lane.replace("lane", "Lane ") : "Unknown Lane"}</p>
        </div>
        <div className="bg-green-900/60 border border-green-600 rounded-lg px-3 py-2">
          <p className="text-green-400 text-xs uppercase tracking-wide mb-0.5">Signal Action</p>
          <p className="text-green-300 font-semibold text-xs">{emergencyStatus.action}</p>
        </div>
      </div>

      {/* Confidence */}
      {emergencyStatus.confidence > 0 && (
        <p className="text-red-500 text-xs">
          Detection confidence: {(emergencyStatus.confidence * 100).toFixed(0)}%
        </p>
      )}
    </div>
  );
}
