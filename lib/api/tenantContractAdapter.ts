/**
 * Super Admin <-> Tenant Dashboard Shared Contract Compatibility Adapter
 *
 * Documents and bridges intentional enum/shape differences between the
 * Super Admin Control Plane (`dashboard/`) and Tenant Dashboard (`frontend/`):
 *
 * 1. Organization vs Tenant Status:
 *    - Control Plane (`Organization['status']`): `'active' | 'suspended' | 'pending' | 'inactive' | 'draft' | 'archived'`
 *    - Tenant Dashboard (`SchoolTenant.status`): `'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED'`
 *
 * 2. Campus Lifecycle Status:
 *    - Control Plane (`Campus['status']`): mapped explicitly onto `'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'PLANNED' | 'UNDER_MAINTENANCE'`
 *
 * 3. Module Entitlements & Feature Flags:
 *    - Control Plane plans specify `includedModuleIds` matching `MASTER_MODULE_REGISTRY`.
 *    - Tenant Dashboard derives both `includedModuleIds` and boolean `features` map from those IDs.
 */

import type { Organization } from "@/lib/types/organizations";
import type { Campus, CampusStatus } from "@/lib/types/campuses";
import type { SubscriptionPlan } from "@/lib/types/subscriptions";

export type OrganizationStatusCompat = Organization["status"];
export type OrganizationClassificationCompat = Organization["classification"];
export type TenantStatusCompat = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ARCHIVED";
export type TenantCampusStatusCompat =
  | "ACTIVE"
  | "INACTIVE"
  | "ARCHIVED"
  | "PLANNED"
  | "UNDER_MAINTENANCE";

export interface TenantContractProjection {
  id: string;
  name: string;
  code: string;
  slug: string;
  domain: string;
  classification: OrganizationClassificationCompat;
  status: TenantStatusCompat;
  subscriptionPlan: string;
  includedModuleIds: string[];
  features: {
    onlineClasses: boolean;
    transportManagement: boolean;
    hostelManagement: boolean;
    libraryManagement: boolean;
    payrollManagement: boolean;
    [key: string]: boolean;
  };
  campuses: Array<{
    id: string;
    name: string;
    code: string;
    isMainCampus: boolean;
    address: string;
    status: TenantCampusStatusCompat;
  }>;
}

export function mapOrganizationStatusToTenantStatus(
  status: OrganizationStatusCompat
): TenantStatusCompat {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "suspended":
      return "SUSPENDED";
    case "archived":
      return "ARCHIVED";
    case "pending":
    case "inactive":
    case "draft":
    default:
      return "INACTIVE";
  }
}

export function mapPlatformCampusStatusToTenantStatus(
  status: CampusStatus | string
): TenantCampusStatusCompat {
  const normalized = String(status).toLowerCase();
  if (normalized === "active") return "ACTIVE";
  if (normalized === "archived") return "ARCHIVED";
  if (normalized === "under_review" || normalized === "planned") return "PLANNED";
  if (normalized === "under_maintenance") return "UNDER_MAINTENANCE";
  return "INACTIVE";
}

export function deriveTenantFeaturesFromModules(
  moduleIds: string[]
): TenantContractProjection["features"] {
  const has = (id: string) => moduleIds.includes(id);
  return {
    onlineClasses: has("mod_classroom"),
    transportManagement: has("mod_transport"),
    hostelManagement: has("mod_hostel"),
    libraryManagement: has("mod_library"),
    payrollManagement: has("sub_hr_payroll") || has("mod_hr"),
    enableCbt: has("sub_exam_cbt") || has("mod_examinations"),
    cbt: has("sub_exam_cbt") || has("mod_examinations"),
    finance: has("mod_finance"),
    hr: has("mod_hr"),
    attendance: has("mod_attendance"),
    academics: has("mod_academics"),
    cafeteriaOperations: has("mod_cafeteria"),
    multiCampusGovernance: has("mod_campuses"),
    safeguardingDsl: has("mod_safeguarding"),
    biAnalytics: has("mod_analytics"),
  };
}

export function projectOrganizationToTenantContract(
  org: Organization,
  plan: SubscriptionPlan | undefined,
  campuses: Campus[],
  explicitModuleOverrides?: string[]
): TenantContractProjection {
  const projectedStatus = mapOrganizationStatusToTenantStatus(org.status);
  const rawModuleIds = Array.from(
    new Set([
      ...(plan?.includedModuleIds ?? []),
      ...(explicitModuleOverrides ?? []),
    ])
  );
  // Fail closed when tenant is suspended/inactive/archived
  const moduleIds = projectedStatus === "ACTIVE" ? rawModuleIds : [];
  const record = org as unknown as Record<string, unknown>;
  const slug =
    typeof record.slug === "string" && record.slug
      ? record.slug
      : org.code.toLowerCase();
  const domain =
    typeof record.domain === "string" && record.domain
      ? record.domain
      : `${slug}.school.edu`;

  return {
    id: org.id,
    name: org.name,
    code: org.code,
    slug,
    domain,
    classification: org.classification,
    status: projectedStatus,
    subscriptionPlan: (plan?.tier || org.planId || "starter").toUpperCase(),
    includedModuleIds: moduleIds,
    features: deriveTenantFeaturesFromModules(moduleIds),
    campuses: campuses
      .filter((c) => c.organizationId === org.id)
      .map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        isMainCampus: c.isMainCampus,
        address: typeof c.address === "string" ? c.address : "",
        status: mapPlatformCampusStatusToTenantStatus(c.status),
      })),
  };
}
