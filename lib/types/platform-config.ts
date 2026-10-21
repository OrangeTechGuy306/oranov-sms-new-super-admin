/**
 * Phase E-09.15: Platform Configuration, Feature Flags and Global Settings Governance.
 * Domain contracts for enterprise Super-Admin configuration management, feature flags,
 * scoped tenant overrides, rollout planning, change governance, and configuration versioning.
 *
 * NOTE: Client-side records represent local development mock state and architecture contracts.
 * Real persistence, live gateway propagation, cryptographic token signing, and backend
 * feature-flag enforcement belong to future server-side implementation.
 */

import { PlatformBranding, PlatformRegionalConfig, PlatformOnboardingPolicy, PlatformMaintenanceConfig } from './settings';

// ==========================================
// 1. EXTENDED PLATFORM SETTINGS
// ==========================================

export interface PlatformAcademicDefaults {
  defaultTermSystem: 'termly' | 'semester' | 'quarterly';
  defaultGradingScale: 'standard_letter' | 'percentage' | 'gpa_4' | 'waec_standard';
  autoArchiveCompletedSessions: boolean;
  defaultAttendanceMode: 'daily' | 'subject_wise' | 'biometric';
  allowCrossCampusEnrollment: boolean;
}

export interface PlatformSecurityPolicy {
  sessionTimeoutMinutes: number;
  requireMfaForSuperAdmins: boolean;
  requireMfaForTenantAdmins: boolean;
  passwordMinLength: number;
  maxFailedLoginAttempts: number;
  ipAllowlistingEnabled: boolean;
  passwordExpiryDays: number;
}

export interface PlatformNotificationDefaults {
  defaultSenderName: string;
  defaultSenderEmail: string;
  enableSmsNotifications: boolean;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  adminDigestFrequency: 'realtime' | 'daily' | 'weekly';
}

export interface ExtendedPlatformSettings {
  branding: PlatformBranding & {
    primaryColor: string;
    secondaryColor: string;
    faviconUrl?: string;
  };
  regional: PlatformRegionalConfig & {
    timeFormat: '12h' | '24h';
    weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
    numberFormat: 'standard' | 'european' | 'indian';
  };
  onboardingPolicy: PlatformOnboardingPolicy & {
    defaultEnabledModules: string[];
    defaultStudentQuota: number;
    defaultStaffQuota: number;
    defaultCampusQuota: number;
  };
  academicDefaults: PlatformAcademicDefaults;
  securityPolicy: PlatformSecurityPolicy;
  notificationDefaults: PlatformNotificationDefaults;
  maintenance: PlatformMaintenanceConfig;
}

// ==========================================
// 2. FEATURE FLAGS DOMAIN
// ==========================================

export type FeatureFlagLifecycle = 
  | 'draft' 
  | 'active' 
  | 'disabled' 
  | 'scheduled' 
  | 'archived';

export type FeatureFlagRisk = 'standard' | 'elevated' | 'critical';

export type FeatureFlagCategory = 
  | 'academics' 
  | 'admissions' 
  | 'student_information' 
  | 'examinations_cbt' 
  | 'finance' 
  | 'human_resources' 
  | 'communications' 
  | 'reporting' 
  | 'integrations' 
  | 'platform_operations' 
  | 'experimental';

export type FeatureFlagScope = 'global' | 'environment' | 'tenant_override';

export type FeatureFlagEnvironment = 'all' | 'development' | 'staging' | 'production';

export type RolloutStrategy = 
  | 'all_tenants' 
  | 'selective_tenants' 
  | 'percentage_rollout' 
  | 'allowlist_schedule';

export type FeatureFlagSourceStatus = 
  | 'verified_local_mock' 
  | 'static_default' 
  | 'unconnected_remote';

export interface FeatureFlag {
  id: string; // e.g. "flag_001"
  key: string; // Unique, stable slug: e.g. "feat.cbt.instant_scoring"
  name: string;
  description: string;
  category: FeatureFlagCategory;
  lifecycle: FeatureFlagLifecycle;
  defaultValue: boolean;
  enabled: boolean;
  scope: FeatureFlagScope;
  environment: FeatureFlagEnvironment;
  risk: FeatureFlagRisk;
  owner: string; // Team or engineer
  createdAt: string;
  updatedAt: string;
  dependsOnFlagKeys: string[]; // Dependencies that must be enabled
  dependentFlags?: string[]; // Computed: flags that depend on this
  rolloutStrategy: RolloutStrategy;
  rolloutPercentage?: number; // 0 - 100
  rolloutTenantIds?: string[]; // Explicit allowed organizations
  rolloutScheduledStart?: string;
  rolloutScheduledEnd?: string;
  relatedModuleId?: string; // Linked module from E-09.6 if applicable
  sourceStatus: FeatureFlagSourceStatus;
  backendEnforcementNotice?: string;
}

// ==========================================
// 3. TENANT OVERRIDES & PRECEDENCE RESOLUTION
// ==========================================

