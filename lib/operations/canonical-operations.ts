/**
 * Canonical Cross-App Operations, Support, Audit, Approvals & Notices Specification (Phase P0-6)
 *
 * AUTHORITATIVE SOURCE OF TRUTH IN `dashboard/lib/operations/canonical-operations.ts`.
 * Synchronized identically to `frontend/lib/operations/canonical-operations.ts` via
 * `dashboard/scripts/build-registry.ts` (matching P0-4 & P0-5 sync architecture).
 *
 * Strictly frontend-only: defines shared TypeScript contracts, fail-closed tenant isolation
 * projections, controlled support transition rules, anti-self-approval guards, and
 * honest simulation disclaimers without implementing backend services or external delivery.
 */

export const P0_6_FRONTEND_SIMULATION_DISCLAIMER =
  'Frontend-only demonstration state stored in browser memory/localStorage. No backend persistence, real email/SMS/push delivery, webhook dispatch, or server-side audit WORM sealing is performed.';

// ============================================================================
// 1. CROSS-APP ORGANIZATION <-> TENANT FIXTURE LINKAGE
// ============================================================================

export interface CanonicalTenantOrgLink {
  organizationId: string;
  tenantId: string;
  code: string;
  organizationName: string;
  subdomain: string;
}

/**
 * Deterministic bridge mapping Super Admin `Organization.id` fixtures (`org_001`..`org_020`)
 * to Tenant Dashboard `SchoolTenant.id` scenarios (`tenant-*`) so cross-app support tickets,
 * published platform notices, and activity feeds correlate reliably without breaking P0-1..P0-5 IDs.
 */
export const CANONICAL_DEMO_TENANT_ORG_LINKS: readonly CanonicalTenantOrgLink[] = [
  {
    organizationId: 'org_001',
    tenantId: 'tenant-oakridge-001',
    code: 'OAKHILL',
    organizationName: 'Oakridge / Oak Hill International Academy',
    subdomain: 'oakhill',
  },
  {
    organizationId: 'org_002',
    tenantId: 'tenant-st-judes-002',
    code: 'STJUDE',
    organizationName: 'St. Jude Preparatory / Grammar School',
    subdomain: 'stjude',
  },
  {
    organizationId: 'org_003',
    tenantId: 'tenant-crestview-003',
    code: 'APEX',
    organizationName: 'Apex / Crestview STEM High School',
    subdomain: 'apex-tech',
  },
  {
    organizationId: 'org_004',
    tenantId: 'tenant-valleydale-004',
    code: 'VALLEYVIEW',
    organizationName: 'Valley View / Valleydale Community Academy',
    subdomain: 'valleyview',
  },
  {
    organizationId: 'org_005',
    tenantId: 'tenant-meridian-005',
    code: 'HORIZON',
    organizationName: 'Horizon / Meridian International Academy',
    subdomain: 'horizon',
  },
  {
    organizationId: 'org_006',
    tenantId: 'tenant-suspended-006',
    code: 'EVERGREEN',
    organizationName: 'Evergreen / Riverbend Academy',
    subdomain: 'evergreen',
  },
  {
    organizationId: 'org_007',
    tenantId: 'tenant-starter-007',
    code: 'NORDIC',
    organizationName: 'Nordic / Harbor View School',
    subdomain: 'nordic',
  },
  {
    organizationId: 'org_011',
    tenantId: 'tenant-draft-008',
    code: 'BEACON',
    organizationName: 'Beacon / Horizon Ridge Draft Academy',
    subdomain: 'beaconacademy',
  },
  {
    organizationId: 'org_013',
    tenantId: 'tenant-onboarding-010',
    code: 'MAPLEWOOD',
    organizationName: 'Maplewood Early Years / Nursery',
    subdomain: 'maplewood',
  },
  {
    organizationId: 'org_015',
    tenantId: 'tenant-awaiting-activation-012',
    code: 'HARBORVIEW',
    organizationName: 'Harborview Christian College',
    subdomain: 'harborview',
  },
  {
    organizationId: 'org_017',
    tenantId: 'tenant-active-expired-014',
    code: 'GREENWOOD',
    organizationName: 'Greenwood International Academy',
    subdomain: 'greenwoodintl',
  },
  {
    organizationId: 'org_019',
    tenantId: 'tenant-cancelled-016',
    code: 'HERITAGE',
    organizationName: 'Heritage Oaks / Crestline Academy',
    subdomain: 'heritageoaks',
  },
  {
    organizationId: 'org_020',
    tenantId: 'tenant-archived-017',
    code: 'NORTHBRIDGE',
    organizationName: 'Northbridge Charter Archive',
    subdomain: 'northbridge',
  },
] as const;

