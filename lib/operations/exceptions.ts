/**
 * Phase P0-6.7: Operational Exceptions & Escalation Engine
 *
 * Derives platform operational exceptions deterministically from canonical P0-5
 * organization lifecycle, readiness, provisioning, subscription/payment, campus,
 * support ticket, and stalled approval states, and merges explicit triage records
 * stored in PlatformStore.
 */

import { Organization } from '@/lib/types/organizations';
import { Campus } from '@/lib/types/campuses';
import { OrganizationSubscription, Invoice } from '@/lib/types/subscriptions';
import { SupportTicket } from '@/lib/types/support-desk';
import { normalizeTenantLifecycleStatus } from '@/lib/lifecycle/canonical-lifecycle';
import { evaluateOrganizationReadiness } from '@/lib/readiness/evaluator';
import {
  OperationalExceptionRecord,
  OperationalExceptionSeverity,
  OperationalExceptionStatus,
  PlatformApprovalRequest,
} from './canonical-operations';

export function deriveOperationalExceptions(params: {
  organizations: Organization[];
  campuses: Campus[];
  subscriptions: OrganizationSubscription[];
  invoices: Invoice[];
  supportTickets: SupportTicket[];
  approvals: PlatformApprovalRequest[];
  explicitExceptions: OperationalExceptionRecord[];
  referenceIso?: string;
}): OperationalExceptionRecord[] {
  const {
    organizations,
    campuses,
    subscriptions,
    invoices,
    supportTickets,
    approvals,
    explicitExceptions,
    referenceIso = '2026-11-26T12:00:00Z',
  } = params;

  const explicitById = new Map<string, OperationalExceptionRecord>();
  const result: OperationalExceptionRecord[] = [];

  for (const item of explicitExceptions) {
    explicitById.set(item.id, item);
    result.push(item);
  }

  for (const org of organizations) {
    const lifecycle = normalizeTenantLifecycleStatus(org.status);
    const orgCampuses = campuses.filter((c) => c.organizationId === org.id);
    const sub = subscriptions.find((s) => s.organizationId === org.id);
    const orgInvoices = invoices.filter((inv) => inv.organizationId === org.id);
    const readiness = evaluateOrganizationReadiness({
      organization: org,
      campuses: orgCampuses,
      plan: undefined,
      subscription: sub,
      evaluatedAt: referenceIso,
    });
    const blockerTitles = readiness.items.filter((i) => i.status === 'incomplete').map((i) => i.title);

    // 1. Provisioning failures / review holds
    if (
      org.provisioningStatus === 'simulated_failed' ||
      org.provisioningStatus === 'ready_for_review' ||
      org.provisioningStatus === 'needs_attention'
    ) {
      const id = `exc_drv_prov_${org.id}`;
      if (!explicitById.has(id)) {
        result.push({
          id,
          referenceCode: `EXC-PROV-${org.code}`,
          domain: 'provisioning_failure',
          severity: org.provisioningStatus === 'simulated_failed' ? 'critical' : 'high',
          status: 'open',
          title: `Provisioning Preparation ${org.provisioningStatus === 'simulated_failed' ? 'Failed' : 'Requires Review'} — ${org.name}`,
          description: `Simulated tenant preparation status is "${org.provisioningStatus}". Readiness blockers: ${blockerTitles.join(', ') || 'See checklist'}.`,
          recommendedAction: 'Inspect Tenant Details -> Readiness & Provisioning and remediate prerequisite blockers.',
          organizationId: org.id,
          organizationName: org.name,
          detectedAt: org.updatedAt || org.createdAt,
          updatedAt: org.updatedAt || referenceIso,
          isDerived: true,
          visibility: 'platform_only',
        });
      }
    }

    // 2. Onboarding incomplete / configuration holds
    if (
      (lifecycle === 'onboarding_in_progress' || lifecycle === 'awaiting_configuration') &&
      org.onboardingStatus !== 'completed'
    ) {
      const id = `exc_drv_onb_${org.id}`;
      if (!explicitById.has(id)) {
        result.push({
          id,
          referenceCode: `EXC-ONB-${org.code}`,
          domain: 'onboarding_incomplete',
          severity: readiness.hasBlockers ? 'high' : 'medium',
          status: 'open',
          title: `Incomplete Onboarding Configuration — ${org.name}`,
          description: `Tenant is in "${lifecycle}" with ${readiness.score}% readiness (${blockerTitles.length} blocker(s)).`,
          recommendedAction: 'Follow up with school administrator or review onboarding checklist items.',
          organizationId: org.id,
          organizationName: org.name,
          detectedAt: org.updatedAt || org.createdAt,
          updatedAt: org.updatedAt || referenceIso,
          isDerived: true,
          visibility: 'tenant_summary_safe',
          tenantSafeGuidance:
            'Complete required school profile, main campus, and academic structure items in the Onboarding Wizard.',
        });
      }
    }

    // 3. Missing admin contact configuration
    if (!org.administrator?.name || !org.administrator?.email || !org.contact?.email) {
      const id = `exc_drv_adm_${org.id}`;
      if (!explicitById.has(id)) {
        result.push({
          id,
          referenceCode: `EXC-ADM-${org.code}`,
          domain: 'admin_setup_incomplete',
          severity: 'medium',
          status: 'open',
          title: `Primary Administrator / Contact Metadata Incomplete — ${org.name}`,
          description: 'Organization record is missing verified executive administrator or primary contact email.',
          recommendedAction: 'Update organization administrator coordinates prior to launch sign-off.',
          organizationId: org.id,
          organizationName: org.name,
          detectedAt: org.updatedAt || org.createdAt,
          updatedAt: org.updatedAt || referenceIso,
          isDerived: true,
          visibility: 'platform_only',
        });
      }
    }

    // 4. Campus configuration issues (no campuses or no main campus on active/onboarding org, or quota exceeded)
    const activeMain = orgCampuses.filter((c) => c.isMainCampus);
    if (
      lifecycle !== 'draft' &&
      lifecycle !== 'cancelled' &&
      lifecycle !== 'archived' &&
      lifecycle !== 'closed' &&
      (orgCampuses.length === 0 || activeMain.length !== 1 || orgCampuses.length > (org.technicalConfig?.maxCampuses || 10))
    ) {
      const id = `exc_drv_camp_${org.id}`;
      if (!explicitById.has(id)) {
        result.push({
          id,
          referenceCode: `EXC-CMP-${org.code}`,
          domain: 'campus_configuration',
          severity: orgCampuses.length === 0 ? 'critical' : 'high',
          status: 'open',
          title: `Campus Configuration Anomaly — ${org.name}`,
          description:
            orgCampuses.length === 0
              ? 'Zero campuses allocated to institution.'
              : activeMain.length !== 1
              ? `Expected exactly 1 designated main campus, found ${activeMain.length}.`
              : `Campus count (${orgCampuses.length}) exceeds technicalConfig.maxCampuses (${org.technicalConfig?.maxCampuses}).`,
          recommendedAction: 'Verify main campus designation and campus quota ceiling.',
          organizationId: org.id,
          organizationName: org.name,
          detectedAt: org.updatedAt || org.createdAt,
          updatedAt: org.updatedAt || referenceIso,
          isDerived: true,
          visibility: 'platform_only',
        });
      }
    }

    // 5. Subscription / Payment mismatch
    const subStatus = (sub?.status || org.subscriptionStatus || 'active').toLowerCase();
    const payStatus = (org.paymentStatus || 'paid').toLowerCase();
    const hasOverdueInv = orgInvoices.some(
      (i) => i.status === 'overdue' || i.status === 'uncollectible'
    );
    if (
      (lifecycle === 'active' || lifecycle === 'trial' || lifecycle === 'awaiting_activation') &&
      (subStatus === 'past_due' || subStatus === 'expired' || subStatus === 'canceled' || payStatus === 'overdue' || payStatus === 'failed' || hasOverdueInv)
    ) {
      const id = `exc_drv_sub_${org.id}`;
      if (!explicitById.has(id)) {
        result.push({
          id,
          referenceCode: `EXC-BIL-${org.code}`,
          domain: 'subscription_payment_mismatch',
          severity: subStatus === 'expired' || subStatus === 'canceled' ? 'high' : 'medium',
          status: 'open',
          title: `Subscription / Payment Exception (${subStatus} / ${payStatus}) — ${org.name}`,
          description: `Institution holds lifecycle "${lifecycle}" while subscription="${subStatus}" and paymentStatus="${payStatus}". Lifecycle status remains preserved separately from billing.`,
          recommendedAction: 'Review billing ledger, record offline settlement, or initiate scheduled outreach.',
          organizationId: org.id,
          organizationName: org.name,
          detectedAt: org.updatedAt || org.createdAt,
          updatedAt: org.updatedAt || referenceIso,
          isDerived: true,
          visibility: 'tenant_summary_safe',
          tenantSafeGuidance:
            'Your subscription or invoice settlement requires attention in Settings -> Subscription to prevent paid module locks.',
        });
      }
    }
  }

  // 6. Escalated or urgent unresolved support cases
  for (const tck of supportTickets) {
    const isResolved = tck.status === 'resolved' || tck.status === 'closed';
    if (!isResolved && (tck.status === 'escalated' || tck.escalation?.isEscalated || tck.priority === 'urgent')) {
      const org = organizations.find((o) => o.id === tck.organizationId);
      const id = `exc_drv_tck_${tck.id}`;
      if (!explicitById.has(id)) {
        result.push({
          id,
          referenceCode: `EXC-${tck.ticketNumber}`,
          domain: 'support_escalation',
          severity: tck.priority === 'urgent' ? 'critical' : 'high',
          status: tck.status === 'escalated' ? 'escalated' : 'open',
          title: `Unresolved Urgent/Escalated Case ${tck.ticketNumber}: ${tck.subject}`,
          description: `Case status "${tck.status}", priority "${tck.priority}". ${tck.escalation?.reason || 'Requires immediate specialist response.'}`,
          recommendedAction: 'Review ticket conversation thread, assign Tier-2/3 owner, or document remediation note.',
          organizationId: tck.organizationId,
          organizationName: org?.name || tck.organizationId,
          campusId: tck.campusId || undefined,
          campusName: tck.campusName,
          linkedTicketId: tck.id,
          assignedOperatorId: tck.assignedOperatorId || undefined,
          assignedOperatorName: tck.assignedOperatorName,
          detectedAt: tck.createdAt,
          updatedAt: tck.updatedAt,
          isDerived: true,
          visibility: 'platform_only',
        });
      }
    }
  }

  // 7. Pending approvals awaiting decision
  for (const apr of approvals) {
    if (apr.status === 'pending_review') {
      const id = `exc_drv_apr_${apr.id}`;
      if (!explicitById.has(id)) {
        result.push({
          id,
          referenceCode: `EXC-${apr.referenceCode}`,
          domain: 'approval_stalled',
          severity: apr.priority === 'urgent' ? 'high' : 'medium',
          status: 'open',
          title: `Pending Governance Approval: ${apr.title}`,
          description: apr.description,
          recommendedAction: 'Review in Approvals Center (non-requester operator required).',
          organizationId: apr.organizationId || 'platform',
          organizationName: apr.organizationName || 'Platform Governance',
          campusId: apr.campusId,
          campusName: apr.campusName,
          linkedApprovalId: apr.id,
          detectedAt: apr.requestedAt,
          updatedAt: apr.requestedAt,
          isDerived: true,
          visibility: 'platform_only',
        });
      }
    }
  }

  const severityOrder: Record<OperationalExceptionSeverity, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return result.sort((a, b) => {
    const aClosed = a.status === 'resolved' || a.status === 'dismissed' ? 0 : 1;
    const bClosed = b.status === 'resolved' || b.status === 'dismissed' ? 0 : 1;
    if (aClosed !== bClosed) return bClosed - aClosed;
    const sevDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    if (sevDiff !== 0) return sevDiff;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function isExceptionOpen(status: OperationalExceptionStatus): boolean {
  return status !== 'resolved' && status !== 'dismissed';
}
