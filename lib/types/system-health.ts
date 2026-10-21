/**
 * Domain contracts for Platform System Health and Operational Visibility.
 * Phase E-09.14: Extended with comprehensive Observability & Platform Operations Governance.
 */

export * from '../system-health/types';

// Backwards-compatible aliases for legacy imports
import type {
  ComponentHealthStatus,
  ComponentCategory,
} from '../system-health/types';

export type ServiceHealthStatus = 
  | 'operational' 
  | 'degraded' 
  | 'maintenance' 
  | 'outage' 
  | 'not_provisioned'
  | ComponentHealthStatus;

export type ServiceCategory = 
  | 'core_application' 
  | 'database_storage' 
  | 'external_integration' 
  | 'async_workers' 
  | 'security_auth'
  | ComponentCategory;

export interface PlatformServiceHealth {
  id: string;
  name: string;
  category: ServiceCategory;
  status: ServiceHealthStatus;
  description: string;
  uptimeEstimate: string;
  latencyEstimate?: string;
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
