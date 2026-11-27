/**
 * Canonical Deterministic Fail-Closed Entitlement Resolver
 * Phase P0-4 — Shared Evaluation Engine (Frontend-Only Simulation)
 *
 * Precedence Order (strictly fail-closed on unknown IDs or missing entitlement data):
 *  1. Resolve target canonical module/feature ID -> fail closed if unknown.
 *  2. Verify tenant & entitlement context presence -> fail closed if missing.
 *  3. Check tenant lifecycle status (`suspended | inactive | archived`) -> fail closed.
 *  4. Check subscription lifecycle (`expired | canceled`, expired trial, expired grace period) -> fail closed.
 *  5. Check global platform availability (`deprecated`, `coming_soon`, `disabled`, `unavailable`).
 *  6. Check school-type compatibility against module/feature `supportedSchoolTypes`.
 *  7. Check explicit administrative `force_disable` override (ignoring expired overrides).
 *  8. Check tenant local feature toggle (`tenantFeatureToggles[key] === false`).
 *  9. Check required parent module & required dependency chain (cycle-safe).
 * 10. Evaluate usage quotas against plan/tenant limits (`students`, `staff`, `campuses`, `storage`).
 * 11. Evaluate grants: active `force_enable`/`trial_extension` override > active non-expired add-on > active plan inclusion.
 */

import {
  isSchoolTypeCompatible,
  type CanonicalEntitlementResult,
  type CanonicalFeatureDefinition,
  type CanonicalModuleDefinition,
  type CanonicalPlanDefinition,
  type QuotaCheckResult,
  type TenantEntitlementContext,
  type TenantEntitlementOverride,
} from "./canonical-contract";

export interface ResolveEntitlementOptions {
  modulesById: Map<string, CanonicalModuleDefinition> | Record<string, CanonicalModuleDefinition>;
  featuresById?: Map<string, CanonicalFeatureDefinition> | Record<string, CanonicalFeatureDefinition>;
  featuresByKey?: Map<string, CanonicalFeatureDefinition> | Record<string, CanonicalFeatureDefinition>;
  allPlans?: CanonicalPlanDefinition[];
  asOfDate?: string;
  enforceQuotaBlock?: boolean;
  visitedStack?: Set<string>;
}

export interface PlanComparisonRow {
  moduleId: string;
  moduleName: string;
  code: string;
  category: string;
  macroCategory: CanonicalModuleDefinition["macroCategory"];
  availabilityStatus: CanonicalModuleDefinition["availabilityStatus"];
  implementationMaturity: CanonicalModuleDefinition["implementationMaturity"];
  supportedSchoolTypes: CanonicalModuleDefinition["supportedSchoolTypes"];
  perPlan: Record<
    string,
    {
      state: "included" | "optional_addon" | "excluded" | "deprecated" | "coming_soon" | "unsupported_school_type";
      label: string;
    }
  >;
}

function lookupMapOrRecord<T>(
  source: Map<string, T> | Record<string, T> | undefined,
  key: string
): T | undefined {
  if (!source) return undefined;
  if (source instanceof Map) return source.get(key);
  return source[key];
}

function parseTimeMs(iso?: string): number | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
}

function isOverrideActive(override: TenantEntitlementOverride, nowMs: number): boolean {
  if (!override.expiresAt) return true;
  const expMs = parseTimeMs(override.expiresAt);
  return expMs === null || expMs >= nowMs;
}

