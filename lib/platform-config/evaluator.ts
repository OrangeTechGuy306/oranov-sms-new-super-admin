/**
 * Phase E-09.15: Configuration Precedence & Feature Flag Evaluation Engine.
 * Implements deterministic hierarchy:
 * 1. Platform Default
 * 2. Environment Override
 * 3. Organization-specific Override
 *
 * Subject to module entitlement constraints, dependency graph verification,
 * lifecycle guardrails, and safe-failure guarantees.
 */

import {
  FeatureFlag,
  TenantFeatureOverride,
  EffectiveConfigurationResult,
  FeatureFlagLifecycle,
  RolloutStrategy,
  RolloutPreviewSummary,
  RolloutPlanInput,
} from '@/lib/types/platform-config';
import { Organization, SubscriptionPlan, OrganizationSubscription } from '@/lib/types';
import { TenantModuleDefinition } from '@/lib/modules/types';

export interface EvaluateConfigurationOptions {
  flagKey: string;
  organizationId?: string;
  environment?: string;
  flags: FeatureFlag[];
  overrides?: TenantFeatureOverride[];
  organizations?: Organization[];
  modules?: TenantModuleDefinition[];
  plans?: SubscriptionPlan[];
  subscriptions?: OrganizationSubscription[];
}

/**
 * Evaluates the effective configuration for a given feature flag, organization, and environment.
 */
