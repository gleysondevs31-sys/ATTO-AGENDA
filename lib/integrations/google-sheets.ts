import jwt from 'jsonwebtoken';
import { generateId } from '@/lib/json-db';

const sheets = ['Appointments','Clients','BookingLinks','AuditLogs','NotificationLogs'] as const;
const headers: Record<(typeof sheets)[number], string[]> = {
  Appointments: ['id','protocol','companyId','bookingLinkId','consultantId','clientId','clientName','clientPhone','clientEmail','clientCpf','date','startTime','endTime','status','address','source','utmSource','utmMedium','utmCampaign','notes','createdAt','updatedAt'],
  Clients: ['id','companyId','name','phone','email','cpf','createdAt','updatedAt'],
  BookingLinks: ['id','companyId','userId','slug','title','description','address','durationMinutes','dailyLimit','isActive','logoUrl','bannerUrl','consultantPhotoUrl','primaryColor','buttonColor','backgroundColor','textColor','welcomeText','confirmationText','createdAt','updatedAt'],
  AuditLogs: ['id','companyId','userId','entityType','entityId','action','metadata','createdAt'],
  NotificationLogs: ['id','companyId','appointmentId','channel','type','status','payload','error','createdAt','sentAt'],
};
function configured() { return Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID && process.env.GOOGLE_SHEETS_CLIENT_EMAIL && process.env.GOOGLE_SHEETS_PRIVATE_KEY); }
async function token() { const email=process.env.GOOGLE_SHEETS_CLIENT_EMAIL!; const key=process.env.GOOGLE_SHEETS_PRIVATE_KEY!.replace(/\\n/g,'\n'); const now=Math.floor(Date.now()/1000); const assertion=jwt.sign({iss:email,scope:'https://www.googleapis.com/auth/spreadsheets',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600},key,{algorithm:'RS256'}); const res=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion})}); if(!res.ok) throw new Error('Falha ao autenticar Google Sheets.'); return (await res.json()).access_token as string; }
async function request(path: string, init?: RequestInit) { if(!configured()) throw new Error('Google Sheets não configurado.'); const res=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_SPREADSHEET_ID}${path}`,{...init,headers:{authorization:`Bearer ${await token()}`,'content-type':'application/json',...(init?.headers??{})}}); if(!res.ok) throw new Error(await res.text()); return res.json(); }
export async function ensureSheetHeaders() { if(!configured()) return; const meta=await request(''); const existing=new Set((meta.sheets??[]).map((s:any)=>s.properties.title)); for(const sheet of sheets) if(!existing.has(sheet)) await request(':batchUpdate',{method:'POST',body:JSON.stringify({requests:[{addSheet:{properties:{title:sheet}}}]})}); for(const sheet of sheets) await request(`/values/${sheet}!A1:Z1?valueInputOption=RAW`,{method:'PUT',body:JSON.stringify({values:[headers[sheet]]})}); }
async function append(sheet: keyof typeof headers, item: Record<string, unknown>) { await ensureSheetHeaders(); const row=headers[sheet].map((h)=> item[h] == null ? '' : typeof item[h] === 'object' ? JSON.stringify(item[h]) : String(item[h])); await request(`/values/${sheet}!A:Z:append?valueInputOption=RAW`,{method:'POST',body:JSON.stringify({values:[row]})}); return item; }
async function rows(sheet: keyof typeof headers) { await ensureSheetHeaders(); const data=await request(`/values/${sheet}!A:Z`); const [head,...body]=data.values??[headers[sheet]]; return body.map((row:string[])=>Object.fromEntries(head.map((h:string,i:number)=>[h,row[i]??'']))); }
export const googleSheetsConfigured = configured;
export async function appendAppointment(item: Record<string, unknown>) { return append('Appointments', { id: generateId('apt'), ...item }); }
export async function listAppointments() { return rows('Appointments'); }
export async function findAppointmentByProtocol(protocol: string) { return (await listAppointments()).find((a:any)=>a.protocol===protocol) ?? null; }
export async function updateAppointmentStatus(idOrProtocol: string, status: string, patch: Record<string, unknown> = {}) { const all=await listAppointments(); const index=all.findIndex((a:any)=>a.protocol===idOrProtocol || a.id===idOrProtocol); if(index<0) return null; const next={...all[index],...patch,status,updatedAt:new Date().toISOString()}; await request(`/values/Appointments!A${index+2}:Z${index+2}?valueInputOption=RAW`,{method:'PUT',body:JSON.stringify({values:[headers.Appointments.map((h)=>String((next as any)[h]??''))]})}); return next; }
export async function appendClient(item: Record<string, unknown>) { return append('Clients', { id: generateId('client'), ...item }); }
export async function listClients() { return rows('Clients'); }
export async function appendBookingLink(item: Record<string, unknown>) { return append('BookingLinks', { id: generateId('link'), ...item }); }
export async function listBookingLinks() { return rows('BookingLinks'); }
export async function appendAuditLog(item: Record<string, unknown>) { return append('AuditLogs', { id: generateId('audit'), ...item }); }
export async function appendNotificationLog(item: Record<string, unknown>) { return append('NotificationLogs', { id: generateId('notif'), ...item }); }
