import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  evaluateModuleEntitlement,
  evaluateAllModules,
  detectDependencyCycles,
  MASTER_MODULE_REGISTRY,
} from '../lib/modules';
import type { TenantModuleDefinition, OrganizationModuleOverride } from '../lib/modules/types';

describe('Deterministic Feature Entitlement Evaluator', () => {
  const studentsModule = MASTER_MODULE_REGISTRY.find((m) => m.id === 'mod_students')!;
  const attendanceModule = MASTER_MODULE_REGISTRY.find((m) => m.id === 'mod_attendance')!;
  const analyticsModule = MASTER_MODULE_REGISTRY.find((m) => m.id === 'mod_analytics')!;

  it('Tier 1: UNREGISTERED_GUARD - rejects unregistered module IDs cleanly', () => {
    const result = evaluateModuleEntitlement({
      moduleId: 'mod_nonexistent_fake_module',
      planId: 'enterprise',
      registry: MASTER_MODULE_REGISTRY,
    });

    assert.strictEqual(result.isRegistered, false);
    assert.strictEqual(result.effectiveStatus, 'unresolved');
    assert.strictEqual(result.precedenceApplied, 'UNREGISTERED_GUARD');
    assert.ok(result.reason.includes('not registered'));
  });

  it('Tier 2: PLATFORM_DISABLEMENT - globally disabled module blocks access even with enterprise plan', () => {
    const disabledMockModule: TenantModuleDefinition = {
      ...studentsModule,
      isGloballyEnabled: false,
    };

    const result = evaluateModuleEntitlement({
      moduleId: disabledMockModule.id,
      planId: 'enterprise',
      registry: [disabledMockModule],
    });

    assert.strictEqual(result.effectiveStatus, 'unavailable');
    assert.strictEqual(result.precedenceApplied, 'PLATFORM_DISABLEMENT');
    assert.ok(result.reason.includes('disabled platform-wide'));
  });

  it('Tier 2: PLATFORM_DISABLEMENT - takes strict precedence over organization force_enable override', () => {
    const disabledMockModule: TenantModuleDefinition = {
      ...studentsModule,
      isGloballyEnabled: false,
    };

    const override: OrganizationModuleOverride = {
      organizationId: 'org_001',
      moduleId: disabledMockModule.id,
      action: 'force_enable',
      reason: 'VIP exception request',
      appliedBy: 'superadmin@eduflow.internal',
      appliedAt: '2026-10-17T00:00:00Z',
    };

    const result = evaluateModuleEntitlement({
      moduleId: disabledMockModule.id,
      organizationId: 'org_001',
      planId: 'enterprise',
      organizationOverrides: [override],
      registry: [disabledMockModule],
    });

    assert.strictEqual(result.effectiveStatus, 'unavailable');
    assert.strictEqual(result.precedenceApplied, 'PLATFORM_DISABLEMENT');
  });

  it('Tier 3: IMPLEMENTATION_GUARD - blocks modules marked planned, missing, or unknown', () => {
    const plannedModule: TenantModuleDefinition = {
      ...studentsModule,
      id: 'mod_future_feature',
      status: 'planned',
    };

    const result = evaluateModuleEntitlement({
      moduleId: plannedModule.id,
      planId: 'enterprise',
      registry: [plannedModule],
    });

    assert.strictEqual(result.effectiveStatus, 'unavailable');
    assert.strictEqual(result.precedenceApplied, 'IMPLEMENTATION_GUARD');
    assert.ok(result.reason.includes('planned'));
  });

  it('Tier 4: ORGANIZATION_FORCE_DISABLE - tenant override disables module included in plan', () => {
    const override: OrganizationModuleOverride = {
      organizationId: 'org_001',
      moduleId: studentsModule.id,
      action: 'force_disable',
      reason: 'Temporarily disabled by school request during data migration',
      appliedBy: 'superadmin@eduflow.internal',
      appliedAt: '2026-10-17T00:00:00Z',
    };

    const result = evaluateModuleEntitlement({
      moduleId: studentsModule.id,
      organizationId: 'org_001',
      planId: 'enterprise',
      organizationOverrides: [override],
      registry: MASTER_MODULE_REGISTRY,
    });

    assert.strictEqual(result.effectiveStatus, 'unavailable');
    assert.strictEqual(result.precedenceApplied, 'ORGANIZATION_FORCE_DISABLE');
    assert.strictEqual(result.overrideAction, 'force_disable');
    assert.ok(result.reason.includes('disabled by organization override'));
  });

  it('Tier 5: DEPENDENCY_FAILURE - denies access when a required dependency fails or is disabled', () => {
    // Attendance depends on mod_students
    const disabledStudents: TenantModuleDefinition = {
      ...studentsModule,
      isGloballyEnabled: false,
    };

    const testModules = MASTER_MODULE_REGISTRY.map((m) =>
      m.id === 'mod_students' ? disabledStudents : m
    );

    const result = evaluateModuleEntitlement({
      moduleId: attendanceModule.id,
      planId: 'enterprise',
      registry: testModules,
    });

    assert.strictEqual(result.effectiveStatus, 'restricted');
    assert.strictEqual(result.precedenceApplied, 'DEPENDENCY_FAILURE');
    assert.strictEqual(result.dependenciesSatisfied, false);
    assert.ok(result.unsatisfiedDependencies.length > 0);
    assert.ok(result.reason.includes('unsatisfied'));
  });

  it('Tier 6: ORGANIZATION_FORCE_ENABLE - grants access to module excluded by plan tier', () => {
    // Analytics & BI is enterprise-only, evaluate for starter plan with force_enable
    const override: OrganizationModuleOverride = {
      organizationId: 'org_002',
      moduleId: analyticsModule.id,
      action: 'force_enable',
      reason: 'Special beta trial for Green Valley High',
      appliedBy: 'superadmin@eduflow.internal',
      appliedAt: '2026-10-17T00:00:00Z',
    };

    const result = evaluateModuleEntitlement({
      moduleId: analyticsModule.id,
      organizationId: 'org_002',
      planId: 'starter',
      organizationOverrides: [override],
      registry: MASTER_MODULE_REGISTRY,
    });

    assert.strictEqual(result.effectiveStatus, 'available');
    assert.strictEqual(result.precedenceApplied, 'ORGANIZATION_FORCE_ENABLE');
    assert.strictEqual(result.overrideAction, 'force_enable');
    assert.ok(result.reason.includes('enabled by organization override'));
  });

  it('Tier 7: PLAN_INCLUDED - grants access when module is included in subscription plan default', () => {
    const result = evaluateModuleEntitlement({
      moduleId: studentsModule.id,
      planId: 'starter',
      registry: MASTER_MODULE_REGISTRY,
    });

    assert.strictEqual(result.effectiveStatus, 'available');
    assert.strictEqual(result.precedenceApplied, 'PLAN_INCLUDED');
    assert.strictEqual(result.overrideAction, 'inherit');
    assert.ok(result.reason.includes('included in the starter subscription plan'));
  });

  it('Tier 8: PLAN_EXCLUDED - denies access when module exceeds tenant subscription tier', () => {
    // Analytics & BI requires enterprise
    const result = evaluateModuleEntitlement({
      moduleId: analyticsModule.id,
      planId: 'starter',
      registry: MASTER_MODULE_REGISTRY,
    });

    assert.strictEqual(result.effectiveStatus, 'unavailable');
    assert.strictEqual(result.precedenceApplied, 'PLAN_EXCLUDED');
    assert.strictEqual(result.overrideAction, 'inherit');
    assert.ok(result.reason.includes('not included in the starter plan'));
  });

  it('evaluates fallback gracefully for unknown plan tier IDs', () => {
    const result = evaluateModuleEntitlement({
      moduleId: studentsModule.id,
      planId: 'unknown_platinum_plus' as unknown as string,
      registry: MASTER_MODULE_REGISTRY,
    });

    assert.strictEqual(result.effectiveStatus, 'unresolved');
    assert.ok(result.reason.includes('subscription plan is unspecified or unknown'));
  });

  it('detects circular dependency chains cleanly', () => {
    const cyclicA: TenantModuleDefinition = {
      ...studentsModule,
      id: 'mod_cycle_a',
      dependencies: [{ moduleId: 'mod_cycle_b', type: 'required', description: 'Cycle test' }],
    };
    const cyclicB: TenantModuleDefinition = {
      ...studentsModule,
      id: 'mod_cycle_b',
      dependencies: [{ moduleId: 'mod_cycle_c', type: 'required', description: 'Cycle test' }],
    };
    const cyclicC: TenantModuleDefinition = {
      ...studentsModule,
      id: 'mod_cycle_c',
      dependencies: [{ moduleId: 'mod_cycle_a', type: 'required', description: 'Cycle test' }],
    };

    const testPool = [cyclicA, cyclicB, cyclicC];
    const cycles = detectDependencyCycles(testPool);

    assert.strictEqual(cycles.length, 1);
    assert.strictEqual(cycles[0].includes('mod_cycle_a'), true);
    assert.strictEqual(cycles[0].includes('mod_cycle_b'), true);
    assert.strictEqual(cycles[0].includes('mod_cycle_c'), true);
  });

  it('evaluates all 321 modules in bulk and provides consistent entitlement maps', () => {
    const results = evaluateAllModules({
      planId: 'growth',
      registry: MASTER_MODULE_REGISTRY,
    });

    assert.strictEqual(results.size, 321);

    const available = Array.from(results.values()).filter((r) => r.effectiveStatus === 'available');
    const unavailable = Array.from(results.values()).filter((r) => r.effectiveStatus === 'unavailable');

    assert.ok(available.length > 0, 'Growth plan should allow substantial modules');
    assert.ok(unavailable.length > 0, 'Growth plan should exclude enterprise-only modules');
    assert.strictEqual(available.length + unavailable.length, 321);
  });
});
