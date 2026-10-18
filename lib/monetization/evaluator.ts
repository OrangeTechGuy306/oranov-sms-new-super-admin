/**
 * Deterministic Monetization Evaluator & Financial Engine
 * Phase E-09.11: Multi-currency MRR calculations, invoice reconciliation,
 * subscription lifecycle transitions, grace-period evaluation, and module entitlement alignment.
 */

import {
  SubscriptionPlan,
  OrganizationSubscription,
  Invoice,
  PaymentRecord,
  PlanTier,
  SubscriptionStatus,
  InvoiceStatus,
} from '../types/subscriptions';
import {
  DiscountPolicy,
  MonetizationAnalyticsSummary,
  MonetizationCurrencyMetrics,
  PlanValidationResult,
  DiscountValidationResult,
  SubscriptionLifecycleStatus,
} from './types';
import { MASTER_MODULE_REGISTRY, MODULES_BY_ID } from '../modules/registry-data';
import { TenantModuleDefinition } from '../modules/types';

// Deterministic 2-decimal currency rounding
export const round2 = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

// Default reference date for deterministic testing and snapshot evaluation
export const CANONICAL_REFERENCE_DATE = '2026-03-18T12:00:00.000Z';

/**
 * Permitted subscription lifecycle state machine transitions.
 */
export const PERMITTED_SUBSCRIPTION_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  draft: ['trialing', 'active', 'canceled'],
  trialing: ['active', 'expired', 'canceled'],
  active: ['past_due', 'suspended', 'canceled'],
  past_due: ['active', 'suspended', 'canceled'],
  suspended: ['active', 'canceled'],
  canceled: ['active'],
  expired: ['active', 'canceled'],
};

/**
 * Calculates invoice financial totals with subtotal, tax, and discount.
 */
export function calculateInvoiceTotals(
  subtotal: number,
  taxRate: number = 0,
  discountAmount: number = 0
): {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
} {
  const safeSubtotal = round2(Math.max(0, subtotal));
  const safeTaxRate = round2(Math.max(0, taxRate));
  const taxAmount = safeTaxRate > 0 ? round2(safeSubtotal * (safeTaxRate / 100)) : 0;
  const safeDiscount = round2(Math.min(safeSubtotal, Math.max(0, discountAmount)));
  const total = round2(safeSubtotal + taxAmount - safeDiscount);

  return {
    subtotal: safeSubtotal,
    taxRate: safeTaxRate,
    taxAmount,
    discountAmount: safeDiscount,
    total,
  };
}

/**
 * Computes remaining unpaid balance on an invoice.
 */
export function calculateOutstandingBalance(amountDue: number, amountPaid: number = 0): number {
  return round2(Math.max(0, (amountDue || 0) - (amountPaid || 0)));
}

/**
 * Validates whether an invoice status is consistent with its payments.
 */
export function deriveInvoiceStatus(
  amountDue: number,
  amountPaid: number,
  dueDate: string,
  currentStatus: InvoiceStatus,
  referenceDate: string = CANONICAL_REFERENCE_DATE
): InvoiceStatus {
  if (currentStatus === 'void' || currentStatus === 'uncollectible' || currentStatus === 'draft') {
    return currentStatus;
  }
  const balance = calculateOutstandingBalance(amountDue, amountPaid);
  if (balance <= 0 && amountDue > 0) {
    return 'paid';
  }
  const refTime = new Date(referenceDate).getTime();
  const dueTime = new Date(dueDate).getTime();
  if (dueTime < refTime) {
    return 'overdue';
  }
  return 'issued';
}

/**
 * Checks whether a lifecycle state transition is permitted.
 */
export function canTransitionSubscriptionStatus(
  from: SubscriptionStatus,
  to: SubscriptionStatus
): boolean {
  if (from === to) return true;
  const allowed = PERMITTED_SUBSCRIPTION_TRANSITIONS[from];
  return Boolean(allowed && allowed.includes(to));
}

