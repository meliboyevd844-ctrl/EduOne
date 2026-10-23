import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Globe,
  Key,
  Server,
  Save,
  CheckCircle2
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { SecurityCenterModal } from '../../components/security/SecurityCenterModal';

export function SuperAdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [config, setConfig] = useState({
    platformName: 'EduOne SaaS Core',
    domainSuffix: '.eduone.uz',
    defaultCurrency: 'UZS',
    defaultLanguage: 'uz',
    sessionTimeoutMinutes: 60,
    enforceTwoFactor: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tizim sozlamalari"
        description="EduOne platformasining global xavfsizlik, domen va server parametrlari"
        breadcrumbs={[
          { label: 'Super Admin', to: '/super-admin' },
          { label: 'Tizim sozlamalari' },
        ]}
        action={
          <Button
            variant="outline"
            size="sm"
            icon={ShieldCheck}
            onClick={() => setSecurityModalOpen(true)}
            className="text-xs h-8 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
          >
            Xavfsizlik Markazi (2FA / RBAC)
          </Button>
        }
      />

      {saved && (
        <div className="p-3 rounded-lg bg-[#EAF7F0] border border-[#C2EAD5] text-xs text-[#269B65] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Sozlamalar muvaffaqiyatli saqlandi.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-white rounded-lg border border-[#E7EAF0] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E7EAF0]">
            <Globe className="w-4 h-4 text-[#4169E1]" />
            <h3 className="text-sm font-bold text-[#252936]">Asosiy parametrlar</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#252936] mb-1">
                Platforma nomi
              </label>
              <input
                type="text"
                value={config.platformName}
                onChange={(e) => setConfig({ ...config, platformName: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-md bg-white border border-[#E7EAF0] text-[#252936] focus:border-[#4169E1] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#252936] mb-1">
                Subdomen prefiksi
              </label>
              <input
                type="text"
                value={config.domainSuffix}
                onChange={(e) => setConfig({ ...config, domainSuffix: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-md bg-white border border-[#E7EAF0] text-[#252936] font-mono focus:border-[#4169E1] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E7EAF0] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E7EAF0]">
            <Server className="w-4 h-4 text-[#4169E1]" />
            <h3 className="text-sm font-bold text-[#252936]">Infratuzilma va Xavfsizlik</h3>
          </div>

          <div className="space-y-3 text-xs text-[#7C8494]">
            <div className="flex items-center justify-between p-3 rounded-md bg-[#F8F9FA] border border-[#E7EAF0]">
              <div>
                <span className="font-semibold text-[#252936] block">Go REST API Server</span>
                <span>Port: 8080 • PostgreSQL 16</span>
              </div>
              <span className="font-semibold text-[#269B65]">Online</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-md bg-[#F8F9FA] border border-[#E7EAF0]">
              <div>
                <span className="font-semibold text-[#252936] block">Claude 3.5 Sonnet Tool Calling</span>
                <span>ANTHROPIC_API_KEY server muhitida yuklangan</span>
              </div>
              <span className="font-semibold text-[#269B65]">Ulangan</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={Save}
            className="bg-[#4169E1] hover:bg-[#3557C7]"
          >
            O'zgarishlarni saqlash
          </Button>
        </div>
      </form>

      {/* Enterprise Security Center Modal */}
      <SecurityCenterModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />
    </div>
  );
}
