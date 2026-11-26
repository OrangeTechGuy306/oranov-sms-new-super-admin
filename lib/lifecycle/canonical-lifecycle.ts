/**
 * Canonical SaaS Tenant Lifecycle State Machine & Access-State Specification (Phase P0-5)
 *
 * Strictly Frontend-Only: Defines authoritative tenant lifecycle states, metadata,
 * explicit transition rules, prerequisite evaluation, transition restrictions, audit event codes,
 * tenant dashboard access behaviors, and fail-closed unknown-state handling.
 *
 * Synced deterministically from `dashboard/lib/lifecycle/` to `frontend/lib/lifecycle/`
 * via `dashboard/scripts/build-registry.ts`. Do not edit the frontend copy manually.
 *
 * Future Backend Responsibility:
 * - Server-side enforcement of transition authorization, optimistic locking, immutable
 *   audit persistence, webhook dispatch, and transactional grace/cancellation jobs.
 */

export const CANONICAL_TENANT_LIFECYCLE_STATUSES = [
  "draft",
  "registration_pending",
  "onboarding_in_progress",
  "awaiting_configuration",
  "awaiting_activation",
  "trial",
  "active",
  "suspended",
  "cancellation_pending",
  "cancelled",
  "archived",
  "closed",
] as const;

export type CanonicalTenantLifecycleStatus =
  (typeof CANONICAL_TENANT_LIFECYCLE_STATUSES)[number];

/**
 * Legacy status values observed in prior phases (E-09.7 / P0-3 / P0-4) retained for
 * backward-compatible parsing while normalizing cleanly to canonical lifecycle states.
 */
export type LegacyOrganizationLifecycleStatus = "pending" | "inactive";

export type AnyTenantLifecycleStatus =
  | CanonicalTenantLifecycleStatus
  | LegacyOrganizationLifecycleStatus;

export type TenantAccessBehaviorMode =
  | "pre_onboarding_lock"
  | "registration_pending_lock"
  | "onboarding_guided"
  | "awaiting_configuration_guided"
  | "awaiting_activation_lock"
  | "full_access"
  | "suspended_lock"
  | "cancellation_wind_down"
  | "cancelled_lock"
  | "archived_readonly"
  | "closed_lock"
  | "unknown_safe_lock";

export type LegacyProjectedTenantStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE" | "ARCHIVED";

export type LifecycleBadgeTone = "success" | "info" | "warning" | "danger" | "neutral";

export interface TenantLifecycleStateMetadata {
  id: CanonicalTenantLifecycleStatus;
  label: string;
  shortLabel: string;
  description: string;
  badgeTone: LifecycleBadgeTone;
  accessBehavior: TenantAccessBehaviorMode;
  accessSummary: string;
  associatedSubscriptionExpectation: string;
  isOperationalAccessAllowed: boolean;
  isOnboardingAccessAllowed: boolean;
  isTerminal: boolean;
  legacyOrgStatus:
    | "draft"
    | "pending"
    | "active"
    | "suspended"
    | "inactive"
    | "archived";
  legacyTenantStatus: LegacyProjectedTenantStatus;
}

export const TENANT_LIFECYCLE_STATE_META: Record<
  CanonicalTenantLifecycleStatus,
  TenantLifecycleStateMetadata
