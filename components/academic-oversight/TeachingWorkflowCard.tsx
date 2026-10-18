'use client';

import React from 'react';
import { OrganizationAcademicOversight } from '@/lib/types/academic-oversight';
import { FileEdit, CheckCircle2, Activity } from 'lucide-react';

interface TeachingWorkflowCardProps {
  records: OrganizationAcademicOversight[];
}

export function TeachingWorkflowCard({ records }: TeachingWorkflowCardProps) {
  let totalLessonNotes = 0;
  let draftNotes = 0;
  let submittedNotes = 0;
  let approvedNotes = 0;
  let returnedNotes = 0;

  let totalDailyPlans = 0;
  let deliveredPlans = 0;
  let partialPlans = 0;
  let missedPlans = 0;

  let complianceSum = 0;
  let activeReportingSchools = 0;

  for (const r of records) {
    if (r.reportingStatus === 'active_reporting' && r.pedagogicalWorkflows) {
      activeReportingSchools++;
      totalLessonNotes += r.pedagogicalWorkflows.lessonNotesTotal || 0;
      draftNotes += r.pedagogicalWorkflows.lessonNotesDraft || 0;
      submittedNotes += r.pedagogicalWorkflows.lessonNotesSubmitted || 0;
      approvedNotes += r.pedagogicalWorkflows.lessonNotesApproved || 0;
      returnedNotes += r.pedagogicalWorkflows.lessonNotesReturned || 0;

      totalDailyPlans += r.pedagogicalWorkflows.dailyPlansTotal || 0;
      deliveredPlans += r.pedagogicalWorkflows.dailyPlansDelivered || 0;
      partialPlans += r.pedagogicalWorkflows.dailyPlansPartiallyDelivered || 0;
      missedPlans += r.pedagogicalWorkflows.dailyPlansMissed || 0;

      complianceSum += r.pedagogicalWorkflows.lessonNoteComplianceRatePercentage || 0;
    }
  }

  const averageCompliance = activeReportingSchools > 0 ? Math.round(complianceSum / activeReportingSchools) : 0;
  const deliveryCompletionRate = totalDailyPlans > 0 ? Math.round((deliveredPlans / totalDailyPlans) * 100) : 0;

  return (
    <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Teaching Workflows & Pedagogical Delivery Tracker
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Aggregated monitoring of lesson-note reviews, Bloom taxonomy objectives, and daily instructional completion rates.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-full">
          {averageCompliance}% Overall Compliance
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
        {/* Left: Structured Lesson Notes Approval Pipeline */}
        <div className="p-4 rounded-lg border border-border bg-background/50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileEdit className="w-4 h-4 text-primary" />
              Structured Lesson Notes Pipeline
            </h4>
            <span className="text-xs font-medium text-muted-foreground">{totalLessonNotes} Total Notes</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
              <span className="text-[10px] uppercase font-semibold text-emerald-800 dark:text-emerald-300">Approved</span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{approvedNotes}</p>
            </div>
            <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
              <span className="text-[10px] uppercase font-semibold text-blue-800 dark:text-blue-300">Under Review</span>
              <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">{submittedNotes}</p>
            </div>
            <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
              <span className="text-[10px] uppercase font-semibold text-amber-800 dark:text-amber-300">Draft</span>
              <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">{draftNotes}</p>
            </div>
            <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
              <span className="text-[10px] uppercase font-semibold text-rose-800 dark:text-rose-300">Returned</span>
              <p className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">{returnedNotes}</p>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Faculty notes require formal HOD review and sign-off before classroom execution. Super-Admin tracks workflow velocity without viewing lesson contents.
          </p>
        </div>

        {/* Right: Daily Lesson Plans & Delivery Status */}
        <div className="p-4 rounded-lg border border-border bg-background/50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Daily Instructional Delivery
            </h4>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-semibold">
              {deliveryCompletionRate}% Delivered
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
              <span className="text-[10px] uppercase font-semibold text-emerald-800 dark:text-emerald-300">Delivered</span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{deliveredPlans}</p>
            </div>
            <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
              <span className="text-[10px] uppercase font-semibold text-amber-800 dark:text-amber-300">Partial Delivery</span>
              <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">{partialPlans}</p>
            </div>
            <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
              <span className="text-[10px] uppercase font-semibold text-rose-800 dark:text-rose-300">Missed Lessons</span>
              <p className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">{missedPlans}</p>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Missed and partially delivered lessons generate follow-up reminders in the tenant dashboard for rescheduling and curriculum continuity.
          </p>
        </div>
      </div>
    </div>
  );
}
