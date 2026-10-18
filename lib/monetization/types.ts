/**
 * Domain types and contracts for Phase E-09.11:
 * SaaS Subscriptions, Billing, and Monetization Governance.
 */

import { PlanTier } from '../types/subscriptions';

export type SubscriptionPlanStatus = 'published' | 'draft' | 'archived';

export type BillingFrequency = 'monthly' | 'quarterly' | 'annual';

export type SubscriptionLifecycleStatus =
  | 'draft'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'suspended'
  | 'canceled'
  | 'expired';

export type PaymentFailureCategory =
  | 'insufficient_funds'
  | 'card_expired'
  | 'gateway_timeout'
  | 'fraud_risk_hold'
  | 'do_not_honor'
  | 'network_error';

export type DiscountType = 'percentage' | 'fixed_amount';

export interface DiscountPolicy {
  id: string;
  code: string;
  name: string;
  discountType: DiscountType;
  value: number; // Percentage (e.g. 15 for 15%) or Fixed amount (e.g. 50 for $50)
  currency?: string; // Required for fixed_amount
  applicablePlans: string[]; // Plan IDs or ['all']
  validFrom: string; // ISO date
  validUntil: string; // ISO date
  maxRedemptions: number;
  currentRedemptions: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionLifecycleEvent {
  id: string;
  subscriptionId: string;
  organizationId: string;
  fromStatus: SubscriptionLifecycleStatus;
  toStatus: SubscriptionLifecycleStatus;
  reason: string;
  actor: string;
  timestamp: string;
}

export interface MonetizationCurrencyMetrics {
  currency: string;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annualized Run Rate (mrr * 12)
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  overdueBalance: number;
}

export interface MonetizationAnalyticsSummary {
  referenceDate: string;
  totalSubscriptions: number;
  activePaidSubscriptions: number;
  trialingSubscriptions: number;
  pastDueSubscriptions: number;
  suspendedSubscriptions: number;
  canceledSubscriptions: number;
  expiringTrialsCount: number; // <= 7 days
  upcomingRenewalsCount: number; // <= 30 days
  failedPaymentsCount: number;
  overdueInvoicesCount: number;
  currencyBreakdown: Record<string, MonetizationCurrencyMetrics>;
  subscriptionsByPlan: { planId: string; planName: string; tier: PlanTier; count: number }[];
  subscriptionsByStatus: { status: SubscriptionLifecycleStatus; count: number }[];
  trialConversionRate: {
    isAvailable: boolean;
    ratePercentage?: number;
    cohortNote: string;
  };
}

export interface CreatePlanInput {
  id?: string;
  name: string;
  tier: PlanTier;
  status?: SubscriptionPlanStatus;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  priceQuarterly?: number;
  currency: string;
  trialDays?: number;
  maxStudents: number;
  maxStaff: number;
  maxCampuses: number;
  storageGb: number;
  features?: string[];
  includedModuleIds?: string[];
  isPopular?: boolean;
}

export interface UpdatePlanInput {
  name?: string;
  tier?: PlanTier;
  status?: SubscriptionPlanStatus;
  description?: string;
  priceMonthly?: number;
  priceAnnual?: number;
  priceQuarterly?: number;
  currency?: string;
  trialDays?: number;
  maxStudents?: number;
  maxStaff?: number;
  maxCampuses?: number;
  storageGb?: number;
  features?: string[];
  includedModuleIds?: string[];
  isPopular?: boolean;
  isActive?: boolean;
}

export interface CreateDiscountInput {
  code: string;
  name: string;
  discountType: DiscountType;
  value: number;
  currency?: string;
  applicablePlans: string[];
  validFrom: string;
  validUntil: string;
  maxRedemptions: number;
  description?: string;
}

export interface PlanValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface DiscountValidationResult {
  isValid: boolean;
  errors: string[];
}
