import { redirect, notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin/shell';
import { AppearanceEditor } from '@/components/appearance/appearance-editor';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getBookingLinkById } from '@/lib/storage';
export const dynamic='force-dynamic';
export default async function AppearancePage({params}:{params:{id:string}}){const session=await getSessionFromCookies(); if(!session) redirect('/login'); const link=await getBookingLinkById(params.id); if(!link||link.companyId!==session.companyId) notFound(); return <AdminShell title="Aparência do link"><AppearanceEditor link={link}/></AdminShell>}
