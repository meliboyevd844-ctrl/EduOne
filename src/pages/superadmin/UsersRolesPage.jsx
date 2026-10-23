import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users,
  Search,
  Shield,
  Key,
  CheckCircle2,
  XCircle,
  Building2
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterBar } from '../../components/common/FilterBar';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';

export function UsersRolesPage() {
  const { organizations = [] } = useOutletContext();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [blockedUserIds, setBlockedUserIds] = useState([]);

  const superAdminUser = {
    id: 'u-superadmin-1',
    name: 'Sardor Ikromov',
    phone: '+998 90 000 00 01',
    email: 'superadmin@eduone.uz',
    role: 'SUPER_ADMIN',
    roleName: 'Platforma Super Admini',
    orgName: 'EduOne Platform',
    status: 'active',
    lastLogin: 'Hozir faol',
  };

  const orgUsers = organizations.map((org) => ({
    id: `u-owner-${org.id}`,
    name: org.ownerName,
    phone: org.ownerPhone,
    email: org.ownerEmail,
    role: 'ORG_ADMIN',
    roleName: 'Tashkilot Egasi',
    orgName: org.name,
    status: blockedUserIds.includes(`u-owner-${org.id}`) ? 'blocked' : org.status,
    lastLogin: 'Ro‘yxatdan o‘tgan',
  }));

  const users = [superAdminUser, ...orgUsers];

  const toggleUserStatus = (userId) => {
    if (userId === 'u-superadmin-1') return;
    setBlockedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      search === '' ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      u.orgName.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === '' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const columns = [
    {
      key: 'name',
      title: 'Foydalanuvchi',
      sortable: true,
      render: (val, user) => (
        <div>
          <div className="font-semibold text-[#252936]">{user.name}</div>
          <div className="text-[11px] text-[#7C8494] font-mono">{user.phone} • {user.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Roli (Vakolati)',
      render: (val, user) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
          user.role === 'SUPER_ADMIN'
            ? 'bg-[#EEF2FF] text-[#4169E1] border border-[#C7D2FE]'
            : 'bg-[#F8F9FA] text-[#252936] border border-[#E7EAF0]'
        }`}>
          {user.roleName}
        </span>
      ),
    },
    {
      key: 'orgName',
      title: 'Tashkilot',
      render: (val, user) => (
        <div className="flex items-center gap-1.5 text-xs text-[#252936]">
          <Building2 className="w-3.5 h-3.5 text-[#4169E1]" />
          <span>{user.orgName}</span>
        </div>
      ),
    },
    {
      key: 'lastLogin',
      title: 'Oxirgi faollik',
      render: (val, user) => (
        <span className="text-xs text-[#7C8494] font-mono">{user.lastLogin}</span>
      ),
    },
    {
      key: 'status',
      title: 'Holati',
      render: (val, user) => <StatusBadge status={user.status} />,
    },
    {
      key: 'actions',
      title: 'Amallar',
      align: 'right',
      render: (val, user) =>
        user.role !== 'SUPER_ADMIN' ? (
          <Button
            variant={user.status === 'active' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => toggleUserStatus(user.id)}
            className="text-[11px] h-7 px-2"
          >
            {user.status === 'active' ? 'Bloklash' : 'Qayta tiklash'}
          </Button>
        ) : (
          <span className="text-[11px] text-[#7C8494]">Boshqaruvchi</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Foydalanuvchilar va huquqlar"
        description="EduOne platformasida administratorlar, o'quv markazi rahbarlari va rollar (RBAC)"
        breadcrumbs={[
          { label: 'Super Admin', to: '/super-admin' },
          { label: 'Foydalanuvchilar va huquqlar' },
        ]}
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Ism, telefon yoki tashkilot..."
        hasActiveFilters={!!(search || roleFilter)}
        onReset={() => {
          setSearch('');
          setRoleFilter('');
        }}
        filters={[
          {
            id: 'role',
            label: 'Barcha rollar',
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
              { value: 'SUPER_ADMIN', label: 'Super Admin' },
              { value: 'ORG_ADMIN', label: 'Tashkilot Admini' },
            ],
          },
        ]}
      />

      <div className="space-y-3">
        <DataTable
          columns={columns}
          data={filtered}
          emptyTitle="Foydalanuvchilar topilmadi"
        />
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-lg border border-[#E7EAF0] p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#4169E1]" />
          <h3 className="text-sm font-bold text-[#252936]">Vakolatlar matritsasi (RBAC)</h3>
        </div>
        <p className="text-xs text-[#7C8494]">
          Tizimdagi har bir rolning ruxsatlari va cheklovlari
        </p>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E7EAF0] text-[10px] text-[#7C8494] uppercase tracking-wider bg-[#F8F9FA]">
                <th className="py-2.5 px-3">Vakolat Nomi</th>
                <th className="py-2.5 px-3 text-center text-[#4169E1]">Super Admin</th>
                <th className="py-2.5 px-3 text-center text-[#269B65]">Tashkilot Admini</th>
                <th className="py-2.5 px-3 text-center text-[#252936]">Filial Admini</th>
                <th className="py-2.5 px-3 text-center text-[#7C8494]">O‘qituvchi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]">
              {[
                { perm: 'Barcha tashkilotlarni ko‘rish va yaratish', sa: true, oa: false, ba: false, t: false },
                { perm: 'O‘z tashkiloti filiallarini boshqarish', sa: true, oa: true, ba: false, t: false },
                { perm: 'Tarif va obunalarni boshqarish', sa: true, oa: true, ba: false, t: false },
                { perm: 'O‘z filiali darslari va xonalarini sozlash', sa: true, oa: true, ba: true, t: false },
                { perm: 'Guruhlar davomatini olish va baholash', sa: true, oa: true, ba: true, t: true },
                { perm: 'Boshqa tashkilot ma’lumotlariga kirish', sa: true, oa: false, ba: false, t: false },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F8F9FA]">
                  <td className="py-2.5 px-3 font-medium text-[#252936]">{row.perm}</td>
                  <td className="py-2.5 px-3 text-center">{row.sa ? <CheckCircle2 className="w-4 h-4 text-[#4169E1] mx-auto" /> : <XCircle className="w-4 h-4 text-[#CBD1DC] mx-auto" />}</td>
                  <td className="py-2.5 px-3 text-center">{row.oa ? <CheckCircle2 className="w-4 h-4 text-[#269B65] mx-auto" /> : <XCircle className="w-4 h-4 text-[#CBD1DC] mx-auto" />}</td>
                  <td className="py-2.5 px-3 text-center">{row.ba ? <CheckCircle2 className="w-4 h-4 text-[#252936] mx-auto" /> : <XCircle className="w-4 h-4 text-[#CBD1DC] mx-auto" />}</td>
                  <td className="py-2.5 px-3 text-center">{row.t ? <CheckCircle2 className="w-4 h-4 text-[#269B65] mx-auto" /> : <XCircle className="w-4 h-4 text-[#CBD1DC] mx-auto" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