/**
 * Returns allowed next lifecycle statuses for a subscription.
 */
export function getPermittedSubscriptionTransitions(
  current: SubscriptionStatus
): SubscriptionStatus[] {
  return PERMITTED_SUBSCRIPTION_TRANSITIONS[current] || [];
}

/**
 * Validates transition with business rules (mandatory audit reasons for suspensions/cancellations).
 */
export function validateSubscriptionTransition(
  from: SubscriptionStatus,
  to: SubscriptionStatus,
  reason?: string
): { isValid: boolean; error?: string } {
  if (from === to) {
    return { isValid: false, error: `Subscription is already in state "${from}".` };
  }
  if (!canTransitionSubscriptionStatus(from, to)) {
    return {
      isValid: false,
      error: `Transition from "${from}" to "${to}" is not permitted by lifecycle rules.`,
    };
  }
  if ((to === 'suspended' || to === 'canceled') && (!reason || reason.trim().length < 5)) {
    return {
      isValid: false,
      error: `A mandatory justification reason (min 5 characters) is required to transition to "${to}".`,
    };
  }
  return { isValid: true };
}

/**
 * Calculates remaining days between reference date and target date in UTC calendar days.
 */
export function calculateDaysRemaining(
  targetDate: string,
  referenceDate: string = CANONICAL_REFERENCE_DATE
): number {
  if (!targetDate) return 0;
  const target = new Date(targetDate);
  const ref = new Date(referenceDate);
  if (isNaN(target.getTime()) || isNaN(ref.getTime())) return 0;

  const targetUtc = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  const refUtc = Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate());

  const diffMs = targetUtc - refUtc;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates renewal status and expiry countdown for a subscription.
 */
export function getRenewalStatus(
  subscription: OrganizationSubscription,
  referenceDate: string = CANONICAL_REFERENCE_DATE
): {
  daysUntilRenewal: number;
  isExpiringSoon: boolean;
  isExpired: boolean;
  renewalDate: string;
} {
  const daysUntilRenewal = calculateDaysRemaining(subscription.currentPeriodEnd, referenceDate);
  const isExpiringSoon =
    daysUntilRenewal <= 30 && daysUntilRenewal >= 0 && subscription.status === 'active';
  const isExpired = daysUntilRenewal < 0 && subscription.status !== 'canceled';

  return {
    daysUntilRenewal,
    isExpiringSoon,
    isExpired,
    renewalDate: subscription.currentPeriodEnd,
  };
}

/**
 * Evaluates trial status and trial days remaining.
 */
export function getTrialStatus(
  subscription: OrganizationSubscription,
  referenceDate: string = CANONICAL_REFERENCE_DATE
): {
  inTrial: boolean;
  daysRemaining: number;
  isTrialExpired: boolean;
  trialEndDate?: string;
} {
  if (!subscription.trialEndDate) {
    return {
      inTrial: subscription.status === 'trialing',
      daysRemaining: 0,
      isTrialExpired: false,
    };
  }

  const daysRemaining = calculateDaysRemaining(subscription.trialEndDate, referenceDate);
  const inTrial = subscription.status === 'trialing' && daysRemaining >= 0;
  const isTrialExpired = subscription.status === 'trialing' && daysRemaining < 0;

  return {
    inTrial,
    daysRemaining,
    isTrialExpired,
    trialEndDate: subscription.trialEndDate,
  };
}

/**
 * Evaluates grace period status for past due subscriptions.
 * Default policy: 14 days grace period after due date before administrative suspension.
 */
