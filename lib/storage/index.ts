import { appendAppointment, appendAuditLog, appendBookingLink, appendClient, appendNotificationLog, findAppointmentByProtocol as gsFindByProtocol, googleSheetsConfigured, listAppointments as gsAppointments, listBookingLinks as gsBookingLinks, listClients as gsClients, updateAppointmentStatus as gsUpdateStatus } from '@/lib/integrations/google-sheets';
import { generateId, generateProtocol, insertItem, readJsonCollection, updateItem } from '@/lib/json-db';

export type BookingLinkRecord = any;
export type AppointmentRecord = any;
const now = () => new Date().toISOString();
function useSheets() { return googleSheetsConfigured(); }
export { generateId, generateProtocol };
export async function listBookingLinks(companyId?: string) { const rows = useSheets() ? await gsBookingLinks() : await readJsonCollection<BookingLinkRecord>('booking-links.json'); return companyId ? rows.filter((l:any)=>l.companyId===companyId) : rows; }
export async function getBookingLinkBySlug(slug: string) { return (await listBookingLinks()).find((l:any)=>l.slug===slug && String(l.isActive) !== 'false') ?? null; }
export async function getBookingLinkById(id: string) { return (await listBookingLinks()).find((l:any)=>l.id===id) ?? null; }
export async function createBookingLink(input: any) { const item={id:generateId('link'),isActive:true,createdAt:now(),updatedAt:now(),...input}; return useSheets()?appendBookingLink(item):insertItem('booking-links.json', item); }
export async function updateBookingLink(id: string, patch: any) { if(useSheets()) return { ...(await getBookingLinkById(id)), ...patch, updatedAt: now() }; return updateItem('booking-links.json', id, patch); }
export async function listAppointments(companyId?: string) { const rows = useSheets() ? await gsAppointments() : await readJsonCollection<AppointmentRecord>('appointments.json'); return companyId ? rows.filter((a:any)=>a.companyId===companyId) : rows; }
export async function findAppointmentByProtocol(protocol: string) { return useSheets() ? gsFindByProtocol(protocol) : (await listAppointments()).find((a:any)=>a.protocol===protocol) ?? null; }
export async function createAppointment(input: any) { const item={id:generateId('apt'),protocol:generateProtocol(),status:'scheduled',createdAt:now(),updatedAt:now(),...input}; return useSheets()?appendAppointment(item):insertItem('appointments.json', item); }
export async function updateAppointment(protocolOrId: string, patch: any) { if(useSheets()) return gsUpdateStatus(protocolOrId, patch.status, patch); const rows=await readJsonCollection<any>('appointments.json'); const found=rows.find((a)=>a.id===protocolOrId || a.protocol===protocolOrId); return found ? updateItem('appointments.json', found.id, patch) : null; }
export async function listClients(companyId?: string) { const rows = useSheets() ? await gsClients() : await readJsonCollection<any>('clients.json'); return companyId ? rows.filter((c:any)=>c.companyId===companyId) : rows; }
export async function findClientByPhone(companyId: string, phone: string) { return (await listClients(companyId)).find((c:any)=>c.phone===phone) ?? null; }
export async function createClient(input: any) { const item={id:generateId('client'),createdAt:now(),updatedAt:now(),...input}; return useSheets()?appendClient(item):insertItem('clients.json', item); }
export async function createAuditLog(input: any) { const item={id:generateId('audit'),createdAt:now(),...input,metadata: typeof input.metadata === 'string' ? input.metadata : JSON.stringify(input.metadata??{})}; return useSheets()?appendAuditLog(item):insertItem('audit-logs.json', item); }
export async function createNotificationLog(input: any) { const item={id:generateId('notif'),createdAt:now(),...input,payload: typeof input.payload === 'string' ? input.payload : JSON.stringify(input.payload??{})}; return useSheets()?appendNotificationLog(item):insertItem('notification-logs.json', item); }
export async function listAvailabilityRules(bookingLinkId: string) { return (await readJsonCollection<any>('availability-rules.json')).filter((r)=>r.bookingLinkId===bookingLinkId && r.isActive !== false); }
export async function listAvailabilityExceptions(bookingLinkId: string, date?: string) { return (await readJsonCollection<any>('availability-exceptions.json')).filter((e)=>e.bookingLinkId===bookingLinkId && (!date || e.date===date)); }
export async function listUsers(companyId?: string) { const rows=await readJsonCollection<any>('users.json'); return companyId ? rows.filter((u)=>u.companyId===companyId) : rows; }
export async function findUserByEmail(email: string) { return (await listUsers()).find((u)=>u.email===email) ?? null; }
export async function createUser(input:any) { return insertItem('users.json', {id:generateId('user'),...input}); }
export async function createCompany(input:any) { return insertItem('companies.json', {id:generateId('company'),...input}); }
