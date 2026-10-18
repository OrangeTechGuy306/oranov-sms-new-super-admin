/**
 * Master Tenant Module Registry Integrity Validator
 * Phase E-09.6: Reusable validation engine to detect inconsistent module definitions,
 * unresolved parent/dependency references, circular cycles, and route mapping conflicts.
 */

import {
  TenantModuleDefinition,
  RegistryValidationReport,
  RegistryValidationIssue,
  OrganizationModuleOverride,
} from './types';
import { MASTER_MODULE_REGISTRY } from './registry-data';
import { detectDependencyCycles } from './evaluator';

export interface ValidateRegistryOptions {
  modules?: TenantModuleDefinition[];
  organizationOverrides?: OrganizationModuleOverride[];
  knownOrganizationIds?: string[];
}

/**
 * Validates the entire module registry and optional organization overrides.
 * Returns a comprehensive, actionable RegistryValidationReport.
 */
export function validateModuleRegistry(
  options: ValidateRegistryOptions = {}
): RegistryValidationReport {
  const modules = options.modules || MASTER_MODULE_REGISTRY;
  const issues: RegistryValidationIssue[] = [];

  const idMap = new Map<string, TenantModuleDefinition>();
  const codeMap = new Map<string, string>();
  const routeOwnerMap = new Map<string, string>();

  // 1. Module Identity & Uniqueness Checks
  for (const mod of modules) {
    if (!mod.id || typeof mod.id !== 'string') {
      issues.push({
        id: `missing-id-${Math.random()}`,
        severity: 'error',
        category: 'identity',
        message: 'Module definition is missing a valid string identifier.',
      });
      continue;
    }

    if (idMap.has(mod.id)) {
      issues.push({
        id: `duplicate-id-${mod.id}`,
        severity: 'error',
        category: 'identity',
        moduleId: mod.id,
        message: `Duplicate module ID "${mod.id}" detected in registry. Module IDs must be unique.`,
      });
    } else {
      idMap.set(mod.id, mod);
    }

    // Code uniqueness
    if (mod.code) {
      if (codeMap.has(mod.code)) {
        issues.push({
          id: `duplicate-code-${mod.code}`,
          severity: 'error',
          category: 'identity',
          moduleId: mod.id,
          message: `Duplicate module code "${mod.code}" used by both "${codeMap.get(mod.code)}" and "${mod.id}".`,
        });
      } else {
        codeMap.set(mod.code, mod.id);
      }
    } else {
      issues.push({
        id: `missing-code-${mod.id}`,
        severity: 'error',
        category: 'identity',
        moduleId: mod.id,
        message: `Module "${mod.id}" is missing a mandatory machine-readable code.`,
      });
    }

    // Mandatory metadata fields
    if (!mod.name || !mod.name.trim()) {
      issues.push({
        id: `missing-name-${mod.id}`,
        severity: 'error',
        category: 'identity',
        moduleId: mod.id,
        message: `Module "${mod.id}" is missing a human-readable name.`,
      });
    }

    if (!mod.description || !mod.description.trim()) {
      issues.push({
        id: `missing-desc-${mod.id}`,
        severity: 'warning',
        category: 'identity',
        moduleId: mod.id,
        message: `Module "${mod.id}" is missing a descriptive summary.`,
      });
    }

    if (!mod.href || !mod.href.startsWith('/')) {
      issues.push({
        id: `invalid-href-${mod.id}`,
        severity: 'error',
        category: 'route',
        moduleId: mod.id,
        message: `Module "${mod.id}" href "${mod.href}" must be an absolute path starting with "/".`,
      });
    }

    if (!mod.includedInPlans || mod.includedInPlans.length === 0) {
      issues.push({
        id: `empty-plans-${mod.id}`,
        severity: 'warning',
        category: 'plan',
        moduleId: mod.id,
        message: `Module "${mod.id}" has no assigned subscription plans.`,
      });
    }

    // Source evidence checks
    if (!mod.sourceEvidence || !mod.sourceEvidence.routePath) {
      issues.push({
        id: `missing-evidence-${mod.id}`,
        severity: 'warning',
        category: 'evidence',
        moduleId: mod.id,
        message: `Module "${mod.id}" lacks traceable sourceEvidence routePath.`,
      });
    }
  }

  // 2. Parent-Child Relationship Checks
  for (const mod of modules) {
    if (mod.parentId) {
      if (mod.parentId === mod.id) {
        issues.push({
          id: `self-parent-${mod.id}`,
          severity: 'error',
          category: 'parent',
          moduleId: mod.id,
          message: `Module "${mod.id}" cannot be its own parent.`,
        });
      } else if (!idMap.has(mod.parentId)) {
        issues.push({
          id: `unresolved-parent-${mod.id}`,
          severity: 'error',
          category: 'parent',
          moduleId: mod.id,
          message: `Submodule "${mod.id}" references non-existent parent module "${mod.parentId}".`,
        });
      }
    }
  }

  // 3. Dependency Integrity Checks
  for (const mod of modules) {
    if (mod.dependencies && Array.isArray(mod.dependencies)) {
      for (const dep of mod.dependencies) {
        if (!dep.moduleId) {
          issues.push({
            id: `empty-dep-id-${mod.id}`,
            severity: 'error',
            category: 'dependency',
            moduleId: mod.id,
            message: `Module "${mod.id}" has a dependency entry with missing moduleId.`,
          });
        } else if (!idMap.has(dep.moduleId)) {
          issues.push({
            id: `unresolved-dep-${mod.id}-${dep.moduleId}`,
            severity: 'error',
            category: 'dependency',
            moduleId: mod.id,
            message: `Module "${mod.id}" references unresolvable dependency "${dep.moduleId}".`,
          });
        }
      }
    }
  }

  // 4. Circular Dependency Cycle Detection
  const cycles = detectDependencyCycles(modules);
  for (const cycle of cycles) {
    issues.push({
      id: `cycle-${cycle.join('->')}`,
      severity: 'error',
      category: 'cycle',
      message: `Circular dependency detected: ${cycle.join(' -> ')}`,
      details: { cycle },
    });
  }

  // 5. Route Mapping Conflict Checks
  let totalMappedRoutes = 0;
  for (const mod of modules) {
    if (mod.routes && Array.isArray(mod.routes)) {
      totalMappedRoutes += mod.routes.length;
      for (const r of mod.routes) {
        if (!r.startsWith('/')) {
          issues.push({
            id: `invalid-route-${mod.id}-${r}`,
            severity: 'error',
            category: 'route',
            moduleId: mod.id,
            message: `Mapped route "${r}" on module "${mod.id}" does not start with "/".`,
          });
        }
        // Check for conflicting assignment to unrelated modules
        const existingOwner = routeOwnerMap.get(r);
        if (existingOwner && existingOwner !== mod.id) {
          // Allow parent and child to share primary href, but flag unrelated modules
          const existingMod = idMap.get(existingOwner);
          const isParentChild =
            mod.parentId === existingOwner || existingMod?.parentId === mod.id;

          if (!isParentChild) {
            issues.push({
              id: `duplicate-route-${r}`,
              severity: 'warning',
              category: 'route',
              moduleId: mod.id,
              message: `Route "${r}" is mapped to both "${existingOwner}" and "${mod.id}".`,
            });
          }
        } else {
          routeOwnerMap.set(r, mod.id);
        }
      }
    }
  }

  // 6. Organization Overrides Integrity (if provided)
  if (options.organizationOverrides) {
    const knownOrgs = new Set(options.knownOrganizationIds || []);
    for (const ov of options.organizationOverrides) {
      if (!idMap.has(ov.moduleId)) {
        issues.push({
          id: `override-unregistered-mod-${ov.organizationId}-${ov.moduleId}`,
          severity: 'error',
          category: 'override',
          moduleId: ov.moduleId,
          message: `Organization override references unregistered module ID "${ov.moduleId}".`,
        });
      }
      if (knownOrgs.size > 0 && !knownOrgs.has(ov.organizationId)) {
        issues.push({
          id: `override-unknown-org-${ov.organizationId}-${ov.moduleId}`,
          severity: 'error',
          category: 'override',
          message: `Organization override references unknown organization ID "${ov.organizationId}".`,
        });
      }
      if (!ov.action || !['inherit', 'force_enable', 'force_disable'].includes(ov.action)) {
        issues.push({
          id: `override-invalid-action-${ov.organizationId}-${ov.moduleId}`,
          severity: 'error',
          category: 'override',
          message: `Organization override has invalid action "${ov.action}".`,
        });
      }
    }
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  const topLevelCount = modules.filter((m) => !m.parentId).length;
  const submoduleCount = modules.filter((m) => !!m.parentId).length;

  return {
    isValid: errorCount === 0,
    timestamp: new Date().toISOString(),
    totalModulesCount: modules.length,
    topLevelModulesCount: topLevelCount,
    submodulesCount: submoduleCount,
    mappedRoutesCount: totalMappedRoutes,
    errorCount,
    warningCount,
    infoCount,
    issues,
  };
}
