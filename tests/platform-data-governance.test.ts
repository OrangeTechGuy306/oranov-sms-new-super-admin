import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { platformStore } from '../lib/data/platform-store';
import {
  isOverdue,
  isDueSoon,
  isReviewDue,
  computeGovernanceMetrics,
  filterDataCategories,
  filterGovernanceRetentionPolicies,
  filterPrivacyRequests,
  filterLifecycleRules,
  filterGovernanceExceptions,
  isValidPrivacyTransition,
  computeTenantGovernanceSummaries,
  simulatePrivacyRequestExecution,
} from '../lib/data-governance/evaluator';
import {
  sanitizeCsvCell,
  exportDataCategoriesToCsv,
  exportRetentionPoliciesToCsv,
  exportPrivacyRequestsToCsv,
  exportLifecycleRulesToCsv,
  exportTenantGovernanceSummariesToCsv,
  exportGovernanceExceptionsToCsv,
  exportGovernanceAuditToCsv,
  generateGovernancePackageJson,
} from '../lib/data-governance/exporter';
import {
  INITIAL_DATA_CATEGORIES,
  INITIAL_RETENTION_POLICIES,
  INITIAL_PRIVACY_REQUESTS,
  INITIAL_LIFECYCLE_RULES,
  INITIAL_GOVERNANCE_EXCEPTIONS,
  INITIAL_GOVERNANCE_AUDIT_LOGS,
} from '../lib/data-governance/fixtures';
import {
  CreateRetentionPolicyInput,
  CreateLifecycleRuleInput,
  CreateGovernanceExceptionInput,
} from '../lib/types/data-governance';
import { Organization } from '../lib/types/organizations';

