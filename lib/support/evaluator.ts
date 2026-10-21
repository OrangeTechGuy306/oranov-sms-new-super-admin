/**
 * E-09.17: Support Desk Evaluator & Business Logic
 * SLA calculations, state machine transitions, customer success health indexes,
 * and aggregated support metrics.
 */

import {
  SupportTicket,
  SupportTicketStatus,
  SupportTicketPriority,
  SlaPolicy,
  SlaEvaluationResult,
  SlaState,
  SupportMetricsSummary,
  CustomerSatisfactionRecord,
  CustomerSuccessAccountSummary,
  CustomerSuccessTask,
} from '@/lib/types/support-desk';
import { Organization, OrganizationSubscription, SubscriptionPlan } from '@/lib/types';

// Deterministic reference date for static builds and reproducible test evaluation
export const DEFAULT_MOCK_DATE = '2026-03-17T12:00:00Z';

/**
 * Valid linear state machine transitions for support tickets.
 * Prevents invalid skips and preserves ticket audit history.
 */
export function getValidTicketTransitions(currentStatus: SupportTicketStatus): {
  targetStatus: SupportTicketStatus;
  label: string;
  requiresReason: boolean;
  description: string;
}[] {
  switch (currentStatus) {
    case 'new':
      return [
        { targetStatus: 'open', label: 'Accept & Open', requiresReason: false, description: 'Acknowledge ticket intake into active triage queue.' },
        { targetStatus: 'in_progress', label: 'Start Investigation', requiresReason: false, description: 'Assign to operator and begin immediate diagnostic work.' },
        { targetStatus: 'escalated', label: 'Escalate Directly', requiresReason: true, description: 'Escalate immediately to specialized engineering or management.' },
        { targetStatus: 'closed', label: 'Close as Invalid/Duplicate', requiresReason: true, description: 'Close immediately if duplicate or erroneous submission.' },
      ];
    case 'open':
      return [
        { targetStatus: 'in_progress', label: 'Mark In Progress', requiresReason: false, description: 'Begin active investigation or engineering work.' },
        { targetStatus: 'awaiting_tenant', label: 'Awaiting School Response', requiresReason: false, description: 'Pauses SLA timer while waiting for tenant clarification.' },
        { targetStatus: 'awaiting_internal', label: 'Awaiting Internal Team', requiresReason: false, description: 'Waiting for infrastructure, billing, or security review.' },
        { targetStatus: 'escalated', label: 'Escalate Ticket', requiresReason: true, description: 'Trigger priority escalation workflow.' },
        { targetStatus: 'resolved', label: 'Mark as Resolved', requiresReason: false, description: 'Technical resolution or answer provided to tenant.' },
        { targetStatus: 'closed', label: 'Close Ticket', requiresReason: true, description: 'Conclude ticket with administrative rationale.' },
      ];
    case 'in_progress':
      return [
        { targetStatus: 'awaiting_tenant', label: 'Awaiting School Response', requiresReason: false, description: 'Pauses SLA timer pending information from school admin.' },
        { targetStatus: 'awaiting_internal', label: 'Awaiting Internal Team', requiresReason: false, description: 'Cross-functional dependency on platform team.' },
        { targetStatus: 'escalated', label: 'Escalate Ticket', requiresReason: true, description: 'Escalate to Tier-2, Engineering, or Executive.' },
        { targetStatus: 'resolved', label: 'Mark as Resolved', requiresReason: false, description: 'Issue solved or workaround provided.' },
        { targetStatus: 'closed', label: 'Close Directly', requiresReason: true, description: 'Close ticket with final documentation notes.' },
      ];
    case 'awaiting_tenant':
      return [
        { targetStatus: 'open', label: 'Tenant Responded (Open)', requiresReason: false, description: 'School provided details; resumes active queue.' },
        { targetStatus: 'in_progress', label: 'Resume Investigation', requiresReason: false, description: 'Continue active technical resolution.' },
        { targetStatus: 'resolved', label: 'Mark as Resolved', requiresReason: false, description: 'Solution confirmed by school.' },
        { targetStatus: 'closed', label: 'Close (No Response)', requiresReason: true, description: 'Auto-close or manual close due to inactive requester.' },
      ];
    case 'awaiting_internal':
      return [
        { targetStatus: 'open', label: 'Internal Team Responded', requiresReason: false, description: 'Dependency cleared, ready for frontline review.' },
        { targetStatus: 'in_progress', label: 'Resume Investigation', requiresReason: false, description: 'Continue working with updated internal insights.' },
        { targetStatus: 'escalated', label: 'Escalate Ticket', requiresReason: true, description: 'Internal roadblock requires higher tier intervention.' },
        { targetStatus: 'resolved', label: 'Mark as Resolved', requiresReason: false, description: 'Internal fix deployed and verified.' },
        { targetStatus: 'closed', label: 'Close Ticket', requiresReason: true, description: 'Close with administrative rationale.' },
      ];
    case 'escalated':
      return [
        { targetStatus: 'in_progress', label: 'De-escalate to In Progress', requiresReason: true, description: 'Escalation resolved, returning to normal operator queue.' },
        { targetStatus: 'awaiting_tenant', label: 'Awaiting School Response', requiresReason: false, description: 'Escalation lead waiting for school feedback.' },
        { targetStatus: 'resolved', label: 'Mark as Resolved', requiresReason: false, description: 'Escalation resolved by senior engineering or management.' },
        { targetStatus: 'closed', label: 'Close Ticket', requiresReason: true, description: 'Close with formal executive signoff.' },
      ];
    case 'resolved':
      return [
        { targetStatus: 'closed', label: 'Formal Close', requiresReason: false, description: 'School confirmed satisfaction or 48-hour resolution auto-close.' },
        { targetStatus: 'open', label: 'Reopen Ticket', requiresReason: true, description: 'School reported recurring issue or incomplete resolution.' },
      ];
    case 'closed':
      return [
        { targetStatus: 'open', label: 'Reopen Ticket', requiresReason: true, description: 'Reopen closed ticket with mandatory audit justification.' },
      ];
    default:
      return [];
  }
}

