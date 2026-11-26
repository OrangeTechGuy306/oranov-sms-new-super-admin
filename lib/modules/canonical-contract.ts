/**
 * Canonical SaaS Module, Feature, Subscription Plan & Entitlement Contract
 * Phase P0-4 — Authoritative Frontend Definition (Frontend-Only Simulation)
 *
 * NOTE: Server-side enforcement, persistent database catalogs, cryptographic billing
 * verification, and webhook-driven license provisioning require future backend services.
 */

import { z } from "zod";

export const CANONICAL_REGISTRY_VERSION = "2026.1.0-p04" as const;

export const CANONICAL_SCHOOL_TYPES = [
  "nursery",
  "primary",
  "secondary",
  "combined",
  "college",
  "vocational",
  "international",
] as const;

export type CanonicalSchoolType = (typeof CANONICAL_SCHOOL_TYPES)[number];
export const CanonicalSchoolTypeSchema = z.enum(CANONICAL_SCHOOL_TYPES);

/**
 * Canonical module and entitlement availability states requested across both applications.
 */
export const CANONICAL_AVAILABILITY_STATUSES = [
  "available",
  "enabled",
  "disabled",
  "coming_soon",
  "deprecated",
  "unavailable",
  "restricted_by_plan",
] as const;

export type CanonicalAvailabilityStatus = (typeof CANONICAL_AVAILABILITY_STATUSES)[number];
export const CanonicalAvailabilityStatusSchema = z.enum(CANONICAL_AVAILABILITY_STATUSES);

/**
 * Platform-level baseline module/feature availability states (before tenant plan evaluation).
 */
export const CANONICAL_GLOBAL_AVAILABILITY_STATUSES = [
  "available",
  "enabled",
  "disabled",
  "coming_soon",
  "deprecated",
  "unavailable",
] as const;

export type CanonicalGlobalAvailability =
  (typeof CANONICAL_GLOBAL_AVAILABILITY_STATUSES)[number];
export const CanonicalGlobalAvailabilitySchema = z.enum(
  CANONICAL_GLOBAL_AVAILABILITY_STATUSES
);

/**
 * Implementation maturity is strictly decoupled from subscription availability.
 */
export const IMPLEMENTATION_MATURITY_LEVELS = [
  "implemented",
  "partial",
  "planned",
] as const;

export type ImplementationMaturity = (typeof IMPLEMENTATION_MATURITY_LEVELS)[number];
export const ImplementationMaturitySchema = z.enum(IMPLEMENTATION_MATURITY_LEVELS);

export const CANONICAL_PLAN_TIERS = [
  "free",
  "starter",
  "basic",
  "standard",
  "growth",
  "professional",
  "enterprise",
  "custom",
] as const;

export type CanonicalPlanTier = (typeof CANONICAL_PLAN_TIERS)[number];
export const CanonicalPlanTierSchema = z.enum(CANONICAL_PLAN_TIERS);

export const BILLING_INTERVALS = ["monthly", "quarterly", "annual"] as const;
export type BillingInterval = (typeof BILLING_INTERVALS)[number];
export const BillingIntervalSchema = z.enum(BILLING_INTERVALS);

export const CanonicalDependencySchema = z.object({
  moduleId: z.string().trim().min(1),
  type: z.enum(["required", "optional"]),
  description: z.string().trim().min(1),
});

export type CanonicalDependency = z.infer<typeof CanonicalDependencySchema>;

export const CanonicalFeatureDefinitionSchema = z.object({
  id: z.string().trim().regex(/^feat_[a-z0-9_]+$/, "Feature ID must start with feat_"),
  key: z.string().trim().min(2),
  name: z.string().trim().min(2),
  description: z.string().trim().min(10),
  moduleId: z.string().trim().regex(/^(mod|sub)_[a-z0-9_]+$/),
  category: z.string().trim().min(2),
  availabilityStatus: CanonicalGlobalAvailabilitySchema,
  implementationMaturity: ImplementationMaturitySchema,
  isGloballyEnabled: z.boolean(),
  requiredPermissions: z.array(z.string().trim().min(3)),
  dependencies: z.array(z.string().trim().min(1)),
  includedInPlanIds: z.array(z.string().trim().min(1)),
  optionalAddOnPlanIds: z.array(z.string().trim().min(1)).default([]),
  requiresAddonLicense: z.boolean().default(false),
  supportedSchoolTypes: z.array(CanonicalSchoolTypeSchema).min(1),
  commercialConfigStatus: z
    .enum(["configured", "requires_product_owner_configuration"])
    .default("configured"),
});

