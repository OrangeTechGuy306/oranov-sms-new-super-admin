/**
 * Phase E-09.18: Platform Analytics, Business Intelligence and Executive Reporting Governance
 * Enterprise domain types, filter models, metric catalog definitions, and export contracts.
 *
 * NOTE: These types govern the Super-Admin executive BI workspace.
 * All computations are performed client-side using deterministic platform store fixtures.
 * Zero student or teacher PII is exposed.
 */

import { PlanTier } from './subscriptions';

// ============================================================================
// 1. REPORTING CONTROLS & FILTER CONTRACTS
// ============================================================================

export type DatePresetKey =
  | 'last_7_days'
  | 'last_30_days'
  | 'last_90_days'
  | 'year_to_date'
  | 'all_time'
  | 'custom';

export interface ReportingDateRange {
  preset: DatePresetKey;
  startDate: string; // ISO 8601 string or YYYY-MM-DD
  endDate: string;   // ISO 8601 string or YYYY-MM-DD
  label: string;
}

export interface AnalyticsGlobalFilters {
  dateRange: ReportingDateRange;
  organizationId: string; // 'all' or specific org ID
  planId: string;         // 'all' or specific plan ID
  status: string;         // 'all' or OrganizationLifecycleStatus
  moduleId: string;       // 'all' or specific module ID
  currency: string;       // 'USD' | 'GBP' | 'CAD' | 'EUR'
}

// ============================================================================
// 2. METRIC CATALOG & DEFINITION CONTRACTS
// ============================================================================

export type MetricDataStatus =
  | 'DEMO_FIXTURE'
  | 'STATIC_CONFIG'
  | 'SIMULATED_TELEMETRY'
  | 'UNAVAILABLE'
  | 'STALE';

export type MetricCategoryKey =
  | 'executive'
  | 'tenants'
  | 'monetization'
  | 'modules'
  | 'support'
  | 'operations'
  | 'communications'
  | 'governance';

export type MetricFormatType =
  | 'number'
  | 'currency'
  | 'percentage'
  | 'duration_minutes'
  | 'duration_hours'
  | 'text';

export interface AnalyticsMetricDefinition {
  id: string;
  name: string;
  category: MetricCategoryKey;
  description: string;
  businessPurpose: string;
  formula: string;
  unit: string;
  formatType: MetricFormatType;
  sourceEntity: string;
  requiredFields: string[];
  dateInterpretation: string;
  filterCompatibility: string[];
  freshnessExpectation: string;
  dataStatus: MetricDataStatus;
  knownLimitations: string;
  futureBackendRequirements: string;
}

export type MetricDefinition = AnalyticsMetricDefinition;

// ============================================================================
// 3. DOMAIN METRIC COMPUTATION CONTRACTS
// ============================================================================

export interface ExecutiveKpiSummary {
  totalOrganizations: number;
  activeOrganizations: number;
  newOrganizationsInPeriod: number;
  suspendedOrganizations: number;
  pendingOrganizations: number;
  estimatedMrrUsd: number;
  estimatedArrUsd: number;
  primaryCurrency: string;
  totalActiveSubscriptions: number;
  platformModuleAdoptionRate: number; // percentage of enabled modules across active orgs
  openSupportTicketsCount: number;
  urgentTicketsCount: number;
  slaComplianceRate: number; // percentage met SLA
  systemOperationalRatio: number; // operational / total components
  notificationDeliveryRate: number; // delivered / (delivered + failed + sent)
  recentAuditEventsCount: number;
  securityIncidentsUnderReview: number;
  staleOrDemoSourcesCount: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  label: string;
  value: number;
  secondaryValue?: number;
  category?: string;
}

