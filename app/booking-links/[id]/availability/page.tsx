import { redirect, notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin/shell';
import { AvailabilityEditor } from '@/components/availability/availability-editor';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getBookingLinkById } from '@/lib/storage';
export const dynamic='force-dynamic';
export default async function AvailabilityPage({params}:{params:{id:string}}){const session=getSessionFromCookies(); if(!session) redirect('/login'); const link=await getBookingLinkById(params.id); if(!link||link.companyId!==session.companyId) notFound(); return <AdminShell title={`Disponibilidade · ${link.name}`}><AvailabilityEditor linkId={link.id}/></AdminShell>}
