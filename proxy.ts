import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  PLATFORM_GUEST_ONLY_PATHS,
  PLATFORM_PUBLIC_AUTH_PATHS,
} from '@/lib/auth/platformAuthConfig';
import { getSafePlatformReturnUrl } from '@/lib/auth/urlSecurity';

/**
 * Determines whether the incoming Super Admin console request carries a session hint.
 *
 * SECURITY NOTICE:
 * - Production relies on a backend HttpOnly cookie (`sms_platform_session`).
 * - Client-writable `sms_platform_session_active` is valid ONLY in dev simulation mode
 *   when `NEXT_PUBLIC_USE_MOCK_AUTH === 'true'` and serves solely as an SSR navigation hint.
 */
function hasPlatformSessionHint(request: NextRequest): boolean {
  const backendSessionCookie = request.cookies.get('sms_platform_session')?.value;
  if (backendSessionCookie && backendSessionCookie.trim().length > 0) {
    return true;
  }

  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true'
  ) {
    return request.cookies.get('sms_platform_session_active')?.value === 'true';
  }

  return false;
}

export function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isAuthenticated = hasPlatformSessionHint(request);
  const isPublicPath = PLATFORM_PUBLIC_AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isGuestOnlyPath = PLATFORM_GUEST_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  // 1. Fail closed on protected console routes
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    const fullTarget = pathname + search;
    if (fullTarget && fullTarget !== '/') {
      const safeReturn = getSafePlatformReturnUrl(fullTarget, '');
      if (safeReturn && safeReturn !== '/') {
        loginUrl.searchParams.set('returnUrl', safeReturn);
      }
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. Avoid leaving already-signed-in operators on guest auth routes (unless explicitly handling expired/unauth reason)
  const reason = searchParams.get('reason');
  if (
    isAuthenticated &&
    isGuestOnlyPath &&
    reason !== 'expired' &&
    reason !== 'unauthenticated'
  ) {
    const safeReturn = getSafePlatformReturnUrl(
      searchParams.get('returnUrl'),
      '/'
    );
    return NextResponse.redirect(new URL(safeReturn, request.url));
  }

  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
