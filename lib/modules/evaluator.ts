/**
 * Deterministic Entitlement Evaluator & Precedence Engine
 * Phase P0-4: Evaluates module availability, live subscription plan inclusion,
 * tenant lifecycle status, subscription trial/grace expiry, school-type compatibility,
 * organization overrides, and dependency hierarchies.
 */

import type { PlanTier, SubscriptionPlan, OrganizationSubscription } from "../types/subscriptions";
import type { OrganizationLifecycleStatus } from "../types/organizations";
import type {
  TenantModuleDefinition,
  EffectiveEntitlementResult,
  OrganizationModuleOverride,
  UnsatisfiedDependencyDetail,
  OrganizationOverrideAction,
  CanonicalEntitlementStatus,
} from "./types";
import {
  CANONICAL_SUBSCRIPTION_PLANS,
  MASTER_MODULE_REGISTRY,
  MODULES_BY_ID,
} from "./registry-data";
import { isSchoolTypeCompatible } from "./canonical-contract";

export interface EvaluateEntitlementOptions {
  moduleId: string;
  organizationId?: string;
  organizationStatus?: OrganizationLifecycleStatus | string;
  schoolType?: string;
  planId?: string;
  planTier?: PlanTier;
  plans?: SubscriptionPlan[];
  subscription?: Partial<OrganizationSubscription>;
  registry?: TenantModuleDefinition[];
  platformAvailabilityOverrides?: Map<string, boolean> | Record<string, boolean>;
  organizationOverrides?: OrganizationModuleOverride[];
  activeAddOnModuleIds?: string[];
  asOfDate?: string;
  checkedModuleStack?: Set<string>;
}

export function resolvePlanTier(
  planId?: string,
  planTier?: PlanTier,
  plans?: SubscriptionPlan[]
): PlanTier | undefined {
  if (planTier) return planTier;
  if (!planId) return undefined;

  if (planId === "plan_starter" || planId === "starter") return "starter";
  if (planId === "plan_growth" || planId === "growth" || planId === "plan_uk_growth") return "growth";
  if (planId === "plan_enterprise" || planId === "enterprise") return "enterprise";
  if (planId === "plan_custom" || planId === "custom" || planId === "plan_custom_pilot") return "custom";

  const pool = plans && plans.length > 0 ? plans : (CANONICAL_SUBSCRIPTION_PLANS as unknown as SubscriptionPlan[]);
  const found = pool.find((p) => p.id === planId);
  if (found) return found.tier;

  return undefined;
}

function findMatchingPlan(
  planId?: string,
  effectiveTier?: PlanTier,
  plans?: SubscriptionPlan[]
): SubscriptionPlan | undefined {
  const pool = plans && plans.length > 0 ? plans : (CANONICAL_SUBSCRIPTION_PLANS as unknown as SubscriptionPlan[]);
  if (planId) {
    const byId = pool.find((p) => p.id === planId);
    if (byId) return byId;
    const mappedByTierAlias = pool.find((p) => p.tier === planId);
    if (mappedByTierAlias) return mappedByTierAlias;
  }
  if (effectiveTier) {
    return pool.find((p) => p.tier === effectiveTier);
  }
  return undefined;
}

export function detectDependencyCycles(
  modules: TenantModuleDefinition[] = MASTER_MODULE_REGISTRY
): string[][] {
  const modMap = new Map(modules.map((m) => [m.id, m]));
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const cycles: string[][] = [];

  function dfs(currentId: string, pathStack: string[]) {
    if (visiting.has(currentId)) {
      const startIndex = pathStack.indexOf(currentId);
      if (startIndex !== -1) {
        cycles.push([...pathStack.slice(startIndex), currentId]);
      }
      return;
    }
    if (visited.has(currentId)) return;

    visiting.add(currentId);
    pathStack.push(currentId);

    const mod = modMap.get(currentId);
    if (mod) {
      for (const dep of mod.dependencies) {
        if (dep.type === "required" && modMap.has(dep.moduleId)) {
          dfs(dep.moduleId, pathStack);
        }
      }
    }

    pathStack.pop();
    visiting.delete(currentId);
    visited.add(currentId);
  }

  for (const mod of modules) {
    if (!visited.has(mod.id)) {
      dfs(mod.id, []);
    }
  }

  return cycles;
}

