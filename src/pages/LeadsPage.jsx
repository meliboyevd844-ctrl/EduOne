import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { api } from '../lib/api';
import {
  UserPlus,
  Search,
  Phone,
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Trash2,
  GraduationCap,
  Plus,
  X,
  Layers,
  Filter
} from 'lucide-react';
import { formatUzbekPhone, cn } from '../lib/utils';

const STAGES = [
  { id: 'new', label: 'Yangi So‘rovlar', color: 'border-[#4169E1]/30 bg-[#EEF2FF] text-[#4169E1]' },
  { id: 'trial_booked', label: 'Sinov Darsiga Yozilgan', color: 'border-[#E5A12B]/30 bg-[#FDF6E9] text-[#E5A12B]' },
  { id: 'trial_completed', label: 'Sinov Darsidan O‘tgan', color: 'border-purple-500/30 bg-purple-50 text-purple-600' },
  { id: 'enrolled', label: 'Guruhga Qo‘shildi', color: 'border-[#269B65]/30 bg-[#EAF7F0] text-[#269B65]' },
  { id: 'rejected', label: 'Rad Etildi / O‘qimaydi', color: 'border-[#D94B4B]/30 bg-[#FDEEEC] text-[#D94B4B]' },
];

export function LeadsPage() {
  const [activeOrg, setActiveOrg] = useState(null);
  const [leads, setLeads] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [trialModalLead, setTrialModalLead] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '+998 ',
    subjectInterest: 'Ingliz tili',
    source: 'Instagram',
    notes: '',
  });

  const [trialData, setTrialData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '15:00',
    teacher: '',
    notes: 'Birinchi sinov darsi',
  });

  const orgId = activeOrg?.id || 'default';

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('eduone_impersonating_org');
      if (raw) setActiveOrg(JSON.parse(raw));
    } catch {}
  }, []);

  const loadLeads = async () => {
    const [lData, tData] = await Promise.all([
      api.getLeads(orgId),
      api.getTeachers(orgId),
    ]);
    setLeads(lData);
    setTeachers(tData);
    if (tData.length > 0 && !trialData.teacher) {
      setTrialData((prev) => ({ ...prev, teacher: tData[0].full_name }));
    }
  };

  useEffect(() => {
    loadLeads();
  }, [activeOrg]);

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) return;

    await api.createLead(orgId, formData);
    setFormData({
      fullName: '',
      phone: '+998 ',
      subjectInterest: 'Ingliz tili',
      source: 'Instagram',
      notes: '',
    });
    setModalOpen(false);
    loadLeads();
  };

  const handleMoveStage = async (leadId, nextStage) => {
    await api.updateLeadStage(orgId, leadId, nextStage);
    loadLeads();
  };

  const handleDeleteLead = async (leadId) => {
    if (window.confirm("Bu so‘rovni ro‘yxatdan o‘chirmoqchimisiz?")) {
      await api.deleteLead(orgId, leadId);
      loadLeads();
    }
  };

  const handleConvertToStudent = async (lead) => {
    const parts = lead.full_name.split(' ');
    const firstName = parts[0] || 'O‘quvchi';
    const lastName = parts.slice(1).join(' ') || '';

    await api.createStudent(orgId, {
      firstName,
      lastName,
      phone: lead.phone,
      groupName: lead.subject_interest,
      status: 'active',
      monthlyFee: 600000,
      balance: 0,
      coins: 20,
    });

    await api.updateLeadStage(orgId, lead.id, 'enrolled');
    alert(`Muvaffaqiyatli! "${lead.full_name}" o‘quvchilar ro‘yxatiga qo‘shildi va 20 koin berildi.`);
    loadLeads();
  };

  const handleBookTrial = async (e) => {
    e.preventDefault();
    if (!trialModalLead) return;
    const notes = `${trialModalLead.notes || ''} [Sinov darsi: ${trialData.date} ${trialData.time}, Ustoz: ${trialData.teacher}]`.trim();
    await api.createLead(orgId, {
      ...trialModalLead,
      notes,
      stage: 'trial_booked',
    });
    await api.updateLeadStage(orgId, trialModalLead.id, 'trial_booked');
    setTrialModalLead(null);
    alert(`"${trialModalLead.full_name}" sinov darsiga yozildi (${trialData.date} ${trialData.time})!`);
    loadLeads();
  };

  const filteredLeads = leads.filter(
    (l) => {
      const matchesSearch =
        (l.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.phone || '').includes(search);
      const matchesSource = filterSource === 'all' || l.source === filterSource;
      return matchesSearch && matchesSource;
    }
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Bosh sahifa', href: '/' }, { label: 'Lidlar (CRM)' }]} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252936] flex items-center gap-2.5">
            <UserPlus className="w-6 h-6 text-[#4169E1]" />
            Lidlar va Sotuv Voronkasi (CRM)
          </h1>
          <p className="text-xs text-[#7C8494] mt-1">
            Yangi murojaatlarni qabul qiling, sinov darsiga yozing va o‘quvchiga aylantiring
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setModalOpen(true)}
        >
          Yangi Lid Qo‘shish
        </Button>
      </div>

      {/* Search & Statistics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-2.5 md:col-span-2 flex items-center gap-3 bg-white border border-[#E7EAF0] rounded-lg shadow-xs">
          <Search className="w-4 h-4 text-[#7C8494] shrink-0 ml-1" />
          <input
            type="text"
            placeholder="Lid ismi yoki telefoni bo‘yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-[#252936] placeholder:text-[#7C8494]/60 focus:outline-none"
          />
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="bg-[#F5F6F8] text-[#252936] text-[11px] font-medium rounded-md px-2.5 py-1.5 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none shrink-0"
          >
            <option value="all">Barcha manbalar</option>
            <option value="Instagram">Instagram</option>
            <option value="Telegram">Telegram</option>
            <option value="Tavsiya (Do‘sti)">Tavsiya</option>
            <option value="Tashqi Banner">Banner</option>
            <option value="O‘zi Keldi">Tashrif</option>
          </select>
        </div>

        <Card className="p-3.5 flex items-center justify-between bg-white border-[#E7EAF0]">
          <span className="text-xs text-[#7C8494]">Jami murojaatlar</span>
          <span className="text-base font-bold text-[#252936]">{leads.length} ta</span>
        </Card>

        <Card className="p-3.5 flex items-center justify-between bg-white border-[#E7EAF0]">
          <span className="text-xs text-[#269B65] font-medium">Guruhga qo‘shilgan</span>
          <span className="text-base font-bold text-[#269B65]">
            {leads.filter((l) => l.stage === 'enrolled').length} ta
          </span>
        </Card>
      </div>

      {/* Kanban Board / Voronka bosqichlari */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.stage === stage.id);
          return (
            <div
              key={stage.id}
              className="flex flex-col bg-[#F5F6F8] rounded-lg border border-[#E7EAF0] p-3 min-w-[240px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E7EAF0]">
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-md border', stage.color)}>
                  {stage.label}
                </span>
                <span className="text-xs font-semibold text-[#7C8494]">{stageLeads.length}</span>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                {stageLeads.length === 0 ? (
                  <div className="text-center py-8 text-[11px] text-[#7C8494]/60">
                    Hozircha lid yo‘q
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3 rounded-lg bg-white border border-[#E7EAF0] hover:border-[#4169E1]/40 transition-all space-y-2 group shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-bold text-[#252936]">{lead.full_name}</h4>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="opacity-0 group-hover:opacity-100 text-[#7C8494] hover:text-[#D94B4B] transition-opacity p-0.5 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#269B65] font-mono">
                        <Phone className="w-3 h-3 text-[#269B65]" />
                        <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#7C8494] pt-1 border-t border-[#E7EAF0]">
                        <span>Kurs: <strong className="text-[#252936]">{lead.subject_interest}</strong></span>
                        <span className="px-1.5 py-0.5 rounded bg-[#F5F6F8] border border-[#E7EAF0] text-[#7C8494]">{lead.source}</span>
                      </div>

                      {lead.notes && (
                        <p className="text-[10px] text-[#7C8494] italic bg-[#F8F9FA] p-1.5 rounded border border-[#E7EAF0]">
                          "{lead.notes}"
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 pt-1.5">
                        {stage.id === 'new' && (
                          <button
                            onClick={() => setTrialModalLead(lead)}
                            className="w-full text-center py-1.5 text-[10px] font-semibold bg-[#FDF6E9] text-[#E5A12B] hover:bg-[#FCEFD9] border border-[#E5A12B]/30 rounded-md transition-colors"
                          >
                            Sinov darsiga yozish →
                          </button>
                        )}

                        {stage.id === 'trial_booked' && (
                          <button
                            onClick={() => handleMoveStage(lead.id, 'trial_completed')}
                            className="w-full text-center py-1.5 text-[10px] font-semibold bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 rounded-md transition-colors"
                          >
                            Darsdan o‘tdi →
                          </button>
                        )}

                        {stage.id === 'trial_completed' && (
                          <button
                            onClick={() => handleConvertToStudent(lead)}
                            className="w-full text-center py-1.5 text-[10px] font-semibold bg-[#EAF7F0] text-[#269B65] hover:bg-[#D5EFE2] border border-[#269B65]/30 rounded-md transition-colors flex items-center justify-center gap-1"
                          >
                            <GraduationCap className="w-3 h-3" />
                            O‘quvchiga aylantirish
                          </button>
                        )}

                        {stage.id !== 'rejected' && stage.id !== 'enrolled' && (
                          <button
                            onClick={() => handleMoveStage(lead.id, 'rejected')}
                            className="px-2 py-1 text-[10px] text-[#D94B4B] hover:bg-[#FDEEEC] rounded-md transition-colors"
                            title="Rad etish"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Yangi Lid Qo'shish */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-[#E7EAF0] rounded-xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#E7EAF0] flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4169E1] flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#252936]">Yangi Lid (Murojaat) Qo‘shish</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-[#7C8494] hover:text-[#252936]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">
                  Mijoz F.I.Sh <span className="text-[#4169E1]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Dilshod Aliyev"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">
                  Telefon raqami <span className="text-[#4169E1]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+998 90 123 45 67"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatUzbekPhone(e.target.value) })}
                  className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7C8494] mb-1">Qiziqqan kursi</label>
                  <select
                    value={formData.subjectInterest}
                    onChange={(e) => setFormData({ ...formData, subjectInterest: e.target.value })}
                    className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none font-medium"
                  >
                    <option value="Ingliz tili (IELTS)">Ingliz tili (IELTS)</option>
                    <option value="General English">General English</option>
                    <option value="Frontend Dasturlash">Frontend Dasturlash</option>
                    <option value="Matematika">Matematika</option>
                    <option value="Mental Arifmetika">Mental Arifmetika</option>
                    <option value="Rus tili">Rus tili</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7C8494] mb-1">Qayerdan bildi?</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none font-medium"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Tavsiya (Do‘sti)">Tavsiya (Do‘sti)</option>
                    <option value="Tashqi Banner">Tashqi Banner</option>
                    <option value="O‘zi Keldi">O‘zi Keldi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">Izoh / Qo‘shimcha</label>
                <textarea
                  rows="2"
                  placeholder="Mijoz nimalarni so‘radi yoki qaysi vaqtda qulay?"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF0]">
                <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                  Bekor qilish
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Lidni Saqlash
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Sinov Darsiga Yozish (Trial Booking Modal) */}
      {trialModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-[#E7EAF0] rounded-xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#E7EAF0] flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#E5A12B]" />
                <h3 className="text-sm font-bold text-[#252936]">
                  Sinov Darsiga Yozish: {trialModalLead.full_name}
                </h3>
              </div>
              <button onClick={() => setTrialModalLead(null)} className="text-[#7C8494] hover:text-[#252936]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookTrial} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7C8494] mb-1">Dars Sanasi *</label>
                  <input
                    type="date"
                    required
                    value={trialData.date}
                    onChange={(e) => setTrialData({ ...trialData, date: e.target.value })}
                    className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7C8494] mb-1">Dars Vaqti *</label>
                  <input
                    type="time"
                    required
                    value={trialData.time}
                    onChange={(e) => setTrialData({ ...trialData, time: e.target.value })}
                    className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">O‘qituvchi / Ustoz</label>
                <select
                  value={trialData.teacher}
                  onChange={(e) => setTrialData({ ...trialData, teacher: e.target.value })}
                  className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none font-medium"
                >
                  {teachers.length === 0 ? (
                    <option value="Navbatchi Ustoz">Navbatchi Ustoz</option>
                  ) : (
                    teachers.map((t) => (
                      <option key={t.id} value={t.full_name}>{t.full_name} ({t.subject})</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">Eslatma / Izoh</label>
                <input
                  type="text"
                  placeholder="Masalan: Ingliz tili intermediate darajasi"
                  value={trialData.notes}
                  onChange={(e) => setTrialData({ ...trialData, notes: e.target.value })}
                  className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF0]">
                <Button variant="secondary" size="sm" onClick={() => setTrialModalLead(null)}>
                  Bekor qilish
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Sinov Darsini Belgilash
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
