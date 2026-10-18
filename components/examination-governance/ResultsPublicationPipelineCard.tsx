'use client';

import React from 'react';
import { OrganizationExamGovernance } from '@/lib/types/examination-governance';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Award,
  ShieldCheck,
} from 'lucide-react';

interface ResultsPublicationPipelineCardProps {
  records: OrganizationExamGovernance[];
}

export function ResultsPublicationPipelineCard({ records }: ResultsPublicationPipelineCardProps) {
  const summary = React.useMemo(() => {
    let reportCardsReady = 0;
    let broadsheetsReady = 0;
    let transcriptsReady = 0;
    let digitalVerificationEnabled = 0;

    let publishedCount = 0;
    let approvedCount = 0;
    let pendingApprovalCount = 0;
    let unpublishedCount = 0;

    const scaleTypeMap: Record<string, number> = {};

    for (const org of records) {
      const res = org.resultsPublication;
      if (res.reportCardTemplateReady) reportCardsReady++;
      if (res.broadsheetReady) broadsheetsReady++;
      if (res.transcriptsReady) transcriptsReady++;
      if (res.digitalVerificationEnabled) digitalVerificationEnabled++;

      if (res.publicationStatus === 'PUBLISHED') publishedCount++;
      else if (res.publicationStatus === 'APPROVED') approvedCount++;
      else if (res.publicationStatus === 'PENDING_APPROVAL') pendingApprovalCount++;
      else unpublishedCount++;

      const scaleType = org.grading.scaleType;
      scaleTypeMap[scaleType] = (scaleTypeMap[scaleType] || 0) + 1;
    }

    return {
      reportCardsReady,
      broadsheetsReady,
      transcriptsReady,
      digitalVerificationEnabled,
      publishedCount,
      approvedCount,
      pendingApprovalCount,
      unpublishedCount,
      scaleTypeMap,
    };
  }, [records]);

  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <span>Grading Scales, Result Moderation & Report-Card Publication Pipeline</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gradebook conversion standards, master class broadsheets, terminal report cards, and digital verification.
            </p>
          </div>

          <Badge variant="neutral" className="font-mono text-xs">
            {summary.reportCardsReady} / {records.length} Schools Publication-Ready
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-muted/20 dark:bg-muted/10 border border-border/60 rounded-xl space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Report Card Templates</span>
            <div className="text-xl font-bold text-foreground">
              {summary.reportCardsReady}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {records.length > 0 ? Math.round((summary.reportCardsReady / records.length) * 100) : 0}% of schools ready
            </div>
          </div>

          <div className="p-3 bg-muted/20 dark:bg-muted/10 border border-border/60 rounded-xl space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Master Broadsheets</span>
            <div className="text-xl font-bold text-foreground">
              {summary.broadsheetsReady}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Class broadsheet computation active
            </div>
          </div>

          <div className="p-3 bg-muted/20 dark:bg-muted/10 border border-border/60 rounded-xl space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Cumulative Transcripts</span>
            <div className="text-xl font-bold text-foreground">
              {summary.transcriptsReady}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Multi-term GPA & credit tracking
            </div>
          </div>

          <div className="p-3 bg-muted/20 dark:bg-muted/10 border border-border/60 rounded-xl space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Digital QR Verification</span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {summary.digitalVerificationEnabled}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Anti-tamper credential validation
            </div>
          </div>
        </div>

        {/* Secondary Details: Grading Scales Distribution & Publication Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Grading Standards */}
          <div className="p-3.5 bg-background border border-border rounded-xl space-y-2.5">
            <span className="text-xs font-semibold text-foreground">Active Grading Standards Across Schools</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(summary.scaleTypeMap).map(([scaleType, count]) => (
                <div
                  key={scaleType}
                  className="flex items-center justify-between p-2 bg-muted/20 rounded-lg text-[11px]"
                >
                  <span className="text-muted-foreground font-medium">
                    {scaleType.replace(/_/g, ' ')}
                  </span>
                  <strong className="font-mono text-foreground shrink-0 ml-1">
                    {count} {count === 1 ? 'school' : 'schools'}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* Results Status */}
          <div className="p-3.5 bg-background border border-border rounded-xl space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-foreground">Publication Status Breakdown</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-muted/20 rounded-lg flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Published:</span>
                  <strong className="font-mono text-teal-600 dark:text-teal-400">
                    {summary.publishedCount}
                  </strong>
                </div>
                <div className="p-2 bg-muted/20 rounded-lg flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Approved:</span>
                  <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                    {summary.approvedCount}
                  </strong>
                </div>
                <div className="p-2 bg-muted/20 rounded-lg flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Pending Approval:</span>
                  <strong className="font-mono text-amber-600 dark:text-amber-400">
                    {summary.pendingApprovalCount}
                  </strong>
                </div>
                <div className="p-2 bg-muted/20 rounded-lg flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Unpublished:</span>
                  <strong className="font-mono text-muted-foreground">
                    {summary.unpublishedCount}
                  </strong>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Super-Admin observes publishing progress without overriding school principal sign-offs.</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
