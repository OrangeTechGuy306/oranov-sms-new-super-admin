'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  PlatformAuthState,
  PlatformLoginCredentials,
  PlatformSession,
  PlatformTwoFactorChallengeState,
} from '@/lib/types/auth';
import type { PlatformRole } from '@/lib/types/iam';
import type { PlatformRoleKey, PlatformUser } from '@/lib/types/platform-users';
import { isPlatformDevControlsEnabled } from '@/lib/auth/platformAuthConfig';
import { platformAuthService } from '@/lib/auth/platformAuthService';
import { platformSessionAdapter } from '@/lib/auth/platformSessionAdapter';
import {
  hasPlatformPermission,
  hasAnyPlatformPermission,
  hasAllPlatformPermissions,
  hasPlatformRole,
  evaluatePlatformRouteAccess,
  type PlatformRouteAccessDecision,
} from '@/lib/iam/rbac';

export interface PlatformAuthContextType {
  user: PlatformUser | null;
  session: PlatformSession | null;
  authState: PlatformAuthState;
  expiredEmail: string | null;
  pendingTwoFactor: PlatformTwoFactorChallengeState | null;
  isLoading: boolean;
  isInitializing: boolean;
  isAuthenticated: boolean;
  isSessionExpired: boolean;
  isSimulatedAuth: boolean;
  primaryRole: PlatformRoleKey | null;
  roleDetails: PlatformRole[];
  permissions: string[];
  can: (permission: string) => boolean;
  hasAnyPermission: (permissions: readonly string[]) => boolean;
  hasAllPermissions: (permissions: readonly string[]) => boolean;
  hasRole: (role: PlatformRoleKey | string) => boolean;
  canAccessRoute: (pathname: string) => PlatformRouteAccessDecision;
  initiateLogin: (
    credentials: PlatformLoginCredentials
  ) => Promise<
    | { success: true }
    | { success: false; requires2fa: true; challenge: PlatformTwoFactorChallengeState }
    | { success: false; requires2fa?: false; error: string; denied?: boolean }
  >;
  completeTwoFactor: (params: {
    challengeId: string;
    email: string;
    code: string;
    isRecovery?: boolean;
    rememberDevice?: boolean;
  }) => Promise<{
    success: boolean;
    error?: string;
    attemptsRemaining?: number;
    expired?: boolean;
    locked?: boolean;
  }>;
  cancelTwoFactor: () => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  dismissSessionExpired: () => void;
  simulateSessionExpiry: () => void;
}

const PlatformAuthContext = createContext<PlatformAuthContextType | undefined>(
  undefined
);

