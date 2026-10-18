/**
 * Phase E-09.9: Academics, Curriculum & Teaching Oversight Evaluator Engine
 * 
 * Provides deterministic evaluation, referential checks, date validation,
 * timetable conflict detection, readiness evaluation, dynamic filtering,
 * and canonical metric aggregations across tenant organizations.
 */

import {
  OrganizationAcademicOversight,
  AcademicOversightFilterState,
  AggregatedAcademicOversightMetrics,
  AcademicCapabilityItem,
  AcademicYearConfigSummary,
  AcademicReadinessEvaluation,
  AcademicReadinessItem,
  TimetableConflictItem,
} from '../types/academic-oversight';
import { INITIAL_ORGANIZATIONS, INITIAL_CAMPUSES } from '../data/initial-data';

// --------------------------------------------------------------------------
// 1. CAPABILITY INVENTORY (Linked directly to E-09.6 Module Registry)
// --------------------------------------------------------------------------

export function getAcademicCapabilityInventory(): AcademicCapabilityItem[] {
  return [
    {
      id: 'cap_academic_calendar',
      name: 'Academic Sessions, Terms & Semesters',
      category: 'calendar_structure',
      description: 'Master academic years, terms, semesters, quarters, and active period designations with date boundaries.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/academics/sessions/page.tsx',
        typeDefinition: 'types/academics.ts',
        componentEntry: 'components/academics/CreateSessionModal.tsx',
        mockStore: 'lib/mock/academicsData.ts',
      },
      tenantRoutes: ['/academics', '/academics/sessions', '/academics/terms'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Cross-tenant monitoring of session calendar validity, current period alignment, and term counts.',
      knownLimitations: ['Tenant-configured dates require manual backend synchronization.'],
      moduleRegistryRef: 'sub_academics_sessions',
      futureBackendDependency: 'Tenant-scoped academic session CRUD and term boundary persistence API.',
    },
    {
      id: 'cap_academic_structure',
      name: 'Departments, Class Cohorts, Streams & Subjects',
      category: 'calendar_structure',
      description: 'Hierarchical structure of academic departments, class cohorts (Grade 1-12), class arms/streams, and subject catalog.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/academics/classes/page.tsx',
        typeDefinition: 'types/academics.ts',
        componentEntry: 'components/academics',
        mockStore: 'lib/mock/academicsData.ts',
      },
      tenantRoutes: ['/academics/classes', '/academics/departments', '/academics/subjects'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Aggregate visibility into cohort counts, stream capacities, and subject distribution across schools.',
      knownLimitations: ['Subject assignment changes do not automatically adjust timetable slots in mock mode.'],
      moduleRegistryRef: 'sub_academics_classes',
      futureBackendDependency: 'Relational hierarchy queries for tenant classes, arms, and subjects with enrollment constraints.',
    },
    {
      id: 'cap_teacher_allocation',
      name: 'Faculty Subject Allocation & Teacher Workload',
      category: 'teaching_pedagogy',
      description: 'Mapping certified teaching staff to subjects, classes, and arms with primary and assistant instructor designations.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/academics/teacher-assignments/page.tsx',
        typeDefinition: 'types/academics.ts',
        mockStore: 'lib/mock/academicsData.ts',
      },
      tenantRoutes: ['/academics/teacher-assignments', '/teachers'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Monitoring faculty allocation completeness and identifying unassigned core subjects without exposing staff PII.',
      knownLimitations: ['Workload credit hour caps are soft-validated in frontend.'],
      moduleRegistryRef: 'sub_academics_teacher_assignments',
      futureBackendDependency: 'Teacher allocation database relations with workload capacity validators.',
    },
    {
      id: 'cap_curriculum_blueprints',
      name: 'Curriculum Blueprints & Syllabus Standards',
      category: 'curriculum_syllabus',
      description: 'Curriculum frameworks (NERDC, Cambridge IGCSE, British National, IB MYP, Common Core) with structured units and topics.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/academics/curriculum/page.tsx',
        typeDefinition: 'types/curriculum.ts',
        mockStore: 'lib/mock/academicsData.ts',
      },
      tenantRoutes: ['/academics/curriculum'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Visibility into active curriculum frameworks, syllabus versioning, and blueprint coverage rates.',
      knownLimitations: ['Curriculum blueprints are tenant-editable; global standards library is planned.'],
      moduleRegistryRef: 'sub_academics_curriculum',
      futureBackendDependency: 'Curriculum blueprint versioning engine with hierarchical topic JSON trees.',
    },
    {
      id: 'cap_schemes_of_work',
      name: 'Weekly Schemes of Work & Pedagogical Approvals',
      category: 'curriculum_syllabus',
      description: 'Term-by-term weekly instructional plans linking blueprint topics to learning objectives, teaching methods, and review decisions.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/academics/schemes-of-work/page.tsx',
        typeDefinition: 'types/schemesOfWork.ts',
        mockStore: 'lib/mock/academicsData.ts',
      },
      tenantRoutes: ['/academics/schemes-of-work'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Oversight of scheme submission, approval rates, and revision backlogs without Super-Admin intervention.',
      knownLimitations: ['Approvals must be executed by school HOD/Principal, not Super-Admin.'],
      moduleRegistryRef: 'sub_academics_schemes_of_work',
      futureBackendDependency: 'Scheme of work state machine and immutable revision audit trail.',
    },
    {
      id: 'cap_timetables_scheduling',
      name: 'Master Timetable Engine & Bell Schedules',
      category: 'timetables_scheduling',
      description: 'Period-by-period bell schedules, operating days, automated slot matrices for classes, rooms, and teachers.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/timetables/page.tsx',
        typeDefinition: 'types/timetable.ts',
        mockStore: 'lib/mock/tenantData.ts',
      },
      tenantRoutes: ['/timetables', '/timetables/builder', '/timetables/classes', '/timetables/rooms'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Monitoring published versus draft timetable status and operational readiness.',
      knownLimitations: ['Genetic schedule auto-generation algorithm is simulated.'],
      moduleRegistryRef: 'mod_timetables',
      futureBackendDependency: 'Async timetable scheduling service with constraint satisfaction solvers.',
    },
    {
      id: 'cap_timetable_conflicts',
      name: 'Timetable Conflict Detection & Validation',
      category: 'timetables_scheduling',
      description: 'Real-time multi-dimensional conflict detection across teacher overlaps, room clashes, and class double-bookings.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/timetables/conflicts/page.tsx',
        typeDefinition: 'types/timetable.ts',
      },
      tenantRoutes: ['/timetables/conflicts'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Identifying unresolved critical and warning conflicts across tenant schedules.',
      knownLimitations: ['Platform displays aggregate conflict counts; resolution is handled by school administrators.'],
      moduleRegistryRef: 'sub_timetables_conflicts',
      futureBackendDependency: 'Server-side schedule conflict verification queries on slot insertion.',
    },
    {
      id: 'cap_lesson_notes',
      name: 'Structured Lesson Notes & Pedagogical Authoring',
      category: 'teaching_pedagogy',
      description: 'Bloom-taxonomy aligned structured lesson preparation, learning objectives, instructional methods, and review workflows.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/academics/lesson-notes/page.tsx',
        typeDefinition: 'types/lessonNotes.ts',
      },
      tenantRoutes: ['/academics/lesson-notes'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Aggregated compliance metrics across draft, submitted, approved, and overdue lesson notes without exposing text content.',
      knownLimitations: ['Content is confidential to the school faculty; Super-Admin sees aggregate metrics only.'],
      moduleRegistryRef: 'sub_academics_lesson_notes',
      futureBackendDependency: 'Rich-text pedagogical content persistence and HOD review workflow API.',
    },
    {
      id: 'cap_daily_lesson_plans',
      name: 'Daily Lesson Plans & Instructional Delivery Tracker',
      category: 'teaching_pedagogy',
      description: 'Day-to-day instructional delivery records tracking taught topics, missed lessons, reasons for partial delivery, and follow-ups.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/academics/daily-plans/page.tsx',
        typeDefinition: 'types/dailyLessonPlans.ts',
      },
      tenantRoutes: ['/academics/daily-plans'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Delivery verification rates and aggregate missed lesson indicators.',
      knownLimitations: ['Classroom observations and attendance notes are minimized.'],
      moduleRegistryRef: 'sub_academics_daily_plans',
      futureBackendDependency: 'Instructional delivery log store with attendance synchronization.',
    },
    {
      id: 'cap_assignments_coursework',
      name: 'Coursework, Assignments & Learning Activities',
      category: 'teaching_pedagogy',
      description: 'LMS coursework creation, assignment deadlines, submission portals, and teacher feedback.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/learning/assignments/page.tsx',
        typeDefinition: 'types/learning.ts',
      },
      tenantRoutes: ['/assignments', '/learning/assignments'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Feature entitlement and active coursework volume indicators; zero student submission exposure.',
      knownLimitations: ['Route /assignments automatically redirects to /learning/assignments.'],
      moduleRegistryRef: 'sub_learning_assignments',
      futureBackendDependency: 'LMS submission storage, plagiarism checking hooks, and grading pipelines.',
    },
    {
      id: 'cap_examinations_assessments',
      name: 'Examination Periods & Continuous Assessment',
      category: 'assessment_grading',
      description: 'Midterm, final, mock, and national examination periods, multi-component assessment definitions, and weightings.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/assessments/page.tsx',
        typeDefinition: 'types/examinations.ts',
      },
      tenantRoutes: ['/examinations', '/examinations/assessments', '/examinations/periods'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Monitoring active examination periods and scheduled assessment volume.',
      knownLimitations: ['Super-Admin cannot schedule or modify school exam periods.'],
      moduleRegistryRef: 'mod_examinations',
      futureBackendDependency: 'Assessment configuration schemas and weight-sum validation engines.',
    },
    {
      id: 'cap_grading_scales',
      name: 'Configurable Grading Scales & GPA Standards',
      category: 'assessment_grading',
      description: 'Customizable grade bands (A+, A, B, C, D, F), percentage ranges, GPA 4.0/5.0 scales, passing thresholds, and honors designations.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/grading/page.tsx',
        typeDefinition: 'types/examinations.ts',
      },
      tenantRoutes: ['/examinations/grading'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Validating that schools have defined active grading scales before publishing results.',
      knownLimitations: ['Multi-scale blending per department is configured at tenant level.'],
      moduleRegistryRef: 'sub_examinations_grading',
      futureBackendDependency: 'Tenant grading scale definitions and grade-point derivation services.',
    },
    {
      id: 'cap_report_cards',
      name: 'Official Report Cards & Result Publication',
      category: 'reporting_continuity',
      description: 'Student academic report card generation, digital verification codes, printable templates, and publication status controls.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/report-cards/page.tsx',
        typeDefinition: 'types/examinations.ts',
      },
      tenantRoutes: ['/examinations/report-cards', '/results'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Readiness evaluation of report card templates and publication progress; zero student marks exposed.',
      knownLimitations: ['PDF generation happens client-side or via headless browser worker.'],
      moduleRegistryRef: 'sub_examinations_report_cards',
      futureBackendDependency: 'Batch report-card compilation worker and cryptographically signed publication hashes.',
    },
    {
      id: 'cap_broadsheets',
      name: 'Master Broadsheets & Cohort Matrix Analysis',
      category: 'reporting_continuity',
      description: 'Composite class-wide broadsheets mapping all students across all subjects with ranking, cohort averages, and pass percentages.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/broadsheet/page.tsx',
        typeDefinition: 'types/broadsheet.ts',
      },
      tenantRoutes: ['/examinations/broadsheet'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Monitoring broadsheet generation readiness and moderation completion.',
      knownLimitations: ['Detailed individual scores are restricted to tenant faculty.'],
      moduleRegistryRef: 'sub_examinations_broadsheet',
      futureBackendDependency: 'High-performance matrix pivot queries for class cohort results.',
    },
    {
      id: 'cap_transcripts',
      name: 'Cumulative Academic Transcripts & Historical Records',
      category: 'reporting_continuity',
      description: 'Multi-year student transcripts, cumulative GPA, transfer credits, and official issuance verification codes.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/transcripts/page.tsx',
        typeDefinition: 'types/transcripts.ts',
      },
      tenantRoutes: ['/examinations/transcripts'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Transcript capability enablement and template readiness monitoring.',
      knownLimitations: ['Official transcript seal and cryptographic signing require backend keys.'],
      moduleRegistryRef: 'sub_examinations_transcripts',
      futureBackendDependency: 'Multi-session cumulative GPA aggregation and immutable transcript audit registry.',
    },
    {
      id: 'cap_promotion_rules',
      name: 'Academic Promotion & Cohort Progression Rules',
      category: 'reporting_continuity',
      description: 'Rule-based promotion evaluation: minimum average %, mandatory subjects (Math, English), attendance thresholds, and trial promotion.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/academics/promotion/page.tsx',
        typeDefinition: 'types/promotionRules.ts',
      },
      tenantRoutes: ['/academics/promotion'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Oversight of configured promotion criteria and transition readiness between academic cycles.',
      knownLimitations: ['Super-Admin cannot execute student promotions.'],
      moduleRegistryRef: 'sub_academics_promotion',
      futureBackendDependency: 'Batch promotion transaction engine with rollback capabilities.',
    },
  ];
}

