'use client';

import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import {
  CreateGovernanceExceptionInput,
  DataCategoryRecord,
  GovernanceRetentionPolicy,
  ExceptionReasonCategory,
  ExceptionApprovalRequirement,
} from '@/lib/types/data-governance';

interface CreateGovernanceExceptionModalProps {
  policies: GovernanceRetentionPolicy[];
  categories: DataCategoryRecord[];
  onClose: () => void;
  onCreate: (input: CreateGovernanceExceptionInput) => void;
}

export function CreateGovernanceExceptionModal({
  policies,
  categories,
  onClose,
  onCreate,
}: CreateGovernanceExceptionModalProps) {
  const [title, setTitle] = useState('');
  const [reasonCategory, setReasonCategory] = useState<ExceptionReasonCategory>(
    'ongoing_litigation_hold'
  );
  const [relatedPolicyId, setRelatedPolicyId] = useState(policies[0]?.id || '');
  const [relatedCategoryId, setRelatedCategoryId] = useState(categories[0]?.id || '');
  const [tenantName, setTenantName] = useState('All Organizations (Platform-Wide)');
  const [responsibleRole, setResponsibleRole] = useState('Outside Legal Counsel');
  const [approvalRequirement, setApprovalRequirement] = useState<ExceptionApprovalRequirement>(
    'legal_counsel'
  );
  const [justificationText, setJustificationText] = useState('');
  const [reviewDueAt, setReviewDueAt] = useState('2026-04-22');
  const [expirationAt, setExpirationAt] = useState('2027-03-22');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Exception title is required.');
      return;
    }
    if (!justificationText.trim()) {
      setError('Legal justification and basis for exception is required.');
      return;
    }

    onCreate({
      title: title.trim(),
      reasonCategory,
      relatedPolicyId,
      relatedCategoryId,
      tenantId: tenantName === 'All Organizations (Platform-Wide)' ? 'platform_wide' : 'org_custom',
      tenantName,
      responsibleRole: responsibleRole.trim(),
      approvalRequirement,
      justificationText: justificationText.trim(),
      reviewDueAt: new Date(reviewDueAt).toISOString(),
      expirationAt: new Date(expirationAt).toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Request Governance Exception / Legal Hold
            </h2>
            <p className="text-xs text-muted-foreground">
              Define a legal, audit, or statutory override pausing scheduled record lifecycle actions.
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
            <label className="font-medium text-foreground block mb-1">Exception Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Litigation Hold: Case #2026-CV-819"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-foreground block mb-1">Reason Category *</label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value as ExceptionReasonCategory)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="ongoing_litigation_hold">Ongoing Litigation Hold</option>
                <option value="statutory_tax_audit">Statutory Tax & Financial Audit</option>
                <option value="accreditation_review">Accreditation Review</option>
                <option value="historical_archival">Historical Archival Exemption</option>
                <option value="contractual_override">Contractual Override</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">Approval Authority *</label>
              <select
                value={approvalRequirement}
                onChange={(e) =>
                  setApprovalRequirement(e.target.value as ExceptionApprovalRequirement)
                }
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="legal_counsel">Legal Counsel Sign-off</option>
                <option value="super_admin_dual_key">Super-Admin Dual Key</option>
                <option value="board_approval">Board of Directors Approval</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-foreground block mb-1">Related Retention Policy *</label>
              <select
                value={relatedPolicyId}
                onChange={(e) => setRelatedPolicyId(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
              >
                {policies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">Related Data Category *</label>
              <select
                value={relatedCategoryId}
                onChange={(e) => setRelatedCategoryId(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-foreground block mb-1">Target Tenant Scope</label>
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">Responsible Role</label>
              <input
                type="text"
                value={responsibleRole}
                onChange={(e) => setResponsibleRole(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-foreground block mb-1">Legal Justification *</label>
            <textarea
              rows={3}
              required
              value={justificationText}
              onChange={(e) => setJustificationText(e.target.value)}
              placeholder="Cite legal docket, subpoena details, or audit scope requiring preservation..."
              className="w-full rounded-lg border border-border bg-card p-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-foreground block mb-1">Review Due Date *</label>
              <input
                type="date"
                required
                value={reviewDueAt}
                onChange={(e) => setReviewDueAt(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">Expiration Date *</label>
              <input
                type="date"
                required
                value={expirationAt}
                onChange={(e) => setExpirationAt(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
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
              <Plus className="h-3.5 w-3.5" />
              Create Exception Hold
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
