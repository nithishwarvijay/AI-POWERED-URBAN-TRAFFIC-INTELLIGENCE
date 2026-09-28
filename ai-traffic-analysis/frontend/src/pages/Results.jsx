import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getResults } from "../services/api";
import DensityBadge from "../components/DensityBadge";
import { AlertTriangle, Car, ChevronRight } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResults()
      .then((r) => setResults(r.data))
      .finally(() => setLoading(false));
  }, []);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Results' }
  ];

  if (loading) return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <p className="text-gray-400 animate-pulse">Loading history...</p>
    </DashboardLayout>
  );

  if (!results.length) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No analyses yet.</p>
          <Link to="/upload" className="text-blue-400 hover:underline text-sm mt-2 inline-block">
            Upload your first image or video →
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">
            Analysis Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View all processed traffic data
          </p>
        </div>
        
        <div className="space-y-3">
          {results.map((r) => (
            <Link
              key={r.id}
              to={`/results/${r.id}`}
              className="flex items-center gap-4 bg-white dark:bg-navy-900 hover:bg-gray-50 dark:hover:bg-navy-800 rounded-lg p-4 border border-gray-200 dark:border-navy-800 transition-colors"
            >
              <img
                src={r.processed_url}
                alt={r.filename}
                className="w-20 h-14 object-cover rounded-lg bg-black shrink-0"
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-navy-900 dark:text-white truncate">{r.filename}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {new Date(r.created_at).toLocaleString()}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <Car size={12} /> {r.total_vehicles} vehicles
                  </span>
                  {r.violation_count > 0 && (
                    <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                      <AlertTriangle size={12} /> {r.violation_count} violations
                    </span>
                  )}
                  <DensityBadge level={r.density_level} />
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
