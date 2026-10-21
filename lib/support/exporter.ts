/**
 * E-09.17: Support Desk & Customer Success Exporter
 * Safe CSV export generators with formula injection protection and zero student PII exposure.
 */

import {
  SupportTicket,
  CustomerSatisfactionRecord,
  CustomerSuccessAccountSummary,
} from '@/lib/types/support-desk';
import { Organization } from '@/lib/types';

/**
 * Escapes CSV values and neutralizes dangerous spreadsheet formula injection characters
 * (=, +, -, @, tab, carriage return).
 */
export function escapeCsvFormulaInjection(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);

  // If the string starts with a formula injection trigger, prefix with single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape internal double quotes by doubling them
  str = str.replace(/"/g, '""');

  return `"${str}"`;
}

/**
 * Exports support tickets to CSV format matching the user-selected scope.
 */
export function exportTicketsToCsv(
  tickets: SupportTicket[],
  organizations: Organization[]
): string {
  const orgMap = new Map(organizations.map((o) => [o.id, o.name]));

  const headers = [
    'Ticket Number',
    'Subject',
    'Organization Code',
    'Organization Name',
    'Category',
    'Priority',
    'Status',
    'SLA State',
    'Is Escalated',
    'Assigned Operator ID',
    'Created At',
    'First Response At',
    'Resolved At',
    'Closed At',
    'Source',
    'Message Count',
  ];

  const rows = tickets.map((t) => {
    const orgName = orgMap.get(t.organizationId) || t.organizationId;
    return [
      escapeCsvFormulaInjection(t.ticketNumber),
      escapeCsvFormulaInjection(t.subject),
      escapeCsvFormulaInjection(t.organizationId),
      escapeCsvFormulaInjection(orgName),
      escapeCsvFormulaInjection(t.category),
      escapeCsvFormulaInjection(t.priority),
      escapeCsvFormulaInjection(t.status),
      escapeCsvFormulaInjection(t.slaState),
      escapeCsvFormulaInjection(t.escalation?.isEscalated ? 'YES' : 'NO'),
      escapeCsvFormulaInjection(t.assignedOperatorId || 'UNASSIGNED'),
      escapeCsvFormulaInjection(t.createdAt),
      escapeCsvFormulaInjection(t.firstResponseAt || 'N/A'),
      escapeCsvFormulaInjection(t.resolvedAt || 'N/A'),
      escapeCsvFormulaInjection(t.closedAt || 'N/A'),
      escapeCsvFormulaInjection(t.source),
      escapeCsvFormulaInjection(t.messages.length),
    ].join(',');
  });

  const metadataComment = '# [DEMONSTRATION ONLY - LOCAL CLIENT REPOSITORIES - ZERO SERVER PERSISTENCE]';
  return [metadataComment, headers.join(','), ...rows].join('\n');
}

/**
 * Exports Customer Satisfaction (CSAT) survey records to CSV.
 */
export function exportCsatToCsv(
  records: CustomerSatisfactionRecord[],
  organizations: Organization[]
): string {
  const orgMap = new Map(organizations.map((o) => [o.id, o.name]));

  const headers = [
    'Feedback ID',
    'Ticket Number',
    'Organization Code',
    'Organization Name',
    'Rating (1-5)',
    'Category',
    'Comment',
    'Submitted At',
    'Reviewed',
    'Reviewer Notes',
  ];

  const rows = records.map((r) => {
    const orgName = orgMap.get(r.organizationId) || r.organizationId;
    return [
      escapeCsvFormulaInjection(r.id),
      escapeCsvFormulaInjection(r.ticketNumber),
      escapeCsvFormulaInjection(r.organizationId),
      escapeCsvFormulaInjection(orgName),
      escapeCsvFormulaInjection(r.rating),
      escapeCsvFormulaInjection(r.category),
      escapeCsvFormulaInjection(r.comment || ''),
      escapeCsvFormulaInjection(r.submittedAt),
      escapeCsvFormulaInjection(r.reviewed ? 'YES' : 'NO'),
      escapeCsvFormulaInjection(r.reviewerNotes || ''),
    ].join(',');
  });

  const metadataComment = '# [DEMONSTRATION ONLY - CSAT REPOSITORIES - FORMULA INJECTION DEFENSE ACTIVE]';
  return [metadataComment, headers.join(','), ...rows].join('\n');
}

/**
 * Exports Customer Success Account summaries to CSV.
 */
export function exportCustomerSuccessSummariesToCsv(
  summaries: CustomerSuccessAccountSummary[]
): string {
  const headers = [
    'Organization ID',
    'Organization Code',
    'Organization Name',
    'Plan Tier',
    'Subscription Status',
    'Onboarding Status',
    'Health Score (0-100)',
    'Health Tier',
    'Open Tickets',
    'Urgent Tickets',
    'Escalated Tickets',
    'Average CSAT (1-5)',
    'Total Surveys',
    'Pending Tasks',
    'Overdue Tasks',
    'Assigned CS Owner',
    'Last Engagement Date',
  ];

  const rows = summaries.map((s) => [
    escapeCsvFormulaInjection(s.organizationId),
    escapeCsvFormulaInjection(s.organizationCode),
    escapeCsvFormulaInjection(s.organizationName),
    escapeCsvFormulaInjection(s.planName),
    escapeCsvFormulaInjection(s.subscriptionStatus),
    escapeCsvFormulaInjection(s.onboardingStatus),
    escapeCsvFormulaInjection(s.healthScore),
    escapeCsvFormulaInjection(s.healthTier),
    escapeCsvFormulaInjection(s.openTicketsCount),
    escapeCsvFormulaInjection(s.urgentTicketsCount),
    escapeCsvFormulaInjection(s.escalatedTicketsCount),
    escapeCsvFormulaInjection(s.averageCsatScore !== null ? s.averageCsatScore : 'N/A'),
    escapeCsvFormulaInjection(s.totalFeedbackCount),
    escapeCsvFormulaInjection(s.pendingTasksCount),
    escapeCsvFormulaInjection(s.overdueTasksCount),
    escapeCsvFormulaInjection(s.assignedCsOwnerName),
    escapeCsvFormulaInjection(s.lastEngagementDate || 'N/A'),
  ].join(','));

  const metadataComment = '# [DEMONSTRATION ONLY - CUSTOMER SUCCESS ACCOUNT METRICS]';
  return [metadataComment, headers.join(','), ...rows].join('\n');
}
