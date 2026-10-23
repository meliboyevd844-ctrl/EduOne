import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  className = '',
}) {
  if (totalItems === 0 && totalPages <= 1) return null;

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-[#E7EAF0] text-xs text-[#7C8494] ${className}`}
    >
      <div>
        {totalItems > 0 ? (
          <span>
            Ko'rsatilmoqda: <strong className="font-semibold text-[#252936]">{startItem}</strong> -{' '}
            <strong className="font-semibold text-[#252936]">{endItem}</strong> / jami{' '}
            <strong className="font-semibold text-[#252936]">{totalItems}</strong> ta yozuv
          </span>
        ) : (
          <span>Jami: 0 ta yozuv</span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 px-2.5"
          aria-label="Oldingi sahifa"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="px-2 text-xs font-medium text-[#252936]">
          {currentPage} / {Math.max(totalPages, 1)}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 px-2.5"
          aria-label="Keyingi sahifa"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
