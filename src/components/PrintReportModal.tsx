import React, { useRef } from 'react';
import { X, Printer, FileText, CheckCircle2, Award, Calendar, ExternalLink } from 'lucide-react';
import { ScheduledEvent, User } from '../types';
import { QUALITY_DOC_NUMBER } from '../services/sheets';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  events: ScheduledEvent[];
  isAdmin: boolean;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  events,
  isAdmin,
}) => {
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalCredits = events.reduce((acc, ev) => acc + (ev.cmteCredits || 0), 0);
  const academicCredits = events
    .filter((e) => e.category === 'academic')
    .reduce((acc, ev) => acc + (ev.cmteCredits || 0), 0);
  const qualityCredits = events
    .filter((e) => e.category === 'quality')
    .reduce((acc, ev) => acc + (ev.cmteCredits || 0), 0);
  const safetyCredits = events
    .filter((e) => e.category === 'safety')
    .reduce((acc, ev) => acc + (ev.cmteCredits || 0), 0);

  const printDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:m-0 print:bg-white print:static print:inset-auto print:block">
      <div
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:rounded-none print:my-0 print:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Action Bar (hidden when printing) */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-blue-950 to-blue-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>พิมพ์เอกสารรายงาน PDF (ธรรมดา)</span>
              </h3>
              <p className="text-xs text-blue-200">
                สถาบันมะเร็งแห่งชาติ (National Cancer Institute Thailand) · MedTechLab
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสาร / บันทึก PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
              title="ปิด"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body - Standard PDF format */}
        <div
          ref={printContentRef}
          id="printable-pdf-document"
          className="p-8 sm:p-12 overflow-y-auto text-slate-800 space-y-6 print:p-6 print:overflow-visible print:text-black"
        >
          {/* Simple Clean Document Header (Non-quality-box table) */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b-2 border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <svg
                className="h-12 w-auto"
                viewBox="0 0 225 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 25 C6 31 7 41 11 49 C15 55 22 59 26 59 C21 52 20 42 23 34 C26 29 32 26 38 26 C29 20 18 20 12 25 Z"
                  fill="#E6007E"
                />
                <path
                  d="M29 58 C34 57 41 47 46 37 C51 27 51 17 43 15 C35 13 29 19 27 27 C25 36 27 47 29 58 Z"
                  fill="#E6007E"
                />
                <text x="58" y="46" fontWeight="900" fontSize="38" fill="#09090b">
                  NCI
                </text>
                <text x="138" y="25" fontWeight="700" fontSize="8.5" fill="#71717a">
                  NATIONAL
                </text>
                <text x="138" y="37" fontWeight="700" fontSize="8.5" fill="#71717a">
                  CANCER
                </text>
                <text x="138" y="49" fontWeight="700" fontSize="8.5" fill="#71717a">
                  INSTITUTE
                </text>
              </svg>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  สถาบันมะเร็งแห่งชาติ
                </h2>
                <p className="text-xs text-slate-600">
                  กรมการแพทย์ กระทรวงสาธารณสุข
                </p>
                <p className="text-[11px] text-blue-950 font-semibold mt-0.5">
                  ระบบบันทึกวันประชุม อบรม สัมมนา (MedTechLab)
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                รายงานประวัติการประชุม อบรม สัมมนา
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                และการศึกษาต่อเนื่องทางวิชาชีพ (CMTE)
              </p>
              <p className="text-xs text-slate-500 mt-1">
                วันที่พิมพ์เอกสาร: <span className="font-semibold text-slate-800">{printDate}</span>
              </p>
            </div>
          </div>

          {/* User & Participant Info - Clean Standard Block */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 text-xs text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500">ชื่อผู้บันทึก/ผู้รับการอบรม: </span>
                <strong className="text-slate-900 font-bold text-sm block sm:inline mt-0.5 sm:mt-0">{currentUser.name}</strong>
              </div>
              <div>
                <span className="text-slate-500">ตำแหน่ง: </span>
                <span className="text-slate-900 font-medium">{currentUser.jobTitle || 'เจ้าหน้าที่/นักวิชาการ'}</span>
              </div>
              <div>
                <span className="text-slate-500">กลุ่มงาน/ฝ่าย: </span>
                <span className="text-slate-900 font-medium">{currentUser.department}</span>
              </div>
              <div>
                <span className="text-slate-500">อีเมล: </span>
                <span className="font-mono text-slate-800">{currentUser.email}</span>
              </div>
              <div>
                <span className="text-slate-500">สถานะผู้ใช้งาน: </span>
                <span className="font-semibold text-blue-900 uppercase">{currentUser.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้ใช้งาน (Staff)'}</span>
              </div>
              <div>
                <span className="text-slate-500">จำนวนกิจกรรมทั้งหมด: </span>
                <strong className="text-slate-900">{events.length} รายการ</strong>
              </div>
            </div>
          </div>

          {/* Simple Standard Activities Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>รายการกิจกรรมการประชุม อบรม และสัมมนา</span>
              <span className="text-slate-500 font-normal">ทั้งหมด {events.length} รายการ</span>
            </div>

            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold text-[11px]">
                  <tr>
                    <th className="p-2.5 text-center w-10">#</th>
                    <th className="p-2.5">ชื่อเรื่องการประชุม/อบรม/สัมมนา</th>
                    <th className="p-2.5 text-center w-20">ประเภท</th>
                    <th className="p-2.5 text-center w-24">ด้านงาน</th>
                    <th className="p-2.5 text-center w-28">วัน-เวลา</th>
                    <th className="p-2.5 text-center w-24">รูปแบบ/สถานที่</th>
                    <th className="p-2.5 text-center w-20">หน่วยกิต CMTE</th>
                    <th className="p-2.5 text-center w-20">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400 italic">
                        ไม่มีข้อมูลกิจกรรมในช่วงเวลานี้
                      </td>
                    </tr>
                  ) : (
                    events.map((ev, index) => (
                      <tr key={ev.id} className="hover:bg-slate-50/50 print:hover:bg-transparent">
                        <td className="p-2.5 text-center font-mono text-slate-500">{index + 1}</td>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{ev.title}</div>
                          {ev.description && (
                            <div className="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1 print:line-clamp-none">
                              {ev.description}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 text-center capitalize">
                          {ev.type === 'training' ? 'อบรม' : ev.type === 'seminar' ? 'สัมมนา' : 'ประชุม'}
                        </td>
                        <td className="p-2.5 text-center text-slate-700">
                          {ev.category === 'academic'
                            ? 'วิชาการ'
                            : ev.category === 'quality'
                            ? 'คุณภาพ'
                            : ev.category === 'safety'
                            ? 'ความปลอดภัย'
                            : 'บริหาร'}
                        </td>
                        <td className="p-2.5 text-center whitespace-nowrap text-[11px]">
                          <div className="font-medium text-slate-800">
                            {new Date(ev.startTime).toLocaleDateString('th-TH')}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {ev.startTime.split('T')[1]?.slice(0, 5)} - {ev.endTime.split('T')[1]?.slice(0, 5)} น.
                          </div>
                        </td>
                        <td className="p-2.5 text-center text-[11px] text-slate-700">
                          {ev.format === 'online' ? 'Online' : ev.location || 'On-site'}
                        </td>
                        <td className="p-2.5 text-center font-bold text-blue-950">
                          {ev.cmteCredits > 0 ? `+${ev.cmteCredits}` : '-'}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                            {ev.status === 'approved' ? 'อนุมัติแล้ว' : ev.status === 'pending' ? 'รออนุมัติ' : 'ไม่อนุมัติ'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CMTE Credits Summary */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-900" />
              <span>สรุปคะแนนการศึกษาต่อเนื่อง (CMTE):</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span>วิชาการ: <strong className="text-blue-900">{academicCredits.toFixed(1)}</strong> หน่วยกิต</span>
              <span>คุณภาพ: <strong className="text-teal-800">{qualityCredits.toFixed(1)}</strong> หน่วยกิต</span>
              <span>ความปลอดภัย: <strong className="text-indigo-900">{safetyCredits.toFixed(1)}</strong> หน่วยกิต</span>
              <span className="py-1 px-3 rounded-lg bg-blue-950 text-white font-extrabold text-xs">
                รวมทั้งสิ้น: {totalCredits.toFixed(1)} หน่วยกิต
              </span>
            </div>
          </div>

          {/* Simple Signature Lines */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-4">
              <div className="font-medium text-slate-700">ลงชื่อผู้รายงาน</div>
              <div className="border-b border-dotted border-slate-400 w-48 mx-auto h-6" />
              <div className="text-slate-800 font-semibold">({currentUser.name})</div>
              <div className="text-[11px] text-slate-500">วันที่ ......../......../............</div>
            </div>

            <div className="space-y-4">
              <div className="font-medium text-slate-700">ลงชื่อหัวหน้างาน / ผู้รับรอง</div>
              <div className="border-b border-dotted border-slate-400 w-48 mx-auto h-6" />
              <div className="text-slate-800 font-semibold">(........................................................)</div>
              <div className="text-[11px] text-slate-500">วันที่ ......../......../............</div>
            </div>
          </div>

          {/* Bottom Right Corner Document Number (ขอแค่มุมล่างขวามีเลขเอกสารอยุ่) */}
          <div className="pt-8 flex justify-end items-end">
            <div className="text-right text-xs font-mono font-semibold text-slate-700">
              {QUALITY_DOC_NUMBER}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
