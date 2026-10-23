// EduOne Platform SaaS Data Model & Multi-Tenant State
// Barcha ma'lumotlar ko'p tashkilotli (multi-tenant) arxitekturaga moslangan.
// ASOSIY QOIDA: Baza bo'sh bo'lganda barcha hisoblagichlar 0 bo'ladi, soxta tashkilotlar yaratilmaydi.

export const availableModules = [
  {
    code: 'claude_ai',
    name: 'Claude AI Asistenti',
    description: 'Admin va o‘quvchilar uchun Claude API orqali aqlli tahlillar, xulosalar va avtomatlashtirish',
    category: 'Sun’iy Intellekt',
    icon: 'Bot',
    defaultEnabled: true,
  },
  {
    code: 'telegram_bot',
    name: 'Telegram Bot Xabarnomalari',
    description: 'Ota-ona, o‘quvchi va o‘qituvchilarga dars va davomat bo‘yicha avtomatik bildirishnomalar',
    category: 'Kommunikatsiya',
    icon: 'Send',
    defaultEnabled: true,
  },
  {
    code: 'online_billing',
    name: 'Online Billing (Payme / Click / Uzum)',
    description: 'O‘quvchilar to‘lovlarini avtomatlashtirilgan qabul qilish va elektron chek berish',
    category: 'Moliya',
    icon: 'CreditCard',
    defaultEnabled: true,
  },
  {
    code: 'face_id_turnstile',
    name: 'Face ID & Turniket Nazorati',
    description: 'Kamera orqali yuzni tanib olib darsga kelish-ketish davomatini avtomatik qayd etish',
    category: 'Uskunalar',
    icon: 'Camera',
    defaultEnabled: false,
  },
  {
    code: 'ai_student_tutor',
    name: 'AI Shaxsiy Repetitor (Student Tutor)',
    description: 'O‘quvchining test natijalari asosida shaxsiy o‘quv rejalari va test savollarini tuzish',
    category: 'Sun’iy Intellekt',
    icon: 'GraduationCap',
    defaultEnabled: false,
  },
  {
    code: 'parent_portal',
    name: 'Ota-onalar Shaxsiy Kabineti',
    description: 'Ota-onalar uchun veb va mobil ilovada farzandi davomati va to‘lovlarini kuzatish',
    category: 'Portallar',
    icon: 'Users',
    defaultEnabled: true,
  },
  {
    code: 'sms_gateway',
    name: 'SMS Shlyuzi (Eskiz / PlayMobile)',
    description: 'Ota-onalarga dars qoldirilganda darhol to‘g‘ridan-to‘g‘ri SMS xabarnoma yuborish',
    category: 'Kommunikatsiya',
    icon: 'MessageSquare',
    defaultEnabled: false,
  },
  {
    code: 'timetable_conflict',
    name: 'Dars Jadvali va Xonalar Nazorati',
    description: 'Xonalar to‘qnashuvining oldini oluvchi aqlli taqvim va o‘qituvchilar dars jadvali',
    category: 'Akademik',
    icon: 'Calendar',
    defaultEnabled: true,
  },
];

export const platformFeatureFlags = availableModules;

// Boshlang'ich metrikalar: baza bo'sh bo'lganda qat'iy 0
export const superAdminMetrics = {
  totalOrganizations: 0,
  activeOrganizations: 0,
  trialOrganizations: 0,
  suspendedOrganizations: 0,
  cancelledOrganizations: 0,
  totalBranches: 0,
  totalStudents: 0,
  totalTeachers: 0,
  totalGroups: 0,
  platformMRR: 0,
  platformExpectedRevenue: 0,
  paidSubscriptions: 0,
  pendingSubscriptions: 0,
  failedSubscriptions: 0,
  aiMonthlyTokens: 0,
  aiEstimatedCostUSD: 0,
  aiActiveRequestsCount: 0,
  telegramBotStatus: 'online',
  telegramMessagesSentToday: 0,
  telegramActiveAccounts: 0,
  systemHealth: 100.0,
  activeAlertsCount: 0,
};

// Boshlang'ich tashkilotlar ro'yxati — qat'iyan bo'sh!
// Faqat Super Admin o'zi yaratgandan keyin paydo bo'ladi.
export const initialOrganizations = [];

// Platforma obuna tariflari
export const platformPlans = [
  {
    id: 'plan-starter',
    code: 'STARTER',
    name: 'Boshlang‘ich',
    priceMonthly: 800000,
    priceYearly: 8000000,
    trialDays: 14,
    branchLimit: 1,
    studentLimit: 250,
    aiTokenLimit: 100000,
    popular: false,
    features: [
      '1 ta filial',
      '250 tagacha o‘quvchi',
      'Dars jadvali va xonalar',
      'Telegram bot xabarnomalari',
      '100,000 Claude AI token',
      'Davomat va baholar jurnali',
    ],
    defaultModules: ['claude_ai', 'telegram_bot', 'parent_portal', 'timetable_conflict'],
  },
  {
    id: 'plan-pro',
    code: 'PRO',
    name: 'Professional',
    priceMonthly: 1800000,
    priceYearly: 18000000,
    trialDays: 14,
    branchLimit: 5,
    studentLimit: 1200,
    aiTokenLimit: 500000,
    popular: true,
    features: [
      '5 tagacha filial',
      '1,200 tagacha o‘quvchi',
      'Online Billing (Payme, Click, Uzum)',
      '500,000 Claude AI token',
      'Telegram bot va ota-onalar portali',
      'Ustozlar KPI va oylik hisobi',
      'SMS shlyuz integratsiyasi',
    ],
    defaultModules: [
      'claude_ai',
      'telegram_bot',
      'online_billing',
      'ai_student_tutor',
      'parent_portal',
      'sms_gateway',
      'timetable_conflict',
    ],
  },
  {
    id: 'plan-enterprise',
    code: 'ENTERPRISE',
    name: 'Enterprise VIP',
    priceMonthly: 3500000,
    priceYearly: 35000000,
    trialDays: 30,
    branchLimit: 20,
    studentLimit: 5000,
    aiTokenLimit: 1500000,
    popular: false,
    features: [
      '20 tagacha filial',
      '5,000+ o‘quvchi',
      'Face ID & Turniket integratsiyasi',
      '1,500,000 Claude AI token',
      'Shaxsiy subdomen yoki custom domen',
      '24/7 VIP texnik qo‘llab-quvvatlash',
      'Maxsus hisobotlar va eksport',
    ],
    defaultModules: [
      'claude_ai',
      'telegram_bot',
      'online_billing',
      'face_id_turnstile',
      'ai_student_tutor',
      'parent_portal',
      'sms_gateway',
      'timetable_conflict',
    ],
  },
];

// Bo'sh boshlanuvchi hisob-fakturalar (Invoices)
export const platformInvoices = [];

// Boshlang'ich audit jurnali
export const platformAuditLogs = [
  {
    id: 'log-init-1',
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    adminName: 'Tizim (System)',
    action: 'EduOne Multi-tenant Core ishga tushirildi (baza bo‘sh, 0 ta tashkilot)',
    target: 'Platforma yadrosi',
    ip: '127.0.0.1',
    status: 'success',
  },
];
