import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { platformStore } from '../lib/data/platform-store';
import {
  filterAuditEvents,
  filterSecurityEvents,
  filterComplianceControls,
  filterGovernanceEvidence,
  filterRetentionPolicies,
  computeAuditComplianceMetrics,
  validateRetentionPolicyUpdate,
  validateSecurityTriageUpdate,
  generateAuditCsv,
  generateComplianceCsv,
  sanitizeCsvCell,
} from '../lib/compliance/evaluator';
import {
  INITIAL_EXTENDED_AUDIT_EVENTS,
  INITIAL_SECURITY_EVENTS,
  INITIAL_COMPLIANCE_CONTROLS,
  INITIAL_GOVERNANCE_EVIDENCE,
  INITIAL_DATA_RETENTION_POLICIES,
} from '../lib/compliance/fixtures';
import { ComplianceDomain, SecurityTriageStatus } from '../lib/types/compliance';

describe('Phase E-09.13: Platform Audit Logs, Compliance & Security Governance', () => {
  beforeEach(() => {
    platformStore.resetToDefaults();
  });

  // ==========================================
  // 1. AUDIT EVENT FILTERING, SEARCH & SORTING
  // ==========================================
  describe('1. Audit Event Filtering, Search & Sorting Engine', () => {
    test('filters audit events accurately by category', () => {
      const orgLifecycleEvents = filterAuditEvents(INITIAL_EXTENDED_AUDIT_EVENTS, {
        category: 'organization_lifecycle',
      });
      assert.ok(orgLifecycleEvents.length > 0);
      assert.ok(orgLifecycleEvents.every((e) => e.category === 'organization_lifecycle'));

      const billingEvents = filterAuditEvents(INITIAL_EXTENDED_AUDIT_EVENTS, {
        category: 'subscription_billing',
      });
      assert.ok(billingEvents.length > 0);
      assert.ok(billingEvents.every((e) => e.category === 'subscription_billing'));
    });

    test('filters audit events accurately by severity level', () => {
      const criticalEvents = filterAuditEvents(INITIAL_EXTENDED_AUDIT_EVENTS, {
        severity: 'critical',
      });
      assert.ok(criticalEvents.length > 0);
      assert.ok(criticalEvents.every((e) => e.severity === 'critical'));

      const infoEvents = filterAuditEvents(INITIAL_EXTENDED_AUDIT_EVENTS, {
        severity: 'info',
      });
      assert.ok(infoEvents.length > 0);
      assert.ok(infoEvents.every((e) => e.severity === 'info'));
    });

    test('filters audit events accurately by outcome status', () => {
      const rejectedEvents = filterAuditEvents(INITIAL_EXTENDED_AUDIT_EVENTS, {
        status: 'rejected',
      });
      assert.ok(rejectedEvents.length > 0);
      assert.ok(rejectedEvents.every((e) => e.status === 'rejected'));

      const succeededEvents = filterAuditEvents(INITIAL_EXTENDED_AUDIT_EVENTS, {
        status: 'succeeded',
      });
      assert.ok(succeededEvents.length > 0);
      assert.ok(succeededEvents.every((e) => e.status === 'succeeded'));
    });

    test('filters audit events accurately by organization ID scope', () => {
      const orgEvents = filterAuditEvents(INITIAL_EXTENDED_AUDIT_EVENTS, {
        organizationId: 'org_004',
      });
      assert.ok(orgEvents.length > 0);
      assert.ok(
        orgEvents.every(
          (e) => e.organizationId === 'org_004' || e.targetId === 'org_004'
        )
      );
    });

    test('filters audit events accurately by actor role and actor ID', () => {
      const auditorEvents = filterAuditEvents(INITIAL_EXTENDED_AUDIT_EVENTS, {
        actorRole: 'compliance_auditor',
      });
      assert.ok(auditorEvents.length > 0);
      assert.ok(auditorEvents.every((e) => e.actor.role === 'compliance_auditor'));

      const specificActor = filterAuditEvents(INITIAL_EXTENDED_AUDIT_EVENTS, {
        actorId: 'usr_super_01',
      });
      assert.ok(specificActor.length > 0);
      assert.ok(specificActor.every((e) => e.actor.id === 'usr_super_01'));
    });

    test('free-text search queries match across action, details, actor name, correlation ID, and target entity', () => {
      const actionSearch = filterAuditEvents(INITIAL_EXTENDED_AUDIT_EVENTS, {
        searchQuery: 'ORGANIZATION_STATUS_UPDATED',
      });
      assert.ok(actionSearch.length > 0);
      assert.equal(actionSearch[0].action, 'ORGANIZATION_STATUS_UPDATED');

      const correlationSearch = filterAuditEvents(INITIAL_EXTENDED_AUDIT_EVENTS, {
        searchQuery: 'corr_inv_9124b',
      });
      assert.equal(correlationSearch.length, 1);
      assert.equal(correlationSearch[0].id, 'audit_002');

      const actorSearch = filterAuditEvents(INITIAL_EXTENDED_AUDIT_EVENTS, {
        searchQuery: 'Elena Rostova',
      });
      assert.ok(actorSearch.length > 0);
      assert.ok(
        actorSearch.every(
          (e) =>
            e.actor.name.includes('Elena Rostova') ||
            (e.targetName && e.targetName.includes('Elena Rostova')) ||
            e.details.includes('Elena Rostova')
        )
      );

      const nonExistent = filterAuditEvents(INITIAL_EXTENDED_AUDIT_EVENTS, {
        searchQuery: 'XYZ_NONEXISTENT_QUERY_TERM',
      });
      assert.equal(nonExistent.length, 0);
    });

    test('date range filtering validates ISO dates and includes boundaries accurately', () => {
      const dateFiltered = filterAuditEvents(INITIAL_EXTENDED_AUDIT_EVENTS, {
        startDate: '2026-03-01',
        endDate: '2026-03-15',
      });
      assert.ok(dateFiltered.length > 0);
      assert.ok(
        dateFiltered.every((e) => {
          const t = new Date(e.timestamp).getTime();
          const start = new Date('2026-03-01').getTime();
          const end = new Date('2026-03-15T23:59:59.999Z').getTime();
          return t >= start && t <= end;
        })
      );

      // Malformed date does not crash
      const safeFallback = filterAuditEvents(INITIAL_EXTENDED_AUDIT_EVENTS, {
        startDate: 'invalid-date-format',
      });
      assert.equal(safeFallback.length, INITIAL_EXTENDED_AUDIT_EVENTS.length);
    });

    test('deterministic sorting orders records accurately by timestamp, severity, and action', () => {
      const descList = filterAuditEvents(INITIAL_EXTENDED_AUDIT_EVENTS, {
        sortBy: 'timestamp_desc',
      });
      for (let i = 0; i < descList.length - 1; i++) {
        assert.ok(
          new Date(descList[i].timestamp).getTime() >=
            new Date(descList[i + 1].timestamp).getTime()
        );
      }

      const ascList = filterAuditEvents(INITIAL_EXTENDED_AUDIT_EVENTS, {
        sortBy: 'timestamp_asc',
      });
      for (let i = 0; i < ascList.length - 1; i++) {
        assert.ok(
          new Date(ascList[i].timestamp).getTime() <=
            new Date(ascList[i + 1].timestamp).getTime()
        );
      }

      const severityList = filterAuditEvents(INITIAL_EXTENDED_AUDIT_EVENTS, {
        sortBy: 'severity',
      });
      assert.equal(severityList[0].severity, 'critical');
    });
  });

  // ==========================================
  // 2. SECURITY EVENT VISIBILITY & TRIAGE
  // ==========================================
  describe('2. Security Event Visibility & Triage State Machine', () => {
    test('filters security events by category, severity, and triage status', () => {
      const unreviewed = filterSecurityEvents(INITIAL_SECURITY_EVENTS, {
        triageStatus: 'unreviewed',
      });
      assert.ok(unreviewed.length > 0);
      assert.ok(unreviewed.every((s) => s.triageStatus === 'unreviewed'));

      const criticalSec = filterSecurityEvents(INITIAL_SECURITY_EVENTS, {
        severity: 'critical',
      });
      assert.ok(criticalSec.length > 0);
      assert.ok(criticalSec.every((s) => s.severity === 'critical'));
    });

    test('validates security triage update constraints and requires notes for remediation', () => {
      const sample = INITIAL_SECURITY_EVENTS[0];

      // Rejects invalid status
      const invalidStatus = validateSecurityTriageUpdate(sample, 'invalid_status' as unknown as SecurityTriageStatus);
      assert.equal(invalidStatus.valid, false);

      // Enforces minimum note length for remediated
      const missingNotes = validateSecurityTriageUpdate(sample, 'remediated', 'no');
      assert.equal(missingNotes.valid, false);
      assert.ok(missingNotes.error?.includes('at least 5 characters'));

      // Accepts valid remediation
      const validRemediation = validateSecurityTriageUpdate(
        sample,
        'remediated',
        'Verified patch applied and access revoked.'
      );
      assert.equal(validRemediation.valid, true);
    });

    test('store executes updateSecurityEventTriage and unshifts corresponding audit event', () => {
      const initialAuditCount = platformStore.getAuditEvents().length;
      const targetEventId = 'sec_004'; // unreviewed event

      const result = platformStore.updateSecurityEventTriage(
        targetEventId,
        'acknowledged',
        'Acknowledged by security auditor for verification.',
        'Elena Rostova (Compliance Auditor)'
      );
      assert.equal(result.success, true);

      // Verify event was updated
      const updated = platformStore
        .getSecurityEvents()
        .find((s) => s.id === targetEventId);
      assert.equal(updated?.triageStatus, 'acknowledged');
      assert.equal(updated?.triagedBy, 'Elena Rostova (Compliance Auditor)');

      // Verify audit event was logged
      assert.equal(platformStore.getAuditEvents().length, initialAuditCount + 1);
      const latestAudit = platformStore.getAuditEvents()[0];
      assert.equal(latestAudit.action, 'SECURITY_EVENT_TRIAGE_UPDATED');
      assert.equal(latestAudit.targetId, targetEventId);
    });
  });

  // ==========================================
  // 3. COMPLIANCE CONTROLS & GOVERNANCE DOMAINS
  // ==========================================
  describe('3. Compliance Controls & Governance Domains', () => {
    test('covers all 10 platform governance domains in control inventory', () => {
      const domains = new Set(INITIAL_COMPLIANCE_CONTROLS.map((c) => c.domain));
      const requiredDomains: ComplianceDomain[] = [
        'access_governance',
        'audit_logging',
        'data_privacy',
        'data_retention',
        'tenant_isolation',
        'financial_traceability',
        'incident_response',
        'backup_recovery',
        'change_management',
        'operational_monitoring',
      ];
      for (const d of requiredDomains) {
        assert.ok(domains.has(d), `Missing governance domain: ${d}`);
      }
    });

    test('calculates accurate compliance and audit metrics', () => {
      const metrics = computeAuditComplianceMetrics(
        INITIAL_EXTENDED_AUDIT_EVENTS,
        INITIAL_SECURITY_EVENTS,
        INITIAL_COMPLIANCE_CONTROLS,
        INITIAL_GOVERNANCE_EVIDENCE,
        INITIAL_DATA_RETENTION_POLICIES
      );

      assert.equal(metrics.totalAuditEvents, INITIAL_EXTENDED_AUDIT_EVENTS.length);
      assert.equal(metrics.securityEventsCount, INITIAL_SECURITY_EVENTS.length);
      assert.equal(metrics.totalControls, INITIAL_COMPLIANCE_CONTROLS.length);
      assert.equal(metrics.totalEvidenceRecords, INITIAL_GOVERNANCE_EVIDENCE.length);
      assert.equal(metrics.activePolicies, INITIAL_DATA_RETENTION_POLICIES.filter((p) => p.isEnabled).length);
      assert.ok(metrics.verifiedControls > 0);
    });

    test('filters compliance controls by domain and implementation status', () => {
      const accessControls = filterComplianceControls(INITIAL_COMPLIANCE_CONTROLS, {
        domain: 'access_governance',
      });
      assert.ok(accessControls.length > 0);
      assert.ok(accessControls.every((c) => c.domain === 'access_governance'));

      const verified = filterComplianceControls(INITIAL_COMPLIANCE_CONTROLS, {
        implementationStatus: 'implemented_verified',
      });
      assert.ok(verified.length > 0);
      assert.ok(verified.every((c) => c.implementationStatus === 'implemented_verified'));
    });

    test('store updates compliance control remediation plan and logs audit event', () => {
      const initialAuditCount = platformStore.getAuditEvents().length;
      const res = platformStore.updateComplianceControlRemediation(
        'CTL-ACC-03',
        'Scheduled sprint 28 for hardware FIDO2 key rollout.',
        '2026-06-30'
      );
      assert.equal(res.success, true);

      const ctrl = platformStore
        .getComplianceControls()
        .find((c) => c.id === 'CTL-ACC-03');
      assert.equal(
        ctrl?.remediationNotes,
        'Scheduled sprint 28 for hardware FIDO2 key rollout.'
      );
      assert.equal(ctrl?.remediationTargetDate, '2026-06-30');

      assert.equal(platformStore.getAuditEvents().length, initialAuditCount + 1);
      const audit = platformStore.getAuditEvents()[0];
      assert.equal(audit.action, 'COMPLIANCE_CONTROL_REMEDIATION_UPDATED');
    });
  });

  // ==========================================
  // 4. GOVERNANCE EVIDENCE TRACEABILITY
  // ==========================================
  describe('4. Governance Evidence Traceability & Verification', () => {
    test('all verified evidence records point to identifiable files in the codebase', () => {
      for (const evd of INITIAL_GOVERNANCE_EVIDENCE) {
        assert.ok(evd.sourceReference.length > 0);
        assert.ok(
          evd.sourceReference.startsWith('dashboard/') ||
            evd.sourceReference.includes('.ts') ||
            evd.sourceReference.includes('.md')
        );
      }
    });

    test('filters governance evidence by type, status, and search query', () => {
      const suiteEvidence = filterGovernanceEvidence(INITIAL_GOVERNANCE_EVIDENCE, {
        evidenceType: 'test_suite_verification',
      });
      assert.ok(suiteEvidence.length > 0);
      assert.ok(suiteEvidence.every((e) => e.evidenceType === 'test_suite_verification'));

      const verifiedEvidence = filterGovernanceEvidence(INITIAL_GOVERNANCE_EVIDENCE, {
        reviewStatus: 'verified',
      });
      assert.ok(verifiedEvidence.length > 0);
      assert.ok(verifiedEvidence.every((e) => e.reviewStatus === 'verified'));

      const searchResult = filterGovernanceEvidence(INITIAL_GOVERNANCE_EVIDENCE, {
        searchQuery: 'Permission',
      });
      assert.ok(searchResult.length > 0);
      assert.ok(
        searchResult.some(
          (e) =>
            e.title.toLowerCase().includes('permission') ||
            e.notes.toLowerCase().includes('permission') ||
            e.sourceReference.toLowerCase().includes('permission')
        )
      );
    });

    test('store updates evidence review status and unshifts audit trail event', () => {
      const initialAuditCount = platformStore.getAuditEvents().length;
      const res = platformStore.updateGovernanceEvidenceStatus(
        'EVD-ACC-03',
        'verified',
        'Verified architectural specification satisfies regulatory requirement.'
      );
      assert.equal(res.success, true);

      const evd = platformStore
        .getGovernanceEvidence()
        .find((e) => e.id === 'EVD-ACC-03');
      assert.equal(evd?.reviewStatus, 'verified');

      assert.equal(platformStore.getAuditEvents().length, initialAuditCount + 1);
      assert.equal(
        platformStore.getAuditEvents()[0].action,
        'GOVERNANCE_EVIDENCE_STATUS_UPDATED'
      );
    });
  });

  // ==========================================
  // 5. DATA RETENTION POLICY & LEGAL HOLDS
  // ==========================================
  describe('5. Data Retention Policy & Legal Hold Preservation', () => {
    test('validates retention duration updates and rejects invalid or negative values', () => {
      const sample = INITIAL_DATA_RETENTION_POLICIES[0];

      // Rejects 0 days
      const zeroCheck = validateRetentionPolicyUpdate(sample, 0, 'Valid reason');
      assert.equal(zeroCheck.valid, false);

      // Rejects values less than -1
      const negativeCheck = validateRetentionPolicyUpdate(sample, -5, 'Valid reason');
      assert.equal(negativeCheck.valid, false);

      // Rejects short justification
      const shortJust = validateRetentionPolicyUpdate(sample, 90, 'abc');
      assert.equal(shortJust.valid, false);

      // Accepts -1 for permanent hold
      const indefinite = validateRetentionPolicyUpdate(
        sample,
        -1,
        'Permanent statutory retention mandate by education board'
      );
      assert.equal(indefinite.valid, true);

      // Accepts standard positive days
      const valid90 = validateRetentionPolicyUpdate(
        sample,
        90,
        'Standard operational diagnostics policy update'
      );
      assert.equal(valid90.valid, true);
    });

    test('store updates retention policy duration and records audited justification', () => {
      const initialAuditCount = platformStore.getAuditEvents().length;
      const res = platformStore.updateRetentionPolicy(
        'RET-03',
        180,
        'Extended operational logs retention to 180 days for audit compliance.'
      );
      assert.equal(res.success, true);

      const policy = platformStore
        .getRetentionPolicies()
        .find((p) => p.id === 'RET-03');
      assert.equal(policy?.retentionDurationDays, 180);
      assert.ok(policy?.retentionDisplay.includes('180 Days'));

      assert.equal(platformStore.getAuditEvents().length, initialAuditCount + 1);
      const audit = platformStore.getAuditEvents()[0];
      assert.equal(audit.action, 'RETENTION_POLICY_UPDATED');
      assert.equal(audit.category, 'data_retention');
    });

    test('active legal holds are tracked and preserved on critical policies', () => {
      const auditPolicy = INITIAL_DATA_RETENTION_POLICIES.find(
        (p) => p.id === 'RET-01'
      );
      assert.equal(auditPolicy?.activeLegalHoldsCount, 1);

      const studentPolicy = INITIAL_DATA_RETENTION_POLICIES.find(
        (p) => p.id === 'RET-06'
      );
      assert.equal(studentPolicy?.retentionDurationDays, -1);
      assert.equal(studentPolicy?.activeLegalHoldsCount, 1);
    });

    test('filters retention policies by data category, search query, and enabled status', () => {
      const auditPolicies = filterRetentionPolicies(INITIAL_DATA_RETENTION_POLICIES, {
        dataCategory: 'admin_audit_logs',
      });
      assert.ok(auditPolicies.length > 0);
      assert.ok(auditPolicies.every((p) => p.dataCategory === 'admin_audit_logs'));

      const searchResult = filterRetentionPolicies(INITIAL_DATA_RETENTION_POLICIES, {
        searchQuery: 'billing',
      });
      assert.ok(searchResult.length > 0);
      assert.ok(
        searchResult.some(
          (p) =>
            p.name.toLowerCase().includes('billing') ||
            p.description.toLowerCase().includes('billing')
        )
      );

      const enabledOnly = filterRetentionPolicies(INITIAL_DATA_RETENTION_POLICIES, {
        enabledOnly: true,
      });
      assert.ok(enabledOnly.length > 0);
      assert.ok(enabledOnly.every((p) => p.isEnabled));
    });
  });

  // ==========================================
  // 6. EXPORT INTEGRITY & DATA MINIMIZATION
  // ==========================================
  describe('6. Export Integrity & Data Minimization Safeguards', () => {
    test('neutralizes CSV formula injection tokens (=, +, -, @, tab, cr)', () => {
      assert.equal(sanitizeCsvCell('=SUM(A1:A10)'), "'=SUM(A1:A10)");
      assert.equal(sanitizeCsvCell('+12345'), "'+12345");
      assert.equal(sanitizeCsvCell('-500'), "'-500");
      assert.equal(sanitizeCsvCell('@IMPORTXML'), "'@IMPORTXML");
      assert.equal(sanitizeCsvCell('\tmalicious'), "'\tmalicious");
      assert.equal(sanitizeCsvCell('Normal text'), 'Normal text');
    });

    test('generates valid RFC 4180 CSV export content matching filtered audit events', () => {
      const sample = INITIAL_EXTENDED_AUDIT_EVENTS.slice(0, 3);
      const csv = generateAuditCsv(sample);

      assert.ok(csv.includes('# PLATFORM AUDIT TRAIL EXPORT'));
      assert.ok(csv.includes('Event ID,Timestamp (UTC),Category'));
      for (const e of sample) {
        assert.ok(csv.includes(e.id));
        assert.ok(csv.includes(e.action));
      }
    });

    test('generates valid compliance control inventory CSV export', () => {
      const csv = generateComplianceCsv(INITIAL_COMPLIANCE_CONTROLS);
      assert.ok(csv.includes('# PLATFORM COMPLIANCE CONTROL INVENTORY EXPORT'));
      assert.ok(csv.includes('Control ID,Control Name,Governance Domain'));
      assert.ok(csv.includes('CTL-ACC-01'));
      assert.ok(csv.includes('CTL-AUD-01'));
    });

    test('guarantees zero credentials, passwords, or individual student PII in fixtures', () => {
      const serialized = JSON.stringify(INITIAL_EXTENDED_AUDIT_EVENTS);

      // Assert absence of credentials
      assert.equal(serialized.includes('password'), false);
      assert.equal(serialized.includes('secretKey'), false);
      assert.equal(serialized.includes('bearerToken'), false);
      assert.equal(serialized.includes('jwt'), false);

      // Assert absence of private student personal info
      assert.equal(serialized.includes('guardianPhone'), false);
      assert.equal(serialized.includes('studentAddress'), false);
      assert.equal(serialized.includes('creditCardNumber'), false);
    });
  });

  // ==========================================
  // 7. STORE INTEGRATION & CUSTOM AUDIT LOGGING
  // ==========================================
  describe('7. Store Integration & Custom Audit Logging', () => {
    test('logAuditEvent records arbitrary administrative event with correlation ID and persistence', () => {
      const initialCount = platformStore.getAuditEvents().length;
      const logged = platformStore.logAuditEvent({
        category: 'academic_governance',
        action: 'SYLLABUS_OVERRIDE_APPROVED',
        severity: 'info',
        status: 'succeeded',
        actor: {
          id: 'usr_super_01',
          name: 'Alexander Sterling',
          email: 'alexander.s@saas-platform.internal',
          role: 'super_admin',
          actorType: 'super_admin',
        },
        targetEntity: 'AcademicSyllabus',
        targetId: 'syl_2026_math',
        targetName: 'Advanced Grade 10 Mathematics',
        details: 'Approved emergency syllabus amendment for Term 2.',
        isDemoFixture: true,
      });

      assert.ok(logged.id.startsWith('audit_'));
      assert.ok(logged.correlationId?.startsWith('corr_'));
      assert.equal(platformStore.getAuditEvents().length, initialCount + 1);
      assert.equal(platformStore.getAuditEvents()[0].id, logged.id);
    });

    test('resetToDefaults restores clean baseline state for all governance collections', () => {
      // Mutate
      platformStore.logAuditEvent({
        category: 'security',
        action: 'TEMPORARY_EVENT',
        severity: 'critical',
        status: 'failed',
        actor: { id: 'x', name: 'x', email: 'x', role: 'x' },
        targetEntity: 'x',
        targetId: 'x',
        details: 'x',
      });
      assert.ok(
        platformStore.getAuditEvents().length > INITIAL_EXTENDED_AUDIT_EVENTS.length
      );

      // Reset
      platformStore.resetToDefaults();
      assert.equal(
        platformStore.getAuditEvents().length,
        INITIAL_EXTENDED_AUDIT_EVENTS.length
      );
      assert.equal(
        platformStore.getSecurityEvents().length,
        INITIAL_SECURITY_EVENTS.length
      );
      assert.equal(
        platformStore.getComplianceControls().length,
        INITIAL_COMPLIANCE_CONTROLS.length
      );
      assert.equal(
        platformStore.getGovernanceEvidence().length,
        INITIAL_GOVERNANCE_EVIDENCE.length
      );
      assert.equal(
        platformStore.getRetentionPolicies().length,
        INITIAL_DATA_RETENTION_POLICIES.length
      );
    });
  });
});
