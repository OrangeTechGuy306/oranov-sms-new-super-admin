/**
 * Phase E-09.20: Domain Evaluation, Metrics Computation, Filtering,
 * State Machine Validation, and Tenant Aggregation for Data Governance.
 */

import {
  DataCategoryRecord,
  GovernanceRetentionPolicy,
  PrivacyRequestRecord,
  DataLifecycleRuleRecord,
  GovernanceExceptionRecord,
  GovernanceMetricsSummary,
  TenantGovernanceSummary,
  DataClassificationLevel,
  PrivacyRequestCategory,
  PrivacyWorkflowStatus,
  LifecycleStage,
  GovernanceCompleteness,
  PrivacySimulatedArtifact,
} from '../types/data-governance';
import { Organization } from '../types/organizations';

/**
 * Checks whether a given due date has elapsed.
 */
export function isOverdue(dueDateString: string, referenceDateString = '2026-03-22T00:00:00Z'): boolean {
  if (!dueDateString) return false;
  const due = new Date(dueDateString).getTime();
  const ref = new Date(referenceDateString).getTime();
  return due < ref;
}

/**
 * Checks whether a given date is due within the next N days.
 */
export function isDueSoon(dueDateString: string, daysAhead = 14, referenceDateString = '2026-03-22T00:00:00Z'): boolean {
  if (!dueDateString) return false;
  const due = new Date(dueDateString).getTime();
  const ref = new Date(referenceDateString).getTime();
  const threshold = ref + daysAhead * 24 * 60 * 60 * 1000;
  return due >= ref && due <= threshold;
}

/**
 * Checks whether a scheduled review date is due (past or within next 30 days).
 */
export function isReviewDue(nextReviewDateString: string, referenceDateString = '2026-03-22T00:00:00Z'): boolean {
  if (!nextReviewDateString) return true;
  const reviewDate = new Date(nextReviewDateString).getTime();
  const ref = new Date(referenceDateString).getTime();
  const thirtyDaysAhead = ref + 30 * 24 * 60 * 60 * 1000;
  return reviewDate <= thirtyDaysAhead;
}

/**
 * Computes centralized platform governance KPI metrics.
 */
export function computeGovernanceMetrics(
  categories: DataCategoryRecord[],
  policies: GovernanceRetentionPolicy[],
  requests: PrivacyRequestRecord[],
  rules: DataLifecycleRuleRecord[],
  exceptions: GovernanceExceptionRecord[],
  tenantSummaries: TenantGovernanceSummary[]
): GovernanceMetricsSummary {
  const totalCategories = categories.length;
  const classifiedCategories = categories.filter((c) => c.classificationLevel).length;
  const unclassifiedCategories = totalCategories - classifiedCategories;

  const totalRetentionPolicies = policies.length;
  const activeRetentionPolicies = policies.filter((p) => p.status === 'active_config').length;

  const validPolicyIds = new Set(policies.map((p) => p.id));
  const uncoveredCategoriesCount = categories.filter(
    (c) => !c.retentionPolicyId || !validPolicyIds.has(c.retentionPolicyId)
  ).length;

  const policiesDueForReviewCount = policies.filter((p) => isReviewDue(p.nextReviewDueAt)).length;

  const openPrivacyRequestsCount = requests.filter(
    (r) => r.workflowStatus !== 'completed_closed' && r.workflowStatus !== 'rejected_with_grounds'
  ).length;

  const overduePrivacyRequestsCount = requests.filter(
    (r) =>
      r.workflowStatus !== 'completed_closed' &&
      r.workflowStatus !== 'rejected_with_grounds' &&
      isOverdue(r.dueAt)
  ).length;

  const totalLifecycleRules = rules.length;
  const enabledLifecycleRules = rules.filter((r) => r.status === 'enabled').length;

  const exceptionsAwaitingReviewCount = exceptions.filter(
    (e) => e.reviewStatus === 'pending_review'
  ).length;

  const tenantsWithIncompleteGovernanceCount = tenantSummaries.filter(
    (t) => t.governanceCompleteness !== 'complete'
  ).length;

  // Distributions
  const classificationDistribution: Record<DataClassificationLevel, number> = {
    public: 0,
    internal: 0,
    confidential: 0,
    restricted: 0,
  };
  categories.forEach((c) => {
    if (c.classificationLevel && classificationDistribution[c.classificationLevel] !== undefined) {
      classificationDistribution[c.classificationLevel]++;
    }
  });

  const requestCategoryDistribution: Record<PrivacyRequestCategory, number> = {
    access_request: 0,
    correction_request: 0,
    deletion_erasure: 0,
    portability_export: 0,
    restriction_processing: 0,
    objection_processing: 0,
    consent_inquiry: 0,
  };
  requests.forEach((r) => {
    if (requestCategoryDistribution[r.category] !== undefined) {
      requestCategoryDistribution[r.category]++;
    }
  });

  const requestStatusDistribution: Record<PrivacyWorkflowStatus, number> = {
    received: 0,
    identity_verification_pending: 0,
    under_review: 0,
    awaiting_info: 0,
    approved_pending_execution: 0,
    rejected_with_grounds: 0,
    processing_simulated: 0,
    completed_closed: 0,
  };
  requests.forEach((r) => {
    if (requestStatusDistribution[r.workflowStatus] !== undefined) {
      requestStatusDistribution[r.workflowStatus]++;
    }
  });

  const lifecycleStageDistribution: Record<LifecycleStage, number> = {
    created_collected: 0,
    active_use: 0,
    restricted_inactive: 0,
    archived: 0,
    scheduled_review: 0,
    scheduled_deletion: 0,
    anonymized_demo: 0,
    retained_exception: 0,
  };
  rules.forEach((r) => {
    if (lifecycleStageDistribution[r.targetLifecycleStage] !== undefined) {
      lifecycleStageDistribution[r.targetLifecycleStage]++;
    }
  });

  return {
    totalCategories,
    classifiedCategories,
    unclassifiedCategories,
    totalRetentionPolicies,
    activeRetentionPolicies,
    uncoveredCategoriesCount,
    policiesDueForReviewCount,
    openPrivacyRequestsCount,
    overduePrivacyRequestsCount,
    totalLifecycleRules,
    enabledLifecycleRules,
    exceptionsAwaitingReviewCount,
    tenantsWithIncompleteGovernanceCount,
    classificationDistribution,
    requestCategoryDistribution,
    requestStatusDistribution,
    lifecycleStageDistribution,
  };
}

