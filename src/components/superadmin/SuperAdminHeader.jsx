import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  Plus,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  Building2,
  ExternalLink
} from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { DynamicIslandWallpaper } from './DynamicIslandWallpaper';
import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';
import { useLanguage } from '../../context/LanguageContext';

const routeKeyMap = {
  '/super-admin': 'sa_dashboard',
  '/super-admin/organizations': 'sa_organizations',
  '/super-admin/branches': 'sa_branches',
  '/super-admin/subscriptions': 'sa_subscriptions',
  '/super-admin/plans': 'sa_plans',
  '/super-admin/finance': 'sa_finance',
  '/super-admin/features': 'sa_features',
  '/super-admin/users': 'sa_users',
  '/super-admin/ai': 'sa_ai',
  '/super-admin/telegram': 'sa_telegram',
  '/super-admin/reports': 'sa_reports',
  '/super-admin/audit': 'sa_audit',
  '/super-admin/settings': 'sa_settings',
};

export function SuperAdminHeader({ onMenuClick, onNewOrgClick, notificationsCount = 0 }) {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTitle = routeKeyMap[location.pathname] ? t(routeKeyMap[location.pathname]) : 'Boshqaruv';

  const breadcrumbs = [
    { label: t('super_admin_title'), to: '/super-admin' },
    ...(location.pathname !== '/super-admin'
      ? [{ label: currentTitle }]
      : []),
  ];

  return (
    <header
      className="sticky top-0 z-30 h-14 w-full flex items-center justify-between px-4 sm:px-6"
      style={{
        background: 'rgba(16, 21, 30, 0.72)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Menyu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-1.5 text-xs">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-white/20">/</span>}
                {item.to ? (
                  <Link to={item.to} className="text-white/40 hover:text-blue-400 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-white/70 font-medium">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Center/Search when screen is wide enough */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={t('search_superadmin')}
            className="w-full text-white/90 placeholder-white/25 text-xs rounded-xl py-2 pl-9 pr-3 transition-all duration-200 outline-none"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(59, 130, 246, 0.45)';
              e.target.style.background = 'rgba(37, 99, 235, 0.08)';
              e.target.style.boxShadow = '0 0 20px rgba(37, 99, 235, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* iPhone Style Dynamic Island Wallpaper Controller */}
        <DynamicIslandWallpaper />

        {/* Language Selector */}
        <LanguageSelector variant="dark" />

        {/* Day / Night Theme Toggle */}
        <ThemeToggle variant="dark" />

        {/* Create Organization CTA (Uniform Electric Blue Glow) */}
        {onNewOrgClick && (
          <button
            onClick={onNewOrgClick}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl text-white transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              boxShadow: '0 0 20px rgba(37, 99, 235, 0.45)',
              border: '1px solid rgba(96, 165, 250, 0.35)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.65)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(37, 99, 235, 0.45)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('new_org')}</span>
          </button>
        )}

        {/* Notification */}
        <div className="relative">
          <button
            onClick={() => {
              if (notificationsCount === 0) {
                alert(t('no_notifications') || "Hozircha yangi bildirishnomalar mavjud emas. Tizim barqaror ishlamoqda.");
              }
            }}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200 relative"
            title={notificationsCount > 0 ? `${notificationsCount} ta yangi bildirishnoma` : t('notifications')}
            aria-label={t('notifications')}
          >
            <Bell className="w-4 h-4" />
            {notificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" style={{
                boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
              }} />
            )}
          </button>
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors text-left"
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            <div className="w-7 h-7 rounded-full text-white text-[11px] font-bold flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              boxShadow: '0 0 12px rgba(37, 99, 235, 0.4)',
              border: '1px solid rgba(96, 165, 250, 0.3)',
            }}>
              SA
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-semibold text-white/90 leading-tight">
                Super Admin
              </span>
              <span className="text-[10px] text-white/35">EduOne Platform</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white/30 hidden lg:block" />
          </button>

          {/* User Dropdown - Dark Glass */}
          {isUserMenuOpen && (
            <div
              className="absolute right-0 mt-1.5 w-52 rounded-xl py-1.5 z-50 text-xs"
              style={{
                background: 'rgba(13, 19, 32, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(37, 99, 235, 0.1)',
              }}
            >
              <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <p className="font-semibold text-white/90">Platforma Egasi</p>
                <p className="text-[11px] text-white/35 truncate">superadmin@eduone.uz</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t('center_panel')}</span>
                </button>
                <Link
                  to="/super-admin/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-white/40" />
                  <span>{t('sa_settings')}</span>
                </Link>
              </div>

              <div className="pt-1" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    alert("Tizimdan chiqish tasdiqlandi.");
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left font-medium"
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
