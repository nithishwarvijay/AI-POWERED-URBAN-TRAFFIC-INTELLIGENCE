import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Car, AlertTriangle, Activity, Upload, Siren, TrendingUp } from "lucide-react";
import { getStats, getResults } from "../services/api";
import StatCard from "../components/StatCard";
import DensityBadge from "../components/DensityBadge";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    getStats().then((r) => setStats(r.data)).catch(() => {});
    getResults(0, 5).then((r) => setRecent(r.data)).catch(() => {});
  }, []);

  const barData = stats?.vehicle_type_totals
    ? {
        labels: Object.keys(stats.vehicle_type_totals).map((k) => k.charAt(0).toUpperCase() + k.slice(1)),
        datasets: [
          {
            label: "Total Detected",
            data: Object.values(stats.vehicle_type_totals),
            backgroundColor: ["#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#10b981"],
            borderRadius: 6,
          },
        ],
      }
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <Link
          to="/upload"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Upload size={15} />
          New Analysis
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Analyses" value={stats?.total_analyses} icon={Activity} color="blue" />
        <StatCard label="Vehicles Detected" value={stats?.total_vehicles_detected} icon={Car} color="green" />
        <StatCard label="Violations Found" value={stats?.total_violations} icon={AlertTriangle} color="red" />
        <StatCard label="High Density Events" value={stats?.density_distribution?.High} icon={Activity} color="yellow" />
      </div>

      {/* New adaptive traffic stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Emergency Events" value={stats?.emergency_events ?? 0} icon={Siren} color="red" />
        <StatCard label="High Traffic Alerts" value={stats?.high_traffic_events ?? 0} icon={TrendingUp} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-gray-900 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-300 mb-4">Vehicle Type Distribution</p>
          {barData ? (
            <Bar
              data={barData}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: "#9ca3af" }, grid: { color: "#1f2937" } },
                  y: { ticks: { color: "#9ca3af" }, grid: { color: "#1f2937" } },
                },
              }}
            />
          ) : (
            <p className="text-gray-500 text-sm text-center py-10">No data yet</p>
          )}
        </div>

        {/* Recent analyses */}
        <div className="bg-gray-900 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-300 mb-4">Recent Analyses</p>
          {recent.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-10">No analyses yet</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/results/${r.id}`}
                    className="flex items-center gap-3 hover:bg-gray-800 rounded-lg p-2 transition-colors"
                  >
                    <img
                      src={r.processed_url}
                      alt={r.filename}
                      className="w-12 h-9 object-cover rounded bg-black shrink-0"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{r.filename}</p>
                      <p className="text-xs text-gray-500">{r.total_vehicles} vehicles</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {r.emergency_status?.emergency && (
                        <span className="text-orange-400 text-xs">🚨</span>
                      )}
                      {r.traffic_alert?.level === "CRITICAL" && (
                        <span className="text-red-400 text-xs">⚠️</span>
                      )}
                      <DensityBadge level={r.density_level} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link to="/results" className="text-xs text-blue-400 hover:underline mt-3 inline-block">
            View all →
          </Link>
        </div>
      </div>
    </div>
  );
}
