'use client';

import React, { useState } from 'react';
import { DataRetentionPolicy } from '@/lib/types/compliance';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils/formatters';
import {
  Clock,
  Lock,
  Edit2,
  AlertTriangle,
  Scale,
} from 'lucide-react';

interface DataRetentionPolicyWorkspaceProps {
  policies: DataRetentionPolicy[];
  onUpdatePolicy: (
    id: string,
    newDays: number,
    reason: string,
    isEnabled?: boolean,
    actorName?: string
  ) => { success: boolean; error?: string };
}

export function DataRetentionPolicyWorkspace({
  policies,
  onUpdatePolicy,
}: DataRetentionPolicyWorkspaceProps) {
  const [selectedPolicy, setSelectedPolicy] = useState<DataRetentionPolicy | null>(null);
  const [targetDays, setTargetDays] = useState<number>(365);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [justification, setJustification] = useState('');
  const [actorName, setActorName] = useState('Alexander Sterling (Super Admin)');
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleOpenEdit = (pol: DataRetentionPolicy) => {
    setSelectedPolicy(pol);
    setTargetDays(pol.retentionDurationDays);
    setIsEnabled(pol.isEnabled);
    setJustification('');
    setUpdateError(null);
  };

  const handleSavePolicy = () => {
    if (!selectedPolicy) return;
    const res = onUpdatePolicy(
      selectedPolicy.id,
      Number(targetDays),
      justification,
      isEnabled,
      actorName
    );
    if (!res.success) {
      setUpdateError(res.error || 'Failed to update policy');
      return;
    }
    setSelectedPolicy(null);
  };

  return (
    <div className="space-y-4">
      {/* Strict Purge Disclaimer Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/20 text-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-950 dark:text-amber-200 text-sm">
              Zero Physical Data Purging — Demonstration Governance Sandbox
            </span>
            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold uppercase bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
              Read-Only Safety
            </span>
          </div>
          <p className="text-amber-900/90 dark:text-amber-300/80 leading-relaxed text-[11px]">
            This workspace defines statutory retention duration policies and simulates policy administration. <strong>No customer data, student records, audit logs, or school files are ever deleted or purged by this frontend.</strong> Physical data destruction, cryptographic shredding, and S3 Glacier Object Lock policies must be enforced by backend server workers.
          </p>
        </div>
      </div>

      {/* Policies Roster */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {policies.map((pol) => (
          <div
            key={pol.id}
            className="bg-card p-4 rounded-xl border border-border space-y-3 text-xs shadow-2xs hover:border-border/80 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border text-[11px]">
                    {pol.id}
                  </span>
                  <span className="font-bold text-foreground text-sm">{pol.name}</span>
                </div>
                <Badge variant={pol.isEnabled ? 'success' : 'neutral'} size="sm">
                  {pol.isEnabled ? 'Active Policy' : 'Disabled'}
                </Badge>
              </div>

              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {pol.description}
              </p>

              {/* Retention Duration Display */}
              <div className="p-2.5 rounded-lg bg-muted/60 border border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Retention: {pol.retentionDisplay}</span>
                </div>
                {pol.activeLegalHoldsCount > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <Lock className="w-3 h-3" />
                    {pol.activeLegalHoldsCount} Legal Hold Active (Purge Frozen)
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    No active legal holds
                  </span>
                )}
              </div>

              {/* Compliance Basis */}
              <div className="space-y-1 text-[11px]">
                <div className="flex items-start gap-1.5 text-muted-foreground">
                  <Scale className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Statutory Basis:</strong> {pol.complianceBasis}
                  </span>
                </div>
                <div className="text-muted-foreground pl-5">
                  <strong>Approval Gate:</strong> {pol.requiredApprovals}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="font-mono text-muted-foreground text-[10px]">
                Reviewed: {formatDate(pol.lastReviewedDate)}
              </span>

              <button
                type="button"
                onClick={() => handleOpenEdit(pol)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border text-foreground hover:bg-muted text-xs transition-colors font-medium"
              >
                <Edit2 className="w-3 h-3 text-muted-foreground" />
                <span>Adjust Schedule</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Policy Edit Modal */}
      {selectedPolicy && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPolicy(null)}
          title={`Adjust Statutory Retention Schedule — ${selectedPolicy.name}`}
          size="md"
        >
          <div className="space-y-4 py-1 text-xs">
            <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-1">
              <span className="font-bold text-foreground text-sm block">
                {selectedPolicy.name} ({selectedPolicy.id})
              </span>
              <p className="text-muted-foreground text-[11px]">
                Current Schedule: <strong>{selectedPolicy.retentionDisplay}</strong>
              </p>
            </div>

            {updateError && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 text-xs">
                {updateError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">
                Retention Duration (Days) *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={targetDays}
                  onChange={(e) => setTargetDays(Number(e.target.value))}
                  className="rounded-lg border border-border bg-card p-2 text-xs text-foreground focus:outline-none w-36 font-mono"
                  placeholder="e.g. 365, 2555"
                />
                <span className="text-[11px] text-muted-foreground">
                  (Enter <strong>-1</strong> for Permanent / Indefinite Statutory Hold)
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: '30 Days', val: 30 },
                  { label: '90 Days', val: 90 },
                  { label: '1 Year (365d)', val: 365 },
                  { label: '3 Years (1095d)', val: 1095 },
                  { label: '7 Years Statutory (2555d)', val: 2555 },
                  { label: 'Indefinite Hold (-1)', val: -1 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setTargetDays(preset.val)}
                    className="px-2 py-0.5 rounded border border-border bg-muted hover:bg-muted/80 text-[10px] text-foreground font-mono"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span>Policy Active & Enforced</span>
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">
                Audited Regulatory Justification *
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="State the regulatory statute, corporate board resolution, or legal counsel approval basis..."
                rows={3}
                className="w-full rounded-lg border border-border bg-card p-2 text-xs text-foreground focus:outline-none"
              />
              <span className="text-[10px] text-muted-foreground">
                Minimum 5 characters required. Changes are logged to the platform audit trail.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">
                Authorizing Super-Admin Identity
              </label>
              <input
                type="text"
                value={actorName}
                onChange={(e) => setActorName(e.target.value)}
                className="w-full rounded-lg border border-border bg-card p-2 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-[10px] text-muted-foreground italic">
                Demonstration update: logs audit event and updates client store.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPolicy(null)}
                  className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePolicy}
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 shadow-2xs"
                >
                  Save Policy Schedule
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
