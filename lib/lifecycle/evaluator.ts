/**
 * Tenant Lifecycle State Machine & Transition Evaluation Engine (Phase P0-5)
 *
 * Bridges Super Admin domain operations (`PlatformStore`, UI panels, and audit logging)
 * to `canonical-lifecycle.ts`, preserving strict state validation, transition prerequisites,
 * safe unknown-state rejection, and UI-friendly descriptor metadata.
 */

import {
  CANONICAL_LIFECYCLE_TRANSITION_RULES,
  evaluateCanonicalLifecycleTransition,
  getAvailableCanonicalTransitions,
  getTenantLifecycleStateMeta,
  normalizeTenantLifecycleStatus,
  type CanonicalTenantLifecycleStatus,
  type LifecycleTransitionContext,
  type LifecycleTransitionRule as CanonicalTransitionRule,
} from "./canonical-lifecycle";
import type { OrganizationLifecycleStatus } from "../types/organizations";

export interface LifecycleTransitionRule {
  id: string;
  from: CanonicalTenantLifecycleStatus;
  to: OrganizationLifecycleStatus;
  actionLabel: string;
  requiresReason: boolean;
  minReasonLength?: number;
  requiresConfirmation: boolean;
  requiresConfirmationCode?: boolean;
  requireNoReadinessBlockers?: boolean;
  requireMandatoryOnboarding?: boolean;
  requireSubscriptionAssigned?: boolean;
  requiredPermissions?: string[];
  restrictions?: string[];
  associatedSubscriptionGuidance: string;
  auditEventAction: string;
  variant: "primary" | "danger" | "warning" | "neutral";
  description: string;
  localDemoEffect: string;
}

function toAdapterRule(rule: CanonicalTransitionRule): LifecycleTransitionRule {
  const uiVariant: LifecycleTransitionRule["variant"] =
    rule.variant === "success" ? "primary" : rule.variant;

  return {
    id: rule.id,
    from: rule.from,
    to: rule.to,
    actionLabel: rule.actionLabel,
    requiresReason: rule.requiresReason,
    minReasonLength: rule.minReasonLength,
    requiresConfirmation:
      rule.to !== "registration_pending" &&
      rule.to !== "onboarding_in_progress",
    requiresConfirmationCode: rule.requiresConfirmationCode,
    requireNoReadinessBlockers: rule.requireNoReadinessBlockers,
    requireMandatoryOnboarding: rule.requireMandatoryOnboarding,
    requireSubscriptionAssigned: rule.requireSubscriptionAssigned,
    requiredPermissions: rule.requiredPermissions,
    restrictions: rule.restrictions,
    associatedSubscriptionGuidance: rule.associatedSubscriptionGuidance,
    auditEventAction: rule.auditEventAction,
    variant: uiVariant,
    description: rule.description,
    localDemoEffect: `Simulated local platform state transition to "${rule.to}" (${rule.auditEventAction}). Future backend must enforce server-side RBAC, transactional lock, and audit persistence.`,
  };
}

export const LIFECYCLE_TRANSITION_RULES: LifecycleTransitionRule[] =
  CANONICAL_LIFECYCLE_TRANSITION_RULES.map(toAdapterRule);

export interface TransitionEvaluationResult {
  permitted: boolean;
  reasonRequired: boolean;
  confirmationRequired?: boolean;
  unknownState?: boolean;
  failedPrerequisites?: string[];
  error?: string;
  rule?: LifecycleTransitionRule;
  localDemoEffect: string;
}

export function getAvailableTransitions(
  currentStatus: OrganizationLifecycleStatus | string
): LifecycleTransitionRule[] {
  return getAvailableCanonicalTransitions(currentStatus).map(toAdapterRule);
}

export function evaluateLifecycleTransition(
  currentStatus: OrganizationLifecycleStatus | string,
  targetStatus: OrganizationLifecycleStatus | string,
  reason?: string,
  context?: LifecycleTransitionContext
): TransitionEvaluationResult {
  const result = evaluateCanonicalLifecycleTransition(
    currentStatus,
    targetStatus,
    reason,
    context
  );
  const adaptedRule = result.rule ? toAdapterRule(result.rule) : undefined;

  if (!result.permitted) {
    return {
      permitted: false,
      reasonRequired: result.reasonRequired,
      confirmationRequired: result.confirmationRequired,
      unknownState: result.unknownState,
      failedPrerequisites: result.failedPrerequisites,
      error: result.error,
      rule: adaptedRule,
      localDemoEffect: result.unknownState
        ? "Fail-closed guard: Unrecognized lifecycle state blocks mutation."
        : "Transition rejected by canonical lifecycle rules.",
    };
  }

  return {
    permitted: true,
    reasonRequired: result.reasonRequired,
    confirmationRequired: result.confirmationRequired,
    rule: adaptedRule,
    localDemoEffect:
      adaptedRule?.localDemoEffect ?? "Transition approved cleanly in local state.",
  };
}

export { normalizeTenantLifecycleStatus, getTenantLifecycleStateMeta };
