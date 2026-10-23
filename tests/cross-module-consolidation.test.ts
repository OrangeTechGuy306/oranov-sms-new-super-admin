import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_PLANS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_CAMPUSES,
} from '../lib/data/initial-data';
import { MASTER_MODULE_REGISTRY } from '../lib/modules/registry-data';
import { INITIAL_STUDENT_OVERSIGHT_DATA } from '../lib/data/student-oversight-fixtures';
import { INITIAL_ACADEMIC_OVERSIGHT_DATA } from '../lib/data/academic-oversight-fixtures';
import { INITIAL_EXAM_GOVERNANCE_DATA } from '../lib/data/examination-governance-fixtures';
import { sanitizeCsvCell, generateCsvContent } from '../lib/utils/csv-export';
import { getAvailableTransitions } from '../lib/lifecycle/evaluator';

describe('Phase E-09.21: Super-Admin Cross-Module Integration & Consolidation', () => {
  describe('1. Cross-Module Entity Referential Integrity', () => {
    test('all subscriptions reference valid organizations and valid plans', () => {
      const orgIds = new Set(INITIAL_ORGANIZATIONS.map((o) => o.id));
      const planIds = new Set(INITIAL_PLANS.map((p) => p.id));

      for (const sub of INITIAL_SUBSCRIPTIONS) {
        assert.ok(
          orgIds.has(sub.organizationId),
          `Subscription ${sub.id} must reference existing organization ${sub.organizationId}`
        );
        assert.ok(
          planIds.has(sub.planId),
          `Subscription ${sub.id} must reference existing plan ${sub.planId}`
        );
      }
    });

    test('all invoices reference valid organizations and subscriptions', () => {
      const orgIds = new Set(INITIAL_ORGANIZATIONS.map((o) => o.id));
      const subIds = new Set(INITIAL_SUBSCRIPTIONS.map((s) => s.id));

      for (const inv of INITIAL_INVOICES) {
        assert.ok(
          orgIds.has(inv.organizationId),
          `Invoice ${inv.id} must reference existing organization ${inv.organizationId}`
        );
        if (inv.subscriptionId) {
          assert.ok(
            subIds.has(inv.subscriptionId),
            `Invoice ${inv.id} must reference existing subscription ${inv.subscriptionId}`
          );
        }
      }
    });

    test('all payments reference valid invoices and organizations with positive amounts', () => {
      const invIds = new Set(INITIAL_INVOICES.map((i) => i.id));
      const orgIds = new Set(INITIAL_ORGANIZATIONS.map((o) => o.id));

      for (const p of INITIAL_PAYMENTS) {
        assert.ok(invIds.has(p.invoiceId), `Payment ${p.id} must reference valid invoice ${p.invoiceId}`);
        assert.ok(orgIds.has(p.organizationId), `Payment ${p.id} must reference valid organization ${p.organizationId}`);
        assert.ok(p.amount > 0, `Payment ${p.id} must have positive amount`);
      }
    });

    test('all organizations have consistent campus allocation and a designated main campus', () => {
      for (const org of INITIAL_ORGANIZATIONS) {
        const orgCampuses = INITIAL_CAMPUSES.filter((c) => c.organizationId === org.id);
        if (org.status === 'active') {
          assert.ok(
            orgCampuses.length >= 1,
            `Active school ${org.name} (${org.id}) must have at least one campus record`
          );
          const mainCampuses = orgCampuses.filter((c) => c.isMainCampus);
          assert.equal(
            mainCampuses.length,
            1,
            `Active school ${org.name} (${org.id}) must have exactly one main campus`
          );
        }
      }
    });

    test('module registry definitions have unique codes and valid tier inclusions', () => {
      const seenIds = new Set<string>();
      const seenCodes = new Set<string>();

      for (const mod of MASTER_MODULE_REGISTRY) {
        assert.ok(!seenIds.has(mod.id), `Module id ${mod.id} must be unique`);
        assert.ok(!seenCodes.has(mod.code), `Module code ${mod.code} must be unique`);
        seenIds.add(mod.id);
        seenCodes.add(mod.code);

        assert.ok(
          mod.includedInPlans.length > 0,
          `Module ${mod.id} must be included in at least one tier`
        );
        for (const plan of mod.includedInPlans) {
          assert.ok(
            ['starter', 'growth', 'enterprise'].includes(plan),
            `Plan inclusion ${plan} must be valid`
          );
        }
      }
    });
  });

  describe('2. Telemetry and Oversight Data Alignment', () => {
    test('student oversight records reference valid organization IDs and population totals', () => {
      const orgIds = new Set(INITIAL_ORGANIZATIONS.map((o) => o.id));
      for (const record of INITIAL_STUDENT_OVERSIGHT_DATA) {
        assert.ok(
          orgIds.has(record.organizationId),
          `Student oversight record must reference valid organization ${record.organizationId}`
        );
        assert.ok(record.population.enrolledCount >= 0, 'Enrolled count must be non-negative');
        assert.ok(record.population.totalTracked >= 0, 'Total tracked count must be non-negative');
        assert.ok(record.admissions.submittedCount >= 0, 'Admissions submitted count must be non-negative');
      }
    });

    test('academic oversight records align with registered organizations and valid scores', () => {
      const orgIds = new Set(INITIAL_ORGANIZATIONS.map((o) => o.id));
      for (const record of INITIAL_ACADEMIC_OVERSIGHT_DATA) {
        assert.ok(
          orgIds.has(record.organizationId),
          `Academic oversight record must reference valid organization ${record.organizationId}`
        );
        assert.ok(
          record.readiness.score >= 0 && record.readiness.score <= 100,
          `Readiness score must be between 0 and 100 for ${record.organizationName}`
        );
      }
    });

    test('examination governance records align with registered organizations and valid levels', () => {
      const orgIds = new Set(INITIAL_ORGANIZATIONS.map((o) => o.id));
      for (const record of INITIAL_EXAM_GOVERNANCE_DATA) {
        assert.ok(
          orgIds.has(record.organizationId),
          `Exam governance record must reference valid organization ${record.organizationId}`
        );
        assert.ok(
          ['ready', 'partially_ready', 'not_ready', 'not_applicable', 'unknown'].includes(record.readiness.level),
          `Readiness level ${record.readiness.level} must be valid`
        );
      }
    });
  });

  describe('3. CSV Export Security & Formula Injection Immunity', () => {
    test('neutralizes formula injection characters across exported fields', () => {
      assert.equal(sanitizeCsvCell('=1+1'), '"\'=1+1"');
      assert.equal(sanitizeCsvCell('+cmd|/c calc'), '"\'+cmd|/c calc"');
      assert.equal(sanitizeCsvCell('-5+2'), '"\'-5+2"');
      assert.equal(sanitizeCsvCell('@SUM(A1:A10)'), '"\'@SUM(A1:A10)"');
      assert.equal(sanitizeCsvCell('\tTABBED'), '"\'\tTABBED"');
      assert.equal(sanitizeCsvCell('\rRETURN'), '"\'\rRETURN"');
    });

    test('leaves safe alphanumeric strings and numbers properly quoted and escaped', () => {
      assert.equal(sanitizeCsvCell('Springfield Academy'), '"Springfield Academy"');
      assert.equal(sanitizeCsvCell(1250), '"1250"');
      assert.equal(sanitizeCsvCell('org_001'), '"org_001"');
      assert.equal(sanitizeCsvCell('He said "Hello"'), '"He said ""Hello"""');
      assert.equal(sanitizeCsvCell(''), '""');
      assert.equal(sanitizeCsvCell(null), '""');
      assert.equal(sanitizeCsvCell(undefined), '""');
    });

    test('generateCsvContent outputs valid multi-line sanitized CSV content', () => {
      const headers = ['School Name', 'Code', 'Status'];
      const rows = [
        ['Oak Hill', 'OAKHILL', 'active'],
        ['=DANGEROUS()', 'DANG', 'suspended'],
      ];
      const csv = generateCsvContent(headers, rows);
      assert.ok(csv.includes('"Oak Hill","OAKHILL","active"'));
      assert.ok(csv.includes('"\'=DANGEROUS()"'));
    });
  });

  describe('4. Zero-PII Guarantee in Multi-Tenant Telemetry', () => {
    test('student oversight fixtures expose aggregated metrics only without student PII', () => {
      for (const record of INITIAL_STUDENT_OVERSIGHT_DATA) {
        const serialized = JSON.stringify(record);
        assert.ok(!serialized.includes('"firstName"'), 'Must not contain firstName field');
        assert.ok(!serialized.includes('"lastName"'), 'Must not contain lastName field');
        assert.ok(!serialized.includes('"homeAddress"'), 'Must not contain homeAddress field');
        assert.ok(!serialized.includes('"parentEmail"'), 'Must not contain parentEmail field');
        assert.ok(!serialized.includes('"medicalRecord"'), 'Must not contain medicalRecord field');
      }
    });

    test('academic oversight fixtures maintain structural curriculum data only', () => {
      for (const record of INITIAL_ACADEMIC_OVERSIGHT_DATA) {
        const serialized = JSON.stringify(record);
        assert.ok(!serialized.includes('"studentId"'), 'Must not contain studentId');
        assert.ok(!serialized.includes('"studentName"'), 'Must not contain studentName');
      }
    });

    test('examination governance fixtures contain room schedules and macro counts only', () => {
      for (const record of INITIAL_EXAM_GOVERNANCE_DATA) {
        const serialized = JSON.stringify(record);
        assert.ok(!serialized.includes('"candidateName"'), 'Must not contain candidateName');
        assert.ok(!serialized.includes('"studentScore"'), 'Must not contain individual student scores');
      }
    });
  });

  describe('5. Lifecycle State Machine Consistency', () => {
    test('pending organizations allow transition to active', () => {
      const transitions = getAvailableTransitions('pending');
      const targetStatuses = transitions.map((t) => t.to);
      assert.ok(targetStatuses.includes('active'));
    });

    test('active organizations allow suspension with justification', () => {
      const transitions = getAvailableTransitions('active');
      const suspendTransition = transitions.find((t) => t.to === 'suspended');
      assert.ok(suspendTransition, 'Active organizations must have suspend transition');
      assert.equal(suspendTransition?.requiresReason, true, 'Suspension must require justification');
      assert.ok((suspendTransition?.minReasonLength || 0) >= 5, 'Suspension reason must have minimum length');
    });

    test('suspended organizations allow reactivation or archiving', () => {
      const transitions = getAvailableTransitions('suspended');
      const targetStatuses = transitions.map((t) => t.to);
      assert.ok(targetStatuses.includes('active'), 'Suspended can be reactivated to active');
      assert.ok(targetStatuses.includes('archived'), 'Suspended can transition to archived');
    });

    test('archived organizations allow restoration to inactive review only, blocking direct activation', () => {
      const transitions = getAvailableTransitions('archived');
      assert.equal(transitions.length, 1, 'Archived records have exactly one permitted transition');
      assert.equal(transitions[0].to, 'inactive', 'Archived records can only transition to inactive review');
      assert.equal(transitions[0].actionLabel, 'Restore to Inactive Review');
    });
  });
});
