import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { weeklyAttendanceData } from '../../data/mockData';
import { Badge } from '../ui/Badge';
import { CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

export function AttendanceChart() {
  const [activeDay, setActiveDay] = useState(weeklyAttendanceData[4]); // Jum (Bugun) default

  // Maximum attendance reference for scaling (e.g. 1250 total capacity)
  const maxCapacity = 1250;

  return (
    <Card className="flex flex-col justify-between">
      <div>
        {/* Header */}
        <CardHeader className="items-start sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Haftalik davomat dinamikasi</CardTitle>
              <Badge variant="emerald" size="sm" dot dotPulse>
                Bugun 94.6%
              </Badge>
            </div>
            <CardDescription>
              Dushanba — Shanba oralig‘ida o‘quvchilar darsga qatnashishi tahlili
            </CardDescription>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs text-[#9CA7BC]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>Kelganlar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#202632]" />
              <span>Kelmadi</span>
            </div>
          </div>
        </CardHeader>

        {/* Chart Visualization Area */}
        <div className="mt-6 pt-4 pb-2">
          {/* Active Hover Detail Banner */}
          <div className="mb-4 p-3 rounded-xl bg-[#14181F]/90 border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {activeDay.day}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  {activeDay.day} kuni ({activeDay.date})
                </p>
                <p className="text-[11px] text-[#717F9A]">
                  Davomat darajasi:{' '}
                  <span className="text-emerald-400 font-medium">{activeDay.rate}%</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="text-[10px] text-[#717F9A] uppercase tracking-wider">Kelganlar</p>
                <p className="text-xs font-bold text-emerald-400">{activeDay.present} ta</p>
              </div>
              <div className="border-l border-white/[0.08] pl-3">
                <p className="text-[10px] text-[#717F9A] uppercase tracking-wider">Sababli/Sababsiz</p>
                <p className="text-xs font-bold text-rose-400">{activeDay.absent} ta</p>
              </div>
            </div>
          </div>

          {/* Bar Columns Container */}
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-1 pt-6 border-b border-white/[0.08]">
            {weeklyAttendanceData.map((item) => {
              const heightPercent = Math.round((item.present / maxCapacity) * 100);
              const isSelected = activeDay.day === item.day;

              return (
                <div
                  key={item.day}
                  onMouseEnter={() => setActiveDay(item)}
                  onClick={() => setActiveDay(item)}
                  className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                >
                  {/* Floating Rate Tag */}
                  <span
                    className={cn(
                      'text-[10px] font-semibold mb-2 transition-all duration-150',
                      isSelected ? 'text-emerald-400 scale-110 font-bold' : 'text-[#717F9A] group-hover:text-white'
                    )}
                  >
                    {item.rate}%
                  </span>

                  {/* Vertical Bar */}
                  <div className="w-full max-w-[42px] bg-[#191E27] rounded-t-lg h-full flex flex-col justify-end overflow-hidden relative">
                    {/* Absent placeholder / capacity fill */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={cn(
                        'w-full rounded-t-lg transition-all duration-300 relative',
                        isSelected
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'bg-emerald-500/80 group-hover:bg-emerald-500'
                      )}
                    >
                      {/* Top shine line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 rounded-t" />
                    </div>
                  </div>

                  {/* Day Label */}
                  <div className="mt-2 text-center">
                    <span
                      className={cn(
                        'block text-xs font-medium transition-colors',
                        isSelected ? 'text-white font-bold' : 'text-[#717F9A] group-hover:text-[#CBD3E1]'
                      )}
                    >
                      {item.day}
                    </span>
                    <span className="block text-[10px] text-[#5C677D]">{item.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs text-[#9CA7BC]">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>O‘rtacha haftalik ko‘rsatkich: <strong className="text-white">95.3%</strong></span>
        </div>
        <span className="text-[11px] text-[#717F9A]">Eng yuqori: Payshanba (96.4%)</span>
      </div>
    </Card>
  );
}
