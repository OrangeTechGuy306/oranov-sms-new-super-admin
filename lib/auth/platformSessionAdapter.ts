/**
 * Super Admin Frontend Simulation Session Adapter
 *
 * SECURITY NOTICE:
 * - Stores DEVELOPMENT SIMULATION session metadata ONLY (`sms_dev_only_platform_session_sim_v1`).
 * - Strictly isolated from tenant session storage (`sms_dev_only_tenant_session_sim_v1`).
 * - Client storage & `sms_platform_session_active` cookie DO NOT represent production security;
 *   they provide simulated refresh continuity and UX routing hints only.
 * - Passwords, OTP codes, recovery codes, and secret keys are NEVER persisted.
 */

import { isPlatformMockAuthEnabled } from './platformAuthConfig';

export const PLATFORM_DEV_SESSION_STORAGE_KEY = 'sms_dev_only_platform_session_sim_v1';

export interface SimulatedPlatformSessionRecord {
  simulatedOnly: true;
  userId: string;
  email: string;
  rememberMe: boolean;
  issuedAt: string;
  expiresAt: string;
  twoFactorVerified: boolean;
}

export type PlatformStoredSessionResult =
  | { status: 'none' }
  | { status: 'invalid' }
  | { status: 'expired'; record: SimulatedPlatformSessionRecord }
  | { status: 'valid'; record: SimulatedPlatformSessionRecord };

function getStorage(preferLocal: boolean): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return preferLocal ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function setPlatformSessionHintCookie(active: boolean): void {
  if (typeof document === 'undefined') return;
  if (
    active &&
    process.env.NODE_ENV !== 'production' &&
    process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true'
  ) {
    document.cookie =
      'sms_platform_session_active=true; path=/; max-age=28800; SameSite=Lax';
  } else {
    document.cookie =
      'sms_platform_session_active=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  }
}

function parseRecord(raw: string | null): SimulatedPlatformSessionRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SimulatedPlatformSessionRecord>;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      parsed.simulatedOnly !== true ||
      typeof parsed.userId !== 'string' ||
      !parsed.userId ||
      typeof parsed.email !== 'string' ||
      !parsed.email ||
      typeof parsed.expiresAt !== 'string' ||
      Number.isNaN(Date.parse(parsed.expiresAt))
    ) {
      return null;
    }

    return {
      simulatedOnly: true,
      userId: parsed.userId,
      email: parsed.email,
      rememberMe: Boolean(parsed.rememberMe),
      issuedAt:
        typeof parsed.issuedAt === 'string' ? parsed.issuedAt : new Date().toISOString(),
      expiresAt: parsed.expiresAt,
      twoFactorVerified: Boolean(parsed.twoFactorVerified),
    };
  } catch {
    return null;
  }
}

export const platformSessionAdapter = {
  readSimulatedSession(): PlatformStoredSessionResult {
    if (!isPlatformMockAuthEnabled()) {
      this.clearSimulatedSession();
      return { status: 'none' };
    }

    const rawSession = getStorage(false)?.getItem(PLATFORM_DEV_SESSION_STORAGE_KEY) ?? null;
    const rawLocal = getStorage(true)?.getItem(PLATFORM_DEV_SESSION_STORAGE_KEY) ?? null;
    const raw = rawSession ?? rawLocal;

    if (!raw) {
      return { status: 'none' };
    }

    const record = parseRecord(raw);
    if (!record) {
      this.clearSimulatedSession();
      return { status: 'invalid' };
    }

    if (Date.parse(record.expiresAt) <= Date.now()) {
      return { status: 'expired', record };
    }

    return { status: 'valid', record };
  },

  writeSimulatedSession(record: SimulatedPlatformSessionRecord): void {
    if (!isPlatformMockAuthEnabled()) {
      this.clearSimulatedSession();
      return;
    }

    const safePayload: SimulatedPlatformSessionRecord = {
      simulatedOnly: true,
      userId: record.userId,
      email: record.email,
      rememberMe: Boolean(record.rememberMe),
      issuedAt: record.issuedAt,
      expiresAt: record.expiresAt,
      twoFactorVerified: Boolean(record.twoFactorVerified),
    };

    const serialized = JSON.stringify(safePayload);
    try {
      getStorage(false)?.setItem(PLATFORM_DEV_SESSION_STORAGE_KEY, serialized);
      if (record.rememberMe) {
        getStorage(true)?.setItem(PLATFORM_DEV_SESSION_STORAGE_KEY, serialized);
      } else {
        getStorage(true)?.removeItem(PLATFORM_DEV_SESSION_STORAGE_KEY);
      }
    } catch {
      // Storage blocked
    }

    setPlatformSessionHintCookie(true);
  },

  markSimulatedSessionExpired(): void {
    if (!isPlatformMockAuthEnabled()) return;
    const current = this.readSimulatedSession();
    if (current.status === 'valid' || current.status === 'expired') {
      const expiredRecord: SimulatedPlatformSessionRecord = {
        ...current.record,
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      };
      const serialized = JSON.stringify(expiredRecord);
      try {
        getStorage(false)?.setItem(PLATFORM_DEV_SESSION_STORAGE_KEY, serialized);
        if (expiredRecord.rememberMe) {
          getStorage(true)?.setItem(PLATFORM_DEV_SESSION_STORAGE_KEY, serialized);
        }
      } catch {
        // Ignore
      }
    }
    setPlatformSessionHintCookie(false);
  },

  clearSimulatedSession(): void {
    try {
      getStorage(false)?.removeItem(PLATFORM_DEV_SESSION_STORAGE_KEY);
      getStorage(true)?.removeItem(PLATFORM_DEV_SESSION_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setPlatformSessionHintCookie(false);
  },
};
