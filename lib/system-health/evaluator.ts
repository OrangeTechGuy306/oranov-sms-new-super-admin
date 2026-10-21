import {
  OperationalComponent,
  ComponentCategory,
  ComponentHealthStatus,
  SourceClassification,
  FreshnessState,
  PlatformIncident,
  IncidentLifecycleStatus,
  MetricObservation,
  MetricDefinition,
  MetricExplorerFilter,
  MetricTimeWindow,
  MetricAggregationType,
  MaintenanceWindow,
  MaintenanceStatus,
  CreateMaintenanceInput,
  AlertRule,
  CreateAlertRuleInput,
  PlatformHealthSummary,
  TenantOperationalReadiness,
} from './types';
import { Organization } from '../types/organizations';

/**
 * Derives global platform health summary across all registered components.
 * Missing telemetry is never represented as healthy.
 */
export function computeHealthSummary(
  components: OperationalComponent[],
  incidents: PlatformIncident[],
  refDate = '2026-10-19T07:30:00Z'
): PlatformHealthSummary {
  let healthyCount = 0;
  let degradedCount = 0;
  let criticalCount = 0;
  let unknownCount = 0;
  let staleCount = 0;
  let notConnectedCount = 0;
  let maintenanceCount = 0;

  components.forEach((c) => {
    switch (c.status) {
      case 'healthy':
        healthyCount++;
        break;
      case 'degraded':
        degradedCount++;
        break;
      case 'critical':
        criticalCount++;
        break;
      case 'unknown':
        unknownCount++;
        break;
      case 'stale':
        staleCount++;
        break;
      case 'not_connected':
        notConnectedCount++;
        break;
      case 'maintenance':
        maintenanceCount++;
        break;
    }
  });

  const openIncidentsCount = incidents.filter(
    (inc) => inc.status !== 'resolved'
  ).length;

  let globalStatus: ComponentHealthStatus = 'healthy';
  if (criticalCount > 0) {
    globalStatus = 'critical';
  } else if (degradedCount > 0) {
    globalStatus = 'degraded';
  } else if (maintenanceCount > 0 && healthyCount === 0) {
    globalStatus = 'maintenance';
  } else if (unknownCount > 0 || staleCount > 0 || notConnectedCount > 0) {
    // If some components are degraded or critical, they dominate.
    // If all known are healthy but some are unknown/stale, global status is degraded or unknown.
    globalStatus = unknownCount > 0 ? 'unknown' : 'degraded';
  }

  return {
    totalComponents: components.length,
    healthyCount,
    degradedCount,
    criticalCount,
    unknownCount,
    staleCount,
    notConnectedCount,
    maintenanceCount,
    openIncidentsCount,
    lastTelemetryUpdate: refDate,
    globalStatus,
    healthyComponents: healthyCount,
    degradedComponents: degradedCount,
    criticalComponents: criticalCount,
    unknownComponents: unknownCount,
    staleComponents: staleCount,
    notConnectedComponents: notConnectedCount,
    maintenanceComponents: maintenanceCount,
    openIncidents: openIncidentsCount,
    overallStatus: globalStatus,
  };
}

/**
 * Checks freshness of telemetry timestamp.
 * Any timestamp older than maxAgeMinutes is considered stale.
 */
export function checkTelemetryFreshness(
  timestamp: string,
  maxAgeMinutes = 60,
  refDate = '2026-10-19T07:30:00Z'
): FreshnessState {
  if (!timestamp) return 'unknown';
  try {
    const time = new Date(timestamp).getTime();
    const ref = new Date(refDate).getTime();
    if (isNaN(time) || isNaN(ref)) return 'unknown';
    const ageMinutes = (ref - time) / (1000 * 60);
    if (ageMinutes < 0) return 'fresh'; // Future timestamp (skew)
    if (ageMinutes <= maxAgeMinutes) return 'fresh';
    return 'stale';
  } catch {
    return 'unknown';
  }
}

/**
 * Maps ComponentHealthStatus to human-readable label and styling variant.
 */
