/**
 * Phase E-09.9: Academics, Curriculum & Teaching Oversight Domain Contracts
 * 
 * Defines platform-level, privacy-preserving, organization-aggregated contracts
 * for academic year/term configuration, curriculum blueprints, schemes of work,
 * timetables, teaching workflows, grading scales, assessment and reporting readiness.
 * 
 * Strict Constraint: Zero student-level Personally Identifiable Information (PII) is exposed.
 * All metrics are derived deterministically from canonical organization structures.
 */

import { SchoolClassification, OrganizationLifecycleStatus } from './organizations';

export type AcademicReportingStatus = 
  | 'active_reporting' 
  | 'dormant' 
  | 'not_provisioned' 
  | 'unverified';

export type AcademicSessionStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export type AcademicPeriodType = 'TERM' | 'SEMESTER' | 'QUARTER' | 'CUSTOM';

export type AcademicPeriodStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export type CurriculumFrameworkKey =
  | 'NERDC'
  | 'CAMBRIDGE_IGCSE'
  | 'BRITISH_NATIONAL'
  | 'IB_MYP'
  | 'AMERICAN_COMMON_CORE'
  | 'CUSTOM';

export type SchemeWorkflowStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'RETURNED_FOR_REVISION'
  | 'REJECTED'
  | 'ARCHIVED';

export type TimetableStatusKey =
  | 'PUBLISHED'
  | 'SUBMITTED'
  | 'DRAFT'
  | 'ARCHIVED'
  | 'NOT_CONFIGURED';

export type TimetableConflictTypeKey =
  | 'TEACHER_OVERLAP'
  | 'CLASS_OVERLAP'
  | 'ROOM_OVERLAP'
  | 'INVALID_TIME'
  | 'UNAUTHORIZED_TEACHER'
  | 'OUTSIDE_PERIOD';

export type ConflictSeverityKey = 'CRITICAL' | 'WARNING';

export type GradingScaleTypeKey =
  | 'PERCENTAGE'
  | 'LETTER_GRADE'
  | 'GPA_4'
  | 'GPA_5'
  | 'CUSTOM'
  | 'NONE';

export type AcademicReadinessLevel =
  | 'complete'
  | 'attention_required'
  | 'critical_blocker'
  | 'unprovisioned';

export type AcademicCapabilityImplementationStatus =
  | 'implemented'
  | 'partial'
  | 'planned'
  | 'missing'
  | 'unknown';

export type AcademicCapabilityCategory =
  | 'calendar_structure'
  | 'curriculum_syllabus'
  | 'timetables_scheduling'
  | 'teaching_pedagogy'
  | 'assessment_grading'
  | 'reporting_continuity';

// -------------------------------------------------------------
// 1. CAPABILITY INVENTORY (Linked to Module Registry E-09.6)
// -------------------------------------------------------------

export interface AcademicCapabilityItem {
  id: string;
  name: string;
  category: AcademicCapabilityCategory;
  description: string;
  parentCapabilityId?: string;
  tenantSourceEvidence: {
    routePath: string;
    typeDefinition: string;
    componentEntry?: string;
    mockStore?: string;
  };
  tenantRoutes: string[];
  implementationStatus: AcademicCapabilityImplementationStatus;
  platformOversightScope: string;
  knownLimitations: string[];
  moduleRegistryRef: string; // e.g. "mod_academics", "sub_academics_curriculum"
  futureBackendDependency: string;
}

// -------------------------------------------------------------
// 2. PERIOD & CALENDAR SUMMARY
// -------------------------------------------------------------

export interface AcademicPeriodSummary {
  id: string;
  name: string;
  type: AcademicPeriodType;
  sequence: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isCurrent: boolean;
  status: AcademicPeriodStatus;
  daysCount?: number;
}

export interface AcademicYearConfigSummary {
  id: string;
  name: string; // e.g. "2026/2027"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: AcademicSessionStatus;
  isCurrent: boolean;
  termsCount: number;
  periods: AcademicPeriodSummary[];
  dateValidity: 'valid' | 'invalid_order' | 'overlapping_periods';
}

// -------------------------------------------------------------
// 3. CURRICULUM, CLASSES & SUBJECTS
// -------------------------------------------------------------

export interface AcademicStructureSummary {
  totalDepartments: number;
  totalClasses: number;
  totalArms: number;
  totalSubjects: number;
  coreSubjectsCount: number;
  electiveSubjectsCount: number;
  totalTeacherAssignments: number;
  unassignedSubjectsCount: number;
  teacherAllocationCompletenessPercentage: number;
  studentCapacity: number;
}

