import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Brain,
  Car,
  Clock,
  Shield,
  TrendingUp,
  Zap,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  AlertTriangle,
  MapPin,
  Cpu,
  Eye,
  Signal,
  Github,
  Twitter,
  Mail,
  Menu,
  X,
  Siren,
  Route,
  Camera,
  Database,
  Network,
  LineChart,
} from 'lucide-react';

// ── Animated counter ────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ── Traffic flow SVG visualization ─────────────────────────────────────────
function TrafficVisualization() {
  return (
    <div className="relative w-full h-72 md:h-96 select-none" aria-hidden="true">
      {/* City grid background */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#2563EB" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Central intersection */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-64 h-64 md:w-80 md:h-80">
          {/* Roads */}
          <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 bg-slate-800/60 rounded-sm" />
          <div className="absolute left-1/2 top-0 bottom-0 w-10 -translate-x-1/2 bg-slate-800/60 rounded-sm" />

          {/* Lane markings */}
          <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 border-t-2 border-dashed border-yellow-400/30" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 border-l-2 border-dashed border-yellow-400/30" />

          {/* Intersection box */}
          <div className="absolute top-1/2 left-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 bg-slate-700/80 rounded-sm border border-slate-600/40" />

          {/* Signal lights */}
          {[
            { pos: 'top-0 left-1/2 -translate-x-8', color: 'bg-green-400', label: 'N' },
            { pos: 'bottom-0 left-1/2 translate-x-2', color: 'bg-red-400', label: 'S' },
            { pos: 'left-0 top-1/2 -translate-y-8', color: 'bg-red-400', label: 'W' },
            { pos: 'right-0 top-1/2 translate-y-2', color: 'bg-green-400', label: 'E' },
          ].map(({ pos, color, label }) => (
            <div key={label} className={`absolute ${pos} flex flex-col items-center gap-1`}>
              <div className="w-5 h-8 bg-slate-800 rounded-full flex flex-col items-center justify-around py-1 border border-slate-600/50">
                <div className={`w-2.5 h-2.5 rounded-full ${color === 'bg-green-400' ? 'bg-green-400 shadow-green-400/60 shadow-sm' : 'bg-slate-600'}`} />
                <div className={`w-2.5 h-2.5 rounded-full ${color === 'bg-red-400' ? 'bg-red-400 shadow-red-400/60 shadow-sm' : 'bg-slate-600'}`} />
              </div>
              <span className="text-[9px] font-bold text-slate-400">{label}</span>
            </div>
          ))}

          {/* Animated vehicle dots */}
          <div className="absolute top-1/2 left-4 w-3 h-3 -translate-y-1/2 rounded-full bg-cyan-400 shadow-cyan-400/60 shadow-md animate-[moveRight_3s_linear_infinite]" />
          <div className="absolute top-1/2 right-4 w-3 h-3 -translate-y-1/2 rounded-full bg-blue-400 shadow-blue-400/60 shadow-md animate-[moveLeft_3.5s_linear_infinite]" />
          <div className="absolute left-1/2 top-4 w-3 h-3 -translate-x-1/2 rounded-full bg-cyan-300 shadow-cyan-300/60 shadow-md animate-[moveDown_2.8s_linear_infinite]" />

          {/* AI scan overlay */}
          <div className="absolute inset-0 rounded-lg border border-cyan-500/20 animate-pulse-subtle" />
          <div className="absolute inset-4 rounded border border-blue-400/10" />

          {/* Data overlays */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
            AI ANALYZING
          </div>
          <div className="absolute -right-12 top-1/2 -translate-y-1/2 bg-green-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
            24 SIGNALS
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-700/90 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap">
            DENSITY: 68%
          </div>
          <div className="absolute -left-14 top-1/2 -translate-y-1/2 bg-orange-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
            MODERATE
          </div>
        </div>
      </div>

      {/* Floating data cards */}
      <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-xs text-white">
        <div className="font-semibold text-cyan-300 mb-1">Q-Learning RL</div>
        <div className="text-white/70">Phase: NS_GREEN</div>
        <div className="text-white/70">Green: 42s</div>
      </div>

      <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-xs text-white">
        <div className="font-semibold text-green-300 mb-1">YOLOv11 Active</div>
        <div className="text-white/70">Cars: 14</div>
        <div className="text-white/70">Trucks: 3</div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const capabilities = [
    {
      icon: Brain,
      title: 'AI Vehicle Detection',
      description: 'YOLOv11-powered real-time vehicle classification — cars, bikes, buses, trucks, and emergency vehicles.',
      color: 'blue',
      accent: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Traffic Analytics',
      description: 'Live density monitoring with per-approach congestion scoring and trend analysis.',
      color: 'cyan',
      accent: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-800',
    },
    {
      icon: Zap,
      title: 'Adaptive Signal Optimization',
      description: 'Tabular Q-learning RL engine dynamically computes optimal green phase durations.',
      color: 'amber',
      accent: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800',
    },
    {
      icon: Siren,
      title: 'Emergency Vehicle Priority',
      description: 'Automatic detection forces green on the emergency approach — all others held red.',
      color: 'red',
      accent: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800',
    },
    {
      icon: Activity,
      title: 'Traffic Density Monitoring',
      description: 'Per-approach density scoring (N/E/S/W) with occupancy ratios and queue length analysis.',
      color: 'green',
      accent: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800',
    },
    {
      icon: Route,
      title: 'Intelligent Route Insights',
      description: 'Data-driven route recommendations with congestion forecasts and travel time estimation.',
      color: 'purple',
      accent: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800',
    },
  ];

  const howItWorks = [
    {
      step: 1,
      icon: Camera,
      title: 'Traffic Data Collection',
      description: 'Upload video or image feeds from traffic cameras across intersections.',
    },
    {
      step: 2,
      icon: Eye,
      title: 'AI Vehicle Detection',
      description: 'YOLOv11 classifies and counts every vehicle with bounding box precision.',
    },
    {
      step: 3,
      icon: Database,
      title: 'Density & Lane Analysis',
      description: 'Algorithm 2 computes per-approach density scores, occupancy ratios and queue lengths.',
    },
    {
      step: 4,
      icon: Cpu,
      title: 'Signal Optimization',
      description: 'Tabular Q-learning RL selects the optimal phase and green duration in real time.',
    },
    {
      step: 5,
      icon: LineChart,
      title: 'Intelligence Dashboard',
      description: 'All insights surface in a live command center with analytics and alert management.',
    },
  ];

  const benefits = [
    {
      metric: '40%',
      title: 'Reduced Congestion',
      description: 'AI-adaptive signal timing reduces average waiting time across monitored intersections.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      metric: '35%',
      title: 'Faster Emergency Response',
      description: 'Automatic priority routing clears the path for ambulances, fire trucks, and police.',
      color: 'from-red-500 to-rose-600',
    },
    {
      metric: '50%',
      title: 'Adaptive Signal Efficiency',
      description: 'RL-optimized phases outperform fixed-time cycles under variable traffic conditions.',
      color: 'from-green-500 to-emerald-600',
    },
    {
      metric: '100%',
      title: 'Data-Driven Decisions',
      description: 'Comprehensive analytics give planners and operators a single source of traffic truth.',
      color: 'from-cyan-500 to-cyan-600',
    },
  ];

  const stats = [
    { value: 12842, suffix: '+', label: 'Vehicles Analyzed' },
    { value: 24, suffix: '', label: 'Active Signals' },
    { value: 99, suffix: '%', label: 'Detection Accuracy' },
    { value: 3, suffix: '', label: 'AI Algorithms' },
  ];

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Benefits', href: '#benefits' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="border-b border-[#E2E8F0]/50 dark:border-slate-800/60 bg-white/80 dark:bg-[#030712]/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-black text-[#0F172A] dark:text-white">Urban Traffic Intelligence</span>
                <p className="text-[10px] text-blue-500 dark:text-blue-400 leading-none font-semibold uppercase tracking-widest">AI Platform</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-sm text-[#64748B] dark:text-slate-400 hover:text-[#2563EB] dark:hover:text-blue-400 font-medium transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-[#0F172A] dark:text-white hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 text-sm font-bold bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-[#E2E8F0] dark:border-slate-800 pt-4 space-y-2 animate-slide-up">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href} className="block px-3 py-2 text-sm font-medium text-[#64748B] dark:text-slate-400 hover:text-[#2563EB] rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  {l.label}
                </a>
              ))}
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="flex-1 text-center text-sm font-semibold border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white px-4 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Sign In</Link>
                <Link to="/register" className="flex-1 text-center text-sm font-semibold bg-[#2563EB] text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">Get Started</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#030712] text-white py-20 lg:py-32">
        {/* Subtle grid bg */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        {/* Multi-point glows */}
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5">
                <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
                <span className="text-xs font-semibold text-[#06B6D4] uppercase tracking-wider">AI-Powered Traffic Intelligence</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight">
                Urban Traffic<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] via-[#38BDF8] to-[#06B6D4]">Intelligence.</span>
              </h1>

              <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                The AI-powered smart city platform that analyzes vehicle density, optimizes traffic signals, prioritizes emergency vehicles, and delivers real-time urban mobility insights.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 text-base"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/15 border border-white/15 text-white font-bold px-8 py-4 rounded-2xl transition-all backdrop-blur-sm text-base"
                >
                  <Eye className="w-5 h-5" />
                  View Live Demo
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-6 pt-2">
                {['YOLOv11 Powered', 'Q-Learning RL', 'Real-Time Analytics', 'Role-Based Access'].map((tag) => (
                  <div key={tag} className="flex items-center gap-1.5 text-sm text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-[#06B6D4]" />
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: visualization */}
            <div className="hidden lg:block">
              <TrafficVisualization />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-[#0A0F1A] border-y border-[#E2E8F0] dark:border-slate-800/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ value, suffix, label }) => (
              <div key={label} className="relative group">
                <div className="bg-gradient-to-br from-[#F8FAFC] to-white dark:from-slate-800/60 dark:to-slate-900 rounded-2xl p-6 text-center border border-[#E2E8F0] dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-800 transition-all hover:shadow-lg hover:shadow-blue-500/5">
                  <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#2563EB] to-[#06B6D4]">
                    <AnimatedCounter target={value} suffix={suffix} />
                  </div>
                  <div className="text-sm text-[#64748B] dark:text-slate-400 mt-1.5 font-semibold">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Key Capabilities ──────────────────────────────────────────────── */}
      <section id="features" className="py-20 lg:py-28 bg-[#F8FAFC] dark:bg-[#080C14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/60 rounded-full px-4 py-1.5 mb-4">
              <Cpu className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">Platform Capabilities</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-[#0F172A] dark:text-white mb-4 leading-tight">
              Everything a smart city needs
            </h2>
            <p className="text-[#64748B] dark:text-slate-400 text-lg">
              Six AI-powered modules working together to make urban traffic management intelligent, responsive, and data-driven.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map(({ icon: Icon, title, description, accent, color }) => (
              <div
                key={title}
                className="bg-white dark:bg-[#0F172A] rounded-3xl border border-[#E2E8F0] dark:border-slate-800/60 p-6 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-lg ${accent} border`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-2 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">{title}</h3>
                <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">{description}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white dark:bg-[#0A0F1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 rounded-full px-4 py-1.5 mb-4">
              <Network className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span className="text-xs font-semibold text-[#06B6D4] uppercase tracking-wider">Intelligence Pipeline</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0F172A] dark:text-white mb-4">
              How the platform works
            </h2>
            <p className="text-[#64748B] dark:text-slate-400 text-lg">
              A unified AI pipeline — from raw camera feed to real-time traffic intelligence in five steps.
            </p>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-px bg-gradient-to-r from-blue-200 via-cyan-300 to-blue-200 dark:from-blue-800 dark:via-cyan-700 dark:to-blue-800" />

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {howItWorks.map(({ step, icon: Icon, title, description }) => (
                <div key={step} className="relative flex flex-col items-center text-center group">
                  <div className="relative z-10 w-18 h-18 w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-[#0A0F1A] border-2 border-[#2563EB] text-[#2563EB] text-xs font-black rounded-full flex items-center justify-center">
                      {step}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-white mb-2">{title}</h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────────────────── */}
      <section id="benefits" className="py-20 lg:py-28 bg-[#F8FAFC] dark:bg-[#080C14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-full px-4 py-1.5 mb-4">
              <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="text-xs font-semibold text-[#16A34A] uppercase tracking-wider">Measurable Impact</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0F172A] dark:text-white mb-4">
              Built for real results
            </h2>
            <p className="text-[#64748B] dark:text-slate-400 text-lg">
              Urban Traffic Intelligence delivers measurable improvements to traffic flow, emergency response, and urban mobility.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map(({ metric, title, description, color }) => (
              <div
                key={title}
                className="bg-white dark:bg-[#0F172A] rounded-3xl border border-[#E2E8F0] dark:border-slate-800/60 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-[0.06] rounded-full -translate-y-8 translate-x-8`} />
                <div className={`text-5xl font-black bg-gradient-to-br ${color} bg-clip-text text-transparent mb-3`}>
                  {metric}
                </div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden bg-[#030712] text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Start Today</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black mb-5 leading-tight">
            Ready to modernize your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#06B6D4]">city's traffic management?</span>
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Deploy Urban Traffic Intelligence in your traffic control center and start making data-driven decisions today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 text-base"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/15 border border-white/15 text-white font-bold px-10 py-4 rounded-2xl transition-all text-base"
            >
              <Eye className="w-5 h-5" />
              Explore Demo
            </Link>
          </div>

          {/* Role highlights */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Traffic Control Rooms', 'Smart City Departments', 'Transport Authorities', 'Urban Planners'].map((role) => (
              <div key={role} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3.5 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#06B6D4] flex-shrink-0" />
                  {role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-[#030712] border-t border-slate-800/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-base font-black text-white">Urban Traffic Intelligence</span>
                  <p className="text-[10px] text-blue-400 leading-none font-semibold uppercase tracking-widest">AI Platform</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                A professional-grade smart city platform for traffic control rooms, urban planners, and government transportation authorities.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2">
                {['Dashboard', 'Vehicle Detection', 'Signal Optimization', 'Traffic Analytics', 'Emergency Vehicles'].map((item) => (
                  <li key={item}>
                    <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Access */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Access</h4>
              <ul className="space-y-2">
                {['Sign In', 'Register', 'Demo Access', 'Admin Panel'].map((item) => (
                  <li key={item}>
                    <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2026 Urban Traffic Intelligence. All rights reserved.
            </p>
            <p className="text-xs text-slate-600 font-medium tracking-wide">
              AI-Powered Smart City Platform
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
