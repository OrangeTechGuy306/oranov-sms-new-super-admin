/**
 * Master Tenant Module Registry & Feature Entitlements
 * Phase E-09.6: Centralized entry point for registry definitions, evaluators, and validators.
 */

import { MASTER_MODULE_REGISTRY } from './registry-data';
import { TenantModuleDefinition } from './types';
import { evaluateModuleEntitlement, evaluateAllModules } from './evaluator';

export * from './types';
export * from './canonical-contract';
export * from './canonical-entitlements';
export * from './registry-data';
export * from './evaluator';
export * from './validator';
export * from './initial-overrides';

// Aliases for convenient consumption across test suites and UI components
export { MASTER_MODULE_REGISTRY as TENANT_MODULE_REGISTRY };
export { evaluateModuleEntitlement as calculateEffectiveEntitlement };
export { evaluateAllModules as evaluateAllModuleEntitlements };

/**
 * Filter top-level modules (no parentId)
 */
export function getTopLevelModules(
  modules: TenantModuleDefinition[] = MASTER_MODULE_REGISTRY
): TenantModuleDefinition[] {
  return modules.filter((m) => !m.parentId);
}

/**
 * Filter submodules belonging to a parent module
 */
export function getSubmodulesByParentId(
  modules: TenantModuleDefinition[] = MASTER_MODULE_REGISTRY,
  parentId: string
): TenantModuleDefinition[] {
  return modules.filter((m) => m.parentId === parentId);
}

/**
 * Compute comprehensive metrics across a module registry collection
 */
export function getModuleMetrics(
  modules: TenantModuleDefinition[] = MASTER_MODULE_REGISTRY
) {
  const topModules = modules.filter((m) => !m.parentId);
  const submodules = modules.filter((m) => !!m.parentId);
  let totalMappedRoutes = 0;
  const byCategory: Record<string, number> = {};

  for (const m of modules) {
    totalMappedRoutes += m.routes.length;
    byCategory[m.category] = (byCategory[m.category] || 0) + 1;
  }

  const comingSoonCount = modules.filter((m) => m.availabilityStatus === 'coming_soon').length;
  const deprecatedCount = modules.filter(
    (m) => m.availabilityStatus === 'deprecated' || m.status === 'deprecated'
  ).length;
  const unavailableCount = modules.filter((m) => m.availabilityStatus === 'unavailable').length;
  const unassignedToPlanCount = modules.filter(
    (m) => m.availabilityStatus !== 'deprecated' && (!m.includedInPlans || m.includedInPlans.length === 0)
  ).length;
  const partialCount = modules.filter(
    (m) => m.implementationMaturity === 'partial' || m.status === 'partial'
  ).length;
  const plannedCount = modules.filter(
    (m) => m.implementationMaturity === 'planned' || m.status === 'planned'
  ).length;
  const implementedCount = modules.filter(
    (m) => (m.implementationMaturity || m.status) === 'implemented'
  ).length;

  return {
    totalModules: modules.length,
    topLevelModules: topModules.length,
    submodules: submodules.length,
    totalMappedRoutes,
    byCategory,
    implementedCount,
    partialCount,
    plannedCount,
    deprecatedCount,
    comingSoonCount,
    unavailableCount,
    unassignedToPlanCount,
    platformEnabledCount: modules.filter((m) => m.isGloballyEnabled).length,
    globallyDisabledCount: modules.filter((m) => !m.isGloballyEnabled).length,
    byImplementationStatus: {
      implemented: modules.filter((m) => m.status === 'implemented').length,
      partial: modules.filter((m) => m.status === 'partial').length,
      planned: modules.filter((m) => m.status === 'planned').length,
      deprecated: deprecatedCount,
      missing: modules.filter((m) => m.status === 'missing').length,
      unknown: modules.filter((m) => m.status === 'unknown').length,
    },
    byPlatformAvailability: {
      generally_available: modules.filter((m) => m.isGloballyEnabled).length,
      disabled: modules.filter((m) => !m.isGloballyEnabled).length,
      coming_soon: comingSoonCount,
      deprecated: deprecatedCount,
      unavailable: unavailableCount,
    },
    byPlanTier: {
      starter: modules.filter((m) => m.includedInPlans.includes('starter')).length,
      growth: modules.filter((m) => m.includedInPlans.includes('growth')).length,
      enterprise: modules.filter((m) => m.includedInPlans.includes('enterprise')).length,
      custom: modules.filter((m) => m.includedInPlans.includes('custom')).length,
    },
  };
}
