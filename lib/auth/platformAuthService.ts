/**
 * Super Admin Platform Authentication Service
 *
 * SECURITY BOUNDARIES:
 * - Strictly fails closed: visitors start unauthenticated (`UNAUTHENTICATED`).
 * - Never authenticates tenant identities (`school_principal`, `teacher`, `student`, etc.).
 * - Requires explicit `NODE_ENV !== 'production'` and `NEXT_PUBLIC_USE_MOCK_AUTH === 'true'`
 *   before permitting local dev demo account authentication.
 */

import type {
  PlatformLoginCredentials,
  PlatformSession,
  PlatformSessionInspectionResult,
  PlatformTwoFactorChallengeState,
} from '@/lib/types/auth';
import type { PlatformUser } from '@/lib/types/platform-users';
import { isPlatformMockAuthEnabled } from './platformAuthConfig';
import { platformAuthFlowService } from './platformAuthFlowService';
import {
  buildPlatformSessionFromUser,
  findPlatformDemoUserByEmail,
  findPlatformDemoUserById,
  verifyPlatformDemoCredentials,
} from './platformDemoAccounts';
import {
  platformSessionAdapter,
  setPlatformSessionHintCookie,
} from './platformSessionAdapter';

const PLATFORM_SESSION_DEFAULT_MS = 4 * 60 * 60 * 1000;
const PLATFORM_SESSION_REMEMBER_MS = 12 * 60 * 60 * 1000;

interface PendingPlatformTwoFactorSession {
  challengeId: string;
  user: PlatformUser;
  rememberMe: boolean;
}

export type PlatformInitiateLoginResult =
  | { status: 'authenticated'; session: PlatformSession }
  | { status: 'requires_2fa'; challenge: PlatformTwoFactorChallengeState }
  | { status: 'error'; error: string; denied?: boolean };

class PlatformAuthService {
  private currentSession: PlatformSession | null = null;
  private pendingTwoFactorSessions = new Map<string, PendingPlatformTwoFactorSession>();
  private activeChallenge: PlatformTwoFactorChallengeState | null = null;

  public async inspectSession(): Promise<PlatformSessionInspectionResult> {
    if (!isPlatformMockAuthEnabled()) {
      this.currentSession = null;
      this.pendingTwoFactorSessions.clear();
      this.activeChallenge = null;
      platformSessionAdapter.clearSimulatedSession();
      return { status: 'unauthenticated', session: null };
    }

    const stored = platformSessionAdapter.readSimulatedSession();

    if (stored.status === 'none') {
      if (typeof window === 'undefined' && this.currentSession) {
        if (Date.parse(this.currentSession.expiresAt) <= Date.now()) {
          const expiredEmail = this.currentSession.user.email;
          this.currentSession = null;
          return { status: 'expired', session: null, expiredEmail };
        }
        return { status: 'authenticated', session: this.currentSession };
      }
      this.currentSession = null;
      setPlatformSessionHintCookie(false);
      return { status: 'unauthenticated', session: null };
    }

    if (stored.status === 'invalid') {
      this.currentSession = null;
      return { status: 'invalid', session: null };
    }

    if (stored.status === 'expired') {
      this.currentSession = null;
      return {
        status: 'expired',
        session: null,
        expiredEmail: stored.record.email,
      };
    }

    const matched =
      findPlatformDemoUserById(stored.record.userId) ||
      findPlatformDemoUserByEmail(stored.record.email);

    if (!matched || matched.status !== 'active') {
      this.currentSession = null;
      platformSessionAdapter.clearSimulatedSession();
      return { status: 'invalid', session: null };
    }

    this.currentSession = buildPlatformSessionFromUser(matched.user, {
      issuedAt: stored.record.issuedAt,
      expiresAt: stored.record.expiresAt,
      twoFactorVerified: stored.record.twoFactorVerified,
    });
    setPlatformSessionHintCookie(true);
    return { status: 'authenticated', session: this.currentSession };
  }

  public async initiateLogin(
    credentials: PlatformLoginCredentials
  ): Promise<PlatformInitiateLoginResult> {
    const email = (credentials.email || '').trim().toLowerCase();
    const password = credentials.password;

    if (!email || !email.includes('@')) {
      return { status: 'error', error: 'A valid platform administrator email is required.' };
    }

    if (typeof password !== 'string' || password.length === 0) {
      return { status: 'error', error: 'Password is required.' };
    }

    if (!isPlatformMockAuthEnabled()) {
      return {
        status: 'error',
        error:
          'Platform authentication service is offline and development mock auth is disabled.',
      };
    }

    await new Promise((r) => setTimeout(r, 200));

    const demoMatch = verifyPlatformDemoCredentials(email, password);
    if (!demoMatch) {
      return {
        status: 'error',
        error:
          'Invalid platform administrator email or password. Tenant school accounts are rejected on the platform console.',
      };
    }

    if (demoMatch.status === 'suspended' || demoMatch.status === 'deactivated') {
      return {
        status: 'error',
        denied: true,
        error: `Platform access blocked: administrator account status is '${demoMatch.status}'.`,
      };
    }

    if (demoMatch.status === 'pending_invite') {
      return {
        status: 'error',
        error:
          'This platform invitation is still pending acceptance. Complete onboarding via /accept-invitation first.',
      };
    }

    if (demoMatch.twoFactorEnabled) {
      const challenge = platformAuthFlowService.createTwoFactorChallenge({
        email: demoMatch.user.email,
        userName: demoMatch.user.name,
        role: demoMatch.roleKey,
      });
      this.pendingTwoFactorSessions.set(challenge.challengeId, {
        challengeId: challenge.challengeId,
        user: demoMatch.user,
        rememberMe: Boolean(credentials.rememberMe),
      });
      this.activeChallenge = challenge;
      return { status: 'requires_2fa', challenge };
    }

    const issuedAt = new Date().toISOString();
    const expiresAt = new Date(
      Date.now() +
        (credentials.rememberMe
          ? PLATFORM_SESSION_REMEMBER_MS
          : PLATFORM_SESSION_DEFAULT_MS)
    ).toISOString();

    const session = buildPlatformSessionFromUser(demoMatch.user, {
      issuedAt,
      expiresAt,
      twoFactorVerified: false,
    });

    this.currentSession = session;
    platformSessionAdapter.writeSimulatedSession({
      simulatedOnly: true,
      userId: demoMatch.user.id,
      email: demoMatch.user.email,
      rememberMe: Boolean(credentials.rememberMe),
      issuedAt,
      expiresAt,
      twoFactorVerified: false,
    });

    return { status: 'authenticated', session };
  }

