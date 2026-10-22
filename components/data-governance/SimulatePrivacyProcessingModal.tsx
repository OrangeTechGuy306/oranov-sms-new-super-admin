'use client';

import React, { useState } from 'react';
import {
  X,
  Play,
  FileCode,
} from 'lucide-react';
import { PrivacyRequestRecord } from '@/lib/types/data-governance';

interface SimulatePrivacyProcessingModalProps {
  request: PrivacyRequestRecord | null;
  onClose: () => void;
  onExecuteSimulation: (id: string, actorName?: string) => void;
}

export function SimulatePrivacyProcessingModal({
  request,
  onClose,
  onExecuteSimulation,
}: SimulatePrivacyProcessingModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  if (!request) return null;

  const getSimulatedActionDescription = () => {
    switch (request.category) {
      case 'deletion_erasure':
        return {
          title: 'Simulate Right to Erasure / Account Tombstoning',
          manifestType: 'tombstone_receipt',
          fields: 42,
          impact: 'Generates synthetic cryptographic tombstone hash receipt. Educational transcript preservation rules pause academic history deletion.',
        };
      case 'access_request':
      case 'portability_export':
        return {
          title: 'Simulate Educational Subject Access Export',
          manifestType: 'json_manifest',
          fields: 128,
          impact: 'Compiles synthetic multi-category machine-readable JSON bundle. Redacts non-requesting sibling or peer personal identifiers.',
        };
      case 'correction_request':
        return {
          title: 'Simulate Metadata Rectification Protocol',
          manifestType: 'redacted_export',
          fields: 4,
          impact: 'Generates rectification receipt acknowledging updated guardian contact and address tokens across fictional school records.',
        };
      case 'restriction_processing':
      case 'objection_processing':
      case 'consent_inquiry':
      default:
        return {
          title: 'Simulate Processing Restriction Mock Flag',
          manifestType: 'redacted_export',
          fields: 16,
          impact: 'Marks student communications and third-party data exchange channels with simulated processing freeze flag.',
        };
    }
  };

  const action = getSimulatedActionDescription();

  const handleExecute = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onExecuteSimulation(request.id);
      setIsProcessing(false);
      setHasCompleted(true);
    }, 600);
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
              {action.title}
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

        <div className="mt-4 space-y-4 text-xs">
          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-foreground">Request Code</span>
              <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">
                {request.code}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-foreground">Synthetic Subject</span>
              <span className="font-mono text-foreground font-medium">
                {request.requestingPartyLabel}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-foreground">Associated Tenant</span>
              <span className="text-foreground">{request.tenantName}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-foreground">Manifest Type</span>
              <span className="font-mono uppercase text-indigo-600 dark:text-indigo-400 font-bold">
                {action.manifestType}
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground text-xs mb-1">
              Simulation Execution Impact
            </h3>
            <p className="text-muted-foreground leading-relaxed">{action.impact}</p>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
            <div className="flex items-center gap-2 font-semibold text-emerald-950 dark:text-emerald-200 text-xs mb-1">
              <FileCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Simulated Execution Artifact Manifest
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Will generate a receipt containing <strong>{action.fields} simulated record fields</strong>, timestamped
              execution hash, and advance request workflow status to <em>Completed / Closed</em>.
            </p>
          </div>

          <div className="rounded-lg bg-amber-50/70 p-2.5 text-[10px] text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
            <strong>Non-Destructive Guarantee:</strong> This simulation runs strictly against local frontend
            application state. No database rows, SQL tables, S3 documents, or real student files are deleted or modified.
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <span className="text-[11px] text-muted-foreground">
            Zero PII • Sandboxed dry-run
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              {hasCompleted ? 'Close' : 'Cancel'}
            </button>
            {!hasCompleted && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecute}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 shadow-2xs disabled:opacity-50"
              >
                {isProcessing ? (
                  <>Processing Simulation...</>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Execute Simulated Processing
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
