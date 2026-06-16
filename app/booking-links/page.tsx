import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/shell';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
export const dynamic='force-dynamic';
export default async function BookingLinksPage(){const session=getSessionFromCookies(); if(!session) redirect('/login'); const links=await prisma.bookingLink.findMany({where:{companyId:session.companyId},orderBy:{createdAt:'desc'}}).catch(()=>[]); return <AdminShell title="Links de agendamento"><div className="grid gap-3">{links.map(l=><div key={l.id} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"><strong>{l.title??l.name}</strong><p className="text-sm text-zinc-500">/{l.slug} · {l.isActive?'ativo':'inativo'}</p><div className="mt-3 flex gap-4 text-sm"><a href={`/booking-links/${l.id}/appearance`}>Aparência</a><a href={`/booking-links/${l.id}/availability`}>Disponibilidade</a></div></div>)}</div></AdminShell>}
