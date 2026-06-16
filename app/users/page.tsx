import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/shell';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
export const dynamic='force-dynamic';
export default async function UsersPage(){const session=getSessionFromCookies(); if(!session) redirect('/login'); const users=await prisma.user.findMany({where:{companyId:session.companyId},orderBy:{createdAt:'desc'}}).catch(()=>[]); return <AdminShell title="Usuários"><div className="grid gap-3">{users.map(u=><div key={u.id} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"><strong>{u.name}</strong><p className="text-sm text-zinc-500">{u.email} · {u.role}</p></div>)}</div></AdminShell>}
