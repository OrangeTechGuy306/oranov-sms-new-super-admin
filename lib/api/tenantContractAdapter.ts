/**
 * Super Admin <-> Tenant Dashboard Shared Contract Compatibility Adapter
 *
 * Bridges intentional enum/shape mappings between the Super Admin Control Plane (`dashboard/`)
 * and Tenant Dashboard (`frontend/`), preserving P0-3 backwards compatibility while
 * carrying full P0-5 canonical lifecycle, separated subscription/payment/onboarding states,
 * multi-category institution classification, and unified campus status fields.
 */

import {
  normalizeTenantLifecycleStatus,
  TENANT_LIFECYCLE_STATE_META,
  type CanonicalTenantLifecycleStatus,
} from "@/lib/lifecycle/canonical-lifecycle";
import type { CanonicalSchoolType } from "@/lib/modules/canonical-contract";
import type {
  Organization,
  OrganizationOwnershipType,
  OrganizationPaymentStatus,
} from "@/lib/types/organizations";
import type { Campus, CampusStatus } from "@/lib/types/campuses";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/types/subscriptions";

export type OrganizationStatusCompat = Organization["status"];
export type OrganizationClassificationCompat = Organization["classification"];
export type TenantStatusCompat = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ARCHIVED";
export type TenantCampusStatusCompat =
  | "ACTIVE"
  | "INACTIVE"
  | "ARCHIVED"
  | "PLANNED"
  | "UNDER_MAINTENANCE"
  | "SUSPENDED";

export interface TenantContractProjection {
  id: string;
  name: string;
  legalName?: string;
  code: string;
  slug: string;
  domain: string;
  organizationType?: OrganizationOwnershipType;
  classification: OrganizationClassificationCompat;
  institutionCategories: CanonicalSchoolType[];
  /** Legacy P0-3 coarse summary status (`ACTIVE | INACTIVE | SUSPENDED | ARCHIVED`) */
  status: TenantStatusCompat;
  /** Canonical P0-5 lifecycle state (explicitly decoupled from subscription & payment states) */
  lifecycleStatus: CanonicalTenantLifecycleStatus;
  onboardingStatus: Organization["onboardingStatus"];
  provisioningStatus: Organization["provisioningStatus"];
  subscriptionStatus?: SubscriptionStatus;
  paymentStatus?: OrganizationPaymentStatus;
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

export function normalizeSchoolCategories(
  classification?: Organization["classification"] | string,
  institutionCategories?: CanonicalSchoolType[]
): CanonicalSchoolType[] {
  if (institutionCategories && institutionCategories.length > 0) {
    return Array.from(new Set(institutionCategories));
  }
  const c = String(classification || "combined").toLowerCase();
  if (c === "k12" || c === "combined") return ["primary", "secondary"];
  if (c === "higher_education" || c === "college") return ["college"];
  if (
    c === "nursery" ||
    c === "primary" ||
    c === "secondary" ||
    c === "vocational" ||
    c === "international"
  ) {
    return [c];
  }
  return ["combined"];
}

export function mapOrganizationStatusToTenantStatus(
  status: OrganizationStatusCompat | string
): TenantStatusCompat {
  const canonical = normalizeTenantLifecycleStatus(status);
  if (canonical === "unknown") return "INACTIVE";
  return TENANT_LIFECYCLE_STATE_META[canonical].legacyTenantStatus;
}

export function mapPlatformCampusStatusToTenantStatus(
  status: CampusStatus | string
): TenantCampusStatusCompat {
  const normalized = String(status).toLowerCase();
  if (normalized === "active") return "ACTIVE";
  if (normalized === "archived") return "ARCHIVED";
  if (normalized === "suspended") return "SUSPENDED";
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

function formatPlatformCampusAddress(address: Campus["address"] | string | undefined): string {
  if (!address) return "";
  if (typeof address === "string") return address;
  return [address.street, address.city, address.stateOrProvince, address.country]
    .filter(Boolean)
    .join(", ");
}

export function projectOrganizationToTenantContract(
  org: Organization,
  plan: SubscriptionPlan | undefined,
  campuses: Campus[],
  explicitModuleOverrides?: string[]
): TenantContractProjection {
  const canonical = normalizeTenantLifecycleStatus(org.status);
  const projectedStatus = mapOrganizationStatusToTenantStatus(org.status);
  const rawModuleIds = Array.from(
    new Set([
      ...(plan?.includedModuleIds ?? []),
      ...(explicitModuleOverrides ?? []),
    ])
  );
  // Fail closed when tenant lifecycle does not permit active modules
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
    legalName: org.legalName,
    code: org.code,
    slug,
    domain,
    organizationType: org.organizationType,
    classification: org.classification,
    institutionCategories: normalizeSchoolCategories(org.classification, org.institutionCategories),
    status: projectedStatus,
    lifecycleStatus: canonical === "unknown" ? "awaiting_configuration" : canonical,
    onboardingStatus: org.onboardingStatus,
    provisioningStatus: org.provisioningStatus,
    subscriptionStatus: org.subscriptionStatus,
    paymentStatus: org.paymentStatus,
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
        address: formatPlatformCampusAddress(c.address),
        status: mapPlatformCampusStatusToTenantStatus(c.status),
      })),
  };
}
