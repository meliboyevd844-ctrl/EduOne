import React, { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Building2,
  MapPin,
  Phone,
  Users,
  Search,
  ExternalLink,
  Plus
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterBar } from '../../components/common/FilterBar';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';

export function BranchesManagementPage() {
  const { organizations = [], openNewOrgModal } = useOutletContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  // Flatten all branches across all organizations
  const allBranches = useMemo(() => {
    const list = [];
    organizations.forEach((org) => {
      const branches = org.branches && org.branches.length > 0 ? org.branches : [
        {
          id: `${org.id}-main`,
          name: 'Bosh Filial',
          city: 'Toshkent',
          address: 'Markaziy bino',
          phone: org.ownerPhone,
          status: org.status,
          studentsCount: org.studentsCount || 0,
        }
      ];

      branches.forEach((b) => {
        list.push({
          ...b,
          orgId: org.id,
          orgName: org.name,
          subdomain: org.subdomain,
        });
      });
    });
    return list;
  }, [organizations]);

  const filtered = useMemo(() => {
    return allBranches.filter((b) => {
      const matchSearch =
        search === '' ||
        (b.name && b.name.toLowerCase().includes(search.toLowerCase())) ||
        (b.orgName && b.orgName.toLowerCase().includes(search.toLowerCase())) ||
        (b.city && b.city.toLowerCase().includes(search.toLowerCase()));
      const matchCity = cityFilter === '' || (b.city && b.city.toLowerCase() === cityFilter.toLowerCase());
      return matchSearch && matchCity;
    });
  }, [allBranches, search, cityFilter]);

  const columns = [
    {
      key: 'name',
      title: 'Filial nomi',
      sortable: true,
      render: (val, b) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#EEF2FF] border border-[#C7D2FE] text-[#4169E1] flex items-center justify-center font-bold text-xs shrink-0">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-[#252936]">{b.name}</div>
            <div className="text-[11px] text-[#7C8494] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#4169E1]" />
              <span>{b.city}, {b.address}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'orgName',
      title: 'Tashkilot',
      render: (val, b) => (
        <div>
          <span className="font-semibold text-[#252936]">{b.orgName}</span>
          <span className="block text-[11px] text-[#7C8494] font-mono">{b.subdomain}</span>
        </div>
      ),
    },
    {
      key: 'city',
      title: 'Shahar',
      render: (val, b) => (
        <span className="text-xs text-[#252936]">{b.city}</span>
      ),
    },
    {
      key: 'phone',
      title: 'Aloqa',
      render: (val, b) => (
        <span className="text-xs text-[#7C8494] font-mono flex items-center gap-1">
          <Phone className="w-3 h-3" />
          {b.phone || '—'}
        </span>
      ),
    },
    {
      key: 'studentsCount',
      title: "O'quvchilar",
      align: 'center',
      render: (val, b) => (
        <span className="font-semibold text-[#252936]">
          {b.studentsCount ? b.studentsCount.toLocaleString() : '0'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Holat',
      render: (val, b) => <StatusBadge status={b.status || 'active'} />,
    },
    {
      key: 'actions',
      title: 'Amallar',
      align: 'right',
      render: (val, b) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const org = organizations.find((o) => o.id === b.orgId);
            if (org) {
              sessionStorage.setItem('eduone_impersonating_org', JSON.stringify(org));
              navigate('/');
            }
          }}
          className="text-[11px] h-7 px-2 text-[#4169E1] border-[#C7D2FE] hover:bg-[#EEF2FF]"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Kirish</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Filiallar boshqaruvi"
        description="EduOne platformasida barcha o'quv markazlarining faol filiallari ro'yxati"
        breadcrumbs={[
          { label: 'Super Admin', to: '/super-admin' },
          { label: 'Filiallar' },
        ]}
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filial yoki tashkilot nomi..."
        hasActiveFilters={!!(search || cityFilter)}
        onReset={() => {
          setSearch('');
          setCityFilter('');
        }}
        filters={[
          {
            id: 'city',
            label: 'Barcha shaharlar',
            value: cityFilter,
            onChange: setCityFilter,
            options: [
              { value: 'Toshkent', label: 'Toshkent' },
              { value: 'Samarqand', label: 'Samarqand' },
              { value: 'Farg‘ona', label: 'Farg‘ona' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="Filiallar topilmadi"
        emptyDescription="Hozircha hech qanday filial kiritilmagan."
      />
    </div>
  );
}
