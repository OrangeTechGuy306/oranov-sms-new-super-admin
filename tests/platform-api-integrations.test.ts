import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { platformStore } from '../lib/data/platform-store';
import {
  validateWebhookUrl,
  validateApiClientInput,
  validateWebhookEndpointInput,
  canRetryDelivery,
  executeSimulatedRetry,
  executeSimulatedTestDelivery,
  executeSimulatedConnectionVerification,
  computeIntegrationHealthIndicators,
  computeIntegrationMetrics,
  filterIntegrations,
  filterApiClients,
  filterWebhookEndpoints,
  filterWebhookDeliveries,
} from '../lib/integrations/evaluator';
import {
  sanitizeCsvCell,
  exportWebhookDeliveriesToCsv,
  exportIntegrationAuditEventsToCsv,
  exportIntegrationsGovernancePackage,
} from '../lib/integrations/exporter';
import {
  INITIAL_INTEGRATIONS,
  INITIAL_API_CLIENTS,
  INITIAL_WEBHOOK_ENDPOINTS,
  INITIAL_WEBHOOK_DELIVERIES,
  INITIAL_INTEGRATION_AUDIT_EVENTS,
  WEBHOOK_EVENT_CATALOGUE,
} from '../lib/integrations/fixtures';
import {
  WebhookDeliveryRecord,
  CreateApiClientInput,
  CreateWebhookEndpointInput,
} from '../lib/types/integrations';