export interface TenantFeatureOverride {
  id: string;
  organizationId: string;
  flagKey: string;
  overrideValue: boolean;
  reason: string;
  actor: string;
  actorName?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export type ConfigurationPrecedenceLayer = 
  | 'platform_default' 
  | 'environment_override' 
  | 'organization_override';

export interface EffectiveConfigurationResult {
  flagKey: string;
  flagName: string;
  organizationId?: string;
  organizationName?: string;
  environment: string;
  effectiveValue: boolean;
  resolvedScope: ConfigurationPrecedenceLayer;
  inheritanceSource: string;
  isEntitlementSatisfied: boolean;
  entitlementNotice?: string;
  isDependencySatisfied: boolean;
  missingDependencies: string[];
  isArchivedBlocked: boolean;
  isOverridden: boolean;
  safeFailureState: boolean;
  failureReason?: string;
}

// ==========================================
// 4. ENVIRONMENT & SECRET METADATA (SAFE)
// ==========================================

export type SafeSecretStatus = 
  | 'secret_required' 
  | 'reference_configured' 
  | 'secret_missing' 
  | 'unconnected';

export interface SafeSecretMetadataItem {
  keyName: string; // e.g. "DATABASE_URL", "JWT_SIGNING_KEY"
  status: SafeSecretStatus;
  description: string;
  provider: 'vault' | 'aws_secrets_manager' | 'local_env_file' | 'unconnected';
  lastRotated?: string;
}

export interface PlatformEnvironmentConfig {
  environmentId: 'development' | 'staging' | 'production';
  name: string;
  source: 'local_mock_state' | 'synthetic_fixture' | 'disconnected_remote';
  status: 'operational' | 'isolated' | 'degraded' | 'disconnected';
  apiUrl: string;
  lastSyncTimestamp: string;
  activeFlagCount: number;
  secretMetadata: SafeSecretMetadataItem[];
  notes: string;
}

// ==========================================
// 5. CHANGE GOVERNANCE & APPROVAL WORKFLOW
// ==========================================

export type ProposalStatus = 
  | 'draft' 
  | 'pending_review' 
  | 'approved' 
  | 'rejected' 
  | 'applied_locally' 
  | 'cancelled';

export interface ProposalDiffItem {
  field: string;
  previousValue?: string | number | boolean | null;
  proposedValue?: string | number | boolean | null;
  oldValue?: string | number | boolean | null;
  newValue?: string | number | boolean | null;
}

export interface ConfigurationChangeProposal {
  id: string;
  title: string;
  description: string;
  reason: string;
  scope: 'platform_settings' | 'feature_flag' | 'tenant_override' | 'rollout_plan';
  targetEntity: string;
  targetId: string;
  status: ProposalStatus;
  author: {
    id: string;
    name: string;
    role: string;
  };
  reviewer?: {
    id: string;
    name: string;
    role: string;
    notes?: string;
    reviewedAt?: string;
  };
  diff: ProposalDiffItem[];
  createdAt: string;
  updatedAt: string;
  appliedAt?: string;
}

// ==========================================
// 6. ROLLOUT PLANNING DEMO
// ==========================================

export interface RolloutPlanInput {
  flagKey: string;
  strategy: RolloutStrategy;
  targetPercentage?: number;
  targetOrganizationIds?: string[];
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  notes: string;
}

export interface RolloutPreviewSummary {
  eligibleTenantCount: number;
  targetedTenantCount: number;
  estimatedAffectedUsers: number;
  dependenciesSatisfied: boolean;
  dependencyErrors: string[];
  warnings: string[];
  isDemonstrationOnly: true;
}

// ==========================================
// 7. CONFIGURATION VERSION HISTORY & DIFF
// ==========================================

export interface ConfigVersionEntry {
  id: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  entityType: 'PlatformSettings' | 'FeatureFlag' | 'TenantOverride' | 'EnvironmentConfig';
  entityId: string;
  entityName: string;
  action: 'CREATE' | 'UPDATE' | 'RESTORE' | 'TOGGLE' | 'OVERRIDE' | 'DELETE';
  scope: string;
  reason: string;
  diff: ProposalDiffItem[];
  proposalId?: string;
  canRestore: boolean;
}

// ==========================================
// 8. IMPORT & EXPORT CONTRACTS
// ==========================================

export interface ConfigExportPackage {
  schemaVersion: '1.0.0';
  exportedAt: string;
  exportedBy: string;
  exportScope: 'all' | 'settings_only' | 'flags_only' | 'overrides_only';
  isDemonstrationData: true;
  settings?: Partial<ExtendedPlatformSettings>;
  flags?: Partial<FeatureFlag>[];
  overrides?: Partial<TenantFeatureOverride>[];
}

export interface ConfigImportPreviewItem {
  entity: 'setting' | 'flag' | 'override';
  key: string;
  action: 'create' | 'update' | 'skip' | 'reject';
  reason?: string;
}

export interface ConfigImportValidationResult {
  isValid: boolean;
  schemaVersion: string;
  createCount: number;
  updateCount: number;
  skipCount: number;
  rejectCount: number;
  errors: string[];
  warnings: string[];
  previewItems: ConfigImportPreviewItem[];
}
