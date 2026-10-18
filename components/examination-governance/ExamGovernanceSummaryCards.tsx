'use client';

import React from 'react';
import { AggregatedExamGovernanceMetrics } from '@/lib/types/examination-governance';
import { StatCard } from '@/components/ui/StatCard';
import {
  Building2,
  ShieldCheck,
  FileCheck2,
  MonitorCheck,
  Clock,
} from 'lucide-react';

interface ExamGovernanceSummaryCardsProps {
  metrics: AggregatedExamGovernanceMetrics;
}

export function ExamGovernanceSummaryCards({ metrics }: ExamGovernanceSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Organizations Monitored */}
      <StatCard
        title="Organizations Monitored"
        value={metrics.totalOrganizations}
        subtitle={`${metrics.organizationsWithExams} with exams enabled, ${metrics.organizationsWithCbt} CBT ready`}
        icon={<Building2 className="w-5 h-5" />}
        badge={{
          label: `${metrics.organizationsMarkedReady} Ready`,
          variant: 'success',
        }}
      />

      {/* 2. Examination Readiness Index */}
      <StatCard
        title="Exam Readiness Index"
        value={`${metrics.averageReadinessScore}%`}
        subtitle={`${metrics.organizationsMarkedReady} ready, ${metrics.organizationsAttentionRequired} attention, ${metrics.organizationsNotReady} blocked`}
        icon={<ShieldCheck className="w-5 h-5" />}
        badge={{
          label:
            metrics.organizationsNotReady > 0
              ? `${metrics.organizationsNotReady} Blocked`
              : 'Nominal',
          variant: metrics.organizationsNotReady > 0 ? 'error' : 'success',
        }}
      />

      {/* 3. Assessments Pipeline */}
      <StatCard
        title="Assessments Pipeline"
        value={metrics.scheduledAssessments + metrics.marksEntryAssessments + metrics.assessmentsAwaitingResults}
        subtitle={`${metrics.scheduledAssessments} scheduled, ${metrics.marksEntryAssessments} marks entry, ${metrics.assessmentsAwaitingResults} awaiting results`}
        icon={<FileCheck2 className="w-5 h-5" />}
        badge={{
          label: `${metrics.publishedAssessments} Published`,
          variant: 'info',
        }}
      />

      {/* 4. CBT Delivery & Attempts */}
      <StatCard
        title="CBT Operations"
        value={metrics.totalCbtAttempts}
        subtitle={`${metrics.completedCbtAttempts} completed attempts across ${metrics.totalCbtExams} digital exams`}
        icon={<MonitorCheck className="w-5 h-5" />}
        badge={{
          label:
            metrics.totalCbtExceptions > 0
              ? `${metrics.totalCbtExceptions} Exceptions`
              : 'Clean',
          variant: metrics.totalCbtExceptions > 0 ? 'warning' : 'success',
        }}
      />

      {/* 5. Timetable Logistics & Conflicts */}
      <StatCard
        title="Timetable Operations"
        value={metrics.totalExamSlots}
        subtitle={`${metrics.unassignedInvigilatorsCount} unassigned invigilators, ${metrics.timetableConflictsCount} schedule conflicts`}
        icon={<Clock className="w-5 h-5" />}
        badge={{
          label:
            metrics.timetableConflictsCount > 0
              ? `${metrics.timetableConflictsCount} Conflicts`
              : 'Zero Clashes',
          variant: metrics.timetableConflictsCount > 0 ? 'error' : 'success',
        }}
      />
    </div>
  );
}
