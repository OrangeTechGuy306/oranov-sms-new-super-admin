import {
  IntegrationRecord,
  ApiClientRecord,
  WebhookEndpointRecord,
  WebhookDeliveryRecord,
  WebhookEventType,
  IntegrationHealthIndicator,
  IntegrationMetricsSummary,
  CreateApiClientInput,
  CreateWebhookEndpointInput,
  WebhookDeliveryOutcome,
  IntegrationCategory,
} from '../types/integrations';

/**
 * Validates a destination URL for webhook dispatch.
 * Confirms RFC protocol structure without making any outbound network requests.
 */
export function validateWebhookUrl(url: string): {
  isValid: boolean;
  error?: string;
  isDemoDomain: boolean;
} {
  if (!url || !url.trim()) {
    return { isValid: false, error: 'Destination URL is required.', isDemoDomain: false };
  }

  const trimmed = url.trim();

  // Basic RFC format test
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL syntax. Must be a valid absolute URI (e.g. https://example.com/webhooks).',
      isDemoDomain: false,
    };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {
      isValid: false,
      error: 'Webhook destination protocol must be HTTPS (or HTTP for local demonstration).',
      isDemoDomain: false,
    };
  }

  // Detect fictional demonstration or RFC test domains
  const host = parsed.hostname.toLowerCase();
  const isDemo =
    host.endsWith('.example') ||
    host.endsWith('.example.org') ||
    host.endsWith('.example.com') ||
    host.endsWith('.test') ||
    host.endsWith('.internal') ||
    host.endsWith('.local') ||
    host === 'localhost' ||
    host === '127.0.0.1';

  return { isValid: true, isDemoDomain: isDemo };
}

/**
 * Validates input parameters for creating or editing an API client.
 */
