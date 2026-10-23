import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ variant = 'default' }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 border select-none active:scale-90 group"
      style={
        isDark
          ? {
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              color: '#FBBF24',
              boxShadow: '0 0 15px rgba(251, 191, 36, 0.15)',
            }
          : {
              background: '#FFFFFF',
              borderColor: '#E7EAF0',
              color: '#4B5563',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }
      }
      title={isDark ? t('theme_light') : t('theme_dark')}
      aria-label={isDark ? t('theme_light') : t('theme_dark')}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-[#4169E1] group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}
