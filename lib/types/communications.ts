/**
 * Platform Communications, Notification Templates & Delivery Governance Types
 * Phase E-09.16: Platform Notifications, Communication Templates and Delivery Governance
 */

export type ChannelType = 'email' | 'sms' | 'in_app' | 'push' | 'whatsapp';

export type TemplateCategory =
  | 'account_verification'
  | 'password_reset'
  | 'welcome_onboarding'
  | 'org_provisioning'
  | 'subscription_billing'
  | 'platform_maintenance'
  | 'security_alerts'
  | 'administrative_alerts'
  | 'school_onboarding'
  | 'platform_announcements';

export type TemplateStatus = 'draft' | 'in_review' | 'approved' | 'active' | 'archived';

export type NotificationPriority = 'critical' | 'high' | 'normal' | 'low';

export type DeliveryStatus =
  | 'draft'
  | 'queued'
  | 'processing'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'suppressed'
  | 'cancelled';

export type FailureClassification =
  | 'invalid_destination'
  | 'missing_configuration'
  | 'template_validation_error'
  | 'provider_unavailable'
  | 'rate_limited'
  | 'suppressed_by_policy'
  | 'delivery_receipt_timeout'
  | 'unknown_failure';

export type ProviderConfigStatus =
  | 'configured'
  | 'not_configured'
  | 'missing_vault_secret'
  | 'disabled';

export type ProviderConnectionStatus =
  | 'not_connected'
  | 'simulation_only'
  | 'degraded'
  | 'unknown';

export type ProviderReadinessTier =
  | 'ui_available'
  | 'demo_model'
  | 'verified_connected'
  | 'backend_ready';

export type AudienceScope =
  | 'all_schools'
  | 'tier_enterprise'
  | 'tier_growth'
  | 'selected_tenants';

export type CampaignStatus = 'draft' | 'pending_approval' | 'approved' | 'cancelled';

export interface TemplateVariableDefinition {
  key: string;
  label: string;
  description: string;
  dataType: 'string' | 'number' | 'date' | 'url';
  required: boolean;
  supportedCategories?: TemplateCategory[];
  supportedChannels?: ChannelType[];
  exampleValue: string;
}

export interface CommunicationTemplate {
  id: string;
  key: string;
  name: string;
  description: string;
  category: TemplateCategory;
  channel: ChannelType;
  locale: string;
  subject?: string;
  body: string;
  status: TemplateStatus;
  version: string;
  supportedVariables: string[];
  reviewNotes?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  isDemoFixture: boolean;
}

export interface TemplateVersionEntry {
  id: string;
  templateId: string;
  templateKey: string;
  versionNumber: string;
  subject?: string;
  body: string;
  changeSummary: string;
  author: string;
  status: TemplateStatus;
  createdAt: string;
  isCurrent: boolean;
  approvalNotes?: string;
}

export interface QuietHoursConfig {
  enabled: boolean;
  startTimeUtc: string; // HH:MM format, e.g. "22:00"
  endTimeUtc: string;   // HH:MM format, e.g. "07:00"
  allowCriticalBypass: boolean;
  timezone: string;
}

export interface NotificationPolicy {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  applicableChannels: ChannelType[];
  scope: 'platform_wide' | 'tenant_specific';
  targetTenantId?: string;
  priority: NotificationPriority;
  enabled: boolean;
  quietHours: QuietHoursConfig;
  localeRequired?: string;
  requiredTemplateKey: string;
  rateLimitPerHour?: number;
  suppressionConditions: string[];
  version: string;
  updatedAt: string;
}

export interface ProviderRecord {
  id: string;
  displayName: string;
  channel: ChannelType;
  purpose: string;
  configStatus: ProviderConfigStatus;
  connectionStatus: ProviderConnectionStatus;
  readinessTier: ProviderReadinessTier;
  vaultSecretRef: string;
  lastSimulatedActivity?: string;
  lastFailureNotice?: string;
  supportedCapabilities: string[];
  requiredEnvKeys: string[];
  notes: string;
  isDemoFixture: boolean;
}

export interface DeliveryTimelineEvent {
  timestamp: string;
  status: DeliveryStatus;
  note: string;
}