export type CanonicalFeatureDefinition = z.infer<typeof CanonicalFeatureDefinitionSchema>;

export const CanonicalModuleDefinitionSchema = z.object({
  id: z.string().trim().regex(/^(mod|sub)_[a-z0-9_]+$/, "Module ID must start with mod_ or sub_"),
  navId: z.string().trim().min(2),
  name: z.string().trim().min(2),
  code: z.string().trim().min(2),
  description: z.string().trim().min(10),
  kind: z.enum(["module", "submodule"]),
  registryVersion: z.string().trim().min(1).default(CANONICAL_REGISTRY_VERSION),
  category: z.string().trim().min(2),
  macroCategory: z.enum([
    "academics",
    "administration",
    "finance",
    "communications",
    "platform_security",
    "analytics",
  ]),
  parentId: z.string().trim().min(1).optional(),
  href: z.string().trim().min(1),
  routes: z.array(z.string().trim().min(1)).min(1),
  status: z.enum(["implemented", "partial", "planned", "deprecated"]),
  availabilityStatus: CanonicalGlobalAvailabilitySchema,
  implementationMaturity: ImplementationMaturitySchema,
  maturityNote: z.string().optional(),
  statusRationale: z.string().trim().min(5),
  isGloballyEnabled: z.boolean(),
  includedInPlans: z.array(z.enum(["starter", "growth", "enterprise", "custom"])),
  requiresAddonLicense: z.boolean(),
  dependencies: z.array(CanonicalDependencySchema),
  requiredPermissions: z.array(z.string().trim().min(1)),
  allowedRoles: z.array(z.string().trim().min(1)),
  supportedSchoolTypes: z.array(CanonicalSchoolTypeSchema).min(1),
  featureIds: z.array(z.string().trim().min(1)).default([]),
  deprecatedReason: z.string().optional(),
  replacedByModuleId: z.string().optional(),
  sourceEvidence: z.object({
    routePath: z.string().optional(),
    componentEntry: z.string().optional(),
    typeDefinition: z.string().optional(),
    mockStore: z.string().optional(),
    testSuite: z.string().optional(),
    navGroupId: z.string().optional(),
  }),
  supportedWorkflows: z.array(z.string()),
  knownLimitations: z.array(z.string()),
  futureBackendRequirements: z.array(z.string()),
  dataSensitivity: z.enum(["standard", "sensitive", "restricted_pii", "financial"]),
  displayOrder: z.number().int().min(0),
});

export type CanonicalModuleDefinition = z.infer<typeof CanonicalModuleDefinitionSchema>;

export const CanonicalPlanDefinitionSchema = z.object({
  id: z.string().trim().regex(/^plan_[a-z0-9_]+$/),
  name: z.string().trim().min(2),
  tier: z.enum(["starter", "growth", "enterprise", "custom"]),
  normalizedTier: CanonicalPlanTierSchema.optional(),
  status: z.enum(["published", "draft", "deprecated", "archived"]),
  visibility: z.enum(["public", "private", "internal_only"]).default("public"),
  description: z.string().trim().min(10),
  billingIntervals: z.array(BillingIntervalSchema).min(1).default(["monthly", "annual"]),
  currency: z.string().trim().min(3),
  priceMonthly: z.number().min(0),
  priceAnnual: z.number().min(0),
  priceQuarterly: z.number().min(0).optional(),
  trialDays: z.number().int().min(0),
  targetSchoolTypes: z.array(CanonicalSchoolTypeSchema).min(1),
  maxStudents: z.number().int().min(0),
  maxStaff: z.number().int().min(0),
  maxCampuses: z.number().int().min(0),
  storageGb: z.number().int().min(0),
  features: z.array(z.string()),
  includedModuleIds: z.array(z.string().trim().min(1)),
  includedFeatureIds: z.array(z.string().trim().min(1)).default([]),
  optionalAddOnModuleIds: z.array(z.string().trim().min(1)).default([]),
  optionalAddOnFeatureIds: z.array(z.string().trim().min(1)).default([]),
  upgradeToPlanIds: z.array(z.string().trim().min(1)).default([]),
  downgradeToPlanIds: z.array(z.string().trim().min(1)).default([]),
  version: z.number().int().min(1).default(1),
  commercialPricingNote: z.string().optional(),
  isPopular: z.boolean().optional(),
  isActive: z.boolean(),
});

