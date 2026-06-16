import { redirect } from 'next/navigation';
import { clearSessionCookie } from '@/lib/auth/session';
export default function LogoutPage(){ clearSessionCookie(); redirect('/login'); }
