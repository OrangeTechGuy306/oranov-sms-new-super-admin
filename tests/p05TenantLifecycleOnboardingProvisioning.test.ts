import { describe, it, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  CANONICAL_TENANT_LIFECYCLE_STATUSES,
  evaluateCanonicalLifecycleTransition,
  getAvailableCanonicalTransitions,
  getTenantLifecycleStateMeta,
  normalizeTenantLifecycleStatus,
} from '../lib/lifecycle/canonical-lifecycle';
import { evaluateOnboardingChecklist } from '../lib/lifecycle/canonical-onboarding';
import { executeSimulatedProvisioning } from '../lib/provisioning/simulator';
import { evaluateOrganizationReadiness } from '../lib/readiness/evaluator';
import {
  mapOrganizationStatusToTenantStatus,
  mapPlatformCampusStatusToTenantStatus,
  projectOrganizationToTenantContract,
} from '../lib/api/tenantContractAdapter';
import { campusSchema, organizationSchema, validateApiResponse } from '../lib/api/contracts';
import {
  EXTENDED_P05_CAMPUSES,
  EXTENDED_P05_ORGANIZATIONS,
  INITIAL_CAMPUSES,
  INITIAL_ORGANIZATIONS,
  INITIAL_PLANS,
} from '../lib/data/initial-data';
import { PlatformStore } from '../lib/data/platform-store';
import { registrationIdentitySchema, registrationClassificationSchema } from '../lib/validations/organizationRegistration';

const DASHBOARD_ROOT = process.cwd();
const FRONTEND_ROOT = path.resolve(DASHBOARD_ROOT, '../frontend');

