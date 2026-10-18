/**
 * Deterministic Entitlement Evaluator & Precedence Engine
 * Phase E-09.6: Evaluates module availability, plan entitlements, organization overrides,
 * dependency hierarchies, and circular dependency detection.
 */

import { PlanTier, SubscriptionPlan } from '../types/subscriptions';
import {
  TenantModuleDefinition,
  EffectiveEntitlementResult,
  OrganizationModuleOverride,
  UnsatisfiedDependencyDetail,
  OrganizationOverrideAction,
} from './types';
import { MASTER_MODULE_REGISTRY, MODULES_BY_ID } from './registry-data';

export interface EvaluateEntitlementOptions {
  moduleId: string;
  organizationId?: string;
  planId?: string;
  planTier?: PlanTier;
  plans?: SubscriptionPlan[];
  registry?: TenantModuleDefinition[];
  platformAvailabilityOverrides?: Map<string, boolean> | Record<string, boolean>;
  organizationOverrides?: OrganizationModuleOverride[];
  checkedModuleStack?: Set<string>;
}

/**
 * Resolves plan tier from plan ID or returns explicit tier.
 */
export function resolvePlanTier(
  planId?: string,
  planTier?: PlanTier,
  plans?: SubscriptionPlan[]
): PlanTier | undefined {
  if (planTier) return planTier;
  if (!planId) return undefined;

  // Direct tier naming convention e.g. 'plan_starter' -> 'starter'
  if (planId === 'plan_starter' || planId === 'starter') return 'starter';
  if (planId === 'plan_growth' || planId === 'growth') return 'growth';
  if (planId === 'plan_enterprise' || planId === 'enterprise') return 'enterprise';
  if (planId === 'plan_custom' || planId === 'custom') return 'custom';

  if (plans && plans.length > 0) {
    const found = plans.find((p) => p.id === planId);
    if (found) return found.tier;
  }

  return undefined;
}

/**
 * Detects circular dependency cycles across the entire module registry.
 * Returns an array of cycle paths, e.g. [['mod_a', 'mod_b', 'mod_a']].
 */
export function detectDependencyCycles(
  modules: TenantModuleDefinition[] = MASTER_MODULE_REGISTRY
): string[][] {
  const modMap = new Map<string, TenantModuleDefinition>(modules.map((m) => [m.id, m]));
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const currentPath: string[] = [];

  function dfs(currentId: string) {
    visited.add(currentId);
    recursionStack.add(currentId);
    currentPath.push(currentId);

    const mod = modMap.get(currentId);
    if (mod && mod.dependencies) {
      for (const dep of mod.dependencies) {
        if (!visited.has(dep.moduleId)) {
          dfs(dep.moduleId);
        } else if (recursionStack.has(dep.moduleId)) {
          const cycleStartIndex = currentPath.indexOf(dep.moduleId);
          if (cycleStartIndex !== -1) {
            const cycle = [...currentPath.slice(cycleStartIndex), dep.moduleId];
            cycles.push(cycle);
          }
        }
      }
    }

    currentPath.pop();
    recursionStack.delete(currentId);
  }

  for (const mod of modules) {
    if (!visited.has(mod.id)) {
      dfs(mod.id);
    }
  }

  return cycles;
}

/**
 * Pure, deterministic entitlement evaluator.
 * Follows the strict 7-tier precedence policy documented in Phase E-09.6.
 */
