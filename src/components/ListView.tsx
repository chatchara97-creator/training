import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Award,
  Eye,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ScheduledEvent, User } from '../types';
import { canEditEvent, canDeleteEvent } from '../services/storage';
import { QUALITY_DOC_NUMBER } from '../services/sheets';

interface ListViewProps {
  events: ScheduledEvent[];
  currentUser: User;
  onSelectEvent: (event: ScheduledEvent) => void;
  onEditEvent: (event: ScheduledEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onOpenCreateModal: () => void;
}

export const ListView: React.FC<ListViewProps> = ({
  events,
  currentUser,
  onSelectEvent,
  onEditEvent,
  onDeleteEvent,
  onOpenCreateModal,
}) => {
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-700">ไม่พบกิจกรรมตามเงื่อนไขที่เลือก</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          ยังไม่มีกิจกรรมที่สอดคล้องกับตัวกรอง หรือคุณยังไม่ได้สร้างกิจกรรมในหมวดหมู่นี้
        </p>
        <button
          onClick={onOpenCreateModal}
          className="mt-4 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          + เพิ่มกิจกรรมใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm">
          รายการการประชุม • อบรม • สัมมนา ({events.length} รายการ)
        </h3>
        <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {QUALITY_DOC_NUMBER}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {events.map((event) => {
          const isEditable = canEditEvent(currentUser, event);
          const isDeletable = canDeleteEvent(currentUser, event);

          return (
            <div
              key={event.id}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-all"
            >
              {/* Event Content */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      event.type === 'training'
                        ? 'bg-emerald-100 text-emerald-800'
                        : event.type === 'seminar'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {event.type === 'training'
                      ? 'อบรม'
                      : event.type === 'seminar'
                      ? 'สัมมนา'
                      : 'ประชุม'}
                  </span>

                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {event.category === 'academic'
                      ? 'วิชาการ'
                      : event.category === 'quality'
                      ? 'คุณภาพ'
                      : event.category === 'safety'
                      ? 'ความปลอดภัย'
                      : 'บริหาร'}
                  </span>

                  {event.cmteCredits > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                      +{event.cmteCredits} CMTE
                    </span>
                  )}

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      event.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : event.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {event.status === 'approved'
                      ? 'อนุมัติแล้ว'
                      : event.status === 'pending'
                      ? 'รออนุมัติ'
                      : 'ไม่อนุมัติ'}
                  </span>
                </div>

                <h4
                  onClick={() => onSelectEvent(event)}
                  className="font-bold text-slate-900 text-sm hover:text-sky-600 cursor-pointer transition-colors"
                >
                  {event.title}
                </h4>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(event.startTime).toLocaleDateString('th-TH')} (
                      {event.startTime.split('T')[1]?.slice(0, 5)} - {event.endTime.split('T')[1]?.slice(0, 5)} น.)
                    </span>
                  </span>

                  {event.format === 'online' ? (
                    <span className="flex items-center gap-1 text-sky-700 font-medium">
                      <Video className="w-3.5 h-3.5" />
                      <span>Online Session</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.location || 'On-site'}</span>
                    </span>
                  )}

                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{event.attendeeEmails?.length || 1} ผู้เข้าร่วม</span>
                  </span>

                  <span className="text-[11px] text-slate-400">
                    ผู้จัด: <strong>{event.createdByName}</strong>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                <button
                  onClick={() => onSelectEvent(event)}
                  className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
                  title="ดูรายละเอียด"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {isEditable && (
                  <button
                    onClick={() => onEditEvent(event)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="แก้ไขกิจกรรม"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}

                {isDeletable && (
                  <button
                    onClick={() => onDeleteEvent(event.id)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="ลบกิจกรรม"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
