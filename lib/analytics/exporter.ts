/**
 * Phase E-09.18: Analytics Reports and Export Engine
 * Enterprise CSV & JSON exporters with formula injection protection and zero student PII exposure.
 *
 * NOTE: Neutralizes spreadsheet formula execution triggers (=, +, -, @, \t, \r)
 * and includes deterministic metadata comment blocks for administrative compliance.
 */

import {
  GeneratedReportResult,
  ReportCategoryKey,
  ReportTemplateDescriptor,
  TabularReportRow,
  AnalyticsGlobalFilters,
} from '@/lib/types/analytics';
import {
  Organization,
  SubscriptionPlan,
  OrganizationSubscription,
  Invoice,
  AuditEvent,
} from '@/lib/types';
import { SupportTicket } from '@/lib/types/support-desk';
import { NotificationRecord } from '@/lib/types/communications';
import {
  computeTenantGrowthMetrics,
  computeMonetizationMetrics,
  computeModuleAdoptionMetrics,
} from './evaluator';

// ============================================================================
// 1. FORMULA INJECTION NEUTRALIZER & ESCAPING
// ============================================================================

/**
 * Escapes CSV values and neutralizes dangerous formula injection characters
 * (=, +, -, @, \t, \r).
 */
export function escapeCsvFormulaInjection(
  val: string | number | boolean | null | undefined
): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);

  // If string begins with a formula injection trigger, prefix with single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape double quotes by doubling them
  str = str.replace(/"/g, '""');

  return `"${str}"`;
}

// ============================================================================
// 2. REPORT TEMPLATES CATALOG
// ============================================================================

export const REPORT_TEMPLATES: ReportTemplateDescriptor[] = [
  {
    id: 'executive_summary',
    name: 'Executive Platform Vital Signs',
    category: 'executive',
    description: 'High-level executive summary of organization footprint, subscription run-rate, SLA, and operations.',
    defaultColumns: ['Metric Name', 'Category', 'Current Value', 'Target / Benchmark', 'Data Status'],
    availableGroupings: ['Category'],
  },
  {
    id: 'tenant_lifecycle',
    name: 'Tenant Population & Lifecycle Roster',
    category: 'tenants',
    description: 'Complete inventory of school organizations with onboarding status, campus count, and plan bindings.',
    defaultColumns: ['Organization ID', 'School Name', 'Code', 'Lifecycle Status', 'Onboarding Stage', 'Plan', 'Campuses', 'Created Date'],
    availableGroupings: ['Lifecycle Status', 'Plan', 'Onboarding Stage'],
  },
  {
    id: 'subscriptions_revenue',
    name: 'Commercial Subscriptions & Receivables Audit',
    category: 'monetization',
    description: 'Detailed active subscriptions, billing cycles, currency partitions, and invoice ledger aging.',
    defaultColumns: ['Subscription ID', 'School Name', 'Plan Tier', 'Billing Cycle', 'Status', 'MRR Contribution', 'Currency', 'Period End'],
    availableGroupings: ['Plan Tier', 'Status', 'Billing Cycle', 'Currency'],
  },
  {
    id: 'module_adoption',
    name: 'Module Registry Entitlement & Adoption Roster',
    category: 'modules',
    description: 'Comprehensive adoption percentage and enablement stats across all tenant-facing platform modules.',
    defaultColumns: ['Module ID', 'Module Name', 'Macro Category', 'Enabled Tenants', 'Eligible Tenants', 'Adoption Rate (%)', 'Status'],
    availableGroupings: ['Macro Category', 'Status'],
  },
  {
    id: 'support_sla',
    name: 'Support Desk Backlog & SLA Compliance',
    category: 'support',
    description: 'Support workload distribution, first response time, resolution time, and SLA breach tracking.',
    defaultColumns: ['Ticket Number', 'Subject', 'School Name', 'Priority', 'Status', 'SLA State', 'Created At', 'Resolved At'],
    availableGroupings: ['Priority', 'Status', 'SLA State'],
  },
  {
    id: 'platform_operations',
    name: 'Platform Infrastructure & Operations Telemetry',
    category: 'operations',
    description: 'Component health telemetry, incident lifecycle logs, and backup readiness verification.',
    defaultColumns: ['Component ID', 'Component Name', 'Category', 'Health Status', 'Observed Latency', 'Telemetry Status'],
    availableGroupings: ['Category', 'Health Status'],
  },
  {
    id: 'communications_delivery',
    name: 'Communications Dispatch & Delivery Ledger',
    category: 'communications',
    description: 'Transactional notification dispatches across email, SMS, and push with carrier delivery verification.',
    defaultColumns: ['Dispatch ID', 'Recipient Masked', 'Channel', 'Category', 'Delivery Status', 'Sent At', 'Delivered At', 'Failure Reason'],
    availableGroupings: ['Channel', 'Delivery Status', 'Category'],
  },
  {
    id: 'audit_security',
    name: 'Security, Audit & Governance Compliance Trail',
    category: 'governance',
    description: 'Super-Admin privileged mutations, security triage records, and compliance control evaluations.',
    defaultColumns: ['Event ID', 'Action', 'Severity', 'Actor Email', 'Target Entity', 'Target ID', 'Status', 'Timestamp'],
    availableGroupings: ['Severity', 'Target Entity', 'Status'],
  },
];

