'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  ArrowRight,
  Eye,
  AlertTriangle,
  Play,
  Lock,
} from 'lucide-react';
import {
  PrivacyRequestRecord,
  PrivacyWorkflowStatus,
  PrivacyResolutionCategory,
} from '@/lib/types/data-governance';
import { isOverdue } from '@/lib/data-governance/evaluator';
import { PrivacyRequestDetailModal } from './PrivacyRequestDetailModal';
import { UpdatePrivacyStatusModal } from './UpdatePrivacyStatusModal';
import { SimulatePrivacyProcessingModal } from './SimulatePrivacyProcessingModal';

interface PrivacyRequestsTabProps {
  requests: PrivacyRequestRecord[];
  onUpdateStatus: (
    id: string,
    status: PrivacyWorkflowStatus,
    resolutionCategory?: PrivacyResolutionCategory,
    reviewNotes?: string
  ) => void;
  onSimulateProcessing: (id: string, actorName?: string) => void;
}

export function PrivacyRequestsTab({
  requests,
  onUpdateStatus,
  onSimulateProcessing,
}: PrivacyRequestsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const [detailRequest, setDetailRequest] = useState<PrivacyRequestRecord | null>(null);
  const [statusModalRequest, setStatusModalRequest] = useState<PrivacyRequestRecord | null>(null);
  const [simulateModalRequest, setSimulateModalRequest] = useState<PrivacyRequestRecord | null>(null);

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCode = r.code.toLowerCase().includes(q);
      const matchLabel = r.requestingPartyLabel.toLowerCase().includes(q);
      const matchTenant = r.tenantName.toLowerCase().includes(q);
      const matchSummary = r.requestSummary.toLowerCase().includes(q);
      if (!matchCode && !matchLabel && !matchTenant && !matchSummary) return false;
    }

    if (selectedCategory !== 'all' && r.category !== selectedCategory) {
      return false;
    }

    if (selectedStatus !== 'all' && r.workflowStatus !== selectedStatus) {
      return false;
    }

    if (selectedPriority !== 'all' && r.priority !== selectedPriority) {
      return false;
    }

    return true;
  });

  const getWorkflowBadge = (status: PrivacyWorkflowStatus) => {
    switch (status) {
      case 'completed_closed':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Completed / Closed
          </span>
        );
      case 'processing_simulated':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            In Simulation
          </span>
        );
      case 'approved_pending_execution':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Approved Pending
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            Under Review
          </span>
        );
      case 'awaiting_info':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Awaiting Info
          </span>
        );
      case 'identity_verification_pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Verification Pending
          </span>
        );
      case 'rejected_with_grounds':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
            URGENT
          </span>
        );
      case 'normal':
        return (
          <span className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Normal
          </span>
        );
      case 'low':
        return (
          <span className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            Privacy Request Management Register (DSAR)
          </h2>
          <p className="text-xs text-muted-foreground">
            Demonstration subject access, erasure, correction, and portability intake workflows with synthetic identity tokens.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-medium">
            <Lock className="h-3 w-3 text-emerald-500" />
            Zero-PII Token Enforced
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-4 rounded-xl border border-border bg-card p-3 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search request code, synthetic label..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-sky-500 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-sky-500 focus:outline-hidden"
          >
            <option value="all">All Request Types</option>
            <option value="access_request">Access / Disclosure (DSAR)</option>
            <option value="deletion_erasure">Right to Erasure / Deletion</option>
            <option value="correction_request">Rectification / Correction</option>
            <option value="portability_export">Data Portability Export</option>
            <option value="restriction_processing">Processing Restriction</option>
            <option value="objection_processing">Objection to Processing</option>
            <option value="consent_inquiry">Consent Inquiry</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-sky-500 focus:outline-hidden"
          >
            <option value="all">All Workflow Stages</option>
            <option value="received">Received</option>
            <option value="identity_verification_pending">Verification Pending</option>
            <option value="under_review">Under Review</option>
            <option value="awaiting_info">Awaiting Info</option>
            <option value="approved_pending_execution">Approved Pending</option>
            <option value="processing_simulated">Processing Simulated</option>
            <option value="completed_closed">Completed / Closed</option>
            <option value="rejected_with_grounds">Rejected With Grounds</option>
          </select>
        </div>

        <div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-sky-500 focus:outline-hidden"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
                <th className="py-2.5 px-3">Request Code</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Requesting Party (Synthetic)</th>
                <th className="py-2.5 px-3">Tenant</th>
                <th className="py-2.5 px-3">30-Day SLA Due</th>
                <th className="py-2.5 px-3">Workflow Stage</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No privacy requests match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => {
                  const overdue = isOverdue(r.dueAt);
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => setDetailRequest(r)}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-sky-600 dark:text-sky-400">
                            {r.code}
                          </span>
                          {getPriorityBadge(r.priority)}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 max-w-[180px]">
                          {r.requestSummary}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground capitalize border border-border">
                          {r.category.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono text-foreground font-semibold text-[11px]">
                          {r.requestingPartyLabel}
                        </div>
                        <div className="text-[10px] text-muted-foreground capitalize">
                          {r.requestingPartyType.replace(/_/g, ' ')}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-foreground">{r.tenantName}</span>
                      </td>

                      <td className="py-3 px-3">
                        <div
                          className={`font-medium ${
                            overdue && r.workflowStatus !== 'completed_closed'
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : 'text-foreground'
                          }`}
                        >
                          {new Date(r.dueAt).toLocaleDateString()}
                        </div>
                        {overdue && r.workflowStatus !== 'completed_closed' && (
                          <div className="text-[9px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-0.5">
                            <AlertTriangle className="h-2.5 w-2.5" /> SLA Overdue
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {getWorkflowBadge(r.workflowStatus)}
                      </td>

                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailRequest(r)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="View request details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatusModalRequest(r)}
                            className="rounded-md p-1.5 text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/50"
                            title="Advance workflow status"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSimulateModalRequest(r)}
                            className="rounded-md p-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                            title="Simulate processing"
                          >
                            <Play className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border bg-muted/30 p-2.5 px-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Showing {filteredRequests.length} of {requests.length} privacy requests</span>
          <span>Zero PII disclosure • Simulated processing only</span>
        </div>
      </div>

      {/* Detail Modal */}
      {detailRequest && (
        <PrivacyRequestDetailModal
          request={detailRequest}
          onClose={() => setDetailRequest(null)}
          onAdvanceStatus={(req) => setStatusModalRequest(req)}
          onSimulateProcessing={(req) => setSimulateModalRequest(req)}
        />
      )}

      {/* Advance Status Modal */}
      {statusModalRequest && (
        <UpdatePrivacyStatusModal
          request={statusModalRequest}
          onClose={() => setStatusModalRequest(null)}
          onUpdateStatus={onUpdateStatus}
        />
      )}

      {/* Simulate Processing Modal */}
      {simulateModalRequest && (
        <SimulatePrivacyProcessingModal
          request={simulateModalRequest}
          onClose={() => setSimulateModalRequest(null)}
          onExecuteSimulation={onSimulateProcessing}
        />
      )}
    </div>
  );
}
