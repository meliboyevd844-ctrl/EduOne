import React, { useState, useEffect } from 'react';
import {
  Coins,
  CreditCard,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Search,
  Receipt,
  Wallet,
  X,
  CheckCircle2,
  Clock,
  Printer,
  Send,
  QrCode,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { formatUZS, cn } from '../lib/utils';
import { PaymentGatewaysModal } from '../components/finance/PaymentGatewaysModal';
import { PaymentLinkModal } from '../components/finance/PaymentLinkModal';
import { CashierShiftModal } from '../components/finance/CashierShiftModal';

export function FinancePage() {
  const [activeOrg, setActiveOrg] = useState(null);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');

  // Modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [receiptModalPayment, setReceiptModalPayment] = useState(null);
  const [payrollPreviewOpen, setPayrollPreviewOpen] = useState(false);
  const [gatewaysModalOpen, setGatewaysModalOpen] = useState(false);
  const [paymentLinkModalOpen, setPaymentLinkModalOpen] = useState(false);
  const [cashierShiftModalOpen, setCashierShiftModalOpen] = useState(false);

  // Forms
  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    studentName: '',
    amount: 600000,
    paymentMethod: 'cash',
    paymentMode: 'monthly',
    notes: '',
  });

  const [expenseForm, setExpenseForm] = useState({
    category: 'Ijara',
    amount: 2500000,
    description: 'Bino oylik ijarasi',
  });

  const orgId = activeOrg?.id || 'default';

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('eduone_impersonating_org');
      if (raw) setActiveOrg(JSON.parse(raw));
    } catch {}
  }, []);

  const loadFinance = async () => {
    const [pmts, exps, stds, tchs] = await Promise.all([
      api.getStudentPayments(orgId),
      api.getExpenses(orgId),
      api.getStudents(orgId),
      api.getTeachers(orgId),
    ]);
    setPayments(pmts || []);
    setExpenses(exps || []);
    setStudents(stds || []);
    setTeachers(tchs || []);
  };

  useEffect(() => {
    loadFinance();
  }, [activeOrg]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.studentId || !paymentForm.amount) return;

    const selectedStudent = students.find((s) => s.id === paymentForm.studentId);
    await api.recordStudentPayment(orgId, {
      ...paymentForm,
      studentName: selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'O‘quvchi',
      amount: Number(paymentForm.amount),
    });

    setPaymentModalOpen(false);
    loadFinance();
  };

  const handleRecordExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount) return;

    await api.recordExpense(orgId, {
      ...expenseForm,
      amount: Number(expenseForm.amount),
    });

    setExpenseModalOpen(false);
    loadFinance();
  };

  const totalIncome = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalExpense = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const netProfit = totalIncome - totalExpense;

  const totalDebt = students
    .filter((s) => (s.balance || 0) < 0)
    .reduce((acc, s) => acc + Math.abs(s.balance || 0), 0);

  const filteredPayments = payments.filter(
    (p) =>
      (p.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.receipt_number || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Moliya va to'lovlar boshqaruvi"
        description="O‘quvchilar to‘lovlari, qarzdorlik nazorati, oylik tushum va xarajatlar"
        breadcrumbs={[
          { label: 'Markaz', to: '/' },
          { label: 'Moliya' },
        ]}
        action={
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button
              variant="outline"
              size="sm"
              icon={Sliders}
              onClick={() => setGatewaysModalOpen(true)}
              className="text-xs h-8 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
              title="Click, Payme, Uzum Pay API sozlamalari"
            >
              Gatewaylar (Click/Payme)
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={QrCode}
              onClick={() => setPaymentLinkModalOpen(true)}
              className="text-xs h-8 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 hover:bg-amber-50 dark:hover:bg-amber-500/10"
              title="Click va Payme to'lov havolasi va QR chek yaratish"
            >
              Havola & QR to‘lov
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={Receipt}
              onClick={() => setCashierShiftModalOpen(true)}
              className="text-xs h-8 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
              title="Kassa smenasi, Z-Hisobot va inkassatsiya"
            >
              Kassa & Z-Hisobot
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={Wallet}
              onClick={() => setPayrollPreviewOpen(true)}
              className="text-xs h-8 text-[#4169E1] border-[#C7D2FE] hover:bg-[#EEF2FF]"
            >
              Ustozlar maoshi
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => setExpenseModalOpen(true)}
              className="text-xs h-8 text-[#D94B4B] border-[#F7C6C4] hover:bg-[#FDEEEC]"
            >
              Xarajat kiritish
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setPaymentModalOpen(true)}
              className="text-xs h-8 bg-[#4169E1] hover:bg-[#3557C7]"
            >
              To‘lov qabul qilish
            </Button>
          </div>
        }
      />

      {/* 4 Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jami o'qish tushumi"
          value={formatUZS(totalIncome)}
          icon={ArrowUpRight}
          subvalue={`${payments.length} ta to‘lov amalga oshirilgan`}
        />

        <StatCard
          title="Kutilayotgan qarzdorlik"
          value={formatUZS(totalDebt)}
          icon={AlertTriangle}
          subvalue={`${students.filter((s) => (s.balance || 0) < 0).length} nafar o‘quvchi qarzda`}
        />

        <StatCard
          title="Markaz xarajatlari"
          value={formatUZS(totalExpense)}
          icon={ArrowDownRight}
          subvalue={`${expenses.length} ta xarajat moddasi`}
        />

        <StatCard
          title="Sof foyda"
          value={formatUZS(netProfit)}
          icon={Wallet}
          subvalue="Tushum - Xarajat"
        />
      </div>

      {/* Payments History Table */}
      <div className="bg-white rounded-lg border border-[#E7EAF0] shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#E7EAF0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#4169E1]" />
            <h3 className="text-sm font-bold text-[#252936]">To‘lovlar jurnali</h3>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#7C8494] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="O‘quvchi yoki chek raqami..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F5F6F8] text-[#252936] text-xs rounded-md pl-9 pr-3 py-1.5 border border-[#E7EAF0] focus:border-[#4169E1] focus:bg-white outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] text-[#7C8494] uppercase font-semibold text-[10px] border-b border-[#E7EAF0]">
              <tr>
                <th className="py-2.5 px-3">Chek raqami</th>
                <th className="py-2.5 px-3">O‘quvchi</th>
                <th className="py-2.5 px-3">To‘lov turi</th>
                <th className="py-2.5 px-3">Rejim</th>
                <th className="py-2.5 px-3 font-mono text-right">Summa</th>
                <th className="py-2.5 px-3">Sana</th>
                <th className="py-2.5 px-3">Holati</th>
                <th className="py-2.5 px-3 text-right">Chek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-[#7C8494]">
                    Hozircha to‘lovlar amalga oshirilmagan.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="py-3 px-3 font-mono text-[#4169E1] font-semibold">{p.receipt_number}</td>
                    <td className="py-3 px-3 font-semibold text-[#252936]">{p.student_name}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#F5F6F8] border border-[#E7EAF0] text-[#252936]">
                        {p.payment_method === 'cash' ? 'Naqd pul' : p.payment_method === 'card' ? 'Plastik karta' : p.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#7C8494]">
                      {p.payment_mode === 'monthly' ? 'Oylik' : p.payment_mode}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#252936] text-right">
                      {formatUZS(p.amount)}
                    </td>
                    <td className="py-3 px-3 text-[#7C8494] font-mono">{p.date}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status="paid" label="Tasdiqlangan" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReceiptModalPayment(p)}
                        className="text-[11px] h-7 px-2 text-[#4169E1] border-[#C7D2FE] hover:bg-[#EEF2FF]"
                        title="Rasmiy chekni ko‘rish va chop etish"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Chek</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: To'lov Qabul Qilish */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-[#E7EAF0] rounded-xl shadow-modal overflow-hidden">
            <div className="p-4 px-5 border-b border-[#E7EAF0] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#4169E1]" />
                <h3 className="text-sm font-bold text-[#252936]">O‘quvchidan to‘lov qabul qilish</h3>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} className="text-[#7C8494] hover:text-[#252936]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#252936] mb-1">O‘quvchini tanlang *</label>
                <select
                  required
                  value={paymentForm.studentId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
                  className="w-full bg-white text-[#252936] text-xs rounded-md px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] outline-none"
                >
                  <option value="">O‘quvchini tanlang...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.group_name}) — Qarz: {s.balance < 0 ? formatUZS(Math.abs(s.balance)) : '0'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#252936] mb-1">To‘lov summasi (so‘m) *</label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full bg-white text-[#252936] text-sm font-bold rounded-md px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#252936] mb-1">To‘lov usuli</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full bg-white text-[#252936] text-xs rounded-md px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] outline-none"
                  >
                    <option value="cash">Naqd pul</option>
                    <option value="card">Plastik karta</option>
                    <option value="payme">Payme</option>
                    <option value="click">Click</option>
                    <option value="uzum">Uzum Bank</option>
                    <option value="bank">Bank hisobi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#252936] mb-1">To‘lov rejimi</label>
                  <select
                    value={paymentForm.paymentMode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                    className="w-full bg-white text-[#252936] text-xs rounded-md px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] outline-none"
                  >
                    <option value="monthly">Oylik (Kalendar)</option>
                    <option value="daily">Kunlik darsbay</option>
                    <option value="module">Modul bo‘yicha</option>
                    <option value="full">Butun kurs uchun</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#252936] mb-1">Izoh</label>
                <input
                  type="text"
                  placeholder="Masalan: Oktyabr oyi to‘lovi"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full bg-white text-[#252936] text-xs rounded-md px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7EAF0]">
                <Button variant="outline" size="sm" onClick={() => setPaymentModalOpen(false)}>
                  Bekor qilish
                </Button>
                <Button variant="primary" size="sm" type="submit" className="bg-[#4169E1] hover:bg-[#3557C7]">
                  To‘lovni qabul qilish
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Xarajat Kiritish */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-[#E7EAF0] rounded-xl shadow-modal overflow-hidden">
            <div className="p-4 px-5 border-b border-[#E7EAF0] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-[#D94B4B]" />
                <h3 className="text-sm font-bold text-[#252936]">Markaz xarajatini kiritish</h3>
              </div>
              <button onClick={() => setExpenseModalOpen(false)} className="text-[#7C8494] hover:text-[#252936]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordExpense} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#252936] mb-1">Xarajat toifasi</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full bg-white text-[#252936] text-xs rounded-md px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] outline-none"
                >
                  <option value="Ijara">Bino oylik ijarasi</option>
                  <option value="Kommunal">Kommunal to‘lovlar (Elektr, Internet, Suv)</option>
                  <option value="Oyliklar">O‘qituvchi va xodimlar maoshi</option>
                  <option value="Marketing">Marketing va reklama (Target, SMM)</option>
                  <option value="Kantselyariya">Kantselyariya va xo‘jalik mollari</option>
                  <option value="Boshqa">Boshqa xarajatlar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#252936] mb-1">Xarajat summasi (so‘m) *</label>
                <input
                  type="number"
                  required
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full bg-white text-[#252936] text-sm font-bold rounded-md px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#252936] mb-1">Tavsif / Maqsad</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Oktyabr oyi ofis ijarasi"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full bg-white text-[#252936] text-xs rounded-md px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7EAF0]">
                <Button variant="outline" size="sm" onClick={() => setExpenseModalOpen(false)}>
                  Bekor qilish
                </Button>
                <Button variant="destructive" size="sm" type="submit">
                  Xarajatni saqlash
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Rasmiy Kvitansiya / Chek */}
      {receiptModalPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-[#E7EAF0] rounded-xl shadow-modal overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#4169E1]" />
                <h3 className="text-sm font-bold text-[#252936]">Elektron to‘lov kvitansiyasi</h3>
              </div>
              <button onClick={() => setReceiptModalPayment(null)} className="text-[#7C8494] hover:text-[#252936]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Receipt Paper */}
            <div className="bg-[#F8F9FA] p-5 rounded-lg border border-[#E7EAF0] space-y-3 font-sans text-xs text-[#252936]">
              <div className="text-center pb-2 border-b border-dashed border-[#CBD1DC] space-y-0.5">
                <h4 className="font-extrabold text-sm tracking-tight text-[#252936]">EduOne O‘quv Markazi</h4>
                <p className="text-[10px] text-[#7C8494]">Ta’lim xizmatlari uchun to‘lov kvitansiyasi</p>
                <p className="text-xs font-mono font-bold text-[#4169E1] pt-1">{receiptModalPayment.receipt_number}</p>
              </div>

              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#7C8494]">O‘quvchi:</span>
                  <span className="font-bold text-[#252936]">{receiptModalPayment.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8494]">Sana va vaqt:</span>
                  <span className="font-mono text-[#252936]">{receiptModalPayment.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8494]">To‘lov usuli:</span>
                  <span className="capitalize text-[#269B65] font-semibold">
                    {receiptModalPayment.payment_method === 'cash' ? 'Naqd pul' : receiptModalPayment.payment_method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C8494]">To‘lov rejimi:</span>
                  <span className="text-[#252936]">
                    {receiptModalPayment.payment_mode === 'monthly' ? 'Oylik to‘lov' : receiptModalPayment.payment_mode}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-[#CBD1DC] flex items-center justify-between text-sm">
                <span className="font-bold text-[#252936]">Jami Summa:</span>
                <span className="font-mono font-bold text-[#4169E1] text-base">
                  {formatUZS(receiptModalPayment.amount)}
                </span>
              </div>

              <div className="pt-2 text-[10px] text-center text-[#7C8494] border-t border-[#E7EAF0]">
                Kassir: EduOne Moliya • Muhr o‘rni: [ELEKTRON TASDIQLANDI]
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  alert(`Chek ${receiptModalPayment.student_name} ning Telegram botiga yuborildi!`);
                }}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegramga</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1 text-xs bg-[#4169E1] hover:bg-[#3557C7]"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Chop etish</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ustozlar Maoshi Hisoblagichi (Payroll) */}
      {payrollPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white border border-[#E7EAF0] rounded-xl shadow-modal overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#4169E1]" />
                <div>
                  <h3 className="text-sm font-bold text-[#252936]">O‘qituvchilar maoshi hisob-kitobi (Payroll)</h3>
                  <p className="text-[11px] text-[#7C8494]">Belgilangan stavka va foizlar asosida avtomatik oylik hisobi</p>
                </div>
              </div>
              <button onClick={() => setPayrollPreviewOpen(false)} className="text-[#7C8494] hover:text-[#252936]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[#E7EAF0]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F9FA] text-[#7C8494] text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">O‘qituvchi</th>
                    <th className="py-2.5 px-3">Fan</th>
                    <th className="py-2.5 px-3">Maosh modeli</th>
                    <th className="py-2.5 px-3">O‘quvchilar</th>
                    <th className="py-2.5 px-3 text-right">Hisoblangan maosh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAF0]">
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-[#7C8494]">
                        O‘qituvchilar mavjud emas.
                      </td>
                    </tr>
                  ) : (
                    teachers.map((t) => {
                      const estStudents = students.filter((s) => s.group_name && s.group_name.includes(t.subject.slice(0, 4))).length || 12;
                      const estIncome = estStudents * 600000;
                      const estSalary = t.salary_type === 'percentage'
                        ? (estIncome * (t.salary_rate || 40)) / 100
                        : 5000000;

                      return (
                        <tr key={t.id} className="hover:bg-[#F8F9FA]">
                          <td className="py-2.5 px-3 font-semibold text-[#252936]">{t.full_name}</td>
                          <td className="py-2.5 px-3 text-[#7C8494]">{t.subject}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-[#F5F6F8] text-[#252936] border border-[#E7EAF0]">
                              {t.salary_type === 'percentage' ? `${t.salary_rate || 40}% (Ulushbay)` : 'Fiksirlangan maosh'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[#252936]">{estStudents} nafar</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#269B65]">
                            {formatUZS(estSalary)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setPayrollPreviewOpen(false)}>
                Yopish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateways (Click, Payme, Uzum) Modal */}
      <PaymentGatewaysModal
        isOpen={gatewaysModalOpen}
        onClose={() => setGatewaysModalOpen(false)}
      />

      {/* Online Payment Link & QR Invoice Generator Modal */}
      <PaymentLinkModal
        isOpen={paymentLinkModalOpen}
        onClose={() => setPaymentLinkModalOpen(false)}
        students={students}
      />

      {/* Cashier Shift & Z-Report Modal */}
      <CashierShiftModal
        isOpen={cashierShiftModalOpen}
        onClose={() => setCashierShiftModalOpen(false)}
        payments={payments}
      />
    </div>
  );
}
