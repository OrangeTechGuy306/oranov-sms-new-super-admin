'use client';

import React, { useState } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { SupportTicket } from '@/lib/types/support-desk';
import { X, UserCheck, AlertCircle, Users } from 'lucide-react';

interface AssignTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: SupportTicket;
}

export function AssignTicketModal({ isOpen, onClose, ticket }: AssignTicketModalProps) {
  const { platformUsers, supportTeams, assignSupportTicket } = usePlatformStore();

  const [operatorId, setOperatorId] = useState(ticket.assignedOperatorId || '');
  const [teamId, setTeamId] = useState(ticket.assignedTeamId || '');
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = assignSupportTicket(
      ticket.id,
      operatorId || null,
      teamId || null,
      reason.trim() || undefined
    );

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Failed to update assignment.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card shadow-2xl p-6 z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Assign Ticket: {ticket.ticketNumber}
              </h3>
              <p className="text-xs text-muted-foreground">
                Update operator ownership and routing queue.
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

        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-medium text-foreground">Assigned Operator</label>
            <select
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
            >
              <option value="">Leave Unassigned</option>
              {platformUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role} • {user.department})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Support Team Queue</label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
            >
              <option value="">No Dedicated Queue</option>
              {supportTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Reassignment Note (Optional)</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Routing to CBT examination specialist for candidate session unlock..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
            />
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Save Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
