'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  Shield,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { TenantGovernanceSummary } from '@/lib/types/data-governance';

interface TenantGovernanceDrawerProps {
  tenant: TenantGovernanceSummary | null;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export function TenantGovernanceDrawer({
  tenant,
  onClose,
  onNavigateTab,
}: TenantGovernanceDrawerProps) {
  if (!tenant) return null;

  const getCompletenessBadge = (badge: string) => {
    switch (badge) {
      case 'complete':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200';
      case 'review_required':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200';
      case 'incomplete':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md h-full overflow-y-auto border-l border-border bg-card p-6 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {tenant.tenantId}
                </span>
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getCompletenessBadge(
                    tenant.governanceCompleteness
                  )}`}
                >
                  {tenant.governanceCompleteness.replace(/_/g, ' ')}
                </span>
              </div>
              <h2 className="text-base font-bold text-foreground">{tenant.tenantName}</h2>
              <div className="text-xs text-muted-foreground flex items-center justify-between gap-2 mt-0.5">
                <span>Tier: <span className="font-semibold capitalize text-foreground">{tenant.tier}</span> • Code: <span className="font-mono">{tenant.tenantCode}</span></span>
                <Link
                  href={`/organizations/${tenant.tenantId}`}
                  className="text-primary hover:underline text-[11px] font-medium flex items-center gap-1 shrink-0"
                >
                  View School <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 space-y-4 text-xs">
            {/* Coverage Meters */}
            <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Data Classification Coverage</span>
                  <span className="font-bold text-foreground">
                    {tenant.classificationCoveragePercent}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${tenant.classificationCoveragePercent}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Retention Policies Assigned</span>
                  <span className="font-bold text-foreground">
                    {tenant.retentionPoliciesAssignedCount} Policies
                  </span>
                </div>
              </div>
            </div>

            {/* Governance Metric Counters */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                <div className="text-xl font-bold text-sky-600 dark:text-sky-400">
                  {tenant.openPrivacyRequestsCount}
                </div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">
                  Open Privacy Requests
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {tenant.unresolvedExceptionsCount}
                </div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">
                  Pending Exceptions
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                <div className="text-xl font-bold text-foreground">
                  {tenant.policiesAwaitingReviewCount}
                </div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">
                  Policies Due Review
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                <div className="text-xl font-bold text-foreground">
                  {tenant.totalMappedCategories}
                </div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">
                  Mapped Categories
                </div>
              </div>
            </div>

            {/* Missing Metadata Fields Warning */}
            {tenant.missingMetadataFields.length > 0 && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3 dark:border-rose-900/60 dark:bg-rose-950/20">
                <div className="font-semibold text-rose-800 dark:text-rose-300 text-xs mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  Missing Governance Configuration
                </div>
                <ul className="list-disc list-inside text-[11px] text-muted-foreground space-y-0.5">
                  {tenant.missingMetadataFields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tenant Governance Disclosures */}
            <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3.5 dark:border-indigo-900/60 dark:bg-indigo-950/30">
              <div className="flex items-center gap-2 font-semibold text-indigo-950 dark:text-indigo-200 text-xs mb-1">
                <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Multi-Tenant Isolation Safeguards
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Platform Super-Admin views maintain aggregate governance health metrics across organizations.
                Individual pupil records and parental correspondence remain strictly isolated to tenant authorization scopes.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 rounded-lg border border-border py-2 text-xs font-medium text-foreground hover:bg-muted"
          >
            Close Drawer
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateTab('requests');
            }}
            className="w-1/2 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs"
          >
            Inspect Requests
          </button>
        </div>
      </div>
    </div>
  );
}
