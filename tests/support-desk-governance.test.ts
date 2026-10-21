import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { platformStore } from '../lib/data/platform-store';
import {
  getValidTicketTransitions,
  evaluateTicketSla,
  calculateSupportMetrics,
  calculateAccountHealthScore,
  computeCustomerSuccessAccountSummaries,
  isOverdueTask,
  formatMinutesDuration,
  formatHoursDuration,
} from '../lib/support/evaluator';
import {
  validateTicketCreation,
  validateStatusTransition,
  validateEscalation,
  validateSlaPolicy,
  validateKbArticle,
  validateCsTask,
} from '../lib/support/validator';
import {
  escapeCsvFormulaInjection,
  exportTicketsToCsv,
  exportCsatToCsv,
  exportCustomerSuccessSummariesToCsv,
} from '../lib/support/exporter';
import {
  SUPPORT_CATEGORIES,
  INITIAL_SUPPORT_TEAMS,
  INITIAL_SLA_POLICIES,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_KB_ARTICLES,
  INITIAL_CSAT_RECORDS,
  INITIAL_CS_TASKS,
} from '../lib/support/fixtures';
import {
  SupportTicket,
  SupportTicketStatus,
  SupportTicketPriority,
  SlaPolicy,
  CreateSupportTicketInput,
  CreateSlaPolicyInput,
  CreateKbArticleInput,
  CreateCsTaskInput,
} from '../lib/types/support-desk';

