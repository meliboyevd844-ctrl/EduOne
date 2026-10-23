import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Plus,
  Building2,
  X,
  CreditCard,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { formatUZS } from '../../lib/utils';
import { api } from '../../lib/api';
import { PaymentGatewaysModal } from '../../components/finance/PaymentGatewaysModal';

export function PlatformFinancePage() {
  const { organizations = [], refreshData } = useOutletContext();
  const [invoices, setInvoices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [gatewaysModalOpen, setGatewaysModalOpen] = useState(false);
  const [payModalInvoice, setPayModalInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('payme');
  const [formData, setFormData] = useState({
    organizationId: '',
    amount: 1800000,
    dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
  });

  const loadInvoices = async () => {
    try {
      const data = await api.getInvoices();
      if (Array.isArray(data)) {
        setInvoices(data);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  // Real calculations from database
  const activeOrgs = organizations.filter((o) => o.status === 'active');
  const totalMRR = activeOrgs.reduce((acc, o) => acc + (o.planPrice || 0), 0);
  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const pendingInvoices = invoices.filter((i) => i.status === 'pending');
  const totalReceived = paidInvoices.reduce((acc, i) => acc + (i.amount || 0), 0);
  const totalPending = pendingInvoices.reduce((acc, i) => acc + (i.amount || 0), 0);
  const totalDebt = organizations.reduce((acc, o) => acc + (o.outstandingDebt || 0), 0);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    const org = organizations.find((o) => o.id === formData.organizationId);
    if (!org) {
      alert("Tashkilotni tanlang!");
      return;
    }

    try {
      await api.createInvoice({
        id: `INV-${Date.now().toString().slice(-6)}`,
        organization_id: org.id,
        org_name: org.name,
        plan_name: org.planName || 'Standart',
        amount: Number(formData.amount),
        status: 'pending',
        due_date: new Date(formData.dueDate).toISOString(),
      });

      // Update debt
      await api.updateOrganization(org.id, {
        ...org,
        outstandingDebt: (org.outstandingDebt || 0) + Number(formData.amount),
      });

      setModalOpen(false);
      await loadInvoices();
      if (refreshData) refreshData();
    } catch (err) {
      alert(`Xatolik: ${err.message}`);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payModalInvoice) return;

    try {
      await api.recordInvoicePayment(payModalInvoice.id, paymentMethod);
      setPayModalInvoice(null);
      await loadInvoices();
      if (refreshData) refreshData();
    } catch (err) {
      alert(`To‘lovni qabul qilishda xatolik: ${err.message}`);
    }
  };

  const invoiceColumns = [
    {
      key: 'id',
      title: 'Invoys raqami',
      sortable: true,
      render: (val, inv) => (
        <span className="font-mono text-xs font-semibold text-[#4169E1]">
          {inv.id}
        </span>
      ),
    },
    {
      key: 'org_name',
      title: 'Tashkilot',
      sortable: true,
      render: (val, inv) => (
        <span className="font-semibold text-[#252936]">
          {inv.org_name || inv.orgName}
        </span>
      ),
    },
    {
      key: 'plan_name',
      title: 'Tarif',
      render: (val, inv) => (
        <span className="text-xs text-[#7C8494]">
          {inv.plan_name || inv.planName}
        </span>
      ),
    },
    {
      key: 'due_date',
      title: "To'lov muddati",
      render: (val, inv) => (
        <span className="text-xs text-[#7C8494] font-mono">
          {inv.due_date ? String(inv.due_date).slice(0, 10) : '—'}
        </span>
      ),
    },
    {
      key: 'amount',
      title: 'Summa',
      sortable: true,
      align: 'right',
      render: (val, inv) => (
        <span className="font-mono text-xs font-semibold text-[#252936]">
          {formatUZS(inv.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Holat',
      sortable: true,
      render: (val, inv) => <StatusBadge status={inv.status} />,
    },
    {
      key: 'actions',
      title: 'Amallar',
      align: 'right',
      render: (val, inv) =>
        inv.status !== 'paid' ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPayModalInvoice(inv)}
            className="text-[11px] h-7 px-2 text-[#269B65] border-[#C2EAD5] hover:bg-[#EAF7F0]"
          >
            To‘lovni tasdiqlash
          </Button>
        ) : (
          <span className="text-[11px] text-[#269B65] font-medium flex items-center justify-end gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> To'langan
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="To'lovlar va qarzlar"
        description="EduOne platformasining o'quv markazlaridan oladigan obuna to'lovlari va hisob-fakturalari"
        breadcrumbs={[
          { label: 'Super Admin', to: '/super-admin' },
          { label: "To'lovlar va qarzlar" },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Sliders}
              onClick={() => setGatewaysModalOpen(true)}
              className="text-xs h-8 text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
            >
              Gatewaylar (Click/Payme)
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setModalOpen(true)}
              className="bg-[#4169E1] hover:bg-[#3557C7]"
            >
              Invoys chiqarish
            </Button>
          </div>
        }
      />

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Oylik obuna daromadi (MRR)"
          value={formatUZS(totalMRR)}
          icon={Wallet}
          subvalue={`${activeOrgs.length} ta faol obunachi markaz`}
        />

        <StatCard
          title="Kutilayotgan tushum"
          value={formatUZS(totalPending)}
          icon={CreditCard}
          subvalue={`${pendingInvoices.length} ta ochiq hisob-faktura`}
        />

        <StatCard
          title="Umumiy markazlar qarzdorligi"
          value={formatUZS(totalDebt)}
          icon={AlertTriangle}
          subvalue="Qarz mavjud markazlarda modullar cheklanishi mumkin"
        />
      </div>

      {/* Invoices DataTable */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#252936] tracking-tight">
            Platforma hisob-fakturalari (Invoices)
          </h2>
        </div>

        <DataTable
          columns={invoiceColumns}
          data={invoices}
          emptyTitle="Hisob-fakturalar mavjud emas"
          emptyDescription="Hali birorta o'quv markaziga obuna to'lovi uchun invoys chiqarilmagan."
          emptyActionLabel={organizations.length > 0 ? "Invoys chiqarish" : undefined}
          onEmptyAction={() => setModalOpen(true)}
        />
      </div>

      {/* Create Invoice Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-[#E7EAF0] rounded-xl p-5 shadow-modal">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
              <div>
                <h3 className="text-sm font-bold text-[#252936]">Yangi invoys chiqarish</h3>
                <p className="text-xs text-[#7C8494]">Markaz obunasi uchun to'lov talabnomasi</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-[#7C8494] hover:text-[#252936]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#252936] mb-1">O‘quv markazi *</label>
                <select
                  required
                  value={formData.organizationId}
                  onChange={(e) => {
                    const org = organizations.find((o) => o.id === e.target.value);
                    setFormData({
                      ...formData,
                      organizationId: e.target.value,
                      amount: org?.planPrice || 1800000,
                    });
                  }}
                  className="w-full px-3 py-1.5 rounded-md bg-white border border-[#E7EAF0] text-[#252936] text-xs focus:border-[#4169E1] outline-none"
                >
                  <option value="">Tanlang...</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.subdomain}) — {formatUZS(org.planPrice || 0)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#252936] mb-1">Invoys summasi (so‘m) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md bg-white border border-[#E7EAF0] text-[#252936] text-xs font-mono focus:border-[#4169E1] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#252936] mb-1">To‘lov muddati (Due Date) *</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md bg-white border border-[#E7EAF0] text-[#252936] text-xs focus:border-[#4169E1] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7EAF0]">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Bekor qilish
                </Button>
                <Button type="submit" variant="primary" size="sm" className="bg-[#4169E1] hover:bg-[#3557C7]">
                  Invoysni saqlash
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {payModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-[#E7EAF0] rounded-xl p-5 shadow-modal">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
              <div>
                <h3 className="text-sm font-bold text-[#252936]">To‘lovni qabul qilish</h3>
                <p className="text-xs text-[#7C8494]">
                  {payModalInvoice.org_name || payModalInvoice.orgName} — {formatUZS(payModalInvoice.amount)}
                </p>
              </div>
              <button onClick={() => setPayModalInvoice(null)} className="text-[#7C8494] hover:text-[#252936]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#252936] mb-1">To‘lov usuli</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md bg-white border border-[#E7EAF0] text-[#252936] text-xs focus:border-[#4169E1] outline-none"
                >
                  <option value="payme">Payme B2B</option>
                  <option value="click">Click Up</option>
                  <option value="bank_transfer">Bank hisob-raqamiga o‘tkazma</option>
                  <option value="cash">Naqd to‘lov (Kassa)</option>
                </select>
              </div>

              <div className="p-3 rounded-md bg-[#EAF7F0] border border-[#C2EAD5] text-xs text-[#269B65]">
                To‘lov tasdiqlangandan so‘ng markazning qarzi avtomatik kamayadi va tizim audit jurnaliga qayd etiladi.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7EAF0]">
                <Button type="button" variant="outline" size="sm" onClick={() => setPayModalInvoice(null)}>
                  Bekor qilish
                </Button>
                <Button type="submit" variant="primary" size="sm" className="bg-[#4169E1] hover:bg-[#3557C7]">
                  To‘lovni tasdiqlash
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Gateways Config Modal */}
      <PaymentGatewaysModal
        isOpen={gatewaysModalOpen}
        onClose={() => setGatewaysModalOpen(false)}
      />
    </div>
  );
}
