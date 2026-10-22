/**
 * Phase E-09.18: Platform Analytics, Business Intelligence & Executive Reporting Evaluator
 * Deterministic aggregation engine, date-boundary normalizer, and domain metric calculators.
 *
 * NOTE: All calculations adhere strictly to documented mathematical formulas.
 * Zero student PII is exposed. Multi-currency aggregation is partitioned by currency.
 */

import {
  Organization,
  SubscriptionPlan,
  OrganizationSubscription,
  Invoice,
  PaymentRecord,
  Campus,
} from '@/lib/types';
import {
  SupportTicket,
  SlaPolicy,
  CustomerSatisfactionRecord,
  CustomerSuccessTask,
} from '@/lib/types/support-desk';
import {
  OperationalComponent,
  PlatformIncident,
  ResourceCapacityObservation,
  BackupReadinessRecord,
} from '@/lib/system-health/types';
import {
  NotificationRecord,
  CommunicationTemplate,
} from '@/lib/types/communications';
import { AuditEvent } from '@/lib/types/audit-logs';
import {
  SecurityEvent,
  ComplianceControl,
} from '@/lib/types/compliance';
import { TenantModuleDefinition, OrganizationModuleOverride } from '@/lib/modules/types';
import { MASTER_MODULE_REGISTRY } from '@/lib/modules/registry-data';
import { evaluateModuleEntitlement } from '@/lib/modules/evaluator';

import {
  ReportingDateRange,
  DatePresetKey,
  AnalyticsGlobalFilters,
  ExecutiveKpiSummary,
  TenantGrowthMetrics,
  SubscriptionsAnalyticsSummary,
  ModuleAdoptionMetrics,
  ModuleAdoptionItem,
  SupportAnalyticsSummary,
  OperationsAnalyticsSummary,
  CommunicationsAnalyticsSummary,
  AuditGovernanceSummary,
  TimeSeriesDataPoint,
  CategoryBreakdownItem,
} from '@/lib/types/analytics';

// Canonical reference date representing the platform operational baseline
export const ANALYTICS_REFERENCE_DATE = '2026-10-21T07:30:00.000Z';

// ============================================================================
// 1. DATE RANGE NORMALIZATION & BOUNDARY VALIDATION
// ============================================================================

export function round1(num: number): number {
  return Math.round(num * 10) / 10;
}

export function round2(num: number): number {
  return Math.round(num * 100) / 100;
}

/**
 * Resolves a date preset key into an explicit inclusive UTC boundary.
 */
export function resolveDateRange(
  preset: DatePresetKey,
  customStart?: string,
  customEnd?: string,
  referenceDateIso: string = ANALYTICS_REFERENCE_DATE
): ReportingDateRange {
  const ref = new Date(referenceDateIso);
  const refMs = isNaN(ref.getTime()) ? new Date('2026-10-21T00:00:00.000Z').getTime() : ref.getTime();
  const refDate = new Date(refMs);

  switch (preset) {
    case 'last_7_days': {
      const start = new Date(refMs - 7 * 24 * 60 * 60 * 1000);
      return {
        preset,
        startDate: start.toISOString().split('T')[0],
        endDate: refDate.toISOString().split('T')[0],
        label: 'Last 7 Days',
      };
    }
    case 'last_30_days': {
      const start = new Date(refMs - 30 * 24 * 60 * 60 * 1000);
      return {
        preset,
        startDate: start.toISOString().split('T')[0],
        endDate: refDate.toISOString().split('T')[0],
        label: 'Last 30 Days',
      };
    }
    case 'last_90_days': {
      const start = new Date(refMs - 90 * 24 * 60 * 60 * 1000);
      return {
        preset,
        startDate: start.toISOString().split('T')[0],
        endDate: refDate.toISOString().split('T')[0],
        label: 'Last 90 Days',
      };
    }
    case 'year_to_date': {
      const year = refDate.getUTCFullYear();
      return {
        preset,
        startDate: `${year}-01-01`,
        endDate: refDate.toISOString().split('T')[0],
        label: `Year to Date (${year})`,
      };
    }
    case 'all_time': {
      return {
        preset,
        startDate: '2025-01-01',
        endDate: refDate.toISOString().split('T')[0],
        label: 'All Time (Platform History)',
      };
    }
    case 'custom': {
      const s = customStart || '2026-01-01';
      const e = customEnd || refDate.toISOString().split('T')[0];
      // If start exceeds end, normalize by swapping
      const normalizedStart = s <= e ? s : e;
      const normalizedEnd = s <= e ? e : s;
      return {
        preset: 'custom',
        startDate: normalizedStart,
        endDate: normalizedEnd,
        label: `Custom: ${normalizedStart} to ${normalizedEnd}`,
      };
    }
    default:
      return resolveDateRange('last_30_days', customStart, customEnd, referenceDateIso);
  }
}

