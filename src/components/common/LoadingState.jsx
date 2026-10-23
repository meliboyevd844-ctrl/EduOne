import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState({
  message = "Ma'lumotlar yuklanmoqda...",
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-[#E7EAF0] shadow-sm ${className}`}
    >
      <Loader2 className="w-7 h-7 text-[#4169E1] animate-spin mb-3 stroke-[2]" />
      <p className="text-xs font-medium text-[#7C8494]">{message}</p>
    </div>
  );
}
