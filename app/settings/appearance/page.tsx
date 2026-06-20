import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/shell';
import { getSessionFromCookies } from '@/lib/auth/session';
export const dynamic='force-dynamic';
export default async function SettingsAppearancePage(){const session=await getSessionFromCookies(); if(!session) redirect('/login'); return <AdminShell title="Aparência global"><div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"><h2 className="text-xl font-black">Empresa {session.companyId}</h2><p className="mt-2 text-sm text-zinc-500">Personalize cada link em /booking-links/[id]/appearance. O storage atual usa JSON local ou Google Planilhas.</p></div></AdminShell>}
