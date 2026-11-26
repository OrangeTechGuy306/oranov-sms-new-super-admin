/**
 * Super Admin Platform Authentication Environment & Feature Gates
 *
 * SECURITY BOUNDARY:
 * - Mock authentication is STRICTLY enabled only when `NODE_ENV !== 'production'`
 *   AND `NEXT_PUBLIC_USE_MOCK_AUTH === 'true'`.
 * - Production builds fail closed with zero implicit demo identities or auto-login.
 */

export const PLATFORM_PUBLIC_AUTH_PATHS = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/accept-invitation',
  '/2fa',
  '/403',
  '/access-denied',
] as const;

export const PLATFORM_GUEST_ONLY_PATHS = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/accept-invitation',
  '/2fa',
] as const;

export function isPlatformMockAuthEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  return process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';
}

export function isPlatformDevControlsEnabled(): boolean {
  return isPlatformMockAuthEnabled();
}

export function isPlatformPublicAuthPath(pathname: string): boolean {
  return PLATFORM_PUBLIC_AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export const PLATFORM_AUTH_MODE_LABEL =
  'Frontend Simulation Mode (No Live Backend Auth Connected)';
