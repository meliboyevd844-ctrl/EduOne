import React, { useState } from 'react';
import {
  X,
  Wallet,
  Receipt,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Banknote,
  Smartphone,
  Lock,
  Unlock,
  Calendar,
  Clock
} from 'lucide-react';
import { Button } from '../ui/Button';
import { formatUZS } from '../../lib/utils';

export function CashierShiftModal({ isOpen, onClose, payments = [] }) {
  if (!isOpen) return null;

  const [isShiftOpen, setIsShiftOpen] = useState(true);
  const [openingBalance, setOpeningBalance] = useState(1200000);
  const [cashCollected, setCashCollected] = useState(4800000);
  const [terminalCollected, setTerminalCollected] = useState(3200000);
  const [onlineCollected, setOnlineCollected] = useState(2500000);
  const [inkassatsiyaAmount, setInkassatsiyaAmount] = useState(4000000);
  const [statusMsg, setStatusMsg] = useState('');
  const [showZReport, setShowZReport] = useState(false);

  const totalCollected = cashCollected + terminalCollected + onlineCollected;
  const currentCashInRegister = openingBalance + cashCollected - (showZReport ? inkassatsiyaAmount : 0);

  const handleCloseShift = () => {
    setShowZReport(true);
    setStatusMsg("Kassa smenasi muvaffaqiyatli yopildi va Z-Hisobot shakllantirildi!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-[#141A26] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Kassa Smenasi & Z-Hisobot
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Kundalik kassa holati, inkassatsiya va fiskal yopilish
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
        <div className="p-6 space-y-4 overflow-y-auto">
          {statusMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Smena holati banneri */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-white/5 dark:to-white/5 border border-blue-100 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  Smena №: 142 — {isShiftOpen ? 'OCHIQ (FAOL)' : 'YOPILGAN'}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Kassir: Azizbek Karimov • Ochilgan vaqti: Bugun, 08:30
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300">
              Kassa ID: K-01
            </span>
          </div>

          {/* Financial Breakdown Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-1">
                <Banknote className="w-3.5 h-3.5" />
                <span>Naqd pul</span>
              </div>
              <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                {formatUZS(cashCollected)}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Kassadagi tushum</p>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20">
              <div className="flex items-center gap-1.5 text-[#4169E1] dark:text-blue-400 text-xs font-bold mb-1">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Terminal (Karta)</span>
              </div>
              <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                {formatUZS(terminalCollected)}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Uzcard / Humo</p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-bold mb-1">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Click / Payme</span>
              </div>
              <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                {formatUZS(onlineCollected)}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Onlayn to‘lov</p>
            </div>
          </div>

          {/* Smena Balans xulosasi */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-black/20 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Smena boshidagi qoldiq:</span>
              <span className="font-semibold">{formatUZS(openingBalance)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Kun davomidagi jami tushum:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                +{formatUZS(totalCollected)}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-white/10 flex justify-between text-gray-900 dark:text-white font-bold text-sm">
              <span>Hozir kassada mavjud naqd pul:</span>
              <span className="text-[#4169E1] dark:text-amber-400">
                {formatUZS(currentCashInRegister)}
              </span>
            </div>
          </div>

          {/* Z-Hisobot Preview if Shift is closed */}
          {showZReport && (
            <div className="p-4 rounded-xl bg-white dark:bg-[#0B0F17] border-2 border-dashed border-gray-300 dark:border-white/20 font-mono text-xs space-y-2 shadow-inner">
              <div className="text-center pb-2 border-b border-gray-200 dark:border-white/10">
                <p className="font-bold text-sm tracking-widest">*** Z - HISOBOT ***</p>
                <p className="text-[11px] text-gray-500">EduOne O‘quv Markazi — Bosh Filial</p>
                <p className="text-[10px] text-gray-400">Smena №142 | Sana: 19.10.2026 18:00</p>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Jami amallar soni:</span>
                  <span>18 ta</span>
                </div>
                <div className="flex justify-between">
                  <span>Naqd pul tushumi:</span>
                  <span>{formatUZS(cashCollected)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Terminal tushumi:</span>
                  <span>{formatUZS(terminalCollected)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Onlayn (Click/Payme):</span>
                  <span>{formatUZS(onlineCollected)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-dashed pt-1 mt-1">
                  <span>JAMI KUNLIK TUSHUM:</span>
                  <span>{formatUZS(totalCollected)}</span>
                </div>
                <div className="flex justify-between text-red-600 dark:text-red-400">
                  <span>Inkassatsiya qilindi:</span>
                  <span>-{formatUZS(inkassatsiyaAmount)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Ertangi kunga qoldiq:</span>
                  <span>{formatUZS(currentCashInRegister)}</span>
                </div>
              </div>
              <div className="text-center pt-2 border-t border-gray-200 dark:border-white/10 text-[10px] text-gray-400">
                Fiskal belgi: 894102948210948 | Kassa qulflangan
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
          <Button variant="outline" size="sm" onClick={onClose}>
            Yopish
          </Button>

          <div className="flex items-center gap-2">
            {showZReport ? (
              <Button
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={handlePrint}
              >
                Z-Hisobotni chop etish
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={Lock}
                onClick={handleCloseShift}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Smenani yopish & Z-Hisobot
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
