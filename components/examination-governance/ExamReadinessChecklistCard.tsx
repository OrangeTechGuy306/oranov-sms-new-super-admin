'use client';

import React from 'react';
import { OrganizationExamGovernance, ExamReadinessCheckId } from '@/lib/types/examination-governance';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Layers,
  FileCheck2,
  Clock,
  Award,
  MonitorCheck,
  FileText,
  Sliders,
} from 'lucide-react';

interface ExamReadinessChecklistCardProps {
  records: OrganizationExamGovernance[];
}

interface ChecklistDimensionMeta {
  id: ExamReadinessCheckId;
  title: string;
  category: string;
  icon: React.ReactNode;
  whyItMatters: string;
  remediationAdvice: string;
}

const DIMENSIONS: ChecklistDimensionMeta[] = [
  {
    id: 'ACTIVE_ACADEMIC_PERIOD',
    title: 'Active Session & Term',
    category: 'Calendar Prerequisites',
    icon: <Calendar className="w-4 h-4 text-primary" />,
    whyItMatters: 'Assessments cannot be scheduled or weighted without an authoritative calendar context.',
    remediationAdvice: 'Designate current session and active term in Academic Settings.',
  },
  {
    id: 'CLASS_SUBJECT_MAPPING',
    title: 'Class & Subject Curriculum Mapping',
    category: 'Academic Structure',
    icon: <Layers className="w-4 h-4 text-indigo-500" />,
    whyItMatters: 'Every assessment component must resolve to an authorized class cohort and subject code.',
    remediationAdvice: 'Map examinable subjects and class arms in Academics configuration.',
  },
  {
    id: 'ASSESSMENT_TYPES_WEIGHTS',
    title: 'Assessment Types & Cumulative Weights',
    category: 'Assessment Configuration',
    icon: <Sliders className="w-4 h-4 text-emerald-500" />,
    whyItMatters: 'Incomplete or unweighted components prevent final terminal result calculation.',
    remediationAdvice: 'Configure assessment types and percentage contributions (Continuous Assessment + Exams).',
  },
  {
    id: 'EXAM_PERIOD_CONFIGURED',
    title: 'Examination Period & Series Schedule',
    category: 'Series Governance',
    icon: <Clock className="w-4 h-4 text-amber-500" />,
    whyItMatters: 'Defines the official window during which tests, exams, and CBT sessions occur.',
    remediationAdvice: 'Create and publish an exam series under Examinations > Exam Periods.',
  },
  {
    id: 'TIMETABLE_ROOM_INVIGILATION',
    title: 'Timetable Scheduling & Invigilation',
    category: 'Scheduling Logistics',
    icon: <Clock className="w-4 h-4 text-cyan-500" />,
    whyItMatters: 'Unassigned rooms or invigilators cause operational chaos on examination days.',
    remediationAdvice: 'Resolve room double-bookings and assign invigilators to all scheduled slots.',
  },
  {
    id: 'GRADING_SCALE_CONFIGURED',
    title: 'Grading Scales & Passing Thresholds',
    category: 'Grading Standards',
    icon: <Award className="w-4 h-4 text-purple-500" />,
    whyItMatters: 'Raw scores cannot be converted into report cards or transcripts without a published scale.',
    remediationAdvice: 'Configure and publish a grading scale under Examinations > Grading Scales.',
  },
  {
    id: 'CBT_READINESS_OR_EXEMPT',
    title: 'CBT Question Bank & Blueprints',
    category: 'CBT Operations',
    icon: <MonitorCheck className="w-4 h-4 text-blue-500" />,
    whyItMatters: 'CBT exams require approved questions and blueprints before launching digital testing.',
    remediationAdvice: 'Review and approve question items in Examinations > CBT Question Bank.',
  },
  {
    id: 'REPORT_CARD_PIPELINE',
    title: 'Report Card Template & Broadsheets',
    category: 'Publishing Readiness',
    icon: <FileText className="w-4 h-4 text-teal-500" />,
    whyItMatters: 'End-of-term results and parent reports cannot be dispatched without a validated template.',
    remediationAdvice: 'Verify report card layout and signature blocks in Examinations > Report Cards.',
  },
];

export function ExamReadinessChecklistCard({ records }: ExamReadinessChecklistCardProps) {
  const activeRecords = records.filter(
    (r) => r.lifecycleStatus !== 'inactive' && r.lifecycleStatus !== 'archived'
  );
  const totalActive = activeRecords.length;

  // Calculate pass rates per dimension
  const stats = React.useMemo(() => {
    return DIMENSIONS.map((dim) => {
      let passed = 0;
      let warnings = 0;
      let failed = 0;
      let exempt = 0;

      for (const org of activeRecords) {
        const check = org.readiness.checks.find((c) => c.id === dim.id);
        if (!check || check.status === 'not_applicable') {
          exempt++;
        } else if (check.status === 'passed') {
          passed++;
        } else if (check.status === 'warning') {
          warnings++;
        } else {
          failed++;
        }
      }

      const applicable = totalActive - exempt;
      const passRate = applicable > 0 ? Math.round((passed / applicable) * 100) : 100;

      return {
        ...dim,
        passed,
        warnings,
        failed,
        exempt,
        passRate,
      };
    });
  }, [activeRecords, totalActive]);

  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-primary" />
              <span>8-Point Canonical Examination & Assessment Readiness Checklist</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Platform-level prerequisite verification evaluated deterministically across all active schools.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Scope:</span>
            <Badge variant="neutral" className="font-mono text-[11px]">
              {totalActive} Active Organizations
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((item) => {
            const isGood = item.passRate >= 80;
            const isWarning = item.passRate >= 50 && item.passRate < 80;

            return (
              <div
                key={item.id}
                className="p-3 bg-muted/20 dark:bg-muted/10 border border-border/60 rounded-xl space-y-2 flex flex-col justify-between hover:border-primary/40 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-background rounded-lg border border-border shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-xs font-semibold leading-tight line-clamp-1 text-foreground">
                        {item.title}
                      </span>
                    </div>

                    {isGood ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.whyItMatters}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Compliance:</span>
                    <span
                      className={`font-semibold font-mono ${
                        isGood
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isWarning
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {item.passRate}% ({item.passed}/{totalActive - item.exempt})
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isGood
                          ? 'bg-emerald-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.passRate}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>
                      {item.warnings > 0 && `${item.warnings} warn · `}
                      {item.failed > 0 && `${item.failed} blocked`}
                      {item.failed === 0 && item.warnings === 0 && 'All nominal'}
                    </span>
                    {item.exempt > 0 && <span>{item.exempt} exempt</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
