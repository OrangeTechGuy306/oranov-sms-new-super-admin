/**
 * Domain contracts for Platform Administrative Audit Logs (Phase E-09.13).
 * NOTE: Client-side records are development fixtures and local UI event captures.
 * Production audit logging requires backend immutability and cryptographic guarantees.
 */

export type AuditEventCategory = 
  | 'organization_lifecycle' 
  | 'subscription_billing' 
  | 'platform_access' 
  | 'system_configuration' 
  | 'feature_toggles' 
  | 'security'
  | 'module_entitlements'
  | 'academic_governance'
  | 'examination_governance'
  | 'data_retention'
  | 'compliance_governance'
  | 'data_export';

export type AuditEventSeverity = 'info' | 'warning' | 'critical';

export type AuditActorType = 
  | 'super_admin' 
  | 'platform_operator' 
  | 'support_lead' 
  | 'compliance_auditor' 
  | 'system_process' 
  | 'automated_job';

export interface AuditActor {
  id: string;
  name: string;
  email: string;
  role: string;
  actorType?: AuditActorType;
  ipAddress?: string;
  userAgent?: string;
}

export type AuditEventOutcome = 'succeeded' | 'failed' | 'rejected';

export type AuditEventSourceClassification = 
  | 'client_simulation' 
  | 'mock_fixture' 
  | 'local_storage' 
  | 'synthetic_telemetry';

export interface AuditEventDiffItem {
  field: string;
  previousValue: string | number | boolean | null;
  newValue: string | number | boolean | null;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  category: AuditEventCategory;
  action: string;
  severity: AuditEventSeverity;
  actor: AuditActor;
  targetEntity: string; // e.g. "Organization", "SubscriptionPlan", "PlatformUser", "PlatformRole", "ComplianceControl"
  targetId: string;
  targetName?: string;
  organizationId?: string; // Optional school organization reference
  status: AuditEventOutcome;
  details: string;
  correlationId?: string;
  sourceClassification?: AuditEventSourceClassification;
  isDemoFixture?: boolean;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  diff?: AuditEventDiffItem[];
}

export interface AuditLogFilter {
  category?: AuditEventCategory | 'all';
  severity?: AuditEventSeverity | 'all';
  status?: AuditEventOutcome | 'all';
  organizationId?: string | 'all';
  actorId?: string | 'all';
  actorRole?: string | 'all';
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'timestamp_desc' | 'timestamp_asc' | 'severity' | 'action';
}
