'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  Plus,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import {
  GovernanceExceptionRecord,
  GovernanceRetentionPolicy,
  DataCategoryRecord,
  CreateGovernanceExceptionInput,
  ExceptionReviewStatus,
} from '@/lib/types/data-governance';
import { isOverdue } from '@/lib/data-governance/evaluator';
import { GovernanceExceptionDetailModal } from './GovernanceExceptionDetailModal';
import { ReviewGovernanceExceptionModal } from './ReviewGovernanceExceptionModal';
import { CreateGovernanceExceptionModal } from './CreateGovernanceExceptionModal';

interface PolicyExceptionsTabProps {
  exceptions: GovernanceExceptionRecord[];
  policies: GovernanceRetentionPolicy[];
  categories: DataCategoryRecord[];
  onCreateException: (input: CreateGovernanceExceptionInput) => void;
  onReviewException: (id: string, status: ExceptionReviewStatus, resolution: string) => void;
}

export function PolicyExceptionsTab({
  exceptions,
  policies,
  categories,
  onCreateException,
  onReviewException,
}: PolicyExceptionsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReason, setSelectedReason] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [detailException, setDetailException] = useState<GovernanceExceptionRecord | null>(null);
  const [reviewException, setReviewException] = useState<GovernanceExceptionRecord | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filter exceptions
  const filteredExceptions = exceptions.filter((e) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchCode = e.code.toLowerCase().includes(q);
      const matchTenant = e.tenantName.toLowerCase().includes(q);
      const matchJust = e.justificationText.toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchTenant && !matchJust) return false;
    }

    if (selectedReason !== 'all' && e.reasonCategory !== selectedReason) {
      return false;
    }

    if (selectedStatus !== 'all' && e.reviewStatus !== selectedStatus) {
      return false;
    }

    return true;
  });

  const getStatusBadge = (status: ExceptionReviewStatus) => {
    switch (status) {
      case 'approved_demo':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Approved Demo
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Expired
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Policy Exceptions & Legal Hold Management
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage statutory exceptions, litigation holds, and audit inquiries that pause automated lifecycle destruction rules.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 shadow-2xs transition-colors shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          Request Exception Hold
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 rounded-xl border border-border bg-card p-3 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search title, code, tenant, justification..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-amber-500 focus:outline-hidden"
          >
            <option value="all">All Exception Reasons</option>
            <option value="ongoing_litigation_hold">Ongoing Litigation Hold</option>
            <option value="statutory_tax_audit">Statutory Tax & Financial Audit</option>
            <option value="accreditation_review">Accreditation Review</option>
            <option value="historical_archival">Historical Archival Exemption</option>
            <option value="contractual_override">Contractual Override</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-amber-500 focus:outline-hidden"
          >
            <option value="all">All Review Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved_demo">Approved Demo</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Exceptions Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
                <th className="py-2.5 px-3">Exception Code & Title</th>
                <th className="py-2.5 px-3">Reason Category</th>
                <th className="py-2.5 px-3">Tenant Scope</th>
                <th className="py-2.5 px-3">Review Due Date</th>
                <th className="py-2.5 px-3">Expiration Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredExceptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No governance exceptions match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredExceptions.map((e) => {
                  const overdue = isOverdue(e.reviewDueAt);
                  return (
                    <tr
                      key={e.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => setDetailException(e)}
                    >
                      <td className="py-3 px-3">
                        <div className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          {e.code}
                        </div>
                        <div className="font-semibold text-foreground text-xs mt-0.5">
                          {e.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-xs mt-0.5">
                          {e.justificationText}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground capitalize border border-border">
                          {e.reasonCategory.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-foreground">{e.tenantName}</span>
                      </td>

                      <td className="py-3 px-3">
                        <div
                          className={`font-medium ${
                            overdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-foreground'
                          }`}
                        >
                          {new Date(e.reviewDueAt).toLocaleDateString()}
                        </div>
                        {overdue && (
                          <div className="text-[9px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-0.5">
                            <AlertTriangle className="h-2.5 w-2.5" /> Review Overdue
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-foreground">
                          {new Date(e.expirationAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {getStatusBadge(e.reviewStatus)}
                      </td>

                      <td className="py-3 px-3 text-right" onClick={(ev) => ev.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailException(e)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="View exception details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewException(e)}
                            className="rounded-md p-1.5 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/50"
                            title="Review exception decision"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
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
          <span>Showing {filteredExceptions.length} of {exceptions.length} governance holds</span>
          <span>Explicit reason, review owner & expiration required</span>
        </div>
      </div>

      {/* Detail Modal */}
      {detailException && (
        <GovernanceExceptionDetailModal
          exception={detailException}
          onClose={() => setDetailException(null)}
          onReview={(exc) => setReviewException(exc)}
        />
      )}

      {/* Review Modal */}
      {reviewException && (
        <ReviewGovernanceExceptionModal
          exception={reviewException}
          onClose={() => setReviewException(null)}
          onSubmitReview={onReviewException}
        />
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <CreateGovernanceExceptionModal
          policies={policies}
          categories={categories}
          onClose={() => setIsCreateOpen(false)}
          onCreate={onCreateException}
        />
      )}
    </div>
  );
}
