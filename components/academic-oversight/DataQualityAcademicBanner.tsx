'use client';

import React, { useState } from 'react';
import { OrganizationAcademicOversight, AcademicDataQualityIssue } from '@/lib/types/academic-oversight';
import { AlertTriangle, AlertOctagon, Info, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface DataQualityAcademicBannerProps {
  records: OrganizationAcademicOversight[];
}

export function DataQualityAcademicBanner({ records }: DataQualityAcademicBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Collect all data quality issues across records with their parent organization metadata
  const allIssues: Array<{
    orgId: string;
    orgName: string;
    orgCode: string;
    issue: AcademicDataQualityIssue;
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

  const criticalCount = allIssues.filter((i) => i.issue.severity === 'critical').length;
  const warningCount = allIssues.filter((i) => i.issue.severity === 'warning').length;
  const infoCount = allIssues.filter((i) => i.issue.severity === 'info').length;

  if (allIssues.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong className="font-semibold">Academic Data Quality Integrity Nominal:</strong> No active calendar inconsistencies, critical timetable clashes, unassigned subjects, or missing grading scales detected in filtered scope.
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
              <span>Academic Data Quality & Configuration Audit</span>
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
                  {infoCount} Info
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
          <span>{isExpanded ? 'Hide Findings' : 'Inspect Findings'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-border/80 divide-y divide-border/60 text-xs bg-background/50 max-h-96 overflow-y-auto">
          {allIssues.map((item, idx) => {
            const isCrit = item.issue.severity === 'critical';
            const isWarn = item.issue.severity === 'warning';

            return (
              <div key={`${item.orgId}_${item.issue.code}_${idx}`} className="p-3.5 space-y-1 hover:bg-muted/40 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isCrit
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                          : isWarn
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                      }`}
                    >
                      {item.issue.severity}
                    </span>
                    <span className="font-semibold text-foreground">
                      {item.orgName} ({item.orgCode})
                    </span>
                    <span className="text-[10px] uppercase font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                      {item.issue.category}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-muted-foreground">{item.issue.code}</span>
                </div>

                <p className="text-foreground/90 pl-1">{item.issue.message}</p>

                {item.issue.suggestedAction && (
                  <p className="text-[11px] text-primary dark:text-primary-foreground font-medium pl-1">
                    ↳ Suggested Remediation: {item.issue.suggestedAction}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