export function resolvePlatformOrgIdFromTenantId(tenantIdOrOrgId: string | null | undefined): string {
  if (!tenantIdOrOrgId) return '';
  const match = CANONICAL_DEMO_TENANT_ORG_LINKS.find(
    (entry) => entry.tenantId === tenantIdOrOrgId || entry.organizationId === tenantIdOrOrgId
  );
  return match ? match.organizationId : tenantIdOrOrgId;
}

export function resolveFrontendTenantIdFromOrgId(orgIdOrTenantId: string | null | undefined): string {
  if (!orgIdOrTenantId) return '';
  const match = CANONICAL_DEMO_TENANT_ORG_LINKS.find(
    (entry) => entry.organizationId === orgIdOrTenantId || entry.tenantId === orgIdOrTenantId
  );
  return match ? match.tenantId : orgIdOrTenantId;
}

export function matchesTenantOrOrgIdentifier(
  recordOrgId: string | undefined | null,
  activeTenantId: string | undefined | null
): boolean {
  if (!recordOrgId || !activeTenantId) return false;
  if (recordOrgId === activeTenantId) return true;
  return (
    resolvePlatformOrgIdFromTenantId(recordOrgId) ===
    resolvePlatformOrgIdFromTenantId(activeTenantId)
  );
}

// ============================================================================
// 2. CANONICAL SUPPORT CONTRACT (CATEGORIES, PRIORITIES, WORKFLOW, ISOLATION)
// ============================================================================

export type CanonicalSupportCategoryKey =
  | 'account_access'
  | 'organization_setup'
  | 'onboarding_setup'
  | 'campus_configuration'
  | 'academic_operations'
  | 'academics_curriculum'
  | 'examinations_cbt'
  | 'student_admissions'
  | 'finance_subscriptions'
  | 'billing_subscription'
  | 'module_functionality'
  | 'data_reports'
  | 'technical_issues'
  | 'integrations_api'
  | 'security_compliance'
  | 'general_enquiries'
  | 'general_assistance';

export type CanonicalSupportPriority = 'low' | 'normal' | 'high' | 'urgent';

export type CanonicalSupportStatus =
  | 'new'
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'awaiting_tenant'
  | 'awaiting_internal'
  | 'escalated'
  | 'resolved'
  | 'closed'
  | 'reopened';

export interface CanonicalSupportCategoryDefinition {
  key: CanonicalSupportCategoryKey;
  label: string;
  description: string;
  group:
    | 'Account and access'
    | 'Organization setup'
    | 'Campus configuration'
    | 'Academic operations'
    | 'Finance and subscriptions'
    | 'Module functionality'
    | 'Data and reports'
    | 'Technical issues'
    | 'General enquiries';
  tenantSelectable: boolean;
}