export interface CurriculumOversightSummary {
  blueprintCount: number;
  activeFrameworks: CurriculumFrameworkKey[];
  schemesTotal: number;
  schemesApprovedCount: number;
  schemesUnderReviewCount: number;
  schemesDraftCount: number;
  schemesReturnedCount: number;
  schemesMissingCount: number;
  curriculumReadinessStatus: 'complete' | 'in_progress' | 'not_started' | 'unknown';
  estimatedCoveragePercentage: number;
}

// -------------------------------------------------------------
// 4. TIMETABLE & SCHEDULING
// -------------------------------------------------------------

export interface TimetableConflictItem {
  id: string;
  type: TimetableConflictTypeKey;
  severity: ConflictSeverityKey;
  message: string;
  dayOfWeek?: string;
  timeRange?: string;
  affectedEntity: string; // e.g., "Room 204", "Class G10-A", "Teacher ID staff_042"
}

export interface TimetableOversightSummary {
  timetableStatus: TimetableStatusKey;
  activeTimetableName?: string;
  version: number;
  totalSlotsCount: number;
  criticalConflictsCount: number;
  warningConflictsCount: number;
  teacherConflictCount: number;
  roomConflictCount: number;
  classConflictCount: number;
  conflicts: TimetableConflictItem[];
  bellScheduleConfigured: boolean;
  periodsPerDay: number;
  readinessStatus: 'ready' | 'conflicts_detected' | 'draft_only' | 'unconfigured' | 'unknown';
}

// -------------------------------------------------------------
// 5. TEACHING WORKFLOWS (LESSON NOTES & DAILY PLANS)
// -------------------------------------------------------------

export interface PedagogicalWorkflowsSummary {
  lessonNotesEnabled: boolean;
  lessonNotesTotal: number;
  lessonNotesDraft: number;
  lessonNotesSubmitted: number;
  lessonNotesApproved: number;
  lessonNotesReturned: number;
  lessonNoteComplianceRatePercentage: number;
  dailyPlansTotal: number;
  dailyPlansDelivered: number;
  dailyPlansPartiallyDelivered: number;
  dailyPlansMissed: number;
  deliveryVerificationRatePercentage: number;
  workflowReadinessStatus: 'active_flow' | 'low_compliance' | 'stalled' | 'not_configured';
}

// -------------------------------------------------------------
// 6. ASSESSMENT, GRADING & REPORTING READINESS
// -------------------------------------------------------------

export interface GradeBandSummary {
  grade: string;
  minScore: number;
  maxScore: number;
  gradePoint?: number;
  interpretation: string;
  isPassing: boolean;
}

export interface AssessmentReportingSummary {
  gradingScalesCount: number;
  defaultGradingScaleName?: string;
  gradingScaleType: GradingScaleTypeKey;
  passMark: number;
  bands: GradeBandSummary[];
  activeExamPeriodsCount: number;
  assessmentsScheduledCount: number;
  marksEntryReadinessPercentage: number;
  reportCardTemplatesCount: number;
  reportCardTemplateReady: boolean;
  broadsheetReadinessStatus: 'ready' | 'partial_entry' | 'not_started';
  transcriptsCapabilityStatus: 'implemented' | 'partial' | 'not_configured';
  promotionRulesConfigured: boolean;
  academicReportingReadiness: 'ready_to_publish' | 'in_moderation' | 'setup_incomplete' | 'not_provisioned';
}

// -------------------------------------------------------------
// 7. DATA QUALITY & GOVERNANCE AUDIT RULES
// -------------------------------------------------------------

export type AcademicDataQualitySeverity = 'critical' | 'warning' | 'info';

export type AcademicDataQualityCode =
  | 'MISSING_ACTIVE_SESSION'
  | 'INVALID_DATE_RANGE'
  | 'OVERLAPPING_PERIODS'
  | 'UNASSIGNED_SUBJECTS'
  | 'CRITICAL_TIMETABLE_CONFLICTS'
  | 'UNAPPROVED_SCHEMES_EXCESSIVE'
  | 'MISSING_GRADING_SCALE'
  | 'MISSING_REPORT_CARD_TEMPLATE'
  | 'NO_ACTIVE_PERIOD'
  | 'PEDAGOGICAL_WORKFLOW_STALLED';

