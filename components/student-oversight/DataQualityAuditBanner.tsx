'use client';

import React from 'react';
import { OrganizationStudentOversight } from '@/lib/types/student-oversight';
import { AlertTriangle, Info, CheckCircle2, AlertOctagon } from 'lucide-react';

interface DataQualityAuditBannerProps {
  records: OrganizationStudentOversight[];
}

export function DataQualityAuditBanner({ records }: DataQualityAuditBannerProps) {
  // Collect all issues across the records
  const allIssues = records.flatMap((org) =>
    org.dataQualityIssues.map((issue) => ({
      ...issue,
      organizationName: org.organizationName,
      organizationCode: org.organizationCode,
    }))
  );

  if (allIssues.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div className="text-xs">
          <p className="font-semibold">All Tenant Student Oversight Metrics Verified</p>
          <p className="text-[11px] opacity-90">
            No capacity overages, unmapped lifecycle statuses, or missing session configurations detected among in-scope schools.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
        <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Data Governance & Reporting Quality Audit ({allIssues.length} Conditions Flagged)
        </h4>
        <span className="text-[11px] text-muted-foreground font-mono">
          System Automated Checks
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {allIssues.map((issue) => {
          const isCritical = issue.severity === 'critical';
          const isWarning = issue.severity === 'warning';

          return (
            <div
              key={issue.id}
              className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                isCritical
                  ? 'border-rose-200 bg-rose-50/70 text-rose-900 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-200'
                  : isWarning
                  ? 'border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200'
                  : 'border-blue-200 bg-blue-50/70 text-blue-900 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-200'
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  {isCritical ? (
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                  {issue.title}
                </span>
                <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-background/60">
                  {issue.organizationCode}
                </span>
              </div>

              <p className="text-[11px] opacity-90 leading-relaxed">{issue.description}</p>

              {issue.affectedCount > 0 && (
                <div className="pt-1 text-[10px] font-mono font-medium opacity-80">
                  Affected records: {issue.affectedCount.toLocaleString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
