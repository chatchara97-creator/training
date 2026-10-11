export type UserRole = 'admin' | 'user';

export type EventType = 'meeting' | 'training' | 'seminar';

export type EventCategory = 'academic' | 'quality' | 'safety' | 'management';

export type EventFormat = 'online' | 'onsite' | 'hybrid';

export type EventStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  jobTitle?: string;
  password?: string; // Stored password hash / password for login
  resetToken?: string;
  tempPassword?: string;
}

export interface EmailDispatchLog {
  id: string;
  toEmail: string;
  subject: string;
  content: string;
  sentAt: string;
  type: 'password_reset' | 'event_notification';
}

export interface ScheduledEvent {
  id: string;
  title: string;
  type: EventType; // ประชุม / อบรม / สัมมนา
  category: EventCategory; // วิชาการ / คุณภาพ / ความปลอดภัย / บริหาร
  format: EventFormat; // online / onsite / hybrid
  startTime: string; // ISO string YYYY-MM-DDTHH:mm
  endTime: string; // ISO string YYYY-MM-DDTHH:mm
  location?: string; // สถานที่ on-site
  onlineLink?: string; // ลิงก์ออนไลน์ เช่น Zoom, Teams, Google Meet
  cmteCredits: number; // คะแนน CMTE (Continuing Medical Technology Education)
  createdBy: string; // User ID
  createdByName: string; // Creator display name
  createdByEmail: string;
  attendeeIds: string[]; // User IDs of participants
  attendeeEmails: string[]; // Email list
  description?: string;
  status: EventStatus; // รออนุมัติ / อนุมัติแล้ว / ไม่อนุมัติ / เสร็จสิ้น
  approvedBy?: string; // Admin User ID who approved
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  searchQuery: string;
  type: EventType | 'all';
  category: EventCategory | 'all';
  format: EventFormat | 'all';
  status: EventStatus | 'all';
  userId: string | 'all'; // For Admin: filter by user
  month: number; // 0-11
  year: number; // e.g. 2026
}

export interface GoogleSheetSyncInfo {
  spreadsheetId: string;
  spreadsheetUrl: string;
  lastSyncedAt?: string;
  syncedEventCount?: number;
}
