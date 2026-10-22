'use client';

import React from 'react';
import { X } from 'lucide-react';
import { GovernanceExceptionRecord } from '@/lib/types/data-governance';
import { isOverdue } from '@/lib/data-governance/evaluator';

interface GovernanceExceptionDetailModalProps {
  exception: GovernanceExceptionRecord | null;
  onClose: () => void;
  onReview: (exception: GovernanceExceptionRecord) => void;
}

export function GovernanceExceptionDetailModal({
  exception,
  onClose,
  onReview,
}: GovernanceExceptionDetailModalProps) {
  if (!exception) return null;

  const isReviewOverdue = isOverdue(exception.reviewDueAt);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved_demo':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200';
      case 'pending_review':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200';
      case 'rejected_demo':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200';
      case 'expired':
        return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                {exception.code}
              </span>
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold capitalize ${getStatusBadge(
                  exception.reviewStatus
                )}`}
              >
                {exception.reviewStatus.replace(/_/g, ' ')}
              </span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-medium uppercase">
                {exception.reasonCategory.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 className="text-lg font-bold text-foreground">{exception.title}</h2>
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
            <h3 className="font-semibold text-foreground text-xs mb-1">Legal Justification</h3>
            <p className="text-muted-foreground leading-relaxed">{exception.justificationText}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Organization Scope
              </div>
              <div className="mt-1 font-semibold text-foreground">{exception.tenantName}</div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Approval Authority
              </div>
              <div className="mt-1 font-semibold text-foreground capitalize">
                {exception.approvalRequirement.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Responsible Role
              </div>
              <div className="mt-1 font-semibold text-foreground">{exception.responsibleRole}</div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Review Due Date
              </div>
              <div
                className={`mt-1 font-semibold ${
                  isReviewOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-foreground'
                }`}
              >
                {new Date(exception.reviewDueAt).toLocaleDateString()}
                {isReviewOverdue && ' (Overdue)'}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Policy Expiration
              </div>
              <div className="mt-1 font-semibold text-foreground">
                {new Date(exception.expirationAt).toLocaleDateString()}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Model Scope
              </div>
              <div className="mt-1 font-semibold text-foreground">
                Demonstration Hold
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <h3 className="font-semibold text-foreground text-xs mb-1">
              Resolution & Audit Summary
            </h3>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              {exception.resolutionSummary}
            </p>
          </div>

          <div className="rounded-lg bg-amber-50/70 p-2.5 text-[10px] text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
            <strong>Demonstration Safeguard:</strong> Exceptions pause scheduled lifecycle progressions in demo state.
            This does not create real-world attorney-client privilege or replace formal court-mandated legal hold orders.
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <span className="text-[11px] text-muted-foreground">
            Requested: {new Date(exception.requestedAt).toLocaleDateString()}
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
                onReview(exception);
              }}
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs"
            >
              Review Exception
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
