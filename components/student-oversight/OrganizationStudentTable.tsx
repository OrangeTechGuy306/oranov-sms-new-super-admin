'use client';

import React from 'react';
import { OrganizationStudentOversight } from '@/lib/types/student-oversight';
import { Badge } from '@/components/ui/Badge';
import {
  Building2,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface OrganizationStudentTableProps {
  records: OrganizationStudentOversight[];
  onSelectOrganization: (org: OrganizationStudentOversight) => void;
}

export function OrganizationStudentTable({
  records,
  onSelectOrganization,
}: OrganizationStudentTableProps) {
  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border overflow-hidden shadow-xs space-y-0">
      <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            School Organizations Student & Admissions Summary
          </h3>
          <p className="text-xs text-muted-foreground">
            Aggregated institutional enrollment counts, admissions throughput, and reporting compliance.
          </p>
        </div>

        <div className="text-xs font-mono text-muted-foreground">
          Showing <span className="font-bold text-foreground">{records.length}</span> Organizations
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-medium">
              <th className="py-2.5 px-3 text-left">School Organization</th>
              <th className="py-2.5 px-3 text-center">Lifecycle</th>
              <th className="py-2.5 px-3 text-center">Reporting State</th>
              <th className="py-2.5 px-3 text-right">Enrolled Students</th>
              <th className="py-2.5 px-3 text-right">Applications</th>
              <th className="py-2.5 px-3 text-right">Converted</th>
              <th className="py-2.5 px-3 text-center">Conversion</th>
              <th className="py-2.5 px-3 text-center">Campuses</th>
              <th className="py-2.5 px-3 text-center">Data Health</th>
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {records.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-muted-foreground">
                  No school organizations match the active filter criteria.
                </td>
              </tr>
            ) : (
              records.map((org) => {
                const hasIssues = org.dataQualityIssues.length > 0;

                return (
                  <tr key={org.organizationId} className="hover:bg-muted/20 transition-colors">
                    {/* Organization Identity */}
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{org.organizationName}</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                          <span className="font-mono">{org.organizationCode}</span>
                          <span>•</span>
                          <span className="capitalize">{org.classification.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>{org.academicSession}</span>
                        </div>
                      </div>
                    </td>

                    {/* Lifecycle Status */}
                    <td className="py-2.5 px-3 text-center">
                      <Badge
                        variant={
                          org.lifecycleStatus === 'active'
                            ? 'success'
                            : org.lifecycleStatus === 'suspended'
                            ? 'error'
                            : org.lifecycleStatus === 'pending'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {org.lifecycleStatus}
                      </Badge>
                    </td>

                    {/* Reporting Status */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          org.reportingStatus === 'active_reporting'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : org.reportingStatus === 'dormant'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {org.reportingStatus === 'active_reporting'
                          ? 'Active Telemetry'
                          : org.reportingStatus === 'dormant'
                          ? 'Dormant Hold'
                          : 'Not Provisioned'}
                      </span>
                    </td>

                    {/* Enrolled Students */}
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                      {org.isReporting ? org.population.enrolledCount.toLocaleString() : (
                        <span className="text-muted-foreground font-normal">N/A</span>
                      )}
                    </td>

                    {/* Applications Submitted */}
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                      {org.isReporting ? org.admissions.submittedCount.toLocaleString() : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>

                    {/* Converted Enrollments */}
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground font-medium">
                      {org.isReporting ? org.admissions.convertedCount.toLocaleString() : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>

                    {/* Conversion Rate */}
                    <td className="py-2.5 px-3 text-center">
                      {org.isReporting ? (
                        <span className="font-mono text-xs font-semibold text-teal-600 dark:text-teal-400">
                          {org.admissions.conversionRatePercentage}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">N/A</span>
                      )}
                    </td>

                    {/* Campuses Count */}
                    <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">
                      {org.campuses.length}
                    </td>

                    {/* Data Health / Quality */}
                    <td className="py-2.5 px-3 text-center">
                      {hasIssues ? (
                        <span
                          title={org.dataQualityIssues.map((i) => i.title).join('; ')}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 cursor-help"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {org.dataQualityIssues.length} {org.dataQualityIssues.length === 1 ? 'Notice' : 'Notices'}
                        </span>
                      ) : org.isReporting ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Action: Open Drill-down */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onSelectOrganization(org)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium text-[11px] rounded-md transition-colors"
                        title={`Inspect aggregated student oversight for ${org.organizationName}`}
                      >
                        <span>Drill-down</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
