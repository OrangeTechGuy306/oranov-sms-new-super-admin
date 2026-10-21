/**
 * Phase E-09.15: Configuration Validation Engine.
 * Provides deep validation across Platform Settings, Feature Flags,
 * Tenant Overrides, Rollout Plans, Change Proposals, and Import Packages.
 */

import {
  ExtendedPlatformSettings,
  FeatureFlag,
  RolloutPlanInput,
  ConfigurationChangeProposal,
} from '@/lib/types/platform-config';
import { Organization } from '@/lib/types';
import { detectCircularDependencies, canTransitionLifecycle } from './evaluator';

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  issues: ValidationIssue[];
}

// Supported platform regional standards
export const SUPPORTED_LOCALES = [
  'en-US',
  'en-GB',
  'fr-FR',
  'es-ES',
  'pt-BR',
  'de-DE',
  'ar-SA',
  'sw-KE',
  'yo-NG',
];

export const SUPPORTED_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Africa/Lagos',
  'Africa/Nairobi',
  'Africa/Johannesburg',
  'Africa/Accra',
  'Asia/Dubai',
  'Asia/Singapore',
];

export const SUPPORTED_CURRENCIES = [
  'USD',
  'GBP',
  'EUR',
  'CAD',
  'AUD',
  'KES',
  'NGN',
  'GHS',
  'ZAR',
];

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FLAG_KEY_REGEX = /^[a-z0-9]+([._-][a-z0-9]+)*$/;

/**
 * Validates extended platform settings.
 */
export function validatePlatformSettings(settings: Partial<ExtendedPlatformSettings>): ValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. Branding
  if (settings.branding) {
    if (!settings.branding.platformName || settings.branding.platformName.trim().length < 2) {
      issues.push({
        field: 'branding.platformName',
        message: 'Platform name is required and must be at least 2 characters.',
        severity: 'error',
      });
    }

    if (settings.branding.supportEmail && !EMAIL_REGEX.test(settings.branding.supportEmail)) {
      issues.push({
        field: 'branding.supportEmail',
        message: 'Support email must be a valid email address.',
        severity: 'error',
      });
    }

    if (settings.branding.primaryColor && !HEX_COLOR_REGEX.test(settings.branding.primaryColor)) {
      issues.push({
        field: 'branding.primaryColor',
        message: 'Primary brand color must be a valid hex color code (e.g. #2563EB).',
        severity: 'error',
      });
    }

    if (settings.branding.secondaryColor && !HEX_COLOR_REGEX.test(settings.branding.secondaryColor)) {
      issues.push({
        field: 'branding.secondaryColor',
        message: 'Secondary brand color must be a valid hex color code (e.g. #4F46E5).',
        severity: 'error',
      });
    }
  }

  // 2. Regional
  if (settings.regional) {
    if (settings.regional.defaultLocale && !SUPPORTED_LOCALES.includes(settings.regional.defaultLocale)) {
      issues.push({
        field: 'regional.defaultLocale',
        message: `Unsupported locale "${settings.regional.defaultLocale}". Supported locales: ${SUPPORTED_LOCALES.join(', ')}.`,
        severity: 'error',
      });
    }

    if (settings.regional.defaultTimezone && !SUPPORTED_TIMEZONES.includes(settings.regional.defaultTimezone)) {
      issues.push({
        field: 'regional.defaultTimezone',
        message: `Unsupported timezone "${settings.regional.defaultTimezone}". Supported: ${SUPPORTED_TIMEZONES.slice(0, 5).join(', ')}...`,
        severity: 'error',
      });
    }

    if (settings.regional.defaultCurrency && !SUPPORTED_CURRENCIES.includes(settings.regional.defaultCurrency)) {
      issues.push({
        field: 'regional.defaultCurrency',
        message: `Unsupported default currency "${settings.regional.defaultCurrency}".`,
        severity: 'error',
      });
    }
  }

  // 3. Security Policy
  if (settings.securityPolicy) {
    if (settings.securityPolicy.sessionTimeoutMinutes < 5 || settings.securityPolicy.sessionTimeoutMinutes > 1440) {
      issues.push({
        field: 'securityPolicy.sessionTimeoutMinutes',
        message: 'Session timeout must be between 5 and 1440 minutes (24 hours).',
        severity: 'error',
      });
    }

    if (settings.securityPolicy.passwordMinLength < 8) {
      issues.push({
        field: 'securityPolicy.passwordMinLength',
        message: 'Minimum password length must be at least 8 characters.',
        severity: 'error',
      });
    }

    if (settings.securityPolicy.maxFailedLoginAttempts < 3) {
      issues.push({
        field: 'securityPolicy.maxFailedLoginAttempts',
        message: 'Max failed login attempts must be at least 3 to prevent accidental lockouts.',
        severity: 'warning',
      });
    }
  }

  // 4. Onboarding Policy
  if (settings.onboardingPolicy) {
    if (settings.onboardingPolicy.trialDurationDays < 7 || settings.onboardingPolicy.trialDurationDays > 180) {
      issues.push({
        field: 'onboardingPolicy.trialDurationDays',
        message: 'Free trial duration must be between 7 and 180 days.',
        severity: 'error',
      });
    }
  }

  const errors = issues.filter((i) => i.severity === 'error').map((i) => i.message);
  const warnings = issues.filter((i) => i.severity === 'warning').map((i) => i.message);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    issues,
  };
}