export const CANONICAL_SUPPORT_CATEGORY_CATALOG: readonly CanonicalSupportCategoryDefinition[] = [
  {
    key: 'account_access',
    label: 'Account & Access',
    description: 'Sign-in failures, MFA prompts, role assignments, and password reset troubleshooting.',
    group: 'Account and access',
    tenantSelectable: true,
  },
  {
    key: 'organization_setup',
    label: 'Organization Setup',
    description: 'School profile updates, institution category changes, and onboarding progression questions.',
    group: 'Organization setup',
    tenantSelectable: true,
  },
  {
    key: 'campus_configuration',
    label: 'Campus Configuration',
    description: 'Main/branch campus activation, campus quota limits, and campus-scoped access questions.',
    group: 'Campus configuration',
    tenantSelectable: true,
  },
  {
    key: 'academic_operations',
    label: 'Academic Operations',
    description: 'Academic sessions, terms, timetables, attendance, examinations/CBT, and report cards.',
    group: 'Academic operations',
    tenantSelectable: true,
  },
  {
    key: 'finance_subscriptions',
    label: 'Finance & Subscriptions',
    description: 'Plan tier upgrades, invoices, overdue payment reconciliation, and student billing questions.',
    group: 'Finance and subscriptions',
    tenantSelectable: true,
  },
  {
    key: 'module_functionality',
    label: 'Module Functionality',
    description: 'Module availability, plan entitlement questions, and feature flag behavior.',
    group: 'Module functionality',
    tenantSelectable: true,
  },
  {
    key: 'data_reports',
    label: 'Data & Reports',
    description: 'CSV exports, promotion/broadsheet reports, data import formatting, and activity exports.',
    group: 'Data and reports',
    tenantSelectable: true,
  },
  {
    key: 'technical_issues',
    label: 'Technical Issues',
    description: 'Application errors, browser sync glitches, integration webhooks, or security reports.',
    group: 'Technical issues',
    tenantSelectable: true,
  },
  {
    key: 'general_enquiries',
    label: 'General Enquiries',
    description: 'Training assistance, documentation requests, and general platform feedback.',
    group: 'General enquiries',
    tenantSelectable: true,
  },
] as const;

export const CANONICAL_SUPPORT_PRIORITY_META: Record<
  CanonicalSupportPriority,
  { label: string; triageGuidance: string }
> = {
  low: {
    label: 'Low',
    triageGuidance: 'Informational query or cosmetic feedback (no implied contractual SLA).',
  },
  normal: {
    label: 'Normal',
    triageGuidance: 'Standard operational support issue with documented workaround available.',
  },
  high: {
    label: 'High',
    triageGuidance: 'Significant workflow disruption for a campus or administrative department.',
  },
  urgent: {
    label: 'Urgent',
    triageGuidance: 'Time-sensitive institutional blocker requiring immediate operator review.',
  },
};

export const CANONICAL_SUPPORT_STATUS_META: Record<
  CanonicalSupportStatus,
  { label: string; tenantLabel: string; isTerminalOrClosed: boolean; isOpenQueue: boolean }
> = {
  new: { label: 'New (Intake)', tenantLabel: 'Open', isTerminalOrClosed: false, isOpenQueue: true },
  open: { label: 'Open', tenantLabel: 'Open', isTerminalOrClosed: false, isOpenQueue: true },
  assigned: { label: 'Assigned', tenantLabel: 'Assigned', isTerminalOrClosed: false, isOpenQueue: true },
  in_progress: { label: 'In Progress', tenantLabel: 'In Progress', isTerminalOrClosed: false, isOpenQueue: true },
  awaiting_tenant: {
    label: 'Awaiting Tenant Response',
    tenantLabel: 'Awaiting Your Response',
    isTerminalOrClosed: false,
    isOpenQueue: true,
  },
  awaiting_internal: {
    label: 'Awaiting Internal Action',
    tenantLabel: 'Under Review',
    isTerminalOrClosed: false,
    isOpenQueue: true,
  },
  escalated: {
    label: 'Escalated',
    tenantLabel: 'Prioritized Review',
    isTerminalOrClosed: false,
    isOpenQueue: true,
  },
  resolved: { label: 'Resolved', tenantLabel: 'Resolved', isTerminalOrClosed: true, isOpenQueue: false },
  closed: { label: 'Closed', tenantLabel: 'Closed', isTerminalOrClosed: true, isOpenQueue: false },
  reopened: { label: 'Reopened', tenantLabel: 'Reopened', isTerminalOrClosed: false, isOpenQueue: true },
};

export interface CanonicalSupportAttachmentMetadata {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedByName: string;
  storageStatus: 'simulated_metadata_only';
}

export interface CanonicalTicketMessage {
  id: string;
  type: 'tenant_reply' | 'internal_note' | 'system_event';
  authorId?: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
  isInternal?: boolean;
  isDraft?: boolean;
  attachments?: CanonicalSupportAttachmentMetadata[];
}

