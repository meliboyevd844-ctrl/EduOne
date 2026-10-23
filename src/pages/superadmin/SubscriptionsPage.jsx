import React, { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  DollarSign
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterBar } from '../../components/common/FilterBar';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/ui/Button';
import { formatUZS } from '../../lib/utils';

export function SubscriptionsPage() {
  const { organizations = [], openFeaturesModal } = useOutletContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const activeCount = organizations.filter((o) => o.status === 'active').length;
  const trialCount = organizations.filter((o) => o.status === 'trial').length;
  const totalDebt = organizations.reduce((acc, o) => acc + (o.outstandingDebt || 0), 0);

  const filtered = useMemo(() => {
    return organizations.filter((org) => {
      const matchSearch =
        search === '' ||
        (org.name && org.name.toLowerCase().includes(search.toLowerCase())) ||
        (org.subdomain && org.subdomain.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === '' || org.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [organizations, search, statusFilter]);

  const columns = [
    {
      key: 'name',
      title: 'Tashkilot',
      sortable: true,
      render: (val, org) => (
        <div>
          <div className="font-semibold text-[#252936]">{org.name}</div>
          <div className="text-[11px] text-[#7C8494] font-mono">{org.subdomain}</div>
        </div>
      ),
    },
    {
      key: 'planName',
      title: 'Tarif',
      render: (val, org) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#EEF2FF] text-[#4169E1] border border-[#C7D2FE]">
          {org.planName || 'Standart'}
        </span>
      ),
    },
    {
      key: 'billingCycle',
      title: 'Davr',
      render: (val, org) => (
        <span className="text-xs text-[#7C8494]">
          {org.billingCycle === 'yearly' ? 'Yillik' : 'Oylik'}
        </span>
      ),
    },
    {
      key: 'planPrice',
      title: 'Obuna narxi',
      align: 'right',
      render: (val, org) => (
        <span className="font-mono text-xs font-semibold text-[#252936]">
          {formatUZS(org.planPrice)}
        </span>
      ),
    },
    {
      key: 'outstandingDebt',
      title: 'Qarzdorlik',
      align: 'right',
      render: (val, org) => (
        <span className={`font-mono text-xs font-semibold ${org.outstandingDebt > 0 ? 'text-[#D94B4B]' : 'text-[#269B65]'}`}>
          {formatUZS(org.outstandingDebt || 0)}
        </span>
      ),
    },
    {
      key: 'expirationDate',
      title: 'Tugash sanasi',
      render: (val, org) => (
        <span className="text-xs text-[#7C8494] font-mono">
          {org.expirationDate || '2026-12-31'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Holat',
      render: (val, org) => <StatusBadge status={org.status} />,
    },
    {
      key: 'actions',
      title: 'Amallar',
      align: 'right',
      render: (val, org) => (
        <Button
          variant="outline"
          size="sm"
          icon={Sliders}
          onClick={() => openFeaturesModal(org)}
          className="text-[11px] h-7 px-2"
        >
          Modullar
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Obunalar nazorati"
        description="EduOne platformasida barcha o'quv markazlarining obuna muddatlari va holati"
        breadcrumbs={[
          { label: 'Super Admin', to: '/super-admin' },
          { label: 'Obunalar' },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Faol obunalar"
          value={`${activeCount} ta`}
          icon={CheckCircle2}
          subvalue={`${trialCount} ta sinov muddatida`}
        />
        <StatCard
          title="Umumiy qarzdorlik"
          value={formatUZS(totalDebt)}
          icon={AlertTriangle}
          subvalue="Qarzdor markazlar"
        />
        <StatCard
          title="Barcha tashkilotlar"
          value={`${organizations.length} ta`}
          icon={Building2}
          subvalue="SaaS tarmog'ida"
        />
      </div>

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tashkilot nomi..."
        hasActiveFilters={!!(search || statusFilter)}
        onReset={() => {
          setSearch('');
          setStatusFilter('');
        }}
        filters={[
          {
            id: 'status',
            label: 'Barcha holatlar',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'active', label: 'Faol' },
              { value: 'trial', label: 'Sinov davri' },
              { value: 'suspended', label: "To'xtatilgan" },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="Obunalar mavjud emas"
        emptyDescription="Hozircha hech qanday tashkilot obunasi mavjud emas."
      />
    </div>
  );
}
