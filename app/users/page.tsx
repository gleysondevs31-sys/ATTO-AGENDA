import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/shell';
import { getSessionFromCookies } from '@/lib/auth/session';
import { listUsers } from '@/lib/storage';
export const dynamic='force-dynamic';
export default async function UsersPage(){const session=await getSessionFromCookies(); if(!session) redirect('/login'); const users=await listUsers(session.companyId); return <AdminShell title="Usuários"><div className="grid gap-3">{users.map((u:any)=><div key={u.id} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"><strong>{u.name}</strong><p className="text-sm text-zinc-500">{u.email} · {u.role}</p></div>)}</div></AdminShell>}
