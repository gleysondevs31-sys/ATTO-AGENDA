import { NextResponse } from 'next/server';
const links = [{ id: 'blk_001', slug: 'visita-metrocasa', duration: 30, dailyLimit: 24, expiresAt: null }];
export async function GET(){ return NextResponse.json({ data: links }); }
export async function POST(request: Request){ const body = await request.json(); return NextResponse.json({ data: { id: 'blk_new', ...body } }, { status: 201 }); }