/**
 * Validates whether a given ISO date string falls strictly within the inclusive range boundaries.
 * Boundaries are expanded to [startDate 00:00:00.000Z, endDate 23:59:59.999Z].
 */
export function isDateWithinRange(
  dateInput: string | Date | null | undefined,
  range: ReportingDateRange
): boolean {
  if (!dateInput) return false;
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const t = d.getTime();
  if (isNaN(t)) return false;

  // Boundary start: 00:00:00.000 UTC on startDate
  const startBound = new Date(`${range.startDate}T00:00:00.000Z`).getTime();
  // Boundary end: 23:59:59.999 UTC on endDate
  const endBound = new Date(`${range.endDate}T23:59:59.999Z`).getTime();

  return t >= startBound && t <= endBound;
}

/**
 * Creates default initial global filters.
 */
export function getDefaultAnalyticsFilters(): AnalyticsGlobalFilters {
  return {
    dateRange: resolveDateRange('last_30_days'),
    organizationId: 'all',
    planId: 'all',
    status: 'all',
    moduleId: 'all',
    currency: 'USD',
  };
}

// ============================================================================
// 2. TENANT GROWTH & LIFECYCLE AGGREGATOR
// ============================================================================

export function computeTenantGrowthMetrics(
  organizations: Organization[],
  campuses: Campus[],
  filters: AnalyticsGlobalFilters
): TenantGrowthMetrics {
  // Apply primary filters (org, plan, status)
  const scopedOrgs = organizations.filter((o) => {
    if (filters.organizationId !== 'all' && o.id !== filters.organizationId) return false;
    if (filters.planId !== 'all' && o.planId !== filters.planId) return false;
    if (filters.status !== 'all' && o.status !== filters.status) return false;
    return true;
  });

  const totalRegistered = scopedOrgs.length;
  let activeCount = 0;
  let pendingCount = 0;
  let suspendedCount = 0;
  let inactiveCount = 0;
  let archivedCount = 0;

  const onboardingBreakdown = {
    not_started: 0,
    in_progress: 0,
    verification_pending: 0,
    completed: 0,
  };

  const classificationBreakdown: Record<string, number> = {};

  let newRegistrationsInPeriod = 0;

  scopedOrgs.forEach((o) => {
    // Lifecycle status breakdown
    if (o.status === 'active') activeCount++;
    else if (o.status === 'pending') pendingCount++;
    else if (o.status === 'suspended') suspendedCount++;
    else if (o.status === 'inactive') inactiveCount++;
    else if (o.status === 'archived') archivedCount++;

    // Onboarding stage breakdown
    const stage = o.onboardingStatus || 'not_started';
    if (stage in onboardingBreakdown) {
      onboardingBreakdown[stage as keyof typeof onboardingBreakdown]++;
    }

    // Classification
    const cls = o.classification || 'unspecified';
    classificationBreakdown[cls] = (classificationBreakdown[cls] || 0) + 1;

    // Period check for registration date
    if (isDateWithinRange(o.createdAt, filters.dateRange)) {
      newRegistrationsInPeriod++;
    }
  });

  // Campus distribution across scoped organizations
  const orgCampusCounts: Record<string, number> = {};
  campuses.forEach((c) => {
    orgCampusCounts[c.organizationId] = (orgCampusCounts[c.organizationId] || 0) + 1;
  });

  let singleCampusCount = 0;
  let multiCampusCount = 0;
  let totalCampuses = 0;

  scopedOrgs.forEach((o) => {
    const cCount = orgCampusCounts[o.id] || 1; // Minimum 1 for active orgs
    totalCampuses += cCount;
    if (cCount > 1) multiCampusCount++;
    else singleCampusCount++;
  });

  // Monthly registration timeline
  const monthMap: Record<string, number> = {};
  organizations.forEach((o) => {
    if (!o.createdAt) return;
    const key = o.createdAt.slice(0, 7); // e.g. '2025-08'
    monthMap[key] = (monthMap[key] || 0) + 1;
  });

  const sortedMonths = Object.keys(monthMap).sort();
  const registrationTimeline: TimeSeriesDataPoint[] = sortedMonths.map((m) => {
    const [y, mo] = m.split('-');
    const dateObj = new Date(Number(y), Number(mo) - 1, 1);
    const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    return {
      date: m,
      label,
      value: monthMap[m],
    };
  });

  return {
    totalRegistered,
    newRegistrationsInPeriod,
    activeCount,
    pendingCount,
    suspendedCount,
    inactiveCount,
    archivedCount,
    onboardingBreakdown,
    classificationBreakdown,
    campusDistribution: {
      singleCampusCount,
      multiCampusCount,
      totalCampuses,
    },
    registrationTimeline,
  };
}

// ============================================================================
// 3. MONETIZATION & COMMERCIAL REVENUE AGGREGATOR
// ============================================================================

