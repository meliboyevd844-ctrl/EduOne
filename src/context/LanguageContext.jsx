import React, { createContext, useContext, useState, useEffect } from 'react';

export const translations = {
  uz: {
    // Nav Items - Admin
    dashboard: 'Bosh sahifa',
    leads: 'Lidlar (CRM)',
    students: 'O‘quvchilar',
    teachers: 'O‘qituvchilar',
    groups: 'Guruhlar',
    timetable: 'Dars jadvali',
    attendance: 'Davomat',
    finance: 'Moliya & To‘lovlar',
    gamification: 'Koinlar & Do‘kon',
    reports: 'Hisobotlar',
    settings: 'Sozlamalar',

    // Nav Items - Super Admin
    sa_dashboard: 'Boshqaruv paneli',
    sa_organizations: 'Tashkilotlar',
    sa_branches: 'Filiallar',
    sa_subscriptions: 'Obunalar',
    sa_plans: 'Tariflar va narxlar',
    sa_finance: 'To‘lovlar va qarzlar',
    sa_features: 'Funksiyalar boshqaruvi',
    sa_users: 'Foydalanuvchilar va huquqlar',
    sa_ai: 'AI boshqaruvi va iste’mol',
    sa_telegram: 'Telegram bot va xabarnomalar',
    sa_reports: 'Hisobotlar va tahlil',
    sa_audit: 'Audit jurnali',
    sa_settings: 'Tizim sozlamalari',

    // Header & Common
    search_placeholder: 'Qidirish...',
    search_admin: 'O‘quvchi, guruh yoki o‘qituvchini qidirish...',
    search_superadmin: 'Tashkilot, filial yoki foydalanuvchini qidirish...',
    today: 'Bugun',
    notifications: 'Bildirishnomalar',
    no_notifications: 'Hozircha yangi bildirishnomalar mavjud emas.',
    all_read: 'Hammasini o‘qish',
    my_profile: 'Mening profilim',
    logout: 'Tizimdan chiqish',
    center_panel: 'Markaz paneli',
    super_admin_title: 'Super Admin',
    new_org: 'Yangi tashkilot',
    back_to_superadmin: 'Super Adminga qaytish',
    center_management: 'O‘quv markazi boshqaruvi',
    active_now: 'Faol',
    inactive: 'Nofaol',
    save: 'Saqlash',
    cancel: 'Bekor qilish',
    edit: 'Tahrirlash',
    delete: 'O‘chirish',
    details: 'Batafsil',
    create: 'Yaratish',
    close: 'Yopish',
    all: 'Barchasi',
    filter: 'Filtr',
    status: 'Holat',
    actions: 'Amallar',

    // Themes & Wallpapers
    theme_light: 'Kunduzgi rejim',
    theme_dark: 'Tungi rejim',
    switch_theme: 'Mavzuni almashtirish',
    wallpaper_dynamic_island: 'Dynamic Island • Fon Boshqaruvi',
    wallpaper_main: 'Asosiy Maydon',
    wallpaper_sidebar: 'Yon Menyu (Sidebar)',
    wallpaper_sync: 'Sinxron',
    wallpaper_add_btn: 'Fon qo‘shish',
    wallpaper_upload_title: 'Yangi orqa fon yuklash',
    wallpaper_name_label: 'Fon nomi',
    wallpaper_file_label: 'Kompyuterdan rasm yuklash',
    wallpaper_url_label: 'Yoki rasm havolasi (URL)',
    wallpaper_save_btn: 'Saqlash va qo‘llash',
    wallpaper_every_5m: 'Har 5 daqiqa',
    wallpaper_paused: 'To‘xtatilgan',
    wallpaper_auto: 'Avtomatik aylanmoqda',
  },
  ru: {
    // Nav Items - Admin
    dashboard: 'Главная',
    leads: 'Лиды (CRM)',
    students: 'Студенты',
    teachers: 'Преподаватели',
    groups: 'Группы',
    timetable: 'Расписание',
    attendance: 'Посещаемость',
    finance: 'Финансы и платежи',
    gamification: 'Коины и магазин',
    reports: 'Отчеты',
    settings: 'Настройки',

    // Nav Items - Super Admin
    sa_dashboard: 'Панель управления',
    sa_organizations: 'Организации',
    sa_branches: 'Филиалы',
    sa_subscriptions: 'Подписки',
    sa_plans: 'Тарифы и цены',
    sa_finance: 'Платежи и задолженности',
    sa_features: 'Управление функциями',
    sa_users: 'Пользователи и права',
    sa_ai: 'AI мониторинг и лимиты',
    sa_telegram: 'Telegram бот и уведомления',
    sa_reports: 'Отчеты и аналитика',
    sa_audit: 'Журнал аудита',
    sa_settings: 'Системные настройки',

    // Header & Common
    search_placeholder: 'Поиск...',
    search_admin: 'Поиск студентов, групп или преподавателей...',
    search_superadmin: 'Поиск организации, филиала или пользователя...',
    today: 'Сегодня',
    notifications: 'Уведомления',
    no_notifications: 'Новых уведомлений пока нет.',
    all_read: 'Прочитать все',
    my_profile: 'Мой профиль',
    logout: 'Выйти из системы',
    center_panel: 'Панель центра',
    super_admin_title: 'Супер Админ',
    new_org: 'Новая организация',
    back_to_superadmin: 'Вернуться в Супер Админ',
    center_management: 'Управление учебным центром',
    active_now: 'Активен',
    inactive: 'Неактивен',
    save: 'Сохранить',
    cancel: 'Отмена',
    edit: 'Редактировать',
    delete: 'Удалить',
    details: 'Подробнее',
    create: 'Создать',
    close: 'Закрыть',
    all: 'Все',
    filter: 'Фильтр',
    status: 'Статус',
    actions: 'Действия',

    // Themes & Wallpapers
    theme_light: 'Дневной режим',
    theme_dark: 'Ночной режим',
    switch_theme: 'Сменить тему',
    wallpaper_dynamic_island: 'Dynamic Island • Управление фоном',
    wallpaper_main: 'Основная область',
    wallpaper_sidebar: 'Боковое меню (Sidebar)',
    wallpaper_sync: 'Синхронно',
    wallpaper_add_btn: 'Добавить фон',
    wallpaper_upload_title: 'Загрузить новый фон',
    wallpaper_name_label: 'Название фона',
    wallpaper_file_label: 'Загрузить фото с компьютера',
    wallpaper_url_label: 'Или ссылка на фото (URL)',
    wallpaper_save_btn: 'Сохранить и применить',
    wallpaper_every_5m: 'Каждые 5 минут',
    wallpaper_paused: 'Приостановлено',
    wallpaper_auto: 'Автоматическая смена',
  },
  en: {
    // Nav Items - Admin
    dashboard: 'Dashboard',
    leads: 'Leads (CRM)',
    students: 'Students',
    teachers: 'Teachers',
    groups: 'Groups',
    timetable: 'Timetable',
    attendance: 'Attendance',
    finance: 'Finance & Payments',
    gamification: 'Coins & Rewards',
    reports: 'Reports',
    settings: 'Settings',

    // Nav Items - Super Admin
    sa_dashboard: 'Dashboard',
    sa_organizations: 'Organizations',
    sa_branches: 'Branches',
    sa_subscriptions: 'Subscriptions',
    sa_plans: 'Plans & Pricing',
    sa_finance: 'Payments & Debts',
    sa_features: 'Feature Flags',
    sa_users: 'Users & Roles',
    sa_ai: 'AI Monitoring',
    sa_telegram: 'Telegram Bot',
    sa_reports: 'Reports & Analytics',
    sa_audit: 'Audit Logs',
    sa_settings: 'System Settings',

    // Header & Common
    search_placeholder: 'Search...',
    search_admin: 'Search students, groups, or teachers...',
    search_superadmin: 'Search organizations, branches, or users...',
    today: 'Today',
    notifications: 'Notifications',
    no_notifications: 'No new notifications right now.',
    all_read: 'Mark all as read',
    my_profile: 'My Profile',
    logout: 'Log Out',
    center_panel: 'Center Panel',
    super_admin_title: 'Super Admin',
    new_org: 'New Organization',
    back_to_superadmin: 'Back to Super Admin',
    center_management: 'Education Center Management',
    active_now: 'Active',
    inactive: 'Inactive',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    details: 'Details',
    create: 'Create',
    close: 'Close',
    all: 'All',
    filter: 'Filter',
    status: 'Status',
    actions: 'Actions',

    // Themes & Wallpapers
    theme_light: 'Light Mode',
    theme_dark: 'Dark Mode',
    switch_theme: 'Toggle Theme',
    wallpaper_dynamic_island: 'Dynamic Island • Wallpaper Control',
    wallpaper_main: 'Main Workspace',
    wallpaper_sidebar: 'Sidebar',
    wallpaper_sync: 'Sync',
    wallpaper_add_btn: 'Add Wallpaper',
    wallpaper_upload_title: 'Upload New Wallpaper',
    wallpaper_name_label: 'Wallpaper Name',
    wallpaper_file_label: 'Upload Image from Computer',
    wallpaper_url_label: 'Or Image Link (URL)',
    wallpaper_save_btn: 'Save & Apply',
    wallpaper_every_5m: 'Every 5 mins',
    wallpaper_paused: 'Paused',
    wallpaper_auto: 'Auto Rotating',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('eduone_language');
      if (saved && (saved === 'uz' || saved === 'ru' || saved === 'en')) {
        return saved;
      }
    } catch {}
    return 'uz';
  });

  const setLanguage = (lang) => {
    if (lang === 'uz' || lang === 'ru' || lang === 'en') {
      setLanguageState(lang);
      try {
        localStorage.setItem('eduone_language', lang);
      } catch {}
    }
  };

  const t = (key, fallback = '') => {
    const dict = translations[language] || translations.uz;
    return dict[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
