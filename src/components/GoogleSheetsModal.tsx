import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  ShieldCheck,
  Download,
  FileCheck
} from 'lucide-react';
import { ScheduledEvent, User } from '../types';
import {
  getSavedSheetInfo,
  createAndPopulateSpreadsheet,
  syncToExistingSpreadsheet,
  QUALITY_DOC_NUMBER,
} from '../services/sheets';
import { getAccessToken, googleSignIn } from '../services/auth';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  eventsToExport: ScheduledEvent[];
  isAdmin: boolean;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  eventsToExport,
  isAdmin,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [sheetInfo, setSheetInfo] = useState(getSavedSheetInfo());
  const [pendingAction, setPendingAction] = useState<'create' | 'sync' | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      let token = await getAccessToken();
      if (!token) {
        // Trigger Google sign-in to get fresh token with sheets scope
        const loginRes = await googleSignIn();
        token = loginRes?.accessToken || null;
      }

      if (!token) {
        throw new Error('ไม่พบสิทธิ์การเข้าถึง Google Sheets กรุณาเข้าสู่ระบบด้วย Google');
      }

      const defaultTitle = isAdmin
        ? `Master Calendar - ระบบบันทึกการประชุมและอบรม CMTE (${new Date().toLocaleDateString('th-TH')})`
        : `บันทึกการประชุมและอบรม (${currentUser.name}) - ${new Date().toLocaleDateString('th-TH')}`;

      const res = await createAndPopulateSpreadsheet(token, defaultTitle, eventsToExport);
      setSheetInfo({
        spreadsheetId: res.spreadsheetId,
        spreadsheetUrl: res.spreadsheetUrl,
        lastSyncedAt: new Date().toISOString(),
      });
      setSuccessMsg(`ส่งออกข้อมูลเรียบร้อยแล้ว (${res.rowCount} แถว) ใน Google Sheets!`);
    } catch (err: any) {
      console.error('Export error:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการส่งออกข้อมูลไปยัง Google Sheets');
    } finally {
      setLoading(false);
      setPendingAction(null);
    }
  };

  const handleStartSync = async () => {
    if (!sheetInfo?.spreadsheetId) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      let token = await getAccessToken();
      if (!token) {
        const loginRes = await googleSignIn();
        token = loginRes?.accessToken || null;
      }

      if (!token) {
        throw new Error('ไม่พบสิทธิ์การเข้าถึง Google Sheets กรุณาเข้าสู่ระบบด้วย Google');
      }

      const count = await syncToExistingSpreadsheet(token, sheetInfo.spreadsheetId, eventsToExport);
      setSheetInfo((prev) =>
        prev
          ? {
              ...prev,
              lastSyncedAt: new Date().toISOString(),
            }
          : null
      );
      setSuccessMsg(`อัปเดตข้อมูล ${count} รายการลงใน Google Sheet เดิมสำเร็จ!`);
    } catch (err: any) {
      console.error('Sync error:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการ Sync ข้อมูล');
    } finally {
      setLoading(false);
      setPendingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-blue-950 to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white backdrop-blur-xs">
              <FileSpreadsheet className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Google Sheets Integration</h3>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 text-blue-100 border border-white/20">
                  {QUALITY_DOC_NUMBER}
                </span>
              </div>
              <p className="text-xs text-blue-200">
                สถาบันมะเร็งแห่งชาติ · ส่งออกรายงานและตารางกิจกรรม
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-all text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>{successMsg}</div>
            </div>
          )}

          {/* Sync Stats Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">เลขที่เอกสารคุณภาพ:</span>
              <span className="font-mono font-bold text-blue-950 bg-blue-50/80 px-2.5 py-0.5 rounded-md border border-blue-200">
                {QUALITY_DOC_NUMBER}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">รายการที่จะส่งออก:</span>
              <span className="font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                {eventsToExport.length} กิจกรรม
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">ขอบเขตข้อมูล (Scope):</span>
              <span className="font-semibold text-slate-700">
                {isAdmin ? 'Master Records (ข้อมูลทุกคนในระบบ)' : `เฉพาะของ ${currentUser.name}`}
              </span>
            </div>

            {sheetInfo?.lastSyncedAt && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Sync ล่าสุดเมื่อ:</span>
                <span className="text-slate-600 font-medium">
                  {new Date(sheetInfo.lastSyncedAt).toLocaleString('th-TH', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Connected Sheet Card */}
          {sheetInfo?.spreadsheetUrl && (
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>มีสเปรดชีตที่เชื่อมต่ออยู่แล้ว</span>
                </div>
                <div className="text-[11px] text-blue-800 mt-0.5 truncate">
                  ID: {sheetInfo.spreadsheetId}
                </div>
              </div>

              <a
                href={sheetInfo.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-blue-900 text-white hover:bg-blue-950 rounded-xl text-xs font-bold shadow-xs transition-all"
              >
                <span>เปิดดู Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* User Confirmation Step before destructive overwrite */}
          {pendingAction && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>
                  {pendingAction === 'create'
                    ? 'ยืนยันการสร้างสเปรดชีต Google Sheets ใหม่?'
                    : 'ยืนยันการเขียนทับ/อัปเดตข้อมูลลงในสเปรดชีตเดิม?'}
                </span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                {pendingAction === 'create'
                  ? `ระบบจะสร้าง Google Sheet ใหม่ใน Google Drive ของคุณ พร้อมลงข้อมูลหัวเอกสารคุณภาพ ${QUALITY_DOC_NUMBER} และรายการกิจกรรมจำนวน ${eventsToExport.length} รายการ`
                  : `ข้อมูลใน Google Sheet เดิมจะถูกรีเฟรชให้เป็นข้อมูลล่าสุดพร้อมเลขที่เอกสาร ${QUALITY_DOC_NUMBER} จำนวน ${eventsToExport.length} รายการ`}
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPendingAction(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={pendingAction === 'create' ? handleStartExport : handleStartSync}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-900 text-white hover:bg-blue-950 shadow-xs"
                >
                  ยืนยันดำเนินการ
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!pendingAction && (
            <div className="space-y-2 pt-2">
              <button
                disabled={loading}
                onClick={() => setPendingAction('create')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>
                  {loading ? 'กำลังดำเนินการ...' : `สร้าง Google Sheet ใหม่ [${QUALITY_DOC_NUMBER}]`}
                </span>
              </button>

              {sheetInfo?.spreadsheetId && (
                <button
                  disabled={loading}
                  onClick={() => setPendingAction('sync')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-300 text-blue-900 hover:bg-blue-50 font-semibold text-xs transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Sync อัปเดตข้อมูลไปยัง Google Sheet เดิม</span>
                </button>
              )}
            </div>
          )}

          <div className="text-[11px] text-slate-500 text-center pt-2">
            เอกสารสเปรดชีตจะกำกับด้วยเลขที่เอกสารคุณภาพ <strong className="font-mono text-blue-950">{QUALITY_DOC_NUMBER}</strong> ตามระบบมาตรฐานคุณภาพ สถาบันมะเร็งแห่งชาติ
          </div>
        </div>
      </div>
    </div>
  );
};
