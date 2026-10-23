import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { api } from '../lib/api';
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Trash2,
  X,
  BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';

export function GroupsPage() {
  const [activeOrg, setActiveOrg] = useState(null);
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [groupMembersModal, setGroupMembersModal] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    subject: 'Ingliz tili (IELTS)',
    teacherId: '',
    teacherName: '',
    room: 'Xona-1',
    scheduleDays: 'Dush-Chor-Juma',
    scheduleTime: '14:00 - 15:30',
    price: 600000,
    maxStudents: 15,
  });

  const orgId = activeOrg?.id || 'default';

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('eduone_impersonating_org');
      if (raw) setActiveOrg(JSON.parse(raw));
    } catch {}
  }, []);

  const loadData = async () => {
    const [grps, tchs, stds] = await Promise.all([
      api.getGroups(orgId),
      api.getTeachers(orgId),
      api.getStudents(orgId),
    ]);
    setGroups(grps);
    setTeachers(tchs);
    setStudents(stds);
  };

  useEffect(() => {
    loadData();
  }, [activeOrg]);

  const handleOpenCreateModal = () => {
    const firstTeacher = teachers[0];
    setFormData({
      name: '',
      subject: firstTeacher?.subject || 'Ingliz tili (IELTS)',
      teacherId: firstTeacher?.id || '',
      teacherName: firstTeacher?.full_name || '',
      room: 'Auditoriya 101',
      scheduleDays: 'Dush-Chor-Juma',
      scheduleTime: '14:00 - 15:30',
      price: 600000,
      maxStudents: 15,
    });
    setModalOpen(true);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const selectedTeacher = teachers.find((t) => t.id === formData.teacherId) || teachers[0];
    const finalTeacherName = selectedTeacher?.full_name || formData.teacherName || 'Asilbek Berdiqulov';
    const finalTeacherId = selectedTeacher?.id || formData.teacherId || 'tch-1';

    await api.createGroup(orgId, {
      ...formData,
      teacherId: finalTeacherId,
      teacherName: finalTeacherName,
    });

    setFormData({
      name: '',
      subject: 'Ingliz tili (IELTS)',
      teacherId: '',
      teacherName: '',
      room: 'Auditoriya 101',
      scheduleDays: 'Dush-Chor-Juma',
      scheduleTime: '14:00 - 15:30',
      price: 600000,
      maxStudents: 15,
    });
    setModalOpen(false);
    loadData();
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Haqiqatan ham "${name}" guruhini o‘chirmoqchimisiz?`)) {
      await api.deleteGroup(orgId, id);
      loadData();
    }
  };

  const filteredGroups = groups.filter(
    (g) =>
      (g.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (g.subject || '').toLowerCase().includes(search.toLowerCase()) ||
      (g.teacher_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Bosh sahifa', href: '/' }, { label: 'Guruhlar va Kurslar' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252936] flex items-center gap-2.5">
            <FolderKanban className="w-6 h-6 text-[#4169E1]" />
            Guruhlar va Kurslar
          </h1>
          <p className="text-xs text-[#7C8494] mt-1">
            Guruhlar taqvimi, o‘qituvchilar, dars vaqtlari va xonalar taqsimoti
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenCreateModal}
        >
          Yangi Guruh Ochish
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 flex items-center gap-2.5 bg-white border border-[#E7EAF0] rounded-lg shadow-xs">
        <Search className="w-4 h-4 text-[#7C8494]" />
        <input
          type="text"
          placeholder="Guruh nomi, fan yoki o‘qituvchi bo‘yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-[#252936] placeholder:text-[#7C8494]/60 focus:outline-none"
        />
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredGroups.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-[#7C8494]">
            <FolderKanban className="w-10 h-10 mx-auto text-[#7C8494]/40 mb-2" />
            Hozircha guruhlar mavjud emas. Yangi guruh ochish orqali boshlang.
          </div>
        ) : (
          filteredGroups.map((grp) => (
            <Card key={grp.id} className="p-4 space-y-3.5 bg-white border-[#E7EAF0] hover:border-[#4169E1]/30 transition-all shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#252936]">{grp.name}</h3>
                  <span className="text-xs text-[#4169E1] font-semibold">{grp.subject}</span>
                </div>

                <button
                  onClick={() => handleDelete(grp.id, grp.name)}
                  className="text-[#7C8494] hover:text-[#D94B4B] p-1 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-lg bg-[#F5F6F8] border border-[#E7EAF0] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#7C8494]">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Ustoz:
                  </span>
                  <strong className="text-[#252936]">{grp.teacher_name}</strong>
                </div>

                <div className="flex items-center justify-between text-[#7C8494]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Kunlar:
                  </span>
                  <span className="text-[#252936] font-medium">{grp.schedule_days}</span>
                </div>

                <div className="flex items-center justify-between text-[#7C8494]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Vaqt:
                  </span>
                  <span className="font-mono text-[#4169E1] font-semibold">{grp.schedule_time}</span>
                </div>

                <div className="flex items-center justify-between text-[#7C8494]">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Xona:
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white border border-[#E7EAF0] text-[#252936] font-medium">{grp.room}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E7EAF0] flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] text-[#7C8494]">Kurs narxi:</p>
                  <p className="font-bold text-[#252936] font-mono">{grp.price?.toLocaleString()} so‘m</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGroupMembersModal(grp)}
                    className="px-2.5 py-1 rounded-md bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4169E1] font-medium text-[11px] border border-[#4169E1]/20 transition-colors"
                  >
                    O‘quvchilar ({students.filter(s => s.group_id === grp.id || s.group_name === grp.name).length} ta)
                  </button>
                  <Badge variant="success" size="sm" dot>Faol</Badge>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal: Yangi Guruh Ochish */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-[#E7EAF0] rounded-xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#E7EAF0] flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-[#4169E1]" />
                <h3 className="text-sm font-bold text-[#252936]">Yangi Guruh Ochish</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-[#7C8494] hover:text-[#252936]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">Guruh nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: General English B1 (14:00)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7C8494] mb-1">Fan / Yo‘nalish</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: IELTS / Frontend"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#252936] dark:text-gray-300 mb-1">
                    Guruhga Ustoz Biriktirish *
                  </label>
                  <select
                    required
                    value={formData.teacherId}
                    onChange={(e) => {
                      const sel = teachers.find((t) => t.id === e.target.value);
                      setFormData({
                        ...formData,
                        teacherId: e.target.value,
                        teacherName: sel?.full_name || '',
                        subject: sel?.subject || formData.subject,
                      });
                    }}
                    className="w-full bg-white dark:bg-[#141A26] text-[#252936] dark:text-white text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] dark:border-white/10 focus:border-[#4169E1] focus:outline-none font-semibold"
                  >
                    <option value="">Ustozni tanlang *</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        👨‍🏫 {t.full_name} ({t.subject})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7C8494] mb-1">Dars kunlari</label>
                  <select
                    value={formData.scheduleDays}
                    onChange={(e) => setFormData({ ...formData, scheduleDays: e.target.value })}
                    className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none font-medium"
                  >
                    <option value="Dush-Chor-Juma">Dushanba - Chorshanba - Juma</option>
                    <option value="Sesh-Pay-Shanba">Seshanba - Payshanba - Shanba</option>
                    <option value="Har kuni">Har kuni (Dush - Shanba)</option>
                    <option value="Shanba-Yakshanba">Weekend (Shanba - Yakshanba)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7C8494] mb-1">Dars soati</label>
                  <input
                    type="text"
                    required
                    placeholder="14:00 - 15:30"
                    value={formData.scheduleTime}
                    onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                    className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7C8494] mb-1">Xona</label>
                  <input
                    type="text"
                    placeholder="Lab-302 / Xona-1"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7C8494] mb-1">Kurs narxi (so‘m)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF0]">
                <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                  Bekor qilish
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Guruhni Ochish
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Guruh A’zolari Ro‘yxati (Group Members Modal) */}
      {groupMembersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white border border-[#E7EAF0] rounded-xl shadow-xl overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#4169E1]" />
                <div>
                  <h3 className="text-sm font-bold text-[#252936]">{groupMembersModal.name} — O‘quvchilar Ro‘yxati</h3>
                  <p className="text-[11px] text-[#7C8494]">Ustoz: {groupMembersModal.teacher_name} • Xona: {groupMembersModal.room}</p>
                </div>
              </div>
              <button onClick={() => setGroupMembersModal(null)} className="text-[#7C8494] hover:text-[#252936]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[#E7EAF0]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F9FA] text-[#7C8494] text-[10px] uppercase font-semibold border-b border-[#E7EAF0]">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">O‘quvchi</th>
                    <th className="py-2.5 px-3">Telefon</th>
                    <th className="py-2.5 px-3">Balans</th>
                    <th className="py-2.5 px-3 text-center">Koinlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAF0]">
                  {students.filter(s => s.group_id === groupMembersModal.id || s.group_name === groupMembersModal.name).length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-[#7C8494]">
                        Ushbu guruhga hali o‘quvchilar qo‘shilmagan.
                      </td>
                    </tr>
                  ) : (
                    students.filter(s => s.group_id === groupMembersModal.id || s.group_name === groupMembersModal.name).map((std, idx) => (
                      <tr key={std.id} className="hover:bg-[#F8F9FA]">
                        <td className="py-2.5 px-3 text-[#7C8494] font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#252936]">{std.first_name} {std.last_name}</td>
                        <td className="py-2.5 px-3 text-[#7C8494] font-mono">{std.phone}</td>
                        <td className="py-2.5 px-3 font-mono font-bold">
                          <span className={(std.balance || 0) < 0 ? 'text-[#D94B4B]' : 'text-[#269B65]'}>
                            {std.balance ? `${std.balance.toLocaleString()} so'm` : '0 so‘m'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-[#E5A12B] font-bold">
                          🪙 {std.coins || 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E7EAF0]">
              <span className="text-xs text-[#7C8494]">
                Jami: <strong className="text-[#252936]">{students.filter(s => s.group_id === groupMembersModal.id || s.group_name === groupMembersModal.name).length} / {groupMembersModal.max_students || 15} nafar</strong>
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    window.location.href = '/attendance';
                  }}
                >
                  Davomatga O‘tish
                </Button>
                <Button variant="primary" size="sm" onClick={() => setGroupMembersModal(null)}>
                  Yopish
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
