import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Download,
  Building2,
  Users,
  Wallet,
  Calendar
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { ChartCard } from '../../components/common/ChartCard';
import { Button } from '../../components/ui/Button';
import { formatUZS } from '../../lib/utils';

export function SuperAdminReportsPage() {
  const { organizations = [] } = useOutletContext();

  const totalStudents = organizations.reduce((acc, o) => acc + (o.studentsCount || 0), 0);
  const totalRevenue = organizations.reduce((acc, o) => acc + (o.amountPaid || 0), 0);
  const totalDebt = organizations.reduce((acc, o) => acc + (o.outstandingDebt || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hisobotlar va tahlil"
        description="EduOne platformasining umumiy tahlili, o'quv markazlari o'sishi va moliyaviy hisobotlar"
        breadcrumbs={[
          { label: 'Super Admin', to: '/super-admin' },
          { label: 'Hisobotlar va tahlil' },
        ]}
        action={
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => alert("Hisobot PDF formatida tayyorlanmoqda...")}
            className="text-xs"
          >
            PDF hisobotni yuklab olish
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Jami platforma o'quvchilari"
          value={totalStudents.toLocaleString()}
          icon={Users}
          subvalue={`${organizations.length} ta o'quv markazida`}
        />
        <StatCard
          title="Yig'ilgan obuna summasi"
          value={formatUZS(totalRevenue)}
          icon={Wallet}
          subvalue="Jami tushum"
        />
        <StatCard
          title="Qoldiq qarzlar"
          value={formatUZS(totalDebt)}
          icon={Building2}
          subvalue="Obunalar bo'yicha"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title="Oylik obuna o'sishi"
          subtitle="Oxirgi 6 oylik dinamika"
          hasData={totalRevenue > 0}
          emptyTitle="Yetarli tranzaksiya mavjud emas"
          emptyDescription="Platformada yangi oylik to'lovlar kiritilganda grafik avtomatik chiziladi."
        />

        <ChartCard
          title="Tashkilotlar ro'yxatdan o'tishi"
          subtitle="Oylar bo'yicha yangi markazlar"
          hasData={organizations.length > 0}
          emptyTitle="Tashkilotlar mavjud emas"
          emptyDescription="Tashkilotlar yaratilgach o'sish statistikasi aks etadi."
        >
          <div className="w-full flex items-center justify-around p-6">
            <div className="text-center">
              <span className="text-2xl font-bold text-[#4169E1]">{organizations.length}</span>
              <p className="text-xs text-[#7C8494] mt-1">Jami tashkilot</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-[#269B65]">
                {organizations.filter((o) => o.status === 'active').length}
              </span>
              <p className="text-xs text-[#7C8494] mt-1">Faol markaz</p>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
