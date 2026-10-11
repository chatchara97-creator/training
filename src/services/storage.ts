import { ScheduledEvent, User, FilterState } from '../types';

const EVENTS_STORAGE_KEY = 'med_scheduler_events_v3';

export const INITIAL_EVENTS: ScheduledEvent[] = [
  {
    id: 'evt-001',
    title: 'อบรมเชิงปฏิบัติการ: การตรวจวิเคราะห์ทางโลหิตวิทยาและโมเลกุลขั้นสูง (Molecular Diagnostics)',
    type: 'training',
    category: 'academic',
    format: 'onsite',
    startTime: '2026-10-12T09:00',
    endTime: '2026-10-12T16:30',
    location: 'ห้องประชุมชัยพฤกษ์ 1 อาคารเฉลิมพระเกียรติ ชั้น 7',
    onlineLink: '',
    cmteCredits: 3.5,
    createdBy: 'usr-admin-phatchara', // พัชรา (Admin)
    createdByName: 'พัชรา บุญประดิษฐ์ (Admin)',
    createdByEmail: 'Chatchara97@gmail.com',
    attendeeIds: ['usr-admin-phatchara', 'usr-user-02'],
    attendeeEmails: ['Chatchara97@gmail.com', 'orathai.r@medhospital.org'],
    description: 'การทบทวนเทคนิค Real-time PCR และ Next-Generation Sequencing ในห้องปฏิบัติการ พร้อมกรณีศึกษาผู้ป่วยจริง',
    status: 'approved',
    approvedBy: 'usr-admin-phatchara',
    approvedAt: '2026-10-08T14:20:00Z',
    createdAt: '2026-10-05T10:00:00Z',
    updatedAt: '2026-10-08T14:20:00Z',
  },
  {
    id: 'evt-002',
    title: 'ประชุมคณะกรรมการพัฒนาคุณภาพระบบบริการทางการแพทย์ (HA / ISO 15189 Committee)',
    type: 'meeting',
    category: 'quality',
    format: 'hybrid',
    startTime: '2026-10-14T13:30',
    endTime: '2026-10-14T16:00',
    location: 'ห้องประชุมไพลิน ชั้น 3 อาคารผู้ป่วยนอก',
    onlineLink: 'https://meet.google.com/abc-quality-ha',
    cmteCredits: 1.0,
    createdBy: 'usr-user-02', // นายแพทย์ อรทัย
    createdByName: 'นายแพทย์ อรทัย รุ่งเรือง',
    createdByEmail: 'orathai.r@medhospital.org',
    attendeeIds: ['usr-user-02', 'usr-user-01', 'usr-user-03'],
    attendeeEmails: ['orathai.r@medhospital.org', 'chatchara97@gmail.com', 'thanapol.s@medhospital.org'],
    description: 'ติดตามตัวชี้วัดความคลาดเคลื่อนทางห้องปฏิบัติการ และเตรียมความพร้อมรับการตรวจประเมินรับรองมาตรฐาน HA Re-accreditation',
    status: 'approved',
    approvedBy: 'usr-admin-01',
    approvedAt: '2026-10-09T11:00:00Z',
    createdAt: '2026-10-07T09:15:00Z',
    updatedAt: '2026-10-09T11:00:00Z',
  },
  {
    id: 'evt-003',
    title: 'สัมมนาวิชาการระดับชาติ: นวัตกรรมชีววิทยาศาสตร์และเทคนิคการแพทย์แม่นยำ 2026',
    type: 'seminar',
    category: 'academic',
    format: 'online',
    startTime: '2026-10-16T08:30',
    endTime: '2026-10-17T17:00',
    location: 'Online Webinar (Virtual Hall)',
    onlineLink: 'https://zoom.us/j/98765432101?pwd=medtechseminar',
    cmteCredits: 8.0,
    createdBy: 'usr-admin-phatchara', // พัชรา (Admin)
    createdByName: 'พัชรา บุญประดิษฐ์ (Admin)',
    createdByEmail: 'Chatchara97@gmail.com',
    attendeeIds: ['usr-admin-phatchara'],
    attendeeEmails: ['Chatchara97@gmail.com'],
    description: 'เข้าร่วมรับฟังการบรรยายพิเศษจากผู้ทรงคุณวุฒิต่างประเทศ หัวข้อ AI-assisted Pathology and Precision Diagnostics',
    status: 'pending',
    createdAt: '2026-10-10T14:30:00Z',
    updatedAt: '2026-10-10T14:30:00Z',
  },
  {
    id: 'evt-004',
    title: 'อบรมมาตรฐานความปลอดภัยในห้องปฏิบัติการและซ้อมแผนอัคคีภัยสารเคมี (Biosafety & HazMat)',
    type: 'training',
    category: 'safety',
    format: 'onsite',
    startTime: '2026-10-19T09:00',
    endTime: '2026-10-19T12:00',
    location: 'ลานฝึกซ้อมดับเพลิงและห้องเรียนรวม 2 อาคารเวชศาสตร์',
    onlineLink: '',
    cmteCredits: 2.0,
    createdBy: 'usr-user-03', // ภก. ธนพล
    createdByName: 'ภก. ธนพล แสงสุริยา',
    createdByEmail: 'thanapol.s@medhospital.org',
    attendeeIds: ['usr-user-03', 'usr-user-02'],
    attendeeEmails: ['thanapol.s@medhospital.org', 'orathai.r@medhospital.org'],
    description: 'ทบทวนการจัดการสารเคมีหกรั่วไหล การคัดแยกขยะติดเชื้อ และการใช้อุปกรณ์ป้องกันอันตรายส่วนบุคคล (PPE) ตามเกณฑ์สากล',
    status: 'approved',
    approvedBy: 'usr-admin-01',
    approvedAt: '2026-10-10T09:00:00Z',
    createdAt: '2026-10-08T16:00:00Z',
    updatedAt: '2026-10-10T09:00:00Z',
  },
  {
    id: 'evt-005',
    title: 'ประชุมวางแผนยุทธศาสตร์บริการทางการแพทย์และงบประมาณวิจัย ประจำปีงบประมาณ 2027',
    type: 'meeting',
    category: 'management',
    format: 'onsite',
    startTime: '2026-10-22T10:00',
    endTime: '2026-10-22T15:00',
    location: 'ห้องประชุมบุษราคัม ชั้น 9 อาคารอำนวยการ',
    onlineLink: '',
    cmteCredits: 0,
    createdBy: 'usr-admin-01', // Admin สมเกียรติ
    createdByName: 'ดร. นพ. สมเกียรติ มั่นคง (Admin)',
    createdByEmail: 'admin.somkiat@medhospital.org',
    attendeeIds: ['usr-admin-01', 'usr-user-02', 'usr-user-03'],
    attendeeEmails: ['admin.somkiat@medhospital.org', 'orathai.r@medhospital.org', 'thanapol.s@medhospital.org'],
    description: 'พิจารณาจัดสรรงบประมาณพัฒนาเครื่องมือแพทย์ ทุนอบรมแพทย์และบุคลากรสายวิชาชีพเฉพาะทาง',
    status: 'approved',
    approvedBy: 'usr-admin-01',
    approvedAt: '2026-10-06T08:00:00Z',
    createdAt: '2026-10-06T08:00:00Z',
    updatedAt: '2026-10-06T08:00:00Z',
  },
  {
    id: 'evt-006',
    title: 'ประชุมเชิงปฏิบัติการ: การป้องกันการติดเชื้อในโรงพยาบาล (IC & Patient Safety Goals)',
    type: 'training',
    category: 'safety',
    format: 'hybrid',
    startTime: '2026-10-26T13:00',
    endTime: '2026-10-26T16:30',
    location: 'ห้องประชุมมรกต ชั้น 5',
    onlineLink: 'https://teams.microsoft.com/l/meetup-join/patient-safety',
    cmteCredits: 2.5,
    createdBy: 'usr-user-03', // ภก. ธนพล
    createdByName: 'ภก. ธนพล แสงสุริยา',
    createdByEmail: 'thanapol.s@medhospital.org',
    attendeeIds: ['usr-user-03'],
    attendeeEmails: ['thanapol.s@medhospital.org'],
    description: 'แนวทางปฏิบัติตามเกณฑ์ 2P Safety สำหรับแพทย์ เภสัชกร พยาบาล และนักเทคนิคการแพทย์',
    status: 'pending',
    createdAt: '2026-10-11T09:00:00Z',
    updatedAt: '2026-10-11T09:00:00Z',
  },
];