export function getGracePeriodStatus(
  subscription: OrganizationSubscription,
  referenceDate: string = CANONICAL_REFERENCE_DATE
): {
  inGracePeriod: boolean;
  daysRemaining: number;
  isGraceExpired: boolean;
  gracePeriodEnd: string;
} {
  if (subscription.status !== 'past_due') {
    return {
      inGracePeriod: false,
      daysRemaining: 0,
      isGraceExpired: false,
      gracePeriodEnd: '',
    };
  }

  // Use explicit gracePeriodEnd or default to 14 days after currentPeriodEnd
  let graceEnd = subscription.gracePeriodEnd;
  if (!graceEnd) {
    const periodEnd = new Date(subscription.currentPeriodEnd);
    const calculated = new Date(periodEnd.getTime() + 14 * 24 * 60 * 60 * 1000);
    graceEnd = calculated.toISOString();
  }

  const daysRemaining = calculateDaysRemaining(graceEnd, referenceDate);
  const inGracePeriod = daysRemaining >= 0;
  const isGraceExpired = daysRemaining < 0;

  return {
    inGracePeriod,
    daysRemaining,
    isGraceExpired,
    gracePeriodEnd: graceEnd,
  };
}

/**
 * Resolves modules included in a plan tier from the canonical Master Tenant Module Registry.
 */
export function getModulesIncludedInPlanTier(tier: PlanTier): TenantModuleDefinition[] {
  return MASTER_MODULE_REGISTRY.filter((mod) => mod.includedInPlans.includes(tier));
}

/**
 * Summarizes modules included in a subscription plan and detects any orphaned module references.
 */
export function getPlanModuleEntitlementsSummary(plan: SubscriptionPlan): {
  totalIncluded: number;
  includedModules: TenantModuleDefinition[];
  categoriesCount: number;
  missingModuleIds: string[];
} {
  if (plan.includedModuleIds && plan.includedModuleIds.length > 0) {
    const foundModules: TenantModuleDefinition[] = [];
    const missingModuleIds: string[] = [];

    for (const modId of plan.includedModuleIds) {
      const mod = MODULES_BY_ID.get(modId);
      if (mod) {
        foundModules.push(mod);
      } else {
        missingModuleIds.push(modId);
      }
    }

    const uniqueCats = new Set(foundModules.map((m) => m.category));
    return {
      totalIncluded: foundModules.length,
      includedModules: foundModules,
      categoriesCount: uniqueCats.size,
      missingModuleIds,
    };
  }

  // Tier-based fallback from canonical registry
  const tierModules = getModulesIncludedInPlanTier(plan.tier);
  const uniqueCats = new Set(tierModules.map((m) => m.category));
  return {
    totalIncluded: tierModules.length,
    includedModules: tierModules,
    categoriesCount: uniqueCats.size,
    missingModuleIds: [],
  };
}

/**
 * Computes enterprise monetization analytics across subscriptions, invoices, and payments.
 * Strictly separates different currencies — NEVER aggregates USD with GBP/EUR/KES without exchange rates.
 */
