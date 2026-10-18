/**
 * Tenant Lifecycle State Machine & Transition Evaluation Engine
 * Phase E-09.7 — School Management SaaS Super-Admin
 *
 * Implements decoupled, testable domain rules governing organization lifecycle transitions.
 * Enforces mandatory justifications, prevents illegal state hops, and maintains auditability.
 */

import { OrganizationLifecycleStatus } from '../types/organizations';

export interface LifecycleTransitionRule {
  from: OrganizationLifecycleStatus;
  to: OrganizationLifecycleStatus;
  actionLabel: string;
  requiresReason: boolean;
  minReasonLength?: number;
  requiresConfirmation: boolean;
  variant: 'primary' | 'danger' | 'warning' | 'neutral';
  description: string;
  localDemoEffect: string;
}

export const LIFECYCLE_TRANSITION_RULES: LifecycleTransitionRule[] = [
  // From draft
  {
    from: 'draft',
    to: 'pending',
    actionLabel: 'Submit for Onboarding Review',
    requiresReason: false,
    requiresConfirmation: false,
    variant: 'primary',
    description: 'Promote draft registration into pending onboarding queue for platform review.',
    localDemoEffect: 'Locally transitions status to pending. Triggers readiness checks in mock store.',
  },
  {
    from: 'draft',
    to: 'inactive',
    actionLabel: 'Decommission Draft',
    requiresReason: false,
    requiresConfirmation: true,
    variant: 'neutral',
    description: 'Mark incomplete draft registration as inactive.',
    localDemoEffect: 'Sets organization status to inactive in development memory.',
  },

  // From pending
  {
    from: 'pending',
    to: 'active',
    actionLabel: 'Approve & Activate',
    requiresReason: false,
    requiresConfirmation: true,
    variant: 'primary',
    description: 'Approve tenant onboarding prerequisites and grant active tenant operational status.',
    localDemoEffect: 'Enables active tenant status in local state. Demonstrates production go-live readiness.',
  },
  {
    from: 'pending',
    to: 'inactive',
    actionLabel: 'Reject / Deactivate',
    requiresReason: false,
    requiresConfirmation: true,
    variant: 'neutral',
    description: 'Reject or set aside pending organization registration.',
    localDemoEffect: 'Transitions pending record to inactive in local storage.',
  },
  {
    from: 'pending',
    to: 'draft',
    actionLabel: 'Return to Draft',
    requiresReason: false,
    requiresConfirmation: false,
    variant: 'warning',
    description: 'Return organization to draft state to allow administrator corrections.',
    localDemoEffect: 'Reverts organization to draft state in local store.',
  },

  // From active
  {
    from: 'active',
    to: 'suspended',
    actionLabel: 'Suspend Operations',
    requiresReason: true,
    minReasonLength: 5,
    requiresConfirmation: true,
    variant: 'danger',
    description: 'Temporarily halt school portal access and services with a documented justification.',
    localDemoEffect: 'Sets simulated lock on tenant workspace. Records audit event with mandatory reason.',
  },
  {
    from: 'active',
    to: 'inactive',
    actionLabel: 'Deactivate Tenant',
    requiresReason: false,
    requiresConfirmation: true,
    variant: 'neutral',
    description: 'Gracefully deactivate tenant operations without operational suspension flags.',
    localDemoEffect: 'Updates status to inactive locally.',
  },
  {
    from: 'active',
    to: 'archived',
    actionLabel: 'Archive Organization',
    requiresReason: true,
    minReasonLength: 5,
    requiresConfirmation: true,
    variant: 'danger',
    description: 'Retire active school record into read-only archive state.',
    localDemoEffect: 'Marks tenant as archived. Blocks academic operational changes in local state.',
  },

  // From suspended
  {
    from: 'suspended',
    to: 'active',
    actionLabel: 'Reactivate Operations',
    requiresReason: false,
    requiresConfirmation: true,
    variant: 'primary',
    description: 'Lift operational suspension and restore active status.',
    localDemoEffect: 'Clears suspension flag and returns organization to active status in mock store.',
  },
  {
    from: 'suspended',
    to: 'inactive',
    actionLabel: 'Transition to Inactive',
    requiresReason: false,
    requiresConfirmation: true,
    variant: 'neutral',
    description: 'Move suspended organization to regular inactive state pending long-term resolution.',
    localDemoEffect: 'Changes state to inactive in local store.',
  },
  {
    from: 'suspended',
    to: 'archived',
    actionLabel: 'Archive Record',
    requiresReason: true,
    minReasonLength: 5,
    requiresConfirmation: true,
    variant: 'danger',
    description: 'Permanently archive suspended tenant.',
    localDemoEffect: 'Transitions suspended record to archived state with reason.',
  },

  // From inactive
  {
    from: 'inactive',
    to: 'active',
    actionLabel: 'Reactivate Organization',
    requiresReason: false,
    requiresConfirmation: true,
    variant: 'primary',
    description: 'Re-enable school organization and resume active platform services.',
    localDemoEffect: 'Sets status to active in local store.',
  },
  {
    from: 'inactive',
    to: 'pending',
    actionLabel: 'Re-queue for Verification',
    requiresReason: false,
    requiresConfirmation: false,
    variant: 'warning',
    description: 'Send inactive organization back to onboarding verification queue.',
    localDemoEffect: 'Re-queues organization into pending verification state.',
  },
  {
    from: 'inactive',
    to: 'archived',
    actionLabel: 'Archive Record',
    requiresReason: true,
    minReasonLength: 5,
    requiresConfirmation: true,
    variant: 'danger',
    description: 'Retire inactive organization into archived status.',
    localDemoEffect: 'Marks organization as archived with documented reason.',
  },

  // From archived
  {
    from: 'archived',
    to: 'inactive',
    actionLabel: 'Restore to Inactive Review',
    requiresReason: false,
    requiresConfirmation: true,
    variant: 'warning',
    description: 'Restore archived record into inactive state for super-admin audit and remediation.',
    localDemoEffect: 'Restores archived record to inactive state. Direct activation remains locked.',
  },
];

