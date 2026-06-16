import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/shell';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
export const dynamic='force-dynamic';
export default async function SettingsAppearancePage(){const session=getSessionFromCookies(); if(!session) redirect('/login'); const company=await prisma.company.findUnique({where:{id:session.companyId}}).catch(()=>null); return <AdminShell title="Aparência global"><div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"><h2 className="text-xl font-black">{company?.name}</h2><p className="mt-2 text-sm text-zinc-500">Configure logo, banner e cores padrão no banco ou personalize cada link em /booking-links/[id]/appearance.</p></div></AdminShell>}