export function computeMonetizationAnalytics(
  subscriptions: OrganizationSubscription[],
  plans: SubscriptionPlan[],
  invoices: Invoice[],
  payments: PaymentRecord[],
  referenceDate: string = CANONICAL_REFERENCE_DATE
): MonetizationAnalyticsSummary {
  const planMap = new Map<string, SubscriptionPlan>(plans.map((p) => [p.id, p]));
  const currencyBreakdown: Record<string, MonetizationCurrencyMetrics> = {};

  const ensureCurrency = (curr: string): MonetizationCurrencyMetrics => {
    if (!currencyBreakdown[curr]) {
      currencyBreakdown[curr] = {
        currency: curr,
        mrr: 0,
        arr: 0,
        totalInvoiced: 0,
        totalCollected: 0,
        totalOutstanding: 0,
        overdueBalance: 0,
      };
    }
    return currencyBreakdown[curr];
  };

  // 1. Calculate MRR & ARR from active subscriptions
  for (const sub of subscriptions) {
    if (sub.status === 'active') {
      const plan = planMap.get(sub.planId);
      if (plan) {
        const metrics = ensureCurrency(plan.currency);
        let monthlyValue = 0;
        if (sub.billingCycle === 'annual') {
          monthlyValue = plan.priceAnnual > 0 ? round2(plan.priceAnnual / 12) : 0;
        } else {
          monthlyValue = plan.priceMonthly || 0;
        }
        metrics.mrr = round2(metrics.mrr + monthlyValue);
        metrics.arr = round2(metrics.mrr * 12);
      }
    }
  }

  // 2. Invoice Financial Totals (Invoiced, Collected, Outstanding, Overdue)
  let overdueInvoicesCount = 0;
  for (const inv of invoices) {
    const metrics = ensureCurrency(inv.currency);
    const amountDue = typeof inv.amountDue === 'number' ? inv.amountDue : 0;
    const amountPaid = typeof inv.amountPaid === 'number' ? inv.amountPaid : 0;
    const balance = calculateOutstandingBalance(amountDue, amountPaid);

    if (inv.status !== 'void' && inv.status !== 'uncollectible') {
      metrics.totalInvoiced = round2(metrics.totalInvoiced + amountDue);
      metrics.totalCollected = round2(metrics.totalCollected + amountPaid);
      metrics.totalOutstanding = round2(metrics.totalOutstanding + balance);

      const refTime = new Date(referenceDate).getTime();
      const dueTime = new Date(inv.dueDate).getTime();
      if ((inv.status === 'overdue' || dueTime < refTime) && balance > 0) {
        overdueInvoicesCount++;
        metrics.overdueBalance = round2(metrics.overdueBalance + balance);
      }
    }
  }

  // 3. Status Distributions
  let activePaidSubscriptions = 0;
  let trialingSubscriptions = 0;
  let pastDueSubscriptions = 0;
  let suspendedSubscriptions = 0;
  let canceledSubscriptions = 0;
  let expiringTrialsCount = 0;
  let upcomingRenewalsCount = 0;

  for (const sub of subscriptions) {
    if (sub.status === 'active') activePaidSubscriptions++;
    else if (sub.status === 'trialing') {
      trialingSubscriptions++;
      const trial = getTrialStatus(sub, referenceDate);
      if (trial.daysRemaining <= 7 && trial.daysRemaining >= 0) {
        expiringTrialsCount++;
      }
    } else if (sub.status === 'past_due') pastDueSubscriptions++;
    else if (sub.status === 'suspended') suspendedSubscriptions++;
    else if (sub.status === 'canceled') canceledSubscriptions++;

    if (sub.status === 'active') {
      const renewal = getRenewalStatus(sub, referenceDate);
      if (renewal.isExpiringSoon) {
        upcomingRenewalsCount++;
      }
    }
  }

  // 4. Failed Payments
  const failedPaymentsCount = payments.filter((p) => p.status === 'failed').length;

  // 5. Plan Distributions
  const subscriptionsByPlan = plans.map((plan) => {
    const count = subscriptions.filter((s) => s.planId === plan.id).length;
    return {
      planId: plan.id,
      planName: plan.name,
      tier: plan.tier,
      count,
    };
  });

  const statuses: SubscriptionLifecycleStatus[] = [
    'active',
    'trialing',
    'past_due',
    'suspended',
    'canceled',
    'expired',
  ];
  const subscriptionsByStatus = statuses.map((status) => ({
    status,
    count: subscriptions.filter((s) => s.status === status).length,
  }));

  return {
    referenceDate,
    totalSubscriptions: subscriptions.length,
    activePaidSubscriptions,
    trialingSubscriptions,
    pastDueSubscriptions,
    suspendedSubscriptions,
    canceledSubscriptions,
    expiringTrialsCount,
    upcomingRenewalsCount,
    failedPaymentsCount,
    overdueInvoicesCount,
    currencyBreakdown,
    subscriptionsByPlan,
    subscriptionsByStatus,
    trialConversionRate: {
      isAvailable: false,
      cohortNote:
        'Historical cohort telemetry required for accurate conversion calculations is not yet provisioned in mock fixtures. Live conversion rate requires backend cohort tracking.',
    },
  };
}

