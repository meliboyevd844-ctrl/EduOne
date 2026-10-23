import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/Button';

export function ConfirmDialog({
  isOpen = false,
  title = "Tasdiqlash",
  message = "Haqiqatan ham bu amalni bajarmoqchimisiz? Bu amalni orqaga qaytarib bo'lmasligi mumkin.",
  confirmLabel = "Tasdiqlash",
  cancelLabel = "Bekor qilish",
  isDestructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-lg border border-[#E7EAF0] shadow-modal w-full max-w-md p-5 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                isDestructive
                  ? 'bg-[#FDEEEC] text-[#D94B4B]'
                  : 'bg-[#EEF2FF] text-[#4169E1]'
              }`}
            >
              <AlertTriangle className="w-4 h-4 stroke-[2]" />
            </div>
            <h3 className="text-sm font-bold text-[#252936]">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-[#7C8494] hover:text-[#252936] p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#7C8494] leading-relaxed mb-6 pl-12">{message}</p>

        <div className="flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'primary'}
            size="sm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Bajarilmoqda..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
