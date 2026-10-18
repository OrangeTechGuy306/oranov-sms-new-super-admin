/**
 * Phase E-09.9: Safe Aggregated Academic Oversight CSV Export Utility
 * 
 * Strict Privacy by Design:
 * - Exports ONLY aggregated organization-level metrics and configuration readiness.
 * - Zero student personal identifiers, names, marks, grades, or teacher personal data.
 * - Uses RFC 4180 formatting with formula injection neutralization (=, +, -, @, tab, cr).
 */

import { OrganizationAcademicOversight, AcademicOversightFilterState } from '../types/academic-oversight';
import { generateCsvContent, downloadCsvFile } from './csv-export';

export function buildAcademicOversightCsv(
  records: OrganizationAcademicOversight[]
): string {
  const headers = [
    'Organization Code',
    'Organization Name',
    'Classification',
    'Lifecycle Status',
    'Reporting Status',
    'Academic Session',
    'Active Period',
    'Campuses Count',
    'Readiness Score (%)',
    'Readiness Level',
    'Classes Count',
    'Subjects Count',
    'Teacher Allocation (%)',
    'Unassigned Subjects',
    'Curriculum Frameworks',
    'Schemes Total',
    'Schemes Approved',
    'Timetable Status',
    'Timetable Critical Conflicts',
    'Timetable Warning Conflicts',
    'Lesson Notes Total',
    'Lesson Notes Compliance (%)',
    'Daily Plans Delivered',
    'Grading Scale Type',
    'Report Card Template Ready',
    'Academic Reporting Status',
    'Data Quality Issues Count',
    'Last Reported Timestamp',
  ];

  const rows = records.map((org) => [
    org.organizationCode,
    org.organizationName,
    org.classification,
    org.lifecycleStatus,
    org.reportingStatus,
    org.academicSession,
    org.activePeriod,
    org.campuses ? org.campuses.length : 0,
    org.readiness.score,
    org.readiness.level,
    org.structure.totalClasses,
    org.structure.totalSubjects,
    `${org.structure.teacherAllocationCompletenessPercentage}%`,
    org.structure.unassignedSubjectsCount,
    org.curriculum.activeFrameworks.join('; ') || 'None',
    org.curriculum.schemesTotal,
    org.curriculum.schemesApprovedCount,
    org.timetables.timetableStatus,
    org.timetables.criticalConflictsCount,
    org.timetables.warningConflictsCount,
    org.pedagogicalWorkflows.lessonNotesTotal,
    `${org.pedagogicalWorkflows.lessonNoteComplianceRatePercentage}%`,
    org.pedagogicalWorkflows.dailyPlansDelivered,
    org.assessmentAndReporting.gradingScaleType,
    org.assessmentAndReporting.reportCardTemplateReady ? 'Yes' : 'No',
    org.assessmentAndReporting.academicReportingReadiness,
    org.dataQualityIssues ? org.dataQualityIssues.length : 0,
    org.lastReportedAt || 'Never',
  ]);

  return generateCsvContent(headers, rows);
}

export function downloadAcademicOversightReport(
  records: OrganizationAcademicOversight[],
  activeFilter?: AcademicOversightFilterState
): void {
  const csv = buildAcademicOversightCsv(records);
  const dateStr = new Date().toISOString().split('T')[0];
  const sessionTag = activeFilter?.academicSession && activeFilter.academicSession !== 'ALL'
    ? `-${activeFilter.academicSession.replace(/[\/\s]/g, '-')}`
    : '';
  const filename = `academic-oversight-report${sessionTag}-${dateStr}.csv`;
  downloadCsvFile(filename, csv);
}
