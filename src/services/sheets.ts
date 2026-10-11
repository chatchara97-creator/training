import { ScheduledEvent } from '../types';

export const QUALITY_DOC_NUMBER = 'FM-ACA-MT-08023-01';

export interface ExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  rowCount: number;
}

const SHEETS_INFO_KEY = 'med_scheduler_sheet_sync_info_v2';

export const getSavedSheetInfo = (): { spreadsheetId: string; spreadsheetUrl: string; lastSyncedAt?: string } | null => {
  try {
    const raw = localStorage.getItem(SHEETS_INFO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveSheetInfo = (info: { spreadsheetId: string; spreadsheetUrl: string; lastSyncedAt?: string }) => {
  localStorage.setItem(SHEETS_INFO_KEY, JSON.stringify(info));
};

const TYPE_TRANSLATIONS: Record<string, string> = {
  meeting: 'ประชุม (Meeting)',
  training: 'อบรม (Training)',
  seminar: 'สัมมนา (Seminar)',
};

const CATEGORY_TRANSLATIONS: Record<string, string> = {
  academic: 'ด้านวิชาการ (Academic)',
  quality: 'ด้านคุณภาพ (Quality)',
  safety: 'ด้านความปลอดภัย (Safety)',
  management: 'ด้านบริหาร/ทั่วไป (Management)',
};

const FORMAT_TRANSLATIONS: Record<string, string> = {
  online: 'ออนไลน์ (Online)',
  onsite: 'ออนไซต์ (On-site)',
  hybrid: 'ไฮบริด (Hybrid)',
};

const STATUS_TRANSLATIONS: Record<string, string> = {
  pending: 'รออนุมัติ (Pending)',
  approved: 'อนุมัติแล้ว (Approved)',
  rejected: 'ไม่อนุมัติ (Rejected)',
  completed: 'เสร็จสิ้น (Completed)',
};

/**
 * Creates a brand new Google Spreadsheet populated with events data and official quality doc header
 */
export const createAndPopulateSpreadsheet = async (
  accessToken: string,
  title: string,
  events: ScheduledEvent[]
): Promise<ExportResult> => {
  const exportTimestamp = new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });

  // 1. Create Spreadsheet with quality doc number in title
  const spreadsheetTitle = title
    ? `${title} [${QUALITY_DOC_NUMBER}]`
    : `[${QUALITY_DOC_NUMBER}] บันทึกวันประชุม อบรม สัมมนา สถาบันมะเร็งแห่งชาติ (${new Date().toLocaleDateString('th-TH')})`;

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: spreadsheetTitle,
      },
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || `สร้าง Google Sheet ไม่สำเร็จ (${createRes.status})`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // 2. Prepare Rows Data with Quality Document Header Block
  const headerBlock = [
    [
      'สถาบันมะเร็งแห่งชาติ กรมการแพทย์ กระทรวงสาธารณสุข (National Cancer Institute Thailand)',
      '', '', '', '', '', '', '', '', '', '', '', '', ''
    ],
    [
      'แบบบันทึกวันประชุม อบรม สัมมนา และคะแนนการศึกษาต่อเนื่อง (CMTE Report)',
      '', '', '', '', '', '', '', '', '', '', '', '', ''
    ],
    [
      `เลขที่เอกสารคุณภาพ: ${QUALITY_DOC_NUMBER}`,
      '', '', '',
      `วันที่ส่งออกข้อมูล: ${exportTimestamp}`,
      '', '', '', '', '', '', '', '', ''
    ],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', ''] // Empty separator row
  ];

  const columnHeaders = [
    'รหัสกิจกรรม (Event ID)',
    'ชื่อเรื่องการประชุม/อบรม/สัมมนา',
    'ประเภทกิจกรรม',
    'ด้านงาน (Category)',
    'รูปแบบการจัด',
    'วัน-เวลาเริ่ม',
    'วัน-เวลาสิ้นสุด',
    'สถานที่ / ลิงก์ออนไลน์',
    'คะแนน CMTE',
    'ผู้บันทึก/ผู้สร้าง',
    'อีเมลผู้สร้าง',
    'สถานะการอนุมัติ',
    'เลขที่เอกสารคุณภาพ',
    'บันทึกเพิ่มเติม/วาระการประชุม',
  ];

  const rows = events.map((ev) => [
    ev.id,
    ev.title,
    TYPE_TRANSLATIONS[ev.type] || ev.type,
    CATEGORY_TRANSLATIONS[ev.category] || ev.category,
    FORMAT_TRANSLATIONS[ev.format] || ev.format,
    new Date(ev.startTime).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
    new Date(ev.endTime).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
    ev.format === 'online' ? (ev.onlineLink || '-') : (ev.location || '-'),
    ev.cmteCredits || 0,
    ev.createdByName,
    ev.createdByEmail,
    STATUS_TRANSLATIONS[ev.status] || ev.status,
    QUALITY_DOC_NUMBER,
    ev.description || '',
  ]);

  const values = [...headerBlock, columnHeaders, ...rows];

  // 3. Append / Update values to Sheet1!A1
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values,
      }),
    }
  );

  if (!updateRes.ok) {
    const errData = await updateRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || `บันทึกข้อมูลลง Google Sheet ไม่สำเร็จ (${updateRes.status})`);
  }

  // 4. Batch styling: style title, quality doc info, and column headers
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          // Title row 1 (Royal Navy)
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.05, green: 0.14, blue: 0.28 }, // Royal Navy
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 13 },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
          // Subtitle row 2
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 1,
                endRowIndex: 2,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.05, green: 0.14, blue: 0.28 },
                  textFormat: { bold: true, foregroundColor: { red: 0.9, green: 0.95, blue: 1 }, fontSize: 11 },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
          // Quality doc number row 3 (Soft ice blue)
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 2,
                endRowIndex: 3,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.9, green: 0.94, blue: 0.98 },
                  textFormat: { bold: true, foregroundColor: { red: 0.05, green: 0.14, blue: 0.28 }, fontSize: 10 },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
          // Column Headers Row 5 (index 4) (Rich Navy)
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 4,
                endRowIndex: 5,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.1, green: 0.24, blue: 0.45 },
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 10 },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
          // Freeze header rows
          {
            updateSheetProperties: {
              properties: {
                sheetId: 0,
                gridProperties: {
                  frozenRowCount: 5,
                },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
          // Auto resize columns
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 14,
              },
            },
          },
        ],
      }),
    });
  } catch (err) {
    console.warn('Formatting batch update optional step failed gracefully:', err);
  }

  saveSheetInfo({
    spreadsheetId,
    spreadsheetUrl,
    lastSyncedAt: new Date().toISOString(),
  });

  return {
    spreadsheetId,
    spreadsheetUrl,
    rowCount: events.length,
  };
};

