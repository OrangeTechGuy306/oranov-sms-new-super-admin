'use client';

import React from 'react';
import {
  X,
  Shield,
  Tag,
  Info,
} from 'lucide-react';
import { DataCategoryRecord } from '@/lib/types/data-governance';

interface CategoryDetailModalProps {
  category: DataCategoryRecord | null;
  onClose: () => void;
  onEdit: (category: DataCategoryRecord) => void;
}

export function CategoryDetailModal({ category, onClose, onEdit }: CategoryDetailModalProps) {
  if (!category) return null;

  const getClassificationBadge = (level: string) => {
    switch (level) {
      case 'restricted':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60';
      case 'confidential':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60';
      case 'internal':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/60';
      case 'public':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {category.code}
              </span>
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${getClassificationBadge(
                  category.classificationLevel
                )}`}
              >
                {category.classificationLevel}
              </span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-medium">
                {category.dataSourceStatus.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-lg font-bold text-foreground">{category.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-5 text-xs">
          {/* Category Description */}
          <div>
            <h3 className="font-semibold text-foreground text-xs mb-1">Description & Scope</h3>
            <p className="text-muted-foreground leading-relaxed">{category.description}</p>
          </div>

          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Subject Entity
              </div>
              <div className="mt-1 font-semibold text-foreground capitalize">
                {category.dataSubjectType.replace('_', ' ')}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Owning Module
              </div>
              <div className="mt-1 font-semibold text-foreground capitalize">
                {category.owningModule.replace('_', ' ')}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Retention Binding
              </div>
              <div className="mt-1 font-semibold text-indigo-600 dark:text-indigo-400">
                {category.retentionPolicyId || 'No policy bound'}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Lifecycle Stage
              </div>
              <div className="mt-1 font-semibold text-foreground capitalize">
                {category.lifecycleStatus.replace('_', ' ')}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Review Status
              </div>
              <div className="mt-1 font-semibold text-foreground capitalize">
                {category.reviewStatus.replace('_', ' ')}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Model Scope
              </div>
              <div className="mt-1 font-semibold text-foreground">
                {category.isProposedClassification ? 'Proposed Classification' : 'Enforced'}
              </div>
            </div>
          </div>

          {/* Sensitive Attributes Tags */}
          <div>
            <h3 className="font-semibold text-foreground text-xs mb-1.5 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Sensitive Data Attributes (Synthetic Schema)
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {category.sensitiveAttributes.map((attr) => (
                <span
                  key={attr}
                  className="rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-foreground border border-border"
                >
                  {attr}
                </span>
              ))}
            </div>
          </div>

          {/* Applicable Regulations */}
          <div>
            <h3 className="font-semibold text-foreground text-xs mb-1.5 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Applicable Regulations
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {category.applicableRegulations.map((reg) => (
                <span
                  key={reg}
                  className="rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50"
                >
                  {reg}
                </span>
              ))}
            </div>
          </div>

          {/* Business Purpose */}
          <div>
            <h3 className="font-semibold text-foreground text-xs mb-1">Business & Educational Purpose</h3>
            <p className="text-muted-foreground leading-relaxed">{category.businessPurpose}</p>
          </div>

          {/* Notes and Known Limitations */}
          {category.notes && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="font-semibold text-foreground text-xs mb-1 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                Governance & Legal Notes
              </div>
              <p className="text-muted-foreground leading-relaxed text-[11px]">{category.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <span className="text-[11px] text-muted-foreground">
            Zero PII disclosure • Fictional category schema
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
                onEdit(category);
              }}
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs"
            >
              Edit Classification & Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
