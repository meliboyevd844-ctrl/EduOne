import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileText,
  Search,
  Download,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';

export function AuditLogsPage() {
  const { auditLogs = [] } = useOutletContext();
  const [search, setSearch] = useState('');

  const filtered = auditLogs.filter((log) =>
    (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
    (log.target || '').toLowerCase().includes(search.toLowerCase()) ||
    (log.adminName || log.admin_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (log.ip || log.ip_address || '').includes(search)
  );

  const exportToCSV = () => {
    if (filtered.length === 0) {
      alert("Eksport qilish uchun loglar mavjud emas");
      return;
    }
    const headers = "ID,Vaqt,Admin,Harakat,Obyekt,IP,Holat\n";
    const rows = filtered
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.adminName || l.admin_name || 'Admin'}","${(l.action || '').replace(/"/g, '""')}","${(l.target || '').replace(/"/g, '""')}","${l.ip || l.ip_address || '127.0.0.1'}","${l.status || 'success'}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `eduone_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      key: 'timestamp',
      title: 'Vaqt',
      sortable: true,
      render: (val, log) => (
        <span className="font-mono text-xs text-[#7C8494]">
          {String(log.timestamp).slice(0, 19).replace('T', ' ')}
        </span>
      ),
    },
    {
      key: 'adminName',
      title: 'Admin',
      render: (val, log) => (
        <span className="font-semibold text-[#252936]">
          {log.adminName || log.admin_name || 'Tizim'}
        </span>
      ),
    },
    {
      key: 'action',
      title: 'Bajarilgan harakat',
      render: (val, log) => (
        <span className="font-medium text-[#252936]">{log.action}</span>
      ),
    },
    {
      key: 'target',
      title: 'Obyekt (Target)',
      render: (val, log) => (
        <span className="text-xs text-[#7C8494] max-w-xs truncate block">{log.target}</span>
      ),
    },
    {
      key: 'ip',
      title: 'IP manzil',
      render: (val, log) => (
        <span className="font-mono text-xs text-[#7C8494]">
          {log.ip || log.ip_address || '127.0.0.1'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Holat',
      align: 'right',
      render: (val, log) => (
        <StatusBadge
          status={log.status === 'success' ? 'active' : log.status === 'warning' ? 'warning' : 'neutral'}
          label={log.status === 'success' ? 'Muvaffaqiyatli' : log.status === 'warning' ? 'Ogohlantirish' : 'Qayd'}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit jurnali"
        description="Barcha ma’muriy harakatlar, tashkilot yaratish, tarif o‘zgartirish va xavfsizlik hodisalari qaydi"
        breadcrumbs={[
          { label: 'Super Admin', to: '/super-admin' },
          { label: 'Audit jurnali' },
        ]}
        action={
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={exportToCSV}
            className="text-xs"
          >
            CSV eksport
          </Button>
        }
      />

      <div className="space-y-3">
        <DataTable
          columns={columns}
          data={filtered}
          emptyTitle="Audit jurnali bo'sh"
          emptyDescription="Hozircha tizimda hech qanday xavfsizlik yoki ma'muriy hodisa qayd etilmagan."
        />
      </div>
    </div>
  );
}
