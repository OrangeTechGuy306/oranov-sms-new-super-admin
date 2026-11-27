/**
 * Domain contracts for Subscriptions, Plans, Invoices, and Payments.
 * Distinguishes conceptual boundaries: Plans, Subscriptions, Invoices, and Payments.
 */

import type { CanonicalPlanTier, CanonicalSchoolType } from '../modules/canonical-contract';

export type PlanTier = 'starter' | 'growth' | 'enterprise' | 'custom';

export type SubscriptionStatus =
  | 'draft'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'suspended'
  | 'canceled'
  | 'expired';

export type BillingCycle = 'monthly' | 'quarterly' | 'annual';

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'void' | 'uncollectible';

export type PaymentMethodType = 'card' | 'bank_transfer' | 'cheque' | 'manual_invoice';

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limitLabel?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: PlanTier;
  normalizedTier?: CanonicalPlanTier;
  status?: 'published' | 'draft' | 'deprecated' | 'archived';
  visibility?: 'public' | 'private' | 'internal_only';
  description: string;
  billingIntervals?: ('monthly' | 'quarterly' | 'annual')[];
  priceMonthly: number; // in USD or configured currency
  priceAnnual: number;  // in USD or configured currency
  priceQuarterly?: number;
  currency: string;
  trialDays?: number;
  targetSchoolTypes?: CanonicalSchoolType[];
  maxStudents: number;
  maxStaff: number;
  maxCampuses: number;
  storageGb: number;
  features: string[];
  includedModuleIds?: string[];
  includedFeatureIds?: string[];
  optionalAddOnModuleIds?: string[];
  optionalAddOnFeatureIds?: string[];
  upgradeToPlanIds?: string[];
  downgradeToPlanIds?: string[];
  version?: number;
  commercialPricingNote?: string;
  isPopular?: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationAddOnRecord {
  id: string;
  moduleId?: string;
  featureId?: string;
  name: string;
  status: 'active' | 'expired' | 'canceled' | 'pending';
  startDate: string;
  expiryDate?: string;
  priceMonthly?: number;
  currency?: string;
}

export interface OrganizationSubscription {
  id: string;
  organizationId: string;
  planId: string;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  cancellationReason?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  gracePeriodEnd?: string;
  activeAddOns?: OrganizationAddOnRecord[];
  assignedByUserId?: string;
  appliedDiscountCode?: string;
  notes?: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-001"
  organizationId: string;
  subscriptionId?: string;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  discountCode?: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  lineItems: InvoiceLineItem[];
  notes?: string;
  voidReason?: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  organizationId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  method: PaymentMethodType;
  referenceNumber: string;
  processedAt: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  failureCategory?:
    | 'insufficient_funds'
    | 'card_expired'
    | 'gateway_timeout'
    | 'fraud_risk_hold'
    | 'do_not_honor'
    | 'network_error';
  failureReason?: string;
  retryCount?: number;
  maxRetries?: number;
  isRetryEligible?: boolean;
  providerName?: string;
  notes?: string;
}

