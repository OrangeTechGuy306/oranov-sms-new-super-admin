/**
 * Phase E-09.10: Examinations, CBT & Assessment Governance Evaluator & Domain Logic
 * 
 * Provides pure mathematical rollups, multi-dimensional filtering, 8-point canonical
 * readiness evaluation, timetable conflict detection, referential integrity verification,
 * and capability inventory definitions.
 */

import {
  OrganizationExamGovernance,
  ExamGovernanceFilterState,
  AggregatedExamGovernanceMetrics,
  ExamReadinessEvaluation,
  ExamReadinessLevel,
  ExamReadinessCheckItem,
  ExamCapabilityItem,
  ExamTimetableConflictItem,
} from '../types/examination-governance';
import { INITIAL_ORGANIZATIONS, INITIAL_CAMPUSES } from '../data/initial-data';

// -------------------------------------------------------------
// 1. 8-POINT CANONICAL EXAMINATION READINESS EVALUATOR
// -------------------------------------------------------------

export function evaluateExamReadiness(
  org: Partial<OrganizationExamGovernance>
): ExamReadinessEvaluation {
  // If organization is unprovisioned or inactive, return not_applicable / unprovisioned
  if (org.lifecycleStatus === 'archived' || org.lifecycleStatus === 'inactive') {
    return {
      overallScore: 0,
      level: 'not_applicable',
      checks: [],
      passedChecksCount: 0,
      totalApplicableChecks: 0,
      criticalBlockersCount: 0,
      warningsCount: 0,
    };
  }

  const checks: ExamReadinessCheckItem[] = [];

  // 1. Active Academic Period
  const hasActiveSession = Boolean(org.academicSession && org.academicSession !== 'NONE');
  const hasActivePeriod = Boolean(org.activePeriod && org.activePeriod !== 'NONE');
  checks.push({
    id: 'ACTIVE_ACADEMIC_PERIOD',
    name: 'Active Academic Session & Term',
    category: 'Calendar Prerequisites',
    description: 'Requires an active academic session and designated current term/semester.',
    whyItMatters: 'Assessments cannot be scheduled or weighted without an authoritative calendar context.',
    sourceCapability: 'cap_academic_calendar',
    isSatisfied: hasActiveSession && hasActivePeriod,
    isBlocker: true,
    status: hasActiveSession && hasActivePeriod ? 'passed' : 'failed',
    message: hasActiveSession && hasActivePeriod
      ? `Active calendar configured: ${org.academicSession} — ${org.activePeriod}`
      : 'No active academic session or current term designated.',
    remediationGuidance: 'Configure an active session and current academic period in Academic Settings.',
    evidenceSource: 'verified',
  });

  // 2. Class & Subject Mapping
  const hasAssessments = Boolean(org.assessments && org.assessments.totalAssessments > 0);
  checks.push({
    id: 'CLASS_SUBJECT_MAPPING',
    name: 'Class & Subject Curriculum Mapping',
    category: 'Academic Structure',
    description: 'Academic departments, classes, and examinable subjects configured.',
    whyItMatters: 'Every assessment component must resolve to an authorized class cohort and subject code.',
    sourceCapability: 'cap_academic_structure',
    isSatisfied: hasAssessments,
    isBlocker: true,
    status: hasAssessments ? 'passed' : 'failed',
    message: hasAssessments
      ? `${org.assessments?.totalAssessments} assessment components mapped to subjects.`
      : 'Zero assessment components or subject assignments configured.',
    remediationGuidance: 'Map examinable subjects and classes in Academics configuration.',
    evidenceSource: 'verified',
  });

  // 3. Assessment Types & Weights
  const byType = org.assessments?.byType || {};
  const hasTypes = Object.values(byType).some((val) => (val as number) > 0);
  checks.push({
    id: 'ASSESSMENT_TYPES_WEIGHTS',
    name: 'Assessment Types & Cumulative Weights',
    category: 'Assessment Configuration',
    description: 'Assessment categories (Continuous Assessment, Midterm, Final) configured with percentage weights.',
    whyItMatters: 'Incomplete or unweighted components prevent final terminal result calculation.',
    sourceCapability: 'cap_assessment_weights',
    isSatisfied: hasTypes,
    isBlocker: true,
    status: hasTypes ? 'passed' : 'failed',
    message: hasTypes
      ? 'Configured assessment types: ' + Object.entries(byType).filter(([, v]) => (v as number) > 0).map(([k]) => k).join(', ')
      : 'No assessment types or component weights defined.',
    remediationGuidance: 'Configure assessment types and weights in Examinations > Assessments & Weights.',
    evidenceSource: 'verified',
  });

  // 4. Exam Period Configured
  const hasExamPeriod = (org.examPeriodsCount ?? 0) > 0;
  checks.push({
    id: 'EXAM_PERIOD_CONFIGURED',
    name: 'Examination Period & Series Schedule',
    category: 'Series Governance',
    description: 'Active examination series (Midterm, Terminal Exam, Mock) with valid date boundaries.',
    whyItMatters: 'Defines the official window during which tests, exams, and CBT sessions occur.',
    sourceCapability: 'cap_exam_period_config',
    isSatisfied: hasExamPeriod,
    isBlocker: true,
    status: hasExamPeriod ? 'passed' : 'failed',
    message: hasExamPeriod
      ? `Active exam period: ${org.activeExamPeriodName || 'Configured'} (${org.activeExamPeriodCategory || 'Standard'})`
      : 'No examination period created for the active term.',
    remediationGuidance: 'Create and publish an exam series under Examinations > Exam Periods.',
    evidenceSource: 'verified',
  });

  // 5. Timetable & Room Invigilation
  const timetable = org.timetable;
  const hasSlots = (timetable?.totalSlots ?? 0) > 0;
  const hasConflicts = (timetable?.criticalConflictsCount ?? 0) > 0;
  const unassignedInvigilators = (timetable?.unassignedInvigilatorsCount ?? 0) > 0;
  checks.push({
    id: 'TIMETABLE_ROOM_INVIGILATION',
    name: 'Timetable Scheduling & Invigilation',
    category: 'Scheduling Logistics',
    description: 'Exam slots assigned to venues with verified room capacity and designated invigilators.',
    whyItMatters: 'Unassigned rooms or invigilators cause operational chaos on examination days.',
    sourceCapability: 'cap_exam_timetables',
    isSatisfied: hasSlots && !hasConflicts,
    isBlocker: hasConflicts,
    status: !hasSlots ? 'failed' : hasConflicts ? 'failed' : unassignedInvigilators ? 'warning' : 'passed',
    message: hasConflicts
      ? `Critical timetable clash: ${timetable?.criticalConflictsCount} overlapping slots detected!`
      : unassignedInvigilators
      ? `${timetable?.unassignedInvigilatorsCount} slots lack assigned invigilators.`
      : hasSlots
      ? `${timetable?.totalSlots} exam slots scheduled with 0 critical clashes.`
      : 'Timetable has not yet been built or published.',
    remediationGuidance: hasConflicts
      ? 'Resolve room double-bookings and teacher conflicts in the Exam Timetable editor.'
      : 'Assign invigilators to all scheduled slots before opening examination halls.',
    evidenceSource: 'verified',
  });

  // 6. Grading Scale Configured
  const grading = org.grading;
  const hasGradingScale = Boolean(grading?.isConfigured && grading?.scaleType !== 'NONE');
  checks.push({
    id: 'GRADING_SCALE_CONFIGURED',
    name: 'Grading Scales & Passing Thresholds',
    category: 'Grading Standards',
    description: 'Authoritative grading scale (Percentage, Letter Grade, GPA 4.0/5.0) with defined pass mark.',
    whyItMatters: 'Raw scores cannot be converted into report cards or transcripts without a published scale.',
    sourceCapability: 'cap_grading_scales',
    isSatisfied: hasGradingScale,
    isBlocker: true,
    status: hasGradingScale ? 'passed' : 'failed',
    message: hasGradingScale
      ? `Active scale: ${grading?.scaleName} (${grading?.scaleType}, Pass Mark: ${grading?.passMark}%)`
      : 'No grading scale configured for active classes.',
    remediationGuidance: 'Configure and publish a grading scale under Examinations > Grading Scales.',
    evidenceSource: 'verified',
  });

  // 7. CBT Readiness or Exemption
  const isCbtActive = org.deliveryMode === 'CBT_FULL' || org.deliveryMode === 'CBT_HYBRID';
  const cbtSummary = org.cbt;
  const qbSummary = org.questionBank;
  const cbtReady = !isCbtActive || ((cbtSummary?.totalCbtExams ?? 0) > 0 && (qbSummary?.approvedQuestions ?? 0) >= 20);
  checks.push({
    id: 'CBT_READINESS_OR_EXEMPT',
    name: 'CBT Question Bank & Blueprint Readiness',
    category: 'CBT Operations',
    description: isCbtActive
      ? 'Approved question bank items and published blueprints for digital CBT delivery.'
      : 'Paper-based examination mode (exempt from CBT question bank requirements).',
    whyItMatters: isCbtActive
      ? 'CBT exams cannot be launched without approved questions and validated blueprints.'
      : 'Institution operates paper-based assessment protocols.',
    sourceCapability: 'cap_cbt_delivery_engine',
    isSatisfied: cbtReady,
    isBlocker: isCbtActive,
    status: !isCbtActive ? 'not_applicable' : cbtReady ? 'passed' : 'failed',
    message: !isCbtActive
      ? 'Exempt: School operates exclusively paper-based examinations.'
      : cbtReady
      ? `${qbSummary?.approvedQuestions} approved questions across ${cbtSummary?.totalCbtExams} CBT exams.`
      : `Deficit: Only ${qbSummary?.approvedQuestions || 0} approved questions in bank (min 20 required).`,
    remediationGuidance: 'Review and approve question items in Examinations > CBT Question Bank.',
    evidenceSource: 'verified',
  });

  // 8. Result & Report Card Publication Pipeline
  const results = org.resultsPublication;
  const hasTemplate = Boolean(results?.reportCardTemplateReady);
  checks.push({
    id: 'REPORT_CARD_PIPELINE',
    name: 'Report Card Template & Broadsheet Pipeline',
    category: 'Publishing Readiness',
    description: 'Designated report card template, signature fields, and broadsheet calculation rules.',
    whyItMatters: 'End-of-term results and parent reports cannot be dispatched without a validated template.',
    sourceCapability: 'cap_report_cards_publishing',
    isSatisfied: hasTemplate,
    isBlocker: false,
    status: hasTemplate ? 'passed' : 'warning',
    message: hasTemplate
      ? `Report card template ready: ${results?.templateName || 'Standard Terminal Template'}`
      : 'Report card template not yet verified; broadsheets ready in draft.',
    remediationGuidance: 'Verify report card layout and signature blocks in Examinations > Report Cards.',
    evidenceSource: 'verified',
  });

  const applicableChecks = checks.filter((c) => c.status !== 'not_applicable');
  const passedCount = applicableChecks.filter((c) => c.status === 'passed').length;
  const blockersCount = applicableChecks.filter((c) => c.isBlocker && c.status === 'failed').length;
  const warningsCount = applicableChecks.filter((c) => c.status === 'warning').length;

  const rawScore = applicableChecks.length > 0 ? Math.round((passedCount / applicableChecks.length) * 100) : 0;

  let level: ExamReadinessLevel = 'not_ready';
  if (blockersCount === 0 && rawScore >= 85) {
    level = 'ready';
  } else if (blockersCount <= 1 && rawScore >= 50) {
    level = 'partially_ready';
  } else {
    level = 'not_ready';
  }

  return {
    overallScore: rawScore,
    level,
    checks,
    passedChecksCount: passedCount,
    totalApplicableChecks: applicableChecks.length,
    criticalBlockersCount: blockersCount,
    warningsCount,
  };
}

