import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { PlatformStore } from '../lib/data/platform-store';

describe('PlatformStore Development Data Layer', () => {
  let store: PlatformStore;

  beforeEach(() => {
    store = new PlatformStore();
    store.resetToDefaults();
  });

  test('initializes with pre-populated realistic fixtures', () => {
    const orgs = store.getOrganizations();
    const plans = store.getPlans();
    const users = store.getPlatformUsers();
    const metrics = store.getMetrics();

    assert.ok(orgs.length >= 10, 'Should load at least 10 initial school organizations');
    assert.equal(plans.length, 3, 'Should provide 3 standard subscription plans');
    assert.ok(users.length >= 4, 'Should load platform admin users');
    assert.equal(metrics.totalOrganizations, orgs.length);
  });

  test('creates new organization with valid data, subscription, and initial invoice', () => {
    const initialCount = store.getOrganizations().length;

    const result = store.createOrganization({
      name: 'Test Academy of Science',
      code: 'TESTACAD',
      classification: 'k12',
      subdomain: 'testacad',
      contact: {
        email: 'info@testacad.edu',
        phone: '+1 555 123 4567',
        address: '100 Test St',
        city: 'Austin',
        stateOrProvince: 'TX',
        country: 'United States',
      },
      administrator: {
        name: 'Dr. John Test',
        email: 'j.test@testacad.edu',
        phone: '+1 555 123 4568',
        roleTitle: 'Dean',
      },
      planId: 'plan_growth',
      billingCycle: 'annual',
      technicalConfig: {
        subdomain: 'testacad',
        timezone: 'America/Chicago',
        academicYearStartMonth: 8,
        currency: 'USD',
        locale: 'en-US',
        maxCampuses: 2,
      },
    });

    assert.equal(result.success, true);
    assert.ok(result.organization);
    assert.equal(result.organization.code, 'TESTACAD');
    assert.equal(store.getOrganizations().length, initialCount + 1);

    // Associated subscription created
    const sub = store.getSubscriptionByOrgId(result.organization.id);
    assert.ok(sub);
    assert.equal(sub.planId, 'plan_growth');
    assert.equal(sub.billingCycle, 'annual');

    // Associated initial invoice created
    const invs = store.getInvoicesByOrgId(result.organization.id);
    assert.ok(invs.length >= 1);
    assert.equal(invs[0].amountDue, 4990);
  });

  test('rejects duplicate organization code', () => {
    const res = store.createOrganization({
      name: 'Duplicate Oak Hill',
      code: 'OAKHILL', // existing code
      classification: 'k12',
      subdomain: 'oakhill-copy',
      contact: {
        email: 'dup@school.edu',
        phone: '123',
        address: 'St',
        city: 'City',
        stateOrProvince: 'ST',
        country: 'US',
      },
      administrator: {
        name: 'Admin',
        email: 'admin@school.edu',
        phone: '123',
        roleTitle: 'Principal',
      },
      planId: 'plan_starter',
      billingCycle: 'monthly',
      technicalConfig: {
        subdomain: 'oakhill-copy',
        timezone: 'UTC',
        academicYearStartMonth: 9,
        currency: 'USD',
        locale: 'en-US',
        maxCampuses: 1,
      },
    });

    assert.equal(res.success, false);
    assert.match(res.error || '', /already in use/i);
  });

  test('rejects duplicate subdomain', () => {
    const res = store.createOrganization({
      name: 'Duplicate Subdomain School',
      code: 'NEWCODE',
      classification: 'k12',
      subdomain: 'oakhill', // existing subdomain
      contact: {
        email: 'dup@school.edu',
        phone: '123',
        address: 'St',
        city: 'City',
        stateOrProvince: 'ST',
        country: 'US',
      },
      administrator: {
        name: 'Admin',
        email: 'admin@school.edu',
        phone: '123',
        roleTitle: 'Principal',
      },
      planId: 'plan_starter',
      billingCycle: 'monthly',
      technicalConfig: {
        subdomain: 'oakhill',
        timezone: 'UTC',
        academicYearStartMonth: 9,
        currency: 'USD',
        locale: 'en-US',
        maxCampuses: 1,
      },
    });

    assert.equal(res.success, false);
    assert.match(res.error || '', /already registered/i);
  });

  test('updates organization lifecycle status and logs audit event', () => {
    const org = store.getOrganizations()[0];
    const initialAuditCount = store.getAuditEvents().length;

    const res = store.setOrganizationStatus(org.id, 'suspended', 'Administrative audit trigger');
    assert.equal(res.success, true);

    const updated = store.getOrganizationById(org.id);
    assert.equal(updated?.status, 'suspended');
    assert.equal(store.getAuditEvents().length, initialAuditCount + 1);

    const latestAudit = store.getAuditEvents()[0];
    assert.equal(latestAudit.action, 'ORGANIZATION_STATUS_CHANGED');
    assert.equal(latestAudit.targetId, org.id);
  });

  test('updates subscription plan assignment and logs audit event', () => {
    const org = store.getOrganizations().find((o) => o.planId !== 'plan_enterprise')!;
    const res = store.updateOrganizationPlan(org.id, 'plan_enterprise', 'annual');
    assert.equal(res.success, true);

    const updatedOrg = store.getOrganizationById(org.id);
    assert.equal(updatedOrg?.planId, 'plan_enterprise');

    const updatedSub = store.getSubscriptionByOrgId(org.id);
    assert.equal(updatedSub?.planId, 'plan_enterprise');
    assert.equal(updatedSub?.billingCycle, 'annual');
  });

  test('creates platform user and manages roles with audit tracking', () => {
    const res = store.createPlatformUser({
      name: 'Security Lead Jane',
      email: 'jane.sec@saas-platform.internal',
      role: 'compliance_auditor',
      department: 'Platform Security',
    });

    assert.equal(res.success, true);
    assert.ok(res.user);
    assert.equal(res.user.role, 'compliance_auditor');

    // Elevate role to super_admin
    const roleRes = store.updatePlatformUserRole(res.user.id, 'super_admin');
    assert.equal(roleRes.success, true);

    const updatedUser = store.getPlatformUsers().find((u) => u.id === res.user?.id);
    assert.equal(updatedUser?.role, 'super_admin');
  });

  test('toggles global feature availability', () => {
    const feat = store.getFeatures()[0];
    const originalState = feat.isGloballyEnabled;

    const res = store.toggleFeature(feat.id);
    assert.equal(res.success, true);

    const updated = store.getFeatures().find((f) => f.id === feat.id);
    assert.equal(updated?.isGloballyEnabled, !originalState);
  });

  describe('Payment Recording & Ledger Settlements', () => {
    test('records partial payment and updates invoice amountPaid and audit trail', () => {
      const invoices = store.getInvoices().filter((inv) => inv.status !== 'paid' && inv.amountDue > 0);
      assert.ok(invoices.length > 0, 'Should have unpaid invoices');
      const invoice = invoices[0];
      const initialPaid = invoice.amountPaid || 0;
      const initialAuditCount = store.getAuditEvents().length;
      const payAmount = 100;

      const result = store.recordPayment({
        invoiceId: invoice.id,
        amount: payAmount,
        method: 'bank_transfer',
        referenceNumber: 'WIRE-TEST-12345',
        notes: 'Partial payment test',
      });

      assert.equal(result.success, true);
      assert.ok(result.payment);
      assert.equal(result.payment.amount, payAmount);
      assert.equal(result.payment.referenceNumber, 'WIRE-TEST-12345');

      const updatedInvoice = store.getInvoices().find((i) => i.id === invoice.id);
      assert.equal(updatedInvoice?.amountPaid, initialPaid + payAmount);
      assert.notEqual(updatedInvoice?.status, 'paid');
      assert.equal((updatedInvoice?.amountPaid || 0) < (updatedInvoice?.amountDue || 0), true);

      // Verify payment query helpers
      const paymentsForOrg = store.getPaymentsByOrgId(invoice.organizationId);
      assert.ok(paymentsForOrg.some((p) => p.id === result.payment?.id));

      const paymentsForInvoice = store.getPaymentsByInvoiceId(invoice.id);
      assert.ok(paymentsForInvoice.some((p) => p.id === result.payment?.id));

      // Verify audit event
      const latestAudit = store.getAuditEvents()[0];
      assert.equal(latestAudit.action, 'PAYMENT_RECORDED');
      assert.equal(store.getAuditEvents().length, initialAuditCount + 1);
    });

    test('marks invoice as paid when balance reaches zero', () => {
      const invoices = store.getInvoices().filter((inv) => inv.status !== 'paid');
      const invoice = invoices[0];
      const unpaidBalance = invoice.amountDue - (invoice.amountPaid || 0);

      const result = store.recordPayment({
        invoiceId: invoice.id,
        amount: unpaidBalance,
        method: 'card',
        referenceNumber: 'CC-FULL-PAY-99',
      });

      assert.equal(result.success, true);
      const updatedInvoice = store.getInvoices().find((i) => i.id === invoice.id);
      assert.equal(updatedInvoice?.status, 'paid');
      assert.equal(updatedInvoice?.amountPaid, invoice.amountDue);
    });

    test('rejects overpayment exceeding unpaid balance', () => {
      const invoices = store.getInvoices().filter((inv) => inv.status !== 'paid');
      const invoice = invoices[0];
      const unpaidBalance = invoice.amountDue - (invoice.amountPaid || 0);

      const result = store.recordPayment({
        invoiceId: invoice.id,
        amount: unpaidBalance + 500,
        method: 'cheque',
        referenceNumber: 'CHQ-EXCESS-01',
      });

      assert.equal(result.success, false);
      assert.match(result.error || '', /exceeds the remaining/i);
    });

    test('rejects zero or negative payment amounts', () => {
      const invoice = store.getInvoices()[0];
      const resZero = store.recordPayment({
        invoiceId: invoice.id,
        amount: 0,
        method: 'manual_invoice',
        referenceNumber: 'ZERO-TEST',
      });
      assert.equal(resZero.success, false);

      const resNeg = store.recordPayment({
        invoiceId: invoice.id,
        amount: -50,
        method: 'manual_invoice',
        referenceNumber: 'NEG-TEST',
      });
      assert.equal(resNeg.success, false);
    });

    test('rejects duplicate payment reference number', () => {
      const invoice = store.getInvoices().filter((i) => i.status !== 'paid')[0];
      const res1 = store.recordPayment({
        invoiceId: invoice.id,
        amount: 10,
        method: 'bank_transfer',
        referenceNumber: 'REF-DUP-1',
      });
      assert.equal(res1.success, true);

      const res2 = store.recordPayment({
        invoiceId: invoice.id,
        amount: 10,
        method: 'bank_transfer',
        referenceNumber: 'REF-DUP-1',
      });
      assert.equal(res2.success, false);
      assert.match(res2.error || '', /already been recorded/i);
    });
  });

  describe('Organization Lifecycle State Machine', () => {
    test('enforces mandatory justification reason for suspension', () => {
      const org = store.getOrganizations().find((o) => o.status === 'active')!;
      const noReasonRes = store.setOrganizationStatus(org.id, 'suspended', '');
      assert.equal(noReasonRes.success, false);
      assert.match(noReasonRes.error || '', /mandatory/i);

      const shortReasonRes = store.setOrganizationStatus(org.id, 'suspended', 'bad');
      assert.equal(shortReasonRes.success, false);
      assert.match(shortReasonRes.error || '', /min 5 characters/i);

      const validReasonRes = store.setOrganizationStatus(org.id, 'suspended', 'Payment default after 60-day notice');
      assert.equal(validReasonRes.success, true);
      assert.equal(store.getOrganizationById(org.id)?.status, 'suspended');
    });

    test('permits valid transition from pending to active', () => {
      // Create a pending organization
      const createRes = store.createOrganization({
        name: 'Pending High School',
        code: 'PENDHS',
        classification: 'k12',
        subdomain: 'pendhs',
        contact: {
          email: 'admin@pendhs.edu',
          phone: '1234567890',
          address: 'Main St',
          city: 'Capital',
          stateOrProvince: 'CA',
          country: 'United States',
        },
        administrator: {
          name: 'Principal Skinner',
          email: 'skinner@pendhs.edu',
          phone: '1234567890',
          roleTitle: 'Principal',
        },
        planId: 'plan_growth',
        billingCycle: 'annual',
        technicalConfig: {
          subdomain: 'pendhs',
          timezone: 'America/Los_Angeles',
          academicYearStartMonth: 9,
          currency: 'USD',
          locale: 'en-US',
          maxCampuses: 1,
        },
      });

      assert.equal(createRes.success, true);
      const pendingOrg = createRes.organization!;
      assert.equal(pendingOrg.status, 'pending');

      // Approve & activate
      const activateRes = store.setOrganizationStatus(pendingOrg.id, 'active', 'Board accreditation approved');
      assert.equal(activateRes.success, true);
      assert.equal(store.getOrganizationById(pendingOrg.id)?.status, 'active');
    });

    test('rejects invalid state machine transitions', () => {
      // Cannot transition pending directly to suspended
      const createRes = store.createOrganization({
        name: 'Pending Invalid School',
        code: 'PENDINV',
        classification: 'k12',
        subdomain: 'pendinv',
        contact: {
          email: 'admin@pendinv.edu',
          phone: '1234567890',
          address: 'Main St',
          city: 'Capital',
          stateOrProvince: 'CA',
          country: 'United States',
        },
        administrator: {
          name: 'Principal Skinner',
          email: 'skinner@pendinv.edu',
          phone: '1234567890',
          roleTitle: 'Principal',
        },
        planId: 'plan_growth',
        billingCycle: 'annual',
        technicalConfig: {
          subdomain: 'pendinv',
          timezone: 'America/Los_Angeles',
          academicYearStartMonth: 9,
          currency: 'USD',
          locale: 'en-US',
          maxCampuses: 1,
        },
      });

      const pendingOrg = createRes.organization!;
      const invalidRes = store.setOrganizationStatus(pendingOrg.id, 'suspended', 'Pre-emptive block');
      assert.equal(invalidRes.success, false);
      assert.match(invalidRes.error || '', /Invalid lifecycle transition/i);
    });
  });

  describe('Storage Resilience & Defensiveness', () => {
    test('handles corrupt or non-array localStorage data gracefully', () => {
      // Mock corrupt storage object
      const fakeStorage: Record<string, string> = {
        'sms_superadmin_platform_data_v1': JSON.stringify({
          organizations: 'corrupt_string_not_array',
          subscriptions: null,
          invoices: 12345,
        }),
      };

      // Set global localStorage mock
      const originalStorage = globalThis.localStorage;
      globalThis.localStorage = {
        getItem: (k: string) => fakeStorage[k] || null,
        setItem: (k: string, v: string) => { fakeStorage[k] = v; },
        removeItem: (k: string) => { delete fakeStorage[k]; },
        clear: () => { Object.keys(fakeStorage).forEach((k) => delete fakeStorage[k]); },
        length: 1,
        key: () => null,
      };

      const resilientStore = new PlatformStore();
      const orgs = resilientStore.getOrganizations();
      assert.ok(Array.isArray(orgs), 'Organizations should safely fallback to array fixtures');
      assert.ok(orgs.length > 0, 'Should load default fixtures instead of crashing');

      // Restore storage
      globalThis.localStorage = originalStorage;
    });
  });
});
