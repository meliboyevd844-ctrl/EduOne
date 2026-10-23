import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Sliders,
  Building2,
  Sparkles,
  Bot,
  Send,
  CreditCard,
  Camera,
  GraduationCap,
  Users,
  MessageSquare,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { availableModules } from '../../data/saasData';

export function FeatureFlagsPage() {
  const { organizations = [], openFeaturesModal } = useOutletContext();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modullar va funksiyalar nazorati"
        description="Har bir o'quv markaziga berilgan funksional modullarni boshqarish va to'lov holatiga ko'ra cheklash"
        breadcrumbs={[
          { label: 'Super Admin', to: '/super-admin' },
          { label: 'Funksiyalar' },
        ]}
        action={
          <Button
            variant="outline"
            size="sm"
            icon={Building2}
            onClick={() => navigate('/super-admin/organizations')}
          >
            Tashkilotlar ro'yxati
          </Button>
        }
      />

      {/* Info Notice Card */}
      <div className="p-4 rounded-lg bg-white border border-[#E7EAF0] shadow-sm flex items-start gap-3">
        <div className="w-8 h-8 rounded-md bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#4169E1] shrink-0 mt-0.5">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#252936]">Markazlar kesimidagi funksiyalar boshqaruvi</h4>
          <p className="text-xs text-[#7C8494] mt-0.5 leading-relaxed">
            EduOne tizimida barcha funksiyalar har bir o'quv markaziga alohida taqsimlanadi. Agar tashkilot obuna to'lovini kechiktirsa, uning AI asistenti, Telegram boti yoki Billing tizimini darhol to'xtatib qo'yishingiz mumkin.
          </p>
        </div>
      </div>

      {/* Centers with enabled modules */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#252936] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#4169E1]" />
            Tashkilotlar va ularning faol modullari ({organizations.length})
          </h2>
        </div>

        {organizations.length === 0 ? (
          <div className="p-12 text-center rounded-lg bg-white border border-[#E7EAF0] shadow-sm text-xs text-[#7C8494]">
            <Building2 className="w-8 h-8 text-[#7C8494] mx-auto mb-2" />
            <p className="font-semibold text-[#252936]">Hozircha tashkilotlar mavjud emas</p>
            <p className="text-[11px] text-[#7C8494] mt-1">Yangi tashkilot yaratilganda unga biriktirilgan modullar shu yerda aks etadi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizations.map((org) => {
              const enabledList = org.enabledFeatures || [];
              return (
                <div
                  key={org.id}
                  className="bg-white rounded-lg border border-[#E7EAF0] p-4 shadow-sm flex flex-col justify-between hover:border-[#CBD1DC] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
                      <div>
                        <h3 className="text-sm font-bold text-[#252936]">{org.name}</h3>
                        <p className="text-xs text-[#7C8494] font-mono">{org.subdomain}</p>
                      </div>
                      <StatusBadge status={org.status} />
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-[#7C8494] uppercase tracking-wider">
                          Faol modullar ({enabledList.length}/{availableModules.length}):
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {availableModules.map((mod) => {
                          const isEnabled = enabledList.includes(mod.code);
                          return (
                            <span
                              key={mod.code}
                              className={`text-[11px] px-2 py-0.5 rounded border font-medium ${
                                isEnabled
                                  ? 'bg-[#EAF7F0] text-[#269B65] border-[#C2EAD5]'
                                  : 'bg-[#F5F6F8] text-[#7C8494] border-[#E7EAF0] line-through opacity-60'
                              }`}
                            >
                              {mod.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E7EAF0] flex items-center justify-between">
                    <span className="text-xs">
                      {org.status === 'suspended' ? (
                        <span className="text-[#D94B4B] font-semibold">Qarzdorlik tufayli to'xtatilgan</span>
                      ) : (
                        <span className="text-[#269B65] font-semibold">Barcha modullar barqaror ishlamoqda</span>
                      )}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      icon={Sliders}
                      onClick={() => openFeaturesModal(org)}
                      className="text-xs"
                    >
                      Modullarni sozlash
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
