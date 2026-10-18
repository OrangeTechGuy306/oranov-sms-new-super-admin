'use client';

import React from 'react';
import { OrganizationAcademicOversight } from '@/lib/types/academic-oversight';
import {
  ExternalLink,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Building2,
} from 'lucide-react';

interface OrganizationAcademicTableProps {
  records: OrganizationAcademicOversight[];
  onSelectOrg: (org: OrganizationAcademicOversight) => void;
}

export function OrganizationAcademicTable({
  records,
  onSelectOrg,
}: OrganizationAcademicTableProps) {
  if (records.length === 0) {
    return (
      <div className="bg-card text-card-foreground p-8 rounded-xl border border-border text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">No School Organizations Match Criteria</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your active search query, organization, session, or readiness filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">School Organization</th>
              <th className="py-3 px-3">Session & Period</th>
              <th className="py-3 px-3">Readiness Index</th>
              <th className="py-3 px-3">Curriculum & Syllabi</th>
              <th className="py-3 px-3">Timetable Health</th>
              <th className="py-3 px-3">Teaching Workflows</th>
              <th className="py-3 px-3 text-center">Quality Audit</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {records.map((org) => {
              const readiness = org.readiness;
              const isComplete = readiness.level === 'complete';
              const isAttention = readiness.level === 'attention_required';
              const isBlocker = readiness.level === 'critical_blocker';

              const timetable = org.timetables;
              const hasCritConflicts = timetable?.criticalConflictsCount > 0;

              return (
                <tr
                  key={org.organizationId}
                  className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  onClick={() => onSelectOrg(org)}
                >
                  {/* 1. Organization & Classification */}
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
                            isComplete
                              ? 'bg-emerald-500'
                              : isAttention
                              ? 'bg-amber-500'
                              : isBlocker
                              ? 'bg-rose-500'
                              : 'bg-muted-foreground'
                          }`}
                          style={{ width: `${readiness.score}%` }}
                        />
                      </div>
                      <span className="font-bold text-foreground text-xs">{readiness.score}%</span>
                    </div>
                    <div className="mt-1">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          isComplete
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : isAttention
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : isBlocker
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {readiness.level.replace('_', ' ')}
                      </span>
                    </div>
                  </td>

                  {/* 4. Curriculum & Syllabi */}
                  <td className="py-3.5 px-3">
                    <div className="text-foreground font-medium">
                      {org.curriculum?.schemesApprovedCount ?? 0} / {org.curriculum?.schemesTotal ?? 0} Schemes
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {org.curriculum?.activeFrameworks?.join(', ') || 'No Framework'}
                    </div>
                  </td>

                  {/* 5. Timetable Health */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      {timetable?.timetableStatus === 'PUBLISHED' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Published
                        </span>
                      ) : timetable?.timetableStatus === 'DRAFT' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                          <Clock className="w-3.5 h-3.5" />
                          Draft
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-medium">Unconfigured</span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {hasCritConflicts ? (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">
                          {timetable.criticalConflictsCount} Critical Clashes
                        </span>
                      ) : timetable?.warningConflictsCount > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          {timetable.warningConflictsCount} Warning
                        </span>
                      ) : (
                        <span>0 conflicts</span>
                      )}
                    </div>
                  </td>

                  {/* 6. Teaching Workflows */}
                  <td className="py-3.5 px-3">
                    <div className="text-foreground font-medium">
                      {org.pedagogicalWorkflows?.lessonNotesApproved ?? 0} Notes Approved
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {org.pedagogicalWorkflows?.lessonNoteComplianceRatePercentage ?? 0}% Compliance
                    </div>
                  </td>

                  {/* 7. Quality Audit Issues */}
                  <td className="py-3.5 px-3 text-center">
                    {org.dataQualityIssues && org.dataQualityIssues.length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        <AlertTriangle className="w-3 h-3" />
                        {org.dataQualityIssues.length}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Clean
                      </span>
                    )}
                  </td>

                  {/* 8. Inspect Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrg(org);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-primary hover:text-primary-foreground hover:bg-primary rounded-md transition-colors cursor-pointer"
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
    </div>
  );
}
