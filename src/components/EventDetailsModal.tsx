import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Video,
  Award,
  Users,
  UserCheck,
  Edit,
  Trash2,
  Check,
  ExternalLink,
  ShieldAlert,
  Share2
} from 'lucide-react';
import { ScheduledEvent, User } from '../types';
import { canEditEvent, canDeleteEvent } from '../services/storage';

interface EventDetailsModalProps {
  event: ScheduledEvent | null;
  onClose: () => void;
  currentUser: User;
  allUsers: User[];
  onEdit: (event: ScheduledEvent) => void;
  onDelete: (eventId: string) => void;
  onApprove?: (eventId: string) => void;
  onReject?: (eventId: string) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  onClose,
  currentUser,
  allUsers,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!event) return null;

  const isEditable = canEditEvent(currentUser, event);
  const isDeletable = canDeleteEvent(currentUser, event);
  const isAdmin = currentUser.role === 'admin';

  const handleDeleteConfirmed = () => {
    onDelete(event.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const getTypeName = (t: string) => {
    switch (t) {
      case 'training':
        return 'การอบรม (Training)';
      case 'seminar':
        return 'สัมมนา (Seminar)';
      case 'meeting':
      default:
        return 'การประชุม (Meeting)';
    }
  };

  const getCategoryName = (c: string) => {
    switch (c) {
      case 'academic':
        return 'ด้านวิชาการ (Academic)';
      case 'quality':
        return 'ด้านคุณภาพ (Quality / HA)';
      case 'safety':
        return 'ด้านความปลอดภัย (Safety)';
      default:
        return 'ด้านบริหาร/ทั่วไป (Management)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-blue-950 to-blue-900 text-white flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                event.type === 'training'
                  ? 'bg-teal-700 text-white'
                  : event.type === 'seminar'
                  ? 'bg-indigo-800 text-white'
                  : 'bg-blue-800 text-white'
              }`}
            >
              {getTypeName(event.type)}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-blue-100">
              {getCategoryName(event.category)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-all text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Title & Status */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  event.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : event.status === 'pending'
                    ? 'bg-amber-100 text-amber-800'
                    : event.status === 'rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {event.status === 'approved'
                  ? '✅ อนุมัติแล้ว (Approved)'
                  : event.status === 'pending'
                  ? '⏳ รออนุมัติ (Pending Approval)'
                  : event.status === 'rejected'
                  ? '❌ ไม่อนุมัติ (Rejected)'
                  : '🏁 เสร็จสิ้น (Completed)'}
              </span>

              {event.cmteCredits > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 font-extrabold text-xs border border-amber-200 shadow-2xs">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>+{event.cmteCredits} คะแนน CMTE</span>
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 leading-snug">{event.title}</h3>
          </div>

          {/* Time & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div className="space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>วันและเวลา</span>
              </div>
              <div className="font-bold text-slate-800">
                {new Date(event.startTime).toLocaleDateString('th-TH', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <div className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>
                  {event.startTime.split('T')[1]?.slice(0, 5)} - {event.endTime.split('T')[1]?.slice(0, 5)} น.
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                {event.format === 'online' ? (
                  <Video className="w-3.5 h-3.5 text-indigo-600" />
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>สถานที่ / ช่องทาง ({event.format})</span>
              </div>
              {event.format !== 'online' && event.location && (
                <div className="font-semibold text-slate-800">{event.location}</div>
              )}
              {event.onlineLink && (
                <a
                  href={event.onlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>เปิดลิงก์ห้องประชุมออนไลน์</span>
                </a>
              )}
            </div>
          </div>

          {/* Creator & Attendees Info */}
          <div className="space-y-3">
            {/* Created by */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                  {event.createdByName.charAt(0)}
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold">ผู้บันทึก (Created By)</div>
                  <div className="text-xs font-bold text-slate-800">{event.createdByName}</div>
                </div>
              </div>
              <span className="text-[10px] text-slate-400">{event.createdByEmail}</span>
            </div>

            {/* Attendees list */}
            <div>
              <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>ผู้เข้าร่วมทั้งหมด ({event.attendeeEmails?.length || 1} คน)</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {event.attendeeEmails?.map((email) => {
                  const matchedUser = allUsers.find(
                    (u) => u.email.toLowerCase() === email.toLowerCase()
                  );
                  return (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span>{matchedUser ? matchedUser.name : email}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <div className="text-xs font-bold text-slate-700 mb-1">รายละเอียด / วาระการประชุม</div>
                <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </div>
              </div>
            )}
          </div>

          {/* Delete Confirmation Warning Box */}
          {showDeleteConfirm && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>ยืนยันการลบกิจกรรมนี้?</span>
              </div>
              <p className="text-xs text-rose-700">
                การลบนี้จะไม่สามารถเรียกคืนได้ คุณต้องการลบกิจกรรม "{event.title}" ใช่หรือไม่?
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirmed}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                >
                  ยืนยันลบกิจกรรม
                </button>
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            {/* Admin Quick Approval buttons */}
            {isAdmin && event.status === 'pending' && onApprove && onReject && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onApprove(event.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>อนุมัติคำขอ</span>
                </button>
                <button
                  onClick={() => {
                    onReject(event.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold"
                >
                  ปฏิเสธ
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {isDeletable && !showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="ลบกิจกรรม"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {isEditable && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit(event);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>แก้ไข</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
