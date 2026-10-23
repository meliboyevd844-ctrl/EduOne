import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  dotPulse = false,
  className = '',
  ...props
}) {
  const variants = {
    emerald: 'bg-[#EAF7F0] text-[#269B65] border border-[#C2EAD5]',
    positive: 'bg-[#EAF7F0] text-[#269B65] border border-[#C2EAD5]',
    amber: 'bg-[#FDF6E9] text-[#E5A12B] border border-[#F9DFAC]',
    warning: 'bg-[#FDF6E9] text-[#E5A12B] border border-[#F9DFAC]',
    rose: 'bg-[#FDEEEC] text-[#D94B4B] border border-[#F7C6C4]',
    destructive: 'bg-[#FDEEEC] text-[#D94B4B] border border-[#F7C6C4]',
    sky: 'bg-[#EEF2FF] text-[#4169E1] border border-[#C7D2FE]',
    blue: 'bg-[#EEF2FF] text-[#4169E1] border border-[#C7D2FE]',
    neutral: 'bg-[#F5F6F8] text-[#7C8494] border border-[#E7EAF0]',
  };

  const dotColors = {
    emerald: 'bg-[#269B65]',
    positive: 'bg-[#269B65]',
    amber: 'bg-[#E5A12B]',
    warning: 'bg-[#E5A12B]',
    rose: 'bg-[#D94B4B]',
    destructive: 'bg-[#D94B4B]',
    sky: 'bg-[#4169E1]',
    blue: 'bg-[#4169E1]',
    neutral: 'bg-[#7C8494]',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md select-none',
        variants[variant] || variants.neutral,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {dotPulse && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColors[variant] || 'bg-[#269B65]'
              )}
            />
          )}
          <span
            className={cn(
              'relative inline-flex rounded-full h-1.5 w-1.5',
              dotColors[variant] || 'bg-[#269B65]'
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}
