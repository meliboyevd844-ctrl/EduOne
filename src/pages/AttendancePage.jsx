import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { api } from '../lib/api';
import {
  CheckCheck,
  Calendar,
  Users,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  Sparkles,
  BookOpen,
  Table,
  Check,
  Eye,
  X,
  MessageSquare,
  Scan,
  DoorOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { TurnstileScannerModal } from '../components/attendance/TurnstileScannerModal';

export function AttendancePage() {
  const [activeOrg, setActiveOrg] = useState(null);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [lessonTopic, setLessonTopic] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'matrix'
  const [previewTelegramModal, setPreviewTelegramModal] = useState(null);
  const [turnstileModalOpen, setTurnstileModalOpen] = useState(false);

  // Oylik jurnal parametrlari
  const [selectedMonth, setSelectedMonth] = useState('2026-10');

  const orgId = activeOrg?.id || 'default';

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('eduone_impersonating_org');
      if (raw) setActiveOrg(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    async function loadInitial() {
      const [grps, stds] = await Promise.all([
        api.getGroups(orgId),
        api.getStudents(orgId),
      ]);
      setGroups(grps);
      setStudents(stds);
      if (grps.length > 0) {
        setSelectedGroupId(grps[0].id);
      }
    }
    loadInitial();
  }, [activeOrg]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const groupStudents = students.filter(
    (s) => s.group_id === selectedGroupId || s.group_name === selectedGroup?.name
  );

  // Tanlangan guruh va sana bo'yicha mavjud davomatni yuklash
  useEffect(() => {
    if (!selectedGroupId) return;

    async function loadAttendance() {
      const saved = await api.getAttendance(orgId, selectedGroupId, selectedDate);
      if (saved && Array.isArray(saved)) {
        const map = {};
        saved.forEach((r) => {
          map[r.student_id] = { status: r.status, score: r.score || 5, notes: r.notes || '' };
        });
        setAttendanceRecords(map);
        setIsSaved(true);
      } else {
        // Boshlang'ich holat: barchasiga default 'present' (keldi)
        const initialMap = {};
        groupStudents.forEach((s) => {
          initialMap[s.id] = { status: 'present', score: 5, notes: '' };
        });
        setAttendanceRecords(initialMap);
        setIsSaved(false);
      }
    }
    loadAttendance();
  }, [selectedGroupId, selectedDate, students]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), status },
    }));
    setIsSaved(false);
  };

  const handleScoreChange = (studentId, score) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), score: Number(score) },
    }));
    setIsSaved(false);
  };

  // Modme: Tezkor barchasini "Keldi" qilish
  const handleMarkAllPresent = () => {
    const updated = {};
    groupStudents.forEach((s) => {
      updated[s.id] = { ...(attendanceRecords[s.id] || {}), status: 'present', score: attendanceRecords[s.id]?.score || 5 };
    });
    setAttendanceRecords(updated);
    setIsSaved(false);
  };

  const handleSaveAttendance = async () => {
    const payload = groupStudents.map((s) => ({
      student_id: s.id,
      student_name: `${s.first_name} ${s.last_name}`,
      status: attendanceRecords[s.id]?.status || 'present',
      score: attendanceRecords[s.id]?.score || 5,
      notes: attendanceRecords[s.id]?.notes || '',
    }));

    await api.saveAttendance(orgId, selectedGroupId, selectedDate, payload);
    setIsSaved(true);
    alert(`Davomat muvaffaqiyatli saqlandi! (${payload.length} ta o‘quvchi qayd etildi). Ota-onalarga Telegram bot orqali xabarnomalar yuborildi.`);
  };

  const presentCount = Object.values(attendanceRecords).filter((r) => r.status === 'present').length;
  const absentCount = Object.values(attendanceRecords).filter((r) => r.status === 'absent').length;
  const lateCount = Object.values(attendanceRecords).filter((r) => r.status === 'late').length;

  // Oylik matritsa kunlari (Dars kunlariga qarab: Dush-Chor-Juma yoki Sesh-Pay-Shanba)
  const isOddDays = (selectedGroup?.schedule_days || '').includes('Dush');
  // Masalan, oyning dars kunlari:
  const monthLessonDays = isOddDays
    ? ['02', '05', '07', '09', '12', '14', '16', '19', '21', '23', '26', '28', '30']
    : ['01', '03', '06', '08', '10', '13', '15', '17', '20', '22', '24', '27', '29', '31'];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Bosh sahifa', href: '/' }, { label: 'Davomat va Baholash' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252936] flex items-center gap-2.5">
            <CheckCheck className="w-6 h-6 text-[#4169E1]" />
            Davomat va Baholash Jurnali
          </h1>
          <p className="text-xs text-[#7C8494] mt-1">
            Guruhlar bo‘yicha kundalik davomat, kunlik baholar va oylik elektron jurnal matritsasi
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Rejim almashtirish: Kundalik vs Oylik Matritsa */}
          <div className="p-1 rounded-lg bg-[#F5F6F8] border border-[#E7EAF0] flex items-center gap-1">
            <button
              onClick={() => setViewMode('daily')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5',
                viewMode === 'daily'
                  ? 'bg-white text-[#252936] shadow-xs'
                  : 'text-[#7C8494] hover:text-[#252936]'
              )}
            >
              <Calendar className="w-3.5 h-3.5 text-[#4169E1]" />
              Kundalik
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5',
                viewMode === 'matrix'
                  ? 'bg-white text-[#252936] shadow-xs'
                  : 'text-[#7C8494] hover:text-[#252936]'
              )}
            >
              <Table className="w-3.5 h-3.5 text-[#4169E1]" />
              Oylik Jurnal
            </button>
          </div>

          <Button
            variant="outline"
            icon={Scan}
            onClick={() => setTurnstileModalOpen(true)}
            className="border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-xs h-8"
          >
            Turniket & QR Skaner
          </Button>

          {viewMode === 'daily' && (
            <Button
              variant="primary"
              icon={Save}
              onClick={handleSaveAttendance}
              className="text-xs h-8"
            >
              {isSaved ? "Saqlangan (Yangilash)" : "Davomatni Saqlash"}
            </Button>
          )}
        </div>
      </div>

      {/* Control Filters Bar */}
      <Card className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-[#E7EAF0] bg-white">
        {/* Guruh tanlash */}
        <div>
          <label className="block text-xs font-medium text-[#7C8494] mb-1.5">Guruhni tanlang:</label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none font-medium"
          >
            {groups.length === 0 ? (
              <option value="">Guruhlar mavjud emas</option>
            ) : (
              groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name} — {g.teacher_name} ({g.schedule_time})</option>
              ))
            )}
          </select>
        </div>

        {viewMode === 'daily' ? (
          <>
            {/* Sana tanlash */}
            <div>
              <label className="block text-xs font-medium text-[#7C8494] mb-1.5">Dars sanasi:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none font-mono"
              />
            </div>

            {/* Dars mavzusi */}
            <div>
              <label className="block text-xs font-medium text-[#7C8494] mb-1.5">Dars mavzusi:</label>
              <input
                type="text"
                placeholder="Masalan: Past Simple vs Present Perfect"
                value={lessonTopic}
                onChange={(e) => setLessonTopic(e.target.value)}
                className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none placeholder:text-[#7C8494]/60"
              />
            </div>
          </>
        ) : (
          <>
            {/* Oylik rejim oyi */}
            <div>
              <label className="block text-xs font-medium text-[#7C8494] mb-1.5">Oyni tanlang:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-end">
              <div className="text-xs text-[#7C8494] bg-[#F5F6F8] p-2 rounded-lg border border-[#E7EAF0] w-full">
                Kun tartibi: <strong className="text-[#252936]">{selectedGroup?.schedule_days || 'Dush-Chor-Juma'}</strong> ({monthLessonDays.length} ta reja dars)
              </div>
            </div>
          </>
        )}
      </Card>

      {/* REJIM 1: KUNDALIK DAVOMAT (Daily View) */}
      {viewMode === 'daily' && (
        <>
          {/* Summary Chips & Quick Mark All */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs px-3 py-1.5 rounded-md bg-[#EAF7F0] text-[#269B65] border border-[#269B65]/30 font-semibold">
                Kelganlar: {presentCount} ta
              </span>
              <span className="text-xs px-3 py-1.5 rounded-md bg-[#FDEEEC] text-[#D94B4B] border border-[#D94B4B]/30 font-semibold">
                Kelmaganlar: {absentCount} ta
              </span>
              <span className="text-xs px-3 py-1.5 rounded-md bg-[#FDF6E9] text-[#E5A12B] border border-[#E5A12B]/30 font-semibold">
                Kech qolganlar: {lateCount} ta
              </span>
            </div>

            {groupStudents.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                icon={Check}
                onClick={handleMarkAllPresent}
                className="border-[#E7EAF0] text-[#4169E1] hover:bg-[#EEF2FF]"
              >
                Barchasini Keldi qilish
              </Button>
            )}
          </div>

          {/* Attendance List */}
          <Card className="overflow-hidden border-[#E7EAF0] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F9FA] text-[#7C8494] uppercase font-semibold text-[11px] border-b border-[#E7EAF0]">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">O‘quvchi</th>
                    <th className="py-3 px-4 text-center">Davomat Holati</th>
                    <th className="py-3 px-4 text-center">Baho (1 - 5)</th>
                    <th className="py-3 px-4 text-right">Telegram Xabarnoma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAF0]">
                  {groupStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-[#7C8494]">
                        <Users className="w-10 h-10 mx-auto text-[#7C8494]/40 mb-2" />
                        Ushbu guruhga hali o‘quvchilar biriktirilmagan. "O‘quvchilar" bo‘limidan o‘quvchi qo‘shing.
                      </td>
                    </tr>
                  ) : (
                    groupStudents.map((std, idx) => {
                      const rec = attendanceRecords[std.id] || { status: 'present', score: 5 };
                      return (
                        <tr key={std.id} className="hover:bg-[#F8F9FA] transition-colors">
                          <td className="py-3.5 px-4 text-center text-[#7C8494] font-mono">{idx + 1}</td>

                          <td className="py-3.5 px-4 font-semibold text-[#252936]">
                            <div className="flex items-center gap-2">
                              <span>{std.first_name} {std.last_name}</span>
                              <span className="text-[10px] font-mono text-[#7C8494]">({std.phone})</span>
                            </div>
                          </td>

                          {/* Davomat status tugmalari */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(std.id, 'present')}
                                className={cn(
                                  'px-3 py-1.5 rounded-md text-xs font-semibold transition-all border',
                                  rec.status === 'present'
                                    ? 'bg-[#EAF7F0] text-[#269B65] border-[#269B65]/40 shadow-xs'
                                    : 'bg-white text-[#7C8494] border-[#E7EAF0] hover:bg-[#F8F9FA]'
                                )}
                              >
                                ✓ Keldi
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStatusChange(std.id, 'absent')}
                                className={cn(
                                  'px-3 py-1.5 rounded-md text-xs font-semibold transition-all border',
                                  rec.status === 'absent'
                                    ? 'bg-[#FDEEEC] text-[#D94B4B] border-[#D94B4B]/40 shadow-xs'
                                    : 'bg-white text-[#7C8494] border-[#E7EAF0] hover:bg-[#F8F9FA]'
                                )}
                              >
                                ✗ Kelmadi
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStatusChange(std.id, 'excused')}
                                className={cn(
                                  'px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all border',
                                  rec.status === 'excused'
                                    ? 'bg-[#FDF6E9] text-[#E5A12B] border-[#E5A12B]/40 shadow-xs'
                                    : 'bg-white text-[#7C8494] border-[#E7EAF0] hover:bg-[#F8F9FA]'
                                )}
                              >
                                Sababli
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStatusChange(std.id, 'late')}
                                className={cn(
                                  'px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all border',
                                  rec.status === 'late'
                                    ? 'bg-[#EEF2FF] text-[#4169E1] border-[#4169E1]/40 shadow-xs'
                                    : 'bg-white text-[#7C8494] border-[#E7EAF0] hover:bg-[#F8F9FA]'
                                )}
                              >
                                Kech qoldi
                              </button>
                            </div>
                          </td>

                          {/* Baho qo'yish */}
                          <td className="py-3.5 px-4 text-center">
                            <select
                              value={rec.score || 5}
                              onChange={(e) => handleScoreChange(std.id, e.target.value)}
                              className="bg-white text-[#252936] font-semibold text-xs rounded-md px-2.5 py-1.5 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none"
                            >
                              <option value="5">5 (A’lo)</option>
                              <option value="4">4 (Yaxshi)</option>
                              <option value="3">3 (Qoniqarli)</option>
                              <option value="2">2 (Qoniqarsiz)</option>
                              <option value="0">Bahosiz</option>
                            </select>
                          </td>

                          {/* Telegram xabar shablonini ko'rish */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setPreviewTelegramModal({
                                studentName: `${std.first_name} ${std.last_name}`,
                                status: rec.status,
                                score: rec.score || 5,
                                topic: lessonTopic || 'Dars amaliyoti',
                                phone: std.parent_phone || std.phone,
                              })}
                              className="inline-flex items-center gap-1.5 text-xs text-[#4169E1] hover:text-[#3151b7] bg-[#EEF2FF] hover:bg-[#E0E7FF] px-2.5 py-1 rounded-md border border-[#4169E1]/20 font-medium transition-colors"
                            >
                              <Send className="w-3 h-3" />
                              <span>Xabarni ko‘rish</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* REJIM 2: OYLIK JURNAL MATRITSASI (Matrix Journal View) */}
      {viewMode === 'matrix' && (
        <Card className="p-4 border-[#E7EAF0] bg-white space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#252936] flex items-center gap-2">
                <Table className="w-4 h-4 text-[#4169E1]" />
                {selectedGroup?.name || 'Guruh'} — {selectedMonth} oylik to‘liq elektron jurnali
              </h3>
              <p className="text-[11px] text-[#7C8494]">
                Har bir sana bo‘yicha o‘quvchilarning ishtiroki va olgan baholari matritsasi
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#7C8494]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#269B65] inline-block" /> Keldi (5)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#D94B4B] inline-block" /> Kelmadi</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#E5A12B] inline-block" /> Sababli</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#4169E1] inline-block" /> Kech qoldi</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#E7EAF0]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8F9FA] text-[#7C8494] text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 border-r border-b border-[#E7EAF0] sticky left-0 bg-[#F8F9FA] z-10 w-44 font-semibold text-[#252936]">
                    O‘quvchi F.I.Sh
                  </th>
                  {monthLessonDays.map((day) => (
                    <th key={day} className="py-2.5 px-2 text-center border-r border-b border-[#E7EAF0] font-mono min-w-[38px] text-[#7C8494]">
                      {day}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-center border-b border-[#E7EAF0] bg-[#EAF7F0] text-[#269B65] font-bold min-w-[70px]">
                    Davomat %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EAF0]">
                {groupStudents.length === 0 ? (
                  <tr>
                    <td colSpan={monthLessonDays.length + 2} className="py-8 text-center text-[#7C8494]">
                      O‘quvchilar mavjud emas
                    </td>
                  </tr>
                ) : (
                  groupStudents.map((std, sIdx) => {
                    return (
                      <tr key={std.id} className="hover:bg-[#F8F9FA] transition-colors">
                        <td className="py-2 px-3 border-r border-[#E7EAF0] font-semibold text-[#252936] sticky left-0 bg-white z-10 truncate max-w-[180px] shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                          {std.first_name} {std.last_name}
                        </td>

                        {monthLessonDays.map((day, dIdx) => {
                          const isCurrent = dIdx <= 6;
                          const isAbsent = (sIdx + dIdx) % 7 === 0;
                          const score = isAbsent ? null : (4 + ((sIdx + dIdx) % 2));

                          return (
                            <td
                              key={day}
                              className="py-1 px-1 text-center border-r border-[#E7EAF0] text-[11px] font-mono cursor-pointer hover:bg-[#F8F9FA]"
                              title={`${day}-sana davomati`}
                            >
                              {!isCurrent ? (
                                <span className="text-[#CBD3E1]">•</span>
                              ) : isAbsent ? (
                                <span className="w-5 h-5 rounded bg-[#FDEEEC] text-[#D94B4B] border border-[#D94B4B]/30 inline-flex items-center justify-center font-bold text-[10px]">
                                  ✗
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded bg-[#EAF7F0] text-[#269B65] border border-[#269B65]/30 inline-flex items-center justify-center font-bold text-[10px]">
                                  {score}
                                </span>
                              )}
                            </td>
                          );
                        })}

                        <td className="py-2 px-3 text-center font-bold text-[#269B65] bg-[#EAF7F0]/30">
                          {90 + (sIdx % 10)}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Telegram Message Preview Modal */}
      {previewTelegramModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E7EAF0] rounded-xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] border border-[#4169E1]/20 text-[#4169E1] flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#252936]">Telegram Xabarnoma Ko‘rinishi</h3>
                  <p className="text-[11px] text-[#7C8494]">Ota-ona botida quyidagicha aks etadi</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewTelegramModal(null)}
                className="text-[#7C8494] hover:text-[#252936] p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Telegram message balloon */}
            <div className="bg-[#F5F6F8] p-4 rounded-xl border border-[#E7EAF0] text-xs text-[#252936] space-y-2.5 font-sans leading-relaxed">
              <div className="flex items-center justify-between text-[#4169E1] font-bold border-b border-[#E7EAF0] pb-1.5">
                <span>🤖 EduOne Bot</span>
                <span className="text-[10px] text-[#7C8494]">{new Date().toLocaleTimeString().slice(0, 5)}</span>
              </div>
              <p>
                Assalomu alaykum! <strong>{previewTelegramModal.studentName}</strong> ning dars natijalari:
              </p>
              <div className="bg-white p-2.5 rounded-lg border border-[#E7EAF0] space-y-1">
                <p>📅 <strong>Sana:</strong> {selectedDate}</p>
                <p>📖 <strong>Guruh:</strong> {selectedGroup?.name}</p>
                <p>📝 <strong>Mavzu:</strong> {previewTelegramModal.topic}</p>
                <p>
                  ✅ <strong>Davomat:</strong>{' '}
                  <span className={previewTelegramModal.status === 'present' ? 'text-[#269B65] font-bold' : 'text-[#D94B4B] font-bold'}>
                    {previewTelegramModal.status === 'present' ? 'Keldi' : 'Kelmadi'}
                  </span>
                </p>
                <p>⭐ <strong>Kunlik baho:</strong> <span className="text-[#E5A12B] font-bold">{previewTelegramModal.score} / 5</span></p>
              </div>
              <p className="text-[10px] text-[#7C8494] italic">
                Ta’lim maskani ma’muriyati farzandingizning doimiy o‘sishini ta’minlaydi.
              </p>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                alert(`Xabar ${previewTelegramModal.phone} raqamiga Telegram orqali yuborildi!`);
                setPreviewTelegramModal(null);
              }}
            >
              Hozir yuborish
            </Button>
          </div>
        </div>
      )}

      {/* Virtual Turnstile & QR Attendance Scanner Modal */}
      <TurnstileScannerModal
        isOpen={turnstileModalOpen}
        onClose={() => setTurnstileModalOpen(false)}
        students={students}
        onMarkAttendance={(studentId, status) => {
          setAttendanceRecords((prev) => ({
            ...prev,
            [studentId]: {
              status,
              score: prev[studentId]?.score || 5,
              notes: 'Turniket orqali kirgan',
            },
          }));
        }}
      />
    </div>
  );
}
