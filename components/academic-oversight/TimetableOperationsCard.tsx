'use client';

import React from 'react';
import { OrganizationAcademicOversight, TimetableConflictItem } from '@/lib/types/academic-oversight';
import { Clock, AlertOctagon, CheckCircle2, UserX, Building, CalendarX } from 'lucide-react';

interface TimetableOperationsCardProps {
  records: OrganizationAcademicOversight[];
}

export function TimetableOperationsCard({ records }: TimetableOperationsCardProps) {
  let publishedCount = 0;
  let draftCount = 0;

  let totalCriticalConflicts = 0;
  let teacherConflicts = 0;
  let roomConflicts = 0;
  let classConflicts = 0;

  const schoolsWithCriticalConflicts: Array<{
    orgName: string;
    orgCode: string;
    criticalCount: number;
    conflicts: TimetableConflictItem[];
  }> = [];

  for (const r of records) {
    if (r.timetables) {
      if (r.timetables.timetableStatus === 'PUBLISHED') publishedCount++;
      else if (r.timetables.timetableStatus === 'DRAFT') draftCount++;

      totalCriticalConflicts += r.timetables.criticalConflictsCount || 0;
      teacherConflicts += r.timetables.teacherConflictCount || 0;
      roomConflicts += r.timetables.roomConflictCount || 0;
      classConflicts += r.timetables.classConflictCount || 0;

      if (r.timetables.criticalConflictsCount > 0) {
        schoolsWithCriticalConflicts.push({
          orgName: r.organizationName,
          orgCode: r.organizationCode,
          criticalCount: r.timetables.criticalConflictsCount,
          conflicts: r.timetables.conflicts || [],
        });
      }
    }
  }

  return (
    <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Timetable Engine & Conflict Oversight
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational status of master schedules, bell timing configurations, and multi-resource conflict detection.
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            totalCriticalConflicts > 0
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
          }`}
        >
          {totalCriticalConflicts > 0 ? `${totalCriticalConflicts} Critical Conflicts` : 'No Critical Clashes'}
        </span>
      </div>

      {/* Top metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg border border-border bg-background/50 flex items-center gap-3">
          <div className="p-2 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Published</span>
            <p className="text-lg font-bold text-foreground">{publishedCount} Schools</p>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-border bg-background/50 flex items-center gap-3">
          <div className="p-2 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">In Draft State</span>
            <p className="text-lg font-bold text-foreground">{draftCount} Schools</p>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-border bg-background/50 flex items-center gap-3">
          <div className="p-2 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Critical Clashes</span>
            <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{totalCriticalConflicts}</p>
          </div>
        </div>
      </div>

      {/* Conflict Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <div className="p-3 rounded-lg border border-border/80 bg-background/40 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <UserX className="w-4 h-4 text-rose-500" />
            <span>Teacher Double-Bookings</span>
          </div>
          <p className="text-xl font-bold text-foreground">{teacherConflicts}</p>
          <p className="text-[11px] text-muted-foreground">
            Instructors assigned to concurrent classes during the same bell period.
          </p>
        </div>

        <div className="p-3 rounded-lg border border-border/80 bg-background/40 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Building className="w-4 h-4 text-amber-500" />
            <span>Room & Lab Overlaps</span>
          </div>
          <p className="text-xl font-bold text-foreground">{roomConflicts}</p>
          <p className="text-[11px] text-muted-foreground">
            Physical facilities or science labs booked simultaneously by multiple streams.
          </p>
        </div>

        <div className="p-3 rounded-lg border border-border/80 bg-background/40 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <CalendarX className="w-4 h-4 text-rose-500" />
            <span>Class Cohort Overlaps</span>
          </div>
          <p className="text-xl font-bold text-foreground">{classConflicts}</p>
          <p className="text-[11px] text-muted-foreground">
            Student cohorts scheduled for two concurrent subjects at the same time.
          </p>
        </div>
      </div>

      {/* Flagged Schools with Critical Conflicts */}
      {schoolsWithCriticalConflicts.length > 0 && (
        <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-300">
            <AlertOctagon className="w-4 h-4" />
            <span>Action Required: Schools With Critical Scheduling Conflicts</span>
          </div>
          <div className="space-y-1.5 pl-5">
            {schoolsWithCriticalConflicts.map((item) => (
              <div key={item.orgCode} className="text-muted-foreground">
                <strong className="text-foreground">{item.orgName} ({item.orgCode}):</strong>{' '}
                {item.criticalCount} critical clash(es) blocking schedule publication.{' '}
                {item.conflicts.map((c: TimetableConflictItem) => c.message).join(' ')}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
