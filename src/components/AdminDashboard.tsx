import React, { useState } from 'react';
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Users,
  Search,
  Check,
  X,
  Trash2,
  Edit,
  Eye,
  Filter,
  FileSpreadsheet,
  Calendar,
  AlertCircle,
  Printer
} from 'lucide-react';
import { ScheduledEvent, User } from '../types';
import { QUALITY_DOC_NUMBER } from '../services/sheets';

interface AdminDashboardProps {
  adminUser: User;
  allEvents: ScheduledEvent[];
  allUsers: User[];
  onApproveEvent: (eventId: string) => void;
  onRejectEvent: (eventId: string) => void;
  onEditEvent: (event: ScheduledEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onViewEventDetails: (event: ScheduledEvent) => void;
  onOpenSheetsExport: () => void;
  onOpenPrintReport?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  allEvents,
  allUsers,
  onApproveEvent,
  onRejectEvent,
  onEditEvent,
  onDeleteEvent,
  onViewEventDetails,
  onOpenSheetsExport,
  onOpenPrintReport,
}) => {
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const [searchStaff, setSearchStaff] = useState<string>('');
  const [activeAdminTab, setActiveAdminTab] = useState<'pending' | 'master' | 'staff'>('pending');

  const pendingEvents = allEvents.filter((e) => e.status === 'pending');
  const approvedEvents = allEvents.filter((e) => e.status === 'approved');

  // Filtered master events
  const filteredMasterEvents = allEvents.filter((ev) => {
    if (selectedUserFilter !== 'all' && ev.createdBy !== selectedUserFilter && !ev.attendeeIds?.includes(selectedUserFilter)) {
      return false;
    }
    if (searchStaff.trim()) {
      const q = searchStaff.toLowerCase();
      const matchStaff = ev.createdByName.toLowerCase().includes(q);
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchEmail = ev.createdByEmail.toLowerCase().includes(q);
      if (!matchStaff && !matchTitle && !matchEmail) return false;
    }
    return true;
  });

  // Calculate CMTE total logged
  const totalCmteCredits = allEvents.reduce((acc, ev) => acc + (ev.cmteCredits || 0), 0);

  // Group events by staff for directory
  const staffStats = allUsers.map((user) => {
    const userCreatedEvents = allEvents.filter((e) => e.createdBy === user.id);
    const userAttendedEvents = allEvents.filter(
      (e) => e.createdBy === user.id || e.attendeeIds?.includes(user.id)
    );
    const userCmte = userAttendedEvents.reduce((acc, e) => acc + (e.cmteCredits || 0), 0);
    return {
      user,
      createdCount: userCreatedEvents.length,
      attendedCount: userAttendedEvents.length,
      cmteCredits: userCmte,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-900/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-semibold border border-white/10">
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              <span>Admin Control Center • สิทธิ์ผู้ดูแลระบบสูงสุด</span>
              <span className="w-1 h-1 rounded-full bg-white/40"></span>
              <span className="font-mono text-white font-bold">{QUALITY_DOC_NUMBER}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ศูนย์ควบคุมและกำกับดูแลการจัดประชุม/อบรม
            </h1>
            <p className="text-sm text-blue-100/90 max-w-2xl leading-relaxed">
              ตรวจสอบกิจกรรมของบุคลากรทุกคนในสถาบันมะเร็งแห่งชาติ, อนุมัติคำขอ, กรองข้อมูลรายบุคคล, กำกับเอกสารคุณภาพ <strong className="font-mono text-white underline decoration-blue-400">{QUALITY_DOC_NUMBER}</strong> และส่งออกข้อมูลไปยัง Google Sheets
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenPrintReport && (
              <button
                onClick={onOpenPrintReport}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 shadow-sm transition-all active:scale-95"
              >
                <Printer className="w-4 h-4 text-blue-200" />
                <span>พิมพ์เอกสาร ({QUALITY_DOC_NUMBER})</span>
              </button>
            )}

            <button
              onClick={onOpenSheetsExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-950 font-bold text-xs sm:text-sm hover:bg-blue-50 shadow-md transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-900" />
              <span>ส่งออก Master Sheet</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8 relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-blue-200 text-xs font-medium mb-1">
              <span>กิจกรรมทั้งหมด</span>
              <Calendar className="w-4 h-4 text-blue-300" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold">{allEvents.length}</div>
            <div className="text-[11px] text-blue-200/80 mt-1">บันทึกในระบบทั้งหมด</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-amber-200 text-xs font-medium mb-1">
              <span>รอการอนุมัติ (Pending)</span>
              <Clock className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">
              {pendingEvents.length}
            </div>
            <div className="text-[11px] text-blue-200/80 mt-1">ต้องพิจารณาความเห็นชอบ</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-blue-200 text-xs font-medium mb-1">
              <span>คะแนน CMTE รวม</span>
              <Award className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
              {totalCmteCredits.toFixed(1)}
            </div>
            <div className="text-[11px] text-blue-200/80 mt-1">หน่วยกิตสะสมทั้งระบบ</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-blue-200 text-xs font-medium mb-1">
              <span>บุคลากรในระบบ</span>
              <Users className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold">{allUsers.length}</div>
            <div className="text-[11px] text-blue-200/80 mt-1">ผู้ใช้งานและผู้ดูแล</div>
          </div>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveAdminTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            activeAdminTab === 'pending'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>คิวรออนุมัติ ({pendingEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('master')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            activeAdminTab === 'master'
              ? 'bg-blue-950 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-blue-950'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>ตารางกิจกรรมรวม (Master Records)</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('staff')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            activeAdminTab === 'staff'
              ? 'bg-blue-950 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-blue-950'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>สถิติรายบุคคล (Staff Directory & CMTE)</span>
        </button>
      </div>

      {/* TAB 1: PENDING APPROVAL QUEUE */}
      {activeAdminTab === 'pending' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <span>รายการรอพิจารณาอนุมัติ</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {pendingEvents.length} รายการ
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ในฐานะ Admin คุณสามารถกดอนุมัติหรือปฏิเสธคำขอการเข้าร่วมอบรม/สัมมนาได้ทันที
              </p>
            </div>
          </div>

          {pendingEvents.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle className="w-12 h-12 mx-auto text-emerald-400 mb-2 opacity-80" />
              <p className="text-sm font-medium text-slate-600">ไม่มีกิจกรรมที่รอการอนุมัติ</p>
              <p className="text-xs text-slate-400 mt-1">ทุกรายการได้รับการพิจารณาเรียบร้อยแล้ว</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-all"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          event.type === 'training'
                            ? 'bg-emerald-100 text-emerald-800'
                            : event.type === 'seminar'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {event.type}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {event.category}
                      </span>
                      {event.cmteCredits > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                          +{event.cmteCredits} CMTE
                        </span>
                      )}
                    </div>

                    <h4
                      onClick={() => onViewEventDetails(event)}
                      className="font-bold text-slate-800 text-sm hover:text-sky-600 cursor-pointer"
                    >
                      {event.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>ผู้ยื่น: <strong className="text-slate-700">{event.createdByName}</strong> ({event.createdByEmail})</span>
                      <span>วันที่: {new Date(event.startTime).toLocaleDateString('th-TH')} ({event.startTime.split('T')[1]} - {event.endTime.split('T')[1]})</span>
                      <span>รูปแบบ: {event.format}</span>
                    </div>

                    {event.description && (
                      <p className="text-xs text-slate-500 line-clamp-1 italic">
                        "{event.description}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => onViewEventDetails(event)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs flex items-center gap-1"
                      title="ดูรายละเอียด"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">ดู</span>
                    </button>

                    <button
                      onClick={() => onRejectEvent(event.id)}
                      className="px-3 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>ปฏิเสธ</span>
                    </button>

                    <button
                      onClick={() => onApproveEvent(event.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>อนุมัติคำขอ</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MASTER RECORDS (Filterable by staff) */}
      {activeAdminTab === 'master' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                ตารางบันทึกกิจกรรมรวมทั้งหมด (Master Table)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                เข้าถึงและบริหารจัดการกิจกรรมของบุคลากรทุกคน สามารถแก้ไข ลบ หรือกรองดูรายบุคคลได้
              </p>
            </div>

            {/* Filter by Staff */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อพนักงาน หรือกิจกรรม..."
                  value={searchStaff}
                  onChange={(e) => setSearchStaff(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <select
                value={selectedUserFilter}
                onChange={(e) => setSelectedUserFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
              >
                <option value="all">กรองดู: บุคลากรทุกคน</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">ชื่อกิจกรรม / เรื่อง</th>
                  <th className="p-3.5">ผู้สร้าง / ยื่นคำขอ</th>
                  <th className="p-3.5">ประเภท & ด้าน</th>
                  <th className="p-3.5">วัน-เวลา</th>
                  <th className="p-3.5">คะแนน CMTE</th>
                  <th className="p-3.5">สถานะ</th>
                  <th className="p-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMasterEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/70 transition-all">
                    <td className="p-3.5 font-medium text-slate-800 max-w-xs">
                      <div
                        onClick={() => onViewEventDetails(event)}
                        className="font-semibold text-slate-800 hover:text-sky-600 cursor-pointer line-clamp-1"
                      >
                        {event.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {event.format === 'online' ? `Online: ${event.onlineLink || 'Virtual'}` : event.location}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-medium text-slate-700">{event.createdByName}</div>
                      <div className="text-[10px] text-slate-400">{event.createdByEmail}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold capitalize text-slate-700">{event.type}</div>
                      <div className="text-[10px] text-slate-500">{event.category}</div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <div>{new Date(event.startTime).toLocaleDateString('th-TH')}</div>
                      <div className="text-[10px] text-slate-400">
                        {event.startTime.split('T')[1]?.slice(0, 5)} - {event.endTime.split('T')[1]?.slice(0, 5)}
                      </div>
                    </td>

                    <td className="p-3.5 font-bold text-amber-700">
                      {event.cmteCredits > 0 ? `+${event.cmteCredits} คะแนน` : '-'}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          event.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : event.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {event.status === 'approved'
                          ? 'อนุมัติแล้ว'
                          : event.status === 'pending'
                          ? 'รออนุมัติ'
                          : 'ไม่อนุมัติ'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewEventDetails(event)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                          title="ดูรายละเอียด"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditEvent(event)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="แก้ไขกิจกรรม (Admin Override)"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteEvent(event.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="ลบกิจกรรม (Admin Override)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STAFF DIRECTORY & CMTE PROGRESS */}
      {activeAdminTab === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffStats.map(({ user, createdCount, attendedCount, cmteCredits }) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{user.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{user.jobTitle || user.department}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="text-xs text-slate-500 mb-4 truncate">{user.email}</div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center mb-3">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">กิจกรรมที่สร้าง</div>
                    <div className="text-sm font-bold text-slate-800">{createdCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">เข้าร่วมรวม</div>
                    <div className="text-sm font-bold text-slate-800">{attendedCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-700 font-medium">คะแนน CMTE</div>
                    <div className="text-sm font-extrabold text-amber-600">{cmteCredits.toFixed(1)}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedUserFilter(user.id);
                  setActiveAdminTab('master');
                }}
                className="w-full py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
              >
                ดูกิจกรรมของบุคคลนี้
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