export function validateApiClientInput(input: CreateApiClientInput): {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: string[];
} {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  if (!input.name || input.name.trim().length < 3) {
    errors.name = 'Client name must be at least 3 characters.';
  }

  if (!input.description || input.description.trim().length < 5) {
    errors.description = 'Description must be at least 5 characters explaining client purpose.';
  }

  if (!input.assignedScopes || input.assignedScopes.length === 0) {
    errors.assignedScopes = 'At least one API scope must be selected.';
  }

  // Detect elevated privilege combinations
  const elevatedScopes = [
    'organizations:write',
    'subscriptions:manage',
    'audit:read',
    'platform_users:manage',
    'webhooks:manage',
    'integrations:manage',
  ];

  const assignedElevated = (input.assignedScopes || []).filter((s) => elevatedScopes.includes(s));
  if (assignedElevated.length > 0) {
    warnings.push(
      `Elevated permission assigned (${assignedElevated.join(', ')}). In production, enforce mutual TLS or strict IP whitelisting.`
    );
  }

  if (assignedElevated.length > 0 && (!input.ipWhitelist || input.ipWhitelist.length === 0)) {
    warnings.push('Elevated privileges granted without IP address restrictions. Recommendation: specify trusted CIDR blocks.');
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates parameters for creating or updating a webhook endpoint.
 */
export function validateWebhookEndpointInput(input: CreateWebhookEndpointInput): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim().length < 3) {
    errors.name = 'Endpoint name must be at least 3 characters.';
  }

  const urlCheck = validateWebhookUrl(input.destinationUrl);
  if (!urlCheck.isValid) {
    errors.destinationUrl = urlCheck.error || 'Invalid destination URL.';
  }

  if (!input.subscribedEvents || input.subscribedEvents.length === 0) {
    errors.subscribedEvents = 'Select at least one webhook event subscription.';
  }

  if (input.timeoutMs !== undefined && (input.timeoutMs < 500 || input.timeoutMs > 30000)) {
    errors.timeoutMs = 'Timeout must be between 500ms and 30,000ms.';
  }

  if (input.rateLimitPerSec !== undefined && (input.rateLimitPerSec < 1 || input.rateLimitPerSec > 500)) {
    errors.rateLimitPerSec = 'Rate limit must be between 1 and 500 requests per second.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Evaluates whether a webhook delivery record is eligible for simulated retry.
 */
export function canRetryDelivery(delivery: WebhookDeliveryRecord): {
  eligible: boolean;
  reason?: string;
} {
  if (delivery.outcome === 'simulated_success') {
    return {
      eligible: false,
      reason: 'Delivery already succeeded. Redelivery is unnecessary for settled requests.',
    };
  }

  if (delivery.outcome === 'cancelled') {
    return {
      eligible: false,
      reason: 'Delivery was manually cancelled by a platform operator.',
    };
  }

  if (delivery.currentAttempt >= delivery.maxAttempts && delivery.outcome === 'exhausted_retries') {
    return {
      eligible: true, // Manual operator override allowed for dead-letter reprocessing
      reason: 'Manual operator retry permitted for dead-letter re-evaluation.',
    };
  }

  if (
    delivery.outcome === 'simulated_failure' ||
    delivery.outcome === 'retry_eligible' ||
    delivery.outcome === 'retry_scheduled'
  ) {
    return { eligible: true };
  }

  return {
    eligible: false,
    reason: `Current delivery state (${delivery.outcome}) is not retry-eligible.`,
  };
}

/**
 * Executes a simulated retry attempt in frontend state, advancing the attempt count
 * and computing the resulting state according to documented delivery policies.
 * No external network requests are dispatched.
 */
export function executeSimulatedRetry(
  delivery: WebhookDeliveryRecord,
  simulateSuccess = true
): {
  success: boolean;
  delivery?: WebhookDeliveryRecord;
  error?: string;
} {
  const check = canRetryDelivery(delivery);
  if (!check.eligible) {
    return { success: false, error: check.reason || 'Delivery is not eligible for retry.' };
  }

  const newAttemptNumber = delivery.currentAttempt + 1;
  const now = new Date().toISOString();

  let newOutcome: WebhookDeliveryOutcome;
  let newStatusCode: number;
  let newErrorSummary: string | undefined;
  let durationMs: number;

  if (simulateSuccess) {
    newOutcome = 'simulated_success';
    newStatusCode = 200;
    durationMs = Math.floor(Math.random() * 150) + 75; // realistic 75-225ms
    newErrorSummary = undefined;
  } else {
    durationMs = Math.floor(Math.random() * 800) + 400; // 400-1200ms
    newStatusCode = 502;
    newErrorSummary = 'Simulated 502 Bad Gateway: Upstream destination application server timed out.';

    if (newAttemptNumber >= delivery.maxAttempts) {
      newOutcome = 'exhausted_retries';
    } else {
      newOutcome = 'retry_scheduled';
    }
  }

  const newAttempt = {
    attemptNumber: newAttemptNumber,
    timestamp: now,
    httpStatusCode: newStatusCode,
    durationMs,
    responseHeaders: {
      'content-type': 'application/json',
      'x-simulated-attempt': String(newAttemptNumber),
    },
    responseBody: simulateSuccess ? '{"status":"ok","received":true}' : '{"error":"bad_gateway"}',
    errorSummary: newErrorSummary,
  };

  const updatedDelivery: WebhookDeliveryRecord = {
    ...delivery,
    currentAttempt: newAttemptNumber,
    outcome: newOutcome,
    httpStatusCode: newStatusCode,
    durationMs,
    errorSummary: newErrorSummary,
    completedAt: newOutcome === 'simulated_success' || newOutcome === 'exhausted_retries' ? now : undefined,
    nextRetryAt:
      newOutcome === 'retry_scheduled'
        ? new Date(Date.now() + 60000 * Math.pow(2, newAttemptNumber - 1)).toISOString()
        : undefined,
    attempts: [...delivery.attempts, newAttempt],
  };

  return {
    success: true,
    delivery: updatedDelivery,
  };
}

/**
 * Creates a simulated test webhook delivery entry for a given endpoint and event type.
 * Records the simulation locally without performing external network requests.
 */
export function executeSimulatedTestDelivery(
  endpoint: WebhookEndpointRecord,
  eventType: WebhookEventType,
  simulateSuccess = true
): WebhookDeliveryRecord {
  const now = new Date().toISOString();
  const deliveryId = `del_test_${Date.now().toString(36)}`;
  const eventId = `evt_test_${Date.now().toString(36)}`;

  const durationMs = simulateSuccess
    ? Math.floor(Math.random() * 180) + 60
    : Math.floor(Math.random() * 1200) + 1000;

  const httpStatusCode = simulateSuccess ? 200 : 504;
  const outcome: WebhookDeliveryOutcome = simulateSuccess ? 'simulated_success' : 'retry_eligible';
  const errorSummary = simulateSuccess
    ? undefined
    : 'Simulated 504 Gateway Timeout: Endpoint did not complete handshake within test deadline.';

  return {
    id: deliveryId,
    endpointId: endpoint.id,
    endpointName: endpoint.name,
    destinationUrl: endpoint.destinationUrl,
    eventType: eventType.id,
    eventId,
    createdAt: now,
    completedAt: simulateSuccess ? now : undefined,
    outcome,
    currentAttempt: 1,
    maxAttempts: endpoint.retryPolicy.maxRetries || 3,
    durationMs,
    httpStatusCode,
    errorSummary,
    nextRetryAt: outcome === 'retry_eligible' ? new Date(Date.now() + 60000).toISOString() : undefined,
    requestHeaders: {
      'Content-Type': 'application/json',
      'User-Agent': 'SchoolSaaS-WebhookDispatcher/1.0',
      'X-SMS-Delivery-Id': deliveryId,
      'X-SMS-Signature': `sha256=simulated_${Math.random().toString(16).slice(2, 18)}`,
      'X-SMS-Event-Type': eventType.id,
    },
    payload: eventType.examplePayload,
    attempts: [
      {
        attemptNumber: 1,
        timestamp: now,
        httpStatusCode,
        durationMs,
        responseHeaders: {
          'content-type': 'application/json',
          'x-simulation-marker': 'frontend-test-dispatch',
        },
        responseBody: simulateSuccess ? '{"received":true,"status":"accepted"}' : '',
        errorSummary,
      },
    ],
    isDemoFixture: true,
  };
}

/**
 * Simulates a connection verification ping for an integration.
 * Performs format and configuration consistency validation locally.
 */
export function executeSimulatedConnectionVerification(integration: IntegrationRecord): {
  success: boolean;
  verificationStatus: 'verified_demo' | 'failed';
  message: string;
} {
  if (integration.configStatus === 'incomplete' || (integration.missingFields && integration.missingFields.length > 0)) {
    return {
      success: false,
      verificationStatus: 'failed',
      message: `Verification rejected: Integration is missing required configuration parameters (${(
        integration.missingFields || []
      ).join(', ')}).`,
    };
  }

  if (integration.configStatus === 'not_configured') {
    return {
      success: false,
      verificationStatus: 'failed',
      message: 'Verification rejected: Integration is not yet configured.',
    };
  }

  return {
    success: true,
    verificationStatus: 'verified_demo',
    message: `Simulated connection check passed for "${integration.name}". Protocol contracts verified against local demonstration model. No external network request dispatched.`,
  };
}

/**
 * Computes integration health and diagnostics indicators across all entities.
 */
export function computeIntegrationHealthIndicators(
  integrations: IntegrationRecord[],
  apiClients: ApiClientRecord[],
  endpoints: WebhookEndpointRecord[],
  deliveries: WebhookDeliveryRecord[]
): IntegrationHealthIndicator[] {
  const indicators: IntegrationHealthIndicator[] = [];
  const now = new Date().toISOString();

  // 1. Integrations checks
  for (const item of integrations) {
    if (item.configStatus === 'incomplete' || (item.missingFields && item.missingFields.length > 0)) {
      indicators.push({
        id: `health_int_incomplete_${item.id}`,
        entityType: 'integration',
        entityId: item.id,
        entityName: item.name,
        severity: 'critical',
        title: `Configuration Incomplete: ${item.name}`,
        reason: `Missing mandatory setup parameters: ${(item.missingFields || []).join(', ')}.`,
        recommendedAction: 'Open integration configuration to supply missing credentials or parameters.',
        targetTab: 'registry',
        updatedAt: item.lastConfigUpdatedAt || now,
        isDerivedFromDemo: true,
      });
    }

    if (!item.isEnabled && item.configStatus === 'configured') {
      indicators.push({
        id: `health_int_disabled_${item.id}`,
        entityType: 'integration',
        entityId: item.id,
        entityName: item.name,
        severity: 'informational',
        title: `Integration Disabled: ${item.name}`,
        reason: 'Integration has a complete configuration but is currently toggled off by an administrator.',
        recommendedAction: 'Enable integration when ready to activate automated data sync.',
        targetTab: 'registry',
        updatedAt: item.lastConfigUpdatedAt || now,
        isDerivedFromDemo: true,
      });
    }

    if (item.verificationStatus === 'unverified' && item.configStatus !== 'incomplete') {
      indicators.push({
        id: `health_int_unverified_${item.id}`,
        entityType: 'integration',
        entityId: item.id,
        entityName: item.name,
        severity: 'warning',
        title: `Unverified Connection: ${item.name}`,
        reason: 'Credentials and endpoint are configured but simulated connection verification has not been performed.',
        recommendedAction: 'Execute a simulated connection verification test.',
        targetTab: 'registry',
        updatedAt: item.lastConfigUpdatedAt || now,
        isDerivedFromDemo: true,
      });
    }
  }

  // 2. API Clients checks
  for (const client of apiClients) {
    if (client.status === 'revoked') {
      indicators.push({
        id: `health_client_revoked_${client.id}`,
        entityType: 'api_client',
        entityId: client.id,
        entityName: client.name,
        severity: 'informational',
        title: `API Client Revoked: ${client.name}`,
        reason: 'This client credentials have been revoked and all incoming requests will be rejected.',
        recommendedAction: 'Archive or delete client configuration if no longer needed.',
        targetTab: 'api-clients',
        updatedAt: client.createdAt || now,
        isDerivedFromDemo: true,
      });
    }

    if (client.status === 'active' && client.assignedScopes.some((s) => s.includes('manage') || s.includes('write'))) {
      if (!client.ipWhitelist || client.ipWhitelist.length === 0) {
        indicators.push({
          id: `health_client_ip_${client.id}`,
          entityType: 'api_client',
          entityId: client.id,
          entityName: client.name,
          severity: 'warning',
          title: `Privileged Client Without IP Whitelist: ${client.name}`,
          reason: 'Client possesses elevated management scopes without restrictive IP firewall restrictions.',
          recommendedAction: 'Configure authorized CIDR blocks to reduce risk of credential compromise.',
          targetTab: 'api-clients',
          updatedAt: client.createdAt || now,
          isDerivedFromDemo: true,
        });
      }
    }
  }

  // 3. Webhook Endpoints checks
  for (const ep of endpoints) {
    if (ep.subscribedEvents.length === 0) {
      indicators.push({
        id: `health_ep_no_subs_${ep.id}`,
        entityType: 'webhook_endpoint',
        entityId: ep.id,
        entityName: ep.name,
        severity: 'warning',
        title: `Zero Event Subscriptions: ${ep.name}`,
        reason: 'Endpoint is configured but has no active event subscriptions assigned.',
        recommendedAction: 'Select at least one event type to receive platform webhooks.',
        targetTab: 'webhooks',
        updatedAt: ep.updatedAt || now,
        isDerivedFromDemo: true,
      });
    }

    if (!ep.isEnabled) {
      indicators.push({
        id: `health_ep_disabled_${ep.id}`,
        entityType: 'webhook_endpoint',
        entityId: ep.id,
        entityName: ep.name,
        severity: 'informational',
        title: `Webhook Endpoint Inactive: ${ep.name}`,
        reason: 'Endpoint deliveries are paused because the endpoint is disabled.',
        recommendedAction: 'Re-enable the endpoint when the receiving server is ready to accept deliveries.',
        targetTab: 'webhooks',
        updatedAt: ep.updatedAt || now,
        isDerivedFromDemo: true,
      });
    }
  }

  // 4. Webhook Deliveries checks
  const deadLetters = deliveries.filter((d) => d.outcome === 'exhausted_retries');
  if (deadLetters.length > 0) {
    indicators.push({
      id: 'health_del_dead_letters',
      entityType: 'webhook_endpoint',
      entityId: deadLetters[0].endpointId,
      entityName: deadLetters[0].endpointName,
      severity: 'critical',
      title: `${deadLetters.length} Exhausted Webhook Deliveries in Dead-Letter Queue`,
      reason: 'Multiple webhook attempts have failed after reaching maximum configured retry limits.',
      recommendedAction: 'Inspect destination server logs and trigger a manual retry if resolved.',
      targetTab: 'delivery-logs',
      updatedAt: deadLetters[0].createdAt || now,
      isDerivedFromDemo: true,
    });
  }

  const pendingRetries = deliveries.filter((d) => d.outcome === 'retry_eligible' || d.outcome === 'retry_scheduled');
  if (pendingRetries.length > 0) {
    indicators.push({
      id: 'health_del_pending_retries',
      entityType: 'webhook_endpoint',
      entityId: pendingRetries[0].endpointId,
      entityName: pendingRetries[0].endpointName,
      severity: 'warning',
      title: `${pendingRetries.length} Webhook Deliveries Scheduled for Retry`,
      reason: 'Temporary network failure or upstream error encountered during delivery attempt.',
      recommendedAction: 'Monitor subsequent delivery attempts or simulate immediate retry.',
      targetTab: 'delivery-logs',
      updatedAt: pendingRetries[0].createdAt || now,
      isDerivedFromDemo: true,
    });
  }

  return indicators;
}

/**
 * Aggregates high-level metrics for the Integration Overview workspace.
 */
export function computeIntegrationMetrics(
  integrations: IntegrationRecord[],
  apiClients: ApiClientRecord[],
  endpoints: WebhookEndpointRecord[],
  deliveries: WebhookDeliveryRecord[]
): IntegrationMetricsSummary {
  const totalIntegrations = integrations.length;
  const enabledIntegrations = integrations.filter((i) => i.isEnabled).length;
  const disabledIntegrations = integrations.filter((i) => !i.isEnabled).length;
  const requiringConfigIntegrations = integrations.filter(
    (i) => i.configStatus === 'incomplete' || i.configStatus === 'not_configured'
  ).length;

  const totalApiClients = apiClients.length;
  const activeApiClients = apiClients.filter((c) => c.status === 'active').length;
  const totalWebhookEndpoints = endpoints.length;

  const failedDeliveriesCount = deliveries.filter(
    (d) => d.outcome === 'simulated_failure' || d.outcome === 'exhausted_retries'
  ).length;

  const retryEligibleCount = deliveries.filter(
    (d) => d.outcome === 'retry_eligible' || d.outcome === 'retry_scheduled'
  ).length;

  const healthIndicators = computeIntegrationHealthIndicators(integrations, apiClients, endpoints, deliveries);
  const configWarningsCount = healthIndicators.filter((h) => h.severity === 'critical' || h.severity === 'warning').length;

  const deliveriesByOutcome: Record<WebhookDeliveryOutcome, number> = {
    simulated_success: 0,
    simulated_failure: 0,
    retry_eligible: 0,
    retry_scheduled: 0,
    exhausted_retries: 0,
    cancelled: 0,
    pending: 0,
  };

  for (const d of deliveries) {
    deliveriesByOutcome[d.outcome] = (deliveriesByOutcome[d.outcome] || 0) + 1;
  }

  const integrationsByCategory: Record<IntegrationCategory, number> = {
    payment: 0,
    email_sms: 0,
    identity_sso: 0,
    video_conferencing: 0,
    storage: 0,
    sis_lms: 0,
    analytics: 0,
    custom_api: 0,
  };

  for (const i of integrations) {
    integrationsByCategory[i.category] = (integrationsByCategory[i.category] || 0) + 1;
  }

  return {
    totalIntegrations,
    enabledIntegrations,
    disabledIntegrations,
    requiringConfigIntegrations,
    totalApiClients,
    activeApiClients,
    totalWebhookEndpoints,
    failedDeliveriesCount,
    retryEligibleCount,
    configWarningsCount,
    deliveriesByOutcome,
    integrationsByCategory,
  };
}

/**
 * Filter helpers
 */
export function filterIntegrations(
  integrations: IntegrationRecord[],
  query?: string,
  category?: string,
  status?: string,
  enabledFilter?: string
): IntegrationRecord[] {
  let filtered = [...integrations];

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.provider.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }

  if (category && category !== 'all') {
    filtered = filtered.filter((item) => item.category === category);
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((item) => item.configStatus === status);
  }

  if (enabledFilter && enabledFilter !== 'all') {
    const isEnabled = enabledFilter === 'enabled';
    filtered = filtered.filter((item) => item.isEnabled === isEnabled);
  }

  return filtered;
}

export function filterApiClients(
  clients: ApiClientRecord[],
  query?: string,
  clientType?: string,
  status?: string
): ApiClientRecord[] {
  let filtered = [...clients];

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.clientId.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }

  if (clientType && clientType !== 'all') {
    filtered = filtered.filter((c) => c.clientType === clientType);
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((c) => c.status === status);
  }

  return filtered;
}

