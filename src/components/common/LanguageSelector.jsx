import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, Check } from 'lucide-react';

const languages = [
  { code: 'uz', label: 'O‘zbekcha', flag: '🇺🇿', short: 'UZ' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', short: 'RU' },
  { code: 'en', label: 'English', flag: '🇬🇧', short: 'EN' },
];

export function LanguageSelector({ variant = 'default' }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold transition-all duration-200 select-none border"
        style={
          variant === 'dark' || document.documentElement.classList.contains('dark')
            ? {
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                color: 'rgba(255, 255, 255, 0.85)',
              }
            : {
                background: '#FFFFFF',
                borderColor: '#E7EAF0',
                color: '#252936',
              }
        }
        title="Tilni o‘zgartirish / Сменить язык / Change language"
        aria-label="Til tanlash"
      >
        <span className="text-sm leading-none">{currentLang.flag}</span>
        <span className="text-[11px] font-bold tracking-wider">{currentLang.short}</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-10 w-36 rounded-xl border p-1 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
          style={
            variant === 'dark' || document.documentElement.classList.contains('dark')
              ? {
                  background: 'rgba(14, 18, 26, 0.96)',
                  borderColor: 'rgba(255, 255, 255, 0.14)',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
                  color: '#FFFFFF',
                }
              : {
                  background: '#FFFFFF',
                  borderColor: '#E7EAF0',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                  color: '#252936',
                }
          }
        >
          {languages.map((l) => {
            const isSelected = l.code === language;
            return (
              <button
                key={l.code}
                onClick={() => {
                  setLanguage(l.code);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all"
                style={
                  isSelected
                    ? {
                        background: 'rgba(229, 161, 43, 0.15)',
                        color: '#E5A12B',
                        fontWeight: 600,
                      }
                    : {
                        color: 'inherit',
                      }
                }
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{l.flag}</span>
                  <span className="text-xs">{l.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
