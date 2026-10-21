/**
 * Evaluator and Business Logic for Communications & Delivery Governance
 * Phase E-09.16: Platform Notifications, Communication Templates and Delivery Governance
 */

import {
  ChannelType,
  TemplateStatus,
  DeliveryStatus,
  CommunicationTemplate,
  NotificationPolicy,
  ProviderRecord,
  NotificationRecord,
  PolicyEvaluationSimulationInput,
  PolicyEvaluationResult,
  CampaignAudienceEstimate,
  AudienceScope,
} from '../types/communications';
import { TEMPLATE_VARIABLE_REGISTRY } from './fixtures';

// ============================================================================
// 1. VARIABLE EXTRACTION & RENDERING
// ============================================================================

/**
 * Extracts all variable keys inside double curly braces: {{variableName}}
 */
export function extractVariables(text: string): {
  validVariables: string[];
  syntaxErrors: string[];
} {
  const validVariables: string[] = [];
  const syntaxErrors: string[] = [];

  // Match complete {{key}}
  const fullRegex = /\{\{([a-zA-Z0-9_.-]+)\}\}/g;
  let match: RegExpExecArray | null;

  while ((match = fullRegex.exec(text)) !== null) {
    if (!validVariables.includes(match[1])) {
      validVariables.push(match[1]);
    }
  }

  // Detect malformed syntax like unclosed {{ or spaces like {{ var }}
  const malformedRegex = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;
  while ((match = malformedRegex.exec(text)) !== null) {
    if (match[0].includes(' ') || match[0].includes('\t')) {
      syntaxErrors.push(`Variable '${match[0]}' contains disallowed whitespace inside braces.`);
    }
  }

  // Check unclosed braces
  const openCount = (text.match(/\{\{/g) || []).length;
  const closeCount = (text.match(/\}\}/g) || []).length;
  if (openCount !== closeCount) {
    syntaxErrors.push(`Mismatched double braces: found ${openCount} '{{' and ${closeCount} '}}'.`);
  }

  return { validVariables, syntaxErrors };
}

/**
 * Safely escapes HTML special characters to prevent XSS in web previews
 */
