import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { todayLessons } from '../../data/mockData';
import { Clock, MapPin, User, ChevronRight, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

export function TodayLessonsTable() {
  const [filter, setFilter] = useState('all');

  const filteredLessons = todayLessons.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_progress':
        return (
          <Badge variant="emerald" size="sm" dot dotPulse>
            Jarayonda
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge variant="amber" size="sm" dot>
            Kutilmoqda
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="neutral" size="sm">
            Tugallandi
          </Badge>
        );
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Bugungi darslar jadvali</CardTitle>
            <Badge variant="neutral" size="sm">
              {todayLessons.length} ta dars
            </Badge>
          </div>
          <CardDescription>
            Bugun markazimizda o‘tilayotgan barcha mashg‘ulotlar ro‘yxati
          </CardDescription>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#14181F] rounded-lg border border-white/[0.06] self-start sm:self-auto">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'in_progress', label: 'Jarayonda' },
            { id: 'upcoming', label: 'Kutilmoqda' },
            { id: 'completed', label: 'Tugallangan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150',
                filter === tab.id
                  ? 'bg-emerald-500/15 text-emerald-400 shadow-sm font-semibold'
                  : 'text-[#9CA7BC] hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>

      {/* Table Container */}
      <div className="overflow-x-auto -mx-5 px-5 mt-2">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] text-[#717F9A] uppercase text-[10px] tracking-wider font-semibold">
              <th className="pb-3 pl-2">Guruh va Fan</th>
              <th className="pb-3">O‘qituvchi</th>
              <th className="pb-3">Xona</th>
              <th className="pb-3">Vaqt</th>
              <th className="pb-3">O‘quvchilar</th>
              <th className="pb-3">Holat</th>
              <th className="pb-3 text-right pr-2">Amal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredLessons.map((lesson) => (
              <tr
                key={lesson.id}
                className="group hover:bg-white/[0.02] transition-colors"
              >
                {/* Group & Subject */}
                <td className="py-3.5 pl-2 font-medium">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-xs group-hover:text-emerald-300 transition-colors">
                        {lesson.group}
                      </p>
                      <p className="text-[11px] text-[#717F9A] truncate max-w-[200px]">
                        {lesson.subject}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Teacher */}
                <td className="py-3.5 text-[#CBD3E1]">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#717F9A]" />
                    <span>{lesson.teacher}</span>
                  </div>
                </td>

                {/* Room */}
                <td className="py-3.5 text-[#CBD3E1]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400/80" />
                    <span className="font-mono text-[11px]">{lesson.room}</span>
                  </div>
                </td>

                {/* Time */}
                <td className="py-3.5 text-[#CBD3E1]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#717F9A]" />
                    <span className="font-mono text-[11px]">{lesson.time}</span>
                  </div>
                </td>

                {/* Students Count */}
                <td className="py-3.5 text-[#9CA7BC]">
                  <span>{lesson.studentsCount} nafar</span>
                </td>

                {/* Status */}
                <td className="py-3.5">
                  {getStatusBadge(lesson.status)}
                </td>

                {/* Action */}
                <td className="py-3.5 text-right pr-2">
                  <button
                    onClick={() => alert(`${lesson.group} darsi tafsilotlari (Phase 2)`)}
                    className="p-1 rounded-lg text-[#717F9A] hover:text-white hover:bg-white/[0.06] transition-colors"
                    title="Batafsil"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredLessons.length === 0 && (
        <div className="py-12 text-center text-xs text-[#717F9A]">
          Bu filtr bo‘yicha hozircha darslar mavjud emas
        </div>
      )}
    </Card>
  );
}