// --------------------------------------------------------------------------
// 2. PERIOD & CALENDAR VALIDATION LOGIC
// --------------------------------------------------------------------------

export interface DateValidationResult {
  isValid: boolean;
  code: 'valid' | 'invalid_order' | 'overlapping_periods';
  errors: string[];
}

export function validateAcademicYearPeriods(year: AcademicYearConfigSummary): DateValidationResult {
  const errors: string[] = [];

  // Check 1: Year Start Date must precede Year End Date
  if (year.startDate && year.endDate && year.startDate >= year.endDate) {
    errors.push(`Academic Year "${year.name}" start date (${year.startDate}) must precede end date (${year.endDate}).`);
    return {
      isValid: false,
      code: 'invalid_order',
      errors,
    };
  }

  // Check 2: Check each period within the year
  if (year.periods && year.periods.length > 0) {
    for (const period of year.periods) {
      if (period.startDate && period.endDate && period.startDate >= period.endDate) {
        errors.push(`Period "${period.name}" start date (${period.startDate}) must precede end date (${period.endDate}).`);
      }
    }

    // Check 3: Period sequence overlap detection
    const sortedPeriods = [...year.periods].sort((a, b) => a.sequence - b.sequence);
    for (let i = 0; i < sortedPeriods.length - 1; i++) {
      const current = sortedPeriods[i];
      const next = sortedPeriods[i + 1];

      if (current.endDate && next.startDate && current.endDate > next.startDate) {
        errors.push(`Overlapping period dates detected: "${current.name}" ends on ${current.endDate} after "${next.name}" starts on ${next.startDate}.`);
      }
    }
  }

  if (errors.length > 0) {
    const isOverlap = errors.some((e) => e.includes('Overlapping'));
    return {
      isValid: false,
      code: isOverlap ? 'overlapping_periods' : 'invalid_order',
      errors,
    };
  }

  return {
    isValid: true,
    code: 'valid',
    errors: [],
  };
}

