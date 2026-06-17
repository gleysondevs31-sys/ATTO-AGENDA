import { NextRequest } from 'next/server';
import { getBookingLinkById, listAppointments } from '@/lib/storage';
export function getCompanyId(request: NextRequest) { return request.headers.get('x-company-id') ?? process.env.DEMO_COMPANY_ID ?? 'company_demo'; }
export async function requireCompanyId(request: NextRequest) { return getCompanyId(request); }
export function scoped(companyId: string) { return { companyId }; }
export async function assertBookingLinkScope(id: string, companyId: string) { const link=await getBookingLinkById(id); if(!link || link.companyId!==companyId) throw new Error('Link não encontrado para esta empresa.'); return link; }
export async function assertAppointmentScope(id: string, companyId: string) { const appointment=(await listAppointments(companyId)).find((a:any)=>a.id===id); if(!appointment) throw new Error('Agendamento não encontrado para esta empresa.'); return appointment; }
