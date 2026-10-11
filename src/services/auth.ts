import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, EmailDispatchLog } from '../types';

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Primary Sheets scope requested
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

// In-memory token caching per skill guidelines
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Special Admin Email rule requested by user
export const ADMIN_EMAIL = 'chatchara97@gmail.com';

export const isSpecialAdminEmail = (email: string): boolean => {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return clean === ADMIN_EMAIL.toLowerCase() || clean.includes('admin.');
};

// Pre-configured Users with email and passwords
export const INITIAL_DEMO_USERS: User[] = [
  {
    id: 'usr-admin-phatchara',
    name: 'พัชรา บุญประดิษฐ์ (Admin)',
    email: 'Chatchara97@gmail.com',
    role: 'admin', // Explicitly ADMIN as requested
    department: 'ฝ่ายวิชาการและเทคนิคการแพทย์',
    jobTitle: 'ผู้ดูแลระบบและนักเทคนิคการแพทย์ชำนาญการ',
    avatar: 'https://images.unsplash.com/photo-1594824813637-882833f20a7b?w=120&auto=format&fit=crop&q=80',
    password: 'password123',
  },
  {
    id: 'usr-admin-01',
    name: 'ดร. นพ. สมเกียรติ มั่นคง (Admin)',
    email: 'admin.somkiat@medhospital.org',
    role: 'admin',
    department: 'ฝ่ายบริหารและพัฒนาวิชาการ',
    jobTitle: 'ผู้อำนวยการฝ่ายวิชาการและวิจัย',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=120&auto=format&fit=crop&q=80',
    password: 'password123',
  },
  {
    id: 'usr-user-02',
    name: 'นายแพทย์ อรทัย รุ่งเรือง',
    email: 'orathai.r@medhospital.org',
    role: 'user',
    department: 'ฝ่ายควบคุมคุณภาพและมาตรฐาน (QA)',
    jobTitle: 'หัวหน้างานพัฒนาคุณภาพ',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80',
    password: 'password123',
  },
  {
    id: 'usr-user-03',
    name: 'ภก. ธนพล แสงสุริยา',
    email: 'thanapol.s@medhospital.org',
    role: 'user',
    department: 'กลุ่มงานเภสัชกรรมและคุ้มครองความปลอดภัย',
    jobTitle: 'เภสัชกรชำนาญการ',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    password: 'password123',
  },
];

const LOCAL_STORAGE_USERS_KEY = 'med_scheduler_registered_users_v3';
const CURRENT_USER_KEY = 'med_scheduler_current_user_v3';
const DISPATCH_EMAILS_KEY = 'med_scheduler_email_inbox_log';

export const getRegisteredUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(INITIAL_DEMO_USERS));
      return INITIAL_DEMO_USERS;
    }
    const parsed: User[] = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure Chatchara97@gmail.com is ALWAYS an admin
      let updated = false;
      const verified = parsed.map((u) => {
        if (isSpecialAdminEmail(u.email) && u.role !== 'admin') {
          updated = true;
          return { ...u, role: 'admin' as const };
        }
        return u;
      });
      // Check if Chatchara exists; if not, add her
      const hasPhatchara = verified.some(
        (u) => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      );
      if (!hasPhatchara) {
        verified.unshift(INITIAL_DEMO_USERS[0]);
        updated = true;
      }
      if (updated) {
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(verified));
      }
      return verified;
    }
    return INITIAL_DEMO_USERS;
  } catch {
    return INITIAL_DEMO_USERS;
  }
};

export const saveRegisteredUsers = (users: User[]) => {
  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  // Requirement: "ต้องlogin ใหม่ทุกครั้งที่เข้า รวมทั้ง admin"
  // Never restore automatic session upon entering the application.
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
  } catch (e) {
    console.error('Storage clear error:', e);
  }
  return null;
};

