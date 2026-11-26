/**
 * Super Admin Platform Authentication Flow Service
 * Handles Forgot Password, Reset Password, Platform Invitation Acceptance,
 * and Stateful Simulated 2FA Challenges.
 *
 * Strictly frontend simulation only when `isPlatformMockAuthEnabled()` is true.
 */

import { INITIAL_PLATFORM_ROLES } from '@/lib/iam/fixtures';
import type {
  PlatformInvitationVerification,
  PlatformResetTokenVerification,
  PlatformTwoFactorChallengeState,
  PlatformTwoFactorVerifyPayload,
  PlatformTwoFactorVerifyResponse,
} from '@/lib/types/auth';
import { isPlatformMockAuthEnabled } from './platformAuthConfig';
import { findPlatformDemoUserByEmail } from './platformDemoAccounts';

interface InternalPlatformTwoFactorChallenge {
  challengeId: string;
  email: string;
  userName: string;
  role: string;
  expiresAtMs: number;
  resendAvailableAtMs: number;
  attemptsRemaining: number;
  availableRecoveryCodes: string[];
  usedRecoveryCodes: Set<string>;
}

const DEFAULT_PLATFORM_RECOVERY_CODES = [
  'PLAT-REC-1001',
  'PLAT-REC-2002',
  'PLAT-REC-3003',
  'PLAT-REC-4004',
];

class PlatformAuthFlowService {
  private twoFactorChallenges = new Map<string, InternalPlatformTwoFactorChallenge>();

  private get mockEnabled(): boolean {
    return isPlatformMockAuthEnabled();
  }

  public async requestPasswordReset(emailInput: string): Promise<{
    success: boolean;
    message: string;
    simulated?: boolean;
    simulatedResetUrl?: string;
  }> {
    const email = emailInput.trim().toLowerCase();

    if (!this.mockEnabled) {
      return {
        success: false,
        message: 'Platform password recovery endpoint is not connected.',
        simulated: false,
      };
    }

    await new Promise((r) => setTimeout(r, 200));
    return {
      success: true,
      message:
        'If a registered platform administrator account matches that email, simulated recovery instructions have been prepared.',
      simulated: true,
      simulatedResetUrl: `/reset-password?token=plat-reset-2026&email=${encodeURIComponent(email)}`,
    };
  }

  public async verifyResetToken(token: string): Promise<PlatformResetTokenVerification> {
    const trimmed = (token || '').trim();
    if (!trimmed) {
      return { valid: false, reason: 'missing' };
    }

    if (!this.mockEnabled) {
      return { valid: false, reason: 'invalid' };
    }

    await new Promise((r) => setTimeout(r, 150));
    const lower = trimmed.toLowerCase();
    if (lower.includes('expired')) {
      return { valid: false, reason: 'expired' };
    }
    if (lower.includes('invalid') || trimmed.length < 5) {
      return { valid: false, reason: 'invalid' };
    }

    return {
      valid: true,
      email: 'alexander.s@saas-platform.internal',
    };
  }

  public async resetPassword(params: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message: string; simulated?: boolean }> {
    if (!this.mockEnabled) {
      return {
        success: false,
        message: 'Password reset backend service is unavailable.',
        simulated: false,
      };
    }

    await new Promise((r) => setTimeout(r, 200));
    const lower = params.token.trim().toLowerCase();
    if (!lower || lower.includes('invalid')) {
      return {
        success: false,
        message: 'Invalid or missing platform reset token.',
        simulated: true,
      };
    }
    if (lower.includes('expired')) {
      return {
        success: false,
        message: 'This reset token has expired. Request a new recovery link.',
        simulated: true,
      };
    }

    return {
      success: true,
      message:
        'Platform password reset simulated cleanly. Sign in on the console login page.',
      simulated: true,
    };
  }

