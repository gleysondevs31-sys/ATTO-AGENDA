import { NextResponse } from 'next/server';
export async function PUT(request: Request, { params }: { params: { id: string } }){ return NextResponse.json({ data: { id: params.id, ...(await request.json()) } }); }
export async function DELETE(_: Request, { params }: { params: { id: string } }){ return NextResponse.json({ data: { id: params.id, status: 'cancelled' }, webhook: 'appointment.cancelled' }); }
