import type {
  AnyTenantLifecycleStatus,
  CanonicalTenantLifecycleStatus,
  LegacyOrganizationLifecycleStatus,
} from "../lifecycle/canonical-lifecycle";
import type { OnboardingChecklistItemId } from "../lifecycle/canonical-onboarding";
import type { CanonicalSchoolType } from "../modules/canonical-contract";
import type { SubscriptionStatus } from "./subscriptions";

export type OrganizationLifecycleStatus = AnyTenantLifecycleStatus;

export type ProvisioningStatus =
  | "not_started"
  | "ready_for_review"
  | "simulated_in_progress"
  | "simulated_complete"
  | "simulated_failed"
  | "needs_attention";

export type OnboardingStatus =
  | "not_started"
  | "in_progress"
  | "verification_pending"
  | "completed";

export type SchoolClassification =
  | CanonicalSchoolType
  | "k12"
  | "higher_education";

export type OrganizationOwnershipType =
  | "private"
  | "public"
  | "faith_based"
  | "non_profit"
  | "corporate"
  | "network"
  | "government";

export type OrganizationPaymentStatus =
  | "paid"
  | "pending"
  | "overdue"
  | "failed"
  | "trial_no_charge"
  | "waived"
  | "refunded"
  | "unbilled";

export interface OrganizationAcademicSetupSummary {
  sessionsCount: number;
  termsCount: number;
  classesOrProgrammesCount: number;
  subjectsOrModulesCount: number;
  staffSetupCount: number;
  hasBranding?: boolean;
  settingsReviewed?: boolean;
  skippedItemIds?: OnboardingChecklistItemId[];
}

export interface OrganizationContact {
  email: string;
  phone: string;
  address: string;
  city: string;
  stateOrProvince: string;
  country: string;
  postalCode?: string;
  website?: string;
}

export interface PrimaryAdmin {
  name: string;
  email: string;
  phone: string;
  roleTitle: string;
}

export interface TechnicalConfig {
  subdomain: string;
  customDomain?: string;
  sslStatus?: 'simulated_active' | 'pending' | 'not_requested';
  timezone: string;
  academicYearStartMonth: number;
  currency: string;
  locale: string;
  maxCampuses: number;
}

export interface Organization {
  id: string;
  name: string;
  legalName?: string;
  code: string;
  logoUrl?: string;
  organizationType?: OrganizationOwnershipType;
  classification: SchoolClassification;
  /** Supports combined multi-category schools without forcing a single category. */
  institutionCategories?: CanonicalSchoolType[];
  subdomain: string;
  status: OrganizationLifecycleStatus;
  onboardingStatus: OnboardingStatus;
  provisioningStatus?: ProvisioningStatus;
  /** Explicitly separated from lifecycle status (P0-5 Section 4). */
  subscriptionStatus?: SubscriptionStatus;
  paymentStatus?: OrganizationPaymentStatus;
  planId: string;
  contact: OrganizationContact;
  administrator: PrimaryAdmin;
  technicalConfig: TechnicalConfig;
  studentCountEstimate?: number;
  staffCountEstimate?: number;
  stats?: {
    campusesCount: number;
    studentsCount: number;
    staffCount: number;
    storageUsedGb: number;
  };
  academicSetup?: OrganizationAcademicSetupSummary;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  suspendedReason?: string;
  cancellationRequestedAt?: string;
  cancellationEffectiveAt?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  archivedAt?: string;
  archivedReason?: string;
  closedAt?: string;
  closedReason?: string;
  notes?: string;
}

export interface CreateOrganizationInput {
  name: string;
  legalName?: string;
  code: string;
  organizationType?: OrganizationOwnershipType;
  classification: SchoolClassification;
  institutionCategories?: CanonicalSchoolType[];
  subdomain: string;
  /** Draft vs registration submission vs immediate review staging */
  initialLifecycleStatus?: Extract<
    CanonicalTenantLifecycleStatus,
    "draft" | "registration_pending" | "onboarding_in_progress"
  >;
  contact: OrganizationContact;
  administrator: PrimaryAdmin;
  initialCampus?: {
    name: string;
    code: string;
    type?: "main" | "branch" | "virtual" | "specialized";
    street?: string;
    city?: string;
    stateOrProvince?: string;
    country?: string;
    postalCode?: string;
    studentCapacity?: number;
  };
  planId: string;
  billingCycle: "monthly" | "annual";
  startTrial?: boolean;
  technicalConfig: TechnicalConfig;
  notes?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  legalName?: string;
  organizationType?: OrganizationOwnershipType;
  classification?: SchoolClassification;
  institutionCategories?: CanonicalSchoolType[];
  status?: OrganizationLifecycleStatus;
  onboardingStatus?: OnboardingStatus;
  provisioningStatus?: ProvisioningStatus;
  subscriptionStatus?: SubscriptionStatus;
  paymentStatus?: OrganizationPaymentStatus;
  planId?: string;
  contact?: Partial<OrganizationContact>;
  administrator?: Partial<PrimaryAdmin>;
  technicalConfig?: Partial<TechnicalConfig>;
  academicSetup?: Partial<OrganizationAcademicSetupSummary>;
  notes?: string;
}

export type { CanonicalTenantLifecycleStatus, LegacyOrganizationLifecycleStatus };
