import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '../ui/Button';

export function EmptyState({
  icon: Icon = Inbox,
  title = "Ma'lumot topilmadi",
  description = "Hozircha hech qanday ma'lumot mavjud emas. Yangi yozuv qo'shishingiz mumkin.",
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-lg border border-[#E7EAF0] shadow-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-[#F5F6F8] border border-[#E7EAF0] flex items-center justify-center text-[#7C8494] mb-3">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-semibold text-[#252936] mb-1">{title}</h3>
      <p className="text-xs text-[#7C8494] max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size="sm"
          variant="primary"
          icon={actionIcon}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