export function getComponentStatusBadge(status: ComponentHealthStatus): {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';
  dotColor: string;
} {
  switch (status) {
    case 'healthy':
      return { label: 'Operational (Healthy)', variant: 'success', dotColor: 'bg-emerald-500' };
    case 'degraded':
      return { label: 'Degraded Performance', variant: 'warning', dotColor: 'bg-amber-500' };
    case 'critical':
      return { label: 'Critical Outage', variant: 'error', dotColor: 'bg-rose-500' };
    case 'unknown':
      return { label: 'Unknown Telemetry', variant: 'neutral', dotColor: 'bg-slate-400' };
    case 'stale':
      return { label: 'Stale Heartbeat', variant: 'warning', dotColor: 'bg-amber-600' };
    case 'not_connected':
      return { label: 'Not Connected', variant: 'neutral', dotColor: 'bg-zinc-400' };
    case 'maintenance':
      return { label: 'Scheduled Maintenance', variant: 'info', dotColor: 'bg-blue-500' };
    default:
      return { label: status, variant: 'neutral', dotColor: 'bg-slate-400' };
  }
}

/**
 * Maps source classification to descriptive badges ensuring data honesty.
 */
export function getSourceClassificationBadge(source: SourceClassification): {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';
  description: string;
} {
  switch (source) {
    case 'verified_repo':
      return {
        label: 'Verified Codebase Evidence',
        variant: 'success',
        description: 'Directly verified from repository source code inspection.',
      };
    case 'simulated_fixture':
      return {
        label: 'Demo Data — No Live Telemetry',
        variant: 'info',
        description: 'Deterministic local fixture for frontend workflow demonstration.',
      };
    case 'static_config':
      return {
        label: 'Static Config Fixture',
        variant: 'purple',
        description: 'Hardcoded architectural constant configured in frontend scaffolding.',
      };
    case 'not_connected':
      return {
        label: 'Not Connected (Requires Backend)',
        variant: 'neutral',
        description: 'External provider or backend probe not connected in this roadmap phase.',
      };
    case 'unknown_stale':
      return {
        label: 'Unverified / Stale',
        variant: 'warning',
        description: 'Telemetry heartbeat expired or cannot be cryptographically verified.',
      };
    default:
      return {
        label: source,
        variant: 'neutral',
        description: 'Unclassified source status.',
      };
  }
}

/**
 * Filters operational components by category, health status, environment, and search text.
 */
