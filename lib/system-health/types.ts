/**
 * Domain contracts for Platform System Health, Observability, and Operations Governance (Phase E-09.14).
 *
 * NOTE ON TELEMETRY HONESTY:
 * In accordance with Phase E-09.14 Non-Negotiable Rules, every operational value
 * has an identifiable source and status. Missing telemetry is NEVER represented
 * as healthy or zero, and mock telemetry is explicitly labelled.
 */

// 1. Status and Source Semantics
export type ComponentHealthStatus =
  | 'healthy'
  | 'degraded'
  | 'critical'
  | 'unknown'
  | 'stale'
  | 'not_connected'
  | 'maintenance';

export type SourceClassification =
  | 'verified_repo'       // Established by inspecting codebase
  | 'simulated_fixture'   // Deterministic local fixtures for demonstration
  | 'static_config'       // Values configured within frontend demo
  | 'not_connected'       // Telemetry/integrations requiring future backend
  | 'unknown_stale';      // Unverified or expired observation

export type FreshnessState = 'fresh' | 'stale' | 'unknown';

export type TelemetryAvailability = 'available' | 'unavailable' | 'partial';

export type ComponentCategory =
  | 'frontend_application'
  | 'api_gateway'
  | 'database_service'
  | 'cache_in_memory'
  | 'background_worker'
  | 'file_object_storage'
  | 'auth_identity'
  | 'notification_provider'
  | 'payment_billing'
  | 'reporting_analytics'
  | 'external_integration';

export type DeploymentEnvironment = 'production' | 'staging' | 'demo';

// 2. Operational Component
export interface OperationalComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  environment: DeploymentEnvironment;
  status: ComponentHealthStatus;
  statusSource: SourceClassification;
  lastChecked: string;
  dataFreshness: FreshnessState;
  description: string;
  version?: string;
  uptimeEstimate?: string;
  latencyEstimate?: string;
  dependencies: string[];
  telemetryAvailability: TelemetryAvailability;
  unavailabilityReason?: string;
  relatedIncidentsCount: number;
  openIncidentId?: string;
  isDemoFixture: boolean;
}

// 3. Metrics and Observability
export type MetricCategory =
  | 'request_volume'
  | 'request_latency'
  | 'error_rate'
  | 'cpu_utilization'
  | 'memory_utilization'
  | 'database_connections'
  | 'storage_utilization'
  | 'queue_depth'
  | 'job_duration'
  | 'availability';

export type MetricUnit = 'req/s' | 'ms' | '%' | 'connections' | 'GB' | 'TB' | 'jobs' | 'seconds';

export interface MetricDefinition {
  id: string;
  name: string;
  category: MetricCategory;
  unit: MetricUnit;
  description: string;
  aggregationMethod: 'average' | 'p95' | 'maximum' | 'sum';
  applicableComponents: string[];
  expectedSource: string;
  freshnessRequirementSeconds: number;
  backendIntegrationRequirement: string;
  illustrativeThresholds?: {
    warning: number;
    critical: number;
  };
}

export interface MetricObservation {
  id: string;
  componentId: string;
  metricId: string;
  timestamp: string;
  value: number | null; // null indicates missing data (never converted to 0)
  unit: MetricUnit;
  sourceStatus: SourceClassification;
  isMissing: boolean;
}

export type MetricTimeWindow = '1h' | '6h' | '24h' | '7d' | 'custom';
export type MetricAggregationType = 'average' | 'p95' | 'max' | 'sum';

export interface MetricExplorerFilter {
  componentId: string;
  metricId: string;
  timeWindow: MetricTimeWindow;
  startDate?: string;
  endDate?: string;
  aggregation: MetricAggregationType;
}

// 4. Incident Management
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentLifecycleStatus =
  | 'open'
  | 'acknowledged'
  | 'investigating'
  | 'monitoring'
  | 'resolved';

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  author: string;
  authorRole?: string;
  type: 'detected' | 'acknowledged' | 'investigation_note' | 'status_change' | 'reopened' | 'resolved';
  message: string;
  previousStatus?: IncidentLifecycleStatus;
  newStatus?: IncidentLifecycleStatus;
}

export interface PlatformIncident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentLifecycleStatus;
  affectedComponents: string[];
  detectedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  assignedOperator?: {
    id: string;
    name: string;
    email: string;
  };
  rootCause?: string;
  resolutionNotes?: string;
  timeline: IncidentTimelineEvent[];
  relatedAuditCorrelationId?: string;
  sourceClassification: SourceClassification;
  isDemoFixture: boolean;
}

// 5. Maintenance Windows
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  affectedComponents: string[];
  startTime: string;
  endTime: string;
  timeZone: string; // e.g. "UTC"
  status: MaintenanceStatus;
  impactDescription: string;
  responsibleOperator: string;
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string;
  sourceClassification: SourceClassification;
  isDemoFixture: boolean;
}

export interface CreateMaintenanceInput {
  title: string;
  description: string;
  affectedComponents: string[];
  startTime: string;
  endTime: string;
  timeZone?: string;
  status?: MaintenanceStatus;
  impactDescription: string;
  responsibleOperator?: string;
}

// 6. Deployments & Release History
export type DeploymentStatus = 'succeeded' | 'in_progress' | 'failed' | 'rolled_back';

export interface DeploymentRecord {
  id: string;
  componentId: string;
  componentName: string;
  version: string;
  environment: DeploymentEnvironment;
  status: DeploymentStatus;
  startedAt: string;
  completedAt?: string;
  changeSummary: string;
  gitCommitHash?: string;
  initiatingUser: string;
  relatedIncidentId?: string;
  rollbackCapability: {
    isAvailable: boolean;
    targetVersion?: string;
    descriptorOnlyNote: string;
  };
  sourceClassification: SourceClassification;
  isDemoFixture: boolean;
}

