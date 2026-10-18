'use client';

import React from 'react';
import { OrganizationStudentOversight } from '@/lib/types/student-oversight';
import { Badge } from '@/components/ui/Badge';
import { MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CampusCapacityTableProps {
  records: OrganizationStudentOversight[];
}

export function CampusCapacityTable({ records }: CampusCapacityTableProps) {
  // Flatten campuses with owning organization metadata
  const rows = records.flatMap((org) =>
    org.campuses.map((campus) => ({
      organizationId: org.organizationId,
      organizationName: org.organizationName,
      organizationCode: org.organizationCode,
      isReporting: org.isReporting,
      ...campus,
    }))
  );

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border overflow-hidden shadow-xs space-y-0">
      <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Campus Physical Capacity & Utilization Oversight
          </h3>
          <p className="text-xs text-muted-foreground">
            Multi-branch student enrollment counts mapped against configured physical facility capacities.
          </p>
        </div>

        <div className="text-xs font-mono text-muted-foreground">
          Total Campuses: <span className="font-bold text-foreground">{rows.length}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-medium">
              <th className="py-2.5 px-3 text-left">School Organization</th>
              <th className="py-2.5 px-3 text-left">Campus / Branch</th>
              <th className="py-2.5 px-3 text-center">Type</th>
              <th className="py-2.5 px-3 text-right">Physical Capacity</th>
              <th className="py-2.5 px-3 text-right">Active Enrolled</th>
              <th className="py-2.5 px-3 text-right">Admissions</th>
              <th className="py-2.5 px-3 text-center">Utilization</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  No campuses match the active filter criteria.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isOverCapacity = row.capacityUtilizationPercentage > 100;
                const isNearCapacity = row.capacityUtilizationPercentage >= 90 && !isOverCapacity;

                return (
                  <tr key={row.campusId} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      <div className="flex flex-col">
                        <span>{row.organizationName}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{row.organizationCode}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="font-medium">{row.campusName}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">({row.campusCode})</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge
                        variant={row.isMainCampus ? 'purple' : 'neutral'}
                        size="sm"
                      >
                        {row.isMainCampus ? 'Main Campus' : 'Branch / Annex'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                      {row.studentCapacity.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                      {row.isReporting ? row.enrolledStudents.toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                      {row.isReporting ? row.admissionsCount.toLocaleString() : '0'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOverCapacity
                                ? 'bg-rose-500'
                                : isNearCapacity
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, row.capacityUtilizationPercentage)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-medium">
                          {row.isReporting ? `${row.capacityUtilizationPercentage}%` : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isOverCapacity ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" /> Over Limit
                        </span>
                      ) : isNearCapacity ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                          Near Full
                        </span>
                      ) : row.isReporting ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Nominal
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Unprovisioned</span>
                      )}
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
