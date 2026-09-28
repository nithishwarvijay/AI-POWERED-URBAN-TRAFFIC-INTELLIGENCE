import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = ["#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#06b6d4"];

export default function VehicleChart({ counts }) {
  if (!counts || Object.keys(counts).length === 0) {
    return <p className="text-gray-500 dark:text-slate-400 text-xs text-center py-6">No vehicle data</p>;
  }

  const labels = Object.keys(counts).map(k => k.charAt(0).toUpperCase() + k.slice(1));
  const data = Object.values(counts);

  return (
    <div className="h-44 max-w-[240px] mx-auto flex items-center justify-center relative">
      <Doughnut
        data={{
          labels,
          datasets: [{
            data,
            backgroundColor: PALETTE.slice(0, labels.length),
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.1)",
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "#64748B",
                padding: 10,
                font: { size: 10, family: "Inter, sans-serif" },
                boxWidth: 10,
                usePointStyle: true,
              },
            },
            tooltip: {
              bodyFont: { size: 11, family: "Inter, sans-serif" },
            }
          },
          cutout: "70%",
        }}
      />
    </div>
  );
}