  public async completeTwoFactorLogin(params: {
    challengeId: string;
    email: string;
    code: string;
    isRecovery?: boolean;
    rememberDevice?: boolean;
  }): Promise<{
    success: boolean;
    session?: PlatformSession;
    error?: string;
    attemptsRemaining?: number;
    expired?: boolean;
    locked?: boolean;
  }> {
    if (!isPlatformMockAuthEnabled()) {
      return {
        success: false,
        error: 'Simulated two-factor authentication is disabled in this environment.',
      };
    }

    const pending = this.pendingTwoFactorSessions.get(params.challengeId);
    if (!pending) {
      return {
        success: false,
        expired: true,
        error: 'No active pending 2FA session found. Sign in from the console login page.',
      };
    }

    const verifyRes = await platformAuthFlowService.verifyTwoFactorChallenge({
      challengeId: params.challengeId,
      email: params.email,
      code: params.code,
      isRecovery: params.isRecovery,
      rememberDevice: params.rememberDevice,
    });

    if (!verifyRes.success) {
      if (verifyRes.expired || verifyRes.locked) {
        this.pendingTwoFactorSessions.delete(params.challengeId);
        if (this.activeChallenge?.challengeId === params.challengeId) {
          this.activeChallenge = null;
        }
      }
      return {
        success: false,
        error: verifyRes.error,
        attemptsRemaining: verifyRes.attemptsRemaining,
        expired: verifyRes.expired,
        locked: verifyRes.locked,
      };
    }

    this.pendingTwoFactorSessions.delete(params.challengeId);
    this.activeChallenge = null;

    const remember = Boolean(pending.rememberMe || params.rememberDevice);
    const issuedAt = new Date().toISOString();
    const expiresAt = new Date(
      Date.now() +
        (remember ? PLATFORM_SESSION_REMEMBER_MS : PLATFORM_SESSION_DEFAULT_MS)
    ).toISOString();

    const session = buildPlatformSessionFromUser(pending.user, {
      issuedAt,
      expiresAt,
      twoFactorVerified: true,
    });

    this.currentSession = session;
    platformSessionAdapter.writeSimulatedSession({
      simulatedOnly: true,
      userId: pending.user.id,
      email: pending.user.email,
      rememberMe: remember,
      issuedAt,
      expiresAt,
      twoFactorVerified: true,
    });

    return { success: true, session };
  }

  public getPendingChallenge(): PlatformTwoFactorChallengeState | null {
    return this.activeChallenge;
  }

  public cancelPendingTwoFactor(challengeId?: string): void {
    if (challengeId) {
      this.pendingTwoFactorSessions.delete(challengeId);
      if (this.activeChallenge?.challengeId === challengeId) {
        this.activeChallenge = null;
      }
    } else {
      this.pendingTwoFactorSessions.clear();
      this.activeChallenge = null;
    }
    platformAuthFlowService.cancelTwoFactorChallenge(challengeId);
  }

  public simulateSessionExpiration(): void {
    if (!isPlatformMockAuthEnabled()) return;
    this.currentSession = null;
    platformSessionAdapter.markSimulatedSessionExpired();
  }

  public async refreshSession(): Promise<boolean> {
    if (!isPlatformMockAuthEnabled() || !this.currentSession) {
      this.currentSession = null;
      platformSessionAdapter.clearSimulatedSession();
      return false;
    }

    const stored = platformSessionAdapter.readSimulatedSession();
    if (stored.status !== 'valid') {
      this.currentSession = null;
      platformSessionAdapter.clearSimulatedSession();
      return false;
    }

    const nextExpiresAt = new Date(
      Date.now() +
        (stored.record.rememberMe
          ? PLATFORM_SESSION_REMEMBER_MS
          : PLATFORM_SESSION_DEFAULT_MS)
    ).toISOString();

    this.currentSession = {
      ...this.currentSession,
      expiresAt: nextExpiresAt,
    };

    platformSessionAdapter.writeSimulatedSession({
      ...stored.record,
      expiresAt: nextExpiresAt,
    });

    return true;
  }

  public async logout(): Promise<void> {
    this.currentSession = null;
    this.pendingTwoFactorSessions.clear();
    this.activeChallenge = null;
    platformAuthFlowService.cancelTwoFactorChallenge();
    platformSessionAdapter.clearSimulatedSession();
  }

  public getCachedSession(): PlatformSession | null {
    return this.currentSession;
  }
}

export const platformAuthService = new PlatformAuthService();
