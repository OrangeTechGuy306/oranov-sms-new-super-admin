'use client';

import React from 'react';
import { OrganizationExamGovernance, ExamTimetableConflictItem } from '@/lib/types/examination-governance';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Clock,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface TimetableSchedulingCardProps {
  records: OrganizationExamGovernance[];
}

export function TimetableSchedulingCard({ records }: TimetableSchedulingCardProps) {
  const summary = React.useMemo(() => {
    let totalSlots = 0;
    let assignedRooms = 0;
    let assignedInvigilators = 0;
    let unassignedInvigilators = 0;
    let criticalConflicts = 0;
    let warningConflicts = 0;

    const allConflicts: Array<ExamTimetableConflictItem & { orgName: string; orgCode: string }> = [];

    for (const org of records) {
      const tt = org.timetable;
      totalSlots += tt.totalSlots;
      assignedRooms += tt.assignedRoomsCount;
      assignedInvigilators += tt.invigilatorsAssignedCount;
      unassignedInvigilators += tt.unassignedInvigilatorsCount;
      criticalConflicts += tt.criticalConflictsCount;
      warningConflicts += tt.warningConflictsCount;

      for (const conf of tt.conflicts) {
        allConflicts.push({
          ...conf,
          orgName: org.organizationName,
          orgCode: org.organizationCode,
        });
      }
    }

    const invigilationCoverage =
      totalSlots > 0 ? Math.round((assignedInvigilators / totalSlots) * 100) : 100;
    const roomCoverage =
      totalSlots > 0 ? Math.round((assignedRooms / totalSlots) * 100) : 100;

    return {
      totalSlots,
      assignedRooms,
      assignedInvigilators,
      unassignedInvigilators,
      criticalConflicts,
      warningConflicts,
      invigilationCoverage,
      roomCoverage,
      allConflicts,
    };
  }, [records]);

  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Examination Timetable Scheduling & Multi-Resource Clash Detection</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Venue capacity verification, faculty invigilation assignments, and real-time room/cohort collision analysis.
            </p>
          </div>

          <Badge
            variant={summary.criticalConflicts > 0 ? 'error' : 'neutral'}
            className="font-mono text-xs"
          >
            {summary.criticalConflicts > 0
              ? `${summary.criticalConflicts} Critical Clashes Detected`
              : '0 Critical Clashes'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-muted/20 dark:bg-muted/10 border border-border/60 rounded-xl space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Total Exam Slots</span>
            <div className="text-xl font-bold text-foreground">
              {summary.totalSlots}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Across active examination series
            </div>
          </div>

          <div className="p-3 bg-muted/20 dark:bg-muted/10 border border-border/60 rounded-xl space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Venue / Room Allocation</span>
            <div className="text-xl font-bold text-foreground">
              {summary.roomCoverage}%
            </div>
            <div className="text-[10px] text-muted-foreground">
              {summary.assignedRooms} of {summary.totalSlots} slots assigned venues
            </div>
          </div>

          <div className="p-3 bg-muted/20 dark:bg-muted/10 border border-border/60 rounded-xl space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Invigilation Coverage</span>
            <div
              className={`text-xl font-bold ${
                summary.invigilationCoverage >= 90
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {summary.invigilationCoverage}%
            </div>
            <div className="text-[10px] text-muted-foreground">
              {summary.unassignedInvigilators} slots pending invigilators
            </div>
          </div>

          <div className="p-3 bg-muted/20 dark:bg-muted/10 border border-border/60 rounded-xl space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Schedule Conflicts</span>
            <div
              className={`text-xl font-bold ${
                summary.criticalConflicts > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : summary.warningConflicts > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {summary.criticalConflicts + summary.warningConflicts}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {summary.criticalConflicts} critical · {summary.warningConflicts} warnings
            </div>
          </div>
        </div>

        {/* Conflicts Alert Box or Clean Schedule Notice */}
        {summary.allConflicts.length > 0 ? (
          <div className="p-3.5 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Detected Timetable Resource Clashes ({summary.allConflicts.length})</span>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              {summary.allConflicts.map((conf) => (
                <div
                  key={conf.id}
                  className="p-2.5 bg-background border border-border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={conf.severity === 'CRITICAL' ? 'error' : 'warning'}
                        className="text-[10px] uppercase font-bold"
                      >
                        {conf.conflictType.replace(/_/g, ' ')}
                      </Badge>
                      <strong className="text-foreground">{conf.orgName}</strong>
                      <span className="text-muted-foreground">({conf.orgCode})</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{conf.description}</p>
                  </div>

                  <div className="text-[11px] text-right shrink-0 text-muted-foreground font-mono">
                    {conf.examDate} · {conf.timeWindow}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              All scheduled examination slots across filtered organizations are 100% collision-free. Zero room double-bookings, teacher overlaps, or cohort concurrency conflicts detected.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
