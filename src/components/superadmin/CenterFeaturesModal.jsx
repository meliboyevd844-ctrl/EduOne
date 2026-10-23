import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { availableModules } from '../../data/saasData';
import { useWallpaper } from './WallpaperContext';
import {
  X,
  Sliders,
  ShieldAlert,
  Bot,
  Send,
  CreditCard,
  Camera,
  GraduationCap,
  Users,
  MessageSquare,
  Calendar,
  Sparkles,
  Zap,
  Power,
  AlertTriangle
} from 'lucide-react';

const iconMap = {
  Bot,
  Send,
  CreditCard,
  Camera,
  GraduationCap,
  Users,
  MessageSquare,
  Calendar,
};

export function CenterFeaturesModal({ organization, isOpen, onClose, onToggleFeature, onBatchUpdateFeatures }) {
  const { currentWallpaper } = useWallpaper();

  if (!isOpen || !organization) return null;

  const enabledFeatures = organization.enabledFeatures || [];
  const activeCount = enabledFeatures.length;
  const totalCount = availableModules.length;

  const handleToggle = (featureCode) => {
    onToggleFeature(organization.id, featureCode);
  };

  const handleEnableAll = () => {
    const allCodes = availableModules.map((m) => m.code);
    onBatchUpdateFeatures(organization.id, allCodes, "Barcha modullar yoqildi");
  };

  const handleOverdueRestriction = () => {
    const basicCodes = ['timetable_conflict'];
    onBatchUpdateFeatures(organization.id, basicCodes, "To‘lov kechikkanligi sababli qo‘shimcha modullar o‘chirildi");
  };

  const handleDisableAll = () => {
    onBatchUpdateFeatures(organization.id, [], "Barcha modullar to‘xtatildi (To‘liq muzlatish)");
  };

  const accentColor = currentWallpaper?.accentColor || '#3B82F6';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col max-h-[92vh] text-white animate-in zoom-in-95 duration-200 relative select-none"
        style={{
          background: 'linear-gradient(180deg, rgba(13, 17, 25, 0.96) 0%, rgba(8, 11, 16, 0.98) 100%)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: `0 30px 100px rgba(0, 0, 0, 0.9), 0 0 1px 1px rgba(255, 255, 255, 0.12) inset, 0 0 40px -10px ${accentColor}25`,
        }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          className="absolute -top-32 -left-32 w-80 h-80 rounded-full pointer-events-none opacity-20 blur-3xl"
          style={{ backgroundColor: accentColor }}
        />

        {/* Header */}
        <div
          className="p-4 sm:px-6 border-b border-white/10 flex items-center justify-between relative z-10"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                boxShadow: '0 0 20px rgba(37, 99, 235, 0.45)',
              }}
            >
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {organization.name}
                </h2>
                <StatusBadge status={organization.status} />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-amber-300 border border-white/10 font-medium">
                  {organization.planName || 'Tarif'}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5 font-mono">
                {organization.subdomain} • <span className="text-emerald-400 font-semibold">{activeCount}/{totalCount} ta modul faol</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            title="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notice & Quick Batch Actions */}
        <div
          className="p-4 sm:px-6 border-b border-white/10 space-y-3 relative z-10"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div className="flex items-start gap-2.5 text-xs text-white/70">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white font-semibold">Tezkor Ma’muriy Nazorat:</strong> Agar markaz obuna to‘lovini kechiktirsa yoki qoidalarni buzsa, quyidagi istalgan modulni alohida o‘chirib qo‘yishingiz mumkin. Bu o‘zgarish darhol markaz foydalanuvchilari uchun kuchga kiradi va audit jurnaliga yoziladi.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleEnableAll}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Barcha modullarni yoqish (ON)</span>
            </button>

            <button
              onClick={handleOverdueRestriction}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1.5"
              title="AI, Telegram va Online to'lovlarni o'chiradi, faqat bazaviy taqvim qoladi"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Qarzdorlik cheklovi (AI/Botni o‘chirish)</span>
            </button>

            <button
              onClick={handleDisableAll}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-300 bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 transition-all flex items-center gap-1.5"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Barchasini to‘xtatish (OFF)</span>
            </button>
          </div>
        </div>

        {/* Modules List with Individual Toggles */}
        <div
          className="p-5 sm:p-6 overflow-y-auto space-y-2.5 flex-1 relative z-10 custom-scrollbar"
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
          }}
        >
          {availableModules.map((module) => {
            const Icon = iconMap[module.icon] || Sparkles;
            const isEnabled = enabledFeatures.includes(module.code);

            return (
              <div
                key={module.code}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isEnabled
                    ? 'border-amber-400/40 shadow-[0_0_15px_rgba(229,161,43,0.1)]'
                    : 'border-white/10 opacity-70 hover:opacity-100'
                }`}
                style={{
                  background: isEnabled
                    ? 'linear-gradient(135deg, rgba(229, 161, 43, 0.12) 0%, rgba(229, 161, 43, 0.02) 100%)'
                    : 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isEnabled
                        ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                        : 'bg-white/5 text-white/40 border border-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-white tracking-tight">{module.name}</h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-white/50 border border-white/10">
                        {module.code}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-white/60">
                        {module.category}
                      </span>
                      {!isEnabled && (
                        <span className="text-[10px] text-red-400 font-semibold px-1.5 py-0.2 rounded bg-red-500/15 border border-red-500/30">
                          O‘chirilgan
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-white/50 mt-1 leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </div>

                {/* Individual Toggle Switch */}
                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                  <span className={`text-[11px] font-bold ${isEnabled ? 'text-emerald-400' : 'text-white/40'}`}>
                    {isEnabled ? 'FAOL' : 'O‘CHIQ'}
                  </span>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    onClick={() => handleToggle(module.code)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? 'bg-amber-400' : 'bg-white/20'
                    }`}
                    title={isEnabled ? "Ushbu modulni o'chirish" : "Ushbu modulni yoqish"}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow-sm transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="p-3.5 px-6 border-t border-white/10 flex items-center justify-between relative z-10"
          style={{
            background: 'rgba(6, 8, 12, 0.90)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <span className="text-xs text-white/50">
            O‘zgarishlar darhol backendga saqlanadi va API darajasida nazorat qilinadi
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-lg active:scale-95 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              boxShadow: '0 0 20px rgba(37, 99, 235, 0.45)',
              border: '1px solid rgba(96, 165, 250, 0.35)',
            }}
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
