import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { PlatformStore } from '../lib/data/platform-store';
import { evaluateLifecycleTransition, getAvailableTransitions } from '../lib/lifecycle/evaluator';
import { evaluateOrganizationReadiness } from '../lib/readiness/evaluator';
import { executeSimulatedProvisioning } from '../lib/provisioning/simulator';
import { Organization } from '../lib/types/organizations';

describe('Phase E-09.7 Tenant Lifecycle, Campuses & Provisioning Control', () => {
  let store: PlatformStore;

  beforeEach(() => {
    store = new PlatformStore();
    store.resetToDefaults();
  });

  describe('1. Organization Lifecycle State Machine', () => {
    test('permits valid transitions from pending to active with automatic approval reason', () => {
      const evaluation = evaluateLifecycleTransition('pending', 'active');

      assert.equal(evaluation.permitted, true);
      assert.equal(evaluation.reasonRequired, false);
      assert.ok(evaluation.rule);
      assert.equal(evaluation.rule?.actionLabel, 'Approve & Activate');
    });

    test('permits active to suspended when a valid mandatory justification (min 5 chars) is provided', () => {
      const withValidReason = evaluateLifecycleTransition(
        'active',
        'suspended',
        'Payment defaulted for 60 consecutive days after dunning notice'
      );

      assert.equal(withValidReason.permitted, true);
      assert.equal(withValidReason.reasonRequired, true); // Rule requires reason
    });

    test('rejects transition to suspended if reason is missing or under 5 characters', () => {
      const missingReason = evaluateLifecycleTransition('active', 'suspended');
      assert.equal(missingReason.permitted, false);
      assert.equal(missingReason.reasonRequired, true);
      assert.match(missingReason.error || '', /mandatory/i);

      const shortReason = evaluateLifecycleTransition('active', 'suspended', 'fail');
      assert.equal(shortReason.permitted, false);
      assert.equal(shortReason.reasonRequired, true);
      assert.match(shortReason.error || '', /min 5 characters/i);
    });

    test('permits reactivation from suspended back to active', () => {
      const evaluation = evaluateLifecycleTransition(
        'suspended',
        'active',
        'Trustee audit resolved and outstanding invoice settled'
      );

      assert.equal(evaluation.permitted, true);
      assert.equal(evaluation.rule?.actionLabel, 'Reactivate Operations');
    });

    test('permits transition from suspended to archived with mandatory audit justification', () => {
      const evaluation = evaluateLifecycleTransition(
        'suspended',
        'archived',
        'School permanently closed operations and dissolved corporate charter'
      );

      assert.equal(evaluation.permitted, true);
      assert.equal(evaluation.rule?.variant, 'danger');
    });

    test('strictly rejects unsupported lifecycle transitions with clear human-readable error', () => {
      // Pending directly to suspended (illegal: must be activated first or rejected)
      const pendingToSuspended = evaluateLifecycleTransition(
        'pending',
        'suspended',
        'Premature suspension'
      );
      assert.equal(pendingToSuspended.permitted, false);
      assert.match(pendingToSuspended.error || '', /invalid lifecycle transition/i);

      // Archived directly to active (illegal: archived records are terminal or must go to inactive first)
      const archivedToActive = evaluateLifecycleTransition('archived', 'active');
      assert.equal(archivedToActive.permitted, false);
      assert.match(archivedToActive.error || '', /invalid lifecycle transition/i);
    });

    test('getAvailableTransitions returns correct allowed action descriptors for given status', () => {
      const activeTransitions = getAvailableTransitions('active');
      assert.ok(activeTransitions.length >= 2);
      assert.ok(activeTransitions.some((t) => t.to === 'suspended'));
      assert.ok(activeTransitions.some((t) => t.to === 'archived'));

      const draftTransitions = getAvailableTransitions('draft');
      assert.ok(draftTransitions.some((t) => t.to === 'pending'));

      const archivedTransitions = getAvailableTransitions('archived');
      assert.equal(archivedTransitions.length, 1, 'Archived status allows restoring to inactive review only');
      assert.equal(archivedTransitions[0].to, 'inactive');
    });

    test('store executes setOrganizationStatus and updates audit logs', () => {
      const org = store.getOrganizations().find((o) => o.status === 'active');
      assert.ok(org, 'Must have active test organization');

      const res = store.setOrganizationStatus(
        org.id,
        'suspended',
        'Administrative compliance audit underway'
      );
      assert.equal(res.success, true);

      const updated = store.getOrganizationById(org.id);
      assert.equal(updated?.status, 'suspended');
      assert.equal(updated?.suspendedReason, 'Administrative compliance audit underway');

      const audits = store.getAuditEvents({ category: 'organization_lifecycle' });
      assert.ok(audits.some((a) => a.targetId === org.id && a.action === 'ORGANIZATION_STATUS_CHANGED'));
    });
  });

  describe('2. Multi-Campus & Branch Governance', () => {
    test('initializes store with pre-populated campuses across organizations', () => {
      const campuses = store.getCampuses();
      assert.ok(campuses.length >= 15, 'Should load initial multi-tenant campus fixtures');

      // Every organization should have at least one main campus
      const orgs = store.getOrganizations();
      for (const org of orgs) {
        const orgCampuses = store.getCampusesByOrgId(org.id);
        assert.ok(orgCampuses.length >= 1, `Org ${org.id} must have at least one campus`);
        const mainCampus = orgCampuses.find((c) => c.isMainCampus);
        assert.ok(mainCampus, `Org ${org.id} must have a designated main campus`);
      }
    });

    test('creates new campus successfully within campus quota', () => {
      const org = store.getOrganizations()[0];
      const initialCount = store.getCampusesByOrgId(org.id).length;

      const res = store.createCampus({
        organizationId: org.id,
        name: 'Science & Robotics Extension Facility',
        code: 'SCI-EXT',
        type: 'specialized',
        address: { city: 'Cambridge', country: 'United States' },
        studentCapacity: 350,
      });

      assert.equal(res.success, true);
      assert.ok(res.campus);
      assert.equal(res.campus?.organizationId, org.id);
      assert.equal(res.campus?.code, 'SCI-EXT');
      assert.equal(res.campus?.isMainCampus, false);

      const newCount = store.getCampusesByOrgId(org.id).length;
      assert.equal(newCount, initialCount + 1);
    });

    test('rejects campus creation if organization does not exist', () => {
      const res = store.createCampus({
        organizationId: 'org_non_existent_id',
        name: 'Ghost Campus',
        code: 'GHOST',
        address: { city: 'Nowhere' },
      });

      assert.equal(res.success, false);
      assert.match(res.error || '', /does not exist/i);
    });

    test('rejects duplicate campus code within the same organization', () => {
      const org = store.getOrganizations()[0];
      const existing = store.getCampusesByOrgId(org.id)[0];

      const res = store.createCampus({
        organizationId: org.id,
        name: 'Duplicate Campus Name',
        code: existing.code,
        address: { city: 'Chicago' },
      });

      assert.equal(res.success, false);
      assert.match(res.error || '', /already in use/i);
    });

    test('permits identical campus code across different organizations', () => {
      const orgs = store.getOrganizations();
      assert.ok(orgs.length >= 2);

      const orgA = orgs[0];
      const orgB = orgs[1];

      store.createCampus({
        organizationId: orgA.id,
        name: 'North Campus A',
        code: 'NORTH',
        address: { city: 'Boston' },
      });

      const resB = store.createCampus({
        organizationId: orgB.id,
        name: 'North Campus B',
        code: 'NORTH',
        address: { city: 'Denver' },
      });

      assert.equal(resB.success, true, 'Same code across distinct organizations must be permitted');
    });

    test('setMainCampus updates designation and ensures single main campus constraint', () => {
      const org = store.getOrganizations()[0];

      // Add second campus
      const created = store.createCampus({
        organizationId: org.id,
        name: 'Secondary City Branch',
        code: 'SEC-CITY',
        address: { city: 'Metropolis' },
      });
      assert.ok(created.campus);

      // Designate second campus as main campus
      const res = store.setMainCampus(org.id, created.campus.id);
      assert.equal(res.success, true);

      const campuses = store.getCampusesByOrgId(org.id);
      const mainCampuses = campuses.filter((c) => c.isMainCampus);
      assert.equal(mainCampuses.length, 1, 'Only exactly 1 campus must be designated as main');
      assert.equal(mainCampuses[0].id, created.campus.id);
    });

    test('prevents deleting the designated main campus when other campuses exist', () => {
      const org = store.getOrganizations()[0];
      const campuses = store.getCampusesByOrgId(org.id);
      assert.ok(campuses.length >= 2, 'Seeded test org should have at least 2 campuses');

      const mainCampus = campuses.find((c) => c.isMainCampus);
      assert.ok(mainCampus, 'Must find main campus');

      const deleteRes = store.deleteCampus(mainCampus.id);
      assert.equal(deleteRes.success, false);
      assert.match(deleteRes.error || '', /cannot delete the designated main campus/i);
    });

    test('deletes secondary campus cleanly and updates store', () => {
      const org = store.getOrganizations()[0];
      const created = store.createCampus({
        organizationId: org.id,
        name: 'Temporary Lab Campus',
        code: 'TEMP-LAB',
        address: { city: 'Austin' },
      });
      assert.ok(created.campus);

      const res = store.deleteCampus(created.campus.id);
      assert.equal(res.success, true);

      const found = store.getCampusById(created.campus.id);
      assert.equal(found, undefined);
    });
  });

  describe('3. Configuration Readiness Checklist Evaluator', () => {
    test('evaluates comprehensive 8-item readiness checklist for complete organization', () => {
      const org = store.getOrganizations()[0];
      const campuses = store.getCampusesByOrgId(org.id);
      const plan = store.getPlans().find((p) => p.id === org.planId);
      const subscription = store.getSubscriptionByOrgId(org.id);

      const report = evaluateOrganizationReadiness({
        organization: org,
        campuses,
        plan,
        subscription,
      });

      assert.equal(report.organizationId, org.id);
      assert.equal(report.totalCount, 8);
      assert.ok(report.completedCount >= 7, 'Active seeded org should clear most or all readiness checks');
      assert.ok(report.score >= 80, 'Score should be high for verified seeded organization');
      assert.equal(report.hasBlockers, false);

      // Verify specific check IDs exist
      const ids = report.items.map((i) => i.id);
      assert.ok(ids.includes('profile_identity'));
      assert.ok(ids.includes('admin_contact'));
      assert.ok(ids.includes('campuses_registered'));
      assert.ok(ids.includes('subscription_assigned'));
      assert.ok(ids.includes('module_entitlements'));
      assert.ok(ids.includes('technical_regional'));
      assert.ok(ids.includes('domain_readiness'));
      assert.ok(ids.includes('resource_allocation'));
    });

    test('flags blocker when campuses are completely missing', () => {
      const org: Organization = {
        ...store.getOrganizations()[0],
        id: 'org_no_campuses',
      };

      const report = evaluateOrganizationReadiness({
        organization: org,
        campuses: [], // Empty campus list
      });

      const campusCheck = report.items.find((i) => i.id === 'campuses_registered');
      assert.ok(campusCheck);
      assert.equal(campusCheck?.status, 'incomplete');
      assert.equal(report.hasBlockers, true);
      assert.match(campusCheck?.reason || '', /no campus/i);
    });

    test('flags attention when contact coordinates are incomplete', () => {
      const incompleteOrg: Organization = {
        ...store.getOrganizations()[0],
        id: 'org_incomplete',
        contact: {
          email: '',
          phone: '',
          address: '',
          city: '',
          stateOrProvince: '',
          country: '',
        },
      };

      const report = evaluateOrganizationReadiness({
        organization: incompleteOrg,
        campuses: store.getCampusesByOrgId(incompleteOrg.id),
      });

      const adminCheck = report.items.find((i) => i.id === 'admin_contact');
      assert.ok(adminCheck);
      assert.equal(adminCheck?.status, 'attention');
    });
  });

  describe('4. Simulated Tenant Provisioning Engine', () => {
    test('blocks provisioning execution if readiness prerequisites have blockers', () => {
      const brokenOrg: Organization = {
        ...store.getOrganizations()[0],
        id: 'org_blocked',
      };

      const readiness = evaluateOrganizationReadiness({
        organization: brokenOrg,
        campuses: [], // No campuses = blocker
      });

      const res = executeSimulatedProvisioning({
        organization: brokenOrg,
        readiness,
        campuses: [],
      });

      assert.equal(res.success, false);
      assert.equal(res.status, 'needs_attention');
      assert.match(res.error || '', /prerequisite/i);
    });

    test('executes 5-step simulation cleanly and returns simulated_complete', () => {
      const org = store.getOrganizations()[0];
      const campuses = store.getCampusesByOrgId(org.id);
      const plan = store.getPlans().find((p) => p.id === org.planId);
      const subscription = store.getSubscriptionByOrgId(org.id);

      const readiness = evaluateOrganizationReadiness({
        organization: org,
        campuses,
        plan,
        subscription,
      });

      const res = executeSimulatedProvisioning({
        organization: org,
        readiness,
        campuses,
      });

      assert.equal(res.success, true);
      assert.equal(res.status, 'simulated_complete');
      assert.equal(res.events.length, 5);

      const stepKeys = res.events.map((e) => e.stepKey);
      assert.deepEqual(stepKeys, [
        'dns_routing',
        'db_container',
        'campus_link',
        'module_catalog',
        'admin_dispatch',
      ]);
    });

    test('supports deterministic failure simulation for negative testing', () => {
      const org = store.getOrganizations()[0];
      const campuses = store.getCampusesByOrgId(org.id);
      const plan = store.getPlans().find((p) => p.id === org.planId);
      const subscription = store.getSubscriptionByOrgId(org.id);

      const readiness = evaluateOrganizationReadiness({
        organization: org,
        campuses,
        plan,
        subscription,
      });

      const res = executeSimulatedProvisioning({
        organization: org,
        readiness,
        campuses,
        forceFail: true,
      });

      assert.equal(res.success, false);
      assert.equal(res.status, 'simulated_failed');
      assert.match(res.error || '', /simulated provisioning failure/i);

      const failedEvent = res.events.find((e) => e.status === 'failed');
      assert.ok(failedEvent, 'Must include failed event record');
    });

    test('store executes simulated provisioning and persists state changes', () => {
      const org = store.getOrganizations()[0];

      const simRes = store.runSimulatedProvisioning(org.id);
      assert.equal(simRes.success, true);
      assert.equal(simRes.status, 'simulated_complete');

      const updated = store.getOrganizationById(org.id);
      assert.equal(updated?.provisioningStatus, 'simulated_complete');

      const events = store.getSimulatedEvents(org.id);
      assert.ok(events.length >= 5);
    });

    test('store resets simulated provisioning back to not_started', () => {
      const org = store.getOrganizations()[0];
      store.runSimulatedProvisioning(org.id);

      const resetRes = store.resetSimulatedProvisioning(org.id);
      assert.equal(resetRes.success, true);

      const updated = store.getOrganizationById(org.id);
      assert.equal(updated?.provisioningStatus, 'not_started');
    });
  });

  describe('5. Onboarding Wizard & Referential Integration', () => {
    test('creates organization with initialCampus and automatically creates campus entity', () => {
      const initialOrgCount = store.getOrganizations().length;
      const initialCampusCount = store.getCampuses().length;

      const res = store.createOrganization({
        name: 'Edison STEM Institute',
        code: 'EDISON',
        classification: 'secondary',
        subdomain: 'edison-stem',
        contact: {
          email: 'admin@edison-stem.edu',
          phone: '+1 555 444 3322',
          address: '400 Innovation Blvd',
          city: 'San Jose',
          stateOrProvince: 'CA',
          country: 'United States',
        },
        administrator: {
          name: 'Dr. Thomas Vance',
          email: 't.vance@edison-stem.edu',
          phone: '+1 555 444 3323',
          roleTitle: 'Director of Academic Affairs',
        },
        initialCampus: {
          name: 'Edison Innovation Main Campus',
          code: 'EDISON-MAIN',
          street: '400 Innovation Blvd',
          city: 'San Jose',
          stateOrProvince: 'CA',
          country: 'United States',
          studentCapacity: 600,
        },
        planId: 'plan_growth',
        billingCycle: 'annual',
        technicalConfig: {
          subdomain: 'edison-stem',
          timezone: 'America/Los_Angeles',
          academicYearStartMonth: 9,
          currency: 'USD',
          locale: 'en-US',
          maxCampuses: 3,
        },
      });

      assert.equal(res.success, true);
      assert.ok(res.organization);
      assert.equal(store.getOrganizations().length, initialOrgCount + 1);
      assert.equal(store.getCampuses().length, initialCampusCount + 1);

      // Verify the initial campus was registered correctly
      const orgCampuses = store.getCampusesByOrgId(res.organization.id);
      assert.equal(orgCampuses.length, 1);
      assert.equal(orgCampuses[0].name, 'Edison Innovation Main Campus');
      assert.equal(orgCampuses[0].code, 'EDISON-MAIN');
      assert.equal(orgCampuses[0].isMainCampus, true);
      assert.equal(orgCampuses[0].status, 'active');

      // Verify immediate readiness score
      const readiness = store.evaluateOrganizationReadiness(res.organization.id);
      assert.equal(readiness.hasBlockers, false, 'New organization with initial campus must have 0 blockers');
      assert.ok(readiness.score >= 80);
    });
  });
});
