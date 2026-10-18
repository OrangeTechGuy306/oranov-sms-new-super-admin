/**
 * Master Tenant Module Registry & Feature Entitlements Domain Types
 * Phase E-09.6: Canonical registry contracts, precedence evaluation, and governance.
 */

import { PlanTier } from '../types/subscriptions';
import { FeatureCategory } from '../types/settings';

export type TenantModuleCategory =
  | 'core_dashboard'
  | 'students_admissions'
  | 'parents_guardians'
  | 'faculty_staff'
  | 'academics_curriculum'
  | 'attendance_operations'
  | 'timetables_scheduling'
  | 'examinations_cbt'
  | 'results_grading'
  | 'learning_lms'
  | 'communication_messaging'
  | 'calendar_events'
  | 'finance_bursary'
  | 'hr_payroll'
  | 'library_circulation'
  | 'inventory_assets'
  | 'procurement_orders'
  | 'transport_fleet'
  | 'hostel_residential'
  | 'cafeteria_dining'
  | 'health_infirmary'
  | 'behaviour_discipline'
  | 'activities_clubs'
  | 'safeguarding_dsl'
  | 'engagement_community'
  | 'security_gate'
  | 'documents_records'
  | 'analytics_intelligence'
  | 'reports_data_quality'
  | 'campuses_governance'
  | 'tenant_settings'
  | 'system_platform';

export interface CategoryMeta {
  key: TenantModuleCategory;
  label: string;
  macroCategory: FeatureCategory;
  iconName: string;
  description: string;
}

export type ImplementationStatus =
  | 'implemented'
  | 'partial'
  | 'planned'
  | 'missing'
  | 'unknown';

export type PlatformAvailabilityStatus =
  | 'enabled'
  | 'disabled'
  | 'restricted';

export type EntitlementStatus =
  | 'included'
  | 'excluded'
  | 'add_on'
  | 'not_entitled';

export type EffectiveEntitlementStatus =
  | 'available'
  | 'unavailable'
  | 'restricted'
  | 'unresolved';

export type OrganizationOverrideAction =
  | 'inherit'
  | 'force_enable'
  | 'force_disable';

export interface ModuleDependency {
  moduleId: string;
  type: 'required' | 'optional';
  description: string;
}

export interface SourceEvidence {
  routePath: string;
  componentEntry?: string;
  typeDefinition?: string;
  mockStore?: string;
  testSuite?: string;
  navGroupId: string;
}

export interface TenantModuleDefinition {
  id: string;
  navId: string;
  name: string;
  code: string;
  description: string;
  category: TenantModuleCategory;
  macroCategory: FeatureCategory;
  parentId?: string;
  href: string;
  routes: string[];
  status: ImplementationStatus;
  statusRationale: string;
  isGloballyEnabled: boolean;
  includedInPlans: PlanTier[];
  requiresAddonLicense?: boolean;
  dependencies: ModuleDependency[];
  requiredPermissions: string[];
  allowedRoles: string[];
  sourceEvidence: SourceEvidence;
  supportedWorkflows: string[];
  knownLimitations?: string[];
  futureBackendRequirements?: string[];
  dataSensitivity: 'public' | 'internal' | 'confidential' | 'restricted_pii' | 'sensitive_health_dsl';
  displayOrder: number;
}

export interface OrganizationModuleOverride {
  organizationId: string;
  moduleId: string;
  action: OrganizationOverrideAction;
  reason: string;
  appliedBy: string;
  appliedAt: string;
  updatedAt?: string;
}

export interface UnsatisfiedDependencyDetail {
  moduleId: string;
  moduleName: string;
  type: 'required' | 'optional';
  reason: string;
}

export interface EffectiveEntitlementResult {
  moduleId: string;
  moduleName: string;
  organizationId?: string;
  planId?: string;
  planTier?: PlanTier;
  isRegistered: boolean;
  implementationStatus: ImplementationStatus;
  platformAvailability: PlatformAvailabilityStatus;
  planInclusion: EntitlementStatus;
  overrideAction: OrganizationOverrideAction;
  overrideReason?: string;
  dependenciesSatisfied: boolean;
  unsatisfiedDependencies: UnsatisfiedDependencyDetail[];
  effectiveStatus: EffectiveEntitlementStatus;
  reason: string;
  precedenceApplied:
    | 'UNREGISTERED_GUARD'
    | 'PLATFORM_DISABLEMENT'
    | 'IMPLEMENTATION_GUARD'
    | 'ORGANIZATION_FORCE_DISABLE'
    | 'DEPENDENCY_FAILURE'
    | 'ORGANIZATION_FORCE_ENABLE'
    | 'PLAN_INCLUDED'
    | 'PLAN_EXCLUDED'
    | 'DEFAULT_INHERITED';
}

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface RegistryValidationIssue {
  id: string;
  severity: ValidationSeverity;
  category: 'identity' | 'parent' | 'dependency' | 'cycle' | 'route' | 'plan' | 'override' | 'evidence';
  moduleId?: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface RegistryValidationReport {
  isValid: boolean;
  timestamp: string;
  totalModulesCount: number;
  topLevelModulesCount: number;
  submodulesCount: number;
  mappedRoutesCount: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  issues: RegistryValidationIssue[];
}

export interface ModuleCatalogueFilter {
  searchQuery: string;
  category: TenantModuleCategory | 'all';
  macroCategory: FeatureCategory | 'all';
  implementationStatus: ImplementationStatus | 'all';
  platformAvailability: 'all' | 'enabled' | 'disabled';
  planTier: PlanTier | 'all';
  dependencyState: 'all' | 'satisfied' | 'has_dependencies' | 'unresolved';
  organizationOverrideState: 'all' | 'inherited' | 'overridden';
}
