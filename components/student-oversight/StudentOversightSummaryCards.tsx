'use client';

import React from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { AggregatedStudentOversightMetrics } from '@/lib/types/student-oversight';
import {
  Users,
  UserCheck,
  Clock,
  ArrowRightLeft,
  Building2,
  AlertTriangle,
} from 'lucide-react';

interface StudentOversightSummaryCardsProps {
  metrics: AggregatedStudentOversightMetrics;
}

export function StudentOversightSummaryCards({ metrics }: StudentOversightSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. Total Enrolled Students */}
      <StatCard
        title="Total Enrolled Students"
        value={metrics.totalEnrolledStudents.toLocaleString()}
        subtitle={`Across ${metrics.totalReportingOrganizations} reporting schools`}
        icon={<Users className="w-5 h-5" />}
        badge={{
          label: `${metrics.averageCampusUtilizationPercentage}% Capacity`,
          variant: metrics.averageCampusUtilizationPercentage > 95 ? 'warning' : 'success',
        }}
      />

      {/* 2. Admissions Received */}
      <StatCard
        title="Applications Received"
        value={metrics.totalAdmissionsReceived.toLocaleString()}
        subtitle={`${metrics.totalConverted.toLocaleString()} converted to students`}
        icon={<UserCheck className="w-5 h-5" />}
        trend={{
          value: `${metrics.overallConversionRatePercentage}%`,
          isPositive: metrics.overallConversionRatePercentage >= 50,
          label: 'conversion',
        }}
      />

      {/* 3. Under Review / Pending */}
      <StatCard
        title="Awaiting Review"
        value={metrics.totalUnderReview.toLocaleString()}
        subtitle={`${metrics.totalAccepted.toLocaleString()} accepted offers`}
        icon={<Clock className="w-5 h-5" />}
        badge={{
          label: metrics.totalUnderReview > 0 ? 'Action Queue' : 'Cleared',
          variant: metrics.totalUnderReview > 0 ? 'info' : 'success',
        }}
      />

      {/* 4. Student Mobility & Transfers */}
      <StatCard
        title="Student Transfers"
        value={(metrics.totalOutgoingTransfers + metrics.totalIncomingTransfers).toLocaleString()}
        subtitle={`${metrics.totalOutgoingTransfers} out • ${metrics.totalIncomingTransfers} in`}
        icon={<ArrowRightLeft className="w-5 h-5" />}
      />

      {/* 5. Reporting Organizations */}
      <StatCard
        title="Reporting Tenants"
        value={`${metrics.totalReportingOrganizations} / ${metrics.totalOrganizationsInScope}`}
        subtitle="Active SIS telemetry sync"
        icon={<Building2 className="w-5 h-5" />}
        badge={{
          label: metrics.totalReportingOrganizations === metrics.totalOrganizationsInScope ? '100% Coverage' : 'Partial Sync',
          variant: metrics.totalReportingOrganizations === metrics.totalOrganizationsInScope ? 'success' : 'neutral',
        }}
      />

      {/* 6. Data Quality & Compliance */}
      <StatCard
        title="Data Quality Alerts"
        value={metrics.organizationsWithQualityIssuesCount}
        subtitle={metrics.organizationsWithQualityIssuesCount === 0 ? 'All metrics reconciled' : 'Organizations flagged'}
        icon={<AlertTriangle className="w-5 h-5" />}
        badge={{
          label: metrics.organizationsWithQualityIssuesCount === 0 ? 'Compliant' : 'Audit Notice',
          variant: metrics.organizationsWithQualityIssuesCount === 0 ? 'success' : 'warning',
        }}
      />
    </div>
  );
}
