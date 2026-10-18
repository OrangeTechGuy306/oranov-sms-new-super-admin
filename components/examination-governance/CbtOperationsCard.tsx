'use client';

import React from 'react';
import { OrganizationExamGovernance, CbtExceptionTypeKey } from '@/lib/types/examination-governance';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  MonitorCheck,
  AlertTriangle,
  Clock,
  WifiOff,
  Eye,
  CheckCircle2,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface CbtOperationsCardProps {
  records: OrganizationExamGovernance[];
}

export function CbtOperationsCard({ records }: CbtOperationsCardProps) {
  const cbtOrgs = records.filter((r) => r.cbt.isEnabled);

  const aggregatedCbt = React.useMemo(() => {
    let totalExams = 0;
    let activeExams = 0;
    let scheduledExams = 0;
    let completedExams = 0;
    let totalAttempts = 0;
    let completedAttempts = 0;
    let timedOutAttempts = 0;
    let inProgressAttempts = 0;
    let activeExceptions = 0;

    const exceptionTotals: Record<CbtExceptionTypeKey, number> = {
      CONNECTION_LOST: 0,
      BROWSER_UNFOCUSED: 0,
      TIMEOUT_SUBMISSION: 0,
      SAVE_CONFLICT: 0,
      TIME_EXTENSION_GRANTED: 0,
      UNLOCKED_BY_PROCTOR: 0,
      FORCE_SUBMITTED: 0,
    };

    for (const org of cbtOrgs) {
      const c = org.cbt;
      totalExams += c.totalCbtExams;
      activeExams += c.activeExamsCount;
      scheduledExams += c.scheduledExamsCount;
      completedExams += c.completedExamsCount;
      totalAttempts += c.totalAttempts;
      completedAttempts += c.completedAttempts;
      timedOutAttempts += c.timedOutAttempts;
      inProgressAttempts += c.inProgressAttempts;
      activeExceptions += c.activeExceptionsCount;

      for (const [k, v] of Object.entries(c.exceptionBreakdown || {})) {
        exceptionTotals[k as CbtExceptionTypeKey] =
          (exceptionTotals[k as CbtExceptionTypeKey] || 0) + (v as number);
      }
    }

    const completionRate =
      totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0;

    return {
      totalExams,
      activeExams,
      scheduledExams,
      completedExams,
      totalAttempts,
      completedAttempts,
      timedOutAttempts,
      inProgressAttempts,
      activeExceptions,
      exceptionTotals,
      completionRate,
    };
  }, [cbtOrgs]);

  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MonitorCheck className="w-4 h-4 text-primary" />
              <span>CBT Exam Engine, Candidate Sessions & Operational Telemetry</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live session monitoring, timer-derived attempts, disconnect recovery, and proctor action logs.
            </p>
          </div>

          <Badge variant="neutral" className="font-mono text-xs">
            {cbtOrgs.length} CBT-Active Organizations
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-muted/20 dark:bg-muted/10 border border-border/60 rounded-xl space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Digital CBT Exams</span>
            <div className="text-xl font-bold text-foreground">
              {aggregatedCbt.totalExams}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {aggregatedCbt.activeExams} active · {aggregatedCbt.scheduledExams} scheduled
            </div>
          </div>

          <div className="p-3 bg-muted/20 dark:bg-muted/10 border border-border/60 rounded-xl space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Candidate Attempts</span>
            <div className="text-xl font-bold text-foreground">
              {aggregatedCbt.totalAttempts}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {aggregatedCbt.inProgressAttempts} active attempts now
            </div>
          </div>

          <div className="p-3 bg-muted/20 dark:bg-muted/10 border border-border/60 rounded-xl space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Session Completion Rate</span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {aggregatedCbt.completionRate}%
            </div>
            <div className="text-[10px] text-muted-foreground">
              {aggregatedCbt.completedAttempts} completed · {aggregatedCbt.timedOutAttempts} timed out
            </div>
          </div>

          <div className="p-3 bg-muted/20 dark:bg-muted/10 border border-border/60 rounded-xl space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Operational Exceptions</span>
            <div
              className={`text-xl font-bold ${
                aggregatedCbt.activeExceptions > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-foreground'
              }`}
            >
              {aggregatedCbt.activeExceptions}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Across candidate test sessions
            </div>
          </div>
        </div>

        {/* Exceptions Breakdown and Proctoring Security Guarantee Notice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Exceptions Table */}
          <div className="p-3.5 bg-background border border-border rounded-xl space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Operational Exception Breakdown</span>
              </span>
              <Badge variant="neutral" className="text-[10px]">
                {aggregatedCbt.activeExceptions} Incidents
              </Badge>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <WifiOff className="w-3.5 h-3.5 text-rose-500" />
                  <span>Connection Lost (Auto-buffered)</span>
                </span>
                <strong className="font-mono text-foreground">
                  {aggregatedCbt.exceptionTotals.CONNECTION_LOST}
                </strong>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="w-3.5 h-3.5 text-amber-500" />
                  <span>Browser Focus Lost (Tab switch / blur)</span>
                </span>
                <strong className="font-mono text-foreground">
                  {aggregatedCbt.exceptionTotals.BROWSER_UNFOCUSED}
                </strong>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Timeout Forced Submissions</span>
                </span>
                <strong className="font-mono text-foreground">
                  {aggregatedCbt.exceptionTotals.TIMEOUT_SUBMISSION}
                </strong>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Proctor Time Extensions</span>
                </span>
                <strong className="font-mono text-foreground">
                  {aggregatedCbt.exceptionTotals.TIME_EXTENSION_GRANTED}
                </strong>
              </div>
            </div>
          </div>

          {/* Security & Proctoring Governance Disclaimer */}
          <div className="p-3.5 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <ShieldAlert className="w-4 h-4" />
                <span>Empirical Proctoring & Security Policy</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                The platform currently operates on <strong className="text-foreground">physical human invigilation</strong> with client-side focus loss telemetry. Automated webcam facial analysis, biometrics, and audio proctoring are currently marked as <strong className="text-foreground">Missing / Not Implemented</strong> in the tenant application.
              </p>
            </div>

            <div className="pt-2 border-t border-primary/10 flex items-center gap-2 text-[10px] text-muted-foreground">
              <Info className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span>Super-Admin maintains strict anti-hallucination standards: physical proctoring is never reported as AI automated proctoring.</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
