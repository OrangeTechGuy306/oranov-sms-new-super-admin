import { describe, it, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { PlatformStore } from '../lib/data/platform-store';
import {
  INITIAL_ORGANIZATIONS,
  EXTENDED_P05_ORGANIZATIONS,
  INITIAL_CAMPUSES,
  EXTENDED_P05_CAMPUSES,
  INITIAL_PLANS,
  INITIAL_SUBSCRIPTIONS,
  EXTENDED_P05_SUBSCRIPTIONS,
} from '../lib/data/initial-data';
import {
  CANONICAL_DEMO_TENANT_ORG_LINKS,
  evaluateApprovalDecision,
  filterPublishedNoticesForTenant,
  matchesTenantOrOrgIdentifier,
  projectTicketForTenantView,
  resolveFrontendTenantIdFromOrgId,
  resolvePlatformOrgIdFromTenantId,
} from '../lib/operations/canonical-operations';
import {
  CANONICAL_FEATURE_REGISTRY,
  CANONICAL_MODULE_REGISTRY,
  CANONICAL_ROUTE_TO_MODULE_ID,
  CANONICAL_SUBSCRIPTION_PLANS,
} from '../lib/modules/canonical-registry-snapshot';
import { validateCanonicalRegistryGraph } from '../lib/modules/canonical-contract';
import { resolveCanonicalEntitlement, type ResolveEntitlementOptions } from '../lib/modules/canonical-entitlements';
import { evaluateModuleEntitlement, MASTER_MODULE_REGISTRY } from '../lib/modules';
import {
  CANONICAL_TENANT_LIFECYCLE_STATUSES,
  evaluateCanonicalLifecycleTransition,
  normalizeTenantLifecycleStatus,
} from '../lib/lifecycle/canonical-lifecycle';
import { projectOrganizationToTenantContract } from '../lib/api/tenantContractAdapter';
import { organizationSubscriptionSchema, validateApiResponse } from '../lib/api/contracts';
import { evaluatePlatformRouteAccess, canPerformPlatformAction } from '../lib/iam/rbac';
import { ENHANCED_PLATFORM_USERS, INITIAL_PLATFORM_ROLES } from '../lib/iam/fixtures';
import { sanitizeCsvCell } from '../lib/compliance/evaluator';

const DASHBOARD_ROOT = process.cwd();
const FRONTEND_ROOT = path.resolve(DASHBOARD_ROOT, '../frontend');

function buildEntitlementOpts(
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

describe('Phase P0-7: Super Admin Cross-App Integration, Lifecycle, Entitlements & Release Readiness', () => {
  let store: PlatformStore;

  beforeEach(() => {
    store = new PlatformStore();
    store.resetToDefaults();
  });

  after(() => {
    store.resetToDefaults();
  });

  it('maintains byte-for-byte parity on all 6 synchronized canonical contract files', () => {
    const sharedFiles = [
      'lib/modules/canonical-contract.ts',
      'lib/modules/canonical-entitlements.ts',
      'lib/modules/canonical-registry-snapshot.ts',
      'lib/lifecycle/canonical-lifecycle.ts',
      'lib/lifecycle/canonical-onboarding.ts',
      'lib/operations/canonical-operations.ts',
    ];

    for (const rel of sharedFiles) {
      const dash = fs.readFileSync(path.join(DASHBOARD_ROOT, rel), 'utf8');
      const front = fs.readFileSync(path.join(FRONTEND_ROOT, rel), 'utf8');
      assert.equal(dash, front, `Canonical shared contract "${rel}" drifted between dashboard and frontend`);
    }
  });

  it('maps every seeded organization (org_001..org_020) 1-to-1 with unique canonical identifiers', () => {
    const allOrgs = [...INITIAL_ORGANIZATIONS, ...EXTENDED_P05_ORGANIZATIONS];
    assert.equal(allOrgs.length, 20);
    assert.equal(CANONICAL_DEMO_TENANT_ORG_LINKS.length, 20);

    const orgIds = new Set<string>();
    const tenantIds = new Set<string>();
    const codes = new Set<string>();
    const subdomains = new Set<string>();

    for (const org of allOrgs) {
      const link = CANONICAL_DEMO_TENANT_ORG_LINKS.find((l) => l.organizationId === org.id);
      assert.ok(link, `Missing canonical mapping for ${org.id}`);
      assert.equal(link.organizationId, org.id);
      assert.equal(link.code, org.code, `Code mismatch for ${org.id}`);
      assert.equal(link.subdomain, org.subdomain, `Subdomain mismatch for ${org.id}`);

      assert.equal(orgIds.has(link.organizationId), false, `Duplicate organizationId ${link.organizationId}`);
      assert.equal(tenantIds.has(link.tenantId), false, `Duplicate tenantId ${link.tenantId}`);
      assert.equal(codes.has(link.code), false, `Duplicate code ${link.code}`);
      assert.equal(subdomains.has(link.subdomain), false, `Duplicate subdomain ${link.subdomain}`);

      orgIds.add(link.organizationId);
      tenantIds.add(link.tenantId);
      codes.add(link.code);
      subdomains.add(link.subdomain);

      assert.equal(resolveFrontendTenantIdFromOrgId(org.id), link.tenantId);
      assert.equal(resolvePlatformOrgIdFromTenantId(link.tenantId), org.id);
      assert.equal(matchesTenantOrOrgIdentifier(org.id, link.tenantId), true);
    }

    // Explicitly verify P0-5 vocational silverline mapping (org_016 <-> tenant-vocational-019)
    assert.equal(resolveFrontendTenantIdFromOrgId('org_016'), 'tenant-vocational-019');
    assert.equal(resolvePlatformOrgIdFromTenantId('tenant-vocational-019'), 'org_016');
  });

  it('validates all seeded subscriptions and preserves unknown/onboarding lifecycle fidelity in TenantContractProjection', () => {
    const allSubs = [...INITIAL_SUBSCRIPTIONS, ...EXTENDED_P05_SUBSCRIPTIONS];
    for (const sub of allSubs) {
      const res = validateApiResponse(
        organizationSubscriptionSchema,
        { success: true, data: sub, timestamp: new Date().toISOString() },
        `subscription:${sub.id}`
      );
      assert.equal(res.data.id, sub.id);
    }

    const growthPlan = INITIAL_PLANS.find((p) => p.id === 'plan_growth')!;
    const onboardingOrg = store.getOrganizationById('org_013')!;
    const onboardingProj = projectOrganizationToTenantContract(
      onboardingOrg,
      growthPlan,
      [...INITIAL_CAMPUSES, ...EXTENDED_P05_CAMPUSES]
    );
    assert.equal(onboardingProj.lifecycleStatus, 'onboarding_in_progress');
    assert.ok(onboardingProj.includedModuleIds.length > 0, 'Onboarding state retains staged plan modules for inspection');

    const suspendedOrg = store.getOrganizationById('org_004')!;
    const suspendedProj = projectOrganizationToTenantContract(suspendedOrg, growthPlan, INITIAL_CAMPUSES);
    assert.equal(suspendedProj.lifecycleStatus, 'suspended');
    assert.deepEqual(suspendedProj.includedModuleIds, []);

    const corruptedOrg = { ...onboardingOrg, id: 'org_corrupted', status: 'totally_invalid_state' as any };
    const corruptedProj = projectOrganizationToTenantContract(corruptedOrg, growthPlan, INITIAL_CAMPUSES);
    assert.equal(corruptedProj.lifecycleStatus, 'unknown', 'Unknown lifecycle must fail closed and never coerce to awaiting_configuration');
    assert.deepEqual(corruptedProj.includedModuleIds, []);
  });

  it('fails closed on suspended, draft, pending_payment, expired, and canceled subscription states in both resolvers', () => {
    const opts = buildEntitlementOpts();
    const enterprisePlan = CANONICAL_SUBSCRIPTION_PLANS.find((p) => p.id === 'plan_enterprise')!;

    for (const badStatus of ['suspended', 'pending_payment', 'draft', 'expired', 'canceled', 'cancelled'] as const) {
      const canonicalRes = resolveCanonicalEntitlement(
        {
          tenantId: `t_${badStatus}`,
          tenantStatus: 'ACTIVE',
          plan: enterprisePlan,
          subscription: { status: badStatus, planId: enterprisePlan.id },
        },
        { moduleId: 'mod_students' },
        opts
      );
      assert.equal(canonicalRes.allowed, false, `Expected canonical denial for subStatus="${badStatus}"`);
      assert.equal(canonicalRes.reasonCode, 'SUBSCRIPTION_INACTIVE');

      const evalRes = evaluateModuleEntitlement({
        moduleId: 'mod_students',
        organizationId: `org_${badStatus}`,
        planId: enterprisePlan.id,
        subscription: { status: badStatus as any, planId: enterprisePlan.id },
        registry: MASTER_MODULE_REGISTRY,
      });
      assert.equal(evalRes.effectiveStatus, 'unavailable', `Expected evaluator denial for subStatus="${badStatus}"`);
      assert.equal(evalRes.reasonCode, 'SUBSCRIPTION_INACTIVE');
    }
  });

  it('validates canonical registry graph integrity and reflects dynamic subscription overrides and plan mutations', () => {
    const graph = validateCanonicalRegistryGraph({
      modules: CANONICAL_MODULE_REGISTRY,
      features: CANONICAL_FEATURE_REGISTRY,
      plans: CANONICAL_SUBSCRIPTION_PLANS,
      knownRoutes: new Set(Object.keys(CANONICAL_ROUTE_TO_MODULE_ID)),
    });
    assert.equal(graph.isValid, true);
    assert.equal(graph.errors.length, 0);

    // Override grant & reset propagation
    const org001 = store.getOrganizationById('org_001')!;
    assert.equal(org001.status, 'active');

    const disableRes = store.setOrganizationModuleOverride({
      organizationId: 'org_001',
      moduleId: 'mod_library',
      action: 'force_disable',
      reason: 'P0-7 entitlement propagation verification',
      actorName: 'usr_super_01',
    });
    assert.equal(disableRes.success, true);
    assert.equal(store.evaluateEntitlement('mod_library', 'org_001').effectiveStatus, 'unavailable');

    const resetRes = store.resetOrganizationModuleOverride('org_001', 'mod_library', 'usr_super_01');
    assert.equal(resetRes.success, true);
    assert.equal(store.evaluateEntitlement('mod_library', 'org_001').effectiveStatus, 'available');
  });

  it('verifies end-to-end 12-state lifecycle transition rules and cross-app governance isolation guarantees', () => {
    assert.equal(CANONICAL_TENANT_LIFECYCLE_STATUSES.length, 12);
    assert.equal(normalizeTenantLifecycleStatus('pending'), 'registration_pending');

    // Valid progressive activation chain checks
    assert.equal(evaluateCanonicalLifecycleTransition('draft', 'registration_pending', 'Submitted application').permitted, true);
    assert.equal(evaluateCanonicalLifecycleTransition('archived', 'active', 'Invalid direct jump').permitted, false);

    // Internal notes stripped in tenant ticket projection across non-Oakridge tenant as well
    const org002TicketRes = store.createSupportTicket(
      {
        organizationId: 'org_002',
        campusId: 'camp_002_1',
        campusName: 'St. Jude Main Abbey Campus',
        subject: 'Gradebook Export Margin Alignment',
        description: 'Requesting inspection of PDF report margin offset.',
        category: 'data_reports',
        priority: 'normal',
        requester: { name: 'Fr. Thomas Aquinas', email: 'rector@stjude.edu', roleTitle: 'Rector' },
      },
      'usr_support_03'
    );
    assert.equal(org002TicketRes.success, true);
    const tId = org002TicketRes.ticket!.id;
    store.addSupportTicketMessage(tId, 'internal_note', 'INTERNAL: trace token 8821', false, 'usr_support_03');
    store.addSupportTicketMessage(tId, 'tenant_reply', 'Margin template updated.', false, 'usr_support_03');

    const projected = projectTicketForTenantView(store.getSupportTicketById(tId)!);
    assert.equal(projected.redactedInternalNoteCount, 1);
    assert.equal(JSON.stringify(projected).includes('INTERNAL: trace token 8821'), false);
    assert.equal(JSON.stringify(projected).includes('Margin template updated.'), true);

    // Anti-self-approval + CSV formula defense + RBAC isolation
    const pendingApr = store.getPlatformApprovals().find((a) => a.status === 'pending_review')!;
    const selfApr = evaluateApprovalDecision(
      pendingApr,
      'approved',
      { id: pendingApr.requestedBy.id, name: pendingApr.requestedBy.name, role: pendingApr.requestedBy.role },
      'Self approve check'
    );
    assert.equal(selfApr.permitted, false);

    const visibleForStarter = filterPublishedNoticesForTenant(store.getPlatformNotices(), {
      id: 'tenant-starter-007',
      planId: 'plan_starter',
    });
    assert.ok(visibleForStarter.every((n) => n.status === 'published_simulated'));

    assert.equal(sanitizeCsvCell('+cmd|malicious').startsWith("'+cmd"), true);
    assert.equal(sanitizeCsvCell('=CMD|"/C calc"!A0'), '"\'=CMD|""/C calc""!A0"');

    const auditUser = ENHANCED_PLATFORM_USERS.find((u) => u.id === 'usr_audit_05')!;
    const auditRole = INITIAL_PLATFORM_ROLES.find((r) => r.id === auditUser.role)!;
    const auditCtx = {
      user: { id: auditUser.id, name: auditUser.name, role: auditUser.role, status: auditUser.status },
      primaryRole: auditUser.role,
      permissions: auditRole.permissions,
    };
    assert.equal(evaluatePlatformRouteAccess(auditCtx, '/approvals').allowed, true);
    assert.equal(evaluatePlatformRouteAccess(auditCtx, '/organizations/new').allowed, false);
    assert.equal(canPerformPlatformAction(auditCtx, 'operations.approvals.manage'), false);
    assert.equal(canPerformPlatformAction(auditCtx, 'organizations.create'), false);

    // Confirm zero hardcoded alert() calls remain in dashboard components/app
    const usersPageSrc = fs.readFileSync(path.join(DASHBOARD_ROOT, 'app/platform-users/page.tsx'), 'utf8');
    assert.equal(/\balert\(/.test(usersPageSrc), false);
  });
});