export function escapeHtml(unsafeText: string): string {
  return unsafeText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Replaces variables in subject and body with provided values or safe demonstration defaults
 */
export function renderTemplatePreview(
  template: { subject?: string; body: string },
  customValues: Record<string, string> = {}
): {
  renderedSubject?: string;
  renderedBody: string;
  missingVariables: string[];
  usedVariables: string[];
} {
  // Build lookup combining defaults from registry and custom values
  const defaultValues: Record<string, string> = {};
  for (const def of TEMPLATE_VARIABLE_REGISTRY) {
    defaultValues[def.key] = def.exampleValue;
  }

  const combinedValues = { ...defaultValues, ...customValues };
  const allText = `${template.subject || ''} ${template.body}`;
  const { validVariables } = extractVariables(allText);

  const missingVariables: string[] = [];
  const usedVariables: string[] = [];

  const replaceFn = (_match: string, key: string) => {
    usedVariables.push(key);
    if (combinedValues[key] !== undefined && combinedValues[key] !== '') {
      return combinedValues[key];
    }
    missingVariables.push(key);
    return `[MISSING: ${key}]`;
  };

  const renderedSubject = template.subject
    ? template.subject.replace(/\{\{([a-zA-Z0-9_.-]+)\}\}/g, replaceFn)
    : undefined;

  const renderedBody = template.body.replace(/\{\{([a-zA-Z0-9_.-]+)\}\}/g, replaceFn);

  return {
    renderedSubject,
    renderedBody,
    missingVariables: Array.from(new Set(missingVariables)),
    usedVariables: Array.from(new Set(usedVariables)),
  };
}

// ============================================================================
// 2. CHARACTER COUNT & SMS SEGMENT ESTIMATION
// ============================================================================

export interface SegmentCalculationResult {
  charCount: number;
  estimatedSegments: number;
  encoding: 'GSM-7' | 'UCS-2';
  maxPerSegment: number;
  warning?: string;
}

/**
 * Calculates character length and illustrative segment count for SMS
 * Standard GSM-7: 160 single / 153 multi-part
 * Non-GSM characters trigger UCS-2 (70 single / 67 multi-part)
 */
export function calculateSmsSegments(text: string): SegmentCalculationResult {
  const charCount = text.length;

  // Basic GSM-7 character check (ASCII standard subset)
  const isGsm7 = /^[\x20-\x7E\r\n]*$/.test(text);
  const encoding = isGsm7 ? 'GSM-7' : 'UCS-2';

  if (encoding === 'GSM-7') {
    if (charCount <= 160) {
      return { charCount, estimatedSegments: charCount === 0 ? 0 : 1, encoding, maxPerSegment: 160 };
    }
    const segments = Math.ceil(charCount / 153);
    return {
      charCount,
      estimatedSegments: segments,
      encoding,
      maxPerSegment: 153,
      warning: segments > 3 ? 'Exceeds 3 concatenated SMS segments. Increased carrier costs.' : undefined,
    };
  } else {
    if (charCount <= 70) {
      return { charCount, estimatedSegments: charCount === 0 ? 0 : 1, encoding, maxPerSegment: 70 };
    }
    const segments = Math.ceil(charCount / 67);
    return {
      charCount,
      estimatedSegments: segments,
      encoding,
      maxPerSegment: 67,
      warning: 'Contains non-GSM characters (UCS-2 encoding). Segment capacity limited to 70 chars.',
    };
  }
}

// ============================================================================
// 3. LIFECYCLE TRANSITION LOGIC
// ============================================================================

/**
 * Validates template status lifecycle transitions
 * Lifecycle: draft -> in_review -> approved -> active -> archived
 */
export function canTransitionTemplateStatus(
  from: TemplateStatus,
  to: TemplateStatus
): { allowed: boolean; reason?: string } {
  if (from === to) {
    return { allowed: true };
  }

  const allowedTransitions: Record<TemplateStatus, TemplateStatus[]> = {
    draft: ['in_review', 'archived'],
    in_review: ['draft', 'approved', 'archived'],
    approved: ['in_review', 'active', 'archived'],
    active: ['archived'], // cannot jump directly to draft without archiving or creating new version
    archived: ['draft'],   // restoring an archived template resets it to draft
  };

  const allowed = allowedTransitions[from]?.includes(to) ?? false;
  if (!allowed) {
    return {
      allowed: false,
      reason: `Invalid transition from '${from}' to '${to}'. Allowed transitions from '${from}': ${allowedTransitions[from]?.join(', ') || 'none'}.`,
    };
  }

  return { allowed: true };
}

// ============================================================================
// 4. POLICY EVALUATION SIMULATOR
// ============================================================================

/**
 * Simulates policy evaluation for a candidate event
 */
export function simulatePolicyEvaluation(
  policies: NotificationPolicy[],
  templates: CommunicationTemplate[],
  input: PolicyEvaluationSimulationInput
): PolicyEvaluationResult {
  const reasons: string[] = [];
  const warnings: string[] = [];

  // 1. Filter enabled policies matching category and channel
  const candidatePolicies = policies.filter(
    (p) =>
      p.enabled &&
      p.category === input.category &&
      p.applicableChannels.includes(input.channel)
  );

  if (candidatePolicies.length === 0) {
    return {
      applicableChannels: [],
      decision: 'no_policy_matched',
      reasons: [`No active policy configured for category '${input.category}' and channel '${input.channel}'.`],
      warnings: ['Notification would not be dispatched due to missing policy definition.'],
      quietHoursActive: false,
      isCriticalBypass: false,
      rateLimitExceeded: false,
    };
  }

  // 2. Resolve precedence: tenant-specific policy takes precedence over platform-wide
  let matchedPolicy: NotificationPolicy | undefined;
  if (input.tenantId) {
    matchedPolicy = candidatePolicies.find(
      (p) => p.scope === 'tenant_specific' && p.targetTenantId === input.tenantId
    );
  }
  if (!matchedPolicy) {
    matchedPolicy = candidatePolicies.find((p) => p.scope === 'platform_wide') || candidatePolicies[0];
  }

  // 3. Find associated template
  const selectedTemplate = templates.find(
    (t) => t.key === matchedPolicy?.requiredTemplateKey
  );

  if (!selectedTemplate) {
    warnings.push(`Matched policy '${matchedPolicy.name}' references template '${matchedPolicy.requiredTemplateKey}' which does not exist in registry.`);
  } else if (selectedTemplate.status !== 'active') {
    warnings.push(`Referenced template '${selectedTemplate.key}' is in '${selectedTemplate.status}' status, not 'active'.`);
  }

  // 4. Evaluate Quiet Hours
  let quietHoursActive = false;
  let isCriticalBypass = false;

  if (matchedPolicy.quietHours && matchedPolicy.quietHours.enabled) {
    const { startTimeUtc, endTimeUtc, allowCriticalBypass } = matchedPolicy.quietHours;
    // Input time e.g. "23:30" or ISO "2026-10-19T23:30:00Z"
    let currentHhMm = '12:00';
    if (input.currentTimeUtc.includes('T')) {
      const date = new Date(input.currentTimeUtc);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const mins = date.getUTCMinutes().toString().padStart(2, '0');
      currentHhMm = `${hours}:${mins}`;
    } else if (input.currentTimeUtc.includes(':')) {
      currentHhMm = input.currentTimeUtc;
    }

    // Check if currentHhMm falls in quiet hours window (handles crossing midnight)
    if (startTimeUtc > endTimeUtc) {
      // Overnight window e.g. 22:00 to 07:00
      quietHoursActive = currentHhMm >= startTimeUtc || currentHhMm <= endTimeUtc;
    } else {
      // Daytime window e.g. 01:00 to 05:00
      quietHoursActive = currentHhMm >= startTimeUtc && currentHhMm <= endTimeUtc;
    }

    if (quietHoursActive) {
      if (matchedPolicy.priority === 'critical' && allowCriticalBypass) {
        isCriticalBypass = true;
        reasons.push(`Quiet hours active (${startTimeUtc} - ${endTimeUtc} UTC), but Critical Priority bypassed quiet hours.`);
      } else {
        reasons.push(`Suppressed: Quiet hours currently active (${startTimeUtc} - ${endTimeUtc} UTC).`);
      }
    }
  }

  // 5. Final Decision
  let decision: 'allowed' | 'suppressed' = 'allowed';
  if (quietHoursActive && !isCriticalBypass) {
    decision = 'suppressed';
  }

  if (decision === 'allowed') {
    reasons.push(`Policy '${matchedPolicy.name}' evaluated: Message permitted on channel '${input.channel}'.`);
  }

  return {
    matchedPolicy,
    selectedTemplate,
    applicableChannels: matchedPolicy.applicableChannels,
    decision,
    reasons,
    warnings,
    quietHoursActive,
    isCriticalBypass,
    rateLimitExceeded: false,
  };
}

// ============================================================================
// 5. CAMPAIGN AUDIENCE ESTIMATION
// ============================================================================

export function estimateCampaignAudience(
  scope: AudienceScope,
  targetTenantIds: string[] | undefined,
  organizations: Array<{ id: string; planId?: string; name: string }>
): CampaignAudienceEstimate {
  let matchedTenants = 0;
  let basis = '';

  switch (scope) {
    case 'all_schools':
      matchedTenants = organizations.length;
      basis = `Platform-wide broadcast across all ${organizations.length} registered school organizations.`;
      break;
    case 'tier_enterprise':
      matchedTenants = organizations.filter((o) => o.planId === 'plan_enterprise').length;
      basis = `Institutions subscribed to Enterprise Plan (${matchedTenants} organizations).`;
      break;
    case 'tier_growth':
      matchedTenants = organizations.filter((o) => o.planId === 'plan_growth').length;
      basis = `Institutions subscribed to Growth Campus Plan (${matchedTenants} organizations).`;
      break;
    case 'selected_tenants':
      matchedTenants = (targetTenantIds || []).length;
      basis = `Custom selected cohort: ${matchedTenants} tenant(s).`;
      break;
    default:
      matchedTenants = 0;
      basis = 'No audience scope matched.';
  }

  // Synthetic average of ~3-4 designated primary administrative contacts per school
  const estimatedRecipients = matchedTenants * 3;

  return {
    totalTenants: matchedTenants,
    estimatedRecipients,
    calculationBasis: `Demonstration estimate: ${basis} (~3 primary admin contacts per school).`,
  };
}

// ============================================================================
// 6. RETRY ELIGIBILITY
// ============================================================================

export function canRetryNotification(
  record: NotificationRecord,
  _policies: NotificationPolicy[]
): { canRetry: boolean; reason?: string } {
  if (record.status !== 'failed') {
    if (record.status === 'suppressed') {
      return {
        canRetry: false,
        reason: 'Suppressed notifications cannot be retried directly. Review notification policy or quiet-hours settings instead.',
      };
    }
    if (record.status === 'delivered') {
      return {
        canRetry: false,
        reason: 'Message was already delivered successfully.',
      };
    }
    return {
      canRetry: false,
      reason: `Cannot retry notification in status '${record.status}'.`,
    };
  }

  if (record.retryCount >= record.maxRetries) {
    return {
      canRetry: false,
      reason: `Maximum retry limit (${record.maxRetries}) reached for this notification.`,
    };
  }

  return { canRetry: true };
}

// ============================================================================
// 7. SUMMARY METRICS COMPUTATION
// ============================================================================

export interface CommunicationSummaryMetrics {
  totalRecords: number;
  queuedCount: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  suppressedCount: number;
  draftTemplatesCount: number;
  activeTemplatesCount: number;
  totalTemplatesCount: number;
  configuredPoliciesCount: number;
  disconnectedProvidersCount: number;
  totalProvidersCount: number;
}

export function computeCommunicationMetrics(
  records: NotificationRecord[],
  templates: CommunicationTemplate[],
  policies: NotificationPolicy[],
  providers: ProviderRecord[]
): CommunicationSummaryMetrics {
  return {
    totalRecords: records.length,
    queuedCount: records.filter((r) => r.status === 'queued' || r.status === 'processing').length,
    sentCount: records.filter((r) => r.status === 'sent').length,
    deliveredCount: records.filter((r) => r.status === 'delivered').length,
    failedCount: records.filter((r) => r.status === 'failed').length,
    suppressedCount: records.filter((r) => r.status === 'suppressed').length,
    draftTemplatesCount: templates.filter((t) => t.status === 'draft' || t.status === 'in_review').length,
    activeTemplatesCount: templates.filter((t) => t.status === 'active' || t.status === 'approved').length,
    totalTemplatesCount: templates.length,
    configuredPoliciesCount: policies.filter((p) => p.enabled).length,
    disconnectedProvidersCount: providers.filter(
      (p) => p.connectionStatus === 'not_connected' || p.configStatus === 'missing_vault_secret'
    ).length,
    totalProvidersCount: providers.length,
  };
}
