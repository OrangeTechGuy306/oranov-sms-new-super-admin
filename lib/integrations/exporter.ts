import { WebhookDeliveryRecord, IntegrationRecord, ApiClientRecord, WebhookEndpointRecord } from '../types/integrations';
import { AuditEvent } from '../types/audit-logs';

/**
 * Protects against CSV formula injection attacks by prefixing cells that begin
 * with dangerous spreadsheet calculation symbols (=, +, -, @, \t, \r) with an apostrophe.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }

  let str = String(value);

  // Check if string starts with formula trigger characters
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape existing quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Serializes webhook delivery history records to RFC-compliant CSV format with formula injection protection.
 * Ensures no authentication headers, signing secrets, or unnecessary personal data are included.
 */
export function exportWebhookDeliveriesToCsv(deliveries: WebhookDeliveryRecord[]): string {
  const headers = [
    'Delivery ID',
    'Endpoint Name',
    'Destination URL',
    'Event Type',
    'Event ID',
    'Outcome',
    'HTTP Status Code',
    'Duration (ms)',
    'Attempts',
    'Max Attempts',
    'Created At',
    'Completed At',
    'Error Summary',
  ];

  const rows = deliveries.map((d) => [
    sanitizeCsvCell(d.id),
    sanitizeCsvCell(d.endpointName),
    sanitizeCsvCell(d.destinationUrl),
    sanitizeCsvCell(d.eventType),
    sanitizeCsvCell(d.eventId),
    sanitizeCsvCell(d.outcome),
    sanitizeCsvCell(d.httpStatusCode),
    sanitizeCsvCell(d.durationMs),
    sanitizeCsvCell(d.currentAttempt),
    sanitizeCsvCell(d.maxAttempts),
    sanitizeCsvCell(d.createdAt),
    sanitizeCsvCell(d.completedAt || ''),
    sanitizeCsvCell(d.errorSummary || ''),
  ]);

  return [headers.map(sanitizeCsvCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Serializes integration-related audit entries to CSV format.
 */
export function exportIntegrationAuditEventsToCsv(events: AuditEvent[]): string {
  const headers = [
    'Audit ID',
    'Timestamp',
    'Action',
    'Severity',
    'Actor Name',
    'Actor Email',
    'Actor Role',
    'Target Entity',
    'Target ID',
    'Target Name',
    'Status',
    'Details',
  ];

  const rows = events.map((e) => [
    sanitizeCsvCell(e.id),
    sanitizeCsvCell(e.timestamp),
    sanitizeCsvCell(e.action),
    sanitizeCsvCell(e.severity),
    sanitizeCsvCell(e.actor.name),
    sanitizeCsvCell(e.actor.email),
    sanitizeCsvCell(e.actor.role),
    sanitizeCsvCell(e.targetEntity),
    sanitizeCsvCell(e.targetId),
    sanitizeCsvCell(e.targetName || ''),
    sanitizeCsvCell(e.status),
    sanitizeCsvCell(e.details),
  ]);

  return [headers.map(sanitizeCsvCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Exports a portable JSON package containing integration registry metadata,
 * configured API clients, and webhook endpoints without exposing secrets.
 */
export function exportIntegrationsGovernancePackage(
  integrations: IntegrationRecord[],
  apiClients: ApiClientRecord[],
  endpoints: WebhookEndpointRecord[]
): string {
  const pkg = {
    exportedAt: new Date().toISOString(),
    schemaVersion: '1.0.0-demo',
    platform: 'SchoolSaaS Super-Admin Console',
    governanceNotice:
      'Demonstration export package. Contains sanitized metadata and fictional identifiers. No production secrets included.',
    integrations: integrations.map((i) => ({
      id: i.id,
      name: i.name,
      provider: i.provider,
      category: i.category,
      type: i.type,
      configStatus: i.configStatus,
      isEnabled: i.isEnabled,
      scope: i.scope,
      capabilities: i.capabilities,
      verificationStatus: i.verificationStatus,
      lastConfigUpdatedAt: i.lastConfigUpdatedAt,
    })),
    apiClients: apiClients.map((c) => ({
      id: c.id,
      clientId: c.clientId,
      name: c.name,
      clientType: c.clientType,
      status: c.status,
      assignedScopes: c.assignedScopes,
      ipWhitelist: c.ipWhitelist,
      rateLimitRps: c.rateLimitRps,
      createdAt: c.createdAt,
      expiresAt: c.expiresAt,
    })),
    webhookEndpoints: endpoints.map((ep) => ({
      id: ep.id,
      name: ep.name,
      destinationUrl: ep.destinationUrl,
      subscribedEvents: ep.subscribedEvents,
      isEnabled: ep.isEnabled,
      timeoutMs: ep.timeoutMs,
      retryPolicy: ep.retryPolicy,
      rateLimitPerSec: ep.rateLimitPerSec,
      createdAt: ep.createdAt,
    })),
  };

  return JSON.stringify(pkg, null, 2);
}
