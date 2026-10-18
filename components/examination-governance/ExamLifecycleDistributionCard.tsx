'use client';

import React from 'react';
import { OrganizationExamGovernance } from '@/lib/types/examination-governance';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Activity,
  MonitorCheck,
  FileCheck2,
  CheckCircle2,
  Clock,
  Lock,
} from 'lucide-react';

interface ExamLifecycleDistributionCardProps {
  records: OrganizationExamGovernance[];
}

export function ExamLifecycleDistributionCard({ records }: ExamLifecycleDistributionCardProps) {
  // Aggregate lifecycle stages
  const totals = React.useMemo(() => {
    let scheduled = 0;
    let marksEntry = 0;
    let submitted = 0;
    let underReview = 0;
    let approved = 0;
    let published = 0;
    let locked = 0;

    let cbtFullCount = 0;
    let cbtHybridCount = 0;
    let paperCount = 0;

    const typesMap: Record<string, number> = {};

    for (const org of records) {
      const a = org.assessments;
      scheduled += a.scheduledCount;
      marksEntry += a.marksEntryCount;
      submitted += a.submittedCount;
      underReview += a.underReviewCount;
      approved += a.approvedCount;
      published += a.publishedCount;
      locked += a.lockedCount;

      if (org.deliveryMode === 'CBT_FULL') cbtFullCount++;
      else if (org.deliveryMode === 'CBT_HYBRID') cbtHybridCount++;
      else paperCount++;

      for (const [k, v] of Object.entries(a.byType || {})) {
        typesMap[k] = (typesMap[k] || 0) + (v as number);
      }
    }

    const totalAsms = scheduled + marksEntry + submitted + underReview + approved + published + locked;

    return {
      totalAsms,
      scheduled,
      marksEntry,
      submitted,
      underReview,
      approved,
      published,
      locked,
      cbtFullCount,
      cbtHybridCount,
      paperCount,
      typesMap,
    };
  }, [records]);

  const stages = [
    { label: 'Scheduled', count: totals.scheduled, icon: <Clock className="w-3.5 h-3.5 text-blue-500" />, color: 'bg-blue-500' },
    { label: 'Marks Entry', count: totals.marksEntry, icon: <Activity className="w-3.5 h-3.5 text-amber-500" />, color: 'bg-amber-500' },
    { label: 'Submitted', count: totals.submitted, icon: <FileCheck2 className="w-3.5 h-3.5 text-indigo-500" />, color: 'bg-indigo-500' },
    { label: 'Under Review', count: totals.underReview, icon: <Clock className="w-3.5 h-3.5 text-purple-500" />, color: 'bg-purple-500' },
    { label: 'Approved', count: totals.approved, icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />, color: 'bg-emerald-500' },
    { label: 'Published', count: totals.published, icon: <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />, color: 'bg-teal-500' },
    { label: 'Locked/Archived', count: totals.locked, icon: <Lock className="w-3.5 h-3.5 text-zinc-500" />, color: 'bg-zinc-500' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Assessment Lifecycle Funnel */}
      <Card className="lg:col-span-2 border border-border shadow-xs">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span>Assessment Lifecycle Progression Pipeline</span>
            </CardTitle>
            <Badge variant="neutral" className="font-mono text-xs">
              {totals.totalAsms} Total Components
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {stages.map((stage) => {
              const pct = totals.totalAsms > 0 ? Math.round((stage.count / totals.totalAsms) * 100) : 0;
              return (
                <div
                  key={stage.label}
                  className="p-2.5 bg-muted/20 dark:bg-muted/10 border border-border/60 rounded-xl space-y-1.5 text-center flex flex-col justify-between"
                >
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    {stage.icon}
                    <span className="truncate">{stage.label}</span>
                  </div>
                  <div className="text-base font-bold text-foreground">
                    {stage.count}
                  </div>
                  <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                    <div className={`h-full ${stage.color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{pct}%</span>
                </div>
              );
            })}
          </div>

          {/* Assessment Types Distribution */}
          <div className="pt-2 border-t border-border/50 space-y-2">
            <span className="text-xs font-semibold text-foreground">Assessment Types Breakdown:</span>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(totals.typesMap)
                .filter(([, v]) => v > 0)
                .map(([typeKey, count]) => (
                  <div
                    key={typeKey}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-background border border-border rounded-lg text-[11px]"
                  >
                    <span className="text-muted-foreground font-medium">
                      {typeKey.replace(/_/g, ' ')}:
                    </span>
                    <strong className="text-foreground font-mono">{count}</strong>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Delivery Mode Adoption */}
      <Card className="border border-border shadow-xs flex flex-col justify-between">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MonitorCheck className="w-4 h-4 text-primary" />
            <span>Delivery Mode Adoption</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <div className="space-y-3">
            {/* CBT Full */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">CBT Full (Digital Testing)</span>
                <span className="font-mono text-muted-foreground">
                  {totals.cbtFullCount} ({records.length > 0 ? Math.round((totals.cbtFullCount / records.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${records.length > 0 ? (totals.cbtFullCount / records.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* CBT Hybrid */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">CBT Hybrid (Digital + Paper)</span>
                <span className="font-mono text-muted-foreground">
                  {totals.cbtHybridCount} ({records.length > 0 ? Math.round((totals.cbtHybridCount / records.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{ width: `${records.length > 0 ? (totals.cbtHybridCount / records.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Paper Based */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Paper-Based Only</span>
                <span className="font-mono text-muted-foreground">
                  {totals.paperCount} ({records.length > 0 ? Math.round((totals.paperCount / records.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${records.length > 0 ? (totals.paperCount / records.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-muted/30 border border-border/50 rounded-lg text-[11px] text-muted-foreground leading-relaxed">
            Paper-based schools are automatically exempted from CBT question bank and blueprint prerequisite checks in platform readiness evaluations.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
