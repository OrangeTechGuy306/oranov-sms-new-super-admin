'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  GovernanceRetentionPolicy,
  RetentionPolicyStatus,
} from '@/lib/types/data-governance';

interface ReviewRetentionPolicyModalProps {
  policy: GovernanceRetentionPolicy | null;
  onClose: () => void;
  onSubmitReview: (
    id: string,
    outcome: RetentionPolicyStatus,
    notes: string,
    nextReviewDate: string
  ) => void;
}

export function ReviewRetentionPolicyModal({
  policy,
  onClose,
  onSubmitReview,
}: ReviewRetentionPolicyModalProps) {
  const [status, setStatus] = useState<RetentionPolicyStatus>(
    policy?.status === 'awaiting_review' ? 'approved_demo' : (policy?.status || 'active_config')
  );
  const [reviewNotes, setReviewNotes] = useState(
    'Annual legal and statutory retention schedule review completed in demonstration workspace.'
  );
  const [nextReviewDate, setNextReviewDate] = useState('2027-03-22');
  const [error, setError] = useState<string | null>(null);

  if (!policy) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewNotes.trim()) {
      setError('Review audit findings and notes are required.');
      return;
    }
    if (!nextReviewDate) {
      setError('A valid next review date must be scheduled.');
      return;
    }

    onSubmitReview(policy.id, status, reviewNotes.trim(), nextReviewDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div>
            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {policy.code}
            </span>
            <h2 className="text-base font-bold text-foreground">
              Simulate Retention Policy Review
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="font-medium text-foreground block mb-1">Policy Under Review</label>
            <div className="rounded-lg border border-border bg-muted/40 p-2.5">
              <div className="font-bold text-foreground">{policy.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Current Status: <span className="capitalize font-semibold">{policy.status.replace('_', ' ')}</span> •
                Duration: {policy.durationDisplay}
              </div>
            </div>
          </div>

          <div>
            <label className="font-medium text-foreground block mb-1">
              Simulated Review Outcome *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RetentionPolicyStatus)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="approved_demo">Approved Demo (Complies with statutory guidelines)</option>
              <option value="active_config">Active Configuration (Approved and designated active)</option>
              <option value="awaiting_review">Awaiting Review (Action items pending)</option>
              <option value="suspended">Suspended (Litigation or regulatory freeze)</option>
              <option value="retired">Retired (Deprecated schedule)</option>
            </select>
          </div>

          <div>
            <label className="font-medium text-foreground block mb-1">
              Review Notes & Legal Findings *
            </label>
            <textarea
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Document review findings, legal citations checked, or adjustments made..."
              className="w-full rounded-lg border border-border bg-card p-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-medium text-foreground block mb-1">
              Next Governance Review Due Date *
            </label>
            <input
              type="date"
              value={nextReviewDate}
              onChange={(e) => setNextReviewDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="rounded-lg bg-indigo-50/70 p-2 text-[10px] text-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40">
            Records an immutable audit event in local demo history. Does not certify external compliance.
          </div>

          <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Commit Review Outcome
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