describe('Phase E-09.17: Platform Support Desk, Customer Success & Tenant Assistance Governance', () => {
  beforeEach(() => {
    platformStore.resetToDefaults();
  });

  // =========================================================================
  // 1. Ticket Lifecycle & State Machine Transitions
  // =========================================================================
  describe('1. Ticket Lifecycle & State Machine Transitions', () => {
    test('permits valid linear lifecycle transitions', () => {
      // new -> open
      const transitionsFromNew = getValidTicketTransitions('new');
      assert.ok(transitionsFromNew.some((t) => t.targetStatus === 'open'));
      assert.ok(transitionsFromNew.some((t) => t.targetStatus === 'in_progress'));

      // open -> in_progress
      const transitionsFromOpen = getValidTicketTransitions('open');
      assert.ok(transitionsFromOpen.some((t) => t.targetStatus === 'in_progress'));
      assert.ok(transitionsFromOpen.some((t) => t.targetStatus === 'awaiting_tenant'));

      // in_progress -> awaiting_tenant -> in_progress
      const transitionsFromAwaiting = getValidTicketTransitions('awaiting_tenant');
      assert.ok(transitionsFromAwaiting.some((t) => t.targetStatus === 'in_progress'));

      // in_progress -> resolved
      const transitionsFromInProgress = getValidTicketTransitions('in_progress');
      assert.ok(transitionsFromInProgress.some((t) => t.targetStatus === 'resolved'));

      // resolved -> closed
      const transitionsFromResolved = getValidTicketTransitions('resolved');
      assert.ok(transitionsFromResolved.some((t) => t.targetStatus === 'closed'));
    });

    test('permits reopening a resolved ticket to open', () => {
      const transitionsFromResolved = getValidTicketTransitions('resolved');
      assert.ok(transitionsFromResolved.some((t) => t.targetStatus === 'open'));
      assert.ok(transitionsFromResolved.some((t) => t.targetStatus === 'closed'));
    });

    test('strictly rejects invalid or skip transitions (e.g., new to resolved, or closed without reason)', () => {
      const validationNewToClosedWithoutReason = validateStatusTransition('new', 'closed');
      assert.equal(validationNewToClosedWithoutReason.isValid, false);
      assert.ok(validationNewToClosedWithoutReason.error?.includes('mandatory audit reason'));

      const validationClosedToInProgress = validateStatusTransition('closed', 'in_progress');
      assert.equal(validationClosedToInProgress.isValid, false);
      assert.ok(validationClosedToInProgress.error?.includes('Illegal state transition'));

      const validationNewToResolved = validateStatusTransition('new', 'resolved');
      assert.equal(validationNewToResolved.isValid, false);
      assert.ok(validationNewToResolved.error?.includes('Illegal state transition'));
    });

    test('validates required fields on ticket creation', () => {
      const validOrgs = platformStore.getOrganizations().map((o) => o.id);

      // Empty subject
      const badInput: CreateSupportTicketInput = {
        subject: '',
        description: 'Detailed description of the CBT sync error.',
        organizationId: validOrgs[0],
        category: 'examinations_cbt',
        priority: 'high',
        requester: {
          name: 'Jane Doe',
          email: 'jane@school.edu',
          roleTitle: 'Principal',
        },
      };

      const result = validateTicketCreation(badInput, validOrgs);
      assert.equal(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('Ticket subject must be at least 5 characters')));

      // Unresolved organization reference
      const invalidOrgInput: CreateSupportTicketInput = {
        ...badInput,
        subject: 'Valid Subject Line for Testing',
        organizationId: 'org_non_existent_9999',
      };
      const orgResult = validateTicketCreation(invalidOrgInput, validOrgs);
      assert.equal(orgResult.isValid, false);
      assert.ok(orgResult.errors.some((e) => e.includes('unresolved school organization reference')));
    });

    test('ticket creation updates local store and initializes messages', () => {
      const validOrgs = platformStore.getOrganizations().map((o) => o.id);
      const input: CreateSupportTicketInput = {
        subject: 'CBT Terminal Disconnection in Exam Hall B',
        description: 'Three testing workstations lost connection to local caching proxy.',
        organizationId: validOrgs[0],
        category: 'examinations_cbt',
        priority: 'urgent',
        requester: {
          name: 'Dr. Alabi',
          email: 'alabi@school.edu',
          roleTitle: 'IT Director',
        },
      };

      const createRes = platformStore.createSupportTicket(input);
      assert.equal(createRes.success, true);
      assert.ok(createRes.ticket);
      assert.equal(createRes.ticket.subject, input.subject);
      assert.equal(createRes.ticket.priority, 'urgent');
      assert.equal(createRes.ticket.status, 'new');
      assert.ok(createRes.ticket.ticketNumber.startsWith('TCK-'));
      assert.ok(createRes.ticket.messages.length > 0);
    });

    test('reassigning operator and team updates ticket and appends timeline message', () => {
      const tickets = platformStore.getSupportTickets();
      const ticket = tickets[0];

      const assignRes = platformStore.assignSupportTicket(
        ticket.id,
        'usr_super_01',
        'team_tier2',
        'Routing to senior tier 2 engineering specialist.'
      );

      assert.equal(assignRes.success, true);
      assert.equal(assignRes.ticket?.assignedOperatorId, 'usr_super_01');
      assert.equal(assignRes.ticket?.assignedTeamId, 'team_tier2');

      const latestMsg = assignRes.ticket?.messages[assignRes.ticket.messages.length - 1];
      assert.equal(latestMsg?.type, 'system_event');
      assert.ok(latestMsg?.content.includes('assignment updated'));
    });

    test('escalating a ticket requires mandatory justification and marks escalation status', () => {
      const tickets = platformStore.getSupportTickets();
      const targetTicket = tickets.find((t) => !t.escalation.isEscalated && t.status !== 'resolved');
      assert.ok(targetTicket);

      // Missing reason should fail validation
      const badEscalation = validateEscalation(
        '   ',
        'team_infrastructure',
        ['team_tier1', 'team_tier2', 'team_infrastructure']
      );
      assert.equal(badEscalation.isValid, false);
      assert.ok(badEscalation.errors.some((e) => e.includes('Escalation reason must be at least 10 characters')));

      // Valid escalation
      const escalateRes = platformStore.escalateSupportTicket(
        targetTicket.id,
        'Subdomain SSL certificate mismatch affecting exam logins.',
        'team_infrastructure',
        'critical',
        'tier_3_engineering'
      );

      assert.equal(escalateRes.success, true);
      assert.equal(escalateRes.ticket?.status, 'escalated');
      assert.equal(escalateRes.ticket?.escalation.isEscalated, true);
      assert.equal(escalateRes.ticket?.escalation.urgencyLevel, 'critical');

      // De-escalation
      const deescalateRes = platformStore.deescalateSupportTicket(
        targetTicket.id,
        'SSL cert reissued by infrastructure team; issue resolved.'
      );
      assert.equal(deescalateRes.success, true);
      assert.equal(deescalateRes.ticket?.escalation.isEscalated, false);
      assert.equal(deescalateRes.ticket?.status, 'in_progress');
    });
  });

  // =========================================================================
  // 2. SLA Policy Configuration & Evaluation Engine
  // =========================================================================
  describe('2. SLA Policy Configuration & Evaluation Engine', () => {
    const testPolicy: SlaPolicy = {
      id: 'sla_test_policy',
      name: 'Test Evaluation SLA Policy',
      description: 'Deterministic test policy',
      planTier: 'growth',
      applicableCategories: 'all',
      applicablePriorities: ['urgent', 'high', 'normal', 'low'],
      firstResponseTargetMinutes: {
        urgent: 15,
        high: 60,
        normal: 120,
        low: 240,
      },
      resolutionTargetMinutes: {
        urgent: 120,
        high: 360,
        normal: 720,
        low: 1440,
      },
      businessHours: {
        enabled: false,
        startTime: '08:00',
        endTime: '17:00',
        timeZone: 'UTC',
        workDays: [1, 2, 3, 4, 5],
      },
      escalationThresholdPercent: 75,
      isDefault: false,
      isEnabled: true,
    };

    test('first response calculation measures exact delta and marks met/breached', () => {
      const createdAt = '2026-10-20T08:00:00Z';
      const firstResponseAt = '2026-10-20T08:10:00Z'; // 10 mins elapsed (target: 15 mins)

      const ticket: SupportTicket = {
        id: 'tick_sla_1',
        ticketNumber: 'TCK-SLA-1',
        subject: 'Test SLA Ticket',
        description: 'Test description',
        organizationId: 'org_001',
        requester: { name: 'User', email: 'u@test.com', roleTitle: 'Teacher' },
        category: 'general_assistance',
        priority: 'urgent',
        status: 'in_progress',
        createdAt,
        updatedAt: firstResponseAt,
        firstResponseAt,
        slaPolicyId: testPolicy.id,
        slaState: 'within_target',
        escalation: { isEscalated: false },
        tags: [],
        source: 'portal',
        messages: [],
      };

      const result = evaluateTicketSla(ticket, testPolicy, '2026-10-20T08:30:00Z');
      assert.equal(result.firstResponseMinutesElapsed, 10);
      assert.equal(result.firstResponseMet, true);
      assert.equal(result.firstResponseState, 'within_target');
    });

    test('detects breached first response target when response took too long', () => {
      const createdAt = '2026-10-20T08:00:00Z';
      const firstResponseAt = '2026-10-20T08:25:00Z'; // 25 mins elapsed (target: 15 mins)

      const ticket: SupportTicket = {
        id: 'tick_sla_2',
        ticketNumber: 'TCK-SLA-2',
        subject: 'Test SLA Ticket Breached',
        description: 'Test description',
        organizationId: 'org_001',
        requester: { name: 'User', email: 'u@test.com', roleTitle: 'Teacher' },
        category: 'general_assistance',
        priority: 'urgent',
        status: 'in_progress',
        createdAt,
        updatedAt: firstResponseAt,
        firstResponseAt,
        slaPolicyId: testPolicy.id,
        slaState: 'breached',
        escalation: { isEscalated: false },
        tags: [],
        source: 'portal',
        messages: [],
      };

      const result = evaluateTicketSla(ticket, testPolicy, '2026-10-20T08:30:00Z');
      assert.equal(result.firstResponseMinutesElapsed, 25);
      assert.equal(result.firstResponseMet, false);
      assert.equal(result.firstResponseState, 'breached');
      assert.equal(result.state, 'breached');
    });

    test('approaching target state triggers when elapsed time reaches threshold percentage', () => {
      const createdAt = '2026-10-20T08:00:00Z';
      // Urgent resolution target is 120 minutes. 75% threshold is 90 minutes.
      // Elapsed 95 minutes with first response already met.
      const refDate = '2026-10-20T09:35:00Z'; // 95 minutes later

      const ticket: SupportTicket = {
        id: 'tick_sla_3',
        ticketNumber: 'TCK-SLA-3',
        subject: 'Approaching Resolution Target',
        description: 'Test',
        organizationId: 'org_001',
        requester: { name: 'User', email: 'u@test.com', roleTitle: 'Teacher' },
        category: 'general_assistance',
        priority: 'urgent',
        status: 'in_progress',
        createdAt,
        updatedAt: createdAt,
        firstResponseAt: '2026-10-20T08:05:00Z',
        slaPolicyId: testPolicy.id,
        slaState: 'approaching_target',
        escalation: { isEscalated: false },
        tags: [],
        source: 'portal',
        messages: [],
      };

      const result = evaluateTicketSla(ticket, testPolicy, refDate);
      assert.equal(result.resolutionMinutesElapsed, 95);
      assert.equal(result.resolutionState, 'approaching_target');
      assert.equal(result.state, 'approaching_target');
    });

    test('pauses SLA evaluation when ticket is awaiting tenant response', () => {
      const createdAt = '2026-10-20T08:00:00Z';
      const refDate = '2026-10-20T14:00:00Z'; // 6 hours later

      const ticket: SupportTicket = {
        id: 'tick_sla_paused',
        ticketNumber: 'TCK-SLA-P',
        subject: 'Paused SLA Ticket',
        description: 'Waiting for school to confirm firewall ports',
        organizationId: 'org_001',
        requester: { name: 'User', email: 'u@test.com', roleTitle: 'Teacher' },
        category: 'general_assistance',
        priority: 'urgent',
        status: 'awaiting_tenant',
        createdAt,
        updatedAt: createdAt,
        firstResponseAt: '2026-10-20T08:10:00Z',
        slaPolicyId: testPolicy.id,
        slaState: 'paused',
        escalation: { isEscalated: false },
        tags: [],
        source: 'portal',
        messages: [],
      };

      const result = evaluateTicketSla(ticket, testPolicy, refDate);
      assert.equal(result.isPaused, true);
      assert.equal(result.state, 'paused');
      assert.ok(result.explanation.includes('paused while awaiting requested response'));
    });

    test('missing timestamps return unknown rather than zero or fabricated calculations', () => {
      const ticketWithoutTimestamps: any = {
        id: 'tick_corrupt',
        ticketNumber: 'TCK-ERR',
        subject: 'Corrupt Timestamps Ticket',
        description: 'Missing createdAt timestamp',
        organizationId: 'org_001',
        priority: 'urgent',
        status: 'open',
        slaPolicyId: testPolicy.id,
        escalation: { isEscalated: false },
        messages: [],
      };

      const result = evaluateTicketSla(ticketWithoutTimestamps, testPolicy);
      assert.equal(result.state, 'unknown');
      assert.equal(result.firstResponseMinutesElapsed, null);
      assert.equal(result.resolutionMinutesElapsed, null);
    });

    test('validates SLA policy input and rejects negative numbers', () => {
      const badPolicy: CreateSlaPolicyInput = {
        name: 'Invalid Negative Targets Policy',
        description: 'Bad input test',
        planTier: 'growth',
        applicableCategories: 'all',
        applicablePriorities: ['urgent', 'high'],
        firstResponseTargetMinutes: {
          urgent: -10,
          high: 60,
          normal: 120,
          low: 240,
        },
        resolutionTargetMinutes: {
          urgent: 60,
          high: 120,
          normal: 240,
          low: 480,
        },
        businessHours: {
          enabled: false,
          startTime: '08:00',
          endTime: '17:00',
          timeZone: 'UTC',
          workDays: [1, 2, 3, 4, 5],
        },
      };

      const val = validateSlaPolicy(badPolicy);
      assert.equal(val.isValid, false);
      assert.ok(val.errors.some((e) => e.includes('positive number of minutes')));
    });
  });

  // =========================================================================
  // 3. Internal Notes vs. Tenant Communication History
  // =========================================================================
  describe('3. Internal Notes vs. Tenant Communication History', () => {
    test('distinguishes internal notes from tenant-facing replies', () => {
      const ticket = platformStore.getSupportTickets()[0];

      // Add Internal Note
      const noteRes = platformStore.addSupportTicketMessage(
        ticket.id,
        'internal_note',
        'Confidential operator note: check database replica latency before responding to school.'
      );
      assert.equal(noteRes.success, true);

      // Add Tenant Reply Draft
      const replyRes = platformStore.addSupportTicketMessage(
        ticket.id,
        'tenant_reply',
        'Draft response to school administrator regarding exam sync.',
        true // isDraft
      );
      assert.equal(replyRes.success, true);

      const updatedTicket = platformStore.getSupportTicketById(ticket.id);
      assert.ok(updatedTicket);

      const noteMsg = updatedTicket.messages.find((m) => m.content.includes('Confidential operator note'));
      assert.ok(noteMsg);
      assert.equal(noteMsg.type, 'internal_note');
      assert.equal(noteMsg.isDraft, false);

      const draftMsg = updatedTicket.messages.find((m) => m.content.includes('Draft response'));
      assert.ok(draftMsg);
      assert.equal(draftMsg.type, 'tenant_reply');
      assert.equal(draftMsg.isDraft, true);
    });

    test('timeline preserves chronological order and system event tracking', () => {
      // Pick a ticket in status 'open' to ensure valid transition
      const ticket = platformStore.getSupportTickets().find((t) => t.status === 'open') || platformStore.getSupportTickets()[0];
      const initialCount = ticket.messages.length;

      // Status transition adds system event
      platformStore.transitionSupportTicketStatus(ticket.id, 'awaiting_tenant', 'Awaiting school test results');
      // Assignment adds system event
      platformStore.assignSupportTicket(ticket.id, 'usr_support_03', 'team_tier1', 'Assigned to Marcus');

      const updatedTicket = platformStore.getSupportTicketById(ticket.id)!;
      assert.equal(updatedTicket.messages.length, initialCount + 2);

      // Verify ascending chronological order
      for (let i = 0; i < updatedTicket.messages.length - 1; i++) {
        const timeA = new Date(updatedTicket.messages[i].createdAt).getTime();
        const timeB = new Date(updatedTicket.messages[i + 1].createdAt).getTime();
        assert.ok(timeA <= timeB, 'Messages must remain in chronological order');
      }
    });
  });

  // =========================================================================
  // 4. Customer Success Accounts & Explainable Health Index
  // =========================================================================
  describe('4. Customer Success Accounts & Explainable Health Index', () => {
    test('calculates account health deterministically from baseline 100 with documented deductions', () => {
      const org = platformStore.getOrganizations()[0];
      const sub = platformStore.getSubscriptions().find((s) => s.organizationId === org.id);

      // Healthy baseline test
      const healthyEval = calculateAccountHealthScore(
        org,
        sub,
        [], // No tickets
        [], // No negative csat
        []  // No overdue tasks
      );

      assert.equal(healthyEval.score, 100);
      assert.equal(healthyEval.tier, 'healthy');
      assert.equal(healthyEval.deductions.length, 0);

      // Test with suspended organization and active urgent ticket
      const suspendedOrg = { ...org, status: 'suspended' as any };
      const urgentTicket: SupportTicket = {
        id: 't_urg_1',
        ticketNumber: 'TCK-U1',
        subject: 'Critical Service Down',
        description: 'Desc',
        organizationId: org.id,
        requester: { name: 'A', email: 'a@a.com', roleTitle: 'Admin' },
        category: 'security_compliance',
        priority: 'urgent',
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slaPolicyId: 'sla_1',
        slaState: 'within_target',
        escalation: { isEscalated: false },
        tags: [],
        source: 'portal',
        messages: [],
      };

      const penaltyEval = calculateAccountHealthScore(
        suspendedOrg,
        sub,
        [urgentTicket],
        [],
        []
      );

      // Baseline 100 - 40 (suspended) - 15 (urgent ticket) = 45 points -> at_risk
      assert.equal(penaltyEval.score, 45);
      assert.equal(penaltyEval.tier, 'at_risk');
      assert.equal(penaltyEval.deductions.length, 2);
    });

    test('detects overdue customer success tasks deterministically', () => {
      const refDate = '2026-10-20T12:00:00Z';
      const pastDueDate = '2026-10-15';
      const futureDueDate = '2026-10-25';

      assert.equal(isOverdueTask(pastDueDate, refDate), true);
      assert.equal(isOverdueTask(futureDueDate, refDate), false);
    });

    test('customer success task creation and status completion mutates store cleanly', () => {
      const orgId = platformStore.getOrganizations()[0].id;
      const input: CreateCsTaskInput = {
        title: 'Review CBT Offline Sync Setup',
        description: 'Verify local sync agent on school campus test center.',
        organizationId: orgId,
        assignedOwnerId: 'usr_support_03',
        priority: 'high',
        dueDate: '2026-11-01',
      };

      const res = platformStore.createCsTask(input);
      assert.equal(res.success, true);
      assert.ok(res.task);
      assert.equal(res.task.status, 'pending');

      // Complete task
      const completeRes = platformStore.setCsTaskStatus(
        res.task.id,
        'completed',
        'Verified local sync server on campus network.'
      );
      assert.equal(completeRes.success, true);
      assert.equal(completeRes.task?.status, 'completed');
      assert.ok(completeRes.task?.completedAt);
    });
  });

  // =========================================================================
  // 5. Knowledge Base & Customer Satisfaction (CSAT)
  // =========================================================================
  describe('5. Knowledge Base & Customer Satisfaction (CSAT)', () => {
    test('knowledge base article validation and lifecycle management', () => {
      const input: CreateKbArticleInput = {
        title: 'How to Re-sync CBT Offline Exam Scores',
        summary: 'Step by step recovery procedure for test centers with intermittent internet.',
        category: 'examinations_cbt',
        content: '### Offline Score Recovery\n1. Export encrypted ledger\n2. Upload via Super-Admin console.',
        tags: ['cbt', 'offline-sync', 'scoring'],
        status: 'draft',
      };

      const res = platformStore.createKbArticle(input);
      assert.equal(res.success, true);
      assert.ok(res.article);
      assert.equal(res.article.status, 'draft');

      // Publish article
      const pubRes = platformStore.setKbArticleStatus(res.article.id, 'published');
      assert.equal(pubRes.success, true);
      assert.equal(pubRes.article?.status, 'published');

      // Delete article
      const delRes = platformStore.deleteKbArticle(res.article.id);
      assert.equal(delRes.success, true);
      assert.equal(platformStore.getKbArticleById(res.article.id), undefined);
    });

    test('customer satisfaction submission validates 1-5 rating scale', () => {
      const ticket = platformStore.getSupportTickets()[0];

      // Invalid 6 star rating
      const badRes = platformStore.submitCustomerFeedback({
        ticketId: ticket.id,
        rating: 6,
        comment: 'Invalid rating test',
      });
      assert.equal(badRes.success, false);
      assert.ok(badRes.error?.includes('between 1 and 5'));

      // Valid 5 star rating
      const validRes = platformStore.submitCustomerFeedback({
        ticketId: ticket.id,
        rating: 5,
        comment: 'Fast resolution by platform engineering team during CBT trial.',
      });
      assert.equal(validRes.success, true);
      assert.ok(validRes.record);
      assert.equal(validRes.record.rating, 5);
      assert.equal(validRes.record.reviewed, false);

      // Review feedback
      const reviewRes = platformStore.reviewCsatRecord(validRes.record.id, 'Validated in QA log.');
      assert.equal(reviewRes.success, true);
      assert.equal(reviewRes.record?.reviewed, true);
      assert.equal(reviewRes.record?.reviewerNotes, 'Validated in QA log.');
    });
  });

  // =========================================================================
  // 6. Reporting, CSV Exporters & Formula Injection Protection
  // =========================================================================
  describe('6. Reporting, CSV Exporters & Formula Injection Protection', () => {
    test('neutralizes formula injection characters in CSV exports', () => {
      // Formula triggers: =, +, -, @, tab, return
      assert.equal(escapeCsvFormulaInjection('=SUM(A1:A10)'), '"\'=SUM(A1:A10)"');
      assert.equal(escapeCsvFormulaInjection('+123456'), '"\'+123456"');
      assert.equal(escapeCsvFormulaInjection('-CMD|calc'), '"\'-CMD|calc"');
      assert.equal(escapeCsvFormulaInjection('@EVIL'), '"\'@EVIL"');
      assert.equal(escapeCsvFormulaInjection('Normal Subject'), '"Normal Subject"');
    });

    test('exports tickets to CSV without student PII', () => {
      const tickets = platformStore.getSupportTickets();
      const orgs = platformStore.getOrganizations();
      const csv = exportTicketsToCsv(tickets, orgs);

      assert.ok(csv.includes('# [DEMONSTRATION ONLY'));
      assert.ok(csv.includes('Ticket Number,Subject,Organization Code'));

      // Verify zero student passwords, NINs, or exam answer PII
      assert.ok(!csv.includes('password'));
      assert.ok(!csv.includes('pin_code'));
    });

    test('handles empty ticket collections safely in metrics calculations', () => {
      const emptyMetrics = calculateSupportMetrics([], []);
      assert.equal(emptyMetrics.totalTickets, 0);
      assert.equal(emptyMetrics.openTickets, 0);
      assert.equal(emptyMetrics.avgFirstResponseMinutes, null);
      assert.equal(emptyMetrics.avgResolutionHours, null);
      assert.equal(emptyMetrics.averageCsat, null);
    });

    test('duration formatters render concise human-readable outputs', () => {
      assert.equal(formatMinutesDuration(45), '45m');
      assert.equal(formatMinutesDuration(120), '2h');
      assert.equal(formatMinutesDuration(150), '2h 30m');
      assert.equal(formatHoursDuration(3.5), '3.5 hrs');
    });
  });

  // =========================================================================
  // 7. Platform Store Mutations & Automated Audit Trail
  // =========================================================================
  describe('7. Platform Store Mutations & Automated Audit Trail', () => {
    test('support ticket mutations append audit events to platform log', () => {
      const initialAudits = platformStore.getAuditEvents().length;
      const orgId = platformStore.getOrganizations()[0].id;

      // 1. Create Ticket
      const ticketRes = platformStore.createSupportTicket({
        subject: 'Audit Trail Verification Ticket',
        description: 'Ensuring audit logs record ticket events.',
        organizationId: orgId,
        category: 'academic_management',
        priority: 'normal',
        requester: { name: 'Audit User', email: 'audit@test.com', roleTitle: 'Admin' },
      });
      assert.equal(ticketRes.success, true);
      assert.equal(platformStore.getAuditEvents().length, initialAudits + 1);
      assert.equal(platformStore.getAuditEvents()[0].action, 'SUPPORT_TICKET_CREATED');

      // 2. Status Change
      platformStore.transitionSupportTicketStatus(ticketRes.ticket!.id, 'in_progress', 'Audit status change');
      assert.equal(platformStore.getAuditEvents()[0].action, 'SUPPORT_TICKET_STATUS_CHANGED');

      // 3. Assign
      platformStore.assignSupportTicket(ticketRes.ticket!.id, 'usr_support_03', 'team_tier1', 'Audit assignment');
      assert.equal(platformStore.getAuditEvents()[0].action, 'SUPPORT_TICKET_ASSIGNED');

      // 4. Create SLA Policy
      platformStore.createSlaPolicy({
        name: 'Audit Trail Test SLA Policy',
        description: 'Policy for audit trail verification',
        planTier: 'all',
        applicableCategories: 'all',
        applicablePriorities: ['urgent', 'high'],
        firstResponseTargetMinutes: { urgent: 15, high: 60, normal: 120, low: 240 },
        resolutionTargetMinutes: { urgent: 120, high: 360, normal: 720, low: 1440 },
        businessHours: { enabled: false, startTime: '08:00', endTime: '17:00', timeZone: 'UTC', workDays: [1, 2, 3, 4, 5] },
      });
      assert.equal(platformStore.getAuditEvents()[0].action, 'SLA_POLICY_CREATED');
    });
  });
});
