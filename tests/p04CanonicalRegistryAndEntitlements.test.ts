import { describe, it, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  CANONICAL_FEATURE_REGISTRY,
  CANONICAL_MODULE_REGISTRY,
  CANONICAL_ROUTE_TO_MODULE_ID,
  CANONICAL_SUBSCRIPTION_PLANS,
} from '../lib/modules/canonical-registry-snapshot';
import {
  CanonicalModuleDefinition,
  CanonicalPlanDefinition,
  validateCanonicalRegistryGraph,
} from '../lib/modules/canonical-contract';
import {
  evaluateQuotaUsage,
  generatePlanComparisonRowsFromRegistry,
  resolveCanonicalEntitlement,
  type ResolveEntitlementOptions,
} from '../lib/modules/canonical-entitlements';
import { MASTER_MODULE_REGISTRY } from '../lib/modules/registry-data';
import { platformStore } from '../lib/data/platform-store';

const DASHBOARD_ROOT = process.cwd();
const FRONTEND_ROOT = path.resolve(DASHBOARD_ROOT, '../frontend');

function buildResolverOptions(
  overrides: Partial<ResolveEntitlementOptions> = {}
): ResolveEntitlementOptions {
  return {
    modulesById: new Map(CANONICAL_MODULE_REGISTRY.map((m) => [m.id, m])),
    featuresById: new Map(CANONICAL_FEATURE_REGISTRY.map((f) => [f.id, f])),
    featuresByKey: new Map(CANONICAL_FEATURE_REGISTRY.map((f) => [f.key, f])),
    allPlans: CANONICAL_SUBSCRIPTION_PLANS,
    ...overrides,
  };
}

