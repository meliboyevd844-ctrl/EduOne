import React, { useState } from 'react';
import {
  X,
  QrCode,
  Send,
  Copy,
  CheckCircle2,
  ExternalLink,
  CreditCard,
  Smartphone,
  Share2,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/Button';
import { formatUZS } from '../../lib/utils';

export function PaymentLinkModal({ isOpen, onClose, students = [] }) {
  if (!isOpen) return null;

  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [amount, setAmount] = useState(650000);
  const [purpose, setPurpose] = useState('Oktabr oyi o‘quv kursi to‘lovi');
  const [selectedProvider, setSelectedProvider] = useState('click');
  const [copied, setCopied] = useState(false);
  const [sentTelegram, setSentTelegram] = useState(false);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Dynamic Payment URL generator
  const getPaymentUrl = () => {
    const studentName = selectedStudent ? `${selectedStudent.first_name || ''} ${selectedStudent.last_name || ''}` : 'EduOne';
    if (selectedProvider === 'click') {
      return `https://my.click.uz/services/pay?service_id=28491&merchant_id=19482&amount=${amount}&transaction_param=${selectedStudentId || 'STD_01'}`;
    } else if (selectedProvider === 'payme') {
      const base64Param = btoa(`m=64e83920af98234bc;ac.student_id=${selectedStudentId};a=${amount * 100}`);
      return `https://checkout.paycom.uz/${base64Param}`;
    } else {
      return `https://uzumpay.uz/pay?merchant=uzum_eduone_001&amount=${amount}&order=${selectedStudentId}`;
    }
  };

  const paymentUrl = getPaymentUrl();

  const handleCopy = () => {
    navigator.clipboard?.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTelegram = () => {
    setSentTelegram(true);
    setTimeout(() => setSentTelegram(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#141A26] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-amber-50/50 dark:from-white/5 dark:to-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4169E1] to-[#E5A12B] flex items-center justify-center text-white shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                To‘lov havolasi va QR chek yaratish
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click Up va Payme orqali masofadan to‘lov qabul qilish
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

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Student selection */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              O‘quvchini tanlang
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F141E] text-gray-900 dark:text-white focus:outline-none focus:border-[#4169E1]"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} ({s.phone || 'Tel raqamsiz'}) - Balans: {formatUZS(s.balance || 0)}
                </option>
              ))}
            </select>
          </div>

          {/* Amount and Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                To‘lov summasi (so‘m)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                step="10000"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F141E] text-gray-900 dark:text-white font-bold text-blue-600 dark:text-amber-400 focus:outline-none focus:border-[#4169E1]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                To‘lov maqsadi
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F141E] text-gray-900 dark:text-white focus:outline-none focus:border-[#4169E1]"
              />
            </div>
          </div>

          {/* Provider selector */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              To‘lov tizimini tanlang
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'click', label: 'Click Up', color: '#00A0E3' },
                { id: 'payme', label: 'Payme', color: '#00CCCC' },
                { id: 'uzum', label: 'Uzum Pay', color: '#7000FF' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProvider(p.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedProvider === p.id
                      ? 'border-[#4169E1] bg-blue-50/80 dark:bg-amber-400/10 text-gray-900 dark:text-white ring-2 ring-[#4169E1]/20'
                      : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* QR Code and Invoice Card */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 flex flex-col items-center text-center space-y-3">
            {/* High visual simulated QR code */}
            <div className="w-36 h-36 bg-white p-2.5 rounded-xl border border-gray-300 shadow-inner flex flex-col items-center justify-between">
              <div className="w-full h-full border-2 border-dashed border-gray-400 rounded-lg p-2 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50">
                <QrCode className="w-20 h-20 text-gray-800" />
                <div className="absolute inset-0 bg-blue-500/10 animate-pulse pointer-events-none" />
                <span className="text-[9px] font-bold text-gray-600 mt-1 uppercase">
                  {selectedProvider} QR
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                {selectedStudent?.first_name} {selectedStudent?.last_name} uchun to‘lov
              </p>
              <p className="text-sm font-extrabold text-[#4169E1] dark:text-amber-400">
                {formatUZS(amount)}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">{purpose}</p>
            </div>

            {/* Link preview and copy */}
            <div className="w-full flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={paymentUrl}
                className="flex-1 px-2.5 py-1.5 text-[11px] font-mono rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F141E] text-gray-600 dark:text-gray-400 truncate"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-medium hover:bg-gray-100 dark:hover:bg-white/10 flex items-center gap-1 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Nusxalandi!' : 'Nusxa'}</span>
              </button>
            </div>
          </div>

          {/* Telegram notification status */}
          {sentTelegram && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                To‘lov havolasi o‘quvchining ota-onasiga Telegram orqali muvaffaqiyatli jo‘natildi!
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
          <Button variant="outline" size="sm" onClick={onClose}>
            Yopish
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Send}
              onClick={handleSendTelegram}
              className="text-[#0088cc] border-[#0088cc]/30 hover:bg-[#0088cc]/10"
            >
              Telegramga yuborish
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={ExternalLink}
              onClick={() => window.open(paymentUrl, '_blank')}
            >
              Havolani ochish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
