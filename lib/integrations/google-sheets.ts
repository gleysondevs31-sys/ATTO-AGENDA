import 'server-only';
import { SignJWT, importPKCS8 } from 'jose';
import { generateId } from '@/lib/json-db';

export const googleSheetsConfigError = 'Google Sheets não configurado. Configure GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SHEETS_CLIENT_EMAIL e GOOGLE_SHEETS_PRIVATE_KEY na Vercel.';

const sheets = ['Companies', 'Users', 'BookingLinks', 'AvailabilityRules', 'AvailabilityExceptions', 'Appointments', 'Clients', 'AuditLogs', 'NotificationLogs'] as const;

type SheetName = (typeof sheets)[number];

const headers: Record<SheetName, string[]> = {
  Companies: ['id', 'name', 'slug', 'logoUrl', 'bannerUrl', 'primaryColor', 'secondaryColor', 'buttonColor', 'backgroundColor', 'textColor', 'theme', 'createdAt', 'updatedAt'],
  Users: ['id', 'companyId', 'name', 'email', 'passwordHash', 'role', 'title', 'avatarUrl', 'createdAt', 'updatedAt'],
  BookingLinks: ['id', 'companyId', 'userId', 'slug', 'name', 'title', 'description', 'address', 'duration', 'durationMinutes', 'dailyLimit', 'availableDays', 'availableSlots', 'isActive', 'logoUrl', 'bannerUrl', 'consultantPhotoUrl', 'primaryColor', 'buttonColor', 'backgroundColor', 'textColor', 'welcomeText', 'confirmationText', 'createdAt', 'updatedAt'],
  AvailabilityRules: ['id', 'companyId', 'userId', 'bookingLinkId', 'weekday', 'startTime', 'endTime', 'isActive', 'createdAt', 'updatedAt'],
  AvailabilityExceptions: ['id', 'companyId', 'userId', 'bookingLinkId', 'date', 'startTime', 'endTime', 'type', 'reason', 'createdAt', 'updatedAt'],
  Appointments: ['id', 'protocol', 'companyId', 'bookingLinkId', 'consultantId', 'clientId', 'clientName', 'clientPhone', 'clientEmail', 'clientCpf', 'date', 'startTime', 'endTime', 'status', 'address', 'source', 'utmSource', 'utmMedium', 'utmCampaign', 'notes', 'createdAt', 'updatedAt'],
  Clients: ['id', 'companyId', 'name', 'phone', 'email', 'cpf', 'createdAt', 'updatedAt'],
  AuditLogs: ['id', 'companyId', 'userId', 'entityType', 'entityId', 'action', 'metadata', 'createdAt'],
  NotificationLogs: ['id', 'companyId', 'appointmentId', 'channel', 'type', 'status', 'payload', 'error', 'createdAt', 'sentAt'],
};

function configured() {
  return Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID && process.env.GOOGLE_SHEETS_CLIENT_EMAIL && process.env.GOOGLE_SHEETS_PRIVATE_KEY);
}

async function token() {
  if (!configured()) throw new Error(googleSheetsConfigError);
  const email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL!;
  const key = process.env.GOOGLE_SHEETS_PRIVATE_KEY!.replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);
  const privateKey = await importPKCS8(key, 'RS256');
  const assertion = await new SignJWT({ scope: 'https://www.googleapis.com/auth/spreadsheets' })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(email)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey);
  const res = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }) });
  if (!res.ok) throw new Error('Falha ao autenticar Google Sheets. Confira a Service Account e a private key.');
  return (await res.json()).access_token as string;
}

async function request(path: string, init?: RequestInit) {
  if (!configured()) throw new Error(googleSheetsConfigError);
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_SPREADSHEET_ID}${path}`, { ...init, headers: { authorization: `Bearer ${await token()}`, 'content-type': 'application/json', ...(init?.headers ?? {}) }, cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function encodeCell(value: unknown) {
  if (value == null) return '';
  if (Array.isArray(value) || typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function decodeCell(value: string) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if ((value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}'))) {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
}

export async function ensureSheetHeaders() {
  if (!configured()) throw new Error(googleSheetsConfigError);
  const meta = await request('');
  const existing = new Set((meta.sheets ?? []).map((sheet: any) => sheet.properties.title));
  for (const sheet of sheets) {
    if (!existing.has(sheet)) await request(':batchUpdate', { method: 'POST', body: JSON.stringify({ requests: [{ addSheet: { properties: { title: sheet } } }] }) });
    await request(`/values/${sheet}!A1:Z1?valueInputOption=RAW`, { method: 'PUT', body: JSON.stringify({ values: [headers[sheet]] }) });
  }
}

async function rows(sheet: SheetName) {
  await ensureSheetHeaders();
  const data = await request(`/values/${sheet}!A:Z`);
  const [head = headers[sheet], ...body] = data.values ?? [headers[sheet]];
  return body.map((row: string[]) => Object.fromEntries(head.map((key: string, index: number) => [key, decodeCell(row[index] ?? '')])));
}

async function append(sheet: SheetName, item: Record<string, unknown>) {
  await ensureSheetHeaders();
  const row = headers[sheet].map((header) => encodeCell(item[header]));
  await request(`/values/${sheet}!A:Z:append?valueInputOption=RAW`, { method: 'POST', body: JSON.stringify({ values: [row] }) });
  return item;
}

async function updateRow(sheet: SheetName, idOrProtocol: string, patch: Record<string, unknown>, matcher: (row: any) => boolean = (row) => row.id === idOrProtocol) {
  const all = await rows(sheet);
  const index = all.findIndex(matcher);
  if (index < 0) return null;
  const next = { ...all[index], ...patch, updatedAt: new Date().toISOString() };
  await request(`/values/${sheet}!A${index + 2}:Z${index + 2}?valueInputOption=RAW`, { method: 'PUT', body: JSON.stringify({ values: [headers[sheet].map((header) => encodeCell((next as any)[header]))] }) });
  return next;
}

export const googleSheetsConfigured = configured;
export { headers as googleSheetHeaders };
export async function listSheet(sheet: SheetName) { return rows(sheet); }
export async function appendSheet(sheet: SheetName, item: Record<string, unknown>, prefix: string) { return append(sheet, { id: item.id ?? generateId(prefix), ...item }); }
export async function updateSheet(sheet: SheetName, id: string, patch: Record<string, unknown>) { return updateRow(sheet, id, patch); }
export async function listAppointments() { return rows('Appointments'); }
export async function appendAppointment(item: Record<string, unknown>) { return appendSheet('Appointments', item, 'apt'); }
export async function findAppointmentByProtocol(protocol: string) { return (await listAppointments()).find((item: any) => item.protocol === protocol) ?? null; }
export async function updateAppointmentStatus(idOrProtocol: string, status: string, patch: Record<string, unknown> = {}) { return updateRow('Appointments', idOrProtocol, { ...patch, status }, (row) => row.id === idOrProtocol || row.protocol === idOrProtocol); }
