import { useEffect, useState } from "react";
import { Signal, Siren, Clock } from "lucide-react";

const LANE_COLORS = ["#2563eb", "#8b5cf6", "#f59e0b", "#10b981"];

function SignalLight({ active, color }) {
  return (
    <div
      className="w-5 h-5 rounded-full border border-[#CBD5E1] dark:border-slate-700 transition-all duration-300"
      style={{
        backgroundColor: active ? color : "rgba(148, 163, 184, 0.2)",
        boxShadow: active ? `0 0 10px ${color}` : "none",
      }}
    />
  );
}

function LaneSignal({ lane, count, timing, emergencyLane, index }) {
  const isGreen   = timing?.signal === "GREEN";
  const priority  = timing?.priority || "NORMAL";
  const isEmergencyLane = priority === "EMERGENCY";
  const isBlocked       = priority === "BLOCKED";

  const [remaining, setRemaining] = useState(timing?.time ?? 0);

  useEffect(() => {
    setRemaining(timing?.time ?? 0);
    if (!isGreen || !timing?.time) return;
    const interval = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timing?.time, isGreen]);

  const laneColor = LANE_COLORS[index % LANE_COLORS.length];

  const borderClass = isEmergencyLane
    ? "border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
    : isBlocked
    ? "border border-red-300 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/10"
    : "border border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/60";

  return (
    <div className={`rounded-xl p-4 flex flex-col gap-3 transition-all ${borderClass}`}>
      {/* Lane header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          Lane {index + 1}
          {isEmergencyLane && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              🚨 PRIORITY
            </span>
          )}
          {isBlocked && (
            <span className="text-[10px] bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300 px-2 py-0.5 rounded-full font-semibold">
              STOP
            </span>
          )}
        </span>
        <span
          className="text-xs px-2.5 py-0.5 rounded-full font-bold"
          style={{ backgroundColor: laneColor + "20", color: laneColor }}
        >
          {count} vehicles
        </span>
      </div>

      {/* Traffic light + status */}
      <div className="flex items-center gap-3.5">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-2 flex flex-col gap-1.5 items-center border border-[#E2E8F0] dark:border-slate-700/80 shadow-sm">
          <SignalLight active={!isGreen} color="#ef4444" />
          <SignalLight active={false}   color="#f59e0b" />
          <SignalLight active={isGreen} color="#10b981" />
        </div>

        <div className="flex-1 min-w-0">
          {isGreen ? (
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{remaining}s</span>
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">green signal remaining</p>
            </div>
          ) : (
            <div>
              <span className="text-xl font-bold text-red-600 dark:text-red-400">RED LIGHT</span>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">
                {isBlocked ? "Blocked for emergency pass" : "Waiting for next phase"}
              </p>
            </div>
          )}

          {timing?.reason && (
            <p className="text-[#64748B] dark:text-slate-400 text-[11px] mt-1 truncate">{timing.reason}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrafficSignalPanel({ laneCounts, signalTiming, emergencyStatus }) {
  if (!laneCounts || !signalTiming) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-[#E2E8F0] dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Signal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Traffic Signal Control</h3>
        </div>
        <p className="text-[#64748B] dark:text-slate-400 text-sm text-center py-6">No signal data available for this analysis.</p>
      </div>
    );
  }

  const isEmergency  = emergencyStatus?.emergency === true;
  const emergencyLane = emergencyStatus?.lane;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-[#E2E8F0] dark:border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Signal size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Traffic Signal Control</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Adaptive multi-lane traffic light controller</p>
          </div>
        </div>

        {isEmergency ? (
          <span className="inline-flex items-center gap-1.5 text-xs bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800 px-3 py-1 rounded-full font-bold animate-pulse">
            <Siren className="w-3.5 h-3.5" /> Emergency Mode: {emergencyLane?.replace("lane", "Lane ")} GREEN
          </span>
        ) : (
          <span className="inline-flex items-center text-xs bg-[#F1F5F9] dark:bg-slate-800 text-[#64748B] dark:text-slate-300 px-3 py-1 rounded-full font-semibold">
            Adaptive AI Mode Active
          </span>
        )}
      </div>

      {/* Lane grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(laneCounts).map(([lane, count], i) => (
          <LaneSignal
            key={lane}
            lane={lane}
            count={count}
            timing={signalTiming[lane]}
            emergencyLane={emergencyLane}
            index={i}
          />
        ))}
      </div>

      {/* Legend */}
      {isEmergency && (
        <div className="bg-red-50 dark:bg-red-950/20 rounded-xl px-4 py-2.5 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300">
          <strong className="font-bold">Emergency Override:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">GREEN</span> signal granted to priority vehicle corridor. All intersecting approaches held RED.
        </div>
      )}
    </div>
  );
}

