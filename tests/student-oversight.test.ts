import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_STUDENT_OVERSIGHT_DATA, HISTORICAL_SESSION_SUMMARIES } from '../lib/data/student-oversight-fixtures';
import { INITIAL_ORGANIZATIONS, INITIAL_CAMPUSES } from '../lib/data/initial-data';
import {
  filterStudentOversightData,
  computeAggregatedStudentMetrics,
  aggregateAdmissionsFunnel,
  aggregatePopulationLifecycle,
  aggregateClearanceBottlenecks,
  getSelectableCampuses,
  validateStudentOversightIntegrity,
} from '../lib/student-oversight/evaluator';
import { buildStudentOversightCsv } from '../lib/utils/student-oversight-export';
import { StudentOversightFilterState } from '../lib/types/student-oversight';

describe('Phase E-09.8: Student Information & Admissions Oversight Engine', () => {
  // --------------------------------------------------------------------------
  // 1. Referential Integrity & Data Model Validation
  // --------------------------------------------------------------------------
  describe('1. Referential Integrity & Domain Constraints', () => {
    test('all student oversight records map strictly to valid INITIAL_ORGANIZATIONS', () => {
      const canonicalOrgIds = INITIAL_ORGANIZATIONS.map((o) => o.id);
      const canonicalCampusIds = INITIAL_CAMPUSES.map((c) => c.id);

      const report = validateStudentOversightIntegrity(
        INITIAL_STUDENT_OVERSIGHT_DATA,
        canonicalOrgIds,
        canonicalCampusIds
      );

      assert.equal(report.valid, true, `Referential integrity failed: ${report.errors.join('; ')}`);
      assert.equal(report.errors.length, 0);
    });

    test('all campus records within student oversight belong to their owning organization', () => {
      const campusToOrgMap = new Map<string, string>();
      for (const campus of INITIAL_CAMPUSES) {
        campusToOrgMap.set(campus.id, campus.organizationId);
      }

      for (const org of INITIAL_STUDENT_OVERSIGHT_DATA) {
        for (const campus of org.campuses) {
          const owningOrgId = campusToOrgMap.get(campus.campusId);
          assert.equal(
            owningOrgId,
            org.organizationId,
            `Campus "${campus.campusId}" on org "${org.organizationId}" must belong to "${org.organizationId}" in master campuses.`
          );
        }
      }
    });

    test('reconciles campus enrolled students sum with organization total enrolled count', () => {
      for (const org of INITIAL_STUDENT_OVERSIGHT_DATA) {
        if (org.isReporting) {
          const sumCampusEnrolled = org.campuses.reduce((acc, c) => acc + c.enrolledStudents, 0);
          assert.equal(
            sumCampusEnrolled,
            org.population.enrolledCount,
            `Organization "${org.organizationCode}" campus enrolled sum (${sumCampusEnrolled}) must reconcile with population.enrolledCount (${org.population.enrolledCount}).`
          );
        }
      }
    });

    test('flags orphaned entities if an unknown organization is supplied', () => {
      const badData = [
        ...INITIAL_STUDENT_OVERSIGHT_DATA,
        {
          ...INITIAL_STUDENT_OVERSIGHT_DATA[0],
          organizationId: 'org_ghost_999',
        },
      ];
      const canonicalOrgIds = INITIAL_ORGANIZATIONS.map((o) => o.id);
      const canonicalCampusIds = INITIAL_CAMPUSES.map((c) => c.id);

      const report = validateStudentOversightIntegrity(badData, canonicalOrgIds, canonicalCampusIds);
      assert.equal(report.valid, false);
      assert.ok(report.errors.some((e) => e.includes('org_ghost_999')));
    });

    test('flags invalid campus reference if an unmapped campusId is present', () => {
      const badData = [
        {
          ...INITIAL_STUDENT_OVERSIGHT_DATA[0],
          campuses: [
            ...INITIAL_STUDENT_OVERSIGHT_DATA[0].campuses,
            {
              campusId: 'camp_invalid_xyz',
              campusName: 'Phantom Branch',
              campusCode: 'PHANTOM',
              isMainCampus: false,
              studentCapacity: 500,
              enrolledStudents: 100,
              capacityUtilizationPercentage: 20,
              admissionsCount: 10,
            },
          ],
        },
      ];
      const canonicalOrgIds = INITIAL_ORGANIZATIONS.map((o) => o.id);
      const canonicalCampusIds = INITIAL_CAMPUSES.map((c) => c.id);

      const report = validateStudentOversightIntegrity(badData, canonicalOrgIds, canonicalCampusIds);
      assert.equal(report.valid, false);
      assert.ok(report.errors.some((e) => e.includes('camp_invalid_xyz')));
    });
  });

  // --------------------------------------------------------------------------
  // 2. Aggregation & Mathematical Calculation Tests
  // --------------------------------------------------------------------------
  describe('2. Aggregation Logic & Metrics Computation', () => {
    test('correctly calculates top-level global student enrollment and admissions totals', () => {
      const metrics = computeAggregatedStudentMetrics(INITIAL_STUDENT_OVERSIGHT_DATA);

      // Expected reporting enrolled total:
      // org_001 (1850) + org_002 (780) + org_003 (245) + org_004 (875) + org_005 (1320) + org_006 (520) = 5590
      assert.equal(metrics.totalEnrolledStudents, 5590);

      // Total admissions submitted across reporting orgs:
      // 310 + 185 + 85 + 260 + 410 + 140 = 1390
      assert.equal(metrics.totalAdmissionsReceived, 1390);

      // Total converted enrollments across reporting tenants:
      // 198 + 118 + 58 + 165 + 265 + 68 = 872
      assert.equal(metrics.totalConverted, 872);

      // Overall conversion rate: (872 / 1390) * 100 = 62.73% -> 63%
      assert.equal(metrics.overallConversionRatePercentage, 63);

      // 6 active reporting schools out of 10 in scope
      assert.equal(metrics.totalReportingOrganizations, 6);
      assert.equal(metrics.totalOrganizationsInScope, 10);
    });

    test('admissions funnel disaggregates inquiries, submissions, acceptances, and conversions cleanly', () => {
      const funnel = aggregateAdmissionsFunnel(INITIAL_STUDENT_OVERSIGHT_DATA);

      // Inquiries >= Submitted >= Converted
      assert.ok(funnel.inquiryCount >= funnel.submittedCount, 'Inquiries must be >= submitted applications');
      assert.ok(funnel.submittedCount >= funnel.acceptedCount, 'Submissions must be >= accepted offers');
      assert.ok(funnel.acceptedCount >= funnel.convertedCount, 'Accepted offers must be >= completed conversions');

      // Zero conflation: Inquiries !== Submitted !== Converted
      assert.notEqual(funnel.inquiryCount, funnel.submittedCount);
      assert.notEqual(funnel.submittedCount, funnel.convertedCount);

      // Terminal counts: deferred and rejected are non-negative
      assert.ok(funnel.deferredCount >= 0);
      assert.ok(funnel.rejectedCount >= 0);
    });

    test('population lifecycle strictly isolates current enrolled learners from graduated alumni and departed students', () => {
      const pop = aggregatePopulationLifecycle(INITIAL_STUDENT_OVERSIGHT_DATA);

      // Verify that graduated students are NOT added into current enrolled students
      assert.equal(pop.enrolledCount, 5590);
      assert.equal(pop.graduatedCount, 764); // 180 + 95 + 38 + 110 + 210 + 65 + 42 + 24 = 764
      assert.ok(pop.transferredCount > 0);
      assert.ok(pop.withdrawnCount > 0);

      // Total tracked is the distinct sum of all lifecycle stages
      const expectedTotal = pop.enrolledCount + pop.admittedCount + pop.suspendedCount +
        pop.transferredCount + pop.withdrawnCount + pop.graduatedCount + pop.expelledCount + pop.archivedCount;
      assert.equal(pop.totalTracked, expectedTotal);
    });

    test('distinguishes zero reporting from unprovisioned/dormant states without fabrication', () => {
      const cedar = INITIAL_STUDENT_OVERSIGHT_DATA.find((o) => o.organizationCode === 'CEDAR');
      assert.ok(cedar);
      assert.equal(cedar.isReporting, false);
      assert.equal(cedar.reportingStatus, 'not_provisioned');
      assert.ok(cedar.statusExplanation?.includes('draft'));

      const royal = INITIAL_STUDENT_OVERSIGHT_DATA.find((o) => o.organizationCode === 'ROYAL');
      assert.ok(royal);
      assert.equal(royal.isReporting, false);
      assert.equal(royal.reportingStatus, 'unverified');

      const summit = INITIAL_STUDENT_OVERSIGHT_DATA.find((o) => o.organizationCode === 'SUMMIT');
      assert.ok(summit);
      assert.equal(summit.reportingStatus, 'dormant');
      assert.ok(summit.statusExplanation?.includes('suspended'));
    });

    test('historical session progression records valid trend indicators', () => {
      assert.ok(HISTORICAL_SESSION_SUMMARIES['2025/2026']);
      assert.ok(HISTORICAL_SESSION_SUMMARIES['2024/2025']);
      assert.ok(HISTORICAL_SESSION_SUMMARIES['2023/2024']);
      assert.equal(HISTORICAL_SESSION_SUMMARIES['2025/2026'].totalEnrolled, 5590);
      assert.equal(HISTORICAL_SESSION_SUMMARIES['2025/2026'].totalConverted, 872);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Filtering & Scope Tests
  // --------------------------------------------------------------------------
  describe('3. Dynamic Filtering & Query Evaluation', () => {
    test('filters accurately by organization ID', () => {
      const filter: StudentOversightFilterState = {
        organizationId: 'org_001',
        campusId: 'ALL',
        academicSession: 'ALL',
        searchQuery: '',
        reportingStatus: 'ALL',
      };

      const result = filterStudentOversightData(INITIAL_STUDENT_OVERSIGHT_DATA, filter);
      assert.equal(result.length, 1);
      assert.equal(result[0].organizationId, 'org_001');
      assert.equal(result[0].organizationCode, 'OAKHILL');

      const metrics = computeAggregatedStudentMetrics(result);
      assert.equal(metrics.totalEnrolledStudents, 1850);
      assert.equal(metrics.totalAdmissionsReceived, 310);
    });

    test('filters accurately by campus ID', () => {
      // camp_001_1 belongs to Oak Hill
      const filter: StudentOversightFilterState = {
        organizationId: 'ALL',
        campusId: 'camp_001_1',
        academicSession: 'ALL',
        searchQuery: '',
        reportingStatus: 'ALL',
      };

      const result = filterStudentOversightData(INITIAL_STUDENT_OVERSIGHT_DATA, filter);
      assert.equal(result.length, 1);
      assert.equal(result[0].organizationId, 'org_001');
      assert.equal(result[0].campuses.length, 1);
      assert.equal(result[0].campuses[0].campusId, 'camp_001_1');
      assert.equal(result[0].campuses[0].enrolledStudents, 1050);
    });

    test('filters accurately by search query across name and code', () => {
      const filterByName: StudentOversightFilterState = {
        organizationId: 'ALL',
        campusId: 'ALL',
        academicSession: 'ALL',
        searchQuery: 'Catholic Grammar',
        reportingStatus: 'ALL',
      };
      const resultName = filterStudentOversightData(INITIAL_STUDENT_OVERSIGHT_DATA, filterByName);
      assert.equal(resultName.length, 1);
      assert.equal(resultName[0].organizationCode, 'STJUDE');

      const filterByCode: StudentOversightFilterState = {
        organizationId: 'ALL',
        campusId: 'ALL',
        academicSession: 'ALL',
        searchQuery: 'beacon',
        reportingStatus: 'ALL',
      };
      const resultCode = filterStudentOversightData(INITIAL_STUDENT_OVERSIGHT_DATA, filterByCode);
      assert.equal(resultCode.length, 1);
      assert.equal(resultCode[0].organizationCode, 'BEACON');
    });

    test('filters accurately by reporting status scope', () => {
      // ACTIVE_ONLY
      const activeFilter: StudentOversightFilterState = {
        organizationId: 'ALL',
        campusId: 'ALL',
        academicSession: 'ALL',
        searchQuery: '',
        reportingStatus: 'ACTIVE_ONLY',
      };
      const activeResults = filterStudentOversightData(INITIAL_STUDENT_OVERSIGHT_DATA, activeFilter);
      assert.equal(activeResults.length, 6);
      assert.ok(activeResults.every((r) => r.isReporting === true));

      // WITH_ISSUES
      const issuesFilter: StudentOversightFilterState = {
        organizationId: 'ALL',
        campusId: 'ALL',
        academicSession: 'ALL',
        searchQuery: '',
        reportingStatus: 'WITH_ISSUES',
      };
      const issueResults = filterStudentOversightData(INITIAL_STUDENT_OVERSIGHT_DATA, issuesFilter);
      assert.ok(issueResults.length > 0);
      assert.ok(issueResults.every((r) => r.dataQualityIssues.length > 0));
    });

    test('resolves selectable campuses dynamically constrained by organization selection', () => {
      // All campuses
      const allCampuses = getSelectableCampuses(INITIAL_STUDENT_OVERSIGHT_DATA, 'ALL');
      assert.equal(allCampuses.length, INITIAL_CAMPUSES.length);

      // Oak Hill specific (org_001 has 3 campuses)
      const oakHillCampuses = getSelectableCampuses(INITIAL_STUDENT_OVERSIGHT_DATA, 'org_001');
      assert.equal(oakHillCampuses.length, 3);
      assert.ok(oakHillCampuses.every((c) => c.orgId === 'org_001'));
    });
  });

  // --------------------------------------------------------------------------
  // 4. Transfers & Clearance Bottlenecks Tests
  // --------------------------------------------------------------------------
  describe('4. Mobility Transfers & Clearance Bottlenecks', () => {
    test('aggregates clearance bottlenecks across departments correctly', () => {
      const bottlenecks = aggregateClearanceBottlenecks(INITIAL_STUDENT_OVERSIGHT_DATA);

      assert.ok(bottlenecks.LIBRARY.pending >= 0);
      assert.ok(bottlenecks.HOSTEL.pending >= 0);
      assert.ok(bottlenecks.ASSETS.pending >= 0);
      assert.ok(bottlenecks.FINANCE.pending >= 0);

      assert.ok(bottlenecks.FINANCE.cleared > 0);
      assert.ok(bottlenecks.LIBRARY.cleared > 0);
    });

    test('reconciles outgoing and incoming transfer counts', () => {
      let totalOut = 0;
      let totalIn = 0;

      for (const org of INITIAL_STUDENT_OVERSIGHT_DATA) {
        if (org.isReporting) {
          totalOut += org.transfers.outgoingTransfersTotal;
          totalIn += org.transfers.incomingTransfersTotal;
        }
      }

      assert.ok(totalOut > 0);
      assert.ok(totalIn > 0);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Data Governance & Quality Audit Tests
  // --------------------------------------------------------------------------
  describe('5. Data Governance & Quality Audit Rules', () => {
    test('detects physical capacity exceedance issue on over-capacity campus', () => {
      const horizon = INITIAL_STUDENT_OVERSIGHT_DATA.find((o) => o.organizationCode === 'HORIZON');
      assert.ok(horizon);

      const capacityIssue = horizon.dataQualityIssues.find((i) => i.code === 'OVER_CAPACITY');
      assert.ok(capacityIssue, 'Horizon must have an OVER_CAPACITY issue flagged');
      assert.equal(capacityIssue.severity, 'warning');
      assert.equal(capacityIssue.affectedCount, 25);
    });

    test('detects excessive applicant verification documents pending review', () => {
      const pinecrest = INITIAL_STUDENT_OVERSIGHT_DATA.find((o) => o.organizationCode === 'PINECREST');
      assert.ok(pinecrest);

      const docsIssue = pinecrest.dataQualityIssues.find((i) => i.code === 'DOCS_PENDING_EXCESSIVE');
      assert.ok(docsIssue, 'Pinecrest must have DOCS_PENDING_EXCESSIVE issue flagged');
      assert.equal(docsIssue.affectedCount, 18);
    });

    test('detects compliance hold status on suspended organization', () => {
      const summit = INITIAL_STUDENT_OVERSIGHT_DATA.find((o) => o.organizationCode === 'SUMMIT');
      assert.ok(summit);

      const unmappedIssue = summit.dataQualityIssues.find((i) => i.code === 'UNMAPPED_STATUS');
      assert.ok(unmappedIssue, 'Suspended org must have UNMAPPED_STATUS compliance hold flagged');
      assert.equal(unmappedIssue.severity, 'critical');
    });
  });

  // --------------------------------------------------------------------------
  // 6. Privacy by Design & Zero PII Guarantees
  // --------------------------------------------------------------------------
  describe('6. Privacy by Design & Data Minimization Verification', () => {
    test('guarantees zero student names, personal emails, or guardian contacts exist in fixtures', () => {
      const serialized = JSON.stringify(INITIAL_STUDENT_OVERSIGHT_DATA);

      // Verify no personal identity fields exist in the student oversight data structure
      assert.equal(serialized.includes('"firstName"'), false, 'Cannot expose firstName');
      assert.equal(serialized.includes('"lastName"'), false, 'Cannot expose lastName');
      assert.equal(serialized.includes('"dateOfBirth"'), false, 'Cannot expose dateOfBirth');
      assert.equal(serialized.includes('"guardian"'), false, 'Cannot expose guardian details');
      assert.equal(serialized.includes('"medicalNotes"'), false, 'Cannot expose medicalNotes');
      assert.equal(serialized.includes('"bloodGroup"'), false, 'Cannot expose bloodGroup');
    });

    test('guarantees CSV export contains only aggregated data and zero individual student PII', () => {
      const csv = buildStudentOversightCsv(INITIAL_STUDENT_OVERSIGHT_DATA);

      // Headers must exist
      assert.ok(csv.includes('"Organization Code"'));
      assert.ok(csv.includes('"Enrolled Students"'));
      assert.ok(csv.includes('"Applications Received"'));

      // Zero student PII in export output
      assert.equal(csv.includes('firstName'), false);
      assert.equal(csv.includes('lastName'), false);
      assert.equal(csv.includes('dateOfBirth'), false);
      assert.equal(csv.includes('@student'), false);

      // Check rows match total records
      const lines = csv.split('\r\n');
      assert.equal(lines.length, INITIAL_STUDENT_OVERSIGHT_DATA.length + 1); // 1 header + 10 rows
    });

    test('neutralizes formula injection characters in CSV exports', () => {
      const malformedOrg = [
        {
          ...INITIAL_STUDENT_OVERSIGHT_DATA[0],
          organizationName: '=SUM(1+1)',
          organizationCode: '+ATTACK',
        },
      ];

      const csv = buildStudentOversightCsv(malformedOrg);
      assert.ok(csv.includes("''=SUM(1+1)") || csv.includes("'=SUM(1+1)"), 'Must sanitize formula injection in organizationName');
      assert.ok(csv.includes("'+ATTACK"), 'Must sanitize formula injection in organizationCode');
    });
  });
});
