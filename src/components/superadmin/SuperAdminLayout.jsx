import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { SuperAdminHeader } from './SuperAdminHeader';
import { CreateOrganizationModal } from './CreateOrganizationModal';
import { CenterFeaturesModal } from './CenterFeaturesModal';
import { SuperAdminBackground } from './SuperAdminBackground';
import { WallpaperProvider } from './WallpaperContext';
import { api } from '../../lib/api';

export function SuperAdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNewOrgModalOpen, setIsNewOrgModalOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgForFeatures, setSelectedOrgForFeatures] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ma'lumotlarni backenddan yuklash
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [orgsData, logsData, statsData] = await Promise.all([
        api.getOrganizations(),
        api.getAuditLogs(),
        api.getStats(),
      ]);

      // Normalize organizations from backend
      const normalizedOrgs = (orgsData || []).map((org) => ({
        ...org,
        id: org.id || org.ID,
        name: org.name || org.Name,
        slug: org.slug || org.Slug,
        subdomain: org.subdomain || org.Subdomain || `${org.slug || org.Slug}.eduone.uz`,
        ownerName: org.owner_name || org.ownerName || org.OwnerName,
        ownerPhone: org.owner_phone || org.ownerPhone || org.OwnerPhone,
        ownerEmail: org.owner_email || org.ownerEmail || org.OwnerEmail,
        status: org.status || org.Status || 'active',
        planId: org.plan_id || org.planId || org.PlanID || 'PRO',
        planName: org.plan_name || org.planName || org.PlanName || 'Professional',
        planPrice: org.plan_price || org.planPrice || org.PlanPrice || 0,
        billingCycle: org.billing_cycle || org.billingCycle || 'monthly',
        amountPaid: org.amount_paid || org.amountPaid || 0,
        outstandingDebt: org.outstanding_debt || org.outstandingDebt || 0,
        branchesCount: org.branches_count || org.branchesCount || org.BranchesCount || (org.branches ? org.branches.length : 1),
        studentsCount: org.students_count || org.studentsCount || org.StudentsCount || 0,
        teachersCount: org.teachers_count || org.teachersCount || org.TeachersCount || 0,
        groupsCount: org.groups_count || org.groupsCount || org.GroupsCount || 0,
        enabledFeatures: org.enabled_features || org.enabledFeatures || org.EnabledFeatures || [],
        branches: org.branches || org.Branches || [],
        expirationDate: org.expiration_date || org.expirationDate || '2026-12-31',
        createdAt: org.created_at || org.createdAt || org.CreatedAt || new Date().toISOString(),
      }));

      setOrganizations(normalizedOrgs);
      setAuditLogs(logsData || []);
      setStats(statsData || null);
    } catch (err) {
      console.warn('Backenddan malumotlarni yuklashda ogohlantirish:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Yangi tashkilot yaratish (Backend API bilan bog'langan)
  const handleCreateOrg = async (orgPayload) => {
    const created = await api.createOrganization(orgPayload);
    await loadData();
    return created;
  };

  // Funksiyani yoqish/o'chirish (Backend API bilan bog'langan)
  const handleToggleFeature = async (orgId, featureCode) => {
    await api.toggleOrgFeature(orgId, featureCode);
    setOrganizations((prev) =>
      prev.map((org) => {
        if (org.id === orgId) {
          const currentFeatures = org.enabledFeatures || [];
          const isEnabled = currentFeatures.includes(featureCode);
          const updated = isEnabled
            ? currentFeatures.filter((c) => c !== featureCode)
            : [...currentFeatures, featureCode];
          const updatedOrg = { ...org, enabledFeatures: updated };
          if (selectedOrgForFeatures?.id === orgId) {
            setSelectedOrgForFeatures(updatedOrg);
          }
          return updatedOrg;
        }
        return org;
      })
    );
    api.getAuditLogs().then(setAuditLogs).catch(() => {});
  };

  // Funksiyalarni guruhlab o'zgartirish (Qarzdorlik cheklovi)
  const handleBatchUpdateFeatures = async (orgId, featuresList, actionReason) => {
    await api.updateOrgFeatures(orgId, featuresList);
    setOrganizations((prev) =>
      prev.map((org) => {
        if (org.id === orgId) {
          const updatedOrg = { ...org, enabledFeatures: featuresList };
          if (selectedOrgForFeatures?.id === orgId) {
            setSelectedOrgForFeatures(updatedOrg);
          }
          return updatedOrg;
        }
        return org;
      })
    );
    api.recordAuditLog({
      action: actionReason,
      target: `Markaz ID: ${orgId} (${featuresList.length} ta modul qoldi)`,
      status: 'warning',
    });
    api.getAuditLogs().then(setAuditLogs).catch(() => {});
  };

  return (
    <WallpaperProvider>
      <div
        className="super-admin-dark min-h-screen text-white flex flex-col antialiased relative selection:bg-amber-500/30 selection:text-amber-200"
        style={{ backgroundColor: '#080B10' }}
      >
        {/* Dynamic 5-minute rotating luxury wallpaper with smooth cross-fade */}
        <SuperAdminBackground />

        {/* Super Admin Sidebar with frosted glass */}
        <SuperAdminSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="lg:pl-64 flex flex-col flex-1 min-h-screen relative z-10">
          <SuperAdminHeader
            onMenuClick={() => setIsMobileSidebarOpen(true)}
            onNewOrgClick={() => setIsNewOrgModalOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-6 max-w-7xl w-full mx-auto">
            <Outlet
              context={{
                organizations,
                setOrganizations,
                auditLogs,
                setAuditLogs,
                stats,
                isLoading,
                refreshData: loadData,
                openNewOrgModal: () => setIsNewOrgModalOpen(true),
                openFeaturesModal: (org) => setSelectedOrgForFeatures(org),
                toggleOrgFeature: handleToggleFeature,
                batchUpdateOrgFeatures: handleBatchUpdateFeatures,
              }}
            />
          </main>

          <footer className="px-6 py-3.5 border-t border-white/5 text-center text-xs text-white/30" style={{
            background: 'rgba(13, 17, 23, 0.6)',
            backdropFilter: 'blur(12px)',
          }}>
            <span>EduOne SaaS Platform Core • Super Admin Boshqaruv Markazi</span>
          </footer>
        </div>

        {/* Create Organization Modal */}
        <CreateOrganizationModal
          isOpen={isNewOrgModalOpen}
          onClose={() => setIsNewOrgModalOpen(false)}
          onCreateOrg={handleCreateOrg}
        />

        {/* Center Features & Permissions Modal */}
        <CenterFeaturesModal
          organization={selectedOrgForFeatures}
          isOpen={!!selectedOrgForFeatures}
          onClose={() => setSelectedOrgForFeatures(null)}
          onToggleFeature={handleToggleFeature}
          onBatchUpdateFeatures={handleBatchUpdateFeatures}
        />
      </div>
    </WallpaperProvider>
  );
}
