import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { paymentMonthlyData } from '../../data/mockData';
import { Badge } from '../ui/Badge';
import { formatUZS, formatShortUZS, cn } from '../../lib/utils';
import { Coins, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export function PaymentOverviewChart() {
  const [activeMonth, setActiveMonth] = useState(paymentMonthlyData[paymentMonthlyData.length - 1]); // Okt

  // Maximum value for scale (e.g. 300 mln)
  const maxScale = 300000000;

  const totalOkt = activeMonth.received + activeMonth.pending;
  const collectionRate = ((activeMonth.received / totalOkt) * 100).toFixed(1);

  return (
    <Card className="flex flex-col justify-between">
      <div>
        {/* Header */}
        <CardHeader className="items-start sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Moliya va to‘lovlar tahlili</CardTitle>
              <Badge variant="emerald" size="sm">
                +14.2% o‘sish
              </Badge>
            </div>
            <CardDescription>
              So‘nggi 6 oylik to‘lov tushumlari va kutilayotgan qoldiqlar
            </CardDescription>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs text-[#9CA7BC]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>Tushum</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/70" />
              <span>Kutilayotgan</span>
            </div>
          </div>
        </CardHeader>

        {/* Selected Month Highlight */}
        <div className="mt-6 pt-4 pb-2">
          <div className="mb-4 p-3 rounded-xl bg-[#14181F]/90 border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {activeMonth.month}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  {activeMonth.month} oyi tushumi
                </p>
                <p className="text-[11px] text-[#717F9A]">
                  Yig‘ilish darajasi:{' '}
                  <span className="text-emerald-400 font-semibold">{collectionRate}%</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="text-[10px] text-[#717F9A] uppercase tracking-wider">Tushum</p>
                <p className="text-xs font-bold text-emerald-400">
                  {formatShortUZS(activeMonth.received)} UZS
                </p>
              </div>
              <div className="border-l border-white/[0.08] pl-3">
                <p className="text-[10px] text-[#717F9A] uppercase tracking-wider">Kutilmoqda</p>
                <p className="text-xs font-bold text-amber-400">
                  {formatShortUZS(activeMonth.pending)} UZS
                </p>
              </div>
            </div>
          </div>

          {/* Bar Chart Columns */}
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-1 pt-6 border-b border-white/[0.08]">
            {paymentMonthlyData.map((item) => {
              const receivedHeight = Math.round((item.received / maxScale) * 100);
              const pendingHeight = Math.round((item.pending / maxScale) * 100);
              const isSelected = activeMonth.month === item.month;

              return (
                <div
                  key={item.month}
                  onMouseEnter={() => setActiveMonth(item)}
                  onClick={() => setActiveMonth(item)}
                  className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                >
                  {/* Amount Indicator on top */}
                  <span
                    className={cn(
                      'text-[10px] font-semibold mb-2 transition-all duration-150',
                      isSelected ? 'text-emerald-400 scale-110 font-bold' : 'text-[#717F9A] group-hover:text-white'
                    )}
                  >
                    {formatShortUZS(item.received)}
                  </span>

                  {/* Dual Bars Side by Side */}
                  <div className="w-full max-w-[46px] flex items-end gap-1 h-full justify-center">
                    {/* Received Bar (Emerald) */}
                    <div
                      style={{ height: `${receivedHeight}%` }}
                      className={cn(
                        'w-1/2 rounded-t-md transition-all duration-300 relative',
                        isSelected
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'bg-emerald-500/80 group-hover:bg-emerald-500'
                      )}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 rounded-t" />
                    </div>

                    {/* Pending Bar (Amber) */}
                    <div
                      style={{ height: `${pendingHeight}%` }}
                      className={cn(
                        'w-1/2 rounded-t-md transition-all duration-300 relative',
                        isSelected
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                          : 'bg-amber-500/50 group-hover:bg-amber-500/70'
                      )}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-t" />
                    </div>
                  </div>

                  {/* Month Label */}
                  <div className="mt-2 text-center">
                    <span
                      className={cn(
                        'block text-xs font-medium transition-colors',
                        isSelected ? 'text-white font-bold' : 'text-[#717F9A] group-hover:text-[#CBD3E1]'
                      )}
                    >
                      {item.month}
                    </span>
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
          <Coins className="w-4 h-4 text-emerald-400" />
          <span>Oktabr tushumi: <strong className="text-white">{formatUZS(activeMonth.received)}</strong></span>
        </div>
        <span className="text-[11px] text-amber-400 font-medium">
          Qoldiq: {formatUZS(activeMonth.pending)}
        </span>
      </div>
    </Card>
  );
}
