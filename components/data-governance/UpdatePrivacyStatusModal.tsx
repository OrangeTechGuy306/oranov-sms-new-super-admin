'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, ArrowRight } from 'lucide-react';
import {
  PrivacyRequestRecord,
  PrivacyWorkflowStatus,
  PrivacyResolutionCategory,
} from '@/lib/types/data-governance';
import { isValidPrivacyTransition } from '@/lib/data-governance/evaluator';

interface UpdatePrivacyStatusModalProps {
  request: PrivacyRequestRecord | null;
  onClose: () => void;
  onUpdateStatus: (
    id: string,
    status: PrivacyWorkflowStatus,
    resolutionCategory?: PrivacyResolutionCategory,
    reviewNotes?: string
  ) => void;
}

export function UpdatePrivacyStatusModal({
  request,
  onClose,
  onUpdateStatus,
}: UpdatePrivacyStatusModalProps) {
  const [newStatus, setNewStatus] = useState<PrivacyWorkflowStatus>(() => {
    switch (request?.workflowStatus) {
      case 'received':
        return 'identity_verification_pending';
      case 'identity_verification_pending':
        return 'under_review';
      case 'under_review':
        return 'approved_pending_execution';
      case 'approved_pending_execution':
        return 'processing_simulated';
      case 'processing_simulated':
        return 'completed_closed';
      default:
        return request?.workflowStatus || 'received';
    }
  });

  const [resolutionCategory, setResolutionCategory] = useState<PrivacyResolutionCategory>(
    request?.resolutionCategory || 'pending'
  );
  const [reviewNotes, setReviewNotes] = useState(
    `State transitioned from ${request?.workflowStatus || 'received'} in demonstration register.`
  );
  const [error, setError] = useState<string | null>(null);

  if (!request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transitionCheck = isValidPrivacyTransition(request.workflowStatus, newStatus);
    if (!transitionCheck.valid) {
      setError(
        transitionCheck.reason ||
          `Invalid status transition from "${request.workflowStatus}" to "${newStatus}". Privacy workflow must follow linear verification steps.`
      );
      return;
    }

    onUpdateStatus(request.id, newStatus, resolutionCategory, reviewNotes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div>
            <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
              {request.code}
            </span>
            <h2 className="text-base font-bold text-foreground">
              Advance Privacy Request Workflow
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
            <div className="text-[10px] uppercase font-semibold text-muted-foreground">
              Current Stage
            </div>
            <div className="text-sm font-bold text-foreground capitalize mt-0.5">
              {request.workflowStatus.replace(/_/g, ' ')}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Subject: {request.requestingPartyLabel} ({request.category.replace(/_/g, ' ')})
            </div>
          </div>

          <div>
            <label className="font-medium text-foreground block mb-1">Target Workflow Stage *</label>
            <select
              value={newStatus}
              onChange={(e) => {
                const val = e.target.value as PrivacyWorkflowStatus;
                setNewStatus(val);
                setReviewNotes(`Advanced from ${request.workflowStatus} to ${val}.`);
                setError(null);
              }}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="identity_verification_pending">
                Identity Verification Pending (Parental/Staff ID Check)
              </option>
              <option value="under_review">
                Under Review (Legal & Scope Evaluation)
              </option>
              <option value="awaiting_info">
                Awaiting Info (Clarification / ID Proof Needed)
              </option>
              <option value="approved_pending_execution">
                Approved Pending Execution (Request Validated)
              </option>
              <option value="processing_simulated">
                Processing Simulated (Execution in Progress)
              </option>
              <option value="completed_closed">
                Completed / Closed (Tombstone Receipt Issued)
              </option>
              <option value="rejected_with_grounds">
                Rejected With Grounds (Statutory Exemption or Identity Failure)
              </option>
            </select>
          </div>

          <div>
            <label className="font-medium text-foreground block mb-1">
              Resolution Category
            </label>
            <select
              value={resolutionCategory}
              onChange={(e) => setResolutionCategory(e.target.value as PrivacyResolutionCategory)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="pending">Pending Further Determination</option>
              <option value="disclosed_synthetic_manifest">
                Disclosed Synthetic Manifest (Access / Portability)
              </option>
              <option value="corrected_synthetic_metadata">
                Corrected Synthetic Metadata (Rectification)
              </option>
              <option value="deletion_simulated_tombstoned">
                Deletion Simulated Tombstoned (Erasure / Right to be Forgotten)
              </option>
              <option value="restricted_mock_flag">
                Restricted Mock Flag (Processing Restriction)
              </option>
              <option value="rejected_unverified_identity">
                Rejected: Unverified Identity / Insufficient Authority
              </option>
              <option value="rejected_statutory_retention_override">
                Rejected: Statutory Retention Override (FERPA/Tax Requirement)
              </option>
            </select>
          </div>

          <div>
            <label className="font-medium text-foreground block mb-1">
              Workflow Transition Notes *
            </label>
            <textarea
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Record governance review notes, verification confirmation, or legal exemption..."
              className="w-full rounded-lg border border-border bg-card p-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="rounded-lg bg-sky-50/70 p-2 text-[10px] text-sky-900 dark:bg-sky-950/30 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/40">
            Advances local demo queue state. Real production systems require cryptographic identity
            challenge protocols and signed tenant verification receipts.
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 shadow-2xs"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Commit Status Change
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
