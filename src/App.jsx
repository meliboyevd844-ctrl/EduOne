import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { SuperAdminLayout } from './components/superadmin/SuperAdminLayout';

// Tenant School Pages (Modme & EduOne O'quv Markazi Boshqaruvi)
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { StudentsPage } from './pages/StudentsPage';
import { TeachersPage } from './pages/TeachersPage';
import { GroupsPage } from './pages/GroupsPage';
import { TimetablePage } from './pages/TimetablePage';
import { AttendancePage } from './pages/AttendancePage';
import { FinancePage } from './pages/FinancePage';
import { GamificationPage } from './pages/GamificationPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

// Super Admin 13 Sections Pages
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard';
import { OrganizationsManagementPage } from './pages/superadmin/OrganizationsManagementPage';
import { BranchesManagementPage } from './pages/superadmin/BranchesManagementPage';
import { SubscriptionsPage } from './pages/superadmin/SubscriptionsPage';
import { PlansSubscriptionsPage } from './pages/superadmin/PlansSubscriptionsPage';
import { PlatformFinancePage } from './pages/superadmin/PlatformFinancePage';
import { FeatureFlagsPage } from './pages/superadmin/FeatureFlagsPage';
import { UsersRolesPage } from './pages/superadmin/UsersRolesPage';
import { AiMonitoringPage } from './pages/superadmin/AiMonitoringPage';
import { TelegramBotPage } from './pages/superadmin/TelegramBotPage';
import { SuperAdminReportsPage } from './pages/superadmin/SuperAdminReportsPage';
import { AuditLogsPage } from './pages/superadmin/AuditLogsPage';
import { SuperAdminSettingsPage } from './pages/superadmin/SuperAdminSettingsPage';

// Teacher Portal (O'qituvchilar kabineti va tizimga kirish)
import { TeacherPortalPage } from './pages/teacher/TeacherPortalPage';
import { TeacherLoginPage } from './pages/teacher/TeacherLoginPage';

import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
        {/* Super Admin Platform Routes (13 Sections) */}
        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="organizations" element={<OrganizationsManagementPage />} />
          <Route path="branches" element={<BranchesManagementPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="plans" element={<PlansSubscriptionsPage />} />
          <Route path="finance" element={<PlatformFinancePage />} />
          <Route path="features" element={<FeatureFlagsPage />} />
          <Route path="users" element={<UsersRolesPage />} />
          <Route path="ai" element={<AiMonitoringPage />} />
          <Route path="telegram" element={<TelegramBotPage />} />
          <Route path="reports" element={<SuperAdminReportsPage />} />
          <Route path="audit" element={<AuditLogsPage />} />
          <Route path="settings" element={<SuperAdminSettingsPage />} />
        </Route>

        {/* Tenant School Management Routes (O‘quv Markazi Boshqaruvi) */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="timetable" element={<TimetablePage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="gamification" element={<GamificationPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* O'qituvchilar Portali (Ustoz kabineti va login) */}
        <Route path="/teacher" element={<TeacherPortalPage />} />
        <Route path="/teacher/login" element={<TeacherLoginPage />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/super-admin" replace />} />
      </Routes>
    </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
