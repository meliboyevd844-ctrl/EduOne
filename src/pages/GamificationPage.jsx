import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { api } from '../lib/api';
import {
  Sparkles,
  Coins,
  Trophy,
  Award,
  Plus,
  ShoppingBag,
  Gift,
  Shirt,
  Coffee,
  Book,
  Tag,
  Users,
  CheckCircle2,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

export function GamificationPage() {
  const [activeOrg, setActiveOrg] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [students, setStudents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [awardModalOpen, setAwardModalOpen] = useState(false);

  const [rewardForm, setRewardForm] = useState({
    title: '',
    coinPrice: 150,
    stock: 20,
  });

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [coinAmount, setCoinAmount] = useState(25);
  const [awardReason, setAwardReason] = useState('Oylik imtihondan 90%+ ball olgani uchun');

  const orgId = activeOrg?.id || 'default';

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('eduone_impersonating_org');
      if (raw) setActiveOrg(JSON.parse(raw));
    } catch {}
  }, []);

  const loadData = async () => {
    const [rwds, stds] = await Promise.all([
      api.getRewardCatalog(orgId),
      api.getStudents(orgId),
    ]);
    setRewards(rwds);
    setStudents(stds);
  };

  useEffect(() => {
    loadData();
  }, [activeOrg]);

  const handleCreateReward = async (e) => {
    e.preventDefault();
    if (!rewardForm.title.trim() || !rewardForm.coinPrice) return;

    await api.createRewardItem(orgId, rewardForm);
    setRewardForm({ title: '', coinPrice: 150, stock: 20 });
    setModalOpen(false);
    loadData();
  };

  const handleAwardCoinsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    await api.awardStudentCoins(orgId, selectedStudentId, coinAmount, awardReason);
    const std = students.find((s) => s.id === selectedStudentId);
    alert(`Muvaffaqiyatli! ${std?.first_name || 'O‘quvchi'}ga +${coinAmount} koin taqdirlandi!`);
    setAwardModalOpen(false);
    loadData();
  };

  const sortedStudents = [...students].sort((a, b) => (b.coins || 0) - (a.coins || 0)).slice(0, 5);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Bosh sahifa', href: '/' }, { label: 'Gamification & Koinlar' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252936] flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#E5A12B]" />
            Gamification: Koinlar va Mukofotlar Do‘koni
          </h1>
          <p className="text-xs text-[#7C8494] mt-1">
            O‘quvchilarni rag‘batlantirish tizimi, qoidalar, reyting va sovg‘alar do‘koni
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={Award}
            onClick={() => setAwardModalOpen(true)}
            className="border-[#E7EAF0] text-[#E5A12B] hover:bg-[#FDF6E9] text-xs py-2"
          >
            + Koin Taqdim Etish
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setModalOpen(true)}
            className="text-xs py-2"
          >
            + Yangi Sovg‘a Qo‘shish
          </Button>
        </div>
      </div>

      {/* Gamification Rules Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-[#E7EAF0] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#E5A12B]">Uyga Vazifa</span>
            <span className="text-sm font-bold text-[#E5A12B]">🪙 +10 koin</span>
          </div>
          <p className="text-[11px] text-[#7C8494]">O‘qituvchi a’lo baholaganda</p>
        </Card>

        <Card className="p-4 bg-white border-[#E7EAF0] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600">Test & Imtihon</span>
            <span className="text-sm font-bold text-purple-600">🪙 +25 koin</span>
          </div>
          <p className="text-[11px] text-[#7C8494]">90%+ to‘g‘ri javob uchun</p>
        </Card>

        <Card className="p-4 bg-white border-[#E7EAF0] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#269B65]">100% Davomat</span>
            <span className="text-sm font-bold text-[#269B65]">🪙 +15 koin</span>
          </div>
          <p className="text-[11px] text-[#7C8494]">Bir oy davomida qoldirmasa</p>
        </Card>

        <Card className="p-4 bg-white border-[#E7EAF0] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4169E1]">Do‘stini Taklif Qilish</span>
            <span className="text-sm font-bold text-[#4169E1]">🪙 +50 koin</span>
          </div>
          <p className="text-[11px] text-[#7C8494]">Do‘sti kursga yozilganda</p>
        </Card>
      </div>

      {/* Main Grid: Marketplace + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sovg'alar Do'koni (Marketplace) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-[#252936] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#4169E1]" />
            Mukofotlar Do‘koni
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <Card
                key={reward.id}
                className="p-4 bg-white border-[#E7EAF0] hover:border-[#4169E1]/30 transition-all space-y-3 flex flex-col justify-between shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#FDF6E9] border border-[#E5A12B]/30 text-[#E5A12B] flex items-center justify-center font-bold text-xl">
                      🎁
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#252936]">{reward.title}</h4>
                      <p className="text-xs text-[#7C8494] mt-0.5">
                        Qoldiq: {reward.stock === -1 ? 'Cheksiz' : `${reward.stock} dona mavjud`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E7EAF0] flex items-center justify-between">
                  <span className="text-base font-bold text-[#E5A12B] font-mono">
                    🪙 {reward.coin_price} koin
                  </span>

                  <span className="text-[11px] px-2.5 py-1 rounded-md bg-[#F5F6F8] text-[#7C8494] border border-[#E7EAF0] font-medium">
                    Xaridga tayyor
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Top O'quvchilar Reytingi (Leaderboard) */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[#252936] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#E5A12B]" />
            Top Koinlar Reytingi (Leaderboard)
          </h2>

          <Card className="p-4 bg-white border-[#E7EAF0] divide-y divide-[#E7EAF0] shadow-xs">
            {sortedStudents.length === 0 ? (
              <p className="text-center py-8 text-xs text-[#7C8494]">
                Hozircha o‘quvchilar ro‘yxatda yo‘q
              </p>
            ) : (
              sortedStudents.map((std, idx) => (
                <div key={std.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs',
                      idx === 0 ? 'bg-[#E5A12B] text-white' : idx === 1 ? 'bg-slate-300 text-[#252936]' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-[#F5F6F8] text-[#7C8494]'
                    )}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-[#252936]">{std.first_name} {std.last_name}</p>
                      <p className="text-[10px] text-[#7C8494]">{std.group_name}</p>
                    </div>
                  </div>

                  <span className="font-bold text-[#E5A12B] text-xs font-mono">
                    🪙 {std.coins || 0}
                  </span>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>

      {/* Modal: Yangi Sovg'a Qo'shish */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-[#E7EAF0] rounded-xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#E7EAF0] flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#4169E1]" />
                <h3 className="text-sm font-bold text-[#252936]">Yangi Mukofot Qo‘shish</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-[#7C8494] hover:text-[#252936]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReward} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">Sovg‘a nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: EduOne Brendli Ryukzak"
                  value={rewardForm.title}
                  onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                  className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7C8494] mb-1">Koin narxi 🪙</label>
                  <input
                    type="number"
                    required
                    value={rewardForm.coinPrice}
                    onChange={(e) => setRewardForm({ ...rewardForm, coinPrice: e.target.value })}
                    className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none font-mono font-bold text-[#E5A12B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7C8494] mb-1">Ombordagi soni</label>
                  <input
                    type="number"
                    value={rewardForm.stock}
                    onChange={(e) => setRewardForm({ ...rewardForm, stock: Number(e.target.value) })}
                    className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF0]">
                <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                  Bekor qilish
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Sovg‘ani Saqlash
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Koin Taqdim Etish */}
      {awardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-[#E7EAF0] rounded-xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#E7EAF0] flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#E5A12B]" />
                <h3 className="text-sm font-bold text-[#252936]">O‘quvchiga Koin Berish</h3>
              </div>
              <button onClick={() => setAwardModalOpen(false)} className="text-[#7C8494] hover:text-[#252936]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAwardCoinsSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">O‘quvchini tanlang *</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none font-medium"
                >
                  <option value="">O‘quvchini tanlang...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name} (Hozirgi koin: {s.coins || 0})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">Koin miqdori 🪙</label>
                <input
                  type="number"
                  required
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  className="w-full bg-white text-base font-bold rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none font-mono text-[#E5A12B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7C8494] mb-1">Sababi</label>
                <input
                  type="text"
                  value={awardReason}
                  onChange={(e) => setAwardReason(e.target.value)}
                  className="w-full bg-white text-[#252936] text-xs rounded-lg px-3 py-2 border border-[#E7EAF0] focus:border-[#4169E1] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF0]">
                <Button variant="secondary" size="sm" onClick={() => setAwardModalOpen(false)}>
                  Bekor qilish
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Koinni Taqdim Etish
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
