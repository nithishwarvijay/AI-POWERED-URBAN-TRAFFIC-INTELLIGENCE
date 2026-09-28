import { Link, useLocation } from "react-router-dom";
import { Activity, Upload, List, LayoutDashboard, Cpu, ShieldCheck } from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Analyze", icon: Upload },
  { to: "/results", label: "History", icon: List },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="glass-card sticky top-0 z-50 px-6 py-3.5 mb-6 border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-lg glow-blue group-hover:scale-105 transition-transform duration-300">
            <Activity size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-gray-200 to-blue-300 bg-clip-text text-transparent">
              AI Traffic Analyzer
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
              <Cpu size={12} className="text-cyan-400" />
              <span>YOLOv11 & RL Engine</span>
            </div>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-2 bg-gray-900/60 p-1.5 rounded-full border border-gray-800/80 backdrop-blur-md">
          {links.map(({ to, label, icon: Icon }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md glow-blue scale-105"
                    : "text-gray-400 hover:text-gray-100 hover:bg-gray-800/60"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Live System Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>System Ready</span>
        </div>
      </div>
    </nav>
  );
}
