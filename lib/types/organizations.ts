/**
 * Domain contracts for School Organizations in the SaaS Super-Admin platform.
 * These types define the client-side representation of tenant organizations.
 */

export type OrganizationLifecycleStatus = 
  | 'draft'
  | 'pending'
  | 'active'
  | 'suspended'
  | 'inactive'
  | 'archived';

export type ProvisioningStatus = 
  | 'not_started'
  | 'ready_for_review'
  | 'simulated_in_progress'
  | 'simulated_complete'
  | 'simulated_failed'
  | 'needs_attention';

export type OnboardingStatus = 'not_started' | 'in_progress' | 'verification_pending' | 'completed';

export type SchoolClassification = 
  | 'k12' 
  | 'primary' 
  | 'secondary' 
  | 'higher_education' 
  | 'vocational' 
  | 'international';

export interface OrganizationAdministrator {
  name: string;
  email: string;
  phone: string;
  roleTitle: string;
}

export interface OrganizationContact {
  email: string;
  phone: string;
  address: string;
  city: string;
  stateOrProvince: string;
  country: string;
  postalCode?: string;
  website?: string;
}

export interface OrganizationTechnicalConfig {
  subdomain: string;
  customDomain?: string;
  customDomainStatus?: 'not_configured' | 'dns_pending' | 'simulated_active' | 'failed';
  sslStatus?: 'not_provisioned' | 'simulated_active';
  timezone: string;
  academicYearStartMonth: number; // 1-12
  currency: string;
  locale: string;
  maxCampuses: number;
  storageAllocatedGb?: number;
}

export interface Organization {
  id: string;
  code: string; // e.g. "STJUDE", "OAKHILL"
  name: string;
  classification: SchoolClassification;
  status: OrganizationLifecycleStatus;
  onboardingStatus: OnboardingStatus;
  provisioningStatus?: ProvisioningStatus;
  planId: string;
  subdomain: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  archivedReason?: string;
  suspendedReason?: string;
  contact: OrganizationContact;
  administrator: OrganizationAdministrator;
  technicalConfig: OrganizationTechnicalConfig;
  notes?: string;
  studentCountEstimate?: number;
  staffCountEstimate?: number;
}

export interface InitialCampusInput {
  name: string;
  code: string;
  street?: string;
  city?: string;
  stateOrProvince?: string;
  country?: string;
  postalCode?: string;
  studentCapacity?: number;
}

export interface CreateOrganizationInput {
  name: string;
  code: string;
  classification: SchoolClassification;
  subdomain: string;
  contact: OrganizationContact;
  administrator: OrganizationAdministrator;
  planId: string;
  billingCycle: 'monthly' | 'annual';
  technicalConfig: OrganizationTechnicalConfig;
  initialCampus?: InitialCampusInput;
  notes?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  classification?: SchoolClassification;
  status?: OrganizationLifecycleStatus;
  onboardingStatus?: OnboardingStatus;
  provisioningStatus?: ProvisioningStatus;
  planId?: string;
  contact?: Partial<OrganizationContact>;
  administrator?: Partial<OrganizationAdministrator>;
  technicalConfig?: Partial<OrganizationTechnicalConfig>;
  notes?: string;
  studentCountEstimate?: number;
  staffCountEstimate?: number;
}

