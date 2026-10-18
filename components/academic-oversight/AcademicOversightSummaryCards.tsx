'use client';

import React from 'react';
import { AggregatedAcademicOversightMetrics } from '@/lib/types/academic-oversight';
import { StatCard } from '@/components/ui/StatCard';
import {
  Building2,
  CalendarDays,
  ShieldCheck,
  Clock,
  FileCheck2,
} from 'lucide-react';

interface AcademicOversightSummaryCardsProps {
  metrics: AggregatedAcademicOversightMetrics;
}

export function AcademicOversightSummaryCards({ metrics }: AcademicOversightSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Organizations Monitored */}
      <StatCard
        title="Organizations Monitored"
        value={metrics.totalOrganizations}
        subtitle={`${metrics.activeReportingOrganizations} actively reporting, ${metrics.dormantOrUnprovisionedOrganizations} dormant`}
        icon={<Building2 className="w-5 h-5" />}
        badge={{
          label: `${metrics.activeReportingOrganizations} Active`,
          variant: 'success',
        }}
      />

      {/* 2. Academic Sessions & Periods */}
      <StatCard
        title="Active Academic Cycles"
        value={metrics.totalActivePeriodsRepresented}
        subtitle={`${metrics.totalAcademicSessionsConfigured} sessions represented across schools`}
        icon={<CalendarDays className="w-5 h-5" />}
        badge={{
          label: `${metrics.calendarDataIntegrityRatePercentage}% Dates Valid`,
          variant: metrics.calendarDataIntegrityRatePercentage >= 90 ? 'success' : 'warning',
        }}
      />

      {/* 3. Overall Readiness Index */}
      <StatCard
        title="Academic Readiness Index"
        value={`${metrics.averageReadinessScore}%`}
        subtitle={`${metrics.completeReadinessCount} complete, ${metrics.criticalBlockerCount} blocked`}
        icon={<ShieldCheck className="w-5 h-5" />}
        badge={{
          label:
            metrics.criticalBlockerCount > 0
              ? `${metrics.criticalBlockerCount} Blocked`
              : 'Nominal',
          variant: metrics.criticalBlockerCount > 0 ? 'error' : 'success',
        }}
      />

      {/* 4. Timetable & Scheduling Health */}
      <StatCard
        title="Timetable Operations"
        value={`${metrics.timetablesPublishedCount} / ${metrics.totalOrganizations}`}
        subtitle={`${metrics.totalCriticalConflicts} critical, ${metrics.totalWarningConflicts} warning conflicts`}
        icon={<Clock className="w-5 h-5" />}
        badge={{
          label:
            metrics.totalCriticalConflicts > 0
              ? `${metrics.totalCriticalConflicts} Conflicts`
              : 'Clean',
          variant: metrics.totalCriticalConflicts > 0 ? 'error' : 'success',
        }}
      />

      {/* 5. Assessment & Reporting Readiness */}
      <StatCard
        title="Reporting Readiness"
        value={`${metrics.reportingReadyPercentage}%`}
        subtitle={`${metrics.reportCardsReadyCount} schools report-card ready, ${metrics.gradingScalesConfiguredCount} scales`}
        icon={<FileCheck2 className="w-5 h-5" />}
        badge={{
          label: `${metrics.reportCardsReadyCount} Ready`,
          variant: metrics.reportingReadyPercentage >= 70 ? 'success' : 'warning',
        }}
      />
    </div>
  );
}
