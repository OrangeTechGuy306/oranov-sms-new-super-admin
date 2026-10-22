'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  GovernanceExceptionRecord,
  ExceptionReviewStatus,
} from '@/lib/types/data-governance';

interface ReviewGovernanceExceptionModalProps {
  exception: GovernanceExceptionRecord | null;
  onClose: () => void;
  onSubmitReview: (id: string, status: ExceptionReviewStatus, resolution: string) => void;
}

export function ReviewGovernanceExceptionModal({
  exception,
  onClose,
  onSubmitReview,
}: ReviewGovernanceExceptionModalProps) {
  const [status, setStatus] = useState<ExceptionReviewStatus>(
    exception?.reviewStatus === 'pending_review' ? 'approved_demo' : (exception?.reviewStatus || 'approved_demo')
  );
  const [resolution, setResolution] = useState(
    'Legal review verified ongoing discovery obligations. Exception approved in demo workspace.'
  );
  const [error, setError] = useState<string | null>(null);

  if (!exception) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolution.trim()) {
      setError('Resolution rationale and audit findings are required.');
      return;
    }

    onSubmitReview(exception.id, status, resolution.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div>
            <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
              {exception.code}
            </span>
            <h2 className="text-base font-bold text-foreground">
              Review Governance Exception / Hold
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

          <div className="rounded-lg border border-border bg-muted/40 p-2.5">
            <div className="font-bold text-foreground">{exception.title}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Reason: <span className="capitalize font-semibold">{exception.reasonCategory.replace(/_/g, ' ')}</span> •
              Scope: {exception.tenantName}
            </div>
          </div>

          <div>
            <label className="font-medium text-foreground block mb-1">
              Review Determination *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ExceptionReviewStatus)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="approved_demo">Approved Demo (Active hold maintained)</option>
              <option value="rejected">Rejected (Hold lifted, normal retention resumes)</option>
              <option value="pending_review">Pending Review (Awaiting additional documentation)</option>
              <option value="expired">Expired (Matter concluded)</option>
            </select>
          </div>

          <div>
            <label className="font-medium text-foreground block mb-1">
              Review Resolution Notes & Findings *
            </label>
            <textarea
              rows={3}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="State review findings and justification for hold maintenance or release..."
              className="w-full rounded-lg border border-border bg-card p-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="rounded-lg bg-indigo-50/70 p-2 text-[10px] text-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40">
            Records an audit event in local demo state. Real litigation holds must be vetted by licensed legal counsel.
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 shadow-2xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Commit Review Decision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
