'use client';

import React, { useState } from 'react';
import {
  Search,
  Database,
  Shield,
  Clock,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  DataCategoryRecord,
  DataClassificationLevel,
  GovernanceRetentionPolicy,
  UpdateDataCategoryInput,
} from '@/lib/types/data-governance';
import { CategoryDetailModal } from './CategoryDetailModal';
import { EditCategoryModal } from './EditCategoryModal';

interface DataInventoryTabProps {
  categories: DataCategoryRecord[];
  retentionPolicies: GovernanceRetentionPolicy[];
  onUpdateCategory: (id: string, updates: UpdateDataCategoryInput) => void;
}

export function DataInventoryTab({
  categories,
  retentionPolicies,
  onUpdateCategory,
}: DataInventoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedRetentionCoverage, setSelectedRetentionCoverage] = useState<string>('all');

  const [detailCategory, setDetailCategory] = useState<DataCategoryRecord | null>(null);
  const [editCategory, setEditCategory] = useState<DataCategoryRecord | null>(null);

  // Filter categories
  const filteredCategories = categories.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = c.name.toLowerCase().includes(q);
      const matchCode = c.code.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchAttr = c.sensitiveAttributes.some((a) => a.toLowerCase().includes(q));
      if (!matchName && !matchCode && !matchDesc && !matchAttr) return false;
    }

    if (selectedClassification !== 'all' && c.classificationLevel !== selectedClassification) {
      return false;
    }

    if (selectedModule !== 'all' && c.owningModule !== selectedModule) {
      return false;
    }

    if (selectedRetentionCoverage === 'covered' && !c.retentionPolicyId) {
      return false;
    }
    if (selectedRetentionCoverage === 'uncovered' && c.retentionPolicyId) {
      return false;
    }

    return true;
  });

  const getClassificationBadge = (level: DataClassificationLevel) => {
    switch (level) {
      case 'restricted':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Restricted
          </span>
        );
      case 'confidential':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Confidential
          </span>
        );
      case 'internal':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Internal
          </span>
        );
      case 'public':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Public
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            Unclassified
          </span>
        );
    }
  };

  const uniqueModules = Array.from(new Set(categories.map((c) => c.owningModule))).sort();

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Database className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Platform Data Inventory & Classification Catalog
          </h2>
          <p className="text-xs text-muted-foreground">
            14 fictional educational records categories. Proposed sensitivity classifications for tenant data governance.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-medium">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            {categories.filter((c) => c.retentionPolicyId).length} of {categories.length} Covered
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-medium">
            <Shield className="h-3 w-3 text-purple-500" />
            {categories.filter((c) => c.classificationLevel).length} Classified
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-4 rounded-xl border border-border bg-card p-3 shadow-2xs">
        <div className="relative sm:col-span-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search category, code, attribute..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={selectedClassification}
            onChange={(e) => setSelectedClassification(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="all">All Classifications</option>
            <option value="restricted">Restricted (Safeguarding, Health)</option>
            <option value="confidential">Confidential (Grades, Admissions)</option>
            <option value="internal">Internal (Operations, Support)</option>
            <option value="public">Public (Directory, Term Dates)</option>
          </select>
        </div>

        <div>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="all">All Owning Modules</option>
            {uniqueModules.map((m) => (
              <option key={m} value={m}>
                Module: {m.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedRetentionCoverage}
            onChange={(e) => setSelectedRetentionCoverage(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="all">All Retention Coverage</option>
            <option value="covered">Covered by Policy</option>
            <option value="uncovered">Missing Retention Policy</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
                <th className="py-2.5 px-3">Category Code & Name</th>
                <th className="py-2.5 px-3">Subject Entity</th>
                <th className="py-2.5 px-3">Proposed Classification</th>
                <th className="py-2.5 px-3">Owning Module</th>
                <th className="py-2.5 px-3">Retention Policy</th>
                <th className="py-2.5 px-3">Sensitive Attributes</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No data categories match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c) => {
                  const policy = retentionPolicies.find((p) => p.id === c.retentionPolicyId);
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => setDetailCategory(c)}
                    >
                      <td className="py-3 px-3">
                        <div className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          {c.code}
                        </div>
                        <div className="font-semibold text-foreground text-xs mt-0.5">
                          {c.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-xs mt-0.5">
                          {c.description}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium capitalize text-foreground border border-border">
                          {c.dataSubjectType.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {getClassificationBadge(c.classificationLevel)}
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[11px] font-medium text-foreground capitalize">
                          {c.owningModule.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {policy ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60">
                            <Clock className="h-3 w-3" />
                            {policy.code}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                            <AlertTriangle className="h-3 w-3" />
                            No Policy Bound
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {c.sensitiveAttributes.slice(0, 2).map((attr) => (
                            <span
                              key={attr}
                              className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground"
                            >
                              {attr}
                            </span>
                          ))}
                          {c.sensitiveAttributes.length > 2 && (
                            <span className="text-[9px] text-muted-foreground">
                              +{c.sensitiveAttributes.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailCategory(c)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="View category details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditCategory(c)}
                            className="rounded-md p-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                            title="Edit classification & policy"
                          >
                            <Edit className="h-3.5 w-3.5" />
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
          <span>Showing {filteredCategories.length} of {categories.length} data categories</span>
          <span>Proposed schema requires tenant administrative adoption</span>
        </div>
      </div>

      {/* Detail Modal */}
      {detailCategory && (
        <CategoryDetailModal
          category={detailCategory}
          onClose={() => setDetailCategory(null)}
          onEdit={(cat) => setEditCategory(cat)}
        />
      )}

      {/* Edit Modal */}
      {editCategory && (
        <EditCategoryModal
          category={editCategory}
          retentionPolicies={retentionPolicies}
          onClose={() => setEditCategory(null)}
          onSave={onUpdateCategory}
        />
      )}
    </div>
  );
}
