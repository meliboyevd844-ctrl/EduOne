import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { api } from '../lib/api';
import {
  Settings,
  Building2,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Send,
  Save,
  Plus,
  Trash2,
  ShieldCheck,
  Check,
  Key,
  Layers,
  Sparkles,
  Bot,
  Lock,
  Smartphone
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SecurityCenterModal } from '../components/security/SecurityCenterModal';

export function SettingsPage() {
  const [activeOrg, setActiveOrg] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    orgName: 'EduOne Ta’lim Markazi',
    phone: '+998 71 200 00 00',
    email: 'info@eduone.uz',
    address: 'Toshkent sh., Yunusobod tumani, 4-mavze',
    smsProvider: 'eskiz',
    smsApiKey: 'eskiz-live-token-secret-xyz',
    telegramBotToken: '7192837492:AAE-EduOneBotSampleToken',
    telegramChannelId: '@eduone_updates',
    autoSendAttendance: true,
    autoSendDebtReminder: true,
    debtNotificationDay: 5,
    defaultLessonDuration: 90,
  });

  const [rooms, setRooms] = useState([]);
  const [newRoomModal, setNewRoomModal] = useState(false);
  const [newRoomData, setNewRoomData] = useState({ name: '', capacity: 16, equipment: 'Proyektor, Konditsioner' });

  const orgId = activeOrg?.id || 'default';

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('eduone_impersonating_org');
      if (raw) setActiveOrg(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    async function loadData() {
      const [sData, rData] = await Promise.all([
        api.getSettings(orgId),
        api.getRooms(orgId),
      ]);
      if (sData && Object.keys(sData).length > 0) {
        setSettings((prev) => ({ ...prev, ...sData }));
      }
      setRooms(rData);
    }
    loadData();
  }, [activeOrg]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    await api.updateSettings(orgId, settings);
    alert("Sozlamalar muvaffaqiyatli saqlandi!");
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomData.name.trim()) return;

    await api.createRoom(orgId, newRoomData);
    setNewRoomData({ name: '', capacity: 16, equipment: 'Proyektor, Konditsioner' });
    setNewRoomModal(false);
    const updated = await api.getRooms(orgId);
    setRooms(updated);
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm("Ushbu xonani ro‘yxatdan o‘chirmoqchimisiz?")) {
      await api.deleteRoom(orgId, id);
      const updated = await api.getRooms(orgId);
      setRooms(updated);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Bosh sahifa', href: '/' }, { label: 'Tizim Sozlamalari' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252936] flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#4169E1]" />
            Tizim Sozlamalari
          </h1>
          <p className="text-xs text-[#7C8494] mt-1">
            Filiallar, xonalar bazasi, SMS shlyuzi (Eskiz.uz), Telegram bot va to‘lov parametrlari
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={ShieldCheck}
            onClick={() => setSecurityModalOpen(true)}
            className="border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-xs"
          >
            Xavfsizlik & RBAC Himoyasi
          </Button>

          <Button
            variant="primary"
            icon={Save}
            onClick={handleSaveSettings}
          >
            Sozlamalarni Saqlash
          </Button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E7EAF0]">
        {[
          { id: 'general', label: 'Umumiy Ma’lumotlar', icon: Building2 },
          { id: 'sms', label: 'SMS Integratsiyasi (Eskiz)', icon: MessageSquare },
          { id: 'telegram', label: 'Telegram Bot & Ota-onalar', icon: Bot },
          { id: 'rooms', label: 'Auditoriyalar & Xonalar', icon: Layers },
          { id: 'security', label: 'Xavfsizlik & 2FA Himoyasi', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all border whitespace-nowrap',
                isActive
                  ? 'bg-[#EEF2FF] text-[#4169E1] border-[#4169E1]/30 shadow-xs'
                  : 'bg-transparent text-[#7C8494] border-transparent hover:text-[#252936] hover:bg-[#F5F6F8]'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: UMUMIY MA'LUMOTLAR */}
      {activeTab === 'general' && (
        <Card className="p-6 bg-white border-[#E7EAF0] space-y-6">
          <div>
            <h3 className="text-sm font-bold text-[#252936]">Ta’lim Markazi Profil Ma’lumotlari</h3>
            <p className="text-xs text-[#7C8494]">Kvitansiyalar va ota-onalar shartnomalarida aks etadigan rekvizitlar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#7C8494] mb-1.5">Markaz Rasmiy Nomi</label>
              <input
                type="text"
                value={settings.orgName}
                onChange={(e) => setSettings({ ...settings, orgName: e.target.value })}
                className="w-full bg-white text-[#252936] text-xs rounded-lg px-3.5 py-2.5 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7C8494] mb-1.5">Aloqa Telefoni</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full bg-white text-[#252936] text-xs rounded-lg px-3.5 py-2.5 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7C8494] mb-1.5">Elektron Pochta</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full bg-white text-[#252936] text-xs rounded-lg px-3.5 py-2.5 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7C8494] mb-1.5">Markaz Manzili</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-white text-[#252936] text-xs rounded-lg px-3.5 py-2.5 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E7EAF0] flex items-center justify-between">
            <span className="text-xs text-[#7C8494]">Tizim versiyasi: EduOne v2.4 SaaS Platform</span>
            <Button variant="primary" size="sm" onClick={handleSaveSettings}>
              Saqlash
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 2: SMS INTEGRATSIYASI (Eskiz.uz) */}
      {activeTab === 'sms' && (
        <Card className="p-6 bg-white border-[#E7EAF0] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#252936] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#4169E1]" />
                SMS Shlyuzi (Eskiz.uz API Integratsiyasi)
              </h3>
              <p className="text-xs text-[#7C8494]">
                O‘zbekiston bo‘ylab ota-onalarga avtomatik SMS xabarnomalar jo‘natish
              </p>
            </div>
            <Badge variant="success" size="sm" dot>Ulangan</Badge>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#7C8494] mb-1.5">SMS Provayderi</label>
              <select
                value={settings.smsProvider}
                onChange={(e) => setSettings({ ...settings, smsProvider: e.target.value })}
                className="w-full max-w-xs bg-white text-[#252936] text-xs rounded-lg px-3.5 py-2.5 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none font-medium"
              >
                <option value="eskiz">Eskiz.uz (O‘zbekiston)</option>
                <option value="playmobile">PlayMobile</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7C8494] mb-1.5">Eskiz.uz API Kaliti (Bearer Token)</label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={settings.smsApiKey}
                  onChange={(e) => setSettings({ ...settings, smsApiKey: e.target.value })}
                  className="w-full bg-white text-[#252936] text-xs rounded-lg px-3.5 py-2.5 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none font-mono"
                />
                <Button variant="secondary" size="sm" onClick={() => alert("Eskiz.uz balansi: 4,820 ta SMS mavjud.")}>
                  Balansni Tekshirish
                </Button>
              </div>
            </div>

            {/* Checkbox triggers */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSendAttendance}
                  onChange={(e) => setSettings({ ...settings, autoSendAttendance: e.target.checked })}
                  className="w-4 h-4 rounded text-[#4169E1] border-[#E7EAF0] focus:ring-0"
                />
                <span className="text-xs text-[#252936]">Davomat kiritilganda kelmagan o‘quvchilar ota-onasiga avtomatik SMS jo‘natish</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSendDebtReminder}
                  onChange={(e) => setSettings({ ...settings, autoSendDebtReminder: e.target.checked })}
                  className="w-4 h-4 rounded text-[#4169E1] border-[#E7EAF0] focus:ring-0"
                />
                <span className="text-xs text-[#252936]">Har oyning 5-sanasida qarzdor o‘quvchilar ota-onalariga avtomatik qarz eslatmasini yuborish</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E7EAF0] flex items-center justify-between">
            <span className="text-xs text-[#7C8494]">Eskiz.uz integratsiyasi faol</span>
            <Button variant="primary" size="sm" onClick={handleSaveSettings}>
              Saqlash
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 3: TELEGRAM BOT */}
      {activeTab === 'telegram' && (
        <Card className="p-6 bg-white border-[#E7EAF0] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#252936] flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#4169E1]" />
                EduOne Telegram Bot Integratsiyasi
              </h3>
              <p className="text-xs text-[#7C8494]">
                Ota-onalar va o‘quvchilar uchun bepul interaktiv Telegram boti
              </p>
            </div>
            <Badge variant="primary" size="sm" dot>Bot Online</Badge>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#7C8494] mb-1.5">Telegram Bot Token (BotFather dan olingan)</label>
              <input
                type="text"
                value={settings.telegramBotToken}
                onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                className="w-full bg-white text-[#252936] text-xs rounded-lg px-3.5 py-2.5 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7C8494] mb-1.5">Markaz Telegram Kanal / Guruhi</label>
              <input
                type="text"
                value={settings.telegramChannelId}
                onChange={(e) => setSettings({ ...settings, telegramChannelId: e.target.value })}
                className="w-full bg-white text-[#252936] text-xs rounded-lg px-3.5 py-2.5 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none font-mono"
              />
            </div>

            <div className="p-4 rounded-lg bg-[#F5F6F8] border border-[#E7EAF0] space-y-2 text-xs">
              <p className="font-semibold text-[#252936]">Bot orqali avtomatik jo‘natiladigan amallar:</p>
              <ul className="space-y-1 text-[#7C8494] list-disc list-inside">
                <li>Har bir darsdan so‘ng ota-onaga kunlik baho va davomat kvitansiyasi</li>
                <li>To‘lov amalga oshirilganda darhol elektron chek (kvitansiya)</li>
                <li>O‘quvchiga koinlar taqdim etilganda tabrik xabari</li>
                <li>Haftalik o‘zlashtirish reytingi va test natijalari</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E7EAF0] flex items-center justify-between">
            <span className="text-xs text-[#7C8494]">Telegram webhook aloqasi o‘rnatilgan</span>
            <Button variant="primary" size="sm" onClick={handleSaveSettings}>
              Saqlash
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 4: AUDITORIYALAR VA XONALAR */}
      {activeTab === 'rooms' && (
        <Card className="p-6 bg-white border-[#E7EAF0] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#252936] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#4169E1]" />
                Auditoriyalar & Dars Xonalari
              </h3>
              <p className="text-xs text-[#7C8494]">Dars jadvali va xonalar bandligini boshqarish uchun xonalar bazasi</p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => setNewRoomModal(true)}
            >
              Yangi Xona Qo‘shish
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {rooms.map((room) => (
              <div key={room.id} className="p-4 rounded-lg bg-[#F5F6F8] border border-[#E7EAF0] space-y-2 hover:border-[#4169E1]/30 transition-all">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#252936]">{room.name}</h4>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="text-[#7C8494] hover:text-[#D94B4B] p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[11px] text-[#7C8494] space-y-0.5">
                  <p>Sig‘imi: <strong className="text-[#252936]">{room.capacity} o‘rin</strong></p>
                  <p>Jihozlar: <span className="text-[#252936]">{room.equipment || 'Oddiy jihozlangan'}</span></p>
                  <p className="text-[10px] text-[#4169E1] font-medium">{room.branch || 'Bosh Filial'}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal: Yangi Xona Qo'shish */}
      {newRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-[#E7EAF0] rounded-xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#E7EAF0] flex items-center justify-between bg-[#F8F9FA]">
              <h3 className="text-sm font-bold text-[#252936]">Yangi Dars Xonasi Qo‘shish</h3>
              <button onClick={() => setNewRoomModal(false)} className="text-[#7C8494] hover:text-[#252936]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">Xona Nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Xona-5 (Tesla IT Lab)"
                  value={newRoomData.name}
                  onChange={(e) => setNewRoomData({ ...newRoomData, name: e.target.value })}
                  className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">Sig‘imi (Partalar soni)</label>
                <input
                  type="number"
                  value={newRoomData.capacity}
                  onChange={(e) => setNewRoomData({ ...newRoomData, capacity: e.target.value })}
                  className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">Jihozlanishi</label>
                <input
                  type="text"
                  placeholder="Masalan: Smart TV, Proyektor, Konditsioner"
                  value={newRoomData.equipment}
                  onChange={(e) => setNewRoomData({ ...newRoomData, equipment: e.target.value })}
                  className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF0]">
                <Button variant="secondary" size="sm" onClick={() => setNewRoomModal(false)}>
                  Bekor qilish
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Xonani Saqlash
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: XAVFSIZLIK & 2FA TAB CONTENT */}
      {activeTab === 'security' && (
        <Card className="p-6 bg-white border-[#E7EAF0] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
            <div>
              <h3 className="text-sm font-bold text-[#252936] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Markaz Xavfsizligi va Ma’lumotlar Himoyasi
              </h3>
              <p className="text-xs text-[#7C8494] mt-0.5">
                2FA, Kassa PIN-kodi, sessiyalar nazorati va ma’lumotlar sizib chiqishini oldini olish
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={ShieldCheck}
              onClick={() => setSecurityModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              To‘liq Himoya Markazini Ochish
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                2FA Ikki bosqichli himoya
              </span>
              <p className="text-[11px] text-emerald-700">
                Yangi qurilmadan kirishda Telegram orqali 6 xonali tasdiq kodi so‘raladi.
              </p>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-800">
                FAOL
              </span>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                Kassa Xavfsizlik PIN-kodi
              </span>
              <p className="text-[11px] text-amber-700">
                Kassir pul qaytarganda yoki to‘lov bekor qilinganda 4 xonali PIN kiritiladi.
              </p>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-800">
                HIMOYALANGAN
              </span>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1.5">
              <span className="text-xs font-bold text-[#4169E1] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Anti-Leak (Baza himoyasi)
              </span>
              <p className="text-[11px] text-blue-700">
                O‘quvchilar telefon raqamlari xodimlarga qisman yashirib ko‘rsatiladi.
              </p>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-200 text-blue-800">
                YOQILGAN
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Security Center Modal */}
      <SecurityCenterModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />
    </div>
  );
}