/**
 * Filter data inventory categories.
 */
export function filterDataCategories(
  categories: DataCategoryRecord[],
  query?: string,
  classification?: string,
  subjectType?: string,
  module?: string,
  retentionCoverage?: string
): DataCategoryRecord[] {
  let filtered = [...categories];

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.owningModule.toLowerCase().includes(q) ||
        c.applicableRegulations.some((reg) => reg.toLowerCase().includes(q))
    );
  }

  if (classification && classification !== 'all') {
    filtered = filtered.filter((c) => c.classificationLevel === classification);
  }

  if (subjectType && subjectType !== 'all') {
    filtered = filtered.filter((c) => c.dataSubjectType === subjectType);
  }

  if (module && module !== 'all') {
    filtered = filtered.filter((c) => c.owningModule.toLowerCase().includes(module.toLowerCase()));
  }

  if (retentionCoverage && retentionCoverage !== 'all') {
    if (retentionCoverage === 'covered') {
      filtered = filtered.filter((c) => !!c.retentionPolicyId);
    } else if (retentionCoverage === 'uncovered') {
      filtered = filtered.filter((c) => !c.retentionPolicyId);
    }
  }

  return filtered;
}

/**
 * Filter retention policies.
 */
export function filterGovernanceRetentionPolicies(
  policies: GovernanceRetentionPolicy[],
  query?: string,
  status?: string,
  trigger?: string,
  reviewDueOnly?: boolean
): GovernanceRetentionPolicy[] {
  let filtered = [...policies];

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.policyOwner.toLowerCase().includes(q) ||
        p.legalSafeguardBasis.toLowerCase().includes(q)
    );
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((p) => p.status === status);
  }

  if (trigger && trigger !== 'all') {
    filtered = filtered.filter((p) => p.retentionTrigger === trigger);
  }

  if (reviewDueOnly) {
    filtered = filtered.filter((p) => isReviewDue(p.nextReviewDueAt));
  }

  return filtered;
}

/**
 * Filter simulated privacy requests.
 */