export function evaluateQuotaUsage(context: TenantEntitlementContext): QuotaCheckResult {
  const exceededMetrics: QuotaCheckResult["exceededMetrics"] = [];
  const usage = context.usage;
  const limits = {
    maxStudents: context.limits?.maxStudents ?? context.plan?.maxStudents,
    maxStaff: context.limits?.maxStaff ?? context.plan?.maxStaff,
    maxCampuses: context.limits?.maxCampuses ?? context.plan?.maxCampuses,
    storageGb: context.limits?.storageGb ?? context.plan?.storageGb,
  };

  if (usage) {
    if (
      typeof usage.studentsCount === "number" &&
      typeof limits.maxStudents === "number" &&
      limits.maxStudents > 0 &&
      usage.studentsCount > limits.maxStudents
    ) {
      exceededMetrics.push({ metric: "students", used: usage.studentsCount, limit: limits.maxStudents });
    }
    if (
      typeof usage.staffCount === "number" &&
      typeof limits.maxStaff === "number" &&
      limits.maxStaff > 0 &&
      usage.staffCount > limits.maxStaff
    ) {
      exceededMetrics.push({ metric: "staff", used: usage.staffCount, limit: limits.maxStaff });
    }
    if (
      typeof usage.campusesCount === "number" &&
      typeof limits.maxCampuses === "number" &&
      limits.maxCampuses > 0 &&
      usage.campusesCount > limits.maxCampuses
    ) {
      exceededMetrics.push({ metric: "campuses", used: usage.campusesCount, limit: limits.maxCampuses });
    }
    if (
      typeof usage.storageUsedGb === "number" &&
      typeof limits.storageGb === "number" &&
      limits.storageGb > 0 &&
      usage.storageUsedGb > limits.storageGb
    ) {
      exceededMetrics.push({ metric: "storage", used: usage.storageUsedGb, limit: limits.storageGb });
    }
  }

  return {
    withinLimits: exceededMetrics.length === 0,
    exceededMetrics,
  };
}

function recommendPlansForModule(
  moduleId: string,
  allPlans: CanonicalPlanDefinition[] | undefined,
  currentPlanId?: string
): string[] {
  if (!allPlans || allPlans.length === 0) return [];
  return allPlans
    .filter(
      (p) =>
        p.status === "published" &&
        p.id !== currentPlanId &&
        p.includedModuleIds.includes(moduleId)
    )
    .map((p) => p.id);
}