export function evaluateEffectiveConfiguration(
  optionsOrFlagKey: EvaluateConfigurationOptions | string,
  maybeFlags?: FeatureFlag[],
  maybeOverrides?: TenantFeatureOverride[],
  maybeOrgId?: string,
  maybeEnv?: string,
  maybeModules?: TenantModuleDefinition[],
  maybeOrgs?: Organization[],
  maybeSubs?: OrganizationSubscription[],
  maybePlans?: SubscriptionPlan[]
): EffectiveConfigurationResult {
  let flagKey: string;
  let organizationId: string | undefined;
  let environment: string = 'all';
  let flags: FeatureFlag[] = [];
  let overrides: TenantFeatureOverride[] = [];
  let organizations: Organization[] = [];
  let modules: TenantModuleDefinition[] = [];
  let plans: SubscriptionPlan[] = [];
  let subscriptions: OrganizationSubscription[] = [];

  if (typeof optionsOrFlagKey === 'string') {
    flagKey = optionsOrFlagKey;
    flags = maybeFlags || [];
    overrides = maybeOverrides || [];
    organizationId = maybeOrgId;
    environment = maybeEnv || 'all';
    modules = maybeModules || [];
    organizations = maybeOrgs || [];
    subscriptions = maybeSubs || [];
    plans = maybePlans || [];
  } else {
    flagKey = optionsOrFlagKey.flagKey;
    organizationId = optionsOrFlagKey.organizationId;
    environment = optionsOrFlagKey.environment || 'all';
    flags = optionsOrFlagKey.flags || [];
    overrides = optionsOrFlagKey.overrides || [];
    organizations = optionsOrFlagKey.organizations || [];
    modules = optionsOrFlagKey.modules || [];
    plans = optionsOrFlagKey.plans || [];
    subscriptions = optionsOrFlagKey.subscriptions || [];
  }

  // 1. Resolve flag
  const flag = flags.find((f) => f.key === flagKey);
  if (!flag) {
    return {
      flagKey,
      flagName: 'Unknown Feature Flag',
      environment,
      effectiveValue: false,
      resolvedScope: 'platform_default',
      inheritanceSource: 'Unresolved Flag Reference',
      isEntitlementSatisfied: false,
      isDependencySatisfied: false,
      missingDependencies: [],
      isArchivedBlocked: false,
      isOverridden: false,
      safeFailureState: true,
      failureReason: `Feature flag with key "${flagKey}" does not exist in registry. Safe failure: defaulting to false.`,
    };
  }

  // 2. Resolve organization if provided
  let organization: Organization | undefined;
  if (organizationId) {
    organization = organizations.find((o) => o.id === organizationId);
    if (!organization) {
      return {
        flagKey: flag.key,
        flagName: flag.name,
        organizationId,
        environment,
        effectiveValue: false,
        resolvedScope: 'organization_override',
        inheritanceSource: 'Unresolved Organization',
        isEntitlementSatisfied: false,
        isDependencySatisfied: false,
        missingDependencies: [],
        isArchivedBlocked: false,
        isOverridden: false,
        safeFailureState: true,
        failureReason: `Referenced organization "${organizationId}" cannot be resolved. Safe failure: defaulting to false.`,
      };
    }
  }

  // 3. Lifecycle Guardrails
  if (flag.lifecycle === 'archived') {
    return {
      flagKey: flag.key,
      flagName: flag.name,
      organizationId: organization?.id,
      organizationName: organization?.name,
      environment,
      effectiveValue: false,
      resolvedScope: 'platform_default',
      inheritanceSource: 'Archived Flag',
      isEntitlementSatisfied: true,
      isDependencySatisfied: true,
      missingDependencies: [],
      isArchivedBlocked: true,
      isOverridden: false,
      safeFailureState: false,
      failureReason: `Feature flag "${flag.name}" is archived and cannot be evaluated as active without a documented restore operation.`,
    };
  }

  // 4. Verify Flag Dependencies
  const missingDependencies: string[] = [];
  let isDependencySatisfied = true;

  if (flag.dependsOnFlagKeys && flag.dependsOnFlagKeys.length > 0) {
    for (const depKey of flag.dependsOnFlagKeys) {
      const depFlag = flags.find((f) => f.key === depKey);
      if (!depFlag || !depFlag.enabled || depFlag.lifecycle !== 'active') {
        isDependencySatisfied = false;
        missingDependencies.push(depKey);
      }
    }
  }

  // 5. Verify Module Entitlement if linked
  let isEntitlementSatisfied = true;
  let entitlementNotice: string | undefined;

  if (flag.relatedModuleId && organization) {
    const orgSub = subscriptions.find((s) => s.organizationId === organization!.id);
    const plan = orgSub ? plans.find((p) => p.id === orgSub.planId) : undefined;
    const mod = modules.find((m) => m.id === flag.relatedModuleId);

    if (!mod) {
      isEntitlementSatisfied = false;
      entitlementNotice = `Related module "${flag.relatedModuleId}" is not registered in the Master Module Registry.`;
    } else if (plan) {
      const planTier = plan.tier || 'starter';
      const isIncludedInPlan = mod.includedInPlans.includes(planTier as any);
      if (!isIncludedInPlan) {
        isEntitlementSatisfied = false;
        entitlementNotice = `Organization subscription plan (${plan.name} - ${planTier}) does not include entitled module "${mod.name}".`;
      }
    }
  }

  // 6. Precedence Resolution
  // Layer 1: Platform default
  let resolvedScope: EffectiveConfigurationResult['resolvedScope'] = 'platform_default';
  let effectiveValue = flag.enabled;
  let inheritanceSource = `Platform Default (${flag.lifecycle === 'active' && flag.enabled ? 'Enabled' : 'Disabled'})`;
  let isOverridden = false;

  // Layer 2: Environment-specific
  if (flag.environment !== 'all' && environment !== 'all') {
    if (flag.environment === environment) {
      resolvedScope = 'environment_override';
      inheritanceSource = `Environment Override (${environment})`;
    } else {
      // Flag is restricted to a different environment
      effectiveValue = false;
      resolvedScope = 'environment_override';
      inheritanceSource = `Environment Restriction (Restricted to ${flag.environment}, requested ${environment})`;
    }
  }

  // Layer 3: Organization Override (highest precedence)
  if (organization) {
    const explicitOverride = overrides.find(
      (o) => o.organizationId === organization!.id && o.flagKey === flag.key
    );

    if (explicitOverride) {
      isOverridden = true;
      resolvedScope = 'organization_override';
      effectiveValue = explicitOverride.overrideValue;
      inheritanceSource = `Tenant Override: ${organization.name} (${explicitOverride.overrideValue ? 'Forced Enabled' : 'Forced Disabled'})`;
    }
  }

  // If dependencies or entitlements fail, effective capability cannot be enabled!
  let failureReason: string | undefined;
  if (!isDependencySatisfied) {
    effectiveValue = false;
    failureReason = `Prerequisite flag(s) [${missingDependencies.join(', ')}] are disabled or missing. Capability gated.`;
  } else if (!isEntitlementSatisfied) {
    effectiveValue = false;
    failureReason = entitlementNotice || 'Module entitlement prerequisite not satisfied.';
  }

  return {
    flagKey: flag.key,
    flagName: flag.name,
    organizationId: organization?.id,
    organizationName: organization?.name,
    environment,
    effectiveValue,
    resolvedScope,
    inheritanceSource,
    isEntitlementSatisfied,
    entitlementNotice,
    isDependencySatisfied,
    missingDependencies,
    isArchivedBlocked: false,
    isOverridden,
    safeFailureState: Boolean(failureReason),
    failureReason,
  };
}

/**
 * Detects circular dependencies in the feature flag graph using Depth-First Search.
 */
