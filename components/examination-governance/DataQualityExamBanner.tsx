'use client';

import React, { useState } from 'react';
import { OrganizationExamGovernance, ExamDataQualityIssue } from '@/lib/types/examination-governance';
import { AlertTriangle, AlertOctagon, Info, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface DataQualityExamBannerProps {
  records: OrganizationExamGovernance[];
}

export function DataQualityExamBanner({ records }: DataQualityExamBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const allIssues: Array<{
    orgId: string;
    orgName: string;
    orgCode: string;
    issue: ExamDataQualityIssue;
  }> = [];

  for (const r of records) {
    if (r.dataQualityIssues) {
      for (const issue of r.dataQualityIssues) {
        allIssues.push({
          orgId: r.organizationId,
          orgName: r.organizationName,
          orgCode: r.organizationCode,
          issue,
        });
      }
    }
  }

  const criticalCount = allIssues.filter((i) => i.issue.severity === 'CRITICAL').length;
  const warningCount = allIssues.filter((i) => i.issue.severity === 'WARNING').length;
  const infoCount = allIssues.filter((i) => i.issue.severity === 'INFO').length;

  if (allIssues.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong className="font-semibold">Assessment Configuration Integrity Nominal:</strong> No active exam schedule collisions, unassigned invigilators, missing grading scales, or unapproved CBT questions detected in current filtered scope.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      <div className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
              <span>Assessment & Examination Governance Audit Findings</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                ({allIssues.length} findings across {records.length} schools)
              </span>
            </h3>
            <div className="flex items-center gap-3 mt-1 text-[11px]">
              {criticalCount > 0 && (
                <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  {criticalCount} Critical Blockers
                </span>
              )}
              {warningCount > 0 && (
                <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {warningCount} Warnings
                </span>
              )}
              {infoCount > 0 && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Info className="w-3.5 h-3.5" />
                  {infoCount} Info Notices
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Audit Log' : 'Inspect Findings'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-border/80 divide-y divide-border/60 text-xs bg-background/50 max-h-96 overflow-y-auto">
          {allIssues.map((item) => (
            <div key={item.issue.id} className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-muted/30 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.issue.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : item.issue.severity === 'WARNING'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {item.issue.severity}
                  </span>
                  <span className="font-semibold text-foreground">{item.issue.title}</span>
                  <span className="text-muted-foreground font-mono text-[11px]">[{item.issue.category}]</span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {item.issue.description}
                </p>
                <div className="text-[11px] text-foreground font-medium flex items-center gap-1 pt-0.5">
                  <strong className="text-primary font-semibold">Remediation:</strong> {item.issue.remediationRecommendation}
                </div>
              </div>

              <div className="shrink-0 text-right sm:self-center font-medium text-foreground text-[11px]">
                <div>{item.orgName}</div>
                <span className="text-muted-foreground font-mono text-[10px]">({item.orgCode})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
