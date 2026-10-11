import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Video,
  MapPin,
  Clock,
  Award,
  Sparkles,
  Calendar as CalendarIcon,
  Plus
} from 'lucide-react';
import { ScheduledEvent } from '../types';

interface CalendarViewProps {
  events: ScheduledEvent[];
  selectedMonth: number; // 0-11
  selectedYear: number;
  onChangeMonth: (month: number, year: number) => void;
  onSelectEvent: (event: ScheduledEvent) => void;
  onOpenCreateWithDate: (dateStr: string) => void;
}

const MONTH_NAMES_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const DAY_NAMES_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  selectedMonth,
  selectedYear,
  onChangeMonth,
  onSelectEvent,
  onOpenCreateWithDate,
}) => {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      onChangeMonth(11, selectedYear - 1);
    } else {
      onChangeMonth(selectedMonth - 1, selectedYear);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      onChangeMonth(0, selectedYear + 1);
    } else {
      onChangeMonth(selectedMonth + 1, selectedYear);
    }
  };

  const handleToday = () => {
    const now = new Date();
    onChangeMonth(now.getMonth(), now.getFullYear());
  };

  // Build Month Grid
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarDays.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({
      dateStr,
      dayNum: i,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete full 35 or 42 grid
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= (remainingCells >= 7 ? remainingCells : remainingCells + 7); i++) {
    if (calendarDays.length >= 35 && calendarDays.length % 7 === 0) break;
    const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({
      dateStr,
      dayNum: i,
      isCurrentMonth: false,
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const getEventsForDate = (dateStr: string) => {
    return events.filter((ev) => {
      const startDate = ev.startTime.split('T')[0];
      const endDate = ev.endTime.split('T')[0];
      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  const getTypeColorStyles = (type: string) => {
    switch (type) {
      case 'training':
        return {
          bg: 'bg-teal-50/90 hover:bg-teal-100 text-teal-950 border-teal-200/80 shadow-2xs',
          dot: 'bg-teal-700',
          badge: 'bg-teal-800 text-white',
        };
      case 'seminar':
        return {
          bg: 'bg-indigo-50/90 hover:bg-indigo-100 text-indigo-950 border-indigo-200/80 shadow-2xs',
          dot: 'bg-indigo-700',
          badge: 'bg-indigo-800 text-white',
        };
      case 'meeting':
      default:
        return {
          bg: 'bg-blue-50/90 hover:bg-blue-100 text-blue-950 border-blue-200/80 shadow-2xs',
          dot: 'bg-blue-800',
          badge: 'bg-blue-900 text-white',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Calendar Header */}
      <div className="px-5 py-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-blue-50/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-900 transition-all"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-blue-50/60 hover:text-blue-950 transition-all"
            >
              วันนี้
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-900 transition-all"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-extrabold text-blue-950 flex items-center gap-2 tracking-tight">
            <span>
              {MONTH_NAMES_TH[selectedMonth]} {selectedYear + 543}
            </span>
            <span className="text-xs font-medium text-slate-400">({selectedYear})</span>
          </h2>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-800" />
            <span className="text-slate-700 font-semibold">ประชุม</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-700" />
            <span className="text-slate-700 font-semibold">อบรม</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-800" />
            <span className="text-slate-700 font-semibold">สัมมนา</span>
          </div>
        </div>
      </div>

      {/* Weekday Columns Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-semibold text-slate-600 py-2.5">
        {DAY_NAMES_TH.map((day, idx) => (
          <div
            key={day}
            className={`${idx === 0 ? 'text-rose-600' : idx === 6 ? 'text-indigo-600' : 'text-slate-700'}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
        {calendarDays.map((cell) => {
          const isToday = cell.dateStr === todayStr;
          const dayEvents = getEventsForDate(cell.dateStr);

          return (
            <div
              key={cell.dateStr}
              onMouseEnter={() => setHoveredDate(cell.dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
              className={`min-h-[110px] sm:min-h-[130px] p-1.5 sm:p-2 transition-all relative group flex flex-col justify-between ${
                cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50 text-slate-400'
              }`}
            >
              {/* Day Number Row & Quick Add Button */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full transition-all ${
                    isToday
                      ? 'bg-blue-950 text-white shadow-xs'
                      : cell.isCurrentMonth
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {cell.dayNum}
                </span>

                {/* Quick Add Event on this day on hover */}
                {cell.isCurrentMonth && (
                  <button
                    onClick={() => onOpenCreateWithDate(cell.dateStr)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-blue-900 hover:bg-blue-50 transition-all"
                    title={`เพิ่มกิจกรรมวันที่ ${cell.dayNum}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Event Pills */}
              <div className="flex-1 space-y-1 overflow-y-auto max-h-[85px] sm:max-h-[105px] pr-0.5">
                {dayEvents.slice(0, 3).map((event) => {
                  const style = getTypeColorStyles(event.type);
                  return (
                    <button
                      key={event.id}
                      onClick={() => onSelectEvent(event)}
                      className={`w-full text-left p-1 sm:p-1.5 rounded-lg border text-[11px] leading-tight transition-all active:scale-[0.98] ${style.bg}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                          <span className="font-semibold truncate">{event.title}</span>
                        </div>
                        {event.cmteCredits > 0 && (
                          <span className="shrink-0 text-[9px] font-bold px-1 py-0.2 rounded-sm bg-amber-100 text-amber-800 border border-amber-200">
                            +{event.cmteCredits}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[10px] opacity-80">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {event.startTime.split('T')[1]?.slice(0, 5)}
                        </span>
                        {event.format === 'online' ? (
                          <span className="flex items-center gap-0.5 text-sky-700">
                            <Video className="w-2.5 h-2.5" /> Online
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 truncate">
                            <MapPin className="w-2.5 h-2.5" />
                            {event.location?.slice(0, 10)}
                          </span>
                        )}
                        {event.status === 'pending' && (
                          <span className="text-[9px] text-amber-600 font-bold">รออนุมัติ</span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-center font-medium text-slate-500 py-0.5">
                    +{dayEvents.length - 3} รายการเพิ่มเติม
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
