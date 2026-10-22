'use client';

import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import {
  CreateRetentionPolicyInput,
  DataCategoryRecord,
  RetentionTrigger,
} from '@/lib/types/data-governance';

interface CreateRetentionPolicyModalProps {
  categories: DataCategoryRecord[];
  onClose: () => void;
  onCreate: (input: CreateRetentionPolicyInput) => void;
}

export function CreateRetentionPolicyModal({
  categories,
  onClose,
  onCreate,
}: CreateRetentionPolicyModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationDays, setDurationDays] = useState(2555); // ~7 years
  const [retentionTrigger, setRetentionTrigger] = useState<RetentionTrigger>(
    'student_graduation_or_departure'
  );
  const [policyOwner, setPolicyOwner] = useState('Data Protection Officer');
  const [legalSafeguardBasis, setLegalSafeguardBasis] = useState('');
  const exceptionHandlingNotes =
    'Litigation holds immediately pause automated deletion schedules pending legal clearance.';
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Policy name is required.');
      return;
    }
    if (!description.trim()) {
      setError('Policy purpose description is required.');
      return;
    }
    if (durationDays <= 0) {
      setError('Retention duration must be greater than zero days.');
      return;
    }
    if (!legalSafeguardBasis.trim()) {
      setError('Legal or statutory basis citation is required.');
      return;
    }

    onCreate({
      name: name.trim(),
      description: description.trim(),
      durationDays: Number(durationDays),
      durationDisplay: `${Math.round(durationDays / 365)} Years`,
      retentionTrigger,
      triggerDescription: `Triggered upon ${retentionTrigger.replace(/_/g, ' ')}.`,
      policyOwner: policyOwner.trim(),
      status: 'draft',
      approvalStatus: 'unreviewed',
      nextReviewDueAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      legalSafeguardBasis: legalSafeguardBasis.trim(),
      exceptionHandlingNotes: exceptionHandlingNotes.trim(),
      coveredCategoryIds: selectedCategoryIds,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Define Demo Retention Policy
            </h2>
            <p className="text-xs text-muted-foreground">
              Establish statutory retention timelines for educational and administrative records.
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
            <label className="font-medium text-foreground block mb-1">Policy Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Student Academic Records & Transcripts Schedule"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-medium text-foreground block mb-1">Purpose & Description *</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Operational reason for retaining this dataset..."
              className="w-full rounded-lg border border-border bg-card p-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-foreground block mb-1">
                Duration (in Days) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                ~{Math.round(durationDays / 365)} years ({durationDays} days)
              </span>
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">
                Retention Trigger Event *
              </label>
              <select
                value={retentionTrigger}
                onChange={(e) => setRetentionTrigger(e.target.value as RetentionTrigger)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="student_graduation_or_departure">Student Graduation or Departure</option>
                <option value="record_creation">Record Creation Timestamp</option>
                <option value="academic_year_completion">Academic Year Completion</option>
                <option value="account_closure">Account Closure</option>
                <option value="contract_termination">Contract Termination</option>
                <option value="statutory_requirement">Statutory Requirement</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-foreground block mb-1">
                Responsible Policy Owner *
              </label>
              <input
                type="text"
                required
                value={policyOwner}
                onChange={(e) => setPolicyOwner(e.target.value)}
                placeholder="e.g. Legal Counsel, Registrar"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">
                Legal Basis / Statutory Citation *
              </label>
              <input
                type="text"
                required
                value={legalSafeguardBasis}
                onChange={(e) => setLegalSafeguardBasis(e.target.value)}
                placeholder="e.g. FERPA 34 CFR § 99.31, IRS Rev. Proc. 98-25"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Covered Data Categories Selection */}
          <div>
            <label className="font-medium text-foreground block mb-1.5">
              Select Covered Data Categories
            </label>
            <div className="max-h-36 overflow-y-auto rounded-lg border border-border bg-muted/20 p-2 space-y-1">
              {categories.map((c) => {
                const isSelected = selectedCategoryIds.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleCategory(c.id)}
                    className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/50'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div>
                      <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mr-2">
                        {c.code}
                      </span>
                      <span className="font-medium text-foreground text-xs">{c.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {c.classificationLevel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg bg-amber-50/70 p-2 text-[10px] text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
            Note: This policy is added to local demonstration state with initial status &quot;draft&quot;.
            It does not trigger active data deletions or external compliance filings.
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
              <Plus className="h-3.5 w-3.5" />
              Save Demo Retention Policy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