export interface TenantVisibleTicketMessage {
  id: string;
  type: 'tenant_reply' | 'system_event';
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
  attachments?: CanonicalSupportAttachmentMetadata[];
}

export interface TenantVisibleSupportTicket {
  id: string;
  ticketNumber: string;
  organizationId: string;
  campusId?: string;
  campusName?: string;
  subject: string;
  description: string;
  category: CanonicalSupportCategoryKey | string;
  priority: CanonicalSupportPriority;
  status: CanonicalSupportStatus;
  requester: {
    userId?: string;
    name: string;
    email: string;
    roleTitle: string;
  };
  assignedHandlerDisplay?: string;
  createdAt: string;
  updatedAt: string;
  lastResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  reopenedAt?: string;
  resolutionSummary?: string;
  attachments: CanonicalSupportAttachmentMetadata[];
  messages: TenantVisibleTicketMessage[];
  /** Explicitly zero internal notes / escalations leaked to tenant representation */
  redactedInternalNoteCount: number;
}

/**
 * Neutral age indicator calculation (P0-6 Section 6.7):
 * Avoids inventing contractual response guarantees or SLA deadlines where unratified.
 */
export function computeTicketNeutralAgeSummary(
  ticket: {
    createdAt: string;
    updatedAt: string;
    firstResponseAt?: string | null;
    messages?: Array<{ createdAt: string; type?: string; isDraft?: boolean }>;
  },
  referenceIso?: string
): {
  ageHours: number;
  ageLabel: string;
  hoursSinceLastResponse: number | null;
  lastResponseLabel: string;
} {
  const refMs = referenceIso ? new Date(referenceIso).getTime() : Date.now();
  const createdMs = new Date(ticket.createdAt).getTime();
  const safeRef = Number.isNaN(refMs) ? Date.now() : refMs;
  const ageHours = Number.isNaN(createdMs)
    ? 0
    : Math.max(0, Math.round(((safeRef - createdMs) / 3600000) * 10) / 10);

  const visibleMessages = (ticket.messages || []).filter(
    (m) => m.type === 'tenant_reply' && !m.isDraft
  );
  const latestRespIso =
    visibleMessages.length > 0
      ? visibleMessages[visibleMessages.length - 1].createdAt
      : ticket.firstResponseAt;

  let hoursSinceLastResponse: number | null = null;
  if (latestRespIso) {
    const respMs = new Date(latestRespIso).getTime();
    if (!Number.isNaN(respMs)) {
      hoursSinceLastResponse = Math.max(0, Math.round(((safeRef - respMs) / 3600000) * 10) / 10);
    }
  }

  const formatHours = (hrs: number): string => {
    if (hrs < 1) return `${Math.max(1, Math.round(hrs * 60))}m`;
    if (hrs < 48) return `${hrs}h`;
    return `${Math.round((hrs / 24) * 10) / 10}d`;
  };

  return {
    ageHours,
    ageLabel: formatHours(ageHours),
    hoursSinceLastResponse,
    lastResponseLabel:
      hoursSinceLastResponse === null ? 'Awaiting initial response' : `${formatHours(hoursSinceLastResponse)} ago`,
  };
}

/**
 * Strict fail-closed projection converting a Super Admin ticket record into a
 * tenant-safe view. Guarantees that internal operator notes, internal escalation
 * rationales, engineering queue IDs, draft messages, and platform-only fields are stripped.
 */