> = {
  draft: {
    id: "draft",
    label: "Draft",
    shortLabel: "Draft",
    description:
      "Pre-submission organization draft saved by an operator prior to registration submission.",
    badgeTone: "neutral",
    accessBehavior: "pre_onboarding_lock",
    accessSummary:
      "Tenant portal access is disabled until the registration draft is submitted and accepted.",
    associatedSubscriptionExpectation:
      "Selected plan may be staged in draft without an active billing charge.",
    isOperationalAccessAllowed: false,
    isOnboardingAccessAllowed: false,
    isTerminal: false,
    legacyOrgStatus: "draft",
    legacyTenantStatus: "INACTIVE",
  },
  registration_pending: {
    id: "registration_pending",
    label: "Registration Pending",
    shortLabel: "Pending Review",
    description:
      "Registration has been submitted and awaits Super Admin verification before onboarding or activation.",
    badgeTone: "warning",
    accessBehavior: "registration_pending_lock",
    accessSummary:
      "Operational modules remain locked while platform operators review registration and institutional details.",
    associatedSubscriptionExpectation:
      "Subscription plan is staged (`pending_payment` or `trialing` pending approval).",
    isOperationalAccessAllowed: false,
    isOnboardingAccessAllowed: false,
    isTerminal: false,
    legacyOrgStatus: "pending",
    legacyTenantStatus: "INACTIVE",
  },
  onboarding_in_progress: {
    id: "onboarding_in_progress",
    label: "Onboarding In Progress",
    shortLabel: "Onboarding",
    description:
      "Organization registration accepted; school administrators are actively completing setup wizard steps.",
    badgeTone: "info",
    accessBehavior: "onboarding_guided",
    accessSummary:
      "Guided setup mode: authorized admins can access Onboarding Wizard, School Settings, and Campus setup.",
    associatedSubscriptionExpectation:
      "Typically paired with `trialing`, `active`, or staged `pending_payment` subscription.",
    isOperationalAccessAllowed: false,
    isOnboardingAccessAllowed: true,
    isTerminal: false,
    legacyOrgStatus: "pending",
    legacyTenantStatus: "INACTIVE",
  },
  awaiting_configuration: {
    id: "awaiting_configuration",
    label: "Awaiting Configuration",
    shortLabel: "Awaiting Config",
    description:
      "Requires mandatory institutional, campus, or academic configuration updates before activation.",
    badgeTone: "warning",
    accessBehavior: "awaiting_configuration_guided",
    accessSummary:
      "Daily operational routes are held; administrators can finish required setup in Onboarding & Settings.",
    associatedSubscriptionExpectation:
      "Subscription remains independent; setup blockers must clear before operational go-live.",
    isOperationalAccessAllowed: false,
    isOnboardingAccessAllowed: true,
    isTerminal: false,
    legacyOrgStatus: "inactive",
    legacyTenantStatus: "INACTIVE",
  },
  awaiting_activation: {
    id: "awaiting_activation",
    label: "Awaiting Activation",
    shortLabel: "Awaiting Activation",
    description:
      "Onboarding and readiness prerequisites are prepared and awaiting final Super Admin activation sign-off.",
    badgeTone: "info",
    accessBehavior: "awaiting_activation_lock",
    accessSummary:
      "Workspace awaits final Super Admin activation; admins can view onboarding review and subscription status.",
    associatedSubscriptionExpectation:
      "Subscription is assigned and ready; entitlement locks remain separate from activation hold.",
    isOperationalAccessAllowed: false,
    isOnboardingAccessAllowed: true,
    isTerminal: false,
    legacyOrgStatus: "pending",
    legacyTenantStatus: "INACTIVE",
  },
  trial: {
    id: "trial",
    label: "Trial Active",
    shortLabel: "Trial",
    description:
      "Controlled evaluation workspace with time-bound institutional access prior to paid conversion.",
    badgeTone: "info",
    accessBehavior: "full_access",
    accessSummary:
      "Operational modules enabled for trial scope according to trial subscription & P0-4 plan entitlements.",
    associatedSubscriptionExpectation:
      "Usually paired with `trialing` subscription; expired trial restricts features via entitlement engine.",
    isOperationalAccessAllowed: true,
    isOnboardingAccessAllowed: true,
    isTerminal: false,
    legacyOrgStatus: "active",
    legacyTenantStatus: "ACTIVE",
  },
  active: {
    id: "active",
    label: "Active",
    shortLabel: "Active",
    description:
      "Institution is live in production and accessible according to RBAC, campus scope, and subscription entitlements.",
    badgeTone: "success",
    accessBehavior: "full_access",
    accessSummary:
      "Full tenant access governed separately by P0-2 RBAC, campus scope, and P0-4 subscription entitlements.",
    associatedSubscriptionExpectation:
      "Typically `active` or `trialing`; an active tenant with an `expired` subscription enters subscription renewal hold without being marked suspended.",
    isOperationalAccessAllowed: true,
    isOnboardingAccessAllowed: true,
    isTerminal: false,
    legacyOrgStatus: "active",
    legacyTenantStatus: "ACTIVE",
  },
  suspended: {
    id: "suspended",
    label: "Suspended",
    shortLabel: "Suspended",
    description:
      "Operational access is administratively suspended due to compliance, policy, or prolonged delinquency.",
    badgeTone: "danger",
    accessBehavior: "suspended_lock",
    accessSummary:
      "Operational workspaces blocked with dedicated Suspension screen; profile & subscription review remain reachable for remediation.",
    associatedSubscriptionExpectation:
      "Subscription status (`expired`, `past_due`, or `suspended`) is tracked separately from administrative tenant suspension.",
    isOperationalAccessAllowed: false,
    isOnboardingAccessAllowed: false,
    isTerminal: false,
    legacyOrgStatus: "suspended",
    legacyTenantStatus: "SUSPENDED",
  },
  cancellation_pending: {
    id: "cancellation_pending",
    label: "Cancellation Pending",
    shortLabel: "Cancelling",
    description:
      "Contract cancellation requested; institution remains in a scheduled wind-down period until cancellation effective date.",
    badgeTone: "warning",
    accessBehavior: "cancellation_wind_down",
    accessSummary:
      "Operational access continues during wind-down with a persistent cancellation banner; records remain exportable.",
    associatedSubscriptionExpectation:
      "Subscription typically has `cancelAtPeriodEnd = true` while waiting for period end.",
    isOperationalAccessAllowed: true,
    isOnboardingAccessAllowed: false,
    isTerminal: false,
    legacyOrgStatus: "active",
    legacyTenantStatus: "ACTIVE",
  },
  cancelled: {
    id: "cancelled",
    label: "Cancelled",
    shortLabel: "Cancelled",
    description:
      "Institutional service has ended following cancellation; operational access is revoked pending archive or closure.",
    badgeTone: "danger",
    accessBehavior: "cancelled_lock",
    accessSummary:
      "Dedicated Cancelled screen displayed; operational modules locked while profile and billing history remain inspectable.",
    associatedSubscriptionExpectation:
      "Subscription expected to be `canceled` or `expired`; reinstatement requires formal review.",
    isOperationalAccessAllowed: false,
    isOnboardingAccessAllowed: false,
    isTerminal: false,
    legacyOrgStatus: "inactive",
    legacyTenantStatus: "INACTIVE",
  },
  archived: {
    id: "archived",
    label: "Archived",
    shortLabel: "Archived",
    description:
      "Historical institution record preserved read-only for audit retention; no active operational usage permitted.",
    badgeTone: "neutral",
    accessBehavior: "archived_readonly",
    accessSummary:
      "Dedicated Archived read-only state; active workflows blocked unless restored for review by Super Admin.",
    associatedSubscriptionExpectation:
      "Subscription must be inactive/canceled; no new recurring invoices are issued.",
    isOperationalAccessAllowed: false,
    isOnboardingAccessAllowed: false,
    isTerminal: false,
    legacyOrgStatus: "archived",
    legacyTenantStatus: "ARCHIVED",
  },
  closed: {
    id: "closed",
    label: "Closed",
    shortLabel: "Closed",
    description:
      "Permanent terminal institutional closure after offboarding and retention sign-off.",
    badgeTone: "danger",
    accessBehavior: "closed_lock",
    accessSummary:
      "Terminal state — all tenant operational and onboarding actions are permanently disabled.",
    associatedSubscriptionExpectation:
      "All subscriptions closed (`canceled`); historical ledger retained for compliance only.",
    isOperationalAccessAllowed: false,
    isOnboardingAccessAllowed: false,
    isTerminal: true,
    legacyOrgStatus: "archived",
    legacyTenantStatus: "ARCHIVED",
  },
};