describe('Phase E-09.20: Platform Data Governance, Data Retention, Privacy and Lifecycle Management', () => {
  beforeEach(() => {
    platformStore.resetToDefaults();
  });

  // ==========================================
  // 1. DATE & REVIEW DUE CALCULATIONS
  // ==========================================
  describe('1. Date & Review Due Calculations', () => {
    const fixedReference = '2026-03-22T00:00:00Z';

    test('isOverdue accurately identifies past dates vs future dates', () => {
      assert.equal(isOverdue('2026-03-20T00:00:00Z', fixedReference), true);
      assert.equal(isOverdue('2026-03-25T00:00:00Z', fixedReference), false);
      assert.equal(isOverdue('', fixedReference), false);
    });

    test('isDueSoon identifies dates within the upcoming threshold window', () => {
      // 5 days ahead
      assert.equal(isDueSoon('2026-03-27T00:00:00Z', 14, fixedReference), true);
      // 20 days ahead (beyond 14 days threshold)
      assert.equal(isDueSoon('2026-04-15T00:00:00Z', 14, fixedReference), false);
      // in the past
      assert.equal(isDueSoon('2026-03-10T00:00:00Z', 14, fixedReference), false);
    });

    test('isReviewDue flags policies past due or due within 30 days', () => {
      // due in 10 days
      assert.equal(isReviewDue('2026-04-01T00:00:00Z', fixedReference), true);
      // due in 60 days
      assert.equal(isReviewDue('2026-05-25T00:00:00Z', fixedReference), false);
      // empty string defaults to true (review needed)
      assert.equal(isReviewDue('', fixedReference), true);
    });
  });

  // ==========================================
  // 2. METRICS & KPI COMPUTATION
  // ==========================================
  describe('2. Centralized Governance KPI Metrics', () => {
    test('computes deterministic platform metrics from initial fixtures', () => {
      const tenantSummaries = computeTenantGovernanceSummaries(
        platformStore.getOrganizations(),
        INITIAL_DATA_CATEGORIES,
        INITIAL_RETENTION_POLICIES,
        INITIAL_PRIVACY_REQUESTS,
        INITIAL_GOVERNANCE_EXCEPTIONS
      );

      const metrics = computeGovernanceMetrics(
        INITIAL_DATA_CATEGORIES,
        INITIAL_RETENTION_POLICIES,
        INITIAL_PRIVACY_REQUESTS,
        INITIAL_LIFECYCLE_RULES,
        INITIAL_GOVERNANCE_EXCEPTIONS,
        tenantSummaries
      );

      assert.equal(metrics.totalCategories, 14);
      assert.equal(metrics.classifiedCategories, 14);
      assert.equal(metrics.unclassifiedCategories, 0);
      assert.equal(metrics.totalRetentionPolicies, 8);
      assert.equal(metrics.totalLifecycleRules, 6);
      assert.ok(metrics.classificationDistribution.restricted > 0);
      assert.ok(metrics.classificationDistribution.confidential > 0);
      assert.ok(metrics.classificationDistribution.internal > 0);
      assert.equal(metrics.classificationDistribution.public, 0);
      assert.equal(metrics.uncoveredCategoriesCount >= 0, true);
      assert.equal(metrics.openPrivacyRequestsCount > 0, true);
    });
  });

  // ==========================================
  // 3. INVENTORY & RETENTION POLICY FILTERING
  // ==========================================
  describe('3. Inventory & Policy Filtering', () => {
    test('filters data categories by text search across code and name', () => {
      const results = filterDataCategories(INITIAL_DATA_CATEGORIES, 'safeguard');
      assert.ok(results.length >= 1);
      assert.ok(results.some((c) => c.code === 'DATA-SAFE-01'));
    });

    test('filters data categories by classification level', () => {
      const restricted = filterDataCategories(INITIAL_DATA_CATEGORIES, undefined, 'restricted');
      assert.ok(restricted.length > 0);
      assert.ok(restricted.every((c) => c.classificationLevel === 'restricted'));
    });

    test('filters data categories by subject type and retention coverage', () => {
      const studentCovered = filterDataCategories(
        INITIAL_DATA_CATEGORIES,
        undefined,
        'all',
        'student',
        'all',
        'covered'
      );
      assert.ok(studentCovered.length > 0);
      assert.ok(studentCovered.every((c) => c.dataSubjectType === 'student' && !!c.retentionPolicyId));
    });

    test('filters retention policies by trigger and status', () => {
      const statutory = filterGovernanceRetentionPolicies(
        INITIAL_RETENTION_POLICIES,
        undefined,
        'all',
        'statutory_requirement'
      );
      assert.ok(statutory.length > 0);
      assert.ok(statutory.every((p) => p.retentionTrigger === 'statutory_requirement'));
    });

    test('filters retention policies by reviewDueOnly', () => {
      const dueOnly = filterGovernanceRetentionPolicies(
        INITIAL_RETENTION_POLICIES,
        undefined,
        'all',
        'all',
        true
      );
      assert.ok(Array.isArray(dueOnly));
    });

    test('filters simulated privacy requests by category, status, and search query', () => {
      const accessReqs = filterPrivacyRequests(INITIAL_PRIVACY_REQUESTS, undefined, 'access_request');
      assert.ok(accessReqs.length > 0);
      assert.ok(accessReqs.every((r) => r.category === 'access_request'));

      const searched = filterPrivacyRequests(INITIAL_PRIVACY_REQUESTS, 'evaluation');
      assert.ok(searched.length > 0);
    });

    test('filters lifecycle rules by status and stage', () => {
      const enabled = filterLifecycleRules(INITIAL_LIFECYCLE_RULES, undefined, 'all', 'enabled');
      assert.ok(enabled.length > 0);
      assert.ok(enabled.every((r) => r.status === 'enabled'));
    });

    test('filters governance exceptions by reason category and review status', () => {
      const pending = filterGovernanceExceptions(INITIAL_GOVERNANCE_EXCEPTIONS, undefined, 'pending_review');
      assert.ok(pending.length > 0);
      assert.ok(pending.every((e) => e.reviewStatus === 'pending_review'));
    });
  });

  // ==========================================
  // 4. PRIVACY REQUEST (DSAR) STATE MACHINE
  // ==========================================
  describe('4. Privacy Request Workflow & State Transitions', () => {
    test('permits valid transitions along the DSAR lifecycle', () => {
      // received -> identity_verification_pending
      const step1 = isValidPrivacyTransition('received', 'identity_verification_pending');
      assert.equal(step1.valid, true);

      // identity_verification_pending -> under_review
      const step2 = isValidPrivacyTransition('identity_verification_pending', 'under_review');
      assert.equal(step2.valid, true);

      // under_review -> approved_pending_execution
      const step3 = isValidPrivacyTransition('under_review', 'approved_pending_execution');
      assert.equal(step3.valid, true);

      // approved_pending_execution -> processing_simulated
      const step4 = isValidPrivacyTransition('approved_pending_execution', 'processing_simulated');
      assert.equal(step4.valid, true);

      // processing_simulated -> completed_closed
      const step5 = isValidPrivacyTransition('processing_simulated', 'completed_closed');
      assert.equal(step5.valid, true);
    });

    test('blocks invalid premature transitions with explanatory feedback', () => {
      // cannot jump from received directly to completed_closed without identity verification and review
      const jumpToClose = isValidPrivacyTransition('received', 'completed_closed');
      assert.equal(jumpToClose.valid, false);
      assert.ok(jumpToClose.reason?.includes('Cannot transition'));

      // cannot jump from received directly to processing_simulated
      const jumpToProcess = isValidPrivacyTransition('received', 'processing_simulated');
      assert.equal(jumpToProcess.valid, false);
    });

    test('allows identical status transition as no-op', () => {
      const same = isValidPrivacyTransition('under_review', 'under_review');
      assert.equal(same.valid, true);
    });

    test('allows legitimate rejection with grounds from review stages', () => {
      const rejectFromReview = isValidPrivacyTransition('under_review', 'rejected_with_grounds');
      assert.equal(rejectFromReview.valid, true);

      const rejectFromVerification = isValidPrivacyTransition('identity_verification_pending', 'rejected_with_grounds');
      assert.equal(rejectFromVerification.valid, true);
    });
  });

  // ==========================================
  // 5. SIMULATED PRIVACY EXECUTION & ARTIFACTS
  // ==========================================
  describe('5. Simulated Privacy Execution (Zero PII Guarantee)', () => {
    test('simulates access request export without leaking personal records', () => {
      const sampleRequest = INITIAL_PRIVACY_REQUESTS.find((r) => r.category === 'access_request')!;
      const result = simulatePrivacyRequestExecution(sampleRequest);

      assert.equal(result.updatedRequest.workflowStatus, 'completed_closed');
      assert.equal(result.updatedRequest.resolutionCategory, 'disclosed_synthetic_manifest');
      assert.ok(result.updatedRequest.simulatedArtifactManifest);
      assert.equal(result.updatedRequest.simulatedArtifactManifest?.type, 'json_manifest');
      assert.ok(result.updatedRequest.simulatedArtifactManifest?.summary.includes('Zero actual student PII'));
      assert.ok(result.auditDetails.includes('Simulated privacy request completion'));
    });

    test('simulates deletion request by issuing a tombstone receipt instead of deleting data', () => {
      const deleteRequest = INITIAL_PRIVACY_REQUESTS.find((r) => r.category === 'deletion_erasure')!;
      const result = simulatePrivacyRequestExecution(deleteRequest);

      assert.equal(result.updatedRequest.workflowStatus, 'completed_closed');
      assert.equal(result.updatedRequest.resolutionCategory, 'deletion_simulated_tombstoned');
      assert.ok(result.updatedRequest.simulatedArtifactManifest);
      assert.equal(result.updatedRequest.simulatedArtifactManifest?.type, 'tombstone_receipt');
      assert.ok(result.updatedRequest.simulatedArtifactManifest?.summary.includes('Zero actual database deletions'));
    });
  });

  // ==========================================
  // 6. MULTI-TENANT GOVERNANCE AGGREGATION
  // ==========================================
  describe('6. Multi-Tenant Governance Aggregation', () => {
    test('aggregates tenant indicators for all registered school organizations', () => {
      const orgs = platformStore.getOrganizations();
      const summaries = computeTenantGovernanceSummaries(
        orgs,
        INITIAL_DATA_CATEGORIES,
        INITIAL_RETENTION_POLICIES,
        INITIAL_PRIVACY_REQUESTS,
        INITIAL_GOVERNANCE_EXCEPTIONS
      );

      assert.equal(summaries.length, orgs.length);
      for (const summary of summaries) {
        assert.ok(summary.tenantId);
        assert.ok(summary.tenantName);
        assert.ok(typeof summary.classificationCoveragePercent === 'number');
        assert.ok(typeof summary.openPrivacyRequestsCount === 'number');
        assert.ok(['complete', 'review_required', 'incomplete'].includes(summary.governanceCompleteness));
        assert.equal(summary.isSimulatedAggregate, true);
      }
    });

    test('flags incomplete tenants when essential metadata is missing', () => {
      const mockOrgs: Organization[] = [
        {
          id: 'org_broken',
          name: 'Missing Contact Academy',
          code: 'MCA-01',
          classification: 'k12',
          onboardingStatus: 'completed',
          subdomain: '',
          status: 'active',
          planId: 'plan_starter',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
          contact: {
            email: '',
            phone: '',
            address: '1 School Way',
            city: 'Springfield',
            stateOrProvince: 'IL',
            country: 'US',
          },
          administrator: {
            name: 'Contact Lead',
            email: '',
            phone: '',
            roleTitle: 'School Lead',
          },
          technicalConfig: {
            subdomain: '',
            timezone: 'America/Chicago',
            academicYearStartMonth: 9,
            currency: 'USD',
            locale: 'en-US',
            maxCampuses: 2,
          },
        },
      ];

      const summaries = computeTenantGovernanceSummaries(
        mockOrgs,
        INITIAL_DATA_CATEGORIES,
        INITIAL_RETENTION_POLICIES,
        [],
        []
      );

      assert.equal(summaries[0].governanceCompleteness, 'incomplete');
      assert.ok(summaries[0].missingMetadataFields.length > 0);
    });
  });

  // ==========================================
  // 7. CSV SANITIZATION & FORMULA INJECTION
  // ==========================================
  describe('7. Spreadsheet Formula Injection Defense', () => {
    test('prefixes risky spreadsheet calculation characters with single quote', () => {
      assert.equal(sanitizeCsvCell('=SUM(A1:A10)'), '"\'=SUM(A1:A10)"');
      assert.equal(sanitizeCsvCell('+12345'), '"\'+12345"');
      assert.equal(sanitizeCsvCell('-cmd|/C'), '"\'-cmd|/C"');
      assert.equal(sanitizeCsvCell('@IMPORTXML("url")'), '"\'@IMPORTXML(""url"")"');
      assert.equal(sanitizeCsvCell('\tTabPrefixed'), '"\'\tTabPrefixed"');
    });

    test('preserves benign alphanumeric strings and escapes embedded quotes', () => {
      assert.equal(sanitizeCsvCell('Pupil Record 101'), '"Pupil Record 101"');
      assert.equal(sanitizeCsvCell('Text with "quotes" inside'), '"Text with ""quotes"" inside"');
      assert.equal(sanitizeCsvCell(null), '""');
      assert.equal(sanitizeCsvCell(undefined), '""');
    });

    test('exports CSV generators without errors', () => {
      const catCsv = exportDataCategoriesToCsv(INITIAL_DATA_CATEGORIES);
      assert.ok(catCsv.includes('Category Code'));
      assert.ok(catCsv.includes('DATA-STU-01'));

      const retCsv = exportRetentionPoliciesToCsv(INITIAL_RETENTION_POLICIES);
      assert.ok(retCsv.includes('Policy Code'));
      assert.ok(retCsv.includes('RET-STU-PERMANENT'));

      const dsarCsv = exportPrivacyRequestsToCsv(INITIAL_PRIVACY_REQUESTS);
      assert.ok(dsarCsv.includes('Request Code'));

      const ruleCsv = exportLifecycleRulesToCsv(INITIAL_LIFECYCLE_RULES);
      assert.ok(ruleCsv.includes('Rule Code'));

      const excCsv = exportGovernanceExceptionsToCsv(INITIAL_GOVERNANCE_EXCEPTIONS);
      assert.ok(excCsv.includes('Exception Code'));

      const auditCsv = exportGovernanceAuditToCsv(INITIAL_GOVERNANCE_AUDIT_LOGS);
      assert.ok(auditCsv.includes('Action'));

      const tenantSummaries = computeTenantGovernanceSummaries(
        platformStore.getOrganizations(),
        INITIAL_DATA_CATEGORIES,
        INITIAL_RETENTION_POLICIES,
        [],
        []
      );
      const tenantCsv = exportTenantGovernanceSummariesToCsv(tenantSummaries);
      assert.ok(tenantCsv.includes('Tenant Name'));
    });

    test('generates complete sanitized JSON export package', () => {
      const summaries = computeTenantGovernanceSummaries(
        platformStore.getOrganizations(),
        INITIAL_DATA_CATEGORIES,
        INITIAL_RETENTION_POLICIES,
        INITIAL_PRIVACY_REQUESTS,
        INITIAL_GOVERNANCE_EXCEPTIONS
      );

      const jsonStr = generateGovernancePackageJson({
        categories: INITIAL_DATA_CATEGORIES,
        policies: INITIAL_RETENTION_POLICIES,
        requests: INITIAL_PRIVACY_REQUESTS,
        lifecycleRules: INITIAL_LIFECYCLE_RULES,
        tenants: summaries,
        exceptions: INITIAL_GOVERNANCE_EXCEPTIONS,
        auditLogs: INITIAL_GOVERNANCE_AUDIT_LOGS,
      });

      const parsed = JSON.parse(jsonStr);
      assert.equal(parsed.schemaVersion, '1.0.0');
      assert.equal(parsed.isDemonstrationExport, true);
      assert.equal(parsed.zeroPiiNotice, 'Confirmed - Contains only declarative schemas and synthetic tokens');
      assert.equal(parsed.categories.length, 14);
      assert.equal(parsed.policies.length, 8);
    });
  });

  // ==========================================
  // 8. PLATFORM STORE MUTATIONS & AUDIT TRAIL
  // ==========================================
  describe('8. Platform Store State Management & Audit Logging', () => {
    test('updates data category classification and records audit log', () => {
      const initialLogsCount = platformStore.getGovernanceAuditLogs().length;

      const updateRes = platformStore.updateDataCategory('cat_student_records', {
        classificationLevel: 'restricted',
        reviewStatus: 'current',
        notes: 'Updated to restricted following annual compliance audit.',
      });

      assert.equal(updateRes.success, true);
      assert.equal(updateRes.category?.classificationLevel, 'restricted');
      assert.equal(updateRes.category?.reviewStatus, 'current');

      const logs = platformStore.getGovernanceAuditLogs();
      assert.equal(logs.length, initialLogsCount + 1);
      assert.equal(logs[0].action, 'DATA_CATEGORY_UPDATED');
      assert.equal(logs[0].targetEntity, 'DataCategoryRecord');
    });

    test('creates and reviews a governance retention policy', () => {
      const input: CreateRetentionPolicyInput = {
        name: 'Unit Test Retention Policy',
        description: 'Temporary policy for automated test coverage validation.',
        coveredCategoryIds: ['cat_student_records'],
        durationDays: 730,
        durationDisplay: '2 Years (730 Days)',
        retentionTrigger: 'academic_year_completion',
        triggerDescription: 'Two calendar years following graduation.',
        policyOwner: 'Compliance Team',
        legalSafeguardBasis: 'Institutional Archive Guideline §4',
        status: 'awaiting_review',
        approvalStatus: 'unreviewed',
        nextReviewDueAt: '2027-01-01T00:00:00Z',
        exceptionHandlingNotes: 'None',
      };

      const createRes = platformStore.createGovernanceRetentionPolicy(input);
      assert.equal(createRes.success, true);
      assert.ok(createRes.policy?.id);
      assert.equal(createRes.policy?.status, 'awaiting_review');
      assert.equal(createRes.policy?.approvalStatus, 'unreviewed');

      const reviewRes = platformStore.reviewGovernanceRetentionPolicy(
        createRes.policy!.id,
        'approved_demo',
        '2027-04-01T00:00:00Z'
      );
      assert.equal(reviewRes.success, true);
      assert.equal(reviewRes.policy?.approvalStatus, 'approved_demo');
      assert.equal(reviewRes.policy?.status, 'active_config');
    });

    test('enforces state machine during privacy request status updates', () => {
      const receivedReq = platformStore.getPrivacyRequests().find((r) => r.workflowStatus === 'received')!;
      assert.ok(receivedReq, 'Must have at least one request in received state');

      // Valid step: received -> identity_verification_pending
      const validStep = platformStore.updatePrivacyRequestStatus(
        receivedReq.id,
        'identity_verification_pending',
        'Identity verification request sent to requesting party.'
      );
      assert.equal(validStep.success, true);
      assert.equal(validStep.request?.workflowStatus, 'identity_verification_pending');

      // Invalid step: identity_verification_pending -> processing_simulated
      const invalidStep = platformStore.updatePrivacyRequestStatus(
        receivedReq.id,
        'processing_simulated',
        'Attempting illegal premature execution.'
      );
      assert.equal(invalidStep.success, false);
      assert.ok(invalidStep.error?.includes('Cannot transition'));
    });

    test('simulates privacy request processing with synthetic manifest generation', () => {
      // Find a request in approved state or update one
      const req = INITIAL_PRIVACY_REQUESTS.find((r) => r.workflowStatus === 'approved_pending_execution')!;
      const simRes = platformStore.simulatePrivacyRequestProcessing(req.id);
      assert.equal(simRes.success, true);
      assert.equal(simRes.request?.workflowStatus, 'completed_closed');
      assert.ok(simRes.request?.simulatedArtifactManifest);
      assert.ok((simRes.request?.simulatedArtifactManifest?.fieldsProcessedCount ?? 0) > 0);
    });

    test('toggles and creates data lifecycle rules', () => {
      const rule = INITIAL_LIFECYCLE_RULES[0];
      const initialStatus = rule.status;

      const toggleRes = platformStore.toggleDataLifecycleRule(rule.id);
      assert.equal(toggleRes.success, true);
      assert.notEqual(toggleRes.rule?.status, initialStatus);

      const ruleInput: CreateLifecycleRuleInput = {
        name: 'Unit Test Archive Rule',
        coveredCategoryId: 'cat_attendance_logs',
        triggerEvent: 'inactivity_threshold',
        triggerConditions: 'Records older than 180 days with no active dispute',
        targetLifecycleStage: 'archived',
        requiredApproval: 'platform_super_admin',
        exceptionHandling: 'Exclude if litigation hold active',
        status: 'enabled',
        nextReviewDate: '2027-01-01T00:00:00Z',
      };

      const createRes = platformStore.createDataLifecycleRule(ruleInput);

      assert.equal(createRes.success, true);
      assert.ok(createRes.rule?.id);
      assert.equal(createRes.rule?.status, 'enabled');
    });

    test('creates and reviews a governance policy exception', () => {
      const input: CreateGovernanceExceptionInput = {
        title: 'Pending Civil Dispute Legal Hold',
        justificationText: 'Retention schedule suspended pursuant to subpoena from District Court.',
        reasonCategory: 'ongoing_litigation_hold',
        tenantId: 'org_001',
        tenantName: 'St. Jude International Academy',
        relatedPolicyId: 'ret_pol_permanent_transcript',
        relatedCategoryId: 'cat_student_records',
        approvalRequirement: 'legal_counsel',
        reviewDueAt: '2026-12-01T00:00:00Z',
        expirationAt: '2027-01-01T00:00:00Z',
        responsibleRole: 'General Counsel',
      };

      const createRes = platformStore.createGovernanceException(input);
      assert.equal(createRes.success, true);
      assert.ok(createRes.exception?.id);
      assert.equal(createRes.exception?.reviewStatus, 'pending_review');

      const reviewRes = platformStore.reviewGovernanceException(
        createRes.exception!.id,
        'approved_demo',
        'Hold ratified by Legal Compliance Committee.'
      );
      assert.equal(reviewRes.success, true);
      assert.equal(reviewRes.exception?.reviewStatus, 'approved_demo');
    });

    test('resets data governance fixtures cleanly on resetToDefaults', () => {
      // Mutate something
      platformStore.updateDataCategory('cat_student_records', {
        classificationLevel: 'public',
      });
      assert.equal(
        platformStore.getDataCategories().find((c) => c.id === 'cat_student_records')?.classificationLevel,
        'public'
      );

      // Reset
      platformStore.resetToDefaults();

      assert.equal(
        platformStore.getDataCategories().find((c) => c.id === 'cat_student_records')?.classificationLevel,
        'restricted'
      );
    });
  });
});