export function filterPrivacyRequests(
  requests: PrivacyRequestRecord[],
  query?: string,
  category?: string,
  status?: string,
  tenantId?: string,
  priority?: string,
  dueStatus?: string
): PrivacyRequestRecord[] {
  let filtered = [...requests];

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.requestingPartyLabel.toLowerCase().includes(q) ||
        r.tenantName.toLowerCase().includes(q) ||
        r.requestSummary.toLowerCase().includes(q) ||
        r.assignedRole.toLowerCase().includes(q)
    );
  }

  if (category && category !== 'all') {
    filtered = filtered.filter((r) => r.category === category);
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((r) => r.workflowStatus === status);
  }

  if (tenantId && tenantId !== 'all') {
    filtered = filtered.filter((r) => r.tenantId === tenantId);
  }

  if (priority && priority !== 'all') {
    filtered = filtered.filter((r) => r.priority === priority);
  }

  if (dueStatus && dueStatus !== 'all') {
    if (dueStatus === 'overdue') {
      filtered = filtered.filter(
        (r) =>
          r.workflowStatus !== 'completed_closed' &&
          r.workflowStatus !== 'rejected_with_grounds' &&
          isOverdue(r.dueAt)
      );
    } else if (dueStatus === 'due_soon') {
      filtered = filtered.filter(
        (r) =>
          r.workflowStatus !== 'completed_closed' &&
          r.workflowStatus !== 'rejected_with_grounds' &&
          isDueSoon(r.dueAt)
      );
    } else if (dueStatus === 'completed') {
      filtered = filtered.filter(
        (r) => r.workflowStatus === 'completed_closed' || r.workflowStatus === 'rejected_with_grounds'
      );
    }
  }

  return filtered;
}

/**
 * Filter data lifecycle rules.
 */
export function filterLifecycleRules(
  rules: DataLifecycleRuleRecord[],
  query?: string,
  categoryId?: string,
  status?: string,
  stage?: string
): DataLifecycleRuleRecord[] {
  let filtered = [...rules];

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.triggerConditions.toLowerCase().includes(q) ||
        r.exceptionHandling.toLowerCase().includes(q)
    );
  }

  if (categoryId && categoryId !== 'all') {
    filtered = filtered.filter((r) => r.coveredCategoryId === categoryId);
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((r) => r.status === status);
  }

  if (stage && stage !== 'all') {
    filtered = filtered.filter((r) => r.targetLifecycleStage === stage);
  }

  return filtered;
}

/**
 * Filter governance exceptions.
 */
export function filterGovernanceExceptions(
  exceptions: GovernanceExceptionRecord[],
  query?: string,
  status?: string,
  reason?: string,
  tenantId?: string
): GovernanceExceptionRecord[] {
  let filtered = [...exceptions];

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.tenantName.toLowerCase().includes(q) ||
        e.justificationText.toLowerCase().includes(q) ||
        e.responsibleRole.toLowerCase().includes(q)
    );
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((e) => e.reviewStatus === status);
  }

  if (reason && reason !== 'all') {
    filtered = filtered.filter((e) => e.reasonCategory === reason);
  }

  if (tenantId && tenantId !== 'all') {
    filtered = filtered.filter((e) => e.tenantId === tenantId || (tenantId === 'platform_wide' && e.tenantId === 'platform_wide'));
  }

  return filtered;
}

/**
 * Validates whether a proposed privacy workflow transition is legitimate.
 */
export function isValidPrivacyTransition(
  currentStatus: PrivacyWorkflowStatus,
  targetStatus: PrivacyWorkflowStatus
): { valid: boolean; reason?: string } {
  if (currentStatus === targetStatus) {
    return { valid: true };
  }

  const allowedTransitions: Record<PrivacyWorkflowStatus, PrivacyWorkflowStatus[]> = {
    received: ['identity_verification_pending', 'under_review', 'rejected_with_grounds'],
    identity_verification_pending: ['under_review', 'awaiting_info', 'rejected_with_grounds'],
    under_review: ['awaiting_info', 'approved_pending_execution', 'rejected_with_grounds'],
    awaiting_info: ['under_review', 'rejected_with_grounds'],
    approved_pending_execution: ['processing_simulated', 'completed_closed'],
    processing_simulated: ['completed_closed'],
    rejected_with_grounds: ['under_review'], // reopen in demo
    completed_closed: ['under_review'], // reopen in demo
  };

  const allowed = allowedTransitions[currentStatus] || [];
  if (allowed.includes(targetStatus)) {
    return { valid: true };
  }

  return {
    valid: false,
    reason: `Cannot transition request from "${currentStatus}" directly to "${targetStatus}". Permitted next states: ${allowed.join(', ') || 'none'}.`,
  };
}

/**
 * Aggregates tenant governance summaries across all registered school organizations.
 */
