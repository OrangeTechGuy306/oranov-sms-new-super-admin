import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  MASTER_MODULE_REGISTRY,
  validateModuleRegistry,
  detectDependencyCycles,
  getTopLevelModules,
  getSubmodulesByParentId,
  getModuleMetrics,
} from '../lib/modules';

describe('Master Tenant Module Registry Integrity', () => {
  it('contains the verified 321 tenant navigation entities (56 top-level, 265 submodules)', () => {
    assert.strictEqual(MASTER_MODULE_REGISTRY.length, 321);

    const topLevel = getTopLevelModules(MASTER_MODULE_REGISTRY);
    assert.strictEqual(topLevel.length, 56);

    const submodules = MASTER_MODULE_REGISTRY.filter((m) => m.parentId !== undefined);
    assert.strictEqual(submodules.length, 265);
    assert.strictEqual(topLevel.length + submodules.length, 321);
  });

  it('guarantees unique machine-readable IDs across all 321 modules', () => {
    const idSet = new Set<string>();
    for (const mod of MASTER_MODULE_REGISTRY) {
      assert.ok(mod.id && mod.id.length > 0, `Module must have non-empty id`);
      assert.strictEqual(
        idSet.has(mod.id),
        false,
        `Duplicate module ID discovered: "${mod.id}"`
      );
      idSet.add(mod.id);
    }
    assert.strictEqual(idSet.size, 321);
  });

  it('guarantees unique machine-readable module codes across all 321 modules', () => {
    const codeSet = new Set<string>();
    for (const mod of MASTER_MODULE_REGISTRY) {
      assert.ok(mod.code && mod.code.length > 0, `Module must have non-empty code`);
      assert.strictEqual(
        codeSet.has(mod.code),
        false,
        `Duplicate module code discovered: "${mod.code}"`
      );
      codeSet.add(mod.code);
    }
    assert.strictEqual(codeSet.size, 321);
  });

  it('ensures all submodules reference valid parent top-level module IDs', () => {
    const topLevelIds = new Set(getTopLevelModules(MASTER_MODULE_REGISTRY).map((m) => m.id));

    for (const mod of MASTER_MODULE_REGISTRY) {
      if (mod.parentId) {
        assert.ok(
          topLevelIds.has(mod.parentId),
          `Submodule "${mod.id}" references nonexistent parent ID: "${mod.parentId}"`
        );
      }
    }
  });

  it('correctly resolves submodules for major top-level modules', () => {
    const studentSubmodules = getSubmodulesByParentId(MASTER_MODULE_REGISTRY, 'mod_students');
    assert.ok(studentSubmodules.length >= 4, 'Students module should have 4 submodules');

    const financeSubmodules = getSubmodulesByParentId(MASTER_MODULE_REGISTRY, 'mod_finance');
    assert.ok(financeSubmodules.length >= 8, 'Finance module should have 8+ submodules');

    const academicsSubmodules = getSubmodulesByParentId(MASTER_MODULE_REGISTRY, 'mod_academics');
    assert.ok(academicsSubmodules.length >= 15, 'Academics module should have 15+ submodules');
  });

  it('ensures all modules have required metadata fields present and non-empty', () => {
    for (const mod of MASTER_MODULE_REGISTRY) {
      assert.ok(mod.name && mod.name.trim().length > 0, `Module ${mod.id} missing name`);
      assert.ok(mod.description && mod.description.trim().length > 0, `Module ${mod.id} missing description`);
      assert.ok(mod.category && mod.category.trim().length > 0, `Module ${mod.id} missing category`);
      assert.ok(mod.href && mod.href.startsWith('/'), `Module ${mod.id} href must start with /`);
      assert.ok(Array.isArray(mod.routes) && mod.routes.length > 0, `Module ${mod.id} must have at least one mapped route`);
      assert.ok(mod.sourceEvidence && mod.sourceEvidence.routePath, `Module ${mod.id} must have sourceEvidence.routePath`);
      assert.ok(Array.isArray(mod.includedInPlans) && mod.includedInPlans.length > 0, `Module ${mod.id} must have includedInPlans`);
      assert.ok(mod.status, `Module ${mod.id} must have status`);
      assert.strictEqual(typeof mod.isGloballyEnabled, 'boolean', `Module ${mod.id} must have boolean isGloballyEnabled`);
    }
  });

  it('runs automated referential validation and passes with 0 critical errors', () => {
    const validation = validateModuleRegistry({ modules: MASTER_MODULE_REGISTRY });

    assert.strictEqual(validation.isValid, true, 'Module registry must be valid');
    assert.strictEqual(validation.totalModulesCount, 321);
    assert.strictEqual(validation.topLevelModulesCount, 56);
    assert.strictEqual(validation.submodulesCount, 265);
    assert.strictEqual(validation.errorCount, 0, `Expected 0 validation errors, got: ${JSON.stringify(validation.issues.filter(i => i.severity === 'error'))}`);
  });

  it('verifies that no circular dependencies exist in the canonical registry', () => {
    const cycles = detectDependencyCycles(MASTER_MODULE_REGISTRY);
    assert.strictEqual(cycles.length, 0, `Unexpected circular dependencies found: ${JSON.stringify(cycles)}`);
  });

  it('ensures all dependency references point to existing registered module IDs', () => {
    const allIds = new Set(MASTER_MODULE_REGISTRY.map((m) => m.id));

    for (const mod of MASTER_MODULE_REGISTRY) {
      if (mod.dependencies && mod.dependencies.length > 0) {
        for (const dep of mod.dependencies) {
          assert.ok(
            allIds.has(dep.moduleId),
            `Module "${mod.id}" references nonexistent dependency ID "${dep.moduleId}"`
          );
        }
      }
    }
  });

  it('verifies that sourceEvidence references correspond to actual files in tenant-dashboard', () => {
    const projectRoot = path.resolve(__dirname, '..', '..');
    const tenantDashboardRoot = path.join(projectRoot, 'tenant-dashboard');

    if (fs.existsSync(tenantDashboardRoot)) {
      const sampleIndices = [0, 10, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 320];
      for (const idx of sampleIndices) {
        const mod = MASTER_MODULE_REGISTRY[idx];
        if (mod && mod.sourceEvidence && mod.sourceEvidence.routePath) {
          const fullPath = path.join(tenantDashboardRoot, mod.sourceEvidence.routePath);
          assert.ok(
            fs.existsSync(fullPath),
            `Source evidence file must exist on disk: ${fullPath} (for module ${mod.id})`
          );
        }
      }
    }
  });

  it('computes accurate registry metrics', () => {
    const metrics = getModuleMetrics(MASTER_MODULE_REGISTRY);

    assert.strictEqual(metrics.totalModules, 321);
    assert.strictEqual(metrics.topLevelModules, 56);
    assert.strictEqual(metrics.submodules, 265);
    assert.strictEqual(metrics.byImplementationStatus.implemented, 321);
    assert.strictEqual(metrics.byImplementationStatus.partial, 0);
    assert.strictEqual(metrics.byImplementationStatus.planned, 0);
    assert.strictEqual(metrics.byPlatformAvailability.generally_available, 321);
    assert.strictEqual(metrics.byPlanTier.starter > 0, true);
    assert.strictEqual(metrics.byPlanTier.growth > 0, true);
    assert.strictEqual(metrics.byPlanTier.enterprise > 0, true);
    assert.strictEqual(Object.keys(metrics.byCategory).length > 20, true);
  });
});
