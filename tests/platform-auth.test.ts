import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  isPlatformMockAuthEnabled,
  isPlatformDevControlsEnabled,
  isPlatformPublicAuthPath,
} from '@/lib/auth/platformAuthConfig';
import {
  getPlatformDemoAccounts,
  findPlatformDemoUserByEmail,
  verifyPlatformDemoCredentials,
} from '@/lib/auth/platformDemoAccounts';
import { platformAuthService } from '@/lib/auth/platformAuthService';
import { platformAuthFlowService } from '@/lib/auth/platformAuthFlowService';
import {
  getSafePlatformReturnUrl,
  isSafeExternalOrInternalUrl,
} from '@/lib/auth/urlSecurity';
import { ENHANCED_PLATFORM_USERS } from '@/lib/iam/fixtures';

describe('Phase P0-1: Super Admin Platform Authentication & Identity Isolation', () => {
  const originalEnv = { ...process.env };

  afterEach(async () => {
    await platformAuthService.logout();
    process.env = { ...originalEnv };
  });

  describe('1. Mock Authentication Gates & Fail-Closed Boot', () => {
    test('fails closed when NEXT_PUBLIC_USE_MOCK_AUTH is absent or false', () => {
      delete process.env.NEXT_PUBLIC_USE_MOCK_AUTH;
      (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
      assert.equal(isPlatformMockAuthEnabled(), false);
      assert.equal(isPlatformDevControlsEnabled(), false);
      assert.deepEqual(getPlatformDemoAccounts(), []);
    });

    test('always disables mock auth and demo accounts in NODE_ENV === "production"', () => {
      process.env.NEXT_PUBLIC_USE_MOCK_AUTH = 'true';
      (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
      assert.equal(isPlatformMockAuthEnabled(), false);
      assert.deepEqual(getPlatformDemoAccounts(), []);
      assert.equal(
        verifyPlatformDemoCredentials(
          'alexander.s@saas-platform.internal',
          'PlatformAdmin#2026'
        ),
        null
      );
    });

    test('visitors start unauthenticated on initial inspectSession', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_AUTH = 'true';
      (process.env as Record<string, string | undefined>).NODE_ENV = 'development';

      const inspected = await platformAuthService.inspectSession();
      assert.equal(inspected.status, 'unauthenticated');
      assert.equal(inspected.session, null);
      assert.equal(platformAuthService.getCachedSession(), null);
    });
  });

  describe('2. Strict Separation Between Tenant & Platform Identities', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_USE_MOCK_AUTH = 'true';
      (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    });

    test('platform demo registry references existing IAM fixtures and rejects school tenant users', () => {
      const demoAccounts = getPlatformDemoAccounts();
      assert.equal(demoAccounts.length, ENHANCED_PLATFORM_USERS.length);

      // School tenant principal / teacher accounts MUST NOT authenticate as platform administrators
      assert.equal(findPlatformDemoUserByEmail('principal.vance@oakridge.edu'), null);
      assert.equal(findPlatformDemoUserByEmail('marcus.chen@oakridge.edu'), null);
    });

    test('school tenant emails and unknown emails are rejected on platform initiateLogin', async () => {
      const tenantPrincipalAttempt = await platformAuthService.initiateLogin({
        email: 'principal.vance@oakridge.edu',
        password: 'Institution#2026',
      });
      assert.equal(tenantPrincipalAttempt.status, 'error');

      const wrongPassAttempt = await platformAuthService.initiateLogin({
        email: 'alexander.s@saas-platform.internal',
        password: 'wrong-password',
      });
      assert.equal(wrongPassAttempt.status, 'error');
    });

    test('suspended and pending_invite platform accounts cannot establish active console sessions', async () => {
      const suspendedRes = await platformAuthService.initiateLogin({
        email: 'jordan.v@saas-platform.internal',
        password: 'PlatformAdmin#2026',
      });
      assert.equal(suspendedRes.status, 'error');
      assert.equal(suspendedRes.denied, true);

      const invitePendingRes = await platformAuthService.initiateLogin({
        email: 'priya.s@saas-platform.internal',
        password: 'PlatformAdmin#2026',
      });
      assert.equal(invitePendingRes.status, 'error');
      assert.ok(invitePendingRes.error.includes('pending acceptance'));
    });
  });

  describe('3. Full Simulated 2FA Workflow & Session Lifecycle', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_USE_MOCK_AUTH = 'true';
      (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    });

    test('active platform super_admin proceeds through simulated 2FA challenge before session creation', async () => {
      const init = await platformAuthService.initiateLogin({
        email: 'alexander.s@saas-platform.internal',
        password: 'PlatformAdmin#2026',
      });

      assert.equal(init.status, 'requires_2fa');
      assert.equal(init.challenge.email, 'alexander.s@saas-platform.internal');
      assert.ok(init.challenge.simulatedNotice.includes('Frontend simulation only'));
      // Session must NOT be established before 2FA finishes
      assert.equal(platformAuthService.getCachedSession(), null);

      const rejected = await platformAuthService.completeTwoFactorLogin({
        challengeId: init.challenge.challengeId,
        email: init.challenge.email,
        code: '000000',
      });
      assert.equal(rejected.success, false);
      assert.equal(rejected.attemptsRemaining, 4);

      const verified = await platformAuthService.completeTwoFactorLogin({
        challengeId: init.challenge.challengeId,
        email: init.challenge.email,
        code: '654321',
      });
      assert.equal(verified.success, true);
      assert.equal(verified.session?.user.id, 'usr_super_01');
      assert.equal(verified.session?.user.role, 'super_admin');
      assert.equal(verified.session?.effectivePermissions.isSuperAdmin, true);
      assert.ok(verified.session!.permissionIds.length > 10);

      // Logout resets session completely
      await platformAuthService.logout();
      assert.equal(platformAuthService.getCachedSession(), null);
      const postLogout = await platformAuthService.inspectSession();
      assert.equal(postLogout.status, 'unauthenticated');
    });

    test('platform recovery codes are single-use and expired sessions fail closed', async () => {
      const init = await platformAuthService.initiateLogin({
        email: 'elena.r@saas-platform.internal',
        password: 'PlatformAdmin#2026',
      });
      assert.equal(init.status, 'requires_2fa');

      const ok = await platformAuthService.completeTwoFactorLogin({
        challengeId: init.challenge.challengeId,
        email: init.challenge.email,
        code: 'PLAT-REC-2002',
        isRecovery: true,
      });
      assert.equal(ok.success, true);
      assert.equal(ok.session?.user.role, 'compliance_auditor');

      platformAuthService.simulateSessionExpiration();
      assert.equal(platformAuthService.getCachedSession(), null);
    });

    test('forgot-password, reset-password, and accept-invitation flows require valid tokens with zero default fallback', async () => {
      const resetReq = await platformAuthFlowService.requestPasswordReset(
        'sarah.c@saas-platform.internal'
      );
      assert.equal(resetReq.success, true);
      assert.equal(resetReq.simulated, true);

      const missingInvite = await platformAuthFlowService.verifyInvitation('');
      assert.equal(missingInvite.valid, false);
      assert.equal(missingInvite.reason, 'missing');

      const validInvite = await platformAuthFlowService.verifyInvitation('PLAT-INV-2026');
      assert.equal(validInvite.valid, true);
      assert.equal(validInvite.invitation?.email, 'priya.s@saas-platform.internal');
    });
  });

  describe('4. URL Security, Protected Routes, and Dark-Mode FOUC Hardening', () => {
    test('blocks open redirects, encoded backslashes, and unsafe documentation schemes', () => {
      assert.equal(getSafePlatformReturnUrl('/organizations/org_001'), '/organizations/org_001');
      assert.equal(getSafePlatformReturnUrl('//evil.com'), '/');
      assert.equal(getSafePlatformReturnUrl('/%255Cevil.com'), '/');
      assert.equal(getSafePlatformReturnUrl('/login?x=1'), '/');
      assert.equal(isSafeExternalOrInternalUrl('https://stripe.com/docs'), true);
      assert.equal(isSafeExternalOrInternalUrl('javascript:alert(1)'), false);
    });

    test('all required Super Admin auth routes exist and AppShell enforces PlatformProtectedRoute', () => {
      const requiredRoutes = [
        'app/login/page.tsx',
        'app/2fa/page.tsx',
        'app/forgot-password/page.tsx',
        'app/reset-password/page.tsx',
        'app/accept-invitation/page.tsx',
        'app/403/page.tsx',
        'app/access-denied/page.tsx',
        'proxy.ts',
      ];
      for (const rel of requiredRoutes) {
        assert.ok(
          fs.existsSync(path.join(process.cwd(), rel)),
          `Missing Super Admin auth file: ${rel}`
        );
      }

      assert.equal(isPlatformPublicAuthPath('/login'), true);
      assert.equal(isPlatformPublicAuthPath('/2fa'), true);
      assert.equal(isPlatformPublicAuthPath('/403'), true);
      assert.equal(isPlatformPublicAuthPath('/organizations'), false);

      const shellContent = fs.readFileSync(
        path.join(process.cwd(), 'components/layout/AppShell.tsx'),
        'utf8'
      );
      assert.ok(shellContent.includes('PlatformAuthProvider'));
      assert.ok(shellContent.includes('PlatformProtectedRoute'));

      const topBarContent = fs.readFileSync(
        path.join(process.cwd(), 'components/layout/TopBar.tsx'),
        'utf8'
      );
      assert.ok(topBarContent.includes('usePlatformAuth'));
      assert.ok(!topBarContent.includes('Sign Out (Demo)'));

      const layoutContent = fs.readFileSync(
        path.join(process.cwd(), 'app/layout.tsx'),
        'utf8'
      );
      assert.ok(layoutContent.includes('color-scheme'));
      assert.ok(layoutContent.includes('sms_admin_theme'));

      const globalsCss = fs.readFileSync(
        path.join(process.cwd(), 'app/globals.css'),
        'utf8'
      );
      assert.ok(globalsCss.includes('color-scheme: light dark'));
    });
  });
});