export const getAllStoredEvents = (): ScheduledEvent[] => {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_EVENTS;
  } catch (e) {
    console.error('Error reading events from storage:', e);
    return INITIAL_EVENTS;
  }
};

export const saveEventsToStorage = (events: ScheduledEvent[]) => {
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
};

/**
 * CORE RBAC DATA PRIVACY FILTER:
 * User Role: sees ONLY events they created OR they are in attendees list.
 * Admin Role: sees ALL events across the entire organization.
 */
export const getVisibleEvents = (currentUser: User, allEvents: ScheduledEvent[]): ScheduledEvent[] => {
  if (currentUser.role === 'admin') {
    return allEvents;
  }

  return allEvents.filter((event) => {
    // 1. Is creator
    const isCreator = event.createdBy === currentUser.id || 
                      event.createdByEmail.toLowerCase() === currentUser.email.toLowerCase();
    
    // 2. Is attendee
    const isAttendee = event.attendeeIds?.includes(currentUser.id) ||
                       event.attendeeEmails?.some(e => e.toLowerCase() === currentUser.email.toLowerCase());

    return isCreator || isAttendee;
  });
};

/**
 * Permission checks
 */
export const canEditEvent = (currentUser: User, event: ScheduledEvent): boolean => {
  if (currentUser.role === 'admin') return true;
  return event.createdBy === currentUser.id || event.createdByEmail.toLowerCase() === currentUser.email.toLowerCase();
};

