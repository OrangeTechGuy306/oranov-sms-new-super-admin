/**
 * E-09.17: Support Desk Validators
 * Client-side schema, lifecycle state machine, escalation, and SLA policy validation rules.
 */

import {
  CreateSupportTicketInput,
  SupportTicketStatus,
  SlaPolicy,
  KnowledgeBaseArticle,
  CustomerSuccessTask,
} from '@/lib/types/support-desk';
import { getValidTicketTransitions } from './evaluator';

export interface ValidationOutcome {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates ticket intake form. Enforces valid organization reference,
 * non-empty subjects, valid requester contact, and categorized classification.
 */
export function validateTicketCreation(
  input: CreateSupportTicketInput,
  existingOrgIds: string[]
): ValidationOutcome {
  const errors: string[] = [];

  if (!input.subject || input.subject.trim().length < 5) {
    errors.push('Ticket subject must be at least 5 characters in length.');
  }

  if (!input.description || input.description.trim().length < 10) {
    errors.push('Ticket description must be at least 10 characters detailing the tenant issue.');
  }

  if (!input.organizationId || !existingOrgIds.includes(input.organizationId)) {
    errors.push(`Invalid or unresolved school organization reference: "${input.organizationId || ''}".`);
  }

  if (!input.category) {
    errors.push('Support category is required.');
  }

  if (!input.priority || !['low', 'normal', 'high', 'urgent'].includes(input.priority)) {
    errors.push('Valid priority level (low, normal, high, or urgent) is required.');
  }

  if (!input.requester?.name || input.requester.name.trim().length < 2) {
    errors.push('Requester full name is required.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.requester?.email || !emailRegex.test(input.requester.email.trim())) {
    errors.push('A valid requester email address is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Enforces valid state machine transitions and requires justification where applicable.
 */
export function validateStatusTransition(
  currentStatus: SupportTicketStatus,
  targetStatus: SupportTicketStatus,
  reason?: string
): { isValid: boolean; error?: string } {
  if (currentStatus === targetStatus) {
    return { isValid: false, error: `Ticket is already in status "${currentStatus}".` };
  }

  const allowedTransitions = getValidTicketTransitions(currentStatus);
  const match = allowedTransitions.find((t) => t.targetStatus === targetStatus);

  if (!match) {
    return {
      isValid: false,
      error: `Illegal state transition from "${currentStatus}" to "${targetStatus}". Permitted next states: ${allowedTransitions.map((t) => t.targetStatus).join(', ') || 'none'}.`,
    };
  }

  if (match.requiresReason && (!reason || reason.trim().length < 5)) {
    return {
      isValid: false,
      error: `A mandatory audit reason (minimum 5 characters) is required when transitioning from "${currentStatus}" to "${targetStatus}".`,
    };
  }

  return { isValid: true };
}

/**
 * Validates escalation request parameters.
 */
export function validateEscalation(
  reason: string,
  targetTeamId: string,
  availableTeamIds: string[] = []
): ValidationOutcome {
  const errors: string[] = [];

  if (!reason || reason.trim().length < 10) {
    errors.push('Escalation reason must be at least 10 characters explaining why the issue exceeds normal triage.');
  }

  if (!targetTeamId) {
    errors.push('Target escalation queue or team must be selected.');
  } else if (availableTeamIds.length > 0 && !availableTeamIds.includes(targetTeamId)) {
    errors.push(`Selected escalation team "${targetTeamId}" is not a recognized support queue.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates SLA policy parameters.
 */
export function validateSlaPolicy(input: Partial<SlaPolicy>): ValidationOutcome {
  const errors: string[] = [];

  if (!input.name || input.name.trim().length < 3) {
    errors.push('SLA Policy name must be at least 3 characters.');
  }

  const priorities = ['urgent', 'high', 'normal', 'low'] as const;
  for (const prio of priorities) {
    const respMinutes = input.firstResponseTargetMinutes?.[prio];
    if (typeof respMinutes !== 'number' || respMinutes <= 0) {
      errors.push(`First response target for priority "${prio}" must be a positive number of minutes.`);
    }

    const resMinutes = input.resolutionTargetMinutes?.[prio];
    if (typeof resMinutes !== 'number' || resMinutes <= 0) {
      errors.push(`Resolution target for priority "${prio}" must be a positive number of minutes.`);
    }

    if (typeof respMinutes === 'number' && typeof resMinutes === 'number' && respMinutes > resMinutes) {
      errors.push(`First response target (${respMinutes}m) cannot exceed resolution target (${resMinutes}m) for priority "${prio}".`);
    }
  }

  if (
    typeof input.escalationThresholdPercent === 'number' &&
    (input.escalationThresholdPercent < 10 || input.escalationThresholdPercent > 95)
  ) {
    errors.push('Escalation warning threshold must be between 10% and 95%.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates Knowledge Base article inputs.
 */
export function validateKbArticle(input: Partial<KnowledgeBaseArticle>): ValidationOutcome {
  const errors: string[] = [];

  if (!input.title || input.title.trim().length < 5) {
    errors.push('Article title must be at least 5 characters in length.');
  }

  if (!input.summary || input.summary.trim().length < 10) {
    errors.push('Article summary must be at least 10 characters.');
  }

  if (!input.content || input.content.trim().length < 20) {
    errors.push('Article markdown body must contain at least 20 characters.');
  }

  if (!input.category) {
    errors.push('Category is required for knowledge base indexing.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates Customer Success follow-up task inputs.
 */
export function validateCsTask(
  input: Partial<CustomerSuccessTask>,
  existingOrgIds: string[]
): ValidationOutcome {
  const errors: string[] = [];

  if (!input.title || input.title.trim().length < 5) {
    errors.push('Task title must be at least 5 characters.');
  }

  if (!input.organizationId || !existingOrgIds.includes(input.organizationId)) {
    errors.push(`Organization reference is invalid or does not exist: "${input.organizationId || ''}".`);
  }

  if (!input.assignedOwnerId) {
    errors.push('Assigned platform owner or customer success manager is required.');
  }

  if (!input.dueDate) {
    errors.push('Due date is required.');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)) {
    errors.push('Due date must follow ISO YYYY-MM-DD format.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
