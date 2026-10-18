/**
 * Deterministic Initial Organization Module Overrides
 * Phase E-09.6: Realistic demonstration fixtures for tenant-specific entitlement overrides.
 *
 * Clearly marked as local development fixtures; does not represent production authorization claims.
 */

import { OrganizationModuleOverride } from './types';

export const INITIAL_ORGANIZATION_OVERRIDES: OrganizationModuleOverride[] = [
  {
    organizationId: 'org_004',
    moduleId: 'mod_library',
    action: 'force_enable',
    reason: 'Granted access to Digital Library & Barcode Automation during pilot regional literacy program.',
    appliedBy: 'admin_usr_01 (Super Admin)',
    appliedAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-02-15T10:00:00Z',
  },
  {
    organizationId: 'org_004',
    moduleId: 'mod_cafeteria',
    action: 'force_enable',
    reason: 'Subsidized government dining and meal voucher scheme pilot approved by Platform Operations.',
    appliedBy: 'admin_usr_01 (Super Admin)',
    appliedAt: '2026-02-20T14:30:00Z',
    updatedAt: '2026-02-20T14:30:00Z',
  },
  {
    organizationId: 'org_002',
    moduleId: 'mod_hostel',
    action: 'force_disable',
    reason: 'Pure day-school facility; residential boarding modules explicitly disabled per school request.',
    appliedBy: 'admin_usr_02 (Compliance Officer)',
    appliedAt: '2026-01-22T09:15:00Z',
    updatedAt: '2026-01-22T09:15:00Z',
  },
  {
    organizationId: 'org_002',
    moduleId: 'mod_analytics',
    action: 'force_enable',
    reason: 'Special promotional entitlement grant for Executive BI and Cohort Retention analytics.',
    appliedBy: 'admin_usr_01 (Super Admin)',
    appliedAt: '2026-02-01T11:45:00Z',
    updatedAt: '2026-02-01T11:45:00Z',
  },
  {
    organizationId: 'org_003',
    moduleId: 'mod_procurement',
    action: 'force_enable',
    reason: 'Trial license for multi-level purchase orders and supplier catalogue management.',
    appliedBy: 'admin_usr_03 (Support Lead)',
    appliedAt: '2026-02-10T16:20:00Z',
    updatedAt: '2026-02-10T16:20:00Z',
  },
];
