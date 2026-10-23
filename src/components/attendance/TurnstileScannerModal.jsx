import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  QrCode,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Send,
  Volume2,
  Users,
  Clock,
  Sparkles,
  ShieldCheck,
  DoorOpen,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { formatUZS } from '../../lib/utils';

export function TurnstileScannerModal({ isOpen, onClose, students = [], onMarkAttendance }) {
  if (!isOpen) return null;

  const [scannedResult, setScannedResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([
    {
      id: 1,
      name: 'Aliyev Sardor',
      time: '14:58',
      group: 'IELTS Intensive 7.5',
      status: 'success',
      debt: 0,
    },
    {
      id: 2,
      name: 'Madinabonu Karimova',
      time: '14:55',
      group: 'General English B2',
      status: 'warning',
      debt: 250000,
    },
    {
      id: 3,
      name: 'Javohir Toshmatov',
      time: '14:51',
      group: 'Frontend React Pro',
      status: 'success',
      debt: 0,
    }
  ]);

  const [cameraActive, setCameraActive] = useState(true);
  const [gateUnlocked, setGateUnlocked] = useState(false);

  // Simulate scanning a student
  const handleTestScan = (student) => {
    const hasDebt = (student.balance || 0) < 0;
    const nowTime = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

    const result = {
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      phone: student.phone || '+998 90 123 45 67',
      group: student.group_name || 'Ingliz tili B2',
      balance: student.balance || 0,
      hasDebt,
      time: nowTime,
      telegramSent: true,
    };

    setScannedResult(result);
    setGateUnlocked(true);

    // Add to history
    setScanHistory((prev) => [
      {
        id: Date.now(),
        name: result.name,
        time: nowTime,
        group: result.group,
        status: hasDebt ? 'warning' : 'success',
        debt: hasDebt ? Math.abs(student.balance) : 0,
      },
      ...prev.slice(0, 7),
    ]);

    if (onMarkAttendance) {
      onMarkAttendance(student.id, 'present');
    }

    setTimeout(() => {
      setGateUnlocked(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-[#121722] rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Virtual Turniket & QR / Face ID Skaneri
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Turniket Faol (Live)
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                O‘quvchi kartasini skanerlang • Avtomatik davomat va Telegram xabarnoma
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

        {/* Main Grid: Left Scanner Viewfinder, Right Info & Logs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 overflow-y-auto flex-1">
          {/* Left Viewfinder (7 cols) */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/10 bg-slate-950 text-white relative overflow-hidden">
            {/* Viewfinder Frame */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-indigo-500/30 bg-slate-900 flex flex-col items-center justify-center shadow-2xl">
              {/* Animated Laser Scanning Line */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce duration-1000" />

              {/* QR Target Frame corner brackets */}
              <div className="w-48 h-48 border-2 border-dashed border-cyan-400/60 rounded-2xl relative flex items-center justify-center">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-400 -mt-1 -ml-1 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-400 -mt-1 -mr-1 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-400 -mb-1 -ml-1 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-400 -mb-1 -mr-1 rounded-br-lg" />

                <QrCode className="w-24 h-24 text-white/20 animate-pulse" />
              </div>

              {/* Status Overlay */}
              <div className="absolute bottom-3 inset-x-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Camera className="w-3.5 h-3.5" />
                  Kamera: HD 1080p (Webcam)
                </span>
                <span className="text-white/60">Skaner kutmoqda...</span>
              </div>
            </div>

            {/* Quick Test Student Scanning Bar */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-white/60 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tezkor skanerlash uchun o‘quvchini tanlang (Demo):</span>
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {students.slice(0, 5).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleTestScan(s)}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white shrink-0 transition-all flex items-center gap-2 active:scale-95"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-amber-500 flex items-center justify-center font-bold text-[10px]">
                      {s.first_name?.[0] || 'O'}
                    </div>
                    <span className="truncate max-w-[100px]">{s.first_name} {s.last_name?.[0]}.</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Scanned Student Card & Gate Status (5 cols) */}
          <div className="md:col-span-5 p-6 flex flex-col justify-between space-y-4 bg-gray-50/40 dark:bg-black/20">
            {scannedResult ? (
              <div className="space-y-4 animate-in zoom-in-95 duration-200">
                {/* Gate Unlock Indicator */}
                <div
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                    gateUnlocked
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
                      gateUnlocked ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                  >
                    <DoorOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">
                      {gateUnlocked ? 'TURNIKET OCHILDI' : 'Turniket kutish holatida'}
                    </p>
                    <p className="text-[11px] opacity-80">
                      {gateUnlocked
                        ? 'Kirishga ruxsat berildi (Yashil chiroq)'
                        : 'Karta o‘qitilishini kuting'}
                    </p>
                  </div>
                </div>

                {/* Scanned Student Profile Card */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#141A26] border border-gray-200 dark:border-white/10 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4169E1] to-[#E5A12B] flex items-center justify-center text-white font-black text-lg shadow-md">
                      {scannedResult.name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                        {scannedResult.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {scannedResult.group}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs pt-2 border-t border-gray-100 dark:border-white/10">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Kirish vaqti:</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {scannedResult.time}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Davomat holati:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Keldi (Belgilandi)
                      </span>
                    </div>

                    {scannedResult.hasDebt && (
                      <div className="mt-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Qarzdorlik: {formatUZS(Math.abs(scannedResult.balance))}!</span>
                      </div>
                    )}
                  </div>

                  {/* Telegram Notification Badge */}
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs text-[#0088cc] flex items-center gap-2">
                    <Send className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[11px]">
                      Ota-onasiga Telegram orqali xabar yuborildi: <i>"{scannedResult.name} {scannedResult.time} da markazga kirdi"</i>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl text-gray-400">
                <QrCode className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-xs font-semibold">Hech kim skanerlanmadi</p>
                <p className="text-[11px] mt-0.5">O‘quvchi QR kartasini kameraga tuting</p>
              </div>
            )}

            {/* Scan Activity Log */}
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>So‘nggi o‘tganlar (Audit)</span>
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {scanHistory.map((h) => (
                  <div
                    key={h.id}
                    className="p-2 rounded-xl bg-white dark:bg-[#141A26] border border-gray-200 dark:border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{h.name}</p>
                      <p className="text-[10px] text-gray-400">{h.group}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[11px] text-gray-500">{h.time}</span>
                      {h.debt > 0 && (
                        <p className="text-[10px] font-bold text-red-500">Qarz</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
          <span className="text-xs text-gray-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Turniket SDK v2.4 • Hikvision, ZKTeco va QR kassa apparatlariga mos
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Yopish
          </Button>
        </div>
      </div>
    </div>
  );
}
