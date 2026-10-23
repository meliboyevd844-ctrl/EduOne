import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({
  title,
  value,
  subvalue,
  icon: Icon,
  trend, // { value: '+12%', positive: true, label: "o'tgan oyga nisbatan" }
  badge,
  className = '',
}) {
  return (
    <div
      className={`bg-white rounded-lg border border-[#E7EAF0] p-4 shadow-sm transition-all duration-150 hover:border-[#CBD1DC] ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-medium text-[#7C8494] truncate">{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-md bg-[#F5F6F8] border border-[#E7EAF0] flex items-center justify-center text-[#4169E1] shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold text-[#252936] tracking-tight">{value}</span>
        {badge && <span>{badge}</span>}
      </div>

      {(trend || subvalue) && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#7C8494] mt-2 pt-2 border-t border-[#F5F6F8]">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-medium ${
                trend.positive ? 'text-[#269B65]' : 'text-[#D94B4B]'
              }`}
            >
              {trend.positive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend.value}
            </span>
          )}
          {trend?.label && <span>{trend.label}</span>}
          {subvalue && !trend && <span>{subvalue}</span>}
        </div>
      )}
    </div>
  );
}
