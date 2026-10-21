/**
 * Validation Logic for Communication Templates, Notification Policies & Campaigns
 * Phase E-09.16: Platform Notifications, Communication Templates and Delivery Governance
 */

import {
  CommunicationTemplate,
  NotificationPolicy,
  CampaignDraft,
  TemplateValidationResult,
} from '../types/communications';
import { TEMPLATE_VARIABLE_REGISTRY } from './fixtures';
import { extractVariables, calculateSmsSegments } from './evaluator';

// ============================================================================
// 1. TEMPLATE VALIDATION
// ============================================================================

export function validateTemplateDefinition(
  template: Partial<CommunicationTemplate>,
  existingTemplates: CommunicationTemplate[] = [],
  currentTemplateId?: string
): TemplateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequiredVariables: string[] = [];
  const unknownVariables: string[] = [];

  // Required basic fields
  if (!template.name || template.name.trim().length === 0) {
    errors.push('Template name is required.');
  }

  if (!template.key || template.key.trim().length === 0) {
    errors.push('Template key is required.');
  } else {
    // Key format validation (lowercase, alphanumeric, dots, hyphens, underscores)
    const keyRegex = /^[a-z0-9_.-]+$/;
    if (!keyRegex.test(template.key)) {
      errors.push("Template key must contain only lowercase alphanumeric characters, dots, hyphens, or underscores (e.g. 'tpl.auth.password_reset').");
    }

    // Uniqueness check
    const currentId = currentTemplateId || template.id;
    const duplicate = existingTemplates.find(
      (t) => t.key === template.key && t.id !== currentId
    );
    if (duplicate) {
      errors.push(`Template key '${template.key}' is already in use by template '${duplicate.name}'. Keys must be globally unique.`);
    }
  }

  if (!template.category) {
    errors.push('Template category is required.');
  }

  if (!template.channel) {
    errors.push('Communication channel is required.');
  }

  if (!template.locale || template.locale.trim().length === 0) {
    errors.push('Locale is required (e.g., en-US, en-GB, fr-FR).');
  }

  // Subject is mandatory for Email channel
  if (template.channel === 'email') {
    if (!template.subject || template.subject.trim().length === 0) {
      errors.push('Subject line is required for Email templates.');
    }
  }

  // Body content cannot be empty
  if (!template.body || template.body.trim().length === 0) {
    errors.push('Template body content cannot be empty.');
  }

  // Variable validation
  const allText = `${template.subject || ''} ${template.body || ''}`;
  const { validVariables, syntaxErrors } = extractVariables(allText);

  // Check for syntax errors (e.g. malformed {{ var }} or unclosed braces)
  errors.push(...syntaxErrors);

  // Check variables against registered dictionary
  const registeredKeys = TEMPLATE_VARIABLE_REGISTRY.map((v) => v.key);
  for (const varKey of validVariables) {
    if (!registeredKeys.includes(varKey)) {
      unknownVariables.push(varKey);
      errors.push(`Unrecognized variable '{{${varKey}}}' is not defined in the platform variable registry.`);
    }
  }

  // Check if mandatory variables for this category are missing
  const categoryRequiredVars = TEMPLATE_VARIABLE_REGISTRY.filter(
    (v) =>
      v.required &&
      (!v.supportedCategories || (template.category && v.supportedCategories.includes(template.category)))
  );

  for (const reqVar of categoryRequiredVars) {
    if (!validVariables.includes(reqVar.key)) {
      missingRequiredVariables.push(reqVar.key);
      warnings.push(`Recommended variable '{{${reqVar.key}}}' (${reqVar.label}) is not included in template.`);
    }
  }

  // Channel-specific warnings & limits (illustrative)
  let characterCount = (template.body || '').length;
  let estimatedSegments: number | undefined;

  if (template.channel === 'sms') {
    const smsCalc = calculateSmsSegments(template.body || '');
    characterCount = smsCalc.charCount;
    estimatedSegments = smsCalc.estimatedSegments;
    if (smsCalc.warning) {
      warnings.push(smsCalc.warning);
    }
  } else if (template.channel === 'push') {
    if (characterCount > 180) {
      warnings.push(`Push body is ${characterCount} characters. Notifications over 180 characters may be truncated on mobile lock screens.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingRequiredVariables,
    unknownVariables,
    syntaxErrors,
    characterCount,
    estimatedSegments,
  };
}

// ============================================================================
// 2. POLICY VALIDATION
// ============================================================================

export function validatePolicyDefinition(
  policy: Partial<NotificationPolicy>,
  existingPolicies: NotificationPolicy[] = [],
  currentPolicyId?: string
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!policy.name || policy.name.trim().length === 0) {
    errors.push('Policy name is required.');
  }

  if (!policy.category) {
    errors.push('Notification category is required.');
  }

  if (!policy.applicableChannels || policy.applicableChannels.length === 0) {
    errors.push('At least one applicable communication channel must be selected.');
  }

  if (!policy.requiredTemplateKey || policy.requiredTemplateKey.trim().length === 0) {
    errors.push('Required template key reference is mandatory.');
  }

  // Quiet hours time validation
  if (policy.quietHours && policy.quietHours.enabled) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(policy.quietHours.startTimeUtc)) {
      errors.push("Quiet hours start time must be in HH:MM 24-hour format (e.g. '22:00').");
    }
    if (!timeRegex.test(policy.quietHours.endTimeUtc)) {
      errors.push("Quiet hours end time must be in HH:MM 24-hour format (e.g. '07:00').");
    }
  }

  // Tenant scope check
  if (policy.scope === 'tenant_specific' && (!policy.targetTenantId || policy.targetTenantId.trim().length === 0)) {
    errors.push('Tenant-specific policy must declare a targetTenantId.');
  }

  // Check duplicate policy name
  const currentId = currentPolicyId || policy.id;
  const duplicate = existingPolicies.find(
    (p) => p.name.toLowerCase() === policy.name?.toLowerCase() && p.id !== currentId
  );
  if (duplicate) {
    warnings.push(`Another policy named '${duplicate.name}' already exists.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// 3. CAMPAIGN DRAFT VALIDATION
// ============================================================================

export function validateCampaignDraft(
  campaign: Partial<CampaignDraft>,
  templates?: CommunicationTemplate[]
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!campaign.name || campaign.name.trim().length === 0) {
    errors.push('Campaign name is required.');
  }

  if (!campaign.audienceScope) {
    errors.push('Audience scope is required.');
  }

  if (campaign.audienceScope === 'selected_tenants') {
    if (!campaign.targetTenantIds || campaign.targetTenantIds.length === 0) {
      errors.push('At least one school organization must be selected for custom cohort audience.');
    }
  }

  if (!campaign.channel) {
    errors.push('Delivery channel is required.');
  }

  if (!campaign.templateKey || campaign.templateKey.trim().length === 0) {
    errors.push('Template reference is required.');
  } else if (templates) {
    const matched = templates.find((t) => t.key === campaign.templateKey);
    if (!matched) {
      errors.push(`Referenced template '${campaign.templateKey}' does not exist in template registry.`);
    } else if (matched.status === 'draft' || matched.status === 'archived') {
      errors.push(`Campaign drafts cannot reference templates in '${matched.status}' status. Template must be approved or active.`);
    }
  }

  if (!campaign.scheduledAt || campaign.scheduledAt.trim().length === 0) {
    errors.push('Scheduled dispatch date and time is required.');
  } else {
    const scheduledDate = new Date(campaign.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      errors.push('Scheduled date and time is not a valid timestamp.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
