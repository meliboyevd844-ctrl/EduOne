import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export function ErrorState({
  title = "Xatolik yuz berdi",
  description = "Ma'lumotlarni yuklashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.",
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 bg-white rounded-lg border border-[#F7C6C4] shadow-sm ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-[#FDEEEC] flex items-center justify-center text-[#D94B4B] mb-3">
        <AlertCircle className="w-5 h-5 stroke-[2]" />
      </div>
      <h3 className="text-sm font-semibold text-[#252936] mb-1">{title}</h3>
      <p className="text-xs text-[#7C8494] max-w-sm text-center mb-4 leading-relaxed">{description}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          size="sm"
          variant="outline"
          icon={RefreshCw}
        >
          Qayta yuklash
        </Button>
      )}
    </div>
  );
}