/**
 * Honest, explainable SLA calculation for a ticket.
 * Evaluates first response and resolution targets against active policy thresholds.
 */
export function evaluateTicketSla(
  ticket: SupportTicket,
  policy: SlaPolicy,
  refDate?: string | Date
): SlaEvaluationResult {
  const nowMs = refDate ? new Date(refDate).getTime() : Date.now();
  const createdMs = new Date(ticket.createdAt).getTime();

  if (isNaN(createdMs)) {
    return {
      state: 'unknown',
      policyId: policy.id,
      policyName: policy.name,
      firstResponseMinutesTarget: 0,
      firstResponseMinutesElapsed: null,
      firstResponseMet: null,
      firstResponseState: 'unknown',
      resolutionMinutesTarget: 0,
      resolutionMinutesElapsed: null,
      resolutionMet: null,
      resolutionState: 'unknown',
      timeRemainingMinutes: null,
      isPaused: false,
      isBreached: false,
      explanation: 'Ticket creation timestamp is missing or invalid.',
    };
  }

  const priority: SupportTicketPriority = ticket.priority || 'normal';
  const firstResponseTargetMinutes = policy.firstResponseTargetMinutes[priority] || 240;
  const resolutionTargetMinutes = policy.resolutionTargetMinutes[priority] || 1440;

  // 1. Evaluate First Response SLA
  let firstResponseElapsedMs: number;
  let hasResponded = false;

  if (ticket.firstResponseAt) {
    hasResponded = true;
    firstResponseElapsedMs = Math.max(0, new Date(ticket.firstResponseAt).getTime() - createdMs);
  } else {
    firstResponseElapsedMs = Math.max(0, nowMs - createdMs);
  }

  const firstResponseElapsedMinutes = Math.round(firstResponseElapsedMs / 60000);
  const firstResponseMet = hasResponded ? firstResponseElapsedMinutes <= firstResponseTargetMinutes : null;

  let firstResponseState: SlaState = 'within_target';
  if (hasResponded) {
    firstResponseState = firstResponseElapsedMinutes <= firstResponseTargetMinutes ? 'within_target' : 'breached';
  } else {
    const thresholdMinutes = firstResponseTargetMinutes * (policy.escalationThresholdPercent / 100);
    if (firstResponseElapsedMinutes > firstResponseTargetMinutes) {
      firstResponseState = 'breached';
    } else if (firstResponseElapsedMinutes >= thresholdMinutes) {
      firstResponseState = 'approaching_target';
    } else {
      firstResponseState = 'within_target';
    }
  }

  // 2. Evaluate Resolution SLA
  const isResolvedOrClosed = ticket.status === 'resolved' || ticket.status === 'closed';
  const isPaused = ticket.status === 'awaiting_tenant';

  let resolutionElapsedMs: number;
  if (ticket.resolvedAt) {
    resolutionElapsedMs = Math.max(0, new Date(ticket.resolvedAt).getTime() - createdMs);
  } else if (ticket.closedAt) {
    resolutionElapsedMs = Math.max(0, new Date(ticket.closedAt).getTime() - createdMs);
  } else {
    resolutionElapsedMs = Math.max(0, nowMs - createdMs);
  }

  const resolutionElapsedMinutes = Math.round(resolutionElapsedMs / 60000);
  const resolutionMet = isResolvedOrClosed ? resolutionElapsedMinutes <= resolutionTargetMinutes : null;

  let resolutionState: SlaState = 'within_target';
  if (isResolvedOrClosed) {
    resolutionState = resolutionElapsedMinutes <= resolutionTargetMinutes ? 'within_target' : 'breached';
  } else if (isPaused) {
    resolutionState = 'paused';
  } else {
    const thresholdMinutes = resolutionTargetMinutes * (policy.escalationThresholdPercent / 100);
    if (resolutionElapsedMinutes > resolutionTargetMinutes) {
      resolutionState = 'breached';
    } else if (resolutionElapsedMinutes >= thresholdMinutes) {
      resolutionState = 'approaching_target';
    } else {
      resolutionState = 'within_target';
    }
  }

  // Determine overall SLA state
  let overallState: SlaState = 'within_target';
  let isBreached = false;

  if (isPaused) {
    overallState = 'paused';
  } else if (firstResponseState === 'breached' || resolutionState === 'breached') {
    overallState = 'breached';
    isBreached = true;
  } else if (firstResponseState === 'approaching_target' || resolutionState === 'approaching_target') {
    overallState = 'approaching_target';
  } else {
    overallState = 'within_target';
  }

  // Active time remaining calculation (prioritizing first response if pending, otherwise resolution)
  let timeRemainingMinutes: number | null = null;
  if (!isResolvedOrClosed && !isPaused) {
    if (!hasResponded) {
      timeRemainingMinutes = Math.max(0, firstResponseTargetMinutes - firstResponseElapsedMinutes);
    } else {
      timeRemainingMinutes = Math.max(0, resolutionTargetMinutes - resolutionElapsedMinutes);
    }
  }

  let explanation = '';
  if (isPaused) {
    explanation = 'SLA clock is paused while awaiting requested response from tenant administrator.';
  } else if (isBreached) {
    if (firstResponseState === 'breached' && resolutionState === 'breached') {
      explanation = `Both First Response (${firstResponseElapsedMinutes}m vs ${firstResponseTargetMinutes}m) and Resolution (${resolutionElapsedMinutes}m vs ${resolutionTargetMinutes}m) targets breached.`;
    } else if (firstResponseState === 'breached') {
      explanation = `First Response SLA breached (${firstResponseElapsedMinutes}m elapsed vs ${firstResponseTargetMinutes}m target).`;
    } else {
      explanation = `Resolution SLA breached (${resolutionElapsedMinutes}m elapsed vs ${resolutionTargetMinutes}m target).`;
    }
  } else if (overallState === 'approaching_target') {
    explanation = `Approaching SLA target threshold (${policy.escalationThresholdPercent}% of target consumed).`;
  } else if (isResolvedOrClosed) {
    explanation = `Ticket concluded within SLA targets (${resolutionElapsedMinutes}m elapsed vs ${resolutionTargetMinutes}m target).`;
  } else {
    explanation = `Active ticket within SLA targets (${timeRemainingMinutes}m remaining on target).`;
  }

  return {
    state: overallState,
    policyId: policy.id,
    policyName: policy.name,
    firstResponseMinutesTarget: firstResponseTargetMinutes,
    firstResponseMinutesElapsed: firstResponseElapsedMinutes,
    firstResponseMet,
    firstResponseState,
    resolutionMinutesTarget: resolutionTargetMinutes,
    resolutionMinutesElapsed: resolutionElapsedMinutes,
    resolutionMet,
    resolutionState,
    timeRemainingMinutes,
    isPaused,
    isBreached,
    explanation,
  };
}

