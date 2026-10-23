import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  GitBranch,
  CreditCard,
  Tag,
  Wallet,
  Sliders,
  Users,
  Bot,
  Send,
  BarChart3,
  FileText,
  Settings,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useWallpaper } from './WallpaperContext';
import { useLanguage } from '../../context/LanguageContext';

export const superAdminNavItems = [
  { path: '/super-admin', key: 'sa_dashboard', label: 'Boshqaruv paneli', icon: LayoutDashboard, exact: true },
  { path: '/super-admin/organizations', key: 'sa_organizations', label: 'Tashkilotlar', icon: Building2 },
  { path: '/super-admin/branches', key: 'sa_branches', label: 'Filiallar', icon: GitBranch },
  { path: '/super-admin/subscriptions', key: 'sa_subscriptions', label: 'Obunalar', icon: CreditCard },
  { path: '/super-admin/plans', key: 'sa_plans', label: 'Tariflar va narxlar', icon: Tag },
  { path: '/super-admin/finance', key: 'sa_finance', label: "To'lovlar va qarzlar", icon: Wallet },
  { path: '/super-admin/features', key: 'sa_features', label: 'Funksiyalar boshqaruvi', icon: Sliders },
  { path: '/super-admin/users', key: 'sa_users', label: 'Foydalanuvchilar va huquqlar', icon: Users },
  { path: '/super-admin/ai', key: 'sa_ai', label: 'AI boshqaruvi va iste\'mol', icon: Bot },
  { path: '/super-admin/telegram', key: 'sa_telegram', label: 'Telegram bot va xabarnomalar', icon: Send },
  { path: '/super-admin/reports', key: 'sa_reports', label: 'Hisobotlar va tahlil', icon: BarChart3 },
  { path: '/super-admin/audit', key: 'sa_audit', label: 'Audit jurnali', icon: FileText },
  { path: '/super-admin/settings', key: 'sa_settings', label: 'Tizim sozlamalari', icon: Settings },
];

export function SuperAdminSidebar({ isOpen, onClose }) {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarWallpapers, sidebarIndex } = useWallpaper();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Super Admin Sidebar with Dedicated Rotating Wallpaper */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '10px 0 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* =========================================================
            DEDICATED ROTATING SIDEBAR WALLPAPER LAYERS
            ========================================================= */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          {sidebarWallpapers.map((wp, idx) => {
            const isActive = idx === sidebarIndex;
            return (
              <div
                key={wp.id}
                className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                style={{
                  opacity: isActive ? 1 : 0,
                  zIndex: isActive ? 1 : 0,
                }}
              >
                {wp.type === 'image' ? (
                  <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
                    style={{
                      backgroundImage: `url(${wp.url})`,
                    }}
                  >
                    {/* Radial light boost + Dark gradient overlay */}
                    <div
                      className="w-full h-full"
                      style={{
                        background: wp.overlay,
                        backdropFilter: 'blur(3px)',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-full"
                    style={{
                      background: wp.css,
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Frosted Glass Overlay with Subtle Right Shadow */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, rgba(8, 11, 16, 0.15) 0%, rgba(10, 14, 22, 0.35) 100%)',
              backdropFilter: 'blur(6px)',
            }}
          />
        </div>

        {/* =========================================================
            SIDEBAR CONTENT (Header, Nav, Profile)
            ========================================================= */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Top: Logo & Platform Identity */}
          <div>
            <div
              className="h-16 px-4 flex items-center justify-between"
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(8, 12, 20, 0.50)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg font-black text-sm tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    boxShadow: '0 0 20px rgba(37, 99, 235, 0.55)',
                    border: '1px solid rgba(96, 165, 250, 0.4)',
                  }}
                >
                  E1
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight text-white drop-shadow">
                    Edu<span style={{ color: '#60A5FA' }}>One</span>
                  </span>
                  <span className="text-[10px] text-blue-300/60 font-medium leading-none">
                    Super Admin
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Yopish"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick link to School Tenant Workspace */}
            <div className="p-3">
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 group cursor-pointer backdrop-blur-md"
                title="O'quv markazi ichki boshqaruv paneliga o'tish"
                style={{
                  background: 'rgba(37, 99, 235, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(37, 99, 235, 0.18)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(37, 99, 235, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(37, 99, 235, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.25)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0 text-left">
                  <Building2 className="w-4 h-4 shrink-0 text-blue-400" />
                  <span className="text-xs font-semibold truncate text-white/90 group-hover:text-blue-300">
                    {t('center_panel')}
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-blue-400/60 group-hover:text-blue-300 shrink-0" />
              </button>
            </div>
          </div>

          {/* Navigation Items (Scrollable) */}
          <nav
            aria-label="Super Admin asosiy menyusi"
            className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar"
          >
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/35 flex items-center justify-between">
              <span>{t('sa_dashboard')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            </div>

            {superAdminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              const translatedLabel = item.key ? t(item.key) : item.label;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={translatedLabel}
                  onClick={() => {
                    if (window.innerWidth < 1024 && onClose) onClose();
                  }}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200',
                    isActive
                      ? 'font-bold text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  )}
                  style={
                    isActive
                      ? {
                          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                          color: '#FFFFFF',
                          border: '1px solid rgba(96, 165, 250, 0.4)',
                          boxShadow: '0 0 20px rgba(37, 99, 235, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        }
                      : {
                          border: '1px solid transparent',
                        }
                  }
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-colors',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-300'
                    )}
                  />
                  <span className="truncate drop-shadow-xs">{translatedLabel}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Section: Theme Toggle & Profile Capsule (Matching Reference Image) */}
          <div
            className="p-3 space-y-2 backdrop-blur-md"
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(6, 9, 16, 0.60)',
            }}
          >
            {/* Super Admin Profile Pill matching image's "Aaru >" */}
            <div
              className="flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer hover:bg-white/5"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.06)',
                background: 'rgba(15, 23, 42, 0.4)',
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    boxShadow: '0 0 15px rgba(37, 99, 235, 0.4)',
                    border: '1px solid rgba(96, 165, 250, 0.3)',
                  }}
                >
                  SA
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white/95 truncate flex items-center gap-1">
                    Super Admin
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  </p>
                  <p className="text-[10px] text-white/40 truncate">superadmin@eduone.uz</p>
                </div>
              </div>
              <span className="text-white/40 text-xs font-bold pl-1">›</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
