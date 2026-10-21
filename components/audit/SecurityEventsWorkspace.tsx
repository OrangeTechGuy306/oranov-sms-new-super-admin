'use client';

import React, { useState, useMemo } from 'react';
import { SecurityEvent, SecurityTriageStatus } from '@/lib/types/compliance';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils/formatters';
import {
  Filter,
  WifiOff,
  User,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface SecurityEventsWorkspaceProps {
  events: SecurityEvent[];
  onUpdateTriage: (
    id: string,
    status: SecurityTriageStatus,
    notes?: string,
    reviewer?: string
  ) => { success: boolean; error?: string };
}

export function SecurityEventsWorkspace({
  events,
  onUpdateTriage,
}: SecurityEventsWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected event for triage modal
  const [triageEvent, setTriageEvent] = useState<SecurityEvent | null>(null);
  const [targetStatus, setTargetStatus] = useState<SecurityTriageStatus>('acknowledged');
  const [triageNotes, setTriageNotes] = useState('');
  const [reviewerName, setReviewerName] = useState('Alexander Sterling (Super Admin)');
  const [triageError, setTriageError] = useState<string | null>(null);

  const filteredSecurityEvents = useMemo(() => {
    return events.filter((evt) => {
      if (categoryFilter !== 'all' && evt.category !== categoryFilter) return false;
      if (severityFilter !== 'all' && evt.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && evt.triageStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          evt.title.toLowerCase().includes(q) ||
          evt.sanitizedExplanation.toLowerCase().includes(q) ||
          evt.suggestedRemediation.toLowerCase().includes(q) ||
          evt.actor.name.toLowerCase().includes(q) ||
          evt.relatedEntityId.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [events, categoryFilter, severityFilter, statusFilter, searchQuery]);

  const handleOpenTriage = (evt: SecurityEvent) => {
    setTriageEvent(evt);
    setTargetStatus(evt.triageStatus === 'unreviewed' ? 'acknowledged' : evt.triageStatus);
    setTriageNotes(evt.triageNotes || '');
    setTriageError(null);
  };

  const handleSaveTriage = () => {
    if (!triageEvent) return;
    const res = onUpdateTriage(triageEvent.id, targetStatus, triageNotes, reviewerName);
    if (!res.success) {
      setTriageError(res.error || 'Failed to update triage status');
      return;
    }
    setTriageEvent(null);
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'neutral';
    }
  };

  const getStatusBadgeVariant = (status: SecurityTriageStatus) => {
    switch (status) {
      case 'remediated':
        return 'success';
      case 'acknowledged':
        return 'info';
      case 'under_review':
        return 'warning';
      case 'dismissed':
        return 'neutral';
      case 'unreviewed':
      default:
        return 'error';
    }
  };

  return (
    <div className="space-y-4">
      {/* Missing Telemetry & SIEM Disconnect Banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl border border-blue-300 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/20 text-xs">
        <WifiOff className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-950 dark:text-blue-200">
              Security Telemetry & SIEM Not Connected
            </span>
            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold uppercase bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200">
              Local Demonstration
            </span>
          </div>
          <p className="text-blue-800/90 dark:text-blue-300/80 leading-relaxed text-[11px]">
            Live intrusion detection systems (IDS/IPS), Web Application Firewalls (WAF), and real-time streaming authentication telemetry require backend cloud infrastructure. Events displayed below are deterministic synthetic fixtures designed for operator triage demonstrations.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card rounded-xl border border-border shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted px-2.5 py-1 text-foreground focus:outline-none"
          >
            <option value="all">All Security Categories</option>
            <option value="privilege_escalation">Privilege Escalation</option>
            <option value="suspicious_configuration">Suspicious Configuration</option>
            <option value="failed_operation">Failed Guardrail Operation</option>
            <option value="integration_degradation">Integration Degradation</option>
            <option value="unauthorized_attempt">Unauthorized Boundary Attempt</option>
            <option value="credential_policy">Credential Policy Challenge</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted px-2.5 py-1 text-foreground focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="informational">Informational</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted px-2.5 py-1 text-foreground focus:outline-none"
          >
            <option value="all">All Triage Statuses</option>
            <option value="unreviewed">Unreviewed</option>
            <option value="under_review">Under Review</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="remediated">Remediated</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search security incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs rounded-lg border border-border bg-muted px-3 py-1 text-foreground placeholder:text-muted-foreground focus:outline-none w-48 sm:w-64"
          />
          <span className="text-[11px] text-muted-foreground font-mono">
            {filteredSecurityEvents.length} events
          </span>
        </div>
      </div>

      {/* Security Incidents Grid */}
      {filteredSecurityEvents.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-xl border border-border text-muted-foreground text-xs">
          No security events match the current filter selection.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredSecurityEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-card p-4 rounded-xl border border-border hover:border-border/80 transition-all space-y-3 text-xs shadow-2xs"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={getSeverityBadgeVariant(evt.severity)} size="sm">
                    {evt.severity.toUpperCase()}
                  </Badge>
                  <span className="font-bold text-foreground text-sm">{evt.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                    {evt.id}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(evt.triageStatus)} size="sm">
                    {evt.triageStatus.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => handleOpenTriage(evt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 transition-colors shadow-2xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Triage</span>
                  </button>
                </div>
              </div>

              {/* Explanation & Remediation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Sanitized Findings Explanation
                  </span>
                  <p className="text-foreground leading-relaxed text-[11px]">
                    {evt.sanitizedExplanation}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Suggested Security Follow-Up
                  </span>
                  <p className="text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed text-[11px]">
                    {evt.suggestedRemediation}
                  </p>
                </div>
              </div>

              {/* Triage Notes if available */}
              {evt.triageNotes && (
                <div className="p-2.5 rounded-lg bg-muted/60 border border-border/80 text-[11px] space-y-0.5">
                  <span className="font-semibold text-muted-foreground">
                    Operator Triage Notes ({evt.triagedBy || 'Auditor'} on {formatDate(evt.triagedAt || evt.timestamp)}):
                  </span>
                  <p className="text-foreground">{evt.triageNotes}</p>
                </div>
              )}

              {/* Footer info */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/60 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-muted-foreground" />
                    Actor: <strong className="text-foreground">{evt.actor.name}</strong> ({evt.actor.role})
                  </span>
                  <span>
                    Target: <strong className="text-foreground">{evt.relatedEntityType}</strong> ({evt.relatedEntityId})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(evt.timestamp, true)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Triage Action Modal */}
      {triageEvent && (
        <Modal
          isOpen={true}
          onClose={() => setTriageEvent(null)}
          title={`Security Incident Triage — ${triageEvent.id}`}
          size="md"
        >
          <div className="space-y-4 py-1 text-xs">
            <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-1">
              <span className="font-bold text-foreground text-sm block">
                {triageEvent.title}
              </span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {triageEvent.sanitizedExplanation}
              </p>
            </div>

            {triageError && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 text-xs">
                {triageError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">
                Triage Status Decision *
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as SecurityTriageStatus)}
                className="w-full rounded-lg border border-border bg-card p-2 text-xs text-foreground focus:outline-none"
              >
                <option value="unreviewed">Unreviewed (Pending Investigation)</option>
                <option value="under_review">Under Active Review</option>
                <option value="acknowledged">Acknowledged & Ticketed</option>
                <option value="remediated">Remediated & Verified</option>
                <option value="dismissed">Dismissed as False Positive</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">
                Reviewer Operator Identity
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full rounded-lg border border-border bg-card p-2 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">
                Triage Notes & Remediation Evidence *
              </label>
              <textarea
                value={triageNotes}
                onChange={(e) => setTriageNotes(e.target.value)}
                placeholder="Document ticket references, firewall adjustment confirmations, or verification evidence..."
                rows={3}
                className="w-full rounded-lg border border-border bg-card p-2 text-xs text-foreground focus:outline-none"
              />
              <span className="text-[10px] text-muted-foreground">
                Minimum 5 characters required if marking as Remediated or Dismissed.
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-[10px] text-muted-foreground italic">
                Demonstration status: updates local store only.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTriageEvent(null)}
                  className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTriage}
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 shadow-2xs"
                >
                  Confirm Triage Update
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