export function computeMonetizationMetrics(
  subscriptions: OrganizationSubscription[] = [],
  plans: SubscriptionPlan[] = [],
  invoices: Invoice[] = [],
  payments: PaymentRecord[] = [],
  filters: AnalyticsGlobalFilters,
  referenceDateIso: string = ANALYTICS_REFERENCE_DATE
): SubscriptionsAnalyticsSummary {
  const safePlans = plans || [];
  const safeSubs = subscriptions || [];
  const safeInvoices = invoices || [];
  const planMap = new Map(safePlans.map((p) => [p.id, p]));

  // Currencies present in plans, invoices, and standard enterprise partitions
  const currencySet = new Set<string>(['USD', 'GBP', 'CAD', 'EUR']);
  safePlans.forEach((p) => {
    if (p.currency) currencySet.add(p.currency);
  });
  safeInvoices.forEach((i) => {
    if (i.currency) currencySet.add(i.currency);
  });

  const availableCurrencies = Array.from(currencySet);
  const selectedCurrency = availableCurrencies.includes(filters.currency)
    ? filters.currency
    : availableCurrencies[0] || 'USD';

  // Apply filters
  const scopedSubs = safeSubs.filter((s) => {
    if (filters.organizationId !== 'all' && s.organizationId !== filters.organizationId) return false;
    if (filters.planId !== 'all' && s.planId !== filters.planId) return false;
    return true;
  });

  let activePaidSubscriptions = 0;
  let trialingSubscriptions = 0;
  let pastDueSubscriptions = 0;
  let canceledSubscriptions = 0;

  const planCounts: Record<string, number> = {};
  const cycleCounts: Record<string, number> = {};

  scopedSubs.forEach((s) => {
    if (s.status === 'active') activePaidSubscriptions++;
    else if (s.status === 'trialing') trialingSubscriptions++;
    else if (s.status === 'past_due') pastDueSubscriptions++;
    else if (s.status === 'canceled') canceledSubscriptions++;

    planCounts[s.planId] = (planCounts[s.planId] || 0) + 1;
    cycleCounts[s.billingCycle] = (cycleCounts[s.billingCycle] || 0) + 1;
  });

  // Calculate MRR / ARR per currency partition
  const currencyBreakdown: SubscriptionsAnalyticsSummary['currencyBreakdown'] = {};

  availableCurrencies.forEach((curr) => {
    let mrr = 0;
    let activeAccounts = 0;

    scopedSubs.forEach((s) => {
      const plan = planMap.get(s.planId);
      if (!plan || plan.currency !== curr) return;
      if (s.status !== 'active' && s.status !== 'past_due') return;

      activeAccounts++;
      if (s.billingCycle === 'annual') {
        mrr += (plan.priceAnnual || plan.priceMonthly * 12) / 12;
      } else {
        mrr += plan.priceMonthly;
      }
    });

    const roundedMrr = round2(mrr);
    const arr = round2(roundedMrr * 12);
    const arpu = activeAccounts > 0 ? round2(roundedMrr / activeAccounts) : 0;

    // Invoice ledger metrics in this currency
    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;

    invoices.forEach((inv) => {
      if (inv.currency !== curr || inv.status === 'void') return;
      if (filters.organizationId !== 'all' && inv.organizationId !== filters.organizationId) return;

      totalInvoiced += inv.amountDue;
      totalCollected += inv.amountPaid || 0;
      const balance = Math.max(0, inv.amountDue - (inv.amountPaid || 0));
      totalOutstanding += balance;
    });

    currencyBreakdown[curr] = {
      currency: curr,
      mrr: roundedMrr,
      arr,
      arpu,
      totalInvoiced: round2(totalInvoiced),
      totalCollected: round2(totalCollected),
      totalOutstanding: round2(totalOutstanding),
      activeAccounts,
    };
  });

  // Receivables Aging in selected currency
  let current0to30 = 0;
  let days31to60 = 0;
  let days61to90 = 0;
  let days90Plus = 0;

  const refMs = new Date(referenceDateIso).getTime();

  invoices.forEach((inv) => {
    if (inv.currency !== selectedCurrency || inv.status === 'void') return;
    if (filters.organizationId !== 'all' && inv.organizationId !== filters.organizationId) return;

    const balance = Math.max(0, inv.amountDue - (inv.amountPaid || 0));
    if (balance <= 0) return;

    const dueMs = new Date(inv.dueDate).getTime();
    const diffDays = Math.floor((refMs - dueMs) / (24 * 60 * 60 * 1000));

    if (diffDays <= 30) current0to30 += balance;
    else if (diffDays <= 60) days31to60 += balance;
    else if (diffDays <= 90) days61to90 += balance;
    else days90Plus += balance;
  });

  const totalSubsCount = scopedSubs.length || 1;
  const planDistribution: CategoryBreakdownItem[] = plans.map((p) => {
    const count = planCounts[p.id] || 0;
    return {
      key: p.id,
      label: p.name,
      count,
      percentage: round1((count / totalSubsCount) * 100),
    };
  });

  const billingCycleDistribution: CategoryBreakdownItem[] = ['monthly', 'annual'].map((cycle) => {
    const count = cycleCounts[cycle] || 0;
    return {
      key: cycle,
      label: cycle.charAt(0).toUpperCase() + cycle.slice(1),
      count,
      percentage: round1((count / totalSubsCount) * 100),
    };
  });

  return {
    selectedCurrency,
    availableCurrencies,
    activePaidSubscriptions,
    trialingSubscriptions,
    pastDueSubscriptions,
    canceledSubscriptions,
    currencyBreakdown,
    planDistribution,
    billingCycleDistribution,
    receivablesAging: {
      current0to30: round2(current0to30),
      days31to60: round2(days31to60),
      days61to90: round2(days61to90),
      days90Plus: round2(days90Plus),
    },
  };
}