describe('Phase P0-4: Canonical Registry Parity, Graph Validation & Entitlements', () => {
  beforeEach(() => {
    platformStore.resetToDefaults();
  });

  after(() => {
    platformStore.resetToDefaults();
  });

  it('maintains byte-for-byte canonical contract, resolver, and snapshot parity between dashboard and frontend', () => {
    const sharedFiles = [
      'lib/modules/canonical-contract.ts',
      'lib/modules/canonical-entitlements.ts',
      'lib/modules/canonical-registry-snapshot.ts',
    ];

    for (const rel of sharedFiles) {
      const dashSrc = fs.readFileSync(path.join(DASHBOARD_ROOT, rel), 'utf8');
      const frontSrc = fs.readFileSync(path.join(FRONTEND_ROOT, rel), 'utf8');
      assert.equal(dashSrc, frontSrc, `Shared canonical file "${rel}" diverged between dashboard and frontend`);
    }

    assert.equal(CANONICAL_MODULE_REGISTRY.length, 398);
    assert.equal(CANONICAL_FEATURE_REGISTRY.length, 19);
    assert.equal(CANONICAL_SUBSCRIPTION_PLANS.length, 5);
    assert.ok(Object.keys(CANONICAL_ROUTE_TO_MODULE_ID).length >= 541);
    assert.equal(MASTER_MODULE_REGISTRY.length, CANONICAL_MODULE_REGISTRY.length);
  });

  it('validates canonical Zod graph with zero errors and rejects duplicate IDs, missing parents, cycles, and deprecated modules in active plans', () => {
    const validReport = validateCanonicalRegistryGraph({
      modules: CANONICAL_MODULE_REGISTRY,
      features: CANONICAL_FEATURE_REGISTRY,
      plans: CANONICAL_SUBSCRIPTION_PLANS,
      knownRoutes: new Set(Object.keys(CANONICAL_ROUTE_TO_MODULE_ID)),
    });
    assert.equal(validReport.isValid, true);
    assert.equal(validReport.errors.length, 0);

    // Duplicate module ID
    const dupModReport = validateCanonicalRegistryGraph({
      modules: [...CANONICAL_MODULE_REGISTRY, CANONICAL_MODULE_REGISTRY[0]],
      features: CANONICAL_FEATURE_REGISTRY,
      plans: CANONICAL_SUBSCRIPTION_PLANS,
    });
    assert.equal(dupModReport.isValid, false);
    assert.ok(dupModReport.errors.some((e) => e.code === 'DUPLICATE_MODULE_ID'));

    // Missing parent module
    const brokenChild: CanonicalModuleDefinition = {
      ...CANONICAL_MODULE_REGISTRY[0],
      id: 'sub_orphan_test',
      navId: 'nav-orphan-test',
      code: 'ORPHAN_TEST',
      kind: 'submodule',
      parentId: 'mod_missing_parent',
    };
    const orphanReport = validateCanonicalRegistryGraph({
      modules: [...CANONICAL_MODULE_REGISTRY, brokenChild],
      features: CANONICAL_FEATURE_REGISTRY,
    });
    assert.equal(orphanReport.isValid, false);
    assert.ok(orphanReport.errors.some((e) => e.code === 'MISSING_PARENT_MODULE'));

    // Circular dependency
    const cycA: CanonicalModuleDefinition = {
      ...CANONICAL_MODULE_REGISTRY[0],
      id: 'mod_cycle_a',
      navId: 'nav-cycle-a',
      code: 'CYCLE_A',
      dependencies: [{ moduleId: 'mod_cycle_b', type: 'required', description: 'Cycle A->B' }],
    };
    const cycB: CanonicalModuleDefinition = {
      ...CANONICAL_MODULE_REGISTRY[0],
      id: 'mod_cycle_b',
      navId: 'nav-cycle-b',
      code: 'CYCLE_B',
      dependencies: [{ moduleId: 'mod_cycle_a', type: 'required', description: 'Cycle B->A' }],
    };
    const cycleReport = validateCanonicalRegistryGraph({
      modules: [...CANONICAL_MODULE_REGISTRY, cycA, cycB],
      features: CANONICAL_FEATURE_REGISTRY,
    });
    assert.equal(cycleReport.isValid, false);
    assert.ok(cycleReport.errors.some((e) => e.code === 'CIRCULAR_DEPENDENCY'));

    // Deprecated module included in published plan
    const badPlan: CanonicalPlanDefinition = {
      ...CANONICAL_SUBSCRIPTION_PLANS[0],
      id: 'plan_bad_deprecated',
      status: 'published',
      includedModuleIds: [...CANONICAL_SUBSCRIPTION_PLANS[0].includedModuleIds, 'mod_teachers'],
    };
    const depPlanReport = validateCanonicalRegistryGraph({
      modules: CANONICAL_MODULE_REGISTRY,
      features: CANONICAL_FEATURE_REGISTRY,
      plans: [badPlan],
    });
    assert.equal(depPlanReport.isValid, false);
    assert.ok(depPlanReport.errors.some((e) => e.code === 'DEPRECATED_IN_ACTIVE_PLAN'));
  });

  it('preserves consolidated subscription plan prices/quotas and syncs plan edits immediately across comparison matrix and entitlement evaluator', () => {
    const starter = platformStore.getPlans().find((p) => p.id === 'plan_starter')!;
    const growth = platformStore.getPlans().find((p) => p.id === 'plan_growth')!;
    const enterprise = platformStore.getPlans().find((p) => p.id === 'plan_enterprise')!;
    const ukGrowth = platformStore.getPlans().find((p) => p.id === 'plan_uk_growth')!;
    const customPilot = platformStore.getPlans().find((p) => p.id === 'plan_custom_pilot')!;

    assert.ok(starter && growth && enterprise && ukGrowth && customPilot);
    assert.equal(starter.priceMonthly, 199);
    assert.equal(starter.priceAnnual, 1990);
    assert.equal(starter.maxStudents, 350);
    assert.equal(growth.priceMonthly, 499);
    assert.equal(enterprise.priceMonthly, 1199);
    assert.equal(ukGrowth.currency, 'GBP');
    assert.equal(ukGrowth.priceMonthly, 399);
    assert.equal(customPilot.status, 'draft');
    assert.equal(customPilot.isActive, false);

    assert.ok(starter.includedModuleIds!.length < growth.includedModuleIds!.length);
    assert.ok(growth.includedModuleIds!.length < enterprise.includedModuleIds!.length);

    // Find an active org on plan_starter and verify mod_activities is initially excluded
    const starterOrg = platformStore.getOrganizations().find((o) => o.planId === 'plan_starter' && o.status === 'active')!;
    assert.ok(starterOrg, 'Expected seeded starter organization');
    const beforeEval = platformStore.evaluateEntitlement('mod_activities', starterOrg.id, 'plan_starter');
    assert.equal(beforeEval.planInclusion, 'excluded');
    assert.equal(beforeEval.effectiveStatus, 'unavailable');

    // Update plan_starter to include mod_activities and required submodules
    const updateRes = platformStore.updatePlan('plan_starter', {
      includedModuleIds: [...(starter.includedModuleIds || []), 'mod_activities'],
    });
    assert.equal(updateRes.success, true);

    const afterEval = platformStore.evaluateEntitlement('mod_activities', starterOrg.id, 'plan_starter');
    assert.equal(afterEval.planInclusion, 'included');
    assert.equal(afterEval.effectiveStatus, 'available');

    // Verify dynamic comparison matrix sees the edit immediately
    const updatedStarter = platformStore.getPlans().find((p) => p.id === 'plan_starter')!;
    const matrixRows = generatePlanComparisonRowsFromRegistry(CANONICAL_MODULE_REGISTRY, [
      {
        ...CANONICAL_SUBSCRIPTION_PLANS[0],
        includedModuleIds: updatedStarter.includedModuleIds || [],
      },
    ]);
    const actRow = matrixRows.find((r) => r.moduleId === 'mod_activities');
    assert.equal(actRow?.perPlan['plan_starter'].state, 'included');
  });

  it('enforces fail-closed precedence across unknown IDs, missing context, tenant suspension, trial expiry, grace period, add-ons, overrides, school types, dependencies, maturity, and quotas', () => {
    const opts = buildResolverOptions();
    const growthPlan = CANONICAL_SUBSCRIPTION_PLANS.find((p) => p.id === 'plan_growth')!;
    const enterprisePlan = CANONICAL_SUBSCRIPTION_PLANS.find((p) => p.id === 'plan_enterprise')!;

    // 1. Unknown module ID fails closed
    const unknownRes = resolveCanonicalEntitlement(
      { tenantId: 't1', tenantStatus: 'ACTIVE', plan: enterprisePlan, subscription: { status: 'active', planId: enterprisePlan.id } },
      { moduleId: 'mod_does_not_exist' },
      opts
    );
    assert.equal(unknownRes.allowed, false);
    assert.equal(unknownRes.reasonCode, 'UNKNOWN_MODULE_OR_FEATURE');

    // 2. Null context fails closed
    const nullCtx = resolveCanonicalEntitlement(null, { moduleId: 'mod_students' }, opts);
    assert.equal(nullCtx.allowed, false);
    assert.equal(nullCtx.reasonCode, 'MISSING_ENTITLEMENT_DATA');

    // 3. Suspended tenant with active subscription fails closed
    const suspendedRes = resolveCanonicalEntitlement(
      {
        tenantId: 't_susp',
        tenantStatus: 'SUSPENDED',
        plan: enterprisePlan,
        subscription: { status: 'active', planId: enterprisePlan.id },
      },
      { moduleId: 'mod_students' },
      opts
    );
    assert.equal(suspendedRes.allowed, false);
    assert.equal(suspendedRes.reasonCode, 'TENANT_SUSPENDED');

    // 4. Trial active vs trial expired
    const trialCtx = {
      tenantId: 't_trial',
      tenantStatus: 'TRIAL',
      plan: growthPlan,
      subscription: {
        status: 'trialing',
        planId: growthPlan.id,
        trialEndsAt: '2026-12-10T00:00:00Z',
      },
    };
    const trialActive = resolveCanonicalEntitlement(trialCtx, { moduleId: 'mod_students' }, buildResolverOptions({ asOfDate: '2026-12-01T00:00:00Z' }));
    assert.equal(trialActive.allowed, true);
    assert.equal(trialActive.isTrialing, true);

    const trialExpired = resolveCanonicalEntitlement(trialCtx, { moduleId: 'mod_students' }, buildResolverOptions({ asOfDate: '2026-12-20T00:00:00Z' }));
    assert.equal(trialExpired.allowed, false);
    assert.equal(trialExpired.reasonCode, 'TRIAL_EXPIRED');

    // 5. Past-due inside grace period vs expired grace
    const graceCtx = {
      tenantId: 't_grace',
      tenantStatus: 'ACTIVE',
      plan: growthPlan,
      subscription: {
        status: 'past_due',
        planId: growthPlan.id,
        gracePeriodEndsAt: '2026-12-10T00:00:00Z',
      },
    };
    const withinGrace = resolveCanonicalEntitlement(graceCtx, { moduleId: 'mod_students' }, buildResolverOptions({ asOfDate: '2026-12-05T00:00:00Z' }));
    assert.equal(withinGrace.allowed, true);
    assert.equal(withinGrace.inGracePeriod, true);
    assert.equal(withinGrace.reasonCode, 'ENTITLED_BY_GRACE_PERIOD');

    const afterGrace = resolveCanonicalEntitlement(graceCtx, { moduleId: 'mod_students' }, buildResolverOptions({ asOfDate: '2026-12-15T00:00:00Z' }));
    assert.equal(afterGrace.allowed, false);
    assert.equal(afterGrace.reasonCode, 'GRACE_PERIOD_EXPIRED');

    // 6. Partial maturity separated from plan availability, and coming_soon/deprecated fail closed
    const partialIncluded = resolveCanonicalEntitlement(
      { tenantId: 't_ent', tenantStatus: 'ACTIVE', plan: enterprisePlan, subscription: { status: 'active', planId: enterprisePlan.id } },
      { moduleId: 'mod_analytics' },
      opts
    );
    assert.equal(partialIncluded.allowed, true);
    assert.equal(partialIncluded.implementationMaturity, 'partial');

    const comingSoonFeat = resolveCanonicalEntitlement(
      { tenantId: 't_ent', tenantStatus: 'ACTIVE', plan: enterprisePlan, subscription: { status: 'active', planId: enterprisePlan.id } },
      { featureId: 'feat_custom_domain' },
      opts
    );
    assert.equal(comingSoonFeat.allowed, false);
    assert.equal(comingSoonFeat.effectiveStatus, 'coming_soon');
    assert.equal(comingSoonFeat.reasonCode, 'COMING_SOON');

    const deprecatedMod = resolveCanonicalEntitlement(
      { tenantId: 't_ent', tenantStatus: 'ACTIVE', plan: enterprisePlan, subscription: { status: 'active', planId: enterprisePlan.id } },
      { moduleId: 'mod_teachers' },
      opts
    );
    assert.equal(deprecatedMod.allowed, false);
    assert.equal(deprecatedMod.effectiveStatus, 'deprecated');
    assert.equal(deprecatedMod.reasonCode, 'DEPRECATED');

    // 7. Active vs expired add-on for excluded module
    const starterPlan = CANONICAL_SUBSCRIPTION_PLANS.find((p) => p.id === 'plan_starter')!;
    const activeAddOnRes = resolveCanonicalEntitlement(
      {
        tenantId: 't_addon',
        tenantStatus: 'ACTIVE',
        plan: starterPlan,
        subscription: { status: 'active', planId: starterPlan.id },
        addOns: [
          {
            id: 'ao_1',
            moduleId: 'mod_hostel',
            name: 'Hostel Add-On',
            status: 'active',
            startDate: '2026-01-01T00:00:00Z',
            expiryDate: '2027-01-01T00:00:00Z',
          },
        ],
      },
      { moduleId: 'mod_hostel' },
      buildResolverOptions({ asOfDate: '2026-11-26T00:00:00Z' })
    );
    assert.equal(activeAddOnRes.allowed, true);
    assert.equal(activeAddOnRes.reasonCode, 'ENTITLED_BY_ADDON');

    const expiredAddOnRes = resolveCanonicalEntitlement(
      {
        tenantId: 't_addon',
        tenantStatus: 'ACTIVE',
        plan: starterPlan,
        subscription: { status: 'active', planId: starterPlan.id },
        addOns: [
          {
            id: 'ao_1',
            moduleId: 'mod_hostel',
            name: 'Hostel Add-On',
            status: 'expired',
            startDate: '2025-01-01T00:00:00Z',
            expiryDate: '2026-01-01T00:00:00Z',
          },
        ],
      },
      { moduleId: 'mod_hostel' },
      buildResolverOptions({ asOfDate: '2026-11-26T00:00:00Z' })
    );
    assert.equal(expiredAddOnRes.allowed, false);

    // 8. School-type incompatibility
    const collegeOnlyMod: CanonicalModuleDefinition = {
      ...CANONICAL_MODULE_REGISTRY.find((m) => m.id === 'mod_students')!,
      id: 'mod_vocational_only',
      navId: 'nav-voc-only',
      code: 'VOC_ONLY',
      supportedSchoolTypes: ['college', 'vocational'],
    };
    const customModules = new Map(CANONICAL_MODULE_REGISTRY.map((m) => [m.id, m]));
    customModules.set(collegeOnlyMod.id, collegeOnlyMod);
    const schoolMismatch = resolveCanonicalEntitlement(
      {
        tenantId: 't_prim',
        tenantStatus: 'ACTIVE',
        schoolType: 'primary',
        plan: enterprisePlan,
        subscription: { status: 'active', planId: enterprisePlan.id },
      },
      { moduleId: 'mod_vocational_only' },
      buildResolverOptions({ modulesById: customModules })
    );
    assert.equal(schoolMismatch.allowed, false);
    assert.equal(schoolMismatch.reasonCode, 'UNSUPPORTED_SCHOOL_TYPE');

    // 9. Usage quota check (exceeds Starter limits: 350 students, 35 staff, 1 campus, 50 GB storage)
    const quotaCheck = evaluateQuotaUsage({
      tenantId: 't_quota',
      tenantStatus: 'ACTIVE',
      plan: starterPlan,
      usage: { studentsCount: 400, staffCount: 40, campusesCount: 2, storageUsedGb: 60 },
    });
    assert.equal(quotaCheck.withinLimits, false);
    assert.ok(quotaCheck.exceededMetrics.some((m) => m.metric === 'students'));
    assert.ok(quotaCheck.exceededMetrics.some((m) => m.metric === 'staff'));
    assert.ok(quotaCheck.exceededMetrics.some((m) => m.metric === 'campuses'));
    assert.ok(quotaCheck.exceededMetrics.some((m) => m.metric === 'storage'));
  });

  it('supports Super-Admin simulated trial extension, add-on lifecycle actions, and metadata/dependency updates', () => {
    const targetSub = platformStore.getSubscriptions()[0];
    const starterOrg = platformStore.getOrganizations().find((o) => o.id === targetSub.organizationId)!;

    // Extend trial window
    const extRes = platformStore.extendSubscriptionTrial(targetSub.id, '2027-03-01T00:00:00Z', 'Approved pilot extension');
    assert.equal(extRes.success, true);
    assert.equal(platformStore.getSubscriptionById(targetSub.id)?.status, 'trialing');

    // Grant & expire add-on
    const grantRes = platformStore.manageSubscriptionAddOn(targetSub.id, 'grant', {
      moduleId: 'mod_hostel',
      name: 'Boarding Add-On',
      expiryDate: '2027-06-01T00:00:00Z',
    });
    assert.equal(grantRes.success, true);

    const expireRes = platformStore.manageSubscriptionAddOn(targetSub.id, 'expire', {
      moduleId: 'mod_hostel',
      name: 'Boarding Add-On',
    });
    assert.equal(expireRes.success, true);
    assert.equal(platformStore.getSubscriptionById(targetSub.id)?.activeAddOns?.[0].status, 'expired');

    // Self-dependency prevention on module update
    const badMeta = platformStore.updateModuleMetadata('mod_students', {
      dependencies: [{ moduleId: 'mod_students', type: 'required', description: 'Invalid self-dep' }],
    });
    assert.equal(badMeta.success, false);

    // Valid availability update
    const availRes = platformStore.setModuleAvailabilityStatus('mod_cafeteria', 'coming_soon');
    assert.equal(availRes.success, true);
    const evalCaf = platformStore.evaluateEntitlement('mod_cafeteria', starterOrg.id);
    assert.equal(evalCaf.effectiveStatus, 'unavailable');
  });
});
