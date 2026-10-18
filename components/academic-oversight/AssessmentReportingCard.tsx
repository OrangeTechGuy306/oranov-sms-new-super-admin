'use client';

import React from 'react';
import { OrganizationAcademicOversight, GradingScaleTypeKey } from '@/lib/types/academic-oversight';
import { FileCheck, Award, FileSpreadsheet, GraduationCap } from 'lucide-react';

interface AssessmentReportingCardProps {
  records: OrganizationAcademicOversight[];
}

export function AssessmentReportingCard({ records }: AssessmentReportingCardProps) {
  const scaleTypeCounts: Record<GradingScaleTypeKey, number> = {
    PERCENTAGE: 0,
    LETTER_GRADE: 0,
    GPA_4: 0,
    GPA_5: 0,
    CUSTOM: 0,
    NONE: 0,
  };

  let reportCardsReadyCount = 0;
  let broadsheetReadyCount = 0;
  let transcriptsReadyCount = 0;
  let promotionRulesConfiguredCount = 0;
  let totalAssessmentsScheduled = 0;

  for (const r of records) {
    if (r.assessmentAndReporting) {
      const type = r.assessmentAndReporting.gradingScaleType || 'NONE';
      if (scaleTypeCounts[type] !== undefined) {
        scaleTypeCounts[type]++;
      }

      if (r.assessmentAndReporting.reportCardTemplateReady) {
        reportCardsReadyCount++;
      }

      if (r.assessmentAndReporting.broadsheetReadinessStatus === 'ready') {
        broadsheetReadyCount++;
      }

      if (r.assessmentAndReporting.transcriptsCapabilityStatus === 'implemented') {
        transcriptsReadyCount++;
      }

      if (r.assessmentAndReporting.promotionRulesConfigured) {
        promotionRulesConfiguredCount++;
      }

      totalAssessmentsScheduled += r.assessmentAndReporting.assessmentsScheduledCount || 0;
    }
  }

  const scaleLabels: Record<GradingScaleTypeKey, string> = {
    PERCENTAGE: 'National Percentage (WAEC / NECO / 100%)',
    LETTER_GRADE: 'Letter Grade Standards (A*-F / A-E)',
    GPA_4: 'US 4.0 GPA Standard Scale',
    GPA_5: '5.0 Academic Honors Scale',
    CUSTOM: 'Custom / Competency-Based / Montessori',
    NONE: 'Unconfigured / Missing Grading Scale',
  };

  return (
    <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            Assessment Configuration & Academic Reporting Governance
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-tenant visibility into grading scales, report card templates, and transcript issuance readiness without student score exposure.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full">
          {totalAssessmentsScheduled} Scheduled Assessments
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
        {/* Left: Configured Grading Scales Breakdown */}
        <div className="p-4 rounded-lg border border-border bg-background/50 space-y-3">
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Award className="w-4 h-4 text-primary" />
            Grading Scales Standard Distribution
          </h4>

          <div className="space-y-2">
            {(Object.keys(scaleTypeCounts) as GradingScaleTypeKey[]).map((key) => {
              const count = scaleTypeCounts[key];
              const percentage = records.length > 0 ? Math.round((count / records.length) * 100) : 0;
              const isMissing = key === 'NONE';

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={isMissing && count > 0 ? 'text-rose-600 font-semibold dark:text-rose-400' : 'text-foreground'}>
                      {scaleLabels[key]}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {count} {count === 1 ? 'school' : 'schools'} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isMissing && count > 0 ? 'bg-rose-500' : 'bg-primary'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Academic Reporting & Continuity Capabilities */}
        <div className="p-4 rounded-lg border border-border bg-background/50 space-y-3">
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Reporting Pipelines & End-of-Cycle Readiness
          </h4>

          <div className="space-y-2.5">
            {/* 1. Official Report Cards */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" />
                <div>
                  <span className="text-xs font-semibold text-foreground">Official Report Cards Ready</span>
                  <p className="text-[11px] text-muted-foreground">Layout templates & digital verification codes</p>
                </div>
              </div>
              <span className="text-xs font-bold text-foreground">
                {reportCardsReadyCount} / {records.length} Schools
              </span>
            </div>

            {/* 2. Broadsheet Master Grids */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                <div>
                  <span className="text-xs font-semibold text-foreground">Broadsheet Master Grids</span>
                  <p className="text-[11px] text-muted-foreground">Class-wide composite assessment matrix</p>
                </div>
              </div>
              <span className="text-xs font-bold text-foreground">
                {broadsheetReadyCount} / {records.length} Schools
              </span>
            </div>

            {/* 3. Cumulative Transcripts */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                <div>
                  <span className="text-xs font-semibold text-foreground">Cumulative Transcripts</span>
                  <p className="text-[11px] text-muted-foreground">Multi-session academic history & GPA</p>
                </div>
              </div>
              <span className="text-xs font-bold text-foreground">
                {transcriptsReadyCount} / {records.length} Schools
              </span>
            </div>

            {/* 4. Promotion Rules Configured */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <div>
                  <span className="text-xs font-semibold text-foreground">Promotion Rules Configured</span>
                  <p className="text-[11px] text-muted-foreground">Automatic threshold progression & trial policy</p>
                </div>
              </div>
              <span className="text-xs font-bold text-foreground">
                {promotionRulesConfiguredCount} / {records.length} Schools
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