// ============================================================================
// 4. MODULE ADOPTION & ENTITLEMENT AGGREGATOR
// ============================================================================

export function computeModuleAdoptionMetrics(
  organizations: Organization[],
  plans: SubscriptionPlan[],
  overrides: OrganizationModuleOverride[] = [],
  moduleRegistry: TenantModuleDefinition[] = MASTER_MODULE_REGISTRY,
  filters: AnalyticsGlobalFilters
): ModuleAdoptionMetrics {
  const scopedOrgs = organizations.filter((o) => {
    if (filters.organizationId !== 'all' && o.id !== filters.organizationId) return false;
    if (filters.planId !== 'all' && o.planId !== filters.planId) return false;
    if (filters.status !== 'all' && o.status !== filters.status) return false;
    return true;
  });

  const totalTenantCount = scopedOrgs.length;
  const activeOrgs = scopedOrgs.filter((o) => o.status === 'active');
  const orgPlanMap = new Map(scopedOrgs.map((o) => [o.id, o.planId]));

  const allModuleStats: ModuleAdoptionItem[] = moduleRegistry.map((mod) => {
    let enabledTenantCount = 0;
    let eligibleTenantCount = 0;
    const planTierBreakdown: Record<string, number> = {
      starter: 0,
      growth: 0,
      enterprise: 0,
      custom: 0,
    };

    scopedOrgs.forEach((org) => {
      const plan = plans.find((p) => p.id === org.planId);
      const isEligibleByPlan = plan?.includedModuleIds ? plan.includedModuleIds.includes(mod.id) : false;

      // Evaluate effective entitlement via engine
      const evalResult = evaluateModuleEntitlement({
        moduleId: mod.id,
        organizationId: org.id,
        planId: org.planId,
        plans,
        organizationOverrides: overrides,
        registry: moduleRegistry,
      });

      const isEntitled = evalResult.effectiveStatus === 'available';

      if (isEligibleByPlan || isEntitled) {
        eligibleTenantCount++;
      }

      if (isEntitled) {
        enabledTenantCount++;
        const tier = plan?.tier || 'starter';
        planTierBreakdown[tier] = (planTierBreakdown[tier] || 0) + 1;
      }
    });

    const adoptionRatePercent =
      eligibleTenantCount > 0 ? round1((enabledTenantCount / eligibleTenantCount) * 100) : 0;
    const totalAdoptionRatePercent =
      totalTenantCount > 0 ? round1((enabledTenantCount / totalTenantCount) * 100) : 0;

    let status: ModuleAdoptionItem['status'] = 'standard';
    if (totalAdoptionRatePercent >= 75) status = 'high_adoption';
    else if (totalAdoptionRatePercent < 30) status = 'underutilized';

    return {
      moduleId: mod.id,
      name: mod.name,
      category: mod.category,
      macroCategory: mod.macroCategory,
      iconName: mod.category,
      description: mod.description,
      enabledTenantCount,
      eligibleTenantCount,
      totalTenantCount,
      adoptionRatePercent,
      totalAdoptionRatePercent,
      planTierBreakdown: planTierBreakdown as ModuleAdoptionItem['planTierBreakdown'],
      status,
    };
  });

  // Calculate average adoption
  const sumAdoption = allModuleStats.reduce((acc, m) => acc + m.totalAdoptionRatePercent, 0);
  const averageAdoptionRatePercent =
    allModuleStats.length > 0 ? round1(sumAdoption / allModuleStats.length) : 0;

  // Top and least adopted modules
  const sorted = [...allModuleStats].sort((a, b) => b.totalAdoptionRatePercent - a.totalAdoptionRatePercent);
  const topAdoptedModules = sorted.slice(0, 6);
  const leastAdoptedModules = [...sorted].reverse().slice(0, 6);

  // Group by macro-category
  const modulesByCategory: Record<string, ModuleAdoptionItem[]> = {};
  allModuleStats.forEach((item) => {
    const cat = item.macroCategory || 'operations';
    if (!modulesByCategory[cat]) modulesByCategory[cat] = [];
    modulesByCategory[cat].push(item);
  });

  return {
    totalModulesInRegistry: moduleRegistry.length,
    averageAdoptionRatePercent,
    topAdoptedModules,
    leastAdoptedModules,
    modulesByCategory,
    allModuleStats,
  };
}

