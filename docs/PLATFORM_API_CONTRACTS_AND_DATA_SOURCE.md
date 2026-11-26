# Super Admin Platform API Contracts, Data-Source Modes, and Cross-App Alignment

## 1. Purpose
This document describes the P0-3 Super Admin (`dashboard/`) contract layer, explicit data-source strategy, and alignment with the Tenant Dashboard (`frontend/`).

---

## 2. Explicit Data-Source Modes (`lib/config/env.ts`, `lib/api/dataSource.ts`)
- `getPlatformFrontendEnvConfig()` and `getPlatformDataSourceMode()` resolve explicitly to `"api"`, `"mock"`, or `"fixture"`.
- When `NODE_ENV === "production"`, `dataSourceMode` locks to `"api"` and `mockAuthEnabled` locks to `false`.
- In `"api"` mode, `platformApiClient` (`lib/api/platformApiClient.ts`) dispatches HTTP requests and throws typed `PlatformApiError` failures (`401`, `403`, `404`, `409`, `422`, `502`, `503`) without silently falling back to local fixtures.
- In `"mock"` / `"fixture"` mode, `executePlatformAdapter` and `executePlatformPaginatedAdapter` return validated fixture data and honor `setPlatformMockFaultInjector(...)` for testing retry/error states.

---

## 3. Platform Contracts & Services (`lib/api/contracts.ts`, `lib/api/platformService.ts`)
- `platformService` currently governs:
  - `listOrganizations()`
  - `listPlans()`
  - `getStudentOversight()`
  - `getAcademicOversight()`
  - `getExaminationGovernance()`
- All responses are checked at runtime using Zod schemas (`organizationSchema`, `campusSchema`, `subscriptionPlanSchema`, `organizationSubscriptionSchema`, `studentOversightRecordSchema`, `academicOversightRecordSchema`, `examGovernanceRecordSchema`).
- Oversights UI pages (`app/student-oversight/page.tsx`, `app/academic-oversight/page.tsx`, `app/examination-governance/page.tsx`) fetch through `platformService`, display explicit loading/error states, and surface `getUserFriendlyPlatformError(err)` with retry actions.
- Global error (`app/error.tsx`) and not-found (`app/not-found.tsx`) boundaries guard navigation across the control plane.

---

## 4. Cross-App Compatibility (`lib/api/tenantContractAdapter.ts`)
Intentional lifecycle and representation differences between Control Plane (`dashboard/`) and Tenant Dashboard (`frontend/`) are bridged explicitly:

1. **Organization -> Tenant Status**:
   - Control Plane `OrganizationLifecycleStatus`: `'active' | 'suspended' | 'pending' | 'inactive' | 'draft' | 'archived'`
   - Tenant Dashboard `TenantStatus`:
     - `'active'` -> `'ACTIVE'`
     - `'suspended'` -> `'SUSPENDED'`
     - `'archived'` -> `'ARCHIVED'`
     - `'pending' | 'inactive' | 'draft'` -> `'INACTIVE'`
2. **Campus Lifecycle Status**:
   - `'under_review'` / `'planned'` -> `'PLANNED'`, `'under_maintenance'` -> `'UNDER_MAINTENANCE'`, `'active'` -> `'ACTIVE'`, `'archived'` -> `'ARCHIVED'`, else `'INACTIVE'`.
3. **Module Entitlement Registry Consistency**:
   - All `includedModuleIds` on `INITIAL_PLANS` (`lib/data/initial-data.ts`) and `INITIAL_EXTENDED_PLANS` (`lib/monetization/fixtures.ts`) reference canonical IDs in `MASTER_MODULE_REGISTRY` (`lib/modules/registry-data.ts`).
   - `deriveTenantFeaturesFromModules()` derives tenant feature flags (`onlineClasses`, `transportManagement`, `hostelManagement`, `libraryManagement`, `payrollManagement`, `cbt`, `finance`, `hr`, `attendance`, `academics`) directly from module entitlements.
   - `INITIAL_CAMPUSES`, `INITIAL_STUDENT_OVERSIGHT_DATA`, and `INITIAL_ACADEMIC_OVERSIGHT_DATA` match canonical `INITIAL_ORGANIZATIONS` names, codes, and campus ownership.
   - `scripts/build-registry.ts` and `tests/module-registry.test.ts` resolve tenant evidence against `../frontend` (no longer stale `tenant-dashboard`).

---

## 5. Verification Checklist
- Typecheck: `cd dashboard && npx tsc --noEmit --incremental false`
- Lint: `cd dashboard && npm run lint`
- Unit & contract suites: `cd dashboard && npm test`
- Production bundle check: `cd dashboard && npm run build`