// ============================================================================
// 3. GENERATORS FOR CANONICAL REPORTS
// ============================================================================

export function generateTabularReport(
  templateId: ReportCategoryKey,
  filters: AnalyticsGlobalFilters,
  rawStore: {
    organizations?: Organization[];
    subscriptions?: OrganizationSubscription[];
    plans?: SubscriptionPlan[];
    invoices?: Invoice[];
    supportTickets?: SupportTicket[];
    notifications?: NotificationRecord[];
    auditEvents?: AuditEvent[];
  }
): GeneratedReportResult {
  const store = {
    organizations: rawStore.organizations || [],
    subscriptions: rawStore.subscriptions || [],
    plans: rawStore.plans || [],
    invoices: rawStore.invoices || [],
    supportTickets: rawStore.supportTickets || [],
    notifications: rawStore.notifications || [],
    auditEvents: rawStore.auditEvents || [],
  };

  const orgMap = new Map(store.organizations.map((o) => [o.id, o.name]));
  const planMap = new Map(store.plans.map((p) => [p.id, p.name]));

  const nowIso = new Date().toISOString();
  const periodLabel = `${filters.dateRange.startDate} to ${filters.dateRange.endDate} (${filters.dateRange.label})`;

  const filterSummary: Record<string, string> = {
    DateRange: periodLabel,
    Organization: filters.organizationId,
    Plan: filters.planId,
    Status: filters.status,
    Currency: filters.currency,
  };

  switch (templateId) {
    case 'tenant_lifecycle': {
      const growth = computeTenantGrowthMetrics(store.organizations, [], filters);
      const scopedOrgs = store.organizations.filter((o) => {
        if (filters.organizationId !== 'all' && o.id !== filters.organizationId) return false;
        if (filters.planId !== 'all' && o.planId !== filters.planId) return false;
        if (filters.status !== 'all' && o.status !== filters.status) return false;
        return true;
      });

      const headers = [
        'Organization ID',
        'School Name',
        'Code',
        'Lifecycle Status',
        'Onboarding Stage',
        'Plan',
        'Created Date',
        'Student Count Estimate',
      ];

      const rows: TabularReportRow[] = scopedOrgs.map((o) => ({
        'Organization ID': o.id,
        'School Name': o.name,
        'Code': o.code,
        'Lifecycle Status': o.status.toUpperCase(),
        'Onboarding Stage': (o.onboardingStatus || 'not_started').replace(/_/g, ' '),
        'Plan': planMap.get(o.planId) || o.planId,
        'Created Date': o.createdAt?.split('T')[0] || 'N/A',
        'Student Count Estimate': o.studentCountEstimate || 0,
      }));

      return {
        title: 'Tenant Population & Lifecycle Roster',
        templateId,
        generatedAt: nowIso,
        reportingPeriod: periodLabel,
        appliedFilters: filterSummary,
        headers,
        rows,
        totalRowCount: rows.length,
        summaryFooters: {
          'Total Organizations': scopedOrgs.length,
          'Active Count': growth.activeCount,
          'Pending Count': growth.pendingCount,
          'Suspended Count': growth.suspendedCount,
        },
        isDemoData: true,
      };
    }

    case 'subscriptions_revenue': {
      const mon = computeMonetizationMetrics(store.subscriptions, store.plans, store.invoices, [], filters);
      const scopedSubs = store.subscriptions.filter((s) => {
        if (filters.organizationId !== 'all' && s.organizationId !== filters.organizationId) return false;
        if (filters.planId !== 'all' && s.planId !== filters.planId) return false;
        return true;
      });

      const headers = [
        'Subscription ID',
        'School Name',
        'Plan ID',
        'Billing Cycle',
        'Status',
        'Current Period Start',
        'Current Period End',
        'Cancel At Period End',
      ];

      const rows: TabularReportRow[] = scopedSubs.map((s) => ({
        'Subscription ID': s.id,
        'School Name': orgMap.get(s.organizationId) || s.organizationId,
        'Plan ID': planMap.get(s.planId) || s.planId,
        'Billing Cycle': s.billingCycle.toUpperCase(),
        'Status': s.status.toUpperCase(),
        'Current Period Start': s.currentPeriodStart?.split('T')[0] || 'N/A',
        'Current Period End': s.currentPeriodEnd?.split('T')[0] || 'N/A',
        'Cancel At Period End': s.cancelAtPeriodEnd ? 'YES' : 'NO',
      }));

      return {
        title: 'Commercial Subscriptions & Receivables Audit',
        templateId,
        generatedAt: nowIso,
        reportingPeriod: periodLabel,
        appliedFilters: filterSummary,
        headers,
        rows,
        totalRowCount: rows.length,
        summaryFooters: {
          'Total Subscriptions': scopedSubs.length,
          'Active Paid': mon.activePaidSubscriptions,
          'Trialing Accounts': mon.trialingSubscriptions,
          'Past Due Accounts': mon.pastDueSubscriptions,
        },
        isDemoData: true,
      };
    }

    case 'module_adoption': {
      const modMetrics = computeModuleAdoptionMetrics(store.organizations, store.plans, [], undefined, filters);

      const headers = [
        'Module ID',
        'Module Name',
        'Macro Category',
        'Enabled Tenant Count',
        'Eligible Tenant Count',
        'Total Tenants',
        'Eligible Adoption (%)',
        'Total Adoption (%)',
        'Adoption Status',
      ];

      const rows: TabularReportRow[] = modMetrics.allModuleStats.map((m) => ({
        'Module ID': m.moduleId,
        'Module Name': m.name,
        'Macro Category': m.macroCategory,
        'Enabled Tenant Count': m.enabledTenantCount,
        'Eligible Tenant Count': m.eligibleTenantCount,
        'Total Tenants': m.totalTenantCount,
        'Eligible Adoption (%)': m.adoptionRatePercent,
        'Total Adoption (%)': m.totalAdoptionRatePercent,
        'Adoption Status': m.status.toUpperCase(),
      }));

      return {
        title: 'Module Registry Entitlement & Adoption Roster',
        templateId,
        generatedAt: nowIso,
        reportingPeriod: periodLabel,
        appliedFilters: filterSummary,
        headers,
        rows,
        totalRowCount: rows.length,
        summaryFooters: {
          'Average Platform Adoption': `${modMetrics.averageAdoptionRatePercent}%`,
          'Total Modules Evaluated': modMetrics.totalModulesInRegistry,
        },
        isDemoData: true,
      };
    }

    case 'support_sla': {
      const scopedTickets = store.supportTickets.filter((t) => {
        if (filters.organizationId !== 'all' && t.organizationId !== filters.organizationId) return false;
        return true;
      });

      const headers = [
        'Ticket Number',
        'Subject',
        'School Name',
        'Category',
        'Priority',
        'Status',
        'SLA State',
        'Assigned Operator',
        'Created At',
        'Resolved At',
      ];

      const rows: TabularReportRow[] = scopedTickets.map((t) => ({
        'Ticket Number': t.ticketNumber,
        'Subject': t.subject,
        'School Name': orgMap.get(t.organizationId) || t.organizationId,
        'Category': t.category,
        'Priority': t.priority.toUpperCase(),
        'Status': t.status.toUpperCase(),
        'SLA State': t.slaState.replace(/_/g, ' ').toUpperCase(),
        'Assigned Operator': t.assignedOperatorId || 'UNASSIGNED',
        'Created At': t.createdAt || 'N/A',
        'Resolved At': t.resolvedAt || 'UNRESOLVED',
      }));

      return {
        title: 'Support Desk Backlog & SLA Compliance',
        templateId,
        generatedAt: nowIso,
        reportingPeriod: periodLabel,
        appliedFilters: filterSummary,
        headers,
        rows,
        totalRowCount: rows.length,
        isDemoData: true,
      };
    }

    case 'communications_delivery': {
      const scopedNotifs = store.notifications.filter((n) => {
        const tenantId = n.tenantId || 'platform_wide';
        if (filters.organizationId !== 'all' && tenantId !== filters.organizationId) return false;
        return true;
      });

      const headers = [
        'Notification ID',
        'School Name',
        'Channel',
        'Status',
        'Source Type',
        'Recipient Display',
        'Created At',
        'Delivered At',
        'Failure Reason',
      ];

      const rows: TabularReportRow[] = scopedNotifs.map((n) => ({
        'Notification ID': n.id,
        'School Name': n.tenantName || (n.tenantId ? orgMap.get(n.tenantId) || n.tenantId : 'Platform-Wide'),
        'Channel': n.channel.toUpperCase(),
        'Status': n.status.toUpperCase(),
        'Source Type': n.sourceType,
        'Recipient Display': n.recipientDisplay,
        'Created At': n.createdAt,
        'Delivered At': n.deliveredAt || 'N/A',
        'Failure Reason': n.failureReason || 'N/A',
      }));

      return {
        title: 'Communications Dispatch & Delivery Ledger',
        templateId,
        generatedAt: nowIso,
        reportingPeriod: periodLabel,
        appliedFilters: filterSummary,
        headers,
        rows,
        totalRowCount: rows.length,
        isDemoData: true,
      };
    }

    case 'audit_security': {
      const scopedAudits = store.auditEvents.filter((a) => {
        if (filters.organizationId !== 'all' && a.targetId !== filters.organizationId) return false;
        return true;
      });

      const headers = [
        'Audit ID',
        'Timestamp',
        'Category',
        'Action',
        'Severity',
        'Actor Email',
        'Target Entity',
        'Target Name',
        'Status',
      ];

      const rows: TabularReportRow[] = scopedAudits.map((a) => ({
        'Audit ID': a.id,
        'Timestamp': a.timestamp,
        'Category': a.category,
        'Action': a.action,
        'Severity': a.severity.toUpperCase(),
        'Actor Email': a.actor?.email || 'SYSTEM',
        'Target Entity': a.targetEntity,
        'Target Name': a.targetName || a.targetId,
        'Status': a.status.toUpperCase(),
      }));

      return {
        title: 'Security, Audit & Governance Compliance Trail',
        templateId,
        generatedAt: nowIso,
        reportingPeriod: periodLabel,
        appliedFilters: filterSummary,
        headers,
        rows,
        totalRowCount: rows.length,
        isDemoData: true,
      };
    }

    default: {
      // Default: Executive Summary Report
      const headers = ['Metric Identifier', 'Metric Name', 'Domain', 'Value', 'Unit', 'Data Status'];
      const rows: TabularReportRow[] = [
        {
          'Metric Identifier': 'METRIC_EXEC_TOTAL_ORGS',
          'Metric Name': 'Total Registered Organizations',
          'Domain': 'Tenants',
          'Value': store.organizations.length,
          'Unit': 'Orgs',
          'Data Status': 'DEMO_FIXTURE',
        },
        {
          'Metric Identifier': 'METRIC_EXEC_ACTIVE_ORGS',
          'Metric Name': 'Active School Organizations',
          'Domain': 'Tenants',
          'Value': store.organizations.filter((o) => o.status === 'active').length,
          'Unit': 'Orgs',
          'Data Status': 'DEMO_FIXTURE',
        },
        {
          'Metric Identifier': 'METRIC_EXEC_TOTAL_SUBS',
          'Metric Name': 'Active Paid Subscriptions',
          'Domain': 'Monetization',
          'Value': store.subscriptions.filter((s) => s.status === 'active').length,
          'Unit': 'Subscriptions',
          'Data Status': 'DEMO_FIXTURE',
        },
        {
          'Metric Identifier': 'METRIC_EXEC_OPEN_TICKETS',
          'Metric Name': 'Open Support Tickets',
          'Domain': 'Support',
          'Value': store.supportTickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed').length,
          'Unit': 'Tickets',
          'Data Status': 'DEMO_FIXTURE',
        },
        {
          'Metric Identifier': 'METRIC_EXEC_RECENT_AUDITS',
          'Metric Name': 'Recent Audit Events Count',
          'Domain': 'Governance',
          'Value': store.auditEvents.length,
          'Unit': 'Events',
          'Data Status': 'DEMO_FIXTURE',
        },
      ];

      return {
        title: 'Executive Platform Vital Signs',
        templateId: 'executive_summary',
        generatedAt: nowIso,
        reportingPeriod: periodLabel,
        appliedFilters: filterSummary,
        headers,
        rows,
        totalRowCount: rows.length,
        isDemoData: true,
      };
    }
  }
}