export type CanonicalPlanDefinition = z.infer<typeof CanonicalPlanDefinitionSchema>;

export const TenantEntitlementOverrideSchema = z.object({
  id: z.string().trim().min(1),
  tenantId: z.string().trim().min(1),
  moduleId: z.string().trim().min(1).optional(),
  featureId: z.string().trim().min(1).optional(),
  action: z.enum(["force_enable", "force_disable", "trial_extension"]),
  reason: z.string().trim().min(1),
  updatedBy: z.string().trim().min(1),
  updatedAt: z.string().trim().min(1),
  expiresAt: z.string().optional(),
});

export type TenantEntitlementOverride = z.infer<typeof TenantEntitlementOverrideSchema>;

export const TenantAddOnEntitlementSchema = z.object({
  id: z.string().trim().min(1),
  moduleId: z.string().trim().min(1).optional(),
  featureId: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1),
  status: z.enum(["active", "expired", "canceled", "pending"]),
  startDate: z.string(),
  expiryDate: z.string().optional(),
});

export type TenantAddOnEntitlement = z.infer<typeof TenantAddOnEntitlementSchema>;

export const TenantUsageSnapshotSchema = z.object({
  studentsCount: z.number().int().min(0).default(0),
  staffCount: z.number().int().min(0).default(0),
  campusesCount: z.number().int().min(0).default(1),
  storageUsedGb: z.number().min(0).default(0),
});

export type TenantUsageSnapshot = z.infer<typeof TenantUsageSnapshotSchema>;

export interface TenantEntitlementContext {
  tenantId: string;
  tenantStatus: string;
  schoolType?: string;
  subscription?: {
    id?: string;
    planId?: string;
    planName?: string;
    planTier?: string;
    status: "active" | "trialing" | "past_due" | "canceled" | "expired" | string;
    billingCycle?: string;
    startDate?: string;
    currentPeriodEnd?: string;
    trialEndsAt?: string;
    gracePeriodEndsAt?: string;
  };
  plan?: CanonicalPlanDefinition;
  /** Explicit entitlement snapshot when full plan object is omitted on client session */
  includedModuleIds?: string[];
  includedFeatureIds?: string[];
  optionalAddOnModuleIds?: string[];
  /** Explicit tenant-level feature toggle flags (school preferences) */
  tenantFeatureToggles?: Record<string, boolean>;
  addOns?: TenantAddOnEntitlement[];
  overrides?: TenantEntitlementOverride[];
  usage?: Partial<TenantUsageSnapshot>;
  limits?: {
    maxStudents?: number;
    maxStaff?: number;
    maxCampuses?: number;
    storageGb?: number;
  };
}

export type EntitlementReasonCode =
  | "ENTITLED_BY_PLAN"
  | "ENTITLED_BY_ADDON"
  | "ENTITLED_BY_OVERRIDE"
  | "ENTITLED_BY_GRACE_PERIOD"
  | "UNKNOWN_MODULE_OR_FEATURE"
  | "MISSING_ENTITLEMENT_DATA"
  | "TENANT_SUSPENDED"
  | "SUBSCRIPTION_INACTIVE"
  | "TRIAL_EXPIRED"
  | "GRACE_PERIOD_EXPIRED"
  | "MISSING_SUBSCRIPTION"
  | "MODULE_DISABLED"
  | "COMING_SOON"
  | "DEPRECATED"
  | "MODULE_UNAVAILABLE"
  | "UNSUPPORTED_SCHOOL_TYPE"
  | "DISABLED_BY_OVERRIDE"
  | "TENANT_FEATURE_DISABLED"
  | "MISSING_DEPENDENCY"
  | "USAGE_LIMIT_REACHED"
  | "REQUIRES_ADDON"
  | "PLAN_RESTRICTED";