export interface TransitionEvaluationResult {
  permitted: boolean;
  reasonRequired: boolean;
  error?: string;
  rule?: LifecycleTransitionRule;
  localDemoEffect: string;
}

export function getAvailableTransitions(
  currentStatus: OrganizationLifecycleStatus
): LifecycleTransitionRule[] {
  return LIFECYCLE_TRANSITION_RULES.filter((rule) => rule.from === currentStatus);
}

export function evaluateLifecycleTransition(
  currentStatus: OrganizationLifecycleStatus,
  targetStatus: OrganizationLifecycleStatus,
  reason?: string
): TransitionEvaluationResult {
  if (currentStatus === targetStatus) {
    return {
      permitted: false,
      reasonRequired: false,
      error: `Organization is already in "${currentStatus}" status.`,
      localDemoEffect: 'No state changes applied.',
    };
  }

  const matchingRule = LIFECYCLE_TRANSITION_RULES.find(
    (rule) => rule.from === currentStatus && rule.to === targetStatus
  );

  if (!matchingRule) {
    const allowed = getAvailableTransitions(currentStatus).map((r) => `"${r.to}"`);
    const allowedText = allowed.length > 0 ? allowed.join(', ') : 'None (Terminal state)';
    return {
      permitted: false,
      reasonRequired: false,
      error: `Invalid lifecycle transition from "${currentStatus}" to "${targetStatus}". Allowed destination states: ${allowedText}.`,
      localDemoEffect: 'Operation rejected by domain state machine.',
    };
  }

  // Reason checks
  if (matchingRule.requiresReason) {
    const minLength = matchingRule.minReasonLength || 5;
    const cleanReason = (reason || '').trim();
    if (!cleanReason || cleanReason.length < minLength) {
      return {
        permitted: false,
        reasonRequired: true,
        rule: matchingRule,
        error: `A mandatory justification reason (min ${minLength} characters) is required when transitioning to "${targetStatus}".`,
        localDemoEffect: 'Operation blocked pending required justification input.',
      };
    }
  }

  return {
    permitted: true,
    reasonRequired: matchingRule.requiresReason,
    rule: matchingRule,
    localDemoEffect: matchingRule.localDemoEffect,
  };
}
