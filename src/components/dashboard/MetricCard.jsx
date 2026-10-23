import React from 'react';
import {
  GraduationCap,
  Users,
  UserCheck,
  CreditCard,
  Coins,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

const iconMap = {
  GraduationCap,
  Users,
  UserCheck,
  CreditCard,
  Coins,
};

export function MetricCard({ metric }) {
  const Icon = iconMap[metric.icon] || Users;
  const isPositive = metric.isPositive;

  return (
    <div className="bg-white rounded-lg border border-[#E7EAF0] p-4 shadow-sm flex flex-col justify-between transition-all hover:border-[#CBD1DC]">
      {/* Top row: Label & Icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#7C8494] tracking-wide truncate">
          {metric.title}
        </span>
        <div className="w-8 h-8 rounded-md bg-[#F5F6F8] border border-[#E7EAF0] flex items-center justify-center text-[#4169E1] shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Middle row: Main Value */}
      <div className="mt-3">
        <div className="text-2xl font-bold text-[#252936] tracking-tight font-sans">
          {metric.value}
        </div>
      </div>

      {/* Bottom row: SubText and Comparison */}
      <div className="mt-3 pt-2.5 border-t border-[#F5F6F8] flex items-center justify-between text-[11px] text-[#7C8494]">
        <span className="truncate">{metric.subText}</span>
        {metric.change && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-medium shrink-0 ml-1',
              isPositive ? 'text-[#269B65]' : 'text-[#D94B4B]'
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {metric.change}
          </span>
        )}
      </div>
    </div>
  );
}
