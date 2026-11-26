# Platform Module Registry, Subscription Plans & Entitlement Architecture (P0-4)

## Overview

Phase P0-4 establishes a single **Canonical Frontend Module, Feature, Subscription Plan & Entitlement Contract** shared deterministically between the Super Admin Dashboard (`dashboard/`) and the Tenant Dashboard (`frontend/`).

**Scope & Boundary Rule (Strictly Frontend-Only):**
- All registry catalogues, plan definitions, add-ons, trial extensions, and overrides operate in client-side React state and mock/dev stores (`PlatformStore` in `dashboard/`, `TenantStore` + `DEV_TENANT_SCENARIOS` in `frontend/`).
- No backend APIs, PostgreSQL schemas, payment webhooks, or server-side middleware enforcement are implemented in this phase.
- **Synchronization Mechanism:** `dashboard/scripts/build-registry.ts` generates canonical Zod contracts, resolver logic, and full snapshots directly into both:
  - `dashboard/lib/modules/{canonical-contract.ts,canonical-entitlements.ts,canonical-registry-snapshot.ts}`
  - `frontend/lib/modules/{canonical-contract.ts,canonical-entitlements.ts,canonical-registry-snapshot.ts}`

Run after modifying registry mappings or route coverage:

```bash
cd dashboard && npx tsx scripts/build-registry.ts
```

---

## Canonical Counts & Taxonomy

- **Canonical Modules:** **398** (`57` top-level modules including deprecated `mod_teachers`; `341` submodules including `sub_teachers_directory` and `sub_teachers_new`).
- **Canonical Features (`feat_*`):** **19** fine-grained feature definitions linked cleanly to parent module IDs (`mod_*` / `sub_*`), separating `implemented`, `partial`, and `planned` implementation maturity from `available`, `enabled`, `disabled`, `coming_soon`, `deprecated`, and `unavailable` status.
- **Consolidated Subscription Plans:** **5** canonical plans (`plan_starter`, `plan_growth`, `plan_enterprise`, `plan_uk_growth`, `plan_custom_pilot`), eliminating the prior `INITIAL_PLANS` (3-plan) vs `INITIAL_EXTENDED_PLANS` (5-plan) divergence while preserving existing commercial prices, currencies, trial lengths, and student/staff/campus/storage ceilings.
- **Physical Route Coverage:** **541** discovered `app/(tenant)` and `app/(print)` routes verified against `frontend/app/` with `0` validation errors.

---

## Implementation Maturity vs. Subscription Availability

P0-4 strictly decouples engineering readiness from commercial availability:
- `implementationMaturity`: `'implemented' | 'partial' | 'planned'`
  - Example: `mod_analytics`, `sub_exam_cbt_sync`, `sub_notifications_integrations`, `sub_reports_schedules`, `mod_documents_signatures`, and `mod_procurement` carry `'partial'` maturity even when included in Growth/Enterprise plans, surfaced with explicit warnings in `/features`, `ModuleDetailModal`, `PlanComparisonMatrix`, and onboarding Step 5.
- `availabilityStatus`: `'available' | 'enabled' | 'disabled' | 'coming_soon' | 'deprecated' | 'unavailable'`
  - Deprecated `/teachers*` aliases (`mod_teachers`, `sub_teachers_directory`, `sub_teachers_new`) are marked `deprecated` with replacement `'mod_staff'` and rejected by published plan validation (`DEPRECATED_IN_ACTIVE_PLAN`).
  - Roadmap features (`feat_custom_domain`, `feat_whatsapp_alerts`, `feat_ai_grading_assistant`) are marked `coming_soon` and blocked cleanly by the resolver.

---

## Fail-Closed Precedence Rules (`resolveCanonicalEntitlement`)

Evaluation never defaults open on unknown IDs, empty `includedModuleIds`, or missing tenant/plan state:

1. Resolve canonical target (`moduleId`, `featureId`, or `featureKey`) — unknown IDs fail closed (`UNKNOWN_MODULE_OR_FEATURE`).
2. Verify tenant entitlement context — missing context fails closed (`MISSING_ENTITLEMENT_DATA`).
3. Verify tenant lifecycle status (`suspended | inactive | archived`) — fails closed (`TENANT_SUSPENDED`).
4. Verify subscription lifecycle (`canceled | expired | missing | expired trial | expired grace period`) — fails closed (`SUBSCRIPTION_INACTIVE`, `TRIAL_EXPIRED`, `GRACE_PERIOD_EXPIRED`, `MISSING_SUBSCRIPTION`).
5. Check global platform availability (`deprecated`, `coming_soon`, `disabled`, `unavailable`).
6. Check `supportedSchoolTypes` compatibility (`UNSUPPORTED_SCHOOL_TYPE`).
7. Evaluate active administrative `force_disable` override (`DISABLED_BY_OVERRIDE`).
8. Evaluate tenant-local toggle (`tenantFeatureToggles[key] === false` -> `TENANT_FEATURE_DISABLED`).
9. Recursively validate parent module and required dependency chain (cycle-safe -> `MISSING_DEPENDENCY`).
10. Evaluate usage quotas against plan ceilings (`students`, `staff`, `campuses`, `storage`).
11. Resolve grants in deterministic order: active `force_enable` / `trial_extension` override (`ENTITLED_BY_OVERRIDE`) > active non-expired add-on (`ENTITLED_BY_ADDON`) > active plan/grace inclusion (`ENTITLED_BY_PLAN` / `ENTITLED_BY_GRACE_PERIOD`) > restricted (`REQUIRES_ADDON` / `PLAN_RESTRICTED`).

---

## Super Admin UI Alignments

- **`/features` & `ModuleDetailModal.tsx`**: Live plan sync, inline metadata/maturity/availability/dependency editing (simulated), coming-soon/deprecated/partial/unassigned filters, and `feat_*` registry editing.
- **`PlanComparisonMatrix.tsx`**: Dynamically computed from live `PlatformStore.plans` via `generatePlanComparisonRowsFromRegistry`, with school-type filtering, usage limits, add-on indicators, and upgrade pathways.
- **`/subscriptions/plans/[planId]` & `/subscriptions/plans/new`**: Full field editing (`maxStaff`, `trialDays`, `visibility`, `billingIntervals`, `targetSchoolTypes`, `optionalAddOnModuleIds`, `upgradeToPlanIds`, `downgradeToPlanIds`), live dependency auto-resolution + Zod/graph validation, unsaved-change indicator, archive/deprecate confirmation modal, and live matrix preview.
- **`/subscriptions/[subscriptionId]`**: Simulated trial window extension (`extendSubscriptionTrial`), add-on grant/expire/revoke (`manageSubscriptionAddOn`), plan switching (`updateOrganizationPlan`), and real-time evaluated entitlement inspection.
- **`/organizations/new`**: Plan selection and Step 5 entitlements preview derived directly from live `plan.includedModuleIds` with school-type compatibility warnings.

---

## Future Backend Requirements

1. Authoritative relational tables (`platform_modules`, `platform_features`, `subscription_plans`, `plan_module_entitlements`, `tenant_subscriptions`, `tenant_addons`, `tenant_entitlement_overrides`) with immutable audit logs.
2. Signed tenant session claims or server-side entitlement middleware rejecting unentitled/disabled/expired API calls with HTTP `403`.
3. Real billing provider integration (Stripe/Paystack/etc.) driving idempotent webhook transitions for trials, renewals, invoices, add-ons, and grace periods.
4. Product Owner configuration for add-on SKUs and commercial pricing notes marked `requires_product_owner_configuration`.
