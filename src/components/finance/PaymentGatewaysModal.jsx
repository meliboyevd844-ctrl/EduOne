import React, { useState } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  RefreshCw,
  Sliders,
  Lock,
  Globe
} from 'lucide-react';
import { Button } from '../ui/Button';

export function PaymentGatewaysModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('click');
  const [copiedKey, setCopiedKey] = useState('');

  const [gateways, setGateways] = useState({
    click: {
      enabled: true,
      serviceId: '28491',
      merchantId: '19482',
      secretKey: 'clk_sec_live_99281a8b27c6',
      testMode: false,
      autoReceipt: true,
    },
    payme: {
      enabled: true,
      merchantId: '64e83920af98234bc',
      secretKey: 'payme_sec_live_k8271hd8291a',
      testMode: false,
      autoReceipt: true,
    },
    uzum: {
      enabled: true,
      serviceId: 'uzum_eduone_001',
      secretKey: 'uzum_sec_991823746a',
      testMode: true,
      autoReceipt: false,
    },
    paynet: {
      enabled: false,
      terminalId: 'pnt_term_4910',
      secretKey: '',
      testMode: true,
      autoReceipt: false,
    }
  });

  const [statusMessage, setStatusMessage] = useState('');

  const handleCopy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setStatusMessage('To‘lov tizimlari sozlamalari muvaffaqiyatli saqlandi!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const webhookBaseUrl = 'https://api.eduone.uz/api/v1/payments/webhook/';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-[#141A26] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4169E1] to-[#2546B8] flex items-center justify-center text-white shadow-md">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                To‘lov tizimlari va Gateway sozlamalari
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click Up, Payme, Uzum Pay va Paynet integratsiyasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification */}
        {statusMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Gateway Tabs */}
        <div className="px-6 pt-4 flex items-center gap-2 border-b border-gray-100 dark:border-white/10 overflow-x-auto">
          {[
            { id: 'click', label: 'Click Up', badge: 'Faol', color: '#00A0E3' },
            { id: 'payme', label: 'Payme Merchant', badge: 'Faol', color: '#00CCCC' },
            { id: 'uzum', label: 'Uzum Pay / Nasiya', badge: 'Test rejimida', color: '#7000FF' },
            { id: 'paynet', label: 'Paynet', badge: 'Nofaol', color: '#FF6600' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-[#4169E1] text-[#4169E1] dark:text-amber-400 dark:border-amber-400 bg-blue-50/50 dark:bg-amber-400/10'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tab.color }}
              />
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                {gateways[tab.id]?.enabled ? 'On' : 'Off'}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
          {activeTab === 'click' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00A0E3] flex items-center justify-center text-white font-black text-sm">
                    CLICK
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      Click Merchant API (CLICK UP)
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      O‘quvchilar Click ilovasi va USSD (*880#) orqali to‘lov qilishadi
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gateways.click.enabled}
                    onChange={(e) =>
                      setGateways({
                        ...gateways,
                        click: { ...gateways.click, enabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00A0E3]"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Service ID (Xizmat ID)
                  </label>
                  <input
                    type="text"
                    value={gateways.click.serviceId}
                    onChange={(e) =>
                      setGateways({
                        ...gateways,
                        click: { ...gateways.click, serviceId: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F141E] text-gray-900 dark:text-white focus:outline-none focus:border-[#4169E1]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Merchant ID
                  </label>
                  <input
                    type="text"
                    value={gateways.click.merchantId}
                    onChange={(e) =>
                      setGateways({
                        ...gateways,
                        click: { ...gateways.click, merchantId: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F141E] text-gray-900 dark:text-white focus:outline-none focus:border-[#4169E1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Secret Key (Yashirin kalit)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={gateways.click.secretKey}
                    onChange={(e) =>
                      setGateways({
                        ...gateways,
                        click: { ...gateways.click, secretKey: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 pr-10 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F141E] text-gray-900 dark:text-white font-mono focus:outline-none focus:border-[#4169E1]"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Webhook endpoint */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Click Webhook URL (Click kabinetiga kiritiladigan havola)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${webhookBaseUrl}click`}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/30 text-gray-600 dark:text-gray-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(`${webhookBaseUrl}click`, 'click_wh')}
                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-medium hover:bg-gray-100 dark:hover:bg-white/10 flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedKey === 'click_wh' ? 'Nusxalandi' : 'Nusxa'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gateways.click.testMode}
                    onChange={(e) =>
                      setGateways({
                        ...gateways,
                        click: { ...gateways.click, testMode: e.target.checked },
                      })
                    }
                    className="rounded text-[#4169E1]"
                  />
                  <span>Sinov (Sandbox / Test) rejimi</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gateways.click.autoReceipt}
                    onChange={(e) =>
                      setGateways({
                        ...gateways,
                        click: { ...gateways.click, autoReceipt: e.target.checked },
                      })
                    }
                    className="rounded text-[#4169E1]"
                  />
                  <span>Avtomatik SMS chek yuborish</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'payme' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-cyan-50/60 dark:bg-cyan-500/10 border border-cyan-200/60 dark:border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00CCCC] flex items-center justify-center text-white font-black text-xs">
                    PAYME
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      Payme Business (Paycom Merchant)
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Ilova, sayt orqali yoki Payme Go QR skanerlash to‘lovlari
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gateways.payme.enabled}
                    onChange={(e) =>
                      setGateways({
                        ...gateways,
                        payme: { ...gateways.payme, enabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00CCCC]"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payme Merchant ID
                </label>
                <input
                  type="text"
                  value={gateways.payme.merchantId}
                  onChange={(e) =>
                    setGateways({
                      ...gateways,
                      payme: { ...gateways.payme, merchantId: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F141E] text-gray-900 dark:text-white focus:outline-none focus:border-[#4169E1]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payme Secret Key (Parol)
                </label>
                <input
                  type="password"
                  value={gateways.payme.secretKey}
                  onChange={(e) =>
                    setGateways({
                      ...gateways,
                      payme: { ...gateways.payme, secretKey: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F141E] text-gray-900 dark:text-white font-mono focus:outline-none focus:border-[#4169E1]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Paycom Webhook URL (JSON-RPC Endpoint)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${webhookBaseUrl}payme`}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/30 text-gray-600 dark:text-gray-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(`${webhookBaseUrl}payme`, 'payme_wh')}
                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-medium hover:bg-gray-100 dark:hover:bg-white/10 flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedKey === 'payme_wh' ? 'Nusxalandi' : 'Nusxa'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'uzum' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-500/10 border border-purple-200/60 dark:border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7000FF] flex items-center justify-center text-white font-black text-xs">
                    UZUM
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      Uzum Bank va Uzum Nasiya
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      O‘quv kursi to‘lovlarini muddatli to‘lov (Nasiya) orqali qabul qilish
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gateways.uzum.enabled}
                    onChange={(e) =>
                      setGateways({
                        ...gateways,
                        uzum: { ...gateways.uzum, enabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7000FF]"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Uzum Merchant Service ID
                </label>
                <input
                  type="text"
                  value={gateways.uzum.serviceId}
                  onChange={(e) =>
                    setGateways({
                      ...gateways,
                      uzum: { ...gateways.uzum, serviceId: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F141E] text-gray-900 dark:text-white focus:outline-none focus:border-[#4169E1]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Uzum Webhook URL
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${webhookBaseUrl}uzumpay`}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/30 text-gray-600 dark:text-gray-400 font-mono"
                />
              </div>
            </div>
          )}

          {activeTab === 'paynet' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Paynet Kassa Integratsiyasi</p>
                  <p className="text-[11px] mt-0.5 text-amber-700/80 dark:text-amber-300/80">
                    Paynet orqali o‘quvchilar ko‘chadagi Paynet shoxobchalari yoki bank terminallari orqali markaz ID raqamini aytib to‘lov qila olishadi.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Paynet Provider ID
                </label>
                <input
                  type="text"
                  value={gateways.paynet.terminalId}
                  onChange={(e) =>
                    setGateways({
                      ...gateways,
                      paynet: { ...gateways.paynet, terminalId: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F141E] text-gray-900 dark:text-white focus:outline-none focus:border-[#4169E1]"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Barcha kalitlar 256-bit AES shifrlash bilan saqlanadi
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Yopish
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Sozlamalarni saqlash
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
