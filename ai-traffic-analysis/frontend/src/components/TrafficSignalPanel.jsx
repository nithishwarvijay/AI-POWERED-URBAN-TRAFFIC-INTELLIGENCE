import { useEffect, useState } from "react";

const LANE_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"];

function SignalLight({ active, color }) {
  return (
    <div
      className="w-6 h-6 rounded-full border border-gray-600 transition-all duration-300"
      style={{ backgroundColor: active ? color : "#1f2937",
               boxShadow: active ? `0 0 8px ${color}` : "none" }}
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

  // Border highlight for emergency lane
  const borderClass = isEmergencyLane
    ? "border-2 border-green-500"
    : isBlocked
    ? "border-2 border-red-800"
    : "border border-gray-700";

  return (
    <div className={`bg-gray-800 rounded-xl p-4 flex flex-col gap-3 ${borderClass}`}>
      {/* Lane header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-300">
          Lane {index + 1}
          {isEmergencyLane && (
            <span className="ml-2 text-xs bg-green-800 text-green-300 px-1.5 py-0.5 rounded-full">
              🚨 EMERGENCY
            </span>
          )}
          {isBlocked && (
            <span className="ml-2 text-xs bg-red-900 text-red-400 px-1.5 py-0.5 rounded-full">
              BLOCKED
            </span>
          )}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: laneColor + "33", color: laneColor }}
        >
          {count} vehicles
        </span>
      </div>

      {/* Traffic light + status */}
      <div className="flex items-center gap-3">
        <div className="bg-gray-900 rounded-lg p-2 flex flex-col gap-1.5 items-center">
          <SignalLight active={!isGreen} color="#ef4444" />
          <SignalLight active={false}   color="#f59e0b" />
          <SignalLight active={isGreen} color="#22c55e" />
        </div>

        <div className="flex-1">
          {isGreen ? (
            <>
              <p className="text-green-400 font-bold text-lg">{remaining}s</p>
              <p className="text-xs text-gray-500">green time remaining</p>
            </>
          ) : (
            <>
              <p className="text-red-400 font-bold text-lg">RED</p>
              <p className="text-xs text-gray-500">
                {isBlocked ? "Blocked for emergency" : "waiting"}
              </p>
            </>
          )}

          {/* Reason */}
          {timing?.reason && (
            <p className="text-gray-500 text-xs mt-1 truncate">{timing.reason}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrafficSignalPanel({ laneCounts, signalTiming, emergencyStatus }) {
  if (!laneCounts || !signalTiming) {
    return (
      <div className="bg-gray-900 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-300 mb-3">Traffic Signal Control</p>
        <p className="text-gray-500 text-sm text-center py-6">No signal data available</p>
      </div>
    );
  }

  const isEmergency  = emergencyStatus?.emergency === true;
  const emergencyLane = emergencyStatus?.lane;

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-300">Traffic Signal Control</p>
        {isEmergency ? (
          <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full animate-pulse font-semibold">
            🚨 Emergency Mode — Only {emergencyLane?.replace("lane", "Lane ")} is GREEN
          </span>
        ) : (
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
            Adaptive Mode
          </span>
        )}
      </div>

      {/* Lane grid */}
      <div className="grid grid-cols-2 gap-3">
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
        <div className="mt-3 bg-gray-800 rounded-lg px-3 py-2 text-xs text-gray-400">
          <span className="text-green-400 font-semibold">GREEN</span> = Emergency vehicle lane &nbsp;|&nbsp;
          <span className="text-red-400 font-semibold">RED</span> = All other lanes blocked until emergency clears
        </div>
      )}
    </div>
  );
}
