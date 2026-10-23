import React from 'react';
import { Loader2 } from 'lucide-react';

export function FeatureToggle({
  id,
  name,
  description,
  enabled = false,
  onChange,
  loading = false,
  disabled = false,
  badge,
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-3.5 rounded-lg border border-[#E7EAF0] bg-white hover:border-[#CBD1DC] transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <label
            htmlFor={id}
            className={`text-xs font-semibold select-none ${
              disabled ? 'text-[#7C8494]' : 'text-[#252936] cursor-pointer'
            }`}
          >
            {name}
          </label>
          {badge && <span>{badge}</span>}
        </div>
        {description && (
          <p className="text-[11px] text-[#7C8494] leading-relaxed">{description}</p>
        )}
      </div>

      <div className="flex items-center shrink-0 pt-0.5">
        {loading ? (
          <Loader2 className="w-4 h-4 text-[#4169E1] animate-spin" />
        ) : (
          <button
            type="button"
            id={id}
            role="switch"
            aria-checked={enabled}
            disabled={disabled}
            onClick={() => !disabled && onChange && onChange(!enabled)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1]/50 ${
              disabled ? 'opacity-40 cursor-not-allowed' : ''
            } ${enabled ? 'bg-[#4169E1]' : 'bg-[#CBD1DC]'}`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                enabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
