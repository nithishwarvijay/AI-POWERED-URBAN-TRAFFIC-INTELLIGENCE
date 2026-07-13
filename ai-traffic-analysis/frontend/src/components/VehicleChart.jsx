import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = ["#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#06b6d4"];

export default function VehicleChart({ counts }) {
  if (!counts || Object.keys(counts).length === 0) {
    return <p className="text-gray-500 text-sm text-center py-8">No vehicle data</p>;
  }

  const labels = Object.keys(counts);
  const data = Object.values(counts);

  return (
    <Doughnut
      data={{
        labels,
        datasets: [{
          data,
          backgroundColor: PALETTE.slice(0, labels.length),
          borderWidth: 1,
          borderColor: "#1f2937",
        }],
      }}
      options={{
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#d1d5db", padding: 12, font: { size: 12 } },
          },
        },
        cutout: "65%",
      }}
    />
  );
}
