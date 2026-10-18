import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { PlatformStore } from '../lib/data/platform-store';

describe('PlatformStore Tenant Module & Feature Entitlement State', () => {
  let store: PlatformStore;

  beforeEach(() => {
    store = new PlatformStore();
    store.resetToDefaults();
  });

  it('initializes store with the canonical 321 tenant modules and 56 top-level modules', () => {
    const modules = store.getModules();
    assert.equal(modules.length, 321);

    const topLevel = store.getTopLevelModules();
    assert.equal(topLevel.length, 56);
  });

  it('retrieves submodules by parent module ID correctly', () => {
    const submodules = store.getSubmodulesByParentId('mod_students');
    assert.ok(submodules.length >= 4);
    assert.ok(submodules.every((m) => m.parentId === 'mod_students'));
  });

  it('calculates comprehensive module metrics from current store state', () => {
    const metrics = store.getModuleMetrics();
    assert.equal(metrics.totalModules, 321);
    assert.equal(metrics.topLevelModules, 56);
    assert.equal(metrics.submodules, 265);
    assert.equal(metrics.implementedCount, 321);
    assert.equal(metrics.platformEnabledCount, 321);
    assert.ok(metrics.planStarterCount > 0);
    assert.ok(metrics.planGrowthCount > 0);
    assert.ok(metrics.planEnterpriseCount > 0);
  });

  it('loads initial realistic organization overrides', () => {
    const initialOverrides = store.getOrganizationModuleOverrides();
    assert.ok(initialOverrides.length > 0, 'Should load demonstration organization overrides');

    const org002Overrides = store.getOrganizationModuleOverrides('org_002');
    assert.ok(org002Overrides.length > 0);
  });

  it('sets organization module override to force_enable and logs audit event', () => {
    const orgId = 'org_001';
    const moduleId = 'mod_analytics'; // enterprise tier module
    const initialEventsCount = store.getAuditEvents().length;

    const result = store.setOrganizationModuleOverride({
      organizationId: orgId,
      moduleId,
      action: 'force_enable',
      reason: 'Pilot AI analytics beta agreement signed with board',
      actorName: 'superadmin@eduflow.internal',
    });

    assert.equal(result.success, true);

    const overrides = store.getOrganizationModuleOverrides(orgId);
    const updated = overrides.find((o) => o.moduleId === moduleId);
    assert.ok(updated);
    assert.equal(updated.organizationId, orgId);
    assert.equal(updated.moduleId, moduleId);
    assert.equal(updated.action, 'force_enable');
    assert.equal(updated.appliedBy, 'superadmin@eduflow.internal');

    // Audit event check
    const events = store.getAuditEvents();
    assert.equal(events.length, initialEventsCount + 1);
    const latestEvent = events[0];
    assert.equal(latestEvent.action, 'MODULE_OVERRIDE_UPDATED');
    assert.equal(latestEvent.targetId, `${orgId}:${moduleId}`);
  });

  it('sets organization module override to force_disable and reflects in evaluation', () => {
    const orgId = 'org_001';
    const moduleId = 'mod_students';

    const result = store.setOrganizationModuleOverride({
      organizationId: orgId,
      moduleId,
      action: 'force_disable',
      reason: 'School opted to disable during preliminary data cleanup',
      actorName: 'superadmin@eduflow.internal',
    });

    assert.equal(result.success, true);

    const evaluation = store.evaluateEntitlement(moduleId, orgId);
    assert.equal(evaluation.effectiveStatus, 'unavailable');
    assert.equal(evaluation.overrideAction, 'force_disable');
    assert.equal(evaluation.precedenceApplied, 'ORGANIZATION_FORCE_DISABLE');
  });

  it('resets organization module override back to inherited plan default and logs audit event', () => {
    const orgId = 'org_001';
    const moduleId = 'mod_students';

    // Apply override first
    store.setOrganizationModuleOverride({
      organizationId: orgId,
      moduleId,
      action: 'force_disable',
      reason: 'Temporary hold',
      actorName: 'superadmin@eduflow.internal',
    });

    // Verify it is unavailable
    const evalBefore = store.evaluateEntitlement(moduleId, orgId);
    assert.equal(evalBefore.effectiveStatus, 'unavailable');

    // Reset override
    const initialEventsCount = store.getAuditEvents().length;
    const resetResult = store.resetOrganizationModuleOverride(
      orgId,
      moduleId,
      'superadmin@eduflow.internal'
    );

    assert.equal(resetResult.success, true);

    // Verify it reverts to inherited plan default (available)
    const evalAfter = store.evaluateEntitlement(moduleId, orgId);
    assert.equal(evalAfter.effectiveStatus, 'available');
    assert.equal(evalAfter.overrideAction, 'inherit');

    // Verify audit event
    const events = store.getAuditEvents();
    assert.equal(events.length, initialEventsCount + 1);
    assert.equal(events[0].action, 'MODULE_OVERRIDE_UPDATED');
  });

  it('toggles global module availability and emits MODULE_AVAILABILITY_TOGGLED audit event', () => {
    const moduleId = 'mod_results';
    const initialEventsCount = store.getAuditEvents().length;

    const toggleResult = store.setModuleGlobalAvailability(
      moduleId,
      false,
      'Scheduled maintenance for term report generator'
    );

    assert.equal(toggleResult.success, true);

    // Module should now be unavailable to any organization
    const evalResult = store.evaluateEntitlement(moduleId, 'org_001');
    assert.equal(evalResult.effectiveStatus, 'unavailable');
    assert.equal(evalResult.precedenceApplied, 'PLATFORM_DISABLEMENT');

    // Check audit event
    const events = store.getAuditEvents();
    assert.equal(events.length, initialEventsCount + 1);
    assert.equal(events[0].action, 'MODULE_AVAILABILITY_TOGGLED');
  });

  it('validates the active module registry through the store', () => {
    const validation = store.validateRegistry();
    assert.equal(validation.isValid, true);
    assert.equal(validation.totalModulesCount, 321);
    assert.equal(validation.topLevelModulesCount, 56);
    assert.equal(validation.submodulesCount, 265);
    assert.equal(validation.errorCount, 0);
  });
});
