/**
 * Phase E-09.20: Exporters and Formula Injection Protection for Data Governance.
 *
 * Implements strict sanitization against spreadsheet formula injection attacks
 * and ensures ZERO student, parent, or staff personal data is leaked in export bundles.
 */

import {
  DataCategoryRecord,
  GovernanceRetentionPolicy,
  PrivacyRequestRecord,
  DataLifecycleRuleRecord,
  GovernanceExceptionRecord,
  TenantGovernanceSummary,
  GovernanceAuditRecord,
} from '../types/data-governance';

/**
 * Protects against CSV formula injection attacks by prefixing cells that begin
 * with dangerous calculation triggers (=, +, -, @, \t, \r) with an apostrophe.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }

  let str = String(value);

  // Check if string starts with formula trigger characters
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape existing double quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Exports data category inventory to CSV.
 */
export function exportDataCategoriesToCsv(categories: DataCategoryRecord[]): string {
  const headers = [
    'Category ID',
    'Category Code',
    'Name',
    'Classification Level',
    'Subject Type',
    'Owning Module',
    'Retention Policy Reference',
    'Lifecycle Status',
    'Review Status',
    'Data Source Status',
    'Applicable Regulations',
    'Last Reviewed',
  ];

  const rows = categories.map((c) => [
    sanitizeCsvCell(c.id),
    sanitizeCsvCell(c.code),
    sanitizeCsvCell(c.name),
    sanitizeCsvCell(c.classificationLevel),
    sanitizeCsvCell(c.dataSubjectType),
    sanitizeCsvCell(c.owningModule),
    sanitizeCsvCell(c.retentionPolicyId || 'UNASSIGNED'),
    sanitizeCsvCell(c.lifecycleStatus),
    sanitizeCsvCell(c.reviewStatus),
    sanitizeCsvCell(c.dataSourceStatus),
    sanitizeCsvCell(c.applicableRegulations.join('; ')),
    sanitizeCsvCell(c.lastReviewedAt),
  ]);

  return [headers.map(sanitizeCsvCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Exports retention schedules to CSV.
 */
export function exportRetentionPoliciesToCsv(policies: GovernanceRetentionPolicy[]): string {
  const headers = [
    'Policy ID',
    'Policy Code',
    'Policy Name',
    'Retention Duration',
    'Duration Days',
    'Retention Trigger',
    'Status',
    'Approval Status',
    'Policy Owner',
    'Covered Categories Count',
    'Next Review Due',
    'Legal Basis',
  ];

  const rows = policies.map((p) => [
    sanitizeCsvCell(p.id),
    sanitizeCsvCell(p.code),
    sanitizeCsvCell(p.name),
    sanitizeCsvCell(p.durationDisplay),
    sanitizeCsvCell(p.durationDays),
    sanitizeCsvCell(p.retentionTrigger),
    sanitizeCsvCell(p.status),
    sanitizeCsvCell(p.approvalStatus),
    sanitizeCsvCell(p.policyOwner),
    sanitizeCsvCell(p.coveredCategoryIds.length),
    sanitizeCsvCell(p.nextReviewDueAt),
    sanitizeCsvCell(p.legalSafeguardBasis),
  ]);

  return [headers.map(sanitizeCsvCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Exports privacy request register to CSV without personal identity details.
 */
export function exportPrivacyRequestsToCsv(requests: PrivacyRequestRecord[]): string {
  const headers = [
    'Request ID',
    'Request Code',
    'Category',
    'Party Type',
    'Party Label (Fictional)',
    'Tenant ID',
    'Tenant Name',
    'Received At',
    'Due At',
    'Workflow Status',
    'Priority',
    'Assigned Role',
    'Resolution Category',
    'Completed At',
  ];

  const rows = requests.map((r) => [
    sanitizeCsvCell(r.id),
    sanitizeCsvCell(r.code),
    sanitizeCsvCell(r.category),
    sanitizeCsvCell(r.requestingPartyType),
    sanitizeCsvCell(r.requestingPartyLabel),
    sanitizeCsvCell(r.tenantId),
    sanitizeCsvCell(r.tenantName),
    sanitizeCsvCell(r.receivedAt),
    sanitizeCsvCell(r.dueAt),
    sanitizeCsvCell(r.workflowStatus),
    sanitizeCsvCell(r.priority),
    sanitizeCsvCell(r.assignedRole),
    sanitizeCsvCell(r.resolutionCategory),
    sanitizeCsvCell(r.completedAt || 'N/A'),
  ]);

  return [headers.map(sanitizeCsvCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Exports aggregated tenant governance metrics to CSV.
 */
export function exportTenantGovernanceToCsv(summaries: TenantGovernanceSummary[]): string {
  const headers = [
    'Tenant ID',
    'Tenant Name',
    'Tenant Code',
    'Tier',
    'Classification Coverage (%)',
    'Total Categories',
    'Active Retention Policies',
    'Policies Due Review',
    'Open Privacy Requests',
    'Unresolved Exceptions',
    'Governance Completeness',
  ];

  const rows = summaries.map((t) => [
    sanitizeCsvCell(t.tenantId),
    sanitizeCsvCell(t.tenantName),
    sanitizeCsvCell(t.tenantCode),
    sanitizeCsvCell(t.tier),
    sanitizeCsvCell(t.classificationCoveragePercent),
    sanitizeCsvCell(t.totalMappedCategories),
    sanitizeCsvCell(t.retentionPoliciesAssignedCount),
    sanitizeCsvCell(t.policiesAwaitingReviewCount),
    sanitizeCsvCell(t.openPrivacyRequestsCount),
    sanitizeCsvCell(t.unresolvedExceptionsCount),
    sanitizeCsvCell(t.governanceCompleteness),
  ]);

  return [headers.map(sanitizeCsvCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Exports data lifecycle rules to CSV.
 */
export function exportLifecycleRulesToCsv(rules: DataLifecycleRuleRecord[]): string {
  const headers = [
    'Rule ID',
    'Rule Code',
    'Name',
    'Covered Category ID',
    'Trigger Event',
    'Trigger Conditions',
    'Target Lifecycle Stage',
    'Required Approval',
    'Status',
    'Next Review Date',
  ];

  const rows = rules.map((r) => [
    sanitizeCsvCell(r.id),
    sanitizeCsvCell(r.code),
    sanitizeCsvCell(r.name),
    sanitizeCsvCell(r.coveredCategoryId),
    sanitizeCsvCell(r.triggerEvent),
    sanitizeCsvCell(r.triggerConditions),
    sanitizeCsvCell(r.targetLifecycleStage),
    sanitizeCsvCell(r.requiredApproval),
    sanitizeCsvCell(r.status),
    sanitizeCsvCell(r.nextReviewDate),
  ]);

  return [headers.map(sanitizeCsvCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Exports governance exceptions to CSV.
 */
export function exportGovernanceExceptionsToCsv(exceptions: GovernanceExceptionRecord[]): string {
  const headers = [
    'Exception ID',
    'Exception Code',
    'Title',
    'Related Policy ID',
    'Related Category ID',
    'Tenant ID',
    'Tenant Name',
    'Reason Category',
    'Review Status',
    'Approval Requirement',
    'Review Due At',
    'Expiration At',
    'Responsible Role',
  ];

  const rows = exceptions.map((e) => [
    sanitizeCsvCell(e.id),
    sanitizeCsvCell(e.code),
    sanitizeCsvCell(e.title),
    sanitizeCsvCell(e.relatedPolicyId),
    sanitizeCsvCell(e.relatedCategoryId),
    sanitizeCsvCell(e.tenantId),
    sanitizeCsvCell(e.tenantName),
    sanitizeCsvCell(e.reasonCategory),
    sanitizeCsvCell(e.reviewStatus),
    sanitizeCsvCell(e.approvalRequirement),
    sanitizeCsvCell(e.reviewDueAt),
    sanitizeCsvCell(e.expirationAt),
    sanitizeCsvCell(e.responsibleRole),
  ]);

  return [headers.map(sanitizeCsvCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Exports governance audit records to CSV.
 */
export function exportGovernanceAuditToCsv(logs: GovernanceAuditRecord[]): string {
  const headers = [
    'Log ID',
    'Timestamp',
    'Action',
    'Severity',
    'Actor Name',
    'Actor Email',
    'Actor Role',
    'Target Entity',
    'Target ID',
    'Target Name',
    'Status',
    'Details',
  ];

  const rows = logs.map((l) => [
    sanitizeCsvCell(l.id),
    sanitizeCsvCell(l.timestamp),
    sanitizeCsvCell(l.action),
    sanitizeCsvCell(l.severity),
    sanitizeCsvCell(l.actor?.name || 'System'),
    sanitizeCsvCell(l.actor?.email || 'system@platform.internal'),
    sanitizeCsvCell(l.actor?.role || 'system'),
    sanitizeCsvCell(l.targetEntity),
    sanitizeCsvCell(l.targetId),
    sanitizeCsvCell(l.targetName || ''),
    sanitizeCsvCell(l.status),
    sanitizeCsvCell(l.details),
  ]);

  return [headers.map(sanitizeCsvCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

export const exportTenantGovernanceSummariesToCsv = exportTenantGovernanceToCsv;

/**
 * Generates the complete platform governance JSON package.
 */
export function generateGovernanceJsonPackage(payload: {
  categories: DataCategoryRecord[];
  policies: GovernanceRetentionPolicy[];
  requests: PrivacyRequestRecord[];
  rules?: DataLifecycleRuleRecord[];
  lifecycleRules?: DataLifecycleRuleRecord[];
  exceptions: GovernanceExceptionRecord[];
  tenantSummaries?: TenantGovernanceSummary[];
  tenants?: TenantGovernanceSummary[];
  auditLogs: GovernanceAuditRecord[];
}): string {
  const categories = payload.categories || [];
  const policies = payload.policies || [];
  const requests = payload.requests || [];
  const rules = payload.rules || payload.lifecycleRules || [];
  const exceptions = payload.exceptions || [];
  const tenantSummaries = payload.tenantSummaries || payload.tenants || [];
  const auditLogs = payload.auditLogs || [];

  const bundle = {
    metadata: {
      schemaVersion: '1.0.0',
      isDemonstrationExport: true,
      zeroPiiNotice: 'Confirmed - Contains only declarative schemas and synthetic tokens',
      packageType: 'platform_data_governance_export',
      version: '1.0.0',
      phase: 'E-09.20',
      exportedAt: new Date().toISOString(),
      generator: 'Super-Admin Console Data Governance Workspace',
      disclaimer:
        'This package contains platform data governance classifications, retention models, simulated privacy request records, and lifecycle rules. All records are demonstration fixtures; zero real customer data is contained herein. Configuration does not imply verified legal compliance or production server enforcement.',
    },
    schemaVersion: '1.0.0',
    isDemonstrationExport: true,
    zeroPiiNotice: 'Confirmed - Contains only declarative schemas and synthetic tokens',
    metricsSummary: {
      totalCategories: categories.length,
      totalPolicies: policies.length,
      totalRequests: requests.length,
      totalRules: rules.length,
      totalExceptions: exceptions.length,
      totalTenants: tenantSummaries.length,
    },
    categories,
    policies,
    dataCategories: categories,
    retentionPolicies: policies,
    privacyRequests: requests,
    lifecycleRules: rules,
    governanceExceptions: exceptions,
    tenantGovernance: tenantSummaries,
    governanceAuditTrail: auditLogs,
  };

  return JSON.stringify(bundle, null, 2);
}

export const generateGovernancePackageJson = generateGovernanceJsonPackage;

/**
 * Triggers a client-side file download.
 */
export function triggerBrowserDownload(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * High-level export helper for JSON or CSV governance package.
 */
export function exportGovernancePackage(payload: {
  categories: DataCategoryRecord[];
  policies: GovernanceRetentionPolicy[];
  requests: PrivacyRequestRecord[];
  lifecycleRules: DataLifecycleRuleRecord[];
  tenants: TenantGovernanceSummary[];
  exceptions: GovernanceExceptionRecord[];
  auditLogs: GovernanceAuditRecord[];
  format: 'json' | 'csv';
}): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  if (payload.format === 'json') {
    const json = generateGovernanceJsonPackage({
      categories: payload.categories,
      policies: payload.policies,
      requests: payload.requests,
      rules: payload.lifecycleRules,
      exceptions: payload.exceptions,
      tenantSummaries: payload.tenants,
      auditLogs: payload.auditLogs,
    });
    triggerBrowserDownload(json, `data-governance-package-${timestamp}.json`, 'application/json');
  } else {
    const csv = exportDataCategoriesToCsv(payload.categories);
    triggerBrowserDownload(csv, `data-categories-inventory-${timestamp}.csv`, 'text/csv');
  }
}

