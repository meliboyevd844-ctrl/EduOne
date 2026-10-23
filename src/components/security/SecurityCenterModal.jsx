import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Lock,
  Smartphone,
  Eye,
  EyeOff,
  UserCheck,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Sliders,
  History,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '../ui/Button';

export function SecurityCenterModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('2fa'); // '2fa' | 'pin' | 'antileak' | 'sessions' | 'rbac'

  // Security toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [twoFactorMethod, setTwoFactorMethod] = useState('telegram'); // 'telegram' | 'sms' | 'authenticator'
  const [securityPin, setSecurityPin] = useState('8492');
  const [pinEnabled, setPinEnabled] = useState(true);
  const [antiLeakEnabled, setAntiLeakEnabled] = useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(60);
  const [statusMsg, setStatusMsg] = useState('');

  // Active Sessions
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 'sess-1',
      device: 'MacBook Pro 16" (macOS Sonoma)',
      browser: 'Google Chrome 129',
      ip: '84.54.120.45',
      location: 'Toshkent, O‘zbekiston',
      lastActive: 'Hozir faol (Joriy qurilma)',
      isCurrent: true,
    },
    {
      id: 'sess-2',
      device: 'iPhone 15 Pro Max (iOS 18)',
      browser: 'Safari Mobile',
      ip: '213.230.100.12',
      location: 'Samarqand, O‘zbekiston',
      lastActive: '32 daqiqa oldin',
      isCurrent: false,
    },
    {
      id: 'sess-3',
      device: 'Windows 11 PC (Admin Kassa)',
      browser: 'Microsoft Edge',
      ip: '84.54.120.48',
      location: 'Toshkent, O‘zbekiston',
      lastActive: '2 soat oldin',
      isCurrent: false,
    }
  ]);

  // RBAC Roles Matrix state
  const [permissions, setPermissions] = useState({
    view_finance: { owner: true, manager: true, cashier: true, teacher: false },
    accept_payment: { owner: true, manager: true, cashier: true, teacher: false },
    delete_student: { owner: true, manager: false, cashier: false, teacher: false },
    export_database: { owner: true, manager: false, cashier: false, teacher: false },
    edit_timetable: { owner: true, manager: true, cashier: false, teacher: false },
    view_full_phones: { owner: true, manager: false, cashier: false, teacher: false },
    send_mass_sms: { owner: true, manager: true, cashier: false, teacher: false },
  });

  const handleRevokeSession = (id) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== id));
    setStatusMsg("Qurilma masofadan tizimdan muvaffaqiyatli uzildi!");
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    setStatusMsg("Xavfsizlik va kirish siyosati sozlamalari muvaffaqiyatli saqlandi!");
    setTimeout(() => setStatusMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-[#121722] rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-red-50/50 via-amber-50/30 to-blue-50/50 dark:from-white/5 dark:to-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  EduOne Xavfsizlik va Himoya Markazi
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Bank darajasidagi himoya
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                2FA, Kassa PIN-kodi, sessiyalar nazorati va ma’lumotlar o‘g‘irlanishidan himoya
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification */}
        {statusMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Security Tabs */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-gray-100 dark:border-white/10 overflow-x-auto">
          {[
            { id: '2fa', label: 'Ikki bosqichli (2FA)', icon: Smartphone },
            { id: 'pin', label: 'Kassa PIN-kodi', icon: Lock },
            { id: 'antileak', label: 'Baza o‘g‘irlashdan himoya', icon: EyeOff },
            { id: 'sessions', label: 'Faol qurilmalar', icon: Laptop },
            { id: 'rbac', label: 'Huquqlar (RBAC)', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                  activeTab === tab.id
                    ? 'border-[#4169E1] text-[#4169E1] dark:text-amber-400 dark:border-amber-400 bg-blue-50/50 dark:bg-amber-400/10'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* TAB 1: 2FA */}
          {activeTab === '2fa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                    Ikki bosqichli autentifikatsiya (2FA)
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Tizimga har gal yangi brauzer yoki IP manzildan kirganda 6 xonali tasdiqlash kodi so‘raladi
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {twoFactorEnabled && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Tasdiqlash kodi qayerga yuborilsin?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'telegram', title: 'Telegram Bot', desc: 'Bepul va bir zumda', tag: 'Tavsiya etiladi' },
                      { id: 'sms', title: 'SMS Xabarnoma', desc: 'Telefon raqamga SMS', tag: 'Eskiz / PlayMobile' },
                      { id: 'authenticator', title: 'Google Authenticator', desc: 'TOTP ilovasi orqali', tag: 'Ofline kod' },
                    ].map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setTwoFactorMethod(m.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          twoFactorMethod === m.id
                            ? 'border-[#4169E1] bg-blue-50/60 dark:bg-amber-400/10 dark:border-amber-400 ring-2 ring-[#4169E1]/20'
                            : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{m.title}</p>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                            {m.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Kassa PIN-kodi */}
          {activeTab === 'pin' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                <p className="font-bold flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  Kassa xavfsizlik PIN-kodi (Firibgarlikning oldini olish)
                </p>
                <p className="text-[11px] mt-1 leading-relaxed opacity-90">
                  Kassir yoki administrator to‘lovni bekor qilganda, qaytarganda yoki kassadan pul chiqarganda 4 xonali PIN-kod kiritishi majburiy bo‘ladi.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Joriy Kassa PIN-kodi
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={securityPin}
                    onChange={(e) => setSecurityPin(e.target.value)}
                    className="w-full px-4 py-2.5 text-base tracking-widest font-mono rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F141E] text-gray-900 dark:text-white text-center focus:outline-none focus:border-[#4169E1]"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer p-2.5 rounded-xl border border-gray-200 dark:border-white/10">
                    <input
                      type="checkbox"
                      checked={pinEnabled}
                      onChange={(e) => setPinEnabled(e.target.checked)}
                      className="rounded text-[#4169E1]"
                    />
                    <span>Muhim amallarda PIN-kod so‘ralsin</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Baza o'g'irlashdan himoya (Anti-leak) */}
          {activeTab === 'antileak' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20">
                <h4 className="text-xs font-bold text-red-900 dark:text-red-300 flex items-center gap-2">
                  <EyeOff className="w-4 h-4" />
                  Mijozlar bazasi va telefon raqamlarni niqoblash (Anti-Theft)
                </h4>
                <p className="text-[11px] text-red-700/80 dark:text-red-300/80 mt-1 leading-relaxed">
                  Administrator yoki o‘qituvchilar ishdan ketayotganda barcha o‘quvchilar telefon raqamini ko‘chirib olmasligi uchun telefon raqamlari qisman yulduzcha qilib ko‘rsatiladi: <code className="bg-white/50 px-1 py-0.5 rounded font-mono">+998 90 *** ** 45</code>. To‘liq raqamni faqat Markaz Egasi ko‘ra oladi.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
                <label className="flex items-center justify-between text-xs text-gray-900 dark:text-white font-medium cursor-pointer">
                  <span>Barcha xodimlarga telefon raqamlarini niqoblash</span>
                  <input
                    type="checkbox"
                    checked={antiLeakEnabled}
                    onChange={(e) => setAntiLeakEnabled(e.target.checked)}
                    className="rounded text-[#4169E1]"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-gray-900 dark:text-white font-medium cursor-pointer">
                  <span>Excel / CSV eksportni faqat Ega (Owner) ga ruxsat berish</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-[#4169E1]"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-gray-900 dark:text-white font-medium cursor-pointer">
                  <span>Skrinshot olishga urinishlarni audit jurnalida qayd etish</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-[#4169E1]"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: Faol qurilmalar (Active Sessions) */}
          {activeTab === 'sessions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  Tizimga ulangan faol qurilmalar ({activeSessions.length} ta)
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSessions(activeSessions.filter((s) => s.isCurrent))}
                  className="text-xs text-red-500 hover:text-red-600 font-semibold"
                >
                  Barcha boshqa qurilmalarni uzish
                </button>
              </div>

              <div className="space-y-2">
                {activeSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#141A26] flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300">
                        <Laptop className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {sess.device}
                          </p>
                          {sess.isCurrent && (
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                              Joriy
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {sess.browser} • IP: {sess.ip} ({sess.location})
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{sess.lastActive}</p>
                      </div>
                    </div>

                    {!sess.isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleRevokeSession(sess.id)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Uzish</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: RBAC Huquqlar Matritsasi */}
          {activeTab === 'rbac' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Har bir rol uchun tizim imkoniyatlarini yoqing yoki cheklang
              </p>
              <div className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400">
                    <tr>
                      <th className="p-3">Ruxsat / Huquq</th>
                      <th className="p-3 text-center">Ega (Owner)</th>
                      <th className="p-3 text-center">Menejer</th>
                      <th className="p-3 text-center">Kassir</th>
                      <th className="p-3 text-center">O‘qituvchi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {[
                      { key: 'view_finance', label: 'Moliyaviy hisobotlarni ko‘rish' },
                      { key: 'accept_payment', label: 'To‘lov qabul qilish va chek chiqarish' },
                      { key: 'delete_student', label: 'O‘quvchini tizimdan butunlay o‘chirish' },
                      { key: 'export_database', label: 'Mijozlar bazasini Excelga yuklab olish' },
                      { key: 'edit_timetable', label: 'Dars jadvalini o‘zgartirish' },
                      { key: 'view_full_phones', label: 'To‘liq telefon raqamlarni ko‘rish' },
                      { key: 'send_mass_sms', label: 'Ommaviy SMS jo‘natish' },
                    ].map((row) => (
                      <tr key={row.key} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                        <td className="p-3 font-medium text-gray-900 dark:text-white">
                          {row.label}
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions[row.key]?.owner}
                            readOnly
                            disabled
                            className="rounded text-[#4169E1]"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions[row.key]?.manager}
                            onChange={(e) =>
                              setPermissions({
                                ...permissions,
                                [row.key]: { ...permissions[row.key], manager: e.target.checked },
                              })
                            }
                            className="rounded text-[#4169E1]"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions[row.key]?.cashier}
                            onChange={(e) =>
                              setPermissions({
                                ...permissions,
                                [row.key]: { ...permissions[row.key], cashier: e.target.checked },
                              })
                            }
                            className="rounded text-[#4169E1]"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions[row.key]?.teacher}
                            onChange={(e) =>
                              setPermissions({
                                ...permissions,
                                [row.key]: { ...permissions[row.key], teacher: e.target.checked },
                              })
                            }
                            className="rounded text-[#4169E1]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
          <Button variant="outline" size="sm" onClick={onClose}>
            Yopish
          </Button>

          <Button variant="primary" size="sm" onClick={handleSaveSecurity}>
            Xavfsizlik sozlamalarini saqlash
          </Button>
        </div>
      </div>
    </div>
  );
}