export interface NotificationRecord {
  id: string;
  category: TemplateCategory;
  channel: ChannelType;
  templateKey: string;
  templateVersion: string;
  tenantId?: string;
  tenantName?: string;
  recipientDisplay: string; // Synthetic display, e.g. "principal.demo@oakhill.internal"
  status: DeliveryStatus;
  priority: NotificationPriority;
  subject?: string;
  renderedPreview: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  deliveredAt?: string;
  failureReason?: string;
  failureClassification?: FailureClassification;
  retryCount: number;
  maxRetries: number;
  sourceType: 'automated_system' | 'campaign_broadcast' | 'admin_simulation' | 'policy_evaluation';
  relatedPolicyId?: string;
  relatedCampaignId?: string;
  auditCorrelationId?: string;
  timeline: DeliveryTimelineEvent[];
  reviewNote?: string;
  isDemoFixture: boolean;
}

export interface CampaignAudienceEstimate {
  totalTenants: number;
  estimatedRecipients: number;
  calculationBasis: string;
}

export interface CampaignDraft {
  id: string;
  name: string;
  description: string;
  audienceScope: AudienceScope;
  targetTenantIds?: string[];
  channel: ChannelType;
  templateKey: string;
  scheduledAt: string;
  timezone: string;
  status: CampaignStatus;
  estimatedAudience: CampaignAudienceEstimate;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface TenantCommunicationConfig {
  tenantId: string;
  tenantName: string;
  planTier: string;
  enabledChannels: Record<ChannelType, boolean>;
  customSenderName?: string;
  quietHours: {
    enabled: boolean;
    startLocalTime: string;
    endLocalTime: string;
    timezone: string;
  };
  customTemplateOverridesCount: number;
  readinessStatus: 'ready' | 'incomplete_config' | 'policy_restricted';
  consentRegistryStatus: 'not_configured_backend_required';
  lastReportedActivity?: string;
  updatedAt: string;
}

export interface NotificationPreferenceGovernance {
  categoryRules: Array<{
    category: TemplateCategory;
    isMandatory: boolean; // Cannot opt-out if mandatory (e.g. security advisories)
    description: string;
    allowedChannels: ChannelType[];
    defaultFrequencyCapPerHour: number;
  }>;
  quietHoursDefault: QuietHoursConfig;
  globalSmsRateLimitPerHour: number;
}

export interface PolicyEvaluationSimulationInput {
  category: TemplateCategory;
  channel: ChannelType;
  tenantId?: string;
  currentTimeUtc: string;
  recipientType?: string;
}

export interface PolicyEvaluationResult {
  matchedPolicy?: NotificationPolicy;
  selectedTemplate?: CommunicationTemplate;
  applicableChannels: ChannelType[];
  decision: 'allowed' | 'suppressed' | 'no_policy_matched';
  reasons: string[];
  warnings: string[];
  quietHoursActive: boolean;
  isCriticalBypass: boolean;
  rateLimitExceeded: boolean;
}

export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequiredVariables: string[];
  unknownVariables: string[];
  syntaxErrors: string[];
  characterCount: number;
  estimatedSegments?: number; // For SMS
}

export interface CommunicationExportPackage {
  formatVersion: '1.0';
  exportedAt: string;
  environment: string;
  actor: string;
  scope: string;
  templates: Array<Omit<CommunicationTemplate, 'id'>>;
  policies: Array<Omit<NotificationPolicy, 'id'>>;
  providers: Array<{
    displayName: string;
    channel: ChannelType;
    purpose: string;
    configStatus: ProviderConfigStatus;
    connectionStatus: ProviderConnectionStatus;
    readinessTier: ProviderReadinessTier;
    supportedCapabilities: string[];
    requiredEnvKeys: string[];
  }>;
  campaigns: Array<Omit<CampaignDraft, 'id'>>;
  summaryMetrics: {
    totalTemplates: number;
    totalPolicies: number;
    totalProviders: number;
    totalCampaigns: number;
  };
}

export interface CommunicationImportResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  templatesToImport: number;
  policiesToImport: number;
  campaignsToImport: number;
  summary: string;
}