// --------------------------------------------------------------------------
// 3. DETERMINISTIC READINESS EVALUATOR
// --------------------------------------------------------------------------

export function evaluateAcademicReadiness(
  org: Pick<
    OrganizationAcademicOversight,
    | 'reportingStatus'
    | 'academicSession'
    | 'activePeriod'
    | 'academicYears'
    | 'structure'
    | 'curriculum'
    | 'timetables'
    | 'assessmentAndReporting'
    | 'pedagogicalWorkflows'
  >
): AcademicReadinessEvaluation {
  // If organization is dormant or not provisioned
  if (org.reportingStatus === 'not_provisioned' || org.reportingStatus === 'dormant') {
    return {
      score: 0,
      level: 'unprovisioned',
      totalChecklistItems: 8,
      completedChecklistItems: 0,
      unknownChecklistItems: 0,
      items: [
        {
          key: 'academic_session_active',
          title: 'Active Academic Session',
          description: 'A current academic session is configured and marked active.',
          category: 'calendar_structure',
          isComplete: false,
          severityIfMissing: 'blocker',
          details: 'Organization is dormant or not yet provisioned for academic tracking.',
        },
      ],
      blockers: ['Organization is dormant or not yet provisioned for academic tracking.'],
      warnings: [],
    };
  }

  const items: AcademicReadinessItem[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];

  // Item 1: Active Academic Session Configured
  const hasActiveSession = Boolean(
    org.academicSession && org.academicYears && org.academicYears.some((y) => y.isCurrent && y.status === 'ACTIVE')
  );
  items.push({
    key: 'academic_session_active',
    title: 'Active Academic Session Configured',
    description: 'An active academic school year (e.g. 2026/2027) is designated and in progress.',
    category: 'calendar_structure',
    isComplete: hasActiveSession,
    severityIfMissing: 'blocker',
    details: hasActiveSession ? `Current: ${org.academicSession}` : 'No active academic session found.',
  });
  if (!hasActiveSession) {
    blockers.push('No active academic session configured for current cycle.');
  }

  // Item 2: Current Academic Period (Term / Semester)
  const hasCurrentPeriod = Boolean(
    org.activePeriod && org.activePeriod !== 'None' && org.activePeriod !== ''
  );
  items.push({
    key: 'current_period_active',
    title: 'Current Academic Period Designated',
    description: 'An active term, semester, or quarter is running with valid date boundaries.',
    category: 'calendar_structure',
    isComplete: hasCurrentPeriod,
    severityIfMissing: 'blocker',
    details: hasCurrentPeriod ? `Active: ${org.activePeriod}` : 'No active academic term or semester designated.',
  });
  if (!hasCurrentPeriod) {
    blockers.push('Active academic period (term/semester) is not designated.');
  }

  // Item 3: Classes & Subjects Structure
  const hasClassesAndSubjects =
    org.structure && org.structure.totalClasses > 0 && org.structure.totalSubjects > 0;
  items.push({
    key: 'classes_subjects_structure',
    title: 'Class Cohorts & Subject Catalog Defined',
    description: 'Academic grade cohorts, arms/sections, and subjects are configured.',
    category: 'calendar_structure',
    isComplete: hasClassesAndSubjects,
    severityIfMissing: 'blocker',
    details: hasClassesAndSubjects
      ? `${org.structure.totalClasses} classes, ${org.structure.totalSubjects} subjects.`
      : 'Classes or subject catalog missing.',
  });
  if (!hasClassesAndSubjects) {
    blockers.push('Class cohorts or curriculum subjects are not configured.');
  }

  // Item 4: Teacher Subject Allocation Completeness (>= 80%)
  const allocationRate = org.structure?.teacherAllocationCompletenessPercentage ?? 0;
  const isAllocationAdequate = allocationRate >= 80;
  items.push({
    key: 'teacher_allocation_completeness',
    title: 'Faculty Subject Allocation Adequacy (>= 80%)',
    description: 'Instructors are formally assigned to curriculum subjects across class cohorts.',
    category: 'teaching_pedagogy',
    isComplete: isAllocationAdequate,
    severityIfMissing: 'warning',
    details: `${allocationRate}% allocated (${org.structure?.unassignedSubjectsCount ?? 0} unassigned).`,
  });
  if (!isAllocationAdequate) {
    warnings.push(`Teacher subject allocation is below threshold (${allocationRate}% completed).`);
  }

  // Item 5: Curriculum Blueprints & Schemes of Work
  const hasCurriculum = Boolean(
    org.curriculum &&
      org.curriculum.schemesTotal > 0 &&
      org.curriculum.schemesApprovedCount > 0
  );
  items.push({
    key: 'curriculum_schemes_active',
    title: 'Curriculum & Approved Schemes of Work',
    description: 'Approved schemes of work exist for subjects taught in the active period.',
    category: 'curriculum_syllabus',
    isComplete: hasCurriculum,
    severityIfMissing: 'warning',
    details: hasCurriculum
      ? `${org.curriculum.schemesApprovedCount}/${org.curriculum.schemesTotal} schemes approved.`
      : 'Approved schemes of work missing or in draft only.',
  });
  if (!hasCurriculum) {
    warnings.push('Schemes of work are unapproved or missing for active period subjects.');
  }

  // Item 6: Timetable Published Without Critical Conflicts
  const timetableReady = Boolean(
    org.timetables &&
      org.timetables.timetableStatus === 'PUBLISHED' &&
      org.timetables.criticalConflictsCount === 0
  );
  items.push({
    key: 'timetable_published_no_conflicts',
    title: 'Master Timetable Published (Zero Critical Conflicts)',
    description: 'Master schedule is published and free of severe teacher, room, or class overlaps.',
    category: 'timetables_scheduling',
    isComplete: timetableReady,
    severityIfMissing: 'warning',
    details: org.timetables
      ? `Status: ${org.timetables.timetableStatus}, Critical Conflicts: ${org.timetables.criticalConflictsCount}`
      : 'Timetable unconfigured.',
  });
  if (org.timetables && org.timetables.criticalConflictsCount > 0) {
    blockers.push(`Timetable has ${org.timetables.criticalConflictsCount} unresolved critical conflicts.`);
  } else if (!timetableReady) {
    warnings.push('Master timetable is not published for current session.');
  }

  // Item 7: Grading Scale & Passing Standard Configured
  const hasGradingScale = Boolean(
    org.assessmentAndReporting &&
      org.assessmentAndReporting.gradingScalesCount > 0 &&
      org.assessmentAndReporting.gradingScaleType !== 'NONE'
  );
  items.push({
    key: 'grading_scale_configured',
    title: 'Grading Scale & Passing Marks Defined',
    description: 'An active grading standard with grade bands and passing threshold is active.',
    category: 'assessment_grading',
    isComplete: hasGradingScale,
    severityIfMissing: 'blocker',
    details: hasGradingScale
      ? `Scale: ${org.assessmentAndReporting.defaultGradingScaleName || org.assessmentAndReporting.gradingScaleType}`
      : 'No active grading scale found.',
  });
  if (!hasGradingScale) {
    blockers.push('No active grading scale or pass mark configured.');
  }

  // Item 8: Report Card & Academic Reporting Ready
  const reportingReady = Boolean(
    org.assessmentAndReporting &&
      org.assessmentAndReporting.reportCardTemplateReady &&
      (org.assessmentAndReporting.academicReportingReadiness === 'ready_to_publish' ||
        org.assessmentAndReporting.academicReportingReadiness === 'in_moderation')
  );
  items.push({
    key: 'reporting_readiness',
    title: 'Official Report Card Template & Publishing Readiness',
    description: 'Report card template configured and ready for term result compilation.',
    category: 'reporting_continuity',
    isComplete: reportingReady,
    severityIfMissing: 'warning',
    details: org.assessmentAndReporting
      ? `Status: ${org.assessmentAndReporting.academicReportingReadiness}`
      : 'Reporting setup incomplete.',
  });
  if (!reportingReady) {
    warnings.push('Report card template or broadsheet moderation pipeline is incomplete.');
  }

  const completedCount = items.filter((i) => i.isComplete).length;
  const score = Math.round((completedCount / items.length) * 100);

  let level: 'complete' | 'attention_required' | 'critical_blocker' = 'complete';
  if (blockers.length > 0) {
    level = 'critical_blocker';
  } else if (score < 80 || warnings.length > 0) {
    level = 'attention_required';
  }

  return {
    score,
    level,
    totalChecklistItems: items.length,
    completedChecklistItems: completedCount,
    unknownChecklistItems: 0,
    items,
    blockers,
    warnings,
  };
}

