/**
 * Phase E-09.10: Examinations, CBT & Assessment Governance Domain Contracts
 * 
 * Defines platform-level, privacy-preserving, organization-aggregated contracts
 * for examination series, assessment lifecycle states, CBT delivery, question banks,
 * timetable scheduling, grading scales, results moderation, and report-card publication readiness.
 * 
 * Strict Constraint: Zero student-level Personally Identifiable Information (PII) is exposed.
 * All metrics are derived deterministically from canonical organization structures.
 */

import { SchoolClassification, OrganizationLifecycleStatus } from './organizations';

// -------------------------------------------------------------
// 1. LIFECYCLE ENUMS & DISCOVERED TENANT STATUSES
// -------------------------------------------------------------

export type ExamDeliveryMode = 'PAPER_BASED' | 'CBT_HYBRID' | 'CBT_FULL';

export type ExamPeriodStatusKey =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CLOSED'
  | 'ARCHIVED';

export type AssessmentLifecycleStatusKey =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'MARKS_ENTRY'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'LOCKED'
  | 'ARCHIVED';

export type MarksStatusKey =
  | 'DRAFT'
  | 'SAVED'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'LOCKED';

export type ResultPublicationStatusKey =
  | 'UNPUBLISHED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PARTIALLY_PUBLISHED'
  | 'PUBLISHED'
  | 'WITHDRAWN';

export type CbtExamLifecycleStatusKey =
  | 'DRAFT'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'RESULTS_PENDING'
  | 'RESULTS_PUBLISHED'
  | 'ARCHIVED'
  | 'CANCELLED';

export type CbtAttemptLifecycleStatusKey =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'TIMED_OUT'
  | 'EVALUATING'
  | 'AWAITING_MARKING'
  | 'COMPLETED'
  | 'EXCEPTION';

export type CbtExceptionTypeKey =
  | 'CONNECTION_LOST'
  | 'BROWSER_UNFOCUSED'
  | 'TIMEOUT_SUBMISSION'
  | 'SAVE_CONFLICT'
  | 'TIME_EXTENSION_GRANTED'
  | 'UNLOCKED_BY_PROCTOR'
  | 'FORCE_SUBMITTED';

export type AssessmentTypeKey =
  | 'CONTINUOUS_ASSESSMENT'
  | 'CLASS_TEST'
  | 'QUIZ'
  | 'ASSIGNMENT'
  | 'PRACTICAL'
  | 'PROJECT'
  | 'MIDTERM_EXAM'
  | 'FINAL_EXAM'
  | 'ORAL'
  | 'OTHER';

export type QuestionTypeKey =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_SELECT'
  | 'TRUE_FALSE'
  | 'SHORT_ANSWER'
  | 'ESSAY'
  | 'FILL_IN_BLANKS'
  | 'MATCHING'
  | 'NUMERIC';

export type QuestionDifficultyKey = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export type QuestionStatusKey =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'RETURNED_FOR_REVISION'
  | 'REJECTED'
  | 'ARCHIVED';

export type ExamReadinessLevel =
  | 'ready'
  | 'partially_ready'
  | 'not_ready'
  | 'not_applicable'
  | 'unknown';

export type ExamCapabilityImplementationStatus =
  | 'implemented'
  | 'partial'
  | 'planned'
  | 'missing'
  | 'unknown';

export type ExamCapabilityCategory =
  | 'exam_configuration'
  | 'question_banks'
  | 'exam_scheduling'
  | 'cbt_delivery'
  | 'assessment_results'
  | 'results_publication'
  | 'governance_security';

// -------------------------------------------------------------
// 2. CAPABILITY INVENTORY (Linked to Master Module Registry)
// -------------------------------------------------------------

export interface ExamCapabilityItem {
  id: string;
  name: string;
  category: ExamCapabilityCategory;
  description: string;
  parentCapabilityId?: string;
  tenantSourceEvidence: {
    routePath: string;
    typeDefinition: string;
    componentEntry?: string;
    mockStore?: string;
  };
  tenantRoutes: string[];
  implementationStatus: ExamCapabilityImplementationStatus;
  platformOversightScope: string;
  knownLimitations: string[];
  moduleRegistryRef: string; // e.g. "mod_examinations", "sub_exam_cbt", "mod_results"
  futureBackendDependency: string;
}

// -------------------------------------------------------------
// 3. READINESS CHECKLIST & EVALUATION
// -------------------------------------------------------------

export type ExamReadinessCheckId =
  | 'ACTIVE_ACADEMIC_PERIOD'
  | 'CLASS_SUBJECT_MAPPING'
  | 'ASSESSMENT_TYPES_WEIGHTS'
  | 'EXAM_PERIOD_CONFIGURED'
  | 'TIMETABLE_ROOM_INVIGILATION'
  | 'GRADING_SCALE_CONFIGURED'
  | 'CBT_READINESS_OR_EXEMPT'
  | 'REPORT_CARD_PIPELINE';

