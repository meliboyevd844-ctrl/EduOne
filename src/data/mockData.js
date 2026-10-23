export const organizations = [
  { id: 'hq', name: 'EduOne Bosh Markazi', city: 'Toshkent', active: true },
  { id: 'chilonzor', name: 'Chilonzor Filiali', city: 'Toshkent', active: false },
  { id: 'yunusobod', name: 'Yunusobod Filiali', city: 'Toshkent', active: false },
  { id: 'samarqand', name: 'Samarqand IT Markazi', city: 'Samarqand', active: false },
];

export const currentAdmin = {
  name: 'Sardor Ikromov',
  role: 'Bosh administrator',
  email: 'admin@eduone.uz',
  avatar: null,
  status: 'Online',
  notificationsCount: 4,
};

export const dashboardMetrics = [
  {
    id: 'students',
    title: 'Jami o‘quvchilar',
    value: '1,428',
    change: '+12.4%',
    isPositive: true,
    comparison: 'o‘tgan oyga nisbatan',
    subText: '1,385 faol • 43 ta akademik ta’til',
    icon: 'GraduationCap',
  },
  {
    id: 'groups',
    title: 'Faol guruhlar',
    value: '48',
    change: '+4 yangi',
    isPositive: true,
    comparison: 'shu oy ochilgan',
    subText: 'Xonalar bandligi: 88.5%',
    icon: 'Users',
  },
  {
    id: 'attendance',
    title: 'Bugungi davomat',
    value: '94.6%',
    change: '+1.8%',
    isPositive: true,
    comparison: 'kechagiga nisbatan',
    subText: '1,180 keldi • 67 kelmadi (42 sababli)',
    icon: 'UserCheck',
  },
  {
    id: 'pending_payments',
    title: 'Kutilayotgan to‘lovlar',
    value: '42,500,000 UZS',
    change: '-8.2%',
    isPositive: true, // qarzdorlik kamaygani ijobiy
    comparison: 'qarzdorlik qisqarishi',
    subText: '24 nafar o‘quvchi to‘lov muddatida',
    icon: 'CreditCard',
  },
];

export const weeklyAttendanceData = [
  { day: 'Dush', date: '12 Okt', present: 1140, absent: 72, rate: 94.1 },
  { day: 'Sesh', date: '13 Okt', present: 1175, absent: 55, rate: 95.5 },
  { day: 'Chor', date: '14 Okt', present: 1160, absent: 64, rate: 94.8 },
  { day: 'Pay', date: '15 Okt', present: 1192, absent: 44, rate: 96.4 },
  { day: 'Jum', date: '16 Okt', present: 1180, absent: 67, rate: 94.6 },
  { day: 'Shan', date: '17 Okt', present: 980, absent: 38, rate: 96.3 },
];

export const paymentMonthlyData = [
  { month: 'May', received: 142000000, pending: 38000000 },
  { month: 'Iyun', received: 168000000, pending: 41000000 },
  { month: 'Iyul', received: 155000000, pending: 35000000 },
  { month: 'Avg', received: 195000000, pending: 49000000 },
  { month: 'Sen', received: 228000000, pending: 46000000 },
  { month: 'Okt', received: 245000000, pending: 42500000 },
];

export const todayLessons = [
  {
    id: 'L-101',
    group: 'Frontend Bootcamp #14',
    subject: 'React & State Management',
    teacher: 'Jasurbek Mirzayev',
    room: 'Lab-302',
    time: '09:00 - 11:00',
    studentsCount: 22,
    status: 'completed', // completed, in_progress, upcoming, cancelled
    statusLabel: 'Tugallandi',
  },
  {
    id: 'L-102',
    group: 'Python Backend Pro #08',
    subject: 'PostgreSQL & ORM arxitekturasi',
    teacher: 'Farrux To‘rayev',
    room: 'Lab-201',
    time: '11:15 - 13:15',
    studentsCount: 18,
    status: 'in_progress',
    statusLabel: 'Jarayonda',
  },
  {
    id: 'L-103',
    group: 'IELTS Intensive 7.5+',
    subject: 'Writing Task 2: Advanced Cohesion',
    teacher: 'Malika Karimova',
    room: 'A-105',
    time: '14:00 - 16:00',
    studentsCount: 16,
    status: 'upcoming',
    statusLabel: 'Kutilmoqda',
  },
  {
    id: 'L-104',
    group: 'Data Analytics #04',
    subject: 'Power BI Dashboard Dizayni',
    teacher: 'Otabek Yo‘ldoshev',
    room: 'Lab-104',
    time: '16:30 - 18:30',
    studentsCount: 20,
    status: 'upcoming',
    statusLabel: 'Kutilmoqda',
  },
  {
    id: 'L-105',
    group: 'Kids Scratch & Robotics',
    subject: 'Game Logic: Loop and Events',
    teacher: 'Nodira Qodirova',
    room: 'Junior-1',
    time: '18:45 - 20:15',
    studentsCount: 14,
    status: 'upcoming',
    statusLabel: 'Kutilmoqda',
  },
];

export const recentActivities = [
  {
    id: 'act-1',
    type: 'payment',
    title: 'To‘lov qabul qilindi',
    description: 'Sardorbek Aliyev 1,200,000 UZS to‘ladi (Payme orqali)',
    category: 'Frontend #14 guruhi',
    time: '5 daqiqa oldin',
  },
  {
    id: 'act-2',
    type: 'student',
    title: 'Yangi o‘quvchi ro‘yxatdan o‘tdi',
    description: 'Zarina Usmanova "IELTS Intensive" kursiga qabul qilindi',
    category: 'Qabul bo‘limi',
    time: '24 daqiqa oldin',
  },
  {
    id: 'act-3',
    type: 'attendance',
    title: 'Davomat tasdiqlandi',
    description: 'Python Backend #08 guruhi darsi uchun davomat to‘liq olindi: 17/18',
    category: 'Farrux To‘rayev',
    time: '1 soat oldin',
  },
  {
    id: 'act-4',
    type: 'group',
    title: 'Yangi guruh ochildi',
    description: 'Graphic Design UI/UX #03 guruhiga darslar jadvali biriktirildi',
    category: 'Akademik bo‘lim',
    time: '3 soat oldin',
  },
  {
    id: 'act-5',
    type: 'payment',
    title: 'To‘lov eslatmasi yuborildi',
    description: '14 nafar qarzdor o‘quvchiga SMS xabarnoma jo‘natildi',
    category: 'Moliya bo‘limi',
    time: 'Bugun, 09:30',
  },
];

export const navItems = [
  { path: '/', label: 'Bosh sahifa', icon: 'LayoutDashboard', exact: true },
  { path: '/students', label: 'O‘quvchilar', icon: 'GraduationCap' },
  { path: '/teachers', label: 'O‘qituvchilar', icon: 'UserSquare2' },
  { path: '/groups', label: 'Guruhlar', icon: 'FolderKanban' },
  { path: '/timetable', label: 'Dars jadvali', icon: 'CalendarDays' },
  { path: '/attendance', label: 'Davomat', icon: 'CheckCheck' },
  { path: '/finance', label: 'Moliya', icon: 'Coins' },
  { path: '/reports', label: 'Hisobotlar', icon: 'BarChart3' },
  { path: '/settings', label: 'Sozlamalar', icon: 'Settings' },
];