/**
 * Validates a feature flag entity before creation or update.
 */
export function validateFeatureFlag(
  flag: Partial<FeatureFlag>,
  existingFlags: FeatureFlag[],
  isCreating: boolean = false
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!flag.key || flag.key.trim().length < 3) {
    issues.push({
      field: 'key',
      message: 'Feature flag key is required and must be at least 3 characters.',
      severity: 'error',
    });
  } else if (!FLAG_KEY_REGEX.test(flag.key)) {
    issues.push({
      field: 'key',
      message: 'Feature flag key must use lowercase alphanumeric characters separated by dots, dashes, or underscores (e.g. feat.academics.cbt_grading).',
      severity: 'error',
    });
  }

  // Check key uniqueness on creation or key edit
  if (flag.key) {
    const duplicate = existingFlags.find(
      (f) => f.key.toLowerCase() === flag.key!.toLowerCase() && (!flag.id || f.id !== flag.id)
    );
    if (duplicate) {
      issues.push({
        field: 'key',
        message: `Feature flag key "${flag.key}" is already in use by flag "${duplicate.name}".`,
        severity: 'error',
      });
    }
  }

  if (!flag.name || flag.name.trim().length < 2) {
    issues.push({
      field: 'name',
      message: 'Feature flag human-readable name is required.',
      severity: 'error',
    });
  }

  if (!flag.description || flag.description.trim().length < 5) {
    issues.push({
      field: 'description',
      message: 'Feature flag description must be at least 5 characters.',
      severity: 'error',
    });
  }

  if (flag.rolloutPercentage !== undefined) {
    if (flag.rolloutPercentage < 0 || flag.rolloutPercentage > 100) {
      issues.push({
        field: 'rolloutPercentage',
        message: 'Rollout percentage must be between 0 and 100.',
        severity: 'error',
      });
    }
  }

  // Check dependencies exist
  if (flag.dependsOnFlagKeys && flag.dependsOnFlagKeys.length > 0) {
    for (const depKey of flag.dependsOnFlagKeys) {
      if (depKey === flag.key) {
        issues.push({
          field: 'dependsOnFlagKeys',
          message: `Self-dependency detected: flag "${flag.key}" cannot depend on itself.`,
          severity: 'error',
        });
      }

      const depExists = existingFlags.some((f) => f.key === depKey);
      if (!depExists) {
        issues.push({
          field: 'dependsOnFlagKeys',
          message: `Referenced dependency "${depKey}" does not exist in registry.`,
          severity: 'error',
        });
      }
    }

    // Check for circular dependency
    const simulatedFlags = existingFlags.map((f) => (f.id === flag.id ? ({ ...f, ...flag } as FeatureFlag) : f));
    if (isCreating && flag.key) {
      simulatedFlags.push(flag as FeatureFlag);
    }
    const cycleResult = detectCircularDependencies(simulatedFlags);
    if (cycleResult.hasCycle) {
      issues.push({
        field: 'dependsOnFlagKeys',
        message: `Circular dependency detected in graph: ${cycleResult.cyclePath?.join(' -> ')}.`,
        severity: 'error',
      });
    }
  }

  // Check lifecycle transition if updating an existing flag
  if (!isCreating && flag.id) {
    const existing = existingFlags.find((f) => f.id === flag.id);
    if (existing && flag.lifecycle && existing.lifecycle !== flag.lifecycle) {
      const transitionResult = canTransitionLifecycle(existing.lifecycle, flag.lifecycle);
      if (!transitionResult.allowed) {
        issues.push({
          field: 'lifecycle',
          message: transitionResult.reason || 'Invalid lifecycle transition.',
          severity: 'error',
        });
      }
    }
  }

  const errors = issues.filter((i) => i.severity === 'error').map((i) => i.message);
  const warnings = issues.filter((i) => i.severity === 'warning').map((i) => i.message);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    issues,
  };
}