export const UNKNOWN_LIFECYCLE_STATE_META = {
  id: "unknown" as const,
  label: "Unrecognized State",
  shortLabel: "Unknown",
  description:
    "The tenant lifecycle state value could not be matched to any supported canonical status and has failed closed.",
  badgeTone: "danger" as const,
  accessBehavior: "unknown_safe_lock" as const,
  accessSummary:
    "Fails closed safely. Contact platform operations to reconcile tenant lifecycle metadata.",
  isOperationalAccessAllowed: false,
  isOnboardingAccessAllowed: false,
  isTerminal: false,
};

const CANONICAL_STATUS_SET = new Set<string>(CANONICAL_TENANT_LIFECYCLE_STATUSES);

const LEGACY_LIFECYCLE_ALIASES: Record<string, CanonicalTenantLifecycleStatus> = {
  pending: "registration_pending",
  registration_pending: "registration_pending",
  inactive: "awaiting_configuration",
  awaiting_configuration: "awaiting_configuration",
  onboarding: "onboarding_in_progress",
  onboarding_in_progress: "onboarding_in_progress",
  pending_activation: "awaiting_activation",
  awaiting_activation: "awaiting_activation",
  canceled: "cancelled",
  cancelled: "cancelled",
};

/**
 * Safely normalizes any canonical or legacy lifecycle string into a canonical status,
 * returning `'unknown'` (never coercing garbage to `'active'`) on unrecognized input.
 */
export function normalizeTenantLifecycleStatus(
  rawStatus: unknown
): CanonicalTenantLifecycleStatus | "unknown" {
  if (typeof rawStatus !== "string") return "unknown";
  const normalized = rawStatus.trim().toLowerCase();
  if (!normalized) return "unknown";
  if (CANONICAL_STATUS_SET.has(normalized)) {
    return normalized as CanonicalTenantLifecycleStatus;
  }
  return LEGACY_LIFECYCLE_ALIASES[normalized] ?? "unknown";
}

export function getTenantLifecycleStateMeta(
  rawStatus: unknown
): TenantLifecycleStateMetadata | typeof UNKNOWN_LIFECYCLE_STATE_META {
  const canonical = normalizeTenantLifecycleStatus(rawStatus);
  if (canonical === "unknown") return UNKNOWN_LIFECYCLE_STATE_META;
  return TENANT_LIFECYCLE_STATE_META[canonical];
}

export interface LifecycleTransitionContext {
  readinessHasBlockers?: boolean;
  readinessBlockers?: string[];
  onboardingMandatoryComplete?: boolean;
  onboardingMissingLabels?: string[];
  hasSubscription?: boolean;
  confirmationCode?: string;
  expectedConfirmationCode?: string;
  actorPermissions?: string[];
}

export interface LifecycleTransitionRule {
  id: string;
  from: CanonicalTenantLifecycleStatus;
  to: CanonicalTenantLifecycleStatus;
  actionLabel: string;
  description: string;
  requiresReason: boolean;
  minReasonLength?: number;
  requiresConfirmationCode?: boolean;
  requireNoReadinessBlockers?: boolean;
  requireMandatoryOnboarding?: boolean;
  requireSubscriptionAssigned?: boolean;
  requiredPermissions?: string[];
  restrictions?: string[];
  associatedSubscriptionGuidance: string;
  auditEventAction: string;
  variant: "primary" | "success" | "warning" | "danger" | "neutral";
}

