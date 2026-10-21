/**
 * Phase E-09.13: Pure Evaluation Engine, Filtering, Aggregation,
 * Validation, and Export Generation for Platform Audit & Compliance Governance.
 */

import { AuditEvent, AuditLogFilter } from '../types/audit-logs';
import {
  SecurityEvent,
  ComplianceControl,
  GovernanceEvidence,
  DataRetentionPolicy,
  AuditComplianceMetrics,
} from '../types/compliance';

/**
 * Formula injection protection: prepends an apostrophe if the value starts with active formula characters.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  let str = String(value);
  
  // Protect against CSV formula injection in spreadsheet software
  if (str.length > 0 && ['=', '+', '-', '@', '\t', '\r'].includes(str.charAt(0))) {
    str = `'${str}`;
  }

  // Escape quotes if containing commas, newlines, or quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Comprehensive Audit Events filtering, search, date validation, and sorting engine.
 */
export function filterAuditEvents(events: AuditEvent[], filter: AuditLogFilter): AuditEvent[] {
  let list = [...events];

  // 1. Category Filter
  if (filter.category && filter.category !== 'all') {
    list = list.filter((e) => e.category === filter.category);
  }

  // 2. Severity Filter
  if (filter.severity && filter.severity !== 'all') {
    list = list.filter((e) => e.severity === filter.severity);
  }

  // 3. Status/Outcome Filter
  if (filter.status && filter.status !== 'all') {
    list = list.filter((e) => e.status === filter.status);
  }

  // 4. Organization Scope Filter
  if (filter.organizationId && filter.organizationId !== 'all') {
    list = list.filter(
      (e) => e.organizationId === filter.organizationId || e.targetId === filter.organizationId
    );
  }

  // 5. Actor Role Filter
  if (filter.actorRole && filter.actorRole !== 'all') {
    list = list.filter((e) => e.actor.role === filter.actorRole);
  }

  // 6. Actor ID Filter
  if (filter.actorId && filter.actorId !== 'all') {
    list = list.filter((e) => e.actor.id === filter.actorId);
  }

  // 7. Free Text Search Query
  if (filter.searchQuery && filter.searchQuery.trim()) {
    const q = filter.searchQuery.toLowerCase().trim();
    list = list.filter(
      (e) =>
        e.action.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q) ||
        e.actor.name.toLowerCase().includes(q) ||
        e.actor.email.toLowerCase().includes(q) ||
        e.targetEntity.toLowerCase().includes(q) ||
        (e.targetName && e.targetName.toLowerCase().includes(q)) ||
        e.targetId.toLowerCase().includes(q) ||
        (e.correlationId && e.correlationId.toLowerCase().includes(q)) ||
        (e.organizationId && e.organizationId.toLowerCase().includes(q))
    );
  }

  // 8. Date Range Filtering with robust UTC date boundaries
  if (filter.startDate) {
    const str = filter.startDate.includes('T')
      ? filter.startDate
      : `${filter.startDate}T00:00:00.000Z`;
    const startMs = new Date(str).getTime();
    if (!isNaN(startMs)) {
      list = list.filter((e) => {
        const evtMs = new Date(e.timestamp).getTime();
        return !isNaN(evtMs) && evtMs >= startMs;
      });
    }
  }

  if (filter.endDate) {
    const str = filter.endDate.includes('T')
      ? filter.endDate
      : `${filter.endDate}T23:59:59.999Z`;
    const endMs = new Date(str).getTime();
    if (!isNaN(endMs)) {
      list = list.filter((e) => {
        const evtMs = new Date(e.timestamp).getTime();
        return !isNaN(evtMs) && evtMs <= endMs;
      });
    }
  }

  // 9. Deterministic Sorting
  const sortBy = filter.sortBy || 'timestamp_desc';
  list.sort((a, b) => {
    if (sortBy === 'timestamp_asc') {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    }
    if (sortBy === 'severity') {
      const severityRank: Record<string, number> = { critical: 3, warning: 2, info: 1 };
      const diff = (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
      if (diff !== 0) return diff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    if (sortBy === 'action') {
      return a.action.localeCompare(b.action);
    }
    // Default: timestamp_desc
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return list;
}

/**
 * Filter Security Events for triage board.
 */
export function filterSecurityEvents(
  events: SecurityEvent[],
  filters: {
    searchQuery?: string;
    category?: string;
    severity?: string;
    triageStatus?: string;
  }
): SecurityEvent[] {
  return events.filter((evt) => {
    if (filters.category && filters.category !== 'all' && evt.category !== filters.category) {
      return false;
    }
    if (filters.severity && filters.severity !== 'all' && evt.severity !== filters.severity) {
      return false;
    }
    if (filters.triageStatus && filters.triageStatus !== 'all' && evt.triageStatus !== filters.triageStatus) {
      return false;
    }
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matches =
        evt.title.toLowerCase().includes(q) ||
        evt.sanitizedExplanation.toLowerCase().includes(q) ||
        evt.suggestedRemediation.toLowerCase().includes(q) ||
        evt.actor.name.toLowerCase().includes(q) ||
        evt.relatedEntityId.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });
}

/**
 * Filter Compliance Controls.
 */
export function filterComplianceControls(
  controls: ComplianceControl[],
  filters: {
    searchQuery?: string;
    domain?: string;
    implementationStatus?: string;
    evidenceStatus?: string;
  }
): ComplianceControl[] {
  return controls.filter((ctrl) => {
    if (filters.domain && filters.domain !== 'all' && ctrl.domain !== filters.domain) {
      return false;
    }
    if (filters.implementationStatus && filters.implementationStatus !== 'all' && ctrl.implementationStatus !== filters.implementationStatus) {
      return false;
    }
    if (filters.evidenceStatus && filters.evidenceStatus !== 'all' && ctrl.evidenceStatus !== filters.evidenceStatus) {
      return false;
    }
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matches =
        ctrl.id.toLowerCase().includes(q) ||
        ctrl.name.toLowerCase().includes(q) ||
        ctrl.description.toLowerCase().includes(q) ||
        ctrl.controlOwnerRole.toLowerCase().includes(q) ||
        ctrl.frameworkMappings.some((m) =>
          m.framework.toLowerCase().includes(q) || m.controlRef.toLowerCase().includes(q)
        );
      if (!matches) return false;
    }
    return true;
  });
}

/**
 * Filter Governance Evidence items.
 */
export function filterGovernanceEvidence(
  evidenceList: GovernanceEvidence[],
  filters: {
    searchQuery?: string;
    evidenceType?: string;
    reviewStatus?: string;
    controlId?: string;
  }
): GovernanceEvidence[] {
  return evidenceList.filter((evd) => {
    if (filters.evidenceType && filters.evidenceType !== 'all' && evd.evidenceType !== filters.evidenceType) {
      return false;
    }
    if (filters.reviewStatus && filters.reviewStatus !== 'all' && evd.reviewStatus !== filters.reviewStatus) {
      return false;
    }
    if (filters.controlId && filters.controlId !== 'all' && evd.controlId !== filters.controlId) {
      return false;
    }
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matches =
        evd.id.toLowerCase().includes(q) ||
        evd.title.toLowerCase().includes(q) ||
        evd.sourceReference.toLowerCase().includes(q) ||
        evd.notes.toLowerCase().includes(q) ||
        evd.controlId.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });
}

/**
 * Filter Data Retention Policies.
 */
export function filterRetentionPolicies(
  policies: DataRetentionPolicy[],
  filters: {
    searchQuery?: string;
    dataCategory?: string;
    enabledOnly?: boolean;
  }
): DataRetentionPolicy[] {
  return policies.filter((pol) => {
    if (filters.dataCategory && filters.dataCategory !== 'all' && pol.dataCategory !== filters.dataCategory) {
      return false;
    }
    if (filters.enabledOnly && !pol.isEnabled) {
      return false;
    }
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matches =
        pol.name.toLowerCase().includes(q) ||
        pol.description.toLowerCase().includes(q) ||
        pol.complianceBasis.toLowerCase().includes(q) ||
        pol.requiredApprovals.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });
}

/**
 * Compute overall Compliance & Audit metrics across the governance domains.
 */
export function computeAuditComplianceMetrics(
  auditEvents: AuditEvent[],
  securityEvents: SecurityEvent[],
  controls: ComplianceControl[],
  evidence: GovernanceEvidence[],
  policies: DataRetentionPolicy[]
): AuditComplianceMetrics {
  const totalAuditEvents = auditEvents.length;
  const criticalAuditEvents = auditEvents.filter((e) => e.severity === 'critical').length;
  const securityEventsCount = securityEvents.length;
  const unreviewedSecurityEvents = securityEvents.filter((s) => s.triageStatus === 'unreviewed').length;

  const totalControls = controls.length;
  const verifiedControls = controls.filter((c) => c.implementationStatus === 'implemented_verified').length;
  const partialControls = controls.filter((c) => c.implementationStatus === 'partially_implemented').length;
  const plannedControls = controls.filter((c) => c.implementationStatus === 'planned').length;
  const evidenceRequiredControls = controls.filter(
    (c) => c.implementationStatus === 'evidence_required' || c.evidenceStatus === 'missing'
  ).length;

  const totalEvidenceRecords = evidence.length;
  const verifiedEvidenceRecords = evidence.filter((e) => e.reviewStatus === 'verified').length;

  const activePolicies = policies.filter((p) => p.isEnabled).length;
  const activeLegalHolds = policies.reduce((acc, p) => acc + (p.activeLegalHoldsCount || 0), 0);

  return {
    totalAuditEvents,
    criticalAuditEvents,
    securityEventsCount,
    unreviewedSecurityEvents,
    totalControls,
    verifiedControls,
    partialControls,
    plannedControls,
    evidenceRequiredControls,
    totalEvidenceRecords,
    verifiedEvidenceRecords,
    activePolicies,
    activeLegalHolds,
  };
}

/**
 * Validates a simulated Data Retention Policy update.
 */
export function validateRetentionPolicyUpdate(
  policy: DataRetentionPolicy,
  newDays: number,
  reason: string
): { valid: boolean; error?: string } {
  if (newDays < -1) {
    return { valid: false, error: 'Retention period cannot be negative (use -1 for indefinite statutory hold).' };
  }
  if (newDays === 0) {
    return { valid: false, error: 'Retention period of 0 days is prohibited. Minimum retention is 1 day.' };
  }
  if (!reason || reason.trim().length < 5) {
    return { valid: false, error: 'A justification of at least 5 characters is required for policy modifications.' };
  }
  return { valid: true };
}

/**
 * Validates a Security Event triage action.
 */
export function validateSecurityTriageUpdate(
  event: SecurityEvent,
  newStatus: string,
  notes?: string
): { valid: boolean; error?: string } {
  const validStatuses = ['unreviewed', 'under_review', 'acknowledged', 'remediated', 'dismissed'];
  if (!validStatuses.includes(newStatus)) {
    return { valid: false, error: `Invalid triage status: ${newStatus}` };
  }
  if ((newStatus === 'remediated' || newStatus === 'dismissed') && (!notes || notes.trim().length < 5)) {
    return { valid: false, error: 'A remediation or dismissal note of at least 5 characters is required.' };
  }
  return { valid: true };
}

/**
 * Generate CSV content for audit events.
 */
export function generateAuditCsv(events: AuditEvent[]): string {
  const headers = [
    'Event ID',
    'Timestamp (UTC)',
    'Category',
    'Action',
    'Severity',
    'Status',
    'Actor Name',
    'Actor Role',
    'Target Entity',
    'Target ID',
    'Target Name',
    'Organization ID',
    'Correlation ID',
    'Source Classification',
    'Details',
  ];

  const rows = events.map((e) => [
    sanitizeCsvCell(e.id),
    sanitizeCsvCell(e.timestamp),
    sanitizeCsvCell(e.category),
    sanitizeCsvCell(e.action),
    sanitizeCsvCell(e.severity),
    sanitizeCsvCell(e.status),
    sanitizeCsvCell(e.actor.name),
    sanitizeCsvCell(e.actor.role),
    sanitizeCsvCell(e.targetEntity),
    sanitizeCsvCell(e.targetId),
    sanitizeCsvCell(e.targetName || ''),
    sanitizeCsvCell(e.organizationId || ''),
    sanitizeCsvCell(e.correlationId || ''),
    sanitizeCsvCell(e.sourceClassification || 'client_simulation'),
    sanitizeCsvCell(e.details),
  ]);

  const notice = [
    '# PLATFORM AUDIT TRAIL EXPORT — DEVELOPMENT SANDBOX RECORDS',
    '# Generated At: ' + new Date().toISOString(),
    '# Scope: Filtered Platform Audit Records (Sensitive credentials and private student PII excluded)',
    '# NOTICE: Client-side development records only. Not an authoritative, immutable, or cryptographically sealed audit trail.',
    '',
  ].join('\n');

  const csvRows = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  return notice + csvRows;
}

/**
 * Generate CSV content for Compliance Controls.
 */
export function generateComplianceCsv(controls: ComplianceControl[]): string {
  const headers = [
    'Control ID',
    'Control Name',
    'Governance Domain',
    'Implementation Status',
    'Evidence Status',
    'Owner Role',
    'Framework Mappings',
    'Source Classification',
    'Last Reviewed',
    'Description',
    'Remediation Notes',
  ];

  const rows = controls.map((c) => [
    sanitizeCsvCell(c.id),
    sanitizeCsvCell(c.name),
    sanitizeCsvCell(c.domain),
    sanitizeCsvCell(c.implementationStatus),
    sanitizeCsvCell(c.evidenceStatus),
    sanitizeCsvCell(c.controlOwnerRole),
    sanitizeCsvCell(c.frameworkMappings.map((m) => `${m.framework}: ${m.controlRef}`).join('; ')),
    sanitizeCsvCell(c.sourceClassification),
    sanitizeCsvCell(c.lastReviewedAt),
    sanitizeCsvCell(c.description),
    sanitizeCsvCell(c.remediationNotes || ''),
  ]);

  const notice = [
    '# PLATFORM COMPLIANCE CONTROL INVENTORY EXPORT',
    '# Generated At: ' + new Date().toISOString(),
    '# NOTICE: Internal governance aid only. Does not constitute formal certification or legal opinion.',
    '',
  ].join('\n');

  const csvRows = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  return notice + csvRows;
}
