import React, { useState, useEffect } from 'react';
import { Outlet, useSearchParams, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ArrowLeft, Building2 } from 'lucide-react';
import { api } from '../../lib/api';

export function AdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeOrg, setActiveOrg] = useState(() => {
    try {
      const saved = sessionStorage.getItem('eduone_impersonating_org');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(!activeOrg);

  useEffect(() => {
    async function loadOrg() {
      const orgParam = searchParams.get('impersonate') || searchParams.get('org');
      const orgs = await api.getOrganizations();

      if (orgParam) {
        const found = orgs.find((o) => o.slug === orgParam || o.id === orgParam);
        if (found) {
          setActiveOrg(found);
          sessionStorage.setItem('eduone_impersonating_org', JSON.stringify(found));
          setIsLoading(false);
          return;
        }
      }

      if (!activeOrg && orgs.length > 0) {
        setActiveOrg(orgs[0]);
        sessionStorage.setItem('eduone_impersonating_org', JSON.stringify(orgs[0]));
      }
      setIsLoading(false);
    }
    loadOrg();
  }, [searchParams]);

  const orgName = activeOrg?.name || 'O‘quv Markazi';
  const orgSubdomain = activeOrg?.subdomain || (activeOrg?.slug ? `${activeOrg.slug}.eduone.uz` : 'markaz.eduone.uz');

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#252936] flex flex-col antialiased">
      {/* Sidebar (Desktop fixed left, mobile slide-in) */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        activeOrg={activeOrg}
        onSelectOrg={(org) => {
          setActiveOrg(org);
          sessionStorage.setItem('eduone_impersonating_org', JSON.stringify(org));
        }}
      />

      {/* Main Content Area (offset by 256px / w-64 on lg screens) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        {/* Super Admin Workspace Alert Banner */}
        <div className="sticky top-0 z-40 bg-[#EEF2FF] border-b border-[#C7D2FE] text-[#4169E1] px-4 py-1.5 text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 max-w-2xl truncate">
            <Building2 className="w-3.5 h-3.5 shrink-0 text-[#4169E1]" />
            <span className="truncate">
              O'quv markazi boshqaruvi: <strong className="text-[#252936] font-semibold">{orgName}</strong> ({orgSubdomain})
            </span>
          </div>

          <button
            onClick={() => navigate('/super-admin')}
            className="bg-white hover:bg-[#F5F6F8] text-[#4169E1] border border-[#C7D2FE] px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 shrink-0 ml-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Super Adminga qaytish
          </button>
        </div>

        <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Minimal Footer */}
        <footer className="px-6 py-3.5 border-t border-[#E7EAF0] bg-white text-center text-xs text-[#7C8494]">
          <span>EduOne • Markaziy Ta’lim Boshqaruvi Platformasi</span>
        </footer>
      </div>
    </div>
  );
}