export function projectTicketForTenantView(ticket: {
  id: string;
  ticketNumber: string;
  organizationId: string;
  campusId?: string | null;
  campusName?: string;
  subject: string;
  description: string;
  category: string;
  priority: CanonicalSupportPriority;
  status: CanonicalSupportStatus;
  requester: {
    userId?: string;
    name: string;
    email: string;
    roleTitle: string;
  };
  assignedOperatorId?: string | null;
  assignedOperatorName?: string;
  createdAt: string;
  updatedAt: string;
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  reopenedAt?: string | null;
  resolutionSummary?: string;
  attachments?: CanonicalSupportAttachmentMetadata[];
  messages: CanonicalTicketMessage[];
}): TenantVisibleSupportTicket {
  let redactedCount = 0;
  const visibleMessages: TenantVisibleTicketMessage[] = [];

  for (const msg of ticket.messages || []) {
    const isInternalMsg = msg.type === 'internal_note' || msg.isInternal === true || msg.isDraft === true;
    const isSensitiveSystemEvent =
      msg.type === 'system_event' &&
      (msg.content.toLowerCase().includes('internal') ||
        msg.content.toLowerCase().includes('tier_3') ||
        msg.content.toLowerCase().includes('sla') ||
        msg.content.toLowerCase().includes('escalat'));

    if (isInternalMsg || isSensitiveSystemEvent) {
      redactedCount += 1;
      continue;
    }

    visibleMessages.push({
      id: msg.id,
      type: msg.type === 'system_event' ? 'system_event' : 'tenant_reply',
      authorName: msg.authorName,
      authorRole: msg.type === 'system_event' ? 'Platform System' : msg.authorRole,
      content: msg.content,
      createdAt: msg.createdAt,
      attachments: msg.attachments,
    });
  }

  const lastPublicReply = visibleMessages.filter((m) => m.type === 'tenant_reply').slice(-1)[0];

  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    organizationId: ticket.organizationId,
    campusId: ticket.campusId || undefined,
    campusName: ticket.campusName,
    subject: ticket.subject,
    description: ticket.description,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    requester: {
      userId: ticket.requester.userId,
      name: ticket.requester.name,
      email: ticket.requester.email,
      roleTitle: ticket.requester.roleTitle,
    },
    assignedHandlerDisplay: ticket.assignedOperatorName
      ? ticket.assignedOperatorName
      : ticket.assignedOperatorId
      ? 'Platform Support Specialist'
      : undefined,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    lastResponseAt: lastPublicReply?.createdAt || ticket.firstResponseAt || undefined,
    resolvedAt: ticket.resolvedAt || undefined,
    closedAt: ticket.closedAt || undefined,
    reopenedAt: ticket.reopenedAt || undefined,
    resolutionSummary: ticket.resolutionSummary,
    attachments: [...(ticket.attachments || [])],
    messages: visibleMessages,
    redactedInternalNoteCount: redactedCount,
  };
}

// ============================================================================
// 3. CANONICAL AUDIT & TENANT ACTIVITY PROJECTION
// ============================================================================

export type CanonicalActivityVisibility = 'platform_only' | 'tenant_visible';

export interface CanonicalTenantActivityItem {
  id: string;
  timestamp: string;
  sourceApp: 'super_admin' | 'tenant_dashboard';
  visibility: CanonicalActivityVisibility;
  organizationId: string;
  campusId?: string;
  campusName?: string;
  category: string;
  action: string;
  outcome: 'succeeded' | 'failed' | 'rejected' | 'pending_review';
  severity: 'info' | 'warning' | 'critical';
  actorName: string;
  actorRole: string;
  targetEntity: string;
  targetId: string;
  targetName?: string;
  summary: string;
  reason?: string;
  sensitiveAuditOnly?: boolean;
}

/**
 * Enforces strict tenant, campus, and RBAC visibility bounds on tenant-facing activity logs.
 */
export function filterTenantActivityEvents<
  T extends {
    organizationId?: string;
    campusId?: string;
    visibility?: CanonicalActivityVisibility;
    sensitiveAuditOnly?: boolean;
  }
>(
  events: readonly T[],
  options: {
    tenantId: string | null | undefined;
    allowedCampusIds?: readonly string[] | null;
    activeCampusId?: string | null;
    canViewSensitiveAudit: boolean;
  }
): T[] {
  if (!options.tenantId) return [];

  return events.filter((evt) => {
    if (!matchesTenantOrOrgIdentifier(evt.organizationId, options.tenantId)) {
      return false;
    }
    if (evt.visibility === 'platform_only') {
      return false;
    }
    if (evt.sensitiveAuditOnly && !options.canViewSensitiveAudit) {
      return false;
    }
    if (evt.campusId) {
      if (options.activeCampusId && evt.campusId !== options.activeCampusId) {
        return false;
      }
      if (
        options.allowedCampusIds &&
        options.allowedCampusIds.length > 0 &&
        !options.allowedCampusIds.includes(evt.campusId)
      ) {
        return false;
      }
    }
    return true;
  });
}

