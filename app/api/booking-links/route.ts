import { NextRequest } from 'next/server';
import { handleError, ok } from '@/lib/api/responses';
import { requireSession } from '@/lib/auth/session';
import { createBookingLinkSchema } from '@/lib/validation/booking-link';
import { listBookingLinks, createBookingLink } from '@/lib/storage';
import { toCreateBookingData, writeAudit } from '@/lib/booking';
export async function GET(request: NextRequest) { try { const { companyId } = await requireSession(request, 'manage_links'); return ok(await listBookingLinks(companyId)); } catch(error){ return handleError(error); } }
export async function POST(request: NextRequest) { try { const { companyId } = await requireSession(request, 'manage_links'); const payload=createBookingLinkSchema.parse(await request.json()); const link=await createBookingLink(toCreateBookingData(payload, companyId)); await writeAudit(companyId,'booking_link.created','BookingLink',link.id,{slug:link.slug}); return ok(link,{status:201}); } catch(error){ return handleError(error); } }