export interface AcademicDataQualityIssue {
  code: AcademicDataQualityCode;
  severity: AcademicDataQualitySeverity;
  category: 'calendar' | 'curriculum' | 'timetables' | 'pedagogy' | 'assessment';
  message: string;
  details?: string;
  suggestedAction: string;
}

// -------------------------------------------------------------
// 8. READINESS CHECKLIST & SCORE
// -------------------------------------------------------------

export interface AcademicReadinessItem {
  key: string;
  title: string;
  description: string;
  category: AcademicCapabilityCategory;
  isComplete: boolean;
  isUnknown?: boolean;
  severityIfMissing: 'blocker' | 'warning' | 'info';
  details?: string;
}

export interface AcademicReadinessEvaluation {
  score: number; // 0 to 100
  level: AcademicReadinessLevel;
  totalChecklistItems: number;
  completedChecklistItems: number;
  unknownChecklistItems: number;
  items: AcademicReadinessItem[];
  blockers: string[];
  warnings: string[];
}

// -------------------------------------------------------------
// 9. COMPLETE ORGANIZATION ACADEMIC OVERSIGHT ENTITY
// -------------------------------------------------------------

export interface CampusAcademicSummary {
  campusId: string;
  campusName: string;
  campusCode: string;
  isMainCampus: boolean;
  classesCount: number;
  armsCount: number;
  teachersCount: number;
  timetablePublished: boolean;
}

export interface OrganizationAcademicOversight {
  organizationId: string;
  organizationName: string;
  organizationCode: string;
  classification: SchoolClassification;
  lifecycleStatus: OrganizationLifecycleStatus;
  reportingStatus: AcademicReportingStatus;
  isReporting: boolean;
  lastReportedAt: string;

  // Active Context
  academicSession: string; // e.g. "2026/2027"
  activePeriod: string; // e.g. "Autumn Term (Term 1)"
  campuses: CampusAcademicSummary[];

  // Modular summaries
  academicYears: AcademicYearConfigSummary[];
  structure: AcademicStructureSummary;
  curriculum: CurriculumOversightSummary;
  timetables: TimetableOversightSummary;
  pedagogicalWorkflows: PedagogicalWorkflowsSummary;
  assessmentAndReporting: AssessmentReportingSummary;
  
  // Quality & Readiness
  dataQualityIssues: AcademicDataQualityIssue[];
  readiness: AcademicReadinessEvaluation;
}

// -------------------------------------------------------------
// 10. FILTER & AGGREGATE METRICS
// -------------------------------------------------------------

export interface AcademicOversightFilterState {
  organizationId: string; // "ALL" or specific ID
  campusId: string; // "ALL" or specific ID
  academicSession: string; // "ALL", "2026/2027", "2025/2026", etc.
  activePeriod: string; // "ALL" or term name
  readinessLevel: string; // "ALL" | AcademicReadinessLevel
  capabilityCategory: string; // "ALL" | AcademicCapabilityCategory
  searchQuery: string;
}

export interface AggregatedAcademicOversightMetrics {
  totalOrganizations: number;
  activeReportingOrganizations: number;
  dormantOrUnprovisionedOrganizations: number;
  
  // Sessions & Calendar
  totalAcademicSessionsConfigured: number;
  totalActivePeriodsRepresented: number;
  calendarDataIntegrityRatePercentage: number;

  // Readiness
  averageReadinessScore: number;
  completeReadinessCount: number;
  attentionRequiredCount: number;
  criticalBlockerCount: number;
  unprovisionedCount: number;

  // Structure & Allocations
  totalClassesRepresented: number;
  totalSubjectsRepresented: number;
  averageTeacherAllocationPercentage: number;
  totalUnassignedSubjects: number;

  // Curriculum & Pedagogy
  totalCurriculumBlueprints: number;
  totalSchemesApproved: number;
  averageSchemeApprovalPercentage: number;
  totalLessonNotesCreated: number;
  averagePedagogicalCompliancePercentage: number;

  // Timetables & Operations
  timetablesPublishedCount: number;
  timetablesInDraftCount: number;
  timetablesWithCriticalConflictsCount: number;
  totalCriticalConflicts: number;
  totalWarningConflicts: number;

  // Assessment & Reporting
  gradingScalesConfiguredCount: number;
  reportCardsReadyCount: number;
  reportingReadyPercentage: number;

  // Data Quality Findings
  criticalIssuesCount: number;
  warningIssuesCount: number;
  infoIssuesCount: number;
}
