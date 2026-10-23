import React from 'react';
import { Calendar, CreditCard, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function SubscriptionSummary({
  planName = 'Standart',
  billingCycle = 'monthly', // monthly / yearly
  price = 0,
  amountPaid = 0,
  debt = 0,
  expirationDate = null,
  nextDueDate = null,
  status = 'active',
  className = '',
}) {
  const formatUZS = (val) => new Intl.NumberFormat('uz-UZ').format(val || 0) + " so'm";

  return (
    <div className={`bg-white rounded-lg border border-[#E7EAF0] p-4 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-[#E7EAF0]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#4169E1]">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-[#252936]">{planName}</h4>
              <StatusBadge status={status} />
            </div>
            <p className="text-[11px] text-[#7C8494]">
              To'lov davri: {billingCycle === 'yearly' ? 'Yillik' : 'Oylik'}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-sm font-bold text-[#252936]">{formatUZS(price)}</div>
          <div className="text-[11px] text-[#7C8494]">belgilangan tarif</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#F8F9FA] p-2.5 rounded-md border border-[#E7EAF0]">
          <div className="text-[11px] text-[#7C8494] flex items-center gap-1 mb-1">
            <CheckCircle2 className="w-3 h-3 text-[#269B65]" /> To'langan
          </div>
          <div className="font-semibold text-[#269B65]">{formatUZS(amountPaid)}</div>
        </div>

        <div className="bg-[#F8F9FA] p-2.5 rounded-md border border-[#E7EAF0]">
          <div className="text-[11px] text-[#7C8494] flex items-center gap-1 mb-1">
            <AlertTriangle className="w-3 h-3 text-[#D94B4B]" /> Qarzdorlik
          </div>
          <div className={`font-semibold ${debt > 0 ? 'text-[#D94B4B]' : 'text-[#252936]'}`}>
            {formatUZS(debt)}
          </div>
        </div>

        <div className="bg-[#F8F9FA] p-2.5 rounded-md border border-[#E7EAF0]">
          <div className="text-[11px] text-[#7C8494] flex items-center gap-1 mb-1">
            <Calendar className="w-3 h-3 text-[#4169E1]" /> Keyingi to'lov
          </div>
          <div className="font-semibold text-[#252936]">{nextDueDate || '—'}</div>
        </div>

        <div className="bg-[#F8F9FA] p-2.5 rounded-md border border-[#E7EAF0]">
          <div className="text-[11px] text-[#7C8494] flex items-center gap-1 mb-1">
            <Calendar className="w-3 h-3 text-[#7C8494]" /> Tugash sanasi
          </div>
          <div className="font-semibold text-[#252936]">{expirationDate || '—'}</div>
        </div>
      </div>
    </div>
  );
}
