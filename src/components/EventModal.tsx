import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Video, Award, FileText } from 'lucide-react';
import { ScheduledEvent, User, EventType, EventCategory, EventFormat, EventStatus } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: any) => void;
  editingEvent?: ScheduledEvent | null;
  currentUser: User;
  allUsers: User[];
  defaultDate?: string | null;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEvent,
  currentUser,
  allUsers,
  defaultDate,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('meeting');
  const [category, setCategory] = useState<EventCategory>('academic');
  const [format, setFormat] = useState<EventFormat>('onsite');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('12:00');
  const [location, setLocation] = useState('');
  const [onlineLink, setOnlineLink] = useState('');
  const [cmteCredits, setCmteCredits] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<EventStatus>('pending');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setType(editingEvent.type);
      setCategory(editingEvent.category);
      setFormat(editingEvent.format);
      
      const [sDate, sTime] = editingEvent.startTime.split('T');
      setStartDate(sDate);
      setStartTime(sTime?.slice(0, 5) || '09:00');

      const [eDate, eTime] = editingEvent.endTime.split('T');
      setEndDate(eDate);
      setEndTime(eTime?.slice(0, 5) || '12:00');

      setLocation(editingEvent.location || '');
      setOnlineLink(editingEvent.onlineLink || '');
      setCmteCredits(editingEvent.cmteCredits || 0);
      setDescription(editingEvent.description || '');
      setStatus(editingEvent.status);
    } else {
      // New Event Defaults
      setTitle('');
      setType('training');
      setCategory('academic');
      setFormat('onsite');

      const today = defaultDate || new Date().toISOString().split('T')[0];
      setStartDate(today);
      setStartTime('09:00');
      setEndDate(today);
      setEndTime('12:00');

      setLocation('');
      setOnlineLink('');
      setCmteCredits(type === 'meeting' ? 0 : 2.0);
      setDescription('');
      setStatus(isAdmin ? 'approved' : 'pending');
    }
    setErrorMsg('');
  }, [editingEvent, defaultDate, isOpen, currentUser, isAdmin]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('กรุณากรอกชื่อเรื่องการประชุม/อบรม/สัมมนา');
      return;
    }
    if (!startDate || !startTime || !endDate || !endTime) {
      setErrorMsg('กรุณาระบุวันและเวลาเริ่มต้น-สิ้นสุดให้ครบถ้วน');
      return;
    }

    const startIso = `${startDate}T${startTime}`;
    const endIso = `${endDate}T${endTime}`;

    if (startIso > endIso) {
      setErrorMsg('เวลาสิ้นสุดต้องไม่เกิดขึ้นก่อนเวลาเริ่มต้น');
      return;
    }

    onSave({
      title: title.trim(),
      type,
      category,
      format,
      startTime: startIso,
      endTime: endIso,
      location: format !== 'online' ? location.trim() : '',
      onlineLink: format !== 'onsite' ? onlineLink.trim() : '',
      cmteCredits: Number(cmteCredits) || 0,
      attendeeIds: editingEvent?.attendeeIds || [currentUser.id],
      attendeeEmails: editingEvent?.attendeeEmails || [currentUser.email],
      description: description.trim(),
      status: isAdmin ? status : (editingEvent ? editingEvent.status : 'pending'),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-blue-950 to-blue-900 text-white flex items-center justify-between border-b border-blue-900/40">
          <div>
            <h3 className="font-extrabold text-lg tracking-tight">
              {editingEvent ? 'แก้ไขกิจกรรม' : 'บันทึกการประชุม / อบรม / สัมมนา'}
            </h3>
            <p className="text-xs text-blue-200 mt-0.5">
              บันทึกข้อมูลโดยอัตโนมัติในนาม: <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-all text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ชื่อเรื่องการประชุม / อบรม / สัมมนา <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น การอบรมเทคนิคการตรวจวิเคราะห์ทางห้องปฏิบัติการขั้นสูง หรือ ประชุมคณะกรรมการ HA"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-800"
            />
          </div>

          {/* Type & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ประเภทกิจกรรม <span className="text-rose-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as EventType;
                  setType(newType);
                  if (newType === 'training' && cmteCredits === 0) setCmteCredits(2.0);
                  if (newType === 'seminar' && cmteCredits === 0) setCmteCredits(4.0);
                  if (newType === 'meeting') setCmteCredits(0);
                }}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value="meeting">📋 การประชุม (Meeting)</option>
                <option value="training">🎓 การอบรม (Training)</option>
                <option value="seminar">🏛️ สัมมนา (Seminar)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ด้านงาน (Category) <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              >
                <option value="academic">🔬 ด้านวิชาการ (Academic)</option>
                <option value="quality">⭐ ด้านคุณภาพ (Quality / HA)</option>
                <option value="safety">🛡️ ด้านความปลอดภัย (Safety)</option>
                <option value="management">💼 ด้านบริหาร / อื่นๆ</option>
              </select>
            </div>
          </div>

          {/* Format & CMTE Credits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Format */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                รูปแบบการจัดกิจกรรม <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['onsite', 'online', 'hybrid'] as EventFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormat(fmt)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                      format === fmt
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {fmt === 'onsite' ? '🏢 On-site' : fmt === 'online' ? '💻 Online' : '🌐 Hybrid'}
                  </button>
                ))}
              </div>
            </div>

            {/* CMTE Credits */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>คะแนนการศึกษาต่อเนื่อง (CMTE Credits)</span>
                </span>
                <span className="text-[10px] text-slate-400">หน่วยกิต</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                value={cmteCredits}
                onChange={(e) => setCmteCredits(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  วันเริ่มกิจกรรม <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (!endDate || endDate < e.target.value) setEndDate(e.target.value);
                    }}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-24 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  วันสิ้นสุดกิจกรรม <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-24 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location / Online Link according to format */}
          {format !== 'online' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>สถานที่จัดกิจกรรม (On-site Location)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="เช่น ห้องประชุมชัยพฤกษ์ ชั้น 4 หรือ โรงแรมเซ็นทารา แกรนด์"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          )}

          {format !== 'onsite' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Video className="w-3.5 h-3.5 text-sky-500" />
                <span>ลิงก์ออนไลน์ (Zoom, Google Meet, MS Teams, Cisco Webex)</span>
              </label>
              <input
                type="url"
                value={onlineLink}
                onChange={(e) => setOnlineLink(e.target.value)}
                placeholder="https://zoom.us/j/... หรือ https://meet.google.com/..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          )}

          {/* Admin status selection */}
          {isAdmin && (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
              <label className="block text-xs font-bold text-purple-900 mb-1">
                สถานะการอนุมัติ (สิทธิ์ Admin)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-purple-300 rounded-lg text-purple-900"
              >
                <option value="approved">✅ อนุมัติแล้ว (Approved)</option>
                <option value="pending">⏳ รออนุมัติ (Pending)</option>
                <option value="rejected">❌ ไม่อนุมัติ (Rejected)</option>
                <option value="completed">🏁 เสร็จสิ้น (Completed)</option>
              </select>
            </div>
          )}

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>รายละเอียด วาระการประชุม หรือหมายเหตุ</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุวาระการประชุม วัตถุประสงค์ หรือเอกสารประกอบการประชุม..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-xl shadow-md hover:from-blue-950 hover:to-indigo-950 transition-all active:scale-95"
            >
              {editingEvent ? 'บันทึกการแก้ไข' : 'บันทึกกิจกรรม'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
