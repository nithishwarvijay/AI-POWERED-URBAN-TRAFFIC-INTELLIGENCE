import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const LANE_COLORS = ["#2563eb", "#8b5cf6", "#f59e0b", "#10b981"];

export default function LaneDensityChart({ laneCounts }) {
  if (!laneCounts) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-[#E2E8F0] dark:border-slate-800">
        <p className="text-sm font-bold text-[#0F172A] dark:text-white mb-3">Lane Vehicle Density</p>
        <p className="text-[#64748B] dark:text-slate-400 text-sm text-center py-6">No lane density data available</p>
      </div>
    );
  }

  const labels = Object.keys(laneCounts).map((k) =>
    k.replace("lane", "Lane ")
  );
  const values = Object.values(laneCounts);

  const data = {
    labels,
    datasets: [
      {
        label: "Vehicles",
        data: values,
        backgroundColor: LANE_COLORS,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw} vehicles`,
        },
      },
    },
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
      y: {
        ticks: { color: "#94a3b8", stepSize: 1 },
        grid: { color: "rgba(148, 163, 184, 0.1)" },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-[#E2E8F0] dark:border-slate-800 space-y-4">
      <div>
        <p className="text-sm font-bold text-[#0F172A] dark:text-white">Lane Vehicle Density</p>
        <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Individual vehicle counts detected per road lane</p>
      </div>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

