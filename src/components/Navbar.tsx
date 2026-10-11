import React, { useState } from 'react';
import {
  Calendar,
  Shield,
  User as UserIcon,
  LogOut,
  FileSpreadsheet,
  Plus,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Users,
  KeyRound,
  LogIn,
  UserPlus,
  Inbox,
  Printer,
  FileCheck
} from 'lucide-react';
import { User } from '../types';
import { INITIAL_DEMO_USERS, logout } from '../services/auth';
import { QUALITY_DOC_NUMBER } from '../services/sheets';

interface NavbarProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  onLogout: () => void;
  onOpenNewEventModal: () => void;
  onOpenSheetsModal: () => void;
  onOpenPrintModal: () => void;
  onOpenAuthModal: (mode: 'login' | 'register' | 'forgot' | 'inbox') => void;
  isSheetsConnected: boolean;
  activeTab: 'calendar' | 'admin' | 'list';
  setActiveTab: (tab: 'calendar' | 'admin' | 'list') => void;
  pendingApprovalsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSelectUser,
  onLogout,
  onOpenNewEventModal,
  onOpenSheetsModal,
  onOpenPrintModal,
  onOpenAuthModal,
  isSheetsConnected,
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    onLogout();
    setShowUserDropdown(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-11 px-3 rounded-2xl bg-white ring-1 ring-slate-200/90 shadow-2xs flex items-center justify-center shrink-0">
              <svg
                className="h-8 w-auto"
                viewBox="0 0 225 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>NCI National Cancer Institute สถาบันมะเร็งแห่งชาติ</title>
                {/* Left pink wing / ribbon loop */}
                <path
                  d="M12 25 C6 31 7 41 11 49 C15 55 22 59 26 59 C21 52 20 42 23 34 C26 29 32 26 38 26 C29 20 18 20 12 25 Z"
                  fill="#E6007E"
                />
                {/* Right pink wing / ribbon loop */}
                <path
                  d="M29 58 C34 57 41 47 46 37 C51 27 51 17 43 15 C35 13 29 19 27 27 C25 36 27 47 29 58 Z"
                  fill="#E6007E"
                />
                {/* NCI Wordmark */}
                <text
                  x="58"
                  y="46"
                  fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  fontWeight="900"
                  fontSize="38"
                  fill="#09090b"
                  letterSpacing="-0.5"
                >
                  NCI
                </text>
                {/* NATIONAL CANCER INSTITUTE 3-line block */}
                <text
                  x="138"
                  y="25"
                  fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  fontWeight="700"
                  fontSize="8.5"
                  fill="#71717a"
                  letterSpacing="1.2"
                >
                  NATIONAL
                </text>
                <text
                  x="138"
                  y="37"
                  fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  fontWeight="700"
                  fontSize="8.5"
                  fill="#71717a"
                  letterSpacing="1.2"
                >
                  CANCER
                </text>
                <text
                  x="138"
                  y="49"
                  fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  fontWeight="700"
                  fontSize="8.5"
                  fill="#71717a"
                  letterSpacing="1.2"
                >
                  INSTITUTE
                </text>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
                  MedTechLab
                </span>
                <span
                  title={`เลขที่เอกสารคุณภาพ: ${QUALITY_DOC_NUMBER}`}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-50 text-blue-900 border border-blue-200/90 shadow-2xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-700"></span>
                  <span>{QUALITY_DOC_NUMBER}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                ระบบบันทึกวันประชุม อบรม สัมมนา
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'calendar'
                  ? 'bg-white text-blue-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-800" />
              <span>ปฏิทินกิจกรรม</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'list'
                  ? 'bg-white text-blue-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              <Users className="w-4 h-4 text-blue-800" />
              <span>รายการตาราง</span>
            </button>

            {/* Admin only tab */}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`relative px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-blue-950 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-blue-950 hover:bg-slate-200/50'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Admin Dashboard</span>
                {pendingApprovalsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 animate-pulse">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* Actions & User Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Print Quality Document Report Button */}
            <button
              onClick={onOpenPrintModal}
              title={`สั่งพิมพ์เอกสารรายงานคุณภาพ (${QUALITY_DOC_NUMBER})`}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all border bg-white hover:bg-blue-50/70 text-slate-700 hover:text-blue-950 border-slate-200 hover:border-blue-300 shadow-2xs"
            >
              <Printer className="w-4 h-4 text-blue-800 shrink-0" />
              <span className="hidden lg:inline font-semibold">พิมพ์เอกสาร</span>
              <span className="hidden xl:inline font-mono font-bold text-[10px] text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                {QUALITY_DOC_NUMBER}
              </span>
            </button>

            {/* Google Sheets Sync Button */}
            <button
              onClick={onOpenSheetsModal}
              title={`เชื่อมต่อและส่งออก Google Sheets [${QUALITY_DOC_NUMBER}]`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                isSheetsConnected
                  ? 'bg-blue-50/70 text-blue-900 border-blue-200 hover:bg-blue-100/60'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className={`w-4 h-4 ${isSheetsConnected ? 'text-blue-700' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Google Sheets</span>
              {isSheetsConnected && <span className="w-2 h-2 rounded-full bg-blue-600" />}
            </button>

            {/* New Event Button */}
            <button
              onClick={onOpenNewEventModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-sm hover:from-blue-950 hover:to-indigo-950 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="font-semibold">เพิ่มกิจกรรม</span>
            </button>

            {/* User Profile & RBAC Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition-all text-left"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-950 flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <div className="hidden lg:block text-left pr-1">
                  <div className="text-xs font-semibold text-slate-800 leading-tight max-w-[140px] truncate">
                    {currentUser.name}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm ${
                        currentUser.role === 'admin'
                          ? 'bg-blue-950 text-white'
                          : 'bg-blue-50 text-blue-900 border border-blue-200'
                      }`}
                    >
                      {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้ใช้ทั่วไป (User)'}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        บัญชีปัจจุบัน (Active Session)
                      </p>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm ${
                          currentUser.role === 'admin'
                            ? 'bg-blue-950 text-white'
                            : 'bg-blue-50 text-blue-900 border border-blue-200'
                        }`}
                      >
                        {currentUser.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mt-1">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{currentUser.department}</p>
                  </div>

                  {/* Auth Actions (Login / Register / Forgot Password) */}
                  <div className="p-2 border-b border-slate-100 space-y-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenAuthModal('login');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-blue-950 flex items-center gap-2 transition-all"
                    >
                      <LogIn className="w-3.5 h-3.5 text-blue-700" />
                      <span>เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenAuthModal('register');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-blue-950 flex items-center gap-2 transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-blue-700" />
                      <span>ลงทะเบียนบัญชีใหม่ (Sign Up)</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenAuthModal('forgot');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-blue-950 flex items-center gap-2 transition-all"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-blue-700" />
                      <span>ลืมรหัสผ่าน? (ส่งรหัสใหม่ทางอีเมล)</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenAuthModal('inbox');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-2 transition-all"
                    >
                      <Inbox className="w-3.5 h-3.5 text-slate-500" />
                      <span>ดูกล่องจดหมายอีเมลที่ระบบจัดส่ง</span>
                    </button>
                  </div>

                  {/* RBAC Persona Switcher */}
                  <div className="px-3 py-2">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center justify-between">
                      <span>สลับบทบาททดสอบ RBAC</span>
                      <Sparkles className="w-3 h-3 text-blue-600" />
                    </p>
                    <div className="space-y-1">
                      {INITIAL_DEMO_USERS.map((demo) => {
                        const isSelected = demo.id === currentUser.id;
                        return (
                          <button
                            key={demo.id}
                            onClick={() => {
                              onSelectUser(demo);
                              setShowUserDropdown(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-blue-50 text-blue-950 font-bold border border-blue-200/80'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {demo.avatar ? (
                                <img
                                  src={demo.avatar}
                                  alt={demo.name}
                                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center text-xs font-bold">
                                  {demo.name.charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0 text-left">
                                <div className="text-xs font-medium truncate leading-tight">
                                  {demo.name}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {demo.jobTitle || demo.department}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                  demo.role === 'admin'
                                    ? 'bg-blue-950 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {demo.role === 'admin' ? 'Admin' : 'User'}
                              </span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-800" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sign out */}
                  <div className="px-3 pt-2 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>ออกจากระบบ (Sign out)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
