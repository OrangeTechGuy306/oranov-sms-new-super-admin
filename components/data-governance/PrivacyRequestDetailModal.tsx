'use client';

import React from 'react';
import {
  X,
  FileCode,
} from 'lucide-react';
import { PrivacyRequestRecord } from '@/lib/types/data-governance';
import { isOverdue } from '@/lib/data-governance/evaluator';

interface PrivacyRequestDetailModalProps {
  request: PrivacyRequestRecord | null;
  onClose: () => void;
  onAdvanceStatus: (request: PrivacyRequestRecord) => void;
  onSimulateProcessing: (request: PrivacyRequestRecord) => void;
}

export function PrivacyRequestDetailModal({
  request,
  onClose,
  onAdvanceStatus,
  onSimulateProcessing,
}: PrivacyRequestDetailModalProps) {
  if (!request) return null;

  const overdue = isOverdue(request.dueAt);

  const getWorkflowBadge = (status: string) => {
    switch (status) {
      case 'completed_closed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200';
      case 'processing_simulated':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200';
      case 'approved_pending_execution':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200';
      case 'under_review':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200';
      case 'awaiting_info':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200';
      case 'identity_verification_pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200';
      case 'rejected_with_grounds':
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
              <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                {request.code}
              </span>
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold capitalize ${getWorkflowBadge(
                  request.workflowStatus
                )}`}
              >
                {request.workflowStatus.replace(/_/g, ' ')}
              </span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-medium uppercase">
                {request.priority} Priority
              </span>
            </div>
            <h2 className="text-lg font-bold text-foreground capitalize">
              {request.category.replace(/_/g, ' ')} Request
            </h2>
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
            <h3 className="font-semibold text-foreground text-xs mb-1">Request Summary</h3>
            <p className="text-muted-foreground leading-relaxed">{request.requestSummary}</p>
          </div>

          {/* Key Attributes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Requesting Party (Synthetic)
              </div>
              <div className="mt-1 font-mono font-bold text-foreground">
                {request.requestingPartyLabel}
              </div>
              <div className="text-[10px] text-muted-foreground capitalize mt-0.5">
                Role: {request.requestingPartyType.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Tenant Context
              </div>
              <div className="mt-1 font-semibold text-foreground">{request.tenantName}</div>
              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                {request.tenantId}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                30-Day SLA Due Date
              </div>
              <div
                className={`mt-1 font-semibold ${
                  overdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-foreground'
                }`}
              >
                {new Date(request.dueAt).toLocaleDateString()}
                {overdue && ' (Overdue)'}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Received: {new Date(request.receivedAt).toLocaleDateString()}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Assigned Review Role
              </div>
              <div className="mt-1 font-semibold text-foreground">{request.assignedRole}</div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Resolution Category
              </div>
              <div className="mt-1 font-semibold text-foreground capitalize">
                {request.resolutionCategory.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Completion Timestamp
              </div>
              <div className="mt-1 font-semibold text-foreground">
                {request.completedAt ? new Date(request.completedAt).toLocaleString() : 'Open / Pending'}
              </div>
            </div>
          </div>

          {/* Review Notes */}
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <h3 className="font-semibold text-foreground text-xs mb-1">Governance Review Notes</h3>
            <p className="text-muted-foreground leading-relaxed text-[11px]">{request.reviewNotes}</p>
          </div>

          {/* Simulated Artifact Manifest */}
          {request.simulatedArtifactManifest ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-emerald-950 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                  <FileCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Simulated Execution Manifest Generated
                </span>
                <span className="font-mono text-[10px] text-emerald-800 dark:text-emerald-300 uppercase">
                  {request.simulatedArtifactManifest.type}
                </span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {request.simulatedArtifactManifest.summary}
              </p>
              <div className="mt-2 flex items-center gap-4 text-[10px] text-emerald-800 dark:text-emerald-300 font-mono">
                <span>Fields Processed: {request.simulatedArtifactManifest.fieldsProcessedCount}</span>
                <span>
                  Generated: {new Date(request.simulatedArtifactManifest.generatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-3 text-center text-muted-foreground text-[11px]">
              No simulated processing manifest generated yet. Advance status to &quot;Approved Pending Execution&quot; and execute simulation.
            </div>
          )}

          <div className="rounded-lg bg-sky-50/70 p-2.5 text-[10px] text-sky-900 dark:bg-sky-950/30 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/40">
            <strong>Zero-PII Assurance:</strong> No real identity credentials or student files are collected or processed.
            Simulated outcomes generate cryptographic receipt tokens and dry-run tombstone manifestations.
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <span className="text-[11px] text-muted-foreground">
            SLA: 30-day statutory window • Demonstration Queue
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
                onAdvanceStatus(request);
              }}
              className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              Advance Workflow Status
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSimulateProcessing(request);
              }}
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs"
            >
              Simulate Processing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
