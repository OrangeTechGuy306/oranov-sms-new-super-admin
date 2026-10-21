import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { platformStore } from '../lib/data/platform-store';
import {
  evaluateEffectiveConfiguration,
  detectCircularDependencies,
  canTransitionLifecycle,
  estimateRolloutScope,
} from '../lib/platform-config/evaluator';
import {
  validatePlatformSettings,
  validateFeatureFlag,
  validateRolloutPlan,
  validateChangeProposal,
} from '../lib/platform-config/validator';
import {
  exportConfigurationPackage,
  validateImportPackage,
  sanitizeObject,
} from '../lib/platform-config/exporter';
import {
  INITIAL_EXTENDED_PLATFORM_SETTINGS,
  INITIAL_FEATURE_FLAGS,
  INITIAL_TENANT_OVERRIDES,
} from '../lib/platform-config/fixtures';
import {
  ExtendedPlatformSettings,
  FeatureFlag,
  TenantFeatureOverride,
  RolloutPlanInput,
  ConfigurationChangeProposal,
  ConfigExportPackage,
} from '../lib/types/platform-config';

describe('Phase E-09.15: Platform Configuration, Feature Flags & Global Settings Governance', () => {
  beforeEach(() => {
    platformStore.resetToDefaults();
  });

  // ==========================================
  // 1. PLATFORM SETTINGS VALIDATION
  // ==========================================
  describe('1. Platform Settings Validation & Default Policies', () => {
    test('passes validation for valid initial platform settings', () => {
      const report = validatePlatformSettings(INITIAL_EXTENDED_PLATFORM_SETTINGS);
      assert.equal(report.isValid, true);
      assert.equal(report.errors.length, 0);
    });

    test('rejects missing or empty platform name', () => {
      const invalid: ExtendedPlatformSettings = {
        ...INITIAL_EXTENDED_PLATFORM_SETTINGS,
        branding: {
          ...INITIAL_EXTENDED_PLATFORM_SETTINGS.branding,
          platformName: '   ',
        },
      };
      const report = validatePlatformSettings(invalid);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('Platform name is required')));
    });

    test('enforces supported locale values', () => {
      const invalid: ExtendedPlatformSettings = {
        ...INITIAL_EXTENDED_PLATFORM_SETTINGS,
        regional: {
          ...INITIAL_EXTENDED_PLATFORM_SETTINGS.regional,
          defaultLocale: 'xx-INVALID',
        },
      };
      const report = validatePlatformSettings(invalid);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('Unsupported locale')));
    });

    test('enforces supported time zone identifiers', () => {
      const invalid: ExtendedPlatformSettings = {
        ...INITIAL_EXTENDED_PLATFORM_SETTINGS,
        regional: {
          ...INITIAL_EXTENDED_PLATFORM_SETTINGS.regional,
          defaultTimezone: 'Mars/Phobos',
        },
      };
      const report = validatePlatformSettings(invalid);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('Unsupported timezone')));
    });

    test('enforces supported currency codes', () => {
      const invalid: ExtendedPlatformSettings = {
        ...INITIAL_EXTENDED_PLATFORM_SETTINGS,
        regional: {
          ...INITIAL_EXTENDED_PLATFORM_SETTINGS.regional,
          defaultCurrency: 'DOGECOIN',
        },
      };
      const report = validatePlatformSettings(invalid);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('Unsupported default currency')));
    });

    test('rejects invalid hex branding colors', () => {
      const invalid: ExtendedPlatformSettings = {
        ...INITIAL_EXTENDED_PLATFORM_SETTINGS,
        branding: {
          ...INITIAL_EXTENDED_PLATFORM_SETTINGS.branding,
          primaryColor: 'not-a-hex',
        },
      };
      const report = validatePlatformSettings(invalid);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('valid hex color code') || e.includes('valid hex')));
    });

    test('rejects session timeout less than 5 minutes', () => {
      const invalid: ExtendedPlatformSettings = {
        ...INITIAL_EXTENDED_PLATFORM_SETTINGS,
        securityPolicy: {
          ...INITIAL_EXTENDED_PLATFORM_SETTINGS.securityPolicy,
          sessionTimeoutMinutes: 2,
        },
      };
      const report = validatePlatformSettings(invalid);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('Session timeout must be between 5 and 1440 minutes')));
    });
  });

  // ==========================================
  // 2. FEATURE FLAG VALIDATION & LIFECYCLE
  // ==========================================
  describe('2. Feature Flag Registry & Lifecycle Management', () => {
    test('validates correct flag key format', () => {
      const validFlag: Partial<FeatureFlag> = {
        key: 'feat.cbt.adaptive_test',
        name: 'Adaptive Testing',
        description: 'Adaptive assessment difficulty algorithm',
        category: 'examinations_cbt',
        lifecycle: 'draft',
        defaultValue: false,
        enabled: false,
        scope: 'global',
        environment: 'development',
        rolloutStrategy: 'all_tenants',
        risk: 'standard',
        owner: 'Assessment Squad',
        dependsOnFlagKeys: [],
        sourceStatus: 'verified_local_mock',
      };
      const report = validateFeatureFlag(validFlag, INITIAL_FEATURE_FLAGS, false);
      assert.equal(report.isValid, true);
    });

    test('rejects invalid key naming format with uppercase or spaces', () => {
      const invalidKeyFlag: Partial<FeatureFlag> = {
        key: 'INVALID KEY NAME',
        name: 'Bad Flag',
        description: 'Description',
        category: 'academics',
        lifecycle: 'draft',
      };
      const report = validateFeatureFlag(invalidKeyFlag, INITIAL_FEATURE_FLAGS, false);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('lowercase alphanumeric')));
    });

    test('rejects duplicate flag keys during creation', () => {
      const duplicateFlag: Partial<FeatureFlag> = {
        key: 'feat.cbt.instant_scoring', // already exists in fixtures
        name: 'Duplicate Flag',
        description: 'Some desc',
        category: 'examinations_cbt',
        lifecycle: 'draft',
      };
      const report = validateFeatureFlag(duplicateFlag, INITIAL_FEATURE_FLAGS, true);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('already in use') || e.includes('already exists')));
    });

    test('enforces documented lifecycle transitions', () => {
      // draft -> active: ALLOWED
      assert.equal(canTransitionLifecycle('draft', 'active').allowed, true);

      // active -> disabled: ALLOWED
      assert.equal(canTransitionLifecycle('active', 'disabled').allowed, true);

      // disabled -> archived: ALLOWED
      assert.equal(canTransitionLifecycle('disabled', 'archived').allowed, true);

      // archived -> active: FORBIDDEN (must restore to draft or disabled first)
      const res = canTransitionLifecycle('archived', 'active');
      assert.equal(res.allowed, false);
      assert.ok(res.reason?.includes('Archived flags cannot be directly enabled'));

      // archived -> draft: ALLOWED (explicit restore)
      assert.equal(canTransitionLifecycle('archived', 'draft').allowed, true);
    });

    test('detects circular flag dependencies via DFS graph traversal', () => {
      const flagsWithCycle: FeatureFlag[] = [
        {
          id: 'flag_cyc_1',
          key: 'feat.alpha',
          name: 'Alpha',
          description: '',
          category: 'experimental',
          lifecycle: 'active',
          defaultValue: true,
          enabled: true,
          scope: 'global',
          environment: 'production',
          rolloutStrategy: 'all_tenants',
          risk: 'standard',
          owner: 'Core',
          dependsOnFlagKeys: ['feat.beta'],
          sourceStatus: 'verified_local_mock',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        {
          id: 'flag_cyc_2',
          key: 'feat.beta',
          name: 'Beta',
          description: '',
          category: 'experimental',
          lifecycle: 'active',
          defaultValue: true,
          enabled: true,
          scope: 'global',
          environment: 'production',
          rolloutStrategy: 'all_tenants',
          risk: 'standard',
          owner: 'Core',
          dependsOnFlagKeys: ['feat.gamma'],
          sourceStatus: 'verified_local_mock',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        {
          id: 'flag_cyc_3',
          key: 'feat.gamma',
          name: 'Gamma',
          description: '',
          category: 'experimental',
          lifecycle: 'active',
          defaultValue: true,
          enabled: true,
          scope: 'global',
          environment: 'production',
          rolloutStrategy: 'all_tenants',
          risk: 'standard',
          owner: 'Core',
          dependsOnFlagKeys: ['feat.alpha'], // cycle back to alpha!
          sourceStatus: 'verified_local_mock',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ];

      const cycle = detectCircularDependencies(flagsWithCycle);
      assert.equal(cycle.hasCycle, true);
      assert.ok(cycle.cyclePath?.includes('feat.alpha'));
    });

    test('validates non-existent dependency references', () => {
      const flagWithBadDep: Partial<FeatureFlag> = {
        key: 'feat.cbt.ai_grading',
        name: 'AI Grading',
        description: 'Auto grading',
        category: 'examinations_cbt',
        lifecycle: 'draft',
        dependsOnFlagKeys: ['feat.nonexistent.prerequisite'],
      };
      const report = validateFeatureFlag(flagWithBadDep, INITIAL_FEATURE_FLAGS, false);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('does not exist')));
    });
  });

  // ==========================================
  // 3. SCOPE PRECEDENCE & SAFE FAILURE
  // ==========================================
  describe('3. Scope Precedence Hierarchy & Safe Failure Gating', () => {
    test('resolves Layer 1 (Platform Default) when no overrides are present', () => {
      const result = evaluateEffectiveConfiguration(
        'feat.cbt.instant_scoring',
        INITIAL_FEATURE_FLAGS,
        [], // no overrides
        'org_001',
        'production',
        platformStore.getModules(),
        platformStore.getOrganizations(),
        platformStore.getSubscriptions(),
        platformStore.getPlans()
      );

      assert.equal(result.safeFailureState, false);
      assert.equal(result.resolvedScope, 'platform_default');
      assert.equal(result.effectiveValue, true);
      assert.equal(result.isOverridden, false);
    });

    test('resolves Layer 3 (Tenant Override) taking precedence over platform default', () => {
      const override: TenantFeatureOverride = {
        id: 'ovr_test_01',
        organizationId: 'org_001',
        flagKey: 'feat.cbt.instant_scoring', // default is true
        overrideValue: false, // explicitly turned off for this tenant
        reason: 'Disabled for strict manual grading protocol',
        actor: 'Admin',
        actorName: 'Admin',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      const result = evaluateEffectiveConfiguration(
        'feat.cbt.instant_scoring',
        INITIAL_FEATURE_FLAGS,
        [override],
        'org_001',
        'production',
        platformStore.getModules(),
        platformStore.getOrganizations(),
        platformStore.getSubscriptions(),
        platformStore.getPlans()
      );

      assert.equal(result.safeFailureState, false);
      assert.equal(result.resolvedScope, 'organization_override');
      assert.equal(result.effectiveValue, false);
      assert.equal(result.isOverridden, true);
      assert.ok(result.inheritanceSource.includes('Tenant Override'));
    });

    test('tenant override applies strictly to target organization and does not leak to others', () => {
      const override: TenantFeatureOverride = {
        id: 'ovr_test_02',
        organizationId: 'org_001',
        flagKey: 'feat.cbt.proctor_webcam', // default is false
        overrideValue: true, // enabled ONLY for org_001
        reason: 'Pilot biometric exam trial',
        actor: 'Admin',
        actorName: 'Admin',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      // Org 001 receives override (true)
      const resOrg1 = evaluateEffectiveConfiguration(
        'feat.cbt.proctor_webcam',
        INITIAL_FEATURE_FLAGS,
        [override],
        'org_001',
        'production',
        platformStore.getModules(),
        platformStore.getOrganizations(),
        platformStore.getSubscriptions(),
        platformStore.getPlans()
      );
      assert.equal(resOrg1.effectiveValue, true);
      assert.equal(resOrg1.resolvedScope, 'organization_override');

      // Org 002 inherits platform default (false)
      const resOrg2 = evaluateEffectiveConfiguration(
        'feat.cbt.proctor_webcam',
        INITIAL_FEATURE_FLAGS,
        [override],
        'org_002',
        'production',
        platformStore.getModules(),
        platformStore.getOrganizations(),
        platformStore.getSubscriptions(),
        platformStore.getPlans()
      );
      assert.equal(resOrg2.effectiveValue, false);
      assert.equal(resOrg2.resolvedScope, 'platform_default');
    });

    test('safe failure: missing or disabled dependency blocks feature enablement (never fails open)', () => {
      // feat.cbt.proctor_webcam depends on feat.cbt.instant_scoring
      // If we disable feat.cbt.instant_scoring:
      const flagsWithDisabledDep = INITIAL_FEATURE_FLAGS.map((f) => {
        if (f.key === 'feat.cbt.instant_scoring') {
          return { ...f, lifecycle: 'disabled' as const, enabled: false };
        }
        if (f.key === 'feat.cbt.proctor_webcam') {
          return { ...f, enabled: true };
        }
        return f;
      });

      const result = evaluateEffectiveConfiguration(
        'feat.cbt.proctor_webcam',
        flagsWithDisabledDep,
        [],
        'org_001',
        'production',
        platformStore.getModules(),
        platformStore.getOrganizations(),
        platformStore.getSubscriptions(),
        platformStore.getPlans()
      );

      assert.equal(result.safeFailureState, true);
      assert.equal(result.effectiveValue, false);
      assert.equal(result.isDependencySatisfied, false);
      assert.ok(result.missingDependencies.includes('feat.cbt.instant_scoring'));
    });

    test('entitlement separation: feature flag cannot override missing subscription entitlement', () => {
      // Create a flag tied to a non-existent or unsubscribed module
      const flagWithModule: FeatureFlag = {
        id: 'flag_unlicensed',
        key: 'feat.premium.analytics',
        name: 'Deep AI Analytics',
        description: 'Predictive cohort attrition analysis',
        category: 'reporting',
        lifecycle: 'active',
        defaultValue: true,
        enabled: true,
        scope: 'global',
        environment: 'production',
        rolloutStrategy: 'all_tenants',
        risk: 'critical',
        owner: 'Analytics',
        dependsOnFlagKeys: [],
        sourceStatus: 'verified_local_mock',
        relatedModuleId: 'non_existent_unlicensed_module',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      const result = evaluateEffectiveConfiguration(
        flagWithModule.key,
        [flagWithModule],
        [],
        'org_001',
        'production',
        platformStore.getModules(),
        platformStore.getOrganizations(),
        platformStore.getSubscriptions(),
        platformStore.getPlans()
      );

      // Effective value must be false because organization is not licensed for the module
      assert.equal(result.safeFailureState, true);
      assert.equal(result.effectiveValue, false);
      assert.equal(result.isEntitlementSatisfied, false);
      assert.ok(result.entitlementNotice?.includes('not registered') || result.entitlementNotice?.includes('Unlicensed'));
    });
  });

  // ==========================================
  // 4. ROLLOUT PLANNING SIMULATOR
  // ==========================================
  describe('4. Rollout Planning Validation & Scope Estimation', () => {
    test('validates valid percentage rollout plan', () => {
      const plan: RolloutPlanInput = {
        flagKey: 'feat.cbt.instant_scoring',
        strategy: 'percentage_rollout',
        targetPercentage: 35,
        notes: 'Canary rollout to 35% of eligible organizations',
      };
      const report = validateRolloutPlan(plan, INITIAL_FEATURE_FLAGS, platformStore.getOrganizations());
      assert.equal(report.isValid, true);
      assert.equal(report.errors.length, 0);
    });

    test('rejects invalid rollout percentage (< 0 or > 100)', () => {
      const invalidHigh: RolloutPlanInput = {
        flagKey: 'feat.cbt.instant_scoring',
        strategy: 'percentage_rollout',
        targetPercentage: 105,
        notes: 'Invalid over 100',
      };
      const reportHigh = validateRolloutPlan(invalidHigh, INITIAL_FEATURE_FLAGS, platformStore.getOrganizations());
      assert.equal(reportHigh.isValid, false);
      assert.ok(reportHigh.errors.some((e) => e.includes('between 0 and 100')));
    });

    test('rejects rollout planning on archived flags', () => {
      const plan: RolloutPlanInput = {
        flagKey: 'feat.legacy.flash_player_reports', // archived in fixtures
        strategy: 'all_tenants',
        notes: 'Attempting rollout on archived flag',
      };
      const report = validateRolloutPlan(plan, INITIAL_FEATURE_FLAGS, platformStore.getOrganizations());
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('archived')));
    });

    test('validates scheduled rollout date consistency (start before end)', () => {
      const invalidDates: RolloutPlanInput = {
        flagKey: 'feat.cbt.instant_scoring',
        strategy: 'allowlist_schedule',
        scheduledStartDate: '2026-12-01',
        scheduledEndDate: '2026-06-01', // end before start!
        notes: 'Inverted dates test',
      };
      const report = validateRolloutPlan(invalidDates, INITIAL_FEATURE_FLAGS, platformStore.getOrganizations());
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('strictly after the start date') || e.includes('before')));
    });

    test('estimates rollout scope consistently based on mock dataset', () => {
      const flag = INITIAL_FEATURE_FLAGS.find((f) => f.key === 'feat.cbt.instant_scoring')!;
      const orgs = platformStore.getOrganizations();
      const summary = estimateRolloutScope(
        flag,
        'percentage_rollout',
        50,
        [],
        orgs
      );
      assert.equal(summary.isDemonstrationOnly, true);
      assert.equal(summary.eligibleTenantCount, orgs.length);
      assert.equal(summary.targetedTenantCount, Math.round(orgs.length * 0.5));
      assert.ok(summary.estimatedAffectedUsers > 0);
    });
  });

  // ==========================================
  // 5. CHANGE GOVERNANCE & APPROVAL WORKFLOW
  // ==========================================
  describe('5. Dual-Control Change Governance & Maker-Checker Lifecycle', () => {
    test('validates change proposal requires title and justification reason', () => {
      const invalidProp: Partial<ConfigurationChangeProposal> = {
        title: '',
        reason: '   ',
      };
      const report = validateChangeProposal(invalidProp);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('Proposal title is required')));
      assert.ok(report.errors.some((e) => e.includes('justification reason is required')));
    });

    test('creates and transitions change proposal through approval lifecycle', () => {
      const createRes = platformStore.createChangeProposal({
        title: 'Enable biometric webcam proctoring for trial exams',
        description: 'Trial activation proposal',
        reason: 'Secondary term accreditation test requirement',
        scope: 'feature_flag',
        targetEntity: 'CBT Proctor Webcam Feeds',
        targetId: 'feat.cbt.proctor_webcam',
        diff: [
          { field: 'enabled', previousValue: false, proposedValue: true },
        ],
      });

      assert.equal(createRes.success, true);
      assert.ok(createRes.proposal);
      const propId = createRes.proposal.id;
      assert.equal(createRes.proposal.status, 'draft');

      // Transition draft -> pending_review
      const step1 = platformStore.transitionProposalStatus(propId, 'pending_review');
      assert.equal(step1.success, true);
      assert.equal(step1.proposal?.status, 'pending_review');

      // Transition pending_review -> approved (Checker role)
      const step2 = platformStore.transitionProposalStatus(
        propId,
        'approved',
        'Approved after reviewing compliance safeguards',
        'Chief Security Reviewer'
      );
      assert.equal(step2.success, true);
      assert.equal(step2.proposal?.status, 'approved');
      assert.equal(step2.proposal?.reviewer?.name, 'Chief Security Reviewer');

      // Apply approved changes locally to store
      const step3 = platformStore.transitionProposalStatus(
        propId,
        'applied_locally',
        'Executed local store update'
      );
      assert.equal(step3.success, true);
      assert.equal(step3.proposal?.status, 'applied_locally');

      // Verify target flag in store was updated
      const updatedFlag = platformStore.getFeatureFlagByKey('feat.cbt.proctor_webcam');
      assert.equal(updatedFlag?.enabled, true);
    });

    test('rejected proposal cannot be applied', () => {
      const createRes = platformStore.createChangeProposal({
        title: 'Reject test proposal',
        description: 'Desc',
        reason: 'Test reason',
        scope: 'feature_flag',
        targetEntity: 'Some Flag',
        targetId: 'feat.cbt.instant_scoring',
        diff: [{ field: 'enabled', previousValue: true, proposedValue: false }],
      });
      const propId = createRes.proposal!.id;

      // Reject proposal
      platformStore.transitionProposalStatus(propId, 'rejected', 'Violates operational baseline');
      const prop = platformStore.getChangeProposals().find((p) => p.id === propId);
      assert.equal(prop?.status, 'rejected');

      // Flag should NOT be changed
      const flag = platformStore.getFeatureFlagByKey('feat.cbt.instant_scoring');
      assert.equal(flag?.enabled, true);
    });

    test('restoring prior version snapshot reverts local configuration and logs audit event', () => {
      // Initial version entries exist in fixtures
      const versionToRestore = platformStore.getConfigVersions().find((v) => v.canRestore);
      assert.ok(versionToRestore, 'Found a restorable version entry');

      const restoreRes = platformStore.restoreConfigVersion(
        versionToRestore.id,
        'Emergency Rollback Operator'
      );
      assert.equal(restoreRes.success, true);

      // Verify audit log has the RESTORE event
      const latestAudit = platformStore.getAuditEvents()[0];
      assert.equal(latestAudit.action, 'CONFIG_VERSION_RESTORED');
      assert.ok(latestAudit.details.includes(versionToRestore.id));
    });
  });

  // ==========================================
  // 6. ZERO-SECRET IMPORT & EXPORT
  // ==========================================
  describe('6. Zero-Secret Configuration Export & Import Validation', () => {
    test('recursively scrubs secret-like keys from objects', () => {
      const dangerousPayload = {
        appName: 'Edusync SMS',
        databasePassword: 'SUPER_SECRET_PLAINTEXT_PASSWORD',
        apiKey: 'sk_live_1234567890abcdef',
        nested: {
          jwtSecret: 'super-secret-jwt-signing-key',
          normalConfig: 42,
          auth_token: 'bearer_token_xyz',
        },
      };

      const sanitized = sanitizeObject(dangerousPayload);
      assert.equal(sanitized.appName, 'Edusync SMS');
      assert.equal((sanitized as any).databasePassword, undefined);
      assert.equal((sanitized as any).apiKey, undefined);
      assert.equal(sanitized.nested.jwtSecret, undefined);
      assert.equal(sanitized.nested.auth_token, undefined);
      assert.equal(sanitized.nested.normalConfig, 42);
    });

    test('exports safe configuration package with valid schema metadata and zero secrets', () => {
      const pkg = exportConfigurationPackage(
        INITIAL_EXTENDED_PLATFORM_SETTINGS,
        INITIAL_FEATURE_FLAGS,
        INITIAL_TENANT_OVERRIDES,
        'all',
        'Alexander Sterling'
      );

      assert.equal(pkg.schemaVersion, '1.0.0');
      assert.equal(pkg.isDemonstrationData, true);
      assert.equal(pkg.exportScope, 'all');
      assert.ok(pkg.settings);
      assert.ok(pkg.flags && pkg.flags.length > 0);
      assert.ok(pkg.overrides && pkg.overrides.length > 0);

      // Verify JSON serialization works cleanly
      const jsonStr = JSON.stringify(pkg);
      assert.ok(jsonStr.length > 100);
      assert.equal(jsonStr.includes('databasePassword'), false);
      assert.equal(jsonStr.includes('jwtSecret'), false);
    });

    test('pre-validates valid import package without mutating store state', () => {
      const validPkg: ConfigExportPackage = {
        schemaVersion: '1.0.0',
        exportedAt: new Date().toISOString(),
        exportedBy: 'Partner Admin',
        exportScope: 'flags_only',
        isDemonstrationData: true,
        flags: [
          {
            id: 'flag_imported_01',
            key: 'feat.cbt.new_pilot_flag',
            name: 'New Pilot Flag',
            description: 'Pilot test description',
            category: 'examinations_cbt',
            lifecycle: 'draft',
            defaultValue: false,
            enabled: false,
            scope: 'global',
            environment: 'development',
            rolloutStrategy: 'all_tenants',
            risk: 'standard',
          },
        ],
      };

      const report = validateImportPackage(validPkg);
      assert.equal(report.isValid, true);
      assert.equal(report.createCount, 1);
      assert.equal(report.errors.length, 0);

      // Verify store was NOT yet mutated
      const flagInStore = platformStore.getFeatureFlagByKey('feat.cbt.new_pilot_flag');
      assert.equal(flagInStore, undefined);
    });

    test('rejects import package with incompatible schema version', () => {
      const badVersionPkg = {
        schemaVersion: '99.0.0', // unsupported
        flags: [],
      };

      const report = validateImportPackage(badVersionPkg);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('schema version')));
    });

    test('detects and reports secret-like fields found in import payloads', () => {
      const maliciousPkg = {
        schemaVersion: '1.0.0',
        settings: {
          branding: {
            platformName: 'School SMS',
            apiSecretKey: 'RAW_PLAINTEXT_SECRET', // forbidden!
          },
        },
      };

      const report = validateImportPackage(maliciousPkg);
      assert.equal(report.isValid, false);
      assert.ok(report.errors.some((e) => e.includes('forbidden') || e.includes('rejected') || e.includes('Sensitive')));
    });
  });
});
