'use client';

import React from 'react';
import { OrganizationAcademicOversight, CurriculumFrameworkKey } from '@/lib/types/academic-oversight';
import { Layers, BookMarked } from 'lucide-react';

interface CurriculumStructureDistributionCardProps {
  records: OrganizationAcademicOversight[];
}

export function CurriculumStructureDistributionCard({ records }: CurriculumStructureDistributionCardProps) {
  // Aggregate frameworks
  const frameworkCounts: Record<CurriculumFrameworkKey, number> = {
    NERDC: 0,
    CAMBRIDGE_IGCSE: 0,
    BRITISH_NATIONAL: 0,
    IB_MYP: 0,
    AMERICAN_COMMON_CORE: 0,
    CUSTOM: 0,
  };

  let totalClasses = 0;
  let totalSubjects = 0;
  let totalSchemes = 0;
  let approvedSchemes = 0;
  let underReviewSchemes = 0;
  let draftSchemes = 0;
  let missingSchemes = 0;
  let unassignedSubjects = 0;

  for (const r of records) {
    if (r.curriculum?.activeFrameworks) {
      for (const fw of r.curriculum.activeFrameworks) {
        if (frameworkCounts[fw] !== undefined) {
          frameworkCounts[fw]++;
        }
      }
    }

    if (r.structure) {
      totalClasses += r.structure.totalClasses || 0;
      totalSubjects += r.structure.totalSubjects || 0;
      unassignedSubjects += r.structure.unassignedSubjectsCount || 0;
    }

    if (r.curriculum) {
      totalSchemes += r.curriculum.schemesTotal || 0;
      approvedSchemes += r.curriculum.schemesApprovedCount || 0;
      underReviewSchemes += r.curriculum.schemesUnderReviewCount || 0;
      draftSchemes += r.curriculum.schemesDraftCount || 0;
      missingSchemes += r.curriculum.schemesMissingCount || 0;
    }
  }

  const frameworkLabels: Record<CurriculumFrameworkKey, { label: string; desc: string }> = {
    NERDC: { label: 'NERDC National', desc: 'Nigerian National Curriculum standard' },
    CAMBRIDGE_IGCSE: { label: 'Cambridge IGCSE', desc: 'Cambridge Assessment International' },
    BRITISH_NATIONAL: { label: 'British National', desc: 'UK National Curriculum Framework' },
    IB_MYP: { label: 'IB Middle Years (MYP)', desc: 'International Baccalaureate Organisation' },
    AMERICAN_COMMON_CORE: { label: 'American Common Core', desc: 'US State Standards & NGSS STEM' },
    CUSTOM: { label: 'Custom & TVET', desc: 'Montessori, TVET, & Bilingual Curricula' },
  };

  const schemeApprovalRate = totalSchemes > 0 ? Math.round((approvedSchemes / totalSchemes) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left: Active Curriculum Frameworks */}
      <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-primary" />
            Curriculum Frameworks Adoption
          </h3>
          <span className="text-[11px] font-medium text-muted-foreground">
            {records.length} Monitored Tenants
          </span>
        </div>

        <div className="space-y-2.5">
          {(Object.keys(frameworkCounts) as CurriculumFrameworkKey[]).map((key) => {
            const count = frameworkCounts[key];
            const meta = frameworkLabels[key];
            const percentage = records.length > 0 ? Math.round((count / records.length) * 100) : 0;

            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-foreground">{meta.label}</span>
                    <span className="text-[10px] text-muted-foreground ml-2 hidden sm:inline">
                      ({meta.desc})
                    </span>
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {count} {count === 1 ? 'school' : 'schools'} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Schemes of Work & Faculty Assignment Pipeline */}
      <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Schemes of Work & Subject Assignments
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 rounded">
            {schemeApprovalRate}% Approved
          </span>
        </div>

        {/* Schemes Status Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-2.5 rounded-lg border border-border bg-background/50 text-center">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Approved</span>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{approvedSchemes}</p>
            <span className="text-[10px] text-muted-foreground">{schemeApprovalRate}% of total</span>
          </div>

          <div className="p-2.5 rounded-lg border border-border bg-background/50 text-center">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Under Review</span>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{underReviewSchemes}</p>
            <span className="text-[10px] text-muted-foreground">Awaiting HOD</span>
          </div>

          <div className="p-2.5 rounded-lg border border-border bg-background/50 text-center">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Drafting</span>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{draftSchemes}</p>
            <span className="text-[10px] text-muted-foreground">In authoring</span>
          </div>

          <div className="p-2.5 rounded-lg border border-border bg-background/50 text-center">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Missing</span>
            <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{missingSchemes}</p>
            <span className="text-[10px] text-muted-foreground">Unprepared</span>
          </div>
        </div>

        {/* Aggregate Structure Indicators */}
        <div className="pt-2 border-t border-border/60 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-muted-foreground text-[10px] uppercase font-semibold">Total Classes</span>
            <p className="font-bold text-foreground mt-0.5">{totalClasses}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px] uppercase font-semibold">Total Subjects</span>
            <p className="font-bold text-foreground mt-0.5">{totalSubjects}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px] uppercase font-semibold">Unassigned Subjects</span>
            <p className={`font-bold mt-0.5 ${unassignedSubjects > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'}`}>
              {unassignedSubjects}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
