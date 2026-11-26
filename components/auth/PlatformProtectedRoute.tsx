'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePlatformAuth } from '@/components/providers/PlatformAuthContext';
import { isPlatformPublicAuthPath } from '@/lib/auth/platformAuthConfig';
import { platformSessionAdapter } from '@/lib/auth/platformSessionAdapter';
import { getSafePlatformReturnUrl } from '@/lib/auth/urlSecurity';
import { PlatformAuthLoadingScreen } from './PlatformAuthLoadingScreen';
import { PlatformSessionExpiredModal } from './PlatformSessionExpiredModal';
import { PlatformAccessDeniedState } from './PlatformAccessDeniedState';
import { evaluatePlatformRouteAccess, getSafePlatformHomeRoute } from '@/lib/iam/rbac';

interface PlatformProtectedRouteProps {
  children: React.ReactNode;
}

export function PlatformProtectedRoute({
  children,
}: PlatformProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const { user, primaryRole, permissions, isInitializing, isAuthenticated, isSessionExpired } =
    usePlatformAuth();
  const isPublicAuth = isPlatformPublicAuthPath(pathname);

  useEffect(() => {
    if (isPublicAuth) return;

    if (!isInitializing && !isAuthenticated && !isSessionExpired) {
      platformSessionAdapter.clearSimulatedSession();
      const safeReturn = getSafePlatformReturnUrl(pathname, '/');
      if (safeReturn && safeReturn !== '/') {
        router.replace(
          `/login?returnUrl=${encodeURIComponent(safeReturn)}&reason=unauthenticated`
        );
      } else {
        router.replace('/login?reason=unauthenticated');
      }
    }
  }, [isPublicAuth, isInitializing, isAuthenticated, isSessionExpired, pathname, router]);

  // Public auth pages handle their own layout cleanly without dashboard shell blocking
  if (isPublicAuth) {
    return <>{children}</>;
  }

  // Never flash protected console content while resolving initial auth state
  if (isInitializing) {
    return <PlatformAuthLoadingScreen />;
  }

  // Fail closed when unauthenticated
  if (!isAuthenticated && !isSessionExpired) {
    return (
      <PlatformAuthLoadingScreen message="Redirecting to Super Admin sign-in..." />
    );
  }

  // Direct route-level RBAC check (fail-closed across all 28 platform routes)
  if (!isSessionExpired) {
    const decision = evaluatePlatformRouteAccess(
      { user, primaryRole, permissions },
      pathname
    );
    if (!decision.allowed) {
      const safeHome = getSafePlatformHomeRoute({ user, primaryRole, permissions });
      return (
        <PlatformAccessDeniedState
          reason={decision.reason}
          requiredPermission={decision.requiredPermission}
          roleName={user?.role}
          description={decision.message}
          homeHref={safeHome}
        />
      );
    }
  }

  return (
    <>
      {children}
      <PlatformSessionExpiredModal open={isSessionExpired} />
    </>
  );
}