export interface QuotaCheckResult {
  withinLimits: boolean;
  exceededMetrics: Array<{
    metric: "students" | "staff" | "campuses" | "storage";
    used: number;
    limit: number;
  }>;
}

export interface CanonicalEntitlementResult {
  allowed: boolean;
  targetType: "module" | "feature";
  targetId: string;
  moduleId?: string;
  featureId?: string;
  effectiveStatus: CanonicalAvailabilityStatus;
  implementationMaturity: ImplementationMaturity;
  reasonCode: EntitlementReasonCode;
  explanation: string;
  source: "plan" | "addon" | "override" | "grace_period" | "restricted" | "unknown";
  requiresUpgrade: boolean;
  requiresAddon: boolean;
  recommendedPlanIds: string[];
  missingDependencies: string[];
  inGracePeriod: boolean;
  isTrialing: boolean;
  isOverridden: boolean;
  quota: QuotaCheckResult;
}

export interface RegistryIntegrityIssue {
  code:
    | "DUPLICATE_MODULE_ID"
    | "DUPLICATE_MODULE_CODE"
    | "DUPLICATE_FEATURE_ID"
    | "DUPLICATE_FEATURE_KEY"
    | "MISSING_PARENT_MODULE"
    | "INVALID_DEPENDENCY"
    | "CIRCULAR_DEPENDENCY"
    | "UNKNOWN_ROUTE"
    | "UNKNOWN_PERMISSION"
    | "INVALID_PLAN_ASSOCIATION"
    | "DEPRECATED_IN_ACTIVE_PLAN"
    | "MISSING_METADATA"
    | "SCHEMA_VALIDATION_ERROR";
  severity: "error" | "warning";
  entityId: string;
  message: string;
}

export interface CanonicalRegistryValidationReport {
  isValid: boolean;
  checkedAt: string;
  totalModules: number;
  totalFeatures: number;
  totalPlans: number;
  errors: RegistryIntegrityIssue[];
  warnings: RegistryIntegrityIssue[];
}

export function normalizeTenantSchoolType(raw?: string | null): CanonicalSchoolType[] {
  if (!raw || typeof raw !== "string") return [];
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return [];

  if (normalized === "k12" || normalized === "multi_campus_k12") {
    return ["nursery", "primary", "secondary", "combined"];
  }
  if (normalized === "combined_nursery_primary_secondary" || normalized === "combined") {
    return ["nursery", "primary", "secondary", "combined"];
  }
  if (normalized === "single_campus_primary" || normalized === "primary") {
    return ["primary"];
  }
  if (normalized === "nursery" || normalized === "early_years") {
    return ["nursery"];
  }
  if (
    normalized === "secondary_only_limited_entitlements" ||
    normalized === "secondary" ||
    normalized === "high_school"
  ) {
    return ["secondary"];
  }
  if (normalized === "college_vocational_multi_session") {
    return ["college", "vocational"];
  }
  if (normalized === "higher_education" || normalized === "college") {
    return ["college"];
  }
  if (normalized === "vocational" || normalized === "technical") {
    return ["vocational"];
  }
  if (normalized === "international" || normalized.includes("international")) {
    return ["international", "primary", "secondary", "combined"];
  }
  return [];
}

export function isSchoolTypeCompatible(
  tenantSchoolType: string | undefined | null,
  supportedSchoolTypes: readonly CanonicalSchoolType[] | undefined
): boolean {
  if (!supportedSchoolTypes || supportedSchoolTypes.length === 0) return true;
  const resolved = normalizeTenantSchoolType(tenantSchoolType);
  if (resolved.length === 0) return true;
  return resolved.some((st) => supportedSchoolTypes.includes(st));
}