// -------------------------------------------------------------
// 2. TIMETABLE CONFLICT DETECTOR
// -------------------------------------------------------------

export function detectExamTimetableConflicts(
  slots: Array<{
    id: string;
    room?: string;
    invigilatorId?: string;
    classId?: string;
    examDate: string;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  }>
): ExamTimetableConflictItem[] {
  const conflicts: ExamTimetableConflictItem[] = [];

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i];
      const b = slots[j];

      // Must be on the exact same date
      if (a.examDate !== b.examDate) continue;

      const aStart = timeToMinutes(a.startTime);
      const aEnd = timeToMinutes(a.endTime);
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);

      const isOverlapping = aStart < bEnd && aEnd > bStart;
      if (!isOverlapping) continue;

      // 1. Room Double Booking
      if (a.room && b.room && a.room.trim().toLowerCase() === b.room.trim().toLowerCase()) {
        conflicts.push({
          id: `conf-room-${a.id}-${b.id}`,
          slotId: a.id,
          conflictType: 'ROOM_DOUBLE_BOOKED',
          severity: 'CRITICAL',
          description: `Room "${a.room}" is double-booked between ${a.startTime}-${a.endTime} and ${b.startTime}-${b.endTime}.`,
          examDate: a.examDate,
          timeWindow: `${a.startTime} - ${Math.max(aEnd, bEnd)}`,
          affectedEntities: [a.room, a.id, b.id],
        });
      }

      // 2. Teacher / Invigilator Double Booking
      if (
        a.invigilatorId &&
        b.invigilatorId &&
        a.invigilatorId === b.invigilatorId
      ) {
        conflicts.push({
          id: `conf-invig-${a.id}-${b.id}`,
          slotId: a.id,
          conflictType: 'TEACHER_DOUBLE_BOOKED',
          severity: 'CRITICAL',
          description: `Invigilator "${a.invigilatorId}" is scheduled in two concurrent exam halls.`,
          examDate: a.examDate,
          timeWindow: `${a.startTime} - ${b.endTime}`,
          affectedEntities: [a.invigilatorId, a.id, b.id],
        });
      }

      // 3. Class Cohort Overlap
      if (a.classId && b.classId && a.classId === b.classId) {
        conflicts.push({
          id: `conf-cohort-${a.id}-${b.id}`,
          slotId: a.id,
          conflictType: 'CLASS_COHORT_OVERLAP',
          severity: 'CRITICAL',
          description: `Class "${a.classId}" has two simultaneous examinations scheduled.`,
          examDate: a.examDate,
          timeWindow: `${a.startTime} - ${b.endTime}`,
          affectedEntities: [a.classId, a.id, b.id],
        });
      }
    }
  }

  return conflicts;
}