export const CANONICAL_LIFECYCLE_TRANSITION_RULES: LifecycleTransitionRule[] = [
  // Draft transitions
  {
    id: "draft_to_registration_pending",
    from: "draft",
    to: "registration_pending",
    actionLabel: "Submit Registration",
    description: "Submit saved tenant registration draft into operator verification queue.",
    requiresReason: false,
    requireSubscriptionAssigned: true,
    requiredPermissions: ["organizations.update", "organizations.lifecycle.manage"],
    restrictions: ["Requires at least one designated main campus and valid primary administrator."],
    associatedSubscriptionGuidance: "Staged subscription remains `pending_payment` or `trialing`.",
    auditEventAction: "ORGANIZATION_SUBMITTED_FOR_REVIEW",
    variant: "primary",
  },
  {
    id: "draft_to_onboarding",
    from: "draft",
    to: "onboarding_in_progress",
    actionLabel: "Open Guided Onboarding",
    description: "Move draft directly into guided tenant onboarding configuration.",
    requiresReason: false,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Subscription remains staged until onboarding & activation complete.",
    auditEventAction: "ORGANIZATION_ONBOARDING_STARTED",
    variant: "primary",
  },
  {
    id: "draft_to_awaiting_config",
    from: "draft",
    to: "awaiting_configuration",
    actionLabel: "Flag for Configuration",
    description: "Mark draft as awaiting mandatory institutional configuration items.",
    requiresReason: false,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Billing remains inactive while configuration is pending.",
    auditEventAction: "ORGANIZATION_FLAGGED_AWAITING_CONFIG",
    variant: "warning",
  },
  {
    id: "draft_to_closed",
    from: "draft",
    to: "closed",
    actionLabel: "Close Draft Permanently",
    description: "Discard abandoned draft record cleanly with closure reason.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Associated staged subscription cancelled with no invoice balance.",
    auditEventAction: "ORGANIZATION_CLOSED",
    variant: "danger",
  },

  // Registration pending transitions
  {
    id: "reg_pending_to_onboarding",
    from: "registration_pending",
    to: "onboarding_in_progress",
    actionLabel: "Accept & Start Onboarding",
    description: "Approve registration intake and unlock guided tenant onboarding workspace.",
    requiresReason: false,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Trial or initial subscription period can begin or stay staged.",
    auditEventAction: "ORGANIZATION_ONBOARDING_STARTED",
    variant: "primary",
  },
  {
    id: "reg_pending_to_awaiting_config",
    from: "registration_pending",
    to: "awaiting_configuration",
    actionLabel: "Request Configuration Updates",
    description: "Return registration to awaiting configuration for incomplete profile or campus details.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Subscription activation held until configuration updates are provided.",
    auditEventAction: "ORGANIZATION_RETURNED_FOR_CONFIGURATION",
    variant: "warning",
  },
  {
    id: "reg_pending_to_awaiting_activation",
    from: "registration_pending",
    to: "awaiting_activation",
    actionLabel: "Mark Ready for Activation",
    description: "Advance verified registration to final activation queue.",
    requiresReason: false,
    requireNoReadinessBlockers: true,
    requiredPermissions: ["organizations.lifecycle.manage"],
    restrictions: ["Blocked when platform readiness evaluation reports critical blockers."],
    associatedSubscriptionGuidance: "Subscription plan must be assigned prior to go-live.",
    auditEventAction: "ORGANIZATION_MARKED_AWAITING_ACTIVATION",
    variant: "primary",
  },
  {
    id: "reg_pending_to_trial",
    from: "registration_pending",
    to: "trial",
    actionLabel: "Approve & Start Trial",
    description: "Grant immediate time-bounded trial access after registration verification.",
    requiresReason: false,
    requireNoReadinessBlockers: true,
    requireSubscriptionAssigned: true,
    requiredPermissions: ["organizations.lifecycle.manage"],
    restrictions: ["Requires assigned subscription plan and zero readiness blockers."],
    associatedSubscriptionGuidance: "Subscription expected in `trialing` state.",
    auditEventAction: "ORGANIZATION_TRIAL_ACTIVATED",
    variant: "primary",
  },
  {
    id: "reg_pending_to_active",
    from: "registration_pending",
    to: "active",
    actionLabel: "Approve & Activate",
    description: "Approve verified institution and activate production tenant operations.",
    requiresReason: false,
    requireNoReadinessBlockers: true,
    requireSubscriptionAssigned: true,
    requiredPermissions: ["organizations.lifecycle.manage"],
    restrictions: ["Blocked when readiness checks contain missing campuses, subscription, or admin."],
    associatedSubscriptionGuidance: "Subscription operates independently in `active` or `trialing` state.",
    auditEventAction: "ORGANIZATION_ACTIVATED",
    variant: "success",
  },
  {
    id: "reg_pending_to_cancelled",
    from: "registration_pending",
    to: "cancelled",
    actionLabel: "Reject & Cancel Registration",
    description: "Decline registration request and cancel onboarding intake.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Associated pending subscription cancelled.",
    auditEventAction: "ORGANIZATION_REGISTRATION_REJECTED",
    variant: "danger",
  },

  // Onboarding in progress transitions
  {
    id: "onboarding_to_awaiting_config",
    from: "onboarding_in_progress",
    to: "awaiting_configuration",
    actionLabel: "Hold for Configuration",
    description: "Place onboarding on configuration hold until mandatory items are remediated.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Trial clock handling remains governed by subscription settings.",
    auditEventAction: "ORGANIZATION_FLAGGED_AWAITING_CONFIG",
    variant: "warning",
  },
  {
    id: "onboarding_to_awaiting_activation",
    from: "onboarding_in_progress",
    to: "awaiting_activation",
    actionLabel: "Submit for Activation",
    description: "Advance onboarding tenant to Super Admin final activation review.",
    requiresReason: false,
    requireMandatoryOnboarding: true,
    requireNoReadinessBlockers: true,
    requiredPermissions: ["organizations.lifecycle.manage"],
    restrictions: ["Requires all mandatory institution onboarding checklist steps complete."],
    associatedSubscriptionGuidance: "Plan and entitlements prepared for activation.",
    auditEventAction: "ORGANIZATION_MARKED_AWAITING_ACTIVATION",
    variant: "primary",
  },
  {
    id: "onboarding_to_trial",
    from: "onboarding_in_progress",
    to: "trial",
    actionLabel: "Activate Controlled Trial",
    description: "Allow trial operational evaluation while institution finishes optional setup.",
    requiresReason: false,
    requireNoReadinessBlockers: true,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Trial access respects canonical subscription end date.",
    auditEventAction: "ORGANIZATION_TRIAL_ACTIVATED",
    variant: "primary",
  },
  {
    id: "onboarding_to_active",
    from: "onboarding_in_progress",
    to: "active",
    actionLabel: "Complete Onboarding & Activate",
    description: "Finalize onboarding and open full institutional access.",
    requiresReason: false,
    requireMandatoryOnboarding: true,
    requireNoReadinessBlockers: true,
    requireSubscriptionAssigned: true,
    requiredPermissions: ["organizations.lifecycle.manage"],
    restrictions: ["Mandatory onboarding tasks and readiness checks must pass."],
    associatedSubscriptionGuidance: "Live entitlements activate from assigned P0-4 plan.",
    auditEventAction: "ORGANIZATION_ACTIVATED",
    variant: "success",
  },
  {
    id: "onboarding_to_cancelled",
    from: "onboarding_in_progress",
    to: "cancelled",
    actionLabel: "Cancel Onboarding",
    description: "Terminate onboarding process prior to go-live.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Subscription cancelled upon onboarding termination.",
    auditEventAction: "ORGANIZATION_CANCELLED",
    variant: "danger",
  },

  // Awaiting configuration transitions
  {
    id: "awaiting_config_to_onboarding",
    from: "awaiting_configuration",
    to: "onboarding_in_progress",
    actionLabel: "Resume Onboarding",
    description: "Re-open guided onboarding wizard to complete configuration.",
    requiresReason: false,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Subscription state preserved across onboarding resume.",
    auditEventAction: "ORGANIZATION_ONBOARDING_STARTED",
    variant: "primary",
  },
  {
    id: "awaiting_config_to_awaiting_activation",
    from: "awaiting_configuration",
    to: "awaiting_activation",
    actionLabel: "Mark Ready for Activation",
    description: "Confirm configuration gaps resolved and queue for final activation.",
    requiresReason: false,
    requireNoReadinessBlockers: true,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Subscription must be staged prior to activation.",
    auditEventAction: "ORGANIZATION_MARKED_AWAITING_ACTIVATION",
    variant: "primary",
  },
  {
    id: "awaiting_config_to_active",
    from: "awaiting_configuration",
    to: "active",
    actionLabel: "Verify & Activate",
    description: "Complete configuration verification and activate live workspace.",
    requiresReason: false,
    requireNoReadinessBlockers: true,
    requireSubscriptionAssigned: true,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Active or trialing subscription required for normal entitlement operation.",
    auditEventAction: "ORGANIZATION_ACTIVATED",
    variant: "success",
  },
  {
    id: "awaiting_config_to_archived",
    from: "awaiting_configuration",
    to: "archived",
    actionLabel: "Archive Organization",
    description: "Archive inactive/unconfigured organization for compliance retention.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "No billing invoices generated while archived.",
    auditEventAction: "ORGANIZATION_ARCHIVED",
    variant: "danger",
  },

  // Awaiting activation transitions
  {
    id: "awaiting_activation_to_active",
    from: "awaiting_activation",
    to: "active",
    actionLabel: "Activate Live Workspace",
    description: "Complete Super Admin final approval and open live institutional operations.",
    requiresReason: false,
    requireNoReadinessBlockers: true,
    requireSubscriptionAssigned: true,
    requiredPermissions: ["organizations.lifecycle.manage"],
    restrictions: ["Readiness checks and plan assignment must be complete."],
    associatedSubscriptionGuidance: "Live P0-4 plan entitlements become effective.",
    auditEventAction: "ORGANIZATION_ACTIVATED",
    variant: "success",
  },
  {
    id: "awaiting_activation_to_trial",
    from: "awaiting_activation",
    to: "trial",
    actionLabel: "Start Controlled Trial",
    description: "Open evaluation trial access ahead of commercial billing activation.",
    requiresReason: false,
    requireNoReadinessBlockers: true,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Subscription should remain `trialing` with trial end date.",
    auditEventAction: "ORGANIZATION_TRIAL_ACTIVATED",
    variant: "primary",
  },
  {
    id: "awaiting_activation_to_awaiting_config",
    from: "awaiting_activation",
    to: "awaiting_configuration",
    actionLabel: "Return for Configuration",
    description: "Send back to configuration review if readiness issues are discovered.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Subscription remains unchanged during review return.",
    auditEventAction: "ORGANIZATION_RETURNED_FOR_CONFIGURATION",
    variant: "warning",
  },
  {
    id: "awaiting_activation_to_cancelled",
    from: "awaiting_activation",
    to: "cancelled",
    actionLabel: "Cancel Prior to Activation",
    description: "Cancel organization launch before going live.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Cancel associated staged subscription.",
    auditEventAction: "ORGANIZATION_CANCELLED",
    variant: "danger",
  },

  // Trial transitions
  {
    id: "trial_to_active",
    from: "trial",
    to: "active",
    actionLabel: "Convert Trial to Active",
    description: "Graduate organization from evaluation trial to full production lifecycle.",
    requiresReason: false,
    requireNoReadinessBlockers: true,
    requireSubscriptionAssigned: true,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Subscription should convert to `active` upon billing confirmation.",
    auditEventAction: "ORGANIZATION_TRIAL_CONVERTED",
    variant: "success",
  },
  {
    id: "trial_to_suspended",
    from: "trial",
    to: "suspended",
    actionLabel: "Suspend Trial",
    description: "Immediately suspend trial institution access for policy or abuse review.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Trial expiry date continues independently.",
    auditEventAction: "ORGANIZATION_SUSPENDED",
    variant: "danger",
  },
  {
    id: "trial_to_cancellation_pending",
    from: "trial",
    to: "cancellation_pending",
    actionLabel: "Schedule Trial Cancellation",
    description: "Mark trial to terminate cleanly at period end without auto-conversion.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Mark subscription `cancelAtPeriodEnd`.",
    auditEventAction: "ORGANIZATION_CANCELLATION_SCHEDULED",
    variant: "warning",
  },
  {
    id: "trial_to_cancelled",
    from: "trial",
    to: "cancelled",
    actionLabel: "Cancel Trial Immediately",
    description: "End trial access immediately and revoke operational modules.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Subscription terminated immediately.",
    auditEventAction: "ORGANIZATION_CANCELLED",
    variant: "danger",
  },

  // Active transitions
  {
    id: "active_to_suspended",
    from: "active",
    to: "suspended",
    actionLabel: "Suspend Organization",
    description:
      "Immediately restrict tenant workspace access due to policy breach, compliance audit, or overdue escalation.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    restrictions: ["Mandatory justification >= 5 characters required for audit trail."],
    associatedSubscriptionGuidance:
      "Subscription billing status remains tracked independently from administrative suspension.",
    auditEventAction: "ORGANIZATION_SUSPENDED",
    variant: "danger",
  },
  {
    id: "active_to_cancellation_pending",
    from: "active",
    to: "cancellation_pending",
    actionLabel: "Schedule Cancellation",
    description:
      "Schedule institutional offboarding at period end while preserving export/wind-down access.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Pair with subscription `cancelAtPeriodEnd` notice.",
    auditEventAction: "ORGANIZATION_CANCELLATION_SCHEDULED",
    variant: "warning",
  },
  {
    id: "active_to_awaiting_config",
    from: "active",
    to: "awaiting_configuration",
    actionLabel: "Hold for Configuration Audit",
    description: "Temporarily pause live access while critical institutional configuration is corrected.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Subscription period remains unaffected unless paused separately.",
    auditEventAction: "ORGANIZATION_RETURNED_FOR_CONFIGURATION",
    variant: "warning",
  },
  {
    id: "active_to_archived",
    from: "active",
    to: "archived",
    actionLabel: "Decommission to Archive",
    description: "Decommission school to permanent read-only archival storage.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Close active subscription billing before archival.",
    auditEventAction: "ORGANIZATION_ARCHIVED",
    variant: "danger",
  },

  // Suspended transitions
  {
    id: "suspended_to_active",
    from: "suspended",
    to: "active",
    actionLabel: "Reactivate Operations",
    description: "Restore tenant access following compliance clearance or billing remediation.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance:
      "If subscription is `expired`, tenant still sees renewal notice after reactivation (lifecycle != subscription).",
    auditEventAction: "ORGANIZATION_REACTIVATED",
    variant: "success",
  },
  {
    id: "suspended_to_awaiting_config",
    from: "suspended",
    to: "awaiting_configuration",
    actionLabel: "Reopen for Configuration",
    description: "Transition suspended school into remediation configuration mode.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Subscription remains independent during remediation.",
    auditEventAction: "ORGANIZATION_RETURNED_FOR_CONFIGURATION",
    variant: "warning",
  },
  {
    id: "suspended_to_cancellation_pending",
    from: "suspended",
    to: "cancellation_pending",
    actionLabel: "Schedule Offboarding Cancellation",
    description: "Move suspended tenant to formal cancellation notice window.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Align subscription end-of-term cancellation.",
    auditEventAction: "ORGANIZATION_CANCELLATION_SCHEDULED",
    variant: "warning",
  },
  {
    id: "suspended_to_cancelled",
    from: "suspended",
    to: "cancelled",
    actionLabel: "Cancel Suspended Tenant",
    description: "Finalize service cancellation after unresolved suspension.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Subscription marked `canceled`.",
    auditEventAction: "ORGANIZATION_CANCELLED",
    variant: "danger",
  },
  {
    id: "suspended_to_archived",
    from: "suspended",
    to: "archived",
    actionLabel: "Move to Permanent Archive",
    description: "Transition suspended record into historical read-only archive.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Ensure subscription billing halted.",
    auditEventAction: "ORGANIZATION_ARCHIVED",
    variant: "danger",
  },

  // Cancellation pending transitions
  {
    id: "cancel_pending_to_active",
    from: "cancellation_pending",
    to: "active",
    actionLabel: "Rescind Cancellation & Restore",
    description: "Withdraw scheduled cancellation and continue active service.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Clear `cancelAtPeriodEnd` on subscription record.",
    auditEventAction: "ORGANIZATION_CANCELLATION_RESCINDED",
    variant: "success",
  },
  {
    id: "cancel_pending_to_cancelled",
    from: "cancellation_pending",
    to: "cancelled",
    actionLabel: "Finalize Cancellation",
    description: "Execute cancellation upon effective termination date.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Subscription transitions to `canceled`.",
    auditEventAction: "ORGANIZATION_CANCELLED",
    variant: "danger",
  },
  {
    id: "cancel_pending_to_suspended",
    from: "cancellation_pending",
    to: "suspended",
    actionLabel: "Suspend During Wind-Down",
    description: "Lock workspace early if compliance issues arise during cancellation period.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Cancellation schedule preserved separately.",
    auditEventAction: "ORGANIZATION_SUSPENDED",
    variant: "danger",
  },

  // Cancelled transitions
  {
    id: "cancelled_to_awaiting_config",
    from: "cancelled",
    to: "awaiting_configuration",
    actionLabel: "Reopen for Review",
    description: "Reinstate cancelled institution into configuration verification before re-activation.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "Requires fresh subscription activation/renewal before go-live.",
    auditEventAction: "ORGANIZATION_RESTORED_FOR_REVIEW",
    variant: "warning",
  },
  {
    id: "cancelled_to_archived",
    from: "cancelled",
    to: "archived",
    actionLabel: "Archive Cancelled Record",
    description: "Move cancelled institution into long-term read-only archival storage.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    associatedSubscriptionGuidance: "All billing remains terminated.",
    auditEventAction: "ORGANIZATION_ARCHIVED",
    variant: "neutral",
  },
  {
    id: "cancelled_to_closed",
    from: "cancelled",
    to: "closed",
    actionLabel: "Permanently Close Institution",
    description: "Close institutional tenant permanently after retention sign-off (terminal).",
    requiresReason: true,
    minReasonLength: 10,
    requiresConfirmationCode: true,
    requiredPermissions: ["organizations.lifecycle.manage"],
    restrictions: [
      "Irreversible terminal transition.",
      "Requires confirmation matching organization code and >= 10 character audit reason.",
    ],
    associatedSubscriptionGuidance: "Subscription remains `canceled`.",
    auditEventAction: "ORGANIZATION_CLOSED",
    variant: "danger",
  },

  // Archived transitions
  {
    id: "archived_to_awaiting_config",
    from: "archived",
    to: "awaiting_configuration",
    actionLabel: "Restore for Configuration Review",
    description: "Bring archived organization out of cold storage into review/configuration mode.",
    requiresReason: true,
    minReasonLength: 5,
    requiredPermissions: ["organizations.lifecycle.manage"],
    restrictions: ["Archived entities cannot jump directly to Active without configuration verification."],
    associatedSubscriptionGuidance: "New or renewed subscription assignment needed prior to activation.",
    auditEventAction: "ORGANIZATION_RESTORED_FOR_REVIEW",
    variant: "warning",
  },
  {
    id: "archived_to_closed",
    from: "archived",
    to: "closed",
    actionLabel: "Permanently Close Archived Tenant",
    description: "Finalize permanent institutional closure (terminal, irreversible).",
    requiresReason: true,
    minReasonLength: 10,
    requiresConfirmationCode: true,
    requiredPermissions: ["organizations.lifecycle.manage"],
    restrictions: [
      "Irreversible terminal transition.",
      "Requires confirmation matching organization code and >= 10 character audit reason.",
    ],
    associatedSubscriptionGuidance: "All financial ledgers frozen.",
    auditEventAction: "ORGANIZATION_CLOSED",
    variant: "danger",
  },
];

