import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg p-5 border border-[#E7EAF0] shadow-sm relative overflow-hidden',
        hover && 'transition-all duration-150 hover:border-[#CBD1DC] hover:shadow-md cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={cn('flex items-center justify-between gap-4 mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={cn('text-sm font-semibold text-[#252936] tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={cn('text-xs text-[#7C8494] mt-0.5', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}
