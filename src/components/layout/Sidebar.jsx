import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  GraduationCap,
  UserSquare2,
  FolderKanban,
  CalendarDays,
  CheckCheck,
  Coins,
  Sparkles,
  BarChart3,
  Settings,
  ChevronDown,
  Building2,
  Check,
  X,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { currentAdmin } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';

const iconMap = {
  LayoutDashboard,
  UserPlus,
  GraduationCap,
  UserSquare2,
  FolderKanban,
  CalendarDays,
  CheckCheck,
  Coins,
  Sparkles,
  BarChart3,
  Settings,
};

const navItems = [
  { path: '/', key: 'dashboard', label: 'Bosh sahifa', icon: 'LayoutDashboard', exact: true },
  { path: '/leads', key: 'leads', label: 'Lidlar (CRM)', icon: 'UserPlus' },
  { path: '/students', key: 'students', label: 'O‘quvchilar', icon: 'GraduationCap' },
  { path: '/teachers', key: 'teachers', label: 'O‘qituvchilar', icon: 'UserSquare2' },
  { path: '/teacher', key: 'teacher_portal', label: 'Ustoz Portali', icon: 'GraduationCap' },
  { path: '/groups', key: 'groups', label: 'Guruhlar', icon: 'FolderKanban' },
  { path: '/timetable', key: 'timetable', label: 'Dars jadvali', icon: 'CalendarDays' },
  { path: '/attendance', key: 'attendance', label: 'Davomat', icon: 'CheckCheck' },
  { path: '/finance', key: 'finance', label: 'Moliya & To‘lovlar', icon: 'Coins' },
  { path: '/gamification', key: 'gamification', label: 'Koinlar & Do‘kon', icon: 'Sparkles' },
  { path: '/reports', key: 'reports', label: 'Hisobotlar', icon: 'BarChart3' },
  { path: '/settings', key: 'settings', label: 'Sozlamalar', icon: 'Settings' },
];

export function Sidebar({ isOpen, onClose, activeOrg, onSelectOrg }) {
  const { t } = useLanguage();
  const location = useLocation();

  const branches = activeOrg?.branches && activeOrg.branches.length > 0
    ? activeOrg.branches
    : [{ id: 'b-main', name: 'Bosh Filial', city: 'Toshkent' }];

  const [selectedBranch, setSelectedBranch] = useState(branches[0]);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  const orgDisplayName = activeOrg?.name || 'EduOne Markaz';
  const orgSubdomain = activeOrg?.subdomain || (activeOrg?.slug ? `${activeOrg.slug}.eduone.uz` : 'markaz.eduone.uz');

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#E7EAF0] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Top: Wordmark + Branch Switcher */}
        <div>
          {/* Brand Header */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-[#E7EAF0]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#4169E1] flex items-center justify-center text-white shadow-sm font-black text-sm tracking-tight">
                E1
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-[#252936]">
                    Edu<span className="text-[#4169E1]">One</span>
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#EEF2FF] text-[#4169E1] border border-[#C7D2FE]">
                    Pro
                  </span>
                </div>
                <span className="text-[10px] text-[#7C8494] font-medium leading-none">
                  O‘quv Markazi
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded text-[#7C8494] hover:text-[#252936] hover:bg-[#F5F6F8]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Branch Switcher (Inspired by Modme Reference) */}
          <div className="p-3">
            <div className="relative">
              <button
                onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                className="w-full flex items-center justify-between p-2 rounded-md bg-[#F5F6F8] hover:bg-[#EEF2FF] border border-[#E7EAF0] hover:border-[#C7D2FE] transition-colors text-left group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-3.5 h-3.5 text-[#4169E1] shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-[#252936] truncate">
                      {selectedBranch?.name || 'Bosh Filial'}
                    </p>
                    <p className="text-[10px] text-[#7C8494] truncate">
                      {orgDisplayName} • {selectedBranch?.city || 'Toshkent'}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 text-[#7C8494] shrink-0 transition-transform duration-200',
                    isOrgDropdownOpen && 'rotate-180 text-[#4169E1]'
                  )}
                />
              </button>

              {/* Branch Dropdown Menu */}
              {isOrgDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 p-1 bg-white border border-[#E7EAF0] rounded-lg shadow-dropdown z-50 text-xs">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7C8494]">
                    Filiallar ({branches.length} ta)
                  </div>
                  <div className="space-y-0.5">
                    {branches.map((b) => {
                      const isSelected = b.id === selectedBranch?.id || b.name === selectedBranch?.name;
                      return (
                        <button
                          key={b.id || b.name}
                          onClick={() => {
                            setSelectedBranch(b);
                            setIsOrgDropdownOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors text-left',
                            isSelected
                              ? 'bg-[#EEF2FF] text-[#4169E1] font-semibold'
                              : 'text-[#252936] hover:bg-[#F5F6F8]'
                          )}
                        >
                          <div className="truncate">
                            <p className="truncate font-medium">{b.name}</p>
                            <span className="text-[10px] text-[#7C8494]">{b.city || 'Toshkent'}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#4169E1] shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-1 mt-1 border-t border-[#E7EAF0]">
                    <div className="px-2 py-0.5 text-[10px] text-[#7C8494] font-mono truncate">
                      {orgSubdomain}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Items (Scrollable) */}
        <nav
          aria-label="Markaz navigatsiyasi"
          className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5"
        >
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7C8494]">
            Asosiy bo‘limlar
          </div>
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.key ? t(item.key) : item.label}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={cn(
                  'group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all duration-100',
                  isActive
                    ? 'bg-[#EEF2FF] text-[#4169E1] font-semibold'
                    : 'text-[#7C8494] hover:text-[#252936] hover:bg-[#F5F6F8]'
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-colors',
                      isActive ? 'text-[#4169E1]' : 'text-[#7C8494] group-hover:text-[#252936]'
                    )}
                  />
                )}
                <span className="truncate">{item.key ? t(item.key) : item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Portal Switcher */}
        <div className="p-2.5 border-t border-[#E7EAF0] bg-white">
          <NavLink
            to="/teacher"
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className="flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/70 hover:border-[#4169E1] transition-all shadow-xs group"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">👨‍🏫</span>
              <div className="text-left">
                <div className="text-[11px] font-bold text-[#252936] group-hover:text-[#4169E1] transition-colors leading-tight">
                  Ustoz Portali (Kabinet)
                </div>
                <div className="text-[9px] text-[#7C8494]">Davomat, Koinlar & LMS</div>
              </div>
            </div>
            <span className="text-xs font-bold text-[#4169E1] group-hover:translate-x-0.5 transition-transform">→</span>
          </NavLink>
        </div>

        {/* Bottom Section: Administrator Profile */}
        <div className="p-3 border-t border-[#E7EAF0] bg-[#F8F9FA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#4169E1] text-white font-bold text-xs flex items-center justify-center shrink-0">
              SI
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-semibold text-[#252936] truncate">{currentAdmin.name}</p>
                <ShieldCheck className="w-3 h-3 text-[#269B65] shrink-0" />
              </div>
              <p className="text-[10px] text-[#7C8494] truncate">{currentAdmin.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
