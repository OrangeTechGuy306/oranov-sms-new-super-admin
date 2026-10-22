'use client';

import React from 'react';
import {
  X,
  Shield,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { GovernanceRetentionPolicy } from '@/lib/types/data-governance';
import { isReviewDue } from '@/lib/data-governance/evaluator';

interface RetentionPolicyDetailModalProps {
  policy: GovernanceRetentionPolicy | null;
  onClose: () => void;
  onReview: (policy: GovernanceRetentionPolicy) => void;
}

export function RetentionPolicyDetailModal({
  policy,
  onClose,
  onReview,
}: RetentionPolicyDetailModalProps) {
  if (!policy) return null;

  const overdue = isReviewDue(policy.nextReviewDueAt);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active_config':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200';
      case 'approved_demo':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200';
      case 'awaiting_review':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200';
      case 'suspended':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {policy.code}
              </span>
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold capitalize ${getStatusBadge(
                  policy.status
                )}`}
              >
                {policy.status.replace('_', ' ')}
              </span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-medium">
                Demo Model
              </span>
            </div>
            <h2 className="text-lg font-bold text-foreground">{policy.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          <div>
            <h3 className="font-semibold text-foreground text-xs mb-1">Purpose & Overview</h3>
            <p className="text-muted-foreground leading-relaxed">{policy.description}</p>
          </div>

          {/* Key Attributes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Retention Duration
              </div>
              <div className="mt-1 font-bold text-foreground">
                {policy.durationDisplay} ({policy.durationDays} days)
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Trigger Event
              </div>
              <div className="mt-1 font-semibold text-foreground capitalize">
                {policy.retentionTrigger.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Review Due
              </div>
              <div
                className={`mt-1 font-semibold ${
                  overdue ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
                }`}
              >
                {new Date(policy.nextReviewDueAt).toLocaleDateString()}
                {overdue && ' (Due Soon / Overdue)'}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Responsible Owner
              </div>
              <div className="mt-1 font-semibold text-foreground">{policy.policyOwner}</div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Approval Status
              </div>
              <div className="mt-1 font-semibold text-foreground capitalize">
                {policy.approvalStatus.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Active Exceptions
              </div>
              <div className="mt-1 font-semibold text-foreground">
                {policy.activeExceptionsCount} legal hold(s)
              </div>
            </div>
          </div>

          {/* Covered Categories */}
          <div>
            <h3 className="font-semibold text-foreground text-xs mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Covered Data Categories
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {policy.coveredCategoryIds.map((id) => (
                <span
                  key={id}
                  className="rounded-md bg-indigo-50 px-2 py-1 font-mono text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60"
                >
                  {id}
                </span>
              ))}
            </div>
          </div>

          {/* Legal Safeguard Basis */}
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3 dark:border-indigo-900/60 dark:bg-indigo-950/30">
            <h3 className="font-semibold text-indigo-950 dark:text-indigo-200 text-xs mb-1 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Legal Basis & Regulatory Citations
            </h3>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              {policy.legalSafeguardBasis}
            </p>
          </div>

          {/* Exception Handling Policy */}
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="font-semibold text-foreground text-xs mb-1 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Litigation Hold & Exception Handling
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              {policy.exceptionHandlingNotes}
            </p>
          </div>

          <div className="rounded-lg bg-amber-50/70 p-2.5 text-[10px] text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
            <strong>Demonstration Boundary:</strong> Configured retention schedules represent proposed
            statutory baselines. This frontend console does not initiate background worker processes,
            cron deletion jobs, or database table drops.
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <span className="text-[11px] text-muted-foreground">
            Last Reviewed: {new Date(policy.lastReviewedAt).toLocaleString()}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onReview(policy);
              }}
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs"
            >
              Simulate Policy Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
