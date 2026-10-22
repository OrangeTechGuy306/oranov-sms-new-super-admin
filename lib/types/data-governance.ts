/**
 * Phase E-09.20: Platform Data Governance, Data Retention, Privacy and Lifecycle Management
 * 
 * Strict TypeScript contracts for data classification, retention schedules,
 * simulated privacy requests (DSARs), lifecycle rules, tenant governance aggregation,
 * policy exceptions, and governance audit trails.
 */

export type DataClassificationLevel = 'public' | 'internal' | 'confidential' | 'restricted';

export type DataSubjectType =
  | 'student'
  | 'guardian'
  | 'staff'
  | 'organization'
  | 'system'
  | 'applicant'
  | 'vendor';

export type DataCategoryLifecycleStatus =
  | 'active'
  | 'restricted'
  | 'archived'
  | 'scheduled_deletion';

export type ReviewStatus = 'current' | 'needs_review' | 'under_review';

export type DataSourceStatus = 'simulated_source' | 'static_registry' | 'unavailable';

export interface DataCategoryRecord {
  id: string; // e.g. "cat_student_records"
  code: string; // e.g. "DATA-STU-01"
  name: string;
  description: string;
  dataSubjectType: DataSubjectType;
  classificationLevel: DataClassificationLevel;
  businessPurpose: string;
  owningModule: string;
  retentionPolicyId: string | null;
  lifecycleStatus: DataCategoryLifecycleStatus;
  reviewStatus: ReviewStatus;
  dataSourceStatus: DataSourceStatus;
  sensitiveAttributes: string[];
  applicableRegulations: string[];
  notes: string;
  lastReviewedAt: string;
  isProposedClassification: boolean;
}

export type RetentionTrigger =
  | 'record_creation'
  | 'account_closure'
  | 'student_graduation_or_departure'
  | 'academic_year_completion'
  | 'contract_termination'
  | 'statutory_requirement';

export type RetentionPolicyStatus =
  | 'draft'
  | 'awaiting_review'
  | 'approved_demo'
  | 'active_config'
  | 'suspended'
  | 'retired';

export type PolicyApprovalStatus = 'unreviewed' | 'internally_reviewed' | 'approved_demo';

export interface GovernanceRetentionPolicy {
  id: string; // e.g. "ret_pol_001"
  code: string; // e.g. "RET-STU-PERMANENT"
  name: string;
  description: string;
  coveredCategoryIds: string[];
  durationDays: number; // -1 for indefinite/permanent, or e.g. 365, 2555
  durationDisplay: string;
  retentionTrigger: RetentionTrigger;
  triggerDescription: string;
  policyOwner: string;
  status: RetentionPolicyStatus;
  enforcementMode: 'simulated_advisory' | 'enforcement_unknown';
  approvalStatus: PolicyApprovalStatus;
  lastReviewedAt: string;
  nextReviewDueAt: string;
  exceptionHandlingNotes: string;
  legalSafeguardBasis: string;
  activeExceptionsCount: number;
  isDemonstration: true;
}

export type PrivacyRequestCategory =
  | 'access_request'
  | 'correction_request'
  | 'deletion_erasure'
  | 'portability_export'
  | 'restriction_processing'
  | 'objection_processing'
  | 'consent_inquiry';

export type PrivacyPartyType =
  | 'student_parent_representative'
  | 'staff_member'
  | 'alumni'
  | 'applicant_guardian'
  | 'regulatory_officer';

export type PrivacyWorkflowStatus =
  | 'received'
  | 'identity_verification_pending'
  | 'under_review'
  | 'awaiting_info'
  | 'approved_pending_execution'
  | 'rejected_with_grounds'
  | 'processing_simulated'
  | 'completed_closed';

export type PrivacyPriority = 'low' | 'normal' | 'urgent';

export type PrivacyResolutionCategory =
  | 'disclosed_synthetic_manifest'
  | 'corrected_synthetic_metadata'
  | 'deletion_simulated_tombstoned'
  | 'restricted_mock_flag'
  | 'rejected_unverified_identity'
  | 'rejected_statutory_retention_override'
  | 'pending';

