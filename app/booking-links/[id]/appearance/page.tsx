import { redirect, notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin/shell';
import { AppearanceEditor } from '@/components/appearance/appearance-editor';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
export const dynamic='force-dynamic';
export default async function AppearancePage({params}:{params:{id:string}}){const session=getSessionFromCookies(); if(!session) redirect('/login'); const link=await prisma.bookingLink.findFirst({where:{id:params.id,companyId:session.companyId}}).catch(()=>null); if(!link) notFound(); return <AdminShell title="Aparência do link"><AppearanceEditor link={link}/></AdminShell>}