// 7. Background Processing & External Integrations
export type BackgroundJobExecutionStatus = 'idle' | 'running' | 'failing' | 'paused' | 'not_connected';

export interface BackgroundJobStatus {
  id: string;
  jobType: string;
  queueName: string;
  status: BackgroundJobExecutionStatus;
  pendingCount: number;
  runningCount: number;
  completed24hCount: number;
  failed24hCount: number;
  lastExecutionTime: string;
  lastSuccessfulTime?: string;
  failureSummary?: string;
  avgDurationSeconds: number;
  sourceStatus: SourceClassification;
  freshness: FreshnessState;
  isDemoFixture: boolean;
}

export type IntegrationConnectionStatus =
  | 'connected'
  | 'degraded'
  | 'disconnected'
  | 'unknown'
  | 'not_configured';

export interface ExternalIntegrationRecord {
  id: string;
  name: string;
  provider: string;
  purpose: string;
  connectionStatus: IntegrationConnectionStatus;
  lastSyncTime?: string;
  lastErrorSummary?: string;
  freshness: FreshnessState;
  requiredConfigurationItems: {
    name: string;
    isConfigured: boolean;
    isSecret: boolean;
  }[];
  connectionLimitations: string;
  sourceClassification: SourceClassification;
  isDemoFixture: boolean;
}

// 8. Capacity & Resource Visibility
export interface ResourceCapacityObservation {
  id: string;
  resourceName: string;
  componentId: string;
  componentName: string;
  currentValue: number;
  denominatorValue: number | null; // null if denominator is unknown/unavailable
  unit: string;
  utilizationPercentage: number | null; // null if denominator is unavailable
  timestamp: string;
  sourceStatus: SourceClassification;
  freshness: FreshnessState;
  warningThreshold?: number;
  criticalThreshold?: number;
  isDemoFixture: boolean;
}

// 9. Backup & Disaster Recovery Readiness
export type BackupVerificationStatus =
  | 'verified_checksum'
  | 'pending_verification'
  | 'simulated'
  | 'unverified';

export type ReadinessState =
  | 'verified'
  | 'reported'
  | 'simulated'
  | 'unknown'
  | 'not_configured'
  | 'not_connected';

export interface BackupReadinessRecord {
  id: string;
  scope: string; // e.g. "Primary PostgreSQL Cluster", "S3 Student Files Vault"
  storageLocation: string;
  frequency: string;
  lastReportedBackupTime: string;
  lastSuccessfulBackupTime?: string;
  verificationStatus: BackupVerificationStatus;
  lastRestoreTestTime?: string;
  rpoTargetMinutes?: number; // Recovery Point Objective in minutes
  rtoTargetHours?: number;   // Recovery Time Objective in hours
  recoveryRunbookStatus: 'documented_available' | 'draft' | 'missing';
  readinessState: ReadinessState;
  responsibleTeam: string;
  sourceClassification: SourceClassification;
  isDemoFixture: boolean;
}

// 10. Alert Rules & Thresholds
export type AlertComparisonOperator = '>' | '<' | '>=' | '<=' | '==';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  targetComponentId: string;
  targetComponentName: string;
  metricId: string;
  metricName: string;
  operator: AlertComparisonOperator;
  thresholdValue: number;
  unit: MetricUnit;
  evaluationWindow: string; // e.g. "5m", "15m", "1h"
  severity: AlertSeverity;
  isEnabled: boolean;
  notificationPolicyRef: string; // e.g. "Platform SRE Pager (Planned)"
  createdAt: string;
  updatedAt: string;
  sourceClassification: SourceClassification;
  isDemoFixture: boolean;
}

export interface CreateAlertRuleInput {
  name: string;
  description: string;
  targetComponentId: string;
  metricId: string;
  operator: AlertComparisonOperator;
  thresholdValue: number;
  unit: MetricUnit;
  evaluationWindow: string;
  severity: AlertSeverity;
  notificationPolicyRef?: string;
}

// 11. Multi-Tenant Operational Oversight
export interface TenantOperationalReadiness {
  organizationId: string;
  organizationName: string;
  organizationCode: string;
  lifecycleStatus: string;
  provisioningStatus: string;
  configuredModuleCount: number;
  platformDependencies: string[];
  tenantIntegrationStatus: {
    customDomainConfigured: boolean;
    sslCertificateStatus: 'active' | 'pending' | 'not_requested';
    ssoSamlConfigured: boolean;
    sisBridgeConfigured: boolean;
  };
  lastSyncTime?: string;
  openDemoIncidentsCount: number;
  telemetryAvailability: TelemetryAvailability;
  isDemoReadiness: true;
}

// 12. Health Summary
export interface PlatformHealthSummary {
  totalComponents: number;
  healthyCount: number;
  degradedCount: number;
  criticalCount: number;
  unknownCount: number;
  staleCount: number;
  notConnectedCount: number;
  maintenanceCount: number;
  openIncidentsCount: number;
  lastTelemetryUpdate: string;
  globalStatus: ComponentHealthStatus;
  // Aliases for convenience:
  healthyComponents?: number;
  degradedComponents?: number;
  criticalComponents?: number;
  unknownComponents?: number;
  staleComponents?: number;
  notConnectedComponents?: number;
  maintenanceComponents?: number;
  openIncidents?: number;
  overallStatus?: ComponentHealthStatus;
}