export function validateCanonicalRegistryGraph(input: {
  modules: CanonicalModuleDefinition[];
  features: CanonicalFeatureDefinition[];
  plans?: CanonicalPlanDefinition[];
  knownRoutes?: Set<string>;
  knownPermissions?: Set<string>;
}): CanonicalRegistryValidationReport {
  const errors: RegistryIntegrityIssue[] = [];
  const warnings: RegistryIntegrityIssue[] = [];

  const moduleIds = new Set<string>();
  const moduleCodes = new Set<string>();
  const featureIds = new Set<string>();
  const featureKeys = new Set<string>();
  const moduleMap = new Map<string, CanonicalModuleDefinition>();

  for (const mod of input.modules) {
    const parsed = CanonicalModuleDefinitionSchema.safeParse(mod);
    if (!parsed.success) {
      errors.push({
        code: "SCHEMA_VALIDATION_ERROR",
        severity: "error",
        entityId: mod.id || "unknown",
        message: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      });
    }
    if (moduleIds.has(mod.id)) {
      errors.push({
        code: "DUPLICATE_MODULE_ID",
        severity: "error",
        entityId: mod.id,
        message: `Duplicate module ID detected: "${mod.id}".`,
      });
    }
    moduleIds.add(mod.id);
    moduleMap.set(mod.id, mod);

    if (moduleCodes.has(mod.code)) {
      errors.push({
        code: "DUPLICATE_MODULE_CODE",
        severity: "error",
        entityId: mod.id,
        message: `Duplicate module code detected: "${mod.code}".`,
      });
    }
    moduleCodes.add(mod.code);

    if (!mod.description || mod.description.trim().length < 10 || !mod.name.trim()) {
      errors.push({
        code: "MISSING_METADATA",
        severity: "error",
        entityId: mod.id,
        message: `Module "${mod.id}" is missing required display name or description.`,
      });
    }
  }

  for (const feat of input.features) {
    const parsed = CanonicalFeatureDefinitionSchema.safeParse(feat);
    if (!parsed.success) {
      errors.push({
        code: "SCHEMA_VALIDATION_ERROR",
        severity: "error",
        entityId: feat.id || "unknown",
        message: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      });
    }
    if (featureIds.has(feat.id)) {
      errors.push({
        code: "DUPLICATE_FEATURE_ID",
        severity: "error",
        entityId: feat.id,
        message: `Duplicate feature ID detected: "${feat.id}".`,
      });
    }
    featureIds.add(feat.id);

    if (featureKeys.has(feat.key)) {
      errors.push({
        code: "DUPLICATE_FEATURE_KEY",
        severity: "error",
        entityId: feat.id,
        message: `Duplicate feature key detected: "${feat.key}".`,
      });
    }
    featureKeys.add(feat.key);

    if (!moduleMap.has(feat.moduleId)) {
      errors.push({
        code: "MISSING_PARENT_MODULE",
        severity: "error",
        entityId: feat.id,
        message: `Feature "${feat.id}" references non-existent module "${feat.moduleId}".`,
      });
    }
  }

  // Dependency, parent, route, and permission checks
  for (const mod of input.modules) {
    if (mod.parentId && !moduleMap.has(mod.parentId)) {
      errors.push({
        code: "MISSING_PARENT_MODULE",
        severity: "error",
        entityId: mod.id,
        message: `Submodule "${mod.id}" references missing parent module "${mod.parentId}".`,
      });
    }

    for (const dep of mod.dependencies) {
      if (!moduleMap.has(dep.moduleId)) {
        errors.push({
          code: "INVALID_DEPENDENCY",
          severity: "error",
          entityId: mod.id,
          message: `Module "${mod.id}" declares dependency on unknown module "${dep.moduleId}".`,
        });
      }
      if (dep.moduleId === mod.id) {
        errors.push({
          code: "CIRCULAR_DEPENDENCY",
          severity: "error",
          entityId: mod.id,
          message: `Module "${mod.id}" cannot depend on itself.`,
        });
      }
    }

    for (const featId of mod.featureIds || []) {
      if (!featureIds.has(featId)) {
        errors.push({
          code: "INVALID_DEPENDENCY",
          severity: "error",
          entityId: mod.id,
          message: `Module "${mod.id}" references unknown feature "${featId}".`,
        });
      }
    }

    if (input.knownRoutes && input.knownRoutes.size > 0) {
      for (const r of mod.routes) {
        if (!input.knownRoutes.has(r) && !mod.replacedByModuleId) {
          warnings.push({
            code: "UNKNOWN_ROUTE",
            severity: "warning",
            entityId: mod.id,
            message: `Route "${r}" in module "${mod.id}" is not registered in the known route index.`,
          });
        }
      }
    }

    if (input.knownPermissions && input.knownPermissions.size > 0) {
      for (const perm of mod.requiredPermissions) {
        if (!input.knownPermissions.has(perm)) {
          warnings.push({
            code: "UNKNOWN_PERMISSION",
            severity: "warning",
            entityId: mod.id,
            message: `Permission "${perm}" in module "${mod.id}" is not in the recognized tenant permission set.`,
          });
        }
      }
    }
  }

  // DFS Cycle Detection
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const detectCycle = (modId: string): string[] | null => {
    visiting.add(modId);
    const mod = moduleMap.get(modId);
    if (mod) {
      for (const dep of mod.dependencies) {
        if (dep.type !== "required") continue;
        if (visiting.has(dep.moduleId)) {
          return [modId, dep.moduleId];
        }
        if (!visited.has(dep.moduleId) && moduleMap.has(dep.moduleId)) {
          const cycle = detectCycle(dep.moduleId);
          if (cycle) return [modId, ...cycle];
        }
      }
    }
    visiting.delete(modId);
    visited.add(modId);
    return null;
  };

  for (const mod of input.modules) {
    if (!visited.has(mod.id)) {
      const cycle = detectCycle(mod.id);
      if (cycle) {
        errors.push({
          code: "CIRCULAR_DEPENDENCY",
          severity: "error",
          entityId: mod.id,
          message: `Circular required dependency cycle detected: ${cycle.join(" -> ")}.`,
        });
      }
    }
  }

  // Plan integrity validation
  const planList = input.plans || [];
  const planIds = new Set(planList.map((p) => p.id));
  for (const plan of planList) {
    const parsed = CanonicalPlanDefinitionSchema.safeParse(plan);
    if (!parsed.success) {
      errors.push({
        code: "INVALID_PLAN_ASSOCIATION",
        severity: "error",
        entityId: plan.id,
        message: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      });
    }
    for (const modId of plan.includedModuleIds) {
      const mod = moduleMap.get(modId);
      if (!mod) {
        errors.push({
          code: "INVALID_PLAN_ASSOCIATION",
          severity: "error",
          entityId: plan.id,
          message: `Plan "${plan.id}" includes unknown module ID "${modId}".`,
        });
      } else if (mod.availabilityStatus === "deprecated" && plan.status === "published") {
        errors.push({
          code: "DEPRECATED_IN_ACTIVE_PLAN",
          severity: "error",
          entityId: plan.id,
          message: `Published plan "${plan.id}" still references deprecated module "${modId}". Replace with "${mod.replacedByModuleId || "canonical replacement"}".`,
        });
      }
    }
    for (const featId of plan.includedFeatureIds || []) {
      if (!featureIds.has(featId)) {
        errors.push({
          code: "INVALID_PLAN_ASSOCIATION",
          severity: "error",
          entityId: plan.id,
          message: `Plan "${plan.id}" references unknown feature ID "${featId}".`,
        });
      }
    }
    for (const addOnId of plan.optionalAddOnModuleIds || []) {
      if (!moduleMap.has(addOnId)) {
        errors.push({
          code: "INVALID_PLAN_ASSOCIATION",
          severity: "error",
          entityId: plan.id,
          message: `Plan "${plan.id}" references unknown optional add-on module "${addOnId}".`,
        });
      }
    }
    for (const targetPlanId of [...(plan.upgradeToPlanIds || []), ...(plan.downgradeToPlanIds || [])]) {
      if (!planIds.has(targetPlanId)) {
        errors.push({
          code: "INVALID_PLAN_ASSOCIATION",
          severity: "error",
          entityId: plan.id,
          message: `Plan "${plan.id}" references unknown upgrade/downgrade target plan "${targetPlanId}".`,
        });
      }
    }
  }

  for (const feat of input.features) {
    if (planIds.size > 0) {
      for (const pid of feat.includedInPlanIds) {
        if (!planIds.has(pid)) {
          errors.push({
            code: "INVALID_PLAN_ASSOCIATION",
            severity: "error",
            entityId: feat.id,
            message: `Feature "${feat.id}" references unknown plan ID "${pid}".`,
          });
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    checkedAt: new Date().toISOString(),
    totalModules: input.modules.length,
    totalFeatures: input.features.length,
    totalPlans: planList.length,
    errors,
    warnings,
  };
}