/**
 * Calculates high-level Support Metrics Summary from active tickets.
 * Handles missing timestamps and empty collections gracefully.
 */
export function calculateSupportMetrics(
  tickets: SupportTicket[],
  policies: SlaPolicy[],
  csatRecords: CustomerSatisfactionRecord[] = [],
  refDate?: string
): SupportMetricsSummary {
  const totalTickets = tickets.length;
  const openStatuses = new Set(['new', 'open', 'in_progress', 'awaiting_tenant', 'awaiting_internal', 'escalated']);

  const openTickets = tickets.filter((t) => openStatuses.has(t.status)).length;
  const unassignedTickets = tickets.filter((t) => openStatuses.has(t.status) && !t.assignedOperatorId).length;
  const urgentTickets = tickets.filter((t) => openStatuses.has(t.status) && t.priority === 'urgent').length;
  const highPriorityTickets = tickets.filter((t) => openStatuses.has(t.status) && t.priority === 'high').length;
  const awaitingTenantTickets = tickets.filter((t) => t.status === 'awaiting_tenant').length;
  const awaitingInternalTickets = tickets.filter((t) => t.status === 'awaiting_internal').length;
  const escalatedTickets = tickets.filter((t) => t.status === 'escalated' || t.escalation?.isEscalated).length;
  const recentlyResolvedTickets = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;

  // SLA calculations based on evaluated states
  let slaAtRiskCount = 0;
  let slaBreachedCount = 0;

  for (const t of tickets) {
    if (!openStatuses.has(t.status)) continue;
    const policy = policies.find((p) => p.id === t.slaPolicyId) || policies[0];
    if (policy) {
      const evaluation = evaluateTicketSla(t, policy, refDate);
      if (evaluation.state === 'approaching_target') slaAtRiskCount += 1;
      if (evaluation.state === 'breached') slaBreachedCount += 1;
    }
  }

  // Response time and resolution time aggregations
  const respondedTickets = tickets.filter((t) => t.firstResponseAt && t.createdAt);
  let avgFirstResponseMinutes: number | null = null;
  if (respondedTickets.length > 0) {
    const totalRespMinutes = respondedTickets.reduce((sum, t) => {
      const diffMs = new Date(t.firstResponseAt!).getTime() - new Date(t.createdAt).getTime();
      return sum + Math.max(0, diffMs / 60000);
    }, 0);
    avgFirstResponseMinutes = Math.round(totalRespMinutes / respondedTickets.length);
  }

  const resolvedTickets = tickets.filter((t) => (t.resolvedAt || t.closedAt) && t.createdAt);
  let avgResolutionHours: number | null = null;
  if (resolvedTickets.length > 0) {
    const totalResHours = resolvedTickets.reduce((sum, t) => {
      const finishMs = new Date(t.resolvedAt || t.closedAt!).getTime();
      const diffMs = finishMs - new Date(t.createdAt).getTime();
      return sum + Math.max(0, diffMs / 3600000);
    }, 0);
    avgResolutionHours = Math.round((totalResHours / resolvedTickets.length) * 10) / 10;
  }

  // CSAT summary
  const validCsat = csatRecords.filter((r) => typeof r.rating === 'number' && r.rating >= 1 && r.rating <= 5);
  let averageCsat: number | null = null;
  let satisfactionRatePercent: number | null = null;

  if (validCsat.length > 0) {
    const sumRatings = validCsat.reduce((acc, curr) => acc + curr.rating, 0);
    averageCsat = Math.round((sumRatings / validCsat.length) * 10) / 10;
    const satisfiedCount = validCsat.filter((r) => r.rating >= 4).length;
    satisfactionRatePercent = Math.round((satisfiedCount / validCsat.length) * 100);
  }

  return {
    totalTickets,
    openTickets,
    unassignedTickets,
    urgentTickets,
    highPriorityTickets,
    awaitingTenantTickets,
    awaitingInternalTickets,
    slaAtRiskTickets: slaAtRiskCount,
    slaBreachedTickets: slaBreachedCount,
    escalatedTickets,
    recentlyResolvedTickets,
    avgFirstResponseMinutes,
    avgResolutionHours,
    averageCsat,
    totalCsatResponses: validCsat.length,
    satisfactionRatePercent,
    isDemonstrationData: true,
  };
}