// ============================================================================
// 4. ADMINISTRATIVE TASKS & CONTROLLED APPROVAL WORKFLOWS
// ============================================================================

export type PlatformApprovalType =
  | 'tenant_activation'
  | 'tenant_suspension'
  | 'tenant_cancellation'
  | 'subscription_override'
  | 'entitlement_override'
  | 'campus_configuration_change'
  | 'platform_notice_publish'
  | 'exception_waiver'
  | 'high_risk_config_change';

export type PlatformApprovalStatus =
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'expired';

export interface PlatformApprovalRequest {
  id: string;
  referenceCode: string;
  type: PlatformApprovalType;
  title: string;
  description: string;
  organizationId?: string;
  organizationName?: string;
  campusId?: string;
  campusName?: string;
  linkedTicketId?: string;
  linkedTaskId?: string;
  linkedExceptionId?: string;
  targetEntityType: string;
  targetEntityId: string;
  requestedActionLabel: string;
  priority: CanonicalSupportPriority;
  status: PlatformApprovalStatus;
  requestedBy: {
    id: string;
    name: string;
    role: string;
  };
  requestedAt: string;
  dueAt?: string;
  reviewedBy?: {
    id: string;
    name: string;
    role: string;
  };
  reviewedAt?: string;
  decisionNotes?: string;
  isSimulation: true;
}

export interface ApprovalDecisionEvaluation {
  permitted: boolean;
  error?: string;
}

/**
 * Validates controlled platform approvals:
 * 1. Only pending requests can be approved/rejected; pending or approved-unexecuted can be cancelled.
 * 2. Prevents self-approval: the requester cannot approve or reject their own request.
 * 3. Requires audit justification for approvals/rejections (>= 5 characters).
 */
export function evaluateApprovalDecision(
  request: PlatformApprovalRequest,
  decision: 'approved' | 'rejected' | 'cancelled',
  reviewer: { id?: string; name?: string; role?: string } | null | undefined,
  notes?: string
): ApprovalDecisionEvaluation {
  if (!reviewer || !reviewer.id) {
    return { permitted: false, error: 'Authenticated platform operator identity is required.' };
  }

  if (decision === 'approved' || decision === 'rejected') {
    if (request.status !== 'pending_review') {
      return {
        permitted: false,
        error: `Cannot ${decision === 'approved' ? 'approve' : 'reject'} request in status "${request.status}".`,
      };
    }

    if (request.requestedBy.id === reviewer.id) {
      return {
        permitted: false,
        error:
          'Self-approval is prohibited by platform governance policy. Another authorized operator must review this request.',
      };
    }

    if (!notes || notes.trim().length < 5) {
      return {
        permitted: false,
        error: 'A minimum 5-character review justification is required for audit visibility.',
      };
    }

    return { permitted: true };
  }

  if (decision === 'cancelled') {
    if (request.status !== 'pending_review') {
      return {
        permitted: false,
        error: `Only pending review requests can be cancelled (current: "${request.status}").`,
      };
    }
    return { permitted: true };
  }

  return { permitted: false, error: 'Unsupported approval decision.' };
}

// ============================================================================
// 5. PLATFORM-TO-TENANT COMMUNICATION NOTICES (HONEST SIMULATION MODEL)
// ============================================================================

export type PlatformNoticeStatus =
  | 'draft'
  | 'pending_approval'
  | 'scheduled_simulated'
  | 'published_simulated'
  | 'cancelled'
  | 'archived';

export type PlatformNoticeAudience =
  | 'all_tenants'
  | 'selected_tenants'
  | 'plan_tiers'
  | 'campus_targeted';

export type PlatformNoticeCategory =
  | 'maintenance_advisory'
  | 'billing_reminder'
  | 'onboarding_guidance'
  | 'release_update'
  | 'policy_notice'
  | 'general_announcement';

