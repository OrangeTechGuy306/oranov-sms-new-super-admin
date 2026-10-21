'use client';

import React, { useState } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { SupportTicket, EscalationTargetTier, EscalationUrgency } from '@/lib/types/support-desk';
import { X, ArrowUpRight, AlertTriangle, AlertCircle } from 'lucide-react';

interface EscalateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: SupportTicket;
}

export function EscalateTicketModal({ isOpen, onClose, ticket }: EscalateTicketModalProps) {
  const { supportTeams, escalateSupportTicket } = usePlatformStore();

  const [reason, setReason] = useState('');
  const [targetTeamId, setTargetTeamId] = useState(
    ticket.assignedTeamId === 'team_tier2' ? 'team_infrastructure' : 'team_tier2'
  );
  const [targetTier, setTargetTier] = useState<EscalationTargetTier>('tier_2_specialist');
  const [urgencyLevel, setUrgencyLevel] = useState<EscalationUrgency>('high');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!reason || reason.trim().length < 10) {
      setErrorMessage('Escalation reason must be at least 10 characters detailing why standard triage is insufficient.');
      return;
    }

    const res = escalateSupportTicket(
      ticket.id,
      reason.trim(),
      targetTeamId,
      urgencyLevel,
      targetTier
    );

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Failed to escalate ticket.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg rounded-xl border border-red-500/30 bg-card shadow-2xl p-6 z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Escalate Support Case: {ticket.ticketNumber}
              </h3>
              <p className="text-xs text-muted-foreground">
                Route to senior engineering, subject-matter specialists, or executive leadership.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
          <strong>Escalation Governance Rule:</strong> Escalation bypasses standard triage, triggers priority SLA monitoring, and appends a permanent compliance record to the platform audit log.
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-medium text-foreground">
              Mandatory Escalation Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detail technical blockers, severity justification, customer impact, or statutory deadline..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
              required
              minLength={10}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-foreground">Target Support Queue</label>
              <select
                value={targetTeamId}
                onChange={(e) => setTargetTeamId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
              >
                {supportTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-foreground">Escalation Tier</label>
              <select
                value={targetTier}
                onChange={(e) => setTargetTier(e.target.value as EscalationTargetTier)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
              >
                <option value="tier_2_specialist">Tier-2 Subject Specialist</option>
                <option value="tier_3_engineering">Tier-3 Platform Engineering</option>
                <option value="executive_management">Executive Management / Legal</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Urgency Classification</label>
            <div className="grid grid-cols-3 gap-2">
              {(['standard', 'high', 'critical'] as EscalationUrgency[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUrgencyLevel(level)}
                  className={`py-2 px-3 rounded-lg border font-medium text-center capitalize transition-colors ${
                    urgencyLevel === level
                      ? level === 'critical'
                        ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-bold'
                        : 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-xs"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Confirm Escalation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