// ============================================================================
// 4. SERIALIZATION (CSV & JSON)
// ============================================================================

/**
 * Serializes a generated tabular report into an enterprise CSV format
 * complete with formula injection protection and metadata comment header.
 */
export function serializeReportToCsv(report: GeneratedReportResult): string {
  const metadataComment = [
    `# [DEMONSTRATION ONLY - LOCAL CLIENT REPOSITORIES - ZERO SERVER PERSISTENCE]`,
    `# Report Title: ${report.title}`,
    `# Template ID: ${report.templateId}`,
    `# Generated At: ${report.generatedAt}`,
    `# Reporting Period: ${report.reportingPeriod}`,
    `# Applied Filters: ${JSON.stringify(report.appliedFilters)}`,
    `# Total Rows: ${report.totalRowCount}`,
    `# Data Verification: SYNTHETIC_DEMO_FIXTURES`,
  ].join('\n');

  const escapedHeaders = report.headers.map((h) => escapeCsvFormulaInjection(h)).join(',');

  const rows = report.rows.map((row) => {
    return report.headers
      .map((header) => escapeCsvFormulaInjection(row[header]))
      .join(',');
  });

  return [metadataComment, escapedHeaders, ...rows].join('\n');
}

/**
 * Serializes a report into formatted JSON for administrative pipelines.
 */
export function serializeReportToJson(report: GeneratedReportResult): string {
  return JSON.stringify(
    {
      ...report,
      exportNotice: 'DEMONSTRATION DATA ONLY. Not connected to production billing or server telemetry.',
    },
    null,
    2
  );
}

/**
 * Triggers a safe browser download of exported report text.
 */
export function triggerFileDownload(
  fileName: string,
  content: string,
  mimeType = 'text/csv;charset=utf-8;'
): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
