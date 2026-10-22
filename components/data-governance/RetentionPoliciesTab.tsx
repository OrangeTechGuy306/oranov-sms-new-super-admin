'use client';

import React, { useState } from 'react';
import {
  Clock,
  Search,
  Plus,
  AlertTriangle,
  Eye,
  CheckSquare,
} from 'lucide-react';
import {
  GovernanceRetentionPolicy,
  DataCategoryRecord,
  CreateRetentionPolicyInput,
  RetentionPolicyStatus,
} from '@/lib/types/data-governance';
import { isReviewDue } from '@/lib/data-governance/evaluator';
import { RetentionPolicyDetailModal } from './RetentionPolicyDetailModal';
import { ReviewRetentionPolicyModal } from './ReviewRetentionPolicyModal';
import { CreateRetentionPolicyModal } from './CreateRetentionPolicyModal';

interface RetentionPoliciesTabProps {
  policies: GovernanceRetentionPolicy[];
  categories: DataCategoryRecord[];
  onCreatePolicy: (input: CreateRetentionPolicyInput) => void;
  onReviewPolicy: (
    id: string,
    outcome: RetentionPolicyStatus,
    notes: string,
    nextReviewDate: string
  ) => void;
}

export function RetentionPoliciesTab({
  policies,
  categories,
  onCreatePolicy,
  onReviewPolicy,
}: RetentionPoliciesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedReviewDue, setSelectedReviewDue] = useState<string>('all');

  const [detailPolicy, setDetailPolicy] = useState<GovernanceRetentionPolicy | null>(null);
  const [reviewPolicy, setReviewPolicy] = useState<GovernanceRetentionPolicy | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filter policies
  const filteredPolicies = policies.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchOwner = p.policyOwner.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchDesc && !matchOwner) return false;
    }

    if (selectedStatus !== 'all' && p.status !== selectedStatus) {
      return false;
    }

    if (selectedReviewDue === 'overdue') {
      const overdue = isReviewDue(p.nextReviewDueAt);
      if (!overdue) return false;
    }

    return true;
  });

  const getStatusBadge = (status: RetentionPolicyStatus) => {
    switch (status) {
      case 'active_config':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active Config
          </span>
        );
      case 'approved_demo':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Approved Demo
          </span>
        );
      case 'awaiting_review':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Awaiting Review
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Suspended
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            Draft
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
      {/* Header and Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Statutory Data Retention Policy Schedules
          </h2>
          <p className="text-xs text-muted-foreground">
            Configure, review, and simulate educational retention horizons with explicit review triggers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs transition-colors shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          New Retention Policy
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 rounded-xl border border-border bg-card p-3 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search policy name, code, citation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="all">All Policy Statuses</option>
            <option value="active_config">Active Configuration</option>
            <option value="approved_demo">Approved Demo</option>
            <option value="awaiting_review">Awaiting Review</option>
            <option value="draft">Draft</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div>
          <select
            value={selectedReviewDue}
            onChange={(e) => setSelectedReviewDue(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="all">All Review Horizons</option>
            <option value="overdue">Review Due Soon / Overdue</option>
          </select>
        </div>
      </div>

      {/* Policies Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
                <th className="py-2.5 px-3">Policy Code & Name</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Trigger Event</th>
                <th className="py-2.5 px-3">Covered Categories</th>
                <th className="py-2.5 px-3">Review Due Date</th>
                <th className="py-2.5 px-3">Policy Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No retention policies match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((p) => {
                  const overdue = isReviewDue(p.nextReviewDueAt);
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => setDetailPolicy(p)}
                    >
                      <td className="py-3 px-3">
                        <div className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          {p.code}
                        </div>
                        <div className="font-semibold text-foreground text-xs mt-0.5">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-xs mt-0.5">
                          {p.description}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-foreground">
                          {p.durationDisplay}
                        </span>
                        <div className="text-[10px] text-muted-foreground">
                          {p.durationDays} days
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="capitalize text-foreground font-medium">
                          {p.retentionTrigger.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground border border-border">
                          {p.coveredCategoryIds.length} categories
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div
                          className={`font-medium ${
                            overdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-foreground'
                          }`}
                        >
                          {new Date(p.nextReviewDueAt).toLocaleDateString()}
                        </div>
                        {overdue && (
                          <div className="text-[9px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-0.5">
                            <AlertTriangle className="h-2.5 w-2.5" /> Due Soon
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {getStatusBadge(p.status)}
                      </td>

                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailPolicy(p)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="View policy details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewPolicy(p)}
                            className="rounded-md p-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                            title="Simulate policy review"
                          >
                            <CheckSquare className="h-3.5 w-3.5" />
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
          <span>Showing {filteredPolicies.length} of {policies.length} retention schedules</span>
          <span>Simulation only • Real database purge routines require backend services</span>
        </div>
      </div>

      {/* Detail Modal */}
      {detailPolicy && (
        <RetentionPolicyDetailModal
          policy={detailPolicy}
          onClose={() => setDetailPolicy(null)}
          onReview={(pol) => setReviewPolicy(pol)}
        />
      )}

      {/* Review Modal */}
      {reviewPolicy && (
        <ReviewRetentionPolicyModal
          policy={reviewPolicy}
          onClose={() => setReviewPolicy(null)}
          onSubmitReview={onReviewPolicy}
        />
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <CreateRetentionPolicyModal
          categories={categories}
          onClose={() => setIsCreateOpen(false)}
          onCreate={onCreatePolicy}
        />
      )}
    </div>
  );
}
