'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { platformStore, PlatformMetrics } from '@/lib/data/platform-store';
import { useOptionalPlatformAuth } from './PlatformAuthContext';
import { hasAnyPlatformPermission, hasPlatformPermission } from '@/lib/iam/rbac';
import { isPlatformDevControlsEnabled } from '@/lib/auth/platformAuthConfig';
import type {
  PlatformApprovalRequest,
  PlatformApprovalType,
  PlatformNotice,
  OperationalExceptionRecord,
  OperationalExceptionStatus,
} from '@/lib/operations/canonical-operations';
import type {
  OperationalQueueId,
  OperationalQueueItem,
  PlatformOperationalOverviewMetrics,
} from '@/lib/operations/queues';
import {
  Organization,
  SubscriptionPlan,
  OrganizationSubscription,
  Invoice,
  PaymentRecord,
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
  PlatformUserStatus,
  PlatformRole,
  PlatformPermission,
  CreateCustomRoleInput,
  PaymentMethodType,
  Campus,
  CreateCampusInput,
  UpdateCampusInput,
  CampusStatus,
  ProvisioningStatus,
  SubscriptionStatus,
  SecurityEvent,
  SecurityTriageStatus,
  ComplianceControl,
  GovernanceEvidence,
  DataRetentionPolicy,
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
  CommunicationTemplate,
  TemplateVersionEntry,
  NotificationPolicy,
  ProviderRecord,
  NotificationRecord,
  CampaignDraft,
  TenantCommunicationConfig,
  NotificationPreferenceGovernance,
  TemplateStatus,
  CommunicationExportPackage,
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
  IntegrationRecord,
  ApiClientRecord,
  WebhookEndpointRecord,
  WebhookDeliveryRecord,
  IntegrationHealthIndicator,
  IntegrationMetricsSummary,
  CreateIntegrationInput,
  UpdateIntegrationInput,
  CreateApiClientInput,
  UpdateApiClientInput,
  CreateWebhookEndpointInput,
  UpdateWebhookEndpointInput,
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
} from '@/lib/types';
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
} from '@/lib/system-health/types';
import {
  DiscountPolicy,
  SubscriptionLifecycleEvent,
  CreatePlanInput,
  UpdatePlanInput,
  CreateDiscountInput,
  MonetizationAnalyticsSummary,
} from '@/lib/monetization/types';
import { OrganizationReadinessReport } from '@/lib/readiness/evaluator';
import { SimulatedProvisioningEvent } from '@/lib/provisioning/simulator';

