import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { recentActivities } from '../../data/mockData';
import {
  CreditCard,
  UserPlus,
  CheckCircle2,
  FolderPlus,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function RecentActivityList() {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'payment':
        return {
          icon: CreditCard,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        };
      case 'student':
        return {
          icon: UserPlus,
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
        };
      case 'attendance':
        return {
          icon: CheckCircle2,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        };
      case 'group':
        return {
          icon: FolderPlus,
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
        };
    }
  };

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardHeader className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>So‘nggi harakatlar</CardTitle>
              <Badge variant="neutral" size="sm">Jonli efir</Badge>
            </div>
            <CardDescription>
              Tizimdagi real vaqtda ro‘y bergan amallar
            </CardDescription>
          </div>

          <button
            onClick={() => alert("To'liq faoliyat jurnali (Phase 2)")}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium flex items-center gap-1"
          >
            <span>Barchasi</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </CardHeader>

        {/* Activity Feed */}
        <div className="mt-4 space-y-3">
          {recentActivities.map((act, index) => {
            const { icon: Icon, color } = getActivityIcon(act.type);
            const isLast = index === recentActivities.length - 1;

            return (
              <div
                key={act.id}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors group relative"
              >
                {/* Icon */}
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5',
                    color
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                      {act.title}
                    </p>
                    <span className="text-[10px] text-[#717F9A] shrink-0 font-mono">
                      {act.time}
                    </span>
                  </div>

                  <p className="text-xs text-[#9CA7BC] mt-0.5 leading-snug">
                    {act.description}
                  </p>

                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-[#717F9A] border border-white/[0.05]">
                      {act.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.05] text-center">
        <span className="text-[11px] text-[#5C677D]">
          So‘nggi 24 soat ichida 48 ta amal qayd etildi
        </span>
      </div>
    </Card>
  );
}
