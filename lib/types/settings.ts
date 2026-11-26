/**
 * Domain contracts for Platform Settings and Feature Availability.
 */

export interface PlatformBranding {
  platformName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  documentationUrl: string;
  logoUrl?: string;
}

export interface PlatformRegionalConfig {
  defaultLocale: string;
  defaultTimezone: string;
  supportedCurrencies: string[];
  defaultCurrency: string;
  dateFormat: string;
}

export interface PlatformOnboardingPolicy {
  autoApproveFreeTrials: boolean;
  trialDurationDays: number;
  requireAdministratorVerification: boolean;
  notifyAdminsOnNewSignup: boolean;
  maxOrganizationsPerDomain: number;
}

export interface PlatformMaintenanceConfig {
  isMaintenanceMode: boolean;
  scheduledWindowStart?: string;
  scheduledWindowEnd?: string;
  bypassIps: string[];
  bannerMessage: string;
}

export interface PlatformSettings {
  branding: PlatformBranding;
  regional: PlatformRegionalConfig;
  onboardingPolicy: PlatformOnboardingPolicy;
  maintenance: PlatformMaintenanceConfig;
}

export type FeatureCategory = 
  | 'academics' 
  | 'administration' 
  | 'finance' 
  | 'communications' 
  | 'platform_security' 
  | 'analytics';

export interface PlatformFeatureItem {
  id: string;
  key?: string;
  code: string;
  name: string;
  description: string;
  category: FeatureCategory;
  moduleId?: string;
  availableInPlans: string[]; // plan IDs or tiers
  optionalAddOnPlanIds?: string[];
  isGloballyEnabled: boolean;
  isBeta: boolean;
  requiresAddonLicense?: boolean;
  availabilityStatus?: 'available' | 'enabled' | 'disabled' | 'coming_soon' | 'deprecated' | 'unavailable';
  implementationMaturity?: 'implemented' | 'partial' | 'planned';
  dependencies?: string[];
  requiredPermissions?: string[];
  supportedSchoolTypes?: string[];
  commercialConfigStatus?: 'configured' | 'requires_product_owner_configuration';
}