/**
 * Transparent, explainable Customer Success Account Health calculation.
 * Documents exact formula and point deductions.
 */
export function calculateAccountHealthScore(
  org: Organization,
  sub?: OrganizationSubscription,
  tickets: SupportTicket[] = [],
  csatRecords: CustomerSatisfactionRecord[] = [],
  tasks: CustomerSuccessTask[] = [],
  refDate?: string
): {
  score: number;
  tier: 'healthy' | 'attention_needed' | 'at_risk';
  readinessGaps: string[];
  deductions: { reason: string; points: number }[];
} {
  const deductions: { reason: string; points: number }[] = [];
  const readinessGaps: string[] = [];

  // Baseline 100 points
  let score = 100;

  // 1. Subscription & Account Standing
  if (org.status === 'suspended') {
    deductions.push({ reason: 'Institution is currently suspended for policy or compliance holds', points: 40 });
    score -= 40;
    readinessGaps.push('Suspended institution status requires administrative clearance');
  } else if (org.status === 'pending') {
    deductions.push({ reason: 'Institution onboarding status is pending verification', points: 15 });
    score -= 15;
    readinessGaps.push('Pending administrative onboarding verification');
  }

  if (sub && sub.status === 'past_due') {
    deductions.push({ reason: 'Subscription invoice is past due', points: 25 });
    score -= 25;
    readinessGaps.push('Past-due subscription invoice awaiting settlement');
  }

  // 2. Open Support Load & Urgency
  const orgTickets = tickets.filter((t) => t.organizationId === org.id);
  const openTickets = orgTickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed');
  const urgentTickets = openTickets.filter((t) => t.priority === 'urgent');
  const escalatedTickets = openTickets.filter((t) => t.status === 'escalated' || t.escalation?.isEscalated);

  if (urgentTickets.length > 0) {
    const penalty = urgentTickets.length * 15;
    deductions.push({ reason: `${urgentTickets.length} active urgent ticket(s) requiring immediate resolution`, points: penalty });
    score -= penalty;
  }

  if (escalatedTickets.length > 0) {
    const penalty = escalatedTickets.length * 10;
    deductions.push({ reason: `${escalatedTickets.length} escalated support case(s) active`, points: penalty });
    score -= penalty;
  }

  if (openTickets.length > 3) {
    deductions.push({ reason: `High open support queue volume (${openTickets.length} active tickets)`, points: 10 });
    score -= 10;
  }

  // 3. Customer Satisfaction (CSAT)
  const orgCsat = csatRecords.filter((r) => r.organizationId === org.id);
  if (orgCsat.length > 0) {
    const avgRating = orgCsat.reduce((sum, r) => sum + r.rating, 0) / orgCsat.length;
    if (avgRating < 3.0) {
      deductions.push({ reason: `Low customer satisfaction rating (Avg: ${avgRating.toFixed(1)} / 5.0)`, points: 20 });
      score -= 20;
    } else if (avgRating < 4.0) {
      deductions.push({ reason: `Moderate customer satisfaction rating (Avg: ${avgRating.toFixed(1)} / 5.0)`, points: 10 });
      score -= 10;
    }
  }

  // 4. Overdue Customer Success Tasks
  const orgTasks = tasks.filter((t) => t.organizationId === org.id && t.status !== 'completed' && t.status !== 'cancelled');
  const overdueTasks = orgTasks.filter((task) => isOverdueTask(task.dueDate, refDate));

  if (overdueTasks.length > 0) {
    const penalty = overdueTasks.length * 8;
    deductions.push({ reason: `${overdueTasks.length} overdue customer success follow-up task(s)`, points: penalty });
    score -= penalty;
  }

  // 5. Contact or Campus Coordinates Gaps
  if (!org.contact?.phone || !org.contact?.email) {
    deductions.push({ reason: 'Institution profile contact coordinates incomplete', points: 5 });
    score -= 5;
    readinessGaps.push('Primary institutional contact coordinates missing phone or email');
  }

  // Clamp final score
  const finalScore = Math.max(0, Math.min(100, score));

  let tier: 'healthy' | 'attention_needed' | 'at_risk' = 'healthy';
  if (finalScore < 50) {
    tier = 'at_risk';
  } else if (finalScore < 80) {
    tier = 'attention_needed';
  } else {
    tier = 'healthy';
  }

  return {
    score: finalScore,
    tier,
    readinessGaps,
    deductions,
  };
}

