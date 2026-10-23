import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '../ui/Button';

export function FilterBar({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Qidirish...',
  filters = [], // array of { id, label, value, options: [{value, label}], onChange }
  onReset,
  hasActiveFilters = false,
  actions,
  children,
  className = '',
}) {
  return (
    <div
      className={`bg-white p-3 rounded-lg border border-[#E7EAF0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        {onSearchChange && (
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="w-4 h-4 text-[#7C8494] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-[#F5F6F8] text-[#252936] placeholder-[#9EA7B8] text-xs rounded-md border border-[#E7EAF0] focus:border-[#4169E1] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4169E1]/30 py-2 pl-9 pr-3 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7C8494] hover:text-[#252936]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {filters.map((filter) => (
          <div key={filter.id} className="relative">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="bg-[#F5F6F8] text-[#252936] text-xs rounded-md border border-[#E7EAF0] focus:border-[#4169E1] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4169E1]/30 py-2 px-3 pr-8 transition-colors cursor-pointer appearance-none"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#7C8494]">
              ▼
            </div>
          </div>
        ))}

        {children}

        {hasActiveFilters && onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            icon={X}
            className="text-xs text-[#7C8494] hover:text-[#D94B4B]"
          >
            Filtrni tozalash
          </Button>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-[#F5F6F8]">
          {actions}
        </div>
      )}
    </div>
  );
}
