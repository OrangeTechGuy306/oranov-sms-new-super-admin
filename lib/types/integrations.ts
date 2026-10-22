/**
 * Domain contracts for Platform API Management, Webhooks and Integration Governance (Phase E-09.19).
 * NOTE: All records in this domain are frontend demonstration fixtures and simulated state.
 * Real credentials, live webhook dispatches, and third-party API connectivity require dedicated backend services.
 */

export type IntegrationCategory =
  | 'payment'
  | 'email_sms'
  | 'identity_sso'
  | 'video_conferencing'
  | 'storage'
  | 'sis_lms'
  | 'analytics'
  | 'custom_api';

export type IntegrationType =
  | 'inbound_api'
  | 'outbound_webhook'
  | 'bidirectional_oauth'
  | 'event_stream';

export type IntegrationConfigStatus =
  | 'configured'
  | 'incomplete'
  | 'not_configured'
  | 'expired';

export type IntegrationVerificationStatus =
  | 'verified_demo'
  | 'unverified'
  | 'verification_pending'
  | 'failed';

export interface IntegrationConfigItem {
  key: string;
  label: string;
  value?: string;
  isSecret?: boolean;
  isRequired?: boolean;
  placeholder?: string;
}

export interface IntegrationRecord {
  id: string;
  name: string;
  provider: string;
  category: IntegrationCategory;
  type: IntegrationType;
  description: string;
  configStatus: IntegrationConfigStatus;
  isEnabled: boolean;
  scope: 'platform_wide' | 'tenant_scoped';
  allowedTenantsCount?: number;
  requiredPermissions: string[];
  capabilities: string[];
  verificationStatus: IntegrationVerificationStatus;
  lastVerifiedAt?: string;
  lastConfigUpdatedAt: string;
  config: {
    baseUrl?: string;
    environment?: 'sandbox' | 'staging' | 'production';
    authType?: 'bearer_token' | 'api_key' | 'oauth2' | 'hmac_signature';
    maskedKeyPlaceholder?: string;
    rateLimitPerMin?: number;
    webhookEndpointId?: string;
    customHeaders?: Record<string, string>;
    items?: IntegrationConfigItem[];
  };
  documentationUrl?: string;
  isDemoFixture: boolean;
  sourceClassification: 'demo_model' | 'verified_fixture';
  missingFields?: string[];
}

export type ApiClientType =
  | 'first_party_console'
  | 'tenant_backend'
  | 'partner_sis'
  | 'bi_analytics'
  | 'automation_worker';

export type ApiClientStatus =
  | 'active'
  | 'disabled'
  | 'revoked'
  | 'expired';

export interface ApiScope {
  key: string;
  name: string;
  description: string;
  category: 'core' | 'governance' | 'monetization' | 'integrations' | 'system';
  isElevated: boolean;
}

export interface ApiClientRecord {
  id: string;
  clientId: string; // Non-secret fictional identifier, e.g. "sms_app_8f293b109e"
  name: string;
  description: string;
  clientType: ApiClientType;
  status: ApiClientStatus;
  organizationId?: string; // "platform" or specific organization ID
  organizationName?: string;
  assignedScopes: string[];
  ipWhitelist: string[];
  rateLimitRps: number;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  lastRotatedAt?: string;
  isDemoFixture: boolean;
  maskedCredentialPlaceholder: string; // Fictional masked token preview e.g. "sk_demo_••••••••••••••••38f1"
}

export interface WebhookEventType {
  id: string; // e.g. "organization.created"
  name: string;
  category: 'organization' | 'subscription' | 'governance' | 'examination' | 'communication' | 'system';
  description: string;
  availability: 'available' | 'beta' | 'deprecated';
  examplePayload: Record<string, unknown>;
}

export interface WebhookRetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
  initialIntervalSec: number;
}

export interface WebhookEndpointRecord {
  id: string;
  name: string;
  destinationUrl: string; // Fictional test URL
  description: string;
  associatedIntegrationId?: string;
  associatedClientId?: string;
  subscribedEvents: string[];
  isEnabled: boolean;
  signingSecretMasked: string; // e.g. "whsec_demo_•••••••••••••7b9a"
  timeoutMs: number;
  retryPolicy: WebhookRetryPolicy;
  rateLimitPerSec: number;
  createdAt: string;
  updatedAt: string;
  lastDeliveryOutcome?: WebhookDeliveryOutcome;
  lastDeliveryAt?: string;
  isDemoFixture: boolean;
}

