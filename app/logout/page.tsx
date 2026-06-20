import { redirect } from 'next/navigation';
import { clearSessionCookie } from '@/lib/auth/session';
export const dynamic='force-dynamic';
export default function LogoutPage(){ clearSessionCookie(); redirect('/login'); }
