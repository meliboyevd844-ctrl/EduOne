import React from 'react';
import { cn } from '../../lib/utils';

export function Input({
  className = '',
  icon: Icon,
  endIcon: EndIcon,
  shortcut,
  type = 'text',
  placeholder = '',
  ...props
}) {
  return (
    <div className="relative flex items-center w-full">
      {Icon && (
        <span className="absolute left-3 text-[#7C8494] pointer-events-none">
          <Icon className="w-4 h-4" />
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={cn(
          'w-full bg-white text-[#252936] placeholder-[#9EA7B8] text-sm rounded-lg',
          'border border-[#E7EAF0] focus:border-[#4169E1]',
          'focus:outline-none focus:ring-1 focus:ring-[#4169E1]/30 transition-all duration-150',
          'py-2 px-3',
          Icon && 'pl-9',
          (EndIcon || shortcut) && 'pr-12',
          className
        )}
        {...props}
      />
      {shortcut && (
        <span className="absolute right-2.5 text-[10px] font-mono font-medium text-[#7C8494] bg-[#F5F6F8] px-1.5 py-0.5 rounded border border-[#E7EAF0] pointer-events-none select-none">
          {shortcut}
        </span>
      )}
      {EndIcon && !shortcut && (
        <span className="absolute right-3 text-[#7C8494] pointer-events-none">
          <EndIcon className="w-4 h-4" />
        </span>
      )}
    </div>
  );
}
