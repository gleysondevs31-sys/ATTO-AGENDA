import { appendAppointment, appendSheet, findAppointmentByProtocol as gsFindByProtocol, googleSheetsConfigError, googleSheetsConfigured, listAppointments as gsAppointments, listSheet, updateAppointmentStatus as gsUpdateStatus, updateSheet } from '@/lib/integrations/google-sheets';
import { generateId, generateProtocol, insertItem, readJsonCollection, updateItem } from '@/lib/json-db';

export type StorageMode = 'google-sheets' | 'json-local';
export type BookingLinkRecord = Record<string, any>;
export type AppointmentRecord = Record<string, any>;

const now = () => new Date().toISOString();
const jsonAllowed = () => process.env.NODE_ENV !== 'production';

export { generateId, generateProtocol };

export function getStorageMode(): StorageMode {
  if (googleSheetsConfigured()) return 'google-sheets';
  if (jsonAllowed()) return 'json-local';
  throw new Error(googleSheetsConfigError);
}

function canUseJson() {
  return getStorageMode() === 'json-local';
}

async function collection<T>(sheet: Parameters<typeof listSheet>[0], fileName: string): Promise<T[]> {
  return getStorageMode() === 'google-sheets' ? (await listSheet(sheet)) as T[] : readJsonCollection<T>(fileName);
}

async function insert<T extends Record<string, any>>(sheet: Parameters<typeof appendSheet>[0], fileName: string, prefix: string, item: T) {
  const next = { id: item.id ?? generateId(prefix), createdAt: item.createdAt ?? now(), updatedAt: item.updatedAt ?? now(), ...item };
  return canUseJson() ? insertItem(fileName, next) : appendSheet(sheet, next, prefix);
}

async function update<T extends Record<string, any>>(sheet: Parameters<typeof updateSheet>[0], fileName: string, id: string, patch: Partial<T>) {
  return canUseJson() ? updateItem(fileName, id, patch) : updateSheet(sheet, id, patch as Record<string, unknown>);
}

export async function listCompanies() { return collection<any>('Companies', 'companies.json'); }
export async function createCompany(input: any) { return insert('Companies', 'companies.json', 'company', input); }
export async function listUsers(companyId?: string) { const rows = await collection<any>('Users', 'users.json'); return companyId ? rows.filter((row) => row.companyId === companyId) : rows; }
export async function findUserByEmail(email: string) { return (await listUsers()).find((user) => String(user.email).toLowerCase() === email.toLowerCase()) ?? null; }
export async function createUser(input: any) { return insert('Users', 'users.json', 'user', input); }
export async function listBookingLinks(companyId?: string) { const rows = await collection<BookingLinkRecord>('BookingLinks', 'booking-links.json'); return companyId ? rows.filter((link) => link.companyId === companyId) : rows; }
export async function getBookingLinkBySlug(slug: string) { return (await listBookingLinks()).find((link) => link.slug === slug && String(link.isActive) !== 'false') ?? null; }
export async function getBookingLinkById(id: string) { return (await listBookingLinks()).find((link) => link.id === id) ?? null; }
export async function createBookingLink(input: any) { return insert('BookingLinks', 'booking-links.json', 'link', { isActive: true, ...input }); }
export async function updateBookingLink(id: string, patch: any) { return update('BookingLinks', 'booking-links.json', id, patch); }
export async function listAvailabilityRules(bookingLinkId?: string) { const rows = await collection<any>('AvailabilityRules', 'availability-rules.json'); return rows.filter((rule) => (!bookingLinkId || rule.bookingLinkId === bookingLinkId) && rule.isActive !== false && String(rule.isActive) !== 'false'); }
export async function listAvailabilityExceptions(bookingLinkId?: string, date?: string) { const rows = await collection<any>('AvailabilityExceptions', 'availability-exceptions.json'); return rows.filter((exception) => (!bookingLinkId || exception.bookingLinkId === bookingLinkId) && (!date || exception.date === date)); }
export async function createAvailabilityRule(input: any) { return insert('AvailabilityRules', 'availability-rules.json', 'rule', input); }
export async function createAvailabilityException(input: any) { return insert('AvailabilityExceptions', 'availability-exceptions.json', 'exception', input); }
export async function listAppointments(companyId?: string) { const rows = getStorageMode() === 'google-sheets' ? await gsAppointments() : await readJsonCollection<AppointmentRecord>('appointments.json'); return companyId ? rows.filter((appointment: any) => appointment.companyId === companyId) : rows; }
export async function findAppointmentByProtocol(protocol: string) { return getStorageMode() === 'google-sheets' ? gsFindByProtocol(protocol) : (await listAppointments()).find((appointment: any) => appointment.protocol === protocol) ?? null; }
export async function createAppointment(input: any) { const item = { id: generateId('apt'), protocol: generateProtocol(), status: 'scheduled', createdAt: now(), updatedAt: now(), ...input }; return getStorageMode() === 'google-sheets' ? appendAppointment(item) : insertItem('appointments.json', item); }
export async function updateAppointment(protocolOrId: string, patch: any) { if (getStorageMode() === 'google-sheets') return gsUpdateStatus(protocolOrId, patch.status, patch); const rows = await readJsonCollection<any>('appointments.json'); const found = rows.find((appointment) => appointment.id === protocolOrId || appointment.protocol === protocolOrId); return found ? updateItem('appointments.json', found.id, patch) : null; }
export async function listClients(companyId?: string) { const rows = await collection<any>('Clients', 'clients.json'); return companyId ? rows.filter((client) => client.companyId === companyId) : rows; }
export async function findClientByPhone(companyId: string, phone: string) { return (await listClients(companyId)).find((client) => client.phone === phone) ?? null; }
export async function createClient(input: any) { return insert('Clients', 'clients.json', 'client', input); }
export async function createAuditLog(input: any) { return insert('AuditLogs', 'audit-logs.json', 'audit', { ...input, metadata: typeof input.metadata === 'string' ? input.metadata : JSON.stringify(input.metadata ?? {}) }); }
export async function createNotificationLog(input: any) { return insert('NotificationLogs', 'notification-logs.json', 'notif', { ...input, payload: typeof input.payload === 'string' ? input.payload : JSON.stringify(input.payload ?? {}) }); }