// --------------------------------------------------------------------------
// 4. TIMETABLE CONFLICT DETECTOR
// --------------------------------------------------------------------------

export interface RawTimetableSlot {
  id: string;
  teacherId: string;
  teacherName?: string;
  room: string;
  classId: string;
  className?: string;
  dayOfWeek: string;
  startTime: string; // HH:mm e.g. "08:00"
  endTime: string; // HH:mm e.g. "08:50"
}

export function detectTimetableConflicts(slots: RawTimetableSlot[]): TimetableConflictItem[] {
  const conflicts: TimetableConflictItem[] = [];

  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i];
      const b = slots[j];

      // Must be on the same day to conflict
      if (a.dayOfWeek !== b.dayOfWeek) continue;

      // Check time overlap: (StartA < EndB) && (EndA > StartB)
      const hasTimeOverlap = a.startTime < b.endTime && a.endTime > b.startTime;
      if (!hasTimeOverlap) continue;

      // Conflict Type 1: Teacher Overlap (Same teacher, multiple classes/rooms)
      if (a.teacherId && b.teacherId && a.teacherId === b.teacherId) {
        conflicts.push({
          id: `conflict_teacher_${a.id}_${b.id}`,
          type: 'TEACHER_OVERLAP',
          severity: 'CRITICAL',
          message: `Teacher "${a.teacherName || a.teacherId}" double-booked on ${a.dayOfWeek} between ${a.startTime}-${a.endTime}.`,
          dayOfWeek: a.dayOfWeek,
          timeRange: `${a.startTime} - ${a.endTime}`,
          affectedEntity: a.teacherName || a.teacherId,
        });
      }

      // Conflict Type 2: Room Overlap (Same room, multiple classes)
      if (a.room && b.room && a.room.trim().toLowerCase() === b.room.trim().toLowerCase()) {
        conflicts.push({
          id: `conflict_room_${a.id}_${b.id}`,
          type: 'ROOM_OVERLAP',
          severity: 'CRITICAL',
          message: `Room "${a.room}" double-booked on ${a.dayOfWeek} for classes ${a.className || a.classId} and ${b.className || b.classId}.`,
          dayOfWeek: a.dayOfWeek,
          timeRange: `${a.startTime} - ${a.endTime}`,
          affectedEntity: a.room,
        });
      }

      // Conflict Type 3: Class Overlap (Same class scheduled for multiple subjects concurrently)
      if (a.classId && b.classId && a.classId === b.classId) {
        conflicts.push({
          id: `conflict_class_${a.id}_${b.id}`,
          type: 'CLASS_OVERLAP',
          severity: 'CRITICAL',
          message: `Class "${a.className || a.classId}" scheduled for concurrent sessions on ${a.dayOfWeek} at ${a.startTime}.`,
          dayOfWeek: a.dayOfWeek,
          timeRange: `${a.startTime} - ${a.endTime}`,
          affectedEntity: a.className || a.classId,
        });
      }
    }
  }

  return conflicts;
}

