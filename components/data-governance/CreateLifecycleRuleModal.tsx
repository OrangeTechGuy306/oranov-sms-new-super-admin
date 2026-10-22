'use client';

import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import {
  CreateLifecycleRuleInput,
  DataCategoryRecord,
  LifecycleStage,
  LifecycleTriggerEvent,
  LifecycleApprovalRequirement,
} from '@/lib/types/data-governance';

interface CreateLifecycleRuleModalProps {
  categories: DataCategoryRecord[];
  onClose: () => void;
  onCreate: (input: CreateLifecycleRuleInput) => void;
}

export function CreateLifecycleRuleModal({
  categories,
  onClose,
  onCreate,
}: CreateLifecycleRuleModalProps) {
  const [name, setName] = useState('');
  const [coveredCategoryId, setCoveredCategoryId] = useState(
    categories[0]?.id || ''
  );
  const [triggerEvent, setTriggerEvent] = useState<LifecycleTriggerEvent>('inactivity_threshold');
  const [targetStage, setTargetStage] = useState<LifecycleStage>('archived');
  const [requiredApproval, setRequiredApproval] = useState<LifecycleApprovalRequirement>('dpo_officer');
  const [triggerConditions, setTriggerConditions] = useState(
    'account_status == "inactive" AND days_since_last_session > 365 AND NOT has_active_legal_hold'
  );
  const [exceptionHandling, setExceptionHandling] = useState(
    'Active litigation holds or open DSAR requests prevent automated transition.'
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Rule name is required.');
      return;
    }
    const cat = categories.find((c) => c.id === coveredCategoryId);
    if (!cat) {
      setError('A covered data category must be selected.');
      return;
    }

    onCreate({
      name: name.trim(),
      coveredCategoryId: cat.id,
      triggerEvent,
      triggerConditions: triggerConditions.trim(),
      targetLifecycleStage: targetStage,
      requiredApproval,
      exceptionHandling: exceptionHandling.trim(),
      status: 'enabled',
      nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Define Data Lifecycle Rule
            </h2>
            <p className="text-xs text-muted-foreground">
              Configure stage progression policies (Restricted, Archived, Scheduled Deletion).
            </p>
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

          <div>
            <label className="font-medium text-foreground block mb-1">Rule Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Automated Exam Paper Archival Rule"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-foreground block mb-1">Covered Category *</label>
              <select
                value={coveredCategoryId}
                onChange={(e) => setCoveredCategoryId(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">Target Lifecycle Stage *</label>
              <select
                value={targetStage}
                onChange={(e) => setTargetStage(e.target.value as LifecycleStage)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="archived">Archived (Cold storage, read-only)</option>
                <option value="restricted_inactive">Restricted / Inactive (Access frozen)</option>
                <option value="scheduled_review">Scheduled for Review</option>
                <option value="scheduled_deletion">Scheduled for Deletion (Tombstoned)</option>
                <option value="anonymized_demo">Anonymized (Statistical only)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-foreground block mb-1">Trigger Event *</label>
              <select
                value={triggerEvent}
                onChange={(e) => setTriggerEvent(e.target.value as LifecycleTriggerEvent)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="inactivity_threshold">Inactivity Threshold</option>
                <option value="retention_expiry">Retention Period Expiry</option>
                <option value="academic_cohort_graduated">Cohort Graduated</option>
                <option value="tenant_offboarding">Tenant Offboarding</option>
                <option value="legal_hold_released">Legal Hold Released</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">Required Approval *</label>
              <select
                value={requiredApproval}
                onChange={(e) =>
                  setRequiredApproval(e.target.value as LifecycleApprovalRequirement)
                }
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="dpo_officer">Data Protection Officer (DPO)</option>
                <option value="platform_super_admin">Platform Super-Admin</option>
                <option value="tenant_admin_consent">Tenant Admin Consent</option>
                <option value="dual_authorization">Dual Authorization Key</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-medium text-foreground block mb-1">Trigger Condition Expression</label>
            <input
              type="text"
              value={triggerConditions}
              onChange={(e) => setTriggerConditions(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-[11px] text-foreground focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-medium text-foreground block mb-1">Exception Handling Notes</label>
            <input
              type="text"
              value={exceptionHandling}
              onChange={(e) => setExceptionHandling(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
            />
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Save Lifecycle Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