// -------------------------------------------------------------
// 3. DYNAMIC MULTI-DIMENSIONAL FILTERING ENGINE
// -------------------------------------------------------------

export function filterExamGovernanceData(
  records: OrganizationExamGovernance[],
  filter: ExamGovernanceFilterState
): OrganizationExamGovernance[] {
  return records.filter((org) => {
    // 1. Organization Filter
    if (filter.organizationId !== 'ALL' && org.organizationId !== filter.organizationId) {
      return false;
    }

    // 2. Campus Filter
    if (filter.campusId !== 'ALL') {
      const hasCampus = org.campuses.some((c) => c.campusId === filter.campusId);
      if (!hasCampus) return false;
    }

    // 3. Academic Period Filter
    if (filter.academicPeriod !== 'ALL' && org.activePeriod !== filter.academicPeriod) {
      return false;
    }

    // 4. Assessment Type Filter
    if (filter.assessmentType !== 'ALL') {
      const count = (org.assessments.byType as Record<string, number>)[filter.assessmentType] || 0;
      if (count === 0) return false;
    }

    // 5. Lifecycle Status Filter
    if (filter.lifecycleStatus !== 'ALL') {
      const asms = org.assessments;
      const statusMap: Record<string, number> = {
        SCHEDULED: asms.scheduledCount,
        MARKS_ENTRY: asms.marksEntryCount,
        SUBMITTED: asms.submittedCount,
        UNDER_REVIEW: asms.underReviewCount,
        APPROVED: asms.approvedCount,
        PUBLISHED: asms.publishedCount,
        LOCKED: asms.lockedCount,
      };
      if (!statusMap[filter.lifecycleStatus] || statusMap[filter.lifecycleStatus] === 0) {
        return false;
      }
    }

    // 6. Delivery Mode Filter
    if (filter.deliveryMode !== 'ALL' && org.deliveryMode !== filter.deliveryMode) {
      return false;
    }

    // 7. Readiness Status Filter
    if (filter.readinessStatus !== 'ALL' && org.readiness.level !== filter.readinessStatus) {
      return false;
    }

    // 8. Date Range Filter
    if (filter.startDate && filter.endDate) {
      if (!org.activeExamPeriodDates) {
        return false;
      }
      const pStart = org.activeExamPeriodDates.start;
      const pEnd = org.activeExamPeriodDates.end;
      // Overlap: pStart <= filter.endDate && pEnd >= filter.startDate
      if (pStart > filter.endDate || pEnd < filter.startDate) {
        return false;
      }
    }

    // 9. Full-Text Search
    if (filter.searchQuery && filter.searchQuery.trim() !== '') {
      const q = filter.searchQuery.trim().toLowerCase();
      const matchName = org.organizationName.toLowerCase().includes(q);
      const matchCode = org.organizationCode.toLowerCase().includes(q);
      const matchSubdomain = org.subdomain.toLowerCase().includes(q);
      const matchPeriod = org.activePeriod.toLowerCase().includes(q);
      const matchCampus = org.campuses.some((c) => c.campusName.toLowerCase().includes(q) || c.campusCode.toLowerCase().includes(q));
      if (!matchName && !matchCode && !matchSubdomain && !matchPeriod && !matchCampus) {
        return false;
      }
    }

    return true;
  });
}