export interface CategoryBreakdownItem {
  key: string;
  label: string;
  count: number;
  percentage: number;
  colorHex?: string;
  statusBadgeVariant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export interface TenantGrowthMetrics {
  totalRegistered: number;
  newRegistrationsInPeriod: number;
  activeCount: number;
  pendingCount: number;
  suspendedCount: number;
  inactiveCount: number;
  archivedCount: number;
  onboardingBreakdown: {
    not_started: number;
    in_progress: number;
    verification_pending: number;
    completed: number;
  };
  classificationBreakdown: Record<string, number>;
  campusDistribution: {
    singleCampusCount: number;
    multiCampusCount: number;
    totalCampuses: number;
  };
  registrationTimeline: TimeSeriesDataPoint[];
}

export interface SubscriptionsAnalyticsSummary {
  selectedCurrency: string;
  availableCurrencies: string[];
  activePaidSubscriptions: number;
  trialingSubscriptions: number;
  pastDueSubscriptions: number;
  canceledSubscriptions: number;
  currencyBreakdown: Record<
    string,
    {
      currency: string;
      mrr: number;
      arr: number;
      arpu: number;
      totalInvoiced: number;
      totalCollected: number;
      totalOutstanding: number;
      activeAccounts: number;
    }
  >;
  planDistribution: CategoryBreakdownItem[];
  billingCycleDistribution: CategoryBreakdownItem[];
  receivablesAging: {
    current0to30: number;
    days31to60: number;
    days61to90: number;
    days90Plus: number;
  };
}

export interface ModuleAdoptionItem {
  moduleId: string;
  name: string;
  category: string;
  macroCategory: string;
  iconName: string;
  description: string;
  enabledTenantCount: number;
  eligibleTenantCount: number;
  totalTenantCount: number;
  adoptionRatePercent: number; // enabledTenantCount / eligibleTenantCount * 100
  totalAdoptionRatePercent: number; // enabledTenantCount / totalTenantCount * 100
  planTierBreakdown: Record<PlanTier, number>;
  status: 'standard' | 'high_adoption' | 'underutilized';
}

export interface ModuleAdoptionMetrics {
  totalModulesInRegistry: number;
  averageAdoptionRatePercent: number;
  topAdoptedModules: ModuleAdoptionItem[];
  leastAdoptedModules: ModuleAdoptionItem[];
  modulesByCategory: Record<string, ModuleAdoptionItem[]>;
  allModuleStats: ModuleAdoptionItem[];
}

export interface SupportAnalyticsSummary {
  totalTicketsInPeriod: number;
  currentlyOpenTickets: number;
  resolvedTicketsInPeriod: number;
  unassignedTickets: number;
  overdueTickets: number;
  escalatedTickets: number;
  avgFirstResponseMinutes: number | null; // null if no qualifying tickets
  avgResolutionHours: number | null;      // null if no qualifying tickets
  slaCompliancePercent: number;
  statusBreakdown: CategoryBreakdownItem[];
  priorityBreakdown: CategoryBreakdownItem[];
  categoryBreakdown: CategoryBreakdownItem[];
  csatDistribution: {
    averageRating: number | null;
    totalRatings: number;
    distribution: Record<number, number>; // 1 -> count, 2 -> count, ...
  };
  customerSuccessHealthDistribution: {
    healthy: number;
    neutral: number;
    at_risk: number;
    critical: number;
    totalAccounts: number;
  };
  pendingCsTasksCount: number;
  overdueCsTasksCount: number;
}

export interface OperationsAnalyticsSummary {
  overallHealthStatus: 'healthy' | 'degraded' | 'critical' | 'maintenance';
  totalComponents: number;
  operationalComponents: number;
  degradedComponents: number;
  outageComponents: number;
  maintenanceComponents: number;
  totalIncidentsInPeriod: number;
  activeIncidentsCount: number;
  meanTimeToResolutionMinutes: number | null;
  incidentSeverityDistribution: CategoryBreakdownItem[];
  resourceCapacityAlertsCount: number;
  verifiedBackupsRatio: { verified: number; total: number };
  telemetryFreshnessTimestamp: string;
  isSimulatedTelemetry: boolean;
}

export interface CommunicationsAnalyticsSummary {
  totalNotificationsRecorded: number;
  deliveredCount: number;
  failedCount: number;
  sentCount: number;
  queuedCount: number;
  suppressedCount: number;
  deliverySuccessRatePercent: number; // delivered / (delivered + failed + sent) * 100
  channelDistribution: CategoryBreakdownItem[];
  templateCategoryUsage: CategoryBreakdownItem[];
  recentFailedDispatchesCount: number;
  disclaimer: string;
}

export interface AuditGovernanceSummary {
  totalAuditEventsInPeriod: number;
  eventsByCategory: CategoryBreakdownItem[];
  eventsBySeverity: CategoryBreakdownItem[];
  securityEventsCount: number;
  securityTriageDistribution: CategoryBreakdownItem[];
  complianceControlsCount: { passed: number; reviewNeeded: number; failed: number };
  privilegedAdminActionsCount: number;
  zeroPiiGuaranteed: boolean;
}

// ============================================================================
// 4. REPORTS, EXPORT, AND SAVED CONFIGURATIONS
// ============================================================================

export type ReportCategoryKey =
  | 'executive_summary'
  | 'tenant_lifecycle'
  | 'subscriptions_revenue'
  | 'module_adoption'
  | 'support_sla'
  | 'platform_operations'
  | 'communications_delivery'
  | 'audit_security';

export interface ReportTemplateDescriptor {
  id: ReportCategoryKey;
  name: string;
  category: MetricCategoryKey;
  description: string;
  defaultColumns: string[];
  availableGroupings: string[];
  filterRestrictions?: string[];
}

export interface SavedReportConfig {
  id: string;
  title: string;
  description?: string;
  templateId: ReportCategoryKey;
  filters: AnalyticsGlobalFilters;
  selectedColumns: string[];
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  createdAt: string;
  updatedAt: string;
  isLocalOnly: boolean;
}

export interface TabularReportRow {
  [key: string]: string | number | boolean | null | undefined;
}

export interface GeneratedReportResult {
  title: string;
  templateId: ReportCategoryKey;
  generatedAt: string;
  reportingPeriod: string;
  appliedFilters: Record<string, string>;
  headers: string[];
  rows: TabularReportRow[];
  totalRowCount: number;
  summaryFooters?: Record<string, string | number>;
  isDemoData: boolean;
}
