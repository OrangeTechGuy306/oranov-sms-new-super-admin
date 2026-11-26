/**
 * Phase P0-6.1: Platform-Wide Tenant Operations Center Metrics & 10 Operational Queues
 *
 * Uses P0-5 canonical lifecycle states exclusively (`normalizeTenantLifecycleStatus`),
 * preserves separation between lifecycle, provisioning, subscription, payment,
 * support cases, approvals, and exceptions, and provides deterministic filter/sort/pagination.
 */

import { Organization } from '@/lib/types/organizations';
import { OrganizationSubscription, Invoice, SubscriptionPlan } from '@/lib/types/subscriptions';
import { Campus } from '@/lib/types/campuses';
import { SupportTicket } from '@/lib/types/support-desk';
import {
  CanonicalTenantLifecycleStatus,
  CANONICAL_TENANT_LIFECYCLE_STATUSES,
  normalizeTenantLifecycleStatus,
} from '@/lib/lifecycle/canonical-lifecycle';
import { evaluateOrganizationReadiness } from '@/lib/readiness/evaluator';
import {
  OperationalExceptionRecord,
  PlatformApprovalRequest,
} from './canonical-operations';
import { isExceptionOpen } from './exceptions';

export type OperationalQueueId =
  | 'new_registrations'
  | 'pending_reviews'
  | 'incomplete_onboarding'
  | 'awaiting_activation'
  | 'provisioning_exceptions'
  | 'subscription_exceptions'
  | 'suspended_organizations'
  | 'cancellation_requests'
  | 'unresolved_support_cases'
  | 'administrative_approvals';

export interface OperationalQueueItem {
  id: string;
  queueId: OperationalQueueId;
  organizationId: string;
  organizationName: string;
  organizationCode: string;
  campusId?: string;
  campusName?: string;
  planId?: string;
  planName?: string;
  lifecycleStatus: CanonicalTenantLifecycleStatus | 'unknown';
  subscriptionStatus?: string;
  paymentStatus?: string;
  onboardingStatus?: string;
  provisioningStatus?: string;
  title: string;
  subtitle: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  statusBadge: string;
  createdAt: string;
  updatedAt: string;
  actionLabel: string;
  href: string;
}

export interface PlatformOperationalOverviewMetrics {
  totalOrganizations: number;
  byLifecycle: Record<CanonicalTenantLifecycleStatus, number>;
  activeOrganizations: number;
  trialOrganizations: number;
  undergoingOnboardingOrganizations: number;
  awaitingActivationOrganizations: number;
  suspendedOrganizations: number;
  cancellationPendingOrganizations: number;
  cancelledOrganizations: number;
  archivedOrganizations: number;
  closedOrganizations: number;
  incompleteProvisioningOrganizations: number;
  organizationsWithUnresolvedSupport: number;
  organizationsWithSubscriptionExceptions: number;
  organizationsRequiringAttention: number;
  unresolvedSupportCasesTotal: number;
  pendingApprovalsTotal: number;
  openExceptionsTotal: number;
}

export interface OperationalQueueQuery {
  search?: string;
  severity?: 'all' | 'low' | 'medium' | 'high' | 'critical';
  planId?: string;
  sortBy?: 'priority_desc' | 'date_desc' | 'date_asc' | 'name_asc';
  page?: number;
  pageSize?: number;
}