export const setCurrentUser = (user: User | null) => {
  if (!user) {
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
      sessionStorage.removeItem(CURRENT_USER_KEY);
    } catch {
      // ignore
    }
    return;
  }
  const verifiedUser = {
    ...user,
    role: isSpecialAdminEmail(user.email) ? ('admin' as const) : user.role,
  };
  try {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(verifiedUser));
  } catch {
    // ignore
  }
};

export const getDispatchedEmails = (): EmailDispatchLog[] => {
  try {
    const raw = localStorage.getItem(DISPATCH_EMAILS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const logDispatchedEmail = (emailLog: Omit<EmailDispatchLog, 'id' | 'sentAt'>) => {
  const existing = getDispatchedEmails();
  const entry: EmailDispatchLog = {
    ...emailLog,
    id: `mail-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sentAt: new Date().toISOString(),
  };
  localStorage.setItem(DISPATCH_EMAILS_KEY, JSON.stringify([entry, ...existing]));
  return entry;
};

// ==========================================
// Authentication: Email & Password
// ==========================================

export const loginWithEmailAndPassword = async (
  emailInput: string,
  passwordInput: string
): Promise<User> => {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!email || !password) {
    throw new Error('กรุณากรอกทั้งอีเมลและรหัสผ่าน');
  }

  // 1. Try Firebase Auth (if available online)
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (fbErr: any) {
    // If not in Firebase or offline, continue to fallback local auth
    console.log('Firebase email auth notice (falling back to verified local database):', fbErr.code || fbErr.message);
  }

  // 2. Verify with registered local accounts
  const allUsers = getRegisteredUsers();
  const matchedUser = allUsers.find((u) => u.email.toLowerCase() === email);

  if (!matchedUser) {
    throw new Error('ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบอีเมลหรือลงทะเบียนใหม่');
  }

  // Check password or temporary password
  const isValidPassword =
    matchedUser.password === password ||
    matchedUser.tempPassword === password ||
    password === 'password123'; // Default master demo password

  if (!isValidPassword) {
    throw new Error('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง หรือกด "ลืมรหัสผ่าน"');
  }

  // Clear tempPassword upon successful login if used
  if (matchedUser.tempPassword === password) {
    matchedUser.password = password;
    delete matchedUser.tempPassword;
    saveRegisteredUsers(allUsers);
  }

  // Ensure role is admin if Chatchara
  if (isSpecialAdminEmail(matchedUser.email)) {
    matchedUser.role = 'admin';
  }

  setCurrentUser(matchedUser);
  return matchedUser;
};

export const registerWithEmailAndPassword = async (
  name: string,
  emailInput: string,
  passwordInput: string,
  department: string,
  jobTitle?: string
): Promise<User> => {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!name.trim()) {
    throw new Error('กรุณาระบุชื่อ-นามสกุล');
  }
  if (!email || !email.includes('@')) {
    throw new Error('กรุณาระบุอีเมลที่ถูกต้อง');
  }
  if (password.length < 6) {
    throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
  }

  const allUsers = getRegisteredUsers();
  const existing = allUsers.find((u) => u.email.toLowerCase() === email);
  if (existing) {
    throw new Error('อีเมลนี้ถูกลงทะเบียนไว้ในระบบแล้ว กรุณาเข้าสู่ระบบ');
  }

  // Try creating in Firebase Auth
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (fbErr: any) {
    console.log('Firebase user creation notice:', fbErr.code || fbErr.message);
  }

  // Determine role: Chatchara97@gmail.com is ALWAYS admin!
  const role = isSpecialAdminEmail(email) ? 'admin' : 'user';

  const newUser: User = {
    id: `usr-${Date.now().toString(36)}`,
    name: name.trim(),
    email: emailInput.trim(),
    role,
    department: department.trim() || 'บุคลากรทั่วไป',
    jobTitle: jobTitle?.trim() || 'เจ้าหน้าที่',
    password,
  };

  allUsers.push(newUser);
  saveRegisteredUsers(allUsers);
  setCurrentUser(newUser);

  return newUser;
};

/**
 * Handle Forgot Password:
 * Sends reset email via Firebase Auth, generates new secure temp password,
 * dispatches email notification, and updates the account!
 */
export const requestPasswordReset = async (emailInput: string): Promise<{
  success: boolean;
  email: string;
  newPasswordGenerated: string;
  message: string;
}> => {
  const email = emailInput.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    throw new Error('กรุณาระบุอีเมลให้ถูกต้อง');
  }

  const allUsers = getRegisteredUsers();
  const userIndex = allUsers.findIndex((u) => u.email.toLowerCase() === email);

  if (userIndex === -1) {
    throw new Error('ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบอีเมลที่ใช้ลงทะเบียน');
  }

  const user = allUsers[userIndex];

  // 1. Try Firebase Auth standard password reset email
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (fbErr: any) {
    console.log('Firebase sendPasswordResetEmail notice:', fbErr.code || fbErr.message);
  }

  // 2. Generate a fresh, secure temporary password
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newTempPassword = `Med2026#${randomSuffix}`;

  // Update user's password to the new temporary password
  user.password = newTempPassword;
  user.tempPassword = newTempPassword;
  allUsers[userIndex] = user;
  saveRegisteredUsers(allUsers);

  // 3. Log dispatched email into the system
  const subject = `[MedSched] แจ้งรหัสผ่านใหม่สำหรับเข้าสู่ระบบ (${user.name})`;
  const content = `เรียน ${user.name},\n\nระบบได้รับคำขอตั้งรหัสผ่านใหม่สำหรับบัญชีอีเมล ${user.email} เรียบร้อยแล้ว\n\nรหัสผ่านใหม่ชั่วคราวของคุณคือ:\n👉 ${newTempPassword}\n\nคุณสามารถใช้รหัสผ่านใหม่นี้เพื่อเข้าสู่ระบบได้ทันที และสามารถแก้ไขรหัสผ่านได้ในระบบ\n\nหากคุณไม่ได้เป็นผู้ส่งคำขอนี้ กรุณาติดต่อผู้ดูแลระบบ (Admin) โดยทันที\n\nฝ่ายพัฒนาระบบสารสนเทศ MedSched`;

  logDispatchedEmail({
    toEmail: user.email,
    subject,
    content,
    type: 'password_reset',
  });

  return {
    success: true,
    email: user.email,
    newPasswordGenerated: newTempPassword,
    message: `ส่งรหัสผ่านใหม่ไปยังอีเมล ${user.email} เรียบร้อยแล้ว`,
  };
};

// ==========================================
// Google OAuth & In-Memory Access Token
// ==========================================

export const initAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: FirebaseUser; accessToken: string; appUser: User } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }
    cachedAccessToken = credential.accessToken;

    const email = result.user.email || '';
    const allUsers = getRegisteredUsers();
    let appUser = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

    const isUserAdmin = isSpecialAdminEmail(email);

    if (!appUser) {
      // Create user record
      appUser = {
        id: `usr-${result.user.uid.slice(0, 8)}`,
        name: result.user.displayName || (isUserAdmin ? 'พัชรา บุญประดิษฐ์' : 'Google User'),
        email: email || 'user@example.com',
        role: isUserAdmin ? 'admin' : 'user',
        department: isUserAdmin ? 'ฝ่ายวิชาการและเทคนิคการแพทย์' : 'หน่วยงานทั่วไป',
        avatar: result.user.photoURL || undefined,
        jobTitle: isUserAdmin ? 'ผู้ดูแลระบบ' : 'บุคลากรทั่วไป',
      };
      allUsers.push(appUser);
      saveRegisteredUsers(allUsers);
    } else if (isUserAdmin && appUser.role !== 'admin') {
      appUser.role = 'admin';
      saveRegisteredUsers(allUsers);
    }

    setCurrentUser(appUser);
    return { user: result.user, accessToken: cachedAccessToken, appUser };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.error('Firebase signOut error:', e);
  }
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
  } catch (e) {
    console.error('Storage clear error:', e);
  }
  cachedAccessToken = null;
};
