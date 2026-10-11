import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Building,
  Briefcase,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  Send,
  KeyRound,
  Inbox,
  Copy,
  Check
} from 'lucide-react';
import { User, EmailDispatchLog } from '../types';
import {
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  requestPasswordReset,
  getDispatchedEmails,
  googleSignIn,
  ADMIN_EMAIL,
} from '../services/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  initialMode?: 'login' | 'register' | 'forgot' | 'inbox';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'inbox'>(initialMode);
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

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
      setResetResult(null);
      if (initialMode === 'inbox') {
        setEmailInbox(getDispatchedEmails());
      }
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const user = await loginWithEmailAndPassword(email, password);
      onAuthSuccess(user);
      onClose();
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
      onAuthSuccess(user);
      onClose();
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
      // Refresh inbox
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
        onAuthSuccess(res.appUser);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'การเข้าสู่ระบบด้วย Google ล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setErrorMsg(null);
  };

  const handleOpenInbox = () => {
    setEmailInbox(getDispatchedEmails());
    setMode('inbox');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-blue-950 to-blue-900 text-white flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white backdrop-blur-xs shadow-xs border border-white/10">
              {mode === 'forgot' ? (
                <KeyRound className="w-5 h-5 text-amber-300" />
              ) : mode === 'inbox' ? (
                <Inbox className="w-5 h-5 text-blue-300" />
              ) : (
                <Shield className="w-5 h-5 text-blue-300" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {mode === 'login'
                  ? 'เข้าสู่ระบบ (Sign In)'
                  : mode === 'register'
                  ? 'ลงทะเบียนบัญชีใหม่ (Sign Up)'
                  : mode === 'forgot'
                  ? 'ขอรับรหัสผ่านใหม่ทางอีเมล'
                  : 'กล่องข้อความอีเมลที่ส่ง (Email Dispatch)'}
              </h3>
              <p className="text-[11px] text-blue-200">
                {mode === 'forgot'
                  ? 'ระบบจะส่งรหัสผ่านใหม่ไปยังอีเมลที่ลงทะเบียนไว้'
                  : 'ระบบบันทึกวันประชุม อบรม สัมมนา (MedTechLab • สถาบันมะเร็งแห่งชาติ)'}
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

        {/* Tab Selector (for login/register) */}
        {mode !== 'forgot' && mode !== 'inbox' && (
          <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
            <button
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
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>{successMsg}</div>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  อีเมล (Email)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Chatchara97@gmail.com หรือ email ของคุณ"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">รหัสผ่าน (Password)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] font-medium text-sky-600 hover:text-sky-800 transition-colors"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="รหัสผ่านของคุณ"
                    className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Fill Demo Badges */}
              <div className="pt-2">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-center">
                  คลิกเพื่อกรอกบัญชีทดสอบทันที:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('Chatchara97@gmail.com', 'password123')}
                    className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-left transition-all"
                  >
                    <div className="text-[11px] font-bold text-purple-900 truncate">
                      👑 พัชรา (Admin)
                    </div>
                    <div className="text-[9px] text-purple-700 truncate">
                      Chatchara97@gmail.com
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('orathai.r@medhospital.org', 'password123')}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-left transition-all"
                  >
                    <div className="text-[11px] font-bold text-emerald-900 truncate">
                      👤 นพ. อรทัย (User)
                    </div>
                    <div className="text-[9px] text-emerald-700 truncate">
                      orathai.r@medhospital.org
                    </div>
                  </button>
                </div>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-2 text-slate-400 font-semibold">หรือ</span>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>เข้าสู่ระบบด้วย Google Account</span>
              </button>
            </form>
          )}

          {/* MODE 2: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
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
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
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
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                {email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() && (
                  <p className="text-[10px] text-purple-700 font-bold mt-1">
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
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ตำแหน่ง</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="เช่น นักเทคนิคการแพทย์"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ตั้งรหัสผ่าน (อย่างน้อย 6 ตัวอักษร) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="รหัสผ่านของคุณ"
                    className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียนและเข้าสู่ระบบ'}
              </button>
            </form>
          )}

          {/* MODE 3: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600 bg-sky-50 p-3.5 rounded-2xl border border-sky-100 leading-relaxed">
                <p className="font-semibold text-sky-900 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-sky-600" />
                  <span>ระบบส่งรหัสผ่านใหม่ทางอีเมล</span>
                </p>
                กรุณาระบุอีเมลที่คุณใช้ลงทะเบียน ระบบจะทำการสร้างรหัสผ่านใหม่ที่ปลอดภัยและส่งตรงไปยังกล่องจดหมายของอีเมลดังกล่าวทันที
              </div>

              {!resetResult ? (
                <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      อีเมลที่ลงทะเบียนไว้ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Chatchara97@gmail.com หรืออีเมลของคุณ"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{loading ? 'กำลังจัดส่ง...' : 'ส่งรหัสผ่านใหม่ไปยังอีเมล'}</span>
                  </button>
                </form>
              ) : (
                /* Dispatched Email Success Details Card */
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>จัดส่งรหัสผ่านใหม่ทางอีเมลสำเร็จ!</span>
                    </div>
                    <p className="text-xs text-emerald-800">
                      ระบบได้ส่งรหัสผ่านใหม่ไปยัง <strong>{resetResult.email}</strong> เรียบร้อยแล้ว
                    </p>

                    {/* Preview of the Generated Temporary Password for convenience */}
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs mt-2">
                      <div className="text-[10px] text-slate-400 font-semibold mb-1">
                        รหัสผ่านใหม่ที่ถูกจัดส่ง (New Password):
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-sm font-extrabold text-indigo-900 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                          {resetResult.newPasswordGenerated}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(resetResult.newPasswordGenerated)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-all"
                        >
                          {copiedPass ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedPass ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* One-click login with the new password */}
                  <button
                    type="button"
                    onClick={() => {
                      setPassword(resetResult.newPasswordGenerated);
                      setMode('login');
                      setResetResult(null);
                    }}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>นำรหัสผ่านนี้ไปเข้าสู่ระบบทันที</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setResetResult(null);
                  }}
                  className="text-slate-500 hover:text-slate-800 font-medium"
                >
                  ← กลับไปหน้าเข้าสู่ระบบ
                </button>

                <button
                  type="button"
                  onClick={handleOpenInbox}
                  className="text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>ดูกล่องจดหมายที่จัดส่ง</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE 4: DISPATCHED EMAIL INBOX */}
          {mode === 'inbox' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">
                  ประวัติอีเมลที่ระบบจัดส่ง ({emailInbox.length} ฉบับ)
                </h4>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-sky-600 hover:text-sky-800 font-semibold"
                >
                  ← กลับหน้าเข้าสู่ระบบ
                </button>
              </div>

              {emailInbox.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  ยังไม่มีประวัติการจัดส่งอีเมล
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {emailInbox.map((mail) => (
                    <div
                      key={mail.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>ถึง: <strong className="text-slate-700">{mail.toEmail}</strong></span>
                        <span>{new Date(mail.sentAt).toLocaleTimeString('th-TH')}</span>
                      </div>
                      <div className="font-bold text-slate-800">{mail.subject}</div>
                      <div className="p-2 rounded-lg bg-white border border-slate-100 text-[11px] text-slate-600 whitespace-pre-line font-mono">
                        {mail.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