// ============================================================================
// 5. SUPPORT & CUSTOMER SUCCESS AGGREGATOR
// ============================================================================

export function computeSupportSuccessMetrics(
  tickets: SupportTicket[] = [],
  slaPolicies: SlaPolicy[] = [],
  csatRecords: CustomerSatisfactionRecord[] = [],
  csTasks: CustomerSuccessTask[] = [],
  organizations: Organization[] = [],
  filters: AnalyticsGlobalFilters
): SupportAnalyticsSummary {
  const safeTickets = tickets || [];
  const safeSla = slaPolicies || [];
  const safeCsat = csatRecords || [];
  const safeTasks = csTasks || [];
  const safeOrgs = organizations || [];

  const scopedTickets = safeTickets.filter((t) => {
    if (filters.organizationId !== 'all' && t.organizationId !== filters.organizationId) return false;
    return true;
  });

  const totalTicketsInPeriod = scopedTickets.filter((t) =>
    isDateWithinRange(t.createdAt, filters.dateRange)
  ).length;

  let currentlyOpenTickets = 0;
  let resolvedTicketsInPeriod = 0;
  let unassignedTickets = 0;
  let overdueTickets = 0;
  let escalatedTickets = 0;

  const statusCounts: Record<string, number> = {};
  const priorityCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  let responseDurationSum = 0;
  let respondedTicketCount = 0;

  let resolutionDurationSum = 0;
  let resolvedTicketCount = 0;

  let slaWithinTargetCount = 0;
  let slaEvaluatedCount = 0;

  scopedTickets.forEach((t) => {
    const isClosedOrResolved = t.status === 'resolved' || t.status === 'closed';

    if (!isClosedOrResolved) {
      currentlyOpenTickets++;
      if (!t.assignedOperatorId) unassignedTickets++;
    }

    if (t.escalation?.isEscalated || t.status === 'escalated') {
      escalatedTickets++;
    }

    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;

    // SLA tracking
    if (t.slaState !== 'unknown') {
      slaEvaluatedCount++;
      if (t.slaState === 'within_target' || t.slaState === 'approaching_target') {
        slaWithinTargetCount++;
      } else if (t.slaState === 'breached') {
        overdueTickets++;
      }
    }

    // First response time (only if ticket created in range and received response)
    if (isDateWithinRange(t.createdAt, filters.dateRange) && t.firstResponseAt && t.createdAt) {
      const startMs = new Date(t.createdAt).getTime();
      const respMs = new Date(t.firstResponseAt).getTime();
      const diffMins = Math.max(0, (respMs - startMs) / (60 * 1000));
      responseDurationSum += diffMins;
      respondedTicketCount++;
    }

    // Resolution time (only if resolved in range or created in range)
    if (isClosedOrResolved) {
      const resolveTime = t.resolvedAt || t.closedAt;
      if (resolveTime && isDateWithinRange(resolveTime, filters.dateRange)) {
        resolvedTicketsInPeriod++;
        const startMs = new Date(t.createdAt).getTime();
        const finishMs = new Date(resolveTime).getTime();
        const diffHours = Math.max(0, (finishMs - startMs) / (60 * 60 * 1000));
        resolutionDurationSum += diffHours;
        resolvedTicketCount++;
      }
    }
  });

  const avgFirstResponseMinutes =
    respondedTicketCount > 0 ? Math.round(responseDurationSum / respondedTicketCount) : null;
  const avgResolutionHours =
    resolvedTicketCount > 0 ? round1(resolutionDurationSum / resolvedTicketCount) : null;
  const slaCompliancePercent =
    slaEvaluatedCount > 0 ? round1((slaWithinTargetCount / slaEvaluatedCount) * 100) : 100;

  const totalTix = scopedTickets.length || 1;
  const statusBreakdown: CategoryBreakdownItem[] = Object.keys(statusCounts).map((key) => ({
    key,
    label: key.replace(/_/g, ' ').toUpperCase(),
    count: statusCounts[key],
    percentage: round1((statusCounts[key] / totalTix) * 100),
  }));

  const priorityBreakdown: CategoryBreakdownItem[] = Object.keys(priorityCounts).map((key) => ({
    key,
    label: key.toUpperCase(),
    count: priorityCounts[key],
    percentage: round1((priorityCounts[key] / totalTix) * 100),
  }));

  const categoryBreakdown: CategoryBreakdownItem[] = Object.keys(categoryCounts).map((key) => ({
    key,
    label: key.replace(/_/g, ' '),
    count: categoryCounts[key],
    percentage: round1((categoryCounts[key] / totalTix) * 100),
  }));

  // CSAT survey records
  const scopedCsat = csatRecords.filter((r) => {
    if (filters.organizationId !== 'all' && r.organizationId !== filters.organizationId) return false;
    return isDateWithinRange(r.submittedAt, filters.dateRange);
  });

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let ratingSum = 0;
  scopedCsat.forEach((r) => {
    const val = Math.min(5, Math.max(1, Math.round(r.rating)));
    distribution[val] = (distribution[val] || 0) + 1;
    ratingSum += r.rating;
  });

  const averageRating = scopedCsat.length > 0 ? round1(ratingSum / scopedCsat.length) : null;

  // Customer Success Health Model distribution across organizations
  let healthy = 0;
  let neutral = 0;
  let at_risk = 0;
  let critical = 0;

  organizations.forEach((org) => {
    if (filters.organizationId !== 'all' && org.id !== filters.organizationId) return;
    const orgTickets = tickets.filter((t) => t.organizationId === org.id);
    const urgentCount = orgTickets.filter((t) => t.priority === 'urgent' && t.status !== 'resolved').length;
    const overdueCount = orgTickets.filter((t) => t.slaState === 'breached').length;

    if (org.status === 'suspended' || overdueCount >= 2 || urgentCount >= 2) {
      critical++;
    } else if (overdueCount === 1 || urgentCount === 1 || orgTickets.length >= 4) {
      at_risk++;
    } else if (org.status === 'active' && orgTickets.length === 0) {
      healthy++;
    } else {
      neutral++;
    }
  });

  // Follow-up CS Tasks
  const scopedTasks = csTasks.filter((task) => {
    if (filters.organizationId !== 'all' && task.organizationId !== filters.organizationId) return false;
    return true;
  });

  const pendingCsTasksCount = scopedTasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled').length;
  const overdueCsTasksCount = scopedTasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'cancelled' && new Date(t.dueDate).getTime() < new Date(ANALYTICS_REFERENCE_DATE).getTime()
  ).length;

  return {
    totalTicketsInPeriod,
    currentlyOpenTickets,
    resolvedTicketsInPeriod,
    unassignedTickets,
    overdueTickets,
    escalatedTickets,
    avgFirstResponseMinutes,
    avgResolutionHours,
    slaCompliancePercent,
    statusBreakdown,
    priorityBreakdown,
    categoryBreakdown,
    csatDistribution: {
      averageRating,
      totalRatings: scopedCsat.length,
      distribution,
    },
    customerSuccessHealthDistribution: {
      healthy,
      neutral,
      at_risk,
      critical,
      totalAccounts: healthy + neutral + at_risk + critical,
    },
    pendingCsTasksCount,
    overdueCsTasksCount,
  };
}

