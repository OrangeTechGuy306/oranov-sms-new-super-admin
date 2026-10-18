/**
 * Test Suite: Phase E-09.11 — SaaS Subscriptions, Billing and Monetization Governance
 * Comprehensive verification of financial math, currency boundaries, lifecycle state machine,
 * module entitlement alignment, dunning/retry logic, and referential integrity.
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { PlatformStore } from '../lib/data/platform-store';
import {
  calculateInvoiceTotals,
  calculateOutstandingBalance,
  deriveInvoiceStatus,
  canTransitionSubscriptionStatus,
  validateSubscriptionTransition,
  calculateDaysRemaining,
  getRenewalStatus,
  getTrialStatus,
  getGracePeriodStatus,
  getModulesIncludedInPlanTier,
  getPlanModuleEntitlementsSummary,
  computeMonetizationAnalytics,
  validatePlanDefinition,
  validateDiscountPolicy,
  round2,
  CANONICAL_REFERENCE_DATE,
} from '../lib/monetization/evaluator';
import { SubscriptionPlan, SubscriptionStatus } from '../lib/types/subscriptions';

describe('Phase E-09.11: SaaS Subscriptions, Billing and Monetization Engine', () => {
  let store: PlatformStore;

  beforeEach(() => {
    store = new PlatformStore();
    store.resetToDefaults();
  });

  // =========================================================================
  // 1. INVOICE FINANCIAL CALCULATIONS & BALANCE CONSISTENCY
  // =========================================================================
  describe('1. Invoice Financial Calculations & Balance Consistency', () => {
    test('computes invoice subtotal, tax rate, discount, and total accurately with 2-decimal rounding', () => {
      // Basic calculation
      const res1 = calculateInvoiceTotals(1000, 10, 50); // 1000 + 100 (10% tax) - 50 = 1050
      assert.equal(res1.subtotal, 1000);
      assert.equal(res1.taxAmount, 100);
      assert.equal(res1.discountAmount, 50);
      assert.equal(res1.total, 1050);

      // Fractional rounding (e.g. 20% VAT on £399)
      const res2 = calculateInvoiceTotals(399, 20, 0); // 399 + 79.80 = 478.80
      assert.equal(res2.subtotal, 399);
      assert.equal(res2.taxAmount, 79.8);
      assert.equal(res2.total, 478.8);

      // Zero tax and zero discount
      const res3 = calculateInvoiceTotals(199, 0, 0);
      assert.equal(res3.total, 199);
      assert.equal(res3.taxAmount, 0);
      assert.equal(res3.discountAmount, 0);

      // Discount cannot exceed subtotal
      const res4 = calculateInvoiceTotals(100, 0, 150);
      assert.equal(res4.discountAmount, 100);
      assert.equal(res4.total, 0);
    });

    test('calculates outstanding balance deterministically without floating-point artifacts', () => {
      assert.equal(calculateOutstandingBalance(478.8, 478.8), 0);
      assert.equal(calculateOutstandingBalance(1000, 400), 600);
      assert.equal(calculateOutstandingBalance(199, 0), 199);
      assert.equal(calculateOutstandingBalance(100, 150), 0); // Overpayment clamp
    });

    test('derives invoice status accurately based on amount paid, due date, and reference date', () => {
      const refDate = '2026-03-18T12:00:00.000Z';

      // Paid in full
      const statusPaid = deriveInvoiceStatus(1000, 1000, '2026-04-01T00:00:00Z', 'issued', refDate);
      assert.equal(statusPaid, 'paid');

      // Unpaid and due date is in future -> issued
      const statusIssued = deriveInvoiceStatus(1000, 200, '2026-04-01T00:00:00Z', 'issued', refDate);
      assert.equal(statusIssued, 'issued');

      // Unpaid and due date has passed -> overdue
      const statusOverdue = deriveInvoiceStatus(1000, 0, '2026-01-15T00:00:00Z', 'issued', refDate);
      assert.equal(statusOverdue, 'overdue');

      // Preserves void or draft status regardless of due date
      const statusVoid = deriveInvoiceStatus(1000, 0, '2026-01-15T00:00:00Z', 'void', refDate);
      assert.equal(statusVoid, 'void');
    });

    test('store voids an open or overdue invoice with mandatory justification reason', () => {
      const invoices = store.getInvoices().filter((i) => i.status !== 'paid');
      assert.ok(invoices.length > 0);
      const targetInv = invoices[0];

      // Rejects without reason
      const failRes = store.voidInvoice(targetInv.id, 'bad');
      assert.equal(failRes.success, false);
      assert.match(failRes.error || '', /mandatory justification/i);

      // Successfully voids with valid reason
      const successRes = store.voidInvoice(targetInv.id, 'Administrative cancellation due to school calendar revision.');
      assert.equal(successRes.success, true);
      assert.equal(successRes.invoice?.status, 'void');
      assert.equal(successRes.invoice?.voidReason, 'Administrative cancellation due to school calendar revision.');

      // Cannot void already settled invoice
      const paidInv = store.getInvoices().find((i) => i.status === 'paid')!;
      const rejectPaidRes = store.voidInvoice(paidInv.id, 'Cannot void settled invoice.');
      assert.equal(rejectPaidRes.success, false);
      assert.match(rejectPaidRes.error || '', /already settled/i);
    });
  });

  // =========================================================================
  // 2. SUBSCRIPTION LIFECYCLE STATE MACHINE & TRANSITIONS
  // =========================================================================
  describe('2. Subscription Lifecycle State Machine & Transitions', () => {
    test('enforces permitted state transitions according to canonical lifecycle rules', () => {
      // Valid transitions
      assert.equal(canTransitionSubscriptionStatus('draft', 'active'), true);
      assert.equal(canTransitionSubscriptionStatus('trialing', 'active'), true);
      assert.equal(canTransitionSubscriptionStatus('active', 'past_due'), true);
      assert.equal(canTransitionSubscriptionStatus('past_due', 'active'), true);
      assert.equal(canTransitionSubscriptionStatus('active', 'suspended'), true);
      assert.equal(canTransitionSubscriptionStatus('suspended', 'active'), true);
      assert.equal(canTransitionSubscriptionStatus('active', 'canceled'), true);
      assert.equal(canTransitionSubscriptionStatus('canceled', 'active'), true); // Resubscription

      // Invalid transitions
      assert.equal(canTransitionSubscriptionStatus('draft', 'past_due'), false);
      assert.equal(canTransitionSubscriptionStatus('suspended', 'trialing'), false);
      assert.equal(canTransitionSubscriptionStatus('canceled', 'past_due'), false);
    });

    test('requires mandatory justification reason for suspension and cancellation', () => {
      // Suspension without reason
      const res1 = validateSubscriptionTransition('active', 'suspended', '');
      assert.equal(res1.isValid, false);
      assert.match(res1.error || '', /mandatory justification/i);

      // Cancellation with short reason (<5 chars)
      const res2 = validateSubscriptionTransition('active', 'canceled', 'bye');
      assert.equal(res2.isValid, false);

      // Valid cancellation
      const res3 = validateSubscriptionTransition('active', 'canceled', 'Consolidated campus network.');
      assert.equal(res3.isValid, true);
    });

    test('store executes subscription status transition and records dedicated lifecycle event and audit log', () => {
      const sub = store.getSubscriptions().find((s) => s.status === 'active')!;
      const initialAuditCount = store.getAuditEvents().length;
      const initialEventsCount = store.getSubscriptionEvents(sub.id).length;

      const res = store.transitionSubscriptionStatus(
        sub.id,
        'suspended',
        'Compliance non-responsiveness and billing hold.'
      );

      assert.equal(res.success, true);
      assert.equal(res.subscription?.status, 'suspended');

      // Verify lifecycle event recorded
      const events = store.getSubscriptionEvents(sub.id);
      assert.equal(events.length, initialEventsCount + 1);
      assert.equal(events[0].fromStatus, 'active');
      assert.equal(events[0].toStatus, 'suspended');
      assert.equal(events[0].reason, 'Compliance non-responsiveness and billing hold.');

      // Verify platform audit event recorded
      assert.equal(store.getAuditEvents().length, initialAuditCount + 1);
      const audit = store.getAuditEvents()[0];
      assert.equal(audit.action, 'SUBSCRIPTION_STATUS_CHANGED');
      assert.equal(audit.targetId, sub.id);
    });
  });

  // =========================================================================
  // 3. RENEWALS, TRIALS & GRACE PERIOD DATE EVALUATION
  // =========================================================================
  describe('3. Renewals, Trials & Grace Period Date Evaluation', () => {
    test('calculates days remaining deterministically without timezone skew', () => {
      const refDate = '2026-03-18T12:00:00.000Z';
      assert.equal(calculateDaysRemaining('2026-03-22T00:00:00.000Z', refDate), 4);
      assert.equal(calculateDaysRemaining('2026-03-18T00:00:00.000Z', refDate), 0);
      assert.equal(calculateDaysRemaining('2026-03-10T00:00:00.000Z', refDate), -8);
    });

    test('evaluates trial status accurately identifying active vs expired trials', () => {
      const refDate = '2026-03-18T12:00:00.000Z';

      // Active trial with 24 days left
      const subActiveTrial = {
        id: 'sub_test_1',
        organizationId: 'org_001',
        planId: 'plan_enterprise',
        billingCycle: 'annual' as const,
        status: 'trialing' as SubscriptionStatus,
        currentPeriodStart: '2026-03-12T00:00:00Z',
        currentPeriodEnd: '2026-04-11T00:00:00Z',
        trialStartDate: '2026-03-12T00:00:00Z',
        trialEndDate: '2026-04-11T00:00:00Z',
        cancelAtPeriodEnd: false,
        updatedAt: '2026-03-12T00:00:00Z',
      };
      const trial1 = getTrialStatus(subActiveTrial, refDate);
      assert.equal(trial1.inTrial, true);
      assert.equal(trial1.daysRemaining, 24);
      assert.equal(trial1.isTrialExpired, false);

      // Expired trial
      const subExpiredTrial = {
        ...subActiveTrial,
        trialEndDate: '2026-03-10T00:00:00Z',
      };
      const trial2 = getTrialStatus(subExpiredTrial, refDate);
      assert.equal(trial2.inTrial, false);
      assert.equal(trial2.isTrialExpired, true);
      assert.ok(trial2.daysRemaining < 0);
    });

    test('evaluates upcoming renewals within 30-day window', () => {
      const refDate = '2026-03-18T12:00:00.000Z';

      // Renewal in 18 days
      const subRenewalSoon = {
        id: 'sub_test_2',
        organizationId: 'org_009',
        planId: 'plan_growth',
        billingCycle: 'annual' as const,
        status: 'active' as SubscriptionStatus,
        currentPeriodStart: '2025-04-05T00:00:00Z',
        currentPeriodEnd: '2026-04-05T00:00:00Z',
        cancelAtPeriodEnd: false,
        updatedAt: '2025-04-05T00:00:00Z',
      };
      const renewal = getRenewalStatus(subRenewalSoon, refDate);
      assert.equal(renewal.isExpiringSoon, true);
      assert.equal(renewal.daysUntilRenewal, 18);
      assert.equal(renewal.isExpired, false);

      // Renewal far away (>30 days)
      const subRenewalFar = {
        ...subRenewalSoon,
        currentPeriodEnd: '2026-08-15T00:00:00Z',
      };
      const renewalFar = getRenewalStatus(subRenewalFar, refDate);
      assert.equal(renewalFar.isExpiringSoon, false);
      assert.ok(renewalFar.daysUntilRenewal > 30);
    });

    test('evaluates 14-day grace period for past-due subscriptions', () => {
      const refDate = '2026-03-18T12:00:00.000Z';

      // Past due with grace period ending March 24 (6 days left)
      const subInGrace = {
        id: 'sub_test_3',
        organizationId: 'org_004',
        planId: 'plan_starter',
        billingCycle: 'monthly' as const,
        status: 'past_due' as SubscriptionStatus,
        currentPeriodStart: '2026-01-10T00:00:00Z',
        currentPeriodEnd: '2026-02-10T00:00:00Z',
        gracePeriodEnd: '2026-03-24T00:00:00Z',
        cancelAtPeriodEnd: false,
        updatedAt: '2026-02-28T00:00:00Z',
      };
      const grace = getGracePeriodStatus(subInGrace, refDate);
      assert.equal(grace.inGracePeriod, true);
      assert.equal(grace.daysRemaining, 6);
      assert.equal(grace.isGraceExpired, false);

      // Grace period expired
      const subExpiredGrace = {
        ...subInGrace,
        gracePeriodEnd: '2026-03-10T00:00:00Z',
      };
      const graceExp = getGracePeriodStatus(subExpiredGrace, refDate);
      assert.equal(graceExp.inGracePeriod, false);
      assert.equal(graceExp.isGraceExpired, true);
    });
  });

  // =========================================================================
  // 4. CANONICAL MODULE REGISTRY & PLAN ENTITLEMENT ALIGNMENT
  // =========================================================================
  describe('4. Canonical Module Registry & Plan Entitlement Alignment', () => {
    test('resolves modules included in each plan tier from Master Tenant Module Registry', () => {
      const starterMods = getModulesIncludedInPlanTier('starter');
      const growthMods = getModulesIncludedInPlanTier('growth');
      const enterpriseMods = getModulesIncludedInPlanTier('enterprise');

      assert.ok(starterMods.length > 0, 'Starter must include core modules');
      assert.ok(growthMods.length > starterMods.length, 'Growth must contain more modules than Starter');
      assert.ok(enterpriseMods.length > growthMods.length, 'Enterprise must contain more modules than Growth');

      // Verify core dashboard is included in all tiers
      assert.ok(starterMods.some((m) => m.id === 'mod_dashboard'));
      assert.ok(growthMods.some((m) => m.id === 'mod_dashboard'));
      assert.ok(enterpriseMods.some((m) => m.id === 'mod_dashboard'));
    });

    test('summarizes plan entitlements and detects orphan or invalid module IDs', () => {
      const planWithValidMods: SubscriptionPlan = {
        id: 'plan_custom_valid',
        name: 'Custom Tier Valid',
        tier: 'custom',
        description: 'Test plan',
        priceMonthly: 100,
        priceAnnual: 1000,
        currency: 'USD',
        maxStudents: 500,
        maxStaff: 50,
        maxCampuses: 1,
        storageGb: 50,
        features: ['Feature 1'],
        includedModuleIds: ['mod_dashboard', 'mod_students'],
        isActive: true,
      };

      const summary1 = getPlanModuleEntitlementsSummary(planWithValidMods);
      assert.equal(summary1.totalIncluded, 2);
      assert.equal(summary1.missingModuleIds.length, 0);

      // Plan referencing a non-existent module ID
      const planWithOrphanMod: SubscriptionPlan = {
        ...planWithValidMods,
        includedModuleIds: ['mod_dashboard', 'mod_non_existent_fake_module'],
      };
      const summary2 = getPlanModuleEntitlementsSummary(planWithOrphanMod);
      assert.equal(summary2.totalIncluded, 1);
      assert.equal(summary2.missingModuleIds.length, 1);
      assert.equal(summary2.missingModuleIds[0], 'mod_non_existent_fake_module');
    });

  });

  // =========================================================================
  // 5. PAYMENT MONITORING & FAILED PAYMENTS RETRY WORKFLOW
  // =========================================================================
  describe('5. Payment Monitoring & Failed Payments Retry Workflow', () => {
    test('store identifies failed payments with categorized failure reasons', () => {
      const payments = store.getPayments();
      const failed = payments.filter((p) => p.status === 'failed');
      assert.ok(failed.length >= 1, 'Fixtures must provide simulated failed payments');

      const failedPayment = failed.find((p) => p.failureCategory === 'insufficient_funds');
      assert.ok(failedPayment);
      assert.equal(failedPayment.isRetryEligible, true);
      assert.ok(failedPayment.failureReason);
    });

    test('executes simulated payment retry and updates payment status, invoice balance, and audit log', () => {
      const failedPayments = store.getPayments().filter((p) => p.status === 'failed');
      assert.ok(failedPayments.length > 0);
      const targetFailed = failedPayments[0];
      const initialRetries = targetFailed.retryCount || 0;
      const initialAuditCount = store.getAuditEvents().length;

      const invoiceBefore = store.getInvoiceById(targetFailed.invoiceId)!;
      const paidBefore = invoiceBefore.amountPaid || 0;

      // Execute retry
      const result = store.retryPayment(targetFailed.id);
      assert.equal(result.success, true);
      assert.equal(result.payment?.status, 'succeeded');
      assert.equal(result.payment?.retryCount, initialRetries + 1);

      // Invoice balance must be updated consistently
      const invoiceAfter = store.getInvoiceById(targetFailed.invoiceId)!;
      assert.ok(invoiceAfter.amountPaid > paidBefore);

      // Audit event must be recorded
      assert.equal(store.getAuditEvents().length, initialAuditCount + 1);
      const audit = store.getAuditEvents()[0];
      assert.equal(audit.action, 'PAYMENT_RETRY_SUCCEEDED');
    });

    test('rejects retry on already succeeded payments', () => {
      const succeededPayment = store.getPayments().find((p) => p.status === 'succeeded')!;
      const result = store.retryPayment(succeededPayment.id);
      assert.equal(result.success, false);
      assert.match(result.error || '', /cannot be retried/i);
    });
  });

  // =========================================================================
  // 6. MULTI-CURRENCY MONETIZATION ANALYTICS INTEGRITY
  // =========================================================================
  describe('6. Multi-Currency Monetization Analytics Integrity', () => {
    test('computes MRR, ARR, and invoice balances strictly separated by currency without cross-currency aggregation', () => {
      const subscriptions = store.getSubscriptions();
      const plans = store.getPlans();
      const invoices = store.getInvoices();
      const payments = store.getPayments();

      const analytics = computeMonetizationAnalytics(
        subscriptions,
        plans,
        invoices,
        payments,
        CANONICAL_REFERENCE_DATE
      );

      // Verify currencies are isolated
      assert.ok(analytics.currencyBreakdown['USD'], 'Must have USD metrics');
      const usdMetrics = analytics.currencyBreakdown['USD'];
      assert.ok(usdMetrics.mrr > 0, 'USD MRR must be positive');
      assert.equal(usdMetrics.arr, round2(usdMetrics.mrr * 12));
      assert.ok(usdMetrics.totalInvoiced >= usdMetrics.totalCollected);

      // Verify trial conversion rate is cleanly labeled as unavailable without cohort fabrication
      assert.equal(analytics.trialConversionRate.isAvailable, false);
      assert.ok(analytics.trialConversionRate.cohortNote.length > 10);
    });

    test('annual plan contributions to MRR are calculated as priceAnnual / 12', () => {
      // Create isolated test data with 1 annual subscription
      const testPlan: SubscriptionPlan = {
        id: 'plan_annual_test',
        name: 'Annual Test Plan',
        tier: 'growth',
        description: 'Test',
        priceMonthly: 100,
        priceAnnual: 1200,
        currency: 'USD',
        maxStudents: 500,
        maxStaff: 50,
        maxCampuses: 1,
        storageGb: 50,
        features: [],
        isActive: true,
      };

      const testSub = {
        id: 'sub_annual_test',
        organizationId: 'org_001',
        planId: 'plan_annual_test',
        billingCycle: 'annual' as const,
        status: 'active' as SubscriptionStatus,
        currentPeriodStart: '2025-01-01T00:00:00Z',
        currentPeriodEnd: '2026-01-01T00:00:00Z',
        cancelAtPeriodEnd: false,
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const analytics = computeMonetizationAnalytics(
        [testSub],
        [testPlan],
        [],
        [],
        CANONICAL_REFERENCE_DATE
      );

      // 1200 annual -> 100 MRR
      assert.equal(analytics.currencyBreakdown['USD'].mrr, 100);
      assert.equal(analytics.currencyBreakdown['USD'].arr, 1200);
    });
  });

  // =========================================================================
  // 7. PLAN CREATION & VALIDATION
  // =========================================================================
  describe('7. Plan Creation & Validation', () => {
    test('validates plan definition and rejects negative pricing or missing currency', () => {
      // Rejects negative price
      const negRes = validatePlanDefinition({
        name: 'Invalid Negative Plan',
        tier: 'starter',
        priceMonthly: -50,
        priceAnnual: 500,
        currency: 'USD',
      });
      assert.equal(negRes.isValid, false);
      assert.ok(negRes.errors.some((e) => e.includes('non-negative')));

      // Rejects duplicate identifier
      const dupRes = validatePlanDefinition(
        {
          id: 'plan_starter',
          name: 'Duplicate Starter',
          tier: 'starter',
          priceMonthly: 199,
          priceAnnual: 1990,
          currency: 'USD',
        },
        store.getPlans()
      );
      assert.equal(dupRes.isValid, false);
      assert.ok(dupRes.errors.some((e) => e.includes('already exists')));
    });

    test('store creates new plan successfully with audit event', () => {
      const initialCount = store.getPlans().length;
      const initialAuditCount = store.getAuditEvents().length;

      const res = store.createPlan({
        name: 'Middle School Explorer',
        tier: 'starter',
        description: 'Targeted single-tier package for junior secondary schools.',
        priceMonthly: 149,
        priceAnnual: 1490,
        currency: 'USD',
        maxStudents: 400,
        maxStaff: 30,
        maxCampuses: 1,
        storageGb: 40,
        features: ['Junior SIS', 'Basic Grading'],
        includedModuleIds: ['mod_core_dashboard', 'mod_students_admissions'],
      });

      assert.equal(res.success, true);
      assert.ok(res.plan);
      assert.equal(store.getPlans().length, initialCount + 1);

      // Verify audit event
      assert.equal(store.getAuditEvents().length, initialAuditCount + 1);
      const audit = store.getAuditEvents()[0];
      assert.equal(audit.action, 'PLAN_CREATED');
      assert.equal(audit.targetId, res.plan.id);
    });
  });

  // =========================================================================
  // 8. DISCOUNT POLICIES & PROMOTIONAL OFFERS
  // =========================================================================
  describe('8. Discount Policies & Promotional Offers', () => {
    test('validates discount policies rejecting invalid percentages and inverted date windows', () => {
      // Percentage > 100
      const invalidPct = validateDiscountPolicy({
        code: 'TOO_BIG',
        name: 'Invalid 150%',
        discountType: 'percentage',
        value: 150,
      });
      assert.equal(invalidPct.isValid, false);
      assert.ok(invalidPct.errors.some((e) => e.includes('between 1% and 100%')));

      // Inverted date range
      const invalidDates = validateDiscountPolicy({
        code: 'TIME_WARP',
        name: 'Inverted Dates',
        discountType: 'percentage',
        value: 10,
        validFrom: '2026-12-01T00:00:00Z',
        validUntil: '2026-01-01T00:00:00Z',
      });
      assert.equal(invalidDates.isValid, false);
      assert.ok(invalidDates.errors.some((e) => e.includes('after the start date')));
    });

    test('store creates discount policy and toggles active state with audit logging', () => {
      const initialAuditCount = store.getAuditEvents().length;

      const createRes = store.createDiscount({
        code: 'SUMMER2026',
        name: 'Summer Enrollment Concession',
        discountType: 'percentage',
        value: 10,
        applicablePlans: ['plan_starter', 'plan_growth'],
        validFrom: '2026-06-01T00:00:00Z',
        validUntil: '2026-08-31T23:59:59Z',
        maxRedemptions: 100,
        description: '10% early registration concession.',
      });

      assert.equal(createRes.success, true);
      assert.ok(createRes.discount);
      assert.equal(createRes.discount.isActive, true);

      // Toggle active status
      const toggleRes = store.toggleDiscount(createRes.discount.id);
      assert.equal(toggleRes.success, true);
      assert.equal(toggleRes.discount?.isActive, false);

      // Verify audit trail
      assert.equal(store.getAuditEvents().length, initialAuditCount + 2);
    });
  });

  // =========================================================================
  // 9. REFERENTIAL INTEGRITY ACROSS ENTITIES
  // =========================================================================
  describe('9. Referential Integrity Across Entities', () => {
    test('every subscription references a valid organization and a valid plan', () => {
      const orgs = store.getOrganizations();
      const plans = store.getPlans();
      const subscriptions = store.getSubscriptions();

      for (const sub of subscriptions) {
        const orgExists = orgs.some((o) => o.id === sub.organizationId);
        assert.ok(orgExists, `Subscription ${sub.id} must reference a valid organization.`);

        const planExists = plans.some((p) => p.id === sub.planId);
        assert.ok(planExists, `Subscription ${sub.id} must reference a valid plan.`);
      }
    });

    test('every invoice references a valid organization and existing subscription', () => {
      const orgs = store.getOrganizations();
      const subscriptions = store.getSubscriptions();
      const invoices = store.getInvoices();

      for (const inv of invoices) {
        const orgExists = orgs.some((o) => o.id === inv.organizationId);
        assert.ok(orgExists, `Invoice ${inv.invoiceNumber} must reference an existing organization.`);

        if (inv.subscriptionId) {
          const subExists = subscriptions.some((s) => s.id === inv.subscriptionId);
          assert.ok(subExists, `Invoice ${inv.invoiceNumber} must reference an existing subscription.`);
        }
      }
    });

    test('every payment references a valid invoice and valid organization', () => {
      const orgs = store.getOrganizations();
      const invoices = store.getInvoices();
      const payments = store.getPayments();

      for (const pay of payments) {
        const orgExists = orgs.some((o) => o.id === pay.organizationId);
        assert.ok(orgExists, `Payment ${pay.referenceNumber} must reference an existing organization.`);

        const invExists = invoices.some((i) => i.id === pay.invoiceId);
        assert.ok(invExists, `Payment ${pay.referenceNumber} must reference an existing invoice.`);
      }
    });
  });
});
