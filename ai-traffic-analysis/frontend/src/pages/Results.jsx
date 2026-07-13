import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getResults } from "../services/api";
import DensityBadge from "../components/DensityBadge";
import { AlertTriangle, Car, ChevronRight } from "lucide-react";

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResults()
      .then((r) => setResults(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400 animate-pulse">Loading history...</p>;

  if (!results.length) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">No analyses yet.</p>
        <Link to="/upload" className="text-blue-400 hover:underline text-sm mt-2 inline-block">
          Upload your first image or video →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Analysis History</h1>
      <div className="space-y-3">
        {results.map((r) => (
          <Link
            key={r.id}
            to={`/results/${r.id}`}
            className="flex items-center gap-4 bg-gray-900 hover:bg-gray-800 rounded-xl p-4 transition-colors"
          >
            <img
              src={r.processed_url}
              alt={r.filename}
              className="w-20 h-14 object-cover rounded-lg bg-black shrink-0"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{r.filename}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(r.created_at).toLocaleString()}
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Car size={12} /> {r.total_vehicles} vehicles
                </span>
                {r.violation_count > 0 && (
                  <span className="flex items-center gap-1 text-xs text-red-400">
                    <AlertTriangle size={12} /> {r.violation_count} violations
                  </span>
                )}
                <DensityBadge level={r.density_level} />
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-600 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
