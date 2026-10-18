/**
 * Deterministic Tenant Provisioning Simulator
 * Phase E-09.7 — School Management SaaS Super-Admin
 *
 * Provides a controlled, transparent local demonstration simulation of tenant provisioning.
 * Explicitly disclaims real infrastructure changes and records deterministic local mock events.
 */

import { Organization, Campus, ProvisioningStatus } from '../types';
import { OrganizationReadinessReport } from '../readiness/evaluator';

export interface SimulatedProvisioningEvent {
  id: string;
  organizationId: string;
  stepKey: string;
  stepName: string;
  status: 'succeeded' | 'failed' | 'skipped';
  message: string;
  timestamp: string;
}

export interface SimulationResult {
  success: boolean;
  status: ProvisioningStatus;
  events: SimulatedProvisioningEvent[];
  error?: string;
  summary: string;
}

export function executeSimulatedProvisioning(params: {
  organization: Organization;
  readiness: OrganizationReadinessReport;
  campuses: Campus[];
  forceFail?: boolean;
}): SimulationResult {
  const { organization: org, readiness, campuses, forceFail = false } = params;
  const now = new Date().toISOString();

  // 1. Guard against incomplete readiness
  if (readiness.hasBlockers) {
    const blockers = readiness.items
      .filter((i) => i.status === 'incomplete')
      .map((i) => i.title);

    return {
      success: false,
      status: 'needs_attention',
      events: [
        {
          id: `sim_evt_${Date.now()}_block`,
          organizationId: org.id,
          stepKey: 'prerequisite_check',
          stepName: 'Readiness Prerequisite Gate',
          status: 'failed',
          message: `Blocked: ${blockers.join(', ')} must be completed before simulated provisioning.`,
          timestamp: now,
        },
      ],
      error: `Cannot run provisioning simulation: ${blockers.length} unresolved readiness prerequisite(s).`,
      summary: 'Simulation halted at readiness validation gate.',
    };
  }

  // 2. Handle intentional demonstration failure
  if (forceFail) {
    return {
      success: false,
      status: 'simulated_failed',
      events: [
        {
          id: `sim_evt_${Date.now()}_1`,
          organizationId: org.id,
          stepKey: 'dns_check',
          stepName: 'Subdomain DNS Record Check',
          status: 'succeeded',
          message: `Verified mock route for https://${org.subdomain}.schoolsaas.internal.`,
          timestamp: now,
        },
        {
          id: `sim_evt_${Date.now()}_2`,
          organizationId: org.id,
          stepKey: 'db_partition',
          stepName: 'Database Tenant Isolation Partition',
          status: 'failed',
          message: 'Simulated infrastructure error: Simulated storage quota allocation limit reached.',
          timestamp: now,
        },
      ],
      error: 'Simulated provisioning failure triggered for demonstration and recovery testing.',
      summary: 'Demonstration failure recorded in local store.',
    };
  }

  // 3. Deterministic successful simulation sequence
  const events: SimulatedProvisioningEvent[] = [
    {
      id: `sim_evt_${Date.now()}_1`,
      organizationId: org.id,
      stepKey: 'dns_routing',
      stepName: 'Tenant Domain & Routing Resolution',
      status: 'succeeded',
      message: `Simulated DNS routing check passed for "${org.subdomain}.schoolsaas.internal".`,
      timestamp: now,
    },
    {
      id: `sim_evt_${Date.now()}_2`,
      organizationId: org.id,
      stepKey: 'db_container',
      stepName: 'Tenant Isolation Schema Partition',
      status: 'succeeded',
      message: 'Simulated multi-tenant relational schema container registered with RLS security policies.',
      timestamp: now,
    },
    {
      id: `sim_evt_${Date.now()}_3`,
      organizationId: org.id,
      stepKey: 'campus_link',
      stepName: 'Multi-Branch & Campus Initialization',
      status: 'succeeded',
      message: `Attached ${campuses.length} physical campus record(s) to tenant organizational partition.`,
      timestamp: now,
    },
    {
      id: `sim_evt_${Date.now()}_4`,
      organizationId: org.id,
      stepKey: 'module_catalog',
      stepName: 'Master Module Registry Entitlement Cache',
      status: 'succeeded',
      message: 'Compiled active module access tables across 321 canonical modules for assigned plan.',
      timestamp: now,
    },
    {
      id: `sim_evt_${Date.now()}_5`,
      organizationId: org.id,
      stepKey: 'admin_dispatch',
      stepName: 'Administrator Onboarding Notification',
      status: 'succeeded',
      message: `Simulated dispatch of activation token to ${org.administrator.email} (mock local buffer).`,
      timestamp: now,
    },
  ];

  return {
    success: true,
    status: 'simulated_complete',
    events,
    summary: 'All 5 simulated provisioning stages successfully recorded in local development state.',
  };
}