/**
 * Validates a plan definition.
 */
export function validatePlanDefinition(
  plan: Partial<SubscriptionPlan>,
  existingPlans: SubscriptionPlan[] = []
): PlanValidationResult {
  const errors: string[] = [];

  if (!plan.name || plan.name.trim().length < 3) {
    errors.push('Plan name is required and must be at least 3 characters.');
  }

  if (plan.id) {
    const slugRegex = /^[a-z0-9_-]+$/;
    if (!slugRegex.test(plan.id)) {
      errors.push('Plan identifier must contain only lowercase alphanumeric characters, dashes, or underscores.');
    }
    const isDuplicate = existingPlans.some((p) => p.id === plan.id);
    if (isDuplicate) {
      errors.push(`A plan with identifier "${plan.id}" already exists.`);
    }

  }

  if (typeof plan.priceMonthly !== 'number' || plan.priceMonthly < 0) {
    errors.push('Monthly price must be a non-negative number.');
  }

  if (typeof plan.priceAnnual !== 'number' || plan.priceAnnual < 0) {
    errors.push('Annual price must be a non-negative number.');
  }

  if (!plan.currency || plan.currency.length !== 3) {
    errors.push('A valid 3-letter currency code (e.g. USD, GBP, EUR) is required.');
  }

  if (typeof plan.maxStudents === 'number' && plan.maxStudents <= 0) {
    errors.push('Maximum student capacity must be greater than zero.');
  }

  if (typeof plan.maxCampuses === 'number' && plan.maxCampuses <= 0) {
    errors.push('Maximum campus quota must be at least 1.');
  }

  if (typeof plan.trialDays === 'number' && plan.trialDays < 0) {
    errors.push('Trial days cannot be negative.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a discount policy.
 */
export function validateDiscountPolicy(
  discount: Partial<DiscountPolicy>,
  existingDiscounts: DiscountPolicy[] = []
): DiscountValidationResult {
  const errors: string[] = [];

  if (!discount.code || discount.code.trim().length < 3) {
    errors.push('Discount code is required and must be at least 3 characters.');
  } else {
    const codeRegex = /^[A-Z0-9_-]+$/;
    if (!codeRegex.test(discount.code.toUpperCase())) {
      errors.push('Discount code must contain only uppercase alphanumeric characters, dashes, or underscores.');
    }
    const isDuplicate = existingDiscounts.some(
      (d) =>
        d.code.toUpperCase() === discount.code?.toUpperCase() &&
        d.id !== discount.id
    );
    if (isDuplicate) {
      errors.push(`Discount code "${discount.code}" is already in use.`);
    }
  }

  if (!discount.name || discount.name.trim().length < 3) {
    errors.push('Discount name is required.');
  }

  if (discount.discountType === 'percentage') {
    if (typeof discount.value !== 'number' || discount.value <= 0 || discount.value > 100) {
      errors.push('Percentage discount must be between 1% and 100%.');
    }
  } else if (discount.discountType === 'fixed_amount') {
    if (typeof discount.value !== 'number' || discount.value <= 0) {
      errors.push('Fixed discount amount must be greater than zero.');
    }
    if (!discount.currency) {
      errors.push('Currency is required for fixed amount discounts.');
    }
  }

  if (discount.validFrom && discount.validUntil) {
    const from = new Date(discount.validFrom).getTime();
    const until = new Date(discount.validUntil).getTime();
    if (until <= from) {
      errors.push('Discount expiration date must be after the start date.');
    }
  }

  if (typeof discount.maxRedemptions === 'number' && discount.maxRedemptions <= 0) {
    errors.push('Maximum redemptions must be at least 1.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
