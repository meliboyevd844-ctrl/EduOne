import React, { useState, useEffect } from 'react';
import {
  Tag,
  CheckCircle2,
  Plus,
  Edit,
  Clock,
  Sparkles,
  Users,
  GitBranch,
  Bot,
  Trash2,
  X,
  Sliders
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { platformPlans, availableModules } from '../../data/saasData';
import { formatUZS } from '../../lib/utils';
import { api } from '../../lib/api';

export function PlansSubscriptionsPage() {
  const [plans, setPlans] = useState(platformPlans);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    priceMonthly: 1000000,
    priceYearly: 10000000,
    trialDays: 14,
    branchLimit: 3,
    studentLimit: 500,
    aiTokenLimit: 200000,
    features: [],
    defaultModules: ['claude_ai', 'telegram_bot', 'parent_portal', 'timetable_conflict'],
  });

  const loadPlans = async () => {
    try {
      const data = await api.getPlans();
      if (Array.isArray(data) && data.length > 0) {
        setPlans(
          data.map((p) => ({
            id: p.id,
            code: p.id,
            name: p.name,
            priceMonthly: p.price_monthly || p.priceMonthly || 0,
            priceYearly: p.price_yearly || p.priceYearly || 0,
            trialDays: p.trial_days || p.trialDays || 14,
            branchLimit: p.branch_limit || p.branchLimit || 1,
            studentLimit: p.student_limit || p.studentLimit || 250,
            aiTokenLimit: p.ai_token_limit || p.aiTokenLimit || 100000,
            features: p.features || [],
            defaultModules: p.features || ['claude_ai', 'telegram_bot'],
          }))
        );
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      code: '',
      priceMonthly: 1000000,
      priceYearly: 10000000,
      trialDays: 14,
      branchLimit: 3,
      studentLimit: 500,
      aiTokenLimit: 200000,
      features: ['3 ta filial', '500 tagacha o‘quvchi', 'Dars jadvali', 'Telegram bot'],
      defaultModules: ['claude_ai', 'telegram_bot', 'parent_portal', 'timetable_conflict'],
    });
    setModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      code: plan.code,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      trialDays: plan.trialDays,
      branchLimit: plan.branchLimit,
      studentLimit: plan.studentLimit,
      aiTokenLimit: plan.aiTokenLimit,
      features: plan.features || [],
      defaultModules: plan.defaultModules || [],
    });
    setModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert("Tarif nomi va kodini kiriting!");
      return;
    }

    const payload = {
      id: formData.code.toUpperCase(),
      name: formData.name.trim(),
      price_monthly: Number(formData.priceMonthly),
      price_yearly: Number(formData.priceYearly),
      trial_days: Number(formData.trialDays),
      branch_limit: Number(formData.branchLimit),
      student_limit: Number(formData.studentLimit),
      ai_token_limit: Number(formData.aiTokenLimit),
      features: formData.defaultModules,
      is_active: true,
    };

    try {
      if (editingPlan) {
        await api.updatePlan(editingPlan.id, payload);
      } else {
        await api.createPlan(payload);
      }
      setModalOpen(false);
      await loadPlans();
    } catch (err) {
      alert(`Xatolik: ${err.message}`);
    }
  };

  const handleDeletePlan = async (planId, planName) => {
    if (window.confirm(`Haqiqatan ham "${planName}" tarifini o‘chirmoqchimisiz?`)) {
      await api.deletePlan(planId);
      await loadPlans();
    }
  };

  const toggleModule = (code) => {
    setFormData((prev) => {
      const exists = prev.defaultModules.includes(code);
      return {
        ...prev,
        defaultModules: exists
          ? prev.defaultModules.filter((c) => c !== code)
          : [...prev.defaultModules, code],
      };
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tariflar va narxlar"
        description="EduOne SaaS platformasi tarif rejalari, limitlar va narxlash siyosati"
        breadcrumbs={[
          { label: 'Super Admin', to: '/super-admin' },
          { label: 'Tariflar va narxlar' },
        ]}
        action={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={openCreateModal}
            className="bg-[#4169E1] hover:bg-[#3557C7]"
          >
            Yangi tarif yaratish
          </Button>
        }
      />

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg border p-5 shadow-sm flex flex-col justify-between relative transition-all hover:border-[#CBD1DC] ${
              plan.popular ? 'border-[#4169E1] shadow-md' : 'border-[#E7EAF0]'
            }`}
          >
            {plan.popular && (
              <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EEF2FF] text-[#4169E1] border border-[#C7D2FE]">
                Eng ommabop
              </span>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#252936]">{plan.name}</h3>
                <span className="text-[10px] font-mono text-[#7C8494] uppercase px-1.5 py-0.5 rounded bg-[#F5F6F8] border border-[#E7EAF0]">
                  {plan.code}
                </span>
              </div>

              {/* Price */}
              <div className="mt-3">
                <div className="text-2xl font-bold text-[#252936] font-mono tracking-tight">
                  {formatUZS(plan.priceMonthly)}
                  <span className="text-xs font-normal text-[#7C8494]"> /oy</span>
                </div>
                <p className="text-[11px] text-[#7C8494] mt-0.5">
                  Yillik obunada: {formatUZS(plan.priceYearly)} /yil
                </p>
              </div>

              {/* Limits */}
              <div className="mt-4 p-3 rounded-lg bg-[#F8F9FA] border border-[#E7EAF0] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#7C8494]">
                    <GitBranch className="w-3.5 h-3.5 text-[#4169E1]" />
                    Filiallar limiti:
                  </span>
                  <strong className="text-[#252936]">{plan.branchLimit} ta</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#7C8494]">
                    <Users className="w-3.5 h-3.5 text-[#4169E1]" />
                    O‘quvchilar limiti:
                  </span>
                  <strong className="text-[#252936]">{plan.studentLimit} tagacha</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#7C8494]">
                    <Bot className="w-3.5 h-3.5 text-[#4169E1]" />
                    Claude AI token limiti:
                  </span>
                  <strong className="text-[#269B65] font-mono">
                    {(plan.aiTokenLimit / 1000).toLocaleString()}k token
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#7C8494]">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    Sinov muddati:
                  </span>
                  <strong className="text-blue-400">{plan.trialDays} kun bepul</strong>
                </div>
              </div>

              {/* Modules included */}
              <div className="mt-4 space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7C8494]">
                  Kiritilgan modullar:
                </p>
                <div className="flex flex-wrap gap-1">
                  {(plan.defaultModules || []).map((mCode) => {
                    const mod = availableModules.find((m) => m.code === mCode);
                    return (
                      <span
                        key={mCode}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[#EEF2FF] text-[#4169E1] border border-[#C7D2FE]"
                      >
                        {mod?.name || mCode}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3 border-t border-[#E7EAF0] flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => openEditModal(plan)}
                className="w-full text-xs h-8"
              >
                Tahrirlash
              </Button>
              <button
                onClick={() => handleDeletePlan(plan.id, plan.name)}
                className="p-1.5 rounded-md text-[#7C8494] hover:text-[#D94B4B] hover:bg-[#FDEEEC] transition-colors"
                title="Tarifni o‘chirish"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Plan Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white border border-[#E7EAF0] rounded-xl p-5 shadow-modal max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
              <div>
                <h3 className="text-sm font-bold text-[#252936]">
                  {editingPlan ? 'Tarifni tahrirlash' : 'Yangi tarif yaratish'}
                </h3>
                <p className="text-xs text-[#7C8494]">
                  Tarif narxi, limitlari va ruxsat etilgan modullarni belgilang
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-[#7C8494] hover:text-[#252936]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#252936] mb-1">Tarif nomi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Professional Plus"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#E7EAF0] text-[#252936] text-xs focus:border-[#4169E1] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#252936] mb-1">Tarif kodi (ID) *</label>
                  <input
                    type="text"
                    required
                    placeholder="PRO_PLUS"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#E7EAF0] text-[#252936] text-xs font-mono uppercase focus:border-[#4169E1] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#252936] mb-1">Oylik narx (so‘m) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="50000"
                    value={formData.priceMonthly}
                    onChange={(e) => setFormData({ ...formData, priceMonthly: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#E7EAF0] text-[#252936] text-xs font-mono focus:border-[#4169E1] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#252936] mb-1">Yillik narx (so‘m) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100000"
                    value={formData.priceYearly}
                    onChange={(e) => setFormData({ ...formData, priceYearly: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#E7EAF0] text-[#252936] text-xs font-mono focus:border-[#4169E1] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#252936] mb-1">Filial limiti</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.branchLimit}
                    onChange={(e) => setFormData({ ...formData, branchLimit: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#E7EAF0] text-[#252936] text-xs focus:border-[#4169E1] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#252936] mb-1">O‘quvchi limiti</label>
                  <input
                    type="number"
                    min="10"
                    value={formData.studentLimit}
                    onChange={(e) => setFormData({ ...formData, studentLimit: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#E7EAF0] text-[#252936] text-xs focus:border-[#4169E1] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#252936] mb-1">Sinov kuni</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.trialDays}
                    onChange={(e) => setFormData({ ...formData, trialDays: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#E7EAF0] text-[#252936] text-xs focus:border-[#4169E1] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#252936] mb-1.5">
                  Kiritilgan modullar (belgilang):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableModules.map((m) => {
                    const isChecked = formData.defaultModules.includes(m.code);
                    return (
                      <label
                        key={m.code}
                        className={`p-2 rounded-md border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          isChecked
                            ? 'bg-[#EEF2FF] border-[#C7D2FE] text-[#4169E1] font-semibold'
                            : 'bg-white border-[#E7EAF0] text-[#7C8494]'
                        }`}
                      >
                        <span className="truncate mr-2">{m.name}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleModule(m.code)}
                          className="accent-[#4169E1] w-3.5 h-3.5 rounded"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7EAF0]">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Bekor qilish
                </Button>
                <Button type="submit" variant="primary" size="sm" className="bg-[#4169E1] hover:bg-[#3557C7]">
                  {editingPlan ? 'Saqlash' : 'Tarifni yaratish'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