export function resolveCanonicalEntitlement(
  context: TenantEntitlementContext | null | undefined,
  target: { moduleId?: string; featureId?: string; featureKey?: string },
  options: ResolveEntitlementOptions
): CanonicalEntitlementResult {
  const nowMs = parseTimeMs(options.asOfDate) ?? Date.now();
  const visited = options.visitedStack ? new Set(options.visitedStack) : new Set<string>();

  // 1. Resolve target feature or module canonically (fail closed on unknown IDs)
  let resolvedFeature: CanonicalFeatureDefinition | undefined;
  if (target.featureId) {
    resolvedFeature = lookupMapOrRecord(options.featuresById, target.featureId);
    if (!resolvedFeature) {
      return {
        allowed: false,
        targetType: "feature",
        targetId: target.featureId,
        effectiveStatus: "unavailable",
        implementationMaturity: "planned",
        reasonCode: "UNKNOWN_MODULE_OR_FEATURE",
        explanation: `Unknown feature ID "${target.featureId}". Failing closed by default.`,
        source: "unknown",
        requiresUpgrade: false,
        requiresAddon: false,
        recommendedPlanIds: [],
        missingDependencies: [],
        inGracePeriod: false,
        isTrialing: false,
        isOverridden: false,
        quota: { withinLimits: true, exceededMetrics: [] },
      };
    }
  } else if (target.featureKey) {
    resolvedFeature = lookupMapOrRecord(options.featuresByKey, target.featureKey);
    if (!resolvedFeature && !target.moduleId) {
      return {
        allowed: false,
        targetType: "feature",
        targetId: target.featureKey,
        effectiveStatus: "unavailable",
        implementationMaturity: "planned",
        reasonCode: "UNKNOWN_MODULE_OR_FEATURE",
        explanation: `Unknown feature key "${target.featureKey}". Failing closed by default.`,
        source: "unknown",
        requiresUpgrade: false,
        requiresAddon: false,
        recommendedPlanIds: [],
        missingDependencies: [],
        inGracePeriod: false,
        isTrialing: false,
        isOverridden: false,
        quota: { withinLimits: true, exceededMetrics: [] },
      };
    }
  }

  const targetModuleId = target.moduleId ?? resolvedFeature?.moduleId;
  const resolvedModule = targetModuleId
    ? lookupMapOrRecord(options.modulesById, targetModuleId)
    : undefined;

  if (!targetModuleId || !resolvedModule) {
    const missingId = targetModuleId || target.featureId || target.featureKey || "unspecified";
    return {
      allowed: false,
      targetType: resolvedFeature ? "feature" : "module",
      targetId: missingId,
      moduleId: targetModuleId,
      featureId: resolvedFeature?.id,
      effectiveStatus: "unavailable",
      implementationMaturity: resolvedFeature?.implementationMaturity ?? "planned",
      reasonCode: "UNKNOWN_MODULE_OR_FEATURE",
      explanation: `Unknown module reference "${missingId}". Unknown modules always fail closed.`,
      source: "unknown",
      requiresUpgrade: false,
      requiresAddon: false,
      recommendedPlanIds: [],
      missingDependencies: [],
      inGracePeriod: false,
      isTrialing: false,
      isOverridden: false,
      quota: { withinLimits: true, exceededMetrics: [] },
    };
  }

  const targetType: "module" | "feature" = resolvedFeature ? "feature" : "module";
  const targetId = resolvedFeature ? resolvedFeature.id : resolvedModule.id;
  const maturity = resolvedFeature
    ? resolvedFeature.implementationMaturity
    : resolvedModule.implementationMaturity;
  const emptyQuota: QuotaCheckResult = context
    ? evaluateQuotaUsage(context)
    : { withinLimits: false, exceededMetrics: [] };

  // 2. Missing context / missing entitlement data fails closed
  if (!context || !context.tenantId) {
    return {
      allowed: false,
      targetType,
      targetId,
      moduleId: resolvedModule.id,
      featureId: resolvedFeature?.id,
      effectiveStatus: "unavailable",
      implementationMaturity: maturity,
      reasonCode: "MISSING_ENTITLEMENT_DATA",
      explanation: "Missing tenant entitlement context. Failing closed.",
      source: "restricted",
      requiresUpgrade: false,
      requiresAddon: false,
      recommendedPlanIds: [],
      missingDependencies: [],
      inGracePeriod: false,
      isTrialing: false,
      isOverridden: false,
      quota: emptyQuota,
    };
  }

  const hasPlanOrModuleSnapshot =
    Boolean(context.plan) ||
    Array.isArray(context.includedModuleIds) ||
    Array.isArray(context.overrides) && context.overrides.some((o) => isOverrideActive(o, nowMs));

  if (!hasPlanOrModuleSnapshot) {
    return {
      allowed: false,
      targetType,
      targetId,
      moduleId: resolvedModule.id,
      featureId: resolvedFeature?.id,
      effectiveStatus: "unavailable",
      implementationMaturity: maturity,
      reasonCode: "MISSING_ENTITLEMENT_DATA",
      explanation: "No subscription plan, module snapshot, or active override supplied for tenant.",
      source: "restricted",
      requiresUpgrade: true,
      requiresAddon: resolvedModule.requiresAddonLicense,
      recommendedPlanIds: recommendPlansForModule(resolvedModule.id, options.allPlans, context.subscription?.planId),
      missingDependencies: [],
      inGracePeriod: false,
      isTrialing: false,
      isOverridden: false,
      quota: emptyQuota,
    };
  }

  // 3. Tenant lifecycle status check (canonical P0-5 states + safe fail-closed unknown check)
  const tenantStatusLower = context.tenantStatus.trim().toLowerCase();
  const operationalLifecycleStates = new Set([
    "active",
    "trial",
    "cancellation_pending",
  ]);
  const restrictedLifecycleReasons: Record<string, string> = {
    draft: `Tenant "${context.tenantId}" is still in Draft status before registration submission.`,
    registration_pending: `Tenant registration is pending Super Admin verification before workspace activation.`,
    pending: `Tenant registration is pending review before workspace activation.`,
    onboarding_in_progress: `Tenant onboarding is still in progress. Complete guided setup to unlock operational modules.`,
    onboarding: `Tenant onboarding is still in progress. Complete guided setup to unlock operational modules.`,
    awaiting_configuration: `Tenant is awaiting mandatory configuration updates prior to activation.`,
    inactive: `Tenant account status is inactive/awaiting configuration. Operational modules are restricted.`,
    awaiting_activation: `Tenant configuration is complete and awaiting final Super Admin activation.`,
    pending_activation: `Tenant is awaiting final Super Admin activation.`,
    suspended: `Tenant account is administratively suspended. Operational module access is restricted.`,
    cancelled: `Tenant service has been cancelled. Operational modules are locked.`,
    canceled: `Tenant service has been cancelled. Operational modules are locked.`,
    archived: `Tenant record is archived read-only. Active operational modules are disabled.`,
    closed: `Tenant institution is permanently closed.`,
  };

  if (!operationalLifecycleStates.has(tenantStatusLower)) {
    const explanation =
      restrictedLifecycleReasons[tenantStatusLower] ||
      `Unrecognized or non-operational tenant lifecycle state ("${context.tenantStatus}"). Failing closed safely.`;
    return {
      allowed: false,
      targetType,
      targetId,
      moduleId: resolvedModule.id,
      featureId: resolvedFeature?.id,
      effectiveStatus: "unavailable",
      implementationMaturity: maturity,
      reasonCode: "TENANT_SUSPENDED",
      explanation,
      source: "restricted",
      requiresUpgrade: false,
      requiresAddon: false,
      recommendedPlanIds: [],
      missingDependencies: [],
      inGracePeriod: false,
      isTrialing: false,
      isOverridden: false,
      quota: emptyQuota,
    };
  }

  // 4. Subscription status, trial expiry, and grace-period evaluation
  let inGracePeriod = false;
  let isTrialing = false;
  if (context.subscription) {
    const subStatus = String(context.subscription.status || "").toLowerCase();
    if (
      subStatus === "expired" ||
      subStatus === "canceled" ||
      subStatus === "cancelled" ||
      subStatus === "suspended" ||
      subStatus === "pending_payment" ||
      subStatus === "draft"
    ) {
      return {
        allowed: false,
        targetType,
        targetId,
        moduleId: resolvedModule.id,
        featureId: resolvedFeature?.id,
        effectiveStatus: "unavailable",
        implementationMaturity: maturity,
        reasonCode: "SUBSCRIPTION_INACTIVE",
        explanation: `Subscription is "${context.subscription.status}". Activate or renew plan to restore module access.`,
        source: "restricted",
        requiresUpgrade: true,
        requiresAddon: false,
        recommendedPlanIds: recommendPlansForModule(resolvedModule.id, options.allPlans),
        missingDependencies: [],
        inGracePeriod: false,
        isTrialing: false,
        isOverridden: false,
        quota: emptyQuota,
      };
    }

    if (subStatus === "trialing") {
      isTrialing = true;
      const trialEndMs =
        parseTimeMs(context.subscription.trialEndsAt) ??
        parseTimeMs(context.subscription.currentPeriodEnd);
      if (trialEndMs !== null && trialEndMs < nowMs) {
        return {
          allowed: false,
          targetType,
          targetId,
          moduleId: resolvedModule.id,
          featureId: resolvedFeature?.id,
          effectiveStatus: "unavailable",
          implementationMaturity: maturity,
          reasonCode: "TRIAL_EXPIRED",
          explanation: "Subscription trial period has expired. Activate a paid plan to continue.",
          source: "restricted",
          requiresUpgrade: true,
          requiresAddon: false,
          recommendedPlanIds: recommendPlansForModule(resolvedModule.id, options.allPlans, context.subscription.planId),
          missingDependencies: [],
          inGracePeriod: false,
          isTrialing: true,
          isOverridden: false,
          quota: emptyQuota,
        };
      }
    }

    if (subStatus === "past_due") {
      const graceEndMs = parseTimeMs(context.subscription.gracePeriodEndsAt);
      if (graceEndMs === null || graceEndMs < nowMs) {
        return {
          allowed: false,
          targetType,
          targetId,
          moduleId: resolvedModule.id,
          featureId: resolvedFeature?.id,
          effectiveStatus: "unavailable",
          implementationMaturity: maturity,
          reasonCode: "GRACE_PERIOD_EXPIRED",
          explanation: "Subscription payment is past due and its grace period has expired.",
          source: "restricted",
          requiresUpgrade: true,
          requiresAddon: false,
          recommendedPlanIds: [],
          missingDependencies: [],
          inGracePeriod: false,
          isTrialing: false,
          isOverridden: false,
          quota: emptyQuota,
        };
      }
      inGracePeriod = true;
    }
  } else if (!context.plan && !context.includedModuleIds) {
    return {
      allowed: false,
      targetType,
      targetId,
      moduleId: resolvedModule.id,
      featureId: resolvedFeature?.id,
      effectiveStatus: "unavailable",
      implementationMaturity: maturity,
      reasonCode: "MISSING_SUBSCRIPTION",
      explanation: "Tenant has no active subscription record.",
      source: "restricted",
      requiresUpgrade: true,
      requiresAddon: false,
      recommendedPlanIds: recommendPlansForModule(resolvedModule.id, options.allPlans),
      missingDependencies: [],
      inGracePeriod: false,
      isTrialing: false,
      isOverridden: false,
      quota: emptyQuota,
    };
  }

  // 5. Global platform availability & lifecycle checks
  const effectiveGlobalAvail = resolvedFeature
    ? resolvedFeature.availabilityStatus
    : resolvedModule.availabilityStatus;

  if (resolvedModule.availabilityStatus === "deprecated" || resolvedFeature?.availabilityStatus === "deprecated") {
    return {
      allowed: false,
      targetType,
      targetId,
      moduleId: resolvedModule.id,
      featureId: resolvedFeature?.id,
      effectiveStatus: "deprecated",
      implementationMaturity: maturity,
      reasonCode: "DEPRECATED",
      explanation:
        resolvedModule.deprecatedReason ||
        `Module "${resolvedModule.name}" has been deprecated.${resolvedModule.replacedByModuleId ? ` Replaced by ${resolvedModule.replacedByModuleId}.` : ""}`,
      source: "restricted",
      requiresUpgrade: false,
      requiresAddon: false,
      recommendedPlanIds: [],
      missingDependencies: [],
      inGracePeriod,
      isTrialing,
      isOverridden: false,
      quota: emptyQuota,
    };
  }

  if (effectiveGlobalAvail === "coming_soon") {
    return {
      allowed: false,
      targetType,
      targetId,
      moduleId: resolvedModule.id,
      featureId: resolvedFeature?.id,
      effectiveStatus: "coming_soon",
      implementationMaturity: maturity,
      reasonCode: "COMING_SOON",
      explanation: `${resolvedFeature ? resolvedFeature.name : resolvedModule.name} is marked as Coming Soon on the product roadmap.`,
      source: "restricted",
      requiresUpgrade: false,
      requiresAddon: false,
      recommendedPlanIds: [],
      missingDependencies: [],
      inGracePeriod,
      isTrialing,
      isOverridden: false,
      quota: emptyQuota,
    };
  }

  if (
    effectiveGlobalAvail === "disabled" ||
    !resolvedModule.isGloballyEnabled ||
    (resolvedFeature && !resolvedFeature.isGloballyEnabled)
  ) {
    return {
      allowed: false,
      targetType,
      targetId,
      moduleId: resolvedModule.id,
      featureId: resolvedFeature?.id,
      effectiveStatus: "disabled",
      implementationMaturity: maturity,
      reasonCode: "MODULE_DISABLED",
      explanation: `${resolvedFeature ? resolvedFeature.name : resolvedModule.name} is globally disabled by Platform Administration.`,
      source: "restricted",
      requiresUpgrade: false,
      requiresAddon: false,
      recommendedPlanIds: [],
      missingDependencies: [],
      inGracePeriod,
      isTrialing,
      isOverridden: false,
      quota: emptyQuota,
    };
  }

  if (effectiveGlobalAvail === "unavailable") {
    return {
      allowed: false,
      targetType,
      targetId,
      moduleId: resolvedModule.id,
      featureId: resolvedFeature?.id,
      effectiveStatus: "unavailable",
      implementationMaturity: maturity,
      reasonCode: "MODULE_UNAVAILABLE",
      explanation: `${resolvedFeature ? resolvedFeature.name : resolvedModule.name} is currently unavailable.`,
      source: "restricted",
      requiresUpgrade: false,
      requiresAddon: false,
      recommendedPlanIds: [],
      missingDependencies: [],
      inGracePeriod,
      isTrialing,
      isOverridden: false,
      quota: emptyQuota,
    };
  }

  // 6. School-type compatibility check
  const supportedSchoolTypes = resolvedFeature?.supportedSchoolTypes ?? resolvedModule.supportedSchoolTypes;
  if (!isSchoolTypeCompatible(context.schoolType, supportedSchoolTypes)) {
    return {
      allowed: false,
      targetType,
      targetId,
      moduleId: resolvedModule.id,
      featureId: resolvedFeature?.id,
      effectiveStatus: "unavailable",
      implementationMaturity: maturity,
      reasonCode: "UNSUPPORTED_SCHOOL_TYPE",
      explanation: `${resolvedModule.name} is not compatible with school type "${context.schoolType}".`,
      source: "restricted",
      requiresUpgrade: false,
      requiresAddon: false,
      recommendedPlanIds: [],
      missingDependencies: [],
      inGracePeriod,
      isTrialing,
      isOverridden: false,
      quota: emptyQuota,
    };
  }

  // 7. Administrative overrides (`force_disable` evaluated before grants)
  const activeOverrides = (context.overrides || []).filter((o) => isOverrideActive(o, nowMs));
  const targetOverride =
    activeOverrides.find((o) => resolvedFeature && o.featureId === resolvedFeature.id) ||
    activeOverrides.find((o) => o.moduleId === resolvedModule.id) ||
    (resolvedModule.parentId ? activeOverrides.find((o) => o.moduleId === resolvedModule.parentId) : undefined);

  if (targetOverride && targetOverride.action === "force_disable") {
    return {
      allowed: false,
      targetType,
      targetId,
      moduleId: resolvedModule.id,
      featureId: resolvedFeature?.id,
      effectiveStatus: "disabled",
      implementationMaturity: maturity,
      reasonCode: "DISABLED_BY_OVERRIDE",
      explanation: `Disabled by administrative override: ${targetOverride.reason}.`,
      source: "restricted",
      requiresUpgrade: false,
      requiresAddon: false,
      recommendedPlanIds: [],
      missingDependencies: [],
      inGracePeriod,
      isTrialing,
      isOverridden: true,
      quota: emptyQuota,
    };
  }

  // 8. Tenant local feature toggle (`tenantFeatureToggles[key] === false` fails closed)
  if (context.tenantFeatureToggles && resolvedFeature) {
    const key = resolvedFeature.key;
    if (key in context.tenantFeatureToggles && context.tenantFeatureToggles[key] === false) {
      return {
        allowed: false,
        targetType,
        targetId,
        moduleId: resolvedModule.id,
        featureId: resolvedFeature.id,
        effectiveStatus: "disabled",
        implementationMaturity: maturity,
        reasonCode: "TENANT_FEATURE_DISABLED",
        explanation: `Feature "${resolvedFeature.name}" is disabled in institutional school settings.`,
        source: "restricted",
        requiresUpgrade: false,
        requiresAddon: false,
        recommendedPlanIds: [],
        missingDependencies: [],
        inGracePeriod,
        isTrialing,
        isOverridden: false,
        quota: emptyQuota,
      };
    }
  }

  // 9. Usage quota check (blocks when enforceQuotaBlock is requested and limits exceeded)
  if (options.enforceQuotaBlock && !emptyQuota.withinLimits) {
    const summary = emptyQuota.exceededMetrics
      .map((m) => `${m.metric} (${m.used}/${m.limit})`)
      .join(", ");
    return {
      allowed: false,
      targetType,
      targetId,
      moduleId: resolvedModule.id,
      featureId: resolvedFeature?.id,
      effectiveStatus: "restricted_by_plan",
      implementationMaturity: maturity,
      reasonCode: "USAGE_LIMIT_REACHED",
      explanation: `Plan usage limit exceeded: ${summary}. Upgrade plan capacity to continue.`,
      source: "restricted",
      requiresUpgrade: true,
      requiresAddon: false,
      recommendedPlanIds: context.plan?.upgradeToPlanIds || [],
      missingDependencies: [],
      inGracePeriod,
      isTrialing,
      isOverridden: false,
      quota: emptyQuota,
    };
  }

  // 10. Required parent & dependency checks (cycle-safe)
  const depsToCheck: string[] = [];
  if (resolvedModule.parentId) depsToCheck.push(resolvedModule.parentId);
  for (const dep of resolvedModule.dependencies) {
    if (dep.type === "required") depsToCheck.push(dep.moduleId);
  }
  const missingDeps: string[] = [];
  if (!visited.has(resolvedModule.id)) {
    visited.add(resolvedModule.id);
    for (const depModId of depsToCheck) {
      if (visited.has(depModId)) continue;
      const depResult = resolveCanonicalEntitlement(
        context,
        { moduleId: depModId },
        { ...options, visitedStack: visited }
      );
      if (!depResult.allowed) {
        missingDeps.push(depModId);
      }
    }
  }

  if (missingDeps.length > 0 && targetOverride?.action !== "force_enable") {
    return {
      allowed: false,
      targetType,
      targetId,
      moduleId: resolvedModule.id,
      featureId: resolvedFeature?.id,
      effectiveStatus: "unavailable",
      implementationMaturity: maturity,
      reasonCode: "MISSING_DEPENDENCY",
      explanation: `Requires active dependency module(s): ${missingDeps.join(", ")}.`,
      source: "restricted",
      requiresUpgrade: true,
      requiresAddon: false,
      recommendedPlanIds: recommendPlansForModule(resolvedModule.id, options.allPlans, context.plan?.id ?? context.subscription?.planId),
      missingDependencies: missingDeps,
      inGracePeriod,
      isTrialing,
      isOverridden: false,
      quota: emptyQuota,
    };
  }

  // 11. Grant evaluation: Override > Active Add-on > Plan Inclusion
  if (
    targetOverride &&
    (targetOverride.action === "force_enable" || targetOverride.action === "trial_extension")
  ) {
    return {
      allowed: true,
      targetType,
      targetId,
      moduleId: resolvedModule.id,
      featureId: resolvedFeature?.id,
      effectiveStatus: "enabled",
      implementationMaturity: maturity,
      reasonCode: "ENTITLED_BY_OVERRIDE",
      explanation:
        targetOverride.action === "trial_extension"
          ? `Enabled via administrative trial extension (${targetOverride.reason}).`
          : `Enabled via administrative override (${targetOverride.reason}).`,
      source: "override",
      requiresUpgrade: false,
      requiresAddon: false,
      recommendedPlanIds: [],
      missingDependencies: [],
      inGracePeriod,
      isTrialing,
      isOverridden: true,
      quota: emptyQuota,
    };
  }

  const activeAddOn = (context.addOns || []).find((a) => {
    if (a.status !== "active") return false;
    const expMs = parseTimeMs(a.expiryDate);
    if (expMs !== null && expMs < nowMs) return false;
    if (resolvedFeature && a.featureId === resolvedFeature.id) return true;
    return a.moduleId === resolvedModule.id || (resolvedModule.parentId && a.moduleId === resolvedModule.parentId);
  });

  if (activeAddOn) {
    return {
      allowed: true,
      targetType,
      targetId,
      moduleId: resolvedModule.id,
      featureId: resolvedFeature?.id,
      effectiveStatus: "enabled",
      implementationMaturity: maturity,
      reasonCode: "ENTITLED_BY_ADDON",
      explanation: `Enabled via active add-on license (${activeAddOn.name}).`,
      source: "addon",
      requiresUpgrade: false,
      requiresAddon: false,
      recommendedPlanIds: [],
      missingDependencies: [],
      inGracePeriod,
      isTrialing,
      isOverridden: false,
      quota: emptyQuota,
    };
  }

  const planIncludedModules = new Set<string>([
    ...(context.plan?.includedModuleIds || []),
    ...(context.includedModuleIds || []),
  ]);
  const planIncludedFeatures = new Set<string>([
    ...(context.plan?.includedFeatureIds || []),
    ...(context.includedFeatureIds || []),
  ]);

  const includedByPlan = resolvedFeature
    ? planIncludedFeatures.has(resolvedFeature.id) || planIncludedModules.has(resolvedModule.id)
    : planIncludedModules.has(resolvedModule.id);

  if (includedByPlan) {
    return {
      allowed: true,
      targetType,
      targetId,
      moduleId: resolvedModule.id,
      featureId: resolvedFeature?.id,
      effectiveStatus: inGracePeriod ? "available" : "enabled",
      implementationMaturity: maturity,
      reasonCode: inGracePeriod ? "ENTITLED_BY_GRACE_PERIOD" : "ENTITLED_BY_PLAN",
      explanation: inGracePeriod
        ? `Included in "${context.plan?.name || context.subscription?.planName || "active plan"}" (grace period active).`
        : `Included in "${context.plan?.name || context.subscription?.planName || "active plan"}".`,
      source: inGracePeriod ? "grace_period" : "plan",
      requiresUpgrade: false,
      requiresAddon: false,
      recommendedPlanIds: [],
      missingDependencies: [],
      inGracePeriod,
      isTrialing,
      isOverridden: false,
      quota: emptyQuota,
    };
  }

  // Not included -> restricted by plan
  const isOptionalAddonOnPlan = Boolean(
    context.plan?.optionalAddOnModuleIds?.includes(resolvedModule.id) ||
      (resolvedFeature && context.plan?.optionalAddOnFeatureIds?.includes(resolvedFeature.id)) ||
      resolvedModule.requiresAddonLicense
  );

  const recommendedPlanIds = recommendPlansForModule(
    resolvedModule.id,
    options.allPlans,
    context.plan?.id ?? context.subscription?.planId
  );

  return {
    allowed: false,
    targetType,
    targetId,
    moduleId: resolvedModule.id,
    featureId: resolvedFeature?.id,
    effectiveStatus: "restricted_by_plan",
    implementationMaturity: maturity,
    reasonCode: isOptionalAddonOnPlan ? "REQUIRES_ADDON" : "PLAN_RESTRICTED",
    explanation: isOptionalAddonOnPlan
      ? `${resolvedFeature ? resolvedFeature.name : resolvedModule.name} is an optional add-on or available in a higher subscription tier.`
      : `${resolvedFeature ? resolvedFeature.name : resolvedModule.name} is not included in the current subscription plan.`,
    source: "restricted",
    requiresUpgrade: recommendedPlanIds.length > 0,
    requiresAddon: isOptionalAddonOnPlan,
    recommendedPlanIds,
    missingDependencies: [],
    inGracePeriod,
    isTrialing,
    isOverridden: false,
    quota: emptyQuota,
  };
}

