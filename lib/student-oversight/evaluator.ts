/**
 * Phase E-09.8: Student Information & Admissions Oversight Aggregation Engine
 * 
 * Pure TypeScript evaluator for:
 * - Deterministic, dynamic aggregation across organizations and campuses
 * - Filtering by organization, campus, academic session, status, and search query
 * - Admissions funnel progression calculations
 * - Clearance bottleneck aggregation
 * - Referential integrity checks against Super-Admin models
 * - Data quality issue detection and scoring
 * - Zero student PII calculation
 */

import {
  OrganizationStudentOversight,
  StudentOversightFilterState,
  AggregatedStudentOversightMetrics,
  AdmissionsFunnelStage,
  StudentPopulationLifecycleBreakdown,
  ClearanceDepartmentKey,
} from '../types/student-oversight';

/**
 * Filter student oversight datasets by criteria.
 */
export function filterStudentOversightData(
  records: OrganizationStudentOversight[],
  filter: StudentOversightFilterState
): OrganizationStudentOversight[] {
  return records
    .filter((org) => {
      // 1. Organization filter
      if (filter.organizationId !== 'ALL' && org.organizationId !== filter.organizationId) {
        return false;
      }

      // 2. Academic Session filter
      if (filter.academicSession !== 'ALL' && org.academicSession !== filter.academicSession) {
        return false;
      }

      // 3. Search query filter (matches organization name or code)
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase().trim();
        const matchesName = org.organizationName.toLowerCase().includes(query);
        const matchesCode = org.organizationCode.toLowerCase().includes(query);
        if (!matchesName && !matchesCode) {
          return false;
        }
      }

      // 4. Reporting status filter
      if (filter.reportingStatus === 'ACTIVE_ONLY') {
        if (!org.isReporting) return false;
      } else if (filter.reportingStatus === 'WITH_ISSUES') {
        if (org.dataQualityIssues.length === 0) return false;
      }

      return true;
    })
    .map((org) => {
      // 5. Campus filter: if a specific campus is selected, restrict campuses list for that org
      if (filter.campusId !== 'ALL') {
        const matchingCampuses = org.campuses.filter((c) => c.campusId === filter.campusId);
        if (matchingCampuses.length === 0) {
          // If this organization does not possess the selected campus, return empty campus view
          return {
            ...org,
            campuses: [],
          };
        }
        return {
          ...org,
          campuses: matchingCampuses,
        };
      }
      return org;
    })
    .filter((org) => {
      // If a specific campus was requested, exclude organizations that have no matching campuses
      if (filter.campusId !== 'ALL') {
        return org.campuses.length > 0;
      }
      return true;
    });
}

/**
 * Calculates global top-level KPI metrics from current active records.
 */
export function computeAggregatedStudentMetrics(
  records: OrganizationStudentOversight[]
): AggregatedStudentOversightMetrics {
  let totalEnrolledStudents = 0;
  let totalAdmissionsReceived = 0;
  let totalUnderReview = 0;
  let totalAccepted = 0;
  let totalConverted = 0;
  let totalOutgoingTransfers = 0;
  let totalIncomingTransfers = 0;
  let totalGraduated = 0;
  let totalReportingOrganizations = 0;
  let organizationsWithQualityIssuesCount = 0;
  let totalCapacitySum = 0;
  let totalEnrolledInCampusesSum = 0;

  for (const org of records) {
    if (org.isReporting) {
      totalReportingOrganizations++;
      totalEnrolledStudents += org.population.enrolledCount;
      totalAdmissionsReceived += org.admissions.submittedCount;
      totalUnderReview += org.admissions.underReviewCount + org.admissions.moreInfoCount;
      totalAccepted += org.admissions.acceptedCount;
      totalConverted += org.admissions.convertedCount;
      totalOutgoingTransfers += org.transfers.outgoingTransfersTotal;
      totalIncomingTransfers += org.transfers.incomingTransfersTotal;
      totalGraduated += org.population.graduatedCount;

      for (const campus of org.campuses) {
        totalCapacitySum += campus.studentCapacity;
        totalEnrolledInCampusesSum += campus.enrolledStudents;
      }
    }

    if (org.dataQualityIssues.length > 0) {
      organizationsWithQualityIssuesCount++;
    }
  }

  const overallConversionRatePercentage = totalAdmissionsReceived > 0
    ? Math.round((totalConverted / totalAdmissionsReceived) * 100)
    : 0;

  const averageCampusUtilizationPercentage = totalCapacitySum > 0
    ? Math.round((totalEnrolledInCampusesSum / totalCapacitySum) * 100)
    : 0;

  return {
    totalEnrolledStudents,
    totalAdmissionsReceived,
    totalUnderReview,
    totalAccepted,
    totalConverted,
    totalOutgoingTransfers,
    totalIncomingTransfers,
    totalGraduated,
    totalReportingOrganizations,
    totalOrganizationsInScope: records.length,
    organizationsWithQualityIssuesCount,
    overallConversionRatePercentage,
    averageCampusUtilizationPercentage,
  };
}

/**
 * Aggregates admissions funnel metrics across all records in view.
 */
