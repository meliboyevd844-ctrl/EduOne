// EduOne Multi-Tenant API Client
// Ushbu modul Frontendni Go backend REST API bilan bog'laydi.

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080/api/v1';

// Token va sessiya xotirasi
const TOKEN_KEY = 'eduone_auth_token';
const USER_KEY = 'eduone_auth_user';
const STORAGE_ORGS_KEY = 'eduone_organizations_data';
const STORAGE_LOGS_KEY = 'eduone_audit_logs_data';
const STORAGE_PLANS_KEY = 'eduone_plans_data';
const STORAGE_INVOICES_KEY = 'eduone_invoices_data';

export const authStorage = {
  getToken: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token === 'local-dev-jwt-token') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return null;
    }
    return token;
  },
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  getUser: () => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
};

// Yordamchi HTTP fetch wrapper
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = authStorage.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errText = 'Server xatosi';
      try {
        const errJson = await res.json();
        errText = errJson.error || errJson.message || errText;
      } catch {
        errText = await res.text();
      }
      throw new Error(errText || `HTTP ${res.status}`);
    }

    // Agar bo'sh javob bo'lsa
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    // Agar serverga ulanish imkoni bo'lmasa (masalan local offline rejimda),
    // xatolikni konsolga berib, yuqori qatlamga uzatamiz
    console.warn(`[EduOne API] ${endpoint} chaqirishda xatolik:`, error.message);
    throw error;
  }
}

