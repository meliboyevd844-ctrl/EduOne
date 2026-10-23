import React from 'react';
import { cn } from '../../lib/utils';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1]/40 disabled:opacity-50 disabled:pointer-events-none select-none';

  const variants = {
    primary: 'bg-[#4169E1] hover:bg-[#3557C7] text-white shadow-sm active:scale-[0.98]',
    secondary: 'bg-[#F5F6F8] hover:bg-[#EAECEF] text-[#252936] border border-[#E7EAF0] hover:border-[#CBD1DC] active:scale-[0.98]',
    outline: 'bg-white hover:bg-[#F5F6F8] text-[#252936] border border-[#E7EAF0] hover:border-[#CBD1DC] active:scale-[0.98]',
    ghost: 'text-[#7C8494] hover:text-[#252936] hover:bg-[#F5F6F8] active:scale-[0.98]',
    destructive: 'bg-[#FDEEEC] hover:bg-[#FCD8D5] text-[#D94B4B] border border-[#F7C6C4] active:scale-[0.98]',
    success: 'bg-[#EAF7F0] hover:bg-[#D5EFE1] text-[#269B65] border border-[#C2EAD5] active:scale-[0.98]',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-4 py-2.5 gap-2.5',
    icon: 'p-2 text-sm',
    'icon-sm': 'p-1.5 text-xs',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(baseStyles, variants[variant] || variants.primary, sizes[size] || sizes.md, className)}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
