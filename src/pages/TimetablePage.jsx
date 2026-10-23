import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { api } from '../lib/api';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Users,
  Search,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const TIME_SLOTS = [
  '09:00 - 10:30',
  '10:45 - 12:15',
  '14:00 - 15:30',
  '15:45 - 17:15',
  '17:30 - 19:00',
  '19:15 - 20:45',
];

export function TimetablePage() {
  const [activeOrg, setActiveOrg] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Dushanba');
  const [selectedRoom, setSelectedRoom] = useState('all');

  const orgId = activeOrg?.id || 'default';

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('eduone_impersonating_org');
      if (raw) setActiveOrg(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    async function loadGroups() {
      const data = await api.getGroups(orgId);
      setGroups(data);
    }
    loadGroups();
  }, [activeOrg]);

  const isOddDay = selectedDay === 'Dushanba' || selectedDay === 'Chorshanba' || selectedDay === 'Juma';

  const dayGroups = groups.filter((g) => {
    if (selectedRoom !== 'all' && g.room !== selectedRoom) return false;

    if (g.schedule_days === 'Har kuni') return true;
    if (isOddDay && g.schedule_days === 'Dush-Chor-Juma') return true;
    if (!isOddDay && g.schedule_days === 'Sesh-Pay-Shanba') return true;
    return false;
  });

  const roomsList = Array.from(new Set(groups.map((g) => g.room).filter(Boolean)));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Bosh sahifa', href: '/' }, { label: 'Dars Jadvali' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252936] flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-[#4169E1]" />
            Haftalik Dars Jadvali va Xonalar
          </h1>
          <p className="text-xs text-[#7C8494] mt-1">
            Guruhlar taqvimi, xonalar bandligi va to‘qnashuvlarni oldini oluvchi aqlli jadval
          </p>
        </div>
      </div>

      {/* Days Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-semibold transition-all border whitespace-nowrap',
                isSelected
                  ? 'bg-[#4169E1] text-white border-[#4169E1] shadow-xs'
                  : 'bg-white text-[#7C8494] border-[#E7EAF0] hover:bg-[#F5F6F8] hover:text-[#252936]'
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Filter by Room */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#7C8494]">Xona bo‘yicha:</span>
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedRoom('all')}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-medium border transition-colors',
              selectedRoom === 'all'
                ? 'bg-[#EEF2FF] text-[#4169E1] border-[#4169E1]/30 font-semibold'
                : 'bg-white text-[#7C8494] border-[#E7EAF0] hover:bg-[#F5F6F8]'
            )}
          >
            Barcha xonalar
          </button>
          {roomsList.map((room) => (
            <button
              key={room}
              onClick={() => setSelectedRoom(room)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium border transition-colors',
                selectedRoom === room
                  ? 'bg-[#EEF2FF] text-[#4169E1] border-[#4169E1]/30 font-semibold'
                  : 'bg-white text-[#7C8494] border-[#E7EAF0] hover:bg-[#F5F6F8]'
              )}
            >
              {room}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Slots Grid */}
      <div className="space-y-4">
        {TIME_SLOTS.map((slot) => {
          const slotGroups = dayGroups.filter((g) => g.schedule_time === slot);

          return (
            <div key={slot} className="flex flex-col md:flex-row gap-3">
              {/* Time Column */}
              <div className="w-36 shrink-0 flex items-center gap-2 p-3 rounded-lg bg-white border border-[#E7EAF0] text-xs font-mono font-semibold text-[#4169E1] shadow-xs">
                <Clock className="w-4 h-4 text-[#4169E1]" />
                {slot}
              </div>

              {/* Groups Cards in this slot */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {slotGroups.length === 0 ? (
                  <div className="p-3 rounded-lg bg-[#F8F9FA] border border-dashed border-[#E7EAF0] text-center text-xs text-[#7C8494]/60 flex items-center justify-center">
                    Dars belgilanmagan (Xonalar bo‘sh)
                  </div>
                ) : (
                  slotGroups.map((g) => {
                    const hasConflict = slotGroups.some((other) => other.id !== g.id && other.room === g.room);
                    return (
                      <Card
                        key={g.id}
                        className={cn(
                          'p-3 transition-all space-y-1.5 shadow-xs',
                          hasConflict
                            ? 'border-[#D94B4B]/40 bg-[#FDEEEC]'
                            : 'border-[#E7EAF0] bg-white hover:border-[#4169E1]/30'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-[#252936]">{g.name}</h4>
                          <span className={cn('text-[10px] px-2 py-0.5 rounded-md font-semibold', hasConflict ? 'bg-[#D94B4B]/20 text-[#D94B4B]' : 'bg-[#F5F6F8] text-[#252936] border border-[#E7EAF0]')}>
                            {g.room}
                          </span>
                        </div>

                        {hasConflict && (
                          <p className="text-[10px] text-[#D94B4B] font-bold flex items-center gap-1">
                            ⚠️ Xona to‘qnashuvi! (Band)
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-[#7C8494]">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-[#7C8494]" />
                            {g.teacher_name}
                          </span>
                          <span className="text-[#252936] font-medium">{g.subject}</span>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
