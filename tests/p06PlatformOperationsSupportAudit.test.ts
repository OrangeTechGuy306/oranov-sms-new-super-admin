import { describe, it, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { PlatformStore } from '../lib/data/platform-store';
import {
  CANONICAL_TENANT_LIFECYCLE_STATUSES,
} from '../lib/lifecycle/canonical-lifecycle';
import {
  P0_6_FRONTEND_SIMULATION_DISCLAIMER,
  computeTicketNeutralAgeSummary,
  evaluateApprovalDecision,
  filterPublishedNoticesForTenant,
  projectTicketForTenantView,
} from '../lib/operations/canonical-operations';
import { queryOperationalQueue } from '../lib/operations/queues';
import { filterAuditEvents, sanitizeCsvCell } from '../lib/compliance/evaluator';
import { evaluatePlatformRouteAccess, canPerformPlatformAction } from '../lib/iam/rbac';
import { INITIAL_PLATFORM_ROLES, ENHANCED_PLATFORM_USERS } from '../lib/iam/fixtures';

const DASHBOARD_ROOT = process.cwd();
const FRONTEND_ROOT = path.resolve(DASHBOARD_ROOT, '../frontend');

describe('Phase P0-6: Platform Tenant Operations, Support Desk, Approvals, Notices & Audit Governance', () => {
  let store: PlatformStore;

  beforeEach(() => {
    store = new PlatformStore();
    store.resetToDefaults();
  });

  after(() => {
    store.resetToDefaults();
  });

  it('maintains byte-for-byte canonical-operations.ts parity between dashboard and frontend', () => {
    const dashFile = fs.readFileSync(
      path.join(DASHBOARD_ROOT, 'lib/operations/canonical-operations.ts'),
      'utf8'
    );
    const frontFile = fs.readFileSync(
      path.join(FRONTEND_ROOT, 'lib/operations/canonical-operations.ts'),
      'utf8'
    );
    assert.equal(dashFile, frontFile);
  });

  it('computes canonical 12-state operational overview metrics and populates all 10 operational queues', () => {
    const { overview, queues } = store.getOperationalOverview();

    assert.ok(overview.totalOrganizations >= 12);
    let lifecycleSum = 0;
    for (const st of CANONICAL_TENANT_LIFECYCLE_STATUSES) {
      assert.equal(typeof overview.byLifecycle[st], 'number');
      lifecycleSum += overview.byLifecycle[st];
    }
    assert.equal(lifecycleSum, overview.totalOrganizations);

    // Distinct separation of unrelated statuses
    assert.equal(overview.activeOrganizations, overview.byLifecycle.active);
    assert.equal(overview.suspendedOrganizations, overview.byLifecycle.suspended);
    assert.equal(overview.awaitingActivationOrganizations, overview.byLifecycle.awaiting_activation);
    assert.equal(overview.cancellationPendingOrganizations, overview.byLifecycle.cancellation_pending);
    assert.equal(overview.cancelledOrganizations, overview.byLifecycle.cancelled);
    assert.equal(overview.archivedOrganizations, overview.byLifecycle.archived);
    assert.ok(overview.organizationsRequiringAttention > 0);
    assert.ok(overview.unresolvedSupportCasesTotal > 0);
    assert.ok(overview.pendingApprovalsTotal > 0);
    assert.ok(overview.openExceptionsTotal > 0);

    const expectedQueueIds = [
      'new_registrations',
      'pending_reviews',
      'incomplete_onboarding',
      'awaiting_activation',
      'provisioning_exceptions',
      'subscription_exceptions',
      'suspended_organizations',
      'cancellation_requests',
      'unresolved_support_cases',
      'administrative_approvals',
    ] as const;

    for (const qId of expectedQueueIds) {
      assert.ok(Array.isArray(queues[qId]), `Queue ${qId} should be an array`);
      assert.ok(queues[qId].length > 0, `Queue ${qId} should contain actionable fixture items`);
      for (const item of queues[qId]) {
        assert.ok(item.href.startsWith('/'), `Queue item ${item.id} must link to an internal route`);
      }
    }
  });

  it('supports deterministic filtering, sorting, and pagination on operational queues', () => {
    const { queues } = store.getOperationalOverview();
    const supportQueue = queues.unresolved_support_cases;

    const filteredCritical = queryOperationalQueue(supportQueue, {
      severity: 'critical',
      sortBy: 'name_asc',
      page: 1,
      pageSize: 2,
    });
    assert.ok(filteredCritical.items.every((i) => i.severity === 'critical'));
    assert.ok(filteredCritical.items.length <= 2);

    const page1 = queryOperationalQueue(supportQueue, { page: 1, pageSize: 2, sortBy: 'date_desc' });
    const page2 = queryOperationalQueue(supportQueue, { page: 2, pageSize: 2, sortBy: 'date_desc' });
    if (page1.totalItems > 2) {
      assert.notEqual(page1.items[0]?.id, page2.items[0]?.id);
    }
  });

  it('enforces controlled P0-6 support desk transitions (assigned, reopened) and fails closed on tenant projection', () => {
    const created = store.createSupportTicket(
      {
        organizationId: 'org_001',
        campusId: 'camp_001_1',
        campusName: 'Oak Hill Main Campus',
        subject: 'Campus Attendance Sync Discrepancy Verification',
        description: 'Testing P0-6 ticket creation, assignment, resolution, and reopen transitions.',
        category: 'technical_issues',
        priority: 'high',
        requester: { name: 'Dr. Eleanor Vance', email: 'eleanor.vance@oakhill.edu', roleTitle: 'Principal' },
      },
      'usr_support_03'
    );
    assert.equal(created.success, true);
    assert.ok(created.ticket);
    const tckId = created.ticket!.id;

    // Assign moves 'new' -> 'assigned'
    const assigned = store.assignSupportTicket(tckId, 'usr_support_03', undefined, 'Taking ownership', 'usr_support_03');
    assert.equal(assigned.success, true);
    assert.equal(assigned.ticket?.status, 'assigned');

    // Add both an internal note and a tenant-visible reply
    const internalNote = store.addSupportTicketMessage(
      tckId,
      'internal_note',
      'CONFIDENTIAL INTERNAL NOTE: engineering trace id xyz-999',
      false,
      'usr_support_03'
    );
    assert.equal(internalNote.success, true);

    const publicReply = store.addSupportTicketMessage(
      tckId,
      'tenant_reply',
      'We have reviewed your campus attendance settings and refreshed the queue.',
      false,
      'usr_support_03'
    );
    assert.equal(publicReply.success, true);

    // Tenant projection MUST strip internal_note while preserving tenant_reply
    const projected = projectTicketForTenantView(publicReply.ticket!);
    assert.equal(projected.redactedInternalNoteCount, 1);
    assert.ok(projected.messages.every((m) => m.type !== ('internal_note' as unknown)));
    assert.ok(!JSON.stringify(projected).includes('CONFIDENTIAL INTERNAL NOTE'));
    assert.ok(JSON.stringify(projected).includes('refreshed the queue'));

    // Resolve and reject invalid direct transition to in_progress from closed
    const resolved = store.transitionSupportTicketStatus(
      tckId,
      'resolved',
      'Verified campus sync recovered successfully.',
      'usr_support_03'
    );
    assert.equal(resolved.success, true);
    assert.equal(resolved.ticket?.status, 'resolved');

    const closed = store.transitionSupportTicketStatus(tckId, 'closed', 'Confirmed complete', 'usr_support_03');
    assert.equal(closed.success, true);

    const invalidDirect = store.transitionSupportTicketStatus(tckId, 'in_progress', 'Bypass', 'usr_support_03');
    assert.equal(invalidDirect.success, false);

    // Reopen with valid rationale moves closed -> reopened
    const reopened = store.transitionSupportTicketStatus(
      tckId,
      'reopened',
      'Client reported secondary campus still affected.',
      'usr_support_03'
    );
    assert.equal(reopened.success, true);
    assert.equal(reopened.ticket?.status, 'reopened');
    assert.equal(reopened.ticket?.resolvedAt, null);
    assert.equal(reopened.ticket?.closedAt, null);
    assert.equal(reopened.ticket?.reopenCount, 1);

    // Neutral ticket age calculation avoids SLA promises
    const age = computeTicketNeutralAgeSummary(reopened.ticket!, '2026-12-01T12:00:00Z');
    assert.ok(age.ageHours >= 0);
    assert.ok(typeof age.lastResponseLabel === 'string');
  });

  it('prevents self-approval and enforces audit rationale on administrative approvals', () => {
    const approvals = store.getPlatformApprovals();
    const apr001 = approvals.find((a) => a.id === 'apr_001');
    assert.ok(apr001);
    assert.equal(apr001.requestedBy.id, 'usr_ops_02');

    // Pure evaluator blocks self-approval
    const selfEval = evaluateApprovalDecision(
      apr001,
      'approved',
      { id: 'usr_ops_02', name: 'Sarah Connor', role: 'platform_operator' },
      'Approving my own request'
    );
    assert.equal(selfEval.permitted, false);

    // Store rejects self-approval and logs BLOCKED audit event
    const selfReview = store.reviewApprovalRequest(
      'apr_001',
      'approved',
      'usr_ops_02',
      'Attempting self approval'
    );
    assert.equal(selfReview.success, false);

    const blockedAudit = store
      .getAuditEvents()
      .find((e) => e.action === 'APPROVAL_DECISION_BLOCKED' && e.targetId === apr001.referenceCode);
    assert.ok(blockedAudit, 'Self-approval attempt must be recorded in audit log');

    // Short rationale fails
    const shortReason = store.reviewApprovalRequest('apr_001', 'approved', 'usr_super_01', 'ok');
    assert.equal(shortReason.success, false);

    // Independent operator with valid rationale succeeds
    const approved = store.reviewApprovalRequest(
      'apr_001',
      'approved',
      'usr_super_01',
      'Verified 100% readiness checklist and sandbox simulation output.'
    );
    assert.equal(approved.success, true);
    assert.equal(approved.approval?.status, 'approved');
    assert.equal(approved.approval?.reviewedBy?.id, 'usr_super_01');
  });

  it('keeps draft and pending_approval platform notices isolated until approved & published_simulated', () => {
    const created = store.createPlatformNotice(
      {
        title: 'Growth Plan Maintenance Advisory',
        summary: 'Scheduled verification advisory for Growth plan campuses.',
        body: 'Detailed non-contractual advisory notice explaining expected read-only window.',
        category: 'maintenance_advisory',
        severity: 'warning',
        audience: 'plan_tiers',
        targetPlanIds: ['plan_growth'],
        requiresApproval: true,
        channelSimulations: ['in_app'],
      },
      'usr_ops_02'
    );
    assert.equal(created.success, true);
    assert.ok(created.notice);
    assert.equal(created.notice!.status, 'pending_approval');
    assert.equal(created.notice!.disclaimer, P0_6_FRONTEND_SIMULATION_DISCLAIMER);

    // Must not be visible to any tenant while pending approval
    const prePublishGrowth = filterPublishedNoticesForTenant(store.getPlatformNotices(), {
      id: 'tenant-crestview-003',
      planId: 'plan_growth',
    });
    assert.ok(!prePublishGrowth.some((n) => n.id === created.notice!.id));

    // Publishing before approval is blocked
    const blockedPub = store.transitionPlatformNoticeStatus(
      created.notice!.id,
      'published_simulated',
      'usr_super_01'
    );
    assert.equal(blockedPub.success, false);

    // Approve linked approval request by another operator, then publish
    const linkedApproval = store
      .getPlatformApprovals()
      .find((a) => a.targetEntityId === created.notice!.id);
    assert.ok(linkedApproval);
    const aprRes = store.reviewApprovalRequest(
      linkedApproval!.id,
      'approved',
      'usr_super_01',
      'Verified notice wording accurately marks simulated delivery.'
    );
    assert.equal(aprRes.success, true);

    const published = store.transitionPlatformNoticeStatus(
      created.notice!.id,
      'published_simulated',
      'usr_super_01'
    );
    assert.equal(published.success, true);

    // Visible to Growth tenant, hidden from Starter tenant
    const visibleGrowth = filterPublishedNoticesForTenant(store.getPlatformNotices(), {
      id: 'tenant-crestview-003',
      planId: 'plan_growth',
    });
    const visibleStarter = filterPublishedNoticesForTenant(store.getPlatformNotices(), {
      id: 'tenant-starter-007',
      planId: 'plan_starter',
    });
    assert.ok(visibleGrowth.some((n) => n.id === created.notice!.id));
    assert.ok(!visibleStarter.some((n) => n.id === created.notice!.id));
  });

  it('derives operational exceptions from canonical state and validates triage rationale', () => {
    const exceptions = store.getOperationalExceptions();
    assert.ok(exceptions.length > 0);
    const sample = exceptions[0];

    const missingNotes = store.triageOperationalException(sample.id, 'resolved', 'usr_super_01', {
      notes: 'no',
    });
    assert.equal(missingNotes.success, false);

    const resolved = store.triageOperationalException(sample.id, 'resolved', 'usr_super_01', {
      notes: 'Coordinated remediation with school administrator and verified checklist.',
    });
    assert.equal(resolved.success, true);
    assert.equal(resolved.exception?.status, 'resolved');
  });

  it('filters audit events by organization and campus while sanitizing CSV cells against formula injection', () => {
    store.transitionSupportTicketStatus(
      'tck_1001',
      'in_progress',
      'Investigating CBT gateway logs',
      'usr_support_03'
    );
    const events = store.getAuditEvents();
    const org001Events = filterAuditEvents(events, { organizationId: 'org_001' });
    assert.ok(org001Events.length > 0);
    assert.ok(
      org001Events.every((e) => e.organizationId === 'org_001' || e.targetId === 'org_001')
    );

    const campusEvents = filterAuditEvents(events, { campusId: 'camp_001_1' });
    assert.ok(campusEvents.every((e) => e.campusId === 'camp_001_1'));

    assert.equal(sanitizeCsvCell('=CMD|"/C calc"!A0'), '"\'=CMD|""/C calc""!A0"');
    assert.ok(sanitizeCsvCell('=SUM(A1:A2)').startsWith("'=SUM"));
    assert.ok(sanitizeCsvCell('+malicious').startsWith("'+malicious"));
  });

  it('enforces RBAC route and action isolation across platform roles for P0-6 workflows', () => {
    const resolveCtx = (userId: string) => {
      const u = ENHANCED_PLATFORM_USERS.find((x) => x.id === userId)!;
      const role = INITIAL_PLATFORM_ROLES.find((r) => r.id === u.role)!;
      return {
        user: { id: u.id, name: u.name, role: u.role, status: u.status },
        primaryRole: u.role,
        permissions: role.permissions,
      };
    };

    const superCtx = resolveCtx('usr_super_01');
    const supportCtx = resolveCtx('usr_support_03');
    const analystCtx = resolveCtx('usr_audit_05');

    assert.equal(evaluatePlatformRouteAccess(superCtx, '/approvals').allowed, true);
    assert.equal(evaluatePlatformRouteAccess(superCtx, '/exceptions').allowed, true);

    assert.equal(canPerformPlatformAction(analystCtx, 'support.tickets.manage'), false);
    assert.equal(canPerformPlatformAction(analystCtx, 'operations.approvals.manage'), false);
    assert.equal(canPerformPlatformAction(analystCtx, 'communications.notices.manage'), false);
    assert.equal(canPerformPlatformAction(supportCtx, 'operations.approvals.manage'), false);
    assert.equal(canPerformPlatformAction(supportCtx, 'support.tickets.manage'), true);
    assert.equal(canPerformPlatformAction(superCtx, 'operations.approvals.manage'), true);
  });
});
