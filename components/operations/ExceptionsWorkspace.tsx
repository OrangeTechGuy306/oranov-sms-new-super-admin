'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { usePlatformAuth } from '@/components/providers/PlatformAuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Modal } from '@/components/ui/Modal';
import {
  OperationalExceptionRecord,
  OperationalExceptionStatus,
} from '@/lib/operations/canonical-operations';
import { isExceptionOpen } from '@/lib/operations/exceptions';
import { formatDate } from '@/lib/utils/formatters';
import {
  AlertOctagon,
  Search,
  Filter,
  ArrowUpRight,
  CheckCircle2,
  ShieldAlert,
  Wrench,
  Eye,
  Lock,
} from 'lucide-react';

export function ExceptionsWorkspace() {
  const { can } = usePlatformAuth();
  const canManageExceptions = can('operations.exceptions.manage');
  const {
    operationalExceptions,
    organizations,
    platformUsers,
    triageOperationalException,
  } = usePlatformStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('open_only');
  const [orgFilter, setOrgFilter] = useState<string>('all');

  const [triageModal, setTriageModal] = useState<{
    record: OperationalExceptionRecord;
    nextStatus: OperationalExceptionStatus;
  } | null>(null);
  const [triageNotes, setTriageNotes] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [escalateTarget, setEscalateTarget] = useState('Platform Operations & Engineering Desk');
  const [triageError, setTriageError] = useState('');

  const filtered = useMemo(() => {
    return operationalExceptions.filter((ex) => {
      if (domainFilter !== 'all' && ex.domain !== domainFilter) return false;
      if (severityFilter !== 'all' && ex.severity !== severityFilter) return false;
      if (orgFilter !== 'all' && ex.organizationId !== orgFilter) return false;
      if (statusFilter === 'open_only') {
        if (!isExceptionOpen(ex.status)) return false;
      } else if (statusFilter !== 'all' && ex.status !== statusFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const hit =
          ex.referenceCode.toLowerCase().includes(q) ||
          ex.title.toLowerCase().includes(q) ||
          ex.description.toLowerCase().includes(q) ||
          ex.organizationName.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [operationalExceptions, domainFilter, severityFilter, statusFilter, orgFilter, searchTerm]);

  const openTotal = operationalExceptions.filter((e) => isExceptionOpen(e.status)).length;
  const criticalTotal = operationalExceptions.filter(
    (e) => isExceptionOpen(e.status) && e.severity === 'critical'
  ).length;
  const escalatedTotal = operationalExceptions.filter((e) => e.status === 'escalated').length;

  const handleSubmitTriage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!triageModal) return;
    setTriageError('');
    const res = triageOperationalException(triageModal.record.id, triageModal.nextStatus, {
      notes: triageNotes,
      assignedOperatorId: assigneeId || undefined,
      escalatedTo: triageModal.nextStatus === 'escalated' ? escalateTarget : undefined,
    });
    if (!res.success) {
      setTriageError(res.error || 'Could not update exception.');
      return;
    }
    setTriageModal(null);
    setTriageNotes('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <PageHeader
        title="Operational Exceptions & Escalation Center"
        description="Unified platform visibility into onboarding blockers, provisioning failures, billing/lifecycle mismatches, campus anomalies, and escalated support cases."
      />

      <AlertBanner
        variant="notice"
        title="Derived & Tracked Exceptions Workflow (Frontend Simulation)"
      >
        Exceptions combine live checks across P0-5 tenant lifecycle, provisioning simulation, subscription/payment status, campus configuration, and support escalations. Internal exception details stay isolated within Super Admin unless explicitly marked `tenant_summary_safe`.
      </AlertBanner>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-muted-foreground font-medium">Open Operational Exceptions</span>
          <p className="text-2xl font-bold text-foreground mt-1">{openTotal}</p>
        </div>
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5">
          <span className="text-rose-700 dark:text-rose-300 font-medium">Critical Severity Open</span>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{criticalTotal}</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <span className="text-amber-700 dark:text-amber-300 font-medium">Escalated Exceptions</span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{escalatedTotal}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5 bg-card p-4 rounded-xl border border-border text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reference code, org, or issue description..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
          />
        </div>
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          aria-label="Filter exceptions by domain"
          className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground"
        >
          <option value="all">All Exception Domains</option>
          <option value="onboarding_incomplete">Onboarding Incomplete</option>
          <option value="provisioning_failure">Provisioning Failure</option>
          <option value="admin_setup_incomplete">Admin Setup Incomplete</option>
          <option value="subscription_payment_mismatch">Subscription / Payment Mismatch</option>
          <option value="campus_configuration">Campus Configuration</option>
          <option value="support_escalation">Support Escalation</option>
          <option value="approval_stalled">Approval Stalled</option>
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          aria-label="Filter exceptions by severity"
          className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter exceptions by status"
          className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground"
        >
          <option value="open_only">Active / Unresolved</option>
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="in_remediation">In Remediation</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <select
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          aria-label="Filter exceptions by organization"
          className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground"
        >
          <option value="all">All Organizations</option>
          {organizations.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground bg-card rounded-xl border border-dashed border-border">
            <AlertOctagon className="w-7 h-7 mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-foreground">No matching operational exceptions</p>
            <p>Adjust status or domain filters above to view resolved records.</p>
          </div>
        ) : (
          filtered.map((ex) => (
            <div
              key={ex.id}
              className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-2xs space-y-3"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                      {ex.referenceCode}
                    </span>
                    <Badge status={ex.status} size="sm" />
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        ex.severity === 'critical'
                          ? 'bg-red-500/10 text-red-600 border-red-500/30'
                          : ex.severity === 'high'
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                      }`}
                    >
                      {ex.severity}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {ex.domain.replace(/_/g, ' ')}
                    </span>
                    {ex.visibility === 'tenant_summary_safe' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                        <Eye className="w-3 h-3" /> Tenant Safe Guidance
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300">
                        <Lock className="w-3 h-3" /> Platform Only
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-foreground">{ex.title}</h3>
                  <p className="text-xs text-muted-foreground">{ex.description}</p>
                  <p className="text-xs text-foreground">
                    <strong>Recommended Next Step:</strong> {ex.recommendedAction}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-1">
                    {ex.organizationId !== 'platform' && (
                      <Link
                        href={`/organizations/${ex.organizationId}`}
                        className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                      >
                        {ex.organizationName} <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    )}
                    {ex.linkedTicketId && (
                      <Link
                        href={`/support?ticket=${ex.linkedTicketId}`}
                        className="text-primary hover:underline font-medium"
                      >
                        Linked Ticket →
                      </Link>
                    )}
                    {ex.linkedApprovalId && (
                      <Link
                        href={`/approvals?request=${ex.linkedApprovalId}`}
                        className="text-primary hover:underline font-medium"
                      >
                        Linked Approval →
                      </Link>
                    )}
                    <span>Updated {formatDate(ex.updatedAt, true)}</span>
                    {ex.assignedOperatorName && <span>Owner: {ex.assignedOperatorName}</span>}
                  </div>
                </div>

                {canManageExceptions && isExceptionOpen(ex.status) && (
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {ex.status === 'open' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAssigneeId(ex.assignedOperatorId || '');
                          setTriageNotes('');
                          setTriageError('');
                          setTriageModal({ record: ex, nextStatus: 'acknowledged' });
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setAssigneeId(ex.assignedOperatorId || '');
                        setTriageNotes('');
                        setTriageError('');
                        setTriageModal({ record: ex, nextStatus: 'in_remediation' });
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium"
                    >
                      <Wrench className="w-3.5 h-3.5" /> Remediate
                    </button>
                    {ex.status !== 'escalated' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAssigneeId(ex.assignedOperatorId || '');
                          setTriageNotes('');
                          setTriageError('');
                          setTriageModal({ record: ex, nextStatus: 'escalated' });
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-500/40 text-rose-600 hover:bg-rose-500/10 text-xs font-semibold"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" /> Escalate
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setAssigneeId(ex.assignedOperatorId || '');
                        setTriageNotes('');
                        setTriageError('');
                        setTriageModal({ record: ex, nextStatus: 'resolved' });
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                    </button>
                  </div>
                )}
              </div>

              {ex.resolutionNotes && (
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground">
                  <strong className="text-foreground">Triage Note:</strong> {ex.resolutionNotes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {triageModal && (
        <Modal
          isOpen={true}
          onClose={() => setTriageModal(null)}
          title={`Triage Exception ${triageModal.record.referenceCode} -> ${triageModal.nextStatus.replace('_', ' ')}`}
          size="md"
        >
          <form onSubmit={handleSubmitTriage} className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
              <p className="font-bold text-foreground">{triageModal.record.title}</p>
              <p className="text-muted-foreground">{triageModal.record.organizationName}</p>
            </div>
            {triageError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 font-medium">
                {triageError}
              </div>
            )}
            <div>
              <label className="font-semibold text-foreground block mb-1">Assign Owner</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="">Keep current / unassigned</option>
                {platformUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            {triageModal.nextStatus === 'escalated' && (
              <div>
                <label className="font-semibold text-foreground block mb-1">Escalation Target Team</label>
                <input
                  type="text"
                  value={escalateTarget}
                  onChange={(e) => setEscalateTarget(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            )}
            <div>
              <label className="font-semibold text-foreground block mb-1">
                Audit Rationale / Remediation Notes{' '}
                {(triageModal.nextStatus === 'resolved' || triageModal.nextStatus === 'escalated') && (
                  <span className="text-rose-500">*</span>
                )}
              </label>
              <textarea
                rows={3}
                value={triageNotes}
                onChange={(e) => setTriageNotes(e.target.value)}
                required={triageModal.nextStatus === 'resolved' || triageModal.nextStatus === 'escalated'}
                placeholder="Document remediation verification or escalation context..."
                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setTriageModal(null)}
                className="px-3 py-1.5 rounded-lg border border-border"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold"
              >
                Save Exception Status
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
