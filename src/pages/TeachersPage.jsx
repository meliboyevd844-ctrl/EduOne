import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { api } from '../lib/api';
import {
  UserSquare2,
  Plus,
  Search,
  Phone,
  BookOpen,
  DollarSign,
  Trash2,
  Users,
  Award,
  X,
  Building2,
  Calendar,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Send,
  Sparkles,
  LogIn,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { formatUZS, formatUzbekPhone, cn } from '../lib/utils';

export function TeachersPage() {
  const navigate = useNavigate();
  const [activeOrg, setActiveOrg] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [showPasswordInForm, setShowPasswordInForm] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '+998 ',
    login: '',
    password: '',
    subject: 'Ingliz tili (IELTS)',
    salaryType: 'percentage',
    salaryRate: 40,
  });

  // Post-creation or View Credentials Modal
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);
  const [activeCredentials, setActiveCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState('');
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);

  const orgId = activeOrg?.id || 'default';

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('eduone_impersonating_org');
      if (raw) setActiveOrg(JSON.parse(raw));
    } catch {}
  }, []);

  const loadTeachers = async () => {
    const data = await api.getTeachers(orgId);
    setTeachers(data);
  };

  useEffect(() => {
    loadTeachers();
  }, [activeOrg]);

  // Auto-generate strong credentials
  const generateCredentials = (name, phone) => {
    const cleanPhone = (phone || '').replace(/[^0-9+]/g, '');
    let cleanName = (name || '').trim().toLowerCase().split(' ')[0] || 'ustoz';
    cleanName = cleanName.replace(/[^a-z0-9]/gi, '');
    const randomNum = Math.floor(100000 + Math.random() * 900000);

    return {
      login: cleanPhone && cleanPhone.length >= 9 ? cleanPhone : `${cleanName}_${randomNum.toString().slice(-4)}`,
      password: `edu_${randomNum}`,
    };
  };

  const handleOpenCreateModal = () => {
    const creds = generateCredentials('', '');
    setFormData({
      fullName: '',
      phone: '+998 ',
      login: '',
      password: creds.password,
      subject: 'Ingliz tili (IELTS)',
      salaryType: 'percentage',
      salaryRate: 40,
    });
    setModalOpen(true);
  };

  const handleSalaryTypeChange = (newType) => {
    let newRate = formData.salaryRate;
    if (newType === 'percentage') {
      newRate = 40;
    } else if (newType === 'fixed') {
      newRate = 5000000;
    } else if (newType === 'hourly') {
      newRate = 60000;
    }
    setFormData({
      ...formData,
      salaryType: newType,
      salaryRate: newRate,
    });
  };

  const handleNameOrPhoneChange = (field, value) => {
    const finalVal = field === 'phone' ? formatUzbekPhone(value) : value;
    const nextForm = { ...formData, [field]: finalVal };
    // If login was empty or previously auto-generated from phone, keep it synced
    if (field === 'phone' && (!formData.login || formData.login === formData.phone.replace(/[^0-9+]/g, ''))) {
      nextForm.login = finalVal.replace(/[^0-9+]/g, '');
    }
    setFormData(nextForm);
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) return;

    const finalLogin = formData.login.trim() || formData.phone.replace(/[^0-9+]/g, '');
    const finalPassword = formData.password.trim() || `edu_${Math.floor(100000 + Math.random() * 900000)}`;

    const newTeacher = await api.createTeacher(orgId, {
      ...formData,
      login: finalLogin,
      password: finalPassword,
    });

    setModalOpen(false);
    await loadTeachers();

    // Show Credentials Modal
    setActiveCredentials(newTeacher);
    setCredentialsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Haqiqatan ham "${name}" o‘qituvchisini o‘chirmoqchimisiz?`)) {
      await api.deleteTeacher(orgId, id);
      loadTeachers();
    }
  };

  // Enter Teacher Portal directly (Impersonation)
  const enterTeacherPortal = (teacher) => {
    sessionStorage.setItem('eduone_active_teacher', JSON.stringify(teacher));
    navigate('/teacher');
  };

  // Open credentials viewer for existing teacher
  const openCredentialsViewer = (teacher) => {
    setActiveCredentials(teacher);
    setShowPasswordInModal(false);
    setCredentialsModalOpen(true);
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2500);
  };

  const shareViaTelegram = (teacher) => {
    const portalUrl = `${window.location.origin}/teacher/login`;
    const message = `Assalomu alaykum, ${teacher.full_name}!\n\nSiz EduOne ta'lim platformasiga ustoz sifatida biriktirildingiz.\n\n🌐 Ustoz Kabineti: ${portalUrl}\n👤 Login: ${teacher.login || teacher.phone}\n🔑 Parol: ${teacher.password || 'teacher_asilbek'}\n\nUshbu ma'lumotlar bilan tizimga kirib, guruhlaringiz davomati va dars jadvalingizni yuritishingiz mumkin.`;
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(portalUrl)}&text=${encodeURIComponent(message)}`;
    window.open(tgUrl, '_blank');
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      (t.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.subject || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.phone || '').includes(search) ||
      (t.login || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Bosh sahifa', href: '/' }, { label: 'O‘qituvchilar' }]} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252936] dark:text-white flex items-center gap-2.5">
            <UserSquare2 className="w-6 h-6 text-[#4169E1]" />
            O‘qituvchilar va Ustozlar
          </h1>
          <p className="text-xs text-[#7C8494] dark:text-gray-400 mt-1">
            Ustozlar shtati, tizimga kirish login/parollari va shaxsiy kabinetga kirish
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            icon={LogIn}
            onClick={() => {
              if (teachers.length > 0) {
                enterTeacherPortal(teachers[0]);
              } else {
                navigate('/teacher/login');
              }
            }}
            className="text-xs font-semibold"
          >
            O‘qituvchi Portalini Ochish
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={handleOpenCreateModal}
          >
            Yangi O‘qituvchi Qo‘shish
          </Button>
        </div>
      </div>

      {/* Quick Search */}
      <div className="p-3 flex items-center gap-2.5 bg-white dark:bg-[#141A26] border border-[#E7EAF0] dark:border-white/10 rounded-xl shadow-xs">
        <Search className="w-4 h-4 text-[#7C8494]" />
        <input
          type="text"
          placeholder="O‘qituvchi ismi, fani, telefoni yoki logini bo‘yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-[#252936] dark:text-white placeholder:text-[#7C8494]/60 focus:outline-none"
        />
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-[#141A26] rounded-2xl border border-[#E7EAF0] dark:border-white/10 text-[#7C8494]">
            <UserSquare2 className="w-12 h-12 mx-auto text-[#7C8494]/40 mb-3" />
            <h4 className="text-sm font-bold text-[#252936] dark:text-white">O‘qituvchilar topilmadi</h4>
            <p className="text-xs text-[#7C8494] mt-1 mb-4">Markazga yangi ustoz qo‘shing va login/parol taqdim eting.</p>
            <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreateModal}>
              Yangi O‘qituvchi Qo‘shish
            </Button>
          </div>
        ) : (
          filteredTeachers.map((teacher) => (
            <Card
              key={teacher.id}
              className="p-4 space-y-3.5 bg-white dark:bg-[#141A26] border-[#E7EAF0] dark:border-white/10 hover:border-[#4169E1]/40 transition-all shadow-xs rounded-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Name, Subject, Trash */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-500/20 dark:to-indigo-500/20 text-[#4169E1] dark:text-blue-300 border border-[#4169E1]/20 font-black flex items-center justify-center text-base shrink-0 shadow-xs">
                      {teacher.full_name ? teacher.full_name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#252936] dark:text-white truncate">
                        {teacher.full_name}
                      </h3>
                      <p className="text-xs text-[#4169E1] dark:text-amber-400 flex items-center gap-1 mt-0.5 font-medium truncate">
                        <BookOpen className="w-3 h-3 shrink-0" />
                        {teacher.subject}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(teacher.id, teacher.full_name)}
                    className="text-[#7C8494] hover:text-[#D94B4B] p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shrink-0"
                    title="O‘qituvchini o‘chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details Section */}
                <div className="pt-2 border-t border-[#E7EAF0] dark:border-white/10 space-y-2 text-xs">
                  {/* Phone */}
                  <div className="flex items-center justify-between text-[#7C8494] dark:text-gray-400">
                    <span>Telefon:</span>
                    <a href={`tel:${teacher.phone}`} className="text-[#252936] dark:text-white font-mono hover:text-[#4169E1] font-medium">
                      {teacher.phone}
                    </a>
                  </div>

                  {/* Login Badge */}
                  <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-[#F8F9FA] dark:bg-white/5 border border-[#E7EAF0] dark:border-white/5">
                    <span className="text-[#7C8494] dark:text-gray-400 flex items-center gap-1 text-[11px]">
                      <Key className="w-3 h-3 text-[#4169E1]" />
                      Login:
                    </span>
                    <span className="font-mono font-bold text-[#252936] dark:text-white text-[11px]">
                      {teacher.login || teacher.phone?.replace(/[^0-9+]/g, '')}
                    </span>
                  </div>

                  {/* Salary info (FIXED FORMATTING: NO MORE "40 so'm (Fiks)") */}
                  <div className="flex items-center justify-between text-[#7C8494] dark:text-gray-400">
                    <span>Maosh rejimi:</span>
                    <span className="font-bold text-[#252936] dark:text-emerald-400">
                      {teacher.salary_type === 'percentage'
                        ? `${teacher.salary_rate || 45}% (Ulushbay)`
                        : teacher.salary_type === 'fixed'
                        ? `${((Number(teacher.salary_rate) <= 100) ? 5000000 : Number(teacher.salary_rate || 5000000)).toLocaleString()} so‘m (Fiks)`
                        : `${Number(teacher.salary_rate || 60000).toLocaleString()} so‘m/soat`}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#7C8494] dark:text-gray-400">Holati:</span>
                    <Badge variant="success" size="sm" dot>Faol</Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Kirish Kaliti + Kabinetga Kirish */}
              <div className="pt-3 border-t border-[#E7EAF0] dark:border-white/10 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => openCredentialsViewer(teacher)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border border-[#E7EAF0] dark:border-white/10 hover:border-[#4169E1] bg-[#F8F9FA] dark:bg-white/5 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 text-xs font-semibold text-[#252936] dark:text-gray-200 transition-all"
                  title="Ustozning login va parolini ko‘rish"
                >
                  <Key className="w-3.5 h-3.5 text-[#4169E1]" />
                  <span>Kirish Kaliti</span>
                </button>

                <button
                  type="button"
                  onClick={() => enterTeacherPortal(teacher)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#4169E1] hover:bg-[#3154C4] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md"
                  title="Ushbu ustozning shaxsiy kabinetiga to‘g‘ridan-to‘g‘ri kirish"
                >
                  <span>Kabinetga Kirish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* =========================================================================
          MODAL 1: YANGI O‘QITUVCHI QO‘SHISH (WITH LOGIN & PASSWORD)
          ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#141A26] border border-[#E7EAF0] dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#E7EAF0] dark:border-white/10 flex items-center justify-between bg-[#F8F9FA] dark:bg-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] dark:bg-blue-500/20 text-[#4169E1] dark:text-blue-300 flex items-center justify-center">
                  <UserSquare2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#252936] dark:text-white">Yangi O‘qituvchi Qo‘shish</h3>
                  <p className="text-[11px] text-[#7C8494] dark:text-gray-400">Shaxsiy login va parol avtomatik tayyorlanadi</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#7C8494] hover:text-[#252936] dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#252936] dark:text-gray-300 mb-1">
                  O‘qituvchi F.I.Sh *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Jamshid Xoliqov"
                  value={formData.fullName}
                  onChange={(e) => handleNameOrPhoneChange('fullName', e.target.value)}
                  className="w-full bg-[#F8F9FA] dark:bg-white/5 text-[#252936] dark:text-white text-xs rounded-xl px-3 py-2.5 border border-[#E7EAF0] dark:border-white/10 focus:border-[#4169E1] focus:outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-[#252936] dark:text-gray-300 mb-1">
                  Telefon raqami *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+998 90 123 45 67"
                  value={formData.phone}
                  onChange={(e) => handleNameOrPhoneChange('phone', e.target.value)}
                  className="w-full bg-[#F8F9FA] dark:bg-white/5 text-[#252936] dark:text-white text-xs rounded-xl px-3 py-2.5 border border-[#E7EAF0] dark:border-white/10 focus:border-[#4169E1] focus:outline-none font-mono"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-[#252936] dark:text-gray-300 mb-1">
                  Mutaxassisligi / Fani *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Ingliz tili (IELTS) / Dasturlash / Matematika"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-[#F8F9FA] dark:bg-white/5 text-[#252936] dark:text-white text-xs rounded-xl px-3 py-2.5 border border-[#E7EAF0] dark:border-white/10 focus:border-[#4169E1] focus:outline-none"
                />
              </div>

              {/* CREDENTIALS BOX: LOGIN & PASSWORD */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#4169E1] dark:text-blue-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    Tizimga Kirish Ma'lumotlari
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      const creds = generateCredentials(formData.fullName, formData.phone);
                      setFormData({
                        ...formData,
                        login: creds.login,
                        password: creds.password,
                      });
                    }}
                    className="text-[11px] font-semibold text-[#4169E1] dark:text-blue-300 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Generatsiya qilish
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-[#7C8494] dark:text-gray-400 mb-1">
                      Login (foydalanuvchi nomi)
                    </label>
                    <input
                      type="text"
                      placeholder="Login"
                      value={formData.login}
                      onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                      className="w-full bg-white dark:bg-[#0E131F] text-[#252936] dark:text-white text-xs rounded-lg px-2.5 py-2 border border-[#E7EAF0] dark:border-white/10 font-mono focus:border-[#4169E1] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#7C8494] dark:text-gray-400 mb-1">
                      Parol
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswordInForm ? 'text' : 'password'}
                        placeholder="Parol"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-white dark:bg-[#0E131F] text-[#252936] dark:text-white text-xs rounded-lg pl-2.5 pr-8 py-2 border border-[#E7EAF0] dark:border-white/10 font-mono focus:border-[#4169E1] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordInForm(!showPasswordInForm)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7C8494]"
                      >
                        {showPasswordInForm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary Configuration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#252936] dark:text-gray-300 mb-1">
                    Maosh hisoblash turi
                  </label>
                  <select
                    value={formData.salaryType}
                    onChange={(e) => handleSalaryTypeChange(e.target.value)}
                    className="w-full bg-[#F8F9FA] dark:bg-white/5 text-[#252936] dark:text-white text-xs rounded-xl px-3 py-2.5 border border-[#E7EAF0] dark:border-white/10 focus:border-[#4169E1] focus:outline-none font-medium"
                  >
                    <option value="percentage">Foiz (Ulushbay %)</option>
                    <option value="fixed">Fiks oylik (so‘m)</option>
                    <option value="hourly">Soatbay (so‘m/soat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#252936] dark:text-gray-300 mb-1">
                    {formData.salaryType === 'percentage'
                      ? 'Foiz stavkasi (%)'
                      : formData.salaryType === 'fixed'
                      ? 'Oylik fiks miqdori (so‘m)'
                      : '1 soat dars haqi (so‘m)'}
                  </label>
                  <input
                    type="number"
                    value={formData.salaryRate}
                    onChange={(e) => setFormData({ ...formData, salaryRate: Number(e.target.value) })}
                    className="w-full bg-[#F8F9FA] dark:bg-white/5 text-[#252936] dark:text-white text-xs rounded-xl px-3 py-2.5 border border-[#E7EAF0] dark:border-white/10 focus:border-[#4169E1] focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E7EAF0] dark:border-white/10">
                <Button variant="secondary" size="sm" type="button" onClick={() => setModalOpen(false)}>
                  Bekor qilish
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Ustozni Saqlash va Kalit Berish
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: O‘QITUVCHI KIRISH MA'LUMOTLARI (CREDENTIALS CARD + TELEGRAM + GO TO PORTAL)
          ========================================================================= */}
      {credentialsModalOpen && activeCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#141A26] border border-[#E7EAF0] dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#E7EAF0] dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#4169E1] text-white flex items-center justify-center shadow-xs">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#252936] dark:text-white">
                    O‘qituvchi Kirish Kalitlari
                  </h3>
                  <p className="text-[11px] text-[#7C8494] dark:text-gray-400">
                    EduOne Ustoz Portali hisobi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCredentialsModalOpen(false)}
                className="text-[#7C8494] hover:text-[#252936] dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Teacher profile brief */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#252936] dark:text-white">
                    {activeCredentials.full_name}
                  </div>
                  <div className="text-xs text-[#4169E1] font-medium mt-0.5">
                    {activeCredentials.subject}
                  </div>
                </div>
                <Badge variant="success" size="sm" dot>Faol Ustoz</Badge>
              </div>

              {/* Login Field */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#7C8494] dark:text-gray-400">
                  Login (Telefon raqam yoki foydalanuvchi nomi)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#F8F9FA] dark:bg-white/5 border border-[#E7EAF0] dark:border-white/10 rounded-xl px-3 py-2 font-mono text-xs text-[#252936] dark:text-white font-bold select-all">
                    {activeCredentials.login || activeCredentials.phone}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(activeCredentials.login || activeCredentials.phone, 'login')}
                    className="shrink-0 text-xs gap-1"
                  >
                    {copiedField === 'login' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedField === 'login' ? 'Nusxalandi' : 'Nusxa'}
                  </Button>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#7C8494] dark:text-gray-400">
                    Parol
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                    className="text-[11px] text-[#4169E1] hover:underline flex items-center gap-1"
                  >
                    {showPasswordInModal ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showPasswordInModal ? 'Yashirish' : 'Ko‘rsatish'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#F8F9FA] dark:bg-white/5 border border-[#E7EAF0] dark:border-white/10 rounded-xl px-3 py-2 font-mono text-xs text-[#252936] dark:text-white font-bold select-all">
                    {showPasswordInModal ? (activeCredentials.password || 'teacher_asilbek') : '••••••••••'}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(activeCredentials.password || 'teacher_asilbek', 'password')}
                    className="shrink-0 text-xs gap-1"
                  >
                    {copiedField === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedField === 'password' ? 'Nusxalandi' : 'Nusxa'}
                  </Button>
                </div>
              </div>

              {/* Portal link */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#7C8494] dark:text-gray-400">
                  Ustoz Kabineti Kirish Manzili
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#F8F9FA] dark:bg-white/5 border border-[#E7EAF0] dark:border-white/10 rounded-xl px-3 py-2 font-mono text-[11px] text-[#252936] dark:text-gray-300 truncate select-all">
                    {`${window.location.origin}/teacher/login`}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`${window.location.origin}/teacher/login`, 'url')}
                    className="shrink-0 text-xs gap-1"
                  >
                    {copiedField === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedField === 'url' ? 'Nusxalandi' : 'Nusxa'}
                  </Button>
                </div>
              </div>

              {/* Primary Actions: Enter Portal & Send Telegram */}
              <div className="pt-2 space-y-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => enterTeacherPortal(activeCredentials)}
                  className="w-full justify-center text-xs font-bold py-2.5 shadow-md"
                >
                  <LogIn className="w-4 h-4 mr-1.5" />
                  O‘qituvchi Kabinetiga To‘g‘ridan-to‘g‘ri Kirish
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareViaTelegram(activeCredentials)}
                    className="justify-center text-xs gap-1.5 border-sky-300 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Telegram orqali
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCredentialsModalOpen(false)}
                    className="justify-center text-xs"
                  >
                    Yopish
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