describe('Phase P0-5: Tenant Lifecycle, Onboarding, Provisioning & Campus Parity', () => {
  let store: PlatformStore;

  beforeEach(() => {
    store = new PlatformStore();
    store.resetToDefaults();
  });

  after(() => {
    store.resetToDefaults();
  });

  it('maintains byte-for-byte parity on shared canonical lifecycle & onboarding modules across both apps', () => {
    for (const rel of [
      'lib/lifecycle/canonical-lifecycle.ts',
      'lib/lifecycle/canonical-onboarding.ts',
      'lib/modules/canonical-contract.ts',
      'lib/modules/canonical-entitlements.ts',
    ]) {
      const dash = fs.readFileSync(path.join(DASHBOARD_ROOT, rel), 'utf8');
      const front = fs.readFileSync(path.join(FRONTEND_ROOT, rel), 'utf8');
      assert.equal(dash, front, `Shared canonical file "${rel}" diverged`);
    }
  });

  it('models all 12 canonical lifecycle states and fails safely on unknown states', () => {
    assert.equal(CANONICAL_TENANT_LIFECYCLE_STATUSES.length, 12);

    assert.equal(normalizeTenantLifecycleStatus('pending'), 'registration_pending');
    assert.equal(normalizeTenantLifecycleStatus('inactive'), 'awaiting_configuration');
    assert.equal(normalizeTenantLifecycleStatus('canceled'), 'cancelled');
    assert.equal(normalizeTenantLifecycleStatus('garbage_status'), 'unknown');
    assert.equal(normalizeTenantLifecycleStatus(null), 'unknown');

    assert.deepEqual(getAvailableCanonicalTransitions('unknown_xyz'), []);
    assert.deepEqual(getAvailableCanonicalTransitions('closed'), []);

    const unknownEval = evaluateCanonicalLifecycleTransition('mystery_state', 'active');
    assert.equal(unknownEval.permitted, false);
    assert.equal(unknownEval.unknownState, true);

    const unknownMeta = getTenantLifecycleStateMeta('mystery_state');
    assert.equal(unknownMeta.accessBehavior, 'unknown_safe_lock');
    assert.equal(unknownMeta.isOperationalAccessAllowed, false);
  });

  it('enforces transition prerequisites, confirmation codes for terminal closure, and separates billing from lifecycle', () => {
    // Blocked by readiness prerequisites when context is supplied
    const blockedActivate = evaluateCanonicalLifecycleTransition(
      'awaiting_activation',
      'active',
      undefined,
      { readinessHasBlockers: true, readinessBlockers: ['Campuses & Multi-Branch Structure'] }
    );
    assert.equal(blockedActivate.permitted, false);
    assert.ok(blockedActivate.failedPrerequisites?.length);

    // Permanent closure requires org code match + >= 10 char justification
    const wrongCode = evaluateCanonicalLifecycleTransition(
      'cancelled',
      'closed',
      'Permanent district dissolution closure',
      { confirmationCode: 'WRONG', expectedConfirmationCode: 'HERITAGE' }
    );
    assert.equal(wrongCode.permitted, false);

    const validClose = evaluateCanonicalLifecycleTransition(
      'cancelled',
      'closed',
      'Permanent district dissolution closure approved by board',
      { confirmationCode: 'HERITAGE', expectedConfirmationCode: 'HERITAGE' }
    );
    assert.equal(validClose.permitted, true);
    assert.equal(validClose.rule?.auditEventAction, 'ORGANIZATION_CLOSED');

    // Active tenant with expired subscription remains distinct from suspended in fixture & projection
    const activeExpiredOrg = store.getOrganizationById('org_017');
    assert.ok(activeExpiredOrg);
    assert.equal(activeExpiredOrg?.status, 'active');
    assert.equal(activeExpiredOrg?.subscriptionStatus, 'expired');

    const proj = projectOrganizationToTenantContract(
      activeExpiredOrg!,
      INITIAL_PLANS[0],
      store.getCampusesByOrgId('org_017')
    );
    assert.equal(proj.lifecycleStatus, 'active');
    assert.equal(proj.subscriptionStatus, 'expired');
    assert.equal(proj.status, 'ACTIVE');
  });

  it('validates all seeded organizations & campuses against Zod contracts without dropping planned/suspended campuses', () => {
    for (const org of [...INITIAL_ORGANIZATIONS, ...EXTENDED_P05_ORGANIZATIONS]) {
      const res = validateApiResponse(
        organizationSchema,
        { success: true, data: org, timestamp: new Date().toISOString() },
        `org:${org.id}`
      );
      assert.equal(res.data.id, org.id);
    }

    for (const campus of [...INITIAL_CAMPUSES, ...EXTENDED_P05_CAMPUSES]) {
      const res = validateApiResponse(
        campusSchema,
        { success: true, data: campus, timestamp: new Date().toISOString() },
        `campus:${campus.id}`
      );
      assert.equal(res.data.id, campus.id);
    }

    assert.equal(mapPlatformCampusStatusToTenantStatus('suspended'), 'SUSPENDED');
    assert.equal(mapOrganizationStatusToTenantStatus('cancellation_pending'), 'ACTIVE');
    assert.equal(mapOrganizationStatusToTenantStatus('cancelled'), 'INACTIVE');
  });

  it('computes adaptable onboarding checklist percentages dynamically by school category without hardcoded scores', () => {
    const nurserySummary = evaluateOnboardingChecklist({
      institutionCategories: ['nursery'],
      organizationName: 'Maplewood Nursery',
      organizationCode: 'MEY',
      organizationEmail: 'care@maplewood.org',
      organizationPhone: '+15553112299',
      organizationCountry: 'United States',
      hasClassification: true,
      campusCount: 1,
      hasMainCampus: true,
      sessionsCount: 1,
      termsCount: 3,
      classesOrProgrammesCount: 4,
      subjectsOrModulesCount: 0,
      primaryAdminName: 'Hannah',
      primaryAdminEmail: 'hannah@maplewood.org',
      hasPlanAssigned: true,
      settingsReviewed: true,
    });

    // Nursery does not force formal exam subjects as applicable/mandatory
    const subjectsItem = nurserySummary.items.find((i) => i.id === 'subjects_configured');
    assert.equal(subjectsItem?.applicable, false);
    assert.equal(nurserySummary.isMandatoryComplete, true);

    const vocationalSummary = evaluateOnboardingChecklist({
      institutionCategories: ['vocational'],
      organizationName: 'Silverline Trade',
      organizationCode: 'SCTI',
      organizationEmail: 'info@silverline.edu',
      organizationPhone: '+15554029910',
      organizationCountry: 'United States',
      hasClassification: true,
      campusCount: 1,
      hasMainCampus: true,
      sessionsCount: 1,
      termsCount: 2,
      classesOrProgrammesCount: 5,
      subjectsOrModulesCount: 0,
      primaryAdminName: 'Chef Marco',
      primaryAdminEmail: 'marco@silverline.edu',
      hasPlanAssigned: true,
      settingsReviewed: false,
      skippedItemIds: ['subjects_configured', 'branding_configured'],
    });
    const classesVoc = vocationalSummary.items.find((i) => i.id === 'classes_or_programmes_configured');
    assert.match(classesVoc?.title || '', /vocational programmes/i);
    assert.equal(vocationalSummary.skippedCount, 2);
  });

  it('executes honest 8-stage business provisioning simulation supporting failure, retry, and manual review without infrastructure fiction', () => {
    const org = store.getOrganizationById('org_015')!;
    const campuses = store.getCampusesByOrgId(org.id);
    const plan = store.getPlans().find((p) => p.id === org.planId);
    const subscription = store.getSubscriptionByOrgId(org.id);
    const readiness = evaluateOrganizationReadiness({ organization: org, campuses, plan, subscription });

    const manualReview = executeSimulatedProvisioning({
      organization: org,
      readiness,
      campuses,
      plan,
      subscription,
      markForManualReview: true,
    });
    assert.equal(manualReview.success, true);
    assert.equal(manualReview.status, 'ready_for_review');
    assert.equal(manualReview.manualReviewRequired, true);
    assert.equal(manualReview.events.length, 8);
    assert.equal(manualReview.events.some((e) => /database|rls|dns/i.test(e.stepName)), false);

    // Fail on stage 5 then retry cleanly via store
    const failRun = store.runSimulatedProvisioning(org.id, {
      forceFail: true,
      forceFailStageKey: 'subscription_assigned',
    });
    assert.equal(failRun.success, false);
    assert.equal(failRun.status, 'simulated_failed');

    const retryRun = store.runSimulatedProvisioning(org.id, { forceFail: false, attempt: 2 });
    assert.equal(retryRun.success, true);
    assert.equal(retryRun.status, 'simulated_complete');
  });

  it('supports combined institution categories & draft creation in registration schema and store', () => {
    const idParsed = registrationIdentitySchema.safeParse({
      name: 'Combined Horizon Schools',
      legalName: 'Combined Horizon Education Foundation',
      code: 'COMBO01',
      organizationType: 'network',
      subdomain: 'combined-horizon',
    });
    assert.equal(idParsed.success, true);

    const catParsed = registrationClassificationSchema.safeParse({
      classification: 'combined',
      institutionCategories: ['nursery', 'primary', 'secondary'],
    });
    assert.equal(catParsed.success, true);

    const draftRes = store.createOrganization({
      name: 'Draft Nursery & Primary',
      legalName: 'Draft Foundation Ltd.',
      code: 'DRAFTNP',
      organizationType: 'private',
      classification: 'combined',
      institutionCategories: ['nursery', 'primary'],
      subdomain: 'draft-np',
      initialLifecycleStatus: 'draft',
      contact: {
        email: 'contact@draft-np.edu',
        phone: '+1 555 000 1234',
        address: '10 Oak St',
        city: 'Austin',
        stateOrProvince: 'TX',
        country: 'United States',
      },
      administrator: {
        name: 'Elena Brooks',
        email: 'elena@draft-np.edu',
        phone: '+1 555 000 1235',
        roleTitle: 'Director',
      },
      planId: 'plan_growth',
      billingCycle: 'annual',
      startTrial: false,
      technicalConfig: {
        subdomain: 'draft-np',
        timezone: 'America/Chicago',
        academicYearStartMonth: 9,
        currency: 'USD',
        locale: 'en-US',
        maxCampuses: 2,
      },
    });
    assert.equal(draftRes.success, true);
    assert.equal(draftRes.organization?.status, 'draft');
    assert.deepEqual(draftRes.organization?.institutionCategories, ['nursery', 'primary']);
  });
});