export interface LifecycleEvaluationResult {
  permitted: boolean;
  fromStatus: CanonicalTenantLifecycleStatus | "unknown";
  toStatus: CanonicalTenantLifecycleStatus | "unknown";
  rule?: LifecycleTransitionRule;
  reasonRequired: boolean;
  confirmationRequired: boolean;
  unknownState?: boolean;
  failedPrerequisites?: string[];
  error?: string;
}

export function getAvailableCanonicalTransitions(
  currentStatus: unknown
): LifecycleTransitionRule[] {
  const canonicalCurrent = normalizeTenantLifecycleStatus(currentStatus);
  if (canonicalCurrent === "unknown") {
    return [];
  }
  return CANONICAL_LIFECYCLE_TRANSITION_RULES.filter(
    (rule) => rule.from === canonicalCurrent
  );
}

export function evaluateCanonicalLifecycleTransition(
  rawCurrentStatus: unknown,
  rawTargetStatus: unknown,
  reason?: string,
  context?: LifecycleTransitionContext
): LifecycleEvaluationResult {
  const fromStatus = normalizeTenantLifecycleStatus(rawCurrentStatus);
  const toStatus = normalizeTenantLifecycleStatus(rawTargetStatus);

  if (fromStatus === "unknown") {
    return {
      permitted: false,
      fromStatus,
      toStatus,
      reasonRequired: false,
      confirmationRequired: false,
      unknownState: true,
      error: `Unrecognized current lifecycle state ("${String(rawCurrentStatus)}"). Transitions are blocked fail-closed.`,
    };
  }

  if (toStatus === "unknown") {
    return {
      permitted: false,
      fromStatus,
      toStatus,
      reasonRequired: false,
      confirmationRequired: false,
      unknownState: true,
      error: `Unrecognized target lifecycle state ("${String(rawTargetStatus)}").`,
    };
  }

  if (fromStatus === toStatus) {
    return {
      permitted: false,
      fromStatus,
      toStatus,
      reasonRequired: false,
      confirmationRequired: false,
      error: `Organization is already in "${TENANT_LIFECYCLE_STATE_META[fromStatus].label}" status.`,
    };
  }

  const rule = CANONICAL_LIFECYCLE_TRANSITION_RULES.find(
    (r) => r.from === fromStatus && r.to === toStatus
  );

  if (!rule) {
    const allowed = getAvailableCanonicalTransitions(fromStatus).map((r) => `"${r.to}"`);
    return {
      permitted: false,
      fromStatus,
      toStatus,
      reasonRequired: false,
      confirmationRequired: false,
      error: `Invalid lifecycle transition: Cannot transition directly from "${fromStatus}" to "${toStatus}". Permitted transitions: ${allowed.length > 0 ? allowed.join(", ") : "None (terminal state)"}.`,
    };
  }

  const trimmedReason = (reason ?? "").trim();
  if (rule.requiresReason) {
    const minLen = rule.minReasonLength ?? 5;
    if (!trimmedReason) {
      return {
        permitted: false,
        fromStatus,
        toStatus,
        rule,
        reasonRequired: true,
        confirmationRequired: Boolean(rule.requiresConfirmationCode),
        error: `A clear audit reason is mandatory when performing "${rule.actionLabel}".`,
      };
    }
    if (trimmedReason.length < minLen) {
      return {
        permitted: false,
        fromStatus,
        toStatus,
        rule,
        reasonRequired: true,
        confirmationRequired: Boolean(rule.requiresConfirmationCode),
        error: `Audit justification must be sufficiently descriptive (min ${minLen} characters).`,
      };
    }
  }

  const failedPrerequisites: string[] = [];

  if (context) {
    if (
      rule.requiredPermissions &&
      rule.requiredPermissions.length > 0 &&
      context.actorPermissions
    ) {
      const permSet = new Set(context.actorPermissions);
      const hasPerm =
        permSet.has("*") ||
        rule.requiredPermissions.some((p) => permSet.has(p));
      if (!hasPerm) {
        failedPrerequisites.push(
          `Missing required permission (${rule.requiredPermissions.join(" or ")}).`
        );
      }
    }

    if (rule.requireNoReadinessBlockers && context.readinessHasBlockers) {
      const details =
        context.readinessBlockers && context.readinessBlockers.length > 0
          ? `: ${context.readinessBlockers.join("; ")}`
          : "";
      failedPrerequisites.push(`Readiness prerequisites have unresolved blockers${details}.`);
    }

    if (rule.requireMandatoryOnboarding && context.onboardingMandatoryComplete === false) {
      const missing =
        context.onboardingMissingLabels && context.onboardingMissingLabels.length > 0
          ? `: ${context.onboardingMissingLabels.join(", ")}`
          : "";
      failedPrerequisites.push(`Mandatory onboarding steps are incomplete${missing}.`);
    }

    if (rule.requireSubscriptionAssigned && context.hasSubscription === false) {
      failedPrerequisites.push("A subscription plan assignment is required prior to this transition.");
    }

    if (rule.requiresConfirmationCode) {
      const provided = (context.confirmationCode ?? "").trim().toUpperCase();
      const expected = (context.expectedConfirmationCode ?? "").trim().toUpperCase();
      if (!expected || provided !== expected) {
        failedPrerequisites.push(
          expected
            ? `Confirmation code mismatch — type "${expected}" to confirm irreversible closure.`
            : "Confirmation code is required for irreversible closure."
        );
      }
    }
  }

  if (failedPrerequisites.length > 0) {
    return {
      permitted: false,
      fromStatus,
      toStatus,
      rule,
      reasonRequired: rule.requiresReason,
      confirmationRequired: Boolean(rule.requiresConfirmationCode),
      failedPrerequisites,
      error: failedPrerequisites.join(" "),
    };
  }

  return {
    permitted: true,
    fromStatus,
    toStatus,
    rule,
    reasonRequired: rule.requiresReason,
    confirmationRequired: Boolean(rule.requiresConfirmationCode),
  };
}