export function evaluateModuleEntitlement(
  options: EvaluateEntitlementOptions
): EffectiveEntitlementResult {
  const {
    moduleId,
    organizationId,
    organizationStatus,
    schoolType,
    planId,
    planTier,
    plans,
    subscription,
    registry,
    platformAvailabilityOverrides,
    organizationOverrides = [],
    activeAddOnModuleIds = [],
    asOfDate,
    checkedModuleStack = new Set<string>(),
  } = options;

  const nowMs = asOfDate ? Date.parse(asOfDate) : Date.now();
  const effectiveNowMs = Number.isNaN(nowMs) ? Date.now() : nowMs;

  const modMap = registry
    ? new Map(registry.map((m) => [m.id, m]))
    : MODULES_BY_ID;

  const targetModule = modMap.get(moduleId);

  // Precedence Tier 1: Unregistered Module Guard (Always Fail Closed)
  if (!targetModule) {
    return {
      moduleId,
      moduleName: `Unregistered Module (${moduleId})`,
      organizationId,
      planId,
      planTier,
      isRegistered: false,
      implementationStatus: "unknown",
      platformAvailability: "disabled",
      canonicalStatus: "unavailable",
      implementationMaturity: "planned",
      reasonCode: "UNKNOWN_MODULE_OR_FEATURE",
      planInclusion: "not_entitled",
      overrideAction: "inherit",
      dependenciesSatisfied: false,
      unsatisfiedDependencies: [],
      effectiveStatus: "unresolved",
      reason: `Fail-closed guard: Module ID "${moduleId}" is not registered in the canonical module registry.`,
      recommendedPlanIds: [],
      requiresUpgrade: false,
      requiresAddon: false,
      precedenceApplied: "UNREGISTERED_GUARD",
    };
  }

  const maturity =
    targetModule.implementationMaturity ||
    (targetModule.status === "partial" ? "partial" : targetModule.status === "planned" ? "planned" : "implemented");

  // Resolve Effective Plan Tier & Plan Object
  const effectivePlanId = subscription?.planId || planId;
  const effectiveTier = resolvePlanTier(effectivePlanId, planTier, plans);
  const matchedPlan = findMatchingPlan(effectivePlanId, effectiveTier, plans);

  let isPlatformEnabled = targetModule.isGloballyEnabled;
  if (platformAvailabilityOverrides) {
    if (platformAvailabilityOverrides instanceof Map) {
      if (platformAvailabilityOverrides.has(moduleId)) {
        isPlatformEnabled = platformAvailabilityOverrides.get(moduleId)!;
      }
    } else if (moduleId in platformAvailabilityOverrides) {
      isPlatformEnabled = platformAvailabilityOverrides[moduleId];
    }
  }

  const platformAvailability = isPlatformEnabled ? "enabled" : "disabled";

  // Check active non-expired organization override
  const orgOverride = organizationId
    ? organizationOverrides.find((o) => {
        if (o.organizationId !== organizationId || o.moduleId !== moduleId) return false;
        if (!o.expiresAt) return true;
        const expMs = Date.parse(o.expiresAt);
        return Number.isNaN(expMs) || expMs >= effectiveNowMs;
      })
    : undefined;
  const overrideAction: OrganizationOverrideAction = orgOverride ? orgOverride.action : "inherit";

  // Baseline Plan Inclusion: prefer authoritative SubscriptionPlan.includedModuleIds for canonical modules
  let planInclusion: EffectiveEntitlementResult["planInclusion"] = "not_entitled";
  const isCanonicalId = MODULES_BY_ID.has(targetModule.id);

  if (!effectiveTier && !matchedPlan) {
    planInclusion = "not_entitled";
  } else if (matchedPlan && Array.isArray(matchedPlan.includedModuleIds) && isCanonicalId) {
    if (matchedPlan.includedModuleIds.includes(targetModule.id)) {
      planInclusion = "included";
    } else if (
      matchedPlan.optionalAddOnModuleIds?.includes(targetModule.id) ||
      targetModule.requiresAddonLicense
    ) {
      planInclusion = "add_on";
    } else {
      planInclusion = "excluded";
    }
  } else if (effectiveTier && targetModule.includedInPlans.includes(effectiveTier)) {
    planInclusion = "included";
  } else if (targetModule.requiresAddonLicense) {
    planInclusion = "add_on";
  } else if (effectiveTier) {
    planInclusion = "excluded";
  }

  const recommendedPlanIds = (plans && plans.length > 0 ? plans : (CANONICAL_SUBSCRIPTION_PLANS as unknown as SubscriptionPlan[]))
    .filter(
      (p) =>
        p.status === "published" &&
        p.id !== matchedPlan?.id &&
        Array.isArray(p.includedModuleIds) &&
        p.includedModuleIds.includes(targetModule.id)
    )
    .map((p) => p.id);

  // Precedence Tier 1B: Tenant Status Check (suspended/inactive/archived fail closed even on active subscriptions)
  if (
    organizationStatus &&
    ["suspended", "inactive", "archived"].includes(organizationStatus.toLowerCase())
  ) {
    return {
      moduleId,
      moduleName: targetModule.name,
      organizationId,
      planId: effectivePlanId,
      planTier: effectiveTier,
      isRegistered: true,
      implementationStatus: targetModule.status,
      platformAvailability,
      canonicalStatus: "unavailable",
      implementationMaturity: maturity,
      reasonCode: "TENANT_SUSPENDED",
      planInclusion,
      overrideAction,
      overrideReason: orgOverride?.reason,
      dependenciesSatisfied: false,
      unsatisfiedDependencies: [],
      effectiveStatus: "unavailable",
      reason: `Organization lifecycle status is "${organizationStatus}". Tenant module access is suspended.`,
      recommendedPlanIds: [],
      requiresUpgrade: false,
      requiresAddon: false,
      precedenceApplied: "TENANT_SUSPENDED",
    };
  }

  // Precedence Tier 1C: Subscription Status, Trial Expiry & Grace Period Check
  let inGracePeriod = false;
  let isTrialing = false;
  if (subscription) {
    const subStatus = String(subscription.status || "").toLowerCase();
    if (
      subStatus === "expired" ||
      subStatus === "canceled" ||
      subStatus === "cancelled" ||
      subStatus === "suspended" ||
      subStatus === "pending_payment" ||
      subStatus === "draft"
    ) {
      return {
        moduleId,
        moduleName: targetModule.name,
        organizationId,
        planId: effectivePlanId,
        planTier: effectiveTier,
        isRegistered: true,
        implementationStatus: targetModule.status,
        platformAvailability,
        canonicalStatus: "unavailable",
        implementationMaturity: maturity,
        reasonCode: "SUBSCRIPTION_INACTIVE",
        planInclusion,
        overrideAction,
        overrideReason: orgOverride?.reason,
        dependenciesSatisfied: false,
        unsatisfiedDependencies: [],
        effectiveStatus: "unavailable",
        reason: `Tenant subscription status is "${subscription.status}". Module access is unavailable until activated or renewed.`,
        recommendedPlanIds,
        requiresUpgrade: true,
        requiresAddon: false,
        precedenceApplied: "SUBSCRIPTION_INACTIVE",
      };
    }

    if (subStatus === "trialing") {
      isTrialing = true;
      const trialEnd = subscription.trialEndDate || subscription.currentPeriodEnd;
      const trialMs = trialEnd ? Date.parse(trialEnd) : NaN;
      if (!Number.isNaN(trialMs) && trialMs < effectiveNowMs) {
        return {
          moduleId,
          moduleName: targetModule.name,
          organizationId,
          planId: effectivePlanId,
          planTier: effectiveTier,
          isRegistered: true,
          implementationStatus: targetModule.status,
          platformAvailability,
          canonicalStatus: "unavailable",
          implementationMaturity: maturity,
          reasonCode: "TRIAL_EXPIRED",
          planInclusion,
          overrideAction,
          overrideReason: orgOverride?.reason,
          dependenciesSatisfied: false,
          unsatisfiedDependencies: [],
          effectiveStatus: "unavailable",
          reason: "Organization trial period has expired. Activate a paid subscription plan to restore access.",
          recommendedPlanIds,
          requiresUpgrade: true,
          requiresAddon: false,
          isTrialing: true,
          precedenceApplied: "SUBSCRIPTION_INACTIVE",
        };
      }
    }

    if (subStatus === "past_due") {
      const graceEnd = subscription.gracePeriodEnd;
      const graceMs = graceEnd ? Date.parse(graceEnd) : NaN;
      if (!graceEnd || Number.isNaN(graceMs) || graceMs < effectiveNowMs) {
        return {
          moduleId,
          moduleName: targetModule.name,
          organizationId,
          planId: effectivePlanId,
          planTier: effectiveTier,
          isRegistered: true,
          implementationStatus: targetModule.status,
          platformAvailability,
          canonicalStatus: "unavailable",
          implementationMaturity: maturity,
          reasonCode: "GRACE_PERIOD_EXPIRED",
          planInclusion,
          overrideAction,
          overrideReason: orgOverride?.reason,
          dependenciesSatisfied: false,
          unsatisfiedDependencies: [],
          effectiveStatus: "unavailable",
          reason: "Subscription is past due and the billing grace period has expired.",
          recommendedPlanIds: [],
          requiresUpgrade: true,
          requiresAddon: false,
          precedenceApplied: "SUBSCRIPTION_INACTIVE",
        };
      }
      inGracePeriod = true;
    }
  }

  // Precedence Tier 2: Global Platform Availability & Lifecycle Guards
  if (targetModule.availabilityStatus === "deprecated" || targetModule.status === "deprecated") {
    return {
      moduleId,
      moduleName: targetModule.name,
      organizationId,
      planId: effectivePlanId,
      planTier: effectiveTier,
      isRegistered: true,
      implementationStatus: targetModule.status,
      platformAvailability,
      canonicalStatus: "deprecated",
      implementationMaturity: maturity,
      reasonCode: "DEPRECATED",
      planInclusion,
      overrideAction,
      overrideReason: orgOverride?.reason,
      dependenciesSatisfied: false,
      unsatisfiedDependencies: [],
      effectiveStatus: "unavailable",
      reason: targetModule.deprecatedReason || `Module "${targetModule.name}" is deprecated and superseded.`,
      recommendedPlanIds: [],
      requiresUpgrade: false,
      requiresAddon: false,
      inGracePeriod,
      isTrialing,
      precedenceApplied: "IMPLEMENTATION_GUARD",
    };
  }

  if (targetModule.availabilityStatus === "coming_soon") {
    return {
      moduleId,
      moduleName: targetModule.name,
      organizationId,
      planId: effectivePlanId,
      planTier: effectiveTier,
      isRegistered: true,
      implementationStatus: targetModule.status,
      platformAvailability,
      canonicalStatus: "coming_soon",
      implementationMaturity: maturity,
      reasonCode: "COMING_SOON",
      planInclusion,
      overrideAction,
      overrideReason: orgOverride?.reason,
      dependenciesSatisfied: false,
      unsatisfiedDependencies: [],
      effectiveStatus: "unavailable",
      reason: `Module "${targetModule.name}" is marked Coming Soon and not yet generally released.`,
      recommendedPlanIds: [],
      requiresUpgrade: false,
      requiresAddon: false,
      inGracePeriod,
      isTrialing,
      precedenceApplied: "IMPLEMENTATION_GUARD",
    };
  }

  if (!isPlatformEnabled || targetModule.availabilityStatus === "disabled") {
    return {
      moduleId,
      moduleName: targetModule.name,
      organizationId,
      planId: effectivePlanId,
      planTier: effectiveTier,
      isRegistered: true,
      implementationStatus: targetModule.status,
      platformAvailability: "disabled",
      canonicalStatus: "disabled",
      implementationMaturity: maturity,
      reasonCode: "MODULE_DISABLED",
      planInclusion,
      overrideAction,
      overrideReason: orgOverride?.reason,
      dependenciesSatisfied: false,
      unsatisfiedDependencies: [],
      effectiveStatus: "unavailable",
      reason: `Module "${targetModule.name}" is globally disabled platform-wide by Super Admin configuration.`,
      recommendedPlanIds: [],
      requiresUpgrade: false,
      requiresAddon: false,
      inGracePeriod,
      isTrialing,
      precedenceApplied: "PLATFORM_DISABLEMENT",
    };
  }

  // Precedence Tier 3: Implementation Guard (planned / missing / unknown modules cannot be activated)
  if (
    targetModule.status === "planned" ||
    targetModule.status === "missing" ||
    targetModule.status === "unknown"
  ) {
    return {
      moduleId,
      moduleName: targetModule.name,
      organizationId,
      planId: effectivePlanId,
      planTier: effectiveTier,
      isRegistered: true,
      implementationStatus: targetModule.status,
      platformAvailability,
      canonicalStatus: targetModule.status === "planned" ? "coming_soon" : "unavailable",
      implementationMaturity: maturity,
      reasonCode: targetModule.status === "planned" ? "COMING_SOON" : "MODULE_UNAVAILABLE",
      planInclusion,
      overrideAction,
      overrideReason: orgOverride?.reason,
      dependenciesSatisfied: false,
      unsatisfiedDependencies: [],
      effectiveStatus: "unavailable",
      reason: `Implementation status is "${targetModule.status}". Cannot activate unfinished runtime features.`,
      recommendedPlanIds: [],
      requiresUpgrade: false,
      requiresAddon: false,
      inGracePeriod,
      isTrialing,
      precedenceApplied: "IMPLEMENTATION_GUARD",
    };
  }

  // Precedence Tier 3B: School-Type Compatibility
  if (schoolType && !isSchoolTypeCompatible(schoolType, targetModule.supportedSchoolTypes)) {
    return {
      moduleId,
      moduleName: targetModule.name,
      organizationId,
      planId: effectivePlanId,
      planTier: effectiveTier,
      isRegistered: true,
      implementationStatus: targetModule.status,
      platformAvailability,
      canonicalStatus: "unavailable",
      implementationMaturity: maturity,
      reasonCode: "UNSUPPORTED_SCHOOL_TYPE",
      planInclusion,
      overrideAction,
      overrideReason: orgOverride?.reason,
      dependenciesSatisfied: false,
      unsatisfiedDependencies: [],
      effectiveStatus: "unavailable",
      reason: `Module "${targetModule.name}" is not applicable to institution school type "${schoolType}".`,
      recommendedPlanIds: [],
      requiresUpgrade: false,
      requiresAddon: false,
      inGracePeriod,
      isTrialing,
      precedenceApplied: "UNSUPPORTED_SCHOOL_TYPE",
    };
  }

  // Precedence Tier 4: Organization Explicit Force-Disable Override
  if (overrideAction === "force_disable") {
    return {
      moduleId,
      moduleName: targetModule.name,
      organizationId,
      planId: effectivePlanId,
      planTier: effectiveTier,
      isRegistered: true,
      implementationStatus: targetModule.status,
      platformAvailability,
      canonicalStatus: "disabled",
      implementationMaturity: maturity,
      reasonCode: "DISABLED_BY_OVERRIDE",
      planInclusion: "excluded",
      overrideAction,
      overrideReason: orgOverride?.reason,
      dependenciesSatisfied: false,
      unsatisfiedDependencies: [],
      effectiveStatus: "unavailable",
      reason: `Explicitly disabled by organization override: ${orgOverride?.reason || "Force Disabled"}.`,
      recommendedPlanIds: [],
      requiresUpgrade: false,
      requiresAddon: false,
      inGracePeriod,
      isTrialing,
      precedenceApplied: "ORGANIZATION_FORCE_DISABLE",
    };
  }

  // Precedence Tier 5: Required Dependencies Evaluation
  // Check dependencies first when the module itself is plan-included (or explicitly force-enabled check),
  // whereas modules excluded by the plan cleanly report PLAN_EXCLUDED rather than dependency failure.
  const unsatisfiedDependencies: UnsatisfiedDependencyDetail[] = [];
  if (planInclusion === "included" && !checkedModuleStack.has(moduleId)) {
    checkedModuleStack.add(moduleId);

    const reqIds = new Set<string>();
    if (targetModule.parentId) reqIds.add(targetModule.parentId);
    for (const dep of targetModule.dependencies) {
      if (dep.type === "required") reqIds.add(dep.moduleId);
    }

    for (const depId of reqIds) {
      if (checkedModuleStack.has(depId)) continue;
      const depModule = modMap.get(depId);
      if (!depModule) {
        unsatisfiedDependencies.push({
          moduleId: depId,
          moduleName: depId,
          type: "required",
          reason: `Dependency module ID "${depId}" does not exist in registry.`,
        });
        continue;
      }

      const depResult = evaluateModuleEntitlement({
        ...options,
        moduleId: depId,
        checkedModuleStack: new Set(checkedModuleStack),
      });

      if (depResult.effectiveStatus !== "available") {
        unsatisfiedDependencies.push({
          moduleId: depId,
          moduleName: depModule.name,
          type: "required",
          reason: `Required dependency "${depModule.name}" is ${depResult.effectiveStatus} (${depResult.reason}).`,
        });
      }
    }
  }

  const dependenciesSatisfied = unsatisfiedDependencies.length === 0;

  // Dependency failures block access unless force-enabled by explicit override
  if (!dependenciesSatisfied && overrideAction !== "force_enable") {
    return {
      moduleId,
      moduleName: targetModule.name,
      organizationId,
      planId: effectivePlanId,
      planTier: effectiveTier,
      isRegistered: true,
      implementationStatus: targetModule.status,
      platformAvailability,
      canonicalStatus: "unavailable",
      implementationMaturity: maturity,
      reasonCode: "MISSING_DEPENDENCY",
      planInclusion,
      overrideAction,
      overrideReason: orgOverride?.reason,
      dependenciesSatisfied: false,
      unsatisfiedDependencies,
      effectiveStatus: "restricted",
      reason: `Blocked by unsatisfied required dependency: ${unsatisfiedDependencies.map((d) => d.moduleName).join(", ")}.`,
      recommendedPlanIds,
      requiresUpgrade: recommendedPlanIds.length > 0,
      requiresAddon: false,
      inGracePeriod,
      isTrialing,
      precedenceApplied: "DEPENDENCY_FAILURE",
    };
  }

  // Precedence Tier 6: Explicit Force-Enable or Trial-Extension Override
  if (overrideAction === "force_enable" || overrideAction === "trial_extension") {
    return {
      moduleId,
      moduleName: targetModule.name,
      organizationId,
      planId: effectivePlanId,
      planTier: effectiveTier,
      isRegistered: true,
      implementationStatus: targetModule.status,
      platformAvailability,
      canonicalStatus: "enabled",
      implementationMaturity: maturity,
      reasonCode: "ENTITLED_BY_OVERRIDE",
      planInclusion: "included",
      overrideAction,
      overrideReason: orgOverride?.reason,
      dependenciesSatisfied,
      unsatisfiedDependencies,
      effectiveStatus: "available",
      reason:
        overrideAction === "trial_extension"
          ? `Granted temporary evaluation access: ${orgOverride?.reason || "Trial Extension"}.`
          : `Explicitly enabled by organization override: ${orgOverride?.reason || "Force Enabled"}.`,
      recommendedPlanIds: [],
      requiresUpgrade: false,
      requiresAddon: false,
      inGracePeriod,
      isTrialing,
      precedenceApplied: "ORGANIZATION_FORCE_ENABLE",
    };
  }

  // Precedence Tier 6B: Explicit Active Add-On Entitlement
  if (activeAddOnModuleIds.includes(targetModule.id)) {
    return {
      moduleId,
      moduleName: targetModule.name,
      organizationId,
      planId: effectivePlanId,
      planTier: effectiveTier,
      isRegistered: true,
      implementationStatus: targetModule.status,
      platformAvailability,
      canonicalStatus: "enabled",
      implementationMaturity: maturity,
      reasonCode: "ENTITLED_BY_ADDON",
      planInclusion: "included",
      overrideAction,
      dependenciesSatisfied: true,
      unsatisfiedDependencies: [],
      effectiveStatus: "available",
      reason: `Granted via active module add-on license.`,
      recommendedPlanIds: [],
      requiresUpgrade: false,
      requiresAddon: false,
      inGracePeriod,
      isTrialing,
      precedenceApplied: "ADDON_ENTITLED",
    };
  }

  // Precedence Tier 7: Standard Plan Entitlement
  if (planInclusion === "included") {
    const canonicalStatus: CanonicalEntitlementStatus = inGracePeriod ? "available" : "enabled";
    return {
      moduleId,
      moduleName: targetModule.name,
      organizationId,
      planId: effectivePlanId,
      planTier: effectiveTier,
      isRegistered: true,
      implementationStatus: targetModule.status,
      platformAvailability,
      canonicalStatus,
      implementationMaturity: maturity,
      reasonCode: inGracePeriod ? "ENTITLED_BY_GRACE_PERIOD" : "ENTITLED_BY_PLAN",
      planInclusion,
      overrideAction,
      dependenciesSatisfied: true,
      unsatisfiedDependencies: [],
      effectiveStatus: "available",
      reason: inGracePeriod
        ? `Included in the ${effectiveTier || matchedPlan?.name} subscription plan (billing grace period active).`
        : `Module "${targetModule.name}" is included in the ${effectiveTier || matchedPlan?.name} subscription plan (${matchedPlan?.name || effectiveTier}).`,
      recommendedPlanIds: [],
      requiresUpgrade: false,
      requiresAddon: false,
      inGracePeriod,
      isTrialing,
      precedenceApplied: "PLAN_INCLUDED",
    };
  }

  // Unspecified / Unknown Subscription Plan -> Fail closed with 'unresolved'
  if (!effectiveTier && !matchedPlan) {
    return {
      moduleId,
      moduleName: targetModule.name,
      organizationId,
      planId: effectivePlanId,
      planTier: effectiveTier,
      isRegistered: true,
      implementationStatus: targetModule.status,
      platformAvailability,
      canonicalStatus: "restricted_by_plan",
      implementationMaturity: maturity,
      reasonCode: "MISSING_ENTITLEMENT_DATA",
      planInclusion: "not_entitled",
      overrideAction,
      dependenciesSatisfied,
      unsatisfiedDependencies,
      effectiveStatus: "unresolved",
      reason: `Fail-closed guard: Tenant subscription plan is unspecified or unknown (${effectivePlanId || "none"}).`,
      recommendedPlanIds,
      requiresUpgrade: recommendedPlanIds.length > 0,
      requiresAddon: false,
      inGracePeriod,
      isTrialing,
      precedenceApplied: "PLAN_EXCLUDED",
    };
  }

  // Excluded from Plan -> Fail closed as restricted_by_plan (unavailable in legacy status)
  return {
    moduleId,
    moduleName: targetModule.name,
    organizationId,
    planId: effectivePlanId,
    planTier: effectiveTier,
    isRegistered: true,
    implementationStatus: targetModule.status,
    platformAvailability,
    canonicalStatus: "restricted_by_plan",
    implementationMaturity: maturity,
    reasonCode: planInclusion === "add_on" ? "REQUIRES_ADDON" : "PLAN_RESTRICTED",
    planInclusion,
    overrideAction,
    dependenciesSatisfied,
    unsatisfiedDependencies,
    effectiveStatus: "unavailable",
    reason:
      planInclusion === "add_on"
        ? `Module "${targetModule.name}" is not included in the ${effectiveTier} plan (available via optional add-on license or higher tier).`
        : `Module "${targetModule.name}" is not included in the ${effectiveTier} plan (${matchedPlan?.name || effectiveTier}).`,
    recommendedPlanIds,
    requiresUpgrade: recommendedPlanIds.length > 0,
    requiresAddon: planInclusion === "add_on",
    inGracePeriod,
    isTrialing,
    precedenceApplied: "PLAN_EXCLUDED",
  };
}

export function evaluateAllModules(options: {
  organizationId?: string;
  organizationStatus?: OrganizationLifecycleStatus | string;
  schoolType?: string;
  planId?: string;
  planTier?: PlanTier;
  plans?: SubscriptionPlan[];
  subscription?: Partial<OrganizationSubscription>;
  registry?: TenantModuleDefinition[];
  platformAvailabilityOverrides?: Map<string, boolean> | Record<string, boolean>;
  organizationOverrides?: OrganizationModuleOverride[];
  activeAddOnModuleIds?: string[];
  asOfDate?: string;
}): Map<string, EffectiveEntitlementResult> {
  const modules = options.registry || MASTER_MODULE_REGISTRY;
  const results = new Map<string, EffectiveEntitlementResult>();

  for (const mod of modules) {
    const res = evaluateModuleEntitlement({
      ...options,
      moduleId: mod.id,
    });
    results.set(mod.id, res);
  }

  return results;
}
