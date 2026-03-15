import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const { pathname } = request.nextUrl;

  // Allow public routes and API routes (API routes handle their own auth)
  if (
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/procurement') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes - only for admin/super_admin
  if (pathname.startsWith('/admin/')) {
    const userRole = (token.role as string)?.toLowerCase();
    if (!['admin', 'super_admin', 'superadmin'].includes(userRole)) {
      return NextResponse.redirect(new URL('/hq/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Check if tenant needs onboarding (for non-admin users)
  const userRole = (token.role as string)?.toLowerCase();
  if (!['admin', 'super_admin', 'superadmin'].includes(userRole)) {
    // Allow onboarding pages
    if (pathname.startsWith('/onboarding')) {
      return NextResponse.next();
    }

    // Allow /hq/home always — it handles its own under-review / inactive state
    if (pathname === '/hq/home') {
      return NextResponse.next();
    }

    // Use token data to check setup status (no internal fetch to avoid circular calls)
    const setupCompleted = token.setupCompleted as boolean | undefined;
    if (setupCompleted === false) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
