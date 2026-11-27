# P0-10 — Super Admin Dashboard (`dashboard/`) Canonical Product Inventory

**Application:** Super Admin Control Plane ([`dashboard/`](file:///Users/mac/Documents/projects/react/sms/dashboard))  
**Audit Phase:** P0-10 — Final Product Completion Audit and Backend Readiness Assessment  
**Baseline Date:** 2026-11-27  
**Route Surface:** `37` Next.js App Router `page.tsx` routes (`30` protected console routes + `7` public/auth/error routes; `95 / 95` statically/partially built paths)  
**Verified Automated Gates (`task-1306`):** `tsc --noEmit`: `0` errors | `npm run lint`: `0` errors (`459` warnings) | `npm test`: `543 / 543` passing across `160` suites (`0` failed, `0` skipped) | `next build`: `95 / 95` routes built cleanly

> [!IMPORTANT]
> **Status Taxonomy Discipline:** Every module uses the strict P0-10 classification taxonomy (`Complete`, `Partially complete`, `UI only`, `Mock workflow`, `Missing`, `Blocked`, `Deferred`). Because [`backend/`](file:///Users/mac/Documents/projects/react/sms/backend) is completely empty (`0` files) and only **3 of 30** protected routes read async `platformService` GET adapters (`/student-oversight`, `/academic-oversight`, `/examination-governance`), client-persisted console mutations (`PlatformStoreContext` / `localStorage`) are honestly classified as **`Mock workflow`** or **`Partially complete`** rather than `Complete` production modules.

---

## 1. Platform Role Architecture & Route Matrix Overview

The Super Admin console defines **7** canonical platform roles in [`dashboard/lib/iam/rbac.ts`](file:///Users/mac/Documents/projects/react/sms/dashboard/lib/iam/rbac.ts) and [`dashboard/lib/iam/fixtures.ts`](file:///Users/mac/Documents/projects/react/sms/dashboard/lib/iam/fixtures.ts) gating `50` granular platform permissions across `30` protected routes (`PLATFORM_ROUTE_POLICIES`):

| Role ID | Permissions (`50` max) | Accessible Protected Routes (`30` total) | Intended Responsibility Scope |
|---|---|---|---|
| `super_admin` | `50 / 50` (`*`) | `30 / 30` | Full SaaS platform, IAM, billing, feature flags, audit, governance & tenant lifecycle control |
| `platform_operator` | `31 / 50` | `26 / 30` (denied `/subscriptions/plans/new`, `/payments`, `/discounts`, `/platform-users`) | Tenant onboarding, lifecycle, provisioning, campuses, support, notices, approvals, exceptions, system health, feature flags |
| `support_lead` | `24 / 50` | `25 / 30` (denied `/subscriptions/plans/new`, `/payments`, `/subscriptions/analytics`, `/discounts`, `/platform-users`) | Support desk, CS tasks, SLA/KB/CSAT, tenant registration create/update, exception triage, invoice voiding |
| `billing_admin` | `14 / 50` | `21 / 30` (denied org creation, student/academic/exam oversight, IAM, health, comms, support, integrations) | Plans, subscriptions, invoices, payments, discounts, renewals, billing analytics & financial exports |
| `compliance_auditor` | `17 / 50` | `24 / 30` (denied org creation, plan creation, payments, sub-analytics, discounts, support) | Read-only audit exploration, security triage/compliance review, data governance read, and audit export |
| `readonly_auditor` | `9 / 50` | `18 / 30` (denied creation, billing mutations, IAM, governance/ops/support) | Read-only platform metrics, tenant directory, analytics read, plan catalogue read (`0` export perms) |
| `custom_operations_intern` | `5 / 50` | `5 / 30` (`/`, `/organizations`, `/organizations/[id]`, `/student-oversight`, `/system-health`) | Strictly scoped read/readiness evaluation trainee (`0` mutations, `0` exports) |

**P0-10 RBAC & Audit Attribution Remediations Verified in `dashboard/`:**
- **RBAC UI Leaks Closed Across Domains A–G:** Gated unprivileged mutation and CSV/JSON export controls in [`app/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/page.tsx), [`PlatformOperationsQueues.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/components/operations/PlatformOperationsQueues.tsx), [`UserDetailModal.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/components/iam/UserDetailModal.tsx), [`RoleDetailModal.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/components/iam/RoleDetailModal.tsx), [`app/subscriptions/**`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/subscriptions), [`SubscriptionNavTabs.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/components/monetization/SubscriptionNavTabs.tsx), [`OrganizationDetailsClient.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/organizations/%5BorganizationId%5D/OrganizationDetailsClient.tsx), [`CampusManagementPanel.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/components/campuses/CampusManagementPanel.tsx), [`ReadinessAndProvisioningPanel.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/components/readiness/ReadinessAndProvisioningPanel.tsx), [`OrganizationEntitlementsPanel.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/components/modules/OrganizationEntitlementsPanel.tsx), [`ModuleDetailModal.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/components/modules/ModuleDetailModal.tsx), [`FeatureFlagsRegistry.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/components/platform-config/FeatureFlagsRegistry.tsx), [`TenantOverridesPanel.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/components/platform-config/TenantOverridesPanel.tsx), [`app/integrations/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/integrations/page.tsx), [`IncidentManagementWorkspace.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/components/system-health/IncidentManagementWorkspace.tsx), [`AlertRulesWorkspace.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/components/system-health/AlertRulesWorkspace.tsx), [`app/data-governance/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/data-governance/page.tsx), [`ReportsExportsWorkspace.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/components/analytics/ReportsExportsWorkspace.tsx), and the 3 oversight pages (`student-oversight`, `academic-oversight`, `examination-governance`).
- **Actor Attribution Fixed:** Replaced hardcoded `'usr_super_01'` and `'usr_audit_04'` actor IDs across [`platform-store.ts`](file:///Users/mac/Documents/projects/react/sms/dashboard/lib/data/platform-store.ts) and [`PlatformStoreContext.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/components/providers/PlatformStoreContext.tsx) with authenticated `getCurrentActor()` resolution (falling back safely when called outside session).

---

## 2. Canonical Module & Submodule Inventory (`dashboard/`)

### Domain A — Platform Overview

#### A.1 Executive Platform Overview & Live Operational Queues
- **Module Name:** Platform Overview
- **Submodule Name:** KPI Dashboard, 12-State Lifecycle Strip & Operational Queues
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** [`dashboard/app/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/page.tsx) (`/`)
- **Roles with Expected Access:** All 7 platform roles (`super_admin`, `platform_operator`, `support_lead`, `billing_admin`, `compliance_auditor`, `readonly_auditor`, `custom_operations_intern`) — with commercial MRR, queues, and audit feeds scoped by role permissions (enforced in P0-10)
- **Required Permissions:** `platform.overview.read` (route guard); conditional `billing.subscriptions.read` / `platform.analytics.read` (MRR/plans), `operations.queues.read` / `operations.approvals.manage` (queues), `audit.logs.read` (recent audit strip)
- **Main Workflows:** Monitor tenant lifecycle distribution across all 12 canonical P0-5 states; triage 10 operational queues (registrations, pending reviews, onboarding, activation, provisioning exceptions, subscription exceptions, suspended tenants, cancellation requests, open support, admin approvals); inspect currency-isolated active MRR totals (fixed P0-10) and live component operational health
- **Existing Components:** `StatCard`, `PlatformOperationsQueues`, `AlertBanner`, `Badge`
- **Existing Data Models / TS Contracts:** `Organization`, `OrganizationSubscription`, `OperationalComponentStatus`, `PlatformApprovalRequest`, `OperationalExceptionRecord`
- **Zod Schemas:** Consumes shared [`canonical-lifecycle.ts`](file:///Users/mac/Documents/projects/react/sms/dashboard/lib/lifecycle/canonical-lifecycle.ts) & [`canonical-operations.ts`](file:///Users/mac/Documents/projects/react/sms/dashboard/lib/operations/canonical-operations.ts) contracts (runtime page reads in-memory store without runtime `.parse()`)
- **Mock-Data Sources:** [`platform-store.ts`](file:///Users/mac/Documents/projects/react/sms/dashboard/lib/data/platform-store.ts), [`initial-data.ts`](file:///Users/mac/Documents/projects/react/sms/dashboard/lib/data/initial-data.ts)
- **Existing Tests:** [`dashboard/tests/platform-store.test.ts`](file:///Users/mac/Documents/projects/react/sms/dashboard/tests/platform-store.test.ts), [`dashboard/tests/p08SuperAdminCompletion.test.ts`](file:///Users/mac/Documents/projects/react/sms/dashboard/tests/p08SuperAdminCompletion.test.ts), [`dashboard/tests/p010AuditRemediation.test.ts`](file:///Users/mac/Documents/projects/react/sms/dashboard/tests/p010AuditRemediation.test.ts)
- **Dependencies:** Organizations, Subscriptions, Support, Approvals, Exceptions, Audit Logs, System Health
- **Backend Requirements:** `GET /api/v1/platform/overview` aggregating currency-grouped MRR, tenant lifecycle counts, paginated operational queue previews, and telemetry summary from DB/Redis
- **Current Implementation Status:** **`Mock workflow`** (P0-10 fixed multi-currency/billing-cycle MRR math and role-scoped visibility of MRR/queues/audit sections)

---

### Domain B — Tenant and Organization Management

#### B.1 Organization Directory & Quick Lifecycle Controls
- **Module Name:** Tenant & Organization Management
- **Submodule Name:** Organization Directory
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** [`dashboard/app/organizations/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/organizations/page.tsx) (`/organizations`)
- **Roles with Expected Access:** All 7 roles (CSV export & create/suspend/reactivate gated)
- **Required Permissions:** `organizations.read`; `organizations.create`, `organizations.lifecycle.manage`, `platform.overview.export` / `organizations.update` (export)
- **Main Workflows:** Filter by text/status (12 canonical + legacy mapping), plan, classification, provisioning state, campus bucket; export sanitized CSV; quick suspend/reactivate/activate confirmation modal (P0-10 fixed `registration_pending`/`awaiting_activation` modal wording)
- **Existing Components:** `DataTable`, `SearchFilterBar`, `ConfirmDialog`, `Badge`
- **Existing Data Models / TS Contracts:** `Organization` (`dashboard/lib/types/organizations.ts`), `OrganizationLifecycleStatus`
- **Zod Schemas:** `organizationSchema` (`dashboard/lib/api/contracts.ts`, used by `platformService.listOrganizations`, not by `organizations/page.tsx` which reads context)
- **Mock-Data Sources:** `platformStore` (`20` seeded orgs `org_001`..`org_020`)
- **Existing Tests:** `organizations.test.ts`, `p05TenantLifecycleOnboardingProvisioning.test.ts`, `p07CrossAppIntegrationAndReadiness.test.ts`
- **Dependencies:** Subscriptions, Campuses, Canonical Lifecycle
- **Backend Requirements:** Server-paginated/sortable `GET /api/v1/platform/organizations`, `POST .../suspend`, `POST .../reactivate`, server-side CSV stream export
- **Current Implementation Status:** **`Mock workflow`** (`DataTable` lacks multi-column sorting and bulk org selection)

#### B.2 Organization Registration & Onboarding Wizard
- **Module Name:** Tenant & Organization Management
- **Submodule Name:** Stepped School Registration & Provisioning Staging
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** [`dashboard/app/organizations/new/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/organizations/new/page.tsx) (`/organizations/new`)
- **Roles with Expected Access:** `super_admin`, `platform_operator`, `support_lead`
- **Required Permissions:** `organizations.create`
- **Main Workflows:** 7-step validated school registration (`draft` vs `registration_pending`), combined institution categories, initial Main Campus creation, primary admin identity, compatible module plan selection, quarterly/monthly/annual billing cycle (added `'quarterly'` in P0-10), trial vs paid subscription staging (fixed P0-10 so `startTrial: true` skips creating an `'issued'` paid invoice and quarterly uses `priceQuarterly`)
- **Existing Components:** `Card`, `Modal`, `AlertBanner`, validation step forms
- **Existing Data Models / TS Contracts:** `CreateOrganizationInput`, `TechnicalConfig`, `CanonicalSchoolCategory`
- **Zod Schemas:** `organizationRegistrationSchema` (`dashboard/lib/validations/organizationRegistration.ts` — active validation at submit)
- **Mock-Data Sources:** `platformStore.createOrganization`
- **Existing Tests:** `p05TenantLifecycleOnboardingProvisioning.test.ts`, `p010AuditRemediation.test.ts`
- **Dependencies:** Plans, Campuses, Subscriptions, Invoices, Invitations
- **Backend Requirements:** Atomic `POST /api/v1/platform/organizations` with `Idempotency-Key`, initial tenant admin invite email dispatch, subdomain availability verification (`RFC 1035`)
- **Current Implementation Status:** **`Mock workflow`**

#### B.3 Organization Detail Workspace (Lifecycle, Campus Governance, Readiness & Provisioning)
- **Module Name:** Tenant & Organization Management
- **Submodule Name:** Organization Workspace, Campus Governance & Readiness Engine
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** [`dashboard/app/organizations/[organizationId]/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/organizations/%5BorganizationId%5D/page.tsx) + [`OrganizationDetailsClient.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/organizations/%5BorganizationId%5D/OrganizationDetailsClient.tsx)
- **Roles with Expected Access:** All 7 roles (`custom_operations_intern` strictly read + readiness evaluation; lifecycle/campus/billing buttons RBAC-gated)
- **Required Permissions:** `organizations.read`, `organizations.update`, `organizations.lifecycle.manage`, `tenants.campuses.manage`, `tenants.readiness.evaluate`, `tenants.provisioning.simulate`, `modules.overrides.manage`
- **Main Workflows:** Execute 12-state lifecycle transitions (`draft` through `closed` with org-code confirmation on termination); evaluate 8-point onboarding readiness; run 8-stage simulated provisioning + failure-injection testing; manage multi-campus hierarchy (single Main Campus invariant + plan quota); manage module overrides & inspect linked org tickets/approvals/exceptions/audits (`generateStaticParams` fixed in P0-10 for all 20 orgs)
- **Existing Components:** `OrganizationDetailsClient`, `CampusManagementPanel`, `ReadinessAndProvisioningPanel`, `OrganizationEntitlementsPanel`, `Tabs`, `ConfirmDialog`
- **Existing Data Models / TS Contracts:** `Organization`, `Campus`, `ProvisioningStep`, `ReadinessReport`, `OnboardingChecklistState`
- **Zod Schemas:** `organizationSchema`, `campusSchema`, `CanonicalLifecycleStateSchema`
- **Mock-Data Sources:** `platformStore`, `lib/readiness/evaluator.ts`, `lib/provisioning/simulator.ts`
- **Existing Tests:** `p05TenantLifecycleOnboardingProvisioning.test.ts`, `p07CrossAppIntegrationAndReadiness.test.ts`, `p010AuditRemediation.test.ts`
- **Dependencies:** Subscriptions, Module Registry, Support, Approvals, Exceptions, Audit Logs
- **Backend Requirements:** Provisioning job orchestrator (DB tenant isolation/RLS verification, DNS CNAME + TLS provisioning, welcome email dispatch); full edit endpoints for legal identity, primary contact transfer, `technicalConfig` (`customDomain`, `sslStatus`, `timezone`, `currency`, `locale`, `maxCampuses`), plus tenant decommissioning / GDPR archive export on `cancelled`/`closed`
- **Current Implementation Status:** **`Partially complete`** (Frontend profile editing still omits `legalName`, `classification`, `contact.email/city/country`, primary admin reassignment, and `technicalConfig` domain/SSL setup UI; live infra provisioning is explicitly simulated)

---

### Domain C — User and Access Management

#### C.1 Platform Authentication & Account Recovery Screens
- **Module Name:** Platform Authentication
- **Submodule Name:** Login, 2FA, Forgot/Reset Password & Invitation Acceptance
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** `/login`, `/2fa`, `/forgot-password`, `/reset-password`, `/accept-invitation`, `/403`, `/access-denied` (`7` public routes under `dashboard/app/`)
- **Roles with Expected Access:** Public / Unauthenticated + Authenticated Platform Admins (`/403`, `/access-denied`)
- **Required Permissions:** Public routes configured in `PLATFORM_PUBLIC_AUTH_PATHS`; fails closed when `NEXT_PUBLIC_USE_MOCK_AUTH !== "true"` in prod
- **Main Workflows:** Email/password login + optional dev quick-signin cards; 6-digit TOTP + single-use recovery code challenge with 5-attempt lockout; privacy-preserving forgot-password response; reset password validation; invitation acceptance with email confirmation
- **Existing Components:** `PlatformAuthContext`, `PlatformProtectedRoute`, auth form components (`components/auth/*`)
- **Existing Data Models / TS Contracts:** `PlatformSession`, `PlatformAuthUser`, `PlatformAuthFlowState` (`lib/types/iam.ts`, `lib/auth/platformAuthFlowService.ts`)
- **Zod Schemas:** Imperative password/token validators in `platformAuthFlowService.ts` (`0` runtime Zod schemas)
- **Mock-Data Sources:** `lib/iam/fixtures.ts`, `platformAuthFlowService.ts`
- **Existing Tests:** `platformAuthSecurity.test.ts`, `platformRbacMatrix.test.ts`, `platformProtectedRoute.test.ts`
- **Dependencies:** Platform IAM (`/platform-users`)
- **Backend Requirements:** Dedicated `/api/v1/platform/auth/*` endpoints with HttpOnly/Secure cookies, TOTP/WebAuthn verification, email-domain/pool isolation from school tenants, brute-force lockouts, and signed invitation tokens
- **Current Implementation Status:** **`Mock workflow`** (`accept-invitation` still retains hardcoded fallback metadata when simulated token omits context)

#### C.2 Platform Administrators, Custom Roles & Permission Matrix
- **Module Name:** User and Access Management
- **Submodule Name:** Platform Users, Roles & Policies Console
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** [`dashboard/app/platform-users/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/platform-users/page.tsx) (`/platform-users`)
- **Roles with Expected Access:** `super_admin`, `compliance_auditor` (read-only)
- **Required Permissions:** `iam.users.read`, `iam.roles.read`, `iam.users.invite`, `iam.users.suspend`, `iam.users.update`, `iam.roles.assign`, `iam.roles.manage`
- **Main Workflows:** Invite platform admin, assign/revoke roles (with anti-self-escalation & last-active-`super_admin` invariants — P0-10 fixed `[user]` -> `users` validator arg and gated `UserDetailModal`/`RoleDetailModal` action buttons), suspend/reactivate user, inspect 50-permission matrix, create/edit/delete custom roles, review admin security activity
- **Existing Components:** `UserDetailModal`, `RoleDetailModal`, `CreateRoleModal`, `InviteUserModal`, `RolePermissionMatrix`
- **Existing Data Models / TS Contracts:** `PlatformUser`, `PlatformRoleDefinition`, `PlatformPermission` (`lib/types/iam.ts`, `lib/types/platform-users.ts`)
- **Zod Schemas:** None (uses `lib/iam/evaluator.ts` domain functions)
- **Mock-Data Sources:** `platformStore`, `lib/iam/fixtures.ts` (`7` seeded admins; note `usr_invite_06` `pending_invite` and `usr_temp_07` `suspended` lack active dev quick-login cards for `readonly_auditor` and standalone `custom_operations_intern`)
- **Existing Tests:** `iam.test.ts`, `platformRbacMatrix.test.ts`, `p09HardeningReadiness.test.ts`, `p010AuditRemediation.test.ts`
- **Dependencies:** Audit Logs, System Settings
- **Backend Requirements:** Server IAM APIs, remote session kill/revocation roster, edit platform user profile (`iam.users.update` currently unimplemented in UI/store), invitation resend/revoke, and periodic privileged Access Recertification campaigns
- **Current Implementation Status:** **`Partially complete`** (Profile editing via `iam.users.update`, user deletion, remote MFA/session revocation, and access certification campaigns are missing)

---

### Domain D — Product and Subscription Management

#### D.1 Master Module Registry & Feature Directory
- **Module Name:** Product and Subscription Management
- **Submodule Name:** Module Registry, Feature Catalogue & Plan Comparison Matrix
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** [`dashboard/app/features/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/features/page.tsx) (`/features`)
- **Roles with Expected Access:** All 6 non-intern roles with `modules.registry.read` (write actions RBAC-gated in P0-10)
- **Required Permissions:** `modules.registry.read`, `modules.registry.manage`, `modules.overrides.manage`
- **Main Workflows:** Browse/filter all **398** canonical modules (`57` top-level, `341` submodules) & **19** canonical platform features; inspect dependency graphs & run `validateRegistry`; toggle platform-wide availability (`ModuleDetailModal` gated in P0-10); apply tenant entitlement overrides (`OrganizationEntitlementsPanel` gated in P0-10); inspect plan-by-module comparison matrix
- **Existing Components:** `ModuleDetailModal`, `OrganizationEntitlementsPanel`, `PlanComparisonMatrix`, `ModuleStatusBadge`
- **Existing Data Models / TS Contracts:** `CanonicalModuleDefinition`, `CanonicalFeatureDefinition`, `TenantEntitlementOverride` (`canonical-contract.ts`)
- **Zod Schemas:** `CanonicalRegistrySnapshotSchema`, `CanonicalModuleDefinitionSchema` (`canonical-contract.ts`)
- **Mock-Data Sources:** `canonical-registry-snapshot.ts`, `platformStore`
- **Existing Tests:** `p04ModuleRegistryEntitlements.test.ts`, `p07CrossAppIntegrationAndReadiness.test.ts`
- **Dependencies:** Plans, Organizations, Tenant Navigation (`frontend/` synced via `build-registry.ts`)
- **Backend Requirements:** `GET/PATCH /api/v1/platform/modules/:id`, `POST /api/v1/platform/organizations/:id/overrides` with cache invalidation event publishing to Redis
- **Current Implementation Status:** **`Mock workflow`**

#### D.2 Subscription Plans & Plan Lifecycle (`plans`, `plans/new`, `plans/[planId]`)
- **Module Name:** Product and Subscription Management
- **Submodule Name:** Plan Catalogue, Builder & Editor
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** `/subscriptions/plans`, `/subscriptions/plans/new`, `/subscriptions/plans/[planId]` (`PlanDetailClient.tsx`)
- **Roles with Expected Access:** Catalogue read (`super_admin`, `platform_operator`, `support_lead`, `billing_admin`, `compliance_auditor`, `readonly_auditor`); Create (`super_admin`, `billing_admin`); Edit/Deprecate (`super_admin`, `billing_admin` — buttons gated in P0-10)
- **Required Permissions:** `billing.subscriptions.read`, `billing.plans.manage`
- **Main Workflows:** Compare 5 tiers (`Starter`, `Growth`, `Enterprise`, `UK Growth`, `Custom Pilot`), create custom plan with module/quota limits, edit existing plan pricing/quotas (**critical bug fixed in P0-10**: `PlanDetailClient` now excludes `plan.id` from `validatePlanDefinition` duplicate check!), deprecate/publish plans
- **Existing Components:** `PlanDetailClient`, `SubscriptionNavTabs` (permission-filtered tabs fixed in P0-10), `SearchFilterBar`, `Modal`
- **Existing Data Models / TS Contracts:** `SubscriptionPlan`, `CanonicalPlanDefinition`
- **Zod Schemas:** `subscriptionPlanSchema` (used by `platformService.listPlans`, not Plan CRUD UI), `CanonicalPlanDefinitionSchema`
- **Mock-Data Sources:** `platformStore`
- **Existing Tests:** `monetization.test.ts`, `p04ModuleRegistryEntitlements.test.ts`, `p010AuditRemediation.test.ts`
- **Dependencies:** Organizations, Module Registry, Subscriptions
- **Backend Requirements:** `PUT/POST/PATCH /api/v1/platform/plans`, grandfathering & migration guard checks for active subscriber cohorts
- **Current Implementation Status:** **`Mock workflow`**

#### D.3 Subscriptions, Invoices, Payments, Discounts, Renewals & Org Billing Console
- **Module Name:** Product and Subscription Management
- **Submodule Name:** Subscriptions, Invoicing, Payments, Discounts & Renewals
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** `/subscriptions`, `/subscriptions/[subscriptionId]`, `/subscriptions/invoices`, `/subscriptions/payments`, `/subscriptions/discounts`, `/subscriptions/renewals`, `/subscriptions/analytics`, `/organizations/[organizationId]/subscription` (`8` routes)
- **Roles with Expected Access:** Billing read (`super_admin`, `billing_admin`, `platform_operator`, `support_lead`, `compliance_auditor`, `readonly_auditor` — narrowed on `/payments`, `/discounts`, `/subscriptions/analytics`); mutations strictly RBAC-gated in P0-10 (`billing.subscriptions.manage`, `billing.invoices.manage`, `billing.payments.manage`, `billing.discounts.manage`, `platform.overview.export`)
- **Required Permissions:** `billing.subscriptions.*`, `billing.invoices.*`, `billing.payments.*`, `billing.discounts.*`, `platform.overview.export`
- **Main Workflows:** Switch plans, toggle add-ons, extend trials, transition 7-state subscription lifecycle, record/retry payments (fixed P0-10 invalid `PaymentMethodType` dropdown options `'credit_card'` -> `'card'`, fixed dynamic `invoice.currency` prompt label instead of hardcoded `(USD)`, fixed `payments/page.tsx` multi-currency buckets instead of lumping NGN/EUR/AUD/CAD into USD), void invoices, generate discount codes, monitor renewals & grace windows
- **Existing Components:** `SubscriptionDetailClient`, `OrganizationSubscriptionClient`, `SubscriptionNavTabs`, `InvoicePrintModal`, `DataTable`
- **Existing Data Models / TS Contracts:** `OrganizationSubscription`, `Invoice`, `PaymentRecord`, `DiscountCode`, `PaymentMethodType` (`lib/types/subscriptions.ts`)
- **Zod Schemas:** `organizationSubscriptionSchema` (`contracts.ts`); none on invoices/payments/discounts at runtime
- **Mock-Data Sources:** `platformStore` (`20` subscriptions, `6` invoices, `6` payments, `4` discounts)
- **Existing Tests:** `monetization.test.ts`, `p08SuperAdminCompletion.test.ts`, `p010AuditRemediation.test.ts`
- **Dependencies:** Organizations, Plans, Approvals, Platform Overview MRR
- **Backend Requirements:** Stripe/Paystack webhook processor (`POST /api/v1/webhooks/billing/:provider`), automated renewal & dunning scheduler, **refunds / credit notes / manual ad-hoc invoice creation / plan proration / discount redemption engine / tax & VAT calculation** (all currently missing!)
- **Current Implementation Status:** **`Partially complete`** (Frontend lacks refund/credit-note issuance, manual invoice creation, discount-to-invoice redemption, and proration math UI; backend gateway/webhooks missing)

---

### Domain E — Platform Operations

#### E.1 Support Desk, CS Tasks, SLA Engine, Knowledge Base & CSAT
- **Module Name:** Platform Operations
- **Submodule Name:** Platform Support Desk & Customer Success
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** [`dashboard/app/support/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/support/page.tsx) (`/support` — 8 tabs)
- **Roles with Expected Access:** `super_admin`, `platform_operator`, `support_lead` (Read/Export/Tasks/SLA/KB gated inside panels; P0-10 note: verify `CustomerSuccessAccountsPanel` & `CustomerSatisfactionPanel` export alignment with `billing`/`auditor` if granted access)
- **Required Permissions:** `support.tickets.read`, `support.tickets.manage`, `support.tickets.escalate`, `support.notes.internal`, `support.sla.manage`, `support.kb.manage`
- **Main Workflows:** Triage ticket queue with SLA breach indicators, assign operators, post `internal_note` (never projected to tenants) vs `tenant_reply`, escalate tickets (`TicketDetailDrawer`), manage CS follow-up tasks & account health scores, author/simulate SLA policies, manage Knowledge Base articles, audit & export CSAT scores
- **Existing Components:** `SupportOverviewPanel`, `TicketRegistryPanel`, `TicketDetailDrawer`, `CustomerSuccessAccountsPanel`, `CustomerSuccessTasksPanel`, `SlaPolicyManagementPanel`, `KnowledgeBasePanel`, `CustomerSatisfactionPanel`, `SupportAnalyticsPanel`
- **Existing Data Models / TS Contracts:** `SupportTicket`, `SlaPolicy`, `KnowledgeBaseArticle`, `CustomerSuccessTask`, `CsatSurveyRecord` (`lib/types/support-desk.ts`, `canonical-operations.ts`)
- **Zod Schemas:** None on platform side (tenant side uses `createSupportTicketSchema` in `frontend/lib/api/supportApi.ts`)
- **Mock-Data Sources:** `platformStore`, `lib/support/fixtures.ts` (`12` tickets)
- **Existing Tests:** `support-desk.test.ts`, `p06PlatformSupportAuditAdminWorkflows.test.ts`, `p07CrossAppIntegrationAndReadiness.test.ts`
- **Dependencies:** Organizations (`org_001`..`org_020`), Tenant Support (`/support`), Exceptions
- **Backend Requirements:** Persistent support ticketing API, strict serializer projecting `projectTicketForTenantView`, email/in-app notification dispatch on replies, and **audited break-glass/read-only tenant support view or delegated auth handoff**
- **Current Implementation Status:** **`Mock workflow`**

#### E.2 Approvals Queue & Operational Exceptions Triage
- **Module Name:** Platform Operations
- **Submodule Name:** Dual-Control Approval Workflows & Exceptions Queue
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** `/approvals` ([`app/approvals/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/approvals/page.tsx)), `/exceptions` ([`app/exceptions/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/exceptions/page.tsx))
- **Roles with Expected Access:** `super_admin`, `platform_operator`, `support_lead`, `billing_admin`, `compliance_auditor`
- **Required Permissions:** `operations.queues.read`, `operations.approvals.manage`, `operations.exceptions.manage`
- **Main Workflows:** Review sensitive actions (high-risk lifecycle changes, overrides, notices), enforce maker-checker anti-self-approval (`requestedBy.id !== reviewer.id`), require decision rationale; log, triage, escalate & resolve provisioning/billing/compliance operational exceptions with visibility controls (`platform_only` vs `tenant_summary_safe`)
- **Existing Components:** `ApprovalsWorkspace`, `ExceptionsWorkspace`, `ConfirmDialog`
- **Existing Data Models / TS Contracts:** `PlatformApprovalRequest`, `OperationalExceptionRecord` (`canonical-operations.ts`)
- **Zod Schemas:** Shared TS contracts in `canonical-operations.ts`
- **Mock-Data Sources:** `platformStore` (`5` approvals, `16` exceptions)
- **Existing Tests:** `p06PlatformSupportAuditAdminWorkflows.test.ts`, `p09HardeningReadiness.test.ts`
- **Dependencies:** Organizations, Subscriptions, Audit Logs, Tenant Notices
- **Backend Requirements:** Server-side dual-control state machine locking target mutations until distinct approver signs off + immutable audit capture on blocked self-approvals
- **Current Implementation Status:** **`Mock workflow`**

#### E.3 Tenant Notices, Communication Templates, Providers & Campaigns
- **Module Name:** Platform Operations
- **Submodule Name:** Platform Communications, Notices & Campaign Planner
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** [`dashboard/app/communications/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/communications/page.tsx) (`/communications` — 9 tabs)
- **Roles with Expected Access:** `super_admin`, `platform_operator`, `support_lead`, `compliance_auditor`
- **Required Permissions:** `communications.read`, `communications.notices.manage`, `communications.templates.manage`, `communications.campaigns.manage`
- **Main Workflows:** Publish/archive targeted Tenant Notices (tenant/plan/campus filters synced via `canonical-operations.ts`); author/preview/version communication templates; configure delivery policies & simulate quiet-hours routing; inspect simulated provider readiness (`Postmark`/`Twilio`/etc.), retry mock failed deliveries, plan multi-tenant campaigns
- **Existing Components:** `PlatformNoticesPanel`, `TemplateRegistryPanel`, `NotificationPoliciesPanel`, `ChannelProvidersPanel`, `DeliveryHistoryPanel`, `CampaignPlannerPanel`, `TenantCommunicationConfigPanel`, `PreferencesSuppressionPanel`, `CommunicationExportModal`
- **Existing Data Models / TS Contracts:** `PlatformNotice`, `NotificationTemplate`, `DeliveryRecord`, `CommunicationCampaign` (`lib/types/communications.ts`)
- **Zod Schemas:** Template variable syntax validators in `lib/communications/`
- **Mock-Data Sources:** `platformStore`, `lib/communications/fixtures.ts` (`5` notices)
- **Existing Tests:** `communications.test.ts`, `p07CrossAppIntegrationAndReadiness.test.ts`
- **Dependencies:** Organizations, Approvals, Tenant Notices (`/communications` / Header bell in `frontend/`)
- **Backend Requirements:** Transactional email/SMS/push provider SDK wiring (SES/Postmark/Termii/Twilio), webhook bounce/complaint suppression ingestion, real async campaign batch queue
- **Current Implementation Status:** **`Partially complete`** (`PlatformNoticesPanel` works cleanly in mock and sub-tabs handle UI CRUD, **but** live campaign execution/provider webhooks are non-existent and secondary panels (`TemplateRegistryPanel`, `NotificationPoliciesPanel`, `ChannelProvidersPanel`, `CampaignPlannerPanel`) still lack granular UI button hiding beyond route/export checks for `support_lead`/`compliance_auditor`)

---

### Domain F — Governance and Compliance

#### F.1 Platform Audit Explorer, Security Triage & Compliance Controls
- **Module Name:** Governance and Compliance
- **Submodule Name:** Audit Logs, Security Activity & Legacy Retention Tab
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** [`dashboard/app/audit-logs/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/audit-logs/page.tsx) (`/audit-logs` — 5 tabs)
- **Roles with Expected Access:** `super_admin`, `platform_operator`, `support_lead`, `billing_admin`, `compliance_auditor`
- **Required Permissions:** `audit.logs.read`, `audit.logs.export`, `audit.governance.manage`
- **Main Workflows:** Multi-facet audit search/filter/sort across categories, severity, actor, org, campus, date range (`explorer` + `timeline`); triage security events; update compliance control remediation & evidence verification (**P0-10 fixed hardcoded `usr_super_01`/`usr_audit_04` actor bug in `platform-store.ts`**); inspect legacy `retentionPolicies`; sanitized CSV/JSON export
- **Existing Components:** `AuditLogExplorer`, `AuditTimelineView`, `SecurityActivityWorkspace`, `ComplianceGovernanceWorkspace`, `DataRetentionPolicyWorkspace`, `AuditExportModal`
- **Existing Data Models / TS Contracts:** `AuditEvent`, `SecurityEvent`, `ComplianceControl`, `RetentionPolicy` (`lib/types/audit-logs.ts`)
- **Zod Schemas:** None at runtime
- **Mock-Data Sources:** `platformStore` (`26` initial events + runtime actions)
- **Existing Tests:** `audit-logs.test.ts`, `p06PlatformSupportAuditAdminWorkflows.test.ts`, `p09HardeningReadiness.test.ts`
- **Dependencies:** All mutating console operations
- **Backend Requirements:** Append-only cryptographic WORM audit table partitioned by `(created_at, organization_id)`, SIEM syslog/OpenTelemetry streaming, **unification of split `retentionPolicies` (`/audit-logs`) vs `governanceRetentionPolicies` (`/data-governance`) stores**
- **Current Implementation Status:** **`Mock workflow`** (Clean exploration & attribution in memory; split retention store remains unmerged until backend unifies policy schema)

#### F.2 Data Governance, Privacy (DSAR) & Legal Holds
- **Module Name:** Governance and Compliance
- **Submodule Name:** Classification Inventory, Retention Policies, DSAR Queue & Exceptions
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** [`dashboard/app/data-governance/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/data-governance/page.tsx) (`/data-governance` — 8 tabs)
- **Roles with Expected Access:** `super_admin`, `platform_operator`, `support_lead`, `billing_admin`, `compliance_auditor` (`audit.governance.manage` & export RBAC-gated in P0-10)
- **Required Permissions:** `data_governance.read` / `audit.logs.read`, `audit.governance.manage`, `audit.logs.export`
- **Main Workflows:** Manage 14 data classification categories; edit `governanceRetentionPolicies`; process & simulate DSAR access/erasure requests; configure lifecycle purge rules & legal holds; review exceptions & per-tenant governance posture; export compliance bundle (**P0-10 gated all edit/create/simulate/export actions cleanly across tabs**)
- **Existing Components:** `DataClassificationTab`, `RetentionPoliciesTab`, `PrivacyRequestsTab`, `LifecycleRulesTab`, `GovernanceExceptionsTab`, `TenantPostureDrawer`, `GovernanceAuditTab`
- **Existing Data Models / TS Contracts:** `DataCategory`, `GovernanceRetentionPolicy`, `PrivacyRequest`, `LifecycleRule`, `GovernanceException` (`lib/types/data-governance.ts`)
- **Zod Schemas:** None at runtime
- **Mock-Data Sources:** `platformStore` (`14` categories, `7` privacy requests)
- **Existing Tests:** `data-governance.test.ts`, `p010AuditRemediation.test.ts`
- **Dependencies:** Organizations, Audit Logs (`/audit-logs` legacy retention store still separate)
- **Backend Requirements:** Actual DSAR anonymization/hard-erasure worker cascading across PostgreSQL & object storage + unified `retention_policies` table
- **Current Implementation Status:** **`Mock workflow`**

#### F.3 Cross-Tenant Privacy-Preserving Oversight (`student-oversight`, `academic-oversight`, `examination-governance`)
- **Module Name:** Governance and Compliance
- **Submodule Name:** Student, Academic & Examination Governance Consoles
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** `/student-oversight`, `/academic-oversight`, `/examination-governance` (`3` pages)
- **Roles with Expected Access:** `super_admin`, `platform_operator`, `support_lead`, `compliance_auditor`, `readonly_auditor`, `custom_operations_intern` (`/student-oversight` only)
- **Required Permissions:** `oversight.students.read` / `.export`, `oversight.academics.read` / `.export`, `governance.examinations.read` / `.export` (**export buttons gated in P0-10**)
- **Main Workflows:** Inspect aggregate enrollment/admissions/attendance, curriculum/lesson coverage/assessment completion, and CBT integrity/result-publication anomalies across tenants without exposing raw student PII; drill into organization metrics; export sanitized CSVs (**sole 3 routes in `dashboard/` backed by async `platformService` + Zod validation + Loading/Error/Retry state!**)
- **Existing Components:** `StudentOversightTable`, `AcademicOversightFilters`, `ExaminationGovernanceTable`, Drilldown Modals
- **Existing Data Models / TS Contracts:** `StudentOversightRecord`, `AcademicOversightRecord`, `ExamGovernanceRecord`
- **Zod Schemas:** `studentOversightRecordSchema`, `academicOversightRecordSchema`, `examGovernanceRecordSchema` (`dashboard/lib/api/contracts.ts` — **validated at runtime**)
- **Mock-Data Sources:** `platformService` -> `platformStore` fallback in mock mode (fails loudly with Retry banner in `"api"` mode on `401/403/502/503`)
- **Existing Tests:** `p03ApiContractsAndDataSource.test.ts`, `student-oversight.test.ts`, `academic-oversight.test.ts`, `examination-governance.test.ts`, `p010AuditRemediation.test.ts`
- **Dependencies:** Tenant Students/Academics/Examinations data warehouses
- **Backend Requirements:** Privacy-scrubbed cross-tenant SQL rollup endpoints returning aggregate metrics without student-level PII rows
- **Current Implementation Status:** **`Mock workflow`** (Best API-adapter readiness in `dashboard/`: Zod-validated async reads + fail-closed error UI; awaits live backend SQL endpoints)

---

### Domain G — Platform Configuration

#### G.1 Platform Settings, Feature Flags, Tenant Overrides & Maker-Checker Governance
- **Module Name:** Platform Configuration
- **Submodule Name:** Global Settings, Feature Flags & Change Governance
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** [`dashboard/app/settings/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/settings/page.tsx) (`/settings` — 7 tabs)
- **Roles with Expected Access:** `super_admin`, `platform_operator`, `support_lead`, `billing_admin`, `compliance_auditor`, `readonly_auditor`
- **Required Permissions:** `platform.settings.read`, `platform.settings.manage`, `platform.flags.manage`, `platform.overrides.manage` (**P0-10 gated `FeatureFlagsRegistry` & `TenantOverridesPanel` mutation buttons**)
- **Main Workflows:** Manage global security/session/storage/SMTP config; register, toggle, delete & schedule rollout for 10 feature flags; set per-tenant flag overrides; view environment diagnostics; submit & dual-control approve config change proposals (`createChangeProposal` -> distinct reviewer approves -> `applied_locally`); browse version history
- **Existing Components:** `GlobalSettingsPanel`, `FeatureFlagsRegistry`, `TenantOverridesPanel`, `EnvironmentConfigPanel`, `RolloutPlannerPanel`, `ChangeGovernancePanel`, `ConfigVersionHistoryPanel`
- **Existing Data Models / TS Contracts:** `PlatformSettings`, `FeatureFlag`, `TenantFlagOverride`, `ConfigChangeProposal` (`lib/types/platform-config.ts`)
- **Zod Schemas:** None at runtime
- **Mock-Data Sources:** `platformStore` (`10` feature flags)
- **Existing Tests:** `platform-config.test.ts`, `p09HardeningReadiness.test.ts`, `p010AuditRemediation.test.ts`
- **Dependencies:** Organizations, Audit Logs
- **Backend Requirements:** Versioned config store, runtime LaunchDarkly/DB-backed feature flag evaluator, server-enforced maker-checker commit pipeline
- **Current Implementation Status:** **`Mock workflow`**

#### G.2 Platform Integrations, API Clients & Webhooks Console
- **Module Name:** Platform Configuration
- **Submodule Name:** Integration Connectors, API Clients & Webhook Diagnostics
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** [`dashboard/app/integrations/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/integrations/page.tsx) (`/integrations` — 8 tabs)
- **Roles with Expected Access:** `super_admin`, `platform_operator`, `support_lead`, `compliance_auditor`, `readonly_auditor`
- **Required Permissions:** `integrations.read`, `integrations.manage`, `integrations.webhooks.manage`, `platform.overview.export` (**P0-10 added full `usePlatformAuth` RBAC gating across page and all mutation/export tabs!**)
- **Main Workflows:** Configure & run simulated verification on 12 payment/SMS/email/storage/telemetry connectors; mint masked API clients & revoke keys safely (secrets never revealed in DOM post-creation); configure webhook endpoints & dispatch simulated test payloads; retry exhausted deliveries & export sanitized delivery/audit CSVs
- **Existing Components:** `IntegrationRegistryTab`, `ApiClientsTab`, `WebhookEndpointsTab`, `WebhookDeliveryLogsTab`, `IntegrationAuditTab`
- **Existing Data Models / TS Contracts:** `IntegrationConnector`, `ApiClientRecord`, `WebhookEndpoint`, `WebhookDeliveryLog` (`lib/types/integrations.ts`)
- **Zod Schemas:** URL/payload validators in `lib/integrations/`
- **Mock-Data Sources:** `platformStore` (`12` connectors)
- **Existing Tests:** `integrations.test.ts`, `p09HardeningReadiness.test.ts`, `p010AuditRemediation.test.ts`
- **Dependencies:** System Health, Billing Webhooks, Communications
- **Backend Requirements:** Encrypted secret vault (`KMS`), bcrypt/argon2 hashed API client tokens, outbound HMAC-signed webhook worker with exponential backoff
- **Current Implementation Status:** **`Mock workflow`**

#### G.3 System Health, Incidents, Maintenance Windows, Alerts & Backups
- **Module Name:** Platform Configuration
- **Submodule Name:** SRE Observability, Incidents, Alerts & Maintenance Windows
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** [`dashboard/app/system-health/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/system-health/page.tsx) (`/system-health`)
- **Roles with Expected Access:** All 7 roles (`system.operations.read`) — P0-10 added RBAC gating to [`IncidentManagementWorkspace.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/components/system-health/IncidentManagementWorkspace.tsx) (`system.incidents.manage`) and [`AlertRulesWorkspace.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/components/system-health/AlertRulesWorkspace.tsx) (`system.alerts.manage`) matching `MaintenanceWindowsWorkspace`
- **Main Workflows:** Monitor component availability & latency; acknowledge/reopen/resolve incidents with MTTR notes; schedule/activate/complete maintenance windows; author & toggle threshold alert rules; inspect simulated BullMQ queue depth, static backup fixtures, deployments & tenant readiness rollups
- **Existing Components:** `IncidentManagementWorkspace`, `MaintenanceWindowsWorkspace`, `AlertRulesWorkspace`, `BackupReadinessWorkspace`, `BackgroundJobsWorkspace`, `MetricsExplorerWorkspace`
- **Existing Data Models / TS Contracts:** `OperationalComponentStatus`, `PlatformIncident`, `MaintenanceWindow`, `AlertRule` (`lib/types/system-health.ts`)
- **Zod Schemas:** None at runtime
- **Mock-Data Sources:** `platformStore`, static health/backup fixtures
- **Existing Tests:** `system-health.test.ts`, `p08SuperAdminCompletion.test.ts`, `p010AuditRemediation.test.ts`
- **Dependencies:** Overview (`operationalComponents`), Audit Logs
- **Backend Requirements:** Prometheus/OpenTelemetry metrics backend, PagerDuty/Opsgenie alert webhook wiring, real BullMQ queue telemetry, automated `pg_dump`/RDS snapshot execution & restore verification (backups are static display fixtures today)
- **Current Implementation Status:** **`Partially complete`** (Backup & background job monitors are non-interactive display/fixture views; live SRE metrics & backup execution are missing)

#### G.4 Platform Analytics, BI & Executive Reporting
- **Module Name:** Platform Configuration
- **Submodule Name:** Multi-Domain Platform Analytics & Custom Report Exporter
- **Application Ownership:** Super Admin Dashboard (`dashboard/`)
- **Route / Page Location:** [`dashboard/app/analytics/page.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/app/analytics/page.tsx) (`/analytics` — 10 tabs)
- **Roles with Expected Access:** `super_admin`, `platform_operator`, `support_lead`, `billing_admin`, `compliance_auditor`, `readonly_auditor`
- **Required Permissions:** `platform.analytics.read`, `platform.overview.export` (**P0-10 gated CSV/JSON downloads in [`ReportsExportsWorkspace.tsx`](file:///Users/mac/Documents/projects/react/sms/dashboard/components/analytics/ReportsExportsWorkspace.tsx) on `can('platform.overview.export')`**)
- **Main Workflows:** Inspect tenant growth across all 12 lifecycle states, currency-isolated monetization/ARPU cohorts, module adoption, support SLA performance, ops queues, communications delivery, and compliance trends; export curated CSV/JSON reports (`savedReports` definition state remains volatile in React `useState`)
- **Existing Components:** `ExecutiveOverview`, `TenantGrowth`, `Monetization`, `ModuleAdoption`, `SupportSuccess`, `Operations`, `Communications`, `AuditGovernance`, `ReportsExportsWorkspace`, `MetricCatalog`
- **Existing Data Models / TS Contracts:** `AnalyticsDimension`, `PlatformMetricCatalogItem` (`lib/types/analytics.ts`)
- **Zod Schemas:** None at runtime
- **Mock-Data Sources:** `platformStore` aggregate derivations
- **Existing Tests:** `analytics.test.ts`, `p08SuperAdminCompletion.test.ts`, `p010AuditRemediation.test.ts`
- **Dependencies:** All Platform Domains (`A–F`)
- **Backend Requirements:** SQL analytical warehouse / materialized views (`ClickHouse`/`PostgreSQL` read replica), persisted saved-report definitions & scheduled report email delivery
- **Current Implementation Status:** **`Partially complete`** (`savedReports` resets on page reload; role-specific tab scoping inside `/analytics` still exposes financial tabs to non-billing roles that hold `platform.analytics.read`)

---

## 3. Missing Platform Administration Capabilities Required to Operate the Tenant Product

Comparing all **553** routes in [`frontend/`](file:///Users/mac/Documents/projects/react/sms/frontend) against the `30` protected routes in `dashboard/` identifies **6 mandatory platform administration gaps** prior to commercial launch:

1. **Tenant User Support, MFA/Session Reset & Audited Break-Glass Console (`Missing`):** Super Admin has zero visibility into school-level user accounts (`AuthUser`), locked principals/teachers, failed tenant logins, MFA resets, invitation resends, or audited read-only/time-boxed impersonation for customer support escalation.
2. **Custom Domain DNS & SSL/TLS Management (`Missing`):** `TechnicalConfig.customDomain` and `sslStatus` exist in the data contract, but no workflow exists to add CNAME records, verify DNS propagation, provision TLS certs, or edit school operational locale (`timezone`, `currency`, `maxCampuses`) post-onboarding.
3. **Billing Refunds, Credit Notes, Manual Invoices, Tax/VAT & Dunning (`Missing`):** Monetization supports plan checkout, manual payment entry, and invoice voiding, but lacks SaaS refunds, credit notes, ad-hoc invoice adjustments, proration calculators, VAT/WHT settings, discount redemption at checkout, and automated dunning retries.
4. **Platform Admin Profile Edit (`iam.users.update`) & Access Certification (`Missing`):** `iam.users.update` is a declared permission with no UI/store handler to edit admin profile metadata, force MFA resets, revoke other admin sessions, or run quarterly privileged access reviews.
5. **Backup Execution, Tenant Offboarding Export & Automated DSAR Deletion (`Missing`):** `BackupReadinessWorkspace` and `PrivacyRequestsTab` are static/simulated — platform engineers cannot export a closed tenant's full data archive or run cascading DB/S3 erasure jobs.
6. **`DataTable` Multi-Column Sorting, Bulk Operations & Server Pagination (`Partially complete`):** `executePlatformPaginatedAdapter` currently has **0 production callers** across `dashboard/`, and `DataTable.tsx` lacks server-cursor sorting and batch checkbox actions at multi-hundred-tenant scale.
