'use client';

import React, { useState } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { SupportTicket, SupportTicketStatus } from '@/lib/types/support-desk';
import { getValidTicketTransitions } from '@/lib/support/evaluator';
import { X, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface StatusTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: SupportTicket;
}

export function StatusTransitionModal({ isOpen, onClose, ticket }: StatusTransitionModalProps) {
  const { transitionSupportTicketStatus } = usePlatformStore();
  const allowedTransitions = getValidTicketTransitions(ticket.status);

  const [selectedStatus, setSelectedStatus] = useState<SupportTicketStatus | ''>(
    allowedTransitions[0]?.targetStatus || ''
  );
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTransition = allowedTransitions.find((t) => t.targetStatus === selectedStatus);
  const requiresReason = currentTransition?.requiresReason ?? false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedStatus) {
      setErrorMessage('Please select a target status transition.');
      return;
    }

    if (requiresReason && (!reason || reason.trim().length < 5)) {
      setErrorMessage('A mandatory justification (minimum 5 characters) is required for this transition.');
      return;
    }

    const res = transitionSupportTicketStatus(ticket.id, selectedStatus, reason.trim());
    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Failed to update ticket status.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl p-6 z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Transition Ticket Status: {ticket.ticketNumber}
            </h3>
            <p className="text-xs text-muted-foreground">
              Current state: <strong className="text-foreground uppercase">{ticket.status}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-2">
            <label className="font-medium text-foreground block">
              Permitted Next Lifecycle Transitions:
            </label>
            {allowedTransitions.length > 0 ? (
              <div className="space-y-2">
                {allowedTransitions.map((t) => (
                  <label
                    key={t.targetStatus}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedStatus === t.targetStatus
                        ? 'border-primary bg-primary/5 text-foreground'
                        : 'border-border bg-background hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetStatus"
                      value={t.targetStatus}
                      checked={selectedStatus === t.targetStatus}
                      onChange={() => setSelectedStatus(t.targetStatus)}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <span>{t.label}</span>
                        {t.requiresReason && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-normal">
                            Requires reason
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{t.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-muted text-muted-foreground text-center">
                No further linear state transitions are allowed from status &quot;{ticket.status}&quot;.
              </div>
            )}
          </div>

          {requiresReason && (
            <div className="space-y-1">
              <label className="font-medium text-foreground">
                Mandatory Audit Justification <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the administrative or operational reason for this status change..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
                required
                minLength={5}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-border text-foreground hover:bg-muted font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedStatus}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-xs"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Apply Status Transition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
