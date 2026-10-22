'use client';

import React from 'react';
import { X } from 'lucide-react';
import { DataLifecycleRuleRecord } from '@/lib/types/data-governance';

interface LifecycleRuleDetailModalProps {
  rule: DataLifecycleRuleRecord | null;
  onClose: () => void;
  onToggle: (id: string) => void;
}

export function LifecycleRuleDetailModal({
  rule,
  onClose,
  onToggle,
}: LifecycleRuleDetailModalProps) {
  if (!rule) return null;

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'archived':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200';
      case 'restricted_inactive':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200';
      case 'scheduled_deletion':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200';
      case 'anonymized_demo':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200';
      case 'retained_exception':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200';
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
              <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                {rule.code}
              </span>
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold capitalize ${getStageBadge(
                  rule.targetLifecycleStage
                )}`}
              >
                Target: {rule.targetLifecycleStage.replace(/_/g, ' ')}
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                  rule.status === 'enabled'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {rule.status}
              </span>
            </div>
            <h2 className="text-lg font-bold text-foreground">{rule.name}</h2>
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
            <h3 className="font-semibold text-foreground text-xs mb-1">Trigger Conditions</h3>
            <p className="text-muted-foreground leading-relaxed font-mono">{rule.triggerConditions}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Covered Category
              </div>
              <div className="mt-1 font-mono font-bold text-foreground">
                {rule.coveredCategoryId}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Trigger Event
              </div>
              <div className="mt-1 font-semibold text-foreground capitalize">
                {rule.triggerEvent.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Approval Requirement
              </div>
              <div className="mt-1 font-semibold text-foreground capitalize">
                {rule.requiredApproval.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Last Reviewed
              </div>
              <div className="mt-1 font-semibold text-foreground">
                {new Date(rule.lastReviewDate).toLocaleDateString()}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Next Review Due
              </div>
              <div className="mt-1 font-semibold text-foreground">
                {new Date(rule.nextReviewDate).toLocaleDateString()}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Execution Mode
              </div>
              <div className="mt-1 font-semibold text-foreground">
                Declarative Demonstration
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <h3 className="font-semibold text-foreground text-xs mb-1">
              Legal Hold & Exception Behavior
            </h3>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              {rule.exceptionHandling}
            </p>
          </div>

          <div className="rounded-lg bg-teal-50/70 p-2.5 text-[10px] text-teal-900 dark:bg-teal-950/30 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900/40">
            <strong>Declarative Rule Model:</strong> Represents future automated lifecycle progression
            rules. Toggling this rule updates store configuration and audit history without initiating
            background database batch jobs.
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <span className="text-[11px] text-muted-foreground">
            Rule Status: <strong className="capitalize">{rule.status}</strong>
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
                onToggle(rule.id);
                onClose();
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-2xs ${
                rule.status === 'enabled'
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {rule.status === 'enabled' ? 'Disable Lifecycle Rule' : 'Enable Lifecycle Rule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
