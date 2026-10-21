'use client';

import React, { useState, useMemo } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import {
  ConfigurationChangeProposal,
  ProposalStatus,
  ProposalDiffItem
} from '@/lib/types/platform-config';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  User,
  ShieldCheck,
  Send,
  ArrowRight,
  Eye,
  FileText,
  CornerDownRight,
  X
} from 'lucide-react';

export function ChangeGovernancePanel() {
  const {
    changeProposals,
    featureFlags,
    organizations,
    createChangeProposal,
    transitionProposalStatus,
    addToast
  } = usePlatformStore();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected proposal for modal inspection
  const [inspectingProposal, setInspectingProposal] = useState<ConfigurationChangeProposal | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState<string>('');

  // Create Proposal Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newScope, setNewScope] = useState<'feature_flag' | 'tenant_override' | 'platform_settings'>('feature_flag');
  const [newTargetId, setNewTargetId] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newFieldName, setNewFieldName] = useState('defaultEnabled');
  const [newPreviousVal, setNewPreviousVal] = useState('false');
  const [newProposedVal, setNewProposedVal] = useState('true');

  // Filtered proposals
  const filteredProposals = useMemo(() => {
    return changeProposals.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (scopeFilter !== 'all' && p.scope !== scopeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.targetEntity.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.author.name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [changeProposals, statusFilter, scopeFilter, searchQuery]);

  // Status Metrics
  const metrics = useMemo(() => {
    return {
      total: changeProposals.length,
      pending: changeProposals.filter(p => p.status === 'pending_review').length,
      approved: changeProposals.filter(p => p.status === 'approved').length,
      applied: changeProposals.filter(p => p.status === 'applied_locally').length,
      rejected: changeProposals.filter(p => p.status === 'rejected').length
    };
  }, [changeProposals]);

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
            <CheckCircle2 className="w-3 h-3 text-indigo-600" />
            Approved (Ready)
          </span>
        );
      case 'applied_locally':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Applied Locally
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3 h-3 text-rose-600" />
            Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <X className="w-3 h-3 text-slate-500" />
            Cancelled
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            Draft
          </span>
        );
    }
  };

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newReason.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Title and Governance Justification reason are required.'
      });
      return;
    }

    const diffItem: ProposalDiffItem = {
      field: newFieldName,
      previousValue: newPreviousVal === 'true' ? true : newPreviousVal === 'false' ? false : newPreviousVal,
      proposedValue: newProposedVal === 'true' ? true : newProposedVal === 'false' ? false : newProposedVal
    };

    const targetEntityName = newScope === 'feature_flag' 
      ? (featureFlags.find(f => f.key === newTargetId)?.name || newTargetId)
      : newScope === 'tenant_override'
      ? (organizations.find(o => o.id === newTargetId)?.name || newTargetId)
      : 'Platform Global Settings';

    const res = createChangeProposal({
      title: newTitle.trim(),
      description: `Change proposal for ${targetEntityName} (${newScope})`,
      reason: newReason.trim(),
      scope: newScope,
      targetEntity: targetEntityName,
      targetId: newTargetId || 'global',
      status: 'pending_review',
      diff: [diffItem]
    });

    if (res.success) {
      addToast({
        type: 'success',
        title: 'Proposal Submitted',
        message: `Proposal "${newTitle}" created and queued for peer review.`
      });
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewReason('');
    } else {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: res.error
      });
    }
  };

  const handleTransition = (proposalId: string, status: ProposalStatus, notes?: string) => {
    const res = transitionProposalStatus(proposalId, status, notes);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Governance Decision Recorded',
        message: `Proposal status transitioned to ${status.replace('_', ' ')}.`
      });
      // Update modal view if currently inspecting this proposal
      if (inspectingProposal && inspectingProposal.id === proposalId && res.proposal) {
        setInspectingProposal(res.proposal);
      }
    } else {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: res.error
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Governance Disclaimer Banner */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-semibold text-slate-900 dark:text-white">
            Dual-Control (Maker-Checker) Configuration Governance Demonstration
          </p>
          <p>
            In production enterprise deployments, critical feature flag and platform policy adjustments require two-person sign-off to prevent unilateral misconfigurations. This workspace demonstrates the end-to-end proposal creation, diff inspection, peer review, and local store application lifecycle.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 block">Pending Review</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
              {metrics.pending}
            </span>
            <Clock className="w-5 h-5 text-amber-500/50" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 block">Approved (Pending Apply)</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {metrics.approved}
            </span>
            <CheckCircle2 className="w-5 h-5 text-indigo-500/50" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 block">Applied Locally</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {metrics.applied}
            </span>
            <FileCheck2 className="w-5 h-5 text-emerald-500/50" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 block">Total Governance Proposals</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {metrics.total}
            </span>
            <FileText className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search proposals, targets..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">All Statuses ({changeProposals.length})</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="applied_locally">Applied Locally</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Scope Filter */}
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">All Scopes</option>
            <option value="feature_flag">Feature Flag</option>
            <option value="tenant_override">Tenant Override</option>
            <option value="platform_settings">Platform Settings</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setNewTargetId(featureFlags[0]?.key || '');
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Change Proposal
        </button>
      </div>

      {/* Proposals List / Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredProposals.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              No change proposals match active filters
            </h4>
            <p className="text-xs text-slate-500">
              Adjust your status filter or create a new proposal to begin dual-control review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Proposal Details</th>
                  <th className="px-4 py-3">Scope & Target</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reviewer Decision</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredProposals.map(proposal => (
                  <tr key={proposal.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Proposal Details */}
                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {proposal.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        {proposal.id} • {new Date(proposal.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {proposal.reason}
                      </div>
                    </td>

                    {/* Scope & Target */}
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono capitalize bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-1">
                        {proposal.scope.replace('_', ' ')}
                      </span>
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {proposal.targetEntity}
                      </div>
                    </td>

                    {/* Author */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-white">
                          {proposal.author.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block pl-5 capitalize">
                        {proposal.author.role.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {getStatusBadge(proposal.status)}
                    </td>

                    {/* Reviewer Decision */}
                    <td className="px-4 py-3 text-slate-500">
                      {proposal.reviewer ? (
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300 block">
                            {proposal.reviewer.name}
                          </span>
                          <span className="text-[11px] text-slate-400 line-clamp-1 italic">
                            &quot;{proposal.reviewer.notes || 'No review notes'}&quot;
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Awaiting review</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setInspectingProposal(proposal);
                            setReviewerNotes(proposal.reviewer?.notes || '');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750"
                        >
                          <Eye className="w-3 h-3 text-slate-400" />
                          Inspect Diff
                        </button>

                        {proposal.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleTransition(proposal.id, 'applied_locally', 'Applied approved change to local platform demonstration store')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                          >
                            <Send className="w-3 h-3" />
                            Apply
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect & Review Proposal Modal */}
      {inspectingProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Proposal: {inspectingProposal.title}
                  </h3>
                  {getStatusBadge(inspectingProposal.status)}
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {inspectingProposal.id} • Target: {inspectingProposal.targetEntity} ({inspectingProposal.scope})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingProposal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Author & Reason */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs">
              <div>
                <span className="text-slate-400 block">Submitted By</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {inspectingProposal.author.name} ({inspectingProposal.author.role})
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {new Date(inspectingProposal.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Governance Justification</span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5 italic">
                  &quot;{inspectingProposal.reason}&quot;
                </p>
              </div>
            </div>

            {/* Visual Diff Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                Proposed Configuration Diff
              </h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-3 py-2">Configuration Field</th>
                      <th className="px-3 py-2">Current Value</th>
                      <th className="px-3 py-2">Proposed Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                    {inspectingProposal.diff.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">
                          {item.field}
                        </td>
                        <td className="px-3 py-2 text-rose-600 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20">
                          - {String(item.previousValue)}
                        </td>
                        <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20">
                          + {String(item.proposedValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Review Decision Input if Pending */}
            {inspectingProposal.status === 'pending_review' && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Reviewer Decision Notes / Conditionals
                </label>
                <textarea
                  rows={2}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="e.g. Approved following security & compliance clearance."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                {inspectingProposal.status === 'pending_review' && (
                  <button
                    type="button"
                    onClick={() => handleTransition(inspectingProposal.id, 'cancelled', 'Cancelled by operator')}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Cancel Proposal
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectingProposal(null)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Close
                </button>

                {inspectingProposal.status === 'pending_review' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleTransition(inspectingProposal.id, 'rejected', reviewerNotes || 'Rejected by reviewer')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                    >
                      Reject Proposal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTransition(inspectingProposal.id, 'approved', reviewerNotes || 'Approved by secondary reviewer')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Approve Proposal
                    </button>
                  </>
                )}

                {inspectingProposal.status === 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleTransition(inspectingProposal.id, 'applied_locally', 'Applied to local store')}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Apply Changes Locally
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Proposal Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form 
            onSubmit={handleCreateProposal}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500" />
                Submit New Configuration Proposal
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Proposal Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Enable Instant Scoring for Secondary Exam Phase"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Scope
                  </label>
                  <select
                    value={newScope}
                    onChange={(e) => {
                      const sc = e.target.value as any;
                      setNewScope(sc);
                      if (sc === 'feature_flag') setNewTargetId(featureFlags[0]?.key || '');
                      else if (sc === 'tenant_override') setNewTargetId(organizations[0]?.id || '');
                      else setNewTargetId('global');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="feature_flag">Feature Flag</option>
                    <option value="tenant_override">Tenant Override</option>
                    <option value="platform_settings">Platform Settings</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Identifier
                  </label>
                  {newScope === 'feature_flag' ? (
                    <select
                      value={newTargetId}
                      onChange={(e) => setNewTargetId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    >
                      {featureFlags.map(f => (
                        <option key={f.key} value={f.key}>{f.name}</option>
                      ))}
                    </select>
                  ) : newScope === 'tenant_override' ? (
                    <select
                      value={newTargetId}
                      onChange={(e) => setNewTargetId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {organizations.map(o => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value="global_settings"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Governance Justification & Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="Explain why this change is necessary and impact analysis..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Proposed Field Diff */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg space-y-2 border border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Diff Specification
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Field</label>
                    <input
                      type="text"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Previous Value</label>
                    <input
                      type="text"
                      value={newPreviousVal}
                      onChange={(e) => setNewPreviousVal(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Proposed Value</label>
                    <input
                      type="text"
                      value={newProposedVal}
                      onChange={(e) => setNewProposedVal(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Submit Proposal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