export function evaluateModuleEntitlement(
  options: EvaluateEntitlementOptions
): EffectiveEntitlementResult {
  const {
    moduleId,
    organizationId,
    planId,
    planTier: explicitTier,
    plans,
    registry = MASTER_MODULE_REGISTRY,
    platformAvailabilityOverrides,
    organizationOverrides = [],
    checkedModuleStack = new Set<string>(),
  } = options;

  const registryMap =
    registry === MASTER_MODULE_REGISTRY
      ? MODULES_BY_ID
      : new Map<string, TenantModuleDefinition>(registry.map((m) => [m.id, m]));

  const targetModule = registryMap.get(moduleId);

  // 1. UNREGISTERED_GUARD
  if (!targetModule) {
    return {
      moduleId,
      moduleName: `Unknown (${moduleId})`,
      organizationId,
      planId,
      planTier: resolvePlanTier(planId, explicitTier, plans),
      isRegistered: false,
      implementationStatus: 'unknown',
      platformAvailability: 'restricted',
      planInclusion: 'not_entitled',
      overrideAction: 'inherit',
      dependenciesSatisfied: false,
      unsatisfiedDependencies: [],
      effectiveStatus: 'unresolved',
      reason: `Module "${moduleId}" is not registered in the Master Tenant Module Registry.`,
      precedenceApplied: 'UNREGISTERED_GUARD',
    };
  }

  const effectiveTier = resolvePlanTier(planId, explicitTier, plans);

  // Check global platform availability override
  let isPlatformEnabled = targetModule.isGloballyEnabled;
  if (platformAvailabilityOverrides) {
    if (platformAvailabilityOverrides instanceof Map) {
      if (platformAvailabilityOverrides.has(targetModule.id)) {
        isPlatformEnabled = platformAvailabilityOverrides.get(targetModule.id)!;
      }
    } else if (typeof platformAvailabilityOverrides[targetModule.id] === 'boolean') {
      isPlatformEnabled = platformAvailabilityOverrides[targetModule.id];
    }
  }

  // Find organization override if organizationId is provided
  let activeOverride: OrganizationModuleOverride | undefined;
  if (organizationId && organizationOverrides.length > 0) {
    activeOverride = organizationOverrides.find(
      (o) => o.organizationId === organizationId && o.moduleId === targetModule.id
    );
  }

  const overrideAction: OrganizationOverrideAction = activeOverride?.action || 'inherit';
  const overrideReason = activeOverride?.reason;

  // Determine baseline plan inclusion
  let planInclusion: 'included' | 'excluded' | 'add_on' | 'not_entitled' = 'excluded';
  if (!effectiveTier) {
    planInclusion = 'not_entitled';
  } else if (targetModule.includedInPlans.includes(effectiveTier)) {
    planInclusion = 'included';
  } else if (targetModule.requiresAddonLicense) {
    planInclusion = 'add_on';
  }

  // 2. PLATFORM_DISABLEMENT
  if (!isPlatformEnabled) {
    return {
      moduleId: targetModule.id,
      moduleName: targetModule.name,
      organizationId,
      planId,
      planTier: effectiveTier,
      isRegistered: true,
      implementationStatus: targetModule.status,
      platformAvailability: 'disabled',
      planInclusion,
      overrideAction,
      overrideReason,
      dependenciesSatisfied: true,
      unsatisfiedDependencies: [],
      effectiveStatus: 'unavailable',
      reason: `Module "${targetModule.name}" is disabled platform-wide by Super-Admin governance.`,
      precedenceApplied: 'PLATFORM_DISABLEMENT',
    };
  }

  // 3. IMPLEMENTATION_GUARD
  if (targetModule.status !== 'implemented' && targetModule.status !== 'partial') {
    return {
      moduleId: targetModule.id,
      moduleName: targetModule.name,
      organizationId,
      planId,
      planTier: effectiveTier,
      isRegistered: true,
      implementationStatus: targetModule.status,
      platformAvailability: 'enabled',
      planInclusion,
      overrideAction,
      overrideReason,
      dependenciesSatisfied: true,
      unsatisfiedDependencies: [],
      effectiveStatus: 'unavailable',
      reason: `Module "${targetModule.name}" is unavailable because implementation readiness is "${targetModule.status}".`,
      precedenceApplied: 'IMPLEMENTATION_GUARD',
    };
  }

  // 4. ORGANIZATION_FORCE_DISABLE
  if (overrideAction === 'force_disable') {
    return {
      moduleId: targetModule.id,
      moduleName: targetModule.name,
      organizationId,
      planId,
      planTier: effectiveTier,
      isRegistered: true,
      implementationStatus: targetModule.status,
      platformAvailability: 'enabled',
      planInclusion,
      overrideAction,
      overrideReason,
      dependenciesSatisfied: true,
      unsatisfiedDependencies: [],
      effectiveStatus: 'unavailable',
      reason: `Module "${targetModule.name}" is explicitly disabled by organization override: ${overrideReason || 'Administrative disablement'}.`,
      precedenceApplied: 'ORGANIZATION_FORCE_DISABLE',
    };
  }

  // 5. DEPENDENCY EVALUATION (Checked for both force_enable and plan_included paths)
  const unsatisfiedDependencies: UnsatisfiedDependencyDetail[] = [];
  const nextCheckedStack = new Set(checkedModuleStack);
  nextCheckedStack.add(targetModule.id);

  for (const dep of targetModule.dependencies) {
    // Check circular dependency
    if (checkedModuleStack.has(dep.moduleId)) {
      unsatisfiedDependencies.push({
        moduleId: dep.moduleId,
        moduleName: dep.moduleId,
        type: dep.type,
        reason: `Circular dependency detected involving "${dep.moduleId}".`,
      });
      continue;
    }

    const depMod = registryMap.get(dep.moduleId);
    if (!depMod) {
      if (dep.type === 'required') {
        unsatisfiedDependencies.push({
          moduleId: dep.moduleId,
          moduleName: dep.moduleId,
          type: 'required',
          reason: `Required dependency module "${dep.moduleId}" is not registered in the Master Registry.`,
        });
      }
      continue;
    }

    // Check if the dependency itself is available
    const depResult = evaluateModuleEntitlement({
      moduleId: dep.moduleId,
      organizationId,
      planId,
      planTier: effectiveTier,
      plans,
      registry,
      platformAvailabilityOverrides,
      organizationOverrides,
      checkedModuleStack: nextCheckedStack,
    });

    if (dep.type === 'required' && depResult.effectiveStatus !== 'available') {
      unsatisfiedDependencies.push({
        moduleId: depMod.id,
        moduleName: depMod.name,
        type: 'required',
        reason: `Required dependency "${depMod.name}" is currently ${depResult.effectiveStatus}: ${depResult.reason}`,
      });
    }
  }

  const dependenciesSatisfied = unsatisfiedDependencies.length === 0;

  // 6. ORGANIZATION_FORCE_ENABLE
  if (overrideAction === 'force_enable') {
    if (!dependenciesSatisfied) {
      const depNames = unsatisfiedDependencies.map((d) => `"${d.moduleName}"`).join(', ');
      return {
        moduleId: targetModule.id,
        moduleName: targetModule.name,
        organizationId,
        planId,
        planTier: effectiveTier,
        isRegistered: true,
        implementationStatus: targetModule.status,
        platformAvailability: 'enabled',
        planInclusion,
        overrideAction,
        overrideReason,
        dependenciesSatisfied: false,
        unsatisfiedDependencies,
        effectiveStatus: 'restricted',
        reason: `Module "${targetModule.name}" has administrative override to enable, but required dependencies are unsatisfied (${depNames}).`,
        precedenceApplied: 'DEPENDENCY_FAILURE',
      };
    }

    return {
      moduleId: targetModule.id,
      moduleName: targetModule.name,
      organizationId,
      planId,
      planTier: effectiveTier,
      isRegistered: true,
      implementationStatus: targetModule.status,
      platformAvailability: 'enabled',
      planInclusion,
      overrideAction,
      overrideReason,
      dependenciesSatisfied: true,
      unsatisfiedDependencies: [],
      effectiveStatus: 'available',
      reason: `Module "${targetModule.name}" is explicitly enabled by organization override: ${overrideReason || 'Administrative grant'}.`,
      precedenceApplied: 'ORGANIZATION_FORCE_ENABLE',
    };
  }

  // 7. PLAN ENTITLEMENT DEFAULTS (Inherit / default)
  if (!effectiveTier) {
    return {
      moduleId: targetModule.id,
      moduleName: targetModule.name,
      organizationId,
      planId,
      planTier: undefined,
      isRegistered: true,
      implementationStatus: targetModule.status,
      platformAvailability: 'enabled',
      planInclusion: 'not_entitled',
      overrideAction,
      dependenciesSatisfied,
      unsatisfiedDependencies,
      effectiveStatus: 'unresolved',
      reason: `Cannot resolve entitlement for "${targetModule.name}" because school subscription plan is unspecified or unknown.`,
      precedenceApplied: 'DEFAULT_INHERITED',
    };
  }

  if (planInclusion === 'included') {
    if (!dependenciesSatisfied) {
      const depNames = unsatisfiedDependencies.map((d) => `"${d.moduleName}"`).join(', ');
      return {
        moduleId: targetModule.id,
        moduleName: targetModule.name,
        organizationId,
        planId,
        planTier: effectiveTier,
        isRegistered: true,
        implementationStatus: targetModule.status,
        platformAvailability: 'enabled',
        planInclusion: 'included',
        overrideAction,
        dependenciesSatisfied: false,
        unsatisfiedDependencies,
        effectiveStatus: 'restricted',
        reason: `Module "${targetModule.name}" is included in the ${effectiveTier} plan, but required dependencies are unsatisfied (${depNames}).`,
        precedenceApplied: 'DEPENDENCY_FAILURE',
      };
    }

    return {
      moduleId: targetModule.id,
      moduleName: targetModule.name,
      organizationId,
      planId,
      planTier: effectiveTier,
      isRegistered: true,
      implementationStatus: targetModule.status,
      platformAvailability: 'enabled',
      planInclusion: 'included',
      overrideAction,
      dependenciesSatisfied: true,
      unsatisfiedDependencies: [],
      effectiveStatus: 'available',
      reason: `Module "${targetModule.name}" is included in the ${effectiveTier} subscription plan default entitlements.`,
      precedenceApplied: 'PLAN_INCLUDED',
    };
  }

  // Plan Excluded
  return {
    moduleId: targetModule.id,
    moduleName: targetModule.name,
    organizationId,
    planId,
    planTier: effectiveTier,
    isRegistered: true,
    implementationStatus: targetModule.status,
    platformAvailability: 'enabled',
    planInclusion,
    overrideAction,
    dependenciesSatisfied,
    unsatisfiedDependencies,
    effectiveStatus: 'unavailable',
    reason: `Module "${targetModule.name}" is not included in the ${effectiveTier} plan. Requires upgrade or administrative override.`,
    precedenceApplied: 'PLAN_EXCLUDED',
  };
}

/**
 * Bulk evaluates all modules in the registry for a specific organization and plan.
 */
export function evaluateAllModules(options: {
  organizationId?: string;
  planId?: string;
  planTier?: PlanTier;
  plans?: SubscriptionPlan[];
  registry?: TenantModuleDefinition[];
  platformAvailabilityOverrides?: Map<string, boolean> | Record<string, boolean>;
  organizationOverrides?: OrganizationModuleOverride[];
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