export interface PlatformNotice {
  id: string;
  referenceCode: string;
  title: string;
  summary: string;
  body: string;
  category: PlatformNoticeCategory;
  severity: 'info' | 'warning' | 'urgent';
  status: PlatformNoticeStatus;
  audience: PlatformNoticeAudience;
  targetOrganizationIds: string[];
  targetPlanIds: string[];
  targetCampusIds: string[];
  channelSimulations: Array<'in_app' | 'email_simulated' | 'sms_simulated'>;
  createdBy: { id: string; name: string; role: string };
  createdAt: string;
  scheduledFor?: string;
  publishedAt?: string;
  expiresAt?: string;
  approvalStatus: 'not_required' | 'pending' | 'approved' | 'rejected';
  approvedByName?: string;
  disclaimer: string;
}

/**
 * Strictly filters platform notices for display inside a Tenant Dashboard workspace.
 * Drafts, pending approvals, cancelled, archived, and notices targeting other tenants/tiers
 * are excluded deterministically.
 */
export function filterPublishedNoticesForTenant(
  notices: readonly PlatformNotice[],
  tenant: {
    id: string;
    planId?: string;
    activeCampusId?: string | null;
    allowedCampusIds?: readonly string[];
  } | null | undefined,
  referenceIso?: string
): PlatformNotice[] {
  if (!tenant || !tenant.id) return [];
  const nowMs = referenceIso ? new Date(referenceIso).getTime() : Date.now();

  return notices
    .filter((notice) => {
      if (notice.status !== 'published_simulated') return false;

      if (notice.expiresAt) {
        const expMs = new Date(notice.expiresAt).getTime();
        if (!Number.isNaN(expMs) && expMs < nowMs) return false;
      }

      if (notice.audience === 'all_tenants') {
        return true;
      }

      if (notice.audience === 'plan_tiers') {
        return Boolean(tenant.planId && notice.targetPlanIds.includes(tenant.planId));
      }

      if (notice.audience === 'selected_tenants') {
        return notice.targetOrganizationIds.some((orgId) =>
          matchesTenantOrOrgIdentifier(orgId, tenant.id)
        );
      }

      if (notice.audience === 'campus_targeted') {
        const matchesTenant =
          notice.targetOrganizationIds.length === 0 ||
          notice.targetOrganizationIds.some((orgId) =>
            matchesTenantOrOrgIdentifier(orgId, tenant.id)
          );
        if (!matchesTenant) return false;
        if (notice.targetCampusIds.length === 0) return true;
        if (tenant.activeCampusId) {
          return notice.targetCampusIds.includes(tenant.activeCampusId);
        }
        return (tenant.allowedCampusIds || []).some((cid) =>
          notice.targetCampusIds.includes(cid)
        );
      }

      return false;
    })
    .sort((a, b) =>
      (b.publishedAt || b.createdAt).localeCompare(a.publishedAt || a.createdAt)
    );
}

// ============================================================================
// 6. OPERATIONAL EXCEPTIONS & ESCALATION WORKFLOW
// ============================================================================

export type OperationalExceptionDomain =
  | 'onboarding_incomplete'
  | 'provisioning_failure'
  | 'admin_setup_incomplete'
  | 'subscription_payment_mismatch'
  | 'entitlement_drift'
  | 'campus_configuration'
  | 'support_escalation'
  | 'approval_stalled';

export type OperationalExceptionSeverity = 'low' | 'medium' | 'high' | 'critical';

export type OperationalExceptionStatus =
  | 'open'
  | 'acknowledged'
  | 'in_remediation'
  | 'escalated'
  | 'resolved'
  | 'dismissed';

export interface OperationalExceptionRecord {
  id: string;
  referenceCode: string;
  domain: OperationalExceptionDomain;
  severity: OperationalExceptionSeverity;
  status: OperationalExceptionStatus;
  title: string;
  description: string;
  recommendedAction: string;
  organizationId: string;
  organizationName: string;
  campusId?: string;
  campusName?: string;
  linkedTicketId?: string;
  linkedTaskId?: string;
  linkedApprovalId?: string;
  assignedOperatorId?: string | null;
  assignedOperatorName?: string;
  escalatedTo?: string;
  detectedAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  isDerived?: boolean;
  /** Operational exception internals stay platform-only unless surfaced explicitly as safe tenant guidance */
  visibility: 'platform_only' | 'tenant_summary_safe';
  tenantSafeGuidance?: string;
}