export interface ExamReadinessCheckItem {
  id: ExamReadinessCheckId;
  name: string;
  category: string;
  description: string;
  whyItMatters: string;
  sourceCapability: string;
  isSatisfied: boolean;
  isBlocker: boolean;
  status: 'passed' | 'warning' | 'failed' | 'not_applicable';
  message: string;
  remediationGuidance: string;
  evidenceSource: 'verified' | 'simulated' | 'unknown';
}

export interface ExamReadinessEvaluation {
  overallScore: number; // 0 - 100%
  level: ExamReadinessLevel;
  checks: ExamReadinessCheckItem[];
  passedChecksCount: number;
  totalApplicableChecks: number;
  criticalBlockersCount: number;
  warningsCount: number;
}

// -------------------------------------------------------------
// 4. TIMETABLE & SCHEDULING CONFLICTS
// -------------------------------------------------------------

export type ExamConflictTypeKey =
  | 'ROOM_DOUBLE_BOOKED'
  | 'TEACHER_DOUBLE_BOOKED'
  | 'CLASS_COHORT_OVERLAP'
  | 'OUTSIDE_EXAM_PERIOD'
  | 'MISSING_INVIGILATOR';

export interface ExamTimetableConflictItem {
  id: string;
  slotId: string;
  conflictType: ExamConflictTypeKey;
  severity: 'CRITICAL' | 'WARNING';
  description: string;
  examDate: string;
  timeWindow: string;
  affectedEntities: string[];
}

export interface ExamTimetableSummary {
  totalSlots: number;
  assignedRoomsCount: number;
  invigilatorsAssignedCount: number;
  unassignedInvigilatorsCount: number;
  hasScheduleConflicts: boolean;
  criticalConflictsCount: number;
  warningConflictsCount: number;
  conflicts: ExamTimetableConflictItem[];
}

// -------------------------------------------------------------
// 5. CBT & QUESTION BANK SUMMARIES
// -------------------------------------------------------------

export interface CbtOversightSummary {
  isEnabled: boolean;
  deliveryMode: ExamDeliveryMode;
  totalCbtExams: number;
  activeExamsCount: number;
  scheduledExamsCount: number;
  completedExamsCount: number;
  totalAssignedCandidates: number;
  totalAttempts: number;
  completedAttempts: number;
  timedOutAttempts: number;
  inProgressAttempts: number;
  activeExceptionsCount: number;
  exceptionBreakdown: Record<CbtExceptionTypeKey, number>;
  proctoringStatus: 'MANUAL_INVIGILATION' | 'AUTOMATED_PROCTORING_NOT_IMPLEMENTED';
  securityLimitationsNote: string;
}

export interface QuestionBankOversightSummary {
  isEnabled: boolean;
  totalQuestions: number;
  approvedQuestions: number;
  draftQuestions: number;
  underReviewQuestions: number;
  returnedQuestions: number;
  rejectedQuestions: number;
  byType: Record<QuestionTypeKey, number>;
  byDifficulty: Record<QuestionDifficultyKey, number>;
  totalCollections: number;
  activeBlueprintsCount: number;
  blueprintDiscrepanciesCount: number;
  hasBulkImportCapability: boolean;
  hasExportCapability: boolean;
}

// -------------------------------------------------------------
// 6. ASSESSMENTS, GRADING & RESULTS PUBLICATION
// -------------------------------------------------------------

export interface AssessmentsOversightSummary {
  totalAssessments: number;
  scheduledCount: number;
  marksEntryCount: number;
  submittedCount: number;
  underReviewCount: number;
  approvedCount: number;
  publishedCount: number;
  lockedCount: number;
  byType: Record<AssessmentTypeKey, number>;
}

export interface GradingScaleOversightSummary {
  isConfigured: boolean;
  scaleName: string;
  scaleType: 'PERCENTAGE' | 'LETTER_GRADE' | 'GPA_4' | 'GPA_5' | 'CUSTOM' | 'NONE';
  passMark: number;
  distinctionMark?: number;
  totalBands: number;
  bandsSummary: string; // e.g., "A (80-100), B (70-79), C (60-69)..."
}

export interface ResultsPublicationOversightSummary {
  publicationStatus: ResultPublicationStatusKey;
  publishedAt?: string;
  isProvisional: boolean;
  reportCardTemplateReady: boolean;
  templateName?: string;
  broadsheetReady: boolean;
  transcriptsReady: boolean;
  digitalVerificationEnabled: boolean;
}

// -------------------------------------------------------------
// 7. DATA QUALITY & GOVERNANCE AUDIT ISSUES
// -------------------------------------------------------------

