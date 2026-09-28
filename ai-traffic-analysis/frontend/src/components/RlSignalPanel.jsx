import { Cpu, ShieldCheck, Zap } from "lucide-react";

export default function RlSignalPanel({ rlDecision }) {
  if (!rlDecision) return null;

  const {
    phase = "NS_GREEN",
    green_approaches = [],
    red_approaches = [],
    green_time_s = 0,
    reason = "",
    safety_notes = [],
    q_values = {},
    reward_components = {},
    epsilon = 0.05,
  } = rlDecision;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-[#E2E8F0] dark:border-slate-800 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Cpu size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">
              Algorithm 3: Reinforcement Learning Signal Optimization
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              Q-learning signal state selection and green duration policy
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 rounded-full font-semibold self-start sm:self-auto">
          <Zap size={14} className="text-emerald-500" />
          Optimal Phase: <strong className="text-[#0F172A] dark:text-white font-bold">{phase}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Signal Control */}
        <div className="bg-[#F8FAFC] dark:bg-slate-800/60 rounded-xl p-4 border border-[#E2E8F0] dark:border-slate-700/80 space-y-3">
          <p className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
            Signal Action
          </p>
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="text-xs text-[#64748B] dark:text-slate-400 font-medium">Green Light:</div>
              <div className="flex flex-wrap gap-1.5">
                {green_approaches.map((app) => (
                  <span key={app} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold rounded-md">
                    {app} Approach
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{green_time_s}s</span>
              <span className="block text-[10px] text-[#64748B] dark:text-slate-400 font-medium">Green Hold</span>
            </div>
          </div>
          <div className="text-xs text-[#64748B] dark:text-slate-400 pt-2 border-t border-[#E2E8F0] dark:border-slate-700/60">
            Red Light: <span className="text-red-600 dark:text-red-400 font-semibold">{red_approaches.join(", ")}</span>
          </div>
        </div>

        {/* Q-Learning State & Q-Values */}
        <div className="bg-[#F8FAFC] dark:bg-slate-800/60 rounded-xl p-4 border border-[#E2E8F0] dark:border-slate-700/80 space-y-2">
          <p className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider flex justify-between">
            <span>Q-Values & Exploration</span>
            {epsilon !== undefined && (
              <span className="text-[10px] text-[#94A3B8] font-medium">ε = {epsilon}</span>
            )}
          </p>
          <div className="space-y-1.5 pt-1">
            {Object.entries(q_values).map(([action, qVal]) => {
              const isSelected = action === phase;
              return (
                <div
                  key={action}
                  className={`flex items-center justify-between text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 font-bold"
                      : "bg-white dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-700/40 text-[#64748B] dark:text-slate-400"
                  }`}
                >
                  <span>{action}</span>
                  <span className="font-mono">{qVal}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reward Components */}
        <div className="bg-[#F8FAFC] dark:bg-slate-800/60 rounded-xl p-4 border border-[#E2E8F0] dark:border-slate-700/80 space-y-3">
          <p className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
            Reward Function R_t
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-[11px] text-center pt-0.5">
            <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700/50">
              <span className="block text-[10px] text-[#94A3B8]">W_t (Wait)</span>
              <span className="font-mono text-red-600 dark:text-red-400 font-bold">{reward_components.W_t ?? 0}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700/50">
              <span className="block text-[10px] text-[#94A3B8]">Q_t (Queue)</span>
              <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{reward_components.Q_t ?? 0}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700/50">
              <span className="block text-[10px] text-[#94A3B8]">F_t (Flow)</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{reward_components.F_t ?? 0}</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs pt-2 border-t border-[#E2E8F0] dark:border-slate-700/60">
            <span className="text-[#64748B] dark:text-slate-400 font-medium">Total Reward:</span>
            <span className="font-mono font-bold text-[#0F172A] dark:text-white">{reward_components.reward ?? 0}</span>
          </div>
        </div>
      </div>

      {reason && (
        <div className="bg-blue-50/60 dark:bg-slate-800/40 rounded-xl p-3.5 border border-blue-100 dark:border-slate-700/60 text-xs text-[#334155] dark:text-slate-300">
          <strong className="text-[#0F172A] dark:text-white font-semibold">Agent Rationale:</strong> {reason}
        </div>
      )}

      {safety_notes && safety_notes.length > 0 && (
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
          <ShieldCheck size={16} className="text-blue-500 shrink-0" />
          <span>Safety Constraint: {safety_notes.join("; ")}</span>
        </div>
      )}
    </div>
  );
}

