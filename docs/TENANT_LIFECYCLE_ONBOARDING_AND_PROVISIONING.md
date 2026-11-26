# Phase P0-5 — Tenant Lifecycle, Onboarding & Provisioning Alignment Guide (`dashboard/`)

## 1. Canonical Tenant Lifecycle Architecture

The Super Admin control plane (`dashboard/`) and Tenant Dashboard (`frontend/`) share a single authoritative lifecycle and onboarding specification synced deterministically via `dashboard/scripts/build-registry.ts`:

- `dashboard/lib/lifecycle/canonical-lifecycle.ts` -> synced to `frontend/lib/lifecycle/canonical-lifecycle.ts`
- `dashboard/lib/lifecycle/canonical-onboarding.ts` -> synced to `frontend/lib/lifecycle/canonical-onboarding.ts`
- `dashboard/lib/modules/canonical-contract.ts` & `canonical-entitlements.ts` -> synced identically across both apps.

### Lifecycle States (`CanonicalTenantLifecycleStatus`)

1. `draft` — Incomplete pre-submission registration saved by operator.
2. `registration_pending` (legacy alias: `pending`) — Registration submitted for verification review.
3. `onboarding_in_progress` — Accepted tenant completing guided onboarding configuration.
4. `awaiting_configuration` (legacy alias: `inactive`) — Configuration or compliance remediation hold.
5. `awaiting_activation` — Setup and readiness complete; queued for final Super Admin launch sign-off.
6. `trial` — Controlled evaluation tenant workspace.
7. `active` — Full operational institutional workspace.
8. `suspended` — Administrative/compliance suspension.
9. `cancellation_pending` — Scheduled offboarding wind-down period preserving operational export access.
10. `cancelled` — Terminated institutional service.
11. `archived` — Historical read-only archival state.
12. `closed` — Terminal institutional closure (irreversible).

Unrecognized strings normalize safely to `'unknown'`, return empty transition lists (`[]`), fail closed during entitlement/access checks (`unknown_safe_lock`), and never coerce into `active`.

---

## 2. Explicit Separation of Concerns

The following six states are modeled independently on `Organization`, `OrganizationSubscription`, `Campus`, and `TenantContractProjection`:

1. **Tenant Lifecycle Status** (`Organization.status` / `lifecycleStatus`)
2. **Subscription Status** (`OrganizationSubscription.status` / `Organization.subscriptionStatus`: `active`, `trialing`, `past_due`, `expired`, `suspended`, `canceled`, `draft`)
3. **Payment Status** (`Organization.paymentStatus`: `paid`, `pending`, `overdue`, `failed`, `trial_no_charge`, `waived`, `refunded`, `unbilled`)
4. **Onboarding Completion Status** (`Organization.onboardingStatus` + deterministic `evaluateOnboardingChecklist` score)
5. **Campus Operational Status** (`Campus.status`: `active`, `inactive`, `planned`, `under_maintenance`, `suspended`, `archived`, `under_review`)
6. **Module Entitlement Status** (P0-4 `resolveCanonicalEntitlement` across all 398 canonical modules)

---

## 3. Registration Wizard & Honest Provisioning Simulation

- **Registration Wizard (`app/organizations/new/page.tsx`)**:
  - Backed by Zod schemas in `lib/validations/organizationRegistration.ts`.
  - Supports optional `legalName`, ownership `organizationType`, multi-select `institutionCategories`, initial main campus, P0-4 subscription tier compatibility preview, local browser draft save/resume/discard, and Draft vs Registration Pending simulated submission.
- **8-Stage Business Preparation Simulation (`lib/provisioning/simulator.ts`)**:
  - Models `registration_accepted`, `profile_prepared`, `initial_campus_prepared`, `institution_structure_configured`, `subscription_assigned`, `entitlements_prepared`, `initial_administrator_configured`, and `ready_for_activation`.
  - Supports readiness prerequisite blocking, per-stage validation results, warnings/errors, failure-stage simulation, manual review queuing (`ready_for_review`), and retry simulation without claiming database schema creation, RLS setup, DNS zone mutation, or email dispatch.

---

## 4. Future Backend Responsibilities

The following operations are strictly simulated on the client and require future backend API & worker implementation:
- Transactional tenant & main-campus creation, uniqueness constraints, and distributed lock coordination.
- Server-side lifecycle transition enforcement, board closure verification, and immutable audit ledger storage.
- Automated DNS/custom-domain TLS provisioning, relational partition initialization, and transactional administrator/staff invitation emails.
- Commercial billing webhooks driving overdue/expired/cancellation transitions safely.