export interface PrivacySimulatedArtifact {
  type: 'json_manifest' | 'redacted_export' | 'tombstone_receipt' | 'none';
  summary: string;
  fieldsProcessedCount: number;
  generatedAt: string;
}

export interface PrivacyRequestRecord {
  id: string; // e.g. "pr_req_001"
  code: string; // e.g. "DSAR-2026-001"
  category: PrivacyRequestCategory;
  requestingPartyType: PrivacyPartyType;
  requestingPartyLabel: string; // synthetic label, ZERO real personal names or email
  tenantId: string;
  tenantName: string;
  receivedAt: string;
  dueAt: string;
  workflowStatus: PrivacyWorkflowStatus;
  assignedRole: string;
  priority: PrivacyPriority;
  requestSummary: string;
  reviewNotes: string;
  resolutionCategory: PrivacyResolutionCategory;
  resolutionSummary: string;
  completedAt: string | null;
  isSimulatedWorkflow: true;
  simulatedArtifactManifest: PrivacySimulatedArtifact | null;
}

export type LifecycleStage =
  | 'created_collected'
  | 'active_use'
  | 'restricted_inactive'
  | 'archived'
  | 'scheduled_review'
  | 'scheduled_deletion'
  | 'anonymized_demo'
  | 'retained_exception';

export type LifecycleTriggerEvent =
  | 'inactivity_threshold'
  | 'retention_expiry'
  | 'tenant_offboarding'
  | 'academic_cohort_graduated'
  | 'legal_hold_released';

export type LifecycleApprovalRequirement =
  | 'platform_super_admin'
  | 'dpo_officer'
  | 'tenant_admin_consent'
  | 'dual_authorization';

export type LifecycleRuleStatus = 'enabled' | 'disabled' | 'draft';

export interface DataLifecycleRuleRecord {
  id: string; // e.g. "lcr_001"
  code: string; // e.g. "LCR-EXAM-ARCHIVE"
  name: string;
  coveredCategoryId: string;
  triggerEvent: LifecycleTriggerEvent;
  triggerConditions: string;
  targetLifecycleStage: LifecycleStage;
  requiredApproval: LifecycleApprovalRequirement;
  exceptionHandling: string;
  status: LifecycleRuleStatus;
  lastRunSimulatedAt: string | null;
  lastReviewDate: string;
  nextReviewDate: string;
  isDemonstration: true;
}

export type GovernanceCompleteness =
  | 'complete'
  | 'review_required'
  | 'incomplete'
  | 'unverified';

export interface TenantGovernanceSummary {
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  tier: string;
  classificationCoveragePercent: number;
  totalMappedCategories: number;
  retentionPoliciesAssignedCount: number;
  policiesAwaitingReviewCount: number;
  openPrivacyRequestsCount: number;
  unresolvedExceptionsCount: number;
  governanceCompleteness: GovernanceCompleteness;
  missingMetadataFields: string[];
  lastGovernanceAuditAt: string;
  isSimulatedAggregate: true;
}

export type ExceptionReasonCategory =
  | 'statutory_tax_audit'
  | 'ongoing_litigation_hold'
  | 'historical_archival'
  | 'accreditation_review'
  | 'contractual_override';

export type ExceptionReviewStatus =
  | 'pending_review'
  | 'approved_demo'
  | 'rejected'
  | 'expired';

export type ExceptionApprovalRequirement =
  | 'legal_counsel'
  | 'super_admin_dual_key'
  | 'board_approval';

export interface GovernanceExceptionRecord {
  id: string; // e.g. "exc_001"
  code: string; // e.g. "EXC-TAX-2026-01"
  title: string;
  relatedPolicyId: string;
  relatedCategoryId: string;
  tenantId: string; // or "platform_wide"
  tenantName: string;
  reasonCategory: ExceptionReasonCategory;
  reviewStatus: ExceptionReviewStatus;
  approvalRequirement: ExceptionApprovalRequirement;
  requestedAt: string;
  reviewDueAt: string;
  expirationAt: string;
  responsibleRole: string;
  justificationText: string;
  resolutionSummary: string;
  isDemonstration: true;
}

