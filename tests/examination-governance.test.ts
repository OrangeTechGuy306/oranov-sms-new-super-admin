import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_CAMPUSES } from '../lib/data/initial-data';
import { INITIAL_EXAM_GOVERNANCE_DATA } from '../lib/data/examination-governance-fixtures';
import {
  evaluateExamReadiness,
  detectExamTimetableConflicts,
  filterExamGovernanceData,
  computeAggregatedExamMetrics,
  getExamCapabilityInventory,
  validateExamReferentialIntegrity,
} from '../lib/examination-governance/evaluator';
import { buildExamGovernanceCsv } from '../lib/utils/examination-governance-export';
import {
  ExamGovernanceFilterState,
  OrganizationExamGovernance,
} from '../lib/types/examination-governance';

describe('Phase E-09.10: Examinations, CBT & Assessment Governance Engine', () => {
  // --------------------------------------------------------------------------
  // 1. REFERENTIAL INTEGRITY & DOMAIN CONSTRAINTS
  // --------------------------------------------------------------------------
  describe('1. Referential Integrity & Domain Constraints', () => {
    test('all examination governance records map strictly to valid INITIAL_ORGANIZATIONS', () => {
      const { isValid, errors } = validateExamReferentialIntegrity(INITIAL_EXAM_GOVERNANCE_DATA);
      assert.equal(isValid, true, `Referential integrity failed: ${errors.join(', ')}`);
    });

    test('all campus records within examination governance belong to their owning organization', () => {
      const campusMap = new Map(INITIAL_CAMPUSES.map((c) => [c.id, c.organizationId]));

      for (const org of INITIAL_EXAM_GOVERNANCE_DATA) {
        if (org.campuses) {
          for (const camp of org.campuses) {
            const expectedOrgId = campusMap.get(camp.campusId);
            assert.equal(
              expectedOrgId,
              org.organizationId,
              `Campus ${camp.campusId} should belong to ${org.organizationId}, but maps to ${expectedOrgId}`
            );
          }
        }
      }
    });

    test('flags orphaned entities if an unknown organization is supplied', () => {
      const invalidData = [
        ...INITIAL_EXAM_GOVERNANCE_DATA,
        {
          ...INITIAL_EXAM_GOVERNANCE_DATA[0],
          organizationId: 'org_ghost_999',
        },
      ];
      const { isValid, errors } = validateExamReferentialIntegrity(invalidData);
      assert.equal(isValid, false);
      assert.ok(errors.some((e) => e.includes('org_ghost_999')));
    });

    test('flags invalid campus reference if an unmapped campusId is present', () => {
      const invalidData = [
        {
          ...INITIAL_EXAM_GOVERNANCE_DATA[0],
          campuses: [
            {
              campusId: 'camp_alien_404',
              campusName: 'Alien Campus',
              campusCode: 'ALIEN',
              isMainCampus: false,
              status: 'active' as const,
              scheduledExamsCount: 2,
              inProgressCount: 0,
              completedCount: 0,
              timetableConflictsCount: 0,
              readinessScore: 50,
              readinessLevel: 'not_ready' as const,
            },
          ],
        },
      ];
      const { isValid, errors } = validateExamReferentialIntegrity(invalidData);
      assert.equal(isValid, false);
      assert.ok(errors.some((e) => e.includes('camp_alien_404')));
    });
  });

  // --------------------------------------------------------------------------
  // 2. 8-POINT CANONICAL EXAMINATION READINESS EVALUATOR
  // --------------------------------------------------------------------------
  describe('2. 8-Point Canonical Examination Readiness Evaluator', () => {
    test('evaluates a fully configured organization as ready with 0 critical blockers', () => {
      const fullyReadyOrg: OrganizationExamGovernance = {
        ...INITIAL_EXAM_GOVERNANCE_DATA[0], // Oak Hill
      };

      const result = evaluateExamReadiness(fullyReadyOrg);
      assert.equal(result.criticalBlockersCount, 0);
      assert.ok(result.overallScore >= 85, `Score should be >= 85%, got ${result.overallScore}%`);
      assert.equal(result.level, 'ready');
      assert.equal(result.checks.length, 8);
    });

    test('identifies critical blocker when timetable has severe room or teacher clashes', () => {
      const conflictingOrg: OrganizationExamGovernance = {
        ...INITIAL_EXAM_GOVERNANCE_DATA[0],
        timetable: {
          totalSlots: 10,
          assignedRoomsCount: 10,
          invigilatorsAssignedCount: 10,
          unassignedInvigilatorsCount: 0,
          hasScheduleConflicts: true,
          criticalConflictsCount: 2,
          warningConflictsCount: 0,
          conflicts: [
            {
              id: 'conf-test-001',
              slotId: 'slot-1',
              conflictType: 'ROOM_DOUBLE_BOOKED',
              severity: 'CRITICAL',
              description: 'Double booked hall',
              examDate: '2026-03-20',
              timeWindow: '09:00 - 11:00',
              affectedEntities: ['Hall A'],
            },
          ],
        },
      };

      const result = evaluateExamReadiness(conflictingOrg);
      const ttCheck = result.checks.find((c) => c.id === 'TIMETABLE_ROOM_INVIGILATION');
      assert.ok(ttCheck, 'Timetable check must exist');
      assert.equal(ttCheck.status, 'failed');
      assert.equal(ttCheck.isBlocker, true);
      assert.ok(result.criticalBlockersCount >= 1);
    });

    test('identifies critical blocker when grading scale is completely missing', () => {
      const unconfiguredGradingOrg: OrganizationExamGovernance = {
        ...INITIAL_EXAM_GOVERNANCE_DATA[0],
        grading: {
          isConfigured: false,
          scaleName: 'Unconfigured',
          scaleType: 'NONE',
          passMark: 0,
          totalBands: 0,
          bandsSummary: 'None',
        },
      };

      const result = evaluateExamReadiness(unconfiguredGradingOrg);
      const gradingCheck = result.checks.find((c) => c.id === 'GRADING_SCALE_CONFIGURED');
      assert.ok(gradingCheck);
      assert.equal(gradingCheck.status, 'failed');
      assert.equal(gradingCheck.isBlocker, true);
    });

    test('exempts paper-based schools from CBT question bank requirements', () => {
      const paperOrg: OrganizationExamGovernance = {
        ...INITIAL_EXAM_GOVERNANCE_DATA[4], // Kids Haven Montessori
        deliveryMode: 'PAPER_BASED',
      };

      const result = evaluateExamReadiness(paperOrg);
      const cbtCheck = result.checks.find((c) => c.id === 'CBT_READINESS_OR_EXEMPT');
      assert.ok(cbtCheck);
      assert.equal(cbtCheck.status, 'not_applicable');
      assert.equal(cbtCheck.isBlocker, false);
    });

    test('returns not_applicable and 0 score for inactive or archived organizations', () => {
      const inactiveOrg: OrganizationExamGovernance = {
        ...INITIAL_EXAM_GOVERNANCE_DATA[7], // Crestwood
        lifecycleStatus: 'inactive',
      };

      const result = evaluateExamReadiness(inactiveOrg);
      assert.equal(result.level, 'not_applicable');
      assert.equal(result.overallScore, 0);
    });
  });

  // --------------------------------------------------------------------------
  // 3. TIMETABLE CONFLICT DETECTION ENGINE
  // --------------------------------------------------------------------------
  describe('3. Timetable Conflict Detection Engine', () => {
    test('detects room double booking when two slots share room and overlapping time', () => {
      const slots = [
        {
          id: 'slot_1',
          room: 'Main Hall',
          invigilatorId: 'teacher_1',
          classId: 'Class 10A',
          examDate: '2026-03-20',
          startTime: '09:00',
          endTime: '11:00',
        },
        {
          id: 'slot_2',
          room: 'Main Hall', // SAME ROOM
          invigilatorId: 'teacher_2',
          classId: 'Class 11B',
          examDate: '2026-03-20',
          startTime: '10:00', // OVERLAPS (10:00 < 11:00)
          endTime: '12:00',
        },
      ];

      const conflicts = detectExamTimetableConflicts(slots);
      assert.equal(conflicts.length, 1);
      assert.equal(conflicts[0].conflictType, 'ROOM_DOUBLE_BOOKED');
      assert.equal(conflicts[0].severity, 'CRITICAL');
    });

    test('detects teacher/invigilator double booking across different rooms', () => {
      const slots = [
        {
          id: 'slot_a',
          room: 'Room 101',
          invigilatorId: 'teacher_simon',
          classId: 'Class 9A',
          examDate: '2026-03-22',
          startTime: '13:00',
          endTime: '15:00',
        },
        {
          id: 'slot_b',
          room: 'Room 205',
          invigilatorId: 'teacher_simon', // SAME TEACHER
          classId: 'Class 12A',
          examDate: '2026-03-22',
          startTime: '14:00', // OVERLAPS
          endTime: '16:00',
        },
      ];

      const conflicts = detectExamTimetableConflicts(slots);
      assert.equal(conflicts.length, 1);
      assert.equal(conflicts[0].conflictType, 'TEACHER_DOUBLE_BOOKED');
      assert.equal(conflicts[0].severity, 'CRITICAL');
    });

    test('permits adjacent slots with non-overlapping boundaries', () => {
      const slots = [
        {
          id: 'slot_morning',
          room: 'Science Lab 1',
          invigilatorId: 'teacher_curie',
          classId: 'Class 11A',
          examDate: '2026-03-25',
          startTime: '09:00',
          endTime: '11:00',
        },
        {
          id: 'slot_afternoon',
          room: 'Science Lab 1', // Same room, but start is exactly end of previous
          invigilatorId: 'teacher_curie',
          classId: 'Class 12A',
          examDate: '2026-03-25',
          startTime: '11:00',
          endTime: '13:00',
        },
      ];

      const conflicts = detectExamTimetableConflicts(slots);
      assert.equal(conflicts.length, 0, 'Adjacent slots should not conflict');
    });
  });

  // --------------------------------------------------------------------------
  // 4. DYNAMIC MULTI-DIMENSIONAL FILTERING
  // --------------------------------------------------------------------------
  describe('4. Dynamic Multi-Dimensional Filtering & Aggregation', () => {
    test('filters strictly by organizationId', () => {
      const filter: ExamGovernanceFilterState = {
        organizationId: 'org_001',
        campusId: 'ALL',
        academicPeriod: 'ALL',
        assessmentType: 'ALL',
        lifecycleStatus: 'ALL',
        deliveryMode: 'ALL',
        readinessStatus: 'ALL',
        searchQuery: '',
      };

      const result = filterExamGovernanceData(INITIAL_EXAM_GOVERNANCE_DATA, filter);
      assert.equal(result.length, 1);
      assert.equal(result[0].organizationId, 'org_001');
    });

    test('filters strictly by deliveryMode (CBT_FULL vs PAPER_BASED)', () => {
      const filterCbt: ExamGovernanceFilterState = {
        organizationId: 'ALL',
        campusId: 'ALL',
        academicPeriod: 'ALL',
        assessmentType: 'ALL',
        lifecycleStatus: 'ALL',
        deliveryMode: 'CBT_FULL',
        readinessStatus: 'ALL',
        searchQuery: '',
      };

      const cbtResults = filterExamGovernanceData(INITIAL_EXAM_GOVERNANCE_DATA, filterCbt);
      assert.ok(cbtResults.length > 0);
      assert.ok(cbtResults.every((r) => r.deliveryMode === 'CBT_FULL'));

      const filterPaper: ExamGovernanceFilterState = {
        ...filterCbt,
        deliveryMode: 'PAPER_BASED',
      };

      const paperResults = filterExamGovernanceData(INITIAL_EXAM_GOVERNANCE_DATA, filterPaper);
      assert.ok(paperResults.length > 0);
      assert.ok(paperResults.every((r) => r.deliveryMode === 'PAPER_BASED'));
    });

    test('filters strictly by readinessStatus', () => {
      const filterReady: ExamGovernanceFilterState = {
        organizationId: 'ALL',
        campusId: 'ALL',
        academicPeriod: 'ALL',
        assessmentType: 'ALL',
        lifecycleStatus: 'ALL',
        deliveryMode: 'ALL',
        readinessStatus: 'ready',
        searchQuery: '',
      };

      const readyResults = filterExamGovernanceData(INITIAL_EXAM_GOVERNANCE_DATA, filterReady);
      assert.ok(readyResults.every((r) => r.readiness.level === 'ready'));

      const filterBlocked: ExamGovernanceFilterState = {
        ...filterReady,
        readinessStatus: 'not_ready',
      };

      const blockedResults = filterExamGovernanceData(INITIAL_EXAM_GOVERNANCE_DATA, filterBlocked);
      assert.ok(blockedResults.every((r) => r.readiness.level === 'not_ready'));
    });

    test('full-text search matches organization name, code, or active period', () => {
      const filter: ExamGovernanceFilterState = {
        organizationId: 'ALL',
        campusId: 'ALL',
        academicPeriod: 'ALL',
        assessmentType: 'ALL',
        lifecycleStatus: 'ALL',
        deliveryMode: 'ALL',
        readinessStatus: 'ALL',
        searchQuery: 'oakhill',
      };

      const result = filterExamGovernanceData(INITIAL_EXAM_GOVERNANCE_DATA, filter);
      assert.equal(result.length, 1);
      assert.equal(result[0].organizationCode, 'OAKHILL');
    });

    test('date range filter correctly includes overlapping active exam periods', () => {
      const filter: ExamGovernanceFilterState = {
        organizationId: 'ALL',
        campusId: 'ALL',
        academicPeriod: 'ALL',
        assessmentType: 'ALL',
        lifecycleStatus: 'ALL',
        deliveryMode: 'ALL',
        readinessStatus: 'ALL',
        searchQuery: '',
        startDate: '2026-03-01',
        endDate: '2026-03-31',
      };

      const result = filterExamGovernanceData(INITIAL_EXAM_GOVERNANCE_DATA, filter);
      assert.ok(result.length > 0);
      // All results should have an active period that intersects March 2026
      assert.ok(
        result.every(
          (r) =>
            r.activeExamPeriodDates &&
            r.activeExamPeriodDates.start <= '2026-03-31' &&
            r.activeExamPeriodDates.end >= '2026-03-01'
        )
      );
    });
  });

  // -------------------------------------------------------------
  // 5. AGGREGATED METRICS COMPUTATION (Pure Rollups)
  // -------------------------------------------------------------
  describe('5. Aggregated Metrics Rollup & Mathematical Consistency', () => {
    test('computes exact rollup counts matching individual record sums', () => {
      const metrics = computeAggregatedExamMetrics(INITIAL_EXAM_GOVERNANCE_DATA);

      assert.equal(metrics.totalOrganizations, INITIAL_EXAM_GOVERNANCE_DATA.length);

      // Verify scheduled assessments count
      const sumScheduled = INITIAL_EXAM_GOVERNANCE_DATA.reduce(
        (acc, r) => acc + r.assessments.scheduledCount,
        0
      );
      assert.equal(metrics.scheduledAssessments, sumScheduled);

      // Verify CBT total attempts count
      const sumCbtAttempts = INITIAL_EXAM_GOVERNANCE_DATA.reduce(
        (acc, r) => acc + (r.cbt.isEnabled ? r.cbt.totalAttempts : 0),
        0
      );
      assert.equal(metrics.totalCbtAttempts, sumCbtAttempts);

      // Verify Question Bank total questions
      const sumQuestions = INITIAL_EXAM_GOVERNANCE_DATA.reduce(
        (acc, r) => acc + (r.questionBank.isEnabled ? r.questionBank.totalQuestions : 0),
        0
      );
      assert.equal(metrics.questionBankTotalQuestions, sumQuestions);

      // Verify Timetable slots sum
      const sumSlots = INITIAL_EXAM_GOVERNANCE_DATA.reduce(
        (acc, r) => acc + r.timetable.totalSlots,
        0
      );
      assert.equal(metrics.totalExamSlots, sumSlots);

      // Verify readiness score average
      const sumScores = INITIAL_EXAM_GOVERNANCE_DATA.reduce(
        (acc, r) => acc + r.readiness.overallScore,
        0
      );
      const expectedAvg = Math.round(sumScores / INITIAL_EXAM_GOVERNANCE_DATA.length);
      assert.equal(metrics.averageReadinessScore, expectedAvg);
    });

    test('returns clean zero state for empty record set without crashing or NaN', () => {
      const emptyMetrics = computeAggregatedExamMetrics([]);
      assert.equal(emptyMetrics.totalOrganizations, 0);
      assert.equal(emptyMetrics.averageReadinessScore, 0);
      assert.equal(emptyMetrics.scheduledAssessments, 0);
      assert.equal(emptyMetrics.totalCbtAttempts, 0);
      assert.equal(Number.isNaN(emptyMetrics.averageReadinessScore), false);
    });
  });

  // -------------------------------------------------------------
  // 6. CBT OPERATIONS & EXCEPTION BREAKDOWN
  // -------------------------------------------------------------
  describe('6. CBT Operations & Exception Categorization', () => {
    test('aggregates exception types accurately across all CBT attempts', () => {
      const metrics = computeAggregatedExamMetrics(INITIAL_EXAM_GOVERNANCE_DATA);
      assert.ok(metrics.totalCbtExceptions >= 0);

      const org1 = INITIAL_EXAM_GOVERNANCE_DATA[0]; // Oak Hill
      assert.equal(org1.cbt.exceptionBreakdown.BROWSER_UNFOCUSED, 2);
      assert.equal(org1.cbt.exceptionBreakdown.CONNECTION_LOST, 2);
    });

    test('explicitly reports physical proctoring instead of claiming automated AI proctoring', () => {
      for (const org of INITIAL_EXAM_GOVERNANCE_DATA) {
        if (org.cbt.isEnabled) {
          assert.equal(
            org.cbt.proctoringStatus,
            'MANUAL_INVIGILATION',
            `Org ${org.organizationId} must report manual invigilation`
          );
        }
      }
    });
  });

  // -------------------------------------------------------------
  // 7. QUESTION BANK TAXONOMY & BLUEPRINT GOVERNANCE
  // -------------------------------------------------------------
  describe('7. Question Bank Taxonomy & Blueprint Governance', () => {
    test('supports all 8 canonical question formats in question bank inventory', () => {
      const org1 = INITIAL_EXAM_GOVERNANCE_DATA[0];
      const byType = org1.questionBank.byType;

      assert.ok(byType.SINGLE_CHOICE > 0);
      assert.ok(byType.MULTIPLE_SELECT > 0);
      assert.ok(byType.TRUE_FALSE > 0);
      assert.ok(byType.SHORT_ANSWER > 0);
      assert.ok(byType.ESSAY > 0);
      assert.ok(byType.FILL_IN_BLANKS > 0);
      assert.ok(byType.MATCHING > 0);
      assert.ok(byType.NUMERIC > 0);
    });

    test('maintains cognitive difficulty balance across Bloom levels', () => {
      const org1 = INITIAL_EXAM_GOVERNANCE_DATA[0];
      const diff = org1.questionBank.byDifficulty;

      assert.ok(diff.EASY > 0);
      assert.ok(diff.MEDIUM > 0);
      assert.ok(diff.HARD > 0);
      assert.ok(diff.EXPERT > 0);
      assert.equal(
        diff.EASY + diff.MEDIUM + diff.HARD + diff.EXPERT,
        org1.questionBank.totalQuestions
      );
    });
  });

  // -------------------------------------------------------------
  // 8. MASTER MODULE REGISTRY LINKAGE
  // -------------------------------------------------------------
  describe('8. Master Module Registry Linkage & Source Evidence', () => {
    test('all 15 examination capabilities resolve to valid Master Module Registry IDs', () => {
      const capabilities = getExamCapabilityInventory();
      assert.equal(capabilities.length, 15);

      const validModulePrefixes = ['mod_examinations', 'sub_exam_', 'mod_results', 'sub_results_'];

      for (const cap of capabilities) {
        const hasValidRef = validModulePrefixes.some((prefix) =>
          cap.moduleRegistryRef.startsWith(prefix)
        );
        assert.equal(
          hasValidRef,
          true,
          `Capability ${cap.id} has invalid moduleRegistryRef: ${cap.moduleRegistryRef}`
        );
        assert.ok(cap.tenantSourceEvidence.routePath.length > 0);
        assert.ok(cap.tenantSourceEvidence.typeDefinition.length > 0);
      }
    });

    test('automated proctoring is recorded as missing capability with clear rationale', () => {
      const capabilities = getExamCapabilityInventory();
      const autoProctoring = capabilities.find((c) => c.id === 'cap_cbt_auto_proctoring');
      assert.ok(autoProctoring, 'cap_cbt_auto_proctoring capability must exist in inventory');
      assert.equal(autoProctoring.implementationStatus, 'missing');
    });
  });

  // -------------------------------------------------------------
  // 9. PRIVACY BY DESIGN & DATA MINIMIZATION
  // -------------------------------------------------------------
  describe('9. Privacy by Design & Zero Student PII Protection', () => {
    test('guarantees zero student names, personal emails, or candidate IDs exist in fixtures', () => {
      const serialized = JSON.stringify(INITIAL_EXAM_GOVERNANCE_DATA);

      const forbiddenPiiTerms = [
        'studentName',
        'studentEmail',
        'studentAdmissionNo',
        'guardianName',
        'guardianPhone',
        'rawScore',
        'candidateAnswer',
        'correctAnswer',
      ];

      for (const term of forbiddenPiiTerms) {
        assert.equal(
          serialized.includes(`"${term}"`),
          false,
          `Forbidden student PII or exam answer key field "${term}" found in examination fixtures!`
        );
      }
    });

    test('guarantees aggregate CSV export contains zero student PII or private responses', () => {
      const csv = buildExamGovernanceCsv(INITIAL_EXAM_GOVERNANCE_DATA);

      assert.ok(csv.includes('Oak Hill International Academy'));
      assert.ok(csv.includes('Cambridge International & IB Dual Scale'));

      // Ensure no candidate marks or names leaked into CSV
      assert.equal(csv.includes('studentName'), false);
      assert.equal(csv.includes('candidateAnswer'), false);
    });

    test('neutralizes formula injection characters in CSV exports', () => {
      const maliciousOrg: OrganizationExamGovernance = {
        ...INITIAL_EXAM_GOVERNANCE_DATA[0],
        organizationName: '=CMD|"/C calc"!A0',
        activeExamPeriodName: '@SUM(1+1)',
      };

      const csv = buildExamGovernanceCsv([maliciousOrg]);
      const lines = csv.split('\n');
      const dataRow = lines[1];

      // Any cell starting with =, +, -, @ must be prepended with a single quote '
      assert.ok(
        dataRow.includes(`"'=CMD|""/C calc""!A0"`),
        `Formula injection was not neutralized: ${dataRow}`
      );
      assert.ok(
        dataRow.includes(`"'@SUM(1+1)"`),
        `Formula injection with @ was not neutralized: ${dataRow}`
      );
    });
  });
});