// ============================================================================
// 6. PLATFORM OPERATIONS AGGREGATOR
// ============================================================================

export function computeOperationsMetrics(
  components: OperationalComponent[] = [],
  incidents: PlatformIncident[] = [],
  observations: ResourceCapacityObservation[] = [],
  backups: BackupReadinessRecord[] = [],
  filters: AnalyticsGlobalFilters
): OperationsAnalyticsSummary {
  const safeComponents = components || [];
  const safeIncidents = incidents || [];
  const safeObservations = observations || [];
  const safeBackups = backups || [];

  const totalComponents = safeComponents.length;
  let operationalComponents = 0;
  let degradedComponents = 0;
  let outageComponents = 0;
  let maintenanceComponents = 0;

  safeComponents.forEach((c) => {
    const s = c.status as string;
    if (s === 'operational' || s === 'healthy') operationalComponents++;
    else if (s === 'degraded') degradedComponents++;
    else if (s === 'outage' || s === 'critical') outageComponents++;
    else if (s === 'maintenance') maintenanceComponents++;
  });

  let overallHealthStatus: OperationsAnalyticsSummary['overallHealthStatus'] = 'healthy';
  if (outageComponents > 0) overallHealthStatus = 'critical';
  else if (degradedComponents > 0) overallHealthStatus = 'degraded';
  else if (maintenanceComponents > 0) overallHealthStatus = 'maintenance';

  // Incidents in range
  const scopedIncidents = safeIncidents.filter((inc) =>
    isDateWithinRange(inc.detectedAt, filters.dateRange)
  );

  const activeIncidentsCount = scopedIncidents.filter((inc) => inc.status !== 'resolved').length;

  // MTTR
  let totalResolutionMinutes = 0;
  let resolvedCount = 0;
  const severityCounts: Record<string, number> = {};

  scopedIncidents.forEach((inc) => {
    severityCounts[inc.severity] = (severityCounts[inc.severity] || 0) + 1;
    if (inc.status === 'resolved') {
      if (inc.resolvedAt && inc.detectedAt) {
        const diffMs = new Date(inc.resolvedAt).getTime() - new Date(inc.detectedAt).getTime();
        totalResolutionMinutes += Math.max(0, diffMs / (60 * 1000));
        resolvedCount++;
      }
    }
  });

  const meanTimeToResolutionMinutes =
    resolvedCount > 0 ? Math.round(totalResolutionMinutes / resolvedCount) : null;

  const totalIncCount = scopedIncidents.length || 1;
  const incidentSeverityDistribution: CategoryBreakdownItem[] = Object.keys(severityCounts).map((sev) => ({
    key: sev,
    label: sev.toUpperCase(),
    count: severityCounts[sev],
    percentage: round1((severityCounts[sev] / totalIncCount) * 100),
  }));

  // Resource capacity warnings
  const resourceCapacityAlertsCount = safeObservations.filter(
    (obs) => obs.utilizationPercentage !== null && obs.utilizationPercentage >= (obs.warningThreshold || 85)
  ).length;

  // Backups
  const verifiedBackups = safeBackups.filter(
    (b) => b.readinessState === 'verified' || b.verificationStatus === 'verified_checksum'
  ).length;

  return {
    overallHealthStatus,
    totalComponents,
    operationalComponents,
    degradedComponents,
    outageComponents,
    maintenanceComponents,
    totalIncidentsInPeriod: scopedIncidents.length,
    activeIncidentsCount,
    meanTimeToResolutionMinutes,
    incidentSeverityDistribution,
    resourceCapacityAlertsCount,
    verifiedBackupsRatio: { verified: verifiedBackups, total: safeBackups.length },
    telemetryFreshnessTimestamp: ANALYTICS_REFERENCE_DATE,
    isSimulatedTelemetry: true,
  };
}