export function aggregateAdmissionsFunnel(
  records: OrganizationStudentOversight[]
): AdmissionsFunnelStage {
  let inquiryCount = 0;
  let submittedCount = 0;
  let underReviewCount = 0;
  let moreInfoCount = 0;
  let acceptedCount = 0;
  let deferredCount = 0;
  let rejectedCount = 0;
  let convertedCount = 0;

  for (const org of records) {
    if (org.isReporting) {
      inquiryCount += org.admissions.inquiryCount;
      submittedCount += org.admissions.submittedCount;
      underReviewCount += org.admissions.underReviewCount;
      moreInfoCount += org.admissions.moreInfoCount;
      acceptedCount += org.admissions.acceptedCount;
      deferredCount += org.admissions.deferredCount;
      rejectedCount += org.admissions.rejectedCount;
      convertedCount += org.admissions.convertedCount;
    }
  }

  const conversionRatePercentage = submittedCount > 0
    ? Math.round((convertedCount / submittedCount) * 100)
    : 0;

  return {
    inquiryCount,
    submittedCount,
    underReviewCount,
    moreInfoCount,
    acceptedCount,
    deferredCount,
    rejectedCount,
    convertedCount,
    conversionRatePercentage,
  };
}

/**
 * Aggregates student population lifecycle breakdown across all records in view.
 */
export function aggregatePopulationLifecycle(
  records: OrganizationStudentOversight[]
): StudentPopulationLifecycleBreakdown {
  let enrolledCount = 0;
  let admittedCount = 0;
  let suspendedCount = 0;
  let transferredCount = 0;
  let withdrawnCount = 0;
  let graduatedCount = 0;
  let expelledCount = 0;
  let archivedCount = 0;

  for (const org of records) {
    enrolledCount += org.population.enrolledCount;
    admittedCount += org.population.admittedCount;
    suspendedCount += org.population.suspendedCount;
    transferredCount += org.population.transferredCount;
    withdrawnCount += org.population.withdrawnCount;
    graduatedCount += org.population.graduatedCount;
    expelledCount += org.population.expelledCount;
    archivedCount += org.population.archivedCount;
  }

  return {
    enrolledCount,
    admittedCount,
    suspendedCount,
    transferredCount,
    withdrawnCount,
    graduatedCount,
    expelledCount,
    archivedCount,
    totalTracked: enrolledCount + admittedCount + suspendedCount + transferredCount + withdrawnCount + graduatedCount + expelledCount + archivedCount,
  };
}

/**
 * Aggregates clearance bottlenecks across departments.
 */
export function aggregateClearanceBottlenecks(
  records: OrganizationStudentOversight[]
): Record<ClearanceDepartmentKey, { pending: number; blocked: number; cleared: number }> {
  const result: Record<ClearanceDepartmentKey, { pending: number; blocked: number; cleared: number }> = {
    LIBRARY: { pending: 0, blocked: 0, cleared: 0 },
    HOSTEL: { pending: 0, blocked: 0, cleared: 0 },
    ASSETS: { pending: 0, blocked: 0, cleared: 0 },
    FINANCE: { pending: 0, blocked: 0, cleared: 0 },
  };

  for (const org of records) {
    for (const b of org.transfers.clearanceBottlenecks) {
      if (result[b.department]) {
        result[b.department].pending += b.pendingCount;
        result[b.department].blocked += b.blockedCount;
        result[b.department].cleared += b.clearedCount;
      }
    }
  }

  return result;
}

/**
 * Extracts a list of all selectable campuses given an optional organization ID constraint.
 */
export function getSelectableCampuses(
  records: OrganizationStudentOversight[],
  selectedOrgId: string | 'ALL'
): { id: string; name: string; orgId: string; orgName: string; code: string }[] {
  const result: { id: string; name: string; orgId: string; orgName: string; code: string }[] = [];

  for (const org of records) {
    if (selectedOrgId === 'ALL' || org.organizationId === selectedOrgId) {
      for (const campus of org.campuses) {
        result.push({
          id: campus.campusId,
          name: campus.campusName,
          code: campus.campusCode,
          orgId: org.organizationId,
          orgName: org.organizationName,
        });
      }
    }
  }

  return result;
}

/**
 * Validates referential integrity against the canonical organization and campus models.
 */
export function validateStudentOversightIntegrity(
  records: OrganizationStudentOversight[],
  canonicalOrgIds: string[],
  canonicalCampusIds: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const orgIdSet = new Set(canonicalOrgIds);
  const campusIdSet = new Set(canonicalCampusIds);

  for (const org of records) {
    // 1. Organization reference check
    if (!orgIdSet.has(org.organizationId)) {
      errors.push(`Orphaned student oversight entity: organizationId "${org.organizationId}" does not exist in master organizations.`);
    }

    // 2. Campus references check
    for (const campus of org.campuses) {
      if (!campusIdSet.has(campus.campusId)) {
        errors.push(`Invalid campus reference: campusId "${campus.campusId}" on org "${org.organizationId}" does not exist in master campuses.`);
      }
    }

    // 3. Mathematical reconciliation check
    if (org.isReporting) {
      const sumCampusStudents = org.campuses.reduce((acc, c) => acc + c.enrolledStudents, 0);
      if (sumCampusStudents !== org.population.enrolledCount) {
        errors.push(
          `Population discrepancy for "${org.organizationCode}": campus enrolled sum (${sumCampusStudents}) does not match population.enrolledCount (${org.population.enrolledCount}).`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
