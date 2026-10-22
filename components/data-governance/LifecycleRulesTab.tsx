'use client';

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Eye,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  DataLifecycleRuleRecord,
  DataCategoryRecord,
  CreateLifecycleRuleInput,
} from '@/lib/types/data-governance';
import { LifecycleRuleDetailModal } from './LifecycleRuleDetailModal';
import { CreateLifecycleRuleModal } from './CreateLifecycleRuleModal';

interface LifecycleRulesTabProps {
  rules: DataLifecycleRuleRecord[];
  categories: DataCategoryRecord[];
  onToggleRule: (id: string) => void;
  onCreateRule: (input: CreateLifecycleRuleInput) => void;
}

export function LifecycleRulesTab({
  rules,
  categories,
  onToggleRule,
  onCreateRule,
}: LifecycleRulesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  const [detailRule, setDetailRule] = useState<DataLifecycleRuleRecord | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filter rules
  const filteredRules = rules.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = r.name.toLowerCase().includes(q);
      const matchCode = r.code.toLowerCase().includes(q);
      const matchCat = r.coveredCategoryId.toLowerCase().includes(q);
      const matchCond = r.triggerConditions.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchCat && !matchCond) return false;
    }

    if (selectedStatus !== 'all' && r.status !== selectedStatus) {
      return false;
    }

    if (selectedStage !== 'all' && r.targetLifecycleStage !== selectedStage) {
      return false;
    }

    return true;
  });

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Archived
          </span>
        );
      case 'restricted_inactive':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Restricted / Inactive
          </span>
        );
      case 'scheduled_deletion':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Scheduled Deletion
          </span>
        );
      case 'anonymized_demo':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            Anonymized Demo
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            {stage}
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
            <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            Automated Data Lifecycle Rules & Stage Progression
          </h2>
          <p className="text-xs text-muted-foreground">
            Declarative progression triggers defining how records transition from active operational status to cold archive or deletion.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 shadow-2xs transition-colors shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          New Lifecycle Rule
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 rounded-xl border border-border bg-card p-3 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search rule name, code, conditions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-500 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-teal-500 focus:outline-hidden"
          >
            <option value="all">All Rule Statuses</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-teal-500 focus:outline-hidden"
          >
            <option value="all">All Target Stages</option>
            <option value="archived">Archived</option>
            <option value="restricted_inactive">Restricted / Inactive</option>
            <option value="scheduled_deletion">Scheduled for Deletion</option>
            <option value="anonymized_demo">Anonymized Demo</option>
          </select>
        </div>
      </div>

      {/* Lifecycle Rules Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
                <th className="py-2.5 px-3">Rule Code & Name</th>
                <th className="py-2.5 px-3">Covered Category</th>
                <th className="py-2.5 px-3">Trigger Event</th>
                <th className="py-2.5 px-3">Target Stage</th>
                <th className="py-2.5 px-3">Approval Gate</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No lifecycle rules match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRules.map((r) => {
                  const category = categories.find((c) => c.id === r.coveredCategoryId);
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => setDetailRule(r)}
                    >
                      <td className="py-3 px-3">
                        <div className="font-mono text-[11px] font-bold text-teal-600 dark:text-teal-400">
                          {r.code}
                        </div>
                        <div className="font-semibold text-foreground text-xs mt-0.5">
                          {r.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-xs mt-0.5 font-mono">
                          {r.triggerConditions}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-foreground text-[11px] bg-muted px-2 py-0.5 rounded-md border border-border">
                          {category?.code || r.coveredCategoryId}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="capitalize text-foreground font-medium">
                          {r.triggerEvent.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {getStageBadge(r.targetLifecycleStage)}
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground capitalize border border-border">
                          {r.requiredApproval.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onToggleRule(r.id)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                            r.status === 'enabled'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {r.status === 'enabled' ? (
                            <>
                              <ToggleRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              Enabled
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-3.5 w-3.5 text-slate-400" />
                              Disabled
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailRule(r)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="View lifecycle rule details"
                          >
                            <Eye className="h-3.5 w-3.5" />
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
          <span>Showing {filteredRules.length} of {rules.length} lifecycle progression rules</span>
          <span>Declarative configuration • No automated batch deletes executed</span>
        </div>
      </div>

      {/* Detail Modal */}
      {detailRule && (
        <LifecycleRuleDetailModal
          rule={detailRule}
          onClose={() => setDetailRule(null)}
          onToggle={onToggleRule}
        />
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <CreateLifecycleRuleModal
          categories={categories}
          onClose={() => setIsCreateOpen(false)}
          onCreate={onCreateRule}
        />
      )}
    </div>
  );
}
