/**
 * Domain contracts for Platform System Health and Operational Visibility.
 * NOTE: System health displays are explicit demonstration data fixtures until
 * real-time infrastructure metrics and backend telemetry endpoints are integrated.
 */

export type ServiceHealthStatus = 
  | 'operational' 
  | 'degraded' 
  | 'maintenance' 
  | 'outage' 
  | 'not_provisioned';

export type ServiceCategory = 
  | 'core_application' 
  | 'database_storage' 
  | 'external_integration' 
  | 'async_workers' 
  | 'security_auth';

export interface PlatformServiceHealth {
  id: string;
  name: string;
  category: ServiceCategory;
  status: ServiceHealthStatus;
  description: string;
  uptimeEstimate: string; // e.g. "99.98% (Demo)"
  latencyEstimate?: string; // e.g. "42ms (Demo)"
  lastChecked: string;
  dependencies: string[];
  isDemoFixture: true;
}

export interface PlatformIncidentNotice {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  affectedServices: string[];
  createdAt: string;
  resolvedAt?: string;
  description: string;
  updates: {
    timestamp: string;
    message: string;
    author: string;
  }[];
}
