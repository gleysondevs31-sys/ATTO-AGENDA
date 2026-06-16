import { NextResponse } from 'next/server';
const appointments = [{ id: 'apt_001', protocol: 'AG-2026-584712', status: 'confirmed', startsAt: '2026-06-18T10:30:00-03:00' }];
export async function GET(){ return NextResponse.json({ data: appointments }); }
export async function POST(request: Request){ const body = await request.json(); return NextResponse.json({ data: { id: 'apt_new', protocol: 'AG-2026-' + Math.floor(100000 + Math.random()*900000), status: 'scheduled', ...body }, webhook: 'appointment.created' }, { status: 201 }); }