  public async verifyInvitation(token: string): Promise<PlatformInvitationVerification> {
    const trimmed = (token || '').trim();
    if (!trimmed) {
      return { valid: false, reason: 'missing' };
    }

    if (!this.mockEnabled) {
      return { valid: false, reason: 'invalid' };
    }

    await new Promise((r) => setTimeout(r, 150));
    const lower = trimmed.toLowerCase();
    if (lower.includes('expired')) {
      return { valid: false, reason: 'expired' };
    }
    if (lower.includes('used') || lower.includes('already')) {
      return { valid: false, reason: 'already_used' };
    }
    if (lower.includes('invalid') || trimmed.length < 6) {
      return { valid: false, reason: 'invalid' };
    }

    const invitedUser = findPlatformDemoUserByEmail('priya.s@saas-platform.internal');
    const roleObj = INITIAL_PLATFORM_ROLES.find(
      (r) => r.id === (invitedUser?.roleKey || 'readonly_auditor')
    );

    return {
      valid: true,
      invitation: {
        token: trimmed,
        email: invitedUser?.user.email || 'priya.s@saas-platform.internal',
        name: invitedUser?.user.name || 'Priya Sharma',
        department: invitedUser?.user.department || 'Executive Governance Board',
        role: invitedUser?.roleKey || 'readonly_auditor',
        roleLabel: roleObj?.name || 'Executive Read-Only Auditor',
        expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
      },
    };
  }

  public async acceptInvitation(params: {
    token: string;
    name: string;
    password: string;
  }): Promise<{ success: boolean; message: string; simulated?: boolean }> {
    if (!this.mockEnabled) {
      return {
        success: false,
        message: 'Platform invitation acceptance service is unavailable.',
        simulated: false,
      };
    }

    await new Promise((r) => setTimeout(r, 200));
    const lower = params.token.trim().toLowerCase();
    if (!lower || lower.includes('invalid')) {
      return {
        success: false,
        message: 'Invitation token is invalid or missing.',
        simulated: true,
      };
    }
    if (lower.includes('expired')) {
      return {
        success: false,
        message: 'This administrator invitation has expired.',
        simulated: true,
      };
    }

    return {
      success: true,
      message: `Platform administrator onboarding simulated for ${params.name}. Use /login to authenticate.`,
      simulated: true,
    };
  }

