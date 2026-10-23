import React from 'react';
import { BarChart3 } from 'lucide-react';
import { EmptyState } from './EmptyState';

export function ChartCard({
  title,
  subtitle,
  actions,
  hasData = false,
  emptyTitle = "Ma'lumot mavjud emas",
  emptyDescription = "Grafikni shakllantirish uchun yetarli tranzaksiya yoki yozuvlar mavjud emas.",
  children,
  className = '',
}) {
  return (
    <div
      className={`bg-white rounded-lg border border-[#E7EAF0] p-4 shadow-sm flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#252936] tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-[#7C8494] mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-1.5">{actions}</div>}
      </div>

      <div className="flex-1 min-h-[220px] flex items-center justify-center">
        {hasData ? (
          children
        ) : (
          <EmptyState
            icon={BarChart3}
            title={emptyTitle}
            description={emptyDescription}
            className="border-none shadow-none rounded-none p-6"
          />
        )}
      </div>
    </div>
  );
}
