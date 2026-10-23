import React, { useState, useEffect } from 'react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { PageHeader } from '../components/common/PageHeader';
import { api } from '../lib/api';
import { formatUZS } from '../lib/utils';
import {
  Plus,
  Building2,
  GraduationCap,
  Users,
  CreditCard,
  UserPlus,
  Coins,
  CheckCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const [currentOrg, setCurrentOrg] = useState(null);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [leads, setLeads] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('eduone_impersonating_org');
      if (raw) {
        setCurrentOrg(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const orgId = currentOrg?.id || 'default';

  useEffect(() => {
    async function loadData() {
      const [stds, grps, lds, pmts] = await Promise.all([
        api.getStudents(orgId),
        api.getGroups(orgId),
        api.getLeads(orgId),
        api.getStudentPayments(orgId),
      ]);
      setStudents(stds || []);
      setGroups(grps || []);
      setLeads(lds || []);
      setPayments(pmts || []);
    }
    loadData();
  }, [currentOrg]);

  const orgName = currentOrg?.name || 'EduOne O‘quv Markazi';
  const ownerName = currentOrg?.ownerName || 'Markaz Rahbari';
  const studentsCount = students.length;
  const groupsCount = groups.length;
  const totalIncome = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalDebt = students.reduce((acc, s) => (s.balance < 0 ? acc + Math.abs(s.balance) : acc), 0);

  // Real database-backed metrics
  const dynamicMetrics = [
    {
      id: 'students',
      title: 'Jami o‘quvchilar',
      value: studentsCount.toLocaleString(),
      change: studentsCount > 0 ? `${studentsCount} ta faol` : '0',
      isPositive: true,
      comparison: 'joriy holat',
      subText: `${studentsCount} faol o‘quvchi ro‘yxatda`,
      icon: 'GraduationCap',
    },
    {
      id: 'groups',
      title: 'Faol guruhlar',
      value: groupsCount.toString(),
      change: groupsCount > 0 ? `${groupsCount} ta guruh` : '0',
      isPositive: true,
      comparison: 'dars jadvali bo‘yicha',
      subText: groupsCount > 0 ? 'Guruhlar faol' : 'Hozircha guruh ochilmagan',
      icon: 'Users',
    },
    {
      id: 'revenue',
      title: 'Oylik Tushum',
      value: formatUZS(totalIncome),
      change: payments.length > 0 ? `${payments.length} to‘lov` : '0',
      isPositive: true,
      comparison: 'kassa tushumi',
      subText: 'O‘quvchilar to‘lovlari',
      icon: 'Coins',
    },
    {
      id: 'debt',
      title: 'Kutilayotgan Qarzlar',
      value: formatUZS(totalDebt),
      change: totalDebt > 0 ? 'Qarzdorlik bor' : '0 so‘m',
      isPositive: totalDebt === 0,
      comparison: 'o‘quvchilar badali',
      subText: totalDebt > 0 ? 'Eslatma yuborish lozim' : 'Qarzdorlik mavjud emas',
      icon: 'CreditCard',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={`${orgName} — Boshqaruv Paneli`}
        description={`Xush kelibsiz, ${ownerName}. ${
          studentsCount === 0
            ? 'Yangi ochilgan markazda hozircha talabalar mavjud emas. Quyidagi amallardan boshlang.'
            : `Markazda ${groupsCount} ta guruh, ${studentsCount} nafar o‘quvchi va ${leads.length} ta lid mavjud.`
        }`}
        breadcrumbs={[
          { label: 'Markaz', to: '/' },
          { label: 'Boshqaruv paneli' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Link to="/attendance">
              <Button variant="outline" size="sm" icon={CheckCheck} className="text-xs h-8">
                Davomat qilish
              </Button>
            </Link>

            <Link to="/leads">
              <Button variant="outline" size="sm" icon={UserPlus} className="text-xs h-8">
                + Yangi Lid
              </Button>
            </Link>

            <Link to="/groups">
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                className="text-xs h-8 bg-[#4169E1] hover:bg-[#3557C7]"
              >
                Guruh ochish
              </Button>
            </Link>
          </div>
        }
      />

      {/* 4 Primary Metric Cards */}
      <section aria-label="Asosiy ko‘rsatkichlar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dynamicMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      {/* Modme CRM Quick Links Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/leads"
          className="p-3.5 rounded-lg bg-white border border-[#E7EAF0] shadow-sm hover:border-[#CBD1DC] transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#EEF2FF] text-[#4169E1] border border-[#C7D2FE] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#252936] group-hover:text-[#4169E1] transition-colors">Lidlar CRM</p>
              <p className="text-[10px] text-[#7C8494]">{leads.length} ta so‘rov</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#7C8494] group-hover:text-[#4169E1] transition-all" />
        </Link>

        <Link
          to="/students"
          className="p-3.5 rounded-lg bg-white border border-[#E7EAF0] shadow-sm hover:border-[#CBD1DC] transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#EAF7F0] text-[#269B65] border border-[#C2EAD5] flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#252936] group-hover:text-[#269B65] transition-colors">O‘quvchilar</p>
              <p className="text-[10px] text-[#7C8494]">{studentsCount} nafar talaba</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#7C8494] group-hover:text-[#269B65] transition-all" />
        </Link>

        <Link
          to="/finance"
          className="p-3.5 rounded-lg bg-white border border-[#E7EAF0] shadow-sm hover:border-[#CBD1DC] transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#FDF6E9] text-[#E5A12B] border border-[#F9DFAC] flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#252936] group-hover:text-[#E5A12B] transition-colors">Moliya & Kassa</p>
              <p className="text-[10px] text-[#7C8494]">{payments.length} ta to‘lov</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#7C8494] group-hover:text-[#E5A12B] transition-all" />
        </Link>

        <Link
          to="/gamification"
          className="p-3.5 rounded-lg bg-white border border-[#E7EAF0] shadow-sm hover:border-[#CBD1DC] transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#EEF2FF] text-[#4169E1] border border-[#C7D2FE] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#252936] group-hover:text-[#4169E1] transition-colors">Koinlar do‘koni</p>
              <p className="text-[10px] text-[#7C8494]">Gamifikatsiya</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#7C8494] group-hover:text-[#4169E1] transition-all" />
        </Link>
      </div>

      {/* Initial State if Empty */}
      {studentsCount === 0 && (
        <div className="p-8 rounded-lg bg-white border border-[#E7EAF0] text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] text-[#4169E1] flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#252936]">Yangi o‘quv markazi ishga tushirildi!</h3>
          <p className="text-xs text-[#7C8494] max-w-md mx-auto leading-relaxed">
            EduOne tizimida sizning markazingiz uchun barcha asosiy modullar (Lidlar, O‘quvchilar, Guruhlar, Davomat, Moliya 6-rejimi, Koinlar do‘koni va Hisobotlar) faollashtirildi.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <Link to="/groups">
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                className="bg-[#4169E1] hover:bg-[#3557C7]"
              >
                Birinchi guruhni ochish
              </Button>
            </Link>
            <Link to="/students">
              <Button
                variant="outline"
                size="sm"
                icon={Users}
              >
                O‘quvchilarni kiritish
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
