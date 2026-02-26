import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/auth/') ||
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

  // Admin routes - only for admin/super_admin
  if (pathname.startsWith('/admin/')) {
    const userRole = (token.role as string)?.toLowerCase();
    if (!['admin', 'super_admin', 'superadmin'].includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Check if tenant needs onboarding (for non-admin users)
  const userRole = (token.role as string)?.toLowerCase();
  if (!['admin', 'super_admin', 'superadmin'].includes(userRole)) {
    // Allow onboarding page
    if (pathname === '/onboarding') {
      return NextResponse.next();
    }

    // Fetch tenant info to check setup status
    try {
      const tenantInfoUrl = new URL('/api/tenant/info', request.url);
      const tenantResponse = await fetch(tenantInfoUrl.toString(), {
        headers: {
          cookie: request.headers.get('cookie') || ''
        }
      });

      if (tenantResponse.ok) {
        const data = await tenantResponse.json();
        
        // Redirect to onboarding if setup not completed
        if (data.tenant && !data.tenant.setupCompleted) {
          if (pathname !== '/onboarding') {
            return NextResponse.redirect(new URL('/onboarding', request.url));
          }
        }
      }
    } catch (error) {
      console.error('Middleware tenant check error:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
