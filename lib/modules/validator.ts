/**
 * Master Tenant Module Registry Integrity Validator
 * Phase P0-4: Combines structural + dependency + override checks with canonical Zod graph validation
 * across modules, features, plans, routes, and permissions.
 */

import type {
  OrganizationModuleOverride,
  RegistryValidationIssue,
  RegistryValidationReport,
  TenantModuleDefinition,
} from "./types";
import type { SubscriptionPlan } from "../types/subscriptions";
import {
  CANONICAL_FEATURE_REGISTRY,
  CANONICAL_SUBSCRIPTION_PLANS,
  MASTER_MODULE_REGISTRY,
} from "./registry-data";
import {
  validateCanonicalRegistryGraph,
  type CanonicalFeatureDefinition,
  type CanonicalModuleDefinition,
  type CanonicalPlanDefinition,
} from "./canonical-contract";
import { detectDependencyCycles } from "./evaluator";

export interface ValidateRegistryOptions {
  modules?: TenantModuleDefinition[];
  features?: CanonicalFeatureDefinition[];
  plans?: SubscriptionPlan[];
  organizationOverrides?: OrganizationModuleOverride[];
  knownOrganizationIds?: string[];
  knownRoutes?: Set<string>;
  knownPermissions?: Set<string>;
}

export function validateModuleRegistry(
  options: ValidateRegistryOptions = {}
): RegistryValidationReport {
  const modules = options.modules || MASTER_MODULE_REGISTRY;
  const features = options.features || CANONICAL_FEATURE_REGISTRY;
  const issues: RegistryValidationIssue[] = [];

  const idMap = new Map<string, TenantModuleDefinition>();
  const codeMap = new Map<string, string>();
  const routeOwnerMap = new Map<string, string>();

  // 1. Identity, Code & Metadata Checks
  for (const mod of modules) {
    if (!mod.id || typeof mod.id !== "string") {
      issues.push({
        id: `missing-id-${issues.length}`,
        severity: "error",
        category: "identity",
        message: "Module definition is missing a valid string identifier.",
      });
      continue;
    }

    if (idMap.has(mod.id)) {
      issues.push({
        id: `duplicate-id-${mod.id}`,
        severity: "error",
        category: "identity",
        moduleId: mod.id,
        message: `Duplicate module ID "${mod.id}" detected in registry. Module IDs must be unique.`,
      });
    } else {
      idMap.set(mod.id, mod);
    }

    if (mod.code) {
      if (codeMap.has(mod.code)) {
        issues.push({
          id: `duplicate-code-${mod.code}`,
          severity: "error",
          category: "identity",
          moduleId: mod.id,
          message: `Duplicate module code "${mod.code}" shared between "${codeMap.get(mod.code)}" and "${mod.id}".`,
        });
      } else {
        codeMap.set(mod.code, mod.id);
      }
    } else {
      issues.push({
        id: `missing-code-${mod.id}`,
        severity: "error",
        category: "identity",
        moduleId: mod.id,
        message: `Module "${mod.id}" is missing a machine-readable code.`,
      });
    }

    if (!mod.name || !mod.description || mod.description.trim().length < 10) {
      issues.push({
        id: `missing-meta-${mod.id}`,
        severity: "warning",
        category: "evidence",
        moduleId: mod.id,
        message: `Module "${mod.id}" has missing or overly short display metadata/description.`,
      });
    }

    for (const route of mod.routes || []) {
      const owner = routeOwnerMap.get(route);
      if (owner && owner !== mod.id && mod.availabilityStatus !== "deprecated") {
        // Shared parent/overview or cross-reference shortcut is allowed as info/warning only when both are different top modules
        const ownerMod = idMap.get(owner);
        if (ownerMod && ownerMod.parentId !== mod.id && mod.parentId !== owner) {
          issues.push({
            id: `route-overlap-${mod.id}-${route}`,
            severity: "info",
            category: "route",
            moduleId: mod.id,
            message: `Route "${route}" is referenced by both "${owner}" and "${mod.id}".`,
          });
        }
      } else if (!owner) {
        routeOwnerMap.set(route, mod.id);
      }
    }
  }

  // 2. Parent & Dependency Reference Integrity
  for (const mod of modules) {
    if (mod.parentId && !idMap.has(mod.parentId)) {
      issues.push({
        id: `missing-parent-${mod.id}`,
        severity: "error",
        category: "parent",
        moduleId: mod.id,
        message: `Submodule "${mod.id}" references missing parent module "${mod.parentId}".`,
      });
    }

    for (const dep of mod.dependencies || []) {
      if (!idMap.has(dep.moduleId)) {
        issues.push({
          id: `missing-dep-${mod.id}-${dep.moduleId}`,
          severity: "error",
          category: "dependency",
          moduleId: mod.id,
          message: `Module "${mod.id}" depends on unknown module "${dep.moduleId}".`,
        });
      }
      if (dep.moduleId === mod.id) {
        issues.push({
          id: `self-dep-${mod.id}`,
          severity: "error",
          category: "cycle",
          moduleId: mod.id,
          message: `Module "${mod.id}" declares a self-dependency.`,
        });
      }
    }

    if (options.knownRoutes && options.knownRoutes.size > 0 && mod.availabilityStatus !== "deprecated") {
      for (const route of mod.routes || []) {
        if (!options.knownRoutes.has(route)) {
          issues.push({
            id: `unknown-route-${mod.id}-${route}`,
            severity: "warning",
            category: "route",
            moduleId: mod.id,
            message: `Module "${mod.id}" references unknown route "${route}".`,
          });
        }
      }
    }

    if (options.knownPermissions && options.knownPermissions.size > 0) {
      for (const perm of mod.requiredPermissions || []) {
        if (!options.knownPermissions.has(perm)) {
          issues.push({
            id: `unknown-perm-${mod.id}-${perm}`,
            severity: "warning",
            category: "identity",
            moduleId: mod.id,
            message: `Module "${mod.id}" references unknown permission "${perm}".`,
          });
        }
      }
    }
  }

  // 3. Cycle Detection
  const cycles = detectDependencyCycles(modules);
  for (const cycle of cycles) {
    issues.push({
      id: `cycle-${cycle.join("-")}`,
      severity: "error",
      category: "cycle",
      moduleId: cycle[0],
      message: `Circular required dependency cycle detected: ${cycle.join(" -> ")}.`,
    });
  }

  // 4. Plan-to-Module & Feature-to-Module Cross-Validation
  const plansToCheck: CanonicalPlanDefinition[] = options.plans
    ? options.plans.map((p) => ({
        id: p.id,
        name: p.name,
        tier: p.tier,
        normalizedTier: p.normalizedTier || p.tier,
        status: p.status || "published",
        visibility: p.visibility || "public",
        description: p.description || p.name,
        billingIntervals: p.billingIntervals || ["monthly", "annual"],
        currency: p.currency,
        priceMonthly: p.priceMonthly,
        priceAnnual: p.priceAnnual,
        priceQuarterly: p.priceQuarterly,
        trialDays: p.trialDays ?? 14,
        targetSchoolTypes: p.targetSchoolTypes || ["primary", "secondary", "combined"],
        maxStudents: p.maxStudents,
        maxStaff: p.maxStaff,
        maxCampuses: p.maxCampuses,
        storageGb: p.storageGb,
        features: p.features || [],
        includedModuleIds: p.includedModuleIds || [],
        includedFeatureIds: p.includedFeatureIds || [],
        optionalAddOnModuleIds: p.optionalAddOnModuleIds || [],
        optionalAddOnFeatureIds: p.optionalAddOnFeatureIds || [],
        upgradeToPlanIds: p.upgradeToPlanIds || [],
        downgradeToPlanIds: p.downgradeToPlanIds || [],
        version: p.version ?? 1,
        isActive: p.isActive,
      }))
    : [];

  for (const plan of plansToCheck) {
    for (const modId of plan.includedModuleIds) {
      const mod = idMap.get(modId);
      if (!mod) {
        issues.push({
          id: `plan-unknown-mod-${plan.id}-${modId}`,
          severity: "error",
          category: "plan",
          moduleId: modId,
          message: `Subscription plan "${plan.name}" (${plan.id}) references unknown module ID "${modId}".`,
        });
      } else if (mod.availabilityStatus === "deprecated" && plan.status === "published") {
        issues.push({
          id: `plan-deprecated-mod-${plan.id}-${modId}`,
          severity: "warning",
          category: "plan",
          moduleId: modId,
          message: `Published plan "${plan.name}" references deprecated module "${modId}".`,
        });
      }
    }
  }

  // If canonical registry is being validated, also run strict Zod canonical validator
  if (modules === MASTER_MODULE_REGISTRY && !options.modules) {
    const canonicalReport = validateCanonicalRegistryGraph({
      modules: modules as unknown as CanonicalModuleDefinition[],
      features,
      plans: plansToCheck.length > 0 ? plansToCheck : CANONICAL_SUBSCRIPTION_PLANS,
      knownRoutes: options.knownRoutes,
      knownPermissions: options.knownPermissions,
    });
    for (const err of canonicalReport.errors) {
      issues.push({
        id: `canonical-${err.code}-${err.entityId}`,
        severity: "error",
        category:
          err.code === "INVALID_PLAN_ASSOCIATION" || err.code === "DEPRECATED_IN_ACTIVE_PLAN"
            ? "plan"
            : err.code === "CIRCULAR_DEPENDENCY"
            ? "cycle"
            : err.code === "MISSING_PARENT_MODULE"
            ? "parent"
            : "identity",
        moduleId: err.entityId,
        message: err.message,
      });
    }
  }

  // 5. Override Integrity Checks
  if (options.organizationOverrides) {
    const orgIdSet = options.knownOrganizationIds
      ? new Set(options.knownOrganizationIds)
      : undefined;
    for (const ov of options.organizationOverrides) {
      if (!idMap.has(ov.moduleId)) {
        issues.push({
          id: `orphan-override-mod-${ov.organizationId}-${ov.moduleId}`,
          severity: "warning",
          category: "override",
          moduleId: ov.moduleId,
          message: `Organization override for "${ov.organizationId}" references unknown module "${ov.moduleId}".`,
        });
      }
      if (orgIdSet && !orgIdSet.has(ov.organizationId)) {
        issues.push({
          id: `orphan-override-org-${ov.organizationId}-${ov.moduleId}`,
          severity: "warning",
          category: "override",
          moduleId: ov.moduleId,
          message: `Module override on "${ov.moduleId}" references unknown organization "${ov.organizationId}".`,
        });
      }
    }
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const infoCount = issues.filter((i) => i.severity === "info").length;

  return {
    isValid: errorCount === 0,
    timestamp: new Date().toISOString(),
    totalModulesCount: modules.length,
    topLevelModulesCount: modules.filter((m) => !m.parentId).length,
    submodulesCount: modules.filter((m) => !!m.parentId).length,
    mappedRoutesCount: new Set(modules.flatMap((m) => m.routes || [])).size,
    errorCount,
    warningCount,
    infoCount,
    totalFeaturesCount: features.length,
    totalPlansCount: plansToCheck.length > 0 ? plansToCheck.length : CANONICAL_SUBSCRIPTION_PLANS.length,
    deprecatedModulesCount: modules.filter((m) => m.availabilityStatus === "deprecated" || m.status === "deprecated").length,
    comingSoonModulesCount: modules.filter((m) => m.availabilityStatus === "coming_soon").length,
    unassignedModulesCount: modules.filter(
      (m) => m.availabilityStatus !== "deprecated" && (!m.includedInPlans || m.includedInPlans.length === 0)
    ).length,
    issues,
  };
}
