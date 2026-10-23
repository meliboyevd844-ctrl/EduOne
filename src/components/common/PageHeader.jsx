import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  action,
  children,
  className = '',
}) {
  return (
    <div className={`mb-6 flex flex-col gap-3 ${className}`}>
      {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#252936] tracking-tight">{title}</h1>
          {description && (
            <p className="text-xs text-[#7C8494] mt-1">{description}</p>
          )}
        </div>
        {(action || children) && (
          <div className="flex items-center gap-2.5 shrink-0">
            {action}
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