  public createTwoFactorChallenge(params: {
    email: string;
    userName: string;
    role: string;
  }): PlatformTwoFactorChallengeState {
    if (!this.mockEnabled) {
      throw new Error('Platform 2FA simulation is unavailable when mock auth is disabled.');
    }

    const normalizedEmail = params.email.trim().toLowerCase();
    const challengeId = `plat-2fa-sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = Date.now();
    const expiresAtMs = now + 5 * 60 * 1000;
    const resendCooldownSeconds = 30;

    const record: InternalPlatformTwoFactorChallenge = {
      challengeId,
      email: normalizedEmail,
      userName: params.userName,
      role: params.role,
      expiresAtMs,
      resendAvailableAtMs: now + resendCooldownSeconds * 1000,
      attemptsRemaining: 5,
      availableRecoveryCodes: [...DEFAULT_PLATFORM_RECOVERY_CODES],
      usedRecoveryCodes: new Set<string>(),
    };

    this.twoFactorChallenges.set(challengeId, record);

    return {
      challengeId,
      email: normalizedEmail,
      userName: params.userName,
      role: params.role,
      expiresAt: new Date(expiresAtMs).toISOString(),
      resendCooldownSeconds,
      attemptsRemaining: record.attemptsRemaining,
      simulatedRecoveryCodesHint: [...record.availableRecoveryCodes],
      simulated: true,
      simulatedNotice:
        'Frontend simulation only — no hardware key push, email, or SMS OTP was dispatched. Enter any 6-digit code except 000000, or a single-use backup code.',
    };
  }

  public async resendTwoFactorChallenge(challengeId: string): Promise<{
    success: boolean;
    message: string;
    cooldownSeconds?: number;
    error?: string;
    simulated?: boolean;
  }> {
    if (!this.mockEnabled) {
      return {
        success: false,
        message: 'Two-factor service unavailable.',
        error: 'Two-factor service unavailable.',
      };
    }

    const challenge = this.twoFactorChallenges.get(challengeId);
    if (!challenge) {
      return {
        success: false,
        message: 'Active 2FA challenge not found. Sign in again.',
        error: 'Active 2FA challenge not found.',
        simulated: true,
      };
    }

    const now = Date.now();
    if (now < challenge.resendAvailableAtMs) {
      const remaining = Math.ceil((challenge.resendAvailableAtMs - now) / 1000);
      return {
        success: false,
        cooldownSeconds: remaining,
        message: `Please wait ${remaining}s before simulating another resend.`,
        error: `Please wait ${remaining}s before simulating another resend.`,
        simulated: true,
      };
    }

    challenge.expiresAtMs = now + 5 * 60 * 1000;
    challenge.resendAvailableAtMs = now + 30 * 1000;

    return {
      success: true,
      cooldownSeconds: 30,
      message: 'Simulated 2FA challenge refreshed (no real OTP sent).',
      simulated: true,
    };
  }

  public cancelTwoFactorChallenge(challengeId?: string): void {
    if (challengeId) {
      this.twoFactorChallenges.delete(challengeId);
    } else {
      this.twoFactorChallenges.clear();
    }
  }

  public async verifyTwoFactorChallenge(
    payload: PlatformTwoFactorVerifyPayload
  ): Promise<PlatformTwoFactorVerifyResponse> {
    if (!this.mockEnabled) {
      return {
        success: false,
        error: 'Two-factor verification unavailable when mock auth is disabled.',
      };
    }

    await new Promise((r) => setTimeout(r, 180));

    const challenge = this.twoFactorChallenges.get(payload.challengeId);
    if (!challenge) {
      return {
        success: false,
        expired: true,
        error: 'This 2FA challenge has expired or was cancelled. Please sign in again.',
        simulated: true,
      };
    }

    if (Date.now() > challenge.expiresAtMs) {
      this.twoFactorChallenges.delete(challenge.challengeId);
      return {
        success: false,
        expired: true,
        error: 'Verification challenge expired. Restart login from the console login page.',
        simulated: true,
      };
    }

    if (challenge.attemptsRemaining <= 0) {
      return {
        success: false,
        locked: true,
        attemptsRemaining: 0,
        error: 'Maximum verification attempts exceeded. Cancel and sign in again.',
        simulated: true,
      };
    }

    if (payload.isRecovery) {
      const normalized = payload.code.trim().toUpperCase();
      const idx = challenge.availableRecoveryCodes.findIndex(
        (c) => c.toUpperCase() === normalized
      );

      if (challenge.usedRecoveryCodes.has(normalized) || idx === -1) {
        challenge.attemptsRemaining -= 1;
        return {
          success: false,
          attemptsRemaining: challenge.attemptsRemaining,
          locked: challenge.attemptsRemaining <= 0,
          error: challenge.usedRecoveryCodes.has(normalized)
            ? 'This recovery code has already been consumed.'
            : 'Invalid single-use platform recovery code.',
          simulated: true,
        };
      }

      challenge.availableRecoveryCodes.splice(idx, 1);
      challenge.usedRecoveryCodes.add(normalized);
      const remaining = challenge.availableRecoveryCodes.length;
      this.twoFactorChallenges.delete(challenge.challengeId);
      return {
        success: true,
        remainingRecoveryCodes: remaining,
        simulated: true,
      };
    }

    const trimmed = payload.code.trim();
    if (!/^\d{6}$/.test(trimmed) || trimmed === '000000') {
      challenge.attemptsRemaining -= 1;
      return {
        success: false,
        attemptsRemaining: challenge.attemptsRemaining,
        locked: challenge.attemptsRemaining <= 0,
        error:
          challenge.attemptsRemaining <= 0
            ? 'Too many invalid attempts. Please restart sign-in.'
            : 'Invalid 6-digit authenticator code (use any 6 digits except 000000 in simulation mode).',
        simulated: true,
      };
    }

    this.twoFactorChallenges.delete(challenge.challengeId);
    return {
      success: true,
      simulated: true,
    };
  }
}

export const platformAuthFlowService = new PlatformAuthFlowService();
