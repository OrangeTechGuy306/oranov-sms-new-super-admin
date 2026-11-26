/**
 * Domain contracts for Super Admin Platform Authentication & Session Lifecycle.
 *
 * SECURITY BOUNDARY:
 * - Strictly isolated from tenant school identities (`school_principal`, `teacher`, `student`, etc.).
 * - References existing Super Admin IAM types (`PlatformUser`, `PlatformRole`, `PlatformPermission`)
 *   without introducing a duplicate platform role system.
 */

import type {
  EffectivePermissionsSummary,
  PlatformRole,
} from './iam';
import type {
  PlatformRoleKey,
  PlatformUser,
  PlatformUserStatus,
} from './platform-users';

export type PlatformAuthState =
  | 'INITIALIZING'
  | 'AUTHENTICATED'
  | 'UNAUTHENTICATED'
  | 'SESSION_EXPIRED'
  | 'ACCESS_DENIED'
  | 'ERROR';

export interface PlatformLoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface PlatformSession {
  user: PlatformUser;
  roleDetails: PlatformRole[];
  effectivePermissions: EffectivePermissionsSummary;
  permissionIds: string[];
  issuedAt: string;
  expiresAt: string;
  twoFactorVerified: boolean;
  simulated?: boolean;
}

export interface PlatformSessionInspectionResult {
  status: 'authenticated' | 'unauthenticated' | 'expired' | 'invalid';
  session: PlatformSession | null;
  expiredEmail?: string;
}

export interface PlatformDemoAccount {
  id: string;
  user: PlatformUser;
  roleKey: PlatformRoleKey;
  roleLabel: string;
  isPrivileged: boolean;
  permissionCount: number;
  status: PlatformUserStatus;
  twoFactorEnabled: boolean;
  /** Development-only convenience label — never included in production bundles */
  demoCredentialHint: string;
}

export interface PlatformTwoFactorChallengeState {
  challengeId: string;
  email: string;
  userName: string;
  role: PlatformRoleKey;
  expiresAt: string;
  resendCooldownSeconds: number;
  attemptsRemaining: number;
  simulatedRecoveryCodesHint?: string[];
  simulated: true;
  simulatedNotice: string;
}

export interface PlatformTwoFactorVerifyPayload {
  challengeId: string;
  email: string;
  code: string;
  isRecovery?: boolean;
  rememberDevice?: boolean;
}

export interface PlatformTwoFactorVerifyResponse {
  success: boolean;
  error?: string;
  attemptsRemaining?: number;
  expired?: boolean;
  locked?: boolean;
  remainingRecoveryCodes?: number;
  simulated?: boolean;
}

export interface PlatformResetTokenVerification {
  valid: boolean;
  email?: string;
  reason?: 'missing' | 'invalid' | 'expired';
}

export interface PlatformInvitationDetails {
  token: string;
  email: string;
  name: string;
  department: string;
  role: PlatformRoleKey;
  roleLabel: string;
  expiresAt: string;
}

export interface PlatformInvitationVerification {
  valid: boolean;
  invitation?: PlatformInvitationDetails;
  reason?: 'missing' | 'invalid' | 'expired' | 'already_used';
}
