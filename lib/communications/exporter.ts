/**
 * Safe Export and Import Utilities for Platform Communications Governance
 * Phase E-09.16: Platform Notifications, Communication Templates and Delivery Governance
 */

import {
  CommunicationTemplate,
  NotificationPolicy,
  ProviderRecord,
  CampaignDraft,
  NotificationRecord,
  CommunicationExportPackage,
  CommunicationImportResult,
} from '../types/communications';

/**
 * Neutralizes CSV / Spreadsheet formula injection characters (=, +, -, @, \t, \r)
 */
export function sanitizeFormulaInjection(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  const stringVal = String(value);
  if (/^[=+\-@\t\r]/.test(stringVal)) {
    return `'${stringVal}`;
  }
  return stringVal;
}

/**
 * Generates a safe, non-sensitive JSON export package of communications configuration
 */
export function exportCommunicationPackage(params: {
  templates: CommunicationTemplate[];
  policies: NotificationPolicy[];
  providers: ProviderRecord[];
  campaigns: CampaignDraft[];
  actor: string;
  scope?: string;
  environment?: string;
}): CommunicationExportPackage {
  // Strip private IDs and ensure zero secrets
  const cleanTemplates = params.templates.map(({ id, ...rest }) => ({
    ...rest,
    name: sanitizeFormulaInjection(rest.name),
    subject: rest.subject ? sanitizeFormulaInjection(rest.subject) : undefined,
  }));

  const cleanPolicies = params.policies.map(({ id, ...rest }) => ({
    ...rest,
    name: sanitizeFormulaInjection(rest.name),
  }));

  // Strip vaultSecretRef and any credentials from providers
  const safeProviders = params.providers.map((p) => ({
    displayName: sanitizeFormulaInjection(p.displayName),
    channel: p.channel,
    purpose: sanitizeFormulaInjection(p.purpose),
    configStatus: p.configStatus,
    connectionStatus: p.connectionStatus,
    readinessTier: p.readinessTier,
    supportedCapabilities: p.supportedCapabilities,
    requiredEnvKeys: p.requiredEnvKeys,
  }));

  const cleanCampaigns = params.campaigns.map(({ id, ...rest }) => ({
    ...rest,
    name: sanitizeFormulaInjection(rest.name),
    description: sanitizeFormulaInjection(rest.description),
  }));

  return {
    formatVersion: '1.0',
    exportedAt: new Date().toISOString(),
    environment: params.environment || 'development',
    actor: params.actor,
    scope: params.scope || 'platform_communications_governance',
    templates: cleanTemplates,
    policies: cleanPolicies,
    providers: safeProviders,
    campaigns: cleanCampaigns,
    summaryMetrics: {
      totalTemplates: cleanTemplates.length,
      totalPolicies: cleanPolicies.length,
      totalProviders: safeProviders.length,
      totalCampaigns: cleanCampaigns.length,
    },
  };
}

/**
 * Validates an imported JSON communication configuration package before applying
 */
export function validateImportCommunicationPackage(
  parsedJson: unknown
): CommunicationImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!parsedJson || typeof parsedJson !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid payload: Expected a JSON object.'],
      warnings: [],
      templatesToImport: 0,
      policiesToImport: 0,
      campaignsToImport: 0,
      summary: 'Import validation failed: Malformed JSON structure.',
    };
  }

  const pkg = parsedJson as Partial<CommunicationExportPackage>;

  if (pkg.formatVersion !== '1.0') {
    errors.push(`Unsupported package version: '${pkg.formatVersion || 'unknown'}'. Expected version '1.0'.`);
  }

  if (!Array.isArray(pkg.templates)) {
    errors.push("Missing or invalid 'templates' array in package.");
  } else {
    pkg.templates.forEach((t, idx) => {
      if (!t.key || !t.name || !t.channel || !t.body) {
        errors.push(`Template at index ${idx} is missing required fields (key, name, channel, body).`);
      }
    });
  }

  if (!Array.isArray(pkg.policies)) {
    warnings.push("Package does not contain a 'policies' array.");
  } else {
    pkg.policies.forEach((p, idx) => {
      if (!p.name || !p.category || !p.requiredTemplateKey) {
        errors.push(`Policy at index ${idx} is missing required fields (name, category, requiredTemplateKey).`);
      }
    });
  }

  const templatesCount = Array.isArray(pkg.templates) ? pkg.templates.length : 0;
  const policiesCount = Array.isArray(pkg.policies) ? pkg.policies.length : 0;
  const campaignsCount = Array.isArray(pkg.campaigns) ? pkg.campaigns.length : 0;

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    templatesToImport: templatesCount,
    policiesToImport: policiesCount,
    campaignsToImport: campaignsCount,
    summary: isValid
      ? `Package verified successfully: ${templatesCount} template(s), ${policiesCount} policy(ies), ${campaignsCount} campaign(s) ready for local preview.`
      : `Package validation failed with ${errors.length} error(s).`,
  };
}

/**
 * Exports filtered demonstration delivery history records to CSV
 */
export function exportDeliveryRecordsToCsv(records: NotificationRecord[]): string {
  const headers = [
    'Notification ID',
    'Category',
    'Channel',
    'Template Key',
    'Tenant Name',
    'Recipient (Synthetic)',
    'Status',
    'Priority',
    'Sent At',
    'Delivered At',
    'Failure Classification',
    'Failure Reason',
    'Retry Count',
    'Source Type',
    'Created At',
  ];

  const rows = records.map((r) => [
    sanitizeFormulaInjection(r.id),
    sanitizeFormulaInjection(r.category),
    sanitizeFormulaInjection(r.channel),
    sanitizeFormulaInjection(r.templateKey),
    sanitizeFormulaInjection(r.tenantName || 'Platform Global'),
    sanitizeFormulaInjection(r.recipientDisplay),
    sanitizeFormulaInjection(r.status),
    sanitizeFormulaInjection(r.priority),
    sanitizeFormulaInjection(r.sentAt || ''),
    sanitizeFormulaInjection(r.deliveredAt || ''),
    sanitizeFormulaInjection(r.failureClassification || ''),
    sanitizeFormulaInjection(r.failureReason || ''),
    r.retryCount,
    sanitizeFormulaInjection(r.sourceType),
    sanitizeFormulaInjection(r.createdAt),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\r\n');

  return csvContent;
}