export function filterComponents(
  components: OperationalComponent[],
  filters: {
    category?: ComponentCategory | 'all';
    status?: ComponentHealthStatus | 'all';
    environment?: string | 'all';
    search?: string;
  }
): OperationalComponent[] {
  return components.filter((comp) => {
    if (filters.category && filters.category !== 'all' && comp.category !== filters.category) {
      return false;
    }
    if (filters.status && filters.status !== 'all' && comp.status !== filters.status) {
      return false;
    }
    if (filters.environment && filters.environment !== 'all' && comp.environment !== filters.environment) {
      return false;
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const matchName = comp.name.toLowerCase().includes(q);
      const matchId = comp.id.toLowerCase().includes(q);
      const matchDesc = comp.description.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchDesc) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Filters metric observations by component, metric, and time window.
 */
export function filterMetricObservations(
  observations: MetricObservation[],
  filterOrMetricId: MetricExplorerFilter | string,
  timeWindowOrRef?: MetricTimeWindow | string,
  refDate = '2026-10-19T07:30:00Z'
): MetricObservation[] {
  let filter: Partial<MetricExplorerFilter>;
  let reference = refDate;

  if (typeof filterOrMetricId === 'string') {
    filter = {
      metricId: filterOrMetricId,
      timeWindow: (timeWindowOrRef as MetricTimeWindow) || '24h',
    };
  } else {
    filter = filterOrMetricId;
    if (typeof timeWindowOrRef === 'string') {
      reference = timeWindowOrRef;
    }
  }

  let filtered = observations.filter((obs) => {
    if (filter.metricId && obs.metricId !== filter.metricId) return false;
    if (filter.componentId && obs.componentId !== filter.componentId) return false;
    return true;
  });

  const refTime = new Date(reference).getTime();

  if (filter.timeWindow === 'custom' && filter.startDate && filter.endDate) {
    const start = new Date(filter.startDate).getTime();
    const end = new Date(filter.endDate).getTime();
    filtered = filtered.filter((obs) => {
      const t = new Date(obs.timestamp).getTime();
      return t >= start && t <= end;
    });
  } else {
    let windowHours = 24;
    switch (filter.timeWindow) {
      case '1h':
        windowHours = 1;
        break;
      case '6h':
        windowHours = 6;
        break;
      case '24h':
        windowHours = 24;
        break;
      case '7d':
        windowHours = 24 * 7;
        break;
    }
    const windowStart = refTime - windowHours * 60 * 60 * 1000;
    filtered = filtered.filter((obs) => {
      const t = new Date(obs.timestamp).getTime();
      return t >= windowStart && t <= refTime;
    });
  }

  // Sort chronologically ascending
  return filtered.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

/**
 * Aggregates metric observations.
 * Note: Missing values (null) are NEVER coerced to 0.
 */
export function aggregateMetricSeries(observations: MetricObservation[]) {
  const validValues = observations
    .filter((obs) => !obs.isMissing && obs.value !== null)
    .map((obs) => obs.value as number);

  const missingCount = observations.filter((obs) => obs.isMissing || obs.value === null).length;

  if (validValues.length === 0) {
    return {
      current: null,
      min: null,
      max: null,
      avg: null,
      p95: null,
      totalObservations: observations.length,
      missingCount,
    };
  }

  const current = validValues[validValues.length - 1];
  const min = Math.min(...validValues);
  const max = Math.max(...validValues);
  const sum = validValues.reduce((acc, v) => acc + v, 0);
  const avg = Number((sum / validValues.length).toFixed(2));

  // Compute P95
  const sorted = [...validValues].sort((a, b) => a - b);
  const p95Index = Math.min(
    sorted.length - 1,
    Math.floor(sorted.length * 0.95)
  );
  const p95 = sorted[p95Index];

  return {
    current,
    min,
    max,
    avg,
    p95,
    totalObservations: observations.length,
    missingCount,
  };
}

/**
 * Exports filtered metric observations to CSV format with formula injection protection.
 */
export function exportMetricsToCsv(
  observations: MetricObservation[],
  metricName: string,
  componentName: string
): string {
  const sanitize = (text: string | number | null | undefined): string => {
    if (text === null || text === undefined) return '';
    let str = String(text);
    // Neutralize formula injection characters (=, +, -, @, tab, cr)
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`;
    }
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = ['Timestamp', 'Component', 'Metric', 'Value', 'Unit', 'Source Classification', 'Status'];
  const rows = observations.map((obs) => [
    sanitize(obs.timestamp),
    sanitize(componentName),
    sanitize(metricName),
    obs.isMissing || obs.value === null ? 'MISSING' : sanitize(obs.value),
    sanitize(obs.unit),
    sanitize(obs.sourceStatus),
    obs.isMissing ? 'UNAVAILABLE' : 'RECORDED',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Validates incident lifecycle transitions.
 * Lifecycle State Machine:
 * - open -> acknowledged
 * - acknowledged -> investigating
 * - investigating -> monitoring | resolved
 * - monitoring -> resolved
 * - resolved -> open (reopen requires reason)
 */
export function getValidIncidentTransitions(
  currentStatus: IncidentLifecycleStatus
): IncidentLifecycleStatus[] {
  switch (currentStatus) {
    case 'open':
      return ['acknowledged'];
    case 'acknowledged':
      return ['investigating'];
    case 'investigating':
      return ['monitoring', 'resolved'];
    case 'monitoring':
      return ['resolved', 'investigating'];
    case 'resolved':
      return ['open']; // Reopen
    default:
      return [];
  }
}

export function validateIncidentTransition(
  incidentOrStatus: PlatformIncident | IncidentLifecycleStatus,
  targetStatus: IncidentLifecycleStatus,
  context?: { resolutionNotes?: string; rootCause?: string; reopenReason?: string }
): { isValid: boolean; error?: string } {
  const currentStatus: IncidentLifecycleStatus =
    typeof incidentOrStatus === 'string' ? incidentOrStatus : incidentOrStatus.status;

  if (currentStatus === targetStatus) {
    return { isValid: false, error: `Incident is already in "${targetStatus}" state.` };
  }

  const allowedTransitions = getValidIncidentTransitions(currentStatus);
  if (!allowedTransitions.includes(targetStatus)) {
    return {
      isValid: false,
      error: `Cannot transition: Invalid lifecycle transition from "${currentStatus}" to "${targetStatus}". Allowed next states: ${allowedTransitions.join(', ')}.`,
    };
  }

  // Mandatory checks for resolving
  if (targetStatus === 'resolved') {
    if (!context?.resolutionNotes || context.resolutionNotes.trim().length < 10) {
      return {
        isValid: false,
        error: 'Resolution notes and root cause are required (resolution notes minimum 10 characters) before marking an incident as resolved.',
      };
    }
    if (!context?.rootCause || context.rootCause.trim().length < 5) {
      return {
        isValid: false,
        error: 'Resolution notes and root cause are required (root cause minimum 5 characters) to resolve an incident.',
      };
    }
  }

  // Mandatory check for reopening
  if (targetStatus === 'open' && currentStatus === 'resolved') {
    if (!context?.reopenReason || context.reopenReason.trim().length < 5) {
      return {
        isValid: false,
        error: 'A mandatory reason is required to reopen a resolved incident.',
      };
    }
  }

  return { isValid: true };
}

/**
 * Computes Mean Time To Resolution (MTTR) on resolved incidents.
 */
export function calculateIncidentMttr(incidents: PlatformIncident[]): {
  resolvedCount: number;
  mttrMinutes: number | null;
  formattedMttr: string;
} {
  const resolved = incidents.filter(
    (inc) => inc.status === 'resolved' && inc.detectedAt && inc.resolvedAt
  );

  if (resolved.length === 0) {
    return { resolvedCount: 0, mttrMinutes: null, formattedMttr: 'N/A (No data)' };
  }

  const durations = resolved.map((inc) => {
    const start = new Date(inc.detectedAt).getTime();
    const end = new Date(inc.resolvedAt!).getTime();
    return Math.max(0, (end - start) / (1000 * 60)); // minutes
  });

  const avgMinutes = Math.round(
    durations.reduce((acc, d) => acc + d, 0) / durations.length
  );

  const hours = Math.floor(avgMinutes / 60);
  const mins = avgMinutes % 60;
  const formattedMttr = hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;

  return {
    resolvedCount: resolved.length,
    mttrMinutes: avgMinutes,
    formattedMttr,
  };
}

/**
 * Detects overlapping maintenance windows for shared affected components.
 */
export function detectOverlappingMaintenance(
  startTime: string,
  endTime: string,
  affectedComponents: string[],
  existingWindows: MaintenanceWindow[] = [],
  windowIdToExclude?: string
): MaintenanceWindow[] {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) return [];

  return existingWindows.filter((win) => {
    if (win.id === windowIdToExclude) return false;
    if (win.status === 'cancelled' || win.status === 'completed') return false;

    const winStart = new Date(win.startTime).getTime();
    const winEnd = new Date(win.endTime).getTime();
    const intervalsIntersect = start < winEnd && end > winStart;

    if (!intervalsIntersect) return false;
    return affectedComponents.some((c) => win.affectedComponents.includes(c));
  });
}

/**
 * Validates maintenance window input and checks for overlapping windows on the same components.
 */
export function validateMaintenanceWindow(
  input: CreateMaintenanceInput,
  existingWindows: MaintenanceWindow[] = [],
  windowIdToExclude?: string
): { isValid: boolean; errors: string[]; overlappingWindowIds: string[] } {
  const errors: string[] = [];
  const overlappingWindowIds: string[] = [];

  if (!input.title || input.title.trim().length < 5) {
    errors.push('Maintenance title is required (minimum 5 characters).');
  }

  if (!input.description || input.description.trim().length < 10) {
    errors.push('Maintenance description must be at least 10 characters.');
  }

  if (!input.affectedComponents || input.affectedComponents.length === 0) {
    errors.push('At least one affected component must be specified.');
  }

  if (!input.startTime || !input.endTime) {
    errors.push('Both start and end dates/times are required.');
    return { isValid: false, errors, overlappingWindowIds };
  }

  const start = new Date(input.startTime).getTime();
  const end = new Date(input.endTime).getTime();

  if (isNaN(start) || isNaN(end)) {
    errors.push('Start or end time is not a valid ISO date.');
    return { isValid: false, errors, overlappingWindowIds };
  }

  if (end <= start) {
    errors.push('End time must be strictly after start time.');
  }

  // Minimum 15-minute maintenance window
  if (end - start < 15 * 60 * 1000) {
    errors.push('Maintenance window must span at least 15 minutes.');
  }

  // Check overlaps for same affected components
  const overlappingWindows = detectOverlappingMaintenance(
    input.startTime,
    input.endTime,
    input.affectedComponents || [],
    existingWindows,
    windowIdToExclude
  );

  overlappingWindows.forEach((win) => {
    overlappingWindowIds.push(win.id);
    const sharedComponents = (input.affectedComponents || []).filter((c) =>
      win.affectedComponents.includes(c)
    );
    errors.push(
      `Overlaps with active/scheduled maintenance "${win.title}" on shared component(s): ${sharedComponents.join(', ')}.`
    );
  });

  return {
    isValid: errors.length === 0,
    errors,
    overlappingWindowIds,
  };
}

/**
 * Derives current maintenance window status based on reference time.
 */
export function deriveMaintenanceWindowStatus(
  window: MaintenanceWindow,
  refDate = '2026-10-19T07:30:00Z'
): MaintenanceStatus {
  if (window.status === 'cancelled') return 'cancelled';

  const ref = new Date(refDate).getTime();
  const start = new Date(window.startTime).getTime();
  const end = new Date(window.endTime).getTime();

  if (ref < start) return 'scheduled';
  if (ref >= start && ref <= end) return 'in_progress';
  return 'completed';
}

/**
 * Validates alert rule configuration.
 */
export function validateAlertRule(
  input: CreateAlertRuleInput,
  metricDefs: MetricDefinition[] = []
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.name || input.name.trim().length < 5) {
    errors.push('Rule name is required (minimum 5 characters).');
  }

  if (!input.targetComponentId) {
    errors.push('Target component must be selected.');
  }

  if (!input.metricId) {
    errors.push('Target metric must be selected.');
  }

  if (metricDefs && metricDefs.length > 0) {
    const matchedMetric = metricDefs.find((m) => m.id === input.metricId);
    if (matchedMetric && input.unit && matchedMetric.unit !== input.unit) {
      errors.push(
        `Incompatible unit: Metric "${matchedMetric.name}" uses "${matchedMetric.unit}", but "${input.unit}" was supplied.`
      );
    }
  }

  if (input.thresholdValue === undefined || input.thresholdValue === null || isNaN(input.thresholdValue)) {
    errors.push('Threshold value must be a valid non-negative number.');
  } else if (input.thresholdValue < 0) {
    errors.push('Threshold value must be a valid non-negative number.');
  }

  // Validate evaluation window (e.g. 1m, 5m, 15m, 30m, 1h, 24h)
  const validWindows = ['1m', '5m', '15m', '30m', '1h', '24h'];
  if (!input.evaluationWindow || !validWindows.includes(input.evaluationWindow)) {
    errors.push('Evaluation window must be one of: 1m, 5m, 15m, 30m, 1h.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Evaluates tenant operational readiness from existing organization registry.
 * Zero student PII (names, emails, grades) is exposed.
 */
export function evaluateTenantOperationalReadiness(
  organizations: Organization[],
  components: OperationalComponent[],
  incidents: PlatformIncident[]
): TenantOperationalReadiness[] {
  const openIncidents = incidents.filter((i) => i.status !== 'resolved');

  return organizations.map((org) => {
    // Check if critical services this organization depends on have open incidents
    const hasCriticalBilling = openIncidents.some((i) =>
      i.affectedComponents.includes('comp_billing_stripe_webhook')
    );

    return {
      organizationId: org.id,
      organizationName: org.name,
      organizationCode: org.code,
      lifecycleStatus: org.status,
      provisioningStatus: org.provisioningStatus || 'completed',
      configuredModuleCount: 8, // Standard configured modules
      platformDependencies: ['Core API Gateway', 'PostgreSQL DB', 'Auth Engine', 'S3 Vault'],
      tenantIntegrationStatus: {
        customDomainConfigured: !!org.technicalConfig?.customDomain,
        sslCertificateStatus: org.technicalConfig?.sslStatus === 'simulated_active' ? 'active' : 'not_requested',
        ssoSamlConfigured: false,
        sisBridgeConfigured: false,
      },
      lastSyncTime: '2026-10-19T07:20:00Z',
      openDemoIncidentsCount: hasCriticalBilling ? 1 : 0,
      telemetryAvailability: 'partial',
      isDemoReadiness: true,
    };
  });
}