/**
 * Updates an existing Google Sheet with the latest event records and quality doc header
 */
export const syncToExistingSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string,
  events: ScheduledEvent[]
): Promise<number> => {
  const exportTimestamp = new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });

  const headerBlock = [
    [
      'สถาบันมะเร็งแห่งชาติ กรมการแพทย์ กระทรวงสาธารณสุข (National Cancer Institute Thailand)',
      '', '', '', '', '', '', '', '', '', '', '', '', ''
    ],
    [
      'แบบบันทึกวันประชุม อบรม สัมมนา และคะแนนการศึกษาต่อเนื่อง (CMTE Report)',
      '', '', '', '', '', '', '', '', '', '', '', '', ''
    ],
    [
      `เลขที่เอกสารคุณภาพ: ${QUALITY_DOC_NUMBER}`,
      '', '', '',
      `วันที่ Sync ข้อมูล: ${exportTimestamp}`,
      '', '', '', '', '', '', '', '', ''
    ],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '']
  ];

  const columnHeaders = [
    'รหัสกิจกรรม (Event ID)',
    'ชื่อเรื่องการประชุม/อบรม/สัมมนา',
    'ประเภทกิจกรรม',
    'ด้านงาน (Category)',
    'รูปแบบการจัด',
    'วัน-เวลาเริ่ม',
    'วัน-เวลาสิ้นสุด',
    'สถานที่ / ลิงก์ออนไลน์',
    'คะแนน CMTE',
    'ผู้บันทึก/ผู้สร้าง',
    'อีเมลผู้สร้าง',
    'สถานะการอนุมัติ',
    'เลขที่เอกสารคุณภาพ',
    'บันทึกเพิ่มเติม/วาระการประชุม',
  ];

  const rows = events.map((ev) => [
    ev.id,
    ev.title,
    TYPE_TRANSLATIONS[ev.type] || ev.type,
    CATEGORY_TRANSLATIONS[ev.category] || ev.category,
    FORMAT_TRANSLATIONS[ev.format] || ev.format,
    new Date(ev.startTime).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
    new Date(ev.endTime).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
    ev.format === 'online' ? (ev.onlineLink || '-') : (ev.location || '-'),
    ev.cmteCredits || 0,
    ev.createdByName,
    ev.createdByEmail,
    STATUS_TRANSLATIONS[ev.status] || ev.status,
    QUALITY_DOC_NUMBER,
    ev.description || '',
  ]);

  const values = [...headerBlock, columnHeaders, ...rows];

  // Clear existing sheet contents first to avoid stale rows
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:N1000:clear`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!updateRes.ok) {
    const errData = await updateRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Sync ข้อมูลไม่สำเร็จ (${updateRes.status})`);
  }

  saveSheetInfo({
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    lastSyncedAt: new Date().toISOString(),
  });

  return events.length;
};