export const canDeleteEvent = (currentUser: User, event: ScheduledEvent): boolean => {
  if (currentUser.role === 'admin') return true;
  return event.createdBy === currentUser.id || event.createdByEmail.toLowerCase() === currentUser.email.toLowerCase();
};

export const canApproveEvent = (currentUser: User): boolean => {
  return currentUser.role === 'admin';
};

/**
 * Apply filters to list of events
 */
export const filterEvents = (events: ScheduledEvent[], filters: FilterState): ScheduledEvent[] => {
  return events.filter((ev) => {
    // Search query filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchLocation = ev.location?.toLowerCase().includes(q) || false;
      const matchCreator = ev.createdByName.toLowerCase().includes(q);
      const matchDesc = ev.description?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchLocation && !matchCreator && !matchDesc) {
        return false;
      }
    }

    // Type filter
    if (filters.type !== 'all' && ev.type !== filters.type) {
      return false;
    }

    // Category filter
    if (filters.category !== 'all' && ev.category !== filters.category) {
      return false;
    }

    // Format filter
    if (filters.format !== 'all' && ev.format !== filters.format) {
      return false;
    }

    // Status filter
    if (filters.status !== 'all' && ev.status !== filters.status) {
      return false;
    }

    // Admin user filter
    if (filters.userId !== 'all') {
      const matchCreator = ev.createdBy === filters.userId;
      const matchAttendee = ev.attendeeIds?.includes(filters.userId);
      if (!matchCreator && !matchAttendee) {
        return false;
      }
    }

    return true;
  });
};

export const createEvent = (
  currentUser: User,
  data: Omit<ScheduledEvent, 'id' | 'createdBy' | 'createdByName' | 'createdByEmail' | 'createdAt' | 'updatedAt'>
): ScheduledEvent => {
  const allEvents = getAllStoredEvents();
  const now = new Date().toISOString();
  const newEvent: ScheduledEvent = {
    ...data,
    id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    createdBy: currentUser.id,
    createdByName: currentUser.name,
    createdByEmail: currentUser.email,
    createdAt: now,
    updatedAt: now,
  };

  const updatedList = [newEvent, ...allEvents];
  saveEventsToStorage(updatedList);
  return newEvent;
};

export const updateEvent = (
  currentUser: User,
  eventId: string,
  updates: Partial<ScheduledEvent>
): ScheduledEvent | null => {
  const allEvents = getAllStoredEvents();
  const index = allEvents.findIndex((e) => e.id === eventId);
  if (index === -1) return null;

  const existing = allEvents[index];
  if (!canEditEvent(currentUser, existing)) {
    throw new Error('คุณไม่มีสิทธิ์แก้ไขกิจกรรมนี้');
  }

  const updated: ScheduledEvent = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  allEvents[index] = updated;
  saveEventsToStorage(allEvents);
  return updated;
};

export const deleteEvent = (currentUser: User, eventId: string): boolean => {
  const allEvents = getAllStoredEvents();
  const existing = allEvents.find((e) => e.id === eventId);
  if (!existing) return false;

  if (!canDeleteEvent(currentUser, existing)) {
    throw new Error('คุณไม่มีสิทธิ์ลบกิจกรรมนี้');
  }

  const filtered = allEvents.filter((e) => e.id !== eventId);
  saveEventsToStorage(filtered);
  return true;
};

export const setEventApproval = (
  adminUser: User,
  eventId: string,
  newStatus: 'approved' | 'rejected'
): ScheduledEvent | null => {
  if (!canApproveEvent(adminUser)) {
    throw new Error('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถอนุมัติได้');
  }

  return updateEvent(adminUser, eventId, {
    status: newStatus,
    approvedBy: adminUser.id,
    approvedAt: new Date().toISOString(),
  });
};
