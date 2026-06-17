import { NextRequest } from 'next/server';
import { handleError, ok } from '@/lib/api/responses';
import { assertBookingLinkScope } from '@/lib/tenant';
import { requireSession } from '@/lib/auth/session';
import { updateBookingLinkSchema } from '@/lib/validation/booking-link';
import { getBookingLinkById, updateBookingLink } from '@/lib/storage';
import { toUpdateBookingData, writeAudit } from '@/lib/booking';
export async function GET(request: NextRequest,{params}:{params:{id:string}}){try{const {companyId}=await requireSession(request,'manage_links'); await assertBookingLinkScope(params.id,companyId); return ok(await getBookingLinkById(params.id));}catch(error){return handleError(error)}}
export async function PATCH(request: NextRequest,{params}:{params:{id:string}}){try{const {companyId}=await requireSession(request,'manage_links'); await assertBookingLinkScope(params.id,companyId); const payload=updateBookingLinkSchema.parse(await request.json()); const link=await updateBookingLink(params.id,toUpdateBookingData(payload)); await writeAudit(companyId,'booking_link.updated','BookingLink',params.id,{}); return ok(link);}catch(error){return handleError(error)}}
export async function DELETE(request: NextRequest,{params}:{params:{id:string}}){try{const {companyId}=await requireSession(request,'manage_links'); await assertBookingLinkScope(params.id,companyId); const link=await updateBookingLink(params.id,{isActive:false}); await writeAudit(companyId,'booking_link.disabled','BookingLink',params.id,{}); return ok(link);}catch(error){return handleError(error)}}
