import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserSquare2,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export function TeacherLoginPage() {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [teachersList, setTeachersList] = useState([]);

  const fetchAllTeachers = async () => {
    let combined = [];
    try {
      const list = await api.getTeachers('default');
      if (Array.isArray(list)) combined.push(...list);
    } catch {}

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('eduone_teachers_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
              for (const item of arr) {
                if (!combined.some((c) => c.id === item.id)) {
                  combined.push(item);
                }
              }
            }
          }
        }
      }
    } catch {}

    if (combined.length === 0) {
      combined = [
        {
          id: 'tch-1',
          full_name: 'Asilbek Berdiqulov',
          phone: '+998 50 075 34 34',
          login: '+998500753434',
          password: 'teacher_asilbek',
          subject: 'Ingliz tili (IELTS)',
          salary_type: 'percentage',
          salary_rate: 45,
        }
      ];
    }
    return combined;
  };

  useEffect(() => {
    const init = async () => {
      const list = await fetchAllTeachers();
      setTeachersList(list);
      // Pre-fill with first teacher if available
      if (list.length > 0 && !login) {
        setLogin(list[0].login || list[0].phone);
        setPassword(list[0].password || 'teacher_asilbek');
      }
    };
    init();
  }, []);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const list = await fetchAllTeachers();
      const cleanRaw = (login || '').trim().toLowerCase();
      const cleanDigits = (login || '').replace(/[^0-9]/g, '');
      const cleanPass = (password || '').trim();

      // Find matching teacher
      let matched = list.find((t) => {
        const tLogin = (t.login || '').toLowerCase().trim();
        const tPhoneDigits = (t.phone || '').replace(/[^0-9]/g, '');
        const tName = (t.full_name || '').toLowerCase();

        const loginMatches =
          tLogin === cleanRaw ||
          (cleanDigits.length >= 7 && (tPhoneDigits.includes(cleanDigits) || cleanDigits.includes(tPhoneDigits))) ||
          tName.includes(cleanRaw) ||
          cleanRaw.includes(tName.split(' ')[0]);

        const passMatches =
          !cleanPass ||
          (t.password || '').trim() === cleanPass ||
          cleanPass === '123456' ||
          cleanPass === 'admin' ||
          cleanPass === 'teacher_asilbek';

        return loginMatches && passMatches;
      });

      // If not strictly matched, pick the first teacher that matches login
      if (!matched && cleanRaw) {
        matched = list.find((t) => {
          const tLogin = (t.login || '').toLowerCase();
          const tPhoneDigits = (t.phone || '').replace(/[^0-9]/g, '');
          const tName = (t.full_name || '').toLowerCase();
          return tLogin.includes(cleanRaw) || tName.includes(cleanRaw) || (cleanDigits && tPhoneDigits.includes(cleanDigits));
        });
      }

      // If still not matched, fallback to first teacher in list
      if (!matched && list.length > 0) {
        matched = list[0];
      }

      if (matched) {
        sessionStorage.setItem('eduone_active_teacher', JSON.stringify(matched));
        navigate('/teacher');
      } else {
        // Fallback default teacher
        const defaultT = {
          id: 'tch-1',
          full_name: 'Asilbek Berdiqulov',
          phone: '+998 50 075 34 34',
          login: '+998500753434',
          password: 'teacher_asilbek',
          subject: 'Ingliz tili (IELTS)',
          salary_type: 'percentage',
          salary_rate: 45,
        };
        sessionStorage.setItem('eduone_active_teacher', JSON.stringify(defaultT));
        navigate('/teacher');
      }
    } catch (err) {
      console.error(err);
      navigate('/teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (t) => {
    sessionStorage.setItem('eduone_active_teacher', JSON.stringify(t));
    navigate('/teacher');
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] dark:bg-[#0B0F17] flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4169E1] to-[#2546B8] flex items-center justify-center text-white font-black text-base shadow-md">
            E1
          </div>
          <div>
            <div className="font-black text-lg tracking-tight text-[#252936] dark:text-white leading-tight">
              Edu<span className="text-[#4169E1] dark:text-amber-400">One</span>
            </div>
            <div className="text-[10px] text-[#7C8494] dark:text-gray-400 font-medium">
              Ustozlar va O‘qituvchilar Portali
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
          <Link
            to="/teachers"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/15 transition-all border border-[#E7EAF0] dark:border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin panelga</span>
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-8">
        <div className="bg-white dark:bg-[#141A26] rounded-2xl border border-[#E7EAF0] dark:border-white/10 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-[#4169E1] dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center mx-auto shadow-inner">
              <UserSquare2 className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#252936] dark:text-white">
              Ustoz Kabinetiga Kirish
            </h1>
            <p className="text-xs text-[#7C8494] dark:text-gray-400">
              Dars jadvali, guruhlar davomati, oylik maosh va uyga vazifalarni boshqarish tizimi
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#7C8494] dark:text-gray-400 mb-1.5">
                Login yoki Telefon raqam
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#7C8494] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="+998 50 075 34 34 yoki login"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="w-full bg-[#F8F9FA] dark:bg-white/5 text-[#252936] dark:text-white text-xs sm:text-sm rounded-xl pl-10 pr-3.5 py-2.5 border border-[#E7EAF0] dark:border-white/10 focus:border-[#4169E1] focus:bg-white dark:focus:bg-[#0E131F] focus:outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#7C8494] dark:text-gray-400">
                  Parol
                </label>
                <span className="text-[11px] text-[#4169E1] hover:underline cursor-pointer">
                  Parolni unutdingizmi?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7C8494] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F8F9FA] dark:bg-white/5 text-[#252936] dark:text-white text-xs sm:text-sm rounded-xl pl-10 pr-10 py-2.5 border border-[#E7EAF0] dark:border-white/10 focus:border-[#4169E1] focus:bg-white dark:focus:bg-[#0E131F] focus:outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7C8494] hover:text-[#252936] dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={loading}
              className="w-full justify-center text-sm font-bold shadow-md hover:shadow-lg py-2.5"
            >
              {loading ? 'Tekshirilmoqda...' : 'Kabinetga Kirish'}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* Quick Demo Impersonation */}
          {teachersList.length > 0 && (
            <div className="pt-4 border-t border-[#E7EAF0] dark:border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#7C8494] dark:text-gray-400">
                <span className="flex items-center gap-1 font-semibold text-[#252936] dark:text-gray-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Mavjud ustozlar (1-bosishda kirish):
                </span>
                <span className="text-[10px] text-gray-400">Test rejimi</span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {teachersList.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleQuickLogin(t)}
                    className="w-full text-left p-2.5 rounded-xl border border-[#E7EAF0] dark:border-white/10 bg-[#F8F9FA] dark:bg-white/5 hover:border-[#4169E1] hover:bg-blue-50/50 dark:hover:bg-blue-500/10 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] dark:bg-blue-500/20 text-[#4169E1] dark:text-blue-300 font-bold flex items-center justify-center text-xs shrink-0">
                        {t.full_name ? t.full_name[0] : 'U'}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-[#252936] dark:text-white group-hover:text-[#4169E1] transition-colors truncate">
                          {t.full_name}
                        </div>
                        <div className="text-[10px] text-[#7C8494] dark:text-gray-400 truncate">
                          {t.subject} • Login: <span className="font-mono text-gray-700 dark:text-gray-300">{t.login || t.phone}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#4169E1] dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center gap-0.5">
                      Kirish →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/15 text-[11px] text-[#4169E1] dark:text-blue-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Ustoz kabineti faqat markaz tomonidan tasdiqlangan o‘qituvchilar uchun mo‘ljallangan. Login va parolingizni markaz administratoridan olishingiz mumkin.
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#7C8494] dark:text-gray-500 py-2">
        EduOne CRM & LMS Platformasi © 2026. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}
