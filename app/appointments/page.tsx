import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/shell';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
export const dynamic='force-dynamic';
export default async function AppointmentsPage(){const session=getSessionFromCookies(); if(!session) redirect('/login'); const items=await prisma.appointment.findMany({where:{companyId:session.companyId},include:{client:true,bookingLink:true},orderBy:{startsAt:'desc'},take:50}).catch(()=>[]); return <AdminShell title="Agendamentos"><div className="grid gap-3">{items.map(a=><div key={a.id} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"><strong>{a.client.fullName}</strong><p className="text-sm text-zinc-500">{a.protocol} · {a.status} · {a.startsAt.toLocaleString('pt-BR')}</p></div>)}</div></AdminShell>}
