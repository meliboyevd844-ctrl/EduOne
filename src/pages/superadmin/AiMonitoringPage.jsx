import React, { useState } from 'react';
import {
  Bot,
  ShieldCheck,
  Key,
  Terminal,
  Play,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';

const serverTools = [
  {
    name: 'get_platform_statistics',
    description: 'Super Admin uchun butun platforma ko‘rsatkichlarini (tashkilotlar, obunalar, umumiy o‘quvchilar) xavfsiz qaytarish.',
    authLevel: 'SUPER_ADMIN',
  },
  {
    name: 'get_organization_summary',
    description: 'Bitta tashkilot doirasida filiallar, guruhlar va to‘lov intizomi bo‘yicha yig‘ma hisobot.',
    authLevel: 'ORG_ADMIN',
  },
  {
    name: 'get_branch_report',
    description: 'Muayyan filialning xonalar bandligi, kunlik darslar va davomat xulosasi.',
    authLevel: 'BRANCH_ADMIN',
  },
  {
    name: 'get_student_learning_report',
    description: 'O‘quvchining test natijalari va davomati asosida shaxsiy o‘rganish tavsiyasi.',
    authLevel: 'TEACHER / PARENT',
  },
  {
    name: 'get_subscription_summary',
    description: 'Tashkilotning obunasi, qolgan kunlar va tarif limitlari sarhisobi.',
    authLevel: 'ORG_ADMIN',
  },
  {
    name: 'get_ai_usage_report',
    description: 'Token sarfi, so‘rovlar soni va xarajatlar monitoringi.',
    authLevel: 'SUPER_ADMIN',
  },
];

export function AiMonitoringPage() {
  const [testTool, setTestTool] = useState('get_platform_statistics');
  const [testOutput, setTestOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTestTool = async () => {
    setIsLoading(true);
    try {
      const resp = await api.queryAI(
        `Ushbu server-side tool natijasini qaytar: ${testTool}`,
        testTool
      );
      setTestOutput(resp);
    } catch (err) {
      setTestOutput({
        status: 'warning',
        message: err.message || 'Serverga ulanish imkoni bo‘lmadi',
        note: 'Claude API faqat serverda ANTHROPIC_API_KEY sozlanganida va Go backend server ishlayotganda to‘liq ulanadi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Claude AI boshqaruvi va iste’mol"
        description="Server-side Claude API, xavfsiz tool calling mexanizmi va tashkilotlar bo‘yicha token monitoringi"
        breadcrumbs={[
          { label: 'Super Admin', to: '/super-admin' },
          { label: 'AI monitoring' },
        ]}
        action={
          <div className="flex items-center gap-1.5 text-xs font-mono bg-[#EEF2FF] px-2.5 py-1.5 rounded-md border border-[#C7D2FE] text-[#4169E1]">
            <Key className="w-3.5 h-3.5" />
            <span>ANTHROPIC_API_KEY: Serverda faol</span>
          </div>
        }
      />

      {/* Security Architecture Card */}
      <div className="p-4 rounded-lg bg-white border border-[#E7EAF0] shadow-sm flex items-start gap-3">
        <div className="w-8 h-8 rounded-md bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#4169E1] shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#252936]">AI xavfsizlik va ruxsatlar tamoyili</h4>
          <p className="text-xs text-[#7C8494] mt-0.5 leading-relaxed">
            AI hech qachon to'g'ridan-to'g'ri ochiq SQL query bajarmaydi. Barcha amallar faqat Go server tomonida ruxsat tekshirilgan <strong>Server Tools</strong> orqali o'tadi. Tashkilotni bloklash kabi muhim o'zgarishlar esa inson tasdig'i talab qiladi.
          </p>
        </div>
      </div>

      {/* Live Tool Calling Simulator */}
      <div className="bg-white rounded-lg border border-[#E7EAF0] p-5 shadow-sm space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#4169E1]" />
            <h3 className="text-sm font-bold text-[#252936]">Server-Side Tool Calling Sinov Paneli</h3>
          </div>
          <p className="text-xs text-[#7C8494] mt-0.5">
            Claude API Go serverga so‘rov yuborganda chaqiriladigan ruxsat etilgan vositalarni sinash
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={testTool}
            onChange={(e) => setTestTool(e.target.value)}
            className="bg-white text-[#252936] text-xs rounded-md px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none flex-1 font-mono"
          >
            {serverTools.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name} (Ruxsat: {t.authLevel})
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            size="sm"
            icon={Play}
            onClick={runTestTool}
            disabled={isLoading}
            className="text-xs bg-[#4169E1] hover:bg-[#3557C7]"
          >
            {isLoading ? 'Chaqirilmoqda...' : 'Toolni sinash'}
          </Button>
        </div>

        {testOutput && (
          <div className="p-4 rounded-md bg-[#F8F9FA] border border-[#E7EAF0] font-mono text-xs overflow-x-auto text-[#252936]">
            <pre>{JSON.stringify(testOutput, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Ruxsat etilgan Server Tool'lar ro'yxati */}
      <div className="bg-white rounded-lg border border-[#E7EAF0] p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#4169E1]" />
          <h3 className="text-sm font-bold text-[#252936]">Ruxsat etilgan server vositalari (Whitelist)</h3>
        </div>

        <div className="space-y-2.5 mt-3">
          {serverTools.map((tool) => (
            <div
              key={tool.name}
              className="p-3 rounded-md bg-[#F8F9FA] border border-[#E7EAF0] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#252936]">{tool.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-[#E7EAF0] text-[#7C8494]">
                    {tool.authLevel}
                  </span>
                </div>
                <p className="text-xs text-[#7C8494] mt-0.5">{tool.description}</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#269B65] shrink-0 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Tekshirilgan</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
