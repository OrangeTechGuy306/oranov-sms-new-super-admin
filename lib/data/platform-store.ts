import {
  Organization,
  SubscriptionPlan,
  OrganizationSubscription,
  Invoice,
  PaymentRecord,
  PaymentMethodType,
  PlatformUser,
  AuditEvent,
  PlatformServiceHealth,
  PlatformIncidentNotice,
  PlatformSettings,
  PlatformFeatureItem,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  AuditLogFilter,
  OrganizationLifecycleStatus,
  PlatformRoleKey,
  Campus,
  CreateCampusInput,
  UpdateCampusInput,
  CampusStatus,
  ProvisioningStatus,
  SubscriptionStatus,
} from '../types';

import {
  INITIAL_PLANS,
  INITIAL_ORGANIZATIONS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_PLATFORM_USERS,
  INITIAL_SYSTEM_SERVICES,
  INITIAL_INCIDENTS,
  INITIAL_FEATURES,
  INITIAL_PLATFORM_SETTINGS,
  INITIAL_CAMPUSES,
  INITIAL_DISCOUNT_POLICIES,
  INITIAL_LIFECYCLE_EVENTS,
} from './initial-data';

import {
  SecurityEvent,
  SecurityTriageStatus,
  ComplianceControl,
  GovernanceEvidence,
  DataRetentionPolicy,
} from '../types/compliance';
import {
  INITIAL_EXTENDED_AUDIT_EVENTS,
  INITIAL_SECURITY_EVENTS,
  INITIAL_COMPLIANCE_CONTROLS,
  INITIAL_GOVERNANCE_EVIDENCE,
  INITIAL_DATA_RETENTION_POLICIES,
} from '../compliance/fixtures';
import {
  filterAuditEvents,
  filterSecurityEvents,
  filterComplianceControls,
  filterGovernanceEvidence,
  filterRetentionPolicies,
  validateRetentionPolicyUpdate,
  validateSecurityTriageUpdate,
} from '../compliance/evaluator';

import {
  DiscountPolicy,
  SubscriptionLifecycleEvent,
  CreatePlanInput,
  UpdatePlanInput,
  CreateDiscountInput,
  MonetizationAnalyticsSummary,
} from '../monetization/types';
import {
  validatePlanDefinition,
  validateDiscountPolicy,
  validateSubscriptionTransition,
  computeMonetizationAnalytics,
  round2,
} from '../monetization/evaluator';

import {
  TenantModuleDefinition,
  OrganizationModuleOverride,
  OrganizationOverrideAction,
  EffectiveEntitlementResult,
  RegistryValidationReport,
} from '../modules/types';
import { MASTER_MODULE_REGISTRY } from '../modules/registry-data';
import { INITIAL_ORGANIZATION_OVERRIDES } from '../modules/initial-overrides';
import { evaluateModuleEntitlement } from '../modules/evaluator';
import { validateModuleRegistry } from '../modules/validator';
import { evaluateLifecycleTransition } from '../lifecycle/evaluator';
import { evaluateOrganizationReadiness, OrganizationReadinessReport } from '../readiness/evaluator';
import { executeSimulatedProvisioning, SimulatedProvisioningEvent } from '../provisioning/simulator';
import {
  PlatformPermission,
  PlatformRole,
  CreateCustomRoleInput,
} from '../types/iam';
import {
  INITIAL_PLATFORM_PERMISSIONS,
  INITIAL_PLATFORM_ROLES,
} from '../iam/fixtures';
import {
  validateRoleAssignment,
  validateRoleDefinition,
} from '../iam/evaluator';

import {
  OperationalComponent,
  PlatformIncident,
  MaintenanceWindow,
  DeploymentRecord,
  BackgroundJobStatus,
  ExternalIntegrationRecord,
  ResourceCapacityObservation,
  BackupReadinessRecord,
  AlertRule,
  CreateMaintenanceInput,
  CreateAlertRuleInput,
  IncidentLifecycleStatus,
} from '../system-health/types';
import {
  INITIAL_OPERATIONAL_COMPONENTS,
  INITIAL_PLATFORM_INCIDENTS,
  INITIAL_MAINTENANCE_WINDOWS,
  INITIAL_DEPLOYMENT_RECORDS,
  INITIAL_BACKGROUND_JOBS,
  INITIAL_EXTERNAL_INTEGRATIONS,
  INITIAL_CAPACITY_OBSERVATIONS,
  INITIAL_BACKUP_RECORDS,
  INITIAL_ALERT_RULES,
  METRIC_DEFINITIONS,
} from '../system-health/fixtures';
import {
  validateIncidentTransition,
  validateMaintenanceWindow,
  validateAlertRule,
} from '../system-health/evaluator';

import {
  ExtendedPlatformSettings,
  FeatureFlag,
  FeatureFlagLifecycle,
  TenantFeatureOverride,
  PlatformEnvironmentConfig,
  ConfigurationChangeProposal,
  ProposalStatus,
  ConfigVersionEntry,
  RolloutPlanInput,
  RolloutPreviewSummary,
  EffectiveConfigurationResult,
  ConfigExportPackage,
  ConfigImportValidationResult,
} from '../types/platform-config';
import {
  INITIAL_EXTENDED_PLATFORM_SETTINGS,
  INITIAL_FEATURE_FLAGS,
  INITIAL_TENANT_OVERRIDES,
  INITIAL_ENVIRONMENTS,
  INITIAL_CHANGE_PROPOSALS,
  INITIAL_CONFIG_VERSIONS,
} from '../platform-config/fixtures';
import {
  evaluateEffectiveConfiguration,
  estimateRolloutScope,
  canTransitionLifecycle,
} from '../platform-config/evaluator';
import {
  validatePlatformSettings,
  validateFeatureFlag,
  validateRolloutPlan,
  validateChangeProposal,
} from '../platform-config/validator';
import {
  exportConfigurationPackage,
  validateImportPackage,
} from '../platform-config/exporter';

import {
  CommunicationTemplate,
  TemplateVersionEntry,
  NotificationPolicy,
  ProviderRecord,
  NotificationRecord,
  CampaignDraft,
  TenantCommunicationConfig,
  NotificationPreferenceGovernance,
  TemplateStatus,
  DeliveryStatus,
  CommunicationExportPackage,
  CommunicationImportResult,
} from '../types/communications';
import {
  INITIAL_COMMUNICATION_TEMPLATES,
  INITIAL_TEMPLATE_VERSIONS,
  INITIAL_NOTIFICATION_POLICIES,
  INITIAL_COMMUNICATION_PROVIDERS,
  INITIAL_NOTIFICATION_RECORDS,
  INITIAL_CAMPAIGN_DRAFTS,
  INITIAL_TENANT_COMMUNICATION_CONFIGS,
  NOTIFICATION_PREFERENCE_GOVERNANCE,
} from '../communications/fixtures';
import {
  canTransitionTemplateStatus,
  renderTemplatePreview,
  canRetryNotification,
  computeCommunicationMetrics,
  estimateCampaignAudience,
} from '../communications/evaluator';
import {
  exportCommunicationPackage,
  validateImportCommunicationPackage,
} from '../communications/exporter';
import {
  SupportTicket,
  SupportTeamQueue,
  SlaPolicy,
  KnowledgeBaseArticle,
  CustomerSatisfactionRecord,
  CustomerSuccessTask,
  SupportTicketStatus,
  SupportTicketPriority,
  SupportCategoryKey,
  CreateSupportTicketInput,
  UpdateSupportTicketInput,
  CreateSlaPolicyInput,
  CreateKbArticleInput,
  CreateCsTaskInput,
  SubmitCustomerFeedbackInput,
  SupportMetricsSummary,
  CustomerSuccessAccountSummary,
  SlaState,
} from '../types/support-desk';
import {
  INITIAL_SUPPORT_TEAMS,
  INITIAL_SLA_POLICIES,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_KB_ARTICLES,
  INITIAL_CSAT_RECORDS,
  INITIAL_CS_TASKS,
} from '../support/fixtures';
import {
  evaluateTicketSla,
  calculateSupportMetrics,
  computeCustomerSuccessAccountSummaries,
} from '../support/evaluator';
import {
  validateTicketCreation,
  validateStatusTransition,
  validateEscalation,
  validateSlaPolicy,
  validateKbArticle,
  validateCsTask,
} from '../support/validator';

import {
  IntegrationRecord,
  ApiClientRecord,
  WebhookEndpointRecord,
  WebhookDeliveryRecord,
  IntegrationHealthIndicator,
  IntegrationMetricsSummary,
  UpdateIntegrationInput,
  CreateApiClientInput,
  UpdateApiClientInput,
  CreateWebhookEndpointInput,
  UpdateWebhookEndpointInput,
} from '../types/integrations';
import {
  INITIAL_INTEGRATIONS,
  INITIAL_API_CLIENTS,
  INITIAL_WEBHOOK_ENDPOINTS,
  INITIAL_WEBHOOK_DELIVERIES,
  INITIAL_INTEGRATION_AUDIT_EVENTS,
  WEBHOOK_EVENT_CATALOGUE,
} from '../integrations/fixtures';
import {
  computeIntegrationMetrics,
  computeIntegrationHealthIndicators,
  filterIntegrations,
  filterApiClients,
  filterWebhookEndpoints,
  filterWebhookDeliveries,
  validateApiClientInput,
  validateWebhookEndpointInput,
  executeSimulatedRetry,
  executeSimulatedTestDelivery,
  executeSimulatedConnectionVerification,
} from '../integrations/evaluator';
import {
  DataCategoryRecord,
  GovernanceRetentionPolicy,
  PrivacyRequestRecord,
  DataLifecycleRuleRecord,
  GovernanceExceptionRecord,
  GovernanceAuditRecord,
  GovernanceMetricsSummary,
  TenantGovernanceSummary,
  UpdateDataCategoryInput,
  CreateRetentionPolicyInput,
  UpdateRetentionPolicyInput,
  PolicyApprovalStatus,
  CreatePrivacyRequestInput,
  PrivacyWorkflowStatus,
  PrivacyResolutionCategory,
  CreateLifecycleRuleInput,
  CreateGovernanceExceptionInput,
  ExceptionReviewStatus,
} from '../types/data-governance';
import {
  INITIAL_DATA_CATEGORIES,
  INITIAL_RETENTION_POLICIES,
  INITIAL_PRIVACY_REQUESTS,
  INITIAL_LIFECYCLE_RULES,
  INITIAL_GOVERNANCE_EXCEPTIONS,
  INITIAL_GOVERNANCE_AUDIT_LOGS,
} from '../data-governance/fixtures';
import {
  computeGovernanceMetrics,
  filterDataCategories,
  filterGovernanceRetentionPolicies,
  filterPrivacyRequests,
  filterLifecycleRules,
  filterGovernanceExceptions,
  isValidPrivacyTransition,
  computeTenantGovernanceSummaries,
  simulatePrivacyRequestExecution,
  isOverdue,
  isReviewDue,
} from '../data-governance/evaluator';

const STORAGE_KEY = 'sms_superadmin_dev_store_v1';

export interface ModuleRegistryMetrics {
  totalModules: number;
  topLevelModules: number;
  submodules: number;
  totalMappedRoutes: number;
  implementedCount: number;
  partialCount: number;
  plannedCount: number;
  missingCount: number;
  platformEnabledCount: number;
  platformDisabledCount: number;
  planStarterCount: number;
  planGrowthCount: number;
  planEnterpriseCount: number;
  activeOverridesCount: number;
}

export interface PlatformMetrics {
  totalOrganizations: number;
  activeOrganizations: number;
  pendingOrganizations: number;
  suspendedOrganizations: number;
  inactiveOrganizations: number;
  trialOrganizations: number;
  onboardingInProgress: number;
  onboardingCompleted: number;
  totalCampuses: number;
  activeCampuses: number;
  subscriptionsByPlan: {
    planId: string;
    planName: string;
    count: number;
    color: string;
  }[];
  expiringSoonCount: number;
  recentAuditCount: number;
  activePlatformUsersCount: number;
  systemServicesOperational: number;
  systemServicesTotal: number;
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  openTicketsCount: number;
  urgentTicketsCount: number;
  slaAtRiskTicketsCount: number;
  averageCsatScore: number | null;
  failedDeliveriesCount: number;
  openPrivacyRequestsCount: number;
  overduePrivacyRequestsCount: number;
  policiesDueForReviewCount: number;
  uncoveredCategoriesCount: number;
}

export class PlatformStore {
  private organizations: Organization[];
  private plans: SubscriptionPlan[];
  private subscriptions: OrganizationSubscription[];
  private invoices: Invoice[];
  private payments: PaymentRecord[];
  private platformUsers: PlatformUser[];
  private roles: PlatformRole[];
  private permissions: PlatformPermission[];
  private auditEvents: AuditEvent[];
  private securityEvents: SecurityEvent[];
  private complianceControls: ComplianceControl[];
  private governanceEvidence: GovernanceEvidence[];
  private retentionPolicies: DataRetentionPolicy[];
  private operationalComponents: OperationalComponent[];
  private platformIncidents: PlatformIncident[];
  private maintenanceWindows: MaintenanceWindow[];
  private deploymentRecords: DeploymentRecord[];
  private backgroundJobs: BackgroundJobStatus[];
  private externalIntegrations: ExternalIntegrationRecord[];
  private capacityObservations: ResourceCapacityObservation[];
  private backupRecords: BackupReadinessRecord[];
  private alertRules: AlertRule[];
  private systemServices: PlatformServiceHealth[];
  private incidents: PlatformIncidentNotice[];
  private features: PlatformFeatureItem[];
  private settings: PlatformSettings;
  private modules: TenantModuleDefinition[];
  private organizationOverrides: OrganizationModuleOverride[];
  private campuses: Campus[];
  private discounts: DiscountPolicy[];
  private lifecycleEvents: SubscriptionLifecycleEvent[];
  private simulatedEvents: SimulatedProvisioningEvent[] = [];
  private extendedSettings: ExtendedPlatformSettings;
  private featureFlags: FeatureFlag[];
  private tenantOverrides: TenantFeatureOverride[];
  private environments: PlatformEnvironmentConfig[];
  private changeProposals: ConfigurationChangeProposal[];
  private configVersions: ConfigVersionEntry[];
  private communicationTemplates: CommunicationTemplate[];
  private templateVersionHistory: TemplateVersionEntry[];
  private notificationPolicies: NotificationPolicy[];
  private communicationProviders: ProviderRecord[];
  private notificationRecords: NotificationRecord[];
  private campaignDrafts: CampaignDraft[];
  private tenantCommunicationConfigs: TenantCommunicationConfig[];
  private notificationPreferenceGovernance: NotificationPreferenceGovernance;
  private supportTickets: SupportTicket[];
  private supportTeams: SupportTeamQueue[];
  private slaPolicies: SlaPolicy[];
  private kbArticles: KnowledgeBaseArticle[];
  private csatRecords: CustomerSatisfactionRecord[];
  private csTasks: CustomerSuccessTask[];
  private integrations: IntegrationRecord[];
  private apiClients: ApiClientRecord[];
  private webhookEndpoints: WebhookEndpointRecord[];
  private webhookDeliveries: WebhookDeliveryRecord[];
  private dataCategories: DataCategoryRecord[];
  private governanceRetentionPolicies: GovernanceRetentionPolicy[];
  private privacyRequests: PrivacyRequestRecord[];
  private lifecycleRules: DataLifecycleRuleRecord[];
  private governanceExceptions: GovernanceExceptionRecord[];
  private governanceAuditLogs: GovernanceAuditRecord[];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.organizations = structuredClone(INITIAL_ORGANIZATIONS);
    this.plans = structuredClone(INITIAL_PLANS);
    this.subscriptions = structuredClone(INITIAL_SUBSCRIPTIONS);
    this.invoices = structuredClone(INITIAL_INVOICES);
    this.payments = structuredClone(INITIAL_PAYMENTS);
    this.platformUsers = structuredClone(INITIAL_PLATFORM_USERS);
    this.roles = structuredClone(INITIAL_PLATFORM_ROLES);
    this.permissions = structuredClone(INITIAL_PLATFORM_PERMISSIONS);
    this.auditEvents = structuredClone(INITIAL_EXTENDED_AUDIT_EVENTS);
    this.securityEvents = structuredClone(INITIAL_SECURITY_EVENTS);
    this.complianceControls = structuredClone(INITIAL_COMPLIANCE_CONTROLS);
    this.governanceEvidence = structuredClone(INITIAL_GOVERNANCE_EVIDENCE);
    this.retentionPolicies = structuredClone(INITIAL_DATA_RETENTION_POLICIES);
    this.operationalComponents = structuredClone(INITIAL_OPERATIONAL_COMPONENTS);
    this.platformIncidents = structuredClone(INITIAL_PLATFORM_INCIDENTS);
    this.maintenanceWindows = structuredClone(INITIAL_MAINTENANCE_WINDOWS);
    this.deploymentRecords = structuredClone(INITIAL_DEPLOYMENT_RECORDS);
    this.backgroundJobs = structuredClone(INITIAL_BACKGROUND_JOBS);
    this.externalIntegrations = structuredClone(INITIAL_EXTERNAL_INTEGRATIONS);
    this.capacityObservations = structuredClone(INITIAL_CAPACITY_OBSERVATIONS);
    this.backupRecords = structuredClone(INITIAL_BACKUP_RECORDS);
    this.alertRules = structuredClone(INITIAL_ALERT_RULES);
    this.systemServices = structuredClone(INITIAL_SYSTEM_SERVICES);
    this.incidents = structuredClone(INITIAL_INCIDENTS);
    this.features = structuredClone(INITIAL_FEATURES);
    this.settings = structuredClone(INITIAL_PLATFORM_SETTINGS);
    this.modules = structuredClone(MASTER_MODULE_REGISTRY);
    this.organizationOverrides = structuredClone(INITIAL_ORGANIZATION_OVERRIDES);
    this.campuses = structuredClone(INITIAL_CAMPUSES);
    this.discounts = structuredClone(INITIAL_DISCOUNT_POLICIES);
    this.lifecycleEvents = structuredClone(INITIAL_LIFECYCLE_EVENTS);
    this.simulatedEvents = [];
    this.extendedSettings = structuredClone(INITIAL_EXTENDED_PLATFORM_SETTINGS);
    this.featureFlags = structuredClone(INITIAL_FEATURE_FLAGS);
    this.tenantOverrides = structuredClone(INITIAL_TENANT_OVERRIDES);
    this.environments = structuredClone(INITIAL_ENVIRONMENTS);
    this.changeProposals = structuredClone(INITIAL_CHANGE_PROPOSALS);
    this.configVersions = structuredClone(INITIAL_CONFIG_VERSIONS);
    this.communicationTemplates = structuredClone(INITIAL_COMMUNICATION_TEMPLATES);
    this.templateVersionHistory = structuredClone(INITIAL_TEMPLATE_VERSIONS);
    this.notificationPolicies = structuredClone(INITIAL_NOTIFICATION_POLICIES);
    this.communicationProviders = structuredClone(INITIAL_COMMUNICATION_PROVIDERS);
    this.notificationRecords = structuredClone(INITIAL_NOTIFICATION_RECORDS);
    this.campaignDrafts = structuredClone(INITIAL_CAMPAIGN_DRAFTS);
    this.tenantCommunicationConfigs = structuredClone(INITIAL_TENANT_COMMUNICATION_CONFIGS);
    this.notificationPreferenceGovernance = structuredClone(NOTIFICATION_PREFERENCE_GOVERNANCE);
    this.supportTickets = structuredClone(INITIAL_SUPPORT_TICKETS);
    this.supportTeams = structuredClone(INITIAL_SUPPORT_TEAMS);
    this.slaPolicies = structuredClone(INITIAL_SLA_POLICIES);
    this.kbArticles = structuredClone(INITIAL_KB_ARTICLES);
    this.csatRecords = structuredClone(INITIAL_CSAT_RECORDS);
    this.csTasks = structuredClone(INITIAL_CS_TASKS);
    this.integrations = structuredClone(INITIAL_INTEGRATIONS);
    this.apiClients = structuredClone(INITIAL_API_CLIENTS);
    this.webhookEndpoints = structuredClone(INITIAL_WEBHOOK_ENDPOINTS);
    this.webhookDeliveries = structuredClone(INITIAL_WEBHOOK_DELIVERIES);
    this.dataCategories = structuredClone(INITIAL_DATA_CATEGORIES);
    this.governanceRetentionPolicies = structuredClone(INITIAL_RETENTION_POLICIES);
    this.privacyRequests = structuredClone(INITIAL_PRIVACY_REQUESTS);
    this.lifecycleRules = structuredClone(INITIAL_LIFECYCLE_RULES);
    this.governanceExceptions = structuredClone(INITIAL_GOVERNANCE_EXCEPTIONS);
    this.governanceAuditLogs = structuredClone(INITIAL_GOVERNANCE_AUDIT_LOGS);

    // Seed integration audit events if not present
    for (const event of INITIAL_INTEGRATION_AUDIT_EVENTS) {
      if (!this.auditEvents.some((e) => e.id === event.id)) {
        this.auditEvents.push(event);
      }
    }