/**
 * Validates a rollout plan input.
 */
export function validateRolloutPlan(
  plan: RolloutPlanInput,
  flags: FeatureFlag[],
  organizations: Organization[]
): ValidationResult {
  const issues: ValidationIssue[] = [];

  const flag = flags.find((f) => f.key === plan.flagKey);
  if (!flag) {
    issues.push({
      field: 'flagKey',
      message: `Target flag "${plan.flagKey}" does not exist in registry.`,
      severity: 'error',
    });
  } else if (flag.lifecycle === 'archived') {
    issues.push({
      field: 'flagKey',
      message: `Target flag "${flag.name}" is archived. Cannot plan rollout for archived flag.`,
      severity: 'error',
    });
  }

  if (plan.strategy === 'percentage_rollout') {
    if (plan.targetPercentage === undefined || plan.targetPercentage < 0 || plan.targetPercentage > 100) {
      issues.push({
        field: 'targetPercentage',
        message: 'Percentage rollout requires a valid percentage between 0 and 100.',
        severity: 'error',
      });
    }
  }

  if (plan.strategy === 'selective_tenants') {
    if (!plan.targetOrganizationIds || plan.targetOrganizationIds.length === 0) {
      issues.push({
        field: 'targetOrganizationIds',
        message: 'Selective rollout requires at least one organization to be selected.',
        severity: 'error',
      });
    } else {
      for (const orgId of plan.targetOrganizationIds) {
        const orgExists = organizations.some((o) => o.id === orgId);
        if (!orgExists) {
          issues.push({
            field: 'targetOrganizationIds',
            message: `Selected organization "${orgId}" not found in current organization catalogue.`,
            severity: 'error',
          });
        }
      }
    }
  }

  if (plan.scheduledStartDate && plan.scheduledEndDate) {
    const start = new Date(plan.scheduledStartDate).getTime();
    const end = new Date(plan.scheduledEndDate).getTime();
    if (isNaN(start) || isNaN(end)) {
      issues.push({
        field: 'scheduledStartDate',
        message: 'Rollout dates must be valid ISO date strings.',
        severity: 'error',
      });
    } else if (start >= end) {
      issues.push({
        field: 'scheduledEndDate',
        message: 'Scheduled end date must be strictly after the start date.',
        severity: 'error',
      });
    }
  }

  const errors = issues.filter((i) => i.severity === 'error').map((i) => i.message);
  const warnings = issues.filter((i) => i.severity === 'warning').map((i) => i.message);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    issues,
  };
}

/**
 * Validates a change governance proposal.
 */
export function validateChangeProposal(
  proposal: Partial<ConfigurationChangeProposal>
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!proposal.title || proposal.title.trim().length < 3) {
    issues.push({
      field: 'title',
      message: 'Proposal title is required (minimum 3 characters).',
      severity: 'error',
    });
  }

  if (!proposal.reason || proposal.reason.trim().length < 5) {
    issues.push({
      field: 'reason',
      message: 'A detailed change justification reason is required (minimum 5 characters).',
      severity: 'error',
    });
  }

  if (!proposal.diff || proposal.diff.length === 0) {
    issues.push({
      field: 'diff',
      message: 'Proposal must contain at least one field-level diff change item.',
      severity: 'error',
    });
  }

  const errors = issues.filter((i) => i.severity === 'error').map((i) => i.message);
  const warnings = issues.filter((i) => i.severity === 'warning').map((i) => i.message);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    issues,
  };
}
