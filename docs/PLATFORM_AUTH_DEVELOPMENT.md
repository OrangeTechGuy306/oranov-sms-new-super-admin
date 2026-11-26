# Super Admin Console Authentication — Frontend Simulation Architecture

> **Security Boundary Notice**: Authentication in `dashboard/` is currently a **frontend-only simulation** designed to establish isolated Super Admin UX routes, fail-closed route guards, and session lifecycle handling ahead of backend integration and Phase P0-2 RBAC route enforcement.

---

## 1. Strict Identity Isolation (Platform vs. Tenant)

- **Separate storage & cookies**:
  - Platform simulation session key: `sms_dev_only_platform_session_sim_v1`
  - Platform SSR navigation hint cookie: `sms_platform_session_active` (prod expects `sms_platform_session` HttpOnly cookie)
- **Strict identity boundary**:
  - `lib/auth/platformDemoAccounts.ts` derives platform identities strictly from `ENHANCED_PLATFORM_USERS`, `INITIAL_PLATFORM_ROLES`, `INITIAL_PLATFORM_PERMISSIONS`, and `evaluateEffectivePermissions` in `lib/iam/`.
  - Tenant school accounts (`principal.vance@oakridge.edu`, `teacher`, `parent`, `student`) are unknown to the platform identity registry and are **always rejected**.

---

## 2. Enabling Development Mock Authentication

By default, `dashboard/.env.example` sets `NEXT_PUBLIC_USE_MOCK_AUTH=false`.

1. Copy `dashboard/.env.example` to `dashboard/.env.local` and set:
   ```env
   NEXT_PUBLIC_PLATFORM_API_URL=/api/platform/v1
   NEXT_PUBLIC_USE_MOCK_AUTH=true
   ```
2. Registered platform demo identities in `ENHANCED_PLATFORM_USERS`:
   - `alexander.s@saas-platform.internal` (`super_admin`, 2FA enabled)
   - `sarah.c@saas-platform.internal` (`platform_operator`, 2FA enabled)
   - `marcus.b@saas-platform.internal` (`support_lead`, 2FA enabled)
   - `david.c@saas-platform.internal` (`billing_admin`, 2FA enabled)
   - `elena.r@saas-platform.internal` (`compliance_auditor`, 2FA enabled)
   - `priya.s@saas-platform.internal` (`pending_invite` — blocked from login until invite completed)
   - `jordan.v@saas-platform.internal` (`suspended` — redirected/blocked as restricted account)
3. Production builds (`NODE_ENV === "production"`) permanently disable mock authentication and dev demo helpers.

---

## 3. Protected Routes & P0-2 RBAC Integration Hook

- `proxy.ts` (Next.js 16 convention) + `components/auth/PlatformProtectedRoute.tsx` ensure unauthenticated visitors fail closed to `/login` without flashing protected console content.
- `PlatformAuthContext` exposes `user`, `primaryRole`, `roleDetails`, and `permissions` (from IAM `evaluateEffectivePermissions`), providing a clean integration point for **Phase P0-2** fine-grained route & action authorization.