describe('Phase E-09.19: Platform API Management, Webhooks & Integration Governance', () => {
  beforeEach(() => {
    platformStore.resetToDefaults();
  });

  // ==========================================
  // 1. URL SYNTAX & DEMO DOMAIN VALIDATION
  // ==========================================
  describe('1. Webhook Destination URL Validation (Zero Outbound Guarantee)', () => {
    test('accepts valid HTTPS webhook URLs', () => {
      const res = validateWebhookUrl('https://api.schoolpartner.org/webhooks');
      assert.equal(res.isValid, true);
      assert.equal(res.isDemoDomain, false);
      assert.equal(res.error, undefined);
    });

    test('accepts HTTP only for local and demonstration hosts', () => {
      const resLocal = validateWebhookUrl('http://localhost:3000/hooks');
      assert.equal(resLocal.isValid, true);
      assert.equal(resLocal.isDemoDomain, true);

      const resRemote = validateWebhookUrl('http://insecure-partner.org/hooks');
      assert.equal(resRemote.isValid, true);
      assert.equal(resRemote.isDemoDomain, false);
    });

    test('detects RFC demonstration and internal test domains', () => {
      const testCases = [
        'https://hooks.demo-tenant.internal/webhooks',
        'https://events.example.org/receive',
        'https://partner.example.com/hooks',
        'https://app.test/webhook',
        'http://127.0.0.1:8080/ingest',
      ];

      for (const url of testCases) {
        const res = validateWebhookUrl(url);
        assert.equal(res.isValid, true, `Expected valid for ${url}`);
        assert.equal(res.isDemoDomain, true, `Expected demo domain for ${url}`);
      }
    });

    test('rejects malformed or empty URLs with helpful errors', () => {
      const emptyRes = validateWebhookUrl('');
      assert.equal(emptyRes.isValid, false);
      assert.match(emptyRes.error || '', /required/i);

      const gibberishRes = validateWebhookUrl('not-a-valid-url');
      assert.equal(gibberishRes.isValid, false);
      assert.match(gibberishRes.error || '', /syntax/i);

      const badProtoRes = validateWebhookUrl('ftp://server.example.com/file');
      assert.equal(badProtoRes.isValid, false);
      assert.match(badProtoRes.error || '', /protocol/i);
    });
  });

  // ==========================================
  // 2. API CLIENT VALIDATION & SCOPES
  // ==========================================
  describe('2. API Client Management & RBAC Scope Validation', () => {
    test('validates complete API client inputs successfully', () => {
      const input: CreateApiClientInput = {
        name: 'Canvas LMS Sync Worker',
        description: 'District gradebook and enrollment synchronization worker.',
        clientType: 'partner_sis',
        organizationName: 'Oakridge Academy',
        assignedScopes: ['organizations:read', 'campuses:read'],
        ipWhitelist: ['192.168.1.0/24'],
        rateLimitRps: 20,
        expiresInDays: 365,
      };

      const res = validateApiClientInput(input);
      assert.equal(res.isValid, true);
      assert.equal(Object.keys(res.errors).length, 0);
    });

    test('rejects client registration when name or description is too short', () => {
      const input: CreateApiClientInput = {
        name: 'ab',
        description: 'tiny',
        clientType: 'first_party_console',
        assignedScopes: ['organizations:read'],
      };

      const res = validateApiClientInput(input);
      assert.equal(res.isValid, false);
      assert.ok(res.errors.name);
      assert.ok(res.errors.description);
    });

    test('rejects client registration with zero assigned scopes', () => {
      const input: CreateApiClientInput = {
        name: 'Empty Scopes App',
        description: 'Valid description of application purpose.',
        clientType: 'tenant_backend',
        assignedScopes: [],
      };

      const res = validateApiClientInput(input);
      assert.equal(res.isValid, false);
      assert.ok(res.errors.assignedScopes);
    });

    test('warns when elevated management scopes are assigned without IP whitelisting', () => {
      const input: CreateApiClientInput = {
        name: 'Elevated Admin Service',
        description: 'Unrestricted administrative automation tool.',
        clientType: 'automation_worker',
        assignedScopes: ['organizations:write', 'subscriptions:manage'],
        ipWhitelist: [],
      };

      const res = validateApiClientInput(input);
      assert.equal(res.isValid, true);
      assert.ok(res.warnings.length > 0);
      assert.ok(res.warnings.some((w) => w.includes('Elevated permission')));
      assert.ok(res.warnings.some((w) => w.includes('IP address restrictions')));
    });
  });

  // ==========================================
  // 3. WEBHOOK ENDPOINT VALIDATION
  // ==========================================
  describe('3. Webhook Endpoint Configuration Validation', () => {
    test('validates valid endpoint input successfully', () => {
      const input: CreateWebhookEndpointInput = {
        name: 'Tuition Accounting Ingest',
        destinationUrl: 'https://hooks.demo-tenant.internal/webhooks/billing',
        description: 'Captures invoice payment events.',
        subscribedEvents: ['invoice.payment_succeeded'],
        timeoutMs: 5000,
        rateLimitPerSec: 10,
      };

      const res = validateWebhookEndpointInput(input);
      assert.equal(res.isValid, true);
      assert.equal(Object.keys(res.errors).length, 0);
    });

    test('rejects endpoint creation with no event subscriptions', () => {
      const input: CreateWebhookEndpointInput = {
        name: 'Zombie Endpoint',
        destinationUrl: 'https://example.com/hooks',
        description: 'No events selected.',
        subscribedEvents: [],
      };

      const res = validateWebhookEndpointInput(input);
      assert.equal(res.isValid, false);
      assert.ok(res.errors.subscribedEvents);
    });

    test('rejects endpoint with invalid timeout outside permitted range', () => {
      const input: CreateWebhookEndpointInput = {
        name: 'Bad Timeout Endpoint',
        destinationUrl: 'https://example.com/hooks',
        description: 'Valid description.',
        subscribedEvents: ['organization.created'],
        timeoutMs: 99999,
      };

      const res = validateWebhookEndpointInput(input);
      assert.equal(res.isValid, false);
      assert.ok(res.errors.timeoutMs);
    });
  });

  // ==========================================
  // 4. RETRY STATE MACHINE & OUTCOME DERIVATION
  // ==========================================
  describe('4. Webhook Retry State Machine & Attempt Progression', () => {
    test('correctly evaluates retry eligibility across various delivery states', () => {
      const successfulDelivery: WebhookDeliveryRecord = {
        ...INITIAL_WEBHOOK_DELIVERIES[0],
        outcome: 'simulated_success',
      };
      assert.equal(canRetryDelivery(successfulDelivery).eligible, false);

      const failedDelivery: WebhookDeliveryRecord = {
        ...INITIAL_WEBHOOK_DELIVERIES[0],
        outcome: 'simulated_failure',
        currentAttempt: 1,
        maxAttempts: 3,
      };
      assert.equal(canRetryDelivery(failedDelivery).eligible, true);

      const scheduledDelivery: WebhookDeliveryRecord = {
        ...INITIAL_WEBHOOK_DELIVERIES[0],
        outcome: 'retry_scheduled',
        currentAttempt: 2,
        maxAttempts: 3,
      };
      assert.equal(canRetryDelivery(scheduledDelivery).eligible, true);

      const cancelledDelivery: WebhookDeliveryRecord = {
        ...INITIAL_WEBHOOK_DELIVERIES[0],
        outcome: 'cancelled',
      };
      assert.equal(canRetryDelivery(cancelledDelivery).eligible, false);
    });

    test('advances attempt count and transitions state to simulated_success upon successful retry', () => {
      const initialDelivery: WebhookDeliveryRecord = {
        ...INITIAL_WEBHOOK_DELIVERIES[2], // del_wh_903 (retry_scheduled, attempt 1)
        currentAttempt: 1,
        maxAttempts: 4,
        outcome: 'retry_scheduled',
      };

      const retryRes = executeSimulatedRetry(initialDelivery, true);
      assert.equal(retryRes.success, true);
      assert.ok(retryRes.delivery);
      assert.equal(retryRes.delivery.currentAttempt, 2);
      assert.equal(retryRes.delivery.outcome, 'simulated_success');
      assert.equal(retryRes.delivery.httpStatusCode, 200);
      assert.equal(retryRes.delivery.nextRetryAt, undefined);
      assert.equal(retryRes.delivery.attempts.length, initialDelivery.attempts.length + 1);
    });

    test('transitions to exhausted_retries when failure occurs at max attempt threshold', () => {
      const deliveryAtThreshold: WebhookDeliveryRecord = {
        ...INITIAL_WEBHOOK_DELIVERIES[0],
        currentAttempt: 2,
        maxAttempts: 3,
        outcome: 'retry_scheduled',
        attempts: [
          { attemptNumber: 1, timestamp: '2026-10-22T10:00:00Z', httpStatusCode: 504, durationMs: 5000, responseHeaders: {}, responseBody: '' },
          { attemptNumber: 2, timestamp: '2026-10-22T10:02:00Z', httpStatusCode: 504, durationMs: 5000, responseHeaders: {}, responseBody: '' },
        ],
      };

      // Retry attempt #3 fails
      const retryRes = executeSimulatedRetry(deliveryAtThreshold, false);
      assert.equal(retryRes.success, true);
      assert.ok(retryRes.delivery);
      assert.equal(retryRes.delivery.currentAttempt, 3);
      assert.equal(retryRes.delivery.outcome, 'exhausted_retries');
      assert.equal(retryRes.delivery.httpStatusCode, 502);
      assert.ok(retryRes.delivery.completedAt);
    });
  });

  // ==========================================
  // 5. TEST DELIVERY & CONNECTION SIMULATORS
  // ==========================================
  describe('5. Test Delivery & Connection Verification Simulators', () => {
    test('executeSimulatedTestDelivery generates valid signed headers and safe payload', () => {
      const ep = INITIAL_WEBHOOK_ENDPOINTS[0];
      const ev = WEBHOOK_EVENT_CATALOGUE[0];

      const delivery = executeSimulatedTestDelivery(ep, ev, true);
      assert.equal(delivery.endpointId, ep.id);
      assert.equal(delivery.eventType, ev.id);
      assert.equal(delivery.outcome, 'simulated_success');
      assert.equal(delivery.httpStatusCode, 200);
      assert.ok(delivery.requestHeaders['X-SMS-Signature'].startsWith('sha256='));
      assert.ok(delivery.requestHeaders['X-SMS-Delivery-Id'].startsWith('del_test_'));
      assert.deepEqual(delivery.payload, ev.examplePayload);
    });

    test('executeSimulatedConnectionVerification succeeds for complete configurations', () => {
      const completeInt = INITIAL_INTEGRATIONS.find((i) => i.id === 'int_stripe');
      assert.ok(completeInt);

      const res = executeSimulatedConnectionVerification(completeInt);
      assert.equal(res.success, true);
      assert.equal(res.verificationStatus, 'verified_demo');
      assert.match(res.message, /passed/i);
    });

    test('executeSimulatedConnectionVerification fails for incomplete configurations', () => {
      const incompleteInt = INITIAL_INTEGRATIONS.find((i) => i.id === 'int_zoom_edu');
      assert.ok(incompleteInt);

      const res = executeSimulatedConnectionVerification(incompleteInt);
      assert.equal(res.success, false);
      assert.equal(res.verificationStatus, 'failed');
      assert.match(res.message, /missing required configuration/i);
    });
  });

  // ==========================================
  // 6. HEALTH INDICATORS & METRICS DERIVATION
  // ==========================================
  describe('6. Integration Health & Diagnostics Derivation', () => {
    test('identifies incomplete integrations as critical blockers', () => {
      const indicators = computeIntegrationHealthIndicators(
        INITIAL_INTEGRATIONS,
        INITIAL_API_CLIENTS,
        INITIAL_WEBHOOK_ENDPOINTS,
        INITIAL_WEBHOOK_DELIVERIES
      );

      const zoomIndicator = indicators.find((i) => i.entityId === 'int_zoom_edu');
      assert.ok(zoomIndicator, 'Expected health indicator for Zoom Education');
      assert.equal(zoomIndicator.severity, 'critical');
      assert.match(zoomIndicator.reason, /missing/i);
    });

    test('identifies dead-letter exhausted deliveries as critical', () => {
      const indicators = computeIntegrationHealthIndicators(
        INITIAL_INTEGRATIONS,
        INITIAL_API_CLIENTS,
        INITIAL_WEBHOOK_ENDPOINTS,
        INITIAL_WEBHOOK_DELIVERIES
      );

      const deadLetterIndicator = indicators.find((i) => i.id === 'health_del_dead_letters');
      assert.ok(deadLetterIndicator);
      assert.equal(deadLetterIndicator.severity, 'critical');
    });

    test('computes accurate high-level integration metrics totals', () => {
      const metrics = computeIntegrationMetrics(
        INITIAL_INTEGRATIONS,
        INITIAL_API_CLIENTS,
        INITIAL_WEBHOOK_ENDPOINTS,
        INITIAL_WEBHOOK_DELIVERIES
      );

      assert.equal(metrics.totalIntegrations, INITIAL_INTEGRATIONS.length);
      assert.equal(metrics.totalApiClients, INITIAL_API_CLIENTS.length);
      assert.equal(metrics.totalWebhookEndpoints, INITIAL_WEBHOOK_ENDPOINTS.length);
      assert.ok(metrics.failedDeliveriesCount >= 1);
      assert.ok(metrics.retryEligibleCount >= 1);
    });
  });

  // ==========================================
  // 7. FORMULA INJECTION PROTECTION & CSV EXPORTS
  // ==========================================
  describe('7. Formula Injection Protection & Data Exports', () => {
    test('sanitizes formula injection trigger characters in CSV output', () => {
      assert.equal(sanitizeCsvCell('=SUM(A1:B10)'), '"\'=SUM(A1:B10)"');
      assert.equal(sanitizeCsvCell('+cmd|/c calc'), '"\'+cmd|/c calc"');
      assert.equal(sanitizeCsvCell('-10+20'), '"\'-10+20"');
      assert.equal(sanitizeCsvCell('@IMPORT'), '"\'@IMPORT"');
      assert.equal(sanitizeCsvCell('\tTabPrefixed'), '"\'\tTabPrefixed"');
      assert.equal(sanitizeCsvCell('Normal Text'), '"Normal Text"');
    });

    test('exports webhook delivery history to valid CSV without sensitive headers', () => {
      const csv = exportWebhookDeliveriesToCsv(INITIAL_WEBHOOK_DELIVERIES);
      assert.ok(csv.includes('Delivery ID'));
      assert.ok(csv.includes('Destination URL'));
      assert.ok(csv.includes('del_wh_901'));
      // Guarantee zero secrets or auth tokens in CSV
      assert.equal(csv.includes('whsec_'), false);
      assert.equal(csv.includes('sk_live_'), false);
    });

    test('exports integration audit log to valid CSV', () => {
      const csv = exportIntegrationAuditEventsToCsv(INITIAL_INTEGRATION_AUDIT_EVENTS);
      assert.ok(csv.includes('Audit ID'));
      assert.ok(csv.includes('INTEGRATION_CONNECTION_VERIFIED'));
      assert.ok(csv.includes('Alexander Sterling'));
    });

    test('exports sanitized governance package to JSON', () => {
      const jsonStr = exportIntegrationsGovernancePackage(
        INITIAL_INTEGRATIONS,
        INITIAL_API_CLIENTS,
        INITIAL_WEBHOOK_ENDPOINTS
      );

      const parsed = JSON.parse(jsonStr);
      assert.ok(parsed.integrations.length > 0);
      assert.ok(parsed.apiClients.length > 0);
      assert.ok(parsed.webhookEndpoints.length > 0);
      assert.equal(parsed.platform, 'SchoolSaaS Super-Admin Console');
    });
  });

  // ==========================================
  // 8. STORE MUTATIONS & AUTOMATED AUDIT TRAIL
  // ==========================================
  describe('8. Platform Store Mutations & Automated Audit Trail', () => {
    test('updateIntegrationConfig persists updates and appends audit event', () => {
      const initialAuditCount = platformStore.getAuditEvents().length;
      const res = platformStore.updateIntegrationConfig('int_stripe', {
        config: { rateLimitPerMin: 2400 },
      });

      assert.equal(res.success, true);
      assert.equal(res.integration?.config.rateLimitPerMin, 2400);

      const newAuditCount = platformStore.getAuditEvents().length;
      assert.equal(newAuditCount, initialAuditCount + 1);

      const latestAudit = platformStore.getAuditEvents()[0];
      assert.equal(latestAudit.action, 'INTEGRATION_CONFIG_UPDATED');
      assert.equal(latestAudit.targetId, 'int_stripe');
    });

    test('toggleIntegration updates isEnabled and records audit event', () => {
      const int = platformStore.getIntegrationById('int_stripe');
      assert.ok(int);
      const prevEnabled = int.isEnabled;

      const res = platformStore.toggleIntegration('int_stripe');
      assert.equal(res.success, true);
      assert.equal(res.integration?.isEnabled, !prevEnabled);

      const latestAudit = platformStore.getAuditEvents()[0];
      assert.ok(latestAudit.action === 'INTEGRATION_ENABLED' || latestAudit.action === 'INTEGRATION_DISABLED');
    });

    test('createApiClient validates and stores new API client with audit trail', () => {
      const initialCount = platformStore.getApiClients().length;
      const res = platformStore.createApiClient({
        name: 'Automated Attendance Exporter',
        description: 'Scheduled batch pipeline for external attendance records.',
        clientType: 'automation_worker',
        assignedScopes: ['organizations:read', 'system:telemetry:read'],
        rateLimitRps: 15,
      });

      assert.equal(res.success, true);
      assert.ok(res.client);
      assert.ok(res.client.clientId.startsWith('sms_app_'));
      assert.equal(platformStore.getApiClients().length, initialCount + 1);

      const latestAudit = platformStore.getAuditEvents()[0];
      assert.equal(latestAudit.action, 'API_CLIENT_CREATED');
      assert.equal(latestAudit.targetId, res.client.id);
    });

    test('revokeApiClient updates status to revoked and appends warning audit event', () => {
      const clients = platformStore.getApiClients();
      const activeClient = clients.find((c) => c.status === 'active');
      assert.ok(activeClient);

      const res = platformStore.revokeApiClient(activeClient.id, 'Routine security rotation');
      assert.equal(res.success, true);
      assert.equal(res.client?.status, 'revoked');

      const updated = platformStore.getApiClientById(activeClient.id);
      assert.equal(updated?.status, 'revoked');

      const latestAudit = platformStore.getAuditEvents()[0];
      assert.equal(latestAudit.action, 'API_CLIENT_REVOKED');
      assert.equal(latestAudit.severity, 'warning');
    });

    test('createWebhookEndpoint registers new destination and logs audit trail', () => {
      const initialCount = platformStore.getWebhookEndpoints().length;
      const res = platformStore.createWebhookEndpoint({
        name: 'GradePassback Receiver',
        destinationUrl: 'https://hooks.demo-tenant.internal/webhooks/grades',
        description: 'Receives examination and grading milestones.',
        subscribedEvents: ['examination.schedule_published'],
        timeoutMs: 4000,
      });

      assert.equal(res.success, true);
      assert.ok(res.endpoint);
      assert.equal(platformStore.getWebhookEndpoints().length, initialCount + 1);

      const latestAudit = platformStore.getAuditEvents()[0];
      assert.equal(latestAudit.action, 'WEBHOOK_ENDPOINT_CREATED');
    });

    test('simulateTestWebhookDelivery records new simulated delivery in store', () => {
      const initialDeliveries = platformStore.getWebhookDeliveries().length;
      const res = platformStore.simulateTestWebhookDelivery(
        'ep_billing_sync',
        'invoice.payment_succeeded',
        true
      );

      assert.equal(res.success, true);
      assert.ok(res.delivery);
      assert.equal(platformStore.getWebhookDeliveries().length, initialDeliveries + 1);
      assert.equal(res.delivery.outcome, 'simulated_success');
    });

    test('simulateRetryWebhookDelivery advances attempt count and updates delivery record', () => {
      // Find a delivery that is failed or scheduled
      const target = platformStore
        .getWebhookDeliveries()
        .find((d) => d.outcome === 'retry_scheduled' || d.outcome === 'retry_eligible');
      assert.ok(target, 'Expected at least one retry-eligible delivery in fixtures');

      const initialAttempts = target.currentAttempt;
      const res = platformStore.simulateRetryWebhookDelivery(target.id, true);
      assert.equal(res.success, true);
      assert.ok(res.delivery);
      assert.equal(res.delivery.currentAttempt, initialAttempts + 1);
      assert.equal(res.delivery.outcome, 'simulated_success');
    });
  });

  // ==========================================
  // 9. PRIVACY & SECURITY GUARANTEES
  // ==========================================
  describe('9. Privacy & Security Guarantees (Zero PII Guarantee)', () => {
    test('event catalogue sample payloads contain zero personal identifiable information', () => {
      const sensitiveKeywords = [
        'password',
        'social_security',
        'date_of_birth',
        'credit_card_number',
        'parent_phone',
        'medical_record',
      ];

      for (const ev of WEBHOOK_EVENT_CATALOGUE) {
        const payloadStr = JSON.stringify(ev.examplePayload).toLowerCase();
        for (const kw of sensitiveKeywords) {
          assert.equal(
            payloadStr.includes(kw),
            false,
            `Event ${ev.id} payload contains sensitive keyword: ${kw}`
          );
        }
      }
    });

    test('all mock credentials use fictional prefixes and masked placeholders', () => {
      for (const client of INITIAL_API_CLIENTS) {
        assert.ok(
          client.maskedCredentialPlaceholder.includes('••••'),
          `Client ${client.id} must use masked placeholder`
        );
      }

      for (const ep of INITIAL_WEBHOOK_ENDPOINTS) {
        assert.ok(
          ep.signingSecretMasked.includes('••••'),
          `Endpoint ${ep.id} must use masked signing secret`
        );
      }
    });
  });

  // ==========================================
  // 10. SEARCH & FILTER EVALUATION
  // ==========================================
  describe('10. Search & Filter Evaluation', () => {
    test('filterIntegrations matches provider names and respects category and status filters', () => {
      const stripeOnly = filterIntegrations(INITIAL_INTEGRATIONS, 'stripe', 'all', 'all');
      assert.equal(stripeOnly.length, 1);
      assert.equal(stripeOnly[0].id, 'int_stripe');

      const paymentOnly = filterIntegrations(INITIAL_INTEGRATIONS, '', 'payment', 'all');
      assert.ok(paymentOnly.every((i) => i.category === 'payment'));

      const incompleteOnly = filterIntegrations(INITIAL_INTEGRATIONS, '', 'all', 'incomplete');
      assert.ok(incompleteOnly.every((i) => i.configStatus === 'incomplete'));
    });

    test('filterApiClients filters by query, status, and client type', () => {
      const canvasMatches = filterApiClients(INITIAL_API_CLIENTS, 'Canvas', 'all', 'all');
      assert.ok(canvasMatches.length > 0);
      assert.ok(canvasMatches.some((c) => c.name.includes('Canvas')));

      const activeWorker = filterApiClients(INITIAL_API_CLIENTS, '', 'active', 'automation_worker');
      assert.ok(activeWorker.every((c) => c.status === 'active' && c.clientType === 'automation_worker'));
    });

    test('filterWebhookEndpoints filters by query and enabled status', () => {
      const billingMatches = filterWebhookEndpoints(INITIAL_WEBHOOK_ENDPOINTS, 'billing', 'all');
      assert.ok(billingMatches.length > 0);
      assert.ok(billingMatches.some((e) => e.name.toLowerCase().includes('billing')));

      const disabledOnly = filterWebhookEndpoints(INITIAL_WEBHOOK_ENDPOINTS, '', 'disabled');
      assert.ok(disabledOnly.every((e) => !e.isEnabled));
    });

    test('filterWebhookDeliveries filters by query, endpoint, event type, and outcome', () => {
      const failedDeliveries = filterWebhookDeliveries(
        INITIAL_WEBHOOK_DELIVERIES,
        '',
        'all',
        'all',
        'exhausted_retries'
      );
      assert.ok(failedDeliveries.every((d) => d.outcome === 'exhausted_retries'));

      const epFilter = filterWebhookDeliveries(
        INITIAL_WEBHOOK_DELIVERIES,
        '',
        'ep-wh-001',
        'all',
        'all'
      );
      assert.ok(epFilter.every((d) => d.endpointId === 'ep-wh-001'));
    });
  });
});