// --------------------------------------------------------------------------
// 5. DYNAMIC FILTERING
// --------------------------------------------------------------------------

export function filterAcademicOversightData(
  records: OrganizationAcademicOversight[],
  filter: AcademicOversightFilterState
): OrganizationAcademicOversight[] {
  return records.filter((rec) => {
    // Organization filter
    if (filter.organizationId !== 'ALL' && rec.organizationId !== filter.organizationId) {
      return false;
    }

    // Campus filter
    if (filter.campusId !== 'ALL') {
      const hasCampus = rec.campuses?.some((c) => c.campusId === filter.campusId);
      if (!hasCampus) return false;
    }

    // Academic session filter
    if (filter.academicSession !== 'ALL' && rec.academicSession !== filter.academicSession) {
      return false;
    }

    // Active period filter
    if (filter.activePeriod !== 'ALL' && rec.activePeriod !== filter.activePeriod) {
      return false;
    }

    // Readiness level filter
    if (filter.readinessLevel !== 'ALL' && rec.readiness.level !== filter.readinessLevel) {
      return false;
    }

    // Capability category filter
    if (filter.capabilityCategory !== 'ALL') {
      const hasIssueInCategory = rec.dataQualityIssues?.some(
        (iss) => iss.category === filter.capabilityCategory
      );
      const hasRelevantItem = rec.readiness?.items?.some(
        (item) => item.category === filter.capabilityCategory && !item.isComplete
      );
      if (!hasIssueInCategory && !hasRelevantItem) {
        return false;
      }
    }

    // Search query filter
    if (filter.searchQuery.trim()) {
      const query = filter.searchQuery.trim().toLowerCase();
      const matchName = rec.organizationName.toLowerCase().includes(query);
      const matchCode = rec.organizationCode.toLowerCase().includes(query);
      const matchSession = rec.academicSession.toLowerCase().includes(query);
      const matchPeriod = rec.activePeriod.toLowerCase().includes(query);
      const matchFramework = rec.curriculum?.activeFrameworks?.some((f) =>
        f.toLowerCase().includes(query)
      );

      if (!matchName && !matchCode && !matchSession && !matchPeriod && !matchFramework) {
        return false;
      }
    }

    return true;
  });
}