/**
 * Computes high-level account summaries for all registered school organizations.
 */
export function computeCustomerSuccessAccountSummaries(
  organizations: Organization[],
  subscriptions: OrganizationSubscription[],
  plans: SubscriptionPlan[],
  tickets: SupportTicket[],
  csatRecords: CustomerSatisfactionRecord[],
  tasks: CustomerSuccessTask[],
  refDate?: string
): CustomerSuccessAccountSummary[] {
  return organizations.map((org) => {
    const sub = subscriptions.find((s) => s.organizationId === org.id);
    const plan = plans.find((p) => p.id === (sub?.planId || org.planId));
    const orgTickets = tickets.filter((t) => t.organizationId === org.id);
    const openTickets = orgTickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed');
    const urgentTickets = openTickets.filter((t) => t.priority === 'urgent');
    const escalatedTickets = openTickets.filter((t) => t.status === 'escalated' || t.escalation?.isEscalated);

    const orgCsat = csatRecords.filter((r) => r.organizationId === org.id);
    let avgCsat: number | null = null;
    if (orgCsat.length > 0) {
      const sum = orgCsat.reduce((acc, c) => acc + c.rating, 0);
      avgCsat = Math.round((sum / orgCsat.length) * 10) / 10;
    }

    const orgTasks = tasks.filter((t) => t.organizationId === org.id);
    const pendingTasks = orgTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
    const overdueTasks = pendingTasks.filter((t) => isOverdueTask(t.dueDate, refDate));

    // Derive last engagement date
    const timestamps = [
      ...orgTickets.map((t) => t.updatedAt || t.createdAt),
      ...orgTasks.map((t) => t.completedAt || t.createdAt),
      ...orgCsat.map((c) => c.submittedAt),
    ].filter(Boolean);

    let lastEngagementDate: string | null = null;
    if (timestamps.length > 0) {
      timestamps.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      lastEngagementDate = timestamps[0];
    }

    const healthEval = calculateAccountHealthScore(org, sub, tickets, csatRecords, tasks, refDate);

    // Assign dedicated CS owner fixture (e.g. Marcus Brody for Growth/Enterprise, Sarah Connor for Starter)
    const isEnterprise = plan?.tier === 'enterprise';
    const assignedCsOwnerId = isEnterprise ? 'usr_super_01' : 'usr_support_03';
    const assignedCsOwnerName = isEnterprise ? 'Alexander Sterling (Executive Lead)' : 'Marcus Brody (Support & CS Lead)';

    return {
      organizationId: org.id,
      organizationName: org.name,
      organizationCode: org.code,
      subdomain: org.subdomain,
      planId: plan?.id || 'plan_starter',
      planName: plan?.name || 'Standard Tier',
      subscriptionStatus: sub?.status || 'active',
      onboardingStatus: org.onboardingStatus,
      openTicketsCount: openTickets.length,
      urgentTicketsCount: urgentTickets.length,
      escalatedTicketsCount: escalatedTickets.length,
      averageCsatScore: avgCsat,
      totalFeedbackCount: orgCsat.length,
      readinessGaps: healthEval.readinessGaps,
      healthScore: healthEval.score,
      healthTier: healthEval.tier,
      healthScoreBreakdown: {
        baseline: 100,
        deductions: healthEval.deductions,
        finalScore: healthEval.score,
      },
      lastEngagementDate,
      assignedCsOwnerId,
      assignedCsOwnerName,
      pendingTasksCount: pendingTasks.length,
      overdueTasksCount: overdueTasks.length,
    };
  });
}

/**
 * Checks if a task due date is in the past compared to reference date or today.
 */
export function isOverdueTask(dueDate: string, refDate?: string): boolean {
  if (!dueDate) return false;
  const now = refDate ? new Date(refDate) : new Date();
  const due = new Date(dueDate + 'T23:59:59Z');
  return due.getTime() < now.getTime();
}

/**
 * Formats minutes into human-readable string (e.g., "15m", "2h 30m", "1d 4h").
 */
export function formatMinutesDuration(minutes: number | null): string {
  if (minutes === null || isNaN(minutes)) return 'N/A';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

/**
 * Formats hours into human-readable duration (e.g., "4.5 hrs", "2.1 days").
 */
export function formatHoursDuration(hours: number | null): string {
  if (hours === null || isNaN(hours)) return 'N/A';
  if (hours < 24) return `${hours} hrs`;
  const days = Math.round((hours / 24) * 10) / 10;
  return `${days} days`;
}