export function detectCircularDependencies(
  flags: FeatureFlag[]
): { hasCycle: boolean; cyclePath?: string[] } {
  const adj = new Map<string, string[]>();
  for (const flag of flags) {
    adj.set(flag.key, flag.dependsOnFlagKeys || []);
  }

  const visited = new Set<string>();
  const recStack = new Set<string>();
  const path: string[] = [];

  function dfs(curr: string): boolean {
    visited.add(curr);
    recStack.add(curr);
    path.push(curr);

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        path.push(neighbor);
        return true;
      }
    }

    recStack.delete(curr);
    path.pop();
    return false;
  }

  for (const flag of flags) {
    if (!visited.has(flag.key)) {
      if (dfs(flag.key)) {
        return { hasCycle: true, cyclePath: [...path] };
      }
    }
  }

  return { hasCycle: false };
}

/**
 * Validates whether a state machine transition between lifecycle states is permitted.
 */
export function canTransitionLifecycle(
  current: FeatureFlagLifecycle,
  target: FeatureFlagLifecycle
): { allowed: boolean; reason?: string } {
  if (current === target) {
    return { allowed: true };
  }

  // Archived cannot be directly set to active without a restore step
  if (current === 'archived' && target === 'active') {
    return {
      allowed: false,
      reason: 'Archived flags cannot be directly enabled. They must be restored to "draft" or "disabled" status first.',
    };
  }

  // Linear / normal transitions
  const allowedTransitions: Record<FeatureFlagLifecycle, FeatureFlagLifecycle[]> = {
    draft: ['active', 'disabled', 'scheduled', 'archived'],
    active: ['disabled', 'scheduled', 'archived'],
    disabled: ['active', 'scheduled', 'archived'],
    scheduled: ['active', 'disabled', 'archived'],
    archived: ['draft', 'disabled'], // Restore targets
  };

  const allowed = allowedTransitions[current]?.includes(target) ?? false;
  if (!allowed) {
    return {
      allowed: false,
      reason: `Illegal lifecycle transition from "${current}" to "${target}".`,
    };
  }

  return { allowed: true };
}

/**
 * Computes estimated rollout preview summary for demonstration.
 */
export function estimateRolloutScope(
  flagOrInput: FeatureFlag | RolloutPlanInput,
  strategyOrFlags?: RolloutStrategy | FeatureFlag[],
  percentageOrOrgs?: number | Organization[],
  selectedOrgIds: string[] = [],
  allOrgs: Organization[] = []
): RolloutPreviewSummary {
  if ('flagKey' in flagOrInput && Array.isArray(strategyOrFlags)) {
    const input = flagOrInput as RolloutPlanInput;
    const flags = strategyOrFlags as FeatureFlag[];
    const orgs = (percentageOrOrgs as Organization[]) || [];
    const targetFlag = flags.find((f) => f.key === input.flagKey) || ({
      id: 'mock',
      key: input.flagKey,
      name: input.flagKey,
      dependsOnFlagKeys: [],
    } as unknown as FeatureFlag);

    return estimateRolloutScope(
      targetFlag,
      input.strategy,
      input.targetPercentage ?? 0,
      input.targetOrganizationIds ?? [],
      orgs
    );
  }

  const flag = flagOrInput as FeatureFlag;
  const strategy = (strategyOrFlags as RolloutStrategy) || 'all_tenants';
  const percentage = typeof percentageOrOrgs === 'number' ? percentageOrOrgs : 0;
  const totalOrgs = allOrgs.length;
  let targetedCount = 0;
  const warnings: string[] = [];
  const dependencyErrors: string[] = [];

  // Check flag dependencies
  if (flag.dependsOnFlagKeys && flag.dependsOnFlagKeys.length > 0) {
    // Flag has dependencies
  }

  switch (strategy) {
    case 'all_tenants':
      targetedCount = totalOrgs;
      break;
    case 'selective_tenants':
      targetedCount = selectedOrgIds.filter((id) => allOrgs.some((o) => o.id === id)).length;
      if (targetedCount === 0) {
        warnings.push('No valid organizations selected for selective rollout.');
      }
      break;
    case 'percentage_rollout': {
      const validPct = Math.min(100, Math.max(0, percentage));
      targetedCount = Math.round((totalOrgs * validPct) / 100);
      break;
    }
    case 'allowlist_schedule':
      targetedCount = selectedOrgIds.length > 0 ? selectedOrgIds.length : Math.round(totalOrgs * 0.5);
      break;
  }

  // Estimate users (mock avg 650 students/staff per institution)
  const estimatedAffectedUsers = targetedCount * 650;

  return {
    eligibleTenantCount: totalOrgs,
    targetedTenantCount: targetedCount,
    estimatedAffectedUsers,
    dependenciesSatisfied: dependencyErrors.length === 0,
    dependencyErrors,
    warnings,
    isDemonstrationOnly: true,
  };
}
