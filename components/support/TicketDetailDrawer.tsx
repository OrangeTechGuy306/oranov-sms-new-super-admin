'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { usePlatformAuth } from '@/components/providers/PlatformAuthContext';
import { SupportTicket } from '@/lib/types/support-desk';
import { computeTicketNeutralAgeSummary } from '@/lib/operations/canonical-operations';
import { formatMinutesDuration } from '@/lib/support/evaluator';
import { StatusTransitionModal } from './StatusTransitionModal';
import { AssignTicketModal } from './AssignTicketModal';
import { EscalateTicketModal } from './EscalateTicketModal';
import {
  X,
  Building2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Send,
  Lock,
  User,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
  MessageSquare,
  FileText,
  UserCheck,
  RotateCcw,
} from 'lucide-react';

interface TicketDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string | null;
}

export function TicketDetailDrawer({ isOpen, onClose, ticketId }: TicketDetailDrawerProps) {
  const { can } = usePlatformAuth();
  const canManageTicket = can('support.tickets.manage');
  const canEscalateTicket = can('support.tickets.escalate');
  const canManageInternalNotes = can('support.internal_notes.manage');

  const {
    getSupportTicketById,
    organizations,
    platformUsers,
    supportTeams,
    addSupportTicketMessage,
    deescalateSupportTicket,
  } = usePlatformStore();

  const [activeTab, setActiveTab] = useState<'timeline' | 'audit'>('timeline');
  const [composerType, setComposerType] = useState<'tenant_reply' | 'internal_note'>(
    canManageInternalNotes ? 'internal_note' : 'tenant_reply'
  );
  const [composerContent, setComposerContent] = useState('');
  const [isDraft, setIsDraft] = useState(false);

  // Modals state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);

  if (!isOpen || !ticketId) return null;

  const ticket = getSupportTicketById(ticketId);
  if (!ticket) return null;

  const org = organizations.find((o) => o.id === ticket.organizationId);
  const assignedUser = platformUsers.find((u) => u.id === ticket.assignedOperatorId);
  const assignedTeam = supportTeams.find((t) => t.id === ticket.assignedTeamId);
  const ageSummary = computeTicketNeutralAgeSummary(ticket);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerContent.trim()) return;

    addSupportTicketMessage(
      ticket.id,
      composerType,
      composerContent.trim(),
      isDraft
    );

    setComposerContent('');
    setIsDraft(false);
  };

  const priorityColor = {
    urgent: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    high: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    normal: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    low: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
  }[ticket.priority];

  const statusColor = {
    new: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    open: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    assigned: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    in_progress: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    awaiting_tenant: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    awaiting_internal: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
    escalated: 'bg-red-500/10 text-red-600 border-red-500/20',
    resolved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    closed: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    reopened: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  }[ticket.status];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xs flex justify-end">
        <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
        <div className="relative w-full max-w-2xl bg-card border-l border-border h-full flex flex-col shadow-2xl z-50 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-border shrink-0 space-y-3 bg-muted/20">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                    {ticket.ticketNumber}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${priorityColor}`}>
                    {ticket.priority} priority
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusColor}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-muted text-muted-foreground border-border">
                    Age: {ageSummary.ageLabel}
                  </span>
                </div>
                <h2 className="text-base font-bold text-foreground leading-snug">
                  {ticket.subject}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Close detail drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Escalation Banner */}
            {ticket.escalation?.isEscalated && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-900 dark:text-red-200 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider text-[10px]">
                      Case Escalated ({ticket.escalation.urgencyLevel} urgency • {ticket.escalation.targetTier})
                    </span>
                    <p className="mt-0.5 text-xs opacity-90">{ticket.escalation.reason}</p>
                    <span className="text-[10px] opacity-75">
                      Escalated by {ticket.escalation.escalatedBy} at {new Date(ticket.escalation.escalatedAt || '').toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                {canEscalateTicket && (
                  <button
                    type="button"
                    onClick={() => deescalateSupportTicket(ticket.id, 'De-escalated by authorized operator')}
                    className="px-2 py-1 rounded text-[11px] font-semibold bg-red-600 text-white hover:bg-red-700 shrink-0"
                  >
                    De-escalate
                  </button>
                )}
              </div>
            )}

            {/* Quick Actions Bar (RBAC Gated) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {canManageTicket && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsStatusModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Change Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card text-foreground hover:bg-muted transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                    Reassign
                  </button>
                </>
              )}
              {canEscalateTicket && !ticket.escalation?.isEscalated && (
                <button
                  type="button"
                  onClick={() => setIsEscalateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Escalate Case
                </button>
              )}
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Neutral Ticket Age & Last Response Telemetry (Zero Fabricated Contractual SLA Promises) */}
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3 text-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  Ticket Aging & Response Indicators
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                  Neutral Metrics Only (No Implied Contractual SLA)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-card border border-border space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Time Since Creation</span>
                  <span className="font-bold text-foreground block">{ageSummary.ageLabel}</span>
                  <span className="text-[10px] text-muted-foreground block">
                    Opened: {new Date(ticket.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-card border border-border space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Last Public Response</span>
                  <span className="font-bold text-foreground block">{ageSummary.lastResponseLabel}</span>
                  <span className="text-[10px] text-muted-foreground block">
                    Updated: {new Date(ticket.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {ticket.campusName && (
                <div className="text-[11px] text-foreground font-medium">
                  Scoped Campus: <span className="text-primary">{ticket.campusName}</span> ({ticket.campusId})
                </div>
              )}

              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="border-t border-border/50 pt-2 space-y-1">
                  <span className="text-[11px] font-semibold text-foreground block">
                    Attachment Metadata ({ticket.attachments.length}) — Client Mock Only
                  </span>
                  {ticket.attachments.map((att) => (
                    <div key={att.id} className="text-[11px] text-muted-foreground font-mono flex items-center justify-between">
                      <span>{att.fileName}</span>
                      <span>{Math.max(1, Math.round(att.sizeBytes / 1024))} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Organization Context Card */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-primary" />
                  School Tenant Context
                </span>
                {org && (
                  <Link
                    href={`/organizations/${org.id}`}
                    className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                  >
                    View School Profile <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Institution</span>
                  <span className="font-semibold text-foreground">{org?.name || ticket.organizationId}</span>
                  <span className="text-muted-foreground block text-[10px] font-mono">{org?.code} • {org?.planId}</span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Requester</span>
                  <span className="font-semibold text-foreground">{ticket.requester.name}</span>
                  <span className="text-muted-foreground block text-[10px]">{ticket.requester.roleTitle} ({ticket.requester.email})</span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Current Assignee</span>
                  <span className="font-semibold text-foreground">{assignedUser?.name || 'Unassigned'}</span>
                  <span className="text-muted-foreground block text-[10px]">{assignedTeam?.name || 'No Queue'}</span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Intake Source</span>
                  <span className="font-semibold text-foreground uppercase">{ticket.source}</span>
                  <span className="text-muted-foreground block text-[10px]">
                    Created: {new Date(ticket.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-1.5 text-xs">
              <span className="font-semibold text-foreground block">Issue Description</span>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            {/* Tabs for Timeline and Audit Log */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className={`pb-2 px-1 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'timeline'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Communication Thread ({ticket.messages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('audit')}
                  className={`pb-2 px-1 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'audit'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Audit Events
                </button>
              </div>

              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  {/* Message Stream */}
                  <div className="space-y-3">
                    {ticket.messages.map((msg) => {
                      if (msg.type === 'system_event') {
                        return (
                          <div
                            key={msg.id}
                            className="p-2.5 rounded-lg bg-muted/40 border border-border text-[11px] text-muted-foreground flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            <span className="flex-1">{msg.content}</span>
                            <span className="text-[10px] opacity-75 shrink-0">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      }

                      const isInternal = msg.type === 'internal_note';

                      return (
                        <div
                          key={msg.id}
                          className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                            isInternal
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
                              : 'bg-primary/5 border-primary/20 text-foreground'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5 font-semibold">
                              {isInternal ? (
                                <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              ) : (
                                <User className="w-3.5 h-3.5 text-primary" />
                              )}
                              <span>{msg.authorName}</span>
                              <span className="text-[10px] font-normal opacity-70">
                                ({msg.authorRole})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isInternal ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                  Internal Only
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-primary/20 text-primary">
                                  Tenant Reply Draft
                                </span>
                              )}
                              <span className="text-[10px] opacity-70">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>

                          <p className="leading-relaxed whitespace-pre-wrap text-xs opacity-95">
                            {msg.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Composer (RBAC Gated) */}
                  {(canManageTicket || canManageInternalNotes) && (
                    <form onSubmit={handleSendMessage} className="p-4 rounded-xl border border-border bg-card space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs">
                          {canManageInternalNotes && (
                            <button
                              type="button"
                              onClick={() => setComposerType('internal_note')}
                              className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                                composerType === 'internal_note'
                                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 shadow-2xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <Lock className="w-3.5 h-3.5" />
                              Internal Note
                            </button>
                          )}
                          {canManageTicket && (
                            <button
                              type="button"
                              onClick={() => setComposerType('tenant_reply')}
                              className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                                composerType === 'tenant_reply'
                                  ? 'bg-primary text-primary-foreground shadow-2xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <Send className="w-3.5 h-3.5" />
                              Tenant Reply Draft
                            </button>
                          )}
                        </div>

                      <label className="text-[11px] text-muted-foreground flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isDraft}
                          onChange={(e) => setIsDraft(e.target.checked)}
                          className="rounded"
                        />
                        Mark as draft
                      </label>
                    </div>

                    <textarea
                      rows={3}
                      value={composerContent}
                      onChange={(e) => setComposerContent(e.target.value)}
                      placeholder={
                        composerType === 'internal_note'
                          ? 'Add internal investigation notes, engineering findings, or handover instructions (never visible to school)...'
                          : 'Draft response to school administrator...'
                      }
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
                      required
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-muted-foreground italic">
                        Simulation Mode: Message saved locally; no live outbound delivery.
                      </span>
                      <button
                        type="submit"
                        disabled={!composerContent.trim()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 text-xs shadow-2xs"
                      >
                        <Send className="w-3 h-3" />
                        {composerType === 'internal_note' ? 'Attach Note' : 'Record Reply'}
                      </button>
                    </div>
                  </form>
                  )}
                </div>
              )}

              {activeTab === 'audit' && (
                <div className="space-y-2">
                  {ticket.messages
                    .filter((m) => m.type === 'system_event')
                    .map((m) => (
                      <div key={m.id} className="p-3 rounded-lg border border-border bg-card text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="font-semibold text-foreground">{m.authorName}</span>
                          <span>{new Date(m.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-muted-foreground">{m.content}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      <StatusTransitionModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        ticket={ticket}
      />
      <AssignTicketModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        ticket={ticket}
      />
      <EscalateTicketModal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        ticket={ticket}
      />
    </>
  );
}
