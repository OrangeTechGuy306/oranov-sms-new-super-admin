'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { usePlatformAuth } from '@/components/providers/PlatformAuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Modal } from '@/components/ui/Modal';
import { CustomerSuccessTasksPanel } from '@/components/support/CustomerSuccessTasksPanel';
import {
  PlatformApprovalRequest,
  PlatformApprovalType,
} from '@/lib/operations/canonical-operations';
import { formatDate } from '@/lib/utils/formatters';
import {
  CheckSquare,
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  Ban,
  ShieldAlert,
  ArrowUpRight,
  Lock,
} from 'lucide-react';

export function ApprovalsWorkspace({ initialRequestId }: { initialRequestId?: string | null }) {
  const { user, can } = usePlatformAuth();
  const {
    platformApprovals,
    organizations,
    csTasks,
    createApprovalRequest,
    reviewApprovalRequest,
  } = usePlatformStore();

  const canManageApprovals = can('operations.approvals.manage');
  const canCreateApproval =
    can('operations.approvals.manage') ||
    can('operations.tasks.manage') ||
    can('organizations.lifecycle.manage');

  const [activeTab, setActiveTab] = useState<'approvals' | 'tasks'>('approvals');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orgFilter, setOrgFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>(initialRequestId || '');

  // Review modal state
  const [reviewModal, setReviewModal] = useState<{
    request: PlatformApprovalRequest;
    decision: 'approved' | 'rejected' | 'cancelled';
  } | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Create request modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [type, setType] = useState<PlatformApprovalType>('tenant_activation');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [organizationId, setOrganizationId] = useState(organizations[0]?.id || '');
  const [requestedActionLabel, setRequestedActionLabel] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');

  const filteredApprovals = useMemo(() => {
    return platformApprovals.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (orgFilter !== 'all' && a.organizationId !== orgFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const hit =
          a.id.toLowerCase().includes(q) ||
          a.referenceCode.toLowerCase().includes(q) ||
          a.title.toLowerCase().includes(q) ||
          (a.organizationName && a.organizationName.toLowerCase().includes(q)) ||
          a.requestedBy.name.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [platformApprovals, statusFilter, orgFilter, searchTerm]);

  const pendingCount = platformApprovals.filter((a) => a.status === 'pending_review').length;
  const openTasksCount = csTasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled').length;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModal) return;
    setReviewError('');
    const res = reviewApprovalRequest(reviewModal.request.id, reviewModal.decision, reviewNotes);
    if (!res.success) {
      setReviewError(res.error || 'Decision rejected.');
      return;
    }
    setReviewModal(null);
    setReviewNotes('');
  };

  const handleCreateApproval = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createApprovalRequest({
      type,
      title,
      description,
      organizationId: organizationId || undefined,
      targetEntityType: organizationId ? 'Organization' : 'PlatformConfig',
      targetEntityId: organizationId || 'platform',
      requestedActionLabel: requestedActionLabel || type.replace(/_/g, ' '),
      priority,
    });
    if (res.success) {
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setRequestedActionLabel('');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <PageHeader
        title="Administrative Tasks & Controlled Approvals"
        description="Dual-control administrative approval queue, anti-self-approval governance, and follow-up operational task tracking."
        actions={
          canCreateApproval ? (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Submit Approval Request
            </button>
          ) : null
        }
      />

      <AlertBanner
        variant="notice"
        title="Controlled Approval Policy — Anti-Self-Approval Active (Frontend Simulation)"
      >
        Approval decisions require explicit `operations.approvals.manage` authority and a minimum 5-character audit rationale. Operators cannot approve or reject their own requests. All workflow records are stored in local browser development storage without backend ledger persistence.
      </AlertBanner>

      <Tabs
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as 'approvals' | 'tasks')}
        tabs={[
          {
            id: 'approvals',
            label: 'Approval Queue',
            icon: <CheckSquare className="w-3.5 h-3.5" />,
            count: pendingCount,
          },
          {
            id: 'tasks',
            label: 'Operational Follow-Up Tasks',
            icon: <Calendar className="w-3.5 h-3.5" />,
            count: openTasksCount,
          },
        ]}
      />

      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border border-border">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference code, title, organization, or requester..."
              className="flex-1 min-w-[220px] px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter approvals by status"
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground"
            >
              <option value="all">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              aria-label="Filter approvals by organization"
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground"
            >
              <option value="all">All Organizations</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Requests List */}
          <div className="space-y-3">
            {filteredApprovals.map((req) => {
              const isSelfRequester = Boolean(user?.id && req.requestedBy.id === user.id);
              const isPending = req.status === 'pending_review';
              return (
                <div
                  key={req.id}
                  className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-2xs space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                          {req.referenceCode}
                        </span>
                        <Badge status={req.status} size="sm" />
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {req.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {req.priority}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground">{req.title}</h3>
                      <p className="text-xs text-muted-foreground">{req.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-1">
                        <span>
                          Requested by <strong className="text-foreground">{req.requestedBy.name}</strong> ({req.requestedBy.role})
                        </span>
                        <span>• {formatDate(req.requestedAt, true)}</span>
                        {req.organizationId && (
                          <Link
                            href={`/organizations/${req.organizationId}`}
                            className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                          >
                            {req.organizationName || req.organizationId}
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {isPending && isSelfRequester && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                          <Lock className="w-3 h-3" />
                          Self-approval blocked
                        </span>
                      )}
                      {isPending && canManageApprovals && !isSelfRequester && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setReviewNotes('');
                              setReviewError('');
                              setReviewModal({ request: req, decision: 'approved' });
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReviewNotes('');
                              setReviewError('');
                              setReviewModal({ request: req, decision: 'rejected' });
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-600 hover:bg-rose-500/10 text-xs font-semibold"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                      {isPending && (canManageApprovals || isSelfRequester) && (
                        <button
                          type="button"
                          onClick={() => {
                            setReviewNotes('');
                            setReviewError('');
                            setReviewModal({ request: req, decision: 'cancelled' });
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {req.reviewedBy && (
                    <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
                      <span className="font-semibold text-foreground">
                        Reviewed by {req.reviewedBy.name} ({req.reviewedBy.role})
                      </span>{' '}
                      <span className="text-muted-foreground">on {formatDate(req.reviewedAt || '', true)}</span>
                      {req.decisionNotes && (
                        <p className="text-muted-foreground mt-0.5 italic">
                          &ldquo;{req.decisionNotes}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && <CustomerSuccessTasksPanel currentActorId={user?.id || ''} />}

      {/* Review Decision Modal */}
      {reviewModal && (
        <Modal
          isOpen={true}
          onClose={() => setReviewModal(null)}
          title={`${reviewModal.decision.toUpperCase()} Request ${reviewModal.request.referenceCode}`}
          size="md"
        >
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs space-y-1">
              <p className="font-bold text-foreground">{reviewModal.request.title}</p>
              <p className="text-muted-foreground">{reviewModal.request.requestedActionLabel}</p>
            </div>
            {reviewError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Governance Rationale {reviewModal.decision !== 'cancelled' && <span className="text-rose-500">*</span>}
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                required={reviewModal.decision !== 'cancelled'}
                placeholder="Minimum 5 characters audit justification..."
                className="w-full p-2.5 rounded-lg border border-border bg-background text-xs text-foreground"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
              >
                Confirm {reviewModal.decision}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Submit Approval Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateOpen(false)}
          title="Submit Administrative Approval Request"
          size="md"
        >
          <form onSubmit={handleCreateApproval} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-foreground block mb-1">Workflow Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PlatformApprovalType)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="tenant_activation">Tenant Activation</option>
                  <option value="tenant_suspension">Tenant Suspension</option>
                  <option value="tenant_cancellation">Tenant Cancellation</option>
                  <option value="subscription_override">Subscription Override</option>
                  <option value="entitlement_override">Entitlement Override</option>
                  <option value="campus_configuration_change">Campus Config Change</option>
                  <option value="platform_notice_publish">Platform Notice Publish</option>
                  <option value="exception_waiver">Exception Waiver</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-foreground block mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Target Organization</label>
              <select
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="">Global Platform Governance</option>
                {organizations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Title *</label>
              <input
                type="text"
                required
                minLength={5}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Concise summary of requested action..."
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Requested Action Label</label>
              <input
                type="text"
                value={requestedActionLabel}
                onChange={(e) => setRequestedActionLabel(e.target.value)}
                placeholder="e.g. Approve awaiting_activation -> active transition"
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Justification & Context *</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain verification checks already completed..."
                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-border"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold"
              >
                Submit for Review
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
