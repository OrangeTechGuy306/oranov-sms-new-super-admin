'use client';

import React, { useState, useMemo } from 'react';
import { OrganizationExamGovernance } from '@/lib/types/examination-governance';
import { Badge } from '@/components/ui/Badge';
import {
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Building2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface OrganizationExamTableProps {
  records: OrganizationExamGovernance[];
  onSelectOrg: (org: OrganizationExamGovernance) => void;
  onResetFilters?: () => void;
}

type SortField = 'name' | 'readiness' | 'assessments' | 'cbt' | 'conflicts';
type SortOrder = 'asc' | 'desc';

export function OrganizationExamTable({
  records,
  onSelectOrg,
  onResetFilters,
}: OrganizationExamTableProps) {
  const [sortField, setSortField] = useState<SortField>('readiness');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedRecords = useMemo(() => {
    const list = [...records];
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.organizationName.localeCompare(b.organizationName);
          break;
        case 'readiness':
          comparison = a.readiness.overallScore - b.readiness.overallScore;
          break;
        case 'assessments':
          comparison = a.assessments.totalAssessments - b.assessments.totalAssessments;
          break;
        case 'cbt':
          comparison = a.cbt.totalAttempts - b.cbt.totalAttempts;
          break;
        case 'conflicts':
          comparison =
            a.timetable.criticalConflictsCount +
            a.timetable.warningConflictsCount -
            (b.timetable.criticalConflictsCount + b.timetable.warningConflictsCount);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [records, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  if (records.length === 0) {
    return (
      <div className="bg-card text-card-foreground p-8 rounded-xl border border-border text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">No School Organizations Match Criteria</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your active search query, organization, delivery mode, or readiness filters.
          </p>
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border shadow-xs overflow-hidden space-y-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
              <th
                className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  <span>School Organization</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-3">Session & Period</th>

              <th
                className="py-3 px-3 cursor-pointer hover:text-foreground transition-colors select-none"
                onClick={() => handleSort('readiness')}
              >
                <div className="flex items-center gap-1">
                  <span>Readiness Index</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-3">Delivery Mode</th>

              <th
                className="py-3 px-3 cursor-pointer hover:text-foreground transition-colors select-none"
                onClick={() => handleSort('assessments')}
              >
                <div className="flex items-center gap-1">
                  <span>Assessments Pipeline</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th
                className="py-3 px-3 cursor-pointer hover:text-foreground transition-colors select-none"
                onClick={() => handleSort('cbt')}
              >
                <div className="flex items-center gap-1">
                  <span>CBT & Question Bank</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th
                className="py-3 px-3 cursor-pointer hover:text-foreground transition-colors select-none"
                onClick={() => handleSort('conflicts')}
              >
                <div className="flex items-center gap-1">
                  <span>Timetable Conflicts</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60">
            {paginatedRecords.map((org) => {
              const readiness = org.readiness;
              const isReady = readiness.level === 'ready';
              const isPartial = readiness.level === 'partially_ready';
              const isBlocked = readiness.level === 'not_ready';

              const timetable = org.timetable;
              const hasCritConflicts = timetable?.criticalConflictsCount > 0;
              const hasWarnConflicts = timetable?.warningConflictsCount > 0;

              return (
                <tr
                  key={org.organizationId}
                  className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  onClick={() => onSelectOrg(org)}
                >
                  {/* 1. School Organization */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                      <span>{org.organizationName}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                      <span className="font-mono">{org.organizationCode}</span>
                      <span>•</span>
                      <span className="capitalize">{org.classification.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{org.campuses ? org.campuses.length : 0} campuses</span>
                    </div>
                  </td>

                  {/* 2. Session & Period */}
                  <td className="py-3.5 px-3">
                    <div className="font-medium text-foreground">{org.academicSession}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {org.activePeriod || 'No Active Period'}
                    </div>
                  </td>

                  {/* 3. Readiness Score & Level */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isReady
                              ? 'bg-emerald-500'
                              : isPartial
                              ? 'bg-amber-500'
                              : isBlocked
                              ? 'bg-rose-500'
                              : 'bg-zinc-400'
                          }`}
                          style={{ width: `${readiness.overallScore}%` }}
                        />
                      </div>
                      <span className="font-mono font-semibold text-foreground text-[11px]">
                        {readiness.overallScore}%
                      </span>
                    </div>

                    <div className="mt-1">
                      {isReady ? (
                        <Badge variant="success" className="text-[10px] py-0 px-1.5">
                          Ready
                        </Badge>
                      ) : isPartial ? (
                        <Badge variant="warning" className="text-[10px] py-0 px-1.5">
                          Attention Req.
                        </Badge>
                      ) : isBlocked ? (
                        <Badge variant="error" className="text-[10px] py-0 px-1.5">
                          Blocked ({readiness.criticalBlockersCount})
                        </Badge>
                      ) : (
                        <Badge variant="neutral" className="text-[10px] py-0 px-1.5 text-muted-foreground">
                          Not Applicable
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* 4. Delivery Mode */}
                  <td className="py-3.5 px-3">
                    {org.deliveryMode === 'CBT_FULL' ? (
                      <Badge variant="info" className="text-[10px] py-0.5 px-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                        CBT Full
                      </Badge>
                    ) : org.deliveryMode === 'CBT_HYBRID' ? (
                      <Badge variant="purple" className="text-[10px] py-0.5 px-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                        CBT Hybrid
                      </Badge>
                    ) : (
                      <Badge variant="neutral" className="text-[10px] py-0.5 px-2 text-muted-foreground">
                        Paper-Based
                      </Badge>
                    )}
                  </td>

                  {/* 5. Assessments Pipeline */}
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-foreground">
                      {org.assessments.totalAssessments} Components
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {org.assessments.scheduledCount} sched · {org.assessments.marksEntryCount} entry · {org.assessments.publishedCount} pub
                    </div>
                  </td>

                  {/* 6. CBT & Question Bank */}
                  <td className="py-3.5 px-3">
                    {org.cbt.isEnabled ? (
                      <div>
                        <div className="font-medium text-foreground">
                          {org.cbt.totalCbtExams} CBT Exams ({org.cbt.totalAttempts} attempts)
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {org.questionBank.approvedQuestions} approved questions
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-[11px]">Exempt (Paper Only)</span>
                    )}
                  </td>

                  {/* 7. Timetable Conflicts */}
                  <td className="py-3.5 px-3">
                    {hasCritConflicts ? (
                      <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>{timetable.criticalConflictsCount} Critical Clash</span>
                      </div>
                    ) : hasWarnConflicts ? (
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{timetable.warningConflictsCount} Warning</span>
                      </div>
                    ) : timetable.totalSlots > 0 ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>0 Clashes ({timetable.totalSlots} slots)</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">No Timetable</span>
                    )}
                  </td>

                  {/* 8. Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrg(org);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-background border border-input rounded-md px-2 py-1 text-xs focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span className="text-[11px]">
            Page {currentPage} of {totalPages} ({sortedRecords.length} total)
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 border border-input rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono text-[11px] font-medium text-foreground">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 border border-input rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
