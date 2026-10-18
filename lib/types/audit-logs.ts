/**
 * Domain contracts for Platform Administrative Audit Logs.
 * NOTE: Client-side records are development fixtures and local UI event captures.
 * Production audit logging requires backend immutability and cryptographic guarantees.
 */

export type AuditEventCategory = 
  | 'organization_lifecycle' 
  | 'subscription_billing' 
  | 'platform_access' 
  | 'system_configuration' 
  | 'feature_toggles' 
  | 'security';

export type AuditEventSeverity = 'info' | 'warning' | 'critical';

export interface AuditActor {
  id: string;
  name: string;
  email: string;
  role: string;
  ipAddress?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  category: AuditEventCategory;
  action: string;
  severity: AuditEventSeverity;
  actor: AuditActor;
  targetEntity: string; // e.g. "Organization", "SubscriptionPlan", "PlatformUser"
  targetId: string;
  targetName?: string;
  status: 'succeeded' | 'failed' | 'rejected';
  details: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface AuditLogFilter {
  category?: AuditEventCategory | 'all';
  severity?: AuditEventSeverity | 'all';
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  actorId?: string;
}