/**
 * Generates Plan Comparison rows directly from the Canonical Module Registry + live plan definitions.
 */
export function generatePlanComparisonRowsFromRegistry(
  modules: CanonicalModuleDefinition[],
  plans: CanonicalPlanDefinition[],
  options?: { topLevelOnly?: boolean; category?: string; schoolTypeFilter?: string }
): PlanComparisonRow[] {
  const filteredModules = modules
    .filter((m) => (options?.topLevelOnly !== false ? !m.parentId : true))
    .filter((m) => (!options?.category || options.category === "all" ? true : m.category === options.category))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return filteredModules.map((mod) => {
    const perPlan: PlanComparisonRow["perPlan"] = {};
    for (const plan of plans) {
      if (mod.availabilityStatus === "deprecated") {
        perPlan[plan.id] = { state: "deprecated", label: "Deprecated" };
        continue;
      }
      if (mod.availabilityStatus === "coming_soon") {
        perPlan[plan.id] = { state: "coming_soon", label: "Coming Soon" };
        continue;
      }
      if (
        options?.schoolTypeFilter &&
        !isSchoolTypeCompatible(options.schoolTypeFilter, mod.supportedSchoolTypes)
      ) {
        perPlan[plan.id] = { state: "unsupported_school_type", label: "School Type N/A" };
        continue;
      }
      if (plan.includedModuleIds.includes(mod.id)) {
        perPlan[plan.id] = { state: "included", label: "Included" };
      } else if (plan.optionalAddOnModuleIds?.includes(mod.id)) {
        perPlan[plan.id] = { state: "optional_addon", label: "Optional Add-on" };
      } else {
        perPlan[plan.id] = { state: "excluded", label: "Not Included" };
      }
    }

    return {
      moduleId: mod.id,
      moduleName: mod.name,
      code: mod.code,
      category: mod.category,
      macroCategory: mod.macroCategory,
      availabilityStatus: mod.availabilityStatus,
      implementationMaturity: mod.implementationMaturity,
      supportedSchoolTypes: mod.supportedSchoolTypes,
      perPlan,
    };
  });
}