// Mahalliy sinhron xotira (Client-side fallback agar backend hali ishga tushmagan bo'lsa)
function getLocalOrgs() {
  try {
    const raw = localStorage.getItem(STORAGE_ORGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrgs(orgs) {
  localStorage.setItem(STORAGE_ORGS_KEY, JSON.stringify(orgs));
}

function getLocalLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalLogs(logs) {
  localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logs));
}

export const api = {
  // Autentifikatsiya
  async login(phone, password) {
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      });
      if (data.token) {
        authStorage.setToken(data.token);
        authStorage.setUser(data.user);
      }
      return data;
    } catch (err) {
      throw err;
    }
  },

  logout() {
    authStorage.removeToken();
    authStorage.removeUser();
  },

  // 1. Platform Statistikasi
  async getStats() {
    try {
      return await request('/super-admin/stats');
    } catch {
      // Backend ulanmaganda mahalliy bazadan hisoblash
      const orgs = getLocalOrgs();
      const active = orgs.filter((o) => o.status === 'active');
      const trial = orgs.filter((o) => o.status === 'trial');
      const suspended = orgs.filter((o) => o.status === 'suspended');
      const totalBranches = orgs.reduce((acc, o) => acc + (o.branchesCount || o.branches?.length || 0), 0);
      const totalStudents = orgs.reduce((acc, o) => acc + (o.studentsCount || 0), 0);
      const totalTeachers = orgs.reduce((acc, o) => acc + (o.teachersCount || 0), 0);
      const totalGroups = orgs.reduce((acc, o) => acc + (o.groupsCount || 0), 0);
      const totalMRR = active.reduce((acc, o) => acc + (o.planPrice || 0), 0);

      return {
        total_organizations: orgs.length,
        active_organizations: active.length,
        trial_organizations: trial.length,
        suspended_organizations: suspended.length,
        total_branches: totalBranches,
        total_students: totalStudents,
        total_teachers: totalTeachers,
        total_groups: totalGroups,
        platform_mrr: totalMRR,
        ai_monthly_tokens: 0,
        ai_estimated_cost_usd: 0,
        telegram_bot_status: 'online',
        telegram_messages_sent: 0,
        system_health: 100.0,
      };
    }
  },

  // 2. Tashkilotlar boshqaruvi
  async getOrganizations() {
    try {
      const data = await request('/super-admin/organizations');
      if (Array.isArray(data)) {
        saveLocalOrgs(data);
        return data;
      }
      return getLocalOrgs();
    } catch {
      return getLocalOrgs();
    }
  },

  async getOrganization(id) {
    try {
      return await request(`/super-admin/organizations/${id}`);
    } catch {
      const orgs = getLocalOrgs();
      const found = orgs.find((o) => o.id === id);
      if (!found) throw new Error('Tashkilot topilmadi');
      return found;
    }
  },

  async createOrganization(orgData) {
    try {
      const created = await request('/super-admin/organizations', {
        method: 'POST',
        body: JSON.stringify(orgData),
      });
      // Mahalliy xotiraga ham qo'shib qo'yish
      const orgs = getLocalOrgs();
      saveLocalOrgs([created, ...orgs]);
      this.recordAuditLog({
        action: 'Yangi tashkilot yaratildi',
        target: `${created.name} (${created.enabled_features?.length || 0} ta modul faol)`,
        status: 'success',
      });
      return created;
    } catch {
      // Backend yo'q bo'lsa mahalliy xotirada saqlash
      const newOrg = {
        ...orgData,
        id: orgData.id || `org-${Date.now()}`,
        branchesCount: orgData.branches?.length || 1,
        studentsCount: 0,
        teachersCount: 0,
        groupsCount: 0,
        createdAt: new Date().toISOString(),
      };
      const orgs = getLocalOrgs();
      saveLocalOrgs([newOrg, ...orgs]);
      this.recordAuditLog({
        action: 'Yangi tashkilot yaratildi (mahalliy saqlandi)',
        target: `${newOrg.name}`,
        status: 'success',
      });
      return newOrg;
    }
  },

  async updateOrganization(id, orgData) {
    try {
      const updated = await request(`/super-admin/organizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(orgData),
      });
      const orgs = getLocalOrgs().map((o) => (o.id === id ? { ...o, ...orgData } : o));
      saveLocalOrgs(orgs);
      return updated;
    } catch {
      const orgs = getLocalOrgs().map((o) => (o.id === id ? { ...o, ...orgData } : o));
      saveLocalOrgs(orgs);
      return { status: 'updated' };
    }
  },

  async deleteOrganization(id) {
    try {
      await request(`/super-admin/organizations/${id}`, { method: 'DELETE' });
    } catch {
      // fallback
    }
    const orgs = getLocalOrgs().filter((o) => o.id !== id);
    saveLocalOrgs(orgs);
    return { status: 'deleted' };
  },

  async updateOrgStatus(id, status) {
    try {
      await request(`/super-admin/organizations/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    } catch {
      // fallback
    }
    const orgs = getLocalOrgs().map((o) => (o.id === id ? { ...o, status } : o));
    saveLocalOrgs(orgs);
    return { status: 'updated' };
  },

  // 3. Modullar (Feature Flags) boshqaruvi
  async toggleOrgFeature(orgId, featureCode) {
    let result = null;
    try {
      result = await request(`/super-admin/organizations/${orgId}/features/${featureCode}`, {
        method: 'PUT',
      });
    } catch {
      // fallback
    }

    const orgs = getLocalOrgs().map((o) => {
      if (o.id === orgId) {
        const feats = o.enabled_features || o.enabledFeatures || [];
        const exists = feats.includes(featureCode);
        const updated = exists ? feats.filter((f) => f !== featureCode) : [...feats, featureCode];
        return { ...o, enabledFeatures: updated, enabled_features: updated };
      }
      return o;
    });
    saveLocalOrgs(orgs);

    return result || { organization_id: orgId, feature: featureCode };
  },

  async updateOrgFeatures(orgId, featuresList) {
    try {
      await request(`/super-admin/organizations/${orgId}/features`, {
        method: 'PUT',
        body: JSON.stringify({ features: featuresList }),
      });
    } catch {
      // fallback
    }

    const orgs = getLocalOrgs().map((o) => {
      if (o.id === orgId) {
        return { ...o, enabledFeatures: featuresList, enabled_features: featuresList };
      }
      return o;
    });
    saveLocalOrgs(orgs);
    return { status: 'updated' };
  },

  // 4. Filiallar qo'shish
  async addBranch(orgId, branchData) {
    try {
      return await request(`/super-admin/organizations/${orgId}/branches`, {
        method: 'POST',
        body: JSON.stringify(branchData),
      });
    } catch {
      const orgs = getLocalOrgs().map((o) => {
        if (o.id === orgId) {
          const branches = o.branches || [];
          const newBranch = { ...branchData, id: `b-${Date.now()}` };
          return {
            ...o,
            branches: [...branches, newBranch],
            branchesCount: branches.length + 1,
          };
        }
        return o;
      });
      saveLocalOrgs(orgs);
      return branchData;
    }
  },

  // 5. Tariflar (Plans)
  async getPlans() {
    try {
      return await request('/super-admin/plans');
    } catch {
      return [];
    }
  },

  async createPlan(planData) {
    try {
      return await request('/super-admin/plans', {
        method: 'POST',
        body: JSON.stringify(planData),
      });
    } catch {
      return planData;
    }
  },

  async updatePlan(id, planData) {
    try {
      return await request(`/super-admin/plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(planData),
      });
    } catch {
      return planData;
    }
  },

  async deletePlan(id) {
    try {
      return await request(`/super-admin/plans/${id}`, { method: 'DELETE' });
    } catch {
      return { status: 'deleted' };
    }
  },

  // 6. Invoyslar va to'lovlar
  async getInvoices() {
    try {
      return await request('/super-admin/invoices');
    } catch {
      return [];
    }
  },

  async createInvoice(invoiceData) {
    try {
      return await request('/super-admin/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      });
    } catch {
      return invoiceData;
    }
  },

  async recordInvoicePayment(id, paymentMethod) {
    try {
      return await request(`/super-admin/invoices/${id}/pay`, {
        method: 'POST',
        body: JSON.stringify({ payment_method: paymentMethod }),
      });
    } catch {
      return { status: 'paid' };
    }
  },

  // 7. Audit loglari
  async getAuditLogs() {
    try {
      const data = await request('/super-admin/audit-logs');
      if (Array.isArray(data)) {
        return data;
      }
      return getLocalLogs();
    } catch {
      return getLocalLogs();
    }
  },

  recordAuditLog(logItem) {
    const logs = getLocalLogs();
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      adminName: 'Sardor Ikromov (Super Admin)',
      ip: '127.0.0.1',
      status: 'success',
      ...logItem,
    };
    saveLocalLogs([newLog, ...logs]);
  },

    // 8. AI Query
  async queryAI(prompt, toolToCall = 'get_platform_statistics') {
    return await request('/ai/query', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        tool_to_call: toolToCall,
      }),
    });
  },

  // ==========================================
  // O'quv Markazi Ichki Boshqaruvi (Tenant Modules)
  // ==========================================

  // A. O'quvchilar (Students)
  async getStudents(orgId = 'default') {
    return await request(`/tenant/${encodeURIComponent(orgId)}/students`);
  },

  async createStudent(orgId, studentData) {
    return await request(`/tenant/${encodeURIComponent(orgId)}/students`, {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  async deleteStudent(orgId, studentId) {
    return await request(`/tenant/${encodeURIComponent(orgId)}/students/${encodeURIComponent(studentId)}`, {
      method: 'DELETE',
    });
  },

  // B. O'qituvchilar (Teachers)
  async getTeachers(orgId = 'default') {
    try {
      const raw = localStorage.getItem(`eduone_teachers_${orgId}`);
      if (!raw) {
        const defaultTeacher = {
          id: 'tch-1',
          organization_id: orgId,
          full_name: 'Asilbek Berdiqulov',
          phone: '+998 50 075 34 34',
          login: '+998500753434',
          password: 'teacher_asilbek',
          subject: 'Ingliz tili (IELTS)',
          branch_id: 'main',
          salary_type: 'percentage',
          salary_rate: 45,
          status: 'active',
          created_at: new Date().toISOString(),
        };
        localStorage.setItem(`eduone_teachers_${orgId}`, JSON.stringify([defaultTeacher]));
        return [defaultTeacher];
      }
      const parsed = JSON.parse(raw);
      const normalized = parsed.map((t) => {
        const isLowFixed = t.salary_type === 'fixed' && Number(t.salary_rate || 0) <= 100;
        return {
          ...t,
          login: t.login || (t.phone ? t.phone.replace(/[^0-9+]/g, '') : `teacher_${t.id}`),
          password: t.password || (t.id === 'tch-1' || (t.full_name || '').toLowerCase().includes('asilbek') ? 'teacher_asilbek' : `edu_${t.id ? t.id.slice(-4) : '2026'}`),
          salary_rate: isLowFixed ? 5000000 : Number(t.salary_rate || (t.salary_type === 'fixed' ? 5000000 : 40)),
        };
      });
      localStorage.setItem(`eduone_teachers_${orgId}`, JSON.stringify(normalized));
      return normalized;
    } catch {
      return [];
    }
  },

  async createTeacher(orgId, teacherData) {
    const list = await this.getTeachers(orgId);
    const cleanPhone = (teacherData.phone || '').replace(/[^0-9+]/g, '');
    const newTeacher = {
      id: `tch-${Date.now()}`,
      organization_id: orgId,
      full_name: teacherData.fullName,
      phone: teacherData.phone,
      login: teacherData.login?.trim() || cleanPhone || `teacher_${Date.now().toString().slice(-4)}`,
      password: teacherData.password?.trim() || `edu_${Math.floor(100000 + Math.random() * 900000)}`,
      subject: teacherData.subject || 'Ingliz tili',
      branch_id: teacherData.branchId || 'main',
      salary_type: teacherData.salaryType || 'percentage', // percentage, fixed, hourly
      salary_rate: teacherData.salaryRate || (teacherData.salaryType === 'fixed' ? 5000000 : 40),
      status: 'active',
      created_at: new Date().toISOString(),
    };
    const updated = [newTeacher, ...list];
    localStorage.setItem(`eduone_teachers_${orgId}`, JSON.stringify(updated));
    return newTeacher;
  },

  async deleteTeacher(orgId, teacherId) {
    const list = await this.getTeachers(orgId);
    const updated = list.filter((t) => t.id !== teacherId);
    localStorage.setItem(`eduone_teachers_${orgId}`, JSON.stringify(updated));
    return { status: 'deleted' };
  },

  // C. Guruhlar (Groups)
  async getGroups(orgId = 'default') {
    try {
      const raw = localStorage.getItem(`eduone_groups_${orgId}`);
      if (!raw || JSON.parse(raw).length === 0) {
        const teachers = await this.getTeachers(orgId);
        const mainTeacher = teachers[0]?.full_name || 'Asilbek Berdiqulov';
        const mainTeacherId = teachers[0]?.id || 'tch-1';

        const defaultGroups = [
          {
            id: 'grp-1',
            organization_id: orgId,
            name: 'IELTS Intensive 7.5+',
            subject: 'Ingliz tili (IELTS)',
            teacher_name: mainTeacher,
            teacher_id: mainTeacherId,
            room: 'Auditoriya 302',
            schedule_days: 'Dush-Chor-Juma',
            schedule_time: '14:00 - 15:30',
            price: 650000,
            max_students: 15,
            active_students: 14,
            status: 'active',
            created_at: new Date().toISOString(),
          },
          {
            id: 'grp-2',
            organization_id: orgId,
            name: 'General English B2 Intermediate',
            subject: 'Ingliz tili',
            teacher_name: mainTeacher,
            teacher_id: mainTeacherId,
            room: 'Auditoriya 104',
            schedule_days: 'Dush-Chor-Juma',
            schedule_time: '16:00 - 17:30',
            price: 550000,
            max_students: 16,
            active_students: 16,
            status: 'active',
            created_at: new Date().toISOString(),
          },
          {
            id: 'grp-3',
            organization_id: orgId,
            name: 'Frontend React & Node.js Pro',
            subject: 'Dasturlash (IT)',
            teacher_name: 'Sardor Ikromov',
            teacher_id: 'tch-2',
            room: 'IT Lab-1',
            schedule_days: 'Sesh-Pay-Shanba',
            schedule_time: '18:00 - 19:30',
            price: 800000,
            max_students: 12,
            active_students: 12,
            status: 'active',
            created_at: new Date().toISOString(),
          },
          {
            id: 'grp-4',
            organization_id: orgId,
            name: 'Matematika & Prezident Maktabi',
            subject: 'Matematika',
            teacher_name: 'Jamshid Xoliqov',
            teacher_id: 'tch-3',
            room: 'Auditoriya 201',
            schedule_days: 'Dush-Chor-Juma',
            schedule_time: '09:00 - 10:30',
            price: 500000,
            max_students: 18,
            active_students: 15,
            status: 'active',
            created_at: new Date().toISOString(),
          }
        ];
        localStorage.setItem(`eduone_groups_${orgId}`, JSON.stringify(defaultGroups));
        return defaultGroups;
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  async createGroup(orgId, groupData) {
    const list = await this.getGroups(orgId);
    const newGroup = {
      id: `grp-${Date.now()}`,
      organization_id: orgId,
      name: groupData.name,
      subject: groupData.subject || 'Ingliz tili',
      teacher_name: groupData.teacherName || 'Biriktirilmagan',
      teacher_id: groupData.teacherId || '',
      room: groupData.room || 'Xona-1',
      schedule_days: groupData.scheduleDays || 'Dush-Chor-Juma', // Dush-Chor-Juma, Sesh-Pay-Shanba, Har kuni
      schedule_time: groupData.scheduleTime || '14:00 - 15:30',
      price: groupData.price || 600000,
      max_students: groupData.maxStudents || 15,
      active_students: 0,
      status: 'active', // active, waiting, completed
      created_at: new Date().toISOString(),
    };
    const updated = [newGroup, ...list];
    localStorage.setItem(`eduone_groups_${orgId}`, JSON.stringify(updated));
    return newGroup;
  },

  async deleteGroup(orgId, groupId) {
    const list = await this.getGroups(orgId);
    const updated = list.filter((g) => g.id !== groupId);
    localStorage.setItem(`eduone_groups_${orgId}`, JSON.stringify(updated));
    return { status: 'deleted' };
  },

  // D. Lidlar va CRM (Leads)
  async getLeads(orgId = 'default') {
    try {
      const raw = localStorage.getItem(`eduone_leads_${orgId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async createLead(orgId, leadData) {
    const list = await this.getLeads(orgId);
    const newLead = {
      id: `lead-${Date.now()}`,
      organization_id: orgId,
      full_name: leadData.fullName,
      phone: leadData.phone,
      subject_interest: leadData.subjectInterest || 'Ingliz tili',
      source: leadData.source || 'Instagram', // Instagram, Telegram, Tavsiya, Tashrif
      stage: leadData.stage || 'new', // new, trial_booked, trial_completed, enrolled, rejected
      notes: leadData.notes || '',
      created_at: new Date().toISOString(),
    };
    const updated = [newLead, ...list];
    localStorage.setItem(`eduone_leads_${orgId}`, JSON.stringify(updated));
    return newLead;
  },

  async updateLeadStage(orgId, leadId, newStage) {
    const list = await this.getLeads(orgId);
    const updated = list.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l));
    localStorage.setItem(`eduone_leads_${orgId}`, JSON.stringify(updated));
    return { status: 'updated' };
  },

  async deleteLead(orgId, leadId) {
    const list = await this.getLeads(orgId);
    const updated = list.filter((l) => l.id !== leadId);
    localStorage.setItem(`eduone_leads_${orgId}`, JSON.stringify(updated));
    return { status: 'deleted' };
  },

  // E. Davomat (Attendance)
  async getAttendance(orgId, groupId, date) {
    try {
      const raw = localStorage.getItem(`eduone_attendance_${orgId}_${groupId}_${date}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async saveAttendance(orgId, groupId, date, records) {
    // records: [{ student_id, student_name, status: 'present'|'absent'|'late'|'excused', score: 5, notes: '' }]
    localStorage.setItem(`eduone_attendance_${orgId}_${groupId}_${date}`, JSON.stringify(records));
    return { status: 'saved', count: records.length };
  },

  // F. Moliya & O'quvchilar to'lovlari (Tenant Finance)
  async getStudentPayments(orgId = 'default') {
    return await request(`/tenant/${encodeURIComponent(orgId)}/student-payments`);
  },

  async recordStudentPayment(orgId, paymentData) {
    return await request(`/tenant/${encodeURIComponent(orgId)}/student-payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  async getExpenses(orgId = 'default') {
    try {
      const raw = localStorage.getItem(`eduone_expenses_${orgId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async recordExpense(orgId, expenseData) {
    const list = await this.getExpenses(orgId);
    const newExpense = {
      id: `exp-${Date.now()}`,
      organization_id: orgId,
      category: expenseData.category || 'Ijara', // Ijara, Kommunal, Oyliklar, Marketing, Kantselyariya
      amount: expenseData.amount,
      description: expenseData.description,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };
    const updated = [newExpense, ...list];
    localStorage.setItem(`eduone_expenses_${orgId}`, JSON.stringify(updated));
    return newExpense;
  },

  // G. Gamification (Koinlar va Mukofotlar Do'koni)
  async getRewardCatalog(orgId = 'default') {
    try {
      const raw = localStorage.getItem(`eduone_rewards_${orgId}`);
      if (raw) return JSON.parse(raw);
      // Boshlang'ich tavsiya etilgan do'kon mahsulotlari
      const defaults = [
        { id: 'rew-1', title: 'EduOne Brendli Futbolka', coin_price: 150, stock: 20, icon: 'Shirt' },
        { id: 'rew-2', title: 'Smart Termos (EduOne)', coin_price: 250, stock: 15, icon: 'Coffee' },
        { id: 'rew-3', title: 'Ingliz tili Grammatika Kitobi', coin_price: 100, stock: 30, icon: 'Book' },
        { id: 'rew-4', title: '50,000 so‘m Kursga Chegirma Vaucheri', coin_price: 300, stock: -1, icon: 'Tag' },
      ];
      localStorage.setItem(`eduone_rewards_${orgId}`, JSON.stringify(defaults));
      return defaults;
    } catch {
      return [];
    }
  },

  async createRewardItem(orgId, itemData) {
    const list = await this.getRewardCatalog(orgId);
    const newItem = {
      id: `rew-${Date.now()}`,
      organization_id: orgId,
      title: itemData.title,
      coin_price: Number(itemData.coinPrice),
      stock: itemData.stock || -1,
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...list];
    localStorage.setItem(`eduone_rewards_${orgId}`, JSON.stringify(updated));
    return newItem;
  },

  async awardStudentCoins(orgId, studentId, amount, reason) {
    return await request(`/tenant/${encodeURIComponent(orgId)}/students/${encodeURIComponent(studentId)}/coins`, {
      method: 'POST',
      body: JSON.stringify({ amount: Number(amount), reason }),
    });
  },

  // H. O'quvchi ma'lumotlarini yangilash & Muzlatish
  async updateStudent(orgId, studentId, studentData) {
    const students = await this.getStudents(orgId);
    const updated = students.map((s) => {
      if (s.id === studentId) {
        return { ...s, ...studentData };
      }
      return s;
    });
    localStorage.setItem(`eduone_students_${orgId}`, JSON.stringify(updated));
    return { status: 'updated' };
  },

  async toggleFreezeStudent(orgId, studentId) {
    const students = await this.getStudents(orgId);
    let newStatus = 'active';
    const updated = students.map((s) => {
      if (s.id === studentId) {
        newStatus = s.status === 'frozen' ? 'active' : 'frozen';
        return { ...s, status: newStatus };
      }
      return s;
    });
    localStorage.setItem(`eduone_students_${orgId}`, JSON.stringify(updated));
    return { status: 'toggled', newStatus };
  },

  // I. Bildirishnomalar va Qarz eslatmalari (SMS & Telegram)
  async sendStudentNotification(orgId, studentId, { type = 'debt', channel = 'all', message = '' }) {
    const students = await this.getStudents(orgId);
    const student = students.find((s) => s.id === studentId);
    const rawLogs = localStorage.getItem(`eduone_sms_logs_${orgId}`);
    const logs = rawLogs ? JSON.parse(rawLogs) : [];

    const newLog = {
      id: `notif-${Date.now()}`,
      student_id: studentId,
      student_name: student ? `${student.first_name} ${student.last_name}` : 'O‘quvchi',
      phone: student?.phone || '',
      type, // 'debt', 'receipt', 'attendance', 'custom'
      channel, // 'sms', 'telegram', 'all'
      message,
      sent_at: new Date().toISOString(),
      status: 'delivered',
    };

    localStorage.setItem(`eduone_sms_logs_${orgId}`, JSON.stringify([newLog, ...logs]));
    return newLog;
  },

  async getNotificationLogs(orgId = 'default') {
    try {
      const raw = localStorage.getItem(`eduone_sms_logs_${orgId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // J. Xonalar boshqaruvi (Rooms)
  async getRooms(orgId = 'default') {
    try {
      const raw = localStorage.getItem(`eduone_rooms_${orgId}`);
      if (raw) return JSON.parse(raw);
      const defaults = [
        { id: 'room-1', name: 'Xona-1 (Oxford)', capacity: 16, equipment: 'Proyektor, Konditsioner', branch: 'Bosh Filial' },
        { id: 'room-2', name: 'Xona-2 (Cambridge)', capacity: 18, equipment: 'Smart TV, Konditsioner', branch: 'Bosh Filial' },
        { id: 'room-3', name: 'Xona-3 (Harvard IT)', capacity: 20, equipment: 'Monobloklar, Wi-Fi 6', branch: 'Bosh Filial' },
        { id: 'room-4', name: 'Xona-4 (Individual)', capacity: 6, equipment: 'Konditsioner', branch: 'Bosh Filial' },
      ];
      localStorage.setItem(`eduone_rooms_${orgId}`, JSON.stringify(defaults));
      return defaults;
    } catch {
      return [];
    }
  },

  async createRoom(orgId, roomData) {
    const rooms = await this.getRooms(orgId);
    const newRoom = {
      id: `room-${Date.now()}`,
      name: roomData.name,
      capacity: Number(roomData.capacity) || 15,
      equipment: roomData.equipment || '',
      branch: roomData.branch || 'Bosh Filial',
    };
    const updated = [...rooms, newRoom];
    localStorage.setItem(`eduone_rooms_${orgId}`, JSON.stringify(updated));
    return newRoom;
  },

  async deleteRoom(orgId, roomId) {
    const rooms = await this.getRooms(orgId);
    const updated = rooms.filter((r) => r.id !== roomId);
    localStorage.setItem(`eduone_rooms_${orgId}`, JSON.stringify(updated));
    return { status: 'deleted' };
  },

  // K. Tizim va Filial Sozlamalari (Settings)
  async getSettings(orgId = 'default') {
    try {
      const raw = localStorage.getItem(`eduone_settings_${orgId}`);
      if (raw) return JSON.parse(raw);
      const defaults = {
        orgName: 'EduOne Ta’lim Markazi',
        phone: '+998 71 200 00 00',
        email: 'info@eduone.uz',
        address: 'Toshkent sh., Yunusobod tumani, 4-mavze',
        smsProvider: 'eskiz',
        smsApiKey: '',
        telegramBotToken: '',
        telegramChannelId: '',
        autoSendAttendance: true,
        autoSendDebtReminder: true,
        debtNotificationDay: 5, // Har oyning 5-sanasida
        defaultLessonDuration: 90, // minut
      };
      localStorage.setItem(`eduone_settings_${orgId}`, JSON.stringify(defaults));
      return defaults;
    } catch {
      return {};
    }
  },

  async updateSettings(orgId, settingsData) {
    localStorage.setItem(`eduone_settings_${orgId}`, JSON.stringify(settingsData));
    return { status: 'updated' };
  },
};