export type WebhookDeliveryOutcome =
  | 'simulated_success'
  | 'simulated_failure'
  | 'retry_eligible'
  | 'retry_scheduled'
  | 'exhausted_retries'
  | 'cancelled'
  | 'pending';

export interface WebhookDeliveryAttempt {
  attemptNumber: number;
  timestamp: string;
  httpStatusCode: number;
  durationMs: number;
  responseHeaders: Record<string, string>;
  responseBody: string;
  errorSummary?: string;
}

export interface WebhookDeliveryRecord {
  id: string;
  endpointId: string;
  endpointName: string;
  destinationUrl: string;
  eventType: string;
  eventId: string;
  createdAt: string;
  completedAt?: string;
  outcome: WebhookDeliveryOutcome;
  currentAttempt: number;
  maxAttempts: number;
  nextRetryAt?: string;
  durationMs: number;
  httpStatusCode: number;
  errorSummary?: string;
  requestHeaders: Record<string, string>;
  payload: Record<string, unknown>;
  attempts: WebhookDeliveryAttempt[];
  isDemoFixture: boolean;
}

export type IntegrationHealthSeverity =
  | 'healthy'
  | 'informational'
  | 'warning'
  | 'critical';

export interface IntegrationHealthIndicator {
  id: string;
  entityType: 'integration' | 'api_client' | 'webhook_endpoint';
  entityId: string;
  entityName: string;
  severity: IntegrationHealthSeverity;
  title: string;
  reason: string;
  recommendedAction: string;
  targetTab: string;
  updatedAt: string;
  isDerivedFromDemo: boolean;
}

export interface IntegrationMetricsSummary {
  totalIntegrations: number;
  enabledIntegrations: number;
  disabledIntegrations: number;
  requiringConfigIntegrations: number;
  totalApiClients: number;
  activeApiClients: number;
  totalWebhookEndpoints: number;
  failedDeliveriesCount: number;
  retryEligibleCount: number;
  configWarningsCount: number;
  deliveriesByOutcome: Record<WebhookDeliveryOutcome, number>;
  integrationsByCategory: Record<IntegrationCategory, number>;
}

// Action Inputs
export interface CreateIntegrationInput {
  name: string;
  provider: string;
  category: IntegrationCategory;
  type: IntegrationType;
  description: string;
  scope: 'platform_wide' | 'tenant_scoped';
  requiredPermissions: string[];
  capabilities: string[];
  config?: {
    baseUrl?: string;
    environment?: 'sandbox' | 'staging' | 'production';
    authType?: 'bearer_token' | 'api_key' | 'oauth2' | 'hmac_signature';
    rateLimitPerMin?: number;
    webhookEndpointId?: string;
    items?: IntegrationConfigItem[];
  };
}

export interface UpdateIntegrationInput {
  name?: string;
  description?: string;
  configStatus?: IntegrationConfigStatus;
  isEnabled?: boolean;
  verificationStatus?: IntegrationVerificationStatus;
  config?: Partial<IntegrationRecord['config']>;
  missingFields?: string[];
}

export interface CreateApiClientInput {
  name: string;
  description: string;
  clientType: ApiClientType;
  organizationId?: string;
  organizationName?: string;
  assignedScopes: string[];
  ipWhitelist?: string[];
  rateLimitRps?: number;
  expiresInDays?: number;
}

export interface UpdateApiClientInput {
  name?: string;
  description?: string;
  assignedScopes?: string[];
  ipWhitelist?: string[];
  rateLimitRps?: number;
  status?: ApiClientStatus;
}

export interface CreateWebhookEndpointInput {
  name: string;
  destinationUrl: string;
  description: string;
  associatedIntegrationId?: string;
  associatedClientId?: string;
  subscribedEvents: string[];
  timeoutMs?: number;
  rateLimitPerSec?: number;
  retryPolicy?: Partial<WebhookRetryPolicy>;
}

export interface UpdateWebhookEndpointInput {
  name?: string;
  destinationUrl?: string;
  description?: string;
  subscribedEvents?: string[];
  isEnabled?: boolean;
  timeoutMs?: number;
  rateLimitPerSec?: number;
  retryPolicy?: Partial<WebhookRetryPolicy>;
}
