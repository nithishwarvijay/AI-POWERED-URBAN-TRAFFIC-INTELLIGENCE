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

const LANE_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"];

export default function LaneDensityChart({ laneCounts }) {
  if (!laneCounts) {
    return (
      <div className="bg-gray-900 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-300 mb-3">Lane Density</p>
        <p className="text-gray-500 text-sm text-center py-6">No lane data available</p>
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
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw} vehicles`,
        },
      },
    },
    scales: {
      x: { ticks: { color: "#9ca3af" }, grid: { color: "#1f2937" } },
      y: {
        ticks: { color: "#9ca3af", stepSize: 1 },
        grid: { color: "#1f2937" },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <p className="text-sm font-semibold text-gray-300 mb-4">Lane Vehicle Density</p>
      <Bar data={data} options={options} />
    </div>
  );
}
