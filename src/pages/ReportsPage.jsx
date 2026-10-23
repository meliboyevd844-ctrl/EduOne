import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { api } from '../lib/api';
import { formatUZS } from '../lib/utils';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  CreditCard,
  Download,
  Calendar,
  PieChart,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  Building2,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';

export function ReportsPage() {
  const [activeOrg, setActiveOrg] = useState(null);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const orgId = activeOrg?.id || 'default';

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('eduone_impersonating_org');
      if (raw) setActiveOrg(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    async function loadAll() {
      const [stds, grps, tchs, pmts, exps] = await Promise.all([
        api.getStudents(orgId),
        api.getGroups(orgId),
        api.getTeachers(orgId),
        api.getStudentPayments(orgId),
        api.getExpenses(orgId),
      ]);
      setStudents(stds);
      setGroups(grps);
      setTeachers(tchs);
      setPayments(pmts);
      setExpenses(exps);
    }
    loadAll();
  }, [activeOrg]);

  // Moliyaviy hisoblar
  const totalRevenue = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalDebt = students.reduce((acc, s) => (s.balance < 0 ? acc + Math.abs(s.balance) : acc), 0);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Hisobot,Qiymat\n" +
      `Jami Tushum,${totalRevenue}\n` +
      `Xarajatlar,${totalExpenses}\n` +
      `Sof Foyda,${netProfit}\n` +
      `Qarzdorlik,${totalDebt}\n` +
      `O'quvchilar Soni,${students.length}\n` +
      `Guruhlar Soni,${groups.length}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EduOne_Hisobot_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Bosh sahifa', href: '/' }, { label: 'Tahliliy Hisobotlar' }]} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252936] flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-[#4169E1]" />
            Tahliliy Hisobotlar & Moliya Dinamikasi
          </h1>
          <p className="text-xs text-[#7C8494] mt-1">
            O‘quvchilar oqimi, guruhlar to‘laligi, sof foyda va o‘qituvchilar samaradorligi tahlili
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Period filter */}
          <div className="p-1 rounded-lg bg-[#F5F6F8] border border-[#E7EAF0] flex items-center gap-1">
            <button
              onClick={() => setSelectedPeriod('monthly')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                selectedPeriod === 'monthly' ? 'bg-white text-[#252936] shadow-xs' : 'text-[#7C8494] hover:text-[#252936]'
              )}
            >
              Joriy Oy
            </button>
            <button
              onClick={() => setSelectedPeriod('quarterly')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                selectedPeriod === 'quarterly' ? 'bg-white text-[#252936] shadow-xs' : 'text-[#7C8494] hover:text-[#252936]'
              )}
            >
              Chorak
            </button>
            <button
              onClick={() => setSelectedPeriod('annual')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                selectedPeriod === 'annual' ? 'bg-white text-[#252936] shadow-xs' : 'text-[#7C8494] hover:text-[#252936]'
              )}
            >
              Yillik
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={FileSpreadsheet}
            onClick={handleExportCSV}
          >
            Excel (CSV) Eksport
          </Button>
        </div>
      </div>

      {/* 4 Financial & Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tushum */}
        <Card className="p-4 bg-white border-[#E7EAF0]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#7C8494] font-medium">Jami Tushum</p>
            <div className="w-8 h-8 rounded-lg bg-[#EAF7F0] text-[#269B65] flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-[#252936] font-mono mt-2">{formatUZS(totalRevenue)}</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-[#269B65]">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{payments.length} ta muvaffaqiyatli to‘lov</span>
          </div>
        </Card>

        {/* Xarajatlar */}
        <Card className="p-4 bg-white border-[#E7EAF0]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#7C8494] font-medium">Xarajatlar</p>
            <div className="w-8 h-8 rounded-lg bg-[#FDEEEC] text-[#D94B4B] flex items-center justify-center font-bold">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-[#252936] font-mono mt-2">{formatUZS(totalExpenses)}</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-[#D94B4B]">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Ijara, kommunal, oyliklar</span>
          </div>
        </Card>

        {/* Sof Foyda */}
        <Card className="p-4 bg-white border-[#E7EAF0]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#7C8494] font-medium">Sof Foyda</p>
            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4169E1] flex items-center justify-center font-bold">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <p className={cn('text-xl font-bold font-mono mt-2', netProfit >= 0 ? 'text-[#269B65]' : 'text-[#D94B4B]')}>
            {formatUZS(netProfit)}
          </p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-[#7C8494]">
            <span>Rentabellik ko‘rsatkichi</span>
          </div>
        </Card>

        {/* Qarzdorlik */}
        <Card className="p-4 bg-white border-[#E7EAF0]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#7C8494] font-medium">Kutilayotgan Qarzdorlik</p>
            <div className="w-8 h-8 rounded-lg bg-[#FDF6E9] text-[#E5A12B] flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-[#E5A12B] font-mono mt-2">{formatUZS(totalDebt)}</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-[#7C8494]">
            <span>{students.filter(s => (s.balance || 0) < 0).length} nafar o‘quvchida qarz</span>
          </div>
        </Card>
      </div>

      {/* 2-Grid: O'quvchilar Retention & Guruhlar To'laligi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention & Churn Analysis */}
        <Card className="p-5 bg-white border-[#E7EAF0] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4169E1] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#252936]">O‘quvchilar Oqimi Tahlili</h3>
                <p className="text-[11px] text-[#7C8494]">Yangi qabul qilingan va saqlab qolingan talabalar</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-[#EAF7F0] text-[#269B65] font-semibold border border-[#269B65]/30">
              96% Retention
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#7C8494]">Faol ta’lim olayotganlar</span>
                <span className="text-[#252936] font-semibold">{students.filter(s => s.status === 'active').length} nafar ({students.length > 0 ? '90%' : '0%'})</span>
              </div>
              <div className="h-2 rounded-full bg-[#F5F6F8] overflow-hidden">
                <div className="h-full bg-[#269B65] rounded-full" style={{ width: '90%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#7C8494]">Sinov darsidagi yangi o‘quvchilar</span>
                <span className="text-[#252936] font-semibold">{students.filter(s => s.status === 'trial').length} nafar (10%)</span>
              </div>
              <div className="h-2 rounded-full bg-[#F5F6F8] overflow-hidden">
                <div className="h-full bg-[#E5A12B] rounded-full" style={{ width: '10%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#7C8494]">Muzlatilgan (Akademik ta’til)</span>
                <span className="text-[#252936] font-semibold">{students.filter(s => s.status === 'frozen').length} nafar (0%)</span>
              </div>
              <div className="h-2 rounded-full bg-[#F5F6F8] overflow-hidden">
                <div className="h-full bg-[#4169E1] rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#F5F6F8] border border-[#E7EAF0] text-xs text-[#7C8494] flex items-center justify-between">
            <span>Markazga yangi kelgan lidlarning o‘quvchiga aylanish konversiyasi:</span>
            <strong className="text-[#269B65] font-bold">68.4%</strong>
          </div>
        </Card>

        {/* Guruhlar To'laligi va Rentabelligi */}
        <Card className="p-5 bg-white border-[#E7EAF0] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4169E1] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#252936]">Guruhlar Sig‘imi & Rentabelligi</h3>
                <p className="text-[11px] text-[#7C8494]">Auditoriyalar bandligi va to‘lalik ko‘rsatkichi</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-[#EEF2FF] text-[#4169E1] font-semibold border border-[#4169E1]/20">
              {groups.length} ta Guruh
            </span>
          </div>

          <div className="divide-y divide-[#E7EAF0]">
            {groups.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#7C8494]">
                Guruhlar mavjud emas
              </div>
            ) : (
              groups.map((g) => {
                const groupStdCount = students.filter(s => s.group_id === g.id || s.group_name === g.name).length;
                const percent = Math.min(100, Math.round((groupStdCount / (g.max_students || 15)) * 100));

                return (
                  <div key={g.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-[#252936]">{g.name}</p>
                      <p className="text-[10px] text-[#7C8494]">{g.teacher_name} • {g.room}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-mono font-bold text-[#252936]">{groupStdCount} / {g.max_students || 15} o‘rin ({percent}%)</p>
                      <span className="text-[10px] text-[#269B65] font-mono font-semibold">{(groupStdCount * (g.price || 600000)).toLocaleString()} so‘m/oy</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* 3-Section: O'qituvchilar Samaradorligi Jadvali */}
      <Card className="overflow-hidden bg-white border-[#E7EAF0]">
        <div className="p-4 bg-[#F8F9FA] border-b border-[#E7EAF0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#4169E1]" />
            <h3 className="text-sm font-bold text-[#252936]">O‘qituvchilar Reytingi & Samaradorligi</h3>
          </div>
          <span className="text-xs text-[#7C8494]">KPI monitoring</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] text-[#7C8494] uppercase font-semibold text-[10px] border-b border-[#E7EAF0]">
              <tr>
                <th className="py-3 px-4">O‘qituvchi</th>
                <th className="py-3 px-4">Fan</th>
                <th className="py-3 px-4">Guruhlar</th>
                <th className="py-3 px-4">O‘quvchilar</th>
                <th className="py-3 px-4">O‘rtacha Davomat</th>
                <th className="py-3 px-4 text-right">Kutilayotgan Oylik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#7C8494]">
                    O‘qituvchilar mavjud emas
                  </td>
                </tr>
              ) : (
                teachers.map((t) => {
                  const teacherGroups = groups.filter(g => g.teacher_name === t.full_name || g.teacher_id === t.id);
                  const teacherStudents = students.filter(s => teacherGroups.some(g => g.id === s.group_id || g.name === s.group_name));

                  return (
                    <tr key={t.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#252936]">
                        {t.full_name}
                      </td>
                      <td className="py-3.5 px-4 text-[#7C8494]">
                        {t.subject}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#252936]">
                        {teacherGroups.length} ta
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#269B65]">
                        {teacherStudents.length} nafar
                      </td>
                      <td className="py-3.5 px-4 text-[#269B65] font-bold">
                        94.8%
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#252936]">
                        {t.salary_type === 'percentage'
                          ? `${t.salary_rate || 40}% (ulush)`
                          : `${(5000000).toLocaleString()} so‘m`}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
