/**
 * Development-Only Super Admin Platform Demo Identity Registry
 *
 * SECURITY BOUNDARIES:
 * 1. References existing Platform IAM users, roles, and evaluator directly (`@/lib/iam/fixtures`).
 * 2. Strictly separate from school tenant users (e.g. tenant `school_principal` can NEVER sign in here).
 * 3. Returns empty collections and denies all credential checks in production (`NODE_ENV === 'production'`)
 *    or when `NEXT_PUBLIC_USE_MOCK_AUTH !== 'true'`.
 */

import { evaluateEffectivePermissions } from '@/lib/iam/evaluator';
import {
  ENHANCED_PLATFORM_USERS,
  INITIAL_PLATFORM_PERMISSIONS,
  INITIAL_PLATFORM_ROLES,
} from '@/lib/iam/fixtures';
import type { PlatformDemoAccount, PlatformSession } from '@/lib/types/auth';
import type { PlatformUser } from '@/lib/types/platform-users';
import { isPlatformMockAuthEnabled } from './platformAuthConfig';

interface InternalPlatformSeed {
  account: PlatformDemoAccount;
  expectedMockPassword: string;
}

function buildDevPlatformSeeds(): InternalPlatformSeed[] {
  if (process.env.NODE_ENV === 'production') {
    return [];
  }

  const demoPass = 'PlatformAdmin#2026';

  return ENHANCED_PLATFORM_USERS.map((user) => {
    const effective = evaluateEffectivePermissions(
      user,
      INITIAL_PLATFORM_ROLES,
      INITIAL_PLATFORM_PERMISSIONS
    );
    const primaryRole =
      effective.assignedRoles[0] ||
      INITIAL_PLATFORM_ROLES.find((r) => r.id === user.role);

    return {
      expectedMockPassword: demoPass,
      account: {
        id: user.id,
        user,
        roleKey: user.role,
        roleLabel: primaryRole?.name || user.role,
        isPrivileged: Boolean(primaryRole?.isPrivileged || effective.isSuperAdmin),
        permissionCount: effective.effectivePermissions.length,
        status: user.status,
        twoFactorEnabled: user.twoFactorEnabled,
        demoCredentialHint: demoPass,
      },
    };
  });
}

export function getPlatformDemoAccounts(): PlatformDemoAccount[] {
  if (!isPlatformMockAuthEnabled()) {
    return [];
  }
  return buildDevPlatformSeeds().map((seed) => seed.account);
}

export function findPlatformDemoUserByEmail(email: string): PlatformDemoAccount | null {
  if (!isPlatformMockAuthEnabled()) {
    return null;
  }
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const seed = buildDevPlatformSeeds().find(
    (s) => s.account.user.email.toLowerCase() === normalized
  );
  return seed ? seed.account : null;
}

export function findPlatformDemoUserById(id: string): PlatformDemoAccount | null {
  if (!isPlatformMockAuthEnabled()) {
    return null;
  }
  const seed = buildDevPlatformSeeds().find((s) => s.account.id === id);
  return seed ? seed.account : null;
}

export function verifyPlatformDemoCredentials(
  email: string,
  password: string | undefined
): PlatformDemoAccount | null {
  if (!isPlatformMockAuthEnabled()) {
    return null;
  }
  if (!email || typeof password !== 'string' || password.length === 0) {
    return null;
  }

  const normalized = email.trim().toLowerCase();
  const seed = buildDevPlatformSeeds().find(
    (s) => s.account.user.email.toLowerCase() === normalized
  );
  if (!seed) {
    return null;
  }

  if (seed.expectedMockPassword !== password) {
    return null;
  }

  return seed.account;
}

export function buildPlatformSessionFromUser(
  user: PlatformUser,
  options: { issuedAt?: string; expiresAt: string; twoFactorVerified: boolean }
): PlatformSession {
  const effective = evaluateEffectivePermissions(
    user,
    INITIAL_PLATFORM_ROLES,
    INITIAL_PLATFORM_PERMISSIONS
  );

  return {
    user,
    roleDetails: effective.assignedRoles,
    effectivePermissions: effective,
    permissionIds: effective.effectivePermissions.map((p) => p.id),
    issuedAt: options.issuedAt || new Date().toISOString(),
    expiresAt: options.expiresAt,
    twoFactorVerified: options.twoFactorVerified,
    simulated: true,
  };
}