import {
  TenantModuleDefinition,
  OrganizationModuleOverride,
  OrganizationOverrideAction,
  EffectiveEntitlementResult,
  RegistryValidationReport,
} from '@/lib/modules/types';
import { ModuleRegistryMetrics } from '@/lib/data/platform-store';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface PlatformStoreContextType {
  metrics: PlatformMetrics;
  moduleMetrics: ModuleRegistryMetrics;
  organizations: Organization[];
  plans: SubscriptionPlan[];
  subscriptions: OrganizationSubscription[];
  invoices: Invoice[];
  payments: PaymentRecord[];
  platformUsers: PlatformUser[];
  auditEvents: AuditEvent[];
  securityEvents: SecurityEvent[];
  complianceControls: ComplianceControl[];
  governanceEvidence: GovernanceEvidence[];
  retentionPolicies: DataRetentionPolicy[];
  operationalComponents: OperationalComponent[];
  platformIncidents: PlatformIncident[];
  maintenanceWindows: MaintenanceWindow[];
  deploymentRecords: DeploymentRecord[];
  backgroundJobs: BackgroundJobStatus[];
  externalIntegrations: ExternalIntegrationRecord[];
  capacityObservations: ResourceCapacityObservation[];
  backupRecords: BackupReadinessRecord[];
  alertRules: AlertRule[];
  systemServices: PlatformServiceHealth[];
  incidents: PlatformIncidentNotice[];
  features: PlatformFeatureItem[];
  settings: PlatformSettings;
  modules: TenantModuleDefinition[];
  organizationModuleOverrides: OrganizationModuleOverride[];
  campuses: Campus[];
  discounts: DiscountPolicy[];
  subscriptionEvents: SubscriptionLifecycleEvent[];
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  getOrganizationById: (id: string) => Organization | undefined;
  getSubscriptionById: (id: string) => OrganizationSubscription | undefined;
  getSubscriptionByOrgId: (orgId: string) => OrganizationSubscription | undefined;
  getInvoicesByOrgId: (orgId: string) => Invoice[];
  getInvoiceById: (id: string) => Invoice | undefined;
  getPaymentsByOrgId: (orgId: string) => PaymentRecord[];
  getPaymentsByInvoiceId: (invoiceId: string) => PaymentRecord[];
  getPaymentById: (id: string) => PaymentRecord | undefined;
  getDiscounts: () => DiscountPolicy[];
  getDiscountByCode: (code: string) => DiscountPolicy | undefined;
  getSubscriptionEvents: (subId?: string) => SubscriptionLifecycleEvent[];
  getMonetizationAnalytics: (refDate?: string) => MonetizationAnalyticsSummary;
  getAuditEvents: (filter?: AuditLogFilter) => AuditEvent[];
  getCampuses: () => Campus[];
  getCampusesByOrgId: (orgId: string) => Campus[];
  getCampusById: (id: string) => Campus | undefined;
  getSimulatedEvents: (orgId?: string) => SimulatedProvisioningEvent[];
  createOrganization: (input: CreateOrganizationInput) => { success: boolean; organization?: Organization; error?: string };
  updateOrganization: (id: string, input: UpdateOrganizationInput) => { success: boolean; organization?: Organization; error?: string };
  setOrganizationStatus: (
    id: string,
    status: OrganizationLifecycleStatus,
    reason?: string,
    options?: { confirmationCode?: string; cancellationEffectiveAt?: string }
  ) => { success: boolean; error?: string };
  updateOrganizationPlan: (id: string, planId: string, billingCycle?: 'monthly' | 'quarterly' | 'annual') => { success: boolean; error?: string };
  createPlan: (input: CreatePlanInput) => { success: boolean; plan?: SubscriptionPlan; error?: string };
  updatePlan: (id: string, input: UpdatePlanInput) => { success: boolean; plan?: SubscriptionPlan; error?: string };
  transitionSubscriptionStatus: (subId: string, status: SubscriptionStatus, reason: string) => { success: boolean; subscription?: OrganizationSubscription; error?: string };
  voidInvoice: (invoiceId: string, reason: string) => { success: boolean; invoice?: Invoice; error?: string };
  retryPayment: (paymentId: string) => { success: boolean; payment?: PaymentRecord; invoice?: Invoice; error?: string };
  createDiscount: (input: CreateDiscountInput) => { success: boolean; discount?: DiscountPolicy; error?: string };
  toggleDiscount: (id: string) => { success: boolean; discount?: DiscountPolicy; error?: string };
  createCampus: (input: CreateCampusInput) => { success: boolean; campus?: Campus; error?: string };
  updateCampus: (id: string, input: UpdateCampusInput) => { success: boolean; campus?: Campus; error?: string };
  setMainCampus: (orgId: string, campusId: string) => { success: boolean; error?: string };
  setCampusStatus: (campusId: string, status: CampusStatus, reason?: string) => { success: boolean; error?: string };
  deleteCampus: (campusId: string) => { success: boolean; error?: string };
  evaluateOrganizationReadiness: (orgId: string) => OrganizationReadinessReport;
  runSimulatedProvisioning: (
    orgId: string,
    optionsOrForceFail?:
      | boolean
      | {
          forceFail?: boolean;
          forceFailStageKey?:
            | 'registration_accepted'
            | 'profile_prepared'
            | 'initial_campus_prepared'
            | 'institution_structure_configured'
            | 'subscription_assigned'
            | 'entitlements_prepared'
            | 'initial_administrator_configured'
            | 'ready_for_activation';
          markForManualReview?: boolean;
          attempt?: number;
        }
  ) => { success: boolean; status: ProvisioningStatus; error?: string };
  resetSimulatedProvisioning: (orgId: string) => { success: boolean };
  recordPayment: (input: { invoiceId: string; amount: number; method: PaymentMethodType; referenceNumber: string; notes?: string }) => { success: boolean; payment?: PaymentRecord; error?: string };
  createPlatformUser: (input: { name: string; email: string; role: PlatformRoleKey; assignedRoles?: string[]; department?: string; notes?: string }) => { success: boolean; user?: PlatformUser; error?: string };
  updatePlatformUserRole: (id: string, role: PlatformRoleKey) => { success: boolean; error?: string };
  updatePlatformUserStatus: (id: string, status: PlatformUserStatus) => { success: boolean; error?: string };
  assignRoleToUser: (userId: string, roleId: string) => { success: boolean; error?: string };
  removeRoleFromUser: (userId: string, roleId: string) => { success: boolean; error?: string };
  platformRoles: PlatformRole[];
  platformPermissions: PlatformPermission[];
  getPlatformRoleById: (id: string) => PlatformRole | undefined;
  createPlatformRole: (input: CreateCustomRoleInput) => { success: boolean; role?: PlatformRole; error?: string };
  updatePlatformRolePermissions: (roleId: string, permissions: string[]) => { success: boolean; error?: string };
  deletePlatformRole: (roleId: string) => { success: boolean; error?: string };
  toggleFeature: (id: string) => { success: boolean; error?: string };
  updateSettings: (settings: Partial<PlatformSettings>) => { success: boolean };
  resetToDefaults: () => void;
  getModules: () => TenantModuleDefinition[];
  getModuleById: (id: string) => TenantModuleDefinition | undefined;
  getTopLevelModules: () => TenantModuleDefinition[];
  getSubmodulesByParentId: (parentId: string) => TenantModuleDefinition[];
  getOrganizationModuleOverrides: (organizationId?: string) => OrganizationModuleOverride[];
  setOrganizationModuleOverride: (input: { organizationId: string; moduleId: string; action: OrganizationOverrideAction; reason: string; actorName?: string }) => { success: boolean; error?: string };
  resetOrganizationModuleOverride: (organizationId: string, moduleId: string, actorName?: string) => { success: boolean; error?: string };
  setModuleGlobalAvailability: (moduleId: string, isGloballyEnabled: boolean, actorName?: string) => { success: boolean; error?: string };
  setModuleAvailabilityStatus: (moduleId: string, status: 'available' | 'enabled' | 'disabled' | 'coming_soon' | 'deprecated' | 'unavailable', actorName?: string, reason?: string) => { success: boolean; error?: string };
  updateModuleMetadata: (moduleId: string, updates: Parameters<typeof platformStore.updateModuleMetadata>[1], actorName?: string) => { success: boolean; error?: string };
  updateFeatureDefinition: (featureId: string, updates: Partial<PlatformFeatureItem>, actorName?: string) => { success: boolean; error?: string };
  manageSubscriptionAddOn: (subscriptionId: string, action: 'grant' | 'revoke' | 'expire', addOn: { moduleId?: string; featureId?: string; name: string; expiryDate?: string }, actorName?: string) => { success: boolean; subscription?: OrganizationSubscription; error?: string };
  extendSubscriptionTrial: (subscriptionId: string, newTrialEndDate: string, reason: string, actorName?: string) => { success: boolean; subscription?: OrganizationSubscription; error?: string };
  evaluateEntitlement: (moduleId: string, organizationId?: string, planId?: string, asOfDate?: string) => EffectiveEntitlementResult;
  validateRegistry: () => RegistryValidationReport;
  logAuditEvent: (event: Omit<AuditEvent, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => AuditEvent;
  getSecurityEvents: (filters?: { searchQuery?: string; category?: string; severity?: string; triageStatus?: string }) => SecurityEvent[];
  updateSecurityEventTriage: (id: string, status: SecurityTriageStatus, notes?: string, reviewer?: string) => { success: boolean; error?: string };
  getComplianceControls: (filters?: { searchQuery?: string; domain?: string; implementationStatus?: string; evidenceStatus?: string }) => ComplianceControl[];
  updateComplianceControlRemediation: (id: string, notes: string, targetDate?: string, reviewer?: string) => { success: boolean; error?: string };
  getGovernanceEvidence: (filters?: { searchQuery?: string; evidenceType?: string; reviewStatus?: string; controlId?: string }) => GovernanceEvidence[];
  updateGovernanceEvidenceStatus: (id: string, status: 'verified' | 'pending_inspection' | 'unavailable', notes?: string, reviewer?: string) => { success: boolean; error?: string };
  getRetentionPolicies: (filters?: { searchQuery?: string; dataCategory?: string; enabledOnly?: boolean }) => DataRetentionPolicy[];
  updateRetentionPolicy: (id: string, newDays: number, reason: string, isEnabled?: boolean, actorName?: string) => { success: boolean; error?: string };
  acknowledgeIncident: (incidentId: string, actorName?: string) => { success: boolean; error?: string };
  transitionIncidentStatus: (incidentId: string, newStatus: IncidentLifecycleStatus, context?: { resolutionNotes?: string; rootCause?: string; reopenReason?: string }, actorName?: string) => { success: boolean; error?: string };
  addIncidentNote: (incidentId: string, message: string, author?: string) => { success: boolean; error?: string };
  createMaintenanceWindow: (input: CreateMaintenanceInput, actorName?: string) => { success: boolean; maintenanceWindow?: MaintenanceWindow; error?: string };
  updateMaintenanceWindow: (id: string, input: Partial<CreateMaintenanceInput>, actorName?: string) => { success: boolean; maintenanceWindow?: MaintenanceWindow; error?: string };
  cancelMaintenanceWindow: (id: string, reason: string, actorName?: string) => { success: boolean; error?: string };
  createAlertRule: (input: CreateAlertRuleInput, actorName?: string) => { success: boolean; alertRule?: AlertRule; error?: string };
  updateAlertRule: (id: string, input: Partial<CreateAlertRuleInput>, actorName?: string) => { success: boolean; alertRule?: AlertRule; error?: string };
  toggleAlertRule: (id: string, actorName?: string) => { success: boolean; alertRule?: AlertRule; error?: string };
  deleteAlertRule: (id: string, actorName?: string) => { success: boolean; error?: string };
  extendedSettings: ExtendedPlatformSettings;
  featureFlags: FeatureFlag[];
  tenantOverrides: TenantFeatureOverride[];
  environments: PlatformEnvironmentConfig[];
  changeProposals: ConfigurationChangeProposal[];
  configVersions: ConfigVersionEntry[];
  updateExtendedSettings: (input: Partial<ExtendedPlatformSettings>, reason?: string, actorName?: string) => { success: boolean; error?: string };
  getFeatureFlagByKey: (key: string) => FeatureFlag | undefined;
  createFeatureFlag: (input: Partial<FeatureFlag>, actorName?: string) => { success: boolean; flag?: FeatureFlag; error?: string };
  updateFeatureFlag: (key: string, input: Partial<FeatureFlag>, reason?: string, actorName?: string) => { success: boolean; flag?: FeatureFlag; error?: string };
  transitionFeatureFlagLifecycle: (key: string, targetLifecycle: FeatureFlagLifecycle, reason: string, actorName?: string) => { success: boolean; flag?: FeatureFlag; error?: string };
  toggleFeatureFlag: (key: string, actorName?: string) => { success: boolean; flag?: FeatureFlag; error?: string };
  deleteFeatureFlag: (key: string, actorName?: string) => { success: boolean; error?: string };
  getTenantOverrides: (organizationId?: string) => TenantFeatureOverride[];
  setTenantFeatureOverride: (input: { organizationId: string; flagKey: string; overrideValue: boolean; reason: string; actorName?: string }) => { success: boolean; override?: TenantFeatureOverride; error?: string };
  removeTenantFeatureOverride: (organizationId: string, flagKey: string, reason?: string, actorName?: string) => { success: boolean; error?: string };
  evaluateEffectiveFlag: (flagKey: string, organizationId?: string, environment?: string) => EffectiveConfigurationResult;
  applyRolloutPlan: (input: RolloutPlanInput, actorName?: string) => { success: boolean; summary?: RolloutPreviewSummary; error?: string };
  createChangeProposal: (input: Partial<ConfigurationChangeProposal>) => { success: boolean; proposal?: ConfigurationChangeProposal; error?: string };
  transitionProposalStatus: (proposalId: string, targetStatus: ProposalStatus, reviewerNotes?: string, actorName?: string) => { success: boolean; proposal?: ConfigurationChangeProposal; error?: string };
  restoreConfigVersion: (versionId: string, actorName?: string) => { success: boolean; error?: string };
  exportConfiguration: (scope?: 'all' | 'settings_only' | 'flags_only' | 'overrides_only') => ConfigExportPackage;
  importConfiguration: (pkg: ConfigExportPackage | string, actorName?: string) => { success: boolean; result: ConfigImportValidationResult; error?: string };
  communicationTemplates: CommunicationTemplate[];
  notificationPolicies: NotificationPolicy[];
  communicationProviders: ProviderRecord[];
  notificationRecords: NotificationRecord[];
  campaignDrafts: CampaignDraft[];
  tenantCommunicationConfigs: TenantCommunicationConfig[];
  notificationPreferenceGovernance: NotificationPreferenceGovernance;
  getCommunicationTemplates: (filters?: { searchQuery?: string; category?: string; channel?: string; status?: string; locale?: string }) => CommunicationTemplate[];
  getCommunicationTemplateById: (id: string) => CommunicationTemplate | undefined;
  createCommunicationTemplate: (input: Omit<CommunicationTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isDemoFixture'>, actorName?: string) => { success: boolean; template?: CommunicationTemplate; error?: string };
  updateCommunicationTemplate: (id: string, updates: Partial<CommunicationTemplate>, changeSummary?: string, actorName?: string) => { success: boolean; template?: CommunicationTemplate; error?: string };
  transitionTemplateStatus: (id: string, newStatus: TemplateStatus, reviewNotes?: string, actorName?: string) => { success: boolean; template?: CommunicationTemplate; error?: string };
  duplicateCommunicationTemplate: (sourceId: string, newKey: string, newName: string, actorName?: string) => { success: boolean; template?: CommunicationTemplate; error?: string };
  archiveCommunicationTemplate: (id: string, actorName?: string) => { success: boolean; template?: CommunicationTemplate; error?: string };
  restoreCommunicationTemplate: (id: string, actorName?: string) => { success: boolean; template?: CommunicationTemplate; error?: string };
  getTemplateVersionHistory: (templateId: string) => TemplateVersionEntry[];
  restoreTemplateVersion: (versionId: string, actorName?: string) => { success: boolean; template?: CommunicationTemplate; error?: string };
  getNotificationPolicies: (filters?: { category?: string; channel?: string; scope?: string }) => NotificationPolicy[];
  getNotificationPolicyById: (id: string) => NotificationPolicy | undefined;
  createNotificationPolicy: (input: Omit<NotificationPolicy, 'id' | 'version' | 'updatedAt'>, actorName?: string) => { success: boolean; policy?: NotificationPolicy; error?: string };
  updateNotificationPolicy: (id: string, updates: Partial<NotificationPolicy>, actorName?: string) => { success: boolean; policy?: NotificationPolicy; error?: string };
  toggleNotificationPolicy: (id: string, enabled: boolean, actorName?: string) => { success: boolean; policy?: NotificationPolicy; error?: string };
  getCommunicationProviders: () => ProviderRecord[];
  simulateProviderHealthCheck: (providerId: string, actorName?: string) => { success: boolean; latencyMs: number; simulatedOutput: string; checkedAt: string };
  getNotificationRecords: (filters?: { searchQuery?: string; channel?: string; status?: string; category?: string; tenantId?: string; failureClassification?: string }) => NotificationRecord[];
  simulateTestNotification: (templateId: string, testRecipient: string, customVariables?: Record<string, string>, actorName?: string) => { success: boolean; record?: NotificationRecord; error?: string };
  simulateNotificationRetry: (notificationId: string, actorName?: string) => { success: boolean; message: string; record?: NotificationRecord };
  addNotificationReviewNote: (notificationId: string, reviewNote: string, actorName?: string) => { success: boolean; record?: NotificationRecord; error?: string };
  getCampaignDrafts: () => CampaignDraft[];
  createCampaignDraft: (input: Omit<CampaignDraft, 'id' | 'createdAt' | 'updatedAt' | 'estimatedAudience'>, actorName?: string) => { success: boolean; campaign?: CampaignDraft; error?: string };
  updateCampaignDraft: (id: string, updates: Partial<CampaignDraft>, actorName?: string) => { success: boolean; campaign?: CampaignDraft; error?: string };
  transitionCampaignStatus: (id: string, status: 'draft' | 'pending_approval' | 'approved' | 'cancelled', actorName?: string) => { success: boolean; campaign?: CampaignDraft; error?: string };
  getTenantCommunicationConfigs: () => TenantCommunicationConfig[];
  updateTenantCommunicationConfig: (tenantId: string, updates: Partial<TenantCommunicationConfig>, actorName?: string) => { success: boolean; config?: TenantCommunicationConfig; error?: string };
  getNotificationPreferenceGovernance: () => NotificationPreferenceGovernance;
  exportCommunicationGovernancePackage: (actorName?: string) => CommunicationExportPackage;
  supportTickets: SupportTicket[];
  supportTeams: SupportTeamQueue[];
  slaPolicies: SlaPolicy[];
  kbArticles: KnowledgeBaseArticle[];
  csatRecords: CustomerSatisfactionRecord[];
  csTasks: CustomerSuccessTask[];
  getSupportTickets: (filters?: {
    searchQuery?: string;
    organizationId?: string;
    status?: SupportTicketStatus;
    priority?: SupportTicketPriority;
    category?: SupportCategoryKey;
    assignedOperatorId?: string;
    assignedTeamId?: string;
    slaState?: SlaState;
    isEscalated?: boolean;
  }) => SupportTicket[];
  getSupportTicketById: (id: string) => SupportTicket | undefined;
  createSupportTicket: (input: CreateSupportTicketInput, actorName?: string) => { success: boolean; ticket?: SupportTicket; error?: string };
  updateSupportTicket: (id: string, updates: UpdateSupportTicketInput, actorName?: string) => { success: boolean; ticket?: SupportTicket; error?: string };
  transitionSupportTicketStatus: (id: string, status: SupportTicketStatus, reason?: string, actorName?: string) => { success: boolean; ticket?: SupportTicket; error?: string };
  assignSupportTicket: (id: string, operatorId?: string | null, teamId?: string | null, reason?: string, actorName?: string) => { success: boolean; ticket?: SupportTicket; error?: string };
  escalateSupportTicket: (id: string, reason: string, targetTeamId: string, urgencyLevel?: 'standard' | 'high' | 'critical', targetTier?: 'tier_2_specialist' | 'tier_3_engineering' | 'executive_management', actorName?: string) => { success: boolean; ticket?: SupportTicket; error?: string };
  deescalateSupportTicket: (id: string, notes?: string, actorName?: string) => { success: boolean; ticket?: SupportTicket; error?: string };
  addSupportTicketMessage: (ticketId: string, type: 'internal_note' | 'tenant_reply', content: string, isDraft?: boolean, actorName?: string) => { success: boolean; ticket?: SupportTicket; error?: string };
  getSupportTeams: () => SupportTeamQueue[];
  getSlaPolicies: () => SlaPolicy[];
  getSlaPolicyById: (id: string) => SlaPolicy | undefined;
  createSlaPolicy: (input: CreateSlaPolicyInput, actorName?: string) => { success: boolean; policy?: SlaPolicy; error?: string };
  updateSlaPolicy: (id: string, updates: Partial<SlaPolicy>, actorName?: string) => { success: boolean; policy?: SlaPolicy; error?: string };
  toggleSlaPolicy: (id: string, isEnabled: boolean, actorName?: string) => { success: boolean; policy?: SlaPolicy; error?: string };
  getKbArticles: (filters?: { searchQuery?: string; category?: SupportCategoryKey; status?: 'draft' | 'published' | 'archived' }) => KnowledgeBaseArticle[];
  getKbArticleById: (id: string) => KnowledgeBaseArticle | undefined;
  createKbArticle: (input: CreateKbArticleInput, actorName?: string) => { success: boolean; article?: KnowledgeBaseArticle; error?: string };
  updateKbArticle: (id: string, updates: Partial<KnowledgeBaseArticle>, actorName?: string) => { success: boolean; article?: KnowledgeBaseArticle; error?: string };
  setKbArticleStatus: (id: string, status: 'draft' | 'published' | 'archived', actorName?: string) => { success: boolean; article?: KnowledgeBaseArticle; error?: string };
  deleteKbArticle: (id: string, actorName?: string) => { success: boolean; error?: string };
  getCsatRecords: (filters?: { organizationId?: string; category?: SupportCategoryKey; minRating?: number }) => CustomerSatisfactionRecord[];
  submitCustomerFeedback: (input: SubmitCustomerFeedbackInput, actorName?: string) => { success: boolean; record?: CustomerSatisfactionRecord; error?: string };
  reviewCsatRecord: (id: string, notes?: string, actorName?: string) => { success: boolean; record?: CustomerSatisfactionRecord; error?: string };
  getCsTasks: (filters?: { organizationId?: string; status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'; assignedOwnerId?: string; isOverdue?: boolean; refDate?: string }) => CustomerSuccessTask[];
  createCsTask: (input: CreateCsTaskInput, actorName?: string) => { success: boolean; task?: CustomerSuccessTask; error?: string };
  updateCsTask: (id: string, updates: Partial<CustomerSuccessTask>, actorName?: string) => { success: boolean; task?: CustomerSuccessTask; error?: string };
  setCsTaskStatus: (id: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled', notes?: string, actorName?: string) => { success: boolean; task?: CustomerSuccessTask; error?: string };
  deleteCsTask: (id: string, actorName?: string) => { success: boolean; error?: string };
  getSupportMetrics: (refDate?: string) => SupportMetricsSummary;
  getCustomerSuccessSummaries: (refDate?: string) => CustomerSuccessAccountSummary[];
  integrations: IntegrationRecord[];
  apiClients: ApiClientRecord[];
  webhookEndpoints: WebhookEndpointRecord[];
  webhookDeliveries: WebhookDeliveryRecord[];
  getIntegrations: (filters?: { query?: string; category?: string; status?: string; enabled?: string }) => IntegrationRecord[];
  getIntegrationById: (id: string) => IntegrationRecord | undefined;
  getApiClients: (filters?: { query?: string; clientType?: string; status?: string }) => ApiClientRecord[];
  getApiClientById: (id: string) => ApiClientRecord | undefined;
  getWebhookEndpoints: (filters?: { query?: string; enabled?: string }) => WebhookEndpointRecord[];
  getWebhookEndpointById: (id: string) => WebhookEndpointRecord | undefined;
  getWebhookDeliveries: (filters?: { query?: string; endpointId?: string; eventType?: string; outcome?: string }) => WebhookDeliveryRecord[];
  getWebhookDeliveryById: (id: string) => WebhookDeliveryRecord | undefined;
  getIntegrationMetrics: () => IntegrationMetricsSummary;
  getIntegrationHealthIndicators: () => IntegrationHealthIndicator[];
  updateIntegrationConfig: (id: string, updates: UpdateIntegrationInput, actorName?: string) => { success: boolean; integration?: IntegrationRecord; error?: string };
  toggleIntegration: (id: string, actorName?: string) => { success: boolean; integration?: IntegrationRecord; error?: string };
  simulateVerifyIntegration: (id: string, actorName?: string) => { success: boolean; verificationStatus: 'verified_demo' | 'failed'; message: string; integration?: IntegrationRecord };
  createApiClient: (input: CreateApiClientInput, actorName?: string) => { success: boolean; client?: ApiClientRecord; error?: string; warnings?: string[] };
  updateApiClient: (id: string, updates: UpdateApiClientInput, actorName?: string) => { success: boolean; client?: ApiClientRecord; error?: string };
  revokeApiClient: (id: string, reason: string, actorName?: string) => { success: boolean; client?: ApiClientRecord; error?: string };
  createWebhookEndpoint: (input: CreateWebhookEndpointInput, actorName?: string) => { success: boolean; endpoint?: WebhookEndpointRecord; error?: string };
  updateWebhookEndpoint: (id: string, updates: UpdateWebhookEndpointInput, actorName?: string) => { success: boolean; endpoint?: WebhookEndpointRecord; error?: string };
  toggleWebhookEndpoint: (id: string, actorName?: string) => { success: boolean; endpoint?: WebhookEndpointRecord; error?: string };
  simulateTestWebhookDelivery: (endpointId: string, eventTypeId: string, simulateSuccess?: boolean, actorName?: string) => { success: boolean; delivery?: WebhookDeliveryRecord; error?: string };
  simulateRetryWebhookDelivery: (deliveryId: string, simulateSuccess?: boolean, actorName?: string) => { success: boolean; delivery?: WebhookDeliveryRecord; error?: string };
  dataCategories: DataCategoryRecord[];
  governanceRetentionPolicies: GovernanceRetentionPolicy[];
  privacyRequests: PrivacyRequestRecord[];
  lifecycleRules: DataLifecycleRuleRecord[];
  governanceExceptions: GovernanceExceptionRecord[];
  governanceAuditLogs: GovernanceAuditRecord[];
  getDataCategories: (filters?: { query?: string; classification?: string; subjectType?: string; module?: string; retentionCoverage?: string }) => DataCategoryRecord[];
  getDataCategoryById: (id: string) => DataCategoryRecord | undefined;
  updateDataCategory: (id: string, updates: UpdateDataCategoryInput, actorName?: string) => { success: boolean; category?: DataCategoryRecord; error?: string };
  getGovernanceRetentionPolicies: (filters?: { query?: string; status?: string; trigger?: string; reviewDueOnly?: boolean }) => GovernanceRetentionPolicy[];
  getGovernanceRetentionPolicyById: (id: string) => GovernanceRetentionPolicy | undefined;
  createGovernanceRetentionPolicy: (input: CreateRetentionPolicyInput, actorName?: string) => { success: boolean; policy?: GovernanceRetentionPolicy; error?: string };
  updateGovernanceRetentionPolicy: (id: string, updates: UpdateRetentionPolicyInput, actorName?: string) => { success: boolean; policy?: GovernanceRetentionPolicy; error?: string };
  reviewGovernanceRetentionPolicy: (id: string, reviewOutcome: PolicyApprovalStatus, nextReviewDueAt: string, actorName?: string) => { success: boolean; policy?: GovernanceRetentionPolicy; error?: string };
  getPrivacyRequests: (filters?: { query?: string; category?: string; status?: string; tenantId?: string; priority?: string; dueStatus?: string }) => PrivacyRequestRecord[];
  getPrivacyRequestById: (id: string) => PrivacyRequestRecord | undefined;
  createPrivacyRequest: (input: CreatePrivacyRequestInput, actorName?: string) => { success: boolean; request?: PrivacyRequestRecord; error?: string };
  updatePrivacyRequestStatus: (id: string, targetStatus: PrivacyWorkflowStatus, reviewNotes: string, resolutionCategory?: PrivacyResolutionCategory, actorName?: string) => { success: boolean; request?: PrivacyRequestRecord; error?: string };
  simulatePrivacyRequestProcessing: (id: string, actorName?: string) => { success: boolean; request?: PrivacyRequestRecord; error?: string };
  getDataLifecycleRules: (filters?: { query?: string; categoryId?: string; status?: string; stage?: string }) => DataLifecycleRuleRecord[];
  getDataLifecycleRuleById: (id: string) => DataLifecycleRuleRecord | undefined;
  createDataLifecycleRule: (input: CreateLifecycleRuleInput, actorName?: string) => { success: boolean; rule?: DataLifecycleRuleRecord; error?: string };
  updateDataLifecycleRule: (id: string, updates: Partial<CreateLifecycleRuleInput>, actorName?: string) => { success: boolean; rule?: DataLifecycleRuleRecord; error?: string };
  toggleDataLifecycleRule: (id: string, actorName?: string) => { success: boolean; rule?: DataLifecycleRuleRecord; error?: string };
  getGovernanceExceptions: (filters?: { query?: string; status?: string; reason?: string; tenantId?: string }) => GovernanceExceptionRecord[];
  getGovernanceExceptionById: (id: string) => GovernanceExceptionRecord | undefined;
  createGovernanceException: (input: CreateGovernanceExceptionInput, actorName?: string) => { success: boolean; exception?: GovernanceExceptionRecord; error?: string };
  reviewGovernanceException: (id: string, reviewStatus: ExceptionReviewStatus, resolutionSummary: string, actorName?: string) => { success: boolean; exception?: GovernanceExceptionRecord; error?: string };
  getTenantGovernanceSummaries: () => TenantGovernanceSummary[];
  getGovernanceMetrics: () => GovernanceMetricsSummary;
  getGovernanceAuditLogs: (filters?: { query?: string; action?: string; severity?: string }) => GovernanceAuditRecord[];

  // P0-6: Operations Center, Approvals, Notices & Exceptions
  operationalOverview: PlatformOperationalOverviewMetrics;
  operationalQueues: Record<OperationalQueueId, OperationalQueueItem[]>;
  platformApprovals: PlatformApprovalRequest[];
  platformNotices: PlatformNotice[];
  operationalExceptions: OperationalExceptionRecord[];
  createApprovalRequest: (input: {
    type: PlatformApprovalType;
    title: string;
    description: string;
    organizationId?: string;
    campusId?: string;
    linkedTicketId?: string;
    linkedTaskId?: string;
    linkedExceptionId?: string;
    targetEntityType: string;
    targetEntityId: string;
    requestedActionLabel: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    dueAt?: string;
  }) => { success: boolean; approval?: PlatformApprovalRequest; error?: string };
  reviewApprovalRequest: (
    approvalId: string,
    decision: 'approved' | 'rejected' | 'cancelled',
    notes?: string
  ) => { success: boolean; approval?: PlatformApprovalRequest; error?: string };
  createPlatformNotice: (input: {
    title: string;
    summary: string;
    body: string;
    category: PlatformNotice['category'];
    severity: PlatformNotice['severity'];
    audience: PlatformNotice['audience'];
    targetOrganizationIds?: string[];
    targetPlanIds?: string[];
    targetCampusIds?: string[];
    channelSimulations?: PlatformNotice['channelSimulations'];
    requiresApproval?: boolean;
    scheduledFor?: string;
    expiresAt?: string;
  }) => { success: boolean; notice?: PlatformNotice; error?: string };
  transitionPlatformNoticeStatus: (
    noticeId: string,
    nextStatus: PlatformNotice['status']
  ) => { success: boolean; notice?: PlatformNotice; error?: string };
  triageOperationalException: (
    exceptionId: string,
    nextStatus: OperationalExceptionStatus,
    options?: { notes?: string; assignedOperatorId?: string; escalatedTo?: string }
  ) => { success: boolean; exception?: OperationalExceptionRecord; error?: string };
}

const PlatformStoreContext = createContext<PlatformStoreContextType | undefined>(undefined);



let toastCounter = 0;

export function PlatformStoreProvider({ children }: { children: React.ReactNode }) {
  // Subscribe to changes in platformStore
  const [, setVersion] = useState(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const authCtx = useOptionalPlatformAuth();
  const actorUser = authCtx?.user;
  const actorPerms = authCtx?.permissions || [];

  useEffect(() => {
    const unsubscribe = platformStore.subscribe(() => {
      setVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  const toastTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    const timers = toastTimersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    toastCounter += 1;
    const id = `toast_${toastCounter}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    const timer = setTimeout(() => {
      toastTimersRef.current.delete(timer);
      removeToast(id);
    }, 4500);
    toastTimersRef.current.add(timer);
  }, [removeToast]);

  const guardPerm = useCallback(
    (requiredPermission: string, actionLabel: string, anyPerms?: string[]) => {
      if (!authCtx || !actorUser) {
        addToast({
          type: 'error',
          title: 'Authentication Required',
          message: `You must sign in to ${actionLabel}.`,
        });
        return `Unauthenticated: Cannot ${actionLabel}.`;
      }
      const allowed = anyPerms
        ? hasAnyPlatformPermission(actorPerms, anyPerms)
        : hasPlatformPermission(actorPerms, requiredPermission);
      if (!allowed) {
        addToast({
          type: 'error',
          title: 'Authorization Required',
          message: `Missing permission '${requiredPermission}' to ${actionLabel}.`,
        });
        return `Forbidden: Missing required permission '${requiredPermission}' to ${actionLabel}.`;
      }
      return null;
    },
    [authCtx, actorUser, actorPerms, addToast]
  );

  const actorProfile = actorUser
    ? {
        id: actorUser.id,
        name: actorUser.name,
        email: actorUser.email,
        role: actorUser.role,
      }
    : undefined;

  const getActorMetadata = () =>
    actorUser
      ? {
          id: actorUser.id,
          name: actorUser.name,
          email: actorUser.email,
          role: actorUser.role,
        }
      : undefined;

  const authenticatedActorName = (fallback?: string) => actorProfile?.name || fallback;
  const authenticatedActorIdentity = (fallback?: string) => actorProfile || fallback;

  const createOrganization = (input: CreateOrganizationInput) => {
    const err = guardPerm('organizations.create', 'create an organization');
    if (err) return { success: false, error: err };
    const res = platformStore.createOrganization(input, getActorMetadata());
    if (res.success && res.organization) {
      addToast({
        type: 'success',
        title: 'Registration Staged',
        message: `Saved ${res.organization.name} (${res.organization.code}) in client-side simulation store.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: res.error,
      });
    }
    return res;
  };

  const updateOrganization = (id: string, input: UpdateOrganizationInput) => {
    const err = guardPerm('organizations.update', 'update organization details');
    if (err) return { success: false, error: err };
    const res = platformStore.updateOrganization(id, input, getActorMetadata());
    if (res.success && res.organization) {
      addToast({
        type: 'success',
        title: 'Organization Updated',
        message: `Profile updated for ${res.organization.name}.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: res.error,
      });
    }
    return res;
  };

  const setOrganizationStatus = (
    id: string,
    status: OrganizationLifecycleStatus,
    reason?: string,
    options?: { confirmationCode?: string; cancellationEffectiveAt?: string }
  ) => {
    const err = guardPerm('organizations.lifecycle.manage', 'change organization lifecycle status');
    if (err) return { success: false, error: err };
    const res = platformStore.setOrganizationStatus(id, status, reason, {
      ...options,
      actorPermissions: actorPerms,
      actor: getActorMetadata(),
    });
    if (res.success) {
      addToast({
        type: status === 'suspended' || status === 'cancelled' ? 'warning' : 'success',
        title: 'Lifecycle Status Changed',
        message: `Organization lifecycle status set to ${status}. Local mock state updated.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Status Update Failed',
        message: res.error,
      });
    }
    return res;
  };

  const updateOrganizationPlan = (id: string, planId: string, billingCycle?: 'monthly' | 'quarterly' | 'annual') => {
    const err = guardPerm('billing.subscriptions.manage', 'modify subscription plan');
    if (err) return { success: false, error: err };
    const res = platformStore.updateOrganizationPlan(id, planId, billingCycle);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Plan Updated',
        message: 'Subscription plan updated in development store.',
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Plan Update Failed',
        message: res.error,
      });
    }
    return res;
  };

  const recordPayment = (input: { invoiceId: string; amount: number; method: PaymentMethodType; referenceNumber: string; notes?: string }) => {
    const err = guardPerm('billing.payments.manage', 'record subscription payment');
    if (err) return { success: false, error: err };
    const res = platformStore.recordPayment(input);
    if (res.success && res.payment) {
      addToast({
        type: 'success',
        title: 'Payment Recorded (Demo)',
        message: `Settlement of $${res.payment.amount.toLocaleString()} ${res.payment.currency} recorded in development ledger. No live card charged.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Payment Rejected',
        message: res.error,
      });
    }
    return res;
  };

  const createPlatformUser = (input: { name: string; email: string; role: PlatformRoleKey; assignedRoles?: string[]; department?: string; notes?: string }) => {
    const err = guardPerm('iam.users.create', 'create platform administrator');
    if (err) return { success: false, error: err };
    const requestedRoles = [input.role, ...(input.assignedRoles || [])];
    const targetRoles = platformStore.getPlatformRoles();
    for (const roleId of requestedRoles) {
      const def = targetRoles.find((r) => r.id === roleId);
      if (def && !def.permissions.every((p) => actorPerms.includes(p))) {
        const msg = `Forbidden: Cannot grant role '${roleId}' holding permissions you do not possess.`;
        addToast({ type: 'error', title: 'Privilege Escalation Blocked', message: msg });
        return { success: false, error: msg };
      }
    }
    const res = platformStore.createPlatformUser(input);
    if (res.success && res.user) {
      addToast({
        type: 'success',
        title: 'Platform Administrator Added',
        message: `Created ${res.user.name} (${res.user.role}). Development record only.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'User Creation Failed',
        message: res.error,
      });
    }
    return res;
  };

  const updatePlatformUserRole = (id: string, role: PlatformRoleKey) => {
    const err = guardPerm('iam.users.roles.assign', 'reassign administrator role');
    if (err) return { success: false, error: err };
    if (actorUser && id === actorUser.id) {
      const msg = 'Forbidden: Administrators cannot modify their own role assignments.';
      addToast({ type: 'error', title: 'Self-Modification Blocked', message: msg });
      return { success: false, error: msg };
    }
    const targetRoleDef = platformStore.getPlatformRoles().find((r) => r.id === role);
    if (targetRoleDef && !targetRoleDef.permissions.every((p) => actorPerms.includes(p))) {
      const msg = `Forbidden: Cannot assign role '${role}' with unheld permissions.`;
      addToast({ type: 'error', title: 'Privilege Escalation Blocked', message: msg });
      return { success: false, error: msg };
    }
    const res = platformStore.updatePlatformUserRole(id, role);
    if (res.success) {
      addToast({
        type: 'info',
        title: 'Role Reassigned',
        message: `Platform role updated to ${role}.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Role Change Rejected',
        message: res.error,
      });
    }
    return res;
  };

  const updatePlatformUserStatus = (id: string, status: PlatformUserStatus) => {
    const err = guardPerm('iam.users.suspend', 'change administrator account status');
    if (err) return { success: false, error: err };
    if (actorUser && id === actorUser.id) {
      const msg = 'Forbidden: Administrators cannot change or suspend their own account status.';
      addToast({ type: 'error', title: 'Self-Modification Blocked', message: msg });
      return { success: false, error: msg };
    }
    const res = platformStore.updatePlatformUserStatus(id, status);
    if (res.success) {
      addToast({
        type: status === 'suspended' ? 'warning' : 'success',
        title: 'User Status Updated',
        message: `Platform user is now ${status}.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Status Update Rejected',
        message: res.error,
      });
    }
    return res;
  };

  const assignRoleToUser = (userId: string, roleId: string) => {
    const err = guardPerm('iam.users.roles.assign', 'assign additional role');
    if (err) return { success: false, error: err };
    if (actorUser && userId === actorUser.id) {
      const msg = 'Forbidden: Administrators cannot assign roles to themselves.';
      addToast({ type: 'error', title: 'Self-Modification Blocked', message: msg });
      return { success: false, error: msg };
    }
    const targetRoleDef = platformStore.getPlatformRoles().find((r) => r.id === roleId);
    if (targetRoleDef && !targetRoleDef.permissions.every((p) => actorPerms.includes(p))) {
      const msg = `Forbidden: Cannot assign role '${roleId}' holding permissions you do not possess.`;
      addToast({ type: 'error', title: 'Privilege Escalation Blocked', message: msg });
      return { success: false, error: msg };
    }
    const res = platformStore.assignRoleToUser(userId, roleId);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Role Assigned',
        message: `Granted role "${roleId}" to platform administrator.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Role Assignment Rejected',
        message: res.error,
      });
    }
    return res;
  };

  const removeRoleFromUser = (userId: string, roleId: string) => {
    const err = guardPerm('iam.users.roles.assign', 'revoke role from administrator');
    if (err) return { success: false, error: err };
    if (actorUser && userId === actorUser.id) {
      const msg = 'Forbidden: Administrators cannot modify their own roles.';
      addToast({ type: 'error', title: 'Self-Modification Blocked', message: msg });
      return { success: false, error: msg };
    }
    const res = platformStore.removeRoleFromUser(userId, roleId);
    if (res.success) {
      addToast({
        type: 'warning',
        title: 'Role Revoked',
        message: `Revoked role "${roleId}" from platform administrator.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Role Revocation Rejected',
        message: res.error,
      });
    }
    return res;
  };

  const createPlatformRole = (input: CreateCustomRoleInput) => {
    const err = guardPerm('iam.roles.create', 'create custom platform role');
    if (err) return { success: false, error: err };
    if (!input.permissions.every((p) => actorPerms.includes(p))) {
      const msg = 'Forbidden: Custom roles cannot include permissions the creator does not hold.';
      addToast({ type: 'error', title: 'Privilege Escalation Blocked', message: msg });
      return { success: false, error: msg };
    }
    const res = platformStore.createPlatformRole(input);
    if (res.success && res.role) {
      addToast({
        type: 'success',
        title: 'Custom Role Created',
        message: `Created role "${res.role.name}" with ${res.role.permissions.length} permissions.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Role Creation Failed',
        message: res.error,
      });
    }
    return res;
  };

  const updatePlatformRolePermissions = (roleId: string, permissions: string[]) => {
    const err = guardPerm('iam.roles.manage', 'edit platform role permissions');
    if (err) return { success: false, error: err };
    if (!permissions.every((p) => actorPerms.includes(p))) {
      const msg = 'Forbidden: Cannot grant role permissions you do not hold yourself.';
      addToast({ type: 'error', title: 'Privilege Escalation Blocked', message: msg });
      return { success: false, error: msg };
    }
    const res = platformStore.updatePlatformRolePermissions(roleId, permissions);
    if (res.success) {
      addToast({
        type: 'info',
        title: 'Role Permissions Saved',
        message: `Updated permissions for role (${permissions.length} granted).`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Permission Update Failed',
        message: res.error,
      });
    }
    return res;
  };

  const deletePlatformRole = (roleId: string) => {
    const err = guardPerm('iam.roles.manage', 'delete custom platform role');
    if (err) return { success: false, error: err };
    const res = platformStore.deletePlatformRole(roleId);
    if (res.success) {
      addToast({
        type: 'warning',
        title: 'Role Deleted',
        message: `Custom role "${roleId}" was removed from the catalogue.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Role Deletion Failed',
        message: res.error,
      });
    }
    return res;
  };

  const toggleFeature = (id: string) => {
    const err = guardPerm('system.features.toggle', 'toggle platform feature', ['system.features.toggle', 'modules.registry.manage']);
    if (err) return { success: false, error: err };
    const res = platformStore.toggleFeature(id);
    if (res.success) {
      addToast({
        type: 'info',
        title: 'Feature Availability Toggled',
        message: 'Updated mock feature catalogue status. Backend enforcement required in production.',
      });
    }
    return res;
  };

  const updateSettings = (settings: Partial<PlatformSettings>) => {
    const err = guardPerm('platform.settings.update', 'update platform settings');
    if (err) return { success: false, error: err };
    const res = platformStore.updateSettings(settings);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Global platform settings updated in local mock store.',
      });
    }
    return res;
  };

  const resetToDefaults = () => {
    if (!isPlatformDevControlsEnabled()) {
      addToast({
        type: 'error',
        title: 'Development Control Disabled',
        message: 'Fixture resets are disabled outside development mode.',
      });
      return;
    }
    const err = guardPerm('system.maintenance.manage', 'reset platform store fixtures', ['system.maintenance.manage', 'platform.settings.update']);
    if (err) return;
    platformStore.resetToDefaults();
    addToast({
      type: 'info',
      title: 'Store Reset',
      message: 'All development fixtures have been reset to factory defaults.',
    });
  };

  const setOrganizationModuleOverride = (input: {
    organizationId: string;
    moduleId: string;
    action: OrganizationOverrideAction;
    reason: string;
    actorName?: string;
  }) => {
    const err = guardPerm('modules.registry.manage', 'override organization module entitlement');
    if (err) return { success: false, error: err };
    const res = platformStore.setOrganizationModuleOverride({
      ...input,
      actorName: authenticatedActorName(input.actorName),
    });
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Entitlement Override Saved',
        message: `Override "${input.action}" applied in development store.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Override Failed',
        message: res.error,
      });
    }
    return res;
  };

  const resetOrganizationModuleOverride = (organizationId: string, moduleId: string, actorName?: string) => {
    const err = guardPerm('modules.registry.manage', 'reset organization module entitlement');
    if (err) return { success: false, error: err };
    const res = platformStore.resetOrganizationModuleOverride(organizationId, moduleId, authenticatedActorName(actorName));
    if (res.success) {
      addToast({
        type: 'info',
        title: 'Override Reset',
        message: 'Reverted module entitlement to plan default.',
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Reset Failed',
        message: res.error,
      });
    }
    return res;
  };

  const setModuleGlobalAvailability = (moduleId: string, isGloballyEnabled: boolean, actorName?: string) => {
    const err = guardPerm('modules.registry.manage', 'change module availability');
    if (err) return { success: false, error: err };
    const res = platformStore.setModuleGlobalAvailability(moduleId, isGloballyEnabled, authenticatedActorName(actorName));
    if (res.success) {
      addToast({
        type: isGloballyEnabled ? 'success' : 'warning',
        title: 'Platform Availability Updated',
        message: `Module global availability set to ${isGloballyEnabled ? 'enabled' : 'disabled'}.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: res.error,
      });
    }
    return res;
  };

  const setModuleAvailabilityStatus = (
    moduleId: string,
    status: 'available' | 'enabled' | 'disabled' | 'coming_soon' | 'deprecated' | 'unavailable',
    actorName?: string,
    reason?: string
  ) => {
    const err = guardPerm('modules.registry.manage', 'change module lifecycle status');
    if (err) return { success: false, error: err };
    const res = platformStore.setModuleAvailabilityStatus(moduleId, status, authenticatedActorName(actorName), reason);
    if (res.success) {
      addToast({
        type: status === 'enabled' || status === 'available' ? 'success' : 'warning',
        title: 'Module Status Updated',
        message: `Lifecycle status changed to ${status.replace('_', ' ')}.`,
      });
    } else if (res.error) {
      addToast({ type: 'error', title: 'Status Update Failed', message: res.error });
    }
    return res;
  };

  const updateModuleMetadata = (
    moduleId: string,
    updates: Parameters<typeof platformStore.updateModuleMetadata>[1],
    actorName?: string
  ) => {
    const err = guardPerm('modules.registry.manage', 'edit module configuration');
    if (err) return { success: false, error: err };
    const res = platformStore.updateModuleMetadata(moduleId, updates, authenticatedActorName(actorName));
    if (res.success) {
      addToast({ type: 'success', title: 'Module Configuration Saved', message: 'Updated canonical module metadata and plan rules.' });
    } else if (res.error) {
      addToast({ type: 'error', title: 'Module Update Failed', message: res.error });
    }
    return res;
  };

  const updateFeatureDefinition = (featureId: string, updates: Partial<PlatformFeatureItem>, actorName?: string) => {
    const err = guardPerm('modules.registry.manage', 'update feature catalog');
    if (err) return { success: false, error: err };
    const res = platformStore.updateFeatureDefinition(featureId, updates, authenticatedActorName(actorName));
    if (res.success) {
      addToast({ type: 'success', title: 'Feature Catalog Updated', message: 'Saved simulated feature configuration changes.' });
    } else if (res.error) {
      addToast({ type: 'error', title: 'Feature Update Failed', message: res.error });
    }
    return res;
  };

  const manageSubscriptionAddOn = (
    subscriptionId: string,
    action: 'grant' | 'revoke' | 'expire',
    addOn: { moduleId?: string; featureId?: string; name: string; expiryDate?: string },
    actorName?: string
  ) => {
    const err = guardPerm('billing.subscriptions.manage', 'manage subscription add-on');
    if (err) return { success: false, error: err };
    const res = platformStore.manageSubscriptionAddOn(subscriptionId, action, addOn, authenticatedActorName(actorName));
    if (res.success) {
      addToast({
        type: action === 'grant' ? 'success' : 'warning',
        title: `Add-On ${action === 'grant' ? 'Activated' : action === 'expire' ? 'Expired' : 'Revoked'}`,
        message: `${addOn.name} add-on updated on subscription.`,
      });
    } else if (res.error) {
      addToast({ type: 'error', title: 'Add-On Update Failed', message: res.error });
    }
    return res;
  };

  const extendSubscriptionTrial = (subscriptionId: string, newTrialEndDate: string, reason: string, actorName?: string) => {
    const err = guardPerm('billing.subscriptions.manage', 'adjust subscription trial');
    if (err) return { success: false, error: err };
    const res = platformStore.extendSubscriptionTrial(subscriptionId, newTrialEndDate, reason, authenticatedActorName(actorName));
    if (res.success) {
      addToast({ type: 'success', title: 'Trial Period Updated', message: `Trial window updated through ${newTrialEndDate.slice(0, 10)}.` });
    } else if (res.error) {
      addToast({ type: 'error', title: 'Trial Update Failed', message: res.error });
    }
    return res;
  };

  const createCampus = (input: CreateCampusInput) => {
    const err = guardPerm('tenants.campuses.manage', 'create a campus');
    if (err) return { success: false, error: err };
    const res = platformStore.createCampus(input);
    if (res.success && res.campus) {
      addToast({
        type: 'success',
        title: 'Campus Created',
        message: `Registered campus "${res.campus.name}" (${res.campus.code}) in local development state.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Campus Creation Failed',
        message: res.error,
      });
    }
    return res;
  };

  const updateCampus = (id: string, input: UpdateCampusInput) => {
    const err = guardPerm('tenants.campuses.manage', 'update campus details');
    if (err) return { success: false, error: err };
    const res = platformStore.updateCampus(id, input);
    if (res.success && res.campus) {
      addToast({
        type: 'success',
        title: 'Campus Updated',
        message: `Updated profile details for "${res.campus.name}".`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: res.error,
      });
    }
    return res;
  };

  const setMainCampus = (orgId: string, campusId: string) => {
    const err = guardPerm('tenants.campuses.manage', 'designate main campus');
    if (err) return { success: false, error: err };
    const res = platformStore.setMainCampus(orgId, campusId);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Main Campus Designated',
        message: 'Primary institutional campus updated.',
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Designation Failed',
        message: res.error,
      });
    }
    return res;
  };

  const setCampusStatus = (campusId: string, status: CampusStatus, reason?: string) => {
    const err = guardPerm('tenants.campuses.manage', 'update campus operational status');
    if (err) return { success: false, error: err };
    const res = platformStore.setCampusStatus(campusId, status, reason);
    if (res.success) {
      addToast({
        type: status === 'active' ? 'success' : 'warning',
        title: 'Campus Status Changed',
        message: `Campus is now ${status}.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Status Change Failed',
        message: res.error,
      });
    }
    return res;
  };

  const deleteCampus = (campusId: string) => {
    const err = guardPerm('tenants.campuses.manage', 'delete campus record');
    if (err) return { success: false, error: err };
    const res = platformStore.deleteCampus(campusId);
    if (res.success) {
      addToast({
        type: 'info',
        title: 'Campus Removed',
        message: 'Campus record removed from development store.',
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Deletion Blocked',
        message: res.error,
      });
    }
    return res;
  };

  const runSimulatedProvisioning = (
    orgId: string,
    optionsOrForceFail?:
      | boolean
      | {
          forceFail?: boolean;
          forceFailStageKey?:
            | 'registration_accepted'
            | 'profile_prepared'
            | 'initial_campus_prepared'
            | 'institution_structure_configured'
            | 'subscription_assigned'
            | 'entitlements_prepared'
            | 'initial_administrator_configured'
            | 'ready_for_activation';
          markForManualReview?: boolean;
          attempt?: number;
        }
  ) => {
    const err = guardPerm('organizations.lifecycle.manage', 'execute simulated provisioning');
    if (err) return { success: false, status: 'needs_attention' as ProvisioningStatus, error: err };
    const normalized =
      typeof optionsOrForceFail === 'boolean'
        ? { forceFail: optionsOrForceFail, actor: getActorMetadata() }
        : { ...(optionsOrForceFail || {}), actor: getActorMetadata() };
    const res = platformStore.runSimulatedProvisioning(orgId, normalized);
    if (res.success) {
      addToast({
        type: res.status === 'ready_for_review' ? 'warning' : 'success',
        title:
          res.status === 'ready_for_review'
            ? 'Provisioning Queued for Review'
            : 'Simulated Preparation Complete',
        message:
          res.status === 'ready_for_review'
            ? 'All 8 preparation checks staged and flagged for manual operator review.'
            : 'All 8 business-level tenant preparation stages succeeded cleanly.',
      });
    } else {
      addToast({
        type: 'error',
        title: 'Provisioning Simulation Halted',
        message: res.error || 'Provisioning simulation reported blockers or stage failure.',
      });
    }
    return res;
  };

  const resetSimulatedProvisioning = (orgId: string) => {
    const err = guardPerm('tenants.provisioning.simulate', 'reset simulated provisioning');
    if (err) return { success: false };
    const res = platformStore.resetSimulatedProvisioning(orgId);
    if (res.success) {
      addToast({
        type: 'info',
        title: 'Simulation Reset',
        message: 'Provisioning status reset to Not Started.',
      });
    }
    return res;
  };

  const createPlan = (input: CreatePlanInput) => {
    const err = guardPerm('billing.subscriptions.manage', 'create subscription plan');
    if (err) return { success: false, error: err };
    const res = platformStore.createPlan(input);
    if (res.success && res.plan) {
      addToast({
        type: 'success',
        title: 'Subscription Plan Created',
        message: `Plan "${res.plan.name}" added to platform catalogue.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Plan Creation Failed',
        message: res.error,
      });
    }
    return res;
  };

  const updatePlan = (id: string, input: UpdatePlanInput) => {
    const err = guardPerm('billing.subscriptions.manage', 'update subscription plan');
    if (err) return { success: false, error: err };
    const res = platformStore.updatePlan(id, input);
    if (res.success && res.plan) {
      addToast({
        type: 'success',
        title: 'Subscription Plan Updated',
        message: `Saved configuration changes for "${res.plan.name}".`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Plan Update Failed',
        message: res.error,
      });
    }
    return res;
  };

  const transitionSubscriptionStatus = (subId: string, status: SubscriptionStatus, reason: string) => {
    const err = guardPerm('billing.subscriptions.manage', 'transition subscription status');
    if (err) return { success: false, error: err };
    const res = platformStore.transitionSubscriptionStatus(subId, status, reason);
    if (res.success) {
      addToast({
        type: status === 'canceled' || status === 'suspended' ? 'warning' : 'success',
        title: 'Subscription Status Updated',
        message: `Subscription transitioned to ${status}.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Transition Blocked',
        message: res.error,
      });
    }
    return res;
  };

  const voidInvoice = (invoiceId: string, reason: string) => {
    const err = guardPerm('billing.invoices.manage', 'void invoice');
    if (err) return { success: false, error: err };
    const res = platformStore.voidInvoice(invoiceId, reason);
    if (res.success && res.invoice) {
      addToast({
        type: 'warning',
        title: 'Invoice Voided',
        message: `Invoice ${res.invoice.invoiceNumber} has been voided.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Void Action Failed',
        message: res.error,
      });
    }
    return res;
  };

  const retryPayment = (paymentId: string) => {
    const err = guardPerm('billing.payments.manage', 'retry failed payment');
    if (err) return { success: false, error: err };
    const res = platformStore.retryPayment(paymentId);
    if (res.success && res.payment) {
      addToast({
        type: 'success',
        title: 'Payment Settlement Simulated',
        message: `Payment ${res.payment.referenceNumber} processed successfully in simulation.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Payment Retry Failed',
        message: res.error,
      });
    }
    return res;
  };

  const createDiscount = (input: CreateDiscountInput) => {
    const err = guardPerm('billing.discounts.manage', 'create discount policy');
    if (err) return { success: false, error: err };
    const res = platformStore.createDiscount(input);
    if (res.success && res.discount) {
      addToast({
        type: 'success',
        title: 'Discount Policy Created',
        message: `Promotional code "${res.discount.code}" activated.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Discount Creation Failed',
        message: res.error,
      });
    }
    return res;
  };

  const toggleDiscount = (id: string) => {
    const err = guardPerm('billing.discounts.manage', 'toggle discount status');
    if (err) return { success: false, error: err };
    const res = platformStore.toggleDiscount(id);
    if (res.success && res.discount) {
      addToast({
        type: res.discount.isActive ? 'success' : 'info',
        title: 'Discount Status Changed',
        message: `Promotional code "${res.discount.code}" is now ${res.discount.isActive ? 'active' : 'inactive'}.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: res.error,
      });
    }
    return res;
  };

  const acknowledgeIncident = (incidentId: string, actorName?: string) => {
    const err = guardPerm('system.maintenance.manage', 'acknowledge platform incident');
    if (err) return { success: false, error: err };
    const res = platformStore.acknowledgeIncident(incidentId, authenticatedActorName(actorName));
    if (res.success) {
      addToast({
        type: 'info',
        title: 'Incident Acknowledged',
        message: 'Incident moved to acknowledged status in local demonstration state.',
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: res.error,
      });
    }
    return res;
  };

  const transitionIncidentStatus = (
    incidentId: string,
    newStatus: IncidentLifecycleStatus,
    context?: { resolutionNotes?: string; rootCause?: string; reopenReason?: string },
    actorName?: string
  ) => {
    const err = guardPerm('system.maintenance.manage', 'transition platform incident');
    if (err) return { success: false, error: err };
    const res = platformStore.transitionIncidentStatus(incidentId, newStatus, context, authenticatedActorName(actorName));
    if (res.success) {
      addToast({
        type: newStatus === 'resolved' ? 'success' : 'info',
        title: newStatus === 'resolved' ? 'Incident Resolved' : 'Incident Status Updated',
        message: `Incident status transitioned to "${newStatus}".`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Transition Blocked',
        message: res.error,
      });
    }
    return res;
  };

  const addIncidentNote = (incidentId: string, message: string, author?: string) => {
    const err = guardPerm('system.maintenance.manage', 'append incident note');
    if (err) return { success: false, error: err };
    const res = platformStore.addIncidentNote(incidentId, message, authenticatedActorName(author));
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Investigation Note Added',
        message: 'Appended update to incident timeline.',
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Note Failed',
        message: res.error,
      });
    }
    return res;
  };

  const createMaintenanceWindow = (input: CreateMaintenanceInput, actorName?: string) => {
    const err = guardPerm('system.maintenance.manage', 'schedule maintenance window');
    if (err) return { success: false, error: err };
    const res = platformStore.createMaintenanceWindow(input, authenticatedActorName(actorName));
    if (res.success && res.maintenanceWindow) {
      addToast({
        type: 'success',
        title: 'Maintenance Scheduled',
        message: `Created window "${res.maintenanceWindow.title}".`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Scheduling Blocked',
        message: res.error,
      });
    }
    return res;
  };

  const updateMaintenanceWindow = (id: string, input: Partial<CreateMaintenanceInput>, actorName?: string) => {
    const err = guardPerm('system.maintenance.manage', 'update maintenance window');
    if (err) return { success: false, error: err };
    const res = platformStore.updateMaintenanceWindow(id, input, authenticatedActorName(actorName));
    if (res.success) {
      addToast({
        type: 'info',
        title: 'Maintenance Updated',
        message: 'Updated maintenance window parameters.',
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: res.error,
      });
    }
    return res;
  };

  const cancelMaintenanceWindow = (id: string, reason: string, actorName?: string) => {
    const err = guardPerm('system.maintenance.manage', 'cancel maintenance window');
    if (err) return { success: false, error: err };
    const res = platformStore.cancelMaintenanceWindow(id, reason, authenticatedActorName(actorName));
    if (res.success) {
      addToast({
        type: 'warning',
        title: 'Maintenance Cancelled',
        message: 'Maintenance window marked as cancelled.',
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Cancellation Failed',
        message: res.error,
      });
    }
    return res;
  };

  const createAlertRule = (input: CreateAlertRuleInput, actorName?: string) => {
    const err = guardPerm('system.maintenance.manage', 'create monitoring alert rule');
    if (err) return { success: false, error: err };
    const res = platformStore.createAlertRule(input, authenticatedActorName(actorName));
    if (res.success && res.alertRule) {
      addToast({
        type: 'success',
        title: 'Alert Rule Created',
        message: `Created alert rule "${res.alertRule.name}".`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Validation Failed',
        message: res.error,
      });
    }
    return res;
  };

  const updateAlertRule = (id: string, input: Partial<CreateAlertRuleInput>, actorName?: string) => {
    const err = guardPerm('system.maintenance.manage', 'update monitoring alert rule');
    if (err) return { success: false, error: err };
    const res = platformStore.updateAlertRule(id, input, authenticatedActorName(actorName));
    if (res.success) {
      addToast({
        type: 'info',
        title: 'Alert Rule Updated',
        message: 'Updated rule threshold configuration.',
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: res.error,
      });
    }
    return res;
  };

  const toggleAlertRule = (id: string, actorName?: string) => {
    const err = guardPerm('system.maintenance.manage', 'toggle monitoring alert rule');
    if (err) return { success: false, error: err };
    const res = platformStore.toggleAlertRule(id, authenticatedActorName(actorName));
    if (res.success && res.alertRule) {
      addToast({
        type: res.alertRule.isEnabled ? 'success' : 'info',
        title: 'Rule Toggled',
        message: `Alert rule is now ${res.alertRule.isEnabled ? 'active' : 'disabled'}.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Toggle Failed',
        message: res.error,
      });
    }
    return res;
  };

  const deleteAlertRule = (id: string, actorName?: string) => {
    const err = guardPerm('system.maintenance.manage', 'delete monitoring alert rule');
    if (err) return { success: false, error: err };
    const res = platformStore.deleteAlertRule(id, authenticatedActorName(actorName));
    if (res.success) {
      addToast({
        type: 'warning',
        title: 'Alert Rule Deleted',
        message: 'Removed alert rule from catalogue.',
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: res.error,
      });
    }
    return res;
  };

  const updateExtendedSettings = (
    input: Partial<ExtendedPlatformSettings>,
    reason?: string,
    actorName?: string
  ) => {
    const err = guardPerm('platform.settings.update', 'save platform configuration');
    if (err) return { success: false, error: err };
    const res = platformStore.updateExtendedSettings(input, reason, authenticatedActorName(actorName));
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Platform Configuration Saved',
        message: 'Global settings updated in local mock store.',
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Configuration Validation Error',
        message: res.error,
      });
    }
    return res;
  };

  const createFeatureFlag = (input: Partial<FeatureFlag>, actorName?: string) => {
    const err = guardPerm('system.features.toggle', 'create feature flag', ['system.features.toggle', 'modules.registry.manage']);
    if (err) return { success: false, error: err };
    const res = platformStore.createFeatureFlag(input, authenticatedActorName(actorName));
    if (res.success && res.flag) {
      addToast({
        type: 'success',
        title: 'Feature Flag Created',
        message: `Registered "${res.flag.name}" in local catalogue.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Creation Blocked',
        message: res.error,
      });
    }
    return res;
  };

  const updateFeatureFlag = (key: string, input: Partial<FeatureFlag>, reason?: string, actorName?: string) => {
    const err = guardPerm('system.features.toggle', 'update feature flag', ['system.features.toggle', 'modules.registry.manage']);
    if (err) return { success: false, error: err };
    const res = platformStore.updateFeatureFlag(key, input, reason, authenticatedActorName(actorName));
    if (res.success) {
      addToast({
        type: 'info',
        title: 'Feature Flag Updated',
        message: `Updated parameters for "${key}".`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: res.error,
      });
    }
    return res;
  };

  const transitionFeatureFlagLifecycle = (key: string, targetLifecycle: FeatureFlagLifecycle, reason: string, actorName?: string) => {
    const err = guardPerm('system.features.toggle', 'change feature flag lifecycle', ['system.features.toggle', 'modules.registry.manage']);
    if (err) return { success: false, error: err };
    const res = platformStore.transitionFeatureFlagLifecycle(key, targetLifecycle, reason, authenticatedActorName(actorName));
    if (res.success) {
      addToast({
        type: targetLifecycle === 'archived' ? 'warning' : 'success',
        title: 'Lifecycle Status Changed',
        message: `Flag "${key}" is now ${targetLifecycle}.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Transition Blocked',
        message: res.error,
      });
    }
    return res;
  };

  const toggleFeatureFlag = (key: string, actorName?: string) => {
    const err = guardPerm('system.features.toggle', 'toggle feature flag', ['system.features.toggle', 'modules.registry.manage']);
    if (err) return { success: false, error: err };
    const res = platformStore.toggleFeatureFlag(key, authenticatedActorName(actorName));
    if (res.success && res.flag) {
      addToast({
        type: res.flag.enabled ? 'success' : 'info',
        title: 'Flag Toggled',
        message: `Flag "${res.flag.name}" is now ${res.flag.enabled ? 'active' : 'disabled'} in local demo.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Toggle Blocked',
        message: res.error,
      });
    }
    return res;
  };

  const deleteFeatureFlag = (key: string, actorName?: string) => {
    const err = guardPerm('system.features.toggle', 'delete feature flag', ['system.features.toggle', 'modules.registry.manage']);
    if (err) return { success: false, error: err };
    const res = platformStore.deleteFeatureFlag(key, authenticatedActorName(actorName));
    if (res.success) {
      addToast({
        type: 'warning',
        title: 'Feature Flag Removed',
        message: `Removed flag "${key}" from registry.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Deletion Blocked',
        message: res.error,
      });
    }
    return res;
  };

  const setTenantFeatureOverride = (input: { organizationId: string; flagKey: string; overrideValue: boolean; reason: string; actorName?: string }) => {
    const err = guardPerm('system.features.toggle', 'configure tenant feature override', ['system.features.toggle', 'modules.registry.manage']);
    if (err) return { success: false, error: err };
    const res = platformStore.setTenantFeatureOverride({
      ...input,
      actorName: authenticatedActorName(input.actorName),
    });
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Tenant Override Configured',
        message: `Override applied for organization.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Override Blocked',
        message: res.error,
      });
    }
    return res;
  };

  const removeTenantFeatureOverride = (organizationId: string, flagKey: string, reason?: string, actorName?: string) => {
    const err = guardPerm('system.features.toggle', 'remove tenant feature override', ['system.features.toggle', 'modules.registry.manage']);
    if (err) return { success: false, error: err };
    const res = platformStore.removeTenantFeatureOverride(organizationId, flagKey, reason, authenticatedActorName(actorName));
    if (res.success) {
      addToast({
        type: 'info',
        title: 'Override Removed',
        message: 'Reverted to inherited platform default.',
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Removal Blocked',
        message: res.error,
      });
    }
    return res;
  };

  const applyRolloutPlan = (input: RolloutPlanInput, actorName?: string) => {
    const err = guardPerm('platform.settings.update', 'apply rollout plan', ['platform.settings.update', 'system.features.toggle', 'modules.registry.manage']);
    if (err) return { success: false, error: err };
    const res = platformStore.applyRolloutPlan(input, authenticatedActorIdentity(actorName));
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Rollout Plan Applied (Demo)',
        message: `Staged rollout planned for ${res.summary?.targetedTenantCount || 0} organizations.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Rollout Validation Failed',
        message: res.error,
      });
    }
    return res;
  };

  const createChangeProposal = (input: Partial<ConfigurationChangeProposal>) => {
    const err = guardPerm('platform.settings.update', 'create configuration change proposal', ['platform.settings.update', 'system.features.toggle', 'modules.registry.manage']);
    if (err) return { success: false, error: err };
    const res = platformStore.createChangeProposal(input, actorProfile);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Change Proposal Submitted',
        message: 'Proposal is now pending administrative review.',
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Proposal Rejected',
        message: res.error,
      });
    }
    return res;
  };

  const transitionProposalStatus = (proposalId: string, targetStatus: ProposalStatus, reviewerNotes?: string, actorName?: string) => {
    const isDecision = targetStatus === 'approved' || targetStatus === 'rejected';
    const err = guardPerm(
      isDecision ? 'operations.approvals.manage' : 'platform.settings.update',
      isDecision ? `${targetStatus} configuration proposal` : `transition proposal to ${targetStatus}`,
      isDecision ? ['operations.approvals.manage', 'platform.settings.update'] : ['platform.settings.update', 'operations.approvals.manage']
    );
    if (err) return { success: false, error: err };
    const res = platformStore.transitionProposalStatus(proposalId, targetStatus, reviewerNotes, authenticatedActorIdentity(actorName));
    if (res.success) {
      addToast({
        type: targetStatus === 'approved' ? 'success' : targetStatus === 'rejected' ? 'warning' : 'info',
        title: 'Proposal Status Updated',
        message: `Proposal status changed to "${targetStatus}".`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: res.error,
      });
    }
    return res;
  };

  const restoreConfigVersion = (versionId: string, actorName?: string) => {
    const err = guardPerm('platform.settings.update', 'restore configuration version', ['platform.settings.update', 'system.features.toggle']);
    if (err) return { success: false, error: err };
    const res = platformStore.restoreConfigVersion(versionId, authenticatedActorIdentity(actorName));
    if (res.success) {
      addToast({
        type: 'warning',
        title: 'Version Restored',
        message: 'Prior configuration state restored in development store.',
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Restore Failed',
        message: res.error,
      });
    }
    return res;
  };

  const importConfiguration = (pkg: ConfigExportPackage | string, actorName?: string) => {
    const err = guardPerm('platform.settings.update', 'import configuration package', ['platform.settings.update', 'system.features.toggle']);
    if (err) {
      return {
        success: false,
        result: { isValid: false, errors: [err], warnings: [], createCount: 0, updateCount: 0, skipCount: 0, rejectCount: 0, schemaVersion: '1.0.0', previewItems: [] } as ConfigImportValidationResult,
        error: err,
      };
    }
    const res = platformStore.importConfiguration(pkg, authenticatedActorIdentity(actorName));
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Configuration Imported',
        message: `Applied ${res.result.createCount} new and ${res.result.updateCount} updated configuration items.`,
      });
    } else if (res.error) {
      addToast({
        type: 'error',
        title: 'Import Rejected',
        message: res.error,
      });
    }
    return res;
  };

  const value: PlatformStoreContextType = {
    metrics: platformStore.getMetrics(),
    moduleMetrics: platformStore.getModuleMetrics(),
    organizations: platformStore.getOrganizations(),
    plans: platformStore.getPlans(),
    subscriptions: platformStore.getSubscriptions(),
    invoices: platformStore.getInvoices(),
    payments: platformStore.getPayments(),
    platformUsers: platformStore.getPlatformUsers(),
    auditEvents: platformStore.getAuditEvents(),
    securityEvents: platformStore.getSecurityEvents(),
    complianceControls: platformStore.getComplianceControls(),
    governanceEvidence: platformStore.getGovernanceEvidence(),
    retentionPolicies: platformStore.getRetentionPolicies(),
    operationalComponents: platformStore.getOperationalComponents(),
    platformIncidents: platformStore.getPlatformIncidents(),
    maintenanceWindows: platformStore.getMaintenanceWindows(),
    deploymentRecords: platformStore.getDeploymentRecords(),
    backgroundJobs: platformStore.getBackgroundJobs(),
    externalIntegrations: platformStore.getExternalIntegrations(),
    integrations: platformStore.getIntegrations(),
    apiClients: platformStore.getApiClients(),
    webhookEndpoints: platformStore.getWebhookEndpoints(),
    webhookDeliveries: platformStore.getWebhookDeliveries(),
    dataCategories: platformStore.getDataCategories(),
    governanceRetentionPolicies: platformStore.getGovernanceRetentionPolicies(),
    privacyRequests: platformStore.getPrivacyRequests(),
    lifecycleRules: platformStore.getDataLifecycleRules(),
    governanceExceptions: platformStore.getGovernanceExceptions(),
    governanceAuditLogs: platformStore.getGovernanceAuditLogs(),
    capacityObservations: platformStore.getCapacityObservations(),
    backupRecords: platformStore.getBackupRecords(),
    alertRules: platformStore.getAlertRules(),
    systemServices: platformStore.getSystemServices(),
    incidents: platformStore.getIncidents(),
    features: platformStore.getFeatures(),
    settings: platformStore.getSettings(),
    extendedSettings: platformStore.getExtendedSettings(),
    featureFlags: platformStore.getFeatureFlags(),
    tenantOverrides: platformStore.getTenantOverrides(),
    environments: platformStore.getEnvironmentConfigs(),
    changeProposals: platformStore.getChangeProposals(),
    configVersions: platformStore.getConfigVersions(),
    modules: platformStore.getModules(),
    organizationModuleOverrides: platformStore.getOrganizationModuleOverrides(),
    campuses: platformStore.getCampuses(),
    discounts: platformStore.getDiscounts(),
    subscriptionEvents: platformStore.getSubscriptionEvents(),
    toasts,
    addToast,
    removeToast,
    getOrganizationById: (id: string) => platformStore.getOrganizationById(id),
    getSubscriptionById: (id: string) => platformStore.getSubscriptionById(id),
    getSubscriptionByOrgId: (orgId: string) => platformStore.getSubscriptionByOrgId(orgId),
    getInvoicesByOrgId: (orgId: string) => platformStore.getInvoicesByOrgId(orgId),
    getInvoiceById: (id: string) => platformStore.getInvoiceById(id),
    getPaymentsByOrgId: (orgId: string) => platformStore.getPaymentsByOrgId(orgId),
    getPaymentsByInvoiceId: (invoiceId: string) => platformStore.getPaymentsByInvoiceId(invoiceId),
    getPaymentById: (id: string) => platformStore.getPaymentById(id),
    getDiscounts: () => platformStore.getDiscounts(),
    getDiscountByCode: (code: string) => platformStore.getDiscountByCode(code),
    getSubscriptionEvents: (subId?: string) => platformStore.getSubscriptionEvents(subId),
    getMonetizationAnalytics: (refDate?: string) => platformStore.getMonetizationAnalytics(refDate),
    getAuditEvents: (filter?: AuditLogFilter) => platformStore.getAuditEvents(filter),
    getCampuses: () => platformStore.getCampuses(),
    getCampusesByOrgId: (orgId: string) => platformStore.getCampusesByOrgId(orgId),
    getCampusById: (id: string) => platformStore.getCampusById(id),
    getSimulatedEvents: (orgId?: string) => platformStore.getSimulatedEvents(orgId),
    createOrganization,
    updateOrganization,
    setOrganizationStatus,
    updateOrganizationPlan,
    createPlan,
    updatePlan,
    transitionSubscriptionStatus,
    voidInvoice,
    retryPayment,
    createDiscount,
    toggleDiscount,
    createCampus,
    updateCampus,
    setMainCampus,
    setCampusStatus,
    deleteCampus,
    evaluateOrganizationReadiness: (orgId: string) => platformStore.evaluateOrganizationReadiness(orgId),
    runSimulatedProvisioning,
    resetSimulatedProvisioning,
    recordPayment,
    createPlatformUser,
    updatePlatformUserRole,
    updatePlatformUserStatus,
    assignRoleToUser,
    removeRoleFromUser,
    platformRoles: platformStore.getPlatformRoles(),
    platformPermissions: platformStore.getPlatformPermissions(),
    getPlatformRoleById: (id: string) => platformStore.getPlatformRoleById(id),
    createPlatformRole,
    updatePlatformRolePermissions,
    deletePlatformRole,
    toggleFeature,
    updateSettings,
    resetToDefaults,
    updateExtendedSettings,
    getFeatureFlagByKey: (key: string) => platformStore.getFeatureFlagByKey(key),
    createFeatureFlag,
    updateFeatureFlag,
    transitionFeatureFlagLifecycle,
    toggleFeatureFlag,
    deleteFeatureFlag,
    getTenantOverrides: (orgId?: string) => platformStore.getTenantOverrides(orgId),
    setTenantFeatureOverride,
    removeTenantFeatureOverride,
    evaluateEffectiveFlag: (flagKey: string, orgId?: string, env?: string) =>
      platformStore.evaluateEffectiveFlag(flagKey, orgId, env),
    applyRolloutPlan,
    createChangeProposal,
    transitionProposalStatus,
    restoreConfigVersion,
    exportConfiguration: (scope?: 'all' | 'settings_only' | 'flags_only' | 'overrides_only') =>
      platformStore.exportConfiguration(scope, actorProfile?.name),
    importConfiguration,
    getModules: () => platformStore.getModules(),
    getModuleById: (id: string) => platformStore.getModuleById(id),
    getTopLevelModules: () => platformStore.getTopLevelModules(),
    getSubmodulesByParentId: (parentId: string) => platformStore.getSubmodulesByParentId(parentId),
    getOrganizationModuleOverrides: (orgId?: string) => platformStore.getOrganizationModuleOverrides(orgId),
    setOrganizationModuleOverride,
    resetOrganizationModuleOverride,
    setModuleGlobalAvailability,
    setModuleAvailabilityStatus,
    updateModuleMetadata,
    updateFeatureDefinition,
    manageSubscriptionAddOn,
    extendSubscriptionTrial,
    evaluateEntitlement: (moduleId: string, orgId?: string, planId?: string, asOfDate?: string) =>
      platformStore.evaluateEntitlement(moduleId, orgId, planId, asOfDate),
    validateRegistry: () => platformStore.validateRegistry(),
    logAuditEvent: (event) => {
      const err = guardPerm('audit.governance.manage', 'record audit event', [
        'audit.logs.export',
        'audit.governance.manage',
        'system.maintenance.manage',
      ]);
      if (err || !actorProfile) {
        throw new Error(err || 'Authentication required to append audit log event.');
      }
      return platformStore.logAuditEvent({
        ...event,
        actor: {
          id: actorProfile.id,
          name: actorProfile.name,
          email: actorProfile.email,
          role: actorProfile.role,
          actorType:
            actorProfile.role === 'super_admin'
              ? 'super_admin'
              : actorProfile.role === 'compliance_auditor'
              ? 'compliance_auditor'
              : actorProfile.role === 'support_lead'
              ? 'support_lead'
              : 'platform_operator',
        },
      });
    },
    getSecurityEvents: (filters) => platformStore.getSecurityEvents(filters),
    updateSecurityEventTriage: (id, status, notes, reviewer) => {
      const err = guardPerm('audit.governance.manage', 'triage security event');
      if (err) return { success: false, error: err };
      return platformStore.updateSecurityEventTriage(id, status, notes, authenticatedActorName(reviewer));
    },
    getComplianceControls: (filters) => platformStore.getComplianceControls(filters),
    updateComplianceControlRemediation: (id, notes, targetDate, reviewer) => {
      const err = guardPerm('audit.governance.manage', 'update compliance remediation');
      if (err) return { success: false, error: err };
      return platformStore.updateComplianceControlRemediation(
        id,
        notes,
        targetDate,
        authenticatedActorIdentity(reviewer)
      );
    },
    getGovernanceEvidence: (filters) => platformStore.getGovernanceEvidence(filters),
    updateGovernanceEvidenceStatus: (id, status, notes, reviewer) => {
      const err = guardPerm('audit.governance.manage', 'update governance evidence status');
      if (err) return { success: false, error: err };
      return platformStore.updateGovernanceEvidenceStatus(
        id,
        status,
        notes,
        authenticatedActorIdentity(reviewer)
      );
    },
    getRetentionPolicies: (filters) => platformStore.getRetentionPolicies(filters),
    updateRetentionPolicy: (id, newDays, reason, isEnabled, actorName) => {
      const err = guardPerm('audit.governance.manage', 'update data retention policy');
      if (err) return { success: false, error: err };
      return platformStore.updateRetentionPolicy(id, newDays, reason, isEnabled, authenticatedActorName(actorName));
    },
    acknowledgeIncident,
    transitionIncidentStatus,
    addIncidentNote,
    createMaintenanceWindow,
    updateMaintenanceWindow,
    cancelMaintenanceWindow,
    createAlertRule,
    updateAlertRule,
    toggleAlertRule,
    deleteAlertRule,

    // Communications (E-09.16)
    communicationTemplates: platformStore.getCommunicationTemplates(),
    notificationPolicies: platformStore.getNotificationPolicies(),
    communicationProviders: platformStore.getCommunicationProviders(),
    notificationRecords: platformStore.getNotificationRecords(),
    campaignDrafts: platformStore.getCampaignDrafts(),
    tenantCommunicationConfigs: platformStore.getTenantCommunicationConfigs(),
    notificationPreferenceGovernance: platformStore.getNotificationPreferenceGovernance(),
    getCommunicationTemplates: (filters) => platformStore.getCommunicationTemplates(filters),
    getCommunicationTemplateById: (id: string) => platformStore.getCommunicationTemplateById(id),
    createCommunicationTemplate: (input, actorName) => {
      const err = guardPerm('communications.notices.manage', 'create communication template');
      if (err) return { success: false, error: err };
      try {
        const res = platformStore.createCommunicationTemplate(input, authenticatedActorName(actorName));
        addToast({ type: 'success', title: 'Template Created', message: `Saved '${res.name}' (${res.key}) to local store.` });
        return { success: true, template: res };
      } catch (err: any) {
        addToast({ type: 'error', title: 'Creation Failed', message: err.message });
        return { success: false, error: err.message };
      }
    },
    updateCommunicationTemplate: (id, updates, changeSummary, actorName) => {
      const err = guardPerm('communications.notices.manage', 'update communication template');
      if (err) return { success: false, error: err };
      try {
        const res = platformStore.updateCommunicationTemplate(id, updates, changeSummary, authenticatedActorName(actorName));
        addToast({ type: 'success', title: 'Template Updated', message: `Updated '${res.name}' (${res.key}).` });
        return { success: true, template: res };
      } catch (err: any) {
        addToast({ type: 'error', title: 'Update Failed', message: err.message });
        return { success: false, error: err.message };
      }
    },
    transitionTemplateStatus: (id, newStatus, reviewNotes, actorName) => {
      const err = guardPerm('communications.notices.manage', 'transition template status');
      if (err) return { success: false, error: err };
      try {
        const res = platformStore.transitionTemplateStatus(id, newStatus, reviewNotes, authenticatedActorName(actorName));
        addToast({ type: 'info', title: 'Status Changed', message: `'${res.name}' is now ${newStatus}.` });
        return { success: true, template: res };
      } catch (err: any) {
        addToast({ type: 'error', title: 'Transition Failed', message: err.message });
        return { success: false, error: err.message };
      }
    },
    duplicateCommunicationTemplate: (sourceId, newKey, newName, actorName) => {
      const err = guardPerm('communications.notices.manage', 'duplicate communication template');
      if (err) return { success: false, error: err };
      try {
        const res = platformStore.duplicateCommunicationTemplate(sourceId, newKey, newName, authenticatedActorName(actorName));
        addToast({ type: 'success', title: 'Template Duplicated', message: `Created copy '${res.name}'.` });
        return { success: true, template: res };
      } catch (err: any) {
        addToast({ type: 'error', title: 'Duplicate Failed', message: err.message });
        return { success: false, error: err.message };
      }
    },
    archiveCommunicationTemplate: (id, actorName) => {
      const err = guardPerm('communications.notices.manage', 'archive communication template');
      if (err) return { success: false, error: err };
      try {
        const res = platformStore.archiveCommunicationTemplate(id, authenticatedActorName(actorName));
        addToast({ type: 'warning', title: 'Template Archived', message: `'${res.name}' moved to archive.` });
        return { success: true, template: res };
      } catch (err: any) {
        addToast({ type: 'error', title: 'Archive Failed', message: err.message });
        return { success: false, error: err.message };
      }
    },
    restoreCommunicationTemplate: (id, actorName) => {
      const err = guardPerm('communications.notices.manage', 'restore communication template');
      if (err) return { success: false, error: err };
      try {
        const res = platformStore.restoreCommunicationTemplate(id, authenticatedActorName(actorName));
        addToast({ type: 'success', title: 'Template Restored', message: `'${res.name}' restored to draft status.` });
        return { success: true, template: res };
      } catch (err: any) {
        addToast({ type: 'error', title: 'Restore Failed', message: err.message });
        return { success: false, error: err.message };
      }
    },
    getTemplateVersionHistory: (templateId: string) => platformStore.getTemplateVersionHistory(templateId),
    restoreTemplateVersion: (versionId: string, actorName) => {
      const err = guardPerm('communications.notices.manage', 'restore template version');
      if (err) return { success: false, error: err };
      try {
        const res = platformStore.restoreTemplateVersion(versionId, authenticatedActorName(actorName));
        addToast({ type: 'success', title: 'Version Restored', message: `Template '${res.name}' restored to draft from history.` });
        return { success: true, template: res };
      } catch (err: any) {
        addToast({ type: 'error', title: 'Version Restore Failed', message: err.message });
        return { success: false, error: err.message };
      }
    },
    getNotificationPolicies: (filters) => platformStore.getNotificationPolicies(filters),
    getNotificationPolicyById: (id: string) => platformStore.getNotificationPolicyById(id),
    createNotificationPolicy: (input, actorName) => {
      const err = guardPerm('communications.notices.manage', 'create notification policy');
      if (err) return { success: false, error: err };
      try {
        const res = platformStore.createNotificationPolicy(input, authenticatedActorName(actorName));
        addToast({ type: 'success', title: 'Policy Created', message: `Registered policy '${res.name}'.` });
        return { success: true, policy: res };
      } catch (err: any) {
        addToast({ type: 'error', title: 'Policy Creation Failed', message: err.message });
        return { success: false, error: err.message };
      }
    },
    updateNotificationPolicy: (id, updates, actorName) => {
      const err = guardPerm('communications.notices.manage', 'update notification policy');
      if (err) return { success: false, error: err };
      try {
        const res = platformStore.updateNotificationPolicy(id, updates, authenticatedActorName(actorName));
        addToast({ type: 'success', title: 'Policy Updated', message: `Updated policy '${res.name}'.` });
        return { success: true, policy: res };
      } catch (err: any) {
        addToast({ type: 'error', title: 'Policy Update Failed', message: err.message });
        return { success: false, error: err.message };
      }
    },
    toggleNotificationPolicy: (id, enabled, actorName) => {
      const err = guardPerm('communications.notices.manage', 'toggle notification policy');
      if (err) return { success: false, error: err };
      try {
        const res = platformStore.toggleNotificationPolicy(id, enabled, authenticatedActorName(actorName));
        addToast({ type: 'info', title: 'Policy Toggled', message: `'${res.name}' is now ${enabled ? 'enabled' : 'disabled'}.` });
        return { success: true, policy: res };
      } catch (err: any) {
        addToast({ type: 'error', title: 'Toggle Failed', message: err.message });
        return { success: false, error: err.message };
      }
    },
    getCommunicationProviders: () => platformStore.getCommunicationProviders(),
    simulateProviderHealthCheck: (providerId, actorName) => {
      const err = guardPerm('communications.notices.manage', 'run provider health check', ['communications.notices.manage', 'system.maintenance.manage']);
      if (err) {
        return { success: false, latencyMs: 0, simulatedOutput: err, checkedAt: new Date().toISOString() };
      }
      const res = platformStore.simulateProviderHealthCheck(providerId, authenticatedActorName(actorName));
      addToast({
        type: res.success ? 'success' : 'error',
        title: 'Provider Health Check Simulated',
        message: res.simulatedOutput,
      });
      return res;
    },
    getNotificationRecords: (filters) => platformStore.getNotificationRecords(filters),
    simulateTestNotification: (templateId, testRecipient, customVariables, actorName) => {
      const err = guardPerm('communications.notices.manage', 'dispatch test notification');
      if (err) return { success: false, error: err };
      try {
        const res = platformStore.simulateTestNotification(templateId, testRecipient, customVariables, authenticatedActorName(actorName));
        addToast({ type: 'success', title: 'Test Dispatched (Simulated)', message: `Mock message enqueued to '${testRecipient}'. No live network calls.` });
        return { success: true, record: res };
      } catch (err: any) {
        addToast({ type: 'error', title: 'Simulation Failed', message: err.message });
        return { success: false, error: err.message };
      }
    },
    simulateNotificationRetry: (notificationId, actorName) => {
      const err = guardPerm('communications.notices.manage', 'retry notification delivery');
      if (err) return { success: false, message: err };
      const res = platformStore.simulateNotificationRetry(notificationId, authenticatedActorName(actorName));
      addToast({
        type: res.success ? 'success' : 'warning',
        title: res.success ? 'Retry Simulated' : 'Retry Ineligible',
        message: res.message,
      });
      return res;
    },
    addNotificationReviewNote: (notificationId, reviewNote, actorName) => {
      const err = guardPerm('communications.notices.manage', 'attach notification review note');
      if (err) return { success: false, error: err };
      try {
        const res = platformStore.addNotificationReviewNote(notificationId, reviewNote, authenticatedActorName(actorName));
        addToast({ type: 'info', title: 'Note Attached', message: `Added review note to '${notificationId}'.` });
        return { success: true, record: res };
      } catch (err: any) {
        addToast({ type: 'error', title: 'Note Failed', message: err.message });
        return { success: false, error: err.message };
      }
    },
    getCampaignDrafts: () => platformStore.getCampaignDrafts(),
    createCampaignDraft: (input, actorName) => {
      const err = guardPerm('communications.notices.manage', 'create campaign draft');
      if (err) return { success: false, error: err };
      try {
        const res = platformStore.createCampaignDraft(input, authenticatedActorName(actorName));
        addToast({ type: 'success', title: 'Campaign Drafted', message: `Created plan '${res.name}'.` });
        return { success: true, campaign: res };
      } catch (err: any) {
        addToast({ type: 'error', title: 'Campaign Creation Failed', message: err.message });
        return { success: false, error: err.message };
      }
    },
    updateCampaignDraft: (id, updates, actorName) => {
      const err = guardPerm('communications.notices.manage', 'update campaign draft');
      if (err) return { success: false, error: err };
      try {
        const res = platformStore.updateCampaignDraft(id, updates, authenticatedActorName(actorName));
        addToast({ type: 'success', title: 'Campaign Updated', message: `Saved changes to '${res.name}'.` });
        return { success: true, campaign: res };
      } catch (err: any) {
        addToast({ type: 'error', title: 'Campaign Update Failed', message: err.message });
        return { success: false, error: err.message };
      }
    },
    transitionCampaignStatus: (id, status, actorName) => {
      const err = guardPerm('communications.notices.manage', 'transition campaign status');
      if (err) return { success: false, error: err };
      try {
        const res = platformStore.transitionCampaignStatus(id, status as 'draft' | 'pending_approval' | 'approved' | 'cancelled', authenticatedActorName(actorName));
        addToast({ type: 'info', title: 'Campaign Status Changed', message: `'${res.name}' is now ${status}.` });
        return { success: true, campaign: res };
      } catch (err: any) {
        addToast({ type: 'error', title: 'Campaign Status Failed', message: err.message });
        return { success: false, error: err.message };
      }
    },
    getTenantCommunicationConfigs: () => platformStore.getTenantCommunicationConfigs(),
    updateTenantCommunicationConfig: (tenantId, updates, actorName) => {
      const err = guardPerm('communications.notices.manage', 'update tenant communication policy');
      if (err) return { success: false, error: err };
      try {
        const res = platformStore.updateTenantCommunicationConfig(tenantId, updates, authenticatedActorName(actorName));
        addToast({ type: 'success', title: 'Tenant Settings Updated', message: `Updated communication config for '${res.tenantName}'.` });
        return { success: true, config: res };
      } catch (err: any) {
        addToast({ type: 'error', title: 'Tenant Config Failed', message: err.message });
        return { success: false, error: err.message };
      }
    },
    getNotificationPreferenceGovernance: () => platformStore.getNotificationPreferenceGovernance(),
    exportCommunicationGovernancePackage: (actorName) =>
      platformStore.exportCommunicationGovernancePackage(authenticatedActorName(actorName)),
    // E-09.17: Support Desk & Customer Success
    supportTickets: platformStore.getSupportTickets(),
    supportTeams: platformStore.getSupportTeams(),
    slaPolicies: platformStore.getSlaPolicies(),
    kbArticles: platformStore.getKbArticles(),
    csatRecords: platformStore.getCsatRecords(),
    csTasks: platformStore.getCsTasks(),
    getSupportTickets: (filters) => platformStore.getSupportTickets(filters),
    getSupportTicketById: (id) => platformStore.getSupportTicketById(id),
    createSupportTicket: (input, actorName) => {
      const err = guardPerm('support.tickets.manage', 'create support ticket');
      if (err) return { success: false, error: err };
      const res = platformStore.createSupportTicket(input, actorProfile || actorName);
      if (res.success && res.ticket) {
        addToast({
          type: 'success',
          title: 'Support Ticket Created',
          message: `Created ticket ${res.ticket.ticketNumber} for organization ${res.ticket.organizationId}. (Demo state updated).`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Ticket Creation Failed', message: res.error });
      }
      return res;
    },
    updateSupportTicket: (id, updates, actorName) => {
      const err = guardPerm('support.tickets.manage', 'update support ticket');
      if (err) return { success: false, error: err };
      const res = platformStore.updateSupportTicket(id, updates, actorProfile || actorName);
      if (res.success && res.ticket) {
        addToast({
          type: 'success',
          title: 'Ticket Updated',
          message: `Saved updates to ticket ${res.ticket.ticketNumber}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Update Failed', message: res.error });
      }
      return res;
    },
    transitionSupportTicketStatus: (id, status, reason, actorName) => {
      const err = guardPerm('support.tickets.manage', 'transition support ticket status');
      if (err) return { success: false, error: err };
      const res = platformStore.transitionSupportTicketStatus(id, status, reason, actorProfile || actorName);
      if (res.success && res.ticket) {
        addToast({
          type: status === 'closed' || status === 'resolved' ? 'success' : 'info',
          title: 'Status Transitioned',
          message: `Ticket ${res.ticket.ticketNumber} is now ${status}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Transition Blocked', message: res.error });
      }
      return res;
    },
    assignSupportTicket: (id, operatorId, teamId, reason, actorName) => {
      const err = guardPerm('support.tickets.manage', 'assign support ticket', [
        'support.tickets.manage',
        'support.tickets.escalate',
      ]);
      if (err) return { success: false, error: err };
      const res = platformStore.assignSupportTicket(id, operatorId, teamId, reason, actorProfile || actorName);
      if (res.success && res.ticket) {
        addToast({
          type: 'info',
          title: 'Assignment Updated',
          message: `Ticket ${res.ticket.ticketNumber} assignment updated.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Assignment Failed', message: res.error });
      }
      return res;
    },
    escalateSupportTicket: (id, reason, targetTeamId, urgencyLevel, targetTier, actorName) => {
      const err = guardPerm('support.tickets.escalate', 'escalate support ticket');
      if (err) return { success: false, error: err };
      const res = platformStore.escalateSupportTicket(
        id,
        reason,
        targetTeamId,
        urgencyLevel,
        targetTier,
        actorProfile || actorName
      );
      if (res.success && res.ticket) {
        addToast({
          type: 'warning',
          title: 'Ticket Escalated',
          message: `Ticket ${res.ticket.ticketNumber} escalated to target queue with ${urgencyLevel || 'high'} urgency.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Escalation Blocked', message: res.error });
      }
      return res;
    },
    deescalateSupportTicket: (id, notes, actorName) => {
      const err = guardPerm('support.tickets.escalate', 'de-escalate support ticket');
      if (err) return { success: false, error: err };
      const res = platformStore.deescalateSupportTicket(id, notes, actorProfile || actorName);
      if (res.success && res.ticket) {
        addToast({
          type: 'info',
          title: 'Escalation Resolved',
          message: `Ticket ${res.ticket.ticketNumber} returned to standard queue.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'De-escalation Failed', message: res.error });
      }
      return res;
    },
    addSupportTicketMessage: (ticketId, type, content, isDraft, actorName) => {
      const reqPerm =
        type === 'internal_note' ? 'support.internal_notes.manage' : 'support.tickets.manage';
      const err = guardPerm(
        reqPerm,
        type === 'internal_note' ? 'add internal operator note' : 'send support reply'
      );
      if (err) return { success: false, error: err };
      const res = platformStore.addSupportTicketMessage(
        ticketId,
        type,
        content,
        isDraft,
        actorProfile || actorName
      );
      if (res.success) {
        addToast({
          type: 'success',
          title: type === 'internal_note' ? 'Internal Note Attached' : 'Tenant Reply Recorded',
          message: isDraft
            ? 'Saved draft reply (demonstration state only).'
            : `${type === 'internal_note' ? 'Internal note added.' : 'Reply recorded in local simulation.'}`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Message Failed', message: res.error });
      }
      return res;
    },
    getSupportTeams: () => platformStore.getSupportTeams(),
    getSlaPolicies: () => platformStore.getSlaPolicies(),
    getSlaPolicyById: (id) => platformStore.getSlaPolicyById(id),
    createSlaPolicy: (input, actorName) => {
      const err = guardPerm('support.tickets.manage', 'create SLA policy');
      if (err) return { success: false, error: err };
      const res = platformStore.createSlaPolicy(input, authenticatedActorName(actorName));
      if (res.success && res.policy) {
        addToast({
          type: 'success',
          title: 'SLA Policy Created',
          message: `Configured SLA policy "${res.policy.name}".`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Policy Creation Failed', message: res.error });
      }
      return res;
    },
    updateSlaPolicy: (id, updates, actorName) => {
      const err = guardPerm('support.tickets.manage', 'update SLA policy');
      if (err) return { success: false, error: err };
      const res = platformStore.updateSlaPolicy(id, updates, authenticatedActorName(actorName));
      if (res.success && res.policy) {
        addToast({
          type: 'success',
          title: 'SLA Policy Saved',
          message: `Updated policy "${res.policy.name}".`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Update Failed', message: res.error });
      }
      return res;
    },
    toggleSlaPolicy: (id, isEnabled, actorName) => {
      const err = guardPerm('support.tickets.manage', 'toggle SLA policy');
      if (err) return { success: false, error: err };
      const res = platformStore.toggleSlaPolicy(id, isEnabled, authenticatedActorName(actorName));
      if (res.success && res.policy) {
        addToast({
          type: isEnabled ? 'success' : 'warning',
          title: 'SLA Policy Toggled',
          message: `Policy "${res.policy.name}" is now ${isEnabled ? 'enabled' : 'disabled'}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Toggle Failed', message: res.error });
      }
      return res;
    },
    getKbArticles: (filters) => platformStore.getKbArticles(filters),
    getKbArticleById: (id) => platformStore.getKbArticleById(id),
    createKbArticle: (input, actorName) => {
      const err = guardPerm('support.tickets.manage', 'create knowledge base article');
      if (err) return { success: false, error: err };
      const res = platformStore.createKbArticle(input, authenticatedActorName(actorName));
      if (res.success && res.article) {
        addToast({
          type: 'success',
          title: 'KB Article Created',
          message: `Created article "${res.article.title}".`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Creation Failed', message: res.error });
      }
      return res;
    },
    updateKbArticle: (id, updates, actorName) => {
      const err = guardPerm('support.tickets.manage', 'update knowledge base article');
      if (err) return { success: false, error: err };
      const res = platformStore.updateKbArticle(id, updates, authenticatedActorName(actorName));
      if (res.success && res.article) {
        addToast({
          type: 'success',
          title: 'KB Article Saved',
          message: `Saved updates to "${res.article.title}".`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Update Failed', message: res.error });
      }
      return res;
    },
    setKbArticleStatus: (id, status, actorName) => {
      const err = guardPerm('support.tickets.manage', 'change knowledge base article status');
      if (err) return { success: false, error: err };
      const res = platformStore.setKbArticleStatus(id, status, authenticatedActorName(actorName));
      if (res.success && res.article) {
        addToast({
          type: 'info',
          title: 'Article Status Changed',
          message: `Article is now ${status}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Status Change Failed', message: res.error });
      }
      return res;
    },
    deleteKbArticle: (id, actorName) => {
      const err = guardPerm('support.tickets.manage', 'delete knowledge base article');
      if (err) return { success: false, error: err };
      const res = platformStore.deleteKbArticle(id, authenticatedActorName(actorName));
      if (res.success) {
        addToast({
          type: 'info',
          title: 'Article Removed',
          message: 'Knowledge base article deleted from local repository.',
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Delete Failed', message: res.error });
      }
      return res;
    },
    getCsatRecords: (filters) => platformStore.getCsatRecords(filters),
    submitCustomerFeedback: (input, actorName) => {
      const err = guardPerm('support.tickets.manage', 'record customer satisfaction feedback');
      if (err) return { success: false, error: err };
      const res = platformStore.submitCustomerFeedback(input, authenticatedActorName(actorName));
      if (res.success && res.record) {
        addToast({
          type: 'success',
          title: 'Feedback Recorded',
          message: `Recorded rating of ${res.record.rating}/5 for ${res.record.ticketNumber}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Feedback Submission Failed', message: res.error });
      }
      return res;
    },
    reviewCsatRecord: (id, notes, actorName) => {
      const err = guardPerm('support.tickets.manage', 'review customer feedback record');
      if (err) return { success: false, error: err };
      const res = platformStore.reviewCsatRecord(id, notes, authenticatedActorName(actorName));
      if (res.success && res.record) {
        addToast({
          type: 'success',
          title: 'Feedback Reviewed',
          message: `Marked survey feedback for ${res.record.ticketNumber} as reviewed.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Review Failed', message: res.error });
      }
      return res;
    },
    getCsTasks: (filters) => platformStore.getCsTasks(filters),
    createCsTask: (input, actorName) => {
      const err = guardPerm('operations.tasks.manage', 'create operational follow-up task');
      if (err) return { success: false, error: err };
      const res = platformStore.createCsTask(input, actorProfile || actorName);
      if (res.success && res.task) {
        addToast({
          type: 'success',
          title: 'Task Created',
          message: `Created task "${res.task.title}".`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Task Creation Failed', message: res.error });
      }
      return res;
    },
    updateCsTask: (id, updates, actorName) => {
      const err = guardPerm('operations.tasks.manage', 'update operational task');
      if (err) return { success: false, error: err };
      const res = platformStore.updateCsTask(id, updates, actorProfile || actorName);
      if (res.success && res.task) {
        addToast({
          type: 'success',
          title: 'Task Updated',
          message: `Saved changes to "${res.task.title}".`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Task Update Failed', message: res.error });
      }
      return res;
    },
    setCsTaskStatus: (id, status, notes, actorName) => {
      const err = guardPerm('operations.tasks.manage', 'update operational task status');
      if (err) return { success: false, error: err };
      const res = platformStore.setCsTaskStatus(id, status, notes, actorProfile || actorName);
      if (res.success && res.task) {
        addToast({
          type: status === 'completed' ? 'success' : 'info',
          title: 'Task Status Updated',
          message: `Task is now ${status}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Status Update Failed', message: res.error });
      }
      return res;
    },
    deleteCsTask: (id, actorName) => {
      const err = guardPerm('operations.tasks.manage', 'delete operational task');
      if (err) return { success: false, error: err };
      const res = platformStore.deleteCsTask(id, actorName || actorProfile?.name);
      if (res.success) {
        addToast({
          type: 'info',
          title: 'Task Removed',
          message: 'Customer success task deleted.',
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Delete Failed', message: res.error });
      }
      return res;
    },
    getSupportMetrics: (refDate) => platformStore.getSupportMetrics(refDate),
    getCustomerSuccessSummaries: (refDate) => platformStore.getCustomerSuccessSummaries(refDate),
    getIntegrations: (filters) => platformStore.getIntegrations(filters),
    getIntegrationById: (id) => platformStore.getIntegrationById(id),
    getApiClients: (filters) => platformStore.getApiClients(filters),
    getApiClientById: (id) => platformStore.getApiClientById(id),
    getWebhookEndpoints: (filters) => platformStore.getWebhookEndpoints(filters),
    getWebhookEndpointById: (id) => platformStore.getWebhookEndpointById(id),
    getWebhookDeliveries: (filters) => platformStore.getWebhookDeliveries(filters),
    getWebhookDeliveryById: (id) => platformStore.getWebhookDeliveryById(id),
    getIntegrationMetrics: () => platformStore.getIntegrationMetrics(),
    getIntegrationHealthIndicators: () => platformStore.getIntegrationHealthIndicators(),
    updateIntegrationConfig: (id, updates, actorName) => {
      const err = guardPerm('system.maintenance.manage', 'update integration configuration', ['system.maintenance.manage', 'modules.registry.manage', 'platform.settings.update']);
      if (err) return { success: false, error: err };
      const res = platformStore.updateIntegrationConfig(id, updates, authenticatedActorName(actorName));
      if (res.success && res.integration) {
        addToast({
          type: 'success',
          title: 'Integration Updated',
          message: `Configuration saved for ${res.integration.name}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Update Failed', message: res.error });
      }
      return res;
    },
    toggleIntegration: (id, actorName) => {
      const err = guardPerm('system.maintenance.manage', 'toggle integration state', ['system.maintenance.manage', 'modules.registry.manage', 'platform.settings.update']);
      if (err) return { success: false, error: err };
      const res = platformStore.toggleIntegration(id, authenticatedActorName(actorName));
      if (res.success && res.integration) {
        addToast({
          type: res.integration.isEnabled ? 'success' : 'warning',
          title: res.integration.isEnabled ? 'Integration Activated' : 'Integration Deactivated',
          message: `${res.integration.name} is now ${res.integration.isEnabled ? 'enabled' : 'disabled'}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Action Failed', message: res.error });
      }
      return res;
    },
    simulateVerifyIntegration: (id, actorName) => {
      const err = guardPerm('system.maintenance.manage', 'verify integration connectivity', ['system.maintenance.manage', 'modules.registry.manage', 'platform.settings.update']);
      if (err) return { success: false, verificationStatus: 'failed' as const, message: err };
      const res = platformStore.simulateVerifyIntegration(id, authenticatedActorName(actorName));
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Verification Passed (Demo)',
          message: res.message,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Verification Failed',
          message: res.message,
        });
      }
      return res;
    },
    createApiClient: (input, actorName) => {
      const err = guardPerm('system.maintenance.manage', 'register API client', ['system.maintenance.manage', 'modules.registry.manage', 'platform.settings.update']);
      if (err) return { success: false, error: err };
      const res = platformStore.createApiClient(input, authenticatedActorName(actorName));
      if (res.success && res.client) {
        addToast({
          type: 'success',
          title: 'API Client Registered',
          message: `Generated client ${res.client.clientId} (${res.client.name}). Safe demo credential preview available.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Registration Failed', message: res.error });
      }
      return res;
    },
    updateApiClient: (id, updates, actorName) => {
      const err = guardPerm('system.maintenance.manage', 'update API client', ['system.maintenance.manage', 'modules.registry.manage', 'platform.settings.update']);
      if (err) return { success: false, error: err };
      const res = platformStore.updateApiClient(id, updates, authenticatedActorName(actorName));
      if (res.success && res.client) {
        addToast({
          type: 'success',
          title: 'Client Updated',
          message: `Updated profile and scopes for ${res.client.name}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Update Failed', message: res.error });
      }
      return res;
    },
    revokeApiClient: (id, reason, actorName) => {
      const err = guardPerm('system.maintenance.manage', 'revoke API client credentials', ['system.maintenance.manage', 'modules.registry.manage', 'platform.settings.update']);
      if (err) return { success: false, error: err };
      const res = platformStore.revokeApiClient(id, reason, authenticatedActorName(actorName));
      if (res.success && res.client) {
        addToast({
          type: 'warning',
          title: 'API Client Revoked',
          message: `Credentials for ${res.client.name} have been revoked. Incoming requests will be rejected.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Revocation Failed', message: res.error });
      }
      return res;
    },
    createWebhookEndpoint: (input, actorName) => {
      const err = guardPerm('system.maintenance.manage', 'create webhook endpoint', ['system.maintenance.manage', 'modules.registry.manage', 'platform.settings.update']);
      if (err) return { success: false, error: err };
      const res = platformStore.createWebhookEndpoint(input, authenticatedActorName(actorName));
      if (res.success && res.endpoint) {
        addToast({
          type: 'success',
          title: 'Webhook Endpoint Created',
          message: `Subscribed to ${res.endpoint.subscribedEvents.length} events at ${res.endpoint.destinationUrl}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Creation Failed', message: res.error });
      }
      return res;
    },
    updateWebhookEndpoint: (id, updates, actorName) => {
      const err = guardPerm('system.maintenance.manage', 'update webhook endpoint', ['system.maintenance.manage', 'modules.registry.manage', 'platform.settings.update']);
      if (err) return { success: false, error: err };
      const res = platformStore.updateWebhookEndpoint(id, updates, authenticatedActorName(actorName));
      if (res.success && res.endpoint) {
        addToast({
          type: 'success',
          title: 'Endpoint Updated',
          message: `Saved configuration for ${res.endpoint.name}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Update Failed', message: res.error });
      }
      return res;
    },
    toggleWebhookEndpoint: (id, actorName) => {
      const err = guardPerm('system.maintenance.manage', 'toggle webhook endpoint', ['system.maintenance.manage', 'modules.registry.manage', 'platform.settings.update']);
      if (err) return { success: false, error: err };
      const res = platformStore.toggleWebhookEndpoint(id, authenticatedActorName(actorName));
      if (res.success && res.endpoint) {
        addToast({
          type: res.endpoint.isEnabled ? 'success' : 'warning',
          title: res.endpoint.isEnabled ? 'Endpoint Enabled' : 'Endpoint Disabled',
          message: `${res.endpoint.name} is now ${res.endpoint.isEnabled ? 'active' : 'paused'}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Toggle Failed', message: res.error });
      }
      return res;
    },
    simulateTestWebhookDelivery: (endpointId, eventTypeId, simulateSuccess, actorName) => {
      const err = guardPerm('system.maintenance.manage', 'simulate webhook test dispatch', ['system.maintenance.manage', 'modules.registry.manage', 'platform.settings.update']);
      if (err) return { success: false, error: err };
      const res = platformStore.simulateTestWebhookDelivery(endpointId, eventTypeId, simulateSuccess, authenticatedActorName(actorName));
      if (res.success && res.delivery) {
        addToast({
          type: res.delivery.outcome === 'simulated_success' ? 'success' : 'warning',
          title: res.delivery.outcome === 'simulated_success' ? 'Test Dispatch Delivered (Demo)' : 'Test Dispatch Failed (Demo)',
          message: `Simulated dispatch of ${res.delivery.eventType} returned HTTP ${res.delivery.httpStatusCode} (${res.delivery.durationMs}ms). No external network request dispatched.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Dispatch Blocked', message: res.error });
      }
      return res;
    },
    simulateRetryWebhookDelivery: (deliveryId, simulateSuccess, actorName) => {
      const err = guardPerm('system.maintenance.manage', 'simulate webhook retry', ['system.maintenance.manage', 'modules.registry.manage', 'platform.settings.update']);
      if (err) return { success: false, error: err };
      const res = platformStore.simulateRetryWebhookDelivery(deliveryId, simulateSuccess, authenticatedActorName(actorName));
      if (res.success && res.delivery) {
        addToast({
          type: res.delivery.outcome === 'simulated_success' ? 'success' : 'warning',
          title: res.delivery.outcome === 'simulated_success' ? 'Retry Succeeded (Demo)' : 'Retry Failed (Demo)',
          message: `Attempt #${res.delivery.currentAttempt} resulted in ${res.delivery.outcome} (HTTP ${res.delivery.httpStatusCode}). Local demonstration state updated.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Retry Rejected', message: res.error });
      }
      return res;
    },
    getDataCategories: (filters) => platformStore.getDataCategories(filters),
    getDataCategoryById: (id) => platformStore.getDataCategoryById(id),
    updateDataCategory: (id, updates, actorName) => {
      const err = guardPerm('audit.governance.manage', 'update data classification category');
      if (err) return { success: false, error: err };
      const res = platformStore.updateDataCategory(id, updates, authenticatedActorName(actorName));
      if (res.success && res.category) {
        addToast({
          type: 'success',
          title: 'Data Category Updated',
          message: `Updated classification and metadata for ${res.category.code}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Update Failed', message: res.error });
      }
      return res;
    },
    getGovernanceRetentionPolicies: (filters) => platformStore.getGovernanceRetentionPolicies(filters),
    getGovernanceRetentionPolicyById: (id) => platformStore.getGovernanceRetentionPolicyById(id),
    createGovernanceRetentionPolicy: (input, actorName) => {
      const err = guardPerm('audit.governance.manage', 'create governance retention policy');
      if (err) return { success: false, error: err };
      const res = platformStore.createGovernanceRetentionPolicy(input, authenticatedActorName(actorName));
      if (res.success && res.policy) {
        addToast({
          type: 'success',
          title: 'Retention Schedule Created',
          message: `Created demo schedule ${res.policy.code} (${res.policy.durationDisplay}).`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Creation Failed', message: res.error });
      }
      return res;
    },
    updateGovernanceRetentionPolicy: (id, updates, actorName) => {
      const err = guardPerm('audit.governance.manage', 'update governance retention policy');
      if (err) return { success: false, error: err };
      const res = platformStore.updateGovernanceRetentionPolicy(id, updates, authenticatedActorName(actorName));
      if (res.success && res.policy) {
        addToast({
          type: 'success',
          title: 'Policy Updated',
          message: `Saved retention policy modifications for ${res.policy.code}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Update Failed', message: res.error });
      }
      return res;
    },
    reviewGovernanceRetentionPolicy: (id, reviewOutcome, nextReviewDueAt, actorName) => {
      const err = guardPerm('audit.governance.manage', 'review governance retention policy');
      if (err) return { success: false, error: err };
      const res = platformStore.reviewGovernanceRetentionPolicy(id, reviewOutcome, nextReviewDueAt, authenticatedActorName(actorName));
      if (res.success && res.policy) {
        addToast({
          type: 'success',
          title: 'Policy Review Recorded',
          message: `Status recorded as ${reviewOutcome}. Next review: ${res.policy.nextReviewDueAt.split('T')[0]}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Review Failed', message: res.error });
      }
      return res;
    },
    getPrivacyRequests: (filters) => platformStore.getPrivacyRequests(filters),
    getPrivacyRequestById: (id) => platformStore.getPrivacyRequestById(id),
    createPrivacyRequest: (input, actorName) => {
      const err = guardPerm('audit.governance.manage', 'register privacy compliance request');
      if (err) return { success: false, error: err };
      const res = platformStore.createPrivacyRequest(input, authenticatedActorName(actorName));
      if (res.success && res.request) {
        addToast({
          type: 'success',
          title: 'Privacy Request Logged',
          message: `Registered request ${res.request.code} (${res.request.category}) for ${res.request.tenantName}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Intake Failed', message: res.error });
      }
      return res;
    },
    updatePrivacyRequestStatus: (id, targetStatus, reviewNotes, resolutionCategory, actorName) => {
      const err = guardPerm('audit.governance.manage', 'update privacy request workflow');
      if (err) return { success: false, error: err };
      const res = platformStore.updatePrivacyRequestStatus(id, targetStatus, reviewNotes, resolutionCategory, authenticatedActorName(actorName));
      if (res.success && res.request) {
        addToast({
          type: targetStatus === 'rejected_with_grounds' ? 'warning' : 'info',
          title: 'Privacy Request Transitioned',
          message: `Request ${res.request.code} is now "${targetStatus}".`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Transition Rejected', message: res.error });
      }
      return res;
    },
    simulatePrivacyRequestProcessing: (id, actorName) => {
      const err = guardPerm('audit.governance.manage', 'simulate privacy request execution');
      if (err) return { success: false, error: err };
      const res = platformStore.simulatePrivacyRequestProcessing(id, authenticatedActorName(actorName));
      if (res.success && res.request) {
        addToast({
          type: 'success',
          title: 'Simulated Execution Completed',
          message: `Generated synthetic manifest (${res.request.simulatedArtifactManifest?.fieldsProcessedCount || 0} fields). Zero real customer data modified.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Simulation Blocked', message: res.error });
      }
      return res;
    },
    getDataLifecycleRules: (filters) => platformStore.getDataLifecycleRules(filters),
    getDataLifecycleRuleById: (id) => platformStore.getDataLifecycleRuleById(id),
    createDataLifecycleRule: (input, actorName) => {
      const err = guardPerm('audit.governance.manage', 'create data lifecycle rule');
      if (err) return { success: false, error: err };
      const res = platformStore.createDataLifecycleRule(input, authenticatedActorName(actorName));
      if (res.success && res.rule) {
        addToast({
          type: 'success',
          title: 'Lifecycle Rule Created',
          message: `Configured rule ${res.rule.code} to stage "${res.rule.targetLifecycleStage}".`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Creation Failed', message: res.error });
      }
      return res;
    },
    updateDataLifecycleRule: (id, updates, actorName) => {
      const err = guardPerm('audit.governance.manage', 'update data lifecycle rule');
      if (err) return { success: false, error: err };
      const res = platformStore.updateDataLifecycleRule(id, updates, authenticatedActorName(actorName));
      if (res.success && res.rule) {
        addToast({
          type: 'success',
          title: 'Lifecycle Rule Updated',
          message: `Updated configuration for rule ${res.rule.code}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Update Failed', message: res.error });
      }
      return res;
    },
    toggleDataLifecycleRule: (id, actorName) => {
      const err = guardPerm('audit.governance.manage', 'toggle data lifecycle rule');
      if (err) return { success: false, error: err };
      const res = platformStore.toggleDataLifecycleRule(id, authenticatedActorName(actorName));
      if (res.success && res.rule) {
        addToast({
          type: res.rule.status === 'enabled' ? 'success' : 'warning',
          title: res.rule.status === 'enabled' ? 'Lifecycle Rule Enabled' : 'Lifecycle Rule Disabled',
          message: `Rule ${res.rule.code} is now ${res.rule.status}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Action Failed', message: res.error });
      }
      return res;
    },
    getGovernanceExceptions: (filters) => platformStore.getGovernanceExceptions(filters),
    getGovernanceExceptionById: (id) => platformStore.getGovernanceExceptionById(id),
    createGovernanceException: (input, actorName) => {
      const err = guardPerm('audit.governance.manage', 'register governance exception');
      if (err) return { success: false, error: err };
      const res = platformStore.createGovernanceException(input, authenticatedActorName(actorName));
      if (res.success && res.exception) {
        addToast({
          type: 'warning',
          title: 'Governance Exception Registered',
          message: `Logged exception ${res.exception.code} ("${res.exception.title}"). Requires ${res.exception.approvalRequirement}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Exception Failed', message: res.error });
      }
      return res;
    },
    reviewGovernanceException: (id, reviewStatus, resolutionSummary, actorName) => {
      const err = guardPerm('audit.governance.manage', 'review governance exception');
      if (err) return { success: false, error: err };
      const res = platformStore.reviewGovernanceException(id, reviewStatus, resolutionSummary, authenticatedActorName(actorName));
      if (res.success && res.exception) {
        addToast({
          type: reviewStatus === 'approved_demo' ? 'success' : 'warning',
          title: 'Exception Review Recorded',
          message: `Exception ${res.exception.code} marked as ${reviewStatus}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Review Failed', message: res.error });
      }
      return res;
    },
    getTenantGovernanceSummaries: () => platformStore.getTenantGovernanceSummaries(),
    getGovernanceMetrics: () => platformStore.getGovernanceMetrics(),
    getGovernanceAuditLogs: (filters) => platformStore.getGovernanceAuditLogs(filters),

    // P0-6: Operations Center, Approvals, Notices & Exceptions
    operationalOverview: platformStore.getOperationalOverview().overview,
    operationalQueues: platformStore.getOperationalOverview().queues,
    platformApprovals: platformStore.getPlatformApprovals(),
    platformNotices: platformStore.getPlatformNotices(),
    operationalExceptions: platformStore.getOperationalExceptions(),
    createApprovalRequest: (input) => {
      const err = guardPerm('operations.tasks.manage', 'submit administrative approval request', [
        'operations.approvals.manage',
        'operations.tasks.manage',
        'organizations.lifecycle.manage',
        'communications.notices.manage',
        'support.tickets.escalate',
      ]);
      if (err) return { success: false, error: err };
      const res = platformStore.createApprovalRequest(input, actorProfile || 'Platform Operator');
      if (res.success && res.approval) {
        addToast({
          type: 'success',
          title: 'Approval Request Submitted',
          message: `Created governance approval ${res.approval.referenceCode}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Request Failed', message: res.error });
      }
      return res;
    },
    reviewApprovalRequest: (approvalId, decision, notes) => {
      const err = guardPerm('operations.approvals.manage', `${decision} governance approval request`);
      if (err) return { success: false, error: err };
      const res = platformStore.reviewApprovalRequest(
        approvalId,
        decision,
        actorProfile || 'Platform Operator',
        notes
      );
      if (res.success && res.approval) {
        addToast({
          type: decision === 'approved' ? 'success' : 'warning',
          title: `Approval ${decision.toUpperCase()}`,
          message: `${res.approval.referenceCode} updated (Frontend demonstration workflow).`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Decision Blocked', message: res.error });
      }
      return res;
    },
    createPlatformNotice: (input) => {
      const err = guardPerm('communications.notices.manage', 'create platform notice');
      if (err) return { success: false, error: err };
      const res = platformStore.createPlatformNotice(input, actorProfile || 'Platform Operator');
      if (res.success && res.notice) {
        addToast({
          type: 'success',
          title: 'Platform Notice Created',
          message: `Saved simulated notice ${res.notice.referenceCode} (${res.notice.status}).`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Notice Failed', message: res.error });
      }
      return res;
    },
    transitionPlatformNoticeStatus: (noticeId, nextStatus) => {
      const err = guardPerm('communications.notices.manage', 'update platform notice status');
      if (err) return { success: false, error: err };
      const res = platformStore.transitionPlatformNoticeStatus(
        noticeId,
        nextStatus,
        actorProfile || 'Platform Operator'
      );
      if (res.success && res.notice) {
        addToast({
          type: nextStatus === 'published_simulated' ? 'success' : 'info',
          title: 'Notice Status Updated',
          message: `${res.notice.referenceCode} transitioned to ${nextStatus} (simulated only).`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Notice Action Blocked', message: res.error });
      }
      return res;
    },
    triageOperationalException: (exceptionId, nextStatus, options) => {
      const err = guardPerm('operations.exceptions.manage', 'triage operational exception');
      if (err) return { success: false, error: err };
      const res = platformStore.triageOperationalException(
        exceptionId,
        nextStatus,
        actorProfile || 'Platform Operator',
        options
      );
      if (res.success && res.exception) {
        addToast({
          type: nextStatus === 'resolved' ? 'success' : 'warning',
          title: 'Exception Updated',
          message: `${res.exception.referenceCode} marked as ${nextStatus}.`,
        });
      } else if (res.error) {
        addToast({ type: 'error', title: 'Exception Triage Failed', message: res.error });
      }
      return res;
    },
  };


  return (
    <PlatformStoreContext.Provider value={value}>
      {children}
      {/* Toast notifications container */}
      <div
        role="region"
        aria-label="Platform notifications"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
            className={`pointer-events-auto p-4 rounded-lg shadow-lg border text-sm flex items-start justify-between gap-3 transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-100'
                : toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100'
                : toast.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-100'
                : 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100'
            }`}
          >
            <div>
              <p className="font-semibold text-xs tracking-wider uppercase opacity-90">{toast.title}</p>
              {toast.message && <p className="mt-0.5 text-xs opacity-90">{toast.message}</p>}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => removeToast(toast.id)}
              className="text-xs opacity-60 hover:opacity-100 font-bold px-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </PlatformStoreContext.Provider>
  );
}

export function usePlatformStore() {
  const context = useContext(PlatformStoreContext);
  if (!context) {
    throw new Error('usePlatformStore must be used within a PlatformStoreProvider');
  }
  return context;
}
