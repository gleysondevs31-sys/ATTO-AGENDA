import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/shell';
import { getSessionFromCookies } from '@/lib/auth/session';
export const dynamic='force-dynamic';
export default async function ProfilePage(){const session=await getSessionFromCookies(); if(!session) redirect('/login'); return <AdminShell title="Perfil"><div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"><p><strong>{session.name}</strong></p><p className="text-sm text-zinc-500">{session.email} · {session.role}</p></div></AdminShell>}
