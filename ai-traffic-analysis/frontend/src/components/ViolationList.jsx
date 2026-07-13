import { AlertTriangle } from "lucide-react";

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
      <p className="text-green-400 text-sm flex items-center gap-2 py-4">
        <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
        No violations detected
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {violations.map((v, i) => (
        <li key={i} className="flex items-start gap-3 bg-red-950/40 border border-red-800 rounded-lg p-3">
          <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-300">
              {TYPE_LABELS[v.type] || v.type}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{v.description}</p>
            {v.confidence && (
              <p className="text-xs text-gray-500 mt-0.5">
                Confidence: {(v.confidence * 100).toFixed(0)}%
                {v.frame > 0 && ` · Frame ${v.frame}`}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
