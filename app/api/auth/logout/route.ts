import { clearSessionCookie } from '@/lib/auth/session';
import { ok } from '@/lib/api/responses';
export async function POST() { clearSessionCookie(); return ok({ success: true }); }
