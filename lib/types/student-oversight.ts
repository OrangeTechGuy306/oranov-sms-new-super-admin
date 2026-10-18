/**
 * Phase E-09.8: Student Information & Admissions Oversight Domain Contracts
 * 
 * Defines platform-level, privacy-preserving, organization-aggregated contracts
 * for student lifecycle, admissions funnel, campus capacity, transfers,
 * academic promotions, and data quality indicators in the SaaS Super-Admin dashboard.
 * 
 * Strict Constraint: Zero student-level Personally Identifiable Information (PII) is exposed.
 */

import { SchoolClassification, OrganizationLifecycleStatus } from './organizations';

export type StudentReportingStatus = 
  | 'active_reporting' 
  | 'dormant' 
  | 'not_provisioned' 
  | 'unverified';

export type AcademicCycleSession = 
  | '2025/2026' 
  | '2024/2025' 
  | '2023/2024';

export interface AdmissionsFunnelStage {
  inquiryCount: number;
  submittedCount: number;
  underReviewCount: number;
  moreInfoCount: number;
  acceptedCount: number;
  deferredCount: number;
  rejectedCount: number;
  convertedCount: number;
  conversionRatePercentage: number; // (convertedCount / submittedCount) * 100 or 0
}

export interface StudentPopulationLifecycleBreakdown {
  enrolledCount: number; // ACTIVE or ENROLLED
  admittedCount: number; // Accepted & awaiting start
  suspendedCount: number; // Temporarily suspended
  transferredCount: number; // Transferred out
  withdrawnCount: number; // Formally withdrawn
  graduatedCount: number; // Completed final grade cohort
  expelledCount: number; // Disciplinary departure
  archivedCount: number; // Archived historical records
  totalTracked: number; // Canonical total of all tracked states
}

export interface CampusStudentOversightMetric {
  campusId: string;
  campusName: string;
  campusCode: string;
  isMainCampus: boolean;
  studentCapacity: number;
  enrolledStudents: number;
  capacityUtilizationPercentage: number;
  admissionsCount: number;
}

export type ClearanceDepartmentKey = 'LIBRARY' | 'HOSTEL' | 'ASSETS' | 'FINANCE';

export interface ClearanceBottleneckMetric {
  department: ClearanceDepartmentKey;
  departmentName: string;
  pendingCount: number;
  blockedCount: number;
  clearedCount: number;
}

export interface TransferClearanceOversightMetric {
  outgoingTransfersTotal: number;
  outgoingClearanceInProgress: number;
  outgoingCleared: number;
  outgoingApproved: number;
  outgoingCompleted: number;
  outgoingCancelled: number;
  incomingTransfersTotal: number;
  incomingUnderReview: number;
  incomingApproved: number;
  incomingEnrolled: number;
  clearanceBottlenecks: ClearanceBottleneckMetric[];
}

export interface PromotionGraduationOversightMetric {
  evaluatedStudentsCount: number;
  promotedCount: number;
  promotedOnTrialCount: number;
  repeatCount: number;
  manualReviewCount: number;
  graduatedCohortCount: number;
  graduatingClassName: string;
}

export type DataQualitySeverity = 'critical' | 'warning' | 'info';

export type DataQualityIssueCode = 
  | 'MISSING_SESSION' 
  | 'UNASSIGNED_CAMPUS' 
  | 'OVER_CAPACITY' 
  | 'DOCS_PENDING_EXCESSIVE' 
  | 'UNMAPPED_STATUS' 
  | 'MODULE_DISABLED';

export interface DataQualityIssue {
  id: string;
  code: DataQualityIssueCode;
  severity: DataQualitySeverity;
  title: string;
  description: string;
  affectedCount: number;
}

export interface GradeDivisionBreakdown {
  division: 'early_years' | 'primary' | 'middle_school' | 'high_school' | 'higher_ed';
  divisionLabel: string;
  enrolledCount: number;
  percentage: number;
}

export interface OrganizationStudentOversight {
  organizationId: string;
  organizationName: string;
  organizationCode: string;
  classification: SchoolClassification;
  lifecycleStatus: OrganizationLifecycleStatus;
  academicSession: AcademicCycleSession;
  isReporting: boolean;
  reportingStatus: StudentReportingStatus;
  statusExplanation?: string;
  lastReportedAt: string | null;
  admissions: AdmissionsFunnelStage;
  population: StudentPopulationLifecycleBreakdown;
  campuses: CampusStudentOversightMetric[];
  transfers: TransferClearanceOversightMetric;
  promotions: PromotionGraduationOversightMetric;
  gradeDivisions: GradeDivisionBreakdown[];
  dataQualityIssues: DataQualityIssue[];
}

export interface StudentOversightFilterState {
  organizationId: string | 'ALL';
  campusId: string | 'ALL';
  academicSession: AcademicCycleSession | 'ALL';
  searchQuery: string;
  reportingStatus: 'ALL' | 'ACTIVE_ONLY' | 'WITH_ISSUES';
}

export interface AggregatedStudentOversightMetrics {
  totalEnrolledStudents: number;
  totalAdmissionsReceived: number;
  totalUnderReview: number;
  totalAccepted: number;
  totalConverted: number;
  totalOutgoingTransfers: number;
  totalIncomingTransfers: number;
  totalGraduated: number;
  totalReportingOrganizations: number;
  totalOrganizationsInScope: number;
  organizationsWithQualityIssuesCount: number;
  overallConversionRatePercentage: number;
  averageCampusUtilizationPercentage: number;
}