// ============================================================================
// 7. COMMUNICATIONS AGGREGATOR
// ============================================================================

export function computeCommunicationsMetrics(
  notifications: NotificationRecord[] = [],
  _templates: CommunicationTemplate[] = [],
  filters: AnalyticsGlobalFilters
): CommunicationsAnalyticsSummary {
  const safeNotifs = notifications || [];
  const scopedNotifs = safeNotifs.filter((n) => {
    const orgId = n.tenantId;
    if (filters.organizationId !== 'all' && orgId !== filters.organizationId) return false;
    return isDateWithinRange(n.createdAt, filters.dateRange);
  });

  let deliveredCount = 0;
  let failedCount = 0;
  let sentCount = 0;
  let queuedCount = 0;
  let suppressedCount = 0;

  const channelCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  scopedNotifs.forEach((n) => {
    if (n.status === 'delivered') deliveredCount++;
    else if (n.status === 'failed') failedCount++;
    else if (n.status === 'sent') sentCount++;
    else if (n.status === 'queued') queuedCount++;
    else if (n.status === 'suppressed') suppressedCount++;

    channelCounts[n.channel] = (channelCounts[n.channel] || 0) + 1;
    const cat = n.category || 'general';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const attemptedDispatches = deliveredCount + failedCount + sentCount;
  const deliverySuccessRatePercent =
    attemptedDispatches > 0 ? round1((deliveredCount / attemptedDispatches) * 100) : 100;

  const total = scopedNotifs.length || 1;
  const channelDistribution: CategoryBreakdownItem[] = Object.keys(channelCounts).map((ch) => ({
    key: ch,
    label: ch.toUpperCase(),
    count: channelCounts[ch],
    percentage: round1((channelCounts[ch] / total) * 100),
  }));

  const templateCategoryUsage: CategoryBreakdownItem[] = Object.keys(categoryCounts).map((cat) => ({
    key: cat,
    label: cat.replace(/_/g, ' '),
    count: categoryCounts[cat],
    percentage: round1((categoryCounts[cat] / total) * 100),
  }));

  return {
    totalNotificationsRecorded: scopedNotifs.length,
    deliveredCount,
    failedCount,
    sentCount,
    queuedCount,
    suppressedCount,
    deliverySuccessRatePercent,
    channelDistribution,
    templateCategoryUsage,
    recentFailedDispatchesCount: failedCount,
    disclaimer: 'Queued records are pending dispatch simulation; suppressed alerts match quiet-hours rules.',
  };
}

// ============================================================================
// 8. AUDIT & GOVERNANCE AGGREGATOR
// ============================================================================

export function computeAuditGovernanceMetrics(
  auditEvents: AuditEvent[],
  securityEvents: SecurityEvent[],
  complianceControls: ComplianceControl[],
  filters: AnalyticsGlobalFilters
): AuditGovernanceSummary {
  const scopedAudits = auditEvents.filter((ev) => {
    if (filters.organizationId !== 'all' && ev.targetId !== filters.organizationId) return false;
    return isDateWithinRange(ev.timestamp, filters.dateRange);
  });

  const categoryCounts: Record<string, number> = {};
  const severityCounts: Record<string, number> = {};
  let privilegedAdminActionsCount = 0;

  scopedAudits.forEach((ev) => {
    categoryCounts[ev.category] = (categoryCounts[ev.category] || 0) + 1;
    severityCounts[ev.severity] = (severityCounts[ev.severity] || 0) + 1;

    if (
      ev.severity === 'critical' ||
      ev.severity === 'warning' ||
      ev.action.includes('DELETE') ||
      ev.action.includes('SUSPEND') ||
      ev.action.includes('ROLE_MUTATED')
    ) {
      privilegedAdminActionsCount++;
    }
  });

  const total = scopedAudits.length || 1;
  const eventsByCategory: CategoryBreakdownItem[] = Object.keys(categoryCounts).map((cat) => ({
    key: cat,
    label: cat.replace(/_/g, ' '),
    count: categoryCounts[cat],
    percentage: round1((categoryCounts[cat] / total) * 100),
  }));

  const eventsBySeverity: CategoryBreakdownItem[] = ['info', 'warning', 'critical'].map((sev) => ({
    key: sev,
    label: sev.toUpperCase(),
    count: severityCounts[sev] || 0,
    percentage: round1(((severityCounts[sev] || 0) / total) * 100),
    statusBadgeVariant: sev === 'critical' ? 'error' : sev === 'warning' ? 'warning' : 'neutral',
  }));

  // Security Events triage breakdown
  const triageCounts: Record<string, number> = {};
  securityEvents.forEach((se) => {
    const st = se.triageStatus || 'under_review';
    triageCounts[st] = (triageCounts[st] || 0) + 1;
  });

  const totalSec = securityEvents.length || 1;
  const securityTriageDistribution: CategoryBreakdownItem[] = Object.keys(triageCounts).map((st) => ({
    key: st,
    label: st.replace(/_/g, ' '),
    count: triageCounts[st],
    percentage: round1((triageCounts[st] / totalSec) * 100),
  }));

  // Compliance controls count
  let passed = 0;
  let reviewNeeded = 0;
  let failed = 0;

  complianceControls.forEach((c) => {
    if (c.implementationStatus === 'implemented_verified' || c.evidenceStatus === 'verified') passed++;
    else if (c.implementationStatus === 'partially_implemented' || c.evidenceStatus === 'partial') reviewNeeded++;
    else failed++;
  });

  return {
    totalAuditEventsInPeriod: scopedAudits.length,
    eventsByCategory,
    eventsBySeverity,
    securityEventsCount: securityEvents.length,
    securityTriageDistribution,
    complianceControlsCount: { passed, reviewNeeded, failed },
    privilegedAdminActionsCount,
    zeroPiiGuaranteed: true,
  };
}

// ============================================================================
// 9. EXECUTIVE KPI COMPREHENSIVE SUMMARY
// ============================================================================

export function computeExecutiveSummary(
  organizations: Organization[],
  subscriptions: OrganizationSubscription[],
  plans: SubscriptionPlan[],
  tickets: SupportTicket[],
  components: OperationalComponent[],
  notifications: NotificationRecord[],
  auditEvents: AuditEvent[],
  securityEvents: SecurityEvent[],
  filters: AnalyticsGlobalFilters
): ExecutiveKpiSummary {
  const growth = computeTenantGrowthMetrics(organizations, [], filters);
  const monetization = computeMonetizationMetrics(subscriptions, plans, [], [], filters);
  const support = computeSupportSuccessMetrics(tickets, [], [], [], organizations, filters);
  const operations = computeOperationsMetrics(components, [], [], [], filters);
  const communications = computeCommunicationsMetrics(notifications, [], filters);
  const governance = computeAuditGovernanceMetrics(auditEvents, securityEvents, [], filters);

  const usdMetrics = monetization.currencyBreakdown['USD'] || { mrr: 0, arr: 0 };
  const modules = computeModuleAdoptionMetrics(organizations, plans, [], MASTER_MODULE_REGISTRY, filters);

  return {
    totalOrganizations: growth.totalRegistered,
    activeOrganizations: growth.activeCount,
    newOrganizationsInPeriod: growth.newRegistrationsInPeriod,
    suspendedOrganizations: growth.suspendedCount,
    pendingOrganizations: growth.pendingCount,
    estimatedMrrUsd: usdMetrics.mrr,
    estimatedArrUsd: usdMetrics.arr,
    primaryCurrency: 'USD',
    totalActiveSubscriptions: monetization.activePaidSubscriptions,
    platformModuleAdoptionRate: modules.averageAdoptionRatePercent,
    openSupportTicketsCount: support.currentlyOpenTickets,
    urgentTicketsCount: support.priorityBreakdown.find((p) => p.key === 'urgent')?.count || 0,
    slaComplianceRate: support.slaCompliancePercent,
    systemOperationalRatio:
      operations.totalComponents > 0
        ? round1((operations.operationalComponents / operations.totalComponents) * 100)
        : 100,
    notificationDeliveryRate: communications.deliverySuccessRatePercent,
    recentAuditEventsCount: governance.totalAuditEventsInPeriod,
    securityIncidentsUnderReview: securityEvents.filter((s) => s.triageStatus === 'under_review').length,
    staleOrDemoSourcesCount: 8, // Documented demo fixture indicators
  };
}