export type ExamAuditIssueCategory =
  | 'MISSING_PREREQUISITE'
  | 'TIMETABLE_CLASH'
  | 'UNASSIGNED_INVIGILATOR'
  | 'UNAPPROVED_QUESTIONS'
  | 'MISSING_GRADING_SCALE'
  | 'OVERDUE_MARKS_ENTRY'
  | 'CBT_EXCEPTION_SPIKE'
  | 'UNPUBLISHED_APPROVED_RESULTS';

export interface ExamDataQualityIssue {
  id: string;
  category: ExamAuditIssueCategory;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  organizationId: string;
  organizationName: string;
  campusId?: string;
  campusName?: string;
  remediationRecommendation: string;
}

// -------------------------------------------------------------
// 8. CAMPUS-LEVEL EXAM READINESS
// -------------------------------------------------------------

export interface CampusExamGovernanceSummary {
  campusId: string;
  campusName: string;
  campusCode: string;
  isMainCampus: boolean;
  status: 'active' | 'inactive';
  scheduledExamsCount: number;
  inProgressCount: number;
  completedCount: number;
  timetableConflictsCount: number;
  readinessScore: number;
  readinessLevel: ExamReadinessLevel;
}

// -------------------------------------------------------------
// 9. CANONICAL ORGANIZATION EXAM GOVERNANCE CONTRACT
// -------------------------------------------------------------

export interface OrganizationExamGovernance {
  organizationId: string;
  organizationName: string;
  organizationCode: string;
  classification: SchoolClassification;
  lifecycleStatus: OrganizationLifecycleStatus;
  planId: string;
  subdomain: string;
  lastUpdated: string;
  
  // Scoped campuses
  campuses: CampusExamGovernanceSummary[];
  
  // Current academic context
  academicSession: string; // e.g. "2026/2027"
  activePeriod: string; // e.g. "Term 1 (Autumn)"
  
  // Platform module entitlement verification
  hasExaminationsModule: boolean;
  hasCbtModule: boolean;
  hasResultsModule: boolean;
  deliveryMode: ExamDeliveryMode;
  
  // Subsystem summaries
  examPeriodsCount: number;
  activeExamPeriodName?: string;
  activeExamPeriodCategory?: string;
  activeExamPeriodDates?: { start: string; end: string };
  
  assessments: AssessmentsOversightSummary;
  timetable: ExamTimetableSummary;
  cbt: CbtOversightSummary;
  questionBank: QuestionBankOversightSummary;
  grading: GradingScaleOversightSummary;
  resultsPublication: ResultsPublicationOversightSummary;
  
  // Governance evaluation & audit
  readiness: ExamReadinessEvaluation;
  dataQualityIssues: ExamDataQualityIssue[];
}

// -------------------------------------------------------------
// 10. GLOBAL AGGREGATED METRICS CONTRACT
// -------------------------------------------------------------

export interface AggregatedExamGovernanceMetrics {
  totalOrganizations: number;
  organizationsWithExams: number;
  organizationsWithCbt: number;
  organizationsMarkedReady: number;
  organizationsAttentionRequired: number;
  organizationsNotReady: number;
  
  // Assessment Lifecycle Totals
  scheduledAssessments: number;
  inProgressAssessments: number;
  completedAssessments: number;
  marksEntryAssessments: number;
  assessmentsAwaitingResults: number;
  publishedAssessments: number;
  
  // Timetable & Scheduling Totals
  totalExamSlots: number;
  timetableConflictsCount: number;
  unassignedInvigilatorsCount: number;
  
  // CBT Totals
  totalCbtExams: number;
  totalCbtAttempts: number;
  completedCbtAttempts: number;
  totalCbtExceptions: number;
  
  // Question Bank Totals
  questionBankTotalQuestions: number;
  approvedQuestionsCount: number;
  draftQuestionsCount: number;
  
  // Results & Reporting
  reportCardTemplatesConfiguredCount: number;
  averageReadinessScore: number;
  totalDataQualityIssues: number;
  criticalIssuesCount: number;
}

// -------------------------------------------------------------
// 11. FILTER STATE CONTRACT
// -------------------------------------------------------------

export interface ExamGovernanceFilterState {
  organizationId: string; // 'ALL' or specific ID
  campusId: string; // 'ALL' or specific ID
  academicPeriod: string; // 'ALL' or specific period
  assessmentType: string; // 'ALL' or AssessmentTypeKey
  lifecycleStatus: string; // 'ALL' or AssessmentLifecycleStatusKey
  deliveryMode: string; // 'ALL' | 'PAPER_BASED' | 'CBT_HYBRID' | 'CBT_FULL'
  readinessStatus: string; // 'ALL' | 'ready' | 'partially_ready' | 'not_ready' | 'not_applicable' | 'unknown'
  searchQuery: string;
  startDate?: string;
  endDate?: string;
}
