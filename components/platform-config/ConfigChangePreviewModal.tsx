'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export interface ConfigDiffItem {
  label: string;
  field?: string;
  current: string | number | boolean | null | undefined;
  proposed: string | number | boolean | null | undefined;
}

export interface ConfigChangePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  scope: string;
  changes: ConfigDiffItem[];
  warnings?: string[];
  isSubmitting?: boolean;
}

export function ConfigChangePreviewModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description = 'Review the proposed parameter changes and scope before applying to local development state.',
  scope,
  changes,
  warnings = [],
  isSubmitting = false,
}: ConfigChangePreviewModalProps) {
  const formatVal = (v: any) => {
    if (v === null || v === undefined) return <span className="text-muted-foreground italic">None / Unset</span>;
    if (typeof v === 'boolean') {
      return (
        <Badge variant={v ? 'success' : 'neutral'} className="text-[10px]">
          {v ? 'True / Enabled' : 'False / Disabled'}
        </Badge>
      );
    }
    return <span className="font-mono text-xs">{String(v)}</span>;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>{title}</span>
          <Badge variant="info" className="text-[10px] capitalize">
            Scope: {scope}
          </Badge>
        </div>
      }
      description={description}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] text-muted-foreground">
            Changes persist to local Super-Admin development storage.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Applying...' : 'Confirm & Apply Change'}</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {warnings.length > 0 && (
          <AlertBanner variant="warning" title="Validation Observations">
            <ul className="list-disc pl-4 space-y-1 text-xs mt-1">
              {warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </AlertBanner>
        )}

        <div className="rounded-xl border border-border overflow-hidden">
          <div className="bg-muted/40 px-4 py-2 border-b border-border font-semibold text-[11px] text-muted-foreground grid grid-cols-12 gap-2">
            <span className="col-span-4">Configuration Parameter</span>
            <span className="col-span-3">Current Value</span>
            <span className="col-span-1 text-center"></span>
            <span className="col-span-4">Proposed Value</span>
          </div>

          <div className="divide-y divide-border/50">
            {changes.map((item, idx) => (
              <div key={idx} className="px-4 py-2.5 grid grid-cols-12 gap-2 items-center hover:bg-muted/10">
                <div className="col-span-4">
                  <span className="font-semibold text-foreground block">{item.label}</span>
                  {item.field && <span className="font-mono text-[10px] text-muted-foreground">{item.field}</span>}
                </div>
                <div className="col-span-3 truncate">{formatVal(item.current)}</div>
                <div className="col-span-1 flex justify-center text-muted-foreground">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <div className="col-span-4 truncate font-semibold text-primary">{formatVal(item.proposed)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-lg border border-border/60 bg-muted/20 text-muted-foreground text-[11px] space-y-1">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Architecture & Gateway Propagation Notice</span>
          </p>
          <p>
            Applying this change mutates your local development storage and appends an administrative audit event. Live tenant pods and edge gateways require server-side token cache invalidation and distributed configuration push in future backend phases.
          </p>
        </div>
      </div>
    </Modal>
  );
}
