import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft,
  Construction,
  Sparkles,
  Layers,
  CheckCircle2,
  Calendar,
  ShieldAlert
} from 'lucide-react';

export function PlaceholderPage({
  title,
  subtitle,
  moduleCode,
  plannedFeatures = [],
  phase = 'Phase 2',
}) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4 animate-in fade-in duration-300">
      {/* Back button and breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#9CA7BC] hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Bosh sahifaga qaytish</span>
        </Link>
      </div>

      {/* Hero Card */}
      <Card className="p-8 sm:p-10 border border-emerald-500/20 bg-gradient-to-b from-[#14181F] to-[#0E1116] relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/[0.05] rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-white/[0.06] text-[#9CA7BC] border border-white/[0.08]">
                {moduleCode}
              </span>
              <Badge variant="amber" size="sm" dot>
                {phase} da ishga tushiriladi
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              {title}
            </h1>

            <p className="text-sm text-[#9CA7BC] max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
            <Construction className="w-7 h-7" />
          </div>
        </div>

        {/* Informative Note */}
        <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-[#CBD3E1] leading-relaxed">
            EduOne arxitekturasi bosqichma-bosqich ishlab chiqilmoqda. 1-bosqichda Boshqaruv paneli (Dashboard) va umumiy dizayn tizimi poydevori to‘liq yakunlandi. Ushbu modul kelgusi backend integratsiyasi va API tayyor bo‘lishi bilan faollashtiriladi.
          </p>
        </div>
      </Card>

      {/* Planned Features Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#CBD3E1]">
            Rejalashtirilgan imkoniyatlar
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plannedFeatures.map((feat, index) => (
            <Card key={index} className="p-4 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">{feat.title}</h3>
                  <p className="text-[11px] text-[#717F9A] mt-1 leading-normal">
                    {feat.desc}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Navigation action */}
      <div className="pt-2 flex justify-start">
        <Link to="/">
          <Button variant="secondary" icon={ArrowLeft}>
            Bosh sahifaga qaytish
          </Button>
        </Link>
      </div>
    </div>
  );
}
