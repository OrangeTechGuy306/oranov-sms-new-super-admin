'use client';

import React from 'react';
import { OrganizationAcademicOversight } from '@/lib/types/academic-oversight';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';

interface AcademicReadinessChecklistCardProps {
  records: OrganizationAcademicOversight[];
}

export function AcademicReadinessChecklistCard({ records }: AcademicReadinessChecklistCardProps) {
  const activeRecords = records.filter((r) => r.reportingStatus === 'active_reporting');
  const totalActive = activeRecords.length;

  if (totalActive === 0) {
    return (
      <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Academic Configuration Readiness Checklist
        </h3>
        <p className="text-xs text-muted-foreground mt-2">
          No actively reporting schools available in current filtered scope.
        </p>
      </div>
    );
  }

  // Calculate completeness rate for canonical readiness dimensions
  const dimensions = [
    {
      key: 'session_active',
      label: 'Active Academic Session & Valid Dates',
      description: 'Designated active school year with non-inverted start/end dates',
      category: 'Calendar',
      count: activeRecords.filter((r) =>
        r.academicYears?.some((y) => y.isCurrent && y.status === 'ACTIVE' && y.dateValidity === 'valid')
      ).length,
      severity: 'blocker' as const,
    },
    {
      key: 'period_current',
      label: 'Current Academic Term / Semester Designated',
      description: 'Active term running with valid date boundaries',
      category: 'Calendar',
      count: activeRecords.filter((r) => r.activePeriod && r.activePeriod !== 'None').length,
      severity: 'blocker' as const,
    },
    {
      key: 'structure_classes',
      label: 'Class Cohorts & Subject Catalog Configured',
      description: 'Departmental grade cohorts, arms, and subjects structured',
      category: 'Structure',
      count: activeRecords.filter(
        (r) => r.structure && r.structure.totalClasses > 0 && r.structure.totalSubjects > 0
      ).length,
      severity: 'blocker' as const,
    },
    {
      key: 'teacher_allocation',
      label: 'Teacher Subject Allocation Adequacy (>= 80%)',
      description: 'Instructors assigned to curriculum subjects across classes',
      category: 'Faculty',
      count: activeRecords.filter(
        (r) => (r.structure?.teacherAllocationCompletenessPercentage ?? 0) >= 80
      ).length,
      severity: 'warning' as const,
    },
    {
      key: 'curriculum_schemes',
      label: 'Curriculum Blueprints & Schemes of Work',
      description: 'Approved term schemes of work aligned to syllabus standards',
      category: 'Curriculum',
      count: activeRecords.filter(
        (r) => (r.curriculum?.schemesApprovedCount ?? 0) > 0
      ).length,
      severity: 'warning' as const,
    },
    {
      key: 'timetable_published',
      label: 'Master Timetable Published (Zero Critical Conflicts)',
      description: 'Class & room slot matrix published without double-bookings',
      category: 'Timetable',
      count: activeRecords.filter(
        (r) =>
          r.timetables?.timetableStatus === 'PUBLISHED' &&
          r.timetables.criticalConflictsCount === 0
      ).length,
      severity: 'warning' as const,
    },
    {
      key: 'grading_scales',
      label: 'Grading Scale & Passing Standard Configured',
      description: 'Grade bands, GPA points, and pass marks defined',
      category: 'Assessment',
      count: activeRecords.filter(
        (r) => (r.assessmentAndReporting?.gradingScalesCount ?? 0) > 0 && r.assessmentAndReporting.gradingScaleType !== 'NONE'
      ).length,
      severity: 'blocker' as const,
    },
    {
      key: 'report_cards_ready',
      label: 'Report Card Template & Publication Ready',
      description: 'Official report card layout configured for result issuance',
      category: 'Reporting',
      count: activeRecords.filter(
        (r) => r.assessmentAndReporting?.reportCardTemplateReady
      ).length,
      severity: 'warning' as const,
    },
  ];

  return (
    <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Platform Academic Readiness Checklist
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-tenant verification of the 8 canonical prerequisite dimensions required for smooth operations.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full">
          {totalActive} Reporting Schools Monitored
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {dimensions.map((dim) => {
          const percentage = Math.round((dim.count / totalActive) * 100);
          const isComplete = percentage >= 85;
          const isAttention = percentage >= 60 && percentage < 85;

          return (
            <div
              key={dim.key}
              className="p-3 rounded-lg border border-border/80 bg-background/50 space-y-2 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {dim.category}
                </span>
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : isAttention ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-foreground line-clamp-1">
                  {dim.label}
                </h4>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                  {dim.description}
                </p>
              </div>

              {/* Progress Bar & Metric */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[11px] font-medium text-foreground">
                  <span>{dim.count} / {totalActive} Schools</span>
                  <span
                    className={
                      isComplete
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isAttention
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }
                  >
                    {percentage}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isComplete
                        ? 'bg-emerald-500'
                        : isAttention
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
