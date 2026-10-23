import React from 'react';

export function StatusBadge({ status, label, className = '' }) {
  const normalized = (status || '').toLowerCase();

  const configs = {
    active: {
      bg: 'bg-[#EAF7F0]',
      text: 'text-[#269B65]',
      border: 'border-[#C2EAD5]',
      dot: 'bg-[#269B65]',
      defaultLabel: 'Faol',
    },
    trial: {
      bg: 'bg-[#FDF6E9]',
      text: 'text-[#E5A12B]',
      border: 'border-[#F9DFAC]',
      dot: 'bg-[#E5A12B]',
      defaultLabel: 'Sinov davri',
    },
    pending: {
      bg: 'bg-[#FDF6E9]',
      text: 'text-[#E5A12B]',
      border: 'border-[#F9DFAC]',
      dot: 'bg-[#E5A12B]',
      defaultLabel: 'Kutilmoqda',
    },
    expired: {
      bg: 'bg-[#FDEEEC]',
      text: 'text-[#D94B4B]',
      border: 'border-[#F7C6C4]',
      dot: 'bg-[#D94B4B]',
      defaultLabel: 'Muddati tugagan',
    },
    blocked: {
      bg: 'bg-[#FDEEEC]',
      text: 'text-[#D94B4B]',
      border: 'border-[#F7C6C4]',
      dot: 'bg-[#D94B4B]',
      defaultLabel: 'Bloklangan',
    },
    paid: {
      bg: 'bg-[#EAF7F0]',
      text: 'text-[#269B65]',
      border: 'border-[#C2EAD5]',
      dot: 'bg-[#269B65]',
      defaultLabel: "To'langan",
    },
    debt: {
      bg: 'bg-[#FDEEEC]',
      text: 'text-[#D94B4B]',
      border: 'border-[#F7C6C4]',
      dot: 'bg-[#D94B4B]',
      defaultLabel: 'Qarzdor',
    },
    partial: {
      bg: 'bg-[#FDF6E9]',
      text: 'text-[#E5A12B]',
      border: 'border-[#F9DFAC]',
      dot: 'bg-[#E5A12B]',
      defaultLabel: "Qisman to'langan",
    },
    neutral: {
      bg: 'bg-[#F5F6F8]',
      text: 'text-[#7C8494]',
      border: 'border-[#E7EAF0]',
      dot: 'bg-[#7C8494]',
      defaultLabel: normalized || 'Noma‘lum',
    },
  };

  const config = configs[normalized] || configs.neutral;
  const displayText = label || config.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{displayText}</span>
    </span>
  );
}
