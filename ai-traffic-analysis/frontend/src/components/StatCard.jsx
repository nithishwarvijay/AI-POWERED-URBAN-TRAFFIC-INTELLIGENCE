export default function StatCard({ label, value, icon: Icon, color = "blue", trend }) {
  const colorStyles = {
    blue: {
      bg: "from-blue-600/10 via-indigo-600/5 to-transparent",
      border: "border-blue-500/20 hover:border-blue-500/40",
      iconBg: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
      glow: "glow-blue",
    },
    green: {
      bg: "from-emerald-600/10 via-teal-600/5 to-transparent",
      border: "border-emerald-500/20 hover:border-emerald-500/40",
      iconBg: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
      glow: "glow-emerald",
    },
    red: {
      bg: "from-rose-600/10 via-red-600/5 to-transparent",
      border: "border-rose-500/20 hover:border-rose-500/40",
      iconBg: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
      glow: "glow-rose",
    },
    yellow: {
      bg: "from-amber-600/10 via-yellow-600/5 to-transparent",
      border: "border-amber-500/20 hover:border-amber-500/40",
      iconBg: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
      glow: "glow-amber",
    },
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div className={`glass-card glass-card-hover rounded-2xl border p-5 bg-gradient-to-br ${style.bg} ${style.border} relative overflow-hidden group`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${style.iconBg} transition-transform duration-300 group-hover:scale-110`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-3xl font-extrabold text-white tracking-tight">
          {value !== undefined && value !== null ? value : <span className="text-gray-600">0</span>}
        </div>
        {trend && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