export function PlatformAuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<PlatformAuthState>('INITIALIZING');
  const [session, setSession] = useState<PlatformSession | null>(null);
  const [expiredEmail, setExpiredEmail] = useState<string | null>(null);
  const [pendingTwoFactor, setPendingTwoFactor] =
    useState<PlatformTwoFactorChallengeState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const syncSessionFromService = useCallback(async () => {
    const inspected = await platformAuthService.inspectSession();
    if (inspected.status === 'authenticated' && inspected.session) {
      setSession(inspected.session);
      setExpiredEmail(null);
      setAuthState('AUTHENTICATED');
      return;
    }

    if (inspected.status === 'expired') {
      setSession(null);
      setExpiredEmail(inspected.expiredEmail || null);
      setAuthState('SESSION_EXPIRED');
      return;
    }

    setSession(null);
    setExpiredEmail(null);
    setAuthState('UNAUTHENTICATED');
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const inspected = await platformAuthService.inspectSession();
        if (!isMounted) return;

        if (inspected.status === 'authenticated' && inspected.session) {
          setSession(inspected.session);
          setExpiredEmail(null);
          setAuthState('AUTHENTICATED');
        } else if (inspected.status === 'expired') {
          setSession(null);
          setExpiredEmail(inspected.expiredEmail || null);
          setAuthState('SESSION_EXPIRED');
        } else {
          setSession(null);
          setExpiredEmail(null);
          setAuthState('UNAUTHENTICATED');
        }
      } catch (err) {
        console.error('Platform session initialization failure:', err);
        if (isMounted) {
          setSession(null);
          setAuthState('ERROR');
        }
      }
    }

    init();

    const handleStorageChange = () => {
      if (!isMounted) return;
      void syncSessionFromService();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, [syncSessionFromService]);

  useEffect(() => {
    if (authState !== 'AUTHENTICATED' || !session?.expiresAt) return;

    const expiresMs = Date.parse(session.expiresAt);
    if (Number.isNaN(expiresMs)) return;

    const remainingMs = Math.max(0, expiresMs - Date.now());
    const timer = window.setTimeout(
      () => {
        setExpiredEmail(session.user.email);
        setSession(null);
        platformSessionAdapter.markSimulatedSessionExpired();
        setAuthState('SESSION_EXPIRED');
      },
      Math.min(remainingMs, 2_147_483_647)
    );

    return () => window.clearTimeout(timer);
  }, [authState, session?.expiresAt, session?.user.email]);

  const initiateLogin = useCallback(async (credentials: PlatformLoginCredentials) => {
    setIsLoading(true);
    try {
      const result = await platformAuthService.initiateLogin(credentials);
      if (result.status === 'authenticated') {
        setPendingTwoFactor(null);
        setExpiredEmail(null);
        setSession(result.session);
        setAuthState('AUTHENTICATED');
        setIsLoading(false);
        return { success: true as const };
      }

      if (result.status === 'requires_2fa') {
        setPendingTwoFactor(result.challenge);
        setIsLoading(false);
        return {
          success: false as const,
          requires2fa: true as const,
          challenge: result.challenge,
        };
      }

      setIsLoading(false);
      return {
        success: false as const,
        error: result.error,
        denied: result.denied,
      };
    } catch (err: unknown) {
      setIsLoading(false);
      return {
        success: false as const,
        error:
          err instanceof Error
            ? err.message
            : 'Unable to sign in to platform console.',
      };
    }
  }, []);

  const completeTwoFactor = useCallback(
    async (params: {
      challengeId: string;
      email: string;
      code: string;
      isRecovery?: boolean;
      rememberDevice?: boolean;
    }) => {
      setIsLoading(true);
      try {
        const res = await platformAuthService.completeTwoFactorLogin(params);
        if (res.success && res.session) {
          setPendingTwoFactor(null);
          setExpiredEmail(null);
          setSession(res.session);
          setAuthState('AUTHENTICATED');
          setIsLoading(false);
          return { success: true };
        }
        if (res.expired || res.locked) {
          setPendingTwoFactor(null);
        }
        setIsLoading(false);
        return {
          success: false,
          error: res.error || 'Two-factor verification failed.',
          attemptsRemaining: res.attemptsRemaining,
          expired: res.expired,
          locked: res.locked,
        };
      } catch (err: unknown) {
        setIsLoading(false);
        return {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : 'Two-factor verification failed.',
        };
      }
    },
    []
  );

  const cancelTwoFactor = useCallback(async () => {
    platformAuthService.cancelPendingTwoFactor(pendingTwoFactor?.challengeId);
    setPendingTwoFactor(null);
    await platformAuthService.logout();
    setSession(null);
    setExpiredEmail(null);
    setAuthState('UNAUTHENTICATED');
  }, [pendingTwoFactor?.challengeId]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await platformAuthService.logout();
    } finally {
      setPendingTwoFactor(null);
      setExpiredEmail(null);
      setSession(null);
      setAuthState('UNAUTHENTICATED');
      setIsLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const ok = await platformAuthService.refreshSession();
    if (ok) {
      const updated = platformAuthService.getCachedSession();
      if (updated) {
        setSession(updated);
        setExpiredEmail(null);
        setAuthState('AUTHENTICATED');
      }
      return true;
    }

    setSession((prev) => {
      if (prev?.user.email) setExpiredEmail(prev.user.email);
      return null;
    });
    setAuthState('SESSION_EXPIRED');
    return false;
  }, []);

  const dismissSessionExpired = useCallback(() => {
    platformSessionAdapter.clearSimulatedSession();
    setExpiredEmail(null);
    setSession(null);
    setAuthState('UNAUTHENTICATED');
  }, []);

  const simulateSessionExpiry = useCallback(() => {
    if (!isPlatformDevControlsEnabled()) return;
    setExpiredEmail(session?.user.email || expiredEmail);
    platformAuthService.simulateSessionExpiration();
    setSession(null);
    setAuthState('SESSION_EXPIRED');
  }, [session?.user.email, expiredEmail]);

  const permissions = useMemo(
    () => session?.permissionIds || [],
    [session?.permissionIds]
  );
  const roleDetails = useMemo(
    () => session?.roleDetails || [],
    [session?.roleDetails]
  );
  const primaryRole = session?.user.role || null;

  const can = useCallback(
    (perm: string) => hasPlatformPermission(permissions, perm),
    [permissions]
  );

  const hasAnyPerm = useCallback(
    (perms: readonly string[]) => hasAnyPlatformPermission(permissions, perms),
    [permissions]
  );

  const hasAllPerm = useCallback(
    (perms: readonly string[]) => hasAllPlatformPermissions(permissions, perms),
    [permissions]
  );

  const checkRole = useCallback(
    (role: PlatformRoleKey | string) =>
      hasPlatformRole({ user: session?.user || null, primaryRole, permissions }, role),
    [session?.user, primaryRole, permissions]
  );

  const checkRouteAccess = useCallback(
    (pathname: string) =>
      evaluatePlatformRouteAccess(
        { user: session?.user || null, primaryRole, permissions },
        pathname
      ),
    [session?.user, primaryRole, permissions]
  );

  return (
    <PlatformAuthContext.Provider
      value={{
        user: session?.user || null,
        session,
        authState,
        expiredEmail,
        pendingTwoFactor,
        isLoading,
        isInitializing: authState === 'INITIALIZING',
        isAuthenticated: authState === 'AUTHENTICATED',
        isSessionExpired: authState === 'SESSION_EXPIRED',
        isSimulatedAuth: Boolean(session?.simulated),
        primaryRole,
        roleDetails,
        permissions,
        can,
        hasAnyPermission: hasAnyPerm,
        hasAllPermissions: hasAllPerm,
        hasRole: checkRole,
        canAccessRoute: checkRouteAccess,
        initiateLogin,
        completeTwoFactor,
        cancelTwoFactor,
        logout,
        refreshSession,
        dismissSessionExpired,
        simulateSessionExpiry,
      }}
    >
      {children}
    </PlatformAuthContext.Provider>
  );
}

export function usePlatformAuth() {
  const ctx = useContext(PlatformAuthContext);
  if (!ctx) {
    throw new Error('usePlatformAuth must be used within a PlatformAuthProvider');
  }
  return ctx;
}

export function useOptionalPlatformAuth(): PlatformAuthContextType | undefined {
  return useContext(PlatformAuthContext);
}
