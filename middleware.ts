import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const singleBranch =
  process.env.NEXT_PUBLIC_SINGLE_BRANCH === 'true';

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

  // Panel pemilik: hanya owner / admin pusat tenant / super_admin
  if (pathname.startsWith('/opanel')) {
    const role = String((token.role as string) || '').toLowerCase().trim();
    const allowed = ['owner', 'hq_admin', 'super_admin', 'superadmin'];
    if (!allowed.includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Satu cabang: rute legacy /hq dialihkan ke dashboard outlet.
  // /opanel tidak dialihkan ke sini — kalau tidak, /opanel → /dashboard lalu F&B terdorong ke /dashboard-fnb.
  if (singleBranch && pathname.startsWith('/hq')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Admin routes - only for admin/super_admin
  if (pathname.startsWith('/admin/')) {
    const userRole = (token.role as string)?.toLowerCase();
    if (!['admin', 'super_admin', 'superadmin'].includes(userRole)) {
      const fallback = singleBranch ? '/dashboard' : '/opanel/dashboard';
      return NextResponse.redirect(new URL(fallback, request.url));
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

    // Multi-cabang HQ: /hq/home menampilkan status review / tenant (bukan mode single-branch)
    if (!singleBranch && pathname === '/hq/home') {
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
