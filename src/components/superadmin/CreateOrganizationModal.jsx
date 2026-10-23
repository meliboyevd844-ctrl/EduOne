import React, { useState } from 'react';
import { platformPlans, availableModules } from '../../data/saasData';
import { useWallpaper } from './WallpaperContext';
import {
  X,
  Building2,
  User,
  MapPin,
  CheckCircle2,
  Sparkles,
  Layers,
  Sliders,
  Bot,
  Send,
  CreditCard,
  Camera,
  GraduationCap,
  Users,
  MessageSquare,
  Calendar,
  Check,
  AlertCircle
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

export function CreateOrganizationModal({ isOpen, onClose, onCreateOrg }) {
  const { currentWallpaper } = useWallpaper();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    ownerName: '',
    ownerPhone: '+998 ',
    ownerEmail: '',
    branchName: 'Bosh Filial',
    branchCity: 'Toshkent',
    branchAddress: '',
    planId: 'plan-pro',
    enabledFeatures: ['claude_ai', 'telegram_bot', 'online_billing', 'parent_portal', 'timetable_conflict'],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleNameChange = (e) => {
    const val = e.target.value;
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === '' || prev.slug === autoSlug.slice(0, -1) ? autoSlug : prev.slug,
    }));
  };

  const handlePlanChange = (planId) => {
    const selectedPlan = platformPlans.find((p) => p.id === planId);
    setFormData((prev) => ({
      ...prev,
      planId,
      enabledFeatures: selectedPlan?.defaultModules || prev.enabledFeatures,
    }));
  };

  const toggleFeature = (featureCode) => {
    setFormData((prev) => {
      const exists = prev.enabledFeatures.includes(featureCode);
      const updated = exists
        ? prev.enabledFeatures.filter((c) => c !== featureCode)
        : [...prev.enabledFeatures, featureCode];
      return { ...prev, enabledFeatures: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!formData.name.trim() || !formData.slug.trim() || !formData.ownerName.trim()) {
      setErrorMessage("Iltimos, barcha majburiy maydonlarni (tashkilot nomi, subdomen, rahbar ismi) to‘ldiring!");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedPlan = platformPlans.find((p) => p.id === formData.planId) || platformPlans[1];
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase(),
        subdomain: `${formData.slug.trim().toLowerCase()}.eduone.uz`,
        owner_name: formData.ownerName.trim(),
        owner_phone: formData.ownerPhone.trim(),
        owner_email: formData.ownerEmail.trim() || `${formData.slug.trim().toLowerCase()}@eduone.uz`,
        status: 'active',
        plan_id: selectedPlan.code || selectedPlan.id,
        plan_name: selectedPlan.name,
        plan_price: selectedPlan.priceMonthly,
        enabled_features: formData.enabledFeatures,
        branches: [
          {
            name: formData.branchName || 'Bosh Filial',
            city: formData.branchCity || 'Toshkent',
            address: formData.branchAddress || 'Markaziy bino',
            phone: formData.ownerPhone.trim(),
            is_main: true,
            status: 'active',
          }
        ]
      };

      await onCreateOrg(payload);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Tashkilot yaratishda xatolik yuz berdi');
    }
  };

  const accentColor = currentWallpaper?.accentColor || '#3B82F6';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container with Frosted Glassmorphism Background */}
      <div
        className="w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col max-h-[92vh] text-white animate-in zoom-in-95 duration-200 relative select-none"
        style={{
          background: 'linear-gradient(180deg, rgba(13, 17, 25, 0.96) 0%, rgba(8, 11, 16, 0.98) 100%)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: `0 30px 100px rgba(0, 0, 0, 0.9), 0 0 1px 1px rgba(255, 255, 255, 0.12) inset, 0 0 40px -10px ${accentColor}25`,
        }}
      >
        {/* Subtle Ambient Radial Glow matching active wallpaper */}
        <div
          className="absolute -top-32 -left-32 w-80 h-80 rounded-full pointer-events-none opacity-20 blur-3xl"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full pointer-events-none opacity-15 blur-3xl"
          style={{ backgroundColor: accentColor }}
        />

        {/* Modal Header */}
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
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Yangi O‘quv Markazi Ochish
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                  SaaS Yangi Tenant
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Tashkilot rekvizitlari, ma'mur (admin), boshlang‘ich filial va ruxsat beriladigan modullar
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

        {/* Modal Form Body (Scrollable) */}
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 relative z-10 custom-scrollbar"
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
          }}
        >
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <span className="font-bold">Xatolik: </span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Section 1: Tashkilot va Subdomen */}
          <div
            className="p-4 sm:p-5 rounded-xl border border-white/10 space-y-4"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div className="flex items-center gap-2 pb-2.5 border-b border-white/10">
              <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                1. Tashkilot Nomi va Subdomeni
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Tashkilot nomi <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Cambridge IT School"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full bg-black/40 text-white placeholder-white/25 text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-amber-400 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Subdomen (Slug) <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="cambridge"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                      })
                    }
                    className="w-full bg-black/40 text-white placeholder-white/25 text-xs rounded-l-xl px-3.5 py-2.5 border border-white/10 focus:border-amber-400 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-amber-400/30 font-mono"
                  />
                  <span className="bg-white/10 text-amber-400 font-mono text-xs px-3.5 py-2.5 rounded-r-xl border-y border-r border-white/10 whitespace-nowrap font-semibold">
                    .eduone.uz
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Tashkilot Egasi (Admin) */}
          <div
            className="p-4 sm:p-5 rounded-xl border border-white/10 space-y-4"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div className="flex items-center gap-2 pb-2.5 border-b border-white/10">
              <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                2. Tashkilot Rahbari (Bosh Administrator)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Rahbar F.I.SH <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sardor Aliyev"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full bg-black/40 text-white placeholder-white/25 text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-amber-400 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Telefon raqam <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="+998 90 123 45 67"
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  className="w-full bg-black/40 text-white placeholder-white/25 text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-amber-400 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Email pochta
                </label>
                <input
                  type="email"
                  placeholder="admin@markaz.uz"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  className="w-full bg-black/40 text-white placeholder-white/25 text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-amber-400 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Boshlang'ich Filial */}
          <div
            className="p-4 sm:p-5 rounded-xl border border-white/10 space-y-4"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div className="flex items-center gap-2 pb-2.5 border-b border-white/10">
              <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                3. Boshlang‘ich Filial Ma'lumotlari
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Filial nomi
                </label>
                <input
                  type="text"
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  className="w-full bg-black/40 text-white placeholder-white/25 text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-amber-400 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Shahar / Viloyat
                </label>
                <input
                  type="text"
                  value={formData.branchCity}
                  onChange={(e) => setFormData({ ...formData, branchCity: e.target.value })}
                  className="w-full bg-black/40 text-white placeholder-white/25 text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-amber-400 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Manzil
                </label>
                <input
                  type="text"
                  placeholder="Ko‘cha, bino raqami"
                  value={formData.branchAddress}
                  onChange={(e) => setFormData({ ...formData, branchAddress: e.target.value })}
                  className="w-full bg-black/40 text-white placeholder-white/25 text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-amber-400 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Tarif Tanlash */}
          <div
            className="p-4 sm:p-5 rounded-xl border border-white/10 space-y-4"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div className="flex items-center gap-2 pb-2.5 border-b border-white/10">
              <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                4. Boshlang‘ich Tarif Rejasi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {platformPlans.map((plan) => {
                const isSelected = formData.planId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => handlePlanChange(plan.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
                      isSelected
                        ? 'border-amber-400 shadow-[0_0_25px_rgba(229,161,43,0.25)] scale-[1.02]'
                        : 'border-white/10 hover:border-white/25 opacity-75 hover:opacity-100'
                    }`}
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(229, 161, 43, 0.20) 0%, rgba(229, 161, 43, 0.05) 100%)'
                        : 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white tracking-tight">{plan.name}</span>
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-white/20" />
                      )}
                    </div>
                    <p className="text-sm font-extrabold text-amber-400 mt-2 font-mono">
                      {(plan.priceMonthly / 1000).toLocaleString()} ming so‘m/oy
                    </p>
                    <p className="text-[11px] text-white/50 mt-1">
                      {plan.branchLimit} ta filial • {plan.studentLimit} o‘quvchi
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: Ruxsat beriladigan modullar */}
          <div
            className="p-4 sm:p-5 rounded-xl border border-white/10 space-y-4"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                  5. Ruxsat Beriladigan Modullar
                </span>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                {formData.enabledFeatures.length} / {availableModules.length} ta tanlandi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {availableModules.map((module) => {
                const isChecked = formData.enabledFeatures.includes(module.code);
                const Icon = iconMap[module.icon] || Sparkles;

                return (
                  <div
                    key={module.code}
                    onClick={() => toggleFeature(module.code)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      isChecked
                        ? 'border-amber-400/60 shadow-[0_0_15px_rgba(229,161,43,0.12)]'
                        : 'border-white/10 hover:border-white/20 opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      background: isChecked
                        ? 'linear-gradient(135deg, rgba(229, 161, 43, 0.15) 0%, rgba(229, 161, 43, 0.03) 100%)'
                        : 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center transition-all shrink-0 ${
                        isChecked
                          ? 'bg-amber-400 text-black'
                          : 'border border-white/30 bg-white/5'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs font-bold ${isChecked ? 'text-amber-300' : 'text-white/90'}`}>
                          {module.name}
                        </span>
                        <span className="text-[10px] text-white/50 px-1.5 py-0.2 rounded-md bg-white/5 border border-white/10">
                          {module.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 mt-1 leading-relaxed line-clamp-2">
                        {module.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        {/* Modal Sticky Footer */}
        <div
          className="p-3.5 px-6 border-t border-white/10 flex items-center justify-between relative z-10"
          style={{
            background: 'rgba(6, 8, 12, 0.90)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              <strong className="text-white font-semibold">{formData.enabledFeatures.length} ta</strong> modul faollashtiriladi
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              Bekor qilish
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-lg active:scale-95 flex items-center gap-1.5 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                boxShadow: '0 0 25px rgba(37, 99, 235, 0.45)',
                border: '1px solid rgba(96, 165, 250, 0.35)',
              }}
            >
              {isSubmitting ? (
                <span>Yaratilmoqda...</span>
              ) : (
                <>
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Markazni yaratish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
