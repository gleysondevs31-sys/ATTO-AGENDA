import { NextRequest, NextResponse } from 'next/server';

const privateRoutes = ['/dashboard', '/booking-links', '/appointments', '/settings', '/users', '/profile'];

export function middleware(request: NextRequest) {
  const isPrivate = privateRoutes.some((path) => request.nextUrl.pathname.startsWith(path));
  if (!isPrivate) return NextResponse.next();
  const hasSession = request.cookies.has('atto_session');
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/booking-links/:path*', '/appointments/:path*', '/settings/:path*', '/users/:path*', '/profile/:path*'] };