export interface PaginatedOperationalQueueResult {
  items: OperationalQueueItem[];
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

const OPEN_TICKET_STATUSES = new Set([
  'new',
  'open',
  'assigned',
  'in_progress',
  'awaiting_tenant',
  'awaiting_internal',
  'escalated',
  'reopened',
]);

export function computePlatformOperationalOverview(params: {
  organizations: Organization[];
  campuses: Campus[];
  subscriptions: OrganizationSubscription[];
  invoices: Invoice[];
  plans: SubscriptionPlan[];
  supportTickets: SupportTicket[];
  approvals: PlatformApprovalRequest[];
  exceptions: OperationalExceptionRecord[];
  referenceIso?: string;
}): {
  overview: PlatformOperationalOverviewMetrics;
  queues: Record<OperationalQueueId, OperationalQueueItem[]>;
} {
  const {
    organizations,
    campuses,
    subscriptions,
    invoices,
    plans,
    supportTickets,
    approvals,
    exceptions,
    referenceIso = '2026-11-26T12:00:00Z',
  } = params;

  const byLifecycle = {} as Record<CanonicalTenantLifecycleStatus, number>;
  for (const s of CANONICAL_TENANT_LIFECYCLE_STATUSES) {
    byLifecycle[s] = 0;
  }

  const queues: Record<OperationalQueueId, OperationalQueueItem[]> = {
    new_registrations: [],
    pending_reviews: [],
    incomplete_onboarding: [],
    awaiting_activation: [],
    provisioning_exceptions: [],
    subscription_exceptions: [],
    suspended_organizations: [],
    cancellation_requests: [],
    unresolved_support_cases: [],
    administrative_approvals: [],
  };

  const attentionOrgIds = new Set<string>();
  const supportOrgIds = new Set<string>();
  const subExceptionOrgIds = new Set<string>();
  let incompleteProvisioningOrganizations = 0;

  for (const org of organizations) {
    const lifecycle = normalizeTenantLifecycleStatus(org.status);
    if (lifecycle !== 'unknown') {
      byLifecycle[lifecycle] += 1;
    }

    const orgCampuses = campuses.filter((c) => c.organizationId === org.id);
    const sub = subscriptions.find((s) => s.organizationId === org.id);
    const plan = plans.find((p) => p.id === (sub?.planId || org.planId));
    const planName = plan?.name || org.planId || 'Unassigned';
    const subStatus = (sub?.status || org.subscriptionStatus || 'active').toLowerCase();
    const payStatus = (org.paymentStatus || 'paid').toLowerCase();
    const readiness = evaluateOrganizationReadiness({
      organization: org,
      campuses: orgCampuses,
      plan,
      subscription: sub,
      evaluatedAt: referenceIso,
    });
    const blockerTitles = readiness.items.filter((i) => i.status === 'incomplete').map((i) => i.title);

    const baseItem = {
      organizationId: org.id,
      organizationName: org.name,
      organizationCode: org.code,
      planId: plan?.id || org.planId,
      planName,
      lifecycleStatus: lifecycle,
      subscriptionStatus: subStatus,
      paymentStatus: payStatus,
      onboardingStatus: org.onboardingStatus,
      provisioningStatus: org.provisioningStatus,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };

    const isTerminal = lifecycle === 'cancelled' || lifecycle === 'archived' || lifecycle === 'closed';
    if (!isTerminal && org.provisioningStatus !== 'simulated_complete') {
      incompleteProvisioningOrganizations += 1;
    }

    // Queue 1: New Registrations
    if (lifecycle === 'draft' || lifecycle === 'registration_pending') {
      attentionOrgIds.add(org.id);
      queues.new_registrations.push({
        ...baseItem,
        id: `q_reg_${org.id}`,
        queueId: 'new_registrations',
        title: org.name,
        subtitle: `${org.administrator?.name || 'No Admin Assigned'} • ${planName}`,
        severity: lifecycle === 'registration_pending' ? 'high' : 'medium',
        statusBadge: lifecycle,
        actionLabel: 'Review Registration',
        href: `/organizations/${org.id}`,
      });
    }

    // Queue 2: Pending Organization Reviews
    if (lifecycle === 'registration_pending' || lifecycle === 'awaiting_configuration') {
      attentionOrgIds.add(org.id);
      queues.pending_reviews.push({
        ...baseItem,
        id: `q_rev_${org.id}`,
        queueId: 'pending_reviews',
        title: org.name,
        subtitle: `Lifecycle: ${lifecycle.replace(/_/g, ' ')} • Readiness ${readiness.score}%`,
        severity: 'high',
        statusBadge: lifecycle,
        actionLabel: 'Inspect Review Status',
        href: `/organizations/${org.id}?tab=readiness`,
      });
    }

    // Queue 3: Incomplete Onboarding
    if (
      lifecycle === 'onboarding_in_progress' ||
      lifecycle === 'awaiting_configuration' ||
      (!isTerminal && lifecycle !== 'draft' && org.onboardingStatus !== 'completed')
    ) {
      attentionOrgIds.add(org.id);
      queues.incomplete_onboarding.push({
        ...baseItem,
        id: `q_onb_${org.id}`,
        queueId: 'incomplete_onboarding',
        title: org.name,
        subtitle: `Onboarding: ${org.onboardingStatus} • ${readiness.score}% ready (${blockerTitles.length} blocker(s))`,
        severity: readiness.hasBlockers ? 'high' : 'medium',
        statusBadge: org.onboardingStatus,
        actionLabel: 'Open Onboarding & Readiness',
        href: `/organizations/${org.id}?tab=onboarding`,
      });
    }

    // Queue 4: Awaiting Activation
    if (lifecycle === 'awaiting_activation') {
      attentionOrgIds.add(org.id);
      queues.awaiting_activation.push({
        ...baseItem,
        id: `q_act_${org.id}`,
        queueId: 'awaiting_activation',
        title: org.name,
        subtitle: `Ready for Launch Sign-Off • ${orgCampuses.length} campus(es) • ${planName}`,
        severity: readiness.hasBlockers ? 'critical' : 'high',
        statusBadge: 'awaiting_activation',
        actionLabel: 'Review Activation',
        href: `/organizations/${org.id}?tab=onboarding`,
      });
    }

    // Queue 5: Provisioning Exceptions
    if (
      org.provisioningStatus === 'simulated_failed' ||
      org.provisioningStatus === 'ready_for_review' ||
      org.provisioningStatus === 'needs_attention' ||
      (!isTerminal && readiness.hasBlockers && org.provisioningStatus !== 'simulated_complete')
    ) {
      attentionOrgIds.add(org.id);
      queues.provisioning_exceptions.push({
        ...baseItem,
        id: `q_prov_${org.id}`,
        queueId: 'provisioning_exceptions',
        title: org.name,
        subtitle: `Provisioning: ${org.provisioningStatus || 'not_started'} • Blockers: ${blockerTitles.join(', ') || 'Pending prerequisites'}`,
        severity: org.provisioningStatus === 'simulated_failed' ? 'critical' : 'high',
        statusBadge: org.provisioningStatus || 'not_started',
        actionLabel: 'Inspect Provisioning',
        href: `/organizations/${org.id}?tab=onboarding`,
      });
    }

    // Queue 6: Subscription Exceptions
    const orgOverdueInvoices = invoices.filter(
      (i) => i.organizationId === org.id && (i.status === 'overdue' || i.status === 'uncollectible')
    );
    const hasSubException =
      (!isTerminal && (subStatus === 'past_due' || subStatus === 'expired' || payStatus === 'overdue' || payStatus === 'failed')) ||
      orgOverdueInvoices.length > 0;
    if (hasSubException) {
      attentionOrgIds.add(org.id);
      subExceptionOrgIds.add(org.id);
      queues.subscription_exceptions.push({
        ...baseItem,
        id: `q_sub_${org.id}`,
        queueId: 'subscription_exceptions',
        title: org.name,
        subtitle: `Sub: ${subStatus} • Payment: ${payStatus} • ${orgOverdueInvoices.length} unpaid overdue invoice(s)`,
        severity: subStatus === 'expired' || payStatus === 'failed' ? 'critical' : 'high',
        statusBadge: subStatus,
        actionLabel: 'Review Billing & Plan',
        href: `/organizations/${org.id}/subscription`,
      });
    }

    // Queue 7: Suspended Organizations
    if (lifecycle === 'suspended') {
      attentionOrgIds.add(org.id);
      queues.suspended_organizations.push({
        ...baseItem,
        id: `q_susp_${org.id}`,
        queueId: 'suspended_organizations',
        title: org.name,
        subtitle: org.notes || 'Suspended Pending Executive or Billing Clearance',
        severity: 'critical',
        statusBadge: 'suspended',
        actionLabel: 'Inspect Suspension',
        href: `/organizations/${org.id}`,
      });
    }

    // Queue 8: Cancellation Requests
    if (lifecycle === 'cancellation_pending') {
      attentionOrgIds.add(org.id);
      queues.cancellation_requests.push({
        ...baseItem,
        id: `q_cancel_${org.id}`,
        queueId: 'cancellation_requests',
        title: org.name,
        subtitle: `Effective ${org.cancellationEffectiveAt ? org.cancellationEffectiveAt.slice(0, 10) : 'Pending Date'} • Export Hold Active`,
        severity: 'high',
        statusBadge: 'cancellation_pending',
        actionLabel: 'Manage Offboarding',
        href: `/organizations/${org.id}`,
      });
    }
  }

  // Queue 9: Unresolved Support Cases
  const openTickets = supportTickets.filter((t) => OPEN_TICKET_STATUSES.has(t.status));
  for (const tck of openTickets) {
    supportOrgIds.add(tck.organizationId);
    attentionOrgIds.add(tck.organizationId);
    const org = organizations.find((o) => o.id === tck.organizationId);
    const sub = subscriptions.find((s) => s.organizationId === tck.organizationId);
    const plan = plans.find((p) => p.id === (sub?.planId || org?.planId));

    queues.unresolved_support_cases.push({
      id: `q_tck_${tck.id}`,
      queueId: 'unresolved_support_cases',
      organizationId: tck.organizationId,
      organizationName: org?.name || tck.organizationId,
      organizationCode: org?.code || tck.organizationId,
      campusId: tck.campusId || undefined,
      campusName: tck.campusName,
      planId: plan?.id || org?.planId,
      planName: plan?.name || org?.planId || 'N/A',
      lifecycleStatus: org ? normalizeTenantLifecycleStatus(org.status) : 'unknown',
      title: `${tck.ticketNumber}: ${tck.subject}`,
      subtitle: `${org?.name || tck.organizationId}${tck.campusName ? ` (${tck.campusName})` : ''} • ${tck.assignedOperatorName || 'Unassigned'}`,
      severity:
        tck.status === 'escalated' || tck.priority === 'urgent'
          ? 'critical'
          : tck.priority === 'high'
          ? 'high'
          : tck.priority === 'normal'
          ? 'medium'
          : 'low',
      statusBadge: tck.status,
      createdAt: tck.createdAt,
      updatedAt: tck.updatedAt,
      actionLabel: 'Open Ticket Desk',
      href: `/support?ticket=${tck.id}`,
    });
  }

  // Queue 10: Administrative Approvals
  const pendingApprovals = approvals.filter((a) => a.status === 'pending_review');
  for (const apr of pendingApprovals) {
    if (apr.organizationId) attentionOrgIds.add(apr.organizationId);
    const org = apr.organizationId ? organizations.find((o) => o.id === apr.organizationId) : undefined;
    queues.administrative_approvals.push({
      id: `q_apr_${apr.id}`,
      queueId: 'administrative_approvals',
      organizationId: apr.organizationId || 'platform',
      organizationName: apr.organizationName || org?.name || 'Platform Governance',
      organizationCode: org?.code || 'PLATFORM',
      campusId: apr.campusId,
      campusName: apr.campusName,
      planId: org?.planId,
      planName: org ? plans.find((p) => p.id === org.planId)?.name : 'Global',
      lifecycleStatus: org ? normalizeTenantLifecycleStatus(org.status) : 'active',
      title: `${apr.referenceCode}: ${apr.title}`,
      subtitle: `Requested by ${apr.requestedBy.name} (${apr.requestedBy.role}) • ${apr.requestedActionLabel}`,
      severity: apr.priority === 'urgent' ? 'critical' : apr.priority === 'high' ? 'high' : 'medium',
      statusBadge: apr.status,
      createdAt: apr.requestedAt,
      updatedAt: apr.requestedAt,
      actionLabel: 'Review Approval',
      href: `/approvals?request=${apr.id}`,
    });
  }

  const openExceptionsTotal = exceptions.filter((e) => isExceptionOpen(e.status)).length;
  for (const exc of exceptions) {
    if (isExceptionOpen(exc.status) && exc.organizationId && exc.organizationId !== 'platform') {
      attentionOrgIds.add(exc.organizationId);
    }
  }

  const overview: PlatformOperationalOverviewMetrics = {
    totalOrganizations: organizations.length,
    byLifecycle,
    activeOrganizations: byLifecycle.active,
    trialOrganizations: byLifecycle.trial,
    undergoingOnboardingOrganizations:
      byLifecycle.draft +
      byLifecycle.registration_pending +
      byLifecycle.onboarding_in_progress +
      byLifecycle.awaiting_configuration,
    awaitingActivationOrganizations: byLifecycle.awaiting_activation,
    suspendedOrganizations: byLifecycle.suspended,
    cancellationPendingOrganizations: byLifecycle.cancellation_pending,
    cancelledOrganizations: byLifecycle.cancelled,
    archivedOrganizations: byLifecycle.archived,
    closedOrganizations: byLifecycle.closed,
    incompleteProvisioningOrganizations,
    organizationsWithUnresolvedSupport: supportOrgIds.size,
    organizationsWithSubscriptionExceptions: subExceptionOrgIds.size,
    organizationsRequiringAttention: attentionOrgIds.size,
    unresolvedSupportCasesTotal: openTickets.length,
    pendingApprovalsTotal: pendingApprovals.length,
    openExceptionsTotal,
  };

  return { overview, queues };
}

export function queryOperationalQueue(
  items: OperationalQueueItem[],
  query: OperationalQueueQuery = {}
): PaginatedOperationalQueueResult {
  const {
    search = '',
    severity = 'all',
    planId = 'all',
    sortBy = 'priority_desc',
    page = 1,
    pageSize = 6,
  } = query;

  let filtered = [...items];

  if (search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.organizationName.toLowerCase().includes(q) ||
        item.organizationCode.toLowerCase().includes(q) ||
        item.statusBadge.toLowerCase().includes(q)
    );
  }

  if (severity !== 'all') {
    filtered = filtered.filter((item) => item.severity === severity);
  }

  if (planId !== 'all') {
    filtered = filtered.filter((item) => item.planId === planId);
  }

  const sevRank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  filtered.sort((a, b) => {
    if (sortBy === 'date_desc') return b.updatedAt.localeCompare(a.updatedAt);
    if (sortBy === 'date_asc') return a.updatedAt.localeCompare(b.updatedAt);
    if (sortBy === 'name_asc') return a.organizationName.localeCompare(b.organizationName);
    const sevDiff = (sevRank[b.severity] || 0) - (sevRank[a.severity] || 0);
    if (sevDiff !== 0) return sevDiff;
    return b.updatedAt.localeCompare(a.updatedAt);
  });

  const safePageSize = Math.max(1, pageSize);
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safePageSize;

  return {
    items: filtered.slice(start, start + safePageSize),
    totalItems,
    totalPages,
    page: safePage,
    pageSize: safePageSize,
  };
}