export function computeTenantGovernanceSummaries(
  organizations: Organization[],
  categories: DataCategoryRecord[],
  policies: GovernanceRetentionPolicy[],
  requests: PrivacyRequestRecord[],
  exceptions: GovernanceExceptionRecord[]
): TenantGovernanceSummary[] {
  const totalCategoriesCount = categories.length || 1;

  return organizations.map((org) => {
    // Determine mapped categories for this tenant (organizations inherit baseline categories)
    const activePoliciesCount = policies.filter((p) => p.status === 'active_config').length;
    const policiesAwaitingReview = policies.filter((p) => isReviewDue(p.nextReviewDueAt)).length;

    const tenantRequests = requests.filter((r) => r.tenantId === org.id);
    const openRequests = tenantRequests.filter(
      (r) => r.workflowStatus !== 'completed_closed' && r.workflowStatus !== 'rejected_with_grounds'
    ).length;

    const tenantExceptions = exceptions.filter(
      (e) => e.tenantId === org.id || e.tenantId === 'platform_wide'
    );
    const unresolvedExceptions = tenantExceptions.filter(
      (e) => e.reviewStatus === 'pending_review'
    ).length;

    // Evaluate completeness
    let completeness: GovernanceCompleteness = 'complete';
    const missingFields: string[] = [];

    // Synthetic completeness criteria based on org properties
    if (org.status === 'pending' || org.status === 'suspended') {
      completeness = 'review_required';
      missingFields.push('Tenant Lifecycle Flag Review Required');
    }

    if (policiesAwaitingReview > 0 || unresolvedExceptions > 0) {
      if (completeness === 'complete') completeness = 'review_required';
    }

    // Check if tenant has missing contact/technical metadata in store
    if (!org.subdomain || !org.contact?.email) {
      completeness = 'incomplete';
      missingFields.push('Tenant Contact & Routing Metadata Binding');
    }

    const coveragePercent = Math.min(
      100,
      Math.round(((categories.filter((c) => c.retentionPolicyId).length) / totalCategoriesCount) * 100)
    );

    return {
      tenantId: org.id,
      tenantName: org.name,
      tenantCode: org.code,
      tier: org.planId ? org.planId.replace('plan_', '') : 'standard',
      classificationCoveragePercent: coveragePercent,
      totalMappedCategories: categories.length,
      retentionPoliciesAssignedCount: activePoliciesCount,
      policiesAwaitingReviewCount: policiesAwaitingReview,
      openPrivacyRequestsCount: openRequests,
      unresolvedExceptionsCount: unresolvedExceptions,
      governanceCompleteness: completeness,
      missingMetadataFields: missingFields,
      lastGovernanceAuditAt: '2026-03-15T00:00:00Z',
      isSimulatedAggregate: true,
    };
  });
}

/**
 * Simulates the execution of a privacy request.
 * Generates synthetic output manifests without accessing or deleting any real records.
 */
export function simulatePrivacyRequestExecution(
  request: PrivacyRequestRecord
): { updatedRequest: PrivacyRequestRecord; auditDetails: string } {
  let artifact: PrivacySimulatedArtifact = {
    type: 'none',
    summary: 'No synthetic artifact generated',
    fieldsProcessedCount: 0,
    generatedAt: new Date().toISOString(),
  };

  let resolutionCategory = request.resolutionCategory;
  let resolutionSummary = request.resolutionSummary;

  if (request.category === 'access_request' || request.category === 'portability_export') {
    artifact = {
      type: 'json_manifest',
      summary: `Standard synthetic Ed-Fi/OneRoster sanitized manifest generated for ${request.requestingPartyLabel}. Zero actual student PII included.`,
      fieldsProcessedCount: 38,
      generatedAt: new Date().toISOString(),
    };
    resolutionCategory = 'disclosed_synthetic_manifest';
    resolutionSummary = 'Generated synthetic portable JSON record package.';
  } else if (request.category === 'deletion_erasure') {
    artifact = {
      type: 'tombstone_receipt',
      summary: `Simulated cryptographic tombstone receipt issued. Zero actual database deletions performed (frontend simulation).`,
      fieldsProcessedCount: 14,
      generatedAt: new Date().toISOString(),
    };
    resolutionCategory = 'deletion_simulated_tombstoned';
    resolutionSummary = 'Simulated tombstone receipt recorded in compliance register.';
  } else if (request.category === 'restriction_processing') {
    artifact = {
      type: 'redacted_export',
      summary: `Synthetic restriction flag applied across mock directory views.`,
      fieldsProcessedCount: 5,
      generatedAt: new Date().toISOString(),
    };
    resolutionCategory = 'restricted_mock_flag';
    resolutionSummary = 'Processing restriction mock token configured.';
  } else if (request.category === 'correction_request') {
    resolutionCategory = 'corrected_synthetic_metadata';
    resolutionSummary = 'Simulated record attribute update certified.';
  }

  const updatedRequest: PrivacyRequestRecord = {
    ...request,
    workflowStatus: 'completed_closed',
    resolutionCategory,
    resolutionSummary,
    completedAt: new Date().toISOString(),
    simulatedArtifactManifest: artifact,
  };

  const auditDetails = `Simulated privacy request completion for ${request.code} (${request.category}). Outcome: ${resolutionCategory}. Fields processed: ${artifact.fieldsProcessedCount}.`;

  return { updatedRequest, auditDetails };
}
