/**
 * Phase E-09.8: Safe Aggregated Student Oversight CSV Export
 * 
 * Strict Privacy by Design:
 * - Exports ONLY organization-level and campus-level aggregated statistics.
 * - Zero personal names, student identifiers, phone numbers, emails, addresses, or DOB.
 * - Uses RFC 4180 formatting with formula injection neutralization (=, +, -, @, tab, cr).
 */

import { OrganizationStudentOversight, StudentOversightFilterState } from '../types/student-oversight';
import { generateCsvContent, downloadCsvFile } from './csv-export';

export function buildStudentOversightCsv(
  records: OrganizationStudentOversight[]
): string {
  const headers = [
    'Organization Code',
    'Organization Name',
    'Classification',
    'Lifecycle Status',
    'Academic Session',
    'Reporting Status',
    'Enrolled Students',
    'Campuses Count',
    'Inquiries',
    'Applications Received',
    'Applications Under Review',
    'Applications Accepted',
    'Applications Rejected',
    'Completed Enrollments',
    'Conversion Rate (%)',
    'Outgoing Transfers',
    'Incoming Transfers',
    'Graduated Cohort',
    'Data Quality Issues Count',
    'Last Reported Timestamp',
  ];

  const rows = records.map((org) => [
    org.organizationCode,
    org.organizationName,
    org.classification,
    org.lifecycleStatus,
    org.academicSession,
    org.reportingStatus,
    org.isReporting ? org.population.enrolledCount : 'N/A (Not Reporting)',
    org.campuses.length,
    org.isReporting ? org.admissions.inquiryCount : 0,
    org.isReporting ? org.admissions.submittedCount : 0,
    org.isReporting ? (org.admissions.underReviewCount + org.admissions.moreInfoCount) : 0,
    org.isReporting ? org.admissions.acceptedCount : 0,
    org.isReporting ? org.admissions.rejectedCount : 0,
    org.isReporting ? org.admissions.convertedCount : 0,
    org.isReporting ? `${org.admissions.conversionRatePercentage}%` : 'N/A',
    org.transfers.outgoingTransfersTotal,
    org.transfers.incomingTransfersTotal,
    org.population.graduatedCount,
    org.dataQualityIssues.length,
    org.lastReportedAt || 'Never',
  ]);

  return generateCsvContent(headers, rows);
}

export function downloadStudentOversightReport(
  records: OrganizationStudentOversight[],
  activeFilter?: StudentOversightFilterState
): void {
  const csv = buildStudentOversightCsv(records);
  const dateStr = new Date().toISOString().split('T')[0];
  const sessionTag = activeFilter?.academicSession && activeFilter.academicSession !== 'ALL'
    ? `-${activeFilter.academicSession.replace('/', '-')}`
    : '';
  const filename = `student-oversight-report${sessionTag}-${dateStr}.csv`;
  downloadCsvFile(filename, csv);
}
