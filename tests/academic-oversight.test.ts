import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_CAMPUSES } from '../lib/data/initial-data';
import { INITIAL_ACADEMIC_OVERSIGHT_DATA } from '../lib/data/academic-oversight-fixtures';
import {
  validateAcademicYearPeriods,
  evaluateAcademicReadiness,
  detectTimetableConflicts,
  filterAcademicOversightData,
  computeAggregatedAcademicMetrics,
  getAcademicCapabilityInventory,
  getSelectableCampuses,
  validateReferentialIntegrity,
} from '../lib/academic-oversight/evaluator';
import { buildAcademicOversightCsv } from '../lib/utils/academic-oversight-export';
import {
  AcademicOversightFilterState,
  AcademicYearConfigSummary,
} from '../lib/types/academic-oversight';

describe('Phase E-09.9: Academics, Curriculum & Teaching Oversight Engine', () => {
  // --------------------------------------------------------------------------
  // 1. REFERENTIAL INTEGRITY & DOMAIN CONSTRAINTS
  // --------------------------------------------------------------------------
  describe('1. Referential Integrity & Domain Constraints', () => {
    test('all academic oversight records map strictly to valid INITIAL_ORGANIZATIONS', () => {
      const { isValid, errors } = validateReferentialIntegrity(INITIAL_ACADEMIC_OVERSIGHT_DATA);
      assert.equal(isValid, true, `Referential integrity failed: ${errors.join(', ')}`);
    });

    test('all campus records within academic oversight belong to their owning organization', () => {
      const campusMap = new Map(INITIAL_CAMPUSES.map((c) => [c.id, c.organizationId]));

      for (const org of INITIAL_ACADEMIC_OVERSIGHT_DATA) {
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
        ...INITIAL_ACADEMIC_OVERSIGHT_DATA,
        {
          ...INITIAL_ACADEMIC_OVERSIGHT_DATA[0],
          organizationId: 'org_ghost_999',
        },
      ];
      const { isValid, errors } = validateReferentialIntegrity(invalidData);
      assert.equal(isValid, false);
      assert.ok(errors.some((e) => e.includes('org_ghost_999')));
    });

    test('flags invalid campus reference if an unmapped campusId is present', () => {
      const invalidData = [
        {
          ...INITIAL_ACADEMIC_OVERSIGHT_DATA[0],
          campuses: [
            {
              campusId: 'camp_alien_404',
              campusName: 'Alien Campus',
              campusCode: 'ALIEN',
              isMainCampus: false,
              classesCount: 2,
              armsCount: 4,
              teachersCount: 5,
              timetablePublished: false,
            },
          ],
        },
      ];
      const { isValid, errors } = validateReferentialIntegrity(invalidData);
      assert.equal(isValid, false);
      assert.ok(errors.some((e) => e.includes('camp_alien_404')));
    });
  });

  // --------------------------------------------------------------------------
  // 2. ACADEMIC PERIOD & CALENDAR VALIDATION
  // --------------------------------------------------------------------------
  describe('2. Academic Period & Calendar Validation Logic', () => {
    test('passes valid academic year and sequential non-overlapping periods', () => {
      const validYear: AcademicYearConfigSummary = {
        id: 'ay_test_valid',
        name: '2026/2027',
        startDate: '2026-09-01',
        endDate: '2027-06-30',
        status: 'ACTIVE',
        isCurrent: true,
        termsCount: 2,
        dateValidity: 'valid',
        periods: [
          {
            id: 'p_1',
            name: 'Term 1',
            type: 'TERM',
            sequence: 1,
            startDate: '2026-09-01',
            endDate: '2026-12-18',
            isCurrent: true,
            status: 'ACTIVE',
          },
          {
            id: 'p_2',
            name: 'Term 2',
            type: 'TERM',
            sequence: 2,
            startDate: '2027-01-08',
            endDate: '2027-06-30',
            isCurrent: false,
            status: 'PLANNED',
          },
        ],
      };

      const result = validateAcademicYearPeriods(validYear);
      assert.equal(result.isValid, true);
      assert.equal(result.code, 'valid');
      assert.equal(result.errors.length, 0);
    });

    test('detects invalid date order when start date succeeds end date', () => {
      const invalidYear: AcademicYearConfigSummary = {
        id: 'ay_test_inverted',
        name: '2026/2027',
        startDate: '2027-09-01',
        endDate: '2026-06-30', // Inverted!
        status: 'ACTIVE',
        isCurrent: true,
        termsCount: 0,
        dateValidity: 'invalid_order',
        periods: [],
      };

      const result = validateAcademicYearPeriods(invalidYear);
      assert.equal(result.isValid, false);
      assert.equal(result.code, 'invalid_order');
      assert.ok(result.errors.some((e) => e.includes('start date')));
    });

    test('detects overlapping period dates across sequence', () => {
      const overlappingYear: AcademicYearConfigSummary = {
        id: 'ay_test_overlap',
        name: '2026/2027',
        startDate: '2026-09-01',
        endDate: '2027-06-30',
        status: 'ACTIVE',
        isCurrent: true,
        termsCount: 2,
        dateValidity: 'overlapping_periods',
        periods: [
          {
            id: 'p_1',
            name: 'Term 1',
            type: 'TERM',
            sequence: 1,
            startDate: '2026-09-01',
            endDate: '2027-01-15', // Ends Jan 15
            isCurrent: true,
            status: 'ACTIVE',
          },
          {
            id: 'p_2',
            name: 'Term 2',
            type: 'TERM',
            sequence: 2,
            startDate: '2027-01-08', // Starts Jan 8 (Overlap!)
            endDate: '2027-04-10',
            isCurrent: false,
            status: 'PLANNED',
          },
        ],
      };

      const result = validateAcademicYearPeriods(overlappingYear);
      assert.equal(result.isValid, false);
      assert.equal(result.code, 'overlapping_periods');
      assert.ok(result.errors.some((e) => e.includes('Overlapping period dates detected')));
    });
  });

  // --------------------------------------------------------------------------
  // 3. READINESS EVALUATOR & CHECKLIST
  // --------------------------------------------------------------------------
  describe('3. Readiness Evaluator & Checklist Engine', () => {
    test('evaluates 100% complete readiness for fully provisioned school', () => {
      const org8 = INITIAL_ACADEMIC_OVERSIGHT_DATA.find((r) => r.organizationId === 'org_008');
      assert.ok(org8);
      const evalResult = evaluateAcademicReadiness(org8);
      assert.equal(evalResult.score, 100);
      assert.equal(evalResult.level, 'complete');
      assert.equal(evalResult.blockers.length, 0);
      assert.equal(evalResult.warnings.length, 0);
      assert.equal(evalResult.completedChecklistItems, 8);
    });

    test('detects critical blocker when grading scale is missing', () => {
      const org7 = INITIAL_ACADEMIC_OVERSIGHT_DATA.find((r) => r.organizationId === 'org_007');
      assert.ok(org7);
      const evalResult = evaluateAcademicReadiness(org7);
      assert.equal(evalResult.level, 'critical_blocker');
      assert.ok(evalResult.blockers.some((b) => b.includes('grading scale')));
    });

    test('distinguishes dormant or unprovisioned state from complete zero failure', () => {
      const org9 = INITIAL_ACADEMIC_OVERSIGHT_DATA.find((r) => r.organizationId === 'org_009');
      assert.ok(org9);
      const evalResult = evaluateAcademicReadiness(org9);
      assert.equal(evalResult.level, 'unprovisioned');
      assert.equal(evalResult.score, 0);
      assert.ok(evalResult.blockers.some((b) => b.includes('dormant or not yet provisioned')));
    });

    test('detects timetable critical conflicts as blocking readiness', () => {
      const org4 = INITIAL_ACADEMIC_OVERSIGHT_DATA.find((r) => r.organizationId === 'org_004');
      assert.ok(org4);
      const evalResult = evaluateAcademicReadiness(org4);
      assert.equal(evalResult.level, 'critical_blocker');
      assert.ok(evalResult.blockers.some((b) => b.includes('critical conflicts')));
    });
  });

  // --------------------------------------------------------------------------
  // 4. TIMETABLE CONFLICT DETECTION LOGIC
  // --------------------------------------------------------------------------
  describe('4. Timetable Multi-Resource Conflict Detection', () => {
    test('detects teacher double-booking on same day and time', () => {
      const slots = [
        {
          id: 'slot_1',
          teacherId: 'teacher_smith',
          teacherName: 'John Smith',
          room: 'Room 101',
          classId: 'class_g10',
          className: 'Grade 10',
          dayOfWeek: 'MONDAY',
          startTime: '09:00',
          endTime: '09:50',
        },
        {
          id: 'slot_2',
          teacherId: 'teacher_smith', // Same teacher
          teacherName: 'John Smith',
          room: 'Room 205',
          classId: 'class_g12',
          className: 'Grade 12',
          dayOfWeek: 'MONDAY',
          startTime: '09:15', // Overlaps
          endTime: '10:05',
        },
      ];

      const conflicts = detectTimetableConflicts(slots);
      assert.equal(conflicts.length, 1);
      assert.equal(conflicts[0].type, 'TEACHER_OVERLAP');
      assert.equal(conflicts[0].severity, 'CRITICAL');
      assert.ok(conflicts[0].message.includes('double-booked'));
    });

    test('detects room clash when different teachers/classes use same room concurrently', () => {
      const slots = [
        {
          id: 'slot_a',
          teacherId: 'teacher_albert',
          room: 'Science Lab 1',
          classId: 'class_g9',
          dayOfWeek: 'WEDNESDAY',
          startTime: '10:00',
          endTime: '11:00',
        },
        {
          id: 'slot_b',
          teacherId: 'teacher_bertha',
          room: 'Science Lab 1', // Same room
          classId: 'class_g11',
          dayOfWeek: 'WEDNESDAY',
          startTime: '10:30',
          endTime: '11:30',
        },
      ];

      const conflicts = detectTimetableConflicts(slots);
      assert.equal(conflicts.length, 1);
      assert.equal(conflicts[0].type, 'ROOM_OVERLAP');
      assert.equal(conflicts[0].severity, 'CRITICAL');
      assert.ok(conflicts[0].message.includes('Science Lab 1'));
    });

    test('returns empty conflicts when slots are on different days or times', () => {
      const slots = [
        {
          id: 'slot_x',
          teacherId: 'teacher_sam',
          room: 'Room A',
          classId: 'class_1',
          dayOfWeek: 'MONDAY',
          startTime: '08:00',
          endTime: '08:50',
        },
        {
          id: 'slot_y',
          teacherId: 'teacher_sam',
          room: 'Room A',
          classId: 'class_2',
          dayOfWeek: 'MONDAY',
          startTime: '09:00', // Non-overlapping
          endTime: '09:50',
        },
        {
          id: 'slot_z',
          teacherId: 'teacher_sam',
          room: 'Room A',
          classId: 'class_3',
          dayOfWeek: 'TUESDAY', // Different day
          startTime: '08:00',
          endTime: '08:50',
        },
      ];

      const conflicts = detectTimetableConflicts(slots);
      assert.equal(conflicts.length, 0);
    });
  });

  // --------------------------------------------------------------------------
  // 5. DYNAMIC FILTERING & CANONICAL METRICS
  // --------------------------------------------------------------------------
  describe('5. Dynamic Filtering & Aggregation Consistency', () => {
    test('filters accurately by organization ID', () => {
      const filter: AcademicOversightFilterState = {
        organizationId: 'org_001',
        campusId: 'ALL',
        academicSession: 'ALL',
        activePeriod: 'ALL',
        readinessLevel: 'ALL',
        capabilityCategory: 'ALL',
        searchQuery: '',
      };
      const filtered = filterAcademicOversightData(INITIAL_ACADEMIC_OVERSIGHT_DATA, filter);
      assert.equal(filtered.length, 1);
      assert.equal(filtered[0].organizationId, 'org_001');
    });

    test('filters accurately by campus ID and resolves selectable campuses dynamically', () => {
      const campuses = getSelectableCampuses(INITIAL_ACADEMIC_OVERSIGHT_DATA, 'org_001');
      assert.equal(campuses.length, 3);
      assert.ok(campuses.some((c) => c.id === 'camp_001_1'));

      const filter: AcademicOversightFilterState = {
        organizationId: 'org_001',
        campusId: 'camp_001_1',
        academicSession: 'ALL',
        activePeriod: 'ALL',
        readinessLevel: 'ALL',
        capabilityCategory: 'ALL',
        searchQuery: '',
      };
      const filtered = filterAcademicOversightData(INITIAL_ACADEMIC_OVERSIGHT_DATA, filter);
      assert.equal(filtered.length, 1);
    });

    test('filters accurately by readiness level (critical_blocker)', () => {
      const filter: AcademicOversightFilterState = {
        organizationId: 'ALL',
        campusId: 'ALL',
        academicSession: 'ALL',
        activePeriod: 'ALL',
        readinessLevel: 'critical_blocker',
        capabilityCategory: 'ALL',
        searchQuery: '',
      };
      const filtered = filterAcademicOversightData(INITIAL_ACADEMIC_OVERSIGHT_DATA, filter);
      assert.ok(filtered.length >= 2);
      for (const f of filtered) {
        assert.equal(f.readiness.level, 'critical_blocker');
      }
    });

    test('filters accurately by search query across name, code, or curriculum framework', () => {
      const filter: AcademicOversightFilterState = {
        organizationId: 'ALL',
        campusId: 'ALL',
        academicSession: 'ALL',
        activePeriod: 'ALL',
        readinessLevel: 'ALL',
        capabilityCategory: 'ALL',
        searchQuery: 'CAMBRIDGE',
      };
      const filtered = filterAcademicOversightData(INITIAL_ACADEMIC_OVERSIGHT_DATA, filter);
      assert.ok(filtered.length >= 2);
      assert.ok(filtered.some((r) => r.organizationCode === 'OAKHILL'));
      assert.ok(filtered.some((r) => r.organizationCode === 'WESTBRIDGE'));
    });

    test('canonical aggregate metrics are strictly derived from filtered underlying records', () => {
      const metrics = computeAggregatedAcademicMetrics(INITIAL_ACADEMIC_OVERSIGHT_DATA);
      assert.equal(metrics.totalOrganizations, 10);
      assert.equal(metrics.activeReportingOrganizations, 8);
      assert.equal(metrics.dormantOrUnprovisionedOrganizations, 2);
      assert.ok(metrics.totalAcademicSessionsConfigured >= 8);
      assert.ok(metrics.averageReadinessScore > 50);
      assert.ok(metrics.totalClassesRepresented > 50);
      assert.ok(metrics.totalSubjectsRepresented > 100);
      assert.ok(metrics.totalCriticalConflicts >= 2); // Crestview conflicts
      assert.ok(metrics.gradingScalesConfiguredCount >= 7);
    });
  });

  // --------------------------------------------------------------------------
  // 6. CAPABILITY INVENTORY & E-09.6 MODULE REGISTRY INTEGRATION
  // --------------------------------------------------------------------------
  describe('6. Capability Inventory & Module Registry Integration', () => {
    test('capability inventory contains all 16 verified target capabilities', () => {
      const capabilities = getAcademicCapabilityInventory();
      assert.equal(capabilities.length, 16);

      const requiredCaps = [
        'cap_academic_calendar',
        'cap_academic_structure',
        'cap_teacher_allocation',
        'cap_curriculum_blueprints',
        'cap_schemes_of_work',
        'cap_timetables_scheduling',
        'cap_timetable_conflicts',
        'cap_lesson_notes',
        'cap_daily_lesson_plans',
        'cap_assignments_coursework',
        'cap_examinations_assessments',
        'cap_grading_scales',
        'cap_report_cards',
        'cap_broadsheets',
        'cap_transcripts',
        'cap_promotion_rules',
      ];

      for (const req of requiredCaps) {
        assert.ok(
          capabilities.some((c) => c.id === req),
          `Missing required capability: ${req}`
        );
      }
    });

    test('all capabilities link to valid module registry IDs and have tenant source evidence', () => {
      const capabilities = getAcademicCapabilityInventory();
      for (const cap of capabilities) {
        assert.ok(cap.moduleRegistryRef.startsWith('mod_') || cap.moduleRegistryRef.startsWith('sub_'));
        assert.ok(cap.tenantSourceEvidence.routePath.length > 0);
        assert.ok(cap.tenantSourceEvidence.typeDefinition.length > 0);
        assert.ok(cap.tenantRoutes.length > 0);
        assert.equal(cap.implementationStatus, 'implemented');
      }
    });
  });

  // --------------------------------------------------------------------------
  // 7. PRIVACY BY DESIGN & DATA MINIMIZATION
  // --------------------------------------------------------------------------
  describe('7. Privacy by Design & Data Minimization Verification', () => {
    test('guarantees zero student names, exam scores, or guardian emails exist in fixtures', () => {
      const serialized = JSON.stringify(INITIAL_ACADEMIC_OVERSIGHT_DATA).toLowerCase();
      assert.equal(serialized.includes('studentname'), false);
      assert.equal(serialized.includes('rawscore'), false);
      assert.equal(serialized.includes('guardianemail'), false);
      assert.equal(serialized.includes('parentphone'), false);
    });

    test('guarantees CSV export contains only aggregated data and zero individual student PII', () => {
      const csv = buildAcademicOversightCsv(INITIAL_ACADEMIC_OVERSIGHT_DATA);
      assert.ok(csv.includes('"Organization Code","Organization Name"'));
      assert.ok(csv.includes('"OAKHILL"'));
      assert.equal(csv.includes('studentName'), false);
      assert.equal(csv.includes('studentAdmissionNo'), false);
    });

    test('neutralizes formula injection characters in CSV export cells', () => {
      const maliciousData = [
        {
          ...INITIAL_ACADEMIC_OVERSIGHT_DATA[0],
          organizationName: '=CMD|"/C calc"!A0',
        },
      ];
      const csv = buildAcademicOversightCsv(maliciousData);
      assert.ok(csv.includes("`'=CMD") || csv.includes("`'") || csv.includes("\"'=CMD"));
    });
  });
});