export function filterWebhookEndpoints(
  endpoints: WebhookEndpointRecord[],
  query?: string,
  enabledFilter?: string
): WebhookEndpointRecord[] {
  let filtered = [...endpoints];

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (ep) =>
        ep.name.toLowerCase().includes(q) ||
        ep.destinationUrl.toLowerCase().includes(q) ||
        ep.description.toLowerCase().includes(q)
    );
  }

  if (enabledFilter && enabledFilter !== 'all') {
    const isEnabled = enabledFilter === 'enabled';
    filtered = filtered.filter((ep) => ep.isEnabled === isEnabled);
  }

  return filtered;
}

export function filterWebhookDeliveries(
  deliveries: WebhookDeliveryRecord[],
  query?: string,
  endpointId?: string,
  eventType?: string,
  outcome?: string
): WebhookDeliveryRecord[] {
  let filtered = [...deliveries];

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.endpointName.toLowerCase().includes(q) ||
        d.destinationUrl.toLowerCase().includes(q) ||
        d.eventType.toLowerCase().includes(q)
    );
  }

  if (endpointId && endpointId !== 'all') {
    filtered = filtered.filter((d) => d.endpointId === endpointId);
  }

  if (eventType && eventType !== 'all') {
    filtered = filtered.filter((d) => d.eventType === eventType);
  }

  if (outcome && outcome !== 'all') {
    filtered = filtered.filter((d) => d.outcome === outcome);
  }

  // Sort latest first
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return filtered;
}
