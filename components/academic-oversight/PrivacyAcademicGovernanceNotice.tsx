'use client';

import React from 'react';
import { ShieldCheck, Lock, EyeOff, Info } from 'lucide-react';

export function PrivacyAcademicGovernanceNotice() {
  return (
    <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 text-xs space-y-2 text-foreground/90">
      <div className="flex items-center gap-2 font-semibold text-primary">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>Academic Governance & Privacy by Design Principles</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-muted-foreground text-[11px] leading-relaxed">
        <div className="flex items-start gap-2">
          <EyeOff className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
          <span>
            <strong className="text-foreground">Zero Student PII Exposed:</strong> Platform administrators see only aggregated operational indicators, readiness scores, and configuration completion. Individual student exam scores, report cards, and submissions are never exposed.
          </span>
        </div>

        <div className="flex items-start gap-2">
          <Lock className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
          <span>
            <strong className="text-foreground">Tenant Autonomy vs Platform Oversight:</strong> Schools independently configure their calendars, grading scales, syllabi, and timetables. The Super-Admin monitors configuration completeness and conflicts without modifying school policies.
          </span>
        </div>

        <div className="flex items-start gap-2">
          <Info className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
          <span>
            <strong className="text-foreground">Demonstration & Fixture Boundaries:</strong> Current metrics are evaluated deterministically from typed contracts and development fixtures. Live production cross-tenant queries will require Phase E-09.9 backend adapters.
          </span>
        </div>
      </div>
    </div>
  );
}
