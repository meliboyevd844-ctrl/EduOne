import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Building2,
  CreditCard,
  AlertTriangle,
  Wallet,
  Plus,
  Sliders,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  Circle,
  XCircle,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Sun,
  Cloud,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Cpu,
  HardDrive,
  Wifi,
  FileText,
  Music,
  Camera,
  MessageSquare,
  Bot,
  GitBranch,
  Settings
} from 'lucide-react';
import { formatUZS } from '../../lib/utils';

// Glassmorphism Card component matching reference design
function GlassCard({ children, className = '', style = {}, glow = false, glowColor = 'rgba(59, 130, 246, 0.2)' }) {
  return (
    <div
      className={`rounded-2xl transition-all duration-300 ${className}`}
      style={{
        background: 'rgba(13, 19, 32, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: glow
          ? `0 10px 32px rgba(0, 0, 0, 0.45), 0 0 35px ${glowColor}`
          : '0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Dark themed Stat Card matching uniform electric blue accent
function DarkStatCard({ title, value, icon: Icon, subvalue, accentColor = '#3B82F6' }) {
  return (
    <GlassCard className="p-4 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none opacity-20"
        style={{
          background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
          transform: 'translate(25%, -25%)',
        }}
      />
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(29, 78, 216, 0.1) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            boxShadow: '0 0 15px rgba(37, 99, 235, 0.25)',
          }}
        >
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        <TrendingUp className="w-4 h-4 text-emerald-400/70" />
      </div>
      <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</h3>
      <p className="text-xl font-bold text-white tracking-tight">{value}</p>
      {subvalue && (
        <p className="text-[11px] text-slate-400/80 mt-1.5 leading-snug">{subvalue}</p>
      )}
    </GlassCard>
  );
}

export function SuperAdminDashboard() {
  const {
    organizations = [],
    auditLogs = [],
    openNewOrgModal,
    openFeaturesModal,
    toggleOrgFeature,
    batchUpdateOrgFeatures,
    isLoading = false
  } = useOutletContext();
  const navigate = useNavigate();

  // Search, filter & sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Real database-backed calculations
  const totalOrgs = organizations.length;
  const activeOrgs = organizations.filter((o) => o.status === 'active');
  const trialOrgs = organizations.filter((o) => o.status === 'trial');
  const suspendedOrgs = organizations.filter((o) => o.status === 'suspended' || o.status === 'blocked');
  const totalDebt = organizations.reduce((acc, o) => acc + (Number(o.outstandingDebt) || 0), 0);
  const totalPaidRevenue = organizations.reduce((acc, o) => acc + (Number(o.amountPaid) || 0), 0);
  const totalMRR = activeOrgs.reduce((acc, o) => acc + (Number(o.planPrice) || 0), 0);

  // Live Clock State matching the "07:45 PM" badge in the reference image
  const [timeStr, setTimeStr] = useState('07:45 PM');
  const [dateStr, setDateStr] = useState({ full: 'May 24, 2025', day: 'Saturday' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
      setDateStr({
        full: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        day: now.toLocaleDateString('en-US', { weekday: 'long' }),
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // Interactive Focus Timer (25:00 Pomodoro deep work widget matching image)
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let timer;
    if (isTimerRunning && focusSeconds > 0) {
      timer = setInterval(() => {
        setFocusSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, focusSeconds]);

  const timerFormatted = useMemo(() => {
    const m = Math.floor(focusSeconds / 60).toString().padStart(2, '0');
    const s = (focusSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [focusSeconds]);

  // Tasks Checklist State (matching image's Tasks card)
  const [tasks, setTasks] = useState([
    { id: 1, title: 'UI/UX Research', status: 'Completed', done: true },
    { id: 2, title: 'Design Dashboard', status: 'Completed', done: true },
    { id: 3, title: 'Prototype App', status: 'In Progress', done: false },
    { id: 4, title: 'User Testing', status: 'Pending', done: false },
  ]);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newDone = !t.done;
          return {
            ...t,
            done: newDone,
            status: newDone ? 'Completed' : 'In Progress',
          };
        }
        return t;
      })
    );
  };

  // Filtered and sorted organizations
  const filteredOrgs = useMemo(() => {
    return organizations.filter((org) => {
      const matchSearch =
        searchQuery === '' ||
        (org.name && org.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (org.subdomain && org.subdomain.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (org.ownerName && org.ownerName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter === '' || org.status === statusFilter;
      const matchPlan =
        planFilter === '' ||
        (org.planName && org.planName.toLowerCase().includes(planFilter.toLowerCase())) ||
        (org.planId && org.planId.toLowerCase() === planFilter.toLowerCase());
      return matchSearch && matchStatus && matchPlan;
    });
  }, [organizations, searchQuery, statusFilter, planFilter]);

  const sortedOrgs = useMemo(() => {
    return [...filteredOrgs].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredOrgs, sortKey, sortOrder]);

  const paginatedOrgs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedOrgs.slice(start, start + pageSize);
  }, [sortedOrgs, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedOrgs.length / pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: { bg: 'rgba(34, 197, 94, 0.12)', color: '#34D399', border: 'rgba(34, 197, 94, 0.25)', label: 'Faol' },
      trial: { bg: 'rgba(234, 179, 8, 0.12)', color: '#FBBF24', border: 'rgba(234, 179, 8, 0.25)', label: 'Sinov' },
      suspended: { bg: 'rgba(239, 68, 68, 0.12)', color: '#F87171', border: 'rgba(239, 68, 68, 0.25)', label: "To'xtatilgan" },
      blocked: { bg: 'rgba(239, 68, 68, 0.12)', color: '#F87171', border: 'rgba(239, 68, 68, 0.25)', label: 'Bloklangan' },
    };
    const s = styles[status] || styles.active;
    return (
      <span
        className="px-2.5 py-0.5 rounded-full text-[11px] font-medium inline-flex items-center gap-1.5"
        style={{
          background: s.bg,
          color: s.color,
          border: `1px solid ${s.border}`,
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
        {s.label}
      </span>
    );
  };

  // Uniform Primary Button Style used for ALL CTA buttons
  const uniformBtnPrimary = {
    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    boxShadow: '0 0 20px rgba(37, 99, 235, 0.45)',
    border: '1px solid rgba(96, 165, 250, 0.35)',
    color: '#FFFFFF',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Boshqaruv paneli
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Live Monitor
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            EduOne SaaS platformasi umumiy ko'rsatkichlari, tashkilotlar va obuna tushumlari
          </p>
        </div>
        <button
          onClick={openNewOrgModal}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-white transition-all duration-200 self-start hover:scale-[1.02] cursor-pointer"
          style={uniformBtnPrimary}
        >
          <Plus className="w-4 h-4" />
          Yangi tashkilot
        </button>
      </div>

      {/* =========================================================================
          WIDGET SHOWCASE SECTION (MATCHING USER'S REFERENCE IMAGE TO THE PIXEL)
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* ROW 1 LEFT (7 cols): Greeting Card with live clock & glowing neon wave */}
        <div className="lg:col-span-7">
          <GlassCard className="p-5 h-full relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">{greeting},</p>
                <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">Aaru / Super Admin</h2>
                <p className="text-xs text-slate-400/90 mt-1">Stay focused and make it happen.</p>
              </div>
              <div
                className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold text-blue-300 flex items-center gap-2"
                style={{
                  background: 'rgba(37, 99, 235, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  boxShadow: '0 0 15px rgba(37, 99, 235, 0.2)',
                }}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                {timeStr}
              </div>
            </div>

            {/* Glowing Neon Line Chart (Sine wave curve from reference picture) */}
            <div className="mt-6 w-full h-20 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 70" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="neonLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#38BDF8" stopOpacity="1" />
                    <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.8" />
                  </linearGradient>
                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path
                  d="M 0 50 Q 50 55 90 45 T 180 25 T 260 40 T 340 20 T 400 35"
                  fill="none"
                  stroke="url(#neonLineGrad)"
                  strokeWidth="3"
                  filter="url(#neonGlow)"
                />
                {/* Glowing Nodes on Wave */}
                {[
                  { cx: 90, cy: 45 },
                  { cx: 180, cy: 25 },
                  { cx: 260, cy: 40 },
                  { cx: 340, cy: 20 },
                ].map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.cx}
                    cy={pt.cy}
                    r="4"
                    fill="#38BDF8"
                    filter="url(#neonGlow)"
                    className="animate-pulse"
                  />
                ))}
              </svg>
            </div>
          </GlassCard>
        </div>

        {/* ROW 1 RIGHT (5 cols): Weather & Date Card */}
        <div className="lg:col-span-5">
          <GlassCard className="p-5 h-full flex flex-col justify-between">
            <div>
              <p className="text-sm font-bold text-white tracking-tight">{dateStr.full}</p>
              <p className="text-xs text-slate-400">{dateStr.day}</p>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-yellow-400"
                  style={{
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                    boxShadow: '0 0 20px rgba(234, 179, 8, 0.15)',
                  }}
                >
                  <Sun className="w-6 h-6 animate-spin-slow" />
                </div>
                <div>
                  <div className="text-3xl font-black text-white tracking-tight">27°</div>
                  <p className="text-xs text-slate-400">Cloudy</p>
                </div>
              </div>
              <div className="text-right text-xs font-mono text-slate-400">
                <p>H: 31°</p>
                <p>L: 21°</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ROW 2 LEFT (7 cols): Productivity Card */}
        <div className="lg:col-span-7">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">Productivity</h3>
              <div className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                <span>Today</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div>
                <div className="text-3xl font-black text-white tracking-tight">78%</div>
                <p className="text-xs font-medium text-emerald-400 mt-0.5">Great Progress!</p>

                <div className="flex items-center gap-6 mt-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Tasks Completed</p>
                    <p className="text-lg font-bold text-white">14</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total Tasks</p>
                    <p className="text-lg font-bold text-white">18</p>
                  </div>
                </div>
              </div>

              {/* Glowing SVG Radial Ring (Purple/Blue Gradient from reference image) */}
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38BDF8" />
                      <stop offset="50%" stopColor="#818CF8" />
                      <stop offset="100%" stopColor="#C084FC" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.06)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="url(#ringGrad)"
                    strokeWidth="8"
                    strokeDasharray="238.76"
                    strokeDashoffset={238.76 * (1 - 0.78)}
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(129, 140, 248, 0.5))',
                    }}
                  />
                </svg>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ROW 2 RIGHT (5 cols): Focus Timer Card */}
        <div className="lg:col-span-5">
          <GlassCard className="p-5 flex flex-col justify-between items-center text-center">
            <div className="w-full text-left">
              <h3 className="text-sm font-semibold text-white">Focus Timer</h3>
            </div>

            {/* Glowing Focus Ring with Orange/Blue gradient */}
            <div className="relative my-2 w-32 h-32 flex flex-col items-center justify-center">
              <svg className="w-full h-full -rotate-90 absolute inset-0" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FB923C" />
                    <stop offset="50%" stopColor="#F43F5E" />
                    <stop offset="100%" stopColor="#38BDF8" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#timerGrad)"
                  strokeWidth="6"
                  strokeDasharray="251.3"
                  strokeDashoffset={251.3 * (1 - focusSeconds / 1500)}
                  strokeLinecap="round"
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(251, 146, 60, 0.4))',
                    transition: 'stroke-dashoffset 1s linear',
                  }}
                />
              </svg>

              <div className="relative z-10 text-center">
                <p className="text-xl font-black text-white font-mono">{timerFormatted}</p>
                <p className="text-[10px] text-slate-400">Deep Work</p>
              </div>
            </div>

            {/* Start/Pause Button (Uniform Electric Blue CTA) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
                style={uniformBtnPrimary}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
              </button>
              {focusSeconds < 1500 && (
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setFocusSeconds(25 * 60);
                  }}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white bg-white/5 border border-white/10"
                  title="Qayta o'rnatish"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </GlassCard>
        </div>

        {/* ROW 3 LEFT (7 cols): Tasks Checklist Card */}
        <div className="lg:col-span-7">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Tasks</h3>
              <button
                onClick={() => {
                  const newTaskTitle = prompt("Yangi vazifa nomini kiriting:");
                  if (newTaskTitle) {
                    setTasks((prev) => [
                      ...prev,
                      { id: Date.now(), title: newTaskTitle, status: 'In Progress', done: false },
                    ]);
                  }
                }}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white transition-all hover:scale-110 cursor-pointer"
                style={uniformBtnPrimary}
                title="Yangi vazifa qo'shish"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer hover:bg-white/[0.04]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    {task.done ? (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                        style={{
                          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                          boxShadow: '0 0 10px rgba(37, 99, 235, 0.5)',
                        }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-500/40 hover:border-blue-400" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        task.done ? 'line-through text-slate-400' : 'text-slate-200'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      task.status === 'Completed'
                        ? 'text-slate-400 bg-white/5'
                        : task.status === 'In Progress'
                        ? 'text-amber-400 bg-amber-400/10'
                        : 'text-slate-500 bg-white/5'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* ROW 3 RIGHT (5 cols): Current Mood / System Pulse Card */}
        <div className="lg:col-span-5">
          <GlassCard className="p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Current Mood</p>
              <h4 className="text-base font-bold text-blue-400 tracking-tight mt-0.5">Focused</h4>
            </div>

            {/* Glowing Sine Wave Light Line */}
            <div className="my-4 h-12 w-full flex items-center justify-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 40" preserveAspectRatio="none">
                <path
                  d="M 0 20 Q 75 0 150 20 T 300 20"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="3"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))',
                  }}
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Distractions</span>
              <span className="font-semibold text-emerald-400">Low</span>
            </div>
          </GlassCard>
        </div>

        {/* ROW 4 LEFT (7 cols): Weekly Activity Bar Chart */}
        <div className="lg:col-span-7">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Weekly Activity</h3>
              <div className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                <span>This Week</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            <div className="w-full h-36 flex items-end justify-between gap-3 px-2 pt-6">
              {[
                { day: 'Mon', h: 40 },
                { day: 'Tue', h: 45 },
                { day: 'Wed', h: 55 },
                { day: 'Thu', h: 50 },
                { day: 'Fri', h: 65 },
                { day: 'Sat', h: 85, tooltip: '7.8h', active: true },
                { day: 'Sun', h: 45 },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2 relative">
                  {item.tooltip && (
                    <div
                      className="absolute -top-7 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-lg"
                      style={uniformBtnPrimary}
                    >
                      {item.tooltip}
                    </div>
                  )}
                  <div
                    className="w-3 rounded-full transition-all duration-500"
                    style={{
                      height: `${item.h}%`,
                      background: item.active
                        ? 'linear-gradient(180deg, #38BDF8 0%, #2563EB 100%)'
                        : 'linear-gradient(180deg, rgba(56, 189, 248, 0.6) 0%, rgba(37, 99, 235, 0.2) 100%)',
                      boxShadow: item.active ? '0 0 15px rgba(56, 189, 248, 0.6)' : 'none',
                    }}
                  />
                  <span className={`text-[10px] ${item.active ? 'text-blue-300 font-bold' : 'text-slate-500'}`}>
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* ROW 4 RIGHT (5 cols): Shortcuts (2x3 Glass Grid) */}
        <div className="lg:col-span-5">
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Shortcuts</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'Notes', icon: FileText, to: '/super-admin/audit' },
                { label: 'Files', icon: Layers, to: '/super-admin/organizations' },
                { label: 'Music', icon: Music, to: '/super-admin/settings' },
                { label: 'Calendar', icon: Calendar, to: '/super-admin/subscriptions' },
                { label: 'Camera', icon: Camera, to: '/super-admin/ai' },
                { label: 'Slack', icon: MessageSquare, to: '/super-admin/telegram' },
              ].map((sc, i) => {
                const Icon = sc.icon;
                return (
                  <button
                    key={i}
                    onClick={() => navigate(sc.to)}
                    className="p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer hover:scale-105"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(37, 99, 235, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(37, 99, 235, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    <span className="text-[10px] font-medium text-slate-300">{sc.label}</span>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* ROW 5 LEFT (7 cols): Upcoming Events */}
        <div className="lg:col-span-7">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Upcoming Events</h3>
              <button
                onClick={() => navigate('/super-admin/subscriptions')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { day: '25', month: 'MAY', title: 'Project Meeting', time: '10:00 AM – 11:00 AM', dot: '#3B82F6' },
                { day: '26', month: 'MAY', title: 'Design Review', time: '02:00 PM – 03:30 PM', dot: '#F97316' },
                { day: '28', month: 'MAY', title: 'Client Call', time: '11:00 AM – 12:00 PM', dot: '#10B981' },
              ].map((ev, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center font-mono leading-none">
                      <p className="text-sm font-black text-white">{ev.day}</p>
                      <p className="text-[9px] text-slate-400 uppercase">{ev.month}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{ev.title}</p>
                      <p className="text-[10px] text-slate-400">{ev.time}</p>
                    </div>
                  </div>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: ev.dot,
                      boxShadow: `0 0 8px ${ev.dot}`,
                    }}
                  />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* ROW 5 RIGHT (5 cols): System Status Card */}
        <div className="lg:col-span-5">
          <GlassCard className="p-5 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white mb-2">System Status</h3>

            <div className="flex items-center justify-center my-1">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="7"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="7"
                    strokeDasharray="238.76"
                    strokeDashoffset={238.76 * (1 - 0.92)}
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))' }}
                  />
                </svg>
                <div className="text-center">
                  <p className="text-base font-black text-white">92%</p>
                  <p className="text-[9px] text-slate-400">Optimal</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-2">
              {[
                { name: 'Storage', val: 78 },
                { name: 'Battery', val: 82 },
                { name: 'Network', val: 94 },
              ].map((st, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{st.name}</span>
                    <span className="font-mono text-slate-300 font-semibold">{st.val}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${st.val}%`,
                        background: 'linear-gradient(90deg, #2563EB 0%, #38BDF8 100%)',
                        boxShadow: '0 0 8px rgba(56, 189, 248, 0.5)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* =========================================================================
          OPERATIONAL METRICS (TOP 4 STATISTICS) - PRESERVED EXACTLY
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DarkStatCard
          title="Jami tashkilotlar"
          value={`${totalOrgs} ta`}
          icon={Building2}
          subvalue={`${activeOrgs.length} faol • ${trialOrgs.length} sinov • ${suspendedOrgs.length} to'xtatilgan`}
          accentColor="#3B82F6"
        />
        <DarkStatCard
          title="Faol obunalar"
          value={`${activeOrgs.length} ta`}
          icon={CreditCard}
          subvalue={totalOrgs > 0 ? `Qamrov: ${Math.round((activeOrgs.length / totalOrgs) * 100)}%` : "Obunalar mavjud emas"}
          accentColor="#38BDF8"
        />
        <DarkStatCard
          title="Qoldiq obuna qarzi"
          value={formatUZS(totalDebt)}
          icon={AlertTriangle}
          subvalue={
            totalDebt > 0
              ? `${organizations.filter((o) => o.outstandingDebt > 0).length} ta markazda to'lov kechikkan`
              : "Hozircha qarzdorlik mavjud emas"
          }
          accentColor="#F87171"
        />
        <DarkStatCard
          title="EduOne obuna tushumi"
          value={formatUZS(totalPaidRevenue)}
          icon={Wallet}
          subvalue={`Oylik kutilayotgan MRR: ${formatUZS(totalMRR)}`}
          accentColor="#818CF8"
        />
      </div>

      {/* =========================================================================
          REVENUE DYNAMICS & STATUS BREAKDOWN - PRESERVED EXACTLY
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 spans): Revenue Chart */}
        <div className="lg:col-span-2">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">EduOne obuna daromadi dinamikasi</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Platformaga tushgan real obuna to'lovlari</p>
              </div>
              <div className="flex items-center gap-1.5">
                {['Haftalik', 'Oylik', 'Yillik'].map((tab) => {
                  const isActive = tab === 'Oylik';
                  return (
                    <button
                      key={tab}
                      className="px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      style={
                        isActive
                          ? uniformBtnPrimary
                          : {
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.07)',
                              color: 'rgba(255, 255, 255, 0.5)',
                            }
                      }
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {totalPaidRevenue > 0 ? (
              <div className="w-full h-48 flex items-end justify-between gap-2 px-2 pt-4">
                {['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'].map((month, i) => {
                  const heights = [20, 35, 30, 45, 55, 50, 60, 70, 65, 80, 90, 100];
                  const h = heights[i] || 20;
                  const isCurrentMonth = i === new Date().getMonth();
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div
                        className="w-full rounded-t-lg transition-all duration-500"
                        style={{
                          height: `${h}%`,
                          background: isCurrentMonth
                            ? 'linear-gradient(180deg, #38BDF8 0%, #2563EB 100%)'
                            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)',
                          boxShadow: isCurrentMonth ? '0 0 20px rgba(56, 189, 248, 0.5)' : 'none',
                          border: isCurrentMonth ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      />
                      <span className={`text-[10px] ${isCurrentMonth ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
                        {month}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full h-48 flex flex-col items-center justify-center text-slate-500">
                <BarChart3 className="w-10 h-10 mb-3 text-slate-600" />
                <p className="text-sm font-medium">Daromad statistikasi mavjud emas</p>
                <p className="text-xs text-slate-600 mt-1">To'lovlar amalga oshirilgach, dinamika aks ettiriladi</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column (1 span) */}
        <div className="space-y-5">
          {/* Status Breakdown Card */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Tashkilotlar holati</h3>
            <div className="space-y-2.5">
              <div
                className="flex items-center justify-between text-xs p-2.5 rounded-xl"
                style={{
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  <span className="font-medium text-slate-300">Faol obunada</span>
                </div>
                <span className="font-bold text-emerald-400">{activeOrgs.length} ta</span>
              </div>

              <div
                className="flex items-center justify-between text-xs p-2.5 rounded-xl"
                style={{
                  background: 'rgba(234, 179, 8, 0.08)',
                  border: '1px solid rgba(234, 179, 8, 0.2)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                  <span className="font-medium text-slate-300">Sinov davrida</span>
                </div>
                <span className="font-bold text-yellow-400">{trialOrgs.length} ta</span>
              </div>

              <div
                className="flex items-center justify-between text-xs p-2.5 rounded-xl"
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]" />
                  <span className="font-medium text-slate-300">Qarzdor / To'xtatilgan</span>
                </div>
                <span className="font-bold text-red-400">{suspendedOrgs.length} ta</span>
              </div>
            </div>

            <div
              className="mt-4 pt-3 flex items-center justify-between text-xs"
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <span className="text-slate-400">Jami ro'yxatdan o'tgan:</span>
              <strong className="text-white font-semibold">{totalOrgs} ta markaz</strong>
            </div>
          </GlassCard>

          {/* Recent Audit Actions */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">So'nggi audit harakatlari</h3>
              <button
                onClick={() => navigate('/super-admin/audit')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                Barchasi →
              </button>
            </div>

            {auditLogs.length > 0 ? (
              <div className="space-y-2">
                {auditLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl text-xs"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <div className="flex items-center justify-between text-slate-400 text-[10px] mb-0.5">
                      <span>{log.timestamp}</span>
                      <span className="font-mono text-blue-300/80">{log.ip}</span>
                    </div>
                    <p className="font-medium text-slate-200 truncate">{log.action}</p>
                    <p className="text-[11px] text-slate-400 truncate">{log.target}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                Hozircha audit yozuvlari mavjud emas.
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* =========================================================================
          ORGANIZATIONS & SUBSCRIPTIONS DATA TABLE - PRESERVED EXACTLY
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              O'quv markazlari va obunalar jadvali
            </h2>
            <p className="text-xs text-slate-400">
              Tashkilotlar, filiallar soni, joriy tarif, to'lovlar va qarzdorlik monitoringi
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <GlassCard className="p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tashkilot, subdomen yoki rahbar F.I.SH..."
                className="w-full text-white placeholder-slate-400 text-xs rounded-xl py-2 pl-9 pr-3 outline-none transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.45)';
                  e.target.style.background = 'rgba(37, 99, 235, 0.08)';
                  e.target.style.boxShadow = '0 0 20px rgba(37, 99, 235, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs rounded-xl py-2 px-3 text-slate-200 outline-none cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <option value="">Barcha holatlar</option>
              <option value="active">Faol</option>
              <option value="trial">Sinov davri</option>
              <option value="suspended">To'xtatilgan</option>
            </select>
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs rounded-xl py-2 px-3 text-slate-200 outline-none cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <option value="">Barcha tariflar</option>
              <option value="Boshlang'ich">Boshlang'ich</option>
              <option value="Professional">Professional</option>
              <option value="Enterprise">Enterprise</option>
            </select>

            {(searchQuery || statusFilter || planFilter) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setPlanFilter('');
                  setCurrentPage(1);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors px-2 cursor-pointer"
              >
                Tozalash
              </button>
            )}
          </div>
        </GlassCard>

        {/* Data Table */}
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  {[
                    { key: 'name', label: 'Tashkilot', sortable: true },
                    { key: 'status', label: 'Holat', sortable: true },
                    { key: 'branchesCount', label: 'Filiallar', sortable: true, align: 'center' },
                    { key: 'studentsCount', label: "O'quvchilar", sortable: true, align: 'center' },
                    { key: 'planName', label: 'Tarif', sortable: true },
                    { key: 'planPrice', label: 'Obuna narxi', sortable: true, align: 'right' },
                    { key: 'outstandingDebt', label: 'Qarzdorlik', sortable: true, align: 'right' },
                    { key: 'actions', label: 'Amallar', align: 'right' },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-3.5 font-bold text-slate-400 uppercase tracking-wider text-[10px] ${
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                      } ${col.sortable ? 'cursor-pointer hover:text-white transition-colors' : ''}`}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <div
                        className={`flex items-center gap-1 ${
                          col.align === 'center'
                            ? 'justify-center'
                            : col.align === 'right'
                            ? 'justify-end'
                            : ''
                        }`}
                      >
                        {col.label}
                        {col.sortable && sortKey === col.key && (
                          sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-400" /> : <ChevronDown className="w-3 h-3 text-blue-400" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
                        <span>Ma'lumotlar yuklanmoqda...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <Building2 className="w-10 h-10 text-slate-600" />
                        <p className="text-sm font-medium">Tashkilotlar mavjud emas</p>
                        <p className="text-xs text-slate-500">
                          {searchQuery || statusFilter || planFilter
                            ? "Qidiruv natijasi topilmadi"
                            : "Birinchi markazni yaratish uchun tugmani bosing"}
                        </p>
                        {!searchQuery && !statusFilter && !planFilter && (
                          <button
                            onClick={openNewOrgModal}
                            className="mt-2 flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-white cursor-pointer"
                            style={uniformBtnPrimary}
                          >
                            <Plus className="w-4 h-4" />
                            Birinchi tashkilotni yaratish
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedOrgs.map((org, index) => (
                    <tr
                      key={org.id}
                      className="group transition-colors duration-150 hover:bg-blue-500/[0.04]"
                      style={{
                        borderBottom:
                          index < paginatedOrgs.length - 1 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
                      }}
                    >
                      {/* Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 shadow-md text-white"
                            style={{
                              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                              border: '1px solid rgba(96, 165, 250, 0.3)',
                              boxShadow: '0 0 10px rgba(37, 99, 235, 0.3)',
                            }}
                          >
                            {org.name ? org.name.slice(0, 2).toUpperCase() : 'ED'}
                          </div>
                          <div>
                            <div
                              className="font-semibold text-slate-200 hover:text-blue-400 transition-colors cursor-pointer"
                              onClick={() => openFeaturesModal(org)}
                            >
                              {org.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono leading-none mt-0.5">
                              {org.subdomain}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3.5">{getStatusBadge(org.status)}</td>
                      {/* Branches */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-semibold text-slate-300">
                          {org.branchesCount || (org.branches ? org.branches.length : 1)} ta
                        </span>
                      </td>
                      {/* Students */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-semibold text-slate-300">
                          {org.studentsCount ? org.studentsCount.toLocaleString() : '0'}
                        </span>
                      </td>
                      {/* Plan */}
                      <td className="px-4 py-3.5">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'rgba(255, 255, 255, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                        >
                          {org.planName || 'Standart'}
                        </span>
                      </td>
                      {/* Price */}
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-mono text-slate-200 font-semibold">
                          {formatUZS(org.planPrice)}
                        </span>
                      </td>
                      {/* Debt */}
                      <td className="px-4 py-3.5 text-right">
                        <span
                          className={`font-mono font-bold ${
                            org.outstandingDebt > 0 ? 'text-red-400' : 'text-slate-500'
                          }`}
                        >
                          {formatUZS(org.outstandingDebt || 0)}
                        </span>
                      </td>
                      {/* Actions (Uniform Buttons) */}
                      <td className="px-4 py-3.5 text-right">
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => openFeaturesModal(org)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer hover:scale-105"
                            style={{
                              background: 'rgba(37, 99, 235, 0.1)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              color: '#93C5FD',
                            }}
                            title="Funksiyalarni boshqarish"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Modullar</span>
                          </button>
                          <button
                            onClick={() => {
                              sessionStorage.setItem('eduone_impersonating_org', JSON.stringify(org));
                              navigate('/');
                            }}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer hover:scale-105"
                            style={uniformBtnPrimary}
                            title="Ushbu tashkilot sifatida kirish"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Kirish</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <span className="text-[11px] text-slate-400">
                {filteredOrgs.length} tadan {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, filteredOrgs.length)} ko'rsatilmoqda
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
                  style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(0, 5)
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        currentPage === page ? 'text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      style={
                        currentPage === page
                          ? uniformBtnPrimary
                          : {
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                            }
                      }
                    >
                      {page}
                    </button>
                  ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
                  style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
