import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/shell';
import { getSessionFromCookies } from '@/lib/auth/session';
import { listBookingLinks } from '@/lib/storage';
export const dynamic='force-dynamic';
export default async function BookingLinksPage(){const session=await getSessionFromCookies(); if(!session) redirect('/login'); const links=await listBookingLinks(session.companyId); return <AdminShell title="Links de agendamento"><div className="grid gap-3">{links.map((l:any)=><div key={l.id} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"><strong>{l.title??l.name}</strong><p className="text-sm text-zinc-500">/{l.slug} · {String(l.isActive)!=='false'?'ativo':'inativo'}</p><div className="mt-3 flex gap-4 text-sm"><a href={`/booking-links/${l.id}/appearance`}>Aparência</a><a href={`/booking-links/${l.id}/availability`}>Disponibilidade</a></div></div>)}</div></AdminShell>}