    // Seed governance audit events if not present
    for (const event of INITIAL_GOVERNANCE_AUDIT_LOGS) {
      if (!this.auditEvents.some((e) => e.id === event.id)) {
        this.auditEvents.push(event as any);
      }
    }

    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed.organizations)) this.organizations = parsed.organizations;
        if (Array.isArray(parsed.plans)) this.plans = parsed.plans;
        if (Array.isArray(parsed.subscriptions)) this.subscriptions = parsed.subscriptions;
        if (Array.isArray(parsed.invoices)) this.invoices = parsed.invoices;
        if (Array.isArray(parsed.payments)) this.payments = parsed.payments;
        if (Array.isArray(parsed.platformUsers)) this.platformUsers = parsed.platformUsers;
        if (Array.isArray(parsed.roles)) this.roles = parsed.roles;
        if (Array.isArray(parsed.permissions)) this.permissions = parsed.permissions;
        if (Array.isArray(parsed.auditEvents)) this.auditEvents = parsed.auditEvents;
        if (Array.isArray(parsed.securityEvents)) this.securityEvents = parsed.securityEvents;
        if (Array.isArray(parsed.complianceControls)) this.complianceControls = parsed.complianceControls;
        if (Array.isArray(parsed.governanceEvidence)) this.governanceEvidence = parsed.governanceEvidence;
        if (Array.isArray(parsed.retentionPolicies)) this.retentionPolicies = parsed.retentionPolicies;
        if (Array.isArray(parsed.operationalComponents)) this.operationalComponents = parsed.operationalComponents;
        if (Array.isArray(parsed.platformIncidents)) this.platformIncidents = parsed.platformIncidents;
        if (Array.isArray(parsed.maintenanceWindows)) this.maintenanceWindows = parsed.maintenanceWindows;
        if (Array.isArray(parsed.deploymentRecords)) this.deploymentRecords = parsed.deploymentRecords;
        if (Array.isArray(parsed.backgroundJobs)) this.backgroundJobs = parsed.backgroundJobs;
        if (Array.isArray(parsed.externalIntegrations)) this.externalIntegrations = parsed.externalIntegrations;
        if (Array.isArray(parsed.capacityObservations)) this.capacityObservations = parsed.capacityObservations;
        if (Array.isArray(parsed.backupRecords)) this.backupRecords = parsed.backupRecords;
        if (Array.isArray(parsed.alertRules)) this.alertRules = parsed.alertRules;
        if (Array.isArray(parsed.features)) this.features = parsed.features;
        if (Array.isArray(parsed.modules)) this.modules = parsed.modules;
        if (Array.isArray(parsed.organizationOverrides)) this.organizationOverrides = parsed.organizationOverrides;
        if (Array.isArray(parsed.campuses)) this.campuses = parsed.campuses;
        if (Array.isArray(parsed.discounts)) this.discounts = parsed.discounts;
        if (Array.isArray(parsed.lifecycleEvents)) this.lifecycleEvents = parsed.lifecycleEvents;
        if (Array.isArray(parsed.simulatedEvents)) this.simulatedEvents = parsed.simulatedEvents;
        if (Array.isArray(parsed.featureFlags)) this.featureFlags = parsed.featureFlags;
        if (Array.isArray(parsed.tenantOverrides)) this.tenantOverrides = parsed.tenantOverrides;
        if (Array.isArray(parsed.environments)) this.environments = parsed.environments;
        if (Array.isArray(parsed.changeProposals)) this.changeProposals = parsed.changeProposals;
        if (Array.isArray(parsed.configVersions)) this.configVersions = parsed.configVersions;
        if (Array.isArray(parsed.communicationTemplates)) this.communicationTemplates = parsed.communicationTemplates;
        if (Array.isArray(parsed.templateVersionHistory)) this.templateVersionHistory = parsed.templateVersionHistory;
        if (Array.isArray(parsed.notificationPolicies)) this.notificationPolicies = parsed.notificationPolicies;
        if (Array.isArray(parsed.communicationProviders)) this.communicationProviders = parsed.communicationProviders;
        if (Array.isArray(parsed.notificationRecords)) this.notificationRecords = parsed.notificationRecords;
        if (Array.isArray(parsed.campaignDrafts)) this.campaignDrafts = parsed.campaignDrafts;
        if (Array.isArray(parsed.tenantCommunicationConfigs)) this.tenantCommunicationConfigs = parsed.tenantCommunicationConfigs;
        if (Array.isArray(parsed.supportTickets)) this.supportTickets = parsed.supportTickets;
        if (Array.isArray(parsed.supportTeams)) this.supportTeams = parsed.supportTeams;
        if (Array.isArray(parsed.slaPolicies)) this.slaPolicies = parsed.slaPolicies;
        if (Array.isArray(parsed.kbArticles)) this.kbArticles = parsed.kbArticles;
        if (Array.isArray(parsed.csatRecords)) this.csatRecords = parsed.csatRecords;
        if (Array.isArray(parsed.csTasks)) this.csTasks = parsed.csTasks;
        if (Array.isArray(parsed.integrations)) this.integrations = parsed.integrations;
        if (Array.isArray(parsed.apiClients)) this.apiClients = parsed.apiClients;
        if (Array.isArray(parsed.webhookEndpoints)) this.webhookEndpoints = parsed.webhookEndpoints;
        if (Array.isArray(parsed.webhookDeliveries)) this.webhookDeliveries = parsed.webhookDeliveries;
        if (Array.isArray(parsed.dataCategories)) this.dataCategories = parsed.dataCategories;
        if (Array.isArray(parsed.governanceRetentionPolicies)) this.governanceRetentionPolicies = parsed.governanceRetentionPolicies;
        if (Array.isArray(parsed.privacyRequests)) this.privacyRequests = parsed.privacyRequests;
        if (Array.isArray(parsed.lifecycleRules)) this.lifecycleRules = parsed.lifecycleRules;
        if (Array.isArray(parsed.governanceExceptions)) this.governanceExceptions = parsed.governanceExceptions;
        if (Array.isArray(parsed.governanceAuditLogs)) this.governanceAuditLogs = parsed.governanceAuditLogs;
        if (parsed.notificationPreferenceGovernance && typeof parsed.notificationPreferenceGovernance === 'object') {
          this.notificationPreferenceGovernance = { ...NOTIFICATION_PREFERENCE_GOVERNANCE, ...parsed.notificationPreferenceGovernance };
        }
        if (parsed.extendedSettings && typeof parsed.extendedSettings === 'object') {
          this.extendedSettings = { ...INITIAL_EXTENDED_PLATFORM_SETTINGS, ...parsed.extendedSettings };
        }
        if (parsed.settings && typeof parsed.settings === 'object') {
          this.settings = { ...INITIAL_PLATFORM_SETTINGS, ...parsed.settings };
        }
      }
    } catch {
      // In case of corrupt or invalid storage, reseed with clean initial fixtures safely
      this.organizations = [...INITIAL_ORGANIZATIONS];
      this.plans = [...INITIAL_PLANS];
      this.subscriptions = [...INITIAL_SUBSCRIPTIONS];
      this.invoices = [...INITIAL_INVOICES];
      this.payments = [...INITIAL_PAYMENTS];
      this.platformUsers = [...INITIAL_PLATFORM_USERS];
      this.roles = [...INITIAL_PLATFORM_ROLES];
      this.permissions = [...INITIAL_PLATFORM_PERMISSIONS];
      this.auditEvents = structuredClone(INITIAL_EXTENDED_AUDIT_EVENTS);
      this.securityEvents = structuredClone(INITIAL_SECURITY_EVENTS);
      this.complianceControls = structuredClone(INITIAL_COMPLIANCE_CONTROLS);
      this.governanceEvidence = structuredClone(INITIAL_GOVERNANCE_EVIDENCE);
      this.retentionPolicies = structuredClone(INITIAL_DATA_RETENTION_POLICIES);
      this.features = [...INITIAL_FEATURES];
      this.settings = { ...INITIAL_PLATFORM_SETTINGS };
      this.modules = [...MASTER_MODULE_REGISTRY];
      this.organizationOverrides = [...INITIAL_ORGANIZATION_OVERRIDES];
      this.campuses = [...INITIAL_CAMPUSES];
      this.discounts = [...INITIAL_DISCOUNT_POLICIES];
      this.lifecycleEvents = [...INITIAL_LIFECYCLE_EVENTS];
      this.simulatedEvents = [];
      this.extendedSettings = structuredClone(INITIAL_EXTENDED_PLATFORM_SETTINGS);
      this.featureFlags = structuredClone(INITIAL_FEATURE_FLAGS);
      this.tenantOverrides = structuredClone(INITIAL_TENANT_OVERRIDES);
      this.environments = structuredClone(INITIAL_ENVIRONMENTS);
      this.changeProposals = structuredClone(INITIAL_CHANGE_PROPOSALS);
      this.configVersions = structuredClone(INITIAL_CONFIG_VERSIONS);
      this.communicationTemplates = structuredClone(INITIAL_COMMUNICATION_TEMPLATES);
      this.templateVersionHistory = structuredClone(INITIAL_TEMPLATE_VERSIONS);
      this.notificationPolicies = structuredClone(INITIAL_NOTIFICATION_POLICIES);
      this.communicationProviders = structuredClone(INITIAL_COMMUNICATION_PROVIDERS);
      this.notificationRecords = structuredClone(INITIAL_NOTIFICATION_RECORDS);
      this.campaignDrafts = structuredClone(INITIAL_CAMPAIGN_DRAFTS);
      this.tenantCommunicationConfigs = structuredClone(INITIAL_TENANT_COMMUNICATION_CONFIGS);
      this.notificationPreferenceGovernance = structuredClone(NOTIFICATION_PREFERENCE_GOVERNANCE);
      this.supportTickets = structuredClone(INITIAL_SUPPORT_TICKETS);
      this.supportTeams = structuredClone(INITIAL_SUPPORT_TEAMS);
      this.slaPolicies = structuredClone(INITIAL_SLA_POLICIES);
      this.kbArticles = structuredClone(INITIAL_KB_ARTICLES);
      this.csatRecords = structuredClone(INITIAL_CSAT_RECORDS);
      this.csTasks = structuredClone(INITIAL_CS_TASKS);
      this.integrations = structuredClone(INITIAL_INTEGRATIONS);
      this.apiClients = structuredClone(INITIAL_API_CLIENTS);
      this.webhookEndpoints = structuredClone(INITIAL_WEBHOOK_ENDPOINTS);
      this.webhookDeliveries = structuredClone(INITIAL_WEBHOOK_DELIVERIES);
      this.dataCategories = structuredClone(INITIAL_DATA_CATEGORIES);
      this.governanceRetentionPolicies = structuredClone(INITIAL_RETENTION_POLICIES);
      this.privacyRequests = structuredClone(INITIAL_PRIVACY_REQUESTS);
      this.lifecycleRules = structuredClone(INITIAL_LIFECYCLE_RULES);
      this.governanceExceptions = structuredClone(INITIAL_GOVERNANCE_EXCEPTIONS);
      this.governanceAuditLogs = structuredClone(INITIAL_GOVERNANCE_AUDIT_LOGS);
      for (const event of INITIAL_INTEGRATION_AUDIT_EVENTS) {
        if (!this.auditEvents.some((e) => e.id === event.id)) {
          this.auditEvents.push(event);
        }
      }
      for (const event of INITIAL_GOVERNANCE_AUDIT_LOGS) {
        if (!this.auditEvents.some((e) => e.id === event.id)) {
          this.auditEvents.push(event as any);
        }
      }
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          organizations: this.organizations,
          plans: this.plans,
          subscriptions: this.subscriptions,
          invoices: this.invoices,
          payments: this.payments,
          platformUsers: this.platformUsers,
          roles: this.roles,
          permissions: this.permissions,
          auditEvents: this.auditEvents,
          securityEvents: this.securityEvents,
          complianceControls: this.complianceControls,
          governanceEvidence: this.governanceEvidence,
          retentionPolicies: this.retentionPolicies,
          operationalComponents: this.operationalComponents,
          platformIncidents: this.platformIncidents,
          maintenanceWindows: this.maintenanceWindows,
          deploymentRecords: this.deploymentRecords,
          backgroundJobs: this.backgroundJobs,
          externalIntegrations: this.externalIntegrations,
          capacityObservations: this.capacityObservations,
          backupRecords: this.backupRecords,
          alertRules: this.alertRules,
          features: this.features,
          settings: this.settings,
          modules: this.modules,
          organizationOverrides: this.organizationOverrides,
          campuses: this.campuses,
          discounts: this.discounts,
          lifecycleEvents: this.lifecycleEvents,
          simulatedEvents: this.simulatedEvents,
          extendedSettings: this.extendedSettings,
          featureFlags: this.featureFlags,
          tenantOverrides: this.tenantOverrides,
          environments: this.environments,
          changeProposals: this.changeProposals,
          configVersions: this.configVersions,
          communicationTemplates: this.communicationTemplates,
          templateVersionHistory: this.templateVersionHistory,
          notificationPolicies: this.notificationPolicies,
          communicationProviders: this.communicationProviders,
          notificationRecords: this.notificationRecords,
          campaignDrafts: this.campaignDrafts,
          tenantCommunicationConfigs: this.tenantCommunicationConfigs,
          notificationPreferenceGovernance: this.notificationPreferenceGovernance,
          supportTickets: this.supportTickets,
          supportTeams: this.supportTeams,
          slaPolicies: this.slaPolicies,
          kbArticles: this.kbArticles,
          csatRecords: this.csatRecords,
          csTasks: this.csTasks,
          integrations: this.integrations,
          apiClients: this.apiClients,
          webhookEndpoints: this.webhookEndpoints,
          webhookDeliveries: this.webhookDeliveries,
          dataCategories: this.dataCategories,
          governanceRetentionPolicies: this.governanceRetentionPolicies,
          privacyRequests: this.privacyRequests,
          lifecycleRules: this.lifecycleRules,
          governanceExceptions: this.governanceExceptions,
          governanceAuditLogs: this.governanceAuditLogs,
        })
      );
    } catch {
      // Ignore quota errors in storage
    }
    this.notify();
  }



  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  // --- Read Operations ---

  public getOrganizations(): Organization[] {
    return [...this.organizations];
  }

  public getOrganizationById(id: string): Organization | undefined {
    return this.organizations.find((org) => org.id === id);
  }

  public getCampuses(): Campus[] {
    return [...this.campuses];
  }

  public getCampusesByOrgId(orgId: string): Campus[] {
    return this.campuses.filter((c) => c.organizationId === orgId);
  }

  public getCampusById(id: string): Campus | undefined {
    return this.campuses.find((c) => c.id === id);
  }

  public getSimulatedEvents(orgId?: string): SimulatedProvisioningEvent[] {
    if (orgId) {
      return this.simulatedEvents.filter((e) => e.organizationId === orgId);
    }
    return [...this.simulatedEvents];
  }

  public getPlans(): SubscriptionPlan[] {
    return [...this.plans];
  }

  public getPlanById(id: string): SubscriptionPlan | undefined {
    return this.plans.find((p) => p.id === id);
  }

  public getSubscriptions(): OrganizationSubscription[] {
    return [...this.subscriptions];
  }

  public getSubscriptionById(id: string): OrganizationSubscription | undefined {
    return this.subscriptions.find((sub) => sub.id === id);
  }

  public getSubscriptionByOrgId(orgId: string): OrganizationSubscription | undefined {
    return this.subscriptions.find((sub) => sub.organizationId === orgId);
  }

  public getInvoices(): Invoice[] {
    return [...this.invoices];
  }

  public getInvoiceById(id: string): Invoice | undefined {
    return this.invoices.find((inv) => inv.id === id);
  }

  public getInvoicesByOrgId(orgId: string): Invoice[] {
    return this.invoices.filter((inv) => inv.organizationId === orgId);
  }

  public getPayments(): PaymentRecord[] {
    return [...this.payments];
  }

  public getPaymentById(id: string): PaymentRecord | undefined {
    return this.payments.find((p) => p.id === id);
  }

  public getPaymentsByOrgId(orgId: string): PaymentRecord[] {
    return this.payments.filter((p) => p.organizationId === orgId);
  }

  public getPaymentsByInvoiceId(invoiceId: string): PaymentRecord[] {
    return this.payments.filter((p) => p.invoiceId === invoiceId);
  }

  public getDiscounts(): DiscountPolicy[] {
    return [...this.discounts];
  }

  public getDiscountByCode(code: string): DiscountPolicy | undefined {
    return this.discounts.find((d) => d.code.toUpperCase() === code.trim().toUpperCase());
  }

  public getSubscriptionEvents(subscriptionId?: string): SubscriptionLifecycleEvent[] {
    if (subscriptionId) {
      return this.lifecycleEvents.filter((e) => e.subscriptionId === subscriptionId);
    }
    return [...this.lifecycleEvents];
  }

  public getMonetizationAnalytics(referenceDate?: string): MonetizationAnalyticsSummary {
    return computeMonetizationAnalytics(
      this.subscriptions,
      this.plans,
      this.invoices,
      this.payments,
      referenceDate
    );
  }


  public getPlatformUsers(): PlatformUser[] {
    return [...this.platformUsers];
  }

  public getSystemServices(): PlatformServiceHealth[] {
    return [...this.systemServices];
  }

  public getIncidents(): PlatformIncidentNotice[] {
    return [...this.incidents];
  }

  public getFeatures(): PlatformFeatureItem[] {
    return [...this.features];
  }

  public getSettings(): PlatformSettings {
    return { ...this.settings };
  }

  public getAuditEvents(filter?: AuditLogFilter): AuditEvent[] {
    return filterAuditEvents(this.auditEvents, filter || {});
  }

  public getMetrics(): PlatformMetrics {
    const total = this.organizations.length;
    const active = this.organizations.filter((o) => o.status === 'active').length;
    const pending = this.organizations.filter((o) => o.status === 'pending').length;
    const suspended = this.organizations.filter((o) => o.status === 'suspended').length;
    const inactive = this.organizations.filter((o) => o.status === 'inactive').length;
    const trial = this.subscriptions.filter((s) => s.status === 'trialing').length;

    const inProgress = this.organizations.filter((o) => o.onboardingStatus === 'in_progress' || o.onboardingStatus === 'verification_pending').length;
    const completed = this.organizations.filter((o) => o.onboardingStatus === 'completed').length;

    const colors: Record<string, string> = {
      plan_starter: '#3b82f6',
      plan_growth: '#10b981',
      plan_enterprise: '#8b5cf6',
    };

    const subscriptionsByPlan = this.plans.map((p) => {
      const count = this.organizations.filter((o) => o.planId === p.id).length;
      return {
        planId: p.id,
        planName: p.name,
        count,
        color: colors[p.id] || '#64748b',
      };
    });

    // Deterministic timestamp for static prerendering and reproducible mock metrics
    const now = Date.parse('2026-03-17T00:00:00Z');
    const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;
    const expiringSoon = this.subscriptions.filter((s) => {
      const end = new Date(s.currentPeriodEnd).getTime();
      return end > now && end <= thirtyDaysFromNow;
    }).length;

    const operationalServices = this.operationalComponents
      ? this.operationalComponents.filter((s) => s.status === 'healthy').length
      : this.systemServices.filter((s) => (s.status as string) === 'operational' || (s.status as string) === 'healthy').length;
    const totalServices = this.operationalComponents
      ? this.operationalComponents.length
      : this.systemServices.length;

    const totalInvoiced = this.invoices.reduce((acc, inv) => acc + (typeof inv.amountDue === 'number' ? inv.amountDue : 0), 0);
    const totalCollected = this.invoices.reduce((acc, inv) => acc + (typeof inv.amountPaid === 'number' ? inv.amountPaid : 0), 0);
    const totalOutstanding = this.invoices.reduce((acc, inv) => acc + Math.max(0, (inv.amountDue || 0) - (inv.amountPaid || 0)), 0);

    const totalCampuses = this.campuses.length;
    const activeCampuses = this.campuses.filter((c) => c.status === 'active').length;

    const openStatuses = new Set(['new', 'open', 'in_progress', 'awaiting_tenant', 'awaiting_internal', 'escalated']);
    const openTicketsCount = (this.supportTickets || []).filter((t) => openStatuses.has(t.status)).length;
    const urgentTicketsCount = (this.supportTickets || []).filter((t) => openStatuses.has(t.status) && t.priority === 'urgent').length;
    const slaAtRiskTicketsCount = (this.supportTickets || []).filter((t) => openStatuses.has(t.status) && t.slaState === 'approaching_target').length;

    let averageCsatScore: number | null = null;
    if (this.csatRecords && this.csatRecords.length > 0) {
      const sum = this.csatRecords.reduce((acc, c) => acc + c.rating, 0);
      averageCsatScore = Math.round((sum / this.csatRecords.length) * 10) / 10;
    }

    return {
      totalOrganizations: total,
      activeOrganizations: active,
      pendingOrganizations: pending,
      suspendedOrganizations: suspended,
      inactiveOrganizations: inactive,
      trialOrganizations: trial,
      onboardingInProgress: inProgress,
      onboardingCompleted: completed,
      totalCampuses,
      activeCampuses,
      subscriptionsByPlan,
      expiringSoonCount: expiringSoon,
      recentAuditCount: this.auditEvents.length,
      activePlatformUsersCount: this.platformUsers.filter((u) => u.status === 'active').length,
      systemServicesOperational: operationalServices,
      systemServicesTotal: totalServices,
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      openTicketsCount,
      urgentTicketsCount,
      slaAtRiskTicketsCount,
      averageCsatScore,
      failedDeliveriesCount: (this.webhookDeliveries || []).filter(
        (d) => d.outcome === 'simulated_failure' || d.outcome === 'exhausted_retries'
      ).length,
      openPrivacyRequestsCount: (this.privacyRequests || []).filter(
        (r) => r.workflowStatus !== 'completed_closed' && r.workflowStatus !== 'rejected_with_grounds'
      ).length,
      overduePrivacyRequestsCount: (this.privacyRequests || []).filter(
        (r) => r.workflowStatus !== 'completed_closed' && r.workflowStatus !== 'rejected_with_grounds' && isOverdue(r.dueAt)
      ).length,
      policiesDueForReviewCount: (this.governanceRetentionPolicies || []).filter((p) => isReviewDue(p.nextReviewDueAt)).length,
      uncoveredCategoriesCount: (this.dataCategories || []).filter((c) => !c.retentionPolicyId).length,
    };
  }

  // --- Mutations (Development State with Validation & Audit Events) ---

  public createOrganization(input: CreateOrganizationInput): { success: boolean; organization?: Organization; error?: string } {
    // 1. Validation
    if (!input.name || input.name.trim().length < 2) {
      return { success: false, error: 'Organization name must be at least 2 characters.' };
    }

    const cleanCode = input.code.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 2) {
      return { success: false, error: 'Organization code is required (min 2 uppercase characters).' };
    }

    if (this.organizations.some((o) => o.code.toUpperCase() === cleanCode)) {
      return { success: false, error: `Organization code "${cleanCode}" is already in use by another tenant.` };
    }

    const cleanSubdomain = input.subdomain.trim().toLowerCase();
    if (!cleanSubdomain || !/^[a-z0-9-]+$/.test(cleanSubdomain)) {
      return { success: false, error: 'Subdomain must contain only lowercase letters, numbers, and hyphens.' };
    }

    if (this.organizations.some((o) => o.subdomain.toLowerCase() === cleanSubdomain)) {
      return { success: false, error: `Subdomain "${cleanSubdomain}" is already registered.` };
    }

    if (!input.administrator.email || !input.administrator.email.includes('@')) {
      return { success: false, error: 'A valid primary administrator email is required.' };
    }

    const newId = `org_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newOrg: Organization = {
      id: newId,
      code: cleanCode,
      name: input.name.trim(),
      classification: input.classification,
      status: 'pending',
      onboardingStatus: 'completed',
      planId: input.planId,
      subdomain: cleanSubdomain,
      createdAt: nowIso,
      updatedAt: nowIso,
      contact: input.contact,
      administrator: input.administrator,
      technicalConfig: input.technicalConfig,
      notes: input.notes,
    };

    // Create matching subscription
    const selectedPlan = this.plans.find((p) => p.id === input.planId) || this.plans[0];
    const subId = `sub_${Date.now()}`;
    const isTrial = this.settings.onboardingPolicy.autoApproveFreeTrials;
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const newSub: OrganizationSubscription = {
      id: subId,
      organizationId: newId,
      planId: selectedPlan.id,
      billingCycle: input.billingCycle,
      status: isTrial ? 'trialing' : 'active',
      currentPeriodStart: nowIso,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      trialStartDate: isTrial ? nowIso : undefined,
      trialEndDate: isTrial ? periodEnd : undefined,
      updatedAt: nowIso,
    };

    // Create initial invoice
    const invId = `inv_${Date.now()}`;
    const amount = input.billingCycle === 'annual' ? selectedPlan.priceAnnual : selectedPlan.priceMonthly;
    const newInvoice: Invoice = {
      id: invId,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      organizationId: newId,
      subscriptionId: subId,
      amountDue: amount,
      amountPaid: 0,
      currency: selectedPlan.currency,
      status: 'issued',
      issueDate: nowIso,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      lineItems: [
        {
          id: `li_${Date.now()}`,
          description: `${selectedPlan.name} Subscription (${input.billingCycle === 'annual' ? 'Annual' : 'Monthly'})`,
          quantity: 1,
          unitAmount: amount,
          totalAmount: amount,
        },
      ],
      notes: 'Initial registration onboarding invoice',
    };

    // Record audit event
    const auditEvent: AuditEvent = {
      id: `audit_${Date.now()}`,
      timestamp: nowIso,
      category: 'organization_lifecycle',
      action: 'ORGANIZATION_REGISTERED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Organization',
      targetId: newId,
      targetName: newOrg.name,
      status: 'succeeded',
      details: `Registered organization "${newOrg.name}" with code ${newOrg.code} on plan "${selectedPlan.name}".`,
      metadata: {
        code: newOrg.code,
        subdomain: newOrg.subdomain,
        planId: selectedPlan.id,
        classification: newOrg.classification,
      },
    };

    const initialCampusName = input.initialCampus?.name || `${newOrg.name} Main Campus`;
    const initialCampusCode = (input.initialCampus?.code || 'MAIN').toUpperCase();
    const initialCampus: Campus = {
      id: `camp_${Date.now()}_main`,
      organizationId: newId,
      name: initialCampusName,
      code: initialCampusCode,
      isMainCampus: true,
      type: 'main',
      status: 'active',
      address: {
        street: input.initialCampus?.street || input.contact.address || '',
        city: input.initialCampus?.city || input.contact.city || '',
        stateOrProvince: input.initialCampus?.stateOrProvince || input.contact.stateOrProvince || '',
        country: input.initialCampus?.country || input.contact.country || 'United States',
        postalCode: input.initialCampus?.postalCode || input.contact.postalCode || '',
      },
      contactEmail: input.contact.email,
      contactPhone: input.contact.phone,
      principalName: input.administrator.name,
      studentCapacity: input.initialCampus?.studentCapacity || 500,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    newOrg.provisioningStatus = 'ready_for_review';

    this.organizations.unshift(newOrg);
    this.campuses.unshift(initialCampus);
    this.subscriptions.unshift(newSub);
    this.invoices.unshift(newInvoice);
    this.auditEvents.unshift(auditEvent);

    this.persist();
    return { success: true, organization: newOrg };
  }

  public updateOrganization(id: string, input: UpdateOrganizationInput): { success: boolean; organization?: Organization; error?: string } {
    const orgIndex = this.organizations.findIndex((o) => o.id === id);
    if (orgIndex === -1) {
      return { success: false, error: 'Organization not found.' };
    }

    const current = this.organizations[orgIndex];
    const nowIso = new Date().toISOString();

    const updated: Organization = {
      ...current,
      name: input.name !== undefined ? input.name.trim() : current.name,
      classification: input.classification || current.classification,
      status: input.status || current.status,
      onboardingStatus: input.onboardingStatus || current.onboardingStatus,
      planId: input.planId || current.planId,
      notes: input.notes !== undefined ? input.notes : current.notes,
      contact: {
        ...current.contact,
        ...(input.contact || {}),
      },
      administrator: {
        ...current.administrator,
        ...(input.administrator || {}),
      },
      technicalConfig: {
        ...current.technicalConfig,
        ...(input.technicalConfig || {}),
      },
      updatedAt: nowIso,
    };

    this.organizations[orgIndex] = updated;

    // Record audit event
    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: nowIso,
      category: 'organization_lifecycle',
      action: 'ORGANIZATION_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Organization',
      targetId: updated.id,
      targetName: updated.name,
      status: 'succeeded',
      details: `Updated profile details for "${updated.name}".`,
    });

    this.persist();
    return { success: true, organization: updated };
  }

  public setOrganizationStatus(id: string, status: OrganizationLifecycleStatus, reason?: string): { success: boolean; error?: string } {
    const org = this.organizations.find((o) => o.id === id);
    if (!org) return { success: false, error: 'Organization not found.' };

    const oldStatus = org.status;
    const evalResult = evaluateLifecycleTransition(oldStatus, status, reason);
    if (!evalResult.permitted) {
      return { success: false, error: evalResult.error };
    }

    const nowIso = new Date().toISOString();
    org.status = status;
    org.updatedAt = nowIso;
    if (status === 'suspended') {
      org.suspendedReason = reason;
    }
    if (status === 'archived') {
      org.archivedAt = nowIso;
      org.archivedReason = reason;
    }

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: nowIso,
      category: 'organization_lifecycle',
      action: 'ORGANIZATION_STATUS_CHANGED',
      severity: status === 'suspended' || status === 'archived' ? 'warning' : 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Organization',
      targetId: org.id,
      targetName: org.name,
      status: 'succeeded',
      details: `Lifecycle status transitioned from "${oldStatus}" to "${status}". Reason: ${reason || 'Administrative action'}`,
      metadata: { previousStatus: oldStatus, newStatus: status, reason },
    });

    this.persist();
    return { success: true };
  }


  public updateOrganizationPlan(id: string, planId: string, billingCycle?: 'monthly' | 'annual'): { success: boolean; error?: string } {
    const org = this.organizations.find((o) => o.id === id);
    if (!org) return { success: false, error: 'Organization not found.' };

    const plan = this.plans.find((p) => p.id === planId);
    if (!plan) return { success: false, error: 'Selected subscription plan does not exist.' };

    const oldPlanId = org.planId;
    org.planId = planId;
    org.updatedAt = new Date().toISOString();

    const sub = this.subscriptions.find((s) => s.organizationId === id);
    if (sub) {
      sub.planId = planId;
      if (billingCycle) sub.billingCycle = billingCycle;
      sub.updatedAt = new Date().toISOString();
    }

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'subscription_billing',
      action: 'PLAN_ASSIGNMENT_CHANGED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Organization',
      targetId: org.id,
      targetName: org.name,
      status: 'succeeded',
      details: `Subscription plan changed to "${plan.name}".`,
      metadata: { previousPlanId: oldPlanId, newPlanId: planId, billingCycle },
    });

    this.persist();
    return { success: true };
  }

  public recordPayment(input: {
    invoiceId: string;
    amount: number;
    method: PaymentMethodType;
    referenceNumber: string;
    notes?: string;
  }): { success: boolean; payment?: PaymentRecord; error?: string } {
    const invoice = this.invoices.find((i) => i.id === input.invoiceId);
    if (!invoice) {
      return { success: false, error: 'Target invoice not found.' };
    }

    if (invoice.status === 'paid') {
      return { success: false, error: `Invoice ${invoice.invoiceNumber} is already settled in full.` };
    }

    if (invoice.status === 'void' || invoice.status === 'uncollectible') {
      return { success: false, error: `Cannot record payment against an invoice with status "${invoice.status}".` };
    }

    if (typeof input.amount !== 'number' || isNaN(input.amount) || input.amount <= 0) {
      return { success: false, error: 'Payment amount must be a positive number greater than 0.' };
    }

    const cleanRef = input.referenceNumber ? input.referenceNumber.trim() : '';
    if (!cleanRef || cleanRef.length < 3) {
      return { success: false, error: 'Valid payment reference number is required (min 3 characters).' };
    }

    // Duplicate payment reference check
    if (this.payments.some((p) => p.referenceNumber.toLowerCase() === cleanRef.toLowerCase())) {
      return { success: false, error: `Payment reference "${cleanRef}" has already been recorded in the platform ledger.` };
    }

    const outstandingBalance = Math.max(0, invoice.amountDue - invoice.amountPaid);
    if (input.amount > outstandingBalance) {
      return {
        success: false,
        error: `Payment amount ($${input.amount.toLocaleString()}) exceeds the remaining unpaid invoice balance ($${outstandingBalance.toLocaleString()}). Overpayments are not permitted in standard settlement.`,
      };
    }

    const nowIso = new Date().toISOString();
    const newPaidAmount = invoice.amountPaid + input.amount;
    invoice.amountPaid = newPaidAmount;

    if (invoice.amountPaid >= invoice.amountDue) {
      invoice.status = 'paid';
      invoice.paidAt = nowIso;
    }

    const newPayment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      invoiceId: invoice.id,
      organizationId: invoice.organizationId,
      amount: input.amount,
      currency: invoice.currency,
      method: input.method,
      referenceNumber: cleanRef,
      processedAt: nowIso,
      status: 'succeeded',
      notes: input.notes?.trim() || 'Simulated development payment entry',
    };

    this.payments.unshift(newPayment);

    // Record audit event
    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: nowIso,
      category: 'subscription_billing',
      action: 'PAYMENT_RECORDED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'PaymentRecord',
      targetId: newPayment.id,
      targetName: `Payment on ${invoice.invoiceNumber}`,
      status: 'succeeded',
      details: `Recorded simulated ${newPayment.method.replace('_', ' ')} payment of $${newPayment.amount.toLocaleString()} ${newPayment.currency} for invoice ${invoice.invoiceNumber}. Ref: ${newPayment.referenceNumber}.`,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        organizationId: invoice.organizationId,
        paymentAmount: newPayment.amount,
        remainingBalance: Math.max(0, invoice.amountDue - invoice.amountPaid),
        newInvoiceStatus: invoice.status,
      },
    });

    this.persist();
    return { success: true, payment: newPayment };
  }

  public createPlan(input: CreatePlanInput): { success: boolean; plan?: SubscriptionPlan; error?: string } {
    const planId = input.id
      ? input.id.trim().toLowerCase()
      : `plan_${input.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;

    const candidate: SubscriptionPlan = {
      id: planId,
      name: input.name.trim(),
      tier: input.tier,
      status: input.status || 'published',
      description: input.description.trim(),
      priceMonthly: input.priceMonthly,
      priceAnnual: input.priceAnnual,
      priceQuarterly: input.priceQuarterly,
      currency: input.currency.toUpperCase(),
      trialDays: typeof input.trialDays === 'number' ? input.trialDays : 14,
      maxStudents: input.maxStudents,
      maxStaff: input.maxStaff,
      maxCampuses: input.maxCampuses,
      storageGb: input.storageGb,
      features: input.features || [],
      includedModuleIds: input.includedModuleIds || [],
      isPopular: Boolean(input.isPopular),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validation = validatePlanDefinition(candidate, this.plans);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    this.plans.push(candidate);

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: candidate.createdAt!,
      category: 'subscription_billing',
      action: 'PLAN_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'SubscriptionPlan',
      targetId: candidate.id,
      targetName: candidate.name,
      status: 'succeeded',
      details: `Created new subscription plan "${candidate.name}" (${candidate.id}) in tier ${candidate.tier}.`,
      metadata: { planId: candidate.id, tier: candidate.tier, priceMonthly: candidate.priceMonthly, priceAnnual: candidate.priceAnnual },
    });

    this.persist();
    return { success: true, plan: candidate };
  }

  public updatePlan(id: string, input: UpdatePlanInput): { success: boolean; plan?: SubscriptionPlan; error?: string } {
    const plan = this.plans.find((p) => p.id === id);
    if (!plan) return { success: false, error: 'Subscription plan not found.' };

    const merged: SubscriptionPlan = {
      ...plan,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    const validation = validatePlanDefinition(merged, this.plans.filter((p) => p.id !== id));
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    Object.assign(plan, merged);

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: plan.updatedAt!,
      category: 'subscription_billing',
      action: 'PLAN_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'SubscriptionPlan',
      targetId: plan.id,
      targetName: plan.name,
      status: 'succeeded',
      details: `Updated subscription plan "${plan.name}".`,
      metadata: { planId: plan.id, updates: JSON.stringify(input) },
    });

    this.persist();
    return { success: true, plan };
  }

  public transitionSubscriptionStatus(
    subscriptionId: string,
    targetStatus: SubscriptionStatus,
    reason: string
  ): { success: boolean; subscription?: OrganizationSubscription; error?: string } {
    const sub = this.subscriptions.find((s) => s.id === subscriptionId);
    if (!sub) return { success: false, error: 'Subscription not found.' };

    const validation = validateSubscriptionTransition(sub.status, targetStatus, reason);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const previousStatus = sub.status;
    sub.status = targetStatus;
    const nowIso = new Date().toISOString();
    sub.updatedAt = nowIso;

    if (targetStatus === 'canceled') {
      sub.canceledAt = nowIso;
      sub.cancellationReason = reason.trim();
      sub.cancelAtPeriodEnd = true;
    }

    const lifecycleEvent: SubscriptionLifecycleEvent = {
      id: `evt_${Date.now()}`,
      subscriptionId: sub.id,
      organizationId: sub.organizationId,
      fromStatus: previousStatus,
      toStatus: targetStatus,
      reason: reason.trim(),
      actor: 'Alexander Sterling (Super Admin)',
      timestamp: nowIso,
    };
    this.lifecycleEvents.unshift(lifecycleEvent);

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: nowIso,
      category: 'subscription_billing',
      action: 'SUBSCRIPTION_STATUS_CHANGED',
      severity: targetStatus === 'canceled' || targetStatus === 'suspended' ? 'warning' : 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'OrganizationSubscription',
      targetId: sub.id,
      targetName: `Subscription ${sub.id}`,
      status: 'succeeded',
      details: `Subscription status transitioned from "${previousStatus}" to "${targetStatus}". Reason: "${reason.trim()}".`,
      metadata: {
        subscriptionId: sub.id,
        organizationId: sub.organizationId,
        previousStatus,
        newStatus: targetStatus,
        reason: reason.trim(),
      },
    });

    this.persist();
    return { success: true, subscription: sub };
  }

  public voidInvoice(invoiceId: string, reason: string): { success: boolean; invoice?: Invoice; error?: string } {
    const invoice = this.invoices.find((i) => i.id === invoiceId);
    if (!invoice) return { success: false, error: 'Target invoice not found.' };
    if (invoice.status === 'paid') {
      return { success: false, error: `Invoice ${invoice.invoiceNumber} is already settled in full and cannot be voided.` };
    }
    if (invoice.status === 'void') {
      return { success: false, error: `Invoice ${invoice.invoiceNumber} is already void.` };
    }
    if (!reason || reason.trim().length < 5) {
      return { success: false, error: 'A mandatory justification reason (min 5 characters) is required to void an invoice.' };
    }

    invoice.status = 'void';
    invoice.voidReason = reason.trim();
    const nowIso = new Date().toISOString();

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: nowIso,
      category: 'subscription_billing',
      action: 'INVOICE_VOIDED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Invoice',
      targetId: invoice.id,
      targetName: invoice.invoiceNumber,
      status: 'succeeded',
      details: `Voided invoice ${invoice.invoiceNumber}. Justification: "${invoice.voidReason}".`,
      metadata: { invoiceId: invoice.id, voidReason: invoice.voidReason },
    });

    this.persist();
    return { success: true, invoice };
  }

  public retryPayment(paymentId: string): { success: boolean; payment?: PaymentRecord; invoice?: Invoice; error?: string } {
    const payment = this.payments.find((p) => p.id === paymentId);
    if (!payment) return { success: false, error: 'Payment attempt record not found.' };
    if (payment.status !== 'failed') {
      return { success: false, error: `Payment is in status "${payment.status}" and cannot be retried.` };
    }

    const invoice = this.invoices.find((i) => i.id === payment.invoiceId);
    if (!invoice) return { success: false, error: 'Associated invoice for payment retry not found.' };

    payment.retryCount = (payment.retryCount || 0) + 1;
    const nowIso = new Date().toISOString();

    payment.status = 'succeeded';
    payment.processedAt = nowIso;
    payment.notes = (payment.notes ? payment.notes + ' | ' : '') + `Simulated retry #${payment.retryCount} succeeded at ${nowIso}.`;

    const remainingBal = Math.max(0, invoice.amountDue - invoice.amountPaid);
    const amountToApply = Math.min(remainingBal, payment.amount);
    invoice.amountPaid = round2(invoice.amountPaid + amountToApply);
    if (invoice.amountPaid >= invoice.amountDue) {
      invoice.status = 'paid';
      invoice.paidAt = nowIso;
    }

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: nowIso,
      category: 'subscription_billing',
      action: 'PAYMENT_RETRY_SUCCEEDED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'PaymentRecord',
      targetId: payment.id,
      targetName: `Payment Retry on ${invoice.invoiceNumber}`,
      status: 'succeeded',
      details: `Simulated retry #${payment.retryCount} succeeded for payment ${payment.referenceNumber} on invoice ${invoice.invoiceNumber}. Applied ${payment.currency} ${amountToApply}.`,
      metadata: {
        paymentId: payment.id,
        invoiceId: invoice.id,
        newInvoiceStatus: invoice.status,
        retryCount: payment.retryCount,
      },
    });

    this.persist();
    return { success: true, payment, invoice };
  }

  public createDiscount(input: CreateDiscountInput): { success: boolean; discount?: DiscountPolicy; error?: string } {
    const candidate: DiscountPolicy = {
      id: `disc_${Date.now()}`,
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
      discountType: input.discountType,
      value: input.value,
      currency: input.currency ? input.currency.toUpperCase() : undefined,
      applicablePlans: input.applicablePlans || ['all'],
      validFrom: input.validFrom,
      validUntil: input.validUntil,
      maxRedemptions: input.maxRedemptions,
      currentRedemptions: 0,
      isActive: true,
      description: input.description?.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validation = validateDiscountPolicy(candidate, this.discounts);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    this.discounts.unshift(candidate);

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: candidate.createdAt,
      category: 'subscription_billing',
      action: 'DISCOUNT_POLICY_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'DiscountPolicy',
      targetId: candidate.id,
      targetName: candidate.code,
      status: 'succeeded',
      details: `Created discount promotional policy "${candidate.code}" (${candidate.value}${candidate.discountType === 'percentage' ? '%' : ' ' + (candidate.currency || '')}).`,
      metadata: { discountId: candidate.id, code: candidate.code, discountType: candidate.discountType, value: candidate.value },
    });

    this.persist();
    return { success: true, discount: candidate };
  }

  public toggleDiscount(id: string): { success: boolean; discount?: DiscountPolicy; error?: string } {
    const discount = this.discounts.find((d) => d.id === id);
    if (!discount) return { success: false, error: 'Discount policy not found.' };

    discount.isActive = !discount.isActive;
    discount.updatedAt = new Date().toISOString();

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: discount.updatedAt,
      category: 'subscription_billing',
      action: 'DISCOUNT_STATUS_TOGGLED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'DiscountPolicy',
      targetId: discount.id,
      targetName: discount.code,
      status: 'succeeded',
      details: `Discount "${discount.code}" toggled to ${discount.isActive ? 'ACTIVE' : 'INACTIVE'}.`,
      metadata: { discountId: discount.id, isActive: discount.isActive },
    });

    this.persist();
    return { success: true, discount };
  }


  public createPlatformUser(input: {
    name: string;
    email: string;
    role: PlatformRoleKey;
    assignedRoles?: string[];
    department?: string;
    notes?: string;
  }): { success: boolean; user?: PlatformUser; error?: string } {
    if (!input.name || input.name.trim().length < 2) {
      return { success: false, error: 'User name is required.' };
    }
    if (!input.email || !input.email.includes('@')) {
      return { success: false, error: 'Valid corporate email address required.' };
    }
    if (this.platformUsers.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
      return { success: false, error: `Platform user with email ${input.email} already exists.` };
    }

    const assignedRoles = Array.isArray(input.assignedRoles) && input.assignedRoles.length > 0
      ? input.assignedRoles
      : [input.role];

    const newUser: PlatformUser = {
      id: `usr_${Date.now()}`,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      assignedRoles,
      status: 'active',
      department: input.department || 'Platform Operations',
      createdAt: new Date().toISOString(),
      twoFactorEnabled: false,
      notes: input.notes,
    };

    this.platformUsers.unshift(newUser);

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'platform_access',
      action: 'PLATFORM_USER_CREATED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'PlatformUser',
      targetId: newUser.id,
      targetName: newUser.name,
      status: 'succeeded',
      details: `Created new platform administrator with primary role "${input.role}".`,
      metadata: { userId: newUser.id, assignedRoles: assignedRoles.join(', ') },
    });

    this.persist();
    return { success: true, user: newUser };
  }

  public updatePlatformUserRole(id: string, role: PlatformRoleKey): { success: boolean; error?: string } {
    const user = this.platformUsers.find((u) => u.id === id);
    if (!user) return { success: false, error: 'Platform user not found.' };

    const oldRole = user.role;

    // Safeguard: Check if removing super_admin from the last active super_admin
    if (oldRole === 'super_admin' && role !== 'super_admin') {
      const val = validateRoleAssignment(user, 'super_admin', this.platformUsers, this.roles, 'remove');
      if (!val.valid) {
        return { success: false, error: val.error };
      }
    }

    user.role = role;
    user.assignedRoles = [role];

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'platform_access',
      action: 'PLATFORM_USER_ROLE_CHANGED',
      severity: 'critical',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'PlatformUser',
      targetId: user.id,
      targetName: user.name,
      status: 'succeeded',
      details: `Reassigned primary role from "${oldRole}" to "${role}".`,
      metadata: { previousRole: oldRole, newRole: role },
    });

    this.persist();
    return { success: true };
  }

  public updatePlatformUserStatus(id: string, status: 'active' | 'suspended' | 'pending_invite' | 'deactivated'): { success: boolean; error?: string } {
    const user = this.platformUsers.find((u) => u.id === id);
    if (!user) return { success: false, error: 'Platform user not found.' };

    // Invariant check: cannot suspend or deactivate the last active super_admin
    if (status !== 'active') {
      const userRoles = Array.isArray(user.assignedRoles) && user.assignedRoles.length > 0
        ? user.assignedRoles
        : [user.role];
      if (userRoles.includes('super_admin')) {
        const otherActiveSuperAdmins = this.platformUsers.filter((u) => {
          if (u.id === user.id) return false;
          const uRoles = Array.isArray(u.assignedRoles) && u.assignedRoles.length > 0 ? u.assignedRoles : [u.role];
          return u.status === 'active' && uRoles.includes('super_admin');
        });
        if (otherActiveSuperAdmins.length === 0) {
          return {
            success: false,
            error: 'Platform Safeguard Violation: Cannot suspend or deactivate the last active Super-Admin account.',
          };
        }
      }
    }

    const oldStatus = user.status;
    user.status = status;

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'platform_access',
      action: 'PLATFORM_USER_STATUS_UPDATED',
      severity: status === 'suspended' ? 'warning' : 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'PlatformUser',
      targetId: user.id,
      targetName: user.name,
      status: 'succeeded',
      details: `Changed account status from "${oldStatus}" to "${status}".`,
      metadata: { previousStatus: oldStatus, newStatus: status },
    });

    this.persist();
    return { success: true };
  }

  public assignRoleToUser(userId: string, roleId: string): { success: boolean; error?: string } {
    const user = this.platformUsers.find((u) => u.id === userId);
    if (!user) return { success: false, error: 'Platform user not found.' };

    const role = this.roles.find((r) => r.id === roleId);
    if (!role) return { success: false, error: `Platform role "${roleId}" not found in catalogue.` };

    const val = validateRoleAssignment(user, roleId, this.platformUsers, this.roles, 'assign');
    if (!val.valid) {
      return { success: false, error: val.error };
    }

    if (!Array.isArray(user.assignedRoles)) {
      user.assignedRoles = [user.role];
    }

    user.assignedRoles.push(roleId);

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'platform_access',
      action: 'PLATFORM_ROLE_ASSIGNED_TO_USER',
      severity: role.isPrivileged ? 'critical' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'PlatformUser',
      targetId: user.id,
      targetName: user.name,
      status: 'succeeded',
      details: `Assigned role "${role.name}" (${roleId}) to administrator ${user.name}.`,
      metadata: { roleId, roleName: role.name, userId: user.id },
    });

    this.persist();
    return { success: true };
  }

  public removeRoleFromUser(userId: string, roleId: string): { success: boolean; error?: string } {
    const user = this.platformUsers.find((u) => u.id === userId);
    if (!user) return { success: false, error: 'Platform user not found.' };

    const role = this.roles.find((r) => r.id === roleId);
    if (!role) return { success: false, error: `Platform role "${roleId}" not found in catalogue.` };

    const val = validateRoleAssignment(user, roleId, this.platformUsers, this.roles, 'remove');
    if (!val.valid) {
      return { success: false, error: val.error };
    }

    if (!Array.isArray(user.assignedRoles)) {
      user.assignedRoles = [user.role];
    }

    user.assignedRoles = user.assignedRoles.filter((r) => r !== roleId);

    // If assignedRoles is now empty, assign default fallback role or keep role
    if (user.assignedRoles.length === 0) {
      user.assignedRoles = ['readonly_auditor'];
      user.role = 'readonly_auditor';
    } else {
      user.role = user.assignedRoles[0] as PlatformRoleKey;
    }

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'platform_access',
      action: 'PLATFORM_ROLE_REMOVED_FROM_USER',
      severity: role.isPrivileged ? 'critical' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'PlatformUser',
      targetId: user.id,
      targetName: user.name,
      status: 'succeeded',
      details: `Revoked role "${role.name}" (${roleId}) from administrator ${user.name}.`,
      metadata: { roleId, roleName: role.name, userId: user.id },
    });

    this.persist();
    return { success: true };
  }

  // ==========================================
  // PLATFORM ROLES & PERMISSIONS CATALOGUE
  // ==========================================

  public getPlatformRoles(): PlatformRole[] {
    return this.roles.map((role) => {
      const assignmentCount = this.platformUsers.filter((u) => {
        const rIds = Array.isArray(u.assignedRoles) && u.assignedRoles.length > 0 ? u.assignedRoles : [u.role];
        return rIds.includes(role.id);
      }).length;
      return { ...role, assignmentCount };
    });
  }

  public getPlatformPermissions(): PlatformPermission[] {
    return [...this.permissions];
  }

  public getPlatformRoleById(id: string): PlatformRole | undefined {
    const role = this.roles.find((r) => r.id === id);
    if (!role) return undefined;
    const assignmentCount = this.platformUsers.filter((u) => {
      const rIds = Array.isArray(u.assignedRoles) && u.assignedRoles.length > 0 ? u.assignedRoles : [u.role];
      return rIds.includes(role.id);
    }).length;
    return { ...role, assignmentCount };
  }

  public createPlatformRole(input: CreateCustomRoleInput): { success: boolean; role?: PlatformRole; error?: string } {
    const val = validateRoleDefinition(input, this.roles, false);
    if (!val.valid) {
      return { success: false, error: val.errors.join(' ') };
    }

    const hasPrivilegedPerm = input.permissions.some((pId) => {
      const p = this.permissions.find((perm) => perm.id === pId);
      return p?.isPrivileged ?? false;
    });

    const newRole: PlatformRole = {
      id: input.id.trim().toLowerCase(),
      name: input.name.trim(),
      description: input.description.trim(),
      category: 'custom',
      isSystemManaged: false,
      isPrivileged: input.isPrivileged ?? hasPrivilegedPerm,
      permissions: [...input.permissions],
      createdAt: new Date().toISOString(),
    };

    this.roles.push(newRole);

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'platform_access',
      action: 'PLATFORM_ROLE_CREATED',
      severity: newRole.isPrivileged ? 'critical' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'PlatformRole',
      targetId: newRole.id,
      targetName: newRole.name,
      status: 'succeeded',
      details: `Created new custom platform role "${newRole.name}" with ${newRole.permissions.length} granted permissions.`,
      metadata: { roleId: newRole.id, permissionsCount: newRole.permissions.length },
    });

    this.persist();
    return { success: true, role: newRole };
  }

  public updatePlatformRolePermissions(roleId: string, permissions: string[]): { success: boolean; error?: string } {
    const role = this.roles.find((r) => r.id === roleId);
    if (!role) return { success: false, error: 'Platform role not found.' };

    if (role.isSystemManaged) {
      return {
        success: false,
        error: `System Protection: Role "${role.name}" is a core system-managed role and its canonical permissions cannot be modified. Create a custom role to customize permissions.`,
      };
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return { success: false, error: 'At least one permission must be assigned to the role.' };
    }

    role.permissions = [...permissions];
    role.updatedAt = new Date().toISOString();

    const hasPrivileged = role.permissions.some((pId) => {
      const p = this.permissions.find((perm) => perm.id === pId);
      return p?.isPrivileged ?? false;
    });
    role.isPrivileged = hasPrivileged;

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'platform_access',
      action: 'PLATFORM_ROLE_PERMISSIONS_UPDATED',
      severity: role.isPrivileged ? 'critical' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'PlatformRole',
      targetId: role.id,
      targetName: role.name,
      status: 'succeeded',
      details: `Updated permissions for custom role "${role.name}" (${permissions.length} permissions assigned).`,
      metadata: { roleId: role.id, permissionsCount: permissions.length },
    });

    this.persist();
    return { success: true };
  }

  public deletePlatformRole(roleId: string): { success: boolean; error?: string } {
    const role = this.roles.find((r) => r.id === roleId);
    if (!role) return { success: false, error: 'Platform role not found.' };

    if (role.isSystemManaged) {
      return {
        success: false,
        error: `System Protection: Role "${role.name}" is a system-managed role and cannot be deleted.`,
      };
    }

    const assignedCount = this.platformUsers.filter((u) => {
      const rIds = Array.isArray(u.assignedRoles) && u.assignedRoles.length > 0 ? u.assignedRoles : [u.role];
      return rIds.includes(roleId);
    }).length;

    if (assignedCount > 0) {
      return {
        success: false,
        error: `Cannot delete role "${role.name}" because it is currently assigned to ${assignedCount} administrator(s). Reassign those users before deleting this role.`,
      };
    }

    this.roles = this.roles.filter((r) => r.id !== roleId);

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'platform_access',
      action: 'PLATFORM_ROLE_DELETED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'PlatformRole',
      targetId: roleId,
      targetName: role.name,
      status: 'succeeded',
      details: `Deleted custom platform role "${role.name}".`,
      metadata: { roleId },
    });

    this.persist();
    return { success: true };
  }

  public toggleFeature(id: string): { success: boolean; error?: string } {
    const feat = this.features.find((f) => f.id === id);
    if (!feat) return { success: false, error: 'Feature not found in platform catalogue.' };

    feat.isGloballyEnabled = !feat.isGloballyEnabled;

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'feature_toggles',
      action: 'FEATURE_TOGGLED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'PlatformFeature',
      targetId: feat.id,
      targetName: feat.name,
      status: 'succeeded',
      details: `Feature "${feat.name}" is now ${feat.isGloballyEnabled ? 'enabled' : 'disabled'} globally.`,
    });

    this.persist();
    return { success: true };
  }

  public updateSettings(settings: Partial<PlatformSettings>): { success: boolean } {
    this.settings = {
      ...this.settings,
      ...settings,
      branding: { ...this.settings.branding, ...(settings.branding || {}) },
      regional: { ...this.settings.regional, ...(settings.regional || {}) },
      onboardingPolicy: { ...this.settings.onboardingPolicy, ...(settings.onboardingPolicy || {}) },
      maintenance: { ...this.settings.maintenance, ...(settings.maintenance || {}) },
    };

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'system_configuration',
      action: 'PLATFORM_SETTINGS_UPDATED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'PlatformSettings',
      targetId: 'global_settings',
      status: 'succeeded',
      details: 'Updated global platform configuration and operational policy.',
    });

    this.persist();
    return { success: true };
  }

  // ==========================================
  // CAMPUSES & MULTI-BRANCH MANAGEMENT (Phase E-09.7)
  // ==========================================

  public createCampus(input: CreateCampusInput): { success: boolean; campus?: Campus; error?: string } {
    const org = this.organizations.find((o) => o.id === input.organizationId);
    if (!org) {
      return { success: false, error: 'Owning organization does not exist.' };
    }

    if (!input.name || input.name.trim().length < 2) {
      return { success: false, error: 'Campus name must be at least 2 characters.' };
    }

    const cleanCode = input.code.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 2) {
      return { success: false, error: 'Campus code is required (min 2 uppercase characters).' };
    }

    // Check code uniqueness within the organization
    const orgCampuses = this.campuses.filter((c) => c.organizationId === input.organizationId);
    if (orgCampuses.some((c) => c.code.toUpperCase() === cleanCode)) {
      return { success: false, error: `Campus code "${cleanCode}" is already in use within this school organization.` };
    }

    // Determine if this should be the main campus
    const shouldBeMain = orgCampuses.length === 0 || Boolean(input.isMainCampus);

    if (shouldBeMain) {
      // Unset previous main campus for this org
      for (const c of this.campuses) {
        if (c.organizationId === input.organizationId) {
          c.isMainCampus = false;
        }
      }
    }

    const newId = `camp_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newCampus: Campus = {
      id: newId,
      organizationId: input.organizationId,
      name: input.name.trim(),
      code: cleanCode,
      isMainCampus: shouldBeMain,
      type: input.type || (shouldBeMain ? 'main' : 'branch'),
      status: input.status || 'active',
      address: {
        street: input.address?.street || '',
        city: input.address?.city || org.contact.city,
        stateOrProvince: input.address?.stateOrProvince || org.contact.stateOrProvince,
        country: input.address?.country || org.contact.country,
        postalCode: input.address?.postalCode || org.contact.postalCode || '',
      },
      contactEmail: input.contactEmail || org.contact.email,
      contactPhone: input.contactPhone || org.contact.phone,
      principalName: input.principalName,
      studentCapacity: input.studentCapacity,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.campuses.unshift(newCampus);

    // Record audit event
    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: nowIso,
      category: 'organization_lifecycle',
      action: 'CAMPUS_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Campus',
      targetId: newId,
      targetName: `${newCampus.name} (${newCampus.code})`,
      status: 'succeeded',
      details: `Created new campus "${newCampus.name}" (${newCampus.code}) for "${org.name}". Main campus: ${shouldBeMain ? 'Yes' : 'No'}.`,
      metadata: {
        organizationId: org.id,
        campusCode: newCampus.code,
        isMainCampus: shouldBeMain,
      },
    });

    this.persist();
    return { success: true, campus: newCampus };
  }

  public updateCampus(id: string, input: UpdateCampusInput): { success: boolean; campus?: Campus; error?: string } {
    const campus = this.campuses.find((c) => c.id === id);
    if (!campus) {
      return { success: false, error: 'Campus not found.' };
    }

    const org = this.organizations.find((o) => o.id === campus.organizationId);

    if (input.code !== undefined) {
      const cleanCode = input.code.trim().toUpperCase();
      if (!cleanCode || cleanCode.length < 2) {
        return { success: false, error: 'Campus code must be at least 2 characters.' };
      }
      const duplicate = this.campuses.some(
        (c) => c.organizationId === campus.organizationId && c.id !== id && c.code.toUpperCase() === cleanCode
      );
      if (duplicate) {
        return { success: false, error: `Campus code "${cleanCode}" is already in use by another campus in this organization.` };
      }
      campus.code = cleanCode;
    }

    if (input.name !== undefined) {
      const cleanName = input.name.trim();
      if (!cleanName || cleanName.length < 2) {
        return { success: false, error: 'Campus name must be at least 2 characters.' };
      }
      campus.name = cleanName;
    }

    if (input.isMainCampus === true) {
      // Unset other main campuses
      for (const c of this.campuses) {
        if (c.organizationId === campus.organizationId) {
          c.isMainCampus = false;
        }
      }
      campus.isMainCampus = true;
    }

    if (input.type !== undefined) campus.type = input.type;
    if (input.status !== undefined) campus.status = input.status;
    if (input.contactEmail !== undefined) campus.contactEmail = input.contactEmail;
    if (input.contactPhone !== undefined) campus.contactPhone = input.contactPhone;
    if (input.principalName !== undefined) campus.principalName = input.principalName;
    if (input.studentCapacity !== undefined) campus.studentCapacity = input.studentCapacity;

    if (input.address) {
      campus.address = {
        ...campus.address,
        ...input.address,
      };
    }

    const nowIso = new Date().toISOString();
    campus.updatedAt = nowIso;

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: nowIso,
      category: 'organization_lifecycle',
      action: 'CAMPUS_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Campus',
      targetId: campus.id,
      targetName: `${campus.name} (${campus.code})`,
      status: 'succeeded',
      details: `Updated campus profile "${campus.name}" for organization "${org?.name || campus.organizationId}".`,
      metadata: {
        organizationId: campus.organizationId,
        campusCode: campus.code,
        isMainCampus: campus.isMainCampus,
      },
    });

    this.persist();
    return { success: true, campus };
  }

  public setMainCampus(orgId: string, campusId: string): { success: boolean; error?: string } {
    const campus = this.campuses.find((c) => c.id === campusId && c.organizationId === orgId);
    if (!campus) {
      return { success: false, error: 'Campus does not exist or does not belong to this organization.' };
    }

    for (const c of this.campuses) {
      if (c.organizationId === orgId) {
        c.isMainCampus = c.id === campusId;
      }
    }

    campus.updatedAt = new Date().toISOString();

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'organization_lifecycle',
      action: 'MAIN_CAMPUS_DESIGNATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Campus',
      targetId: campus.id,
      targetName: campus.name,
      status: 'succeeded',
      details: `Designated "${campus.name}" (${campus.code}) as the primary/main campus for organization.`,
    });

    this.persist();
    return { success: true };
  }

  public setCampusStatus(campusId: string, status: CampusStatus, reason?: string): { success: boolean; error?: string } {
    const campus = this.campuses.find((c) => c.id === campusId);
    if (!campus) return { success: false, error: 'Campus not found.' };

    const oldStatus = campus.status;
    campus.status = status;
    campus.updatedAt = new Date().toISOString();

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'organization_lifecycle',
      action: 'CAMPUS_STATUS_CHANGED',
      severity: status === 'inactive' ? 'warning' : 'info',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Campus',
      targetId: campus.id,
      targetName: campus.name,
      status: 'succeeded',
      details: `Campus status transitioned from "${oldStatus}" to "${status}". Reason: ${reason || 'Administrative action'}`,
    });

    this.persist();
    return { success: true };
  }

  public deleteCampus(campusId: string): { success: boolean; error?: string } {
    const index = this.campuses.findIndex((c) => c.id === campusId);
    if (index === -1) return { success: false, error: 'Campus not found.' };

    const campus = this.campuses[index];
    const orgCampuses = this.campuses.filter((c) => c.organizationId === campus.organizationId);

    if (campus.isMainCampus && orgCampuses.length > 1) {
      return {
        success: false,
        error: 'Cannot delete the designated main campus while other campuses exist. Designate another campus as main first.',
      };
    }

    this.campuses.splice(index, 1);

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'organization_lifecycle',
      action: 'CAMPUS_DELETED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Campus',
      targetId: campus.id,
      targetName: campus.name,
      status: 'succeeded',
      details: `Removed campus record "${campus.name}" (${campus.code}) from organization.`,
    });

    this.persist();
    return { success: true };
  }

  // ==========================================
  // CONFIGURATION READINESS & PROVISIONING SIMULATION (Phase E-09.7)
  // ==========================================

  public evaluateOrganizationReadiness(orgId: string): OrganizationReadinessReport {
    const org = this.organizations.find((o) => o.id === orgId);
    if (!org) {
      throw new Error(`Organization with ID "${orgId}" not found.`);
    }

    const orgCampuses = this.campuses.filter((c) => c.organizationId === orgId);
    const plan = this.plans.find((p) => p.id === org.planId);
    const subscription = this.subscriptions.find((s) => s.organizationId === orgId);
    const overrides = this.organizationOverrides.filter((o) => o.organizationId === orgId);

    return evaluateOrganizationReadiness({
      organization: org,
      campuses: orgCampuses,
      plan,
      subscription,
      overrides,
      modules: this.modules,
    });
  }

  public runSimulatedProvisioning(orgId: string, forceFail?: boolean): { success: boolean; status: ProvisioningStatus; error?: string } {
    const org = this.organizations.find((o) => o.id === orgId);
    if (!org) return { success: false, status: 'simulated_failed', error: 'Organization not found.' };

    const readiness = this.evaluateOrganizationReadiness(orgId);
    const orgCampuses = this.campuses.filter((c) => c.organizationId === orgId);

    const result = executeSimulatedProvisioning({
      organization: org,
      readiness,
      campuses: orgCampuses,
      forceFail,
    });

    org.provisioningStatus = result.status;
    org.updatedAt = new Date().toISOString();

    // Store simulated events
    this.simulatedEvents = [
      ...result.events,
      ...this.simulatedEvents.filter((e) => e.organizationId !== orgId),
    ];

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'organization_lifecycle',
      action: 'SIMULATED_PROVISIONING_RUN',
      severity: result.success ? 'info' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'Organization',
      targetId: org.id,
      targetName: org.name,
      status: result.success ? 'succeeded' : 'failed',
      details: `Executed local provisioning simulation. Status: ${result.status}. Summary: ${result.summary}`,
      metadata: {
        simulatedStatus: result.status,
        eventCount: result.events.length,
        forceFail: Boolean(forceFail),
      },
    });

    this.persist();
    return { success: result.success, status: result.status, error: result.error };
  }

  public resetSimulatedProvisioning(orgId: string): { success: boolean } {
    const org = this.organizations.find((o) => o.id === orgId);
    if (!org) return { success: false };

    org.provisioningStatus = 'not_started';
    org.updatedAt = new Date().toISOString();
    this.simulatedEvents = this.simulatedEvents.filter((e) => e.organizationId !== orgId);

    this.persist();
    return { success: true };
  }

  public resetToDefaults() {
    this.organizations = structuredClone(INITIAL_ORGANIZATIONS);
    this.plans = structuredClone(INITIAL_PLANS);
    this.subscriptions = structuredClone(INITIAL_SUBSCRIPTIONS);
    this.invoices = structuredClone(INITIAL_INVOICES);
    this.payments = structuredClone(INITIAL_PAYMENTS);
    this.platformUsers = structuredClone(INITIAL_PLATFORM_USERS);
    this.roles = structuredClone(INITIAL_PLATFORM_ROLES);
    this.permissions = structuredClone(INITIAL_PLATFORM_PERMISSIONS);
    this.auditEvents = structuredClone(INITIAL_EXTENDED_AUDIT_EVENTS);
    this.securityEvents = structuredClone(INITIAL_SECURITY_EVENTS);
    this.complianceControls = structuredClone(INITIAL_COMPLIANCE_CONTROLS);
    this.governanceEvidence = structuredClone(INITIAL_GOVERNANCE_EVIDENCE);
    this.retentionPolicies = structuredClone(INITIAL_DATA_RETENTION_POLICIES);
    this.operationalComponents = structuredClone(INITIAL_OPERATIONAL_COMPONENTS);
    this.platformIncidents = structuredClone(INITIAL_PLATFORM_INCIDENTS);
    this.maintenanceWindows = structuredClone(INITIAL_MAINTENANCE_WINDOWS);
    this.deploymentRecords = structuredClone(INITIAL_DEPLOYMENT_RECORDS);
    this.backgroundJobs = structuredClone(INITIAL_BACKGROUND_JOBS);
    this.externalIntegrations = structuredClone(INITIAL_EXTERNAL_INTEGRATIONS);
    this.capacityObservations = structuredClone(INITIAL_CAPACITY_OBSERVATIONS);
    this.backupRecords = structuredClone(INITIAL_BACKUP_RECORDS);
    this.alertRules = structuredClone(INITIAL_ALERT_RULES);
    this.systemServices = structuredClone(INITIAL_SYSTEM_SERVICES);
    this.incidents = structuredClone(INITIAL_INCIDENTS);
    this.features = structuredClone(INITIAL_FEATURES);
    this.settings = structuredClone(INITIAL_PLATFORM_SETTINGS);
    this.modules = structuredClone(MASTER_MODULE_REGISTRY);
    this.organizationOverrides = structuredClone(INITIAL_ORGANIZATION_OVERRIDES);
    this.campuses = structuredClone(INITIAL_CAMPUSES);
    this.discounts = structuredClone(INITIAL_DISCOUNT_POLICIES);
    this.lifecycleEvents = structuredClone(INITIAL_LIFECYCLE_EVENTS);
    this.simulatedEvents = [];
    this.extendedSettings = structuredClone(INITIAL_EXTENDED_PLATFORM_SETTINGS);
    this.featureFlags = structuredClone(INITIAL_FEATURE_FLAGS);
    this.tenantOverrides = structuredClone(INITIAL_TENANT_OVERRIDES);
    this.environments = structuredClone(INITIAL_ENVIRONMENTS);
    this.changeProposals = structuredClone(INITIAL_CHANGE_PROPOSALS);
    this.configVersions = structuredClone(INITIAL_CONFIG_VERSIONS);
    this.communicationTemplates = structuredClone(INITIAL_COMMUNICATION_TEMPLATES);
    this.templateVersionHistory = structuredClone(INITIAL_TEMPLATE_VERSIONS);
    this.notificationPolicies = structuredClone(INITIAL_NOTIFICATION_POLICIES);
    this.communicationProviders = structuredClone(INITIAL_COMMUNICATION_PROVIDERS);
    this.notificationRecords = structuredClone(INITIAL_NOTIFICATION_RECORDS);
    this.campaignDrafts = structuredClone(INITIAL_CAMPAIGN_DRAFTS);
    this.tenantCommunicationConfigs = structuredClone(INITIAL_TENANT_COMMUNICATION_CONFIGS);
    this.notificationPreferenceGovernance = structuredClone(NOTIFICATION_PREFERENCE_GOVERNANCE);
    this.supportTickets = structuredClone(INITIAL_SUPPORT_TICKETS);
    this.supportTeams = structuredClone(INITIAL_SUPPORT_TEAMS);
    this.slaPolicies = structuredClone(INITIAL_SLA_POLICIES);
    this.kbArticles = structuredClone(INITIAL_KB_ARTICLES);
    this.csatRecords = structuredClone(INITIAL_CSAT_RECORDS);
    this.csTasks = structuredClone(INITIAL_CS_TASKS);
    this.integrations = structuredClone(INITIAL_INTEGRATIONS);
    this.apiClients = structuredClone(INITIAL_API_CLIENTS);
    this.webhookEndpoints = structuredClone(INITIAL_WEBHOOK_ENDPOINTS);
    this.webhookDeliveries = structuredClone(INITIAL_WEBHOOK_DELIVERIES);
    this.dataCategories = structuredClone(INITIAL_DATA_CATEGORIES);
    this.governanceRetentionPolicies = structuredClone(INITIAL_RETENTION_POLICIES);
    this.privacyRequests = structuredClone(INITIAL_PRIVACY_REQUESTS);
    this.lifecycleRules = structuredClone(INITIAL_LIFECYCLE_RULES);
    this.governanceExceptions = structuredClone(INITIAL_GOVERNANCE_EXCEPTIONS);

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
    this.notify();
  }


  // ==========================================
  // MASTER TENANT MODULE REGISTRY & ENTITLEMENTS
  // ==========================================

  public getModules(): TenantModuleDefinition[] {
    return [...this.modules];
  }

  public getModuleById(id: string): TenantModuleDefinition | undefined {
    return this.modules.find((m) => m.id === id || m.navId === id);
  }

  public getTopLevelModules(): TenantModuleDefinition[] {
    return this.modules.filter((m) => !m.parentId);
  }

  public getSubmodulesByParentId(parentId: string): TenantModuleDefinition[] {
    return this.modules.filter((m) => m.parentId === parentId);
  }

  public getOrganizationModuleOverrides(organizationId?: string): OrganizationModuleOverride[] {
    if (organizationId) {
      return this.organizationOverrides.filter((o) => o.organizationId === organizationId);
    }
    return [...this.organizationOverrides];
  }

  public setOrganizationModuleOverride(input: {
    organizationId: string;
    moduleId: string;
    action: OrganizationOverrideAction;
    reason: string;
    actorName?: string;
  }): { success: boolean; error?: string } {
    const org = this.organizations.find((o) => o.id === input.organizationId);
    if (!org) return { success: false, error: `Organization "${input.organizationId}" not found.` };

    const mod = this.modules.find((m) => m.id === input.moduleId || m.navId === input.moduleId);
    if (!mod) return { success: false, error: `Module "${input.moduleId}" not registered in catalogue.` };

    if (!input.reason || input.reason.trim().length < 5) {
      return { success: false, error: 'A justification reason of at least 5 characters is required for entitlement overrides.' };
    }

    const existingIndex = this.organizationOverrides.findIndex(
      (o) => o.organizationId === input.organizationId && o.moduleId === mod.id
    );

    const now = new Date().toISOString();
    const actor = input.actorName || 'Super Admin';

    if (input.action === 'inherit') {
      if (existingIndex !== -1) {
        this.organizationOverrides.splice(existingIndex, 1);
      }
    } else {
      const overrideRecord: OrganizationModuleOverride = {
        organizationId: input.organizationId,
        moduleId: mod.id,
        action: input.action,
        reason: input.reason.trim(),
        appliedBy: actor,
        appliedAt: existingIndex !== -1 ? this.organizationOverrides[existingIndex].appliedAt : now,
        updatedAt: now,
      };

      if (existingIndex !== -1) {
        this.organizationOverrides[existingIndex] = overrideRecord;
      } else {
        this.organizationOverrides.push(overrideRecord);
      }
    }

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: now,
      category: 'feature_toggles',
      action: 'MODULE_OVERRIDE_UPDATED',
      severity: input.action === 'force_disable' ? 'warning' : 'info',
      actor: {
        id: 'usr_super_01',
        name: actor,
        email: 'ops-admin@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'TenantModuleEntitlement',
      targetId: `${input.organizationId}:${mod.id}`,
      targetName: `${org.name} - ${mod.name}`,
      status: 'succeeded',
      details: `Entitlement override set to "${input.action}" for module "${mod.name}". Justification: ${input.reason.trim()}`,
      metadata: {
        organizationId: input.organizationId,
        moduleId: mod.id,
        action: input.action,
        reason: input.reason.trim(),
      },
    });

    this.persist();
    return { success: true };
  }

  public resetOrganizationModuleOverride(
    organizationId: string,
    moduleId: string,
    actorName?: string
  ): { success: boolean; error?: string } {
    return this.setOrganizationModuleOverride({
      organizationId,
      moduleId,
      action: 'inherit',
      reason: 'Reverted to default subscription plan entitlement tier.',
      actorName,
    });
  }

  public setModuleGlobalAvailability(
    moduleId: string,
    isGloballyEnabled: boolean,
    actorName?: string
  ): { success: boolean; error?: string } {
    const mod = this.modules.find((m) => m.id === moduleId || m.navId === moduleId);
    if (!mod) return { success: false, error: `Module "${moduleId}" not found in catalogue.` };

    const oldState = mod.isGloballyEnabled;
    mod.isGloballyEnabled = isGloballyEnabled;

    const now = new Date().toISOString();
    const actor = actorName || 'Super Admin';

    this.auditEvents.unshift({
      id: `audit_${Date.now()}`,
      timestamp: now,
      category: 'feature_toggles',
      action: 'MODULE_AVAILABILITY_TOGGLED',
      severity: isGloballyEnabled ? 'info' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: actor,
        email: 'ops-admin@saas-platform.internal',
        role: 'super_admin',
      },
      targetEntity: 'TenantModule',
      targetId: mod.id,
      targetName: mod.name,
      status: 'succeeded',
      details: `Module "${mod.name}" global platform availability transitioned from ${oldState} to ${isGloballyEnabled}.`,
      metadata: {
        moduleId: mod.id,
        previousState: oldState,
        newState: isGloballyEnabled,
      },
    });

    this.persist();
    return { success: true };
  }

  public evaluateEntitlement(
    moduleId: string,
    organizationId?: string,
    planId?: string
  ): EffectiveEntitlementResult {
    let effectivePlanId = planId;
    if (organizationId && !effectivePlanId) {
      const org = this.organizations.find((o) => o.id === organizationId);
      if (org) effectivePlanId = org.planId;
    }

    return evaluateModuleEntitlement({
      moduleId,
      organizationId,
      planId: effectivePlanId,
      plans: this.plans,
      registry: this.modules,
      organizationOverrides: this.organizationOverrides,
    });
  }

  public validateRegistry(): RegistryValidationReport {
    return validateModuleRegistry({
      modules: this.modules,
      organizationOverrides: this.organizationOverrides,
      knownOrganizationIds: this.organizations.map((o) => o.id),
    });
  }

  public getModuleMetrics(): ModuleRegistryMetrics {
    const topModules = this.modules.filter((m) => !m.parentId);
    const submodules = this.modules.filter((m) => !!m.parentId);
    let totalMappedRoutes = 0;
    for (const m of this.modules) {
      totalMappedRoutes += m.routes.length;
    }

    const implementedCount = this.modules.filter((m) => m.status === 'implemented').length;
    const partialCount = this.modules.filter((m) => m.status === 'partial').length;
    const plannedCount = this.modules.filter((m) => m.status === 'planned').length;
    const missingCount = this.modules.filter((m) => m.status === 'missing').length;

    const platformEnabledCount = this.modules.filter((m) => m.isGloballyEnabled).length;
    const platformDisabledCount = this.modules.filter((m) => !m.isGloballyEnabled).length;

    const planStarterCount = this.modules.filter((m) => m.includedInPlans.includes('starter')).length;
    const planGrowthCount = this.modules.filter((m) => m.includedInPlans.includes('growth')).length;
    const planEnterpriseCount = this.modules.filter((m) => m.includedInPlans.includes('enterprise')).length;

    return {
      totalModules: this.modules.length,
      topLevelModules: topModules.length,
      submodules: submodules.length,
      totalMappedRoutes,
      implementedCount,
      partialCount,
      plannedCount,
      missingCount,
      platformEnabledCount,
      platformDisabledCount,
      planStarterCount,
      planGrowthCount,
      planEnterpriseCount,
      activeOverridesCount: this.organizationOverrides.length,
    };
  }

  // ==========================================
  // PHASE E-09.13: AUDIT, SECURITY & COMPLIANCE GOVERNANCE
  // ==========================================

  public logAuditEvent(
    eventInput: Omit<AuditEvent, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
  ): AuditEvent {
    const id = eventInput.id || `audit_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = eventInput.timestamp || new Date().toISOString();
    const correlationId = eventInput.correlationId || `corr_${Date.now().toString(36)}`;

    const newEvent: AuditEvent = {
      ...eventInput,
      id,
      timestamp,
      correlationId,
      sourceClassification: eventInput.sourceClassification || 'client_simulation',
      isDemoFixture: eventInput.isDemoFixture !== undefined ? eventInput.isDemoFixture : true,
    };

    this.auditEvents.unshift(newEvent);
    this.persist();
    this.notify();
    return newEvent;
  }

  public getSecurityEvents(filters?: {
    searchQuery?: string;
    category?: string;
    severity?: string;
    triageStatus?: string;
  }): SecurityEvent[] {
    return filterSecurityEvents(this.securityEvents, filters || {});
  }

  public updateSecurityEventTriage(
    id: string,
    status: SecurityTriageStatus,
    notes?: string,
    reviewer = 'Alexander Sterling (Super Admin)'
  ): { success: boolean; error?: string } {
    const event = this.securityEvents.find((e) => e.id === id);
    if (!event) {
      return { success: false, error: `Security event with ID "${id}" was not found.` };
    }

    const validation = validateSecurityTriageUpdate(event, status, notes);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const previousStatus = event.triageStatus;
    event.triageStatus = status;
    if (notes) event.triageNotes = notes.trim();
    event.triagedBy = reviewer;
    event.triagedAt = new Date().toISOString();

    // Log corresponding administrative audit trail entry
    this.auditEvents.unshift({
      id: `audit_triage_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'security',
      action: 'SECURITY_EVENT_TRIAGE_UPDATED',
      severity: event.severity === 'critical' ? 'critical' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: reviewer,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'SecurityEvent',
      targetId: event.id,
      targetName: event.title,
      status: 'succeeded',
      details: `Security event "${event.title}" triage status updated from "${previousStatus}" to "${status}".`,
      metadata: { previousStatus, newStatus: status, notes: notes || null },
      diff: [
        { field: 'triageStatus', previousValue: previousStatus, newValue: status },
      ],
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true };
  }

  public getComplianceControls(filters?: {
    searchQuery?: string;
    domain?: string;
    implementationStatus?: string;
    evidenceStatus?: string;
  }): ComplianceControl[] {
    return filterComplianceControls(this.complianceControls, filters || {});
  }

  public updateComplianceControlRemediation(
    id: string,
    notes: string,
    targetDate?: string,
    reviewer = 'Elena Rostova (Compliance Auditor)'
  ): { success: boolean; error?: string } {
    const control = this.complianceControls.find((c) => c.id === id);
    if (!control) {
      return { success: false, error: `Compliance control "${id}" not found.` };
    }

    if (!notes || notes.trim().length < 5) {
      return { success: false, error: 'Remediation notes must be at least 5 characters.' };
    }

    control.remediationNotes = notes.trim();
    if (targetDate) control.remediationTargetDate = targetDate;
    control.lastReviewedAt = new Date().toISOString();

    this.auditEvents.unshift({
      id: `audit_cmp_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'compliance_governance',
      action: 'COMPLIANCE_CONTROL_REMEDIATION_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_audit_04',
        name: reviewer,
        email: 'elena.r@saas-platform.internal',
        role: 'compliance_auditor',
        actorType: 'compliance_auditor',
      },
      targetEntity: 'ComplianceControl',
      targetId: control.id,
      targetName: control.name,
      status: 'succeeded',
      details: `Updated remediation plan and notes for compliance control ${control.id} (${control.name}).`,
      metadata: { notes: notes.trim(), targetDate: targetDate || null },
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true };
  }

  public getGovernanceEvidence(filters?: {
    searchQuery?: string;
    evidenceType?: string;
    reviewStatus?: string;
    controlId?: string;
  }): GovernanceEvidence[] {
    return filterGovernanceEvidence(this.governanceEvidence, filters || {});
  }

  public updateGovernanceEvidenceStatus(
    id: string,
    status: 'verified' | 'pending_inspection' | 'unavailable',
    notes?: string,
    reviewer = 'Elena Rostova (Compliance Auditor)'
  ): { success: boolean; error?: string } {
    const evidence = this.governanceEvidence.find((e) => e.id === id);
    if (!evidence) {
      return { success: false, error: `Governance evidence record "${id}" not found.` };
    }

    const previousStatus = evidence.reviewStatus;
    evidence.reviewStatus = status;
    if (notes) evidence.notes = notes.trim();
    evidence.reviewerLabel = reviewer;
    evidence.collectionDate = new Date().toISOString();

    this.auditEvents.unshift({
      id: `audit_evd_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'compliance_governance',
      action: 'GOVERNANCE_EVIDENCE_STATUS_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_audit_04',
        name: reviewer,
        email: 'elena.r@saas-platform.internal',
        role: 'compliance_auditor',
        actorType: 'compliance_auditor',
      },
      targetEntity: 'GovernanceEvidence',
      targetId: evidence.id,
      targetName: evidence.title,
      status: 'succeeded',
      details: `Governance evidence "${evidence.title}" verification status changed from "${previousStatus}" to "${status}".`,
      metadata: { previousStatus, newStatus: status, controlId: evidence.controlId },
      diff: [
        { field: 'reviewStatus', previousValue: previousStatus, newValue: status },
      ],
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true };
  }

  public getRetentionPolicies(filters?: {
    searchQuery?: string;
    dataCategory?: string;
    enabledOnly?: boolean;
  }): DataRetentionPolicy[] {
    return filterRetentionPolicies(this.retentionPolicies, filters || {});
  }

  public updateRetentionPolicy(
    id: string,
    newDays: number,
    reason: string,
    isEnabled?: boolean,
    actorName = 'Alexander Sterling (Super Admin)'
  ): { success: boolean; error?: string } {
    const policy = this.retentionPolicies.find((p) => p.id === id);
    if (!policy) {
      return { success: false, error: `Data retention policy "${id}" not found.` };
    }

    const validation = validateRetentionPolicyUpdate(policy, newDays, reason);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const previousDays = policy.retentionDurationDays;
    policy.retentionDurationDays = newDays;
    if (isEnabled !== undefined) policy.isEnabled = isEnabled;
    policy.lastReviewedDate = new Date().toISOString();

    if (newDays === -1) {
      policy.retentionDisplay = 'Permanent Statutory Preservation (Indefinite)';
    } else if (newDays >= 365) {
      const years = Math.round(newDays / 365);
      policy.retentionDisplay = `${newDays.toLocaleString()} Days (~${years} Years)`;
    } else {
      policy.retentionDisplay = `${newDays} Days`;
    }

    this.auditEvents.unshift({
      id: `audit_ret_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'data_retention',
      action: 'RETENTION_POLICY_UPDATED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'DataRetentionPolicy',
      targetId: policy.id,
      targetName: policy.name,
      status: 'succeeded',
      details: `Updated retention policy for "${policy.name}" from ${previousDays} days to ${newDays} days. Reason: ${reason.trim()}`,
      metadata: { previousDays, newDays, isEnabled: policy.isEnabled, reason: reason.trim() },
      diff: [
        { field: 'retentionDurationDays', previousValue: previousDays, newValue: newDays },
      ],
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true };
  }

  // =========================================================================
  // PHASE E-09.14: SYSTEM HEALTH, OBSERVABILITY & PLATFORM OPERATIONS
  // =========================================================================

  public getOperationalComponents(): OperationalComponent[] {
    return [...this.operationalComponents];
  }

  public getComponentById(id: string): OperationalComponent | undefined {
    return this.operationalComponents.find((c) => c.id === id);
  }

  public getPlatformIncidents(): PlatformIncident[] {
    return [...this.platformIncidents];
  }

  public getIncidentById(id: string): PlatformIncident | undefined {
    return this.platformIncidents.find((i) => i.id === id);
  }

  public getPlatformIncident(id: string): PlatformIncident | undefined {
    return this.getIncidentById(id);
  }

  public getMaintenanceWindows(): MaintenanceWindow[] {
    return [...this.maintenanceWindows];
  }

  public getDeploymentRecords(): DeploymentRecord[] {
    return [...this.deploymentRecords];
  }

  public getBackgroundJobs(): BackgroundJobStatus[] {
    return [...this.backgroundJobs];
  }

  public getExternalIntegrations(): ExternalIntegrationRecord[] {
    return [...this.externalIntegrations];
  }

  public getCapacityObservations(): ResourceCapacityObservation[] {
    return [...this.capacityObservations];
  }

  public getBackupRecords(): BackupReadinessRecord[] {
    return [...this.backupRecords];
  }

  public getAlertRules(): AlertRule[] {
    return [...this.alertRules];
  }

  public getAlertRule(id: string): AlertRule | undefined {
    return this.alertRules.find((r) => r.id === id);
  }

  public getAlertRuleById(id: string): AlertRule | undefined {
    return this.getAlertRule(id);
  }

  public acknowledgeIncident(incidentId: string, actorName = 'Alexander Sterling'): { success: boolean; error?: string } {
    const inc = this.platformIncidents.find((i) => i.id === incidentId);
    if (!inc) return { success: false, error: 'Incident not found' };

    const validation = validateIncidentTransition(inc, 'acknowledged');
    if (!validation.isValid) return { success: false, error: validation.error };

    const previousStatus = inc.status;
    inc.status = 'acknowledged';
    inc.acknowledgedAt = new Date().toISOString();
    inc.timeline.unshift({
      id: `tl_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      author: `${actorName} (Super-Admin)`,
      authorRole: 'super_admin',
      type: 'acknowledged',
      message: `Incident acknowledged by ${actorName}. Investigation prioritized in local demonstration state.`,
      previousStatus,
      newStatus: 'acknowledged',
    });

    this.auditEvents.unshift({
      id: `audit_inc_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'security',
      action: 'INCIDENT_ACKNOWLEDGED',
      severity: inc.severity === 'critical' ? 'critical' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'PlatformIncident',
      targetId: inc.id,
      targetName: inc.title,
      status: 'succeeded',
      details: `Operator ${actorName} acknowledged incident "${inc.title}" (Severity: ${inc.severity}).`,
      metadata: { incidentId: inc.id, severity: inc.severity, affected: inc.affectedComponents.join(',') },
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true };
  }

  public transitionIncidentStatus(
    incidentId: string,
    newStatus: IncidentLifecycleStatus,
    context?: { resolutionNotes?: string; rootCause?: string; reopenReason?: string },
    actorName = 'Alexander Sterling'
  ): { success: boolean; error?: string } {
    const inc = this.platformIncidents.find((i) => i.id === incidentId);
    if (!inc) return { success: false, error: 'Incident not found' };

    const validation = validateIncidentTransition(inc, newStatus, context);
    if (!validation.isValid) return { success: false, error: validation.error };

    const previousStatus = inc.status;
    inc.status = newStatus;

    if (newStatus === 'resolved') {
      inc.resolvedAt = new Date().toISOString();
      inc.resolutionNotes = context?.resolutionNotes;
      inc.rootCause = context?.rootCause;

      // Update component health status if affected
      inc.affectedComponents.forEach((compId) => {
        const comp = this.operationalComponents.find((c) => c.id === compId);
        if (comp && comp.status !== 'healthy') {
          comp.status = 'healthy';
        }
      });
    }

    let eventType: 'detected' | 'acknowledged' | 'investigation_note' | 'status_change' | 'reopened' | 'resolved' = 'status_change';
    let msg = `Incident transitioned from ${previousStatus} to ${newStatus}.`;

    if (newStatus === 'resolved') {
      eventType = 'resolved';
      msg = `Incident resolved by ${actorName}. Root Cause: ${context?.rootCause}. Resolution: ${context?.resolutionNotes}`;
    } else if (newStatus === 'open' && previousStatus === 'resolved') {
      eventType = 'reopened';
      msg = `Incident reopened by ${actorName}. Reason: ${context?.reopenReason}`;
    }

    inc.timeline.unshift({
      id: `tl_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      author: `${actorName} (Super-Admin)`,
      authorRole: 'super_admin',
      type: eventType,
      message: msg,
      previousStatus,
      newStatus,
    });

    this.auditEvents.unshift({
      id: `audit_inc_trans_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'system_configuration',
      action: newStatus === 'resolved' ? 'INCIDENT_RESOLVED' : 'INCIDENT_STATUS_TRANSITIONED',
      severity: newStatus === 'resolved' ? 'info' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'PlatformIncident',
      targetId: inc.id,
      targetName: inc.title,
      status: 'succeeded',
      details: `Incident "${inc.title}" moved from ${previousStatus} to ${newStatus}. ${context?.resolutionNotes ? `Resolution: ${context.resolutionNotes}` : ''}`,
      metadata: { incidentId: inc.id, previousStatus, newStatus },
      diff: [
        { field: 'status', previousValue: previousStatus, newValue: newStatus }
      ],
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true };
  }

  public addIncidentNote(incidentId: string, message: string, author = 'Alexander Sterling'): { success: boolean; error?: string } {
    const inc = this.platformIncidents.find((i) => i.id === incidentId);
    if (!inc) return { success: false, error: 'Incident not found' };

    if (!message || message.trim().length < 5) {
      return { success: false, error: 'Investigation note must be at least 5 characters.' };
    }

    inc.timeline.unshift({
      id: `tl_note_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      author: `${author} (Super-Admin)`,
      authorRole: 'super_admin',
      type: 'investigation_note',
      message: message.trim(),
    });

    this.auditEvents.unshift({
      id: `audit_inc_note_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'system_configuration',
      action: 'INCIDENT_INVESTIGATION_NOTE_ADDED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: author,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'PlatformIncident',
      targetId: inc.id,
      targetName: inc.title,
      status: 'succeeded',
      details: `Added investigation note to incident "${inc.title}": ${message.trim()}`,
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true };
  }

  public createMaintenanceWindow(input: CreateMaintenanceInput, actorName = 'Alexander Sterling'): { success: boolean; maintenanceWindow?: MaintenanceWindow; error?: string } {
    const validation = validateMaintenanceWindow(input, this.maintenanceWindows);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    const newWindow: MaintenanceWindow = {
      id: `maint_win_${Date.now().toString(36)}`,
      title: input.title.trim(),
      description: input.description.trim(),
      affectedComponents: input.affectedComponents,
      startTime: input.startTime,
      endTime: input.endTime,
      timeZone: input.timeZone || 'UTC',
      status: 'scheduled',
      impactDescription: input.impactDescription?.trim() || 'Scheduled platform maintenance.',
      responsibleOperator: input.responsibleOperator?.trim() || actorName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceClassification: 'simulated_fixture',
      isDemoFixture: true,
    };

    this.maintenanceWindows.unshift(newWindow);

    this.auditEvents.unshift({
      id: `audit_maint_create_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'system_configuration',
      action: 'MAINTENANCE_WINDOW_SCHEDULED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'MaintenanceWindow',
      targetId: newWindow.id,
      targetName: newWindow.title,
      status: 'succeeded',
      details: `Scheduled maintenance window "${newWindow.title}" from ${newWindow.startTime} to ${newWindow.endTime} (UTC). Components: ${newWindow.affectedComponents.join(', ')}`,
      metadata: { startTime: newWindow.startTime, endTime: newWindow.endTime, affected: newWindow.affectedComponents.join(',') },
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true, maintenanceWindow: newWindow };
  }

  public updateMaintenanceWindow(id: string, input: Partial<CreateMaintenanceInput>, actorName = 'Alexander Sterling'): { success: boolean; maintenanceWindow?: MaintenanceWindow; error?: string } {
    const win = this.maintenanceWindows.find((w) => w.id === id);
    if (!win) return { success: false, error: 'Maintenance window not found' };

    const merged: CreateMaintenanceInput = {
      title: input.title !== undefined ? input.title : win.title,
      description: input.description !== undefined ? input.description : win.description,
      affectedComponents: input.affectedComponents !== undefined ? input.affectedComponents : win.affectedComponents,
      startTime: input.startTime !== undefined ? input.startTime : win.startTime,
      endTime: input.endTime !== undefined ? input.endTime : win.endTime,
      timeZone: input.timeZone !== undefined ? input.timeZone : win.timeZone,
      impactDescription: input.impactDescription !== undefined ? input.impactDescription : win.impactDescription,
      responsibleOperator: input.responsibleOperator !== undefined ? input.responsibleOperator : win.responsibleOperator,
    };

    const validation = validateMaintenanceWindow(merged, this.maintenanceWindows, id);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    win.title = merged.title;
    win.description = merged.description;
    win.affectedComponents = merged.affectedComponents;
    win.startTime = merged.startTime;
    win.endTime = merged.endTime;
    win.timeZone = merged.timeZone || 'UTC';
    win.impactDescription = merged.impactDescription;
    win.responsibleOperator = merged.responsibleOperator || win.responsibleOperator;
    win.updatedAt = new Date().toISOString();

    this.auditEvents.unshift({
      id: `audit_maint_upd_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'system_configuration',
      action: 'MAINTENANCE_WINDOW_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'MaintenanceWindow',
      targetId: win.id,
      targetName: win.title,
      status: 'succeeded',
      details: `Updated parameters for maintenance window "${win.title}".`,
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true, maintenanceWindow: win };
  }

  public cancelMaintenanceWindow(id: string, reason: string, actorName = 'Alexander Sterling'): { success: boolean; error?: string } {
    const win = this.maintenanceWindows.find((w) => w.id === id);
    if (!win) return { success: false, error: 'Maintenance window not found' };

    if (!reason || reason.trim().length < 5) {
      return { success: false, error: 'A mandatory cancellation reason (minimum 5 characters) is required.' };
    }

    win.status = 'cancelled';
    win.cancellationReason = reason.trim();
    win.updatedAt = new Date().toISOString();

    this.auditEvents.unshift({
      id: `audit_maint_cancel_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'system_configuration',
      action: 'MAINTENANCE_WINDOW_CANCELLED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'MaintenanceWindow',
      targetId: win.id,
      targetName: win.title,
      status: 'succeeded',
      details: `Cancelled maintenance window "${win.title}". Reason: ${reason.trim()}`,
      metadata: { cancellationReason: reason.trim() },
      diff: [
        { field: 'status', previousValue: 'scheduled', newValue: 'cancelled' }
      ],
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true };
  }

  public createAlertRule(input: CreateAlertRuleInput, actorName = 'Alexander Sterling'): { success: boolean; alertRule?: AlertRule; error?: string } {
    const validation = validateAlertRule(input, METRIC_DEFINITIONS);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    const comp = this.operationalComponents.find((c) => c.id === input.targetComponentId);
    const metric = METRIC_DEFINITIONS.find((m) => m.id === input.metricId);

    const newRule: AlertRule = {
      id: `rule_${Date.now().toString(36)}`,
      name: input.name.trim(),
      description: input.description.trim(),
      targetComponentId: input.targetComponentId,
      targetComponentName: comp?.name || input.targetComponentId,
      metricId: input.metricId,
      metricName: metric?.name || input.metricId,
      operator: input.operator,
      thresholdValue: Number(input.thresholdValue),
      unit: input.unit,
      evaluationWindow: input.evaluationWindow,
      severity: input.severity,
      isEnabled: true,
      notificationPolicyRef: input.notificationPolicyRef || 'Platform SRE Notification (Planned)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceClassification: 'simulated_fixture',
      isDemoFixture: true,
    };

    this.alertRules.unshift(newRule);

    this.auditEvents.unshift({
      id: `audit_rule_create_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'system_configuration',
      action: 'ALERT_RULE_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'AlertRule',
      targetId: newRule.id,
      targetName: newRule.name,
      status: 'succeeded',
      details: `Created alert rule "${newRule.name}" (${newRule.metricName} ${newRule.operator} ${newRule.thresholdValue}${newRule.unit} over ${newRule.evaluationWindow}).`,
      metadata: { targetComponent: newRule.targetComponentName, metric: newRule.metricName, threshold: newRule.thresholdValue },
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true, alertRule: newRule };
  }

  public updateAlertRule(id: string, input: Partial<CreateAlertRuleInput>, actorName = 'Alexander Sterling'): { success: boolean; alertRule?: AlertRule; error?: string } {
    const rule = this.alertRules.find((r) => r.id === id);
    if (!rule) return { success: false, error: 'Alert rule not found' };

    const merged: CreateAlertRuleInput = {
      name: input.name !== undefined ? input.name : rule.name,
      description: input.description !== undefined ? input.description : rule.description,
      targetComponentId: input.targetComponentId !== undefined ? input.targetComponentId : rule.targetComponentId,
      metricId: input.metricId !== undefined ? input.metricId : rule.metricId,
      operator: input.operator !== undefined ? input.operator : rule.operator,
      thresholdValue: input.thresholdValue !== undefined ? input.thresholdValue : rule.thresholdValue,
      unit: input.unit !== undefined ? input.unit : rule.unit,
      evaluationWindow: input.evaluationWindow !== undefined ? input.evaluationWindow : rule.evaluationWindow,
      severity: input.severity !== undefined ? input.severity : rule.severity,
      notificationPolicyRef: input.notificationPolicyRef !== undefined ? input.notificationPolicyRef : rule.notificationPolicyRef,
    };

    const validation = validateAlertRule(merged, METRIC_DEFINITIONS);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    const previousThreshold = rule.thresholdValue;
    rule.name = merged.name;
    rule.description = merged.description;
    rule.targetComponentId = merged.targetComponentId;
    rule.metricId = merged.metricId;
    rule.operator = merged.operator;
    rule.thresholdValue = Number(merged.thresholdValue);
    rule.unit = merged.unit;
    rule.evaluationWindow = merged.evaluationWindow;
    rule.severity = merged.severity;
    rule.notificationPolicyRef = merged.notificationPolicyRef || rule.notificationPolicyRef;
    rule.updatedAt = new Date().toISOString();

    this.auditEvents.unshift({
      id: `audit_rule_upd_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'system_configuration',
      action: 'ALERT_RULE_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'AlertRule',
      targetId: rule.id,
      targetName: rule.name,
      status: 'succeeded',
      details: `Updated alert rule "${rule.name}" threshold to ${rule.thresholdValue}${rule.unit}.`,
      diff: [
        { field: 'thresholdValue', previousValue: previousThreshold, newValue: rule.thresholdValue }
      ],
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true, alertRule: rule };
  }

  public toggleAlertRule(id: string, actorName = 'Alexander Sterling'): { success: boolean; alertRule?: AlertRule; error?: string } {
    const rule = this.alertRules.find((r) => r.id === id);
    if (!rule) return { success: false, error: 'Alert rule not found' };

    rule.isEnabled = !rule.isEnabled;
    rule.updatedAt = new Date().toISOString();

    this.auditEvents.unshift({
      id: `audit_rule_tog_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'system_configuration',
      action: rule.isEnabled ? 'ALERT_RULE_ENABLED' : 'ALERT_RULE_DISABLED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'AlertRule',
      targetId: rule.id,
      targetName: rule.name,
      status: 'succeeded',
      details: `Alert rule "${rule.name}" is now ${rule.isEnabled ? 'enabled' : 'disabled'}. Evaluation operates in local demo state.`,
      metadata: { isEnabled: rule.isEnabled },
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true, alertRule: rule };
  }

  public deleteAlertRule(id: string, actorName = 'Alexander Sterling'): { success: boolean; error?: string } {
    const idx = this.alertRules.findIndex((r) => r.id === id);
    if (idx === -1) return { success: false, error: 'Alert rule not found' };

    const deleted = this.alertRules[idx];
    this.alertRules.splice(idx, 1);

    this.auditEvents.unshift({
      id: `audit_rule_del_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'system_configuration',
      action: 'ALERT_RULE_DELETED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'AlertRule',
      targetId: deleted.id,
      targetName: deleted.name,
      status: 'succeeded',
      details: `Removed alert rule "${deleted.name}" from demonstration catalogue.`,
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true };
  }

  // ==========================================
  // PHASE E-09.15: PLATFORM CONFIGURATION & GOVERNANCE
  // ==========================================

  public getExtendedSettings(): ExtendedPlatformSettings {
    return structuredClone(this.extendedSettings);
  }

  public updateExtendedSettings(
    input: Partial<ExtendedPlatformSettings>,
    reason = 'Updated global platform configuration and policy.',
    actorName = 'Alexander Sterling'
  ): { success: boolean; error?: string } {
    const merged: ExtendedPlatformSettings = {
      ...this.extendedSettings,
      ...input,
      branding: { ...this.extendedSettings.branding, ...(input.branding || {}) },
      regional: { ...this.extendedSettings.regional, ...(input.regional || {}) },
      onboardingPolicy: { ...this.extendedSettings.onboardingPolicy, ...(input.onboardingPolicy || {}) },
      academicDefaults: { ...this.extendedSettings.academicDefaults, ...(input.academicDefaults || {}) },
      securityPolicy: { ...this.extendedSettings.securityPolicy, ...(input.securityPolicy || {}) },
      notificationDefaults: { ...this.extendedSettings.notificationDefaults, ...(input.notificationDefaults || {}) },
      maintenance: { ...this.extendedSettings.maintenance, ...(input.maintenance || {}) },
    };

    const validation = validatePlatformSettings(merged);
    if (!validation.isValid) {
      return { success: false, error: validation.errors[0] };
    }

    const prevSettings = structuredClone(this.extendedSettings);
    this.extendedSettings = merged;

    // Keep legacy settings in sync for backwards compatibility
    this.settings = {
      ...this.settings,
      branding: { ...this.settings.branding, ...merged.branding },
      regional: { ...this.settings.regional, ...merged.regional },
      onboardingPolicy: { ...this.settings.onboardingPolicy, ...merged.onboardingPolicy },
      maintenance: { ...this.settings.maintenance, ...merged.maintenance },
    };

    // Record config version diff
    const diff: { field: string; oldValue: any; newValue: any }[] = [];
    if (JSON.stringify(prevSettings.branding) !== JSON.stringify(merged.branding)) {
      diff.push({ field: 'branding', oldValue: prevSettings.branding.platformName, newValue: merged.branding.platformName });
    }
    if (JSON.stringify(prevSettings.regional) !== JSON.stringify(merged.regional)) {
      diff.push({ field: 'regional.defaultCurrency', oldValue: prevSettings.regional.defaultCurrency, newValue: merged.regional.defaultCurrency });
    }
    if (JSON.stringify(prevSettings.securityPolicy) !== JSON.stringify(merged.securityPolicy)) {
      diff.push({ field: 'securityPolicy.sessionTimeoutMinutes', oldValue: prevSettings.securityPolicy.sessionTimeoutMinutes, newValue: merged.securityPolicy.sessionTimeoutMinutes });
    }

    this.configVersions.unshift({
      id: `ver_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      entityType: 'PlatformSettings',
      entityId: 'global_platform_settings',
      entityName: 'Global Platform Settings',
      action: 'UPDATE',
      scope: 'global',
      reason,
      diff: diff.length > 0 ? diff : [{ field: 'settings', oldValue: 'previous', newValue: 'updated' }],
      canRestore: true,
    });

    this.auditEvents.unshift({
      id: `audit_cfg_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'system_configuration',
      action: 'PLATFORM_SETTINGS_UPDATED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'PlatformSettings',
      targetId: 'global_settings',
      status: 'succeeded',
      details: reason,
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true };
  }

  public getFeatureFlags(): FeatureFlag[] {
    return structuredClone(this.featureFlags);
  }

  public getFeatureFlagByKey(key: string): FeatureFlag | undefined {
    const flag = this.featureFlags.find((f) => f.key === key);
    return flag ? structuredClone(flag) : undefined;
  }

  public createFeatureFlag(
    input: Partial<FeatureFlag>,
    actorName = 'Alexander Sterling'
  ): { success: boolean; flag?: FeatureFlag; error?: string } {
    const validation = validateFeatureFlag(input, this.featureFlags, true);
    if (!validation.isValid) {
      return { success: false, error: validation.errors[0] };
    }

    const now = new Date().toISOString();
    const newFlag: FeatureFlag = {
      id: `flag_${Date.now().toString(36)}`,
      key: input.key!.trim().toLowerCase(),
      name: input.name!.trim(),
      description: input.description!.trim(),
      category: input.category || 'platform_operations',
      lifecycle: input.lifecycle || 'draft',
      defaultValue: input.defaultValue ?? false,
      enabled: input.enabled ?? (input.defaultValue ?? false),
      scope: input.scope || 'global',
      environment: input.environment || 'all',
      risk: input.risk || 'standard',
      owner: input.owner || 'Platform Engineering',
      createdAt: now,
      updatedAt: now,
      dependsOnFlagKeys: input.dependsOnFlagKeys || [],
      rolloutStrategy: input.rolloutStrategy || 'all_tenants',
      rolloutPercentage: input.rolloutPercentage,
      rolloutTenantIds: input.rolloutTenantIds,
      rolloutScheduledStart: input.rolloutScheduledStart,
      rolloutScheduledEnd: input.rolloutScheduledEnd,
      relatedModuleId: input.relatedModuleId,
      sourceStatus: 'verified_local_mock',
      backendEnforcementNotice: 'Demonstration flag registered in Super-Admin client. Production requires gateway enforcement.',
    };

    this.featureFlags.unshift(newFlag);

    this.configVersions.unshift({
      id: `ver_flg_${Date.now().toString(36)}`,
      timestamp: now,
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      entityType: 'FeatureFlag',
      entityId: newFlag.key,
      entityName: newFlag.name,
      action: 'CREATE',
      scope: newFlag.scope,
      reason: `Registered new feature flag "${newFlag.name}".`,
      diff: [
        { field: 'key', oldValue: null, newValue: newFlag.key },
        { field: 'lifecycle', oldValue: null, newValue: newFlag.lifecycle },
        { field: 'enabled', oldValue: null, newValue: newFlag.enabled },
      ],
      canRestore: true,
    });

    this.auditEvents.unshift({
      id: `audit_flag_create_${Date.now().toString(36)}`,
      timestamp: now,
      category: 'feature_toggles',
      action: 'FEATURE_FLAG_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'FeatureFlag',
      targetId: newFlag.key,
      targetName: newFlag.name,
      status: 'succeeded',
      details: `Created feature flag "${newFlag.name}" with key "${newFlag.key}".`,
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true, flag: newFlag };
  }

  public updateFeatureFlag(
    key: string,
    input: Partial<FeatureFlag>,
    reason = 'Updated feature flag parameters.',
    actorName = 'Alexander Sterling'
  ): { success: boolean; flag?: FeatureFlag; error?: string } {
    const idx = this.featureFlags.findIndex((f) => f.key === key);
    if (idx === -1) {
      return { success: false, error: `Feature flag "${key}" not found.` };
    }

    const current = this.featureFlags[idx];
    const updatedCandidate: FeatureFlag = {
      ...current,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    const validation = validateFeatureFlag(updatedCandidate, this.featureFlags, false);
    if (!validation.isValid) {
      return { success: false, error: validation.errors[0] };
    }

    // Check lifecycle transition
    if (input.lifecycle && input.lifecycle !== current.lifecycle) {
      const transitionCheck = canTransitionLifecycle(current.lifecycle, input.lifecycle);
      if (!transitionCheck.allowed) {
        return { success: false, error: transitionCheck.reason };
      }
    }

    const diff: { field: string; oldValue: any; newValue: any }[] = [];
    if (input.enabled !== undefined && input.enabled !== current.enabled) {
      diff.push({ field: 'enabled', oldValue: current.enabled, newValue: input.enabled });
    }
    if (input.lifecycle && input.lifecycle !== current.lifecycle) {
      diff.push({ field: 'lifecycle', oldValue: current.lifecycle, newValue: input.lifecycle });
    }
    if (input.risk && input.risk !== current.risk) {
      diff.push({ field: 'risk', oldValue: current.risk, newValue: input.risk });
    }

    this.featureFlags[idx] = updatedCandidate;

    this.configVersions.unshift({
      id: `ver_flg_upd_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      entityType: 'FeatureFlag',
      entityId: updatedCandidate.key,
      entityName: updatedCandidate.name,
      action: 'UPDATE',
      scope: updatedCandidate.scope,
      reason,
      diff: diff.length > 0 ? diff : [{ field: 'parameters', oldValue: 'previous', newValue: 'updated' }],
      canRestore: true,
    });

    this.auditEvents.unshift({
      id: `audit_flg_upd_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'feature_toggles',
      action: 'FEATURE_FLAG_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'FeatureFlag',
      targetId: updatedCandidate.key,
      targetName: updatedCandidate.name,
      status: 'succeeded',
      details: reason,
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true, flag: updatedCandidate };
  }

  public transitionFeatureFlagLifecycle(
    key: string,
    targetLifecycle: FeatureFlagLifecycle,
    reason: string,
    actorName = 'Alexander Sterling'
  ): { success: boolean; flag?: FeatureFlag; error?: string } {
    const flag = this.featureFlags.find((f) => f.key === key);
    if (!flag) return { success: false, error: `Feature flag "${key}" not found.` };

    const transitionCheck = canTransitionLifecycle(flag.lifecycle, targetLifecycle);
    if (!transitionCheck.allowed) {
      return { success: false, error: transitionCheck.reason };
    }

    const oldLifecycle = flag.lifecycle;
    flag.lifecycle = targetLifecycle;
    flag.updatedAt = new Date().toISOString();

    if (targetLifecycle === 'disabled' || targetLifecycle === 'archived') {
      flag.enabled = false;
    } else if (targetLifecycle === 'active') {
      flag.enabled = true;
    }

    this.configVersions.unshift({
      id: `ver_flg_trans_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      entityType: 'FeatureFlag',
      entityId: flag.key,
      entityName: flag.name,
      action: 'UPDATE',
      scope: flag.scope,
      reason,
      diff: [
        { field: 'lifecycle', oldValue: oldLifecycle, newValue: targetLifecycle },
        { field: 'enabled', oldValue: !flag.enabled, newValue: flag.enabled },
      ],
      canRestore: true,
    });

    this.auditEvents.unshift({
      id: `audit_flg_trans_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'feature_toggles',
      action: 'FEATURE_FLAG_LIFECYCLE_TRANSITIONED',
      severity: targetLifecycle === 'archived' ? 'warning' : 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'FeatureFlag',
      targetId: flag.key,
      targetName: flag.name,
      status: 'succeeded',
      details: `Lifecycle of flag "${flag.name}" changed from "${oldLifecycle}" to "${targetLifecycle}". Justification: ${reason}`,
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true, flag };
  }

  public toggleFeatureFlag(
    key: string,
    actorName = 'Alexander Sterling'
  ): { success: boolean; flag?: FeatureFlag; error?: string } {
    const flag = this.featureFlags.find((f) => f.key === key);
    if (!flag) return { success: false, error: `Feature flag "${key}" not found.` };

    if (flag.lifecycle === 'archived') {
      return {
        success: false,
        error: `Cannot toggle archived feature flag "${flag.name}". Archived flags must be restored to "draft" or "disabled" status first.`,
      };
    }

    // If enabling, verify dependencies
    if (!flag.enabled && flag.dependsOnFlagKeys && flag.dependsOnFlagKeys.length > 0) {
      const missingOrDisabled = flag.dependsOnFlagKeys.filter((depKey) => {
        const dep = this.featureFlags.find((f) => f.key === depKey);
        return !dep || !dep.enabled || dep.lifecycle !== 'active';
      });

      if (missingOrDisabled.length > 0) {
        return {
          success: false,
          error: `Cannot enable feature flag "${flag.name}": required dependencies [${missingOrDisabled.join(', ')}] are missing or disabled.`,
        };
      }
    }

    const previousEnabled = flag.enabled;
    flag.enabled = !flag.enabled;
    flag.updatedAt = new Date().toISOString();

    if (flag.enabled && flag.lifecycle !== 'active') {
      flag.lifecycle = 'active';
    } else if (!flag.enabled && flag.lifecycle === 'active') {
      flag.lifecycle = 'disabled';
    }

    this.configVersions.unshift({
      id: `ver_flg_tog_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      entityType: 'FeatureFlag',
      entityId: flag.key,
      entityName: flag.name,
      action: 'TOGGLE',
      scope: flag.scope,
      reason: `Toggled feature flag availability to ${flag.enabled ? 'Enabled' : 'Disabled'}.`,
      diff: [{ field: 'enabled', oldValue: previousEnabled, newValue: flag.enabled }],
      canRestore: true,
    });

    this.auditEvents.unshift({
      id: `audit_flg_tog_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'feature_toggles',
      action: 'FEATURE_FLAG_TOGGLED',
      severity: flag.risk === 'critical' ? 'critical' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'FeatureFlag',
      targetId: flag.key,
      targetName: flag.name,
      status: 'succeeded',
      details: `Feature flag "${flag.name}" is now ${flag.enabled ? 'ENABLED' : 'DISABLED'} in local demo store.`,
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true, flag };
  }

  public deleteFeatureFlag(
    key: string,
    actorName = 'Alexander Sterling'
  ): { success: boolean; error?: string } {
    const idx = this.featureFlags.findIndex((f) => f.key === key);
    if (idx === -1) return { success: false, error: `Feature flag "${key}" not found.` };

    const flag = this.featureFlags[idx];

    // Check if other flags depend on this
    const dependents = this.featureFlags.filter((f) => f.dependsOnFlagKeys?.includes(key));
    if (dependents.length > 0) {
      return {
        success: false,
        error: `Cannot delete flag "${flag.name}": other flags [${dependents.map((d) => d.name).join(', ')}] depend on it.`,
      };
    }

    this.featureFlags.splice(idx, 1);
    this.tenantOverrides = this.tenantOverrides.filter((o) => o.flagKey !== key);

    this.configVersions.unshift({
      id: `ver_flg_del_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      entityType: 'FeatureFlag',
      entityId: flag.key,
      entityName: flag.name,
      action: 'DELETE',
      scope: flag.scope,
      reason: `Deleted feature flag "${flag.name}" from registry.`,
      diff: [{ field: 'flag', oldValue: flag.key, newValue: null }],
      canRestore: false,
    });

    this.auditEvents.unshift({
      id: `audit_flg_del_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'feature_toggles',
      action: 'FEATURE_FLAG_DELETED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'FeatureFlag',
      targetId: flag.key,
      targetName: flag.name,
      status: 'succeeded',
      details: `Removed feature flag "${flag.name}" from demonstration catalogue.`,
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true };
  }

  public getTenantOverrides(organizationId?: string): TenantFeatureOverride[] {
    if (organizationId) {
      return this.tenantOverrides.filter((o) => o.organizationId === organizationId);
    }
    return structuredClone(this.tenantOverrides);
  }

  public setTenantFeatureOverride(input: {
    organizationId: string;
    flagKey: string;
    overrideValue: boolean;
    reason: string;
    actorName?: string;
  }): { success: boolean; override?: TenantFeatureOverride; error?: string } {
    const org = this.organizations.find((o) => o.id === input.organizationId);
    if (!org) return { success: false, error: `Organization "${input.organizationId}" not found.` };

    const flag = this.featureFlags.find((f) => f.key === input.flagKey);
    if (!flag) return { success: false, error: `Feature flag "${input.flagKey}" not found.` };

    if (flag.lifecycle === 'archived') {
      return { success: false, error: `Cannot configure override for archived feature flag "${flag.name}".` };
    }

    if (!input.reason || input.reason.trim().length < 5) {
      return { success: false, error: 'A valid justification reason (min 5 chars) is required for tenant overrides.' };
    }

    const actor = input.actorName || 'Alexander Sterling (Super-Admin)';
    const now = new Date().toISOString();

    const existingIdx = this.tenantOverrides.findIndex(
      (o) => o.organizationId === input.organizationId && o.flagKey === input.flagKey
    );

    let override: TenantFeatureOverride;
    if (existingIdx !== -1) {
      const prev = this.tenantOverrides[existingIdx];
      override = {
        ...prev,
        overrideValue: input.overrideValue,
        reason: input.reason.trim(),
        actor,
        updatedAt: now,
      };
      this.tenantOverrides[existingIdx] = override;
    } else {
      override = {
        id: `override_${Date.now().toString(36)}`,
        organizationId: input.organizationId,
        flagKey: input.flagKey,
        overrideValue: input.overrideValue,
        reason: input.reason.trim(),
        actor,
        createdAt: now,
        updatedAt: now,
      };
      this.tenantOverrides.unshift(override);
    }

    this.configVersions.unshift({
      id: `ver_ovr_${Date.now().toString(36)}`,
      timestamp: now,
      actor: {
        id: 'usr_super_01',
        name: actor,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      entityType: 'TenantOverride',
      entityId: `${input.organizationId}:${input.flagKey}`,
      entityName: `${org.name} - ${flag.name}`,
      action: 'OVERRIDE',
      scope: `organization:${org.id}`,
      reason: input.reason,
      diff: [{ field: 'overrideValue', oldValue: !input.overrideValue, newValue: input.overrideValue }],
      canRestore: true,
    });

    this.auditEvents.unshift({
      id: `audit_ovr_${Date.now().toString(36)}`,
      timestamp: now,
      category: 'feature_toggles',
      action: 'TENANT_OVERRIDE_SAVED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: actor,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'TenantFeatureOverride',
      targetId: override.id,
      targetName: `${org.name}: ${flag.name}`,
      organizationId: org.id,
      status: 'succeeded',
      details: `Configured override for "${org.name}": flag "${flag.name}" is forced to ${input.overrideValue ? 'ENABLED' : 'DISABLED'}. Reason: ${input.reason}`,
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true, override };
  }

  public removeTenantFeatureOverride(
    organizationId: string,
    flagKey: string,
    reason = 'Restored platform default inheritance.',
    actorName = 'Alexander Sterling'
  ): { success: boolean; error?: string } {
    const idx = this.tenantOverrides.findIndex(
      (o) => o.organizationId === organizationId && o.flagKey === flagKey
    );
    if (idx === -1) {
      return { success: false, error: 'Tenant override not found.' };
    }

    const removed = this.tenantOverrides[idx];
    const org = this.organizations.find((o) => o.id === organizationId);
    const flag = this.featureFlags.find((f) => f.key === flagKey);

    this.tenantOverrides.splice(idx, 1);

    this.configVersions.unshift({
      id: `ver_ovr_rem_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      entityType: 'TenantOverride',
      entityId: `${organizationId}:${flagKey}`,
      entityName: `${org?.name || organizationId} - ${flag?.name || flagKey}`,
      action: 'DELETE',
      scope: `organization:${organizationId}`,
      reason,
      diff: [{ field: 'overrideValue', oldValue: removed.overrideValue, newValue: 'inherited' }],
      canRestore: true,
    });

    this.auditEvents.unshift({
      id: `audit_ovr_rem_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'feature_toggles',
      action: 'TENANT_OVERRIDE_REMOVED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'TenantFeatureOverride',
      targetId: removed.id,
      targetName: `${org?.name || organizationId}: ${flag?.name || flagKey}`,
      organizationId,
      status: 'succeeded',
      details: `Removed override for "${org?.name || organizationId}". Reverted to inherited platform default. Reason: ${reason}`,
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true };
  }

  public evaluateEffectiveFlag(
    flagKey: string,
    organizationId?: string,
    environment?: string
  ): EffectiveConfigurationResult {
    return evaluateEffectiveConfiguration({
      flagKey,
      organizationId,
      environment,
      flags: this.featureFlags,
      overrides: this.tenantOverrides,
      organizations: this.organizations,
      modules: this.modules,
      plans: this.plans,
      subscriptions: this.subscriptions,
    });
  }

  public getEnvironmentConfigs(): PlatformEnvironmentConfig[] {
    return structuredClone(this.environments);
  }

  public applyRolloutPlan(
    input: RolloutPlanInput,
    actorName = 'Alexander Sterling'
  ): { success: boolean; summary?: RolloutPreviewSummary; error?: string } {
    const validation = validateRolloutPlan(input, this.featureFlags, this.organizations);
    if (!validation.isValid) {
      return { success: false, error: validation.errors[0] };
    }

    const flag = this.featureFlags.find((f) => f.key === input.flagKey);
    if (!flag) return { success: false, error: `Flag "${input.flagKey}" not found.` };

    flag.rolloutStrategy = input.strategy;
    flag.rolloutPercentage = input.targetPercentage;
    flag.rolloutTenantIds = input.targetOrganizationIds;
    flag.rolloutScheduledStart = input.scheduledStartDate;
    flag.rolloutScheduledEnd = input.scheduledEndDate;
    flag.updatedAt = new Date().toISOString();

    const summary = estimateRolloutScope(
      flag,
      input.strategy,
      input.targetPercentage,
      input.targetOrganizationIds,
      this.organizations
    );

    this.configVersions.unshift({
      id: `ver_roll_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      entityType: 'FeatureFlag',
      entityId: flag.key,
      entityName: flag.name,
      action: 'UPDATE',
      scope: 'rollout_plan',
      reason: input.notes || 'Updated staged rollout configuration plan.',
      diff: [
        { field: 'rolloutStrategy', oldValue: 'previous', newValue: input.strategy },
        { field: 'targetPercentage', oldValue: null, newValue: input.targetPercentage ?? null },
      ],
      canRestore: true,
    });

    this.auditEvents.unshift({
      id: `audit_roll_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'feature_toggles',
      action: 'ROLLOUT_PLAN_APPLIED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'FeatureFlag',
      targetId: flag.key,
      targetName: flag.name,
      status: 'succeeded',
      details: `Staged rollout plan applied: Strategy="${input.strategy}". Estimated targeted organizations: ${summary.targetedTenantCount} of ${summary.eligibleTenantCount}. (Local simulation only).`,
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true, summary };
  }

  public getChangeProposals(): ConfigurationChangeProposal[] {
    return structuredClone(this.changeProposals);
  }

  public createChangeProposal(
    input: Partial<ConfigurationChangeProposal>
  ): { success: boolean; proposal?: ConfigurationChangeProposal; error?: string } {
    const validation = validateChangeProposal(input);
    if (!validation.isValid) {
      return { success: false, error: validation.errors[0] };
    }

    const now = new Date().toISOString();
    const proposal: ConfigurationChangeProposal = {
      id: `prop_${Date.now().toString(36)}`,
      title: input.title!.trim(),
      description: input.description?.trim() || '',
      reason: input.reason!.trim(),
      scope: input.scope || 'platform_settings',
      targetEntity: input.targetEntity || 'PlatformSettings',
      targetId: input.targetId || 'global_settings',
      status: input.status || 'draft',
      author: input.author || {
        id: 'usr_super_01',
        name: 'Alexander Sterling',
        role: 'super_admin',
      },
      diff: input.diff || [],
      createdAt: now,
      updatedAt: now,
    };

    this.changeProposals.unshift(proposal);

    this.auditEvents.unshift({
      id: `audit_prop_new_${Date.now().toString(36)}`,
      timestamp: now,
      category: 'system_configuration',
      action: 'CONFIG_PROPOSAL_CREATED',
      severity: 'info',
      actor: {
        id: proposal.author.id,
        name: proposal.author.name,
        email: 'alexander.s@saas-platform.internal',
        role: proposal.author.role,
        actorType: 'super_admin',
      },
      targetEntity: 'ConfigurationChangeProposal',
      targetId: proposal.id,
      targetName: proposal.title,
      status: 'succeeded',
      details: `Created configuration change proposal "${proposal.title}". Reason: ${proposal.reason}`,
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true, proposal };
  }

  public transitionProposalStatus(
    proposalId: string,
    targetStatus: ProposalStatus,
    reviewerNotes?: string,
    actorName = 'Alexander Sterling'
  ): { success: boolean; proposal?: ConfigurationChangeProposal; error?: string } {
    const prop = this.changeProposals.find((p) => p.id === proposalId);
    if (!prop) return { success: false, error: `Proposal "${proposalId}" not found.` };

    const previousStatus = prop.status;
    prop.status = targetStatus;
    prop.updatedAt = new Date().toISOString();

    if (reviewerNotes || targetStatus === 'approved' || targetStatus === 'rejected') {
      prop.reviewer = {
        id: 'usr_super_01',
        name: actorName,
        role: 'super_admin',
        notes: reviewerNotes,
        reviewedAt: new Date().toISOString(),
      };
    }

    if (targetStatus === 'applied_locally') {
      prop.appliedAt = new Date().toISOString();

      // If proposal target is a flag or tenant override, apply changes to store
      if (prop.scope === 'feature_flag') {
        const flag = this.featureFlags.find((f) => f.key === prop.targetId);
        if (flag) {
          for (const d of prop.diff) {
            (flag as any)[d.field] = d.proposedValue;
          }
        }
      } else if (prop.scope === 'tenant_override') {
        const flagKeyDiff = prop.diff.find((d) => d.field === 'flagKey');
        const valDiff = prop.diff.find((d) => d.field === 'overrideValue');
        if (flagKeyDiff && valDiff) {
          this.setTenantFeatureOverride({
            organizationId: prop.targetId,
            flagKey: String(flagKeyDiff.proposedValue),
            overrideValue: Boolean(valDiff.proposedValue),
            reason: prop.reason,
            actorName,
          });
        }
      }
    }

    this.auditEvents.unshift({
      id: `audit_prop_status_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'system_configuration',
      action: 'CONFIG_PROPOSAL_STATUS_CHANGED',
      severity: targetStatus === 'rejected' ? 'warning' : 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'ConfigurationChangeProposal',
      targetId: prop.id,
      targetName: prop.title,
      status: 'succeeded',
      details: `Proposal "${prop.title}" transitioned from "${previousStatus}" to "${targetStatus}". ${reviewerNotes ? `Notes: ${reviewerNotes}` : ''}`,
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true, proposal: prop };
  }

  public getConfigVersions(): ConfigVersionEntry[] {
    return structuredClone(this.configVersions);
  }

  public restoreConfigVersion(
    versionId: string,
    actorName = 'Alexander Sterling'
  ): { success: boolean; error?: string } {
    const version = this.configVersions.find((v) => v.id === versionId);
    if (!version) return { success: false, error: `Version entry "${versionId}" not found.` };

    // Apply restore based on entity type
    if (version.entityType === 'FeatureFlag') {
      const flag = this.featureFlags.find((f) => f.key === version.entityId);
      if (flag) {
        for (const item of version.diff) {
          const oldVal = item.oldValue ?? item.previousValue;
          if (oldVal !== undefined && oldVal !== null) {
            (flag as any)[item.field] = oldVal;
          }
        }
        flag.updatedAt = new Date().toISOString();
      }
    } else if (version.entityType === 'TenantOverride') {
      const [orgId, flagKey] = version.entityId.split(':');
      const override = this.tenantOverrides.find((o) => o.organizationId === orgId && o.flagKey === flagKey);
      if (override) {
        for (const item of version.diff) {
          const oldVal = item.oldValue ?? item.previousValue;
          if (oldVal !== undefined && oldVal !== null) {
            (override as any)[item.field] = oldVal;
          }
        }
        override.updatedAt = new Date().toISOString();
      }
    }

    const restoreEntry: ConfigVersionEntry = {
      id: `ver_rst_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
      },
      entityType: version.entityType,
      entityId: version.entityId,
      entityName: version.entityName,
      action: 'RESTORE',
      scope: version.scope,
      reason: `Restored prior version snapshot from ${new Date(version.timestamp).toLocaleString()}.`,
      diff: version.diff.map((d) => ({
        field: d.field,
        previousValue: d.proposedValue ?? d.newValue,
        proposedValue: d.previousValue ?? d.oldValue,
        oldValue: d.newValue ?? d.proposedValue,
        newValue: d.oldValue ?? d.previousValue,
      })),
      canRestore: true,
    };

    this.configVersions.unshift(restoreEntry);

    this.auditEvents.unshift({
      id: `audit_ver_rst_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'system_configuration',
      action: 'CONFIG_VERSION_RESTORED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: version.entityType,
      targetId: version.entityId,
      targetName: version.entityName,
      status: 'succeeded',
      details: `Restored configuration entity "${version.entityName}" to snapshot ${versionId}.`,
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true };
  }

  public exportConfiguration(
    scope: 'all' | 'settings_only' | 'flags_only' | 'overrides_only' = 'all'
  ): ConfigExportPackage {
    return exportConfigurationPackage({
      settings: this.extendedSettings,
      flags: this.featureFlags,
      overrides: this.tenantOverrides,
      scope,
    });
  }

  public importConfiguration(
    pkg: ConfigExportPackage | string,
    actorName = 'Alexander Sterling'
  ): { success: boolean; result: ConfigImportValidationResult; error?: string } {
    const result = validateImportPackage(pkg, this.featureFlags);
    if (!result.isValid) {
      return { success: false, result, error: result.errors[0] };
    }

    const data: ConfigExportPackage = typeof pkg === 'string' ? JSON.parse(pkg) : pkg;

    // Apply settings
    if (data.settings) {
      this.extendedSettings = { ...this.extendedSettings, ...data.settings };
      this.settings = { ...this.settings, ...data.settings };
    }

    // Apply flags
    if (Array.isArray(data.flags)) {
      for (const flag of data.flags) {
        if (!flag.key) continue;
        const existingIdx = this.featureFlags.findIndex((f) => f.key === flag.key);
        if (existingIdx !== -1) {
          this.featureFlags[existingIdx] = {
            ...this.featureFlags[existingIdx],
            ...flag,
            updatedAt: new Date().toISOString(),
          } as FeatureFlag;
        } else {
          this.featureFlags.push({
            id: `flag_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
            key: flag.key,
            name: flag.name || flag.key,
            description: flag.description || 'Imported feature flag',
            category: flag.category || 'platform_operations',
            lifecycle: flag.lifecycle || 'draft',
            defaultValue: flag.defaultValue ?? false,
            enabled: flag.enabled ?? false,
            scope: flag.scope || 'global',
            environment: flag.environment || 'all',
            risk: flag.risk || 'standard',
            owner: flag.owner || 'Imported Flag',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dependsOnFlagKeys: flag.dependsOnFlagKeys || [],
            rolloutStrategy: flag.rolloutStrategy || 'all_tenants',
            sourceStatus: 'verified_local_mock',
          });
        }
      }
    }

    // Apply overrides
    if (Array.isArray(data.overrides)) {
      for (const ov of data.overrides) {
        if (!ov.organizationId || !ov.flagKey) continue;
        const existingIdx = this.tenantOverrides.findIndex(
          (o) => o.organizationId === ov.organizationId && o.flagKey === ov.flagKey
        );
        if (existingIdx !== -1) {
          this.tenantOverrides[existingIdx] = {
            ...this.tenantOverrides[existingIdx],
            ...ov,
            updatedAt: new Date().toISOString(),
          } as TenantFeatureOverride;
        } else {
          this.tenantOverrides.push({
            id: `override_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
            organizationId: ov.organizationId,
            flagKey: ov.flagKey,
            overrideValue: ov.overrideValue ?? true,
            reason: ov.reason || 'Imported tenant override',
            actor: ov.actor || actorName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    this.auditEvents.unshift({
      id: `audit_pkg_imp_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      category: 'system_configuration',
      action: 'CONFIG_PACKAGE_IMPORTED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'ConfigurationPackage',
      targetId: 'config_import',
      status: 'succeeded',
      details: `Imported configuration package (v${result.schemaVersion}): ${result.createCount} created, ${result.updateCount} updated, ${result.skipCount} skipped.`,
      sourceClassification: 'client_simulation',
      isDemoFixture: true,
    });

    this.persist();
    this.notify();
    return { success: true, result };
  }

  // ==========================================
  // PLATFORM NOTIFICATIONS & COMMUNICATION GOVERNANCE (E-09.16)
  // ==========================================

  public getCommunicationTemplates(filters?: {
    searchQuery?: string;
    category?: string;
    channel?: string;
    status?: string;
    locale?: string;
  }): CommunicationTemplate[] {
    let result = [...this.communicationTemplates];
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.key.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.subject && t.subject.toLowerCase().includes(q))
      );
    }
    if (filters?.category && filters.category !== 'all') {
      result = result.filter((t) => t.category === filters.category);
    }
    if (filters?.channel && filters.channel !== 'all') {
      result = result.filter((t) => t.channel === filters.channel);
    }
    if (filters?.status && filters.status !== 'all') {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters?.locale && filters.locale !== 'all') {
      result = result.filter((t) => t.locale === filters.locale);
    }
    return result;
  }

  public getCommunicationTemplateById(id: string): CommunicationTemplate | undefined {
    return this.communicationTemplates.find((t) => t.id === id || t.key === id);
  }

  public createCommunicationTemplate(
    input: Omit<CommunicationTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isDemoFixture'>,
    actorName: string = 'Alexander Sterling'
  ): CommunicationTemplate {
    const id = `tpl_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const newTemplate: CommunicationTemplate = {
      ...input,
      status: input.status || 'draft',
      version: input.version || 'v1.0',
      id,
      createdAt: now,
      updatedAt: now,
      isDemoFixture: true,
    };

    this.communicationTemplates.unshift(newTemplate);

    // Create initial version entry
    const versionEntry: TemplateVersionEntry = {
      id: `ver_${Date.now().toString(36)}`,
      templateId: id,
      templateKey: newTemplate.key,
      versionNumber: newTemplate.version || 'v1.0',
      subject: newTemplate.subject,
      body: newTemplate.body,
      changeSummary: 'Initial template draft created.',
      author: actorName,
      status: newTemplate.status,
      createdAt: now,
      isCurrent: true,
    };
    this.templateVersionHistory.unshift(versionEntry);

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'COMMUNICATION_TEMPLATE_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'CommunicationTemplate',
      targetId: id,
      status: 'succeeded',
      details: `Created communication template '${newTemplate.name}' (${newTemplate.key}) for channel '${newTemplate.channel}'.`,
    });

    this.persist();
    this.notify();
    return newTemplate;
  }

  public updateCommunicationTemplate(
    id: string,
    updates: Partial<CommunicationTemplate>,
    changeSummary: string = 'Template updated via Super-Admin console.',
    actorName: string = 'Alexander Sterling'
  ): CommunicationTemplate {
    const idx = this.communicationTemplates.findIndex((t) => t.id === id || t.key === id);
    if (idx === -1) throw new Error(`Template not found with ID/Key '${id}'`);

    const prev = this.communicationTemplates[idx];
    const now = new Date().toISOString();

    // Bump version if body or subject changed
    let version = prev.version;
    const contentChanged = (updates.body !== undefined && updates.body !== prev.body) ||
      (updates.subject !== undefined && updates.subject !== prev.subject);
    if (contentChanged && !updates.version) {
      const match = prev.version.match(/v(\d+)\.(\d+)/);
      if (match) {
        version = `v${match[1]}.${parseInt(match[2], 10) + 1}`;
      } else {
        version = `${prev.version}.1`;
      }
    }

    const updated: CommunicationTemplate = {
      ...prev,
      ...updates,
      version: updates.version || version,
      updatedAt: now,
    };

    this.communicationTemplates[idx] = updated;

    if (contentChanged) {
      this.templateVersionHistory
        .filter((v) => v.templateId === updated.id || v.templateKey === updated.key)
        .forEach((v) => { v.isCurrent = false; });

      this.templateVersionHistory.unshift({
        id: `ver_${Date.now().toString(36)}`,
        templateId: updated.id,
        templateKey: updated.key,
        versionNumber: updated.version,
        subject: updated.subject,
        body: updated.body,
        changeSummary,
        author: actorName,
        status: updated.status,
        createdAt: now,
        isCurrent: true,
      });
    }

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'COMMUNICATION_TEMPLATE_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'CommunicationTemplate',
      targetId: updated.id,
      status: 'succeeded',
      details: `Updated template '${updated.name}' (${updated.key}) - ${changeSummary}`,
    });

    this.persist();
    this.notify();
    return updated;
  }

  public transitionTemplateStatus(
    id: string,
    newStatus: TemplateStatus,
    reviewNotes?: string,
    actorName: string = 'Alexander Sterling'
  ): CommunicationTemplate {
    const idx = this.communicationTemplates.findIndex((t) => t.id === id || t.key === id);
    if (idx === -1) throw new Error(`Template not found with ID/Key '${id}'`);

    const prev = this.communicationTemplates[idx];
    const check = canTransitionTemplateStatus(prev.status, newStatus);
    if (!check.allowed) {
      throw new Error(check.reason || `Cannot transition template from ${prev.status} to ${newStatus}`);
    }

    const updated: CommunicationTemplate = {
      ...prev,
      status: newStatus,
      reviewNotes: reviewNotes || prev.reviewNotes,
      updatedAt: new Date().toISOString(),
    };

    this.communicationTemplates[idx] = updated;

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'COMMUNICATION_TEMPLATE_STATUS_CHANGED',
      severity: newStatus === 'archived' ? 'warning' : 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'CommunicationTemplate',
      targetId: updated.id,
      status: 'succeeded',
      details: `Transitioned template '${updated.name}' from '${prev.status}' to '${newStatus}'. Notes: ${reviewNotes || 'None'}`,
    });

    this.persist();
    this.notify();
    return updated;
  }

  public duplicateCommunicationTemplate(
    sourceId: string,
    newKey: string,
    newName: string,
    actorName: string = 'Alexander Sterling'
  ): CommunicationTemplate {
    const source = this.getCommunicationTemplateById(sourceId);
    if (!source) throw new Error(`Source template not found with ID '${sourceId}'`);

    return this.createCommunicationTemplate(
      {
        key: newKey,
        name: newName,
        description: `Copy of ${source.name}. ${source.description}`,
        category: source.category,
        channel: source.channel,
        locale: source.locale,
        subject: source.subject ? `Copy - ${source.subject}` : undefined,
        body: source.body,
        status: 'draft',
        version: 'v1.0',
        supportedVariables: [...source.supportedVariables],
        reviewNotes: 'Duplicated from existing template. Under initial draft review.',
        owner: actorName,
      },
      actorName
    );
  }

  public archiveCommunicationTemplate(id: string, actorName: string = 'Alexander Sterling'): CommunicationTemplate {
    return this.transitionTemplateStatus(id, 'archived', 'Archived by administrator.', actorName);
  }

  public restoreCommunicationTemplate(id: string, actorName: string = 'Alexander Sterling'): CommunicationTemplate {
    return this.transitionTemplateStatus(id, 'draft', 'Restored from archive to draft.', actorName);
  }

  public getTemplateVersionHistory(templateId: string): TemplateVersionEntry[] {
    const tpl = this.getCommunicationTemplateById(templateId);
    const key = tpl?.key || templateId;
    return this.templateVersionHistory.filter(
      (v) => v.templateId === templateId || v.templateKey === key
    );
  }

  public restoreTemplateVersion(
    versionId: string,
    actorName: string = 'Alexander Sterling'
  ): CommunicationTemplate {
    const ver = this.templateVersionHistory.find((v) => v.id === versionId);
    if (!ver) throw new Error(`Version entry not found with ID '${versionId}'`);

    return this.updateCommunicationTemplate(
      ver.templateId || ver.templateKey,
      {
        subject: ver.subject,
        body: ver.body,
        status: 'draft',
      },
      `Restored historical content from version ${ver.versionNumber}`,
      actorName
    );
  }

  // Policies
  public getNotificationPolicies(filters?: {
    category?: string;
    channel?: string;
    scope?: string;
  }): NotificationPolicy[] {
    let result = [...this.notificationPolicies];
    if (filters?.category && filters.category !== 'all') {
      result = result.filter((p) => p.category === filters.category);
    }
    if (filters?.channel && filters.channel !== 'all') {
      result = result.filter((p) => p.applicableChannels.includes(filters.channel as any));
    }
    if (filters?.scope && filters.scope !== 'all') {
      result = result.filter((p) => p.scope === filters.scope);
    }
    return result;
  }

  public getNotificationPolicyById(id: string): NotificationPolicy | undefined {
    return this.notificationPolicies.find((p) => p.id === id);
  }

  public createNotificationPolicy(
    input: Omit<NotificationPolicy, 'id' | 'version' | 'updatedAt'>,
    actorName: string = 'Alexander Sterling'
  ): NotificationPolicy {
    const id = `pol_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newPolicy: NotificationPolicy = {
      ...input,
      id,
      version: 'v1.0',
      updatedAt: new Date().toISOString(),
    };
    this.notificationPolicies.unshift(newPolicy);

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'NOTIFICATION_POLICY_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'NotificationPolicy',
      targetId: id,
      status: 'succeeded',
      details: `Created notification policy '${newPolicy.name}' (${newPolicy.priority} priority).`,
    });

    this.persist();
    this.notify();
    return newPolicy;
  }

  public updateNotificationPolicy(
    id: string,
    updates: Partial<NotificationPolicy>,
    actorName: string = 'Alexander Sterling'
  ): NotificationPolicy {
    const idx = this.notificationPolicies.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Notification policy not found with ID '${id}'`);

    const prev = this.notificationPolicies[idx];
    const updated: NotificationPolicy = {
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.notificationPolicies[idx] = updated;

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'NOTIFICATION_POLICY_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'NotificationPolicy',
      targetId: id,
      status: 'succeeded',
      details: `Updated notification policy '${updated.name}'.`,
    });

    this.persist();
    this.notify();
    return updated;
  }

  public toggleNotificationPolicy(
    id: string,
    enabled: boolean,
    actorName: string = 'Alexander Sterling'
  ): NotificationPolicy {
    return this.updateNotificationPolicy(id, { enabled }, actorName);
  }

  // Providers
  public getCommunicationProviders(): ProviderRecord[] {
    return [...this.communicationProviders];
  }

  public simulateProviderHealthCheck(
    providerId: string,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; latencyMs: number; simulatedOutput: string; checkedAt: string } {
    const prov = this.communicationProviders.find((p) => p.id === providerId);
    if (!prov) throw new Error(`Provider not found with ID '${providerId}'`);

    const checkedAt = new Date().toISOString();
    const success = prov.configStatus === 'configured';
    const latencyMs = success ? Math.floor(Math.random() * 45) + 35 : 0;
    const simulatedOutput = success
      ? `Simulated probe to ${prov.displayName} succeeded. Latency: ${latencyMs}ms. Mock relay ready. [Simulation Only - No Live Network Call]`
      : `Simulated probe to ${prov.displayName} failed: Status is '${prov.configStatus}'. Vault reference '${prov.vaultSecretRef}' unfulfilled.`;

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'COMMUNICATION_PROVIDER_HEALTH_CHECK_SIMULATED',
      severity: success ? 'info' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'ProviderRecord',
      targetId: providerId,
      status: success ? 'succeeded' : 'failed',
      details: `Simulated health check on ${prov.displayName}: ${simulatedOutput}`,
    });

    return { success, latencyMs, simulatedOutput, checkedAt };
  }

  // Notification Records
  public getNotificationRecords(filters?: {
    searchQuery?: string;
    channel?: string;
    status?: string;
    category?: string;
    tenantId?: string;
    failureClassification?: string;
  }): NotificationRecord[] {
    let result = [...this.notificationRecords];
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.recipientDisplay.toLowerCase().includes(q) ||
          r.templateKey.toLowerCase().includes(q) ||
          (r.tenantName && r.tenantName.toLowerCase().includes(q)) ||
          (r.subject && r.subject.toLowerCase().includes(q))
      );
    }
    if (filters?.channel && filters.channel !== 'all') {
      result = result.filter((r) => r.channel === filters.channel);
    }
    if (filters?.status && filters.status !== 'all') {
      result = result.filter((r) => r.status === filters.status);
    }
    if (filters?.category && filters.category !== 'all') {
      result = result.filter((r) => r.category === filters.category);
    }
    if (filters?.tenantId && filters.tenantId !== 'all') {
      result = result.filter((r) => r.tenantId === filters.tenantId);
    }
    if (filters?.failureClassification && filters.failureClassification !== 'all') {
      result = result.filter((r) => r.failureClassification === filters.failureClassification);
    }
    return result;
  }

  public simulateTestNotification(
    templateId: string,
    testRecipient: string,
    customVariables: Record<string, string> = {},
    actorName: string = 'Alexander Sterling'
  ): NotificationRecord {
    const tpl = this.getCommunicationTemplateById(templateId);
    if (!tpl) throw new Error(`Template not found with ID '${templateId}'`);

    const now = new Date().toISOString();
    const id = `notif_sim_${Date.now().toString(36)}`;
    const preview = renderTemplatePreview(tpl, customVariables);

    const record: NotificationRecord = {
      id,
      category: tpl.category,
      channel: tpl.channel,
      templateKey: tpl.key,
      templateVersion: tpl.version,
      recipientDisplay: testRecipient,
      status: 'delivered',
      priority: 'normal',
      subject: preview.renderedSubject ? `[SIMULATION] ${preview.renderedSubject}` : undefined,
      renderedPreview: preview.renderedBody,
      createdAt: now,
      updatedAt: now,
      sentAt: now,
      deliveredAt: now,
      retryCount: 0,
      maxRetries: 3,
      sourceType: 'admin_simulation',
      timeline: [
        { timestamp: now, status: 'queued', note: `Manual test dispatch initiated by Super-Admin ${actorName}.` },
        { timestamp: now, status: 'sent', note: 'Simulated dispatch through local adapter.' },
        { timestamp: now, status: 'delivered', note: 'Mock delivery receipt generated. [No External Message Dispatched]' },
      ],
      isDemoFixture: true,
    };

    this.notificationRecords.unshift(record);

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'NOTIFICATION_DISPATCH_SIMULATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'NotificationRecord',
      targetId: id,
      status: 'succeeded',
      details: `Simulated test notification using template '${tpl.key}' to '${testRecipient}'. Zero real messages sent.`,
    });

    this.persist();
    this.notify();
    return record;
  }

  public simulateNotificationRetry(
    notificationId: string,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; message: string; record?: NotificationRecord } {
    const idx = this.notificationRecords.findIndex((r) => r.id === notificationId);
    if (idx === -1) {
      return { success: false, message: `Notification record '${notificationId}' not found.` };
    }

    const record = this.notificationRecords[idx];
    const check = canRetryNotification(record, this.notificationPolicies);
    if (!check.canRetry) {
      return { success: false, message: check.reason || 'Notification is not eligible for retry.' };
    }

    const now = new Date().toISOString();
    const updatedRecord: NotificationRecord = {
      ...record,
      retryCount: record.retryCount + 1,
      status: 'delivered',
      failureReason: undefined,
      failureClassification: undefined,
      updatedAt: now,
      deliveredAt: now,
      timeline: [
        ...record.timeline,
        {
          timestamp: now,
          status: 'sent',
          note: `Manual retry simulation initiated by Super-Admin ${actorName} (Attempt ${record.retryCount + 1}/${record.maxRetries}).`,
        },
        {
          timestamp: now,
          status: 'delivered',
          note: 'Simulated retry delivery receipt confirmed. [Simulation Only]',
        },
      ],
    };

    this.notificationRecords[idx] = updatedRecord;

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'NOTIFICATION_RETRY_SIMULATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'NotificationRecord',
      targetId: notificationId,
      status: 'succeeded',
      details: `Simulated retry on failed notification '${notificationId}'. Updated status to delivered.`,
    });

    this.persist();
    this.notify();
    return { success: true, message: `Simulated retry succeeded for notification '${notificationId}'.`, record: updatedRecord };
  }

  public addNotificationReviewNote(
    notificationId: string,
    reviewNote: string,
    actorName: string = 'Alexander Sterling'
  ): NotificationRecord {
    const idx = this.notificationRecords.findIndex((r) => r.id === notificationId);
    if (idx === -1) throw new Error(`Notification not found with ID '${notificationId}'`);

    const updated = {
      ...this.notificationRecords[idx],
      reviewNote,
      updatedAt: new Date().toISOString(),
    };
    this.notificationRecords[idx] = updated;

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'NOTIFICATION_REVIEW_NOTE_ADDED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'NotificationRecord',
      targetId: notificationId,
      status: 'succeeded',
      details: `Added review note to notification '${notificationId}': ${reviewNote}`,
    });

    this.persist();
    this.notify();
    return updated;
  }

  // Campaigns
  public getCampaignDrafts(): CampaignDraft[] {
    return [...this.campaignDrafts];
  }

  public createCampaignDraft(
    input: Omit<CampaignDraft, 'id' | 'createdAt' | 'updatedAt' | 'estimatedAudience'>,
    actorName: string = 'Alexander Sterling'
  ): CampaignDraft {
    const id = `camp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const estimatedAudience = estimateCampaignAudience(input.audienceScope, input.targetTenantIds, this.organizations);

    const newCampaign: CampaignDraft = {
      ...input,
      id,
      estimatedAudience,
      createdAt: now,
      updatedAt: now,
    };
    this.campaignDrafts.unshift(newCampaign);

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'CAMPAIGN_DRAFT_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'CampaignDraft',
      targetId: id,
      status: 'succeeded',
      details: `Created campaign draft '${newCampaign.name}' (Scope: ${newCampaign.audienceScope}, Est. Tenants: ${estimatedAudience.totalTenants}).`,
    });

    this.persist();
    this.notify();
    return newCampaign;
  }

  public updateCampaignDraft(
    id: string,
    updates: Partial<CampaignDraft>,
    actorName: string = 'Alexander Sterling'
  ): CampaignDraft {
    const idx = this.campaignDrafts.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Campaign draft not found with ID '${id}'`);

    const prev = this.campaignDrafts[idx];
    const scope = updates.audienceScope || prev.audienceScope;
    const targetTenants = updates.targetTenantIds || prev.targetTenantIds;
    const estimatedAudience = estimateCampaignAudience(scope, targetTenants, this.organizations);

    const updated: CampaignDraft = {
      ...prev,
      ...updates,
      estimatedAudience,
      updatedAt: new Date().toISOString(),
    };
    this.campaignDrafts[idx] = updated;

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'CAMPAIGN_DRAFT_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'CampaignDraft',
      targetId: id,
      status: 'succeeded',
      details: `Updated campaign draft '${updated.name}'.`,
    });

    this.persist();
    this.notify();
    return updated;
  }

  public transitionCampaignStatus(
    id: string,
    status: 'draft' | 'pending_approval' | 'approved' | 'cancelled',
    actorName: string = 'Alexander Sterling'
  ): CampaignDraft {
    return this.updateCampaignDraft(id, { status }, actorName);
  }

  // Tenant Communication Configs
  public getTenantCommunicationConfigs(): TenantCommunicationConfig[] {
    return [...this.tenantCommunicationConfigs];
  }

  public updateTenantCommunicationConfig(
    tenantId: string,
    updates: Partial<TenantCommunicationConfig>,
    actorName: string = 'Alexander Sterling'
  ): TenantCommunicationConfig {
    const idx = this.tenantCommunicationConfigs.findIndex((c) => c.tenantId === tenantId);
    if (idx === -1) throw new Error(`Tenant communication config not found for tenant '${tenantId}'`);

    const updated = {
      ...this.tenantCommunicationConfigs[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.tenantCommunicationConfigs[idx] = updated;

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'TENANT_COMMUNICATION_CONFIG_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'TenantCommunicationConfig',
      targetId: tenantId,
      status: 'succeeded',
      details: `Updated communication settings for tenant '${updated.tenantName}' (${tenantId}).`,
    });

    this.persist();
    this.notify();
    return updated;
  }

  // Preference Governance
  public getNotificationPreferenceGovernance(): NotificationPreferenceGovernance {
    return { ...this.notificationPreferenceGovernance };
  }

  // Safe Export & Import
  public exportCommunicationGovernancePackage(actorName: string = 'Alexander Sterling'): CommunicationExportPackage {
    const pkg = exportCommunicationPackage({
      templates: this.communicationTemplates,
      policies: this.notificationPolicies,
      providers: this.communicationProviders,
      campaigns: this.campaignDrafts,
      actor: actorName,
      scope: 'platform_communication_governance',
      environment: 'development',
    });

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'COMMUNICATION_PACKAGE_EXPORTED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'CommunicationExportPackage',
      targetId: 'comms_export',
      status: 'succeeded',
      details: `Exported communication configuration package (${pkg.summaryMetrics.totalTemplates} templates, ${pkg.summaryMetrics.totalPolicies} policies).`,
    });

    return pkg;
  }

  // ==========================================
  // E-09.17: SUPPORT DESK & CUSTOMER SUCCESS
  // ==========================================

  public getSupportTickets(filters?: {
    searchQuery?: string;
    organizationId?: string;
    status?: SupportTicketStatus;
    priority?: SupportTicketPriority;
    category?: SupportCategoryKey;
    assignedOperatorId?: string;
    assignedTeamId?: string;
    slaState?: SlaState;
    isEscalated?: boolean;
  }): SupportTicket[] {
    let result = [...this.supportTickets];

    if (!filters) return result;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      const orgMap = new Map(this.organizations.map((o) => [o.id, o.name.toLowerCase()]));
      result = result.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.requester.name.toLowerCase().includes(q) ||
          (orgMap.get(t.organizationId) || '').includes(q)
      );
    }

    if (filters.organizationId && filters.organizationId !== 'all') {
      result = result.filter((t) => t.organizationId === filters.organizationId);
    }

    if (filters.status && (filters.status as string) !== 'all') {
      result = result.filter((t) => t.status === filters.status);
    }

    if (filters.priority && (filters.priority as string) !== 'all') {
      result = result.filter((t) => t.priority === filters.priority);
    }

    if (filters.category && (filters.category as string) !== 'all') {
      result = result.filter((t) => t.category === filters.category);
    }

    if (filters.assignedOperatorId && filters.assignedOperatorId !== 'all') {
      if (filters.assignedOperatorId === 'unassigned') {
        result = result.filter((t) => !t.assignedOperatorId);
      } else {
        result = result.filter((t) => t.assignedOperatorId === filters.assignedOperatorId);
      }
    }

    if (filters.assignedTeamId && filters.assignedTeamId !== 'all') {
      result = result.filter((t) => t.assignedTeamId === filters.assignedTeamId);
    }

    if (filters.slaState && (filters.slaState as string) !== 'all') {
      result = result.filter((t) => t.slaState === filters.slaState);
    }

    if (filters.isEscalated !== undefined) {
      result = result.filter((t) => (t.escalation?.isEscalated ?? false) === filters.isEscalated);
    }

    return result;
  }

  public getSupportTicketById(id: string): SupportTicket | undefined {
    return this.supportTickets.find((t) => t.id === id || t.ticketNumber === id);
  }

  public createSupportTicket(
    input: CreateSupportTicketInput,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; ticket?: SupportTicket; error?: string } {
    const orgIds = this.organizations.map((o) => o.id);
    const validation = validateTicketCreation(input, orgIds);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    const nextNum = 1000 + this.supportTickets.length + 1;
    const ticketId = `tck_${nextNum}`;
    const ticketNumber = `TCK-${nextNum}`;
    const now = new Date().toISOString();

    const policy = this.slaPolicies.find((p) => p.id === input.slaPolicyId) || this.slaPolicies[0];

    const initialMessage = {
      id: `msg_${ticketId}_1`,
      ticketId,
      authorId: 'system',
      authorName: 'Platform Intake',
      authorRole: 'system' as const,
      type: 'system_event' as const,
      content: `Ticket created via ${input.source || 'portal'}. Policy "${policy.name}" applied with ${input.priority} priority. (Demonstration state updated; zero external emails sent).`,
      createdAt: now,
    };

    const newTicket: SupportTicket = {
      id: ticketId,
      ticketNumber,
      subject: input.subject.trim(),
      description: input.description.trim(),
      organizationId: input.organizationId,
      requester: { ...input.requester },
      category: input.category,
      priority: input.priority,
      status: 'new',
      assignedOperatorId: input.assignedOperatorId || null,
      assignedTeamId: input.assignedTeamId || null,
      createdAt: now,
      updatedAt: now,
      firstResponseAt: null,
      resolvedAt: null,
      closedAt: null,
      slaPolicyId: policy.id,
      slaState: 'within_target',
      escalation: { isEscalated: false },
      tags: input.tags || [],
      source: input.source || 'portal',
      relatedIncidentId: input.relatedIncidentId || null,
      messages: [initialMessage],
    };

    this.supportTickets.unshift(newTicket);

    this.logAuditEvent({
      category: 'organization_lifecycle',
      action: 'SUPPORT_TICKET_CREATED',
      severity: input.priority === 'urgent' ? 'warning' : 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'SupportTicket',
      targetId: newTicket.ticketNumber,
      status: 'succeeded',
      details: `Created support ticket ${newTicket.ticketNumber} for organization ${newTicket.organizationId} (${newTicket.category}, priority: ${newTicket.priority}).`,
    });

    this.persist();
    this.notify();
    return { success: true, ticket: newTicket };
  }

  public updateSupportTicket(
    id: string,
    updates: UpdateSupportTicketInput,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; ticket?: SupportTicket; error?: string } {
    const idx = this.supportTickets.findIndex((t) => t.id === id || t.ticketNumber === id);
    if (idx === -1) return { success: false, error: `Support ticket "${id}" not found.` };

    const prev = this.supportTickets[idx];
    const updated: SupportTicket = {
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.supportTickets[idx] = updated;

    this.logAuditEvent({
      category: 'organization_lifecycle',
      action: 'SUPPORT_TICKET_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'SupportTicket',
      targetId: prev.ticketNumber,
      status: 'succeeded',
      details: `Updated support ticket ${prev.ticketNumber} attributes.`,
    });

    this.persist();
    this.notify();
    return { success: true, ticket: updated };
  }

  public transitionSupportTicketStatus(
    id: string,
    targetStatus: SupportTicketStatus,
    reason?: string,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; ticket?: SupportTicket; error?: string } {
    const idx = this.supportTickets.findIndex((t) => t.id === id || t.ticketNumber === id);
    if (idx === -1) return { success: false, error: `Ticket "${id}" not found.` };

    const prev = this.supportTickets[idx];
    const validation = validateStatusTransition(prev.status, targetStatus, reason);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const now = new Date().toISOString();
    const updated: SupportTicket = {
      ...prev,
      status: targetStatus,
      updatedAt: now,
    };

    if (targetStatus === 'resolved' && !prev.resolvedAt) {
      updated.resolvedAt = now;
    }

    if (targetStatus === 'closed' && !prev.closedAt) {
      updated.closedAt = now;
    }

    if (targetStatus === 'open' && (prev.status === 'resolved' || prev.status === 'closed')) {
      updated.resolvedAt = null;
      updated.closedAt = null;
    }

    const systemMsg = {
      id: `msg_${prev.id}_${Date.now()}`,
      ticketId: prev.id,
      authorId: 'usr_super_01',
      authorName: actorName,
      authorRole: 'platform_operator' as const,
      type: 'system_event' as const,
      content: `Status changed from ${prev.status} to ${targetStatus}.${reason ? ` Reason: ${reason}` : ''}`,
      createdAt: now,
    };
    updated.messages = [...prev.messages, systemMsg];

    const policy = this.slaPolicies.find((p) => p.id === updated.slaPolicyId) || this.slaPolicies[0];
    if (policy) {
      const evalRes = evaluateTicketSla(updated, policy);
      updated.slaState = evalRes.state;
    }

    this.supportTickets[idx] = updated;

    this.logAuditEvent({
      category: 'organization_lifecycle',
      action: 'SUPPORT_TICKET_STATUS_CHANGED',
      severity: targetStatus === 'closed' || targetStatus === 'resolved' ? 'info' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'SupportTicket',
      targetId: prev.ticketNumber,
      status: 'succeeded',
      details: `Transitioned ticket ${prev.ticketNumber} from ${prev.status} to ${targetStatus}.${reason ? ` Justification: ${reason}` : ''}`,
    });

    this.persist();
    this.notify();
    return { success: true, ticket: updated };
  }

  public assignSupportTicket(
    id: string,
    operatorId?: string | null,
    teamId?: string | null,
    reason?: string,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; ticket?: SupportTicket; error?: string } {
    const idx = this.supportTickets.findIndex((t) => t.id === id || t.ticketNumber === id);
    if (idx === -1) return { success: false, error: `Ticket "${id}" not found.` };

    const prev = this.supportTickets[idx];
    let operatorName = 'Unassigned';
    if (operatorId) {
      const op = this.platformUsers.find((u) => u.id === operatorId);
      if (!op) return { success: false, error: `Platform user "${operatorId}" does not exist.` };
      operatorName = op.name;
    }

    let teamName = 'No Queue';
    if (teamId) {
      const team = this.supportTeams.find((tm) => tm.id === teamId);
      if (!team) return { success: false, error: `Support team "${teamId}" does not exist.` };
      teamName = team.name;
    }

    const now = new Date().toISOString();
    const updated: SupportTicket = {
      ...prev,
      assignedOperatorId: operatorId ?? null,
      assignedTeamId: teamId ?? null,
      updatedAt: now,
    };

    const assignmentMsg = {
      id: `msg_${prev.id}_${Date.now()}`,
      ticketId: prev.id,
      authorId: 'usr_super_01',
      authorName: actorName,
      authorRole: 'platform_operator' as const,
      type: 'system_event' as const,
      content: `Ticket assignment updated: Operator: ${operatorName}, Queue: ${teamName}.${reason ? ` Reason: ${reason}` : ''}`,
      createdAt: now,
    };
    updated.messages = [...prev.messages, assignmentMsg];

    this.supportTickets[idx] = updated;

    this.logAuditEvent({
      category: 'organization_lifecycle',
      action: 'SUPPORT_TICKET_ASSIGNED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'SupportTicket',
      targetId: prev.ticketNumber,
      status: 'succeeded',
      details: `Assigned ticket ${prev.ticketNumber} to operator "${operatorName}" in queue "${teamName}".`,
    });

    this.persist();
    this.notify();
    return { success: true, ticket: updated };
  }

  public escalateSupportTicket(
    id: string,
    reason: string,
    targetTeamId: string,
    urgencyLevel: 'standard' | 'high' | 'critical' = 'high',
    targetTier: 'tier_2_specialist' | 'tier_3_engineering' | 'executive_management' = 'tier_2_specialist',
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; ticket?: SupportTicket; error?: string } {
    const idx = this.supportTickets.findIndex((t) => t.id === id || t.ticketNumber === id);
    if (idx === -1) return { success: false, error: `Ticket "${id}" not found.` };

    const teamIds = this.supportTeams.map((tm) => tm.id);
    const validation = validateEscalation(reason, targetTeamId, teamIds);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    const prev = this.supportTickets[idx];
    const now = new Date().toISOString();

    const targetTeam = this.supportTeams.find((tm) => tm.id === targetTeamId);
    const teamName = targetTeam ? targetTeam.name : targetTeamId;

    const updated: SupportTicket = {
      ...prev,
      status: 'escalated',
      priority: urgencyLevel === 'critical' ? 'urgent' : prev.priority,
      assignedTeamId: targetTeamId,
      updatedAt: now,
      escalation: {
        isEscalated: true,
        escalatedAt: now,
        escalatedBy: actorName,
        reason: reason.trim(),
        targetTeamId,
        targetTier,
        urgencyLevel,
        status: 'active',
      },
    };

    const escalationMsg = {
      id: `msg_${prev.id}_${Date.now()}`,
      ticketId: prev.id,
      authorId: 'usr_super_01',
      authorName: actorName,
      authorRole: 'platform_operator' as const,
      type: 'system_event' as const,
      content: `Ticket escalated to ${teamName} (${targetTier}, urgency: ${urgencyLevel}). Reason: ${reason.trim()}`,
      createdAt: now,
    };
    updated.messages = [...prev.messages, escalationMsg];

    this.supportTickets[idx] = updated;

    this.logAuditEvent({
      category: 'organization_lifecycle',
      action: 'SUPPORT_TICKET_ESCALATED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'SupportTicket',
      targetId: prev.ticketNumber,
      status: 'succeeded',
      details: `Escalated ticket ${prev.ticketNumber} to queue "${teamName}". Justification: ${reason.trim()}`,
    });

    this.persist();
    this.notify();
    return { success: true, ticket: updated };
  }

  public deescalateSupportTicket(
    id: string,
    notes?: string,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; ticket?: SupportTicket; error?: string } {
    const idx = this.supportTickets.findIndex((t) => t.id === id || t.ticketNumber === id);
    if (idx === -1) return { success: false, error: `Ticket "${id}" not found.` };

    const prev = this.supportTickets[idx];
    if (!prev.escalation?.isEscalated) {
      return { success: false, error: 'Ticket is not currently escalated.' };
    }

    const now = new Date().toISOString();
    const updated: SupportTicket = {
      ...prev,
      status: 'in_progress',
      updatedAt: now,
      escalation: {
        ...prev.escalation,
        isEscalated: false,
        status: 'deescalated',
        reviewedBy: actorName,
        reviewedAt: now,
        resolutionNote: notes || 'De-escalated to standard in-progress queue.',
      },
    };

    const deescalationMsg = {
      id: `msg_${prev.id}_${Date.now()}`,
      ticketId: prev.id,
      authorId: 'usr_super_01',
      authorName: actorName,
      authorRole: 'platform_operator' as const,
      type: 'system_event' as const,
      content: `Escalation resolved and de-escalated to in-progress queue.${notes ? ` Note: ${notes}` : ''}`,
      createdAt: now,
    };
    updated.messages = [...prev.messages, deescalationMsg];

    this.supportTickets[idx] = updated;

    this.logAuditEvent({
      category: 'organization_lifecycle',
      action: 'SUPPORT_TICKET_DEESCALATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'SupportTicket',
      targetId: prev.ticketNumber,
      status: 'succeeded',
      details: `De-escalated ticket ${prev.ticketNumber} back to normal workflow.`,
    });

    this.persist();
    this.notify();
    return { success: true, ticket: updated };
  }

  public addSupportTicketMessage(
    ticketId: string,
    type: 'internal_note' | 'tenant_reply',
    content: string,
    isDraft: boolean = false,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; ticket?: SupportTicket; error?: string } {
    const idx = this.supportTickets.findIndex((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (idx === -1) return { success: false, error: `Ticket "${ticketId}" not found.` };

    if (!content || content.trim().length < 3) {
      return { success: false, error: 'Message content must be at least 3 characters.' };
    }

    const prev = this.supportTickets[idx];
    const now = new Date().toISOString();

    const newMsg = {
      id: `msg_${prev.id}_${Date.now()}`,
      ticketId: prev.id,
      authorId: 'usr_super_01',
      authorName: actorName,
      authorRole: 'platform_operator' as const,
      type,
      content: content.trim(),
      isDraft,
      createdAt: now,
    };

    const updated: SupportTicket = {
      ...prev,
      messages: [...prev.messages, newMsg],
      updatedAt: now,
    };

    if (type === 'tenant_reply' && !isDraft && !prev.firstResponseAt) {
      updated.firstResponseAt = now;
      const policy = this.slaPolicies.find((p) => p.id === updated.slaPolicyId) || this.slaPolicies[0];
      if (policy) {
        const evalRes = evaluateTicketSla(updated, policy);
        updated.slaState = evalRes.state;
      }
    }

    this.supportTickets[idx] = updated;

    this.logAuditEvent({
      category: 'organization_lifecycle',
      action: type === 'internal_note' ? 'SUPPORT_INTERNAL_NOTE_ADDED' : 'SUPPORT_TENANT_REPLY_DRAFTED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'SupportTicket',
      targetId: prev.ticketNumber,
      status: 'succeeded',
      details: `Added ${type === 'internal_note' ? 'internal note' : 'tenant reply'} to ticket ${prev.ticketNumber} (local demonstration record only).`,
    });

    this.persist();
    this.notify();
    return { success: true, ticket: updated };
  }

  // --- Support Teams ---
  public getSupportTeams(): SupportTeamQueue[] {
    return [...this.supportTeams];
  }

  // --- SLA Policies ---
  public getSlaPolicies(): SlaPolicy[] {
    return [...this.slaPolicies];
  }

  public getSlaPolicyById(id: string): SlaPolicy | undefined {
    return this.slaPolicies.find((p) => p.id === id);
  }

  public createSlaPolicy(
    input: CreateSlaPolicyInput,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; policy?: SlaPolicy; error?: string } {
    const validation = validateSlaPolicy(input);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    const nextId = `sla_${Date.now()}`;
    const newPolicy: SlaPolicy = {
      id: nextId,
      name: input.name.trim(),
      description: input.description.trim(),
      planTier: input.planTier,
      applicableCategories: input.applicableCategories,
      applicablePriorities: input.applicablePriorities,
      firstResponseTargetMinutes: { ...input.firstResponseTargetMinutes },
      resolutionTargetMinutes: { ...input.resolutionTargetMinutes },
      businessHours: { ...input.businessHours },
      escalationThresholdPercent: input.escalationThresholdPercent || 75,
      isDefault: input.isDefault || false,
      isEnabled: true,
    };

    this.slaPolicies.push(newPolicy);

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'SLA_POLICY_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'SlaPolicy',
      targetId: newPolicy.id,
      status: 'succeeded',
      details: `Created SLA policy "${newPolicy.name}" (${newPolicy.planTier}).`,
    });

    this.persist();
    this.notify();
    return { success: true, policy: newPolicy };
  }

  public updateSlaPolicy(
    id: string,
    updates: Partial<SlaPolicy>,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; policy?: SlaPolicy; error?: string } {
    const idx = this.slaPolicies.findIndex((p) => p.id === id);
    if (idx === -1) return { success: false, error: `SLA Policy "${id}" not found.` };

    const prev = this.slaPolicies[idx];
    const validation = validateSlaPolicy({ ...prev, ...updates });
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    const updated: SlaPolicy = { ...prev, ...updates };
    this.slaPolicies[idx] = updated;

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'SLA_POLICY_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'SlaPolicy',
      targetId: prev.id,
      status: 'succeeded',
      details: `Updated SLA policy "${prev.name}" configuration.`,
    });

    this.persist();
    this.notify();
    return { success: true, policy: updated };
  }

  public toggleSlaPolicy(
    id: string,
    isEnabled: boolean,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; policy?: SlaPolicy; error?: string } {
    const idx = this.slaPolicies.findIndex((p) => p.id === id);
    if (idx === -1) return { success: false, error: `SLA Policy "${id}" not found.` };

    this.slaPolicies[idx].isEnabled = isEnabled;

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'SLA_POLICY_TOGGLED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'SlaPolicy',
      targetId: id,
      status: 'succeeded',
      details: `SLA policy "${this.slaPolicies[idx].name}" set to ${isEnabled ? 'enabled' : 'disabled'}.`,
    });

    this.persist();
    this.notify();
    return { success: true, policy: this.slaPolicies[idx] };
  }

  // --- Knowledge Base Articles ---
  public getKbArticles(filters?: {
    searchQuery?: string;
    category?: SupportCategoryKey;
    status?: 'draft' | 'published' | 'archived';
  }): KnowledgeBaseArticle[] {
    let result = [...this.kbArticles];
    if (!filters) return result;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (filters.category && (filters.category as string) !== 'all') {
      result = result.filter((a) => a.category === filters.category);
    }

    if (filters.status && (filters.status as string) !== 'all') {
      result = result.filter((a) => a.status === filters.status);
    }

    return result;
  }

  public getKbArticleById(id: string): KnowledgeBaseArticle | undefined {
    return this.kbArticles.find((a) => a.id === id || a.slug === id);
  }

  public createKbArticle(
    input: CreateKbArticleInput,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; article?: KnowledgeBaseArticle; error?: string } {
    const validation = validateKbArticle(input);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    const now = new Date().toISOString();
    const id = `kb_${Date.now()}`;
    const slug = input.slug || input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newArticle: KnowledgeBaseArticle = {
      id,
      slug,
      title: input.title.trim(),
      summary: input.summary.trim(),
      category: input.category,
      content: input.content.trim(),
      tags: input.tags || [],
      status: input.status || 'draft',
      targetAudience: input.targetAudience || 'school_admins',
      locale: input.locale || 'en',
      helpfulCount: 0,
      unhelpfulCount: 0,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.kbArticles.unshift(newArticle);

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'KB_ARTICLE_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'KnowledgeBaseArticle',
      targetId: newArticle.id,
      status: 'succeeded',
      details: `Created knowledge base article "${newArticle.title}" (status: ${newArticle.status}).`,
    });

    this.persist();
    this.notify();
    return { success: true, article: newArticle };
  }

  public updateKbArticle(
    id: string,
    updates: Partial<KnowledgeBaseArticle>,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; article?: KnowledgeBaseArticle; error?: string } {
    const idx = this.kbArticles.findIndex((a) => a.id === id || a.slug === id);
    if (idx === -1) return { success: false, error: `Article "${id}" not found.` };

    const prev = this.kbArticles[idx];
    const updated: KnowledgeBaseArticle = {
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.kbArticles[idx] = updated;

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'KB_ARTICLE_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'KnowledgeBaseArticle',
      targetId: prev.id,
      status: 'succeeded',
      details: `Updated knowledge base article "${prev.title}".`,
    });

    this.persist();
    this.notify();
    return { success: true, article: updated };
  }

  public setKbArticleStatus(
    id: string,
    status: 'draft' | 'published' | 'archived',
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; article?: KnowledgeBaseArticle; error?: string } {
    const idx = this.kbArticles.findIndex((a) => a.id === id || a.slug === id);
    if (idx === -1) return { success: false, error: `Article "${id}" not found.` };

    this.kbArticles[idx].status = status;
    this.kbArticles[idx].updatedAt = new Date().toISOString();

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'KB_ARTICLE_STATUS_CHANGED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'KnowledgeBaseArticle',
      targetId: id,
      status: 'succeeded',
      details: `Knowledge base article "${this.kbArticles[idx].title}" status set to ${status}.`,
    });

    this.persist();
    this.notify();
    return { success: true, article: this.kbArticles[idx] };
  }

  public deleteKbArticle(
    id: string,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; error?: string } {
    const idx = this.kbArticles.findIndex((a) => a.id === id || a.slug === id);
    if (idx === -1) return { success: false, error: `Article "${id}" not found.` };
    const title = this.kbArticles[idx].title;
    this.kbArticles.splice(idx, 1);

    this.logAuditEvent({
      category: 'system_configuration',
      action: 'KB_ARTICLE_DELETED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'KnowledgeBaseArticle',
      targetId: id,
      status: 'succeeded',
      details: `Deleted knowledge base article "${title}".`,
    });

    this.persist();
    this.notify();
    return { success: true };
  }

  // --- Customer Satisfaction (CSAT) ---
  public getCsatRecords(filters?: {
    organizationId?: string;
    category?: SupportCategoryKey;
    minRating?: number;
  }): CustomerSatisfactionRecord[] {
    let result = [...this.csatRecords];
    if (!filters) return result;

    if (filters.organizationId && filters.organizationId !== 'all') {
      result = result.filter((r) => r.organizationId === filters.organizationId);
    }

    if (filters.category && (filters.category as string) !== 'all') {
      result = result.filter((r) => r.category === filters.category);
    }

    if (filters.minRating) {
      result = result.filter((r) => r.rating >= filters.minRating!);
    }

    return result;
  }

  public submitCustomerFeedback(
    input: SubmitCustomerFeedbackInput,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; record?: CustomerSatisfactionRecord; error?: string } {
    const ticket = this.getSupportTicketById(input.ticketId);
    if (!ticket) return { success: false, error: `Ticket "${input.ticketId}" not found.` };

    if (input.rating < 1 || input.rating > 5) {
      return { success: false, error: 'Satisfaction rating must be an integer between 1 and 5.' };
    }

    const id = `csat_${Date.now()}`;
    const newRecord: CustomerSatisfactionRecord = {
      id,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      organizationId: ticket.organizationId,
      rating: input.rating,
      category: ticket.category,
      comment: input.comment?.trim(),
      submittedAt: new Date().toISOString(),
      reviewed: false,
    };

    this.csatRecords.unshift(newRecord);

    this.logAuditEvent({
      category: 'organization_lifecycle',
      action: 'CSAT_FEEDBACK_SUBMITTED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'CustomerSatisfactionRecord',
      targetId: newRecord.id,
      status: 'succeeded',
      details: `Received CSAT rating of ${newRecord.rating}/5 for ticket ${ticket.ticketNumber} (${ticket.organizationId}).`,
    });

    this.persist();
    this.notify();
    return { success: true, record: newRecord };
  }

  public reviewCsatRecord(
    id: string,
    notes?: string,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; record?: CustomerSatisfactionRecord; error?: string } {
    const record = this.csatRecords.find((r) => r.id === id);
    if (!record) return { success: false, error: `Feedback record "${id}" not found.` };

    record.reviewed = true;
    if (notes) record.reviewerNotes = notes;

    this.logAuditEvent({
      category: 'organization_lifecycle',
      action: 'CSAT_FEEDBACK_REVIEWED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'CustomerSatisfactionRecord',
      targetId: id,
      status: 'succeeded',
      details: `Reviewed customer feedback for ticket ${record.ticketNumber}.${notes ? ` Notes: ${notes}` : ''}`,
    });

    this.persist();
    this.notify();
    return { success: true, record };
  }

  // --- Customer Success Tasks ---
  public getCsTasks(filters?: {
    organizationId?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    assignedOwnerId?: string;
    isOverdue?: boolean;
    refDate?: string;
  }): CustomerSuccessTask[] {
    let result = [...this.csTasks];
    if (!filters) return result;

    if (filters.organizationId && filters.organizationId !== 'all') {
      result = result.filter((t) => t.organizationId === filters.organizationId);
    }

    if (filters.status && (filters.status as string) !== 'all') {
      result = result.filter((t) => t.status === filters.status);
    }

    if (filters.assignedOwnerId && filters.assignedOwnerId !== 'all') {
      result = result.filter((t) => t.assignedOwnerId === filters.assignedOwnerId);
    }

    if (filters.isOverdue) {
      const now = filters.refDate ? new Date(filters.refDate) : new Date();
      result = result.filter((t) => {
        if (t.status === 'completed' || t.status === 'cancelled') return false;
        const due = new Date(t.dueDate + 'T23:59:59Z');
        return due.getTime() < now.getTime();
      });
    }

    return result;
  }

  public createCsTask(
    input: CreateCsTaskInput,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; task?: CustomerSuccessTask; error?: string } {
    const orgIds = this.organizations.map((o) => o.id);
    const validation = validateCsTask(input, orgIds);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(' ') };
    }

    const id = `cst_${Date.now()}`;
    const newTask: CustomerSuccessTask = {
      id,
      title: input.title.trim(),
      description: input.description.trim(),
      organizationId: input.organizationId,
      assignedOwnerId: input.assignedOwnerId,
      priority: input.priority,
      status: 'pending',
      dueDate: input.dueDate,
      relatedTicketId: input.relatedTicketId,
      createdAt: new Date().toISOString(),
    };

    this.csTasks.unshift(newTask);

    this.logAuditEvent({
      category: 'organization_lifecycle',
      action: 'CUSTOMER_SUCCESS_TASK_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'CustomerSuccessTask',
      targetId: newTask.id,
      status: 'succeeded',
      details: `Created customer success task "${newTask.title}" for organization ${newTask.organizationId}.`,
    });

    this.persist();
    this.notify();
    return { success: true, task: newTask };
  }

  public updateCsTask(
    id: string,
    updates: Partial<CustomerSuccessTask>,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; task?: CustomerSuccessTask; error?: string } {
    const idx = this.csTasks.findIndex((t) => t.id === id);
    if (idx === -1) return { success: false, error: `Task "${id}" not found.` };

    const prev = this.csTasks[idx];
    const updated: CustomerSuccessTask = { ...prev, ...updates };
    this.csTasks[idx] = updated;

    this.logAuditEvent({
      category: 'organization_lifecycle',
      action: 'CUSTOMER_SUCCESS_TASK_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'CustomerSuccessTask',
      targetId: prev.id,
      status: 'succeeded',
      details: `Updated customer success task "${prev.title}".`,
    });

    this.persist();
    this.notify();
    return { success: true, task: updated };
  }

  public setCsTaskStatus(
    id: string,
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled',
    notes?: string,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; task?: CustomerSuccessTask; error?: string } {
    const idx = this.csTasks.findIndex((t) => t.id === id);
    if (idx === -1) return { success: false, error: `Task "${id}" not found.` };

    const prev = this.csTasks[idx];
    const now = new Date().toISOString();
    prev.status = status;
    if (status === 'completed') {
      prev.completedAt = now;
      if (notes) prev.completionNotes = notes;
    } else {
      prev.completedAt = undefined;
    }

    this.logAuditEvent({
      category: 'organization_lifecycle',
      action: 'CUSTOMER_SUCCESS_TASK_STATUS_CHANGED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'CustomerSuccessTask',
      targetId: prev.id,
      status: 'succeeded',
      details: `Customer success task "${prev.title}" marked as ${status}.${notes ? ` Notes: ${notes}` : ''}`,
    });

    this.persist();
    this.notify();
    return { success: true, task: prev };
  }

  public deleteCsTask(
    id: string,
    actorName: string = 'Alexander Sterling'
  ): { success: boolean; error?: string } {
    const idx = this.csTasks.findIndex((t) => t.id === id);
    if (idx === -1) return { success: false, error: `Task "${id}" not found.` };
    const title = this.csTasks[idx].title;
    this.csTasks.splice(idx, 1);

    this.logAuditEvent({
      category: 'organization_lifecycle',
      action: 'CUSTOMER_SUCCESS_TASK_DELETED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'CustomerSuccessTask',
      targetId: id,
      status: 'succeeded',
      details: `Deleted customer success task "${title}".`,
    });

    this.persist();
    this.notify();
    return { success: true };
  }

  // --- High-Level Analytics & Account Summaries ---
  public getSupportMetrics(refDate?: string): SupportMetricsSummary {
    return calculateSupportMetrics(this.supportTickets, this.slaPolicies, this.csatRecords, refDate);
  }

  public getCustomerSuccessSummaries(refDate?: string): CustomerSuccessAccountSummary[] {
    return computeCustomerSuccessAccountSummaries(
      this.organizations,
      this.subscriptions,
      this.plans,
      this.supportTickets,
      this.csatRecords,
      this.csTasks,
      refDate
    );
  }

  // --- E-09.19 Integrations, API Clients & Webhooks Operations ---

  public getIntegrations(filters?: { query?: string; category?: string; status?: string; enabled?: string }): IntegrationRecord[] {
    return filterIntegrations(this.integrations, filters?.query, filters?.category, filters?.status, filters?.enabled);
  }

  public getIntegrationById(id: string): IntegrationRecord | undefined {
    return this.integrations.find((i) => i.id === id);
  }

  public getApiClients(filters?: { query?: string; clientType?: string; status?: string }): ApiClientRecord[] {
    return filterApiClients(this.apiClients, filters?.query, filters?.clientType, filters?.status);
  }

  public getApiClientById(id: string): ApiClientRecord | undefined {
    return this.apiClients.find((c) => c.id === id);
  }

  public getWebhookEndpoints(filters?: { query?: string; enabled?: string }): WebhookEndpointRecord[] {
    return filterWebhookEndpoints(this.webhookEndpoints, filters?.query, filters?.enabled);
  }

  public getWebhookEndpointById(id: string): WebhookEndpointRecord | undefined {
    return this.webhookEndpoints.find((e) => e.id === id);
  }

  public getWebhookDeliveries(filters?: { query?: string; endpointId?: string; eventType?: string; outcome?: string }): WebhookDeliveryRecord[] {
    return filterWebhookDeliveries(this.webhookDeliveries, filters?.query, filters?.endpointId, filters?.eventType, filters?.outcome);
  }

  public getWebhookDeliveryById(id: string): WebhookDeliveryRecord | undefined {
    return this.webhookDeliveries.find((d) => d.id === id);
  }

  public getIntegrationMetrics(): IntegrationMetricsSummary {
    return computeIntegrationMetrics(this.integrations, this.apiClients, this.webhookEndpoints, this.webhookDeliveries);
  }

  public getIntegrationHealthIndicators(): IntegrationHealthIndicator[] {
    return computeIntegrationHealthIndicators(this.integrations, this.apiClients, this.webhookEndpoints, this.webhookDeliveries);
  }

  public updateIntegrationConfig(
    id: string,
    updates: UpdateIntegrationInput,
    actorName = 'Alexander Sterling'
  ): { success: boolean; integration?: IntegrationRecord; error?: string } {
    const idx = this.integrations.findIndex((i) => i.id === id);
    if (idx === -1) return { success: false, error: `Integration "${id}" not found.` };

    const prev = this.integrations[idx];
    const updated: IntegrationRecord = {
      ...prev,
      ...updates,
      config: {
        ...prev.config,
        ...(updates.config || {}),
      },
      lastConfigUpdatedAt: new Date().toISOString(),
    };

    if (updates.configStatus) {
      updated.configStatus = updates.configStatus;
    }

    this.integrations[idx] = updated;

    this.logAuditEvent({
      category: 'integrations_governance',
      action: 'INTEGRATION_CONFIG_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'IntegrationRecord',
      targetId: id,
      targetName: updated.name,
      status: 'succeeded',
      details: `Updated integration parameters for "${updated.name}" (${updated.provider}). Status: ${updated.configStatus}.`,
    });

    this.persist();
    this.notify();
    return { success: true, integration: updated };
  }

  public toggleIntegration(
    id: string,
    actorName = 'Alexander Sterling'
  ): { success: boolean; integration?: IntegrationRecord; error?: string } {
    const idx = this.integrations.findIndex((i) => i.id === id);
    if (idx === -1) return { success: false, error: `Integration "${id}" not found.` };

    const item = this.integrations[idx];
    item.isEnabled = !item.isEnabled;
    item.lastConfigUpdatedAt = new Date().toISOString();

    this.logAuditEvent({
      category: 'integrations_governance',
      action: item.isEnabled ? 'INTEGRATION_ENABLED' : 'INTEGRATION_DISABLED',
      severity: item.isEnabled ? 'info' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'IntegrationRecord',
      targetId: id,
      targetName: item.name,
      status: 'succeeded',
      details: `Integration "${item.name}" was ${item.isEnabled ? 'enabled' : 'disabled'} in local configuration store.`,
    });

    this.persist();
    this.notify();
    return { success: true, integration: item };
  }

  public simulateVerifyIntegration(
    id: string,
    actorName = 'Alexander Sterling'
  ): { success: boolean; verificationStatus: 'verified_demo' | 'failed'; message: string; integration?: IntegrationRecord } {
    const idx = this.integrations.findIndex((i) => i.id === id);
    if (idx === -1) {
      return { success: false, verificationStatus: 'failed', message: `Integration "${id}" not found.` };
    }

    const item = this.integrations[idx];
    const result = executeSimulatedConnectionVerification(item);

    item.verificationStatus = result.verificationStatus;
    if (result.success) {
      item.lastVerifiedAt = new Date().toISOString();
    }

    this.logAuditEvent({
      category: 'integrations_governance',
      action: 'INTEGRATION_CONNECTION_VERIFIED',
      severity: result.success ? 'info' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'IntegrationRecord',
      targetId: id,
      targetName: item.name,
      status: result.success ? 'succeeded' : 'failed',
      details: result.message,
    });

    this.persist();
    this.notify();
    return { ...result, integration: item };
  }

  public createApiClient(
    input: CreateApiClientInput,
    actorName = 'Alexander Sterling'
  ): { success: boolean; client?: ApiClientRecord; error?: string; warnings?: string[] } {
    const validation = validateApiClientInput(input);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      return { success: false, error: firstError, warnings: validation.warnings };
    }

    const now = new Date().toISOString();
    const id = `client_${Date.now().toString(36)}`;
    const randomHex = Math.random().toString(16).slice(2, 10);
    const clientId = `sms_app_${input.name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 16)}_${randomHex}`;
    const expiresAt = input.expiresInDays
      ? new Date(Date.now() + input.expiresInDays * 86400000).toISOString()
      : new Date(Date.now() + 365 * 86400000).toISOString();

    const client: ApiClientRecord = {
      id,
      clientId,
      name: input.name.trim(),
      description: input.description.trim(),
      clientType: input.clientType,
      status: 'active',
      organizationId: input.organizationId || 'platform',
      organizationName: input.organizationName || 'Platform General',
      assignedScopes: [...input.assignedScopes],
      ipWhitelist: input.ipWhitelist || [],
      rateLimitRps: input.rateLimitRps || 30,
      createdAt: now,
      expiresAt,
      lastRotatedAt: now,
      isDemoFixture: false,
      maskedCredentialPlaceholder: `sk_live_••••••••••••••••••••••••••••••••${randomHex.slice(0, 4)}`,
    };

    this.apiClients.unshift(client);

    this.logAuditEvent({
      category: 'integrations_governance',
      action: 'API_CLIENT_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'ApiClientRecord',
      targetId: id,
      targetName: client.name,
      status: 'succeeded',
      details: `Created API client "${client.name}" (${client.clientId}) with ${client.assignedScopes.length} scopes.`,
    });

    this.persist();
    this.notify();
    return { success: true, client, warnings: validation.warnings };
  }

  public updateApiClient(
    id: string,
    updates: UpdateApiClientInput,
    actorName = 'Alexander Sterling'
  ): { success: boolean; client?: ApiClientRecord; error?: string } {
    const idx = this.apiClients.findIndex((c) => c.id === id);
    if (idx === -1) return { success: false, error: `API client "${id}" not found.` };

    const prev = this.apiClients[idx];
    const updated: ApiClientRecord = {
      ...prev,
      name: updates.name !== undefined ? updates.name.trim() : prev.name,
      description: updates.description !== undefined ? updates.description.trim() : prev.description,
      assignedScopes: updates.assignedScopes !== undefined ? [...updates.assignedScopes] : prev.assignedScopes,
      ipWhitelist: updates.ipWhitelist !== undefined ? [...updates.ipWhitelist] : prev.ipWhitelist,
      rateLimitRps: updates.rateLimitRps !== undefined ? updates.rateLimitRps : prev.rateLimitRps,
      status: updates.status !== undefined ? updates.status : prev.status,
    };

    this.apiClients[idx] = updated;

    this.logAuditEvent({
      category: 'integrations_governance',
      action: 'API_CLIENT_METADATA_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'ApiClientRecord',
      targetId: id,
      targetName: updated.name,
      status: 'succeeded',
      details: `Updated metadata and access scopes for API client "${updated.name}".`,
    });

    this.persist();
    this.notify();
    return { success: true, client: updated };
  }

  public revokeApiClient(
    id: string,
    reason: string,
    actorName = 'Alexander Sterling'
  ): { success: boolean; client?: ApiClientRecord; error?: string } {
    const idx = this.apiClients.findIndex((c) => c.id === id);
    if (idx === -1) return { success: false, error: `API client "${id}" not found.` };

    const client = this.apiClients[idx];
    client.status = 'revoked';

    this.logAuditEvent({
      category: 'integrations_governance',
      action: 'API_CLIENT_REVOKED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'ApiClientRecord',
      targetId: id,
      targetName: client.name,
      status: 'succeeded',
      details: `Revoked credentials for API client "${client.name}". Reason: ${reason}`,
    });

    this.persist();
    this.notify();
    return { success: true, client };
  }

  public createWebhookEndpoint(
    input: CreateWebhookEndpointInput,
    actorName = 'Alexander Sterling'
  ): { success: boolean; endpoint?: WebhookEndpointRecord; error?: string } {
    const validation = validateWebhookEndpointInput(input);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      return { success: false, error: firstError };
    }

    const now = new Date().toISOString();
    const id = `ep_${Date.now().toString(36)}`;
    const randomHex = Math.random().toString(16).slice(2, 6);

    const endpoint: WebhookEndpointRecord = {
      id,
      name: input.name.trim(),
      destinationUrl: input.destinationUrl.trim(),
      description: input.description.trim(),
      associatedIntegrationId: input.associatedIntegrationId,
      associatedClientId: input.associatedClientId,
      subscribedEvents: [...input.subscribedEvents],
      isEnabled: true,
      signingSecretMasked: `whsec_demo_••••••••••••••••••••••••${randomHex}`,
      timeoutMs: input.timeoutMs || 5000,
      retryPolicy: {
        maxRetries: input.retryPolicy?.maxRetries || 3,
        backoffMultiplier: input.retryPolicy?.backoffMultiplier || 2,
        initialIntervalSec: input.retryPolicy?.initialIntervalSec || 60,
      },
      rateLimitPerSec: input.rateLimitPerSec || 10,
      createdAt: now,
      updatedAt: now,
      isDemoFixture: false,
    };

    this.webhookEndpoints.unshift(endpoint);

    this.logAuditEvent({
      category: 'integrations_governance',
      action: 'WEBHOOK_ENDPOINT_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'WebhookEndpointRecord',
      targetId: id,
      targetName: endpoint.name,
      status: 'succeeded',
      details: `Configured webhook endpoint "${endpoint.name}" to destination ${endpoint.destinationUrl} with ${endpoint.subscribedEvents.length} event subscriptions.`,
    });

    this.persist();
    this.notify();
    return { success: true, endpoint };
  }

  public updateWebhookEndpoint(
    id: string,
    updates: UpdateWebhookEndpointInput,
    actorName = 'Alexander Sterling'
  ): { success: boolean; endpoint?: WebhookEndpointRecord; error?: string } {
    const idx = this.webhookEndpoints.findIndex((e) => e.id === id);
    if (idx === -1) return { success: false, error: `Webhook endpoint "${id}" not found.` };

    const prev = this.webhookEndpoints[idx];
    const updated: WebhookEndpointRecord = {
      ...prev,
      name: updates.name !== undefined ? updates.name.trim() : prev.name,
      destinationUrl: updates.destinationUrl !== undefined ? updates.destinationUrl.trim() : prev.destinationUrl,
      description: updates.description !== undefined ? updates.description.trim() : prev.description,
      subscribedEvents: updates.subscribedEvents !== undefined ? [...updates.subscribedEvents] : prev.subscribedEvents,
      isEnabled: updates.isEnabled !== undefined ? updates.isEnabled : prev.isEnabled,
      timeoutMs: updates.timeoutMs !== undefined ? updates.timeoutMs : prev.timeoutMs,
      rateLimitPerSec: updates.rateLimitPerSec !== undefined ? updates.rateLimitPerSec : prev.rateLimitPerSec,
      retryPolicy: {
        ...prev.retryPolicy,
        ...(updates.retryPolicy || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    this.webhookEndpoints[idx] = updated;

    this.logAuditEvent({
      category: 'integrations_governance',
      action: 'WEBHOOK_ENDPOINT_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'WebhookEndpointRecord',
      targetId: id,
      targetName: updated.name,
      status: 'succeeded',
      details: `Updated webhook endpoint "${updated.name}" (${updated.destinationUrl}).`,
    });

    this.persist();
    this.notify();
    return { success: true, endpoint: updated };
  }

  public toggleWebhookEndpoint(
    id: string,
    actorName = 'Alexander Sterling'
  ): { success: boolean; endpoint?: WebhookEndpointRecord; error?: string } {
    const idx = this.webhookEndpoints.findIndex((e) => e.id === id);
    if (idx === -1) return { success: false, error: `Webhook endpoint "${id}" not found.` };

    const ep = this.webhookEndpoints[idx];
    ep.isEnabled = !ep.isEnabled;
    ep.updatedAt = new Date().toISOString();

    this.logAuditEvent({
      category: 'integrations_governance',
      action: ep.isEnabled ? 'WEBHOOK_ENDPOINT_ENABLED' : 'WEBHOOK_ENDPOINT_DISABLED',
      severity: ep.isEnabled ? 'info' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'WebhookEndpointRecord',
      targetId: id,
      targetName: ep.name,
      status: 'succeeded',
      details: `Webhook endpoint "${ep.name}" was ${ep.isEnabled ? 'enabled' : 'disabled'}.`,
    });

    this.persist();
    this.notify();
    return { success: true, endpoint: ep };
  }

  public simulateTestWebhookDelivery(
    endpointId: string,
    eventTypeId: string,
    simulateSuccess = true,
    actorName = 'Alexander Sterling'
  ): { success: boolean; delivery?: WebhookDeliveryRecord; error?: string } {
    const endpoint = this.webhookEndpoints.find((e) => e.id === endpointId);
    if (!endpoint) return { success: false, error: `Endpoint "${endpointId}" not found.` };

    const eventType = WEBHOOK_EVENT_CATALOGUE.find((ev) => ev.id === eventTypeId) || {
      id: eventTypeId,
      name: eventTypeId,
      category: 'system' as const,
      description: 'Custom simulated demonstration event',
      availability: 'available' as const,
      examplePayload: {
        eventId: `evt_sim_${Date.now()}`,
        eventType: eventTypeId,
        timestamp: new Date().toISOString(),
        data: { message: 'Demonstration test payload' },
      },
    };

    const delivery = executeSimulatedTestDelivery(endpoint, eventType, simulateSuccess);
    this.webhookDeliveries.unshift(delivery);

    endpoint.lastDeliveryOutcome = delivery.outcome;
    endpoint.lastDeliveryAt = delivery.createdAt;

    this.logAuditEvent({
      category: 'integrations_governance',
      action: 'WEBHOOK_TEST_DELIVERY_DISPATCHED',
      severity: simulateSuccess ? 'info' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'WebhookDeliveryRecord',
      targetId: delivery.id,
      targetName: endpoint.name,
      status: simulateSuccess ? 'succeeded' : 'failed',
      details: `Simulated test webhook dispatch of "${eventType.id}" to ${endpoint.destinationUrl}. Result: ${delivery.outcome} (${delivery.httpStatusCode}).`,
    });

    this.persist();
    this.notify();
    return { success: true, delivery };
  }

  public simulateRetryWebhookDelivery(
    deliveryId: string,
    simulateSuccess = true,
    actorName = 'Alexander Sterling'
  ): { success: boolean; delivery?: WebhookDeliveryRecord; error?: string } {
    const idx = this.webhookDeliveries.findIndex((d) => d.id === deliveryId);
    if (idx === -1) return { success: false, error: `Delivery record "${deliveryId}" not found.` };

    const delivery = this.webhookDeliveries[idx];
    const retryResult = executeSimulatedRetry(delivery, simulateSuccess);
    if (!retryResult.success || !retryResult.delivery) {
      return { success: false, error: retryResult.error || 'Retry could not be executed.' };
    }

    this.webhookDeliveries[idx] = retryResult.delivery;

    // Update endpoint last outcome
    const ep = this.webhookEndpoints.find((e) => e.id === delivery.endpointId);
    if (ep) {
      ep.lastDeliveryOutcome = retryResult.delivery.outcome;
      ep.lastDeliveryAt = retryResult.delivery.completedAt || retryResult.delivery.createdAt;
    }

    this.logAuditEvent({
      category: 'integrations_governance',
      action: 'WEBHOOK_DELIVERY_RETRIED',
      severity: simulateSuccess ? 'info' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'WebhookDeliveryRecord',
      targetId: deliveryId,
      targetName: delivery.endpointName,
      status: simulateSuccess ? 'succeeded' : 'failed',
      details: `Simulated retry attempt #${retryResult.delivery.currentAttempt} for delivery ${deliveryId} to ${delivery.destinationUrl}. Outcome: ${retryResult.delivery.outcome}.`,
    });

    this.persist();
    this.notify();
    return { success: true, delivery: retryResult.delivery };
  }

  // =========================================================================
  // --- Phase E-09.20: Platform Data Governance, Retention & Privacy Methods ---
  // =========================================================================

  public getDataCategories(filters?: {
    query?: string;
    classification?: string;
    subjectType?: string;
    module?: string;
    retentionCoverage?: string;
  }): DataCategoryRecord[] {
    return filterDataCategories(
      this.dataCategories,
      filters?.query,
      filters?.classification,
      filters?.subjectType,
      filters?.module,
      filters?.retentionCoverage
    );
  }

  public getDataCategoryById(id: string): DataCategoryRecord | undefined {
    return this.dataCategories.find((c) => c.id === id);
  }

  public updateDataCategory(
    id: string,
    updates: UpdateDataCategoryInput,
    actorName = 'Alexander Sterling'
  ): { success: boolean; category?: DataCategoryRecord; error?: string } {
    const idx = this.dataCategories.findIndex((c) => c.id === id);
    if (idx === -1) {
      return { success: false, error: `Data category with ID "${id}" was not found.` };
    }

    const prev = this.dataCategories[idx];
    const updated: DataCategoryRecord = {
      ...prev,
      ...updates,
      lastReviewedAt: new Date().toISOString(),
    };

    this.dataCategories[idx] = updated;

    this.logAuditEvent({
      category: 'data_governance',
      action: 'DATA_CATEGORY_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'DataCategoryRecord',
      targetId: id,
      targetName: updated.name,
      status: 'succeeded',
      details: `Updated metadata and classification (${updated.classificationLevel}) for data category ${updated.code}.`,
      metadata: { previousClassification: prev.classificationLevel, newClassification: updated.classificationLevel },
    });

    this.persist();
    this.notify();
    return { success: true, category: updated };
  }

  public getGovernanceRetentionPolicies(filters?: {
    query?: string;
    status?: string;
    trigger?: string;
    reviewDueOnly?: boolean;
  }): GovernanceRetentionPolicy[] {
    return filterGovernanceRetentionPolicies(
      this.governanceRetentionPolicies,
      filters?.query,
      filters?.status,
      filters?.trigger,
      filters?.reviewDueOnly
    );
  }

  public getGovernanceRetentionPolicyById(id: string): GovernanceRetentionPolicy | undefined {
    return this.governanceRetentionPolicies.find((p) => p.id === id);
  }

  public createGovernanceRetentionPolicy(
    input: CreateRetentionPolicyInput,
    actorName = 'Alexander Sterling'
  ): { success: boolean; policy?: GovernanceRetentionPolicy; error?: string } {
    if (!input.name?.trim()) {
      return { success: false, error: 'Policy name is required.' };
    }
    if (!input.durationDisplay?.trim()) {
      return { success: false, error: 'Duration display is required.' };
    }

    const id = `ret_pol_${Date.now().toString(36)}`;
    const code = `RET-${input.retentionTrigger.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newPolicy: GovernanceRetentionPolicy = {
      id,
      code,
      name: input.name.trim(),
      description: input.description?.trim() || '',
      coveredCategoryIds: input.coveredCategoryIds || [],
      durationDays: input.durationDays,
      durationDisplay: input.durationDisplay.trim(),
      retentionTrigger: input.retentionTrigger,
      triggerDescription: input.triggerDescription || '',
      policyOwner: input.policyOwner || 'Platform Legal & Compliance',
      status: input.status || 'draft',
      enforcementMode: 'simulated_advisory',
      approvalStatus: input.approvalStatus || 'unreviewed',
      lastReviewedAt: new Date().toISOString(),
      nextReviewDueAt: input.nextReviewDueAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      exceptionHandlingNotes: input.exceptionHandlingNotes || '',
      legalSafeguardBasis: input.legalSafeguardBasis || '',
      activeExceptionsCount: 0,
      isDemonstration: true,
    };

    this.governanceRetentionPolicies.unshift(newPolicy);

    // Link covered categories to this policy if specified
    if (newPolicy.coveredCategoryIds.length > 0) {
      this.dataCategories = this.dataCategories.map((c) =>
        newPolicy.coveredCategoryIds.includes(c.id) ? { ...c, retentionPolicyId: newPolicy.id } : c
      );
    }

    this.logAuditEvent({
      category: 'data_governance',
      action: 'RETENTION_POLICY_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'GovernanceRetentionPolicy',
      targetId: id,
      targetName: newPolicy.name,
      status: 'succeeded',
      details: `Created demo retention schedule ${newPolicy.code} ("${newPolicy.name}"). Duration: ${newPolicy.durationDisplay}.`,
      metadata: { policyId: id, policyCode: newPolicy.code, durationDays: newPolicy.durationDays },
    });

    this.persist();
    this.notify();
    return { success: true, policy: newPolicy };
  }

  public updateGovernanceRetentionPolicy(
    id: string,
    updates: UpdateRetentionPolicyInput,
    actorName = 'Alexander Sterling'
  ): { success: boolean; policy?: GovernanceRetentionPolicy; error?: string } {
    const idx = this.governanceRetentionPolicies.findIndex((p) => p.id === id);
    if (idx === -1) {
      return { success: false, error: `Retention policy with ID "${id}" was not found.` };
    }

    const prev = this.governanceRetentionPolicies[idx];
    const updated: GovernanceRetentionPolicy = {
      ...prev,
      ...updates,
      lastReviewedAt: new Date().toISOString(),
    };

    this.governanceRetentionPolicies[idx] = updated;

    // Synchronize category bindings if coveredCategoryIds changed
    if (updates.coveredCategoryIds) {
      this.dataCategories = this.dataCategories.map((c) => {
        if (updates.coveredCategoryIds!.includes(c.id)) {
          return { ...c, retentionPolicyId: id };
        } else if (c.retentionPolicyId === id) {
          return { ...c, retentionPolicyId: null };
        }
        return c;
      });
    }

    this.logAuditEvent({
      category: 'data_governance',
      action: 'RETENTION_POLICY_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'GovernanceRetentionPolicy',
      targetId: id,
      targetName: updated.name,
      status: 'succeeded',
      details: `Updated demo retention schedule ${updated.code}. Status: ${updated.status}. Covered categories: ${updated.coveredCategoryIds.length}.`,
      metadata: { policyId: id, policyCode: updated.code, coveredCategoriesCount: updated.coveredCategoryIds.length },
    });

    this.persist();
    this.notify();
    return { success: true, policy: updated };
  }

  public reviewGovernanceRetentionPolicy(
    id: string,
    reviewOutcome: PolicyApprovalStatus,
    nextReviewDueAt: string,
    actorName = 'Alexander Sterling'
  ): { success: boolean; policy?: GovernanceRetentionPolicy; error?: string } {
    const idx = this.governanceRetentionPolicies.findIndex((p) => p.id === id);
    if (idx === -1) {
      return { success: false, error: `Retention policy with ID "${id}" was not found.` };
    }

    const prev = this.governanceRetentionPolicies[idx];
    const updated: GovernanceRetentionPolicy = {
      ...prev,
      approvalStatus: reviewOutcome,
      status: reviewOutcome === 'approved_demo' ? 'active_config' : prev.status,
      lastReviewedAt: new Date().toISOString(),
      nextReviewDueAt: nextReviewDueAt || prev.nextReviewDueAt,
    };

    this.governanceRetentionPolicies[idx] = updated;

    this.logAuditEvent({
      category: 'data_governance',
      action: 'RETENTION_POLICY_REVIEWED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'GovernanceRetentionPolicy',
      targetId: id,
      targetName: updated.name,
      status: 'succeeded',
      details: `Simulated policy review completed for ${updated.code}. Outcome: ${reviewOutcome}. Next review: ${updated.nextReviewDueAt}.`,
      metadata: { reviewOutcome, nextReviewDueAt },
    });

    this.persist();
    this.notify();
    return { success: true, policy: updated };
  }

  public getPrivacyRequests(filters?: {
    query?: string;
    category?: string;
    status?: string;
    tenantId?: string;
    priority?: string;
    dueStatus?: string;
  }): PrivacyRequestRecord[] {
    return filterPrivacyRequests(
      this.privacyRequests,
      filters?.query,
      filters?.category,
      filters?.status,
      filters?.tenantId,
      filters?.priority,
      filters?.dueStatus
    );
  }

  public getPrivacyRequestById(id: string): PrivacyRequestRecord | undefined {
    return this.privacyRequests.find((r) => r.id === id);
  }

  public createPrivacyRequest(
    input: CreatePrivacyRequestInput,
    actorName = 'Alexander Sterling'
  ): { success: boolean; request?: PrivacyRequestRecord; error?: string } {
    if (!input.requestSummary?.trim()) {
      return { success: false, error: 'Request summary is required.' };
    }
    if (!input.requestingPartyLabel?.trim()) {
      return { success: false, error: 'Fictional requesting party label is required.' };
    }

    const id = `pr_req_${Date.now().toString(36)}`;
    const code = `DSAR-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newRequest: PrivacyRequestRecord = {
      id,
      code,
      category: input.category,
      requestingPartyType: input.requestingPartyType,
      requestingPartyLabel: input.requestingPartyLabel.trim(),
      tenantId: input.tenantId,
      tenantName: input.tenantName,
      receivedAt: new Date().toISOString(),
      dueAt: input.dueAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      workflowStatus: 'received',
      assignedRole: input.assignedRole || 'Data Protection Officer (DPO)',
      priority: input.priority || 'normal',
      requestSummary: input.requestSummary.trim(),
      reviewNotes: 'Intake created in platform privacy register.',
      resolutionCategory: 'pending',
      resolutionSummary: 'Awaiting triage and verification.',
      completedAt: null,
      isSimulatedWorkflow: true,
      simulatedArtifactManifest: null,
    };

    this.privacyRequests.unshift(newRequest);

    this.logAuditEvent({
      category: 'data_governance',
      action: 'PRIVACY_REQUEST_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'PrivacyRequestRecord',
      targetId: id,
      targetName: newRequest.code,
      status: 'succeeded',
      details: `Intake logged for simulated privacy request ${newRequest.code} (${newRequest.category}) for ${newRequest.tenantName}.`,
      metadata: { requestId: id, requestCode: newRequest.code, category: newRequest.category },
    });

    this.persist();
    this.notify();
    return { success: true, request: newRequest };
  }

  public updatePrivacyRequestStatus(
    id: string,
    targetStatus: PrivacyWorkflowStatus,
    reviewNotes: string,
    resolutionCategory?: PrivacyResolutionCategory,
    actorName = 'Alexander Sterling'
  ): { success: boolean; request?: PrivacyRequestRecord; error?: string } {
    const idx = this.privacyRequests.findIndex((r) => r.id === id);
    if (idx === -1) {
      return { success: false, error: `Privacy request with ID "${id}" was not found.` };
    }

    const prev = this.privacyRequests[idx];
    const validation = isValidPrivacyTransition(prev.workflowStatus, targetStatus);
    if (!validation.valid) {
      return { success: false, error: validation.reason };
    }

    const isTerminal = targetStatus === 'completed_closed' || targetStatus === 'rejected_with_grounds';

    const updated: PrivacyRequestRecord = {
      ...prev,
      workflowStatus: targetStatus,
      reviewNotes: reviewNotes?.trim() || prev.reviewNotes,
      resolutionCategory: resolutionCategory || prev.resolutionCategory,
      completedAt: isTerminal ? new Date().toISOString() : prev.completedAt,
    };

    this.privacyRequests[idx] = updated;

    this.logAuditEvent({
      category: 'data_governance',
      action: 'PRIVACY_REQUEST_TRANSITIONED',
      severity: targetStatus === 'rejected_with_grounds' ? 'warning' : 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'PrivacyRequestRecord',
      targetId: id,
      targetName: updated.code,
      status: 'succeeded',
      details: `Privacy request ${updated.code} transitioned from "${prev.workflowStatus}" to "${targetStatus}". Notes: ${updated.reviewNotes}`,
      metadata: { previousStatus: prev.workflowStatus, newStatus: targetStatus },
    });

    this.persist();
    this.notify();
    return { success: true, request: updated };
  }

  public simulatePrivacyRequestProcessing(
    id: string,
    actorName = 'Alexander Sterling'
  ): { success: boolean; request?: PrivacyRequestRecord; error?: string } {
    const idx = this.privacyRequests.findIndex((r) => r.id === id);
    if (idx === -1) {
      return { success: false, error: `Privacy request with ID "${id}" was not found.` };
    }

    const prev = this.privacyRequests[idx];
    const { updatedRequest, auditDetails } = simulatePrivacyRequestExecution(prev);

    this.privacyRequests[idx] = updatedRequest;

    this.logAuditEvent({
      category: 'data_governance',
      action: 'PRIVACY_REQUEST_SIMULATED_PROCESSING',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'PrivacyRequestRecord',
      targetId: id,
      targetName: updatedRequest.code,
      status: 'succeeded',
      details: auditDetails,
      metadata: {
        artifactType: updatedRequest.simulatedArtifactManifest?.type || 'none',
        fieldsCount: updatedRequest.simulatedArtifactManifest?.fieldsProcessedCount || 0,
        artifactSummary: updatedRequest.simulatedArtifactManifest?.summary || 'none',
      },
    });

    this.persist();
    this.notify();
    return { success: true, request: updatedRequest };
  }

  public getDataLifecycleRules(filters?: {
    query?: string;
    categoryId?: string;
    status?: string;
    stage?: string;
  }): DataLifecycleRuleRecord[] {
    return filterLifecycleRules(
      this.lifecycleRules,
      filters?.query,
      filters?.categoryId,
      filters?.status,
      filters?.stage
    );
  }

  public getDataLifecycleRuleById(id: string): DataLifecycleRuleRecord | undefined {
    return this.lifecycleRules.find((r) => r.id === id);
  }

  public createDataLifecycleRule(
    input: CreateLifecycleRuleInput,
    actorName = 'Alexander Sterling'
  ): { success: boolean; rule?: DataLifecycleRuleRecord; error?: string } {
    if (!input.name?.trim()) {
      return { success: false, error: 'Rule name is required.' };
    }
    if (!input.coveredCategoryId) {
      return { success: false, error: 'Target data category is required.' };
    }

    const id = `lcr_${Date.now().toString(36)}`;
    const code = `LCR-${input.targetLifecycleStage.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newRule: DataLifecycleRuleRecord = {
      id,
      code,
      name: input.name.trim(),
      coveredCategoryId: input.coveredCategoryId,
      triggerEvent: input.triggerEvent,
      triggerConditions: input.triggerConditions?.trim() || '',
      targetLifecycleStage: input.targetLifecycleStage,
      requiredApproval: input.requiredApproval || 'platform_super_admin',
      exceptionHandling: input.exceptionHandling?.trim() || '',
      status: input.status || 'enabled',
      lastRunSimulatedAt: null,
      lastReviewDate: new Date().toISOString(),
      nextReviewDate: input.nextReviewDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      isDemonstration: true,
    };

    this.lifecycleRules.unshift(newRule);

    this.logAuditEvent({
      category: 'data_governance',
      action: 'LIFECYCLE_RULE_CREATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'DataLifecycleRuleRecord',
      targetId: id,
      targetName: newRule.name,
      status: 'succeeded',
      details: `Created data lifecycle rule ${newRule.code} ("${newRule.name}") transitioning to "${newRule.targetLifecycleStage}".`,
      metadata: {
        ruleId: id,
        ruleCode: newRule.code,
        targetStage: newRule.targetLifecycleStage,
        triggerEvent: newRule.triggerEvent,
      },
    });

    this.persist();
    this.notify();
    return { success: true, rule: newRule };
  }

  public updateDataLifecycleRule(
    id: string,
    updates: Partial<CreateLifecycleRuleInput>,
    actorName = 'Alexander Sterling'
  ): { success: boolean; rule?: DataLifecycleRuleRecord; error?: string } {
    const idx = this.lifecycleRules.findIndex((r) => r.id === id);
    if (idx === -1) {
      return { success: false, error: `Lifecycle rule with ID "${id}" was not found.` };
    }

    const prev = this.lifecycleRules[idx];
    const updated: DataLifecycleRuleRecord = {
      ...prev,
      ...updates,
      lastReviewDate: new Date().toISOString(),
    };

    this.lifecycleRules[idx] = updated;

    this.logAuditEvent({
      category: 'data_governance',
      action: 'LIFECYCLE_RULE_UPDATED',
      severity: 'info',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'DataLifecycleRuleRecord',
      targetId: id,
      targetName: updated.name,
      status: 'succeeded',
      details: `Updated data lifecycle rule ${updated.code}. Status: ${updated.status}. Target stage: ${updated.targetLifecycleStage}.`,
      metadata: {
        ruleId: id,
        ruleCode: updated.code,
        previousStatus: prev.status,
        newStatus: updated.status,
      },
    });

    this.persist();
    this.notify();
    return { success: true, rule: updated };
  }

  public toggleDataLifecycleRule(
    id: string,
    actorName = 'Alexander Sterling'
  ): { success: boolean; rule?: DataLifecycleRuleRecord; error?: string } {
    const idx = this.lifecycleRules.findIndex((r) => r.id === id);
    if (idx === -1) {
      return { success: false, error: `Lifecycle rule with ID "${id}" was not found.` };
    }

    const prev = this.lifecycleRules[idx];
    const newStatus = prev.status === 'enabled' ? 'disabled' : 'enabled';
    const updated: DataLifecycleRuleRecord = {
      ...prev,
      status: newStatus,
    };

    this.lifecycleRules[idx] = updated;

    this.logAuditEvent({
      category: 'data_governance',
      action: 'LIFECYCLE_RULE_TOGGLED',
      severity: newStatus === 'enabled' ? 'info' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'DataLifecycleRuleRecord',
      targetId: id,
      targetName: updated.name,
      status: 'succeeded',
      details: `Lifecycle rule ${updated.code} toggled from "${prev.status}" to "${newStatus}".`,
      metadata: { previousStatus: prev.status, newStatus },
    });

    this.persist();
    this.notify();
    return { success: true, rule: updated };
  }

  public getGovernanceExceptions(filters?: {
    query?: string;
    status?: string;
    reason?: string;
    tenantId?: string;
  }): GovernanceExceptionRecord[] {
    return filterGovernanceExceptions(
      this.governanceExceptions,
      filters?.query,
      filters?.status,
      filters?.reason,
      filters?.tenantId
    );
  }

  public getGovernanceExceptionById(id: string): GovernanceExceptionRecord | undefined {
    return this.governanceExceptions.find((e) => e.id === id);
  }

  public createGovernanceException(
    input: CreateGovernanceExceptionInput,
    actorName = 'Alexander Sterling'
  ): { success: boolean; exception?: GovernanceExceptionRecord; error?: string } {
    if (!input.title?.trim()) {
      return { success: false, error: 'Exception title is required.' };
    }
    if (!input.justificationText?.trim()) {
      return { success: false, error: 'Legal or operational justification is required.' };
    }

    const id = `exc_${Date.now().toString(36)}`;
    const code = `EXC-${input.reasonCategory.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newException: GovernanceExceptionRecord = {
      id,
      code,
      title: input.title.trim(),
      relatedPolicyId: input.relatedPolicyId,
      relatedCategoryId: input.relatedCategoryId,
      tenantId: input.tenantId || 'platform_wide',
      tenantName: input.tenantName || 'All Organizations (Platform-Wide)',
      reasonCategory: input.reasonCategory,
      reviewStatus: 'pending_review',
      approvalRequirement: input.approvalRequirement || 'legal_counsel',
      requestedAt: new Date().toISOString(),
      reviewDueAt: input.reviewDueAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      expirationAt: input.expirationAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      responsibleRole: input.responsibleRole || 'Legal Counsel',
      justificationText: input.justificationText.trim(),
      resolutionSummary: 'Submitted for legal and compliance review.',
      isDemonstration: true,
    };

    this.governanceExceptions.unshift(newException);

    // Update activeExceptionsCount on the related policy
    const policyIdx = this.governanceRetentionPolicies.findIndex((p) => p.id === input.relatedPolicyId);
    if (policyIdx !== -1) {
      this.governanceRetentionPolicies[policyIdx].activeExceptionsCount++;
    }

    this.logAuditEvent({
      category: 'data_governance',
      action: 'GOVERNANCE_EXCEPTION_CREATED',
      severity: 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'GovernanceExceptionRecord',
      targetId: id,
      targetName: newException.title,
      status: 'succeeded',
      details: `Created governance exception ${newException.code} ("${newException.title}") under reason category "${newException.reasonCategory}".`,
      metadata: {
        exceptionId: id,
        exceptionCode: newException.code,
        reasonCategory: newException.reasonCategory,
        approvalRequirement: newException.approvalRequirement,
      },
    });

    this.persist();
    this.notify();
    return { success: true, exception: newException };
  }

  public reviewGovernanceException(
    id: string,
    reviewStatus: ExceptionReviewStatus,
    resolutionSummary: string,
    actorName = 'Alexander Sterling'
  ): { success: boolean; exception?: GovernanceExceptionRecord; error?: string } {
    const idx = this.governanceExceptions.findIndex((e) => e.id === id);
    if (idx === -1) {
      return { success: false, error: `Governance exception with ID "${id}" was not found.` };
    }

    const prev = this.governanceExceptions[idx];
    const updated: GovernanceExceptionRecord = {
      ...prev,
      reviewStatus,
      resolutionSummary: resolutionSummary?.trim() || prev.resolutionSummary,
    };

    this.governanceExceptions[idx] = updated;

    this.logAuditEvent({
      category: 'data_governance',
      action: 'GOVERNANCE_EXCEPTION_REVIEWED',
      severity: reviewStatus === 'approved_demo' ? 'info' : 'warning',
      actor: {
        id: 'usr_super_01',
        name: actorName,
        email: 'alexander.s@saas-platform.internal',
        role: 'super_admin',
        actorType: 'super_admin',
      },
      targetEntity: 'GovernanceExceptionRecord',
      targetId: id,
      targetName: updated.title,
      status: 'succeeded',
      details: `Reviewed governance exception ${updated.code}. Status: ${reviewStatus}. Resolution: ${updated.resolutionSummary}`,
      metadata: { reviewStatus, resolutionSummary },
    });

    this.persist();
    this.notify();
    return { success: true, exception: updated };
  }

  public getTenantGovernanceSummaries(): TenantGovernanceSummary[] {
    return computeTenantGovernanceSummaries(
      this.organizations,
      this.dataCategories,
      this.governanceRetentionPolicies,
      this.privacyRequests,
      this.governanceExceptions
    );
  }

  public getGovernanceMetrics(): GovernanceMetricsSummary {
    const tenantSummaries = this.getTenantGovernanceSummaries();
    return computeGovernanceMetrics(
      this.dataCategories,
      this.governanceRetentionPolicies,
      this.privacyRequests,
      this.lifecycleRules,
      this.governanceExceptions,
      tenantSummaries
    );
  }

  public getGovernanceAuditLogs(filters?: {
    query?: string;
    action?: string;
    severity?: string;
  }): GovernanceAuditRecord[] {
    // Extract auditEvents with category === 'data_governance'
    const auditLogs: GovernanceAuditRecord[] = this.auditEvents
      .filter((e) => e.category === 'data_governance')
      .map((e) => ({
        id: e.id,
        timestamp: e.timestamp,
        category: 'data_governance',
        action: e.action,
        severity: e.severity,
        actor: {
          id: e.actor.id,
          name: e.actor.name,
          email: e.actor.email,
          role: e.actor.role,
        },
        targetEntity: e.targetEntity,
        targetId: e.targetId,
        targetName: e.targetName,
        status: e.status === 'succeeded' ? 'succeeded' : 'failed',
        details: e.details,
        metadata: e.metadata,
        isDemoFixture: true,
      }));

    let filtered = [...auditLogs];

    if (filters?.query?.trim()) {
      const q = filters.query.toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.action.toLowerCase().includes(q) ||
          (a.targetName && a.targetName.toLowerCase().includes(q)) ||
          a.actor.name.toLowerCase().includes(q) ||
          a.details.toLowerCase().includes(q)
      );
    }

    if (filters?.action && filters.action !== 'all') {
      filtered = filtered.filter((a) => a.action === filters.action);
    }

    if (filters?.severity && filters.severity !== 'all') {
      filtered = filtered.filter((a) => a.severity === filters.severity);
    }

    return filtered;
  }
}

// Global Singleton Instance
export const platformStore = new PlatformStore();
