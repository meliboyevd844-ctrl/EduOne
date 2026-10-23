import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';

export function DataTable({
  columns = [],
  data = [],
  loading = false,
  error = null,
  onRetry,
  sortKey,
  sortOrder = 'asc',
  onSort,
  emptyTitle = "Ma'lumot topilmadi",
  emptyDescription = "Hozircha hech qanday yozuv mavjud emas.",
  emptyActionLabel,
  onEmptyAction,
  pagination,
  className = '',
}) {
  if (loading && (!data || data.length === 0)) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState description={error} onRetry={onRetry} />;
  }

  return (
    <div
      className={`bg-white rounded-lg border border-[#E7EAF0] shadow-sm overflow-hidden flex flex-col ${className}`}
    >
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E7EAF0]">
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={`py-3 px-4 text-[11px] font-semibold text-[#7C8494] uppercase tracking-wider ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    } ${col.sortable ? 'cursor-pointer hover:text-[#252936] select-none' : ''}`}
                    onClick={() => col.sortable && onSort && onSort(col.key)}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <span>{col.title}</span>
                      {col.sortable && (
                        <span className="text-[#CBD1DC]">
                          {isSorted ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-[#4169E1]" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-[#4169E1]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7EAF0]">
            {data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="hover:bg-[#F8F9FB] transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3 px-4 text-xs text-[#252936] ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                    className="border-none shadow-none rounded-none py-10"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && <Pagination {...pagination} />}
    </div>
  );
}
