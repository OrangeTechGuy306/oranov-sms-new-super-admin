'use client';

import React, { useState } from 'react';
import { X, AlertCircle, Save } from 'lucide-react';
import {
  DataCategoryRecord,
  DataClassificationLevel,
  UpdateDataCategoryInput,
  GovernanceRetentionPolicy,
} from '@/lib/types/data-governance';

interface EditCategoryModalProps {
  category: DataCategoryRecord | null;
  retentionPolicies: GovernanceRetentionPolicy[];
  onClose: () => void;
  onSave: (id: string, updates: UpdateDataCategoryInput) => void;
}

export function EditCategoryModal({
  category,
  retentionPolicies,
  onClose,
  onSave,
}: EditCategoryModalProps) {
  const [classification, setClassification] = useState<DataClassificationLevel>(
    category?.classificationLevel || 'internal'
  );
  const [retentionPolicyId, setRetentionPolicyId] = useState(
    category?.retentionPolicyId || ''
  );
  const [businessPurpose, setBusinessPurpose] = useState(category?.businessPurpose || '');
  const [notes, setNotes] = useState(category?.notes || '');
  const [error, setError] = useState<string | null>(null);

  if (!category) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessPurpose.trim()) {
      setError('Business and educational purpose must be specified.');
      return;
    }

    onSave(category.id, {
      classificationLevel: classification,
      retentionPolicyId: retentionPolicyId || null,
      businessPurpose: businessPurpose.trim(),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div>
            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {category.code}
            </span>
            <h2 className="text-base font-bold text-foreground">
              Edit Category Classification & Governance
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
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Category Name Display */}
          <div>
            <label className="font-medium text-foreground block mb-1">Category Name</label>
            <input
              type="text"
              disabled
              value={category.name}
              className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-muted-foreground"
            />
          </div>

          {/* Classification Level */}
          <div>
            <label className="font-medium text-foreground block mb-1">
              Proposed Classification Level *
            </label>
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value as DataClassificationLevel)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="public">Public (Directory, public schedules)</option>
              <option value="internal">Internal (Operations, staff logs, system metrics)</option>
              <option value="confidential">Confidential (Grades, student roster, finances)</option>
              <option value="restricted">Restricted (Safeguarding, medical, disciplinary)</option>
            </select>
          </div>

          {/* Retention Policy Binding */}
          <div>
            <label className="font-medium text-foreground block mb-1">
              Linked Retention Policy
            </label>
            <select
              value={retentionPolicyId}
              onChange={(e) => setRetentionPolicyId(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="">-- No Retention Policy (Uncovered) --</option>
              {retentionPolicies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name} ({p.durationDisplay})
                </option>
              ))}
            </select>
          </div>

          {/* Business Purpose */}
          <div>
            <label className="font-medium text-foreground block mb-1">
              Business & Educational Purpose *
            </label>
            <textarea
              rows={2}
              value={businessPurpose}
              onChange={(e) => setBusinessPurpose(e.target.value)}
              placeholder="Primary institutional objective for processing this data..."
              className="w-full rounded-lg border border-border bg-card p-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="font-medium text-foreground block mb-1">Governance Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Regulatory notes or review instructions..."
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="rounded-lg bg-amber-50/70 p-2 text-[10px] text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
            Note: Updating classification changes local demo metadata and records an audit log event.
            Real enforcement requires backend authorization service synchronization.
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
              <Save className="h-3.5 w-3.5" />
              Save Governance Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
