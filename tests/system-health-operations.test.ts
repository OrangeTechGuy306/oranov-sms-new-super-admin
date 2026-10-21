import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { platformStore } from '../lib/data/platform-store';
import {
  computeHealthSummary,
  filterComponents,
  filterMetricObservations,
  aggregateMetricSeries,
  exportMetricsToCsv,
  validateIncidentTransition,
  calculateIncidentMttr,
  validateMaintenanceWindow,
  detectOverlappingMaintenance,
  validateAlertRule,
  evaluateTenantOperationalReadiness,
} from '../lib/system-health/evaluator';
import {
  INITIAL_OPERATIONAL_COMPONENTS,
  INITIAL_METRIC_DEFINITIONS,
  INITIAL_METRIC_OBSERVATIONS,
  INITIAL_PLATFORM_INCIDENTS,
  INITIAL_CAPACITY_OBSERVATIONS,
  INITIAL_BACKUP_RECORDS,
} from '../lib/system-health/fixtures';
import {
  ComponentHealthStatus,
  PlatformIncident,
  MaintenanceWindow,
} from '../lib/system-health/types';

describe('Phase E-09.14: System Health, Observability and Platform Operations Governance', () => {
  beforeEach(() => {
    platformStore.resetToDefaults();
  });

  // ==========================================
  // 1. HEALTH AND TELEMETRY SEMANTICS
  // ==========================================
  describe('1. Health Summary & Component Telemetry Semantics', () => {
    test('accurately computes platform health summary totals from registered components', () => {
      const summary = computeHealthSummary(
        INITIAL_OPERATIONAL_COMPONENTS,
        INITIAL_PLATFORM_INCIDENTS
      );

      assert.equal(summary.totalComponents, INITIAL_OPERATIONAL_COMPONENTS.length);
      assert.equal(
        summary.healthyComponents,
        INITIAL_OPERATIONAL_COMPONENTS.filter((c) => c.status === 'healthy').length
      );
      assert.equal(
        summary.degradedComponents,
        INITIAL_OPERATIONAL_COMPONENTS.filter((c) => c.status === 'degraded').length
      );
      assert.equal(
        summary.criticalComponents,
        INITIAL_OPERATIONAL_COMPONENTS.filter((c) => c.status === 'critical').length
      );
      assert.equal(
        summary.unknownComponents,
        INITIAL_OPERATIONAL_COMPONENTS.filter((c) => c.status === 'unknown').length
      );
      assert.equal(
        summary.notConnectedComponents,
        INITIAL_OPERATIONAL_COMPONENTS.filter((c) => c.status === 'not_connected').length
      );
      assert.equal(
        summary.maintenanceComponents,
        INITIAL_OPERATIONAL_COMPONENTS.filter((c) => c.status === 'maintenance').length
      );
      assert.equal(
        summary.openIncidents,
        INITIAL_PLATFORM_INCIDENTS.filter((i) => i.status !== 'resolved').length
      );
    });

    test('determines overall platform status accurately based on component severities', () => {
      // Normal fixture has degraded/critical components
      const summaryWithIssues = computeHealthSummary(
        INITIAL_OPERATIONAL_COMPONENTS,
        INITIAL_PLATFORM_INCIDENTS
      );
      assert.equal(summaryWithIssues.overallStatus, 'critical');

      // If all components are healthy, status is healthy
      const allHealthy = INITIAL_OPERATIONAL_COMPONENTS.map((c) => ({
        ...c,
        status: 'healthy' as ComponentHealthStatus,
      }));
      const healthySummary = computeHealthSummary(allHealthy, []);
      assert.equal(healthySummary.overallStatus, 'healthy');

      // If any component is critical, overall platform status is critical
      const withCritical = INITIAL_OPERATIONAL_COMPONENTS.map((c, idx) => ({
        ...c,
        status: (idx === 0 ? 'critical' : 'healthy') as ComponentHealthStatus,
      }));
      const criticalSummary = computeHealthSummary(withCritical, []);
      assert.equal(criticalSummary.overallStatus, 'critical');
    });

    test('preserves unknown, stale, and disconnected statuses without coercing to healthy', () => {
      const unknownComp = INITIAL_OPERATIONAL_COMPONENTS.find((c) => c.status === 'unknown');
      assert.ok(unknownComp, 'Expected at least one component with unknown status');
      assert.equal(unknownComp.status, 'unknown');
      assert.notEqual(unknownComp.status, 'healthy');

      const notConnComp = INITIAL_OPERATIONAL_COMPONENTS.find((c) => c.status === 'not_connected');
      assert.ok(notConnComp, 'Expected at least one component with not_connected status');
      assert.equal(notConnComp.status, 'not_connected');
      assert.notEqual(notConnComp.status, 'healthy');

      const staleComp = INITIAL_OPERATIONAL_COMPONENTS.find((c) => c.dataFreshness === 'stale');
      assert.ok(staleComp, 'Expected at least one component with stale freshness');
      assert.equal(staleComp.dataFreshness, 'stale');
    });

    test('filters components by search query, category, and health status', () => {
      const dbComponents = filterComponents(INITIAL_OPERATIONAL_COMPONENTS, {
        category: 'database_service',
      });
      assert.ok(dbComponents.length > 0);
      assert.ok(dbComponents.every((c) => c.category === 'database_service'));

      const healthyOnly = filterComponents(INITIAL_OPERATIONAL_COMPONENTS, {
        status: 'healthy',
      });
      assert.ok(healthyOnly.length > 0);
      assert.ok(healthyOnly.every((c) => c.status === 'healthy'));

      const searchFiltered = filterComponents(INITIAL_OPERATIONAL_COMPONENTS, {
        search: 'PostgreSQL',
      });
      assert.ok(searchFiltered.length > 0);
      assert.ok(searchFiltered.some((c) => c.id === 'comp_postgres_cluster'));
    });
  });

  // ==========================================
  // 2. OBSERVABILITY AND METRIC EXPLORER
  // ==========================================
  describe('2. Observability, Metrics & Tabular Aggregations', () => {
    test('filters metric observations by metric identifier and time window', () => {
      const latencyObservations = filterMetricObservations(
        INITIAL_METRIC_OBSERVATIONS,
        'metric_request_latency_p95',
        '24h'
      );
      assert.ok(latencyObservations.length > 0);
      assert.ok(latencyObservations.every((obs) => obs.metricId === 'metric_request_latency_p95'));

      // 1h window filters observations to only those within last 1 hour
      const oneHourObs = filterMetricObservations(
        INITIAL_METRIC_OBSERVATIONS,
        'metric_request_latency_p95',
        '1h'
      );
      assert.ok(oneHourObs.length <= latencyObservations.length);
    });

    test('distinguishes missing telemetry observations (null) from measured zero', () => {
      const missingObs = INITIAL_METRIC_OBSERVATIONS.filter((o) => o.isMissing || o.value === null);
      assert.ok(missingObs.length > 0, 'Expected missing telemetry observation with value=null');

      const firstMissing = missingObs[0];
      assert.equal(firstMissing.value, null);
      assert.notEqual(firstMissing.value, 0);

      // Aggregates must ignore nulls without coercing them to 0
      const summary = aggregateMetricSeries(missingObs);
      assert.equal(summary.totalObservations - summary.missingCount, 0);
      assert.equal(summary.min, null);
      assert.equal(summary.max, null);
      assert.equal(summary.avg, null);
    });

    test('calculates accurate aggregate statistics: min, max, avg, and P95', () => {
      const latencyObservations = filterMetricObservations(
        INITIAL_METRIC_OBSERVATIONS,
        'metric_request_latency_p95',
        '24h'
      );
      const stats = aggregateMetricSeries(latencyObservations);

      assert.ok(stats.min !== null && stats.min <= (stats.max ?? 0));
      assert.ok(stats.avg !== null && stats.avg >= (stats.min ?? 0));
      assert.ok(stats.p95 !== null && stats.p95 >= (stats.min ?? 0));
      assert.ok(stats.p95 <= (stats.max ?? 0));
    });

    test('exports metric observations to CSV and escapes dangerous formula characters', () => {
      const metricDef = INITIAL_METRIC_DEFINITIONS[0];
      const observations = INITIAL_METRIC_OBSERVATIONS.filter(
        (o) => o.metricId === metricDef.id
      ).slice(0, 5);

      const csv = exportMetricsToCsv(observations, metricDef.name, 'Core API Gateway');
      assert.ok(csv.includes('Timestamp,Component,Metric,Value,Unit,Source Classification,Status'));
      assert.ok(csv.includes(metricDef.name));

      // Test formula injection defense:
      const maliciousObservation = {
        id: 'obs_test_injection',
        componentId: 'comp_test',
        metricId: 'metric_test',
        timestamp: '2026-10-19T07:00:00Z',
        value: 42,
        unit: 'ms' as const,
        sourceStatus: 'simulated_fixture' as const,
        isMissing: false,
      };
      const injectedCsv = exportMetricsToCsv(
        [maliciousObservation],
        '=CMD|calc!A1',
        '+SUM(1,2)'
      );
      // Ensure formula characters are prefixed with single quote
      assert.ok(injectedCsv.includes("''=CMD|calc!A1") || injectedCsv.includes("'+SUM(1,2)") || injectedCsv.includes("'=CMD|calc!A1"));
    });
  });

  // ==========================================
  // 3. INCIDENT LIFECYCLE MANAGEMENT
  // ==========================================
  describe('3. Incident Lifecycle Transitions and Integrity', () => {
    test('permits valid linear state machine transitions', () => {
      // open -> acknowledged
      const t1 = validateIncidentTransition('open', 'acknowledged');
      assert.equal(t1.isValid, true);

      // acknowledged -> investigating
      const t2 = validateIncidentTransition('acknowledged', 'investigating');
      assert.equal(t2.isValid, true);

      // investigating -> monitoring
      const t3 = validateIncidentTransition('investigating', 'monitoring');
      assert.equal(t3.isValid, true);

      // monitoring -> resolved (with resolution notes and root cause)
      const t4 = validateIncidentTransition('monitoring', 'resolved', {
        rootCause: 'Connection leak in thread pool',
        resolutionNotes: 'Patched pool limits and recycled connections',
      });
      assert.equal(t4.isValid, true);
    });

    test('rejects premature or invalid incident state transitions', () => {
      // open -> resolved directly is rejected
      const invalidJump = validateIncidentTransition('open', 'resolved', {
        resolutionNotes: 'Done without investigation',
        rootCause: 'Unknown',
      });
      assert.equal(invalidJump.isValid, false);
      assert.ok(invalidJump.error?.includes('Cannot transition'));

      // resolved -> acknowledged is rejected (resolved incidents are terminal or require reopen)
      const invalidBacktrack = validateIncidentTransition('resolved', 'acknowledged');
      assert.equal(invalidBacktrack.isValid, false);
    });

    test('enforces mandatory resolution notes and root cause when resolving an incident', () => {
      const missingResolution = validateIncidentTransition('monitoring', 'resolved', {
        rootCause: 'Valid Root Cause',
        resolutionNotes: '',
      });
      assert.equal(missingResolution.isValid, false);
      assert.ok(missingResolution.error?.includes('Resolution notes and root cause are required'));

      const missingRootCause = validateIncidentTransition('monitoring', 'resolved', {
        rootCause: '',
        resolutionNotes: 'Mitigated by config change successfully.',
      });
      assert.equal(missingRootCause.isValid, false);
      assert.ok(missingRootCause.error?.includes('Resolution notes and root cause are required'));
    });

    test('calculates Mean Time to Resolution (MTTR) correctly in minutes', () => {
      const resolvedIncident: PlatformIncident = {
        id: 'inc-test-resolved',
        title: 'Resolved Test Incident',
        description: 'Test',
        severity: 'medium',
        status: 'resolved',
        affectedComponents: ['comp_core_api_gateway'],
        detectedAt: '2026-10-18T10:00:00Z',
        resolvedAt: '2026-10-18T11:30:00Z', // 90 minutes
        timeline: [],
        sourceClassification: 'simulated_fixture',
        isDemoFixture: true,
      };

      const result = calculateIncidentMttr([resolvedIncident]);
      assert.equal(result.mttrMinutes, 90);
      assert.equal(result.resolvedCount, 1);
      assert.equal(result.formattedMttr, '1h 30m');
    });
  });

  // ==========================================
  // 4. MAINTENANCE WINDOWS AND OVERLAP DETECTION
  // ==========================================
  describe('4. Maintenance Windows & Overlap Validation', () => {
    test('validates start and end time order and requires title and affected components', () => {
      const valid = validateMaintenanceWindow({
        title: 'PostgreSQL Minor Upgrade',
        description: 'Routine index vacuuming and cluster statistics update',
        affectedComponents: ['comp_postgres_cluster'],
        startTime: '2026-10-25T01:00:00Z',
        endTime: '2026-10-25T03:00:00Z',
        timeZone: 'UTC',
        status: 'scheduled',
        impactDescription: 'Transient failover',
      });
      assert.equal(valid.isValid, true);
      assert.equal(valid.errors.length, 0);

      // End time before start time is rejected
      const invalidTimes = validateMaintenanceWindow({
        title: 'Invalid Maintenance Times',
        description: 'Test description with sufficient length',
        affectedComponents: ['comp_postgres_cluster'],
        startTime: '2026-10-25T04:00:00Z',
        endTime: '2026-10-25T02:00:00Z',
        timeZone: 'UTC',
        status: 'scheduled',
        impactDescription: 'None',
      });
      assert.equal(invalidTimes.isValid, false);
      assert.ok(invalidTimes.errors.some((e) => e.includes('strictly after start time')));

      // Missing affected components is rejected
      const noComponents = validateMaintenanceWindow({
        title: 'No Components Specified',
        description: 'Test description with sufficient length',
        affectedComponents: [],
        startTime: '2026-10-25T01:00:00Z',
        endTime: '2026-10-25T03:00:00Z',
        timeZone: 'UTC',
        status: 'scheduled',
        impactDescription: 'None',
      });
      assert.equal(noComponents.isValid, false);
      assert.ok(noComponents.errors.some((e) => e.includes('At least one affected component')));
    });

    test('detects overlapping maintenance windows for shared affected components', () => {
      const existingWindows: MaintenanceWindow[] = [
        {
          id: 'maint-1',
          title: 'Database Cluster Patching',
          description: 'Patching node A',
          affectedComponents: ['comp_postgres_cluster'],
          startTime: '2026-10-25T02:00:00Z',
          endTime: '2026-10-25T04:00:00Z',
          timeZone: 'UTC',
          status: 'scheduled',
          impactDescription: 'Read replica failover',
          responsibleOperator: 'Alexander Sterling',
          createdAt: '2026-10-18T10:00:00Z',
          updatedAt: '2026-10-18T10:00:00Z',
          sourceClassification: 'simulated_fixture',
          isDemoFixture: true,
        },
      ];

      // Window overlapping with comp_postgres_cluster during 03:00 - 05:00
      const overlaps = detectOverlappingMaintenance(
        '2026-10-25T03:00:00Z',
        '2026-10-25T05:00:00Z',
        ['comp_postgres_cluster'],
        existingWindows
      );
      assert.equal(overlaps.length, 1);
      assert.equal(overlaps[0].id, 'maint-1');

      // Window with unrelated component does not overlap
      const nonOverlapping = detectOverlappingMaintenance(
        '2026-10-25T03:00:00Z',
        '2026-10-25T05:00:00Z',
        ['comp_frontend_superadmin'],
        existingWindows
      );
      assert.equal(nonOverlapping.length, 0);

      // Cancelled windows are ignored during overlap detection
      const cancelledWindows: MaintenanceWindow[] = [
        {
          ...existingWindows[0],
          status: 'cancelled',
        },
      ];
      const ignoredCancelled = detectOverlappingMaintenance(
        '2026-10-25T03:00:00Z',
        '2026-10-25T05:00:00Z',
        ['comp_postgres_cluster'],
        cancelledWindows
      );
      assert.equal(ignoredCancelled.length, 0);
    });
  });

  // ==========================================
  // 5. ALERT RULE VALIDATION
  // ==========================================
  describe('5. Alert Rule Configuration & Threshold Validation', () => {
    test('validates required alert rule fields, non-negative threshold, and evaluation window', () => {
      const valid = validateAlertRule({
        name: 'High Ingress API Latency Alert',
        description: 'Trigger when latency exceeds 500ms',
        targetComponentId: 'comp_core_api_gateway',
        metricId: 'metric_request_latency_p95',
        operator: '>',
        thresholdValue: 500,
        unit: 'ms',
        evaluationWindow: '5m',
        severity: 'critical',
      });
      assert.equal(valid.isValid, true);
      assert.equal(valid.errors.length, 0);

      // Negative threshold rejection
      const negativeThreshold = validateAlertRule({
        name: 'Negative Threshold Rule',
        description: 'Testing rejection of negative numbers',
        targetComponentId: 'comp_core_api_gateway',
        metricId: 'metric_request_latency_p95',
        operator: '>',
        thresholdValue: -10,
        unit: 'ms',
        evaluationWindow: '5m',
        severity: 'critical',
      });
      assert.equal(negativeThreshold.isValid, false);
      assert.ok(negativeThreshold.errors.some((e) => e.includes('non-negative number')));

      // Invalid evaluation window
      const invalidWindow = validateAlertRule({
        name: 'Bad Evaluation Window',
        description: 'Testing rejection of invalid windows',
        targetComponentId: 'comp_core_api_gateway',
        metricId: 'metric_request_latency_p95',
        operator: '>',
        thresholdValue: 50,
        unit: 'ms',
        evaluationWindow: 'invalid-window' as unknown as string,
        severity: 'warning',
      });
      assert.equal(invalidWindow.isValid, false);
      assert.ok(invalidWindow.errors.some((e) => e.includes('Evaluation window must be one of')));
    });
  });

  // ==========================================
  // 6. MULTI-TENANT PRIVACY & READINESS EVALUATION
  // ==========================================
  describe('6. Multi-Tenant Operational Oversight (Zero PII Guarantee)', () => {
    test('evaluates organization operational readiness without exposing student PII', () => {
      const organizations = platformStore.getOrganizations();
      assert.ok(organizations.length > 0);

      const readinessList = evaluateTenantOperationalReadiness(
        organizations,
        INITIAL_OPERATIONAL_COMPONENTS,
        INITIAL_PLATFORM_INCIDENTS
      );

      assert.equal(readinessList.length, organizations.length);

      // Verify each record contains ONLY technical domain/readiness data and ZERO student PII
      for (const record of readinessList) {
        assert.ok(record.organizationId);
        assert.ok(record.organizationName);
        assert.ok(record.lifecycleStatus);
        assert.ok(record.provisioningStatus);
        assert.ok(typeof record.configuredModuleCount === 'number');
        assert.ok(Array.isArray(record.platformDependencies));

        // Strict assertion: zero PII fields exist
        const untyped = record as unknown as Record<string, unknown>;
        assert.equal(untyped.studentName, undefined);
        assert.equal(untyped.studentId, undefined);
        assert.equal(untyped.grades, undefined);
        assert.equal(untyped.guardianPhone, undefined);
        assert.equal(untyped.assessmentScores, undefined);
      }
    });

    test('preserves distinct identity between platform health and tenant readiness', () => {
      const organizations = platformStore.getOrganizations();
      const readinessList = evaluateTenantOperationalReadiness(
        organizations,
        INITIAL_OPERATIONAL_COMPONENTS,
        INITIAL_PLATFORM_INCIDENTS
      );

      // Component status issues do NOT change tenant configuration readiness status to failed
      const orgRecord = readinessList[0];
      assert.ok(
        ['draft', 'pending', 'active', 'suspended', 'inactive', 'archived'].includes(
          orgRecord.lifecycleStatus
        )
      );
    });
  });

  // ==========================================
  // 7. STORE MUTATIONS AND AUDIT EVENT LOGGING
  // ==========================================
  describe('7. Platform Store Mutations & Automated Audit Logging', () => {
    test('acknowledging an incident updates local state and appends an audit event', () => {
      const openIncident = platformStore.getPlatformIncidents().find((i) => i.status === 'open');
      assert.ok(openIncident, 'Expected an open incident');

      const initialAuditCount = platformStore.getAuditEvents().length;
      const result = platformStore.acknowledgeIncident(openIncident.id, 'Alexander Sterling');
      assert.equal(result.success, true);

      const updatedIncident = platformStore.getPlatformIncident(openIncident.id);
      assert.equal(updatedIncident?.status, 'acknowledged');

      // Verify audit log record was automatically added
      const auditEvents = platformStore.getAuditEvents();
      assert.equal(auditEvents.length, initialAuditCount + 1);
      const latestAudit = auditEvents[0];
      assert.equal(latestAudit.action, 'INCIDENT_ACKNOWLEDGED');
      assert.equal(latestAudit.targetId, openIncident.id);
    });

    test('transitioning incident status adds timeline event and generates audit trail', () => {
      const result = platformStore.transitionIncidentStatus(
        'inc_ops_01',
        'monitoring',
        undefined,
        'Alexander Sterling'
      );
      assert.equal(result.success, true);

      const updated = platformStore.getPlatformIncident('inc_ops_01');
      assert.equal(updated?.status, 'monitoring');

      const latestAudit = platformStore.getAuditEvents()[0];
      assert.equal(latestAudit.action, 'INCIDENT_STATUS_TRANSITIONED');
      assert.equal(latestAudit.metadata?.newStatus, 'monitoring');
    });

    test('scheduling a maintenance window persists state and records audit log', () => {
      const initialWindows = platformStore.getMaintenanceWindows().length;
      const initialAuditCount = platformStore.getAuditEvents().length;

      const result = platformStore.createMaintenanceWindow({
        title: 'Redis Cache Cluster Maintenance',
        description: 'Upgrading engine version to 7.2',
        affectedComponents: ['comp_redis_cache'],
        startTime: '2026-10-30T02:00:00Z',
        endTime: '2026-10-30T03:30:00Z',
        timeZone: 'UTC',
        status: 'scheduled',
        impactDescription: 'Transient cache miss latency',
        responsibleOperator: 'Alexander Sterling',
      });

      assert.equal(result.success, true);
      assert.ok(result.maintenanceWindow?.id);
      assert.equal(platformStore.getMaintenanceWindows().length, initialWindows + 1);

      const latestAudit = platformStore.getAuditEvents()[0];
      assert.equal(latestAudit.action, 'MAINTENANCE_WINDOW_SCHEDULED');
      assert.equal(latestAudit.targetId, result.maintenanceWindow?.id);
    });

    test('creating and toggling an alert rule mutates state and logs audit events', () => {
      const initialRuleCount = platformStore.getAlertRules().length;

      const result = platformStore.createAlertRule({
        name: 'Redis Memory Critical Threshold',
        description: 'Fires when Redis memory exceeds 85%',
        targetComponentId: 'comp_redis_cache',
        metricId: 'metric_cache_hit_ratio',
        operator: '<',
        thresholdValue: 85,
        unit: '%',
        evaluationWindow: '5m',
        severity: 'critical',
        notificationPolicyRef: 'Ops Pager',
      });

      assert.equal(result.success, true);
      assert.ok(result.alertRule?.id);
      assert.equal(platformStore.getAlertRules().length, initialRuleCount + 1);

      // Toggle rule off
      const toggleResult = platformStore.toggleAlertRule(result.alertRule.id, 'Alexander Sterling');
      assert.equal(toggleResult.success, true);
      const toggled = platformStore.getAlertRule(result.alertRule.id);
      assert.equal(toggled?.isEnabled, false);

      // Verify audit logs captured both creation and toggle
      const auditEvents = platformStore.getAuditEvents();
      assert.equal(auditEvents[0].action, 'ALERT_RULE_DISABLED');
      assert.equal(auditEvents[1].action, 'ALERT_RULE_CREATED');
    });
  });

  // ==========================================
  // 8. CAPACITY AND BACKUP READINESS CONTRACTS
  // ==========================================
  describe('8. Capacity Gauges and Backup Readiness Verification', () => {
    test('capacity gauges maintain valid units, denominators, and threshold warning states', () => {
      for (const gauge of INITIAL_CAPACITY_OBSERVATIONS) {
        assert.ok(gauge.id);
        assert.ok(gauge.resourceName);
        assert.ok(typeof gauge.currentValue === 'number');
        assert.ok(gauge.unit);
        if (gauge.warningThreshold !== undefined && gauge.criticalThreshold !== undefined) {
          assert.ok(gauge.warningThreshold <= gauge.criticalThreshold);
        }
        if (gauge.denominatorValue !== null) {
          assert.ok(gauge.denominatorValue > 0);
          assert.ok(gauge.currentValue <= gauge.denominatorValue * 1.5); // Plausible bounds
        }
      }
    });

    test('backup readiness fixtures distinguish verified, reported, and unverified targets', () => {
      for (const backup of INITIAL_BACKUP_RECORDS) {
        assert.ok(backup.id);
        assert.ok(backup.scope);
        assert.ok(['verified', 'reported', 'simulated', 'unknown', 'not_configured'].includes(backup.readinessState));
        assert.ok(typeof backup.rpoTargetMinutes === 'number');
        assert.ok(typeof backup.rtoTargetHours === 'number');
      }
    });
  });
});