// --------------------------------------------------------------------------
// 6. CANONICAL AGGREGATION COMPUTATION
// --------------------------------------------------------------------------

export function computeAggregatedAcademicMetrics(
  records: OrganizationAcademicOversight[]
): AggregatedAcademicOversightMetrics {
  const totalOrganizations = records.length;

  if (totalOrganizations === 0) {
    return {
      totalOrganizations: 0,
      activeReportingOrganizations: 0,
      dormantOrUnprovisionedOrganizations: 0,
      totalAcademicSessionsConfigured: 0,
      totalActivePeriodsRepresented: 0,
      calendarDataIntegrityRatePercentage: 0,
      averageReadinessScore: 0,
      completeReadinessCount: 0,
      attentionRequiredCount: 0,
      criticalBlockerCount: 0,
      unprovisionedCount: 0,
      totalClassesRepresented: 0,
      totalSubjectsRepresented: 0,
      averageTeacherAllocationPercentage: 0,
      totalUnassignedSubjects: 0,
      totalCurriculumBlueprints: 0,
      totalSchemesApproved: 0,
      averageSchemeApprovalPercentage: 0,
      totalLessonNotesCreated: 0,
      averagePedagogicalCompliancePercentage: 0,
      timetablesPublishedCount: 0,
      timetablesInDraftCount: 0,
      timetablesWithCriticalConflictsCount: 0,
      totalCriticalConflicts: 0,
      totalWarningConflicts: 0,
      gradingScalesConfiguredCount: 0,
      reportCardsReadyCount: 0,
      reportingReadyPercentage: 0,
      criticalIssuesCount: 0,
      warningIssuesCount: 0,
      infoIssuesCount: 0,
    };
  }

  let activeReporting = 0;
  let dormantOrUnprovisioned = 0;
  let totalSessions = 0;
  let totalActivePeriods = 0;
  let validYearsCount = 0;
  let totalYearsEvaluated = 0;

  let totalScoreSum = 0;
  let completeCount = 0;
  let attentionCount = 0;
  let blockerCount = 0;
  let unprovisionedCount = 0;

  let totalClasses = 0;
  let totalSubjects = 0;
  let allocationSum = 0;
  let unassignedSubjectsTotal = 0;

  let totalBlueprints = 0;
  let totalSchemesApproved = 0;
  let totalSchemesSum = 0;
  let totalLessonNotes = 0;
  let pedagogicalComplianceSum = 0;

  let timetablesPublished = 0;
  let timetablesDraft = 0;
  let timetablesCriticalConflictsCount = 0;
  let totalCritConflicts = 0;
  let totalWarnConflicts = 0;

  let gradingScalesConfigured = 0;
  let reportCardsReady = 0;

  let critIssues = 0;
  let warnIssues = 0;
  let infoIssues = 0;

  for (const rec of records) {
    if (rec.reportingStatus === 'active_reporting') {
      activeReporting++;
    } else {
      dormantOrUnprovisioned++;
    }

    // Sessions & Periods
    if (rec.academicYears) {
      totalSessions += rec.academicYears.length;
      totalYearsEvaluated += rec.academicYears.length;
      for (const yr of rec.academicYears) {
        if (yr.dateValidity === 'valid') {
          validYearsCount++;
        }
      }
    }
    if (rec.activePeriod && rec.activePeriod !== 'None') {
      totalActivePeriods++;
    }

    // Readiness
    totalScoreSum += rec.readiness.score;
    if (rec.readiness.level === 'complete') completeCount++;
    else if (rec.readiness.level === 'attention_required') attentionCount++;
    else if (rec.readiness.level === 'critical_blocker') blockerCount++;
    else if (rec.readiness.level === 'unprovisioned') unprovisionedCount++;

    // Structure
    if (rec.structure) {
      totalClasses += rec.structure.totalClasses || 0;
      totalSubjects += rec.structure.totalSubjects || 0;
      allocationSum += rec.structure.teacherAllocationCompletenessPercentage || 0;
      unassignedSubjectsTotal += rec.structure.unassignedSubjectsCount || 0;
    }

    // Curriculum & Pedagogy
    if (rec.curriculum) {
      totalBlueprints += rec.curriculum.blueprintCount || 0;
      totalSchemesApproved += rec.curriculum.schemesApprovedCount || 0;
      totalSchemesSum += rec.curriculum.schemesTotal || 0;
    }
    if (rec.pedagogicalWorkflows) {
      totalLessonNotes += rec.pedagogicalWorkflows.lessonNotesTotal || 0;
      pedagogicalComplianceSum +=
        rec.pedagogicalWorkflows.lessonNoteComplianceRatePercentage || 0;
    }

    // Timetables
    if (rec.timetables) {
      if (rec.timetables.timetableStatus === 'PUBLISHED') timetablesPublished++;
      else if (rec.timetables.timetableStatus === 'DRAFT') timetablesDraft++;

      if (rec.timetables.criticalConflictsCount > 0) {
        timetablesCriticalConflictsCount++;
      }
      totalCritConflicts += rec.timetables.criticalConflictsCount || 0;
      totalWarnConflicts += rec.timetables.warningConflictsCount || 0;
    }

    // Assessment & Reporting
    if (rec.assessmentAndReporting) {
      if (rec.assessmentAndReporting.gradingScalesCount > 0) {
        gradingScalesConfigured++;
      }
      if (rec.assessmentAndReporting.reportCardTemplateReady) {
        reportCardsReady++;
      }
    }

    // Issues
    if (rec.dataQualityIssues) {
      for (const iss of rec.dataQualityIssues) {
        if (iss.severity === 'critical') critIssues++;
        else if (iss.severity === 'warning') warnIssues++;
        else if (iss.severity === 'info') infoIssues++;
      }
    }
  }

  const averageReadinessScore = Math.round(totalScoreSum / totalOrganizations);
  const averageTeacherAllocation = Math.round(allocationSum / totalOrganizations);
  const averageSchemeApproval =
    totalSchemesSum > 0 ? Math.round((totalSchemesApproved / totalSchemesSum) * 100) : 0;
  const averagePedagogicalCompliance = Math.round(pedagogicalComplianceSum / totalOrganizations);
  const reportingReadyPercentage = Math.round((reportCardsReady / totalOrganizations) * 100);
  const calendarDataIntegrityRate =
    totalYearsEvaluated > 0 ? Math.round((validYearsCount / totalYearsEvaluated) * 100) : 100;

  return {
    totalOrganizations,
    activeReportingOrganizations: activeReporting,
    dormantOrUnprovisionedOrganizations: dormantOrUnprovisioned,
    totalAcademicSessionsConfigured: totalSessions,
    totalActivePeriodsRepresented: totalActivePeriods,
    calendarDataIntegrityRatePercentage: calendarDataIntegrityRate,
    averageReadinessScore,
    completeReadinessCount: completeCount,
    attentionRequiredCount: attentionCount,
    criticalBlockerCount: blockerCount,
    unprovisionedCount: unprovisionedCount,
    totalClassesRepresented: totalClasses,
    totalSubjectsRepresented: totalSubjects,
    averageTeacherAllocationPercentage: averageTeacherAllocation,
    totalUnassignedSubjects: unassignedSubjectsTotal,
    totalCurriculumBlueprints: totalBlueprints,
    totalSchemesApproved,
    averageSchemeApprovalPercentage: averageSchemeApproval,
    totalLessonNotesCreated: totalLessonNotes,
    averagePedagogicalCompliancePercentage: averagePedagogicalCompliance,
    timetablesPublishedCount: timetablesPublished,
    timetablesInDraftCount: timetablesDraft,
    timetablesWithCriticalConflictsCount: timetablesCriticalConflictsCount,
    totalCriticalConflicts: totalCritConflicts,
    totalWarningConflicts: totalWarnConflicts,
    gradingScalesConfiguredCount: gradingScalesConfigured,
    reportCardsReadyCount: reportCardsReady,
    reportingReadyPercentage,
    criticalIssuesCount: critIssues,
    warningIssuesCount: warnIssues,
    infoIssuesCount: infoIssues,
  };
}

