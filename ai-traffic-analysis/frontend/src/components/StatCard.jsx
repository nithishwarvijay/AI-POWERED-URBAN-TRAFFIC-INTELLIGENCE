export default function StatCard({ label, value, icon: Icon, color = "blue" }) {
  const colors = {
    blue: "bg-blue-900/40 border-blue-700 text-blue-400",
    red: "bg-red-900/40 border-red-700 text-red-400",
    green: "bg-green-900/40 border-green-700 text-green-400",
    yellow: "bg-yellow-900/40 border-yellow-700 text-yellow-400",
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        {Icon && <Icon size={18} />}
      </div>
      <div className="text-3xl font-bold text-white">{value ?? "—"}</div>
    </div>
  );
}