export interface GovernanceAuditRecord {
  id: string;
  timestamp: string;
  category: 'data_governance';
  action: string;
  severity: 'info' | 'warning' | 'critical';
  actor: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  targetEntity: string;
  targetId: string;
  targetName?: string;
  status: 'succeeded' | 'failed';
  details: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  isDemoFixture: true;
}

export interface GovernanceMetricsSummary {
  totalCategories: number;
  classifiedCategories: number;
  unclassifiedCategories: number;
  totalRetentionPolicies: number;
  activeRetentionPolicies: number;
  uncoveredCategoriesCount: number;
  policiesDueForReviewCount: number;
  openPrivacyRequestsCount: number;
  overduePrivacyRequestsCount: number;
  totalLifecycleRules: number;
  enabledLifecycleRules: number;
  exceptionsAwaitingReviewCount: number;
  tenantsWithIncompleteGovernanceCount: number;
  classificationDistribution: Record<DataClassificationLevel, number>;
  requestCategoryDistribution: Record<PrivacyRequestCategory, number>;
  requestStatusDistribution: Record<PrivacyWorkflowStatus, number>;
  lifecycleStageDistribution: Record<LifecycleStage, number>;
}

// Input Types for Actions & Forms
export interface UpdateDataCategoryInput {
  name?: string;
  description?: string;
  dataSubjectType?: DataSubjectType;
  classificationLevel?: DataClassificationLevel;
  businessPurpose?: string;
  owningModule?: string;
  retentionPolicyId?: string | null;
  lifecycleStatus?: DataCategoryLifecycleStatus;
  reviewStatus?: ReviewStatus;
  notes?: string;
}

export interface CreateRetentionPolicyInput {
  name: string;
  description: string;
  coveredCategoryIds: string[];
  durationDays: number;
  durationDisplay: string;
  retentionTrigger: RetentionTrigger;
  triggerDescription: string;
  policyOwner: string;
  status: RetentionPolicyStatus;
  approvalStatus: PolicyApprovalStatus;
  nextReviewDueAt: string;
  exceptionHandlingNotes: string;
  legalSafeguardBasis: string;
}

export interface UpdateRetentionPolicyInput {
  name?: string;
  description?: string;
  coveredCategoryIds?: string[];
  durationDays?: number;
  durationDisplay?: string;
  retentionTrigger?: RetentionTrigger;
  triggerDescription?: string;
  policyOwner?: string;
  status?: RetentionPolicyStatus;
  approvalStatus?: PolicyApprovalStatus;
  nextReviewDueAt?: string;
  exceptionHandlingNotes?: string;
  legalSafeguardBasis?: string;
}

export interface CreatePrivacyRequestInput {
  category: PrivacyRequestCategory;
  requestingPartyType: PrivacyPartyType;
  requestingPartyLabel: string;
  tenantId: string;
  tenantName: string;
  dueAt: string;
  assignedRole: string;
  priority: PrivacyPriority;
  requestSummary: string;
}

export interface CreateLifecycleRuleInput {
  name: string;
  coveredCategoryId: string;
  triggerEvent: LifecycleTriggerEvent;
  triggerConditions: string;
  targetLifecycleStage: LifecycleStage;
  requiredApproval: LifecycleApprovalRequirement;
  exceptionHandling: string;
  status: LifecycleRuleStatus;
  nextReviewDate: string;
}

export interface CreateGovernanceExceptionInput {
  title: string;
  relatedPolicyId: string;
  relatedCategoryId: string;
  tenantId: string;
  tenantName: string;
  reasonCategory: ExceptionReasonCategory;
  approvalRequirement: ExceptionApprovalRequirement;
  reviewDueAt: string;
  expirationAt: string;
  responsibleRole: string;
  justificationText: string;
}