// -------------------------------------------------------------
// 4. AGGREGATED METRICS COMPUTATION (Pure Rollup)
// -------------------------------------------------------------

export function computeAggregatedExamMetrics(
  records: OrganizationExamGovernance[]
): AggregatedExamGovernanceMetrics {
  const totalOrgs = records.length;
  if (totalOrgs === 0) {
    return {
      totalOrganizations: 0,
      organizationsWithExams: 0,
      organizationsWithCbt: 0,
      organizationsMarkedReady: 0,
      organizationsAttentionRequired: 0,
      organizationsNotReady: 0,
      scheduledAssessments: 0,
      inProgressAssessments: 0,
      completedAssessments: 0,
      marksEntryAssessments: 0,
      assessmentsAwaitingResults: 0,
      publishedAssessments: 0,
      totalExamSlots: 0,
      timetableConflictsCount: 0,
      unassignedInvigilatorsCount: 0,
      totalCbtExams: 0,
      totalCbtAttempts: 0,
      completedCbtAttempts: 0,
      totalCbtExceptions: 0,
      questionBankTotalQuestions: 0,
      approvedQuestionsCount: 0,
      draftQuestionsCount: 0,
      reportCardTemplatesConfiguredCount: 0,
      averageReadinessScore: 0,
      totalDataQualityIssues: 0,
      criticalIssuesCount: 0,
    };
  }

  let orgsWithExams = 0;
  let orgsWithCbt = 0;
  let orgsReady = 0;
  let orgsAttention = 0;
  let orgsNotReady = 0;

  let scheduledAsms = 0;
  let inProgressAsms = 0;
  let completedAsms = 0;
  let marksEntryAsms = 0;
  let awaitingResultsAsms = 0;
  let publishedAsms = 0;

  let totalSlots = 0;
  let conflictsCount = 0;
  let unassignedInvig = 0;

  let totalCbt = 0;
  let totalAttempts = 0;
  let completedAttempts = 0;
  let totalExceptions = 0;

  let totalQb = 0;
  let approvedQb = 0;
  let draftQb = 0;

  let templatesCount = 0;
  let readinessSum = 0;
  let totalIssues = 0;
  let criticalIssues = 0;

  for (const org of records) {
    if (org.hasExaminationsModule) orgsWithExams++;
    if (org.hasCbtModule) orgsWithCbt++;

    if (org.readiness.level === 'ready') orgsReady++;
    else if (org.readiness.level === 'partially_ready') orgsAttention++;
    else if (org.readiness.level === 'not_ready') orgsNotReady++;

    readinessSum += org.readiness.overallScore;

    // Assessments
    const asms = org.assessments;
    scheduledAsms += asms.scheduledCount;
    marksEntryAsms += asms.marksEntryCount;
    awaitingResultsAsms += asms.underReviewCount + asms.submittedCount;
    publishedAsms += asms.publishedCount;
    completedAsms += asms.approvedCount + asms.publishedCount + asms.lockedCount;

    // In-progress: CBT active + marks entry
    inProgressAsms += (org.cbt?.activeExamsCount || 0) + asms.marksEntryCount;

    // Timetable
    const tt = org.timetable;
    totalSlots += tt.totalSlots;
    conflictsCount += tt.criticalConflictsCount + tt.warningConflictsCount;
    unassignedInvig += tt.unassignedInvigilatorsCount;

    // CBT
    const cbt = org.cbt;
    if (cbt.isEnabled) {
      totalCbt += cbt.totalCbtExams;
      totalAttempts += cbt.totalAttempts;
      completedAttempts += cbt.completedAttempts;
      totalExceptions += cbt.activeExceptionsCount;
    }

    // Question Bank
    const qb = org.questionBank;
    if (qb.isEnabled) {
      totalQb += qb.totalQuestions;
      approvedQb += qb.approvedQuestions;
      draftQb += qb.draftQuestions;
    }

    // Results & Reporting
    if (org.resultsPublication.reportCardTemplateReady) {
      templatesCount++;
    }

    // Issues
    totalIssues += org.dataQualityIssues.length;
    criticalIssues += org.dataQualityIssues.filter((i) => i.severity === 'CRITICAL').length;
  }

  return {
    totalOrganizations: totalOrgs,
    organizationsWithExams: orgsWithExams,
    organizationsWithCbt: orgsWithCbt,
    organizationsMarkedReady: orgsReady,
    organizationsAttentionRequired: orgsAttention,
    organizationsNotReady: orgsNotReady,
    scheduledAssessments: scheduledAsms,
    inProgressAssessments: inProgressAsms,
    completedAssessments: completedAsms,
    marksEntryAssessments: marksEntryAsms,
    assessmentsAwaitingResults: awaitingResultsAsms,
    publishedAssessments: publishedAsms,
    totalExamSlots: totalSlots,
    timetableConflictsCount: conflictsCount,
    unassignedInvigilatorsCount: unassignedInvig,
    totalCbtExams: totalCbt,
    totalCbtAttempts: totalAttempts,
    completedCbtAttempts: completedAttempts,
    totalCbtExceptions: totalExceptions,
    questionBankTotalQuestions: totalQb,
    approvedQuestionsCount: approvedQb,
    draftQuestionsCount: draftQb,
    reportCardTemplatesConfiguredCount: templatesCount,
    averageReadinessScore: Math.round(readinessSum / totalOrgs),
    totalDataQualityIssues: totalIssues,
    criticalIssuesCount: criticalIssues,
  };
}

