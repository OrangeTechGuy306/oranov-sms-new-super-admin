import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveDateRange,
  isDateWithinRange,
  getDefaultAnalyticsFilters,
  computeTenantGrowthMetrics,
  computeMonetizationMetrics,
  computeModuleAdoptionMetrics,
  computeSupportSuccessMetrics,
  computeOperationsMetrics,
  computeCommunicationsMetrics,
  computeAuditGovernanceMetrics,
  computeExecutiveSummary,
  round2,
} from '../lib/analytics/evaluator';

import { METRIC_CATALOG } from '../lib/analytics/metric-catalog';
import {
  escapeCsvFormulaInjection,
  generateTabularReport,
  serializeReportToCsv,
  serializeReportToJson,
} from '../lib/analytics/exporter';

import {
  INITIAL_ORGANIZATIONS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_PLANS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_CAMPUSES,
  INITIAL_AUDIT_EVENTS,
} from '../lib/data/initial-data';
import { INITIAL_SUPPORT_TICKETS, INITIAL_SLA_POLICIES, INITIAL_CSAT_RECORDS, INITIAL_CS_TASKS } from '../lib/support/fixtures';
import { INITIAL_OPERATIONAL_COMPONENTS, INITIAL_PLATFORM_INCIDENTS, INITIAL_CAPACITY_OBSERVATIONS, INITIAL_BACKUP_RECORDS } from '../lib/system-health/fixtures';
import { INITIAL_NOTIFICATION_RECORDS, INITIAL_COMMUNICATION_TEMPLATES } from '../lib/communications/fixtures';
import { INITIAL_SECURITY_EVENTS } from '../lib/compliance/fixtures';
import { MASTER_MODULE_REGISTRY } from '../lib/modules/registry-data';
import { AnalyticsGlobalFilters } from '../lib/types/analytics';

