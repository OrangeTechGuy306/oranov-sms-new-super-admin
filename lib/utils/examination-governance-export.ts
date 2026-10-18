/**
 * Phase E-09.10: Safe Aggregated Examinations & Assessment Governance CSV Export Utility
 * 
 * Strict Privacy by Design:
 * - Exports ONLY aggregated organization-level metrics and configuration readiness.
 * - Zero student personal identifiers, names, marks, grades, or answers.
 * - Uses RFC 4180 formatting with formula injection neutralization (=, +, -, @, tab, cr).
 */

import { OrganizationExamGovernance, ExamGovernanceFilterState } from '../types/examination-governance';
import { generateCsvContent, downloadCsvFile } from './csv-export';

export function buildExamGovernanceCsv(
  records: OrganizationExamGovernance[]
): string {
  const headers = [
    'Organization Code',
    'Organization Name',
    'Classification',
    'Lifecycle Status',
    'Academic Session',
    'Active Period',
    'Delivery Mode',
    'Readiness Score (%)',
    'Readiness Level',
    'Campuses Count',
    'Has Exam Module',
    'Has CBT Module',
    'Has Results Module',
    'Exam Series Count',
    'Active Exam Series',
    'Total Assessments',
    'Scheduled Assessments',
    'Marks Entry In Progress',
    'Under Review Assessments',
    'Published Assessments',
    'Timetable Slots',
    'Timetable Conflicts',
    'Unassigned Invigilators',
    'Total CBT Exams',
    'Total CBT Attempts',
    'Completed CBT Attempts',
    'CBT Active Exceptions',
    'Question Bank Total',
    'Question Bank Approved',
    'Grading Scale Name',
    'Grading Scale Type',
    'Grading Pass Mark (%)',
    'Report Card Template Ready',
    'Publication Status',
    'Data Quality Issues Count',
    'Last Updated Timestamp',
  ];

  const rows = records.map((org) => [
    org.organizationCode,
    org.organizationName,
    org.classification,
    org.lifecycleStatus,
    org.academicSession,
    org.activePeriod,
    org.deliveryMode,
    org.readiness.overallScore,
    org.readiness.level,
    org.campuses ? org.campuses.length : 0,
    org.hasExaminationsModule ? 'Yes' : 'No',
    org.hasCbtModule ? 'Yes' : 'No',
    org.hasResultsModule ? 'Yes' : 'No',
    org.examPeriodsCount,
    org.activeExamPeriodName || 'None',
    org.assessments.totalAssessments,
    org.assessments.scheduledCount,
    org.assessments.marksEntryCount,
    org.assessments.underReviewCount,
    org.assessments.publishedCount,
    org.timetable.totalSlots,
    org.timetable.criticalConflictsCount + org.timetable.warningConflictsCount,
    org.timetable.unassignedInvigilatorsCount,
    org.cbt.totalCbtExams,
    org.cbt.totalAttempts,
    org.cbt.completedAttempts,
    org.cbt.activeExceptionsCount,
    org.questionBank.totalQuestions,
    org.questionBank.approvedQuestions,
    org.grading.scaleName,
    org.grading.scaleType,
    org.grading.passMark,
    org.resultsPublication.reportCardTemplateReady ? 'Yes' : 'No',
    org.resultsPublication.publicationStatus,
    org.dataQualityIssues ? org.dataQualityIssues.length : 0,
    org.lastUpdated || 'Never',
  ]);

  return generateCsvContent(headers, rows);
}

export function downloadExamGovernanceReport(
  records: OrganizationExamGovernance[],
  activeFilter?: ExamGovernanceFilterState
): void {
  const csv = buildExamGovernanceCsv(records);
  const dateStr = new Date().toISOString().split('T')[0];
  const modeTag = activeFilter?.deliveryMode && activeFilter.deliveryMode !== 'ALL'
    ? `-${activeFilter.deliveryMode.toLowerCase()}`
    : '';
  const filename = `examination-governance-report${modeTag}-${dateStr}.csv`;
  downloadCsvFile(filename, csv);
}
