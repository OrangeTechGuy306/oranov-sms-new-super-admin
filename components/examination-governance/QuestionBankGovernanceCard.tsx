'use client';

import React from 'react';
import { OrganizationExamGovernance, QuestionTypeKey, QuestionDifficultyKey } from '@/lib/types/examination-governance';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldCheck,
  FileQuestion,
} from 'lucide-react';

interface QuestionBankGovernanceCardProps {
  records: OrganizationExamGovernance[];
}

export function QuestionBankGovernanceCard({ records }: QuestionBankGovernanceCardProps) {
  const qbOrgs = records.filter((r) => r.questionBank.isEnabled);

  const totals = React.useMemo(() => {
    let totalQuestions = 0;
    let approved = 0;
    let draft = 0;
    let inReview = 0;
    let collections = 0;
    let blueprints = 0;

    const typeTotals: Record<QuestionTypeKey, number> = {
      SINGLE_CHOICE: 0,
      MULTIPLE_SELECT: 0,
      TRUE_FALSE: 0,
      SHORT_ANSWER: 0,
      ESSAY: 0,
      FILL_IN_BLANKS: 0,
      MATCHING: 0,
      NUMERIC: 0,
    };

    const diffTotals: Record<QuestionDifficultyKey, number> = {
      EASY: 0,
      MEDIUM: 0,
      HARD: 0,
      EXPERT: 0,
    };

    for (const org of qbOrgs) {
      const qb = org.questionBank;
      totalQuestions += qb.totalQuestions;
      approved += qb.approvedQuestions;
      draft += qb.draftQuestions;
      inReview += qb.underReviewQuestions;
      collections += qb.totalCollections;
      blueprints += qb.activeBlueprintsCount;

      for (const [k, v] of Object.entries(qb.byType || {})) {
        typeTotals[k as QuestionTypeKey] = (typeTotals[k as QuestionTypeKey] || 0) + (v as number);
      }

      for (const [k, v] of Object.entries(qb.byDifficulty || {})) {
        diffTotals[k as QuestionDifficultyKey] = (diffTotals[k as QuestionDifficultyKey] || 0) + (v as number);
      }
    }

    const approvalRate = totalQuestions > 0 ? Math.round((approved / totalQuestions) * 100) : 0;

    return {
      totalQuestions,
      approved,
      draft,
      inReview,
      collections,
      blueprints,
      typeTotals,
      diffTotals,
      approvalRate,
    };
  }, [qbOrgs]);

  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-primary" />
              <span>CBT Question Bank Governance & Blueprint Taxonomy</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Aggregated repository metrics across question types, difficulty levels, and departmental review workflows.
            </p>
          </div>

          <Badge variant="neutral" className="font-mono text-xs">
            {totals.totalQuestions} Questions in Platform Bank
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-muted/20 dark:bg-muted/10 border border-border/60 rounded-xl space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Total Questions</span>
            <div className="text-xl font-bold text-foreground">
              {totals.totalQuestions}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Across {qbOrgs.length} question banks
            </div>
          </div>

          <div className="p-3 bg-muted/20 dark:bg-muted/10 border border-border/60 rounded-xl space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Approved for Exam</span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {totals.approved} ({totals.approvalRate}%)
            </div>
            <div className="text-[10px] text-muted-foreground">
              Vetted by department heads
            </div>
          </div>

          <div className="p-3 bg-muted/20 dark:bg-muted/10 border border-border/60 rounded-xl space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Under Review / Draft</span>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {totals.inReview + totals.draft}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {totals.inReview} review · {totals.draft} draft
            </div>
          </div>

          <div className="p-3 bg-muted/20 dark:bg-muted/10 border border-border/60 rounded-xl space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Blueprints & Collections</span>
            <div className="text-xl font-bold text-foreground">
              {totals.blueprints} / {totals.collections}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Active blueprints / packages
            </div>
          </div>
        </div>

        {/* Question Types & Difficulty Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* 1. Types Distribution */}
          <div className="p-3.5 bg-background border border-border rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>8 Supported Question Formats</span>
              <Badge variant="neutral" className="text-[10px]">
                {totals.totalQuestions} Items
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(totals.typeTotals).map(([typeKey, count]) => (
                <div
                  key={typeKey}
                  className="flex items-center justify-between p-2 bg-muted/20 rounded-lg text-[11px]"
                >
                  <span className="text-muted-foreground truncate">
                    {typeKey.replace(/_/g, ' ')}
                  </span>
                  <strong className="font-mono text-foreground shrink-0 ml-1">
                    {count}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Difficulty Distribution */}
          <div className="p-3.5 bg-background border border-border rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span>Cognitive Difficulty Distribution</span>
                <Badge variant="neutral" className="text-[10px]">
                  Taxonomy Balance
                </Badge>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                {Object.entries(totals.diffTotals).map(([diffKey, count]) => {
                  const pct =
                    totals.totalQuestions > 0 ? Math.round((count / totals.totalQuestions) * 100) : 0;
                  const color =
                    diffKey === 'EASY'
                      ? 'bg-emerald-500'
                      : diffKey === 'MEDIUM'
                      ? 'bg-blue-500'
                      : diffKey === 'HARD'
                      ? 'bg-amber-500'
                      : 'bg-purple-500';

                  return (
                    <div key={diffKey} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-foreground">{diffKey}</span>
                        <span className="font-mono text-muted-foreground">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Zero question stems, solution keys, or rubrics are exposed in Super-Admin.</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
