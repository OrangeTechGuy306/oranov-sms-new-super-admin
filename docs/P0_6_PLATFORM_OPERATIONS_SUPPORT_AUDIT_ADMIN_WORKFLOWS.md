# Phase P0-6 — Super Admin Platform Operations, Support Desk, Approvals, Notices & Audit Visibility

> **Frontend-Only Simulation Notice:** All P0-6 workflows in `dashboard/` run strictly in browser memory/`localStorage` using deterministic fixtures and `PlatformStore`. No backend APIs, PostgreSQL tables, email/SMS/push dispatches, webhooks, or immutable WORM audit ledgers are implemented here.

---

## 1. Platform-Wide Tenant Operations Center (`/` & `/organizations/[organizationId]`)

- **Engine**: [`dashboard/lib/operations/queues.ts`](../lib/operations/queues.ts) (`computePlatformOperationalOverview`, `queryOperationalQueue`)
- **UI**: [`dashboard/components/operations/PlatformOperationsQueues.tsx`](../components/operations/PlatformOperationsQueues.tsx) integrated into [`dashboard/app/page.tsx`](../app/page.tsx)
- **Canonical State Separation**:
  - Uses P0-5 `normalizeTenantLifecycleStatus()` across all **12 canonical lifecycle states** (`draft`, `registration_pending`, `onboarding_in_progress`, `awaiting_configuration`, `awaiting_activation`, `trial`, `active`, `suspended`, `cancellation_pending`, `cancelled`, `archived`, `closed`) without collapsing unrelated statuses.
  - Exposes separate metrics for incomplete provisioning (`incompleteProvisioningOrganizations`), unresolved support (`organizationsWithUnresolvedSupport`), subscription/payment exceptions (`organizationsWithSubscriptionExceptions`), pending approvals, and open operational exceptions.
- **10 Interactive Queues**:
  1. New Registrations (`new_registrations`)
  2. Pending Reviews (`pending_reviews`)
  3. Incomplete Onboarding (`incomplete_onboarding`)
  4. Awaiting Activation (`awaiting_activation`)
  5. Provisioning Exceptions (`provisioning_exceptions`)
  6. Subscription Exceptions (`subscription_exceptions`)
  7. Suspended Organizations (`suspended_organizations`)
  8. Cancellation Requests (`cancellation_requests`)
  9. Unresolved Support Cases (`unresolved_support_cases`)
  10. Administrative Approvals (`administrative_approvals`)
  Each queue supports search, severity filtering, plan filtering, sorting (`priority_desc`, `date_desc`, `date_asc`, `name_asc`), pagination, and direct links to tenant operational workspaces.
- **Tenant Details Workspace**: [`OrganizationDetailsClient.tsx`](../app/organizations/%5BorganizationId%5D/OrganizationDetailsClient.tsx)
  - Clearly distinguishes **Tenant-Visible Operational Summary** (status, active plan/usage, campus directory, public support requests, safe activity logs) from **Platform-Only Governance Data** (internal provisioning readiness notes, internal ticket notes, platform approvals, operational exceptions).
  - Fixed audit-event matching to correlate both `e.organizationId === organizationId` and `e.targetId === organizationId`.

---

## 2. Support Management System (`/support`)

- **Canonical Contract**: [`dashboard/lib/operations/canonical-operations.ts`](../lib/operations/canonical-operations.ts) (synced byte-for-byte to `frontend/lib/operations/canonical-operations.ts` via `scripts/build-registry.ts`).
- **Statuses & Transitions**:
  - Extends E-09.17 statuses (`new`, `open`, `in_progress`, `awaiting_tenant`, `awaiting_internal`, `escalated`, `resolved`, `closed`) with P0-6 states (`assigned`, `reopened`) in `lib/support/validator.ts`.
  - Assigning an unassigned `new`/`open`/`reopened` case moves it cleanly to `assigned`.
  - Direct jump from `closed` to `in_progress` is blocked; closed/resolved tickets transition through `reopened` with a mandatory >= 5-character rationale (`reopenCount` incremented, `resolvedAt`/`closedAt` cleared).
- **Neutral Ticket Age & Unratified SLA Boundary (Section 6.7)**:
  - `computeTicketNeutralAgeSummary()` displays elapsed case age and time since last public response without inventing unratified contractual guarantees.
  - Legacy E-09.17 `evaluateTicketSla` remains intact strictly as an *"Unratified Sandbox Reference Only — No Contractual SLA Implied"* benchmark.
- **Actor Identity & Fixture Safety**:
  - Removed support operator impersonation selectors (`currentActor`); all mutations attribute to authenticated `usePlatformAuth()` identity via `PlatformStoreContext` `guardPerm(...)`.
  - Fixture reset actions require `isDevControlsEnabled()` + `support.tickets.manage` + confirmation modal.

---

## 3. Administrative Approvals (`/approvals`) & Operational Exceptions (`/exceptions`)

- **Approvals Engine & Anti-Self-Approval (`dashboard/app/approvals/page.tsx`, `ApprovalsWorkspace.tsx`)**:
  - Controlled request types: `tenant_activation`, `tenant_suspension`, `tenant_cancellation`, `subscription_override`, `entitlement_override`, `campus_configuration_change`, `platform_notice_publish`, `exception_waiver`, `high_risk_config_change`.
  - `evaluateApprovalDecision()` strictly prohibits self-approval (`request.requestedBy.id === reviewer.id`), enforces `pending_review` state checks, requires >= 5-character review justification, and records blocked attempts as `APPROVAL_DECISION_BLOCKED` in the audit log.
- **Exceptions Engine (`dashboard/lib/operations/exceptions.ts`, `ExceptionsWorkspace.tsx`)**:
  - Deterministically derives live exceptions from incomplete onboarding, provisioning holds/failures, overdue/failed billing, open/urgent/escalated support cases, and pending governance approvals.
  - Triage actions (`acknowledge`, `in_remediation`, `escalated`, `resolved`, `dismissed`) validate minimum rationale length for terminal/escalation transitions and keep internal exception details `platform_only`.

---

## 4. Platform-to-Tenant Notices (`/communications`) & Audit Explorer (`/audit-logs`)

- **Simulated Notices (`PlatformNoticesPanel.tsx`)**:
  - Supports `draft`, `pending_approval`, `scheduled_simulated`, `published_simulated`, `cancelled`, `archived` with tenant, plan tier, or campus targeting.
  - Publishing notices flagged `requiresApproval` is blocked until an independent operator approves the auto-generated `PlatformApprovalRequest`.
  - Explicitly labels every notice as a simulated in-app advisory (no email/SMS/push delivery occurs).
- **Audit Explorer (`AuditExplorerTable.tsx`, `/audit-logs`)**:
  - Added organization/tenant ID, campus ID, and actor ID filters alongside category, severity, status, and date filters.
  - Enforces `audit.logs.export` permission on exports, attributes export audit events to the authenticated operator, and preserves formula-injection sanitization in `sanitizeCsvCell()`.

---

## 5. Future Backend Responsibilities (Out of Scope for P0-6)

1. Persist operational queues, approval requests, support threads, notices, and exceptions in PostgreSQL with row/tenant foreign keys.
2. Move RBAC (`evaluatePlatformRouteAccess` / permission checks), dual-operator anti-self-approval verification, and fail-closed `projectTicketForTenantView` projection into backend API middleware before network serialization.
3. Replace simulated notice publication and file-attachment metadata with transactional email/SMS/push workers and malware-scanned S3/GCS pre-signed object storage.
4. Implement cryptographically chained / WORM server-side audit storage and real telemetry-driven health probes.