// --------------------------------------------------------------------------
// 7. SELECTABLE CAMPUSES RESOLVER
// --------------------------------------------------------------------------

export function getSelectableCampuses(
  records: OrganizationAcademicOversight[],
  selectedOrgId: string
): Array<{ id: string; name: string; code: string }> {
  if (selectedOrgId === 'ALL') {
    // Return all campuses from initial campus definitions
    return INITIAL_CAMPUSES.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
    }));
  }

  const org = records.find((r) => r.organizationId === selectedOrgId);
  if (!org || !org.campuses) return [];

  return org.campuses.map((c) => ({
    id: c.campusId,
    name: c.campusName,
    code: c.campusCode,
  }));
}

// --------------------------------------------------------------------------
// 8. REFERENTIAL INTEGRITY AUDIT
// --------------------------------------------------------------------------

export function validateReferentialIntegrity(records: OrganizationAcademicOversight[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const validOrgIds = new Set(INITIAL_ORGANIZATIONS.map((o) => o.id));
  const validCampusIds = new Set(INITIAL_CAMPUSES.map((c) => c.id));

  for (const rec of records) {
    if (!validOrgIds.has(rec.organizationId)) {
      errors.push(`Record references unknown organizationId: "${rec.organizationId}"`);
    }

    if (rec.campuses) {
      for (const campus of rec.campuses) {
        if (!validCampusIds.has(campus.campusId)) {
          errors.push(
            `Organization "${rec.organizationId}" references unmapped campusId: "${campus.campusId}"`
          );
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