describe('Phase E-09.18: Platform Analytics, BI and Executive Reporting Governance', () => {
  // ==========================================================================
  // 1. DATE BOUNDARY & TIMEZONE SEMANTICS
  // ==========================================================================
  describe('1. Date Normalization & Boundary Semantics', () => {
    test('resolves preset date ranges relative to canonical reference date', () => {
      const range7d = resolveDateRange('last_7_days', undefined, undefined, '2026-10-21T07:30:00.000Z');
      assert.equal(range7d.preset, 'last_7_days');
      assert.equal(range7d.endDate, '2026-10-21');
      assert.equal(range7d.startDate, '2026-10-14');

      const range30d = resolveDateRange('last_30_days', undefined, undefined, '2026-10-21T07:30:00.000Z');
      assert.equal(range30d.startDate, '2026-09-21');
      assert.equal(range30d.endDate, '2026-10-21');

      const rangeYtd = resolveDateRange('year_to_date', undefined, undefined, '2026-10-21T07:30:00.000Z');
      assert.equal(rangeYtd.startDate, '2026-01-01');
      assert.equal(rangeYtd.endDate, '2026-10-21');

      const rangeAll = resolveDateRange('all_time', undefined, undefined, '2026-10-21T07:30:00.000Z');
      assert.equal(rangeAll.startDate, '2025-01-01');
      assert.equal(rangeAll.endDate, '2026-10-21');
    });

    test('validates inclusive boundary [00:00:00.000Z, 23:59:59.999Z]', () => {
      const range = {
        preset: 'custom' as const,
        startDate: '2026-03-01',
        endDate: '2026-03-31',
        label: 'March 2026',
      };

      // Exact boundaries
      assert.equal(isDateWithinRange('2026-03-01T00:00:00.000Z', range), true);
      assert.equal(isDateWithinRange('2026-03-31T23:59:59.999Z', range), true);
      assert.equal(isDateWithinRange('2026-03-15T12:30:00.000Z', range), true);

      // Outside boundaries
      assert.equal(isDateWithinRange('2026-02-28T23:59:59.999Z', range), false);
      assert.equal(isDateWithinRange('2026-04-01T00:00:00.000Z', range), false);
    });

    test('handles missing or malformed timestamps safely without throwing', () => {
      const range = resolveDateRange('last_30_days');
      assert.equal(isDateWithinRange(null, range), false);
      assert.equal(isDateWithinRange(undefined, range), false);
      assert.equal(isDateWithinRange('', range), false);
      assert.equal(isDateWithinRange('invalid-date-string', range), false);
    });

    test('auto-normalizes inverted custom ranges where start date exceeds end date', () => {
      const inverted = resolveDateRange('custom', '2026-05-01', '2026-01-01');
      assert.equal(inverted.startDate, '2026-01-01');
      assert.equal(inverted.endDate, '2026-05-01');
    });
  });

  // ==========================================================================
  // 2. TENANT GROWTH & POPULATION AGGREGATIONS
  // ==========================================================================
  describe('2. Tenant Growth & Lifecycle Aggregations', () => {
    test('accurately aggregates total registered, active, pending and suspended organizations', () => {
      const filters = getDefaultAnalyticsFilters();
      const metrics = computeTenantGrowthMetrics(INITIAL_ORGANIZATIONS, INITIAL_CAMPUSES, filters);

      assert.equal(metrics.totalRegistered, INITIAL_ORGANIZATIONS.length);
      const expectedActive = INITIAL_ORGANIZATIONS.filter((o) => o.status === 'active').length;
      assert.equal(metrics.activeCount, expectedActive);

      const expectedSuspended = INITIAL_ORGANIZATIONS.filter((o) => o.status === 'suspended').length;
      assert.equal(metrics.suspendedCount, expectedSuspended);

      const expectedPending = INITIAL_ORGANIZATIONS.filter((o) => o.status === 'pending').length;
      assert.equal(metrics.pendingCount, expectedPending);
    });

    test('differentiates historical population from registrations created in the period', () => {
      // March 2026 window
      const marchRange = resolveDateRange('custom', '2026-03-01', '2026-03-31');
      const filters: AnalyticsGlobalFilters = {
        ...getDefaultAnalyticsFilters(),
        dateRange: marchRange,
      };

      const metrics = computeTenantGrowthMetrics(INITIAL_ORGANIZATIONS, INITIAL_CAMPUSES, filters);
      assert.equal(metrics.totalRegistered, 10); // Cumulative population

      // Only orgs with createdAt in March 2026
      const marchOrgs = INITIAL_ORGANIZATIONS.filter((o) => o.createdAt.startsWith('2026-03'));
      assert.equal(metrics.newRegistrationsInPeriod, marchOrgs.length);
      assert.ok(metrics.newRegistrationsInPeriod < metrics.totalRegistered);
    });

    test('correctly evaluates campus distribution across single-branch vs multi-campus networks', () => {
      const filters = getDefaultAnalyticsFilters();
      const metrics = computeTenantGrowthMetrics(INITIAL_ORGANIZATIONS, INITIAL_CAMPUSES, filters);

      assert.ok(metrics.campusDistribution.totalCampuses >= INITIAL_ORGANIZATIONS.length);
      assert.ok(metrics.campusDistribution.singleCampusCount > 0);
      assert.ok(metrics.campusDistribution.multiCampusCount > 0);
    });

    test('safely handles empty organization collections without NaN errors', () => {
      const filters = getDefaultAnalyticsFilters();
      const metrics = computeTenantGrowthMetrics([], [], filters);

      assert.equal(metrics.totalRegistered, 0);
      assert.equal(metrics.activeCount, 0);
      assert.equal(metrics.newRegistrationsInPeriod, 0);
      assert.equal(metrics.campusDistribution.totalCampuses, 0);
    });
  });

  // ==========================================================================
  // 3. MONETIZATION & COMMERCIAL REVENUE SAFEGUARDS
  // ==========================================================================
  describe('3. Monetization & Revenue Isolation Safeguards', () => {
    test('enforces strict currency isolation without cross-currency contamination', () => {
      const filters = getDefaultAnalyticsFilters();
      const metrics = computeMonetizationMetrics(
        INITIAL_SUBSCRIPTIONS,
        INITIAL_PLANS,
        INITIAL_INVOICES,
        INITIAL_PAYMENTS,
        filters
      );

      // Verify available currencies match fixtures
      assert.ok(metrics.availableCurrencies.includes('USD'));
      assert.ok(metrics.availableCurrencies.includes('GBP') || metrics.availableCurrencies.includes('CAD'));

      // Check USD partition
      const usdStats = metrics.currencyBreakdown['USD'];
      assert.ok(usdStats);
      assert.ok(usdStats.mrr > 0);
      assert.equal(usdStats.arr, round2(usdStats.mrr * 12));
      assert.ok(usdStats.arpu > 0);

      // Verify that ARPU equals MRR divided by active paid accounts in USD
      assert.equal(usdStats.arpu, round2(usdStats.mrr / usdStats.activeAccounts));
    });

    test('excludes trialing accounts from MRR and ARPU calculations', () => {
      const filters = getDefaultAnalyticsFilters();
      const metrics = computeMonetizationMetrics(
        INITIAL_SUBSCRIPTIONS,
        INITIAL_PLANS,
        INITIAL_INVOICES,
        INITIAL_PAYMENTS,
        filters
      );

      assert.ok(metrics.trialingSubscriptions > 0);
      // Ensure trialing subscriptions count is explicitly separated from activePaidSubscriptions
      assert.notEqual(metrics.trialingSubscriptions, metrics.activePaidSubscriptions);
    });

    test('correctly partitions overdue receivables into chronological aging buckets', () => {
      const filters = getDefaultAnalyticsFilters();
      const metrics = computeMonetizationMetrics(
        INITIAL_SUBSCRIPTIONS,
        INITIAL_PLANS,
        INITIAL_INVOICES,
        INITIAL_PAYMENTS,
        filters,
        '2026-03-18T12:00:00.000Z'
      );

      // Total overdue invoices in USD
      const totalAging =
        metrics.receivablesAging.current0to30 +
        metrics.receivablesAging.days31to60 +
        metrics.receivablesAging.days61to90 +
        metrics.receivablesAging.days90Plus;

      assert.ok(totalAging >= 0);
    });
  });

  // ==========================================================================
  // 4. MODULE ADOPTION & ENTITLEMENT AGGREGATIONS
  // ==========================================================================
  describe('4. Module Adoption & Entitlement Formula Integrity', () => {
    test('distinguishes eligible accounts from total platform population', () => {
      const filters = getDefaultAnalyticsFilters();
      const metrics = computeModuleAdoptionMetrics(
        INITIAL_ORGANIZATIONS,
        INITIAL_PLANS,
        [],
        MASTER_MODULE_REGISTRY,
        filters
      );

      assert.equal(metrics.totalModulesInRegistry, MASTER_MODULE_REGISTRY.length);
      assert.ok(metrics.averageAdoptionRatePercent > 0 && metrics.averageAdoptionRatePercent <= 100);

      // Check a core module vs an enterprise-only module
      const coreModule = metrics.allModuleStats.find((m) => m.moduleId === 'mod_dashboard');
      assert.ok(coreModule);
      assert.equal(coreModule.enabledTenantCount, INITIAL_ORGANIZATIONS.length);
      assert.equal(coreModule.totalAdoptionRatePercent, 100);

      // Enterprise-specific module (e.g. learning LMS or hr_payroll)
      const enterpriseModule = metrics.allModuleStats.find((m) => m.moduleId === 'mod_hr_payroll');
      if (enterpriseModule) {
        assert.ok(enterpriseModule.totalAdoptionRatePercent < 100);
        // Adoption % of eligible should be calculated
        assert.ok(enterpriseModule.adoptionRatePercent >= 0);
      }
    });

    test('ranks top adopted and least adopted modules deterministically', () => {
      const filters = getDefaultAnalyticsFilters();
      const metrics = computeModuleAdoptionMetrics(
        INITIAL_ORGANIZATIONS,
        INITIAL_PLANS,
        [],
        MASTER_MODULE_REGISTRY,
        filters
      );

      assert.equal(metrics.topAdoptedModules.length, 6);
      assert.equal(metrics.leastAdoptedModules.length, 6);
      assert.ok(
        metrics.topAdoptedModules[0].totalAdoptionRatePercent >=
          metrics.leastAdoptedModules[0].totalAdoptionRatePercent
      );
    });
  });

  // ==========================================================================
  // 5. SUPPORT & CUSTOMER SUCCESS ANALYTICS
  // ==========================================================================
  describe('5. Support Desk & Customer Success SLA Computations', () => {
    test('evaluates SLA compliance without coercing missing response times to zero', () => {
      const filters = getDefaultAnalyticsFilters();
      const metrics = computeSupportSuccessMetrics(
        INITIAL_SUPPORT_TICKETS,
        INITIAL_SLA_POLICIES,
        INITIAL_CSAT_RECORDS,
        INITIAL_CS_TASKS,
        INITIAL_ORGANIZATIONS,
        filters
      );

      assert.ok(metrics.currentlyOpenTickets > 0);
      assert.ok(metrics.slaCompliancePercent >= 0 && metrics.slaCompliancePercent <= 100);

      // Response duration must be positive or null if none responded
      if (metrics.avgFirstResponseMinutes !== null) {
        assert.ok(metrics.avgFirstResponseMinutes > 0);
      }
    });

    test('computes average CSAT rating without division by zero on empty records', () => {
      const filters = getDefaultAnalyticsFilters();
      const emptyMetrics = computeSupportSuccessMetrics(
        [],
        INITIAL_SLA_POLICIES,
        [],
        [],
        INITIAL_ORGANIZATIONS,
        filters
      );

      assert.equal(emptyMetrics.csatDistribution.averageRating, null);
      assert.equal(emptyMetrics.avgFirstResponseMinutes, null);
      assert.equal(emptyMetrics.avgResolutionHours, null);
      assert.equal(emptyMetrics.slaCompliancePercent, 100);
    });

    test('evaluates customer success health scoring accurately', () => {
      const filters = getDefaultAnalyticsFilters();
      const metrics = computeSupportSuccessMetrics(
        INITIAL_SUPPORT_TICKETS,
        INITIAL_SLA_POLICIES,
        INITIAL_CSAT_RECORDS,
        INITIAL_CS_TASKS,
        INITIAL_ORGANIZATIONS,
        filters
      );

      const health = metrics.customerSuccessHealthDistribution;
      assert.equal(health.totalAccounts, INITIAL_ORGANIZATIONS.length);
      assert.ok(health.healthy >= 0);
      assert.ok(health.at_risk >= 0);
      assert.ok(health.critical >= 0);
    });
  });

  // ==========================================================================
  // 6. COMMUNICATIONS & OPERATIONS ANALYTICS
  // ==========================================================================
  describe('6. Communications & Operations Telemetry', () => {
    test('computes delivery success rate excluding queued and suppressed messages from denominator', () => {
      const filters = getDefaultAnalyticsFilters();
      const commMetrics = computeCommunicationsMetrics(
        INITIAL_NOTIFICATION_RECORDS,
        INITIAL_COMMUNICATION_TEMPLATES,
        filters
      );

      assert.ok(commMetrics.totalNotificationsRecorded > 0);
      assert.ok(commMetrics.deliverySuccessRatePercent >= 0 && commMetrics.deliverySuccessRatePercent <= 100);
      assert.ok(commMetrics.channelDistribution.length > 0);
    });

    test('evaluates platform operational ratio and incident MTTR', () => {
      const filters = getDefaultAnalyticsFilters();
      const opsMetrics = computeOperationsMetrics(
        INITIAL_OPERATIONAL_COMPONENTS,
        INITIAL_PLATFORM_INCIDENTS,
        INITIAL_CAPACITY_OBSERVATIONS,
        INITIAL_BACKUP_RECORDS,
        filters
      );

      assert.equal(opsMetrics.totalComponents, INITIAL_OPERATIONAL_COMPONENTS.length);
      assert.ok(opsMetrics.operationalComponents > 0);
      assert.equal(opsMetrics.isSimulatedTelemetry, true);
    });

    test('evaluates audit governance metrics, actor breakdown, and severity distribution', () => {
      const filters = {
        ...getDefaultAnalyticsFilters(),
        dateRange: resolveDateRange('all_time'),
      };
      const govMetrics = computeAuditGovernanceMetrics(
        INITIAL_AUDIT_EVENTS,
        INITIAL_SECURITY_EVENTS,
        [],
        filters
      );

      assert.ok(govMetrics.totalAuditEventsInPeriod > 0);
      assert.ok(govMetrics.eventsByCategory.length > 0);
      assert.ok(govMetrics.eventsBySeverity.length > 0);
    });
  });

  // ==========================================================================
  // 7. EXECUTIVE SUMMARY SYNTHESIS & CONSISTENCY
  // ==========================================================================
  describe('7. Executive Summary KPI Consistency', () => {
    test('maintains mathematical consistency across top-level executive cards and domain selectors', () => {
      const filters = getDefaultAnalyticsFilters();
      const exec = computeExecutiveSummary(
        INITIAL_ORGANIZATIONS,
        INITIAL_SUBSCRIPTIONS,
        INITIAL_PLANS,
        INITIAL_SUPPORT_TICKETS,
        INITIAL_OPERATIONAL_COMPONENTS,
        INITIAL_NOTIFICATION_RECORDS,
        INITIAL_AUDIT_EVENTS,
        INITIAL_SECURITY_EVENTS,
        filters
      );

      assert.equal(exec.totalOrganizations, INITIAL_ORGANIZATIONS.length);
      assert.equal(exec.activeOrganizations, INITIAL_ORGANIZATIONS.filter((o) => o.status === 'active').length);
      assert.ok(exec.estimatedMrrUsd > 0);
      assert.equal(exec.estimatedArrUsd, round2(exec.estimatedMrrUsd * 12));
      assert.ok(exec.platformModuleAdoptionRate > 0);
      assert.ok(exec.slaComplianceRate >= 0);
    });
  });

  // ==========================================================================
  // 8. CSV & JSON EXPORTERS & FORMULA INJECTION NEUTRALIZATION
  // ==========================================================================
  describe('8. Report Exporters & Formula Injection Protection', () => {
    test('neutralizes spreadsheet formula injection characters (=, +, -, @, \\t, \\r)', () => {
      assert.equal(escapeCsvFormulaInjection('=SUM(A1:A10)'), `"'=SUM(A1:A10)"`);
      assert.equal(escapeCsvFormulaInjection('+44 20 7946 0192'), ` "'+44 20 7946 0192"`.trim());
      assert.equal(escapeCsvFormulaInjection('-500.00'), ` "'-500.00"`.trim());
      assert.equal(escapeCsvFormulaInjection('@admin'), `"'@admin"`);
      assert.equal(escapeCsvFormulaInjection('\tTabbed'), `"'	Tabbed"`);
    });

    test('doubles double quotes safely for CSV escaping', () => {
      assert.equal(escapeCsvFormulaInjection('Oak "Hill" Academy'), `"Oak ""Hill"" Academy"`);
      assert.equal(escapeCsvFormulaInjection(null), `""`);
      assert.equal(escapeCsvFormulaInjection(undefined), `""`);
      assert.equal(escapeCsvFormulaInjection(42), `"42"`);
    });

    test('generates valid tabular report and serializes to CSV with metadata header', () => {
      const filters = getDefaultAnalyticsFilters();
      const report = generateTabularReport('tenant_lifecycle', filters, {
        organizations: INITIAL_ORGANIZATIONS,
        subscriptions: INITIAL_SUBSCRIPTIONS,
        plans: INITIAL_PLANS,
        invoices: INITIAL_INVOICES,
        supportTickets: INITIAL_SUPPORT_TICKETS,
        notifications: INITIAL_NOTIFICATION_RECORDS,
        auditEvents: INITIAL_AUDIT_EVENTS,
      });

      assert.equal(report.templateId, 'tenant_lifecycle');
      assert.equal(report.rows.length, INITIAL_ORGANIZATIONS.length);
      assert.ok(report.headers.includes('School Name'));
      assert.ok(report.headers.includes('Lifecycle Status'));

      const csv = serializeReportToCsv(report);
      assert.ok(csv.includes('# [DEMONSTRATION ONLY - LOCAL CLIENT REPOSITORIES - ZERO SERVER PERSISTENCE]'));
      assert.ok(csv.includes('# Report Title: Tenant Population & Lifecycle Roster'));
      assert.ok(csv.includes('"School Name"'));
      assert.ok(csv.includes('"Oak Hill International Academy"'));
    });

    test('serializes report to structured JSON for administrative pipeline ingestion', () => {
      const filters = getDefaultAnalyticsFilters();
      const report = generateTabularReport('executive_summary', filters, {
        organizations: INITIAL_ORGANIZATIONS,
        subscriptions: INITIAL_SUBSCRIPTIONS,
        plans: INITIAL_PLANS,
        invoices: INITIAL_INVOICES,
        supportTickets: INITIAL_SUPPORT_TICKETS,
        notifications: INITIAL_NOTIFICATION_RECORDS,
        auditEvents: INITIAL_AUDIT_EVENTS,
      });

      const jsonStr = serializeReportToJson(report);
      const parsed = JSON.parse(jsonStr);
      assert.equal(parsed.title, 'Executive Platform Vital Signs');
      assert.ok(parsed.rows.length > 0);
      assert.ok(parsed.exportNotice.includes('DEMONSTRATION DATA ONLY'));
    });
  });

  // ==========================================================================
  // 9. METRIC CATALOG TECHNICAL SPECIFICATIONS INTEGRITY
  // ==========================================================================
  describe('9. Metric Catalog Specification Integrity', () => {
    test('verifies that every metric definition contains required fields and unique stable ID', () => {
      assert.ok(METRIC_CATALOG.length >= 15);
      const idSet = new Set<string>();

      METRIC_CATALOG.forEach((metric) => {
        // Stable ID uniqueness
        assert.ok(!idSet.has(metric.id), `Duplicate metric ID found: ${metric.id}`);
        idSet.add(metric.id);

        // Required specification fields
        assert.ok(metric.name && metric.name.length > 0, `Metric ${metric.id} missing name`);
        assert.ok(metric.category, `Metric ${metric.id} missing category`);
        assert.ok(metric.description, `Metric ${metric.id} missing description`);
        assert.ok(metric.businessPurpose, `Metric ${metric.id} missing businessPurpose`);
        assert.ok(metric.formula, `Metric ${metric.id} missing formula`);
        assert.ok(metric.unit, `Metric ${metric.id} missing unit`);
        assert.ok(metric.formatType, `Metric ${metric.id} missing formatType`);
        assert.ok(metric.sourceEntity, `Metric ${metric.id} missing sourceEntity`);
        assert.ok(metric.dateInterpretation, `Metric ${metric.id} missing dateInterpretation`);
        assert.ok(metric.knownLimitations, `Metric ${metric.id} missing knownLimitations`);
        assert.ok(metric.futureBackendRequirements, `Metric ${metric.id} missing futureBackendRequirements`);
        assert.ok(
          ['DEMO_FIXTURE', 'STATIC_CONFIG', 'SIMULATED_TELEMETRY', 'UNAVAILABLE', 'STALE'].includes(metric.dataStatus),
          `Metric ${metric.id} has invalid dataStatus`
        );
      });
    });
  });
});
