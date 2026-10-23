import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { currentAdmin } from '../../data/mockData';
import { StatusBadge } from '../common/StatusBadge';
import { cn } from '../../lib/utils';
import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';
import { useLanguage } from '../../context/LanguageContext';

export function Header({ onMenuClick }) {
  const { t } = useLanguage();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sampleNotifications = [
    {
      id: 1,
      title: 'To‘lov tasdiqlandi',
      message: 'Aliyev Sardor to‘lov qildi',
      time: '10 daqiqa oldin',
      unread: true,
      type: 'success',
    },
    {
      id: 2,
      title: 'Dars xonasi bandligi',
      message: 'Lab-302 xonasi bo‘shatildi',
      time: '45 daqiqa oldin',
      unread: false,
      type: 'info',
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-14 w-full bg-white border-b border-[#E7EAF0] flex items-center justify-between px-4 sm:px-6 shadow-subtle">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md text-[#7C8494] hover:text-[#252936] hover:bg-[#F5F6F8] transition-colors"
          aria-label="Menyuni ochish"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Field */}
        <div className="w-64 md:w-80 lg:w-96 hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-[#7C8494] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t('search_admin')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full bg-[#F5F6F8] text-[#252936] placeholder-[#9EA7B8] text-xs rounded-md border border-[#E7EAF0] focus:border-[#4169E1] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4169E1]/30 py-1.5 pl-9 pr-3 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Language Selector */}
        <LanguageSelector />

        {/* Day / Night Theme Toggle */}
        <ThemeToggle />

        {/* Date Display */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F8F9FA] border border-[#E7EAF0] text-xs text-[#7C8494]">
          <Clock className="w-3.5 h-3.5 text-[#4169E1]" />
          <span>{t('today')}: 19-oktabr, 2026</span>
        </div>

        {/* Notifications Control Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={cn(
              'relative p-1.5 rounded-md text-[#7C8494] hover:text-[#252936] hover:bg-[#F5F6F8] transition-colors',
              isNotificationsOpen && 'bg-[#F5F6F8] text-[#252936]'
            )}
            aria-label="Bildirishnomalar"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#4169E1]" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-1.5 w-80 rounded-lg bg-white border border-[#E7EAF0] shadow-dropdown p-3 z-50 animate-in fade-in duration-100">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E7EAF0]">
                <span className="text-xs font-semibold text-[#252936]">{t('notifications')}</span>
                <span className="text-[11px] text-[#4169E1] font-medium cursor-pointer">
                  {t('all_read')}
                </span>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {sampleNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      'p-2 rounded-md text-xs transition-colors flex items-start gap-2.5',
                      notif.unread
                        ? 'bg-[#EEF2FF]/60 border border-[#C7D2FE]'
                        : 'hover:bg-[#F8F9FA]'
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      {notif.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#269B65]" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-[#4169E1]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-[#252936] truncate">{notif.title}</p>
                        <span className="text-[10px] text-[#7C8494] shrink-0">{notif.time}</span>
                      </div>
                      <p className="text-[#7C8494] mt-0.5 leading-relaxed text-[11px]">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-[#F5F6F8] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#4169E1] text-white font-bold text-xs flex items-center justify-center">
              SI
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#252936] leading-tight">
                {currentAdmin.name}
              </span>
              <span className="text-[10px] text-[#7C8494]">
                {currentAdmin.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#7C8494] hidden md:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-1.5 w-52 rounded-lg bg-white border border-[#E7EAF0] shadow-dropdown py-1.5 z-50 text-xs">
              <div className="px-3 py-2 border-b border-[#E7EAF0]">
                <p className="font-semibold text-[#252936]">{currentAdmin.name}</p>
                <p className="text-[11px] text-[#7C8494] truncate">{currentAdmin.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[#252936] hover:bg-[#F5F6F8] transition-colors text-left"
                >
                  <User className="w-3.5 h-3.5 text-[#7C8494]" />
                  <span>{t('my_profile')}</span>
                </button>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[#252936] hover:bg-[#F5F6F8] transition-colors text-left"
                >
                  <Settings className="w-3.5 h-3.5 text-[#7C8494]" />
                  <span>{t('settings')}</span>
                </button>
              </div>

              <div className="pt-1 border-t border-[#E7EAF0]">
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[#D94B4B] hover:bg-[#FDEEEC] font-medium transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
