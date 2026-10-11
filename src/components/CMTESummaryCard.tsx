import React from 'react';
import { Award, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ScheduledEvent, User } from '../types';

interface CMTESummaryCardProps {
  currentUser: User;
  events: ScheduledEvent[];
}

export const CMTESummaryCard: React.FC<CMTESummaryCardProps> = ({ currentUser, events }) => {
  // Calculate CMTE credits
  const userEvents = events.filter(
    (e) => e.createdBy === currentUser.id || e.attendeeIds?.includes(currentUser.id)
  );

  const totalCredits = userEvents.reduce((acc, ev) => acc + (ev.cmteCredits || 0), 0);
  const academicCredits = userEvents
    .filter((e) => e.category === 'academic')
    .reduce((acc, ev) => acc + (ev.cmteCredits || 0), 0);
  const qualityCredits = userEvents
    .filter((e) => e.category === 'quality')
    .reduce((acc, ev) => acc + (ev.cmteCredits || 0), 0);
  const safetyCredits = userEvents
    .filter((e) => e.category === 'safety')
    .reduce((acc, ev) => acc + (ev.cmteCredits || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 mb-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-950 before:via-blue-800 before:to-indigo-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Score & Details */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-blue-950 text-white shadow-xs">
              <Award className="w-4 h-4 text-amber-400" />
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                คะแนนการศึกษาต่อเนื่อง (CMTE Credits Tracker)
              </h3>
              <p className="text-[11px] text-slate-500">
                สะสมสำหรับ: <strong className="text-blue-950">{currentUser.name}</strong> ({currentUser.jobTitle || currentUser.department})
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
              {totalCredits.toFixed(1)}
            </span>
            <span className="text-xs text-slate-600 font-semibold">หน่วยกิตสะสม</span>
            <span className="text-[11px] text-slate-400">· รวม {userEvents.length} กิจกรรม</span>
          </div>
        </div>

        {/* Right: Breakdown by category */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 text-center min-w-[85px]">
            <div className="text-[10px] text-slate-600 font-semibold flex items-center justify-center gap-1">
              <BookOpen className="w-3 h-3 text-blue-800" />
              <span>วิชาการ</span>
            </div>
            <div className="text-sm font-extrabold text-blue-950 mt-1">{academicCredits.toFixed(1)}</div>
          </div>

          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 text-center min-w-[85px]">
            <div className="text-[10px] text-slate-600 font-semibold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-teal-700" />
              <span>คุณภาพ</span>
            </div>
            <div className="text-sm font-extrabold text-blue-950 mt-1">{qualityCredits.toFixed(1)}</div>
          </div>

          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 text-center min-w-[85px]">
            <div className="text-[10px] text-slate-600 font-semibold flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-700" />
              <span>ความปลอดภัย</span>
            </div>
            <div className="text-sm font-extrabold text-blue-950 mt-1">{safetyCredits.toFixed(1)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
