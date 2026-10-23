import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { api } from '../lib/api';
import { formatUZS, formatUzbekPhone } from '../lib/utils';
import {
  GraduationCap,
  Plus,
  Search,
  Phone,
  Coins,
  CreditCard,
  Trash2,
  Filter,
  UserCheck,
  AlertTriangle,
  Award,
  Calendar,
  X,
  Building2,
  Users,
  Eye,
  Send,
  Snowflake,
  Clock,
  BookOpen,
  Bell,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';

export function StudentsPage() {
  const [activeOrg, setActiveOrg] = useState(null);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');

  // Modallar
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [paymentModalStudent, setPaymentModalStudent] = useState(null);
  const [coinModalStudent, setCoinModalStudent] = useState(null);
  const [profileModalStudent, setProfileModalStudent] = useState(null);
  const [debtReminderModal, setDebtReminderModal] = useState(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderChannel, setReminderChannel] = useState('all');

  // Formalar
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '+998 ',
    parentName: '',
    parentPhone: '+998 ',
    groupId: '',
    groupName: '',
    monthlyFee: 600000,
    paymentType: 'monthly',
  });

  const [paymentData, setPaymentData] = useState({
    amount: 600000,
    paymentMethod: 'cash',
    notes: '',
  });

  const [coinAmount, setCoinAmount] = useState(15);
  const [coinReason, setCoinReason] = useState('Uyga vazifani a’lo bajargani uchun');

  const orgId = activeOrg?.id || 'default';

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('eduone_impersonating_org');
      if (raw) setActiveOrg(JSON.parse(raw));
    } catch {}
  }, []);

  const loadData = async () => {
    const [stds, grps] = await Promise.all([
      api.getStudents(orgId),
      api.getGroups(orgId),
    ]);
    setStudents(stds);
    setGroups(grps);
  };

  useEffect(() => {
    loadData();
  }, [activeOrg]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.phone.trim()) return;

    const selectedGroup = groups.find((g) => g.id === formData.groupId);
    await api.createStudent(orgId, {
      ...formData,
      groupName: selectedGroup?.name || formData.groupName || 'Biriktirilmagan',
      balance: 0,
      coins: 10,
    });

    setFormData({
      firstName: '',
      lastName: '',
      phone: '+998 ',
      parentName: '',
      parentPhone: '+998 ',
      groupId: '',
      groupName: '',
      monthlyFee: 600000,
      paymentType: 'monthly',
    });
    setCreateModalOpen(false);
    loadData();
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Haqiqatan ham "${name}" o‘quvchisini o‘chirmoqchimisiz?`)) {
      await api.deleteStudent(orgId, id);
      loadData();
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentModalStudent) return;

    await api.recordStudentPayment(orgId, {
      studentId: paymentModalStudent.id,
      studentName: `${paymentModalStudent.first_name} ${paymentModalStudent.last_name}`,
      amount: Number(paymentData.amount),
      paymentMethod: paymentData.paymentMethod,
      notes: paymentData.notes,
    });

    setPaymentModalStudent(null);
    alert("To‘lov muvaffaqiyatli qabul qilindi!");
    loadData();
  };

  const handleAwardCoins = async (e) => {
    e.preventDefault();
    if (!coinModalStudent) return;

    await api.awardStudentCoins(orgId, coinModalStudent.id, coinAmount, coinReason);
    setCoinModalStudent(null);
    alert(`${coinModalStudent.first_name} ga +${coinAmount} koin taqdirlandi!`);
    loadData();
  };

  const handleToggleFreeze = async (stdId) => {
    await api.toggleFreezeStudent(orgId, stdId);
    loadData();
    if (profileModalStudent && profileModalStudent.id === stdId) {
      setProfileModalStudent((prev) => ({
        ...prev,
        status: prev.status === 'frozen' ? 'active' : 'frozen',
      }));
    }
  };

  const handleSendReminder = async (e) => {
    e.preventDefault();
    if (!debtReminderModal) return;
    const debtSum = Math.abs(debtReminderModal.balance || 0).toLocaleString();
    const message = reminderMessage || `Hurmatli ota-ona! Farzandingiz ${debtReminderModal.first_name} ning to‘lov qarzdorligi ${debtSum} so‘m. Iltimos o‘z vaqtida to‘lang.`;

    await api.sendStudentNotification(orgId, debtReminderModal.id, {
      type: 'debt',
      channel: reminderChannel,
      message,
    });
    alert(`Qarz eslatmasi ${debtReminderModal.parent_phone || debtReminderModal.phone} raqamiga muvaffaqiyatli yuborildi!`);
    setDebtReminderModal(null);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone || '').includes(search) ||
      (s.parent_phone || '').includes(search);

    const isDebtor = (s.balance || 0) < 0;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'debtor' ? isDebtor : s.status === filterStatus);

    const matchesGroup = filterGroup === 'all' || s.group_name === filterGroup;

    return matchesSearch && matchesStatus && matchesGroup;
  });

  const totalStudents = students.length;
  const debtorsCount = students.filter((s) => (s.balance || 0) < 0).length;
  const totalCoins = students.reduce((acc, s) => acc + (s.coins || 0), 0);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Bosh sahifa', href: '/' }, { label: 'O‘quvchilar' }]} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252936] flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-[#4169E1]" />
            O‘quvchilar Boshqaruvi
          </h1>
          <p className="text-xs text-[#7C8494] mt-1">
            Talabalar yagona reyestri, to‘lov intizomi, guruhlar va koinlar balansi
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setCreateModalOpen(true)}
        >
          Yangi O‘quvchi Qo‘shish
        </Button>
      </div>

      {/* Top Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between bg-white border-[#E7EAF0]">
          <div>
            <p className="text-xs font-medium text-[#7C8494]">Jami o‘quvchilar</p>
            <p className="text-xl font-bold text-[#252936] mt-1">{totalStudents} ta</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] text-[#4169E1] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between bg-white border-[#E7EAF0]">
          <div>
            <p className="text-xs font-medium text-[#7C8494]">Faol o‘quvchilar</p>
            <p className="text-xl font-bold text-[#269B65] mt-1">
              {students.filter((s) => s.status === 'active').length} ta
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#EAF7F0] text-[#269B65] flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between bg-white border-[#E7EAF0]">
          <div>
            <p className="text-xs font-medium text-[#7C8494]">Qarzdor o‘quvchilar</p>
            <p className="text-xl font-bold text-[#D94B4B] mt-1">{debtorsCount} ta</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#FDEEEC] text-[#D94B4B] flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between bg-white border-[#E7EAF0]">
          <div>
            <p className="text-xs font-medium text-[#7C8494]">Koinlar aylanmasi</p>
            <p className="text-xl font-bold text-[#E5A12B] mt-1">{totalCoins.toLocaleString()} 🪙</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#FDF6E9] text-[#E5A12B] flex items-center justify-center font-bold">
            <Coins className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 flex items-center gap-2.5 w-full bg-white border border-[#E7EAF0] px-3.5 py-2.5 rounded-lg shadow-xs">
          <Search className="w-4 h-4 text-[#7C8494]" />
          <input
            type="text"
            placeholder="O‘quvchi ismi, familiyasi yoki telefoni bo‘yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-[#252936] placeholder:text-[#7C8494]/60 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white text-[#252936] text-xs font-medium rounded-lg px-3 py-2.5 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none shadow-xs"
          >
            <option value="all">Barcha statuslar</option>
            <option value="active">Faol</option>
            <option value="debtor">Qarzdorlar</option>
            <option value="trial">Sinov darsida</option>
            <option value="frozen">Muzlatilgan (Ta’tilda)</option>
            <option value="archived">Arxiv</option>
          </select>

          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="bg-white text-[#252936] text-xs font-medium rounded-lg px-3 py-2.5 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none shadow-xs"
          >
            <option value="all">Barcha guruhlar</option>
            {groups.map((g) => (
              <option key={g.id} value={g.name}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <Card className="overflow-hidden border-[#E7EAF0] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] text-[#7C8494] uppercase font-semibold text-[11px] border-b border-[#E7EAF0]">
              <tr>
                <th className="py-3 px-4">O‘quvchi</th>
                <th className="py-3 px-4">Telefon</th>
                <th className="py-3 px-4">Guruh</th>
                <th className="py-3 px-4">Balans / Qarz</th>
                <th className="py-3 px-4 text-center">Koinlar</th>
                <th className="py-3 px-4">Holati</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#7C8494]">
                    <GraduationCap className="w-10 h-10 mx-auto text-[#7C8494]/40 mb-2" />
                    Hozircha o‘quvchilar mavjud emas. Yangi o‘quvchi qo‘shing.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
                  const isDebtor = (std.balance || 0) < 0;
                  const isFrozen = std.status === 'frozen';
                  return (
                    <tr key={std.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-3 px-4">
                        <div
                          className="flex items-center gap-2.5 cursor-pointer group"
                          onClick={() => setProfileModalStudent(std)}
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4169E1] font-bold flex items-center justify-center text-xs group-hover:bg-[#4169E1] group-hover:text-white transition-colors">
                            {std.first_name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-[#252936] group-hover:text-[#4169E1] transition-colors flex items-center gap-1.5">
                              <span>{std.first_name} {std.last_name}</span>
                              {isFrozen && <Snowflake className="w-3.5 h-3.5 text-[#4169E1]" />}
                            </p>
                            {std.parent_name && (
                              <p className="text-[10px] text-[#7C8494]">Ota-onasi: {std.parent_name}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#7C8494] font-mono">
                        {std.phone}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-[#F5F6F8] text-[#252936] border border-[#E7EAF0] font-medium text-xs">
                          {std.group_name}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className={cn('font-bold', isDebtor ? 'text-[#D94B4B]' : 'text-[#269B65]')}>
                          {std.balance ? `${std.balance.toLocaleString()} so'm` : '0 so‘m'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#E5A12B] bg-[#FDF6E9] border border-[#E5A12B]/30 px-2 py-0.5 rounded-full text-xs">
                          🪙 {std.coins || 0}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant={isFrozen ? 'primary' : isDebtor ? 'destructive' : std.status === 'active' ? 'success' : 'primary'}
                          size="sm"
                          dot
                        >
                          {isFrozen ? 'Muzlatilgan' : isDebtor ? 'Qarzdor' : std.status === 'active' ? 'Faol' : 'Sinov'}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* O'quvchi profili (360 Card) */}
                          <button
                            onClick={() => setProfileModalStudent(std)}
                            className="p-1.5 rounded-md text-[#7C8494] hover:text-[#252936] hover:bg-[#F5F6F8] transition-colors border border-[#E7EAF0]"
                            title="O‘quvchi profili"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Qarz Eslatmasi (SMS & Telegram) */}
                          {isDebtor && (
                            <button
                              onClick={() => {
                                setDebtReminderModal(std);
                                setReminderMessage(`Hurmatli ota-ona! Farzandingiz ${std.first_name} ning EduOne markazidagi to‘lov qarzdorligi ${Math.abs(std.balance || 0).toLocaleString()} so‘m. Iltimos o‘z vaqtida to‘lovni amalga oshiring.`);
                              }}
                              className="p-1.5 rounded-md text-[#D94B4B] bg-[#FDEEEC] hover:bg-[#FCD8D4] transition-colors border border-[#D94B4B]/30"
                              title="Qarz eslatmasini SMS / Telegram orqali yuborish"
                            >
                              <Bell className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* To'lov Qabul Qilish */}
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={CreditCard}
                            onClick={() => setPaymentModalStudent(std)}
                            className="text-[11px] py-1 border-[#E7EAF0] text-[#269B65] hover:bg-[#EAF7F0]"
                            title="To‘lov kiritish"
                          >
                            To‘lov
                          </Button>

                          {/* Koin Berish */}
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Award}
                            onClick={() => setCoinModalStudent(std)}
                            className="text-[11px] py-1 border-[#E7EAF0] text-[#E5A12B] hover:bg-[#FDF6E9]"
                            title="Koin taqdirlash"
                          >
                            +Koin
                          </Button>

                          {/* O'chirish */}
                          <button
                            onClick={() => handleDelete(std.id, `${std.first_name} ${std.last_name}`)}
                            className="p-1.5 rounded text-[#7C8494] hover:text-[#D94B4B] hover:bg-[#FDEEEC] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal 1: Yangi O'quvchi Qo'shish */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-[#E7EAF0] rounded-xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#E7EAF0] flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4169E1] flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#252936]">Yangi O‘quvchi Ro‘yxatga Olish</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-[#7C8494] hover:text-[#252936]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7C8494] mb-1">Ismi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Sardor"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7C8494] mb-1">Familiyasi</label>
                  <input
                    type="text"
                    placeholder="Aliyev"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7C8494] mb-1">Telefon raqami *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+998 90 123 45 67"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatUzbekPhone(e.target.value) })}
                    className="w-full bg-white dark:bg-[#141A26] text-[#252936] dark:text-white text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] dark:border-white/10 focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7C8494] mb-1">Ota-onasi telefoni</label>
                  <input
                    type="tel"
                    placeholder="+998 90 765 43 21"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: formatUzbekPhone(e.target.value) })}
                    className="w-full bg-white dark:bg-[#141A26] text-[#252936] dark:text-white text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] dark:border-white/10 focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">Guruhga biriktirish</label>
                <select
                  value={formData.groupId}
                  onChange={(e) => {
                    const selectedG = groups.find((g) => g.id === e.target.value);
                    setFormData({
                      ...formData,
                      groupId: e.target.value,
                      groupName: selectedG?.name || '',
                      monthlyFee: selectedG?.price || formData.monthlyFee,
                    });
                  }}
                  className="w-full bg-white dark:bg-[#141A26] text-[#252936] dark:text-white text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] dark:border-white/10 focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none font-medium"
                >
                  <option value="">Guruh tanlang...</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} — Ustoz: {g.teacher_name || 'Ustoz'} ({g.schedule_days || 'Dars kunlari'} • {g.schedule_time})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7C8494] mb-1">Oylik to‘lov (so‘m)</label>
                  <input
                    type="number"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                    className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7C8494] mb-1">To‘lov rejimi</label>
                  <select
                    value={formData.paymentType}
                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                    className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none"
                  >
                    <option value="monthly">Oylik (Kalendar)</option>
                    <option value="daily">Kunlik darsbay</option>
                    <option value="module">Modul bo‘yicha</option>
                    <option value="full">Butun kurs uchun</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF0]">
                <Button variant="secondary" size="sm" onClick={() => setCreateModalOpen(false)}>
                  Bekor qilish
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  O‘quvchini Saqlash
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: To'lov Qabul Qilish */}
      {paymentModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-[#E7EAF0] rounded-xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#E7EAF0] flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#269B65]" />
                <h3 className="text-sm font-bold text-[#252936]">
                  To‘lov Kiritish: {paymentModalStudent.first_name} {paymentModalStudent.last_name}
                </h3>
              </div>
              <button onClick={() => setPaymentModalStudent(null)} className="text-[#7C8494] hover:text-[#252936]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">To‘lov summasi (so‘m)</label>
                <input
                  type="number"
                  required
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full bg-white text-[#252936] text-base font-bold rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">To‘lov turi</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none"
                >
                  <option value="cash">Naqd pul</option>
                  <option value="card">Plastik karta (Terminal)</option>
                  <option value="payme">Payme</option>
                  <option value="click">Click</option>
                  <option value="uzum">Uzum Bank</option>
                  <option value="bank">Bank o‘tkazmasi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">Izoh / Kvitansiya</label>
                <input
                  type="text"
                  placeholder="Masalan: Oktyabr oyi to‘lovi"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF0]">
                <Button variant="secondary" size="sm" onClick={() => setPaymentModalStudent(null)}>
                  Bekor qilish
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  To‘lovni Tasdiqlash
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Koin Taqdirlash (Gamification) */}
      {coinModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-[#E7EAF0] rounded-xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#E7EAF0] flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#E5A12B]" />
                <h3 className="text-sm font-bold text-[#252936]">
                  Koin Taqdim Etish: {coinModalStudent.first_name}
                </h3>
              </div>
              <button onClick={() => setCoinModalStudent(null)} className="text-[#7C8494] hover:text-[#252936]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAwardCoins} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">Koin miqdori 🪙</label>
                <div className="flex items-center gap-2">
                  {[10, 15, 25, 50].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCoinAmount(amt)}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-xs font-bold transition-all border',
                        coinAmount === amt
                          ? 'bg-[#FDF6E9] text-[#E5A12B] border-[#E5A12B]/50'
                          : 'bg-[#F5F6F8] text-[#7C8494] border-[#E7EAF0] hover:bg-white'
                      )}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">Taqdirlash sababi</label>
                <select
                  value={coinReason}
                  onChange={(e) => setCoinReason(e.target.value)}
                  className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none"
                >
                  <option value="Uyga vazifani a’lo bajargani uchun">Uyga vazifani a’lo bajargani uchun (+10)</option>
                  <option value="Testdan 90%+ olgani uchun">Testdan 90%+ olgani uchun (+25)</option>
                  <option value="100% namunali davomati uchun">100% namunali davomati uchun (+15)</option>
                  <option value="Qo‘shimcha faollik va yordam uchun">Qo‘shimcha faollik va yordam uchun (+10)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF0]">
                <Button variant="secondary" size="sm" onClick={() => setCoinModalStudent(null)}>
                  Bekor qilish
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Koinni Berish
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: O‘quvchi 360 Profili (Modme Student Profile Card) */}
      {profileModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white border border-[#E7EAF0] rounded-xl shadow-xl overflow-hidden space-y-4 p-6">
            <div className="flex items-start justify-between pb-3 border-b border-[#E7EAF0]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] border border-[#4169E1]/20 text-[#4169E1] font-bold flex items-center justify-center text-lg">
                  {profileModalStudent.first_name[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#252936] flex items-center gap-2">
                    {profileModalStudent.first_name} {profileModalStudent.last_name}
                    <Badge variant={profileModalStudent.status === 'frozen' ? 'primary' : (profileModalStudent.balance || 0) < 0 ? 'destructive' : 'success'} size="sm" dot>
                      {profileModalStudent.status === 'frozen' ? 'Muzlatilgan' : (profileModalStudent.balance || 0) < 0 ? 'Qarzdor' : 'Faol'}
                    </Badge>
                  </h3>
                  <p className="text-xs text-[#7C8494]">
                    📞 {profileModalStudent.phone} • A’zo bo‘lgan: {profileModalStudent.enrolled_date || '2026-10-01'}
                  </p>
                </div>
              </div>
              <button onClick={() => setProfileModalStudent(null)} className="text-[#7C8494] hover:text-[#252936] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Metric Cards in Profile */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-[#F5F6F8] border border-[#E7EAF0]">
                <p className="text-[11px] text-[#7C8494]">Balans / Qarz</p>
                <p className={cn('text-sm font-bold font-mono mt-0.5', (profileModalStudent.balance || 0) < 0 ? 'text-[#D94B4B]' : 'text-[#269B65]')}>
                  {profileModalStudent.balance ? `${profileModalStudent.balance.toLocaleString()} so'm` : '0 so‘m'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F5F6F8] border border-[#E7EAF0]">
                <p className="text-[11px] text-[#7C8494]">Koinlar hisobi</p>
                <p className="text-sm font-bold text-[#E5A12B] mt-0.5">
                  🪙 {profileModalStudent.coins || 0}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F5F6F8] border border-[#E7EAF0]">
                <p className="text-[11px] text-[#7C8494]">Davomat foizi</p>
                <p className="text-sm font-bold text-[#269B65] mt-0.5">
                  95% (Namunali)
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F5F6F8] border border-[#E7EAF0]">
                <p className="text-[11px] text-[#7C8494]">Oylik to‘lov badali</p>
                <p className="text-sm font-bold text-[#252936] font-mono mt-0.5">
                  {(profileModalStudent.monthly_fee || 600000).toLocaleString()} so‘m
                </p>
              </div>
            </div>

            {/* Ota-ona & Guruh ma'lumotlari */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F5F6F8] p-4 rounded-xl border border-[#E7EAF0]">
              <div className="space-y-1.5">
                <p className="text-[#7C8494] uppercase tracking-wider text-[10px] font-semibold">Oila va Aloqa</p>
                <p className="text-[#252936]"><strong>Ota-onasi:</strong> {profileModalStudent.parent_name || 'Kiritilmagan'}</p>
                <p className="text-[#252936]"><strong>Ota-onasi tel:</strong> {profileModalStudent.parent_phone || 'Kiritilmagan'}</p>
                <p className="text-[#4169E1]"><strong>Telegram bot:</strong> Ulangan (Bildirishnomalar ochiq)</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[#7C8494] uppercase tracking-wider text-[10px] font-semibold">O‘quv kursi va guruh</p>
                <p className="text-[#252936]"><strong>Guruhi:</strong> {profileModalStudent.group_name || 'Biriktirilmagan'}</p>
                <p className="text-[#252936]"><strong>To‘lov shakli:</strong> Oylik doimiy to‘lov</p>
                <p className="text-[#269B65]"><strong>Imtihon ko‘rsatkichi:</strong> 92 / 100 ball</p>
              </div>
            </div>

            {/* Quick Actions in Profile */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#E7EAF0]">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Snowflake}
                  onClick={() => handleToggleFreeze(profileModalStudent.id)}
                  className="text-[#4169E1] border-[#E7EAF0] hover:bg-[#EEF2FF]"
                >
                  {profileModalStudent.status === 'frozen' ? "Faollashtirish" : "Muzlatish (Ta’til)"}
                </Button>

                {(profileModalStudent.balance || 0) < 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Bell}
                    onClick={() => {
                      setDebtReminderModal(profileModalStudent);
                      setReminderMessage(`Hurmatli ota-ona! Farzandingiz ${profileModalStudent.first_name} ning to‘lov qarzdorligi ${Math.abs(profileModalStudent.balance || 0).toLocaleString()} so‘m. Iltimos o‘z vaqtida to‘lang.`);
                    }}
                    className="text-[#D94B4B] border-[#E7EAF0] hover:bg-[#FDEEEC]"
                  >
                    Qarz Eslatmasi (SMS)
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Award}
                  onClick={() => {
                    setCoinModalStudent(profileModalStudent);
                  }}
                  className="text-[#E5A12B] border-[#E7EAF0] hover:bg-[#FDF6E9]"
                >
                  +Koin Berish
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  icon={CreditCard}
                  onClick={() => {
                    setPaymentModalStudent(profileModalStudent);
                  }}
                >
                  To‘lov Qabul Qilish
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Qarz Eslatmasi Jo‘natish (SMS & Telegram) */}
      {debtReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-[#E7EAF0] rounded-xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#E7EAF0] flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#D94B4B]" />
                <h3 className="text-sm font-bold text-[#252936]">
                  Qarz Eslatmasi: {debtReminderModal.first_name} {debtReminderModal.last_name}
                </h3>
              </div>
              <button onClick={() => setDebtReminderModal(null)} className="text-[#7C8494] hover:text-[#252936]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendReminder} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">Yuborish kanali</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReminderChannel('all')}
                    className={cn('py-2 text-xs font-bold rounded-lg border transition-all', reminderChannel === 'all' ? 'bg-[#EEF2FF] text-[#4169E1] border-[#4169E1]/50' : 'bg-[#F5F6F8] text-[#7C8494] border-[#E7EAF0]')}
                  >
                    Barchasi (SMS+TG)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReminderChannel('telegram')}
                    className={cn('py-2 text-xs font-bold rounded-lg border transition-all', reminderChannel === 'telegram' ? 'bg-[#EEF2FF] text-[#4169E1] border-[#4169E1]/50' : 'bg-[#F5F6F8] text-[#7C8494] border-[#E7EAF0]')}
                  >
                    Telegram Bot
                  </button>
                  <button
                    type="button"
                    onClick={() => setReminderChannel('sms')}
                    className={cn('py-2 text-xs font-bold rounded-lg border transition-all', reminderChannel === 'sms' ? 'bg-[#EEF2FF] text-[#4169E1] border-[#4169E1]/50' : 'bg-[#F5F6F8] text-[#7C8494] border-[#E7EAF0]')}
                  >
                    SMS Xabar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">Xabar Matni</label>
                <textarea
                  rows={4}
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="w-full bg-white text-[#252936] text-xs rounded-lg p-3 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none font-sans"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#7C8494]">
                <span>Qabul qiluvchi: {debtReminderModal.parent_phone || debtReminderModal.phone}</span>
                <span className="text-[#D94B4B] font-bold font-mono">Qarz: {Math.abs(debtReminderModal.balance || 0).toLocaleString()} so‘m</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF0]">
                <Button variant="secondary" size="sm" onClick={() => setDebtReminderModal(null)}>
                  Bekor qilish
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Eslatmani Yuborish
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
