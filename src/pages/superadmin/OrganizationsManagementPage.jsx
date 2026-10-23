import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Building2,
  GitBranch,
  Plus,
  ExternalLink,
  MapPin,
  Phone,
  Power,
  Users,
  Bot,
  Sliders,
  Sparkles,
  CreditCard,
  Trash2,
  X,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Receipt,
  FileText,
  Activity,
  CheckCircle2,
  Search
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterBar } from '../../components/common/FilterBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FeatureToggle } from '../../components/common/FeatureToggle';
import { SubscriptionSummary } from '../../components/common/SubscriptionSummary';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { formatUZS } from '../../lib/utils';
import { availableModules } from '../../data/saasData';
import { api } from '../../lib/api';

export function OrganizationsManagementPage() {
  const {
    organizations = [],
    openNewOrgModal,
    openFeaturesModal,
    toggleOrgFeature,
    batchUpdateOrgFeatures,
    refreshData,
    auditLogs = []
  } = useOutletContext();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlan, setFilterPlan] = useState('');

  // Selected organization for detailed view modal
  const [detailOrg, setDetailOrg] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, branches, billing, payments, features, users, limits, audit

  // Branch creation form state
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [branchForm, setBranchForm] = useState({ name: '', city: 'Toshkent', address: '', phone: '' });
  const [isSubmittingBranch, setIsSubmittingBranch] = useState(false);

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      search === '' ||
      (org.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (org.subdomain || '').toLowerCase().includes(search.toLowerCase()) ||
      (org.ownerName || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === '' || org.status === filterStatus;
    const matchesPlan = filterPlan === '' || (org.planName || '').toLowerCase().includes(filterPlan.toLowerCase());

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleToggleStatus = async (orgId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    await api.updateOrgStatus(orgId, newStatus);
    if (refreshData) refreshData();
  };

  const handleDeleteOrg = async (orgId, orgName) => {
    if (window.confirm(`Haqiqatan ham "${orgName}" o‘quv markazini arxivlamoqchimisiz?`)) {
      await api.deleteOrganization(orgId);
      if (detailOrg && detailOrg.id === orgId) setDetailOrg(null);
      if (refreshData) refreshData();
    }
  };

  const handleCreateBranchSubmit = async (e) => {
    e.preventDefault();
    if (!branchForm.name.trim() || !detailOrg) return;

    setIsSubmittingBranch(true);
    try {
      await api.addBranch(detailOrg.id, {
        name: branchForm.name.trim(),
        city: branchForm.city.trim(),
        address: branchForm.address.trim() || 'Markaziy bino',
        phone: branchForm.phone.trim() || detailOrg.ownerPhone,
        status: 'active',
        studentsCount: 0,
      });
      setIsSubmittingBranch(false);
      setIsAddingBranch(false);
      setBranchForm({ name: '', city: 'Toshkent', address: '', phone: '' });
      if (refreshData) await refreshData();

      // update current detailOrg with newly updated organization
      const updated = organizations.find((o) => o.id === detailOrg.id);
      if (updated) setDetailOrg(updated);
    } catch (err) {
      setIsSubmittingBranch(false);
      alert(`Filial qo‘shishda xatolik: ${err.message}`);
    }
  };

  // Keep detailOrg synced with organizations
  const currentDetail = detailOrg
    ? organizations.find((o) => o.id === detailOrg.id) || detailOrg
    : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Tashkilotlar boshqaruvi"
        description="EduOne platformasida ro'yxatdan o'tgan barcha o'quv markazlari, ularning filiallari va tariflari"
        breadcrumbs={[
          { label: 'Super Admin', to: '/super-admin' },
          { label: 'Tashkilotlar' },
        ]}
        action={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={openNewOrgModal}
            className="bg-[#4169E1] hover:bg-[#3557C7]"
          >
            Yangi tashkilot yaratish
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Markaz nomi, subdomen yoki rahbar F.I.SH..."
        hasActiveFilters={!!(search || filterStatus || filterPlan)}
        onReset={() => {
          setSearch('');
          setFilterStatus('');
          setFilterPlan('');
        }}
        filters={[
          {
            id: 'status',
            label: 'Barcha holatlar',
            value: filterStatus,
            onChange: setFilterStatus,
            options: [
              { value: 'active', label: 'Faol' },
              { value: 'trial', label: 'Sinov davri' },
              { value: 'suspended', label: "To'xtatilgan" },
            ],
          },
          {
            id: 'plan',
            label: 'Barcha tariflar',
            value: filterPlan,
            onChange: setFilterPlan,
            options: [
              { value: 'Boshlang‘ich', label: 'Boshlang‘ich' },
              { value: 'Professional', label: 'Professional' },
              { value: 'Enterprise', label: 'Enterprise' },
            ],
          },
        ]}
      />

      {/* Organizations List Cards */}
      <div className="space-y-3">
        {filteredOrgs.map((org) => {
          const enabledFeatures = org.enabledFeatures || [];
          const activeCount = enabledFeatures.length;

          return (
            <div
              key={org.id}
              className={`bg-white rounded-lg border p-4 shadow-sm transition-all hover:border-[#CBD1DC] ${
                org.status === 'suspended' ? 'border-[#F7C6C4]' : 'border-[#E7EAF0]'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Center Identity */}
                <div
                  className="flex items-start gap-3 cursor-pointer group"
                  onClick={() => {
                    setDetailOrg(org);
                    setActiveTab('overview');
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] text-[#4169E1] font-bold text-sm flex items-center justify-center shrink-0">
                    {org.name ? org.name.slice(0, 2).toUpperCase() : 'ED'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-[#252936] group-hover:text-[#4169E1] transition-colors">
                        {org.name}
                      </h3>
                      <span className="font-mono text-[11px] text-[#4169E1] px-1.5 py-0.5 rounded bg-[#EEF2FF] border border-[#C7D2FE]">
                        {org.subdomain}
                      </span>
                      <StatusBadge status={org.status} />
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-[#7C8494] mt-1.5 flex-wrap">
                      <span>Egasi: <strong className="text-[#252936] font-medium">{org.ownerName}</strong></span>
                      <span>•</span>
                      <span>Telefon: {org.ownerPhone}</span>
                      <span>•</span>
                      <span>Tarif: <strong className="text-[#4169E1] font-medium">{org.planName || 'Standart'}</strong></span>
                      <span>•</span>
                      <span>Filiallar: <strong className="text-[#252936]">{org.branchesCount || (org.branches ? org.branches.length : 1)} ta</strong></span>
                      <span>•</span>
                      <span>Qarz: <strong className={org.outstandingDebt > 0 ? "text-[#D94B4B]" : "text-[#269B65]"}>{formatUZS(org.outstandingDebt || 0)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 self-start lg:self-center flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Sliders}
                    onClick={() => {
                      setDetailOrg(org);
                      setActiveTab('features');
                    }}
                    className="text-xs h-8"
                  >
                    Modullar ({activeCount}/{availableModules.length})
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={ExternalLink}
                    onClick={() => {
                      sessionStorage.setItem('eduone_impersonating_org', JSON.stringify(org));
                      navigate('/');
                    }}
                    className="text-xs h-8 text-[#4169E1] border-[#C7D2FE] hover:bg-[#EEF2FF]"
                  >
                    Kirish
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDetailOrg(org);
                      setActiveTab('overview');
                    }}
                    className="text-xs h-8"
                  >
                    Batafsil
                  </Button>

                  <button
                    onClick={() => handleDeleteOrg(org.id, org.name)}
                    className="p-1.5 rounded-md text-[#7C8494] hover:text-[#D94B4B] hover:bg-[#FDEEEC] transition-colors"
                    title="Tashkilotni arxivlash"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredOrgs.length === 0 && (
          <EmptyState
            icon={Building2}
            title="Tashkilotlar topilmadi"
            description="Kiritilgan qidiruv yoki filtr bo'yicha hech qanday o'quv markazi topilmadi."
            actionLabel="Yangi tashkilot yaratish"
            onAction={openNewOrgModal}
          />
        )}
      </div>

      {/* Detailed Organization Management Modal with 8 Tabs */}
      {currentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col max-h-[92vh] text-white animate-in zoom-in-95 duration-200 relative select-none"
            style={{
              background: 'linear-gradient(180deg, rgba(13, 17, 25, 0.96) 0%, rgba(8, 11, 16, 0.98) 100%)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 30px 100px rgba(0, 0, 0, 0.9), 0 0 1px 1px rgba(255, 255, 255, 0.12) inset',
            }}
          >
            {/* Modal Header */}
            <div
              className="p-4 px-6 border-b border-white/10 flex items-center justify-between"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    boxShadow: '0 0 20px rgba(37, 99, 235, 0.45)',
                    border: '1px solid rgba(96, 165, 250, 0.35)',
                  }}
                >
                  {currentDetail.name ? currentDetail.name.slice(0, 2).toUpperCase() : 'ED'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white tracking-tight">{currentDetail.name}</h2>
                    <StatusBadge status={currentDetail.status} />
                  </div>
                  <p className="text-xs text-white/50 font-mono mt-0.5">{currentDetail.subdomain}</p>
                </div>
              </div>

              <button
                onClick={() => setDetailOrg(null)}
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                title="Yopish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compact Tabs Navigation Row */}
            <div
              className="flex items-center gap-1 px-6 border-b border-white/10 overflow-x-auto text-xs"
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
              }}
            >
              {[
                { id: 'overview', label: 'Umumiy' },
                { id: 'branches', label: `Filiallar (${currentDetail.branches?.length || 1})` },
                { id: 'billing', label: 'Obuna va tarif' },
                { id: 'payments', label: "To'lovlar va qarz" },
                { id: 'features', label: `Funksiyalar (${currentDetail.enabledFeatures?.length || 0})` },
                { id: 'users', label: 'Foydalanuvchilar' },
                { id: 'limits', label: 'Limitlar va sarf' },
                { id: 'audit', label: 'Audit tarixi' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2.5 font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-amber-400 text-amber-300 bg-white/5 font-semibold'
                      : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#E7EAF0] space-y-2">
                      <h4 className="font-bold text-[#252936] text-xs">Tashkilot ma'lumotlari</h4>
                      <div className="space-y-1.5 text-[#7C8494]">
                        <p>Nomi: <strong className="text-[#252936]">{currentDetail.name}</strong></p>
                        <p>Subdomen: <strong className="text-[#4169E1] font-mono">{currentDetail.subdomain}</strong></p>
                        <p>Ro'yxatdan o'tgan: <strong className="text-[#252936]">{currentDetail.createdAt ? currentDetail.createdAt.slice(0, 10) : '2026-10-15'}</strong></p>
                        <p>Holati: <strong className="text-[#269B65]">{currentDetail.status}</strong></p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#E7EAF0] space-y-2">
                      <h4 className="font-bold text-[#252936] text-xs">Tashkilot rahbari</h4>
                      <div className="space-y-1.5 text-[#7C8494]">
                        <p>F.I.SH: <strong className="text-[#252936]">{currentDetail.ownerName}</strong></p>
                        <p>Telefon: <strong className="text-[#252936]">{currentDetail.ownerPhone}</strong></p>
                        <p>Email: <strong className="text-[#252936]">{currentDetail.ownerEmail}</strong></p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7EAF0]">
                    <Button
                      variant={currentDetail.status === 'active' ? 'destructive' : 'success'}
                      size="sm"
                      onClick={() => handleToggleStatus(currentDetail.id, currentDetail.status)}
                    >
                      {currentDetail.status === 'active' ? "Tashkilotni to'xtatish" : "Tashkilotni faollashtirish"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Tab 2: Branches */}
              {activeTab === 'branches' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#252936]">Faol filiallar</h4>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Plus}
                      onClick={() => setIsAddingBranch(true)}
                      className="text-xs h-7 bg-[#4169E1]"
                    >
                      Filial qo'shish
                    </Button>
                  </div>

                  {isAddingBranch && (
                    <form onSubmit={handleCreateBranchSubmit} className="p-4 rounded-lg border border-[#C7D2FE] bg-[#EEF2FF]/30 space-y-3">
                      <h5 className="text-xs font-bold text-[#252936]">Yangi filial ma'lumotlari</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Filial nomi *"
                          value={branchForm.name}
                          onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                          className="px-3 py-1.5 text-xs rounded-md border border-[#E7EAF0] bg-white text-[#252936]"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Shahar *"
                          value={branchForm.city}
                          onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                          className="px-3 py-1.5 text-xs rounded-md border border-[#E7EAF0] bg-white text-[#252936]"
                        />
                        <input
                          type="text"
                          placeholder="Manzil"
                          value={branchForm.address}
                          onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                          className="px-3 py-1.5 text-xs rounded-md border border-[#E7EAF0] bg-white text-[#252936]"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsAddingBranch(false)}>Bekor qilish</Button>
                        <Button variant="primary" size="sm" type="submit" disabled={isSubmittingBranch}>
                          {isSubmittingBranch ? 'Saqlanmoqda...' : 'Saqlash'}
                        </Button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(currentDetail.branches || []).map((b, idx) => (
                      <div key={b.id || idx} className="p-3.5 rounded-lg border border-[#E7EAF0] bg-white text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-[#252936] font-semibold">{b.name}</strong>
                          <StatusBadge status={b.status || 'active'} />
                        </div>
                        <p className="text-[11px] text-[#7C8494] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#4169E1]" /> {b.city}, {b.address}
                        </p>
                        <p className="text-[11px] text-[#7C8494] flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" /> {b.phone || currentDetail.ownerPhone}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Subscription & Billing */}
              {activeTab === 'billing' && (
                <div className="space-y-4">
                  <SubscriptionSummary
                    planName={currentDetail.planName || 'Professional'}
                    billingCycle={currentDetail.billingCycle || 'monthly'}
                    price={currentDetail.planPrice || 450000}
                    amountPaid={currentDetail.amountPaid || 0}
                    debt={currentDetail.outstandingDebt || 0}
                    nextDueDate="2026-11-01"
                    expirationDate={currentDetail.expirationDate || '2026-12-31'}
                    status={currentDetail.status}
                  />
                </div>
              )}

              {/* Tab 4: Payments and Debt */}
              {activeTab === 'payments' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#E7EAF0] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[#7C8494]">Joriy qarzdorlik:</span>
                      <div className="text-base font-bold text-[#D94B4B]">{formatUZS(currentDetail.outstandingDebt || 0)}</div>
                    </div>
                    <div>
                      <span className="text-[#7C8494]">Jami to'langan summa:</span>
                      <div className="text-base font-bold text-[#269B65]">{formatUZS(currentDetail.amountPaid || 0)}</div>
                    </div>
                  </div>

                  <p className="text-xs text-[#7C8494]">
                    Ushbu tashkilot bo'yicha to'lovlar hisobi to'g'ridan-to'g'ri PostgreSQL bazasida yuritiladi.
                  </p>
                </div>
              )}

              {/* Tab 5: Features with Functional ON/OFF Toggles */}
              {activeTab === 'features' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E7EAF0]">
                    <span className="text-xs font-semibold text-[#252936]">
                      Barcha qo'llab-quvvatlanadigan modullar va ularning holati
                    </span>
                    <span className="text-xs text-[#4169E1] font-semibold">
                      {currentDetail.enabledFeatures?.length || 0} / {availableModules.length} ta faol
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {availableModules.map((module) => {
                      const isEnabled = (currentDetail.enabledFeatures || []).includes(module.code);

                      return (
                        <FeatureToggle
                          key={module.code}
                          id={`toggle-${module.code}`}
                          name={module.name}
                          description={module.description}
                          enabled={isEnabled}
                          onChange={() => toggleOrgFeature(currentDetail.id, module.code)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 6: Users and Permissions */}
              {activeTab === 'users' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg border border-[#E7EAF0] bg-white flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#252936]">{currentDetail.ownerName} (Bosh Admin)</div>
                      <div className="text-[#7C8494] text-[11px]">{currentDetail.ownerEmail} • {currentDetail.ownerPhone}</div>
                    </div>
                    <StatusBadge status="active" label="Markaz Admini" />
                  </div>
                </div>
              )}

              {/* Tab 7: Usage and Limits */}
              {activeTab === 'limits' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#E7EAF0] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#7C8494]">Filiallar limiti:</span>
                      <span className="font-semibold text-[#252936]">
                        {currentDetail.branches?.length || 1} / 3 ta
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7C8494]">O'quvchilar soni:</span>
                      <span className="font-semibold text-[#252936]">
                        {currentDetail.studentsCount || 0} nafar
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 8: Audit History */}
              {activeTab === 'audit' && (
                <div className="space-y-2 text-xs">
                  {auditLogs
                    .filter((l) => l.target && l.target.includes(currentDetail.name))
                    .map((log) => (
                      <div key={log.id} className="p-2.5 rounded bg-[#F8F9FA] border border-[#E7EAF0]">
                        <div className="flex justify-between text-[11px] text-[#7C8494]">
                          <span>{log.action}</span>
                          <span>{log.timestamp}</span>
                        </div>
                        <p className="text-[#252936] mt-0.5">{log.target}</p>
                      </div>
                    ))}
                  {auditLogs.filter((l) => l.target && l.target.includes(currentDetail.name)).length === 0 && (
                    <div className="text-center py-6 text-xs text-[#7C8494]">
                      Ushbu tashkilot bo'yicha maxsus audit yozuvlari mavjud emas.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 px-6 border-t border-[#E7EAF0] flex items-center justify-between bg-[#F8F9FA]">
              <span className="text-xs text-[#7C8494]">
                EduOne Markaziy Boshqaruv
              </span>
              <Button variant="outline" size="sm" onClick={() => setDetailOrg(null)}>
                Yopish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
