import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserSquare2,
  Users,
  Calendar,
  CheckCheck,
  BookOpen,
  DollarSign,
  Clock,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Star,
  Plus,
  Coins,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Building2,
  FileText,
  Upload,
  X,
  Gift,
  Minus,
  Trophy
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { formatUZS, cn } from '../../lib/utils';
import { api } from '../../lib/api';

export function TeacherPortalPage() {
  const navigate = useNavigate();

  // Active Teacher profile from sessionStorage or fallback
  const [teacher, setTeacher] = useState(() => {
    try {
      const raw = sessionStorage.getItem('eduone_active_teacher');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      id: 'tch-1',
      full_name: 'Asilbek Berdiqulov',
      phone: '+998 50 075 34 34',
      subject: 'Ingliz tili (IELTS Instructor)',
      salary_type: 'percentage',
      salary_rate: 45,
      branch_name: 'Bosh Filial (Toshkent)',
    };
  });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('eduone_active_teacher');
      if (raw) setTeacher(JSON.parse(raw));
    } catch {}
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'groups' | 'attendance' | 'timetable' | 'homework' | 'salary'
  const [selectedGroup, setSelectedGroup] = useState('grp-1');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [savedStatus, setSavedStatus] = useState('');

  // Mock Groups for this teacher
  const [teacherGroups, setTeacherGroups] = useState([
    {
      id: 'grp-1',
      name: 'IELTS Intensive 7.5+',
      subject: 'IELTS Advanced',
      level: 'C1',
      schedule_days: 'Dush-Chor-Juma',
      schedule_time: '14:00 - 15:30',
      room: 'Auditoriya 302',
      students_count: 14,
      avg_score: 4.8,
    },
    {
      id: 'grp-2',
      name: 'General English B2 Intermediate',
      subject: 'General English',
      level: 'B2',
      schedule_days: 'Dush-Chor-Juma',
      schedule_time: '16:00 - 17:30',
      room: 'Auditoriya 104',
      students_count: 16,
      avg_score: 4.5,
    },
    {
      id: 'grp-3',
      name: 'Speaking & Debate Club Pro',
      subject: 'IELTS Speaking',
      level: 'B2-C1',
      schedule_days: 'Sesh-Pay-Shanba',
      schedule_time: '18:00 - 19:30',
      room: 'Debat Xonasi',
      students_count: 12,
      avg_score: 4.9,
    }
  ]);

  // Students in selected group (stored and synced with localStorage)
  const [students, setStudents] = useState(() => {
    try {
      const raw = localStorage.getItem('eduone_teacher_portal_students');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      { id: 'st-1', name: 'Sardor Aliyev', phone: '+998 90 123 45 67', attendance: 'present', score: 5, coins: 140, homework: 'Topshirdi' },
      { id: 'st-2', name: 'Madinabonu Karimova', phone: '+998 93 456 78 90', attendance: 'present', score: 5, coins: 210, homework: 'Topshirdi' },
      { id: 'st-3', name: 'Javohir Toshmatov', phone: '+998 97 789 01 23', attendance: 'late', score: 4, coins: 95, homework: 'Kechikdi' },
      { id: 'st-4', name: 'Zilola Ergasheva', phone: '+998 99 234 56 78', attendance: 'absent', score: 0, coins: 80, homework: 'Topshirmadi' },
      { id: 'st-5', name: 'Bobur Mirzayev', phone: '+998 90 345 67 89', attendance: 'present', score: 5, coins: 165, homework: 'Topshirdi' },
      { id: 'st-6', name: 'Diyora Rahmatova', phone: '+998 91 567 89 01', attendance: 'excused', score: 0, coins: 110, homework: 'Sababli' },
    ];
  });

  // Coin Awarding State
  const [coinModalStudent, setCoinModalStudent] = useState(null);
  const [coinAmount, setCoinAmount] = useState(10);
  const [customCoinAmount, setCustomCoinAmount] = useState('');
  const [coinReason, setCoinReason] = useState('Darsdagi a’lo faolligi uchun');
  const [coinToast, setCoinToast] = useState('');

  // Homework list and LMS state
  const [homeworks, setHomeworks] = useState([
    {
      id: 'hw-1',
      title: 'IELTS Writing Task 2: Essay on Technology in Education',
      groupName: 'IELTS Intensive 7.5+',
      deadline: '2026-10-22',
      submissions: '12 / 14 topshirdi',
      coinsReward: 25,
    },
    {
      id: 'hw-2',
      title: 'Reading Unit 8: Academic Passage & Vocabulary Drill',
      groupName: 'General English B2 Intermediate',
      deadline: '2026-10-21',
      submissions: '15 / 16 topshirdi',
      coinsReward: 15,
    }
  ]);

  const [newHwModal, setNewHwModal] = useState(false);
  const [newHw, setNewHw] = useState({
    title: '',
    groupId: 'grp-1',
    deadline: '',
    coins: 20,
    desc: ''
  });

  const saveStudentsState = (updatedList) => {
    setStudents(updatedList);
    try {
      localStorage.setItem('eduone_teacher_portal_students', JSON.stringify(updatedList));
    } catch {}
  };

  const handleAttendanceChange = (studentId, status) => {
    const updated = students.map((s) => (s.id === studentId ? { ...s, attendance: status } : s));
    saveStudentsState(updated);
  };

  const handleScoreChange = (studentId, score) => {
    const updated = students.map((s) => (s.id === studentId ? { ...s, score } : s));
    saveStudentsState(updated);
  };

  // Quick Coin Awarding (+5, +10, +20, etc.)
  const handleQuickAwardCoins = (studentId, amount, reason = 'Darsdagi faollik') => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    const newCoins = Math.max(0, (student.coins || 0) + amount);
    const updated = students.map((s) =>
      s.id === studentId ? { ...s, coins: newCoins } : s
    );
    saveStudentsState(updated);
    setCoinToast(`🎉 ${student.name} ga ${amount > 0 ? '+' : ''}${amount} koin topshirildi! (${reason})`);
    setTimeout(() => setCoinToast(''), 3500);
  };

  // Mass Award Coins to all present students
  const handleAwardAllPresent = (amount = 10) => {
    const presentList = students.filter((s) => s.attendance === 'present');
    if (presentList.length === 0) {
      setCoinToast('⚠️ Hozircha darsda "Keldi" deb belgilangan o‘quvchilar yo‘q');
      setTimeout(() => setCoinToast(''), 3000);
      return;
    }
    const updated = students.map((s) => {
      if (s.attendance === 'present') {
        return { ...s, coins: (s.coins || 0) + amount };
      }
      return s;
    });
    saveStudentsState(updated);
    setCoinToast(`🎁 Darsdagi barcha ${presentList.length} nafar o‘quvchiga +${amount} tadan koin ulashildi!`);
    setTimeout(() => setCoinToast(''), 4000);
  };

  const openCoinModal = (student) => {
    setCoinModalStudent(student);
    setCoinAmount(10);
    setCustomCoinAmount('');
    setCoinReason('Darsdagi a’lo faolligi uchun');
  };

  const handleModalSubmitCoin = (e) => {
    e.preventDefault();
    if (!coinModalStudent) return;
    const finalAmt = customCoinAmount !== '' ? Number(customCoinAmount) : coinAmount;
    if (isNaN(finalAmt) || finalAmt === 0) return;
    handleQuickAwardCoins(coinModalStudent.id, finalAmt, coinReason);
    setCoinModalStudent(null);
  };

  const handleSaveAttendance = () => {
    setSavedStatus("Davomat va kunlik baholar saqlandi! Ota-onalarga Telegram orqali bildirishnomalar yuborildi.");
    setTimeout(() => setSavedStatus(''), 3500);
  };

  const handleCreateHw = (e) => {
    e.preventDefault();
    if (!newHw.title) return;
    const grp = teacherGroups.find((g) => g.id === newHw.groupId);
    setHomeworks([
      {
        id: `hw-${Date.now()}`,
        title: newHw.title,
        groupName: grp?.name || 'Guruh',
        deadline: newHw.deadline || '2026-10-25',
        submissions: '0 / 14 topshirdi',
        coinsReward: Number(newHw.coins) || 20,
      },
      ...homeworks,
    ]);
    setNewHwModal(false);
    setNewHw({ title: '', groupId: 'grp-1', deadline: '', coins: 20, desc: '' });
  };

  const currentGroupObj = teacherGroups.find((g) => g.id === selectedGroup) || teacherGroups[0];

  // Calculated estimated salary
  const totalStudents = teacherGroups.reduce((acc, g) => acc + g.students_count, 0);
  const totalRevenue = totalStudents * 600000;
  const calculatedSalary = teacher.salary_type === 'percentage'
    ? (totalRevenue * (teacher.salary_rate || 45)) / 100
    : 6500000;

  return (
    <div className="min-h-screen bg-[#F5F6F8] dark:bg-[#0B0F17] text-[#252936] dark:text-[#E2E8F0] flex flex-col font-sans transition-colors duration-200">
      {/* =========================================================================
          TEACHER PORTAL TOP NAVBAR
          ========================================================================= */}
      <header className="h-16 bg-white dark:bg-[#121722] border-b border-[#E7EAF0] dark:border-white/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        {/* Left: Brand + Teacher Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4169E1] to-[#2546B8] flex items-center justify-center text-white font-black text-base shadow-md">
            E1
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-[#252936] dark:text-white">
                Edu<span className="text-[#4169E1] dark:text-amber-400">One</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-amber-400/15 text-[#4169E1] dark:text-amber-400 border border-blue-200 dark:border-amber-400/30">
                Ustoz Portali
              </span>
            </div>
            <p className="text-xs text-[#7C8494] dark:text-gray-400 font-medium">
              {teacher.full_name} • <span className="text-[#4169E1] dark:text-amber-400">{teacher.subject}</span>
            </p>
          </div>
        </div>

        {/* Right: Quick actions, Theme, Lang, and Exit back to Admin */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector />
          <ThemeToggle />

          <button
            onClick={() => navigate('/teachers')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white bg-gray-100 dark:bg-white/10 hover:bg-gray-200 transition-all border border-gray-200 dark:border-white/10"
            title="Markaz administrator paneliga qaytish"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin panelga qaytish</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          SECONDARY SUB-NAV TABS (Dashboard, Groups, Attendance, Timetable, HW, Salary)
          ========================================================================= */}
      <div className="bg-white dark:bg-[#141A26] border-b border-[#E7EAF0] dark:border-white/10 px-4 sm:px-6">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2">
          {[
            { id: 'dashboard', label: 'Boshqaruv', icon: UserSquare2 },
            { id: 'groups', label: 'Guruhlarim', icon: Users, badge: teacherGroups.length },
            { id: 'attendance', label: 'Davomat Olish', icon: CheckCheck },
            { id: 'timetable', label: 'Dars Jadvali', icon: Calendar },
            { id: 'homework', label: 'Uyga Vazifalar & LMS', icon: BookOpen, badge: homeworks.length },
            { id: 'salary', label: 'Mening Maoshim', icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-[#EEF2FF] dark:bg-amber-400/15 text-[#4169E1] dark:text-amber-400 shadow-xs'
                    : 'text-[#7C8494] dark:text-gray-400 hover:text-[#252936] dark:hover:text-white hover:bg-[#F5F6F8] dark:hover:bg-white/5'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          MAIN PORTAL BODY CONTENT
          ========================================================================= */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Status notification */}
        {savedStatus && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{savedStatus}</span>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            TAB 1: DASHBOARD
            --------------------------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#141A26] border border-[#E7EAF0] dark:border-white/10 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#7C8494] dark:text-gray-400 font-medium">Faol Guruhlarim</p>
                  <p className="text-xl font-bold text-[#252936] dark:text-white mt-1">
                    {teacherGroups.length} ta guruh
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Xonalar bandligi: 100%</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-[#4169E1] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#141A26] border border-[#E7EAF0] dark:border-white/10 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#7C8494] dark:text-gray-400 font-medium">O‘quvchilar Soni</p>
                  <p className="text-xl font-bold text-[#252936] dark:text-white mt-1">
                    {totalStudents} nafar
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Davomat darajasi: 96.4%</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#141A26] border border-[#E7EAF0] dark:border-white/10 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#7C8494] dark:text-gray-400 font-medium">Bu Oylik Maoshim</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatUZS(calculatedSalary)}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Stavka: {teacher.salary_rate}% (Guruh to‘lovidan)</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#141A26] border border-[#E7EAF0] dark:border-white/10 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#7C8494] dark:text-gray-400 font-medium">Bugungi Darslar</p>
                  <p className="text-xl font-bold text-[#252936] dark:text-white mt-1">2 ta dars</p>
                  <p className="text-[11px] text-[#4169E1] dark:text-amber-400 mt-0.5">Navbatdagi: 14:00 (Xona 302)</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-[#E5A12B] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Today's Schedule Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#141A26] border border-[#E7EAF0] dark:border-white/10 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0] dark:border-white/10">
                <div>
                  <h3 className="text-sm font-bold text-[#252936] dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#4169E1] dark:text-amber-400" />
                    Bugungi Dars Jadvali
                  </h3>
                  <p className="text-xs text-[#7C8494] dark:text-gray-400">
                    Bugun o‘tilishi rejalashtirilgan mashg‘ulotlar
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckCheck}
                  onClick={() => setActiveTab('attendance')}
                >
                  Bugungi Davomatni Olish
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teacherGroups.slice(0, 2).map((grp, idx) => (
                  <div
                    key={grp.id}
                    className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-[#4169E1] dark:text-blue-300">
                          {idx === 0 ? '14:00 - 15:30' : '16:00 - 17:30'}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1.5">
                          {grp.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{grp.room}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                          {grp.students_count} o‘quvchi
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-white/10">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        Dars muddati: 90 daqiqa
                      </span>
                      <button
                        onClick={() => {
                          setSelectedGroup(grp.id);
                          setActiveTab('attendance');
                        }}
                        className="text-xs font-bold text-[#4169E1] dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        Davomat qilish <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            TAB 2: MENING GURUHLARIM
            --------------------------------------------------------------------- */}
        {activeTab === 'groups' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#252936] dark:text-white">
                  Mening Biriktirilgan Guruhlarim ({teacherGroups.length} ta)
                </h2>
                <p className="text-xs text-[#7C8494] dark:text-gray-400">
                  Siz dars berayotgan kurslar va o‘quvchilar ro‘yxati
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {teacherGroups.map((grp) => (
                <div
                  key={grp.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#141A26] border border-[#E7EAF0] dark:border-white/10 space-y-4 shadow-xs hover:border-[#4169E1]/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/20 text-[#4169E1] dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                        {grp.level}
                      </span>
                      <h3 className="text-sm font-bold text-[#252936] dark:text-white mt-1.5">
                        {grp.name}
                      </h3>
                      <p className="text-xs text-[#7C8494] dark:text-gray-400">{grp.subject}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#4169E1] dark:text-amber-400">
                      ★ {grp.avg_score}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#7C8494] dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-white/10">
                    <div className="flex justify-between">
                      <span>Dars kunlari:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{grp.schedule_days}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vaqti:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{grp.schedule_time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auditoriya:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{grp.room}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>O‘quvchilar:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                        {grp.students_count} nafar
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedGroup(grp.id);
                      setActiveTab('attendance');
                    }}
                    className="w-full py-2 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-[#EEF2FF] dark:hover:bg-amber-400/10 text-xs font-bold text-[#4169E1] dark:text-amber-400 border border-gray-200 dark:border-white/10 transition-colors"
                  >
                    Davomat va o‘quvchilar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            TAB 3: DAVOMAT VA BAHOLASH JURNALI
            --------------------------------------------------------------------- */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141A26] border border-[#E7EAF0] dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Guruhni tanlang:
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F141E] text-xs font-bold text-[#252936] dark:text-white focus:outline-none"
                  >
                    {teacherGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.schedule_time})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Dars sanasi:
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F141E] text-xs text-[#252936] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  icon={Coins}
                  onClick={() => handleAwardAllPresent(10)}
                  className="border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-400/10 text-xs font-bold gap-1.5"
                >
                  🎁 Kelganlarga +10 Koin
                </Button>

                <Button
                  variant="primary"
                  icon={CheckCheck}
                  onClick={handleSaveAttendance}
                  className="bg-[#4169E1] hover:bg-[#3557C7]"
                >
                  Davomatni Saqlash & Xabarnoma
                </Button>
              </div>
            </div>

            {/* Coin Toast Notification */}
            {coinToast && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{coinToast}</span>
                </div>
                <button onClick={() => setCoinToast('')} className="text-amber-600 dark:text-amber-400 hover:text-black dark:hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Attendance Student Table */}
            <div className="rounded-2xl bg-white dark:bg-[#141A26] border border-[#E7EAF0] dark:border-white/10 shadow-xs overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {currentGroupObj?.name} — O‘quvchilar ro‘yxati ({students.length} nafar)
                </span>
                <span className="text-xs text-gray-400">
                  Kelganlar: <strong className="text-emerald-500">{students.filter((s) => s.attendance === 'present').length}</strong> / {students.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">O‘quvchi F.I.Sh</th>
                      <th className="p-3">Telefon</th>
                      <th className="p-3 text-center">Davomat holati</th>
                      <th className="p-3 text-center">Baho (1-5)</th>
                      <th className="p-3 text-center">Uyga vazifa</th>
                      <th className="p-3 text-right">Koinlar 🪙 (Taqdirlash)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {students.map((st, idx) => (
                      <tr key={st.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                        <td className="p-3 font-mono text-gray-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-gray-900 dark:text-white">
                          {st.name}
                        </td>
                        <td className="p-3 text-gray-500 dark:text-gray-400 font-mono">
                          {st.phone}
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-black/30">
                            {[
                              { id: 'present', label: 'Keldi', color: 'bg-emerald-500 text-white' },
                              { id: 'late', label: 'Kech', color: 'bg-amber-500 text-white' },
                              { id: 'absent', label: 'Yo‘q', color: 'bg-red-500 text-white' },
                              { id: 'excused', label: 'Sababli', color: 'bg-blue-500 text-white' },
                            ].map((btn) => (
                              <button
                                key={btn.id}
                                onClick={() => handleAttendanceChange(st.id, btn.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                  st.attendance === btn.id
                                    ? btn.color
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                }`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleScoreChange(st.id, star)}
                                className={`p-0.5 ${st.score >= star ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            st.homework === 'Topshirdi'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : st.homework === 'Topshirmadi'
                              ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                          }`}>
                            {st.homework}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Main coin pill button */}
                            <button
                              type="button"
                              onClick={() => openCoinModal(st)}
                              className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-400/10 hover:bg-amber-100 dark:hover:bg-amber-400/20 border border-amber-300 dark:border-amber-400/30 text-amber-800 dark:text-amber-300 font-mono font-bold text-xs flex items-center gap-1 transition-all group shadow-xs cursor-pointer"
                              title={`${st.name} ga koin taqdim etish (bosish orqali sozlash)`}
                            >
                              <span>+{st.coins}</span>
                              <span className="text-sm group-hover:scale-125 transition-transform">🪙</span>
                            </button>

                            {/* Quick increment buttons */}
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleQuickAwardCoins(st.id, 5, 'Darsdagi faollik')}
                                className="px-1.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 transition-all hover:scale-105"
                                title="Tezkor +5 koin (Faollik)"
                              >
                                +5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickAwardCoins(st.id, 10, 'A’lo javob')}
                                className="px-1.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 text-[11px] font-bold text-[#4169E1] dark:text-blue-400 transition-all hover:scale-105"
                                title="Tezkor +10 koin (A’lo javob)"
                              >
                                +10
                              </button>
                              <button
                                type="button"
                                onClick={() => openCoinModal(st)}
                                className="p-1 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-600 dark:text-gray-300 transition-all"
                                title="Boshqa miqdorda koin berish"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            TAB 4: DARS JADVALI (TIMETABLE)
            --------------------------------------------------------------------- */}
        {activeTab === 'timetable' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141A26] border border-[#E7EAF0] dark:border-white/10 shadow-xs">
              <h3 className="text-sm font-bold text-[#252936] dark:text-white mb-1">
                Haftalik Dars Jadvali
              </h3>
              <p className="text-xs text-[#7C8494] dark:text-gray-400">
                Ustoz Asilbek Berdiqulov uchun dars vaqtlari va xonalar taqsimoti
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#141A26] border border-[#E7EAF0] dark:border-white/10 space-y-3">
                <span className="text-xs font-bold text-[#4169E1] dark:text-amber-400 uppercase tracking-wider">
                  Dushanba — Chorshanba — Juma (Toq kunlar)
                </span>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-white/5 border border-blue-200/60 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        IELTS Intensive 7.5+
                      </span>
                      <span className="text-[11px] text-gray-500">Auditoriya 302 • 14 o‘quvchi</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#4169E1]">14:00 - 15:30</span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-white/5 border border-blue-200/60 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        General English B2 Intermediate
                      </span>
                      <span className="text-[11px] text-gray-500">Auditoriya 104 • 16 o‘quvchi</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#4169E1]">16:00 - 17:30</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#141A26] border border-[#E7EAF0] dark:border-white/10 space-y-3">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Seshanba — Payshanba — Shanba (Juft kunlar)
                </span>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-white/5 border border-purple-200/60 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        Speaking & Debate Club Pro
                      </span>
                      <span className="text-[11px] text-gray-500">Debat Xonasi • 12 o‘quvchi</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-600">18:00 - 19:30</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            TAB 5: UYGA VAZIFALAR & LMS
            --------------------------------------------------------------------- */}
        {activeTab === 'homework' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#252936] dark:text-white">
                  Uyga Vazifalar & LMS Materiallari
                </h3>
                <p className="text-xs text-[#7C8494] dark:text-gray-400">
                  Guruhlarga vazifa berish, topshirilgan ishlarni tekshirish va koinlar berish
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setNewHwModal(true)}
                className="bg-[#4169E1] hover:bg-[#3557C7]"
              >
                Vazifa biriktirish
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {homeworks.map((hw) => (
                <div
                  key={hw.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#141A26] border border-[#E7EAF0] dark:border-white/10 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-white/10 text-[#4169E1] dark:text-blue-300">
                        {hw.groupName}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1.5">
                        {hw.title}
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-500">
                      +{hw.coinsReward} 🪙
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/10 text-xs text-gray-500">
                    <span>Muddati: {hw.deadline}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {hw.submissions}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal: New Homework */}
            {newHwModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="w-full max-w-md bg-white dark:bg-[#141A26] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Yangi Uyga Vazifa Biriktirish
                    </h3>
                    <button onClick={() => setNewHwModal(false)} className="text-gray-400 hover:text-white">
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreateHw} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Guruhni tanlang
                      </label>
                      <select
                        value={newHw.groupId}
                        onChange={(e) => setNewHw({ ...newHw, groupId: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F141E] text-gray-900 dark:text-white focus:outline-none"
                      >
                        {teacherGroups.map((g) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Vazifa mavzusi
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Masalan: IELTS Writing Task 2"
                        value={newHw.title}
                        onChange={(e) => setNewHw({ ...newHw, title: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F141E] text-gray-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Topshirish muddati
                        </label>
                        <input
                          type="date"
                          required
                          value={newHw.deadline}
                          onChange={(e) => setNewHw({ ...newHw, deadline: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F141E] text-gray-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Mukofot (Koinlar)
                        </label>
                        <input
                          type="number"
                          value={newHw.coins}
                          onChange={(e) => setNewHw({ ...newHw, coins: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F141E] text-gray-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-white/10">
                      <Button variant="outline" size="sm" type="button" onClick={() => setNewHwModal(false)}>
                        Bekor qilish
                      </Button>
                      <Button variant="primary" size="sm" type="submit">
                        Vazifani yuborish
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------------
            TAB 6: MENING MAOSHIM
            --------------------------------------------------------------------- */}
        {activeTab === 'salary' && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#141A26] border border-[#E7EAF0] dark:border-white/10 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Ustoz Oylik Maoshi va Hisob-Kitobi
                  </h3>
                  <p className="text-xs text-gray-500">
                    Oktabr oyi uchun hisoblangan daromad
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">Hisoblangan jami maosh:</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatUZS(calculatedSalary)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <span className="text-gray-500 block mb-1">Maosh rejimi:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {teacher.salary_type === 'percentage'
                      ? `${teacher.salary_rate}% (Guruh to‘lovlaridan ulush)`
                      : 'Fiksirlangan stavka'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <span className="text-gray-500 block mb-1">O‘quvchilar soni:</span>
                  <span className="font-bold text-gray-900 dark:text-white font-mono">
                    {totalStudents} nafar
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <span className="text-gray-500 block mb-1">To‘lov holati:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    Kassada tasdiqlangan
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL: O‘QUVCHIGA KOIN TAQDIM ETISH (GAMIFICATION)
            ========================================================================= */}
        {coinModalStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md bg-white dark:bg-[#141A26] border border-[#E7EAF0] dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-4 border-b border-[#E7EAF0] dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs text-lg">
                    🪙
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#252936] dark:text-white">
                      O‘quvchiga Koin Taqdim Etish
                    </h3>
                    <p className="text-[11px] text-[#7C8494] dark:text-gray-400">
                      {coinModalStudent.name} (Hozirda: <strong className="text-amber-500 font-mono">+{coinModalStudent.coins} 🪙</strong>)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCoinModalStudent(null)}
                  className="text-[#7C8494] hover:text-[#252936] dark:hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleModalSubmitCoin} className="p-5 space-y-4">
                {/* Preset Amounts */}
                <div>
                  <label className="block text-xs font-semibold text-[#252936] dark:text-gray-300 mb-2">
                    Tezkor miqdorni tanlang:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { val: 5, label: '+5 Faol' },
                      { val: 10, label: '+10 A’lo' },
                      { val: 20, label: '+20 Vazifa' },
                      { val: 50, label: '+50 Chempion' },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => {
                          setCoinAmount(preset.val);
                          setCustomCoinAmount('');
                        }}
                        className={cn(
                          'py-2.5 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-0.5',
                          coinAmount === preset.val && customCoinAmount === ''
                            ? 'bg-amber-500 text-white border-amber-600 shadow-sm scale-102'
                            : 'bg-[#F8F9FA] dark:bg-white/5 text-gray-700 dark:text-gray-300 border-[#E7EAF0] dark:border-white/10 hover:border-amber-300'
                        )}
                      >
                        <span>{preset.label}</span>
                        <span className="text-[10px] opacity-80">🪙</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom amount or penalty */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-[#7C8494] dark:text-gray-400 mb-1">
                      Boshqa ixtiyoriy miqdor:
                    </label>
                    <input
                      type="number"
                      placeholder="Masalan: 15 yoki 30"
                      value={customCoinAmount}
                      onChange={(e) => setCustomCoinAmount(e.target.value)}
                      className="w-full bg-[#F8F9FA] dark:bg-white/5 text-[#252936] dark:text-white text-xs rounded-xl px-3 py-2 border border-[#E7EAF0] dark:border-white/10 focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#7C8494] dark:text-gray-400 mb-1">
                      Intizom jarimasi (ayirish):
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomCoinAmount('-5');
                          setCoinReason('Kech qolgani yoki tartibsizlik uchun');
                        }}
                        className="flex-1 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-xs font-bold hover:bg-red-100 transition-colors"
                      >
                        -5 🪙
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomCoinAmount('-10');
                          setCoinReason('Vazifani umuman bajarmagani uchun');
                        }}
                        className="flex-1 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-xs font-bold hover:bg-red-100 transition-colors"
                      >
                        -10 🪙
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-semibold text-[#252936] dark:text-gray-300 mb-1.5">
                    Taqdirlash sababi (Izoh)
                  </label>
                  <select
                    value={coinReason}
                    onChange={(e) => setCoinReason(e.target.value)}
                    className="w-full bg-[#F8F9FA] dark:bg-white/5 text-[#252936] dark:text-white text-xs rounded-xl px-3 py-2.5 border border-[#E7EAF0] dark:border-white/10 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Darsdagi a’lo faolligi uchun">Darsdagi a’lo faolligi uchun (+10)</option>
                    <option value="Uyga vazifani a’lo darajada bajargani uchun">Uyga vazifani a’lo darajada bajargani uchun (+20)</option>
                    <option value="Speaking va debat bahsida g‘olib chiqqani uchun">Speaking va debat bahsida g‘olib chiqqani uchun (+15)</option>
                    <option value="Lug‘at diktantidan 100 ball to‘plagani uchun">Lug‘at diktantidan 100 ball to‘plagani uchun (+25)</option>
                    <option value="Darsda namunali tartib va yordam uchun">Darsda namunali tartib va yordam uchun (+5)</option>
                    <option value="Kech qolgani yoki tartibsizlik uchun">Kech qolgani yoki tartibsizlik uchun (-5)</option>
                    <option value="Vazifani umuman bajarmagani uchun">Vazifani umuman bajarmagani uchun (-10)</option>
                  </select>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E7EAF0] dark:border-white/10">
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => setCoinModalStudent(null)}
                  >
                    Bekor qilish
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md gap-1.5"
                  >
                    <span>Koinni Taqdim Etish</span>
                    <span>🪙</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
