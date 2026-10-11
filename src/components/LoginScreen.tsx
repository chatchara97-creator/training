import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  KeyRound,
  Inbox,
  Copy,
  Check,
  Building,
  Briefcase,
  Sparkles,
  LockKeyhole,
  LogIn
} from 'lucide-react';
import { User, EmailDispatchLog } from '../types';
import {
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  requestPasswordReset,
  getDispatchedEmails,
  googleSignIn,
  ADMIN_EMAIL,
  INITIAL_DEMO_USERS
} from '../services/auth';
import { QUALITY_DOC_NUMBER } from '../services/sheets';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'inbox'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password reset result
  const [resetResult, setResetResult] = useState<{
    email: string;
    newPasswordGenerated: string;
    message: string;
  } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  // Dispatched emails list
  const [emailInbox, setEmailInbox] = useState<EmailDispatchLog[]>([]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const user = await loginWithEmailAndPassword(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      const user = await registerWithEmailAndPassword(name, email, password, department, jobTitle);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'ลงทะเบียนไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const result = await requestPasswordReset(email);
      setResetResult(result);
      setSuccessMsg(result.message);
      setEmailInbox(getDispatchedEmails());
    } catch (err: any) {
      setErrorMsg(err.message || 'ส่งรหัสผ่านใหม่ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        onLoginSuccess(res.appUser);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'การเข้าสู่ระบบด้วย Google ล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setErrorMsg(null);
    setLoading(true);
    try {
      const user = await loginWithEmailAndPassword(fillEmail, fillPass);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8 antialiased">
      {/* Top Bar Branding */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between text-white/80 py-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          <span className="text-xs font-medium tracking-wide">สถาบันมะเร็งแห่งชาติ (National Cancer Institute)</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
          <span className="text-blue-300">เอกสารคุณภาพ:</span>
          <span className="text-white font-bold">{QUALITY_DOC_NUMBER}</span>
        </div>
      </div>

      {/* Main Login Card Container */}
      <div className="max-w-md w-full mx-auto my-auto py-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="px-6 sm:px-8 pt-7 pb-6 bg-gradient-to-r from-slate-950 via-blue-950 to-blue-900 text-white relative">
            <div className="flex items-center justify-between mb-4">
              {/* NCI Logo */}
              <div className="h-11 px-3 rounded-2xl bg-white shadow-md flex items-center justify-center shrink-0">
                <svg
                  className="h-7 w-auto"
                  viewBox="0 0 225 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>NCI National Cancer Institute สถาบันมะเร็งแห่งชาติ</title>
                  <path
                    d="M12 25 C6 31 7 41 11 49 C15 55 22 59 26 59 C21 52 20 42 23 34 C26 29 32 26 38 26 C29 20 18 20 12 25 Z"
                    fill="#E6007E"
                  />
                  <path
                    d="M29 58 C34 57 41 47 46 37 C51 27 51 17 43 15 C35 13 29 19 27 27 C25 36 27 47 29 58 Z"
                    fill="#E6007E"
                  />
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

              {/* Doc number badge */}
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-wider text-blue-300 font-mono">Document No.</span>
                <span className="text-xs font-mono font-bold bg-blue-900/80 px-2 py-0.5 rounded border border-blue-400/30 text-white">
                  {QUALITY_DOC_NUMBER}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  MedTechLab
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 font-medium">
                  Portal Login
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1">
                ระบบบันทึกวันประชุม อบรม สัมมนา (กลุ่มงานเทคนิคการแพทย์)
              </p>
            </div>

            {/* Mandatory login security banner */}
            <div className="mt-4 p-2.5 rounded-xl bg-blue-900/50 border border-blue-400/20 flex items-start gap-2 text-[11px] text-blue-100">
              <LockKeyhole className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <span>
                <strong>ระบบรักษาความปลอดภัย:</strong> บังคับเข้าสู่ระบบใหม่ทุกครั้งที่เข้าใช้งาน ทั้งผู้ใช้งานทั่วไปและผู้ดูแลระบบ (Admin)
              </span>
            </div>
          </div>

          {/* Navigation Mode Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/80 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-blue-950 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white text-blue-950 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ลงทะเบียนใหม่
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('forgot');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'forgot'
                  ? 'bg-white text-blue-950 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ลืมรหัสผ่าน
            </button>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-7 space-y-4">
            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="font-medium">{errorMsg}</div>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="font-medium">{successMsg}</div>
              </div>
            )}

            {/* TAB 1: LOGIN */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    อีเมล (Email)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Chatchara97@gmail.com หรืออีเมลของคุณ"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      รหัสผ่าน (Password)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] font-medium text-blue-700 hover:text-blue-900 transition-colors"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านของคุณ"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'กำลังตรวจสอบและเข้าสู่ระบบ...' : 'เข้าสู่ระบบ (Sign In)'}</span>
                </button>

                {/* Quick 1-Click Login Buttons */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      บัญชีสำหรับทดสอบ (คลิกเข้าใช้งานทันที):
                    </span>
                    <Sparkles className="w-3 h-3 text-blue-600" />
                  </div>
                  <div className="space-y-1.5">
                    {/* Admin 1-Click Login */}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleQuickLogin('Chatchara97@gmail.com', 'password123')}
                      className="w-full p-2.5 rounded-xl bg-blue-50/90 hover:bg-blue-100/80 border border-blue-200/90 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-950 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          👑
                        </div>
                        <div>
                          <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                            <span>พัชรา บุญประดิษฐ์</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-white font-mono">Admin</span>
                          </div>
                          <div className="text-[11px] text-blue-800 font-mono">
                            Chatchara97@gmail.com
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-blue-800 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        เข้าสู่ระบบ <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>

                    {/* User 1-Click Login */}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleQuickLogin('orathai.r@medhospital.org', 'password123')}
                      className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          👤
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>นายแพทย์ อรทัย รุ่งเรือง</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono">User</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            orathai.r@medhospital.org
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        เข้าสู่ระบบ <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white px-2.5 text-slate-400 font-semibold tracking-wider">หรือเข้าใช้งานผ่าน Google</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>เข้าสู่ระบบด้วย Google Account (สิทธิ์ Sheets)</span>
                </button>
              </form>
            )}

            {/* TAB 2: REGISTER */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="เช่น พัชรา บุญประดิษฐ์ หรือ นายสมชาย ใจดี"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    อีเมล (Email) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="เช่น Chatchara97@gmail.com"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                  {email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() && (
                    <p className="text-[10px] text-blue-900 font-bold mt-1 bg-blue-50 p-1.5 rounded-lg border border-blue-200">
                      👑 บัญชี {ADMIN_EMAIL} จะได้รับสิทธิ์ผู้ดูแลระบบ (Admin) โดยอัตโนมัติ
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">กลุ่มงาน/ฝ่าย</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="เช่น เทคนิคการแพทย์"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ตำแหน่ง</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="เช่น นักเทคนิคการแพทย์"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    กำหนดรหัสผ่าน (อย่างน้อย 6 ตัวอักษร) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{loading ? 'กำลังสร้างบัญชี...' : 'ยืนยันการลงทะเบียน (Sign Up)'}</span>
                </button>
              </form>
            )}

            {/* TAB 3: FORGOT PASSWORD */}
            {mode === 'forgot' && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
                  ระบุอีเมลที่ลงทะเบียนไว้ ระบบจะจัดส่งรหัสผ่านชั่วคราวใหม่ให้ทันทีเพื่อใช้เข้าสู่ระบบ
                </div>

                <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      อีเมลที่ลงทะเบียนไว้
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Chatchara97@gmail.com"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{loading ? 'กำลังส่งรหัส...' : 'ส่งรหัสผ่านใหม่เข้าอีเมล'}</span>
                  </button>
                </form>

                {resetResult && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 animate-in fade-in">
                    <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>สร้างรหัสผ่านใหม่สำเร็จสำหรับ {resetResult.email}</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">รหัสผ่านชั่วคราว:</span>
                        <span className="font-mono font-bold text-sm text-blue-950">
                          {resetResult.newPasswordGenerated}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(resetResult.newPasswordGenerated)}
                        className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-medium flex items-center gap-1"
                      >
                        {copiedPass ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPass ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPassword(resetResult.newPasswordGenerated);
                        setMode('login');
                      }}
                      className="text-xs font-bold text-blue-900 hover:underline block pt-1 text-center w-full"
                    >
                      คลิกที่นี่เพื่อนำรหัสนี้ไปเข้าสู่ระบบทันที →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl w-full mx-auto text-center text-xs text-slate-400 py-3">
        <p>
          กลุ่มงานเทคนิคการแพทย์ สถาบันมะเร็งแห่งชาติ (MedTechLab) • National Cancer Institute
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          ระบบบันทึกวันประชุม อบรม สัมมนา | รหัสเอกสารคุณภาพ: <span className="font-mono text-slate-400 font-bold">{QUALITY_DOC_NUMBER}</span>
        </p>
      </div>
    </div>
  );
};
