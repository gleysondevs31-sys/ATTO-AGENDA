import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/shell';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getDashboard } from '@/lib/dashboard';
export const dynamic='force-dynamic';
export default async function DashboardPage(){const session=getSessionFromCookies(); if(!session) redirect('/login'); const data=await getDashboard(session.companyId).catch(()=>null); return <AdminShell title="Dashboard"><div className="grid gap-4 md:grid-cols-4">{[['Total',data?.total??0],['Hoje',data?.todayCount??0],['Cancelados',data?.cancellations??0],['Comparecimento',`${data?.attendanceRate??0}%`]].map(([l,v])=><div key={l} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-sm text-zinc-500">{l}</p><strong className="text-3xl">{v}</strong></div>)}</div></AdminShell>}
