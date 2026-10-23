import React, { useState } from 'react';
import {
  Send,
  ShieldCheck,
  Globe,
  Key,
  CheckCircle2,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';

export function TelegramBotPage() {
  const [webhookStatus, setWebhookStatus] = useState({
    url: 'https://api.eduone.uz/api/v1/telegram/webhook',
    hasCustomCertificate: false,
    pendingUpdateCount: 0,
    lastErrorDate: null,
    status: 'online',
  });

  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const testBotWebhook = async () => {
    setIsTesting(true);
    try {
      const res = await fetch('http://127.0.0.1:8080/api/v1/telegram/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ update_id: Date.now() }),
      });
      if (res.ok) {
        setTestResult({
          status: 'success',
          text: 'Server Telegram webhook handleriga muvaffaqiyatli ulandi (HTTP 200 OK qaytdi).',
        });
      } else {
        setTestResult({
          status: 'error',
          text: `Server xato qaytardi: HTTP ${res.status}`,
        });
      }
    } catch {
      setTestResult({
        status: 'warning',
        text: 'Go backend serveri hozirda ulanmagan yoki javob bermadi.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Telegram bot va xabarnomalar"
        description="EduOne ko‘p tashkilotli bildirishnomalar tizimi, ota-onalarga avtomatik hisobotlar va bot monitoringi"
        breadcrumbs={[
          { label: 'Super Admin', to: '/super-admin' },
          { label: 'Telegram bot' },
        ]}
        action={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            disabled={isTesting}
            onClick={testBotWebhook}
            className="text-xs"
          >
            {isTesting ? 'Tekshirilmoqda...' : 'Webhookni tekshirish'}
          </Button>
        }
      />

      {testResult && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
            testResult.status === 'success'
              ? 'bg-[#EAF7F0] border-[#C2EAD5] text-[#269B65]'
              : testResult.status === 'warning'
              ? 'bg-[#FDF6E9] border-[#F9DFAC] text-amber-300'
              : 'bg-[#FDEEEC] border-[#F7C6C4] text-[#D94B4B]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{testResult.text}</span>
        </div>
      )}

      {/* Webhook Configuration & Security Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-lg border border-[#E7EAF0] p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E7EAF0]">
              <Globe className="w-4 h-4 text-[#4169E1]" />
              <h3 className="text-sm font-bold text-[#252936]">Webhook konfiguratsiyasi</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#7C8494]">
                  Webhook URL
                </label>
                <div className="mt-1 p-2 rounded-md bg-[#F8F9FA] border border-[#E7EAF0] font-mono text-xs text-[#4169E1] break-all select-all">
                  {webhookStatus.url}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#7C8494]">
                  Xavfsizlik tokeni (Environment)
                </label>
                <div className="mt-1 p-2 rounded-md bg-[#F8F9FA] border border-[#E7EAF0] font-mono text-xs text-[#269B65] flex items-center justify-between">
                  <span>TELEGRAM_BOT_TOKEN</span>
                  <StatusBadge status="active" label=".env orqali yuklangan" />
                </div>
              </div>

              <div className="p-3 rounded-md bg-[#F8F9FA] border border-[#E7EAF0] text-xs text-[#7C8494] space-y-1">
                <p>• Idempotent (takrorlanmaydigan) xabar tekshiruvi: <strong className="text-[#252936]">Faol</strong></p>
                <p>• Maxfiy webhook secret tokeni: <strong className="text-[#252936]">Yoqilgan</strong></p>
                <p>• Telegram API rate limit nazorati: <strong className="text-[#252936]">30 msg/sec</strong></p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E7EAF0] text-[11px] text-[#7C8494]">
            Haqiqiy tokenni faqat serverdagi <code>.env</code> fayliga kiritasiz.
          </div>
        </div>

        {/* Telegram Bot Capabilities */}
        <div className="bg-white rounded-lg border border-[#E7EAF0] p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E7EAF0]">
              <MessageSquare className="w-4 h-4 text-[#4169E1]" />
              <h3 className="text-sm font-bold text-[#252936]">Botning asosiy yo‘nalishlari</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-md bg-[#F8F9FA] border border-[#E7EAF0]">
                <p className="font-semibold text-[#252936]">1. Yangi mijozlar va Kurslar</p>
                <p className="text-[#7C8494] mt-0.5">Markaz kurslari, narxlari va sinov darslariga ro‘yxatdan o‘tkazish.</p>
              </div>

              <div className="p-2.5 rounded-md bg-[#F8F9FA] border border-[#E7EAF0]">
                <p className="font-semibold text-[#252936]">2. Ota-onalar va Davomat xabarnomasi</p>
                <p className="text-[#7C8494] mt-0.5">Farzandi darsga kelganda yoki qoldirganda ota-ona Telegramiga darhol xabar boradi.</p>
              </div>

              <div className="p-2.5 rounded-md bg-[#F8F9FA] border border-[#E7EAF0]">
                <p className="font-semibold text-[#252936]">3. To‘lovlar va Qarzdorlik eslatmalari</p>
                <p className="text-[#7C8494] mt-0.5">Oylik to‘lov muddati yaqinlashganda chek va to‘lov havolasini jo‘natish.</p>
              </div>

              <div className="p-2.5 rounded-md bg-[#F8F9FA] border border-[#E7EAF0]">
                <p className="font-semibold text-[#252936]">4. Claude AI Yordamchi</p>
                <p className="text-[#7C8494] mt-0.5">Foydalanuvchi savollariga faqat markaz ruxsat bergan ma’lumotlar asosida javob qaytarish.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E7EAF0] text-[11px] text-[#7C8494]">
            Xabarlar tarixi real vaqtda qayd etiladi.
          </div>
        </div>
      </div>
    </div>
  );
}
