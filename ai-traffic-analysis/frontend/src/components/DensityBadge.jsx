const styles = {
  Low: "bg-green-800 text-green-200",
  Medium: "bg-yellow-800 text-yellow-200",
  High: "bg-red-800 text-red-200",
};

export default function DensityBadge({ level }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${styles[level] || "bg-gray-700 text-gray-300"}`}>
      {level || "Unknown"}
    </span>
  );
}
