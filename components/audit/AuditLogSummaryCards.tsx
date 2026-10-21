'use client';

import React from 'react';
import { AuditComplianceMetrics } from '@/lib/types/compliance';
import {
  FileText,
  ShieldAlert,
  CheckCircle2,
  FileCheck,
  Archive,
} from 'lucide-react';

interface AuditLogSummaryCardsProps {
  metrics: AuditComplianceMetrics;
  filteredCount?: number;
}

export function AuditLogSummaryCards({ metrics, filteredCount }: AuditLogSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {/* 1. Total Audit Trail Records */}
      <div className="bg-card p-3.5 rounded-xl border border-border shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Audit Trail</span>
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-foreground">
              {filteredCount !== undefined ? filteredCount : metrics.totalAuditEvents}
            </span>
            {filteredCount !== undefined && filteredCount !== metrics.totalAuditEvents && (
              <span className="text-[11px] text-muted-foreground">of {metrics.totalAuditEvents}</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              {metrics.criticalAuditEvents}
            </span>{' '}
            critical severities
          </p>
        </div>
      </div>

      {/* 2. Security Events & Triage */}
      <div className="bg-card p-3.5 rounded-xl border border-border shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Security Events</span>
          <ShieldAlert className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-foreground">{metrics.securityEventsCount}</span>
            {metrics.unreviewedSecurityEvents > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {metrics.unreviewedSecurityEvents} unreviewed
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Synthetic triage sandbox
          </p>
        </div>
      </div>

      {/* 3. Compliance Controls */}
      <div className="bg-card p-3.5 rounded-xl border border-border shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Governance Controls</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-foreground">{metrics.totalControls}</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {metrics.verifiedControls} verified
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {metrics.evidenceRequiredControls} evidence required
          </p>
        </div>
      </div>

      {/* 4. Evidence Records */}
      <div className="bg-card p-3.5 rounded-xl border border-border shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Verified Evidence</span>
          <FileCheck className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-foreground">{metrics.totalEvidenceRecords}</span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
              {metrics.verifiedEvidenceRecords} verified
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Mapped to test suites & code
          </p>
        </div>
      </div>

      {/* 5. Data Retention Policies */}
      <div className="bg-card p-3.5 rounded-xl border border-border shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Retention & Holds</span>
          <Archive className="w-4 h-4 text-purple-500" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-foreground">{metrics.activePolicies}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              {metrics.activeLegalHolds} holds
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Statutory policy schedules
          </p>
        </div>
      </div>
    </div>
  );
}