// -------------------------------------------------------------
// 5. REFERENTIAL INTEGRITY VERIFIER
// -------------------------------------------------------------

export function validateExamReferentialIntegrity(
  records: OrganizationExamGovernance[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const validOrgIds = new Set(INITIAL_ORGANIZATIONS.map((o) => o.id));
  const validCampusMap = new Map<string, string>(); // campusId -> orgId

  for (const campus of INITIAL_CAMPUSES) {
    validCampusMap.set(campus.id, campus.organizationId);
  }

  for (const org of records) {
    if (!validOrgIds.has(org.organizationId)) {
      errors.push(`Invalid organization reference: "${org.organizationId}" is not in INITIAL_ORGANIZATIONS.`);
    }

    for (const campus of org.campuses) {
      if (!validCampusMap.has(campus.campusId)) {
        errors.push(`Invalid campus reference: "${campus.campusId}" under org "${org.organizationId}" is not in INITIAL_CAMPUSES.`);
      } else {
        const owningOrg = validCampusMap.get(campus.campusId);
        if (owningOrg !== org.organizationId) {
          errors.push(`Campus ownership mismatch: campus "${campus.campusId}" belongs to "${owningOrg}" but is mapped under "${org.organizationId}".`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// -------------------------------------------------------------
// 6. CANONICAL CAPABILITY INVENTORY (Linked to Module Registry)
// -------------------------------------------------------------

export function getExamCapabilityInventory(): ExamCapabilityItem[] {
  return [
    {
      id: 'cap_exam_period_config',
      name: 'Exam Periods & Series Schedule',
      category: 'exam_configuration',
      description: 'Configure multi-series exam sessions (Mid-Term, End-of-Term, Mocks) with dates, class cohorts, and published status.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/periods/page.tsx',
        typeDefinition: 'types/examinations.ts',
        componentEntry: 'components/examinations',
        mockStore: 'lib/mock/examinationsData.ts',
      },
      tenantRoutes: ['/examinations/periods'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Aggregate period status, active series, date window validity, and class applicability.',
      knownLimitations: ['Client-side in-memory mock store; real-time lock synchronization requires future backend event bus.'],
      moduleRegistryRef: 'sub_exam_periods',
      futureBackendDependency: 'examination_periods table with session FK, date constraints, and published state transition engine.',
    },
    {
      id: 'cap_assessment_weights',
      name: 'Assessments & Component Weights',
      category: 'exam_configuration',
      description: 'Define assessment components (Homework, Midterm, Final) with maximum scores and percentage contribution to terminal grades.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/assessments/page.tsx',
        typeDefinition: 'types/examinations.ts',
        componentEntry: 'components/examinations/AssessmentModal.tsx',
        mockStore: 'lib/mock/examinationsData.ts',
      },
      tenantRoutes: ['/examinations/assessments'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Component weighting totals (100% check), assessment types distribution, and scheduled counts.',
      knownLimitations: ['Weight sum validation enforced in form; retroactive weight changes require score re-normalization.'],
      moduleRegistryRef: 'sub_exam_assessments',
      futureBackendDependency: 'assessments and assessment_components tables with composite unique keys per subject and class arm.',
    },
    {
      id: 'cap_cbt_authoring',
      name: 'CBT Multi-Format Question Authoring',
      category: 'question_banks',
      description: 'Author, version, and preview questions across 8 interactive formats with rich media, rubrics, and answer keys.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/question-bank/new/page.tsx',
        typeDefinition: 'types/cbtQuestionBank.ts',
        componentEntry: 'components/cbt/QuestionEditor.tsx',
        mockStore: 'lib/mock/questionBankData.ts',
      },
      tenantRoutes: [
        '/examinations/question-bank',
        '/examinations/question-bank/[questionId]',
        '/examinations/question-bank/new',
      ],
      implementationStatus: 'implemented',
      platformOversightScope: 'Total questions in bank, breakdown by type/difficulty, and approval status pipeline.',
      knownLimitations: ['Question answer keys are strictly withheld from platform-level views for privacy and exam integrity.'],
      moduleRegistryRef: 'sub_exam_question_bank',
      futureBackendDependency: 'cbt_questions and cbt_question_versions tables with JSONB contentConfig and full-text search indexes.',
    },
    {
      id: 'cap_question_blueprints',
      name: 'Assessment Blueprints & Taxonomy Allocation',
      category: 'question_banks',
      description: 'Define cognitive taxonomy allocations, topic quotas, difficulty distribution, and blueprint discrepancy detection.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/question-bank/blueprints/page.tsx',
        typeDefinition: 'types/cbtQuestionBank.ts',
        componentEntry: 'components/cbt/BlueprintAllocationModal.tsx',
        mockStore: 'lib/mock/questionBankData.ts',
      },
      tenantRoutes: ['/examinations/question-bank/blueprints'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Blueprint configuration status, target vs selected questions count, and deficit warning indicators.',
      knownLimitations: ['Discrepancy checker evaluates locally against in-memory items.'],
      moduleRegistryRef: 'sub_exam_question_bank',
      futureBackendDependency: 'assessment_blueprints table with topic_allocations and difficulty quotas.',
    },
    {
      id: 'cap_question_collections',
      name: 'Question Collections & Tagging',
      category: 'question_banks',
      description: 'Organize question items into reusable modular packages with multi-class tags and fast export.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/question-bank/collections/page.tsx',
        typeDefinition: 'types/cbtQuestionBank.ts',
        componentEntry: 'components/cbt/CollectionCard.tsx',
        mockStore: 'lib/mock/questionBankData.ts',
      },
      tenantRoutes: ['/examinations/question-bank/collections'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Total collections count and question tagging metadata.',
      knownLimitations: ['Tag taxonomies are tenant-scoped; no cross-school sharing in tenant application.'],
      moduleRegistryRef: 'sub_exam_question_bank',
      futureBackendDependency: 'cbt_question_collections and collection_items mapping table.',
    },
    {
      id: 'cap_cbt_delivery_engine',
      name: 'CBT Exam Delivery & Candidate Experience',
      category: 'cbt_delivery',
      description: 'Timer-enforced candidate test delivery with randomized options, candidate-safe view sanitization, and autosave.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/cbt/attempt/[attemptId]/page.tsx',
        typeDefinition: 'types/cbtExam.ts',
        componentEntry: 'components/cbt/CandidateExamRoom.tsx',
        mockStore: 'lib/mock/cbtExamData.ts',
      },
      tenantRoutes: [
        '/examinations/cbt',
        '/examinations/cbt/[examId]',
        '/examinations/cbt/attempt/[attemptId]',
      ],
      implementationStatus: 'implemented',
      platformOversightScope: 'Candidate attempt counts, completion rates, timeout rates, and delivery mode indicators.',
      knownLimitations: ['Candidate answer keys strictly omitted from Super-Admin views. Client-side timers rely on server verification.'],
      moduleRegistryRef: 'sub_exam_cbt',
      futureBackendDependency: 'cbt_candidate_attempts and cbt_candidate_answers tables with append-only revision logging.',
    },
    {
      id: 'cap_cbt_persistence_recovery',
      name: 'Timer-Derived Session Persistence & Recovery',
      category: 'cbt_delivery',
      description: 'Idempotent answer syncing, localStorage disaster recovery buffer, and seamless resume on network reconnect.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/cbt/attempt/[attemptId]/page.tsx',
        typeDefinition: 'types/cbtExam.ts',
        componentEntry: 'hooks/useCbtCandidateSession.ts',
        mockStore: 'lib/mock/cbtExamData.ts',
      },
      tenantRoutes: ['/examinations/cbt/attempt/[attemptId]'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Aggregate network disconnect and recovery frequency without exposing student identities.',
      knownLimitations: ['Client-side timeout handling verified locally; requires backend authoritative clock for millisecond precision.'],
      moduleRegistryRef: 'sub_exam_cbt',
      futureBackendDependency: 'High-throughput Redis cache for active attempt snapshots and WebSocket reconnect heartbeats.',
    },
    {
      id: 'cap_cbt_exceptions',
      name: 'CBT Operational Exceptions & Proctor Actions',
      category: 'cbt_delivery',
      description: 'Tracks browser focus loss, timeout submissions, save conflicts, and proctor time extension overrides.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/cbt/[examId]/attempts/page.tsx',
        typeDefinition: 'types/cbtExam.ts',
        componentEntry: 'components/cbt/CbtExceptionsTable.tsx',
        mockStore: 'lib/mock/cbtExamData.ts',
      },
      tenantRoutes: ['/examinations/cbt/[examId]/attempts'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Platform-wide exception breakdown by type (Connection Lost, Unfocused, Timeout) to detect connectivity issues.',
      knownLimitations: ['Exceptions recorded via client event listeners; tamper protection requires locked browser integration.'],
      moduleRegistryRef: 'sub_exam_cbt',
      futureBackendDependency: 'cbt_operational_exceptions table with resolution audit fields and supervisor signatures.',
    },
    {
      id: 'cap_cbt_auto_proctoring',
      name: 'Automated Proctoring & AI Biometrics',
      category: 'cbt_delivery',
      description: 'Continuous webcam face tracking, multiple person detection, audio recording, and keystroke biometrics.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/cbt/page.tsx',
        typeDefinition: 'types/cbtExam.ts',
        componentEntry: 'Not implemented in tenant application',
        mockStore: 'None',
      },
      tenantRoutes: [],
      implementationStatus: 'missing',
      platformOversightScope: 'Identified as missing capability; platform correctly displays manual invigilation only.',
      knownLimitations: ['Tenant application relies on human physical invigilation. No automated proctoring exists.'],
      moduleRegistryRef: 'sub_exam_cbt',
      futureBackendDependency: 'Integration with WebRTC streaming servers and compliance with GDPR/FERPA biometrics consent policies.',
    },
    {
      id: 'cap_exam_timetables',
      name: 'Exam Timetable & Venue Allocations',
      category: 'exam_scheduling',
      description: 'Schedule date, time window, hall/room, and invigilator assignments across class arms and subjects.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/timetable/page.tsx',
        typeDefinition: 'types/examinations.ts',
        componentEntry: 'components/examinations/TimetableGrid.tsx',
        mockStore: 'lib/mock/examinationsData.ts',
      },
      tenantRoutes: ['/examinations/timetable'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Total exam slots, room utilization, invigilator assignment percentage, and timetable completeness.',
      knownLimitations: ['Timetable slots managed in client store; publish action updates local status flag.'],
      moduleRegistryRef: 'sub_exam_timetable',
      futureBackendDependency: 'exam_timetable_slots table with venueRoom and invigilatorStaffId foreign keys.',
    },
    {
      id: 'cap_timetable_clash_detection',
      name: 'Multi-Resource Exam Conflict Detection',
      category: 'exam_scheduling',
      description: 'Detects room double-bookings, invigilator teacher clashes, and class cohort concurrency violations.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/timetable/page.tsx',
        typeDefinition: 'types/examinations.ts',
        componentEntry: 'lib/validations/examinationsValidation.ts',
        mockStore: 'lib/mock/examinationsData.ts',
      },
      tenantRoutes: ['/examinations/timetable'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Count and severity of scheduling conflicts across tenant organizations to prevent exam day collisions.',
      knownLimitations: ['Evaluated across slots within an exam period; multi-period cross-calendar clashes evaluated in platform layer.'],
      moduleRegistryRef: 'sub_exam_timetable',
      futureBackendDependency: 'PostgreSQL GiST exclusion constraints on (room_id, tsrange(start_time, end_time)).',
    },
    {
      id: 'cap_marks_entry_workflow',
      name: 'Subject Marks Entry & Corrections',
      category: 'assessment_results',
      description: 'Teacher spreadsheet-style mark entry, attendance recording (Present, Absent, Excused), and mark correction requests.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/marks/page.tsx',
        typeDefinition: 'types/examinations.ts',
        componentEntry: 'components/examinations/MarksEntryTable.tsx',
        mockStore: 'lib/mock/examinationsData.ts',
      },
      tenantRoutes: ['/examinations/marks'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Aggregate marks entry progress (% completed), submission states, and review bottlenecks.',
      knownLimitations: ['Individual student marks and names are strictly hidden from platform view to preserve student privacy.'],
      moduleRegistryRef: 'sub_exam_marks',
      futureBackendDependency: 'student_marks and mark_correction_records tables with cell-level change history.',
    },
    {
      id: 'cap_grading_scales',
      name: 'Configurable Grading Standards & Bands',
      category: 'assessment_results',
      description: 'Define percentage bands, letter grades (A, B, C), grade points (4.0/5.0), and pass/distinction marks.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/grading/page.tsx',
        typeDefinition: 'types/examinations.ts',
        componentEntry: 'components/examinations/GradingScaleModal.tsx',
        mockStore: 'lib/mock/examinationsData.ts',
      },
      tenantRoutes: ['/examinations/grading'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Scale type, pass threshold, bands distribution, and active default scale verification.',
      knownLimitations: ['Scales defined per organization; multi-curriculum schools require distinct scale assignments per class.'],
      moduleRegistryRef: 'sub_exam_grading',
      futureBackendDependency: 'grading_scales and grade_bands tables with contiguous, non-overlapping min/max checks.',
    },
    {
      id: 'cap_results_moderation',
      name: 'Results Moderation & Leadership Approval',
      category: 'results_publication',
      description: 'Formal moderation workflow (Draft -> Saved -> Submitted -> Under Review -> Approved -> Published -> Locked).',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/results/page.tsx',
        typeDefinition: 'types/examinations.ts',
        componentEntry: 'components/examinations/ResultsApprovalBar.tsx',
        mockStore: 'lib/mock/examinationsData.ts',
      },
      tenantRoutes: ['/examinations/results', '/results'],
      implementationStatus: 'implemented',
      platformOversightScope: 'Workflow pipeline counts (Under Review, Approved, Published) and approval velocity.',
      knownLimitations: ['Super-Admin interface observes state without bypassing tenant principal approval authority.'],
      moduleRegistryRef: 'sub_results_moderation',
      futureBackendDependency: 'results_approvals audit table with cryptographic approval timestamp and officer user ID.',
    },
    {
      id: 'cap_report_cards_publishing',
      name: 'Terminal Report Cards & Master Broadsheets',
      category: 'results_publication',
      description: 'Generate PDF report cards with template branding, attendance statistics, teacher comments, and class broadsheet grids.',
      tenantSourceEvidence: {
        routePath: 'app/(tenant)/examinations/report-cards/page.tsx',
        typeDefinition: 'types/examinations.ts',
        componentEntry: 'components/examinations/ReportCardPreview.tsx',
        mockStore: 'lib/mock/examinationsData.ts',
      },
      tenantRoutes: [
        '/examinations/report-cards',
        '/examinations/broadsheet',
        '/examinations/transcripts',
      ],
      implementationStatus: 'implemented',
      platformOversightScope: 'Template readiness, publication status (Unpublished, Approved, Published), and broadsheet status.',
      knownLimitations: ['Batch PDF generation rendered client-side; high-volume school graduation requires serverless rendering queue.'],
      moduleRegistryRef: 'sub_results_report_cards',
      futureBackendDependency: 'report_card_documents table with S3 artifact pointers and digital verification QR codes.',
    },
  ];
}
